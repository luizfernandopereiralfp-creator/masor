/* ============================================================
   Masor — Motor de cálculo fiscal DETERMINÍSTICO
   Portado do protótipo aprovado `simulador-tributario-g41-v3.jsx`
   (a lógica de custo/ICMS/ST/DIFAL/crédito/preço mínimo).

   No modo HÍBRIDO: a IA decide os PARÂMETROS (alíquotas, se é ST,
   monofásico, etc., com fonte); ESTA função faz a aritmética de
   forma reproduzível e audita a conta da IA. Regra não confirmada
   (parâmetro null) NÃO é aplicada — resultado sai PROVISÓRIO.
   Nada aqui inventa alíquota: tudo vem dos parâmetros de entrada.

   Os textos legíveis (rótulos, fórmulas, alertas, pendências) saem
   no idioma pedido (PT/RU) via T() — a aritmética é a mesma.
   ============================================================ */

export type Regiao = "sul_sudeste" | "n_ne_co_es";
export type Origem = "interna" | "sul_sudeste" | "n_ne_co_es" | "importado";
export type RegimeEmpresa = "lucro_real" | "presumido" | "simples";
export type RegimeFornecedor = "normal" | "simples";
export type Finalidade = "revenda" | "uso_consumo";
export type PisCofins = "normal" | "monofasico" | "zero";
export type IdiomaMotor = "pt" | "ru";

/** Parâmetros fiscais confirmados pela IA (null = não confirmado por fonte). */
export type ParametrosFiscais = {
  aliq_interna_destino: number | null; // % (ex.: 18) alíquota interna ICMS no destino p/ o NCM
  regiao_destino: Regiao | null; // define alíquota interestadual de entrada (7% ou 12%)
  equalizacao_simples: boolean | null; // destino exige equalização na entrada p/ Simples?
  antecipacao_st: boolean | null; // destino exige antecipação de ST (art. 426-A)?
  sujeito_st: boolean | null; // produto sujeito a ST no destino?
  monofasico: boolean | null; // PIS/COFINS monofásico (Lei 10.147/2000)?
  aliquota_zero_pc: boolean | null; // PIS/COFINS alíquota zero (cesta básica)?
  reducao_base_icms_pct: number | null; // % de redução de base de ICMS na saída (0..100)
  mva_pct: number | null; // MVA/IVA-ST % (quando antecipação aplicável)
};

export type EntradaMotor = {
  custo_nf: number;
  ipi: number;
  frete: number;
  descontos: number;
  origem: Origem;
  finalidade: Finalidade;
  regime_empresa: RegimeEmpresa;
  regime_fornecedor: RegimeFornecedor;
  credito_simples_pct: number; // % informado na NF (fornecedor Simples)
  st_retida: boolean; // ST já retida na nota?
  consta_lista_st: boolean; // usuário indicou que consta na lista de ST?
  pis_cofins: PisCofins;
  markup_pct: number; // margem/markup alvo %
  tipo_margem: "venda" | "markup";
  das_efetivo_pct: number; // alíquota efetiva do DAS (Simples), default 4
  params: ParametrosFiscais;
  idioma?: IdiomaMotor; // idioma dos textos legíveis (default pt)
};

export type PassoMotor = {
  rotulo: string;
  formula?: string;
  resultado: number | null;
  unidade: "BRL" | "%";
};

export type ResultadoMotor = {
  custo_aquisicao: number;
  frete_despesas: number;
  creditos_tributarios: number;
  debitos_saida_pct: number; // fração (0..1)
  custo_tributario_liquido: number;
  markup_pct: number;
  margem_estimada_pct: number; // fração
  preco_venda_sugerido: number | null;
  pv_venda: number | null;
  pv_markup: number | null;
  memoria: PassoMotor[];
  alertas: { nivel: "info" | "atencao"; texto: string }[];
  pendencias: { campo: string; motivo: string }[];
  provisorio: boolean;
};

const pctStr = (frac: number) =>
  `${(frac * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

/** Núcleo do cálculo — espelha o `calc` do v3, parametrizado. */
export function calcularFiscal(e: EntradaMotor): ResultadoMotor {
  const T = (pt: string, ru: string) => (e.idioma === "ru" ? ru : pt);
  const p = e.params;
  const preco = Math.max(e.custo_nf - (e.descontos || 0), 0);
  const vIpi = e.ipi || 0;
  const vFrete = e.frete || 0;
  const interna = (p.aliq_interna_destino ?? 0) / 100;
  const mSimples = (e.credito_simples_pct || 0) / 100;
  const alvo = (e.markup_pct || 0) / 100;
  const das = (e.das_efetivo_pct || 0) / 100;
  const mva = (p.mva_pct ?? 0) / 100;
  const reducao = (p.reducao_base_icms_pct ?? 0) / 100;

  const memoria: PassoMotor[] = [];
  const alertas: ResultadoMotor["alertas"] = [];
  const pendencias: ResultadoMotor["pendencias"] = [];

  // Alíquota interestadual destacada na entrada.
  // Res. Senado 22/1989: 7% SÓ na saída de Sul/Sudeste (exceto ES) para
  // N/NE/CO/ES. Todo o resto é 12% (inclusive N/NE → N/NE). Importado: 4%
  // (Res. Senado 13/2012). Se a região do destino não foi confirmada e a
  // origem é Sul/Sudeste, assume-se o caso CONSERVADOR (7% = menos crédito).
  const taxaDestaque =
    e.origem === "interna"
      ? interna
      : e.origem === "importado"
        ? 0.04
        : e.origem === "sul_sudeste" && p.regiao_destino !== "sul_sudeste"
          ? 0.07
          : 0.12;

  const interestadual = e.origem !== "interna";
  const temST = e.st_retida || p.sujeito_st === true;
  const empresaSimples = e.regime_empresa === "simples";
  const lucroReal = e.regime_empresa === "lucro_real";

  // --- crédito de ICMS na entrada ---
  let credICMS = 0;
  if (empresaSimples) {
    // sem crédito
  } else if (temST) {
    // Produto de ST (retido na nota OU sujeito a ST confirmado pelo NCM): o
    // ICMS é cobrado uma vez na cadeia e vem embutido no custo — NÃO gera
    // crédito normal de entrada. (Conceder preço×alíquota aqui subestimaria
    // o custo e geraria preço abaixo do custo real.)
  } else if (e.regime_fornecedor === "simples") {
    credICMS = preco * mSimples;
  } else {
    credICMS = preco * taxaDestaque;
  }
  if (credICMS > 0)
    memoria.push({ rotulo: T("Crédito de ICMS (entrada)", "Кредит ICMS (вход)"), formula: T("preço × alíquota destacada", "цена × выделенная ставка"), resultado: credICMS, unidade: "BRL" });

  // --- crédito de PIS/COFINS (Lucro Real, tributação normal) ---
  // Base = preço − ICMS creditado na entrada. Em produto de ST não há crédito
  // de ICMS (o imposto fica no custo), então nada se subtrai da base.
  let credPC = 0;
  if (lucroReal && e.pis_cofins === "normal")
    credPC = 0.0925 * Math.max(preco - (temST ? 0 : preco * taxaDestaque), 0);
  if (credPC > 0)
    memoria.push({
      rotulo: T("Crédito de PIS/COFINS", "Кредит PIS/COFINS"),
      // Em produto de ST não há ICMS creditado, então a base é o preço cheio.
      formula: temST
        ? T("9,25% × preço (ST: sem ICMS a subtrair)", "9,25% × цена (ST: без вычета ICMS)")
        : T("9,25% × (preço − ICMS destacado)", "9,25% × (цена − выделенный ICMS)"),
      resultado: credPC,
      unidade: "BRL",
    });

  // --- DIFAL (uso/consumo) ou equalização Simples (revenda) ---
  let difal = 0;
  const gap = Math.max(interna - taxaDestaque, 0);
  if (interestadual && e.finalidade === "uso_consumo" && gap > 0) {
    difal = preco * gap;
    memoria.push({ rotulo: `${T("DIFAL (uso/consumo)", "DIFAL (потребление)")} ${pctStr(gap)}`, formula: T("preço × (interna − interestadual)", "цена × (внутр. − межштатная)"), resultado: difal, unidade: "BRL" });
  } else if (
    interestadual &&
    empresaSimples &&
    e.finalidade === "revenda" &&
    !e.st_retida &&
    gap > 0 &&
    p.equalizacao_simples === true
  ) {
    difal = preco * gap;
    memoria.push({ rotulo: `${T("Equalização Simples", "Уравнивание Simples")} ${pctStr(gap)}`, formula: T("preço × (interna − interestadual)", "цена × (внутр. − межштатная)"), resultado: difal, unidade: "BRL" });
  }

  // --- antecipação de ST na entrada (sem retenção) ---
  const precisaAntecip =
    interestadual && e.finalidade === "revenda" && e.consta_lista_st && !e.st_retida && p.antecipacao_st === true;
  let antecip = 0;
  if (precisaAntecip && mva > 0) {
    const baseST = (preco + vIpi + vFrete) * (1 + mva);
    antecip = Math.max(baseST * interna - preco * taxaDestaque, 0);
    memoria.push({ rotulo: T("Antecipação de ST (estimada)", "Предоплата ST (оценка)"), formula: T("base×(1+MVA)×interna − crédito entrada", "база×(1+MVA)×внутр. − кредит входа"), resultado: antecip, unidade: "BRL" });
  }

  // --- custo de cadastro ---
  const custo = preco + vIpi + vFrete + difal + antecip - credICMS - credPC;
  memoria.push({
    rotulo: T("Custo de aquisição", "Стоимость приобретения"),
    formula: T("preço + IPI + frete + DIFAL/antecip − créditos", "цена + IPI + фрахт + DIFAL/предоплата − кредиты"),
    resultado: custo,
    unidade: "BRL",
  });

  // --- tributos de saída ---
  const stQuitada = temST || (precisaAntecip && antecip > 0);
  const icmsSaidaBase = stQuitada ? 0 : interna;
  const icmsSaida = icmsSaidaBase * (1 - reducao);
  let pcSaida = 0;
  if (!empresaSimples && e.pis_cofins === "normal") pcSaida = lucroReal ? 0.0925 : 0.0365;
  let tribSaida = empresaSimples ? das : icmsSaida + pcSaida;
  if (empresaSimples && stQuitada) tribSaida = Math.max(das - 0.0134, 0);

  // --- preço mínimo de venda ---
  const pvVenda = 1 - tribSaida - alvo > 0 ? custo / (1 - tribSaida - alvo) : null;
  const pvMarkup = 1 - tribSaida > 0 ? (custo * (1 + alvo)) / (1 - tribSaida) : null;
  const pv = e.tipo_margem === "venda" ? pvVenda : pvMarkup;
  const margemReal =
    pvMarkup && pvMarkup > 0 ? (pvMarkup * (1 - tribSaida) - custo) / pvMarkup : 0;

  memoria.push({ rotulo: T("Carga tributária de saída", "Налоговая нагрузка на выходе"), resultado: tribSaida, unidade: "%" });
  memoria.push({
    rotulo:
      e.tipo_margem === "venda"
        ? `${T("Preço mínimo (margem", "Мин. цена (маржа")} ${pctStr(alvo)} ${T("s/ venda)", "от продажи)")}`
        : `${T("Preço mínimo (markup", "Мин. цена (наценка")} ${pctStr(alvo)})`,
    formula:
      e.tipo_margem === "venda"
        ? T("custo ÷ (1 − tributos − margem)", "стоимость ÷ (1 − налоги − маржа)")
        : T("custo × (1+markup) ÷ (1 − tributos)", "стоимость × (1+наценка) ÷ (1 − налоги)"),
    resultado: pv,
    unidade: "BRL",
  });

  // --- pendências: parâmetros não confirmados que afetam a conta ---
  if (p.aliq_interna_destino === null) pendencias.push({ campo: T("alíquota interna", "внутренняя ставка"), motivo: T("não confirmada pela pesquisa", "не подтверждено поиском") });
  if (interestadual && e.origem === "sul_sudeste" && p.regiao_destino === null)
    pendencias.push({
      campo: T("região do destino", "регион назначения"),
      motivo: T(
        "não confirmada — assumida a hipótese conservadora de 7% (menor crédito) na entrada interestadual",
        "не подтверждён — принята консервативная гипотеза 7% (меньший кредит) на межштатном входе",
      ),
    });
  if (empresaSimples && interestadual && !e.st_retida && p.equalizacao_simples === null)
    pendencias.push({ campo: T("equalização do Simples", "уравнивание Simples"), motivo: T("não confirmada no destino", "не подтверждено в пункте назначения") });
  if (e.consta_lista_st && !e.st_retida && p.antecipacao_st === null)
    pendencias.push({ campo: T("antecipação de ST", "предоплата ST"), motivo: T("não confirmada no destino", "не подтверждено в пункте назначения") });
  if (p.sujeito_st === null) pendencias.push({ campo: T("sujeição a ST", "обложение ST"), motivo: T("não confirmada para o NCM no destino", "не подтверждено для NCM в пункте назначения") });
  // Produto sujeito a ST mas a nota não foi marcada como ST retida: a forma de
  // recolhimento (retido na nota × antecipação) muda o crédito de entrada.
  // Sem essa confirmação, o resultado é provisório (nunca um preço "aprovado" chutado).
  if (p.sujeito_st === true && !e.st_retida)
    pendencias.push({
      campo: T("ST — forma de recolhimento", "ST — способ уплаты"),
      motivo: T(
        "produto sujeito a ST pelo NCM, mas a nota não foi marcada como ST retida — confirme se veio retido (CST 60) ou se há antecipação na entrada; o crédito de entrada depende disso",
        "товар облагается ST по NCM, но накладная не отмечена как ST удержан — подтвердите удержание (CST 60) или предоплату на входе; кредит входа зависит от этого",
      ),
    });

  const provisorio = pendencias.length > 0;

  // --- alertas educativos (linguagem simples) ---
  if (precisaAntecip && !(mva > 0))
    alertas.push({ nivel: "atencao", texto: T("Produto na lista de ST sem retenção: há recolhimento antecipado na entrada. Informe a MVA ou envie o XML.", "Товар в списке ST без удержания: есть предоплата на входе. Укажите MVA или загрузите XML.") });
  if (e.regime_fornecedor === "simples" && mSimples === 0 && !empresaSimples && !e.st_retida)
    alertas.push({ nivel: "atencao", texto: T("Fornecedor do Simples sem % de crédito na nota: crédito ZERO (LC 123, art. 23).", "Поставщик Simples без % кредита в накладной: кредит НОЛЬ (LC 123, ст. 23).") });
  if (e.pis_cofins === "monofasico")
    alertas.push({ nivel: "info", texto: T("Monofásico: sem crédito na compra e alíquota zero na venda de PIS/COFINS.", "Монофазный режим: без кредита при покупке и нулевая ставка PIS/COFINS при продаже.") });
  if (temST)
    alertas.push({ nivel: "info", texto: T("ST: imposto da cadeia já pago. Não some diferenças ao custo; sem ICMS próprio na revenda.", "ST: налог цепочки уже уплачен. Не добавляйте разницы к стоимости; нет собственного ICMS при перепродаже.") });
  if (interestadual && e.finalidade === "revenda" && !empresaSimples && !e.st_retida && gap > 0)
    alertas.push({ nivel: "info", texto: `${T("A diferença", "Разница")} ${pctStr(taxaDestaque)} → ${pctStr(interna)} ${T("NÃO é custo: entrada gera crédito, saída incide sobre a venda.", "НЕ является затратой: вход даёт кредит, выход начисляется на продажу.")}` });

  return {
    custo_aquisicao: preco,
    frete_despesas: vIpi + vFrete,
    creditos_tributarios: credICMS + credPC,
    debitos_saida_pct: tribSaida,
    custo_tributario_liquido: custo,
    markup_pct: alvo,
    margem_estimada_pct: e.tipo_margem === "markup" ? margemReal : alvo,
    preco_venda_sugerido: pv,
    pv_venda: pvVenda,
    pv_markup: pvMarkup,
    memoria,
    alertas,
    pendencias,
    provisorio,
  };
}
