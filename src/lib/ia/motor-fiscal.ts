/* ============================================================
   Masor — Motor de cálculo fiscal DETERMINÍSTICO
   Portado do protótipo aprovado `simulador-tributario-g41-v3.jsx`
   (a lógica de custo/ICMS/ST/DIFAL/crédito/preço mínimo).

   No modo HÍBRIDO: a IA decide os PARÂMETROS (alíquotas, se é ST,
   monofásico, etc., com fonte); ESTA função faz a aritmética de
   forma reproduzível e audita a conta da IA. Regra não confirmada
   (parâmetro null) NÃO é aplicada — resultado sai PROVISÓRIO.
   Nada aqui inventa alíquota: tudo vem dos parâmetros de entrada.
   ============================================================ */

export type Regiao = "sul_sudeste" | "n_ne_co_es";
export type Origem = "interna" | "sul_sudeste" | "n_ne_co_es" | "importado";
export type RegimeEmpresa = "lucro_real" | "presumido" | "simples";
export type RegimeFornecedor = "normal" | "simples";
export type Finalidade = "revenda" | "uso_consumo";
export type PisCofins = "normal" | "monofasico" | "zero";

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

  // alíquota interestadual destacada na entrada
  const taxaDestaque =
    e.origem === "interna"
      ? interna
      : e.origem === "importado"
        ? 0.04
        : p.regiao_destino === "n_ne_co_es"
          ? 0.07
          : 0.12; // regiao null → assume 12% e sinaliza pendência

  const interestadual = e.origem !== "interna";
  const temST = e.st_retida || p.sujeito_st === true;
  const empresaSimples = e.regime_empresa === "simples";
  const lucroReal = e.regime_empresa === "lucro_real";

  // --- crédito de ICMS na entrada ---
  let credICMS = 0;
  if (empresaSimples) {
    // sem crédito
  } else if (e.st_retida) {
    // ST retida: ICMS embutido é custo, sem crédito
  } else if (e.regime_fornecedor === "simples") {
    credICMS = preco * mSimples;
  } else {
    credICMS = preco * taxaDestaque;
  }
  if (credICMS > 0)
    memoria.push({ rotulo: "Crédito de ICMS (entrada)", formula: "preço × alíquota destacada", resultado: credICMS, unidade: "BRL" });

  // --- crédito de PIS/COFINS (Lucro Real, tributação normal) ---
  let credPC = 0;
  if (lucroReal && e.pis_cofins === "normal")
    credPC = 0.0925 * Math.max(preco - (e.st_retida ? 0 : preco * taxaDestaque), 0);
  if (credPC > 0)
    memoria.push({ rotulo: "Crédito de PIS/COFINS", formula: "9,25% × (preço − ICMS destacado)", resultado: credPC, unidade: "BRL" });

  // --- DIFAL (uso/consumo) ou equalização Simples (revenda) ---
  let difal = 0;
  const gap = Math.max(interna - taxaDestaque, 0);
  if (interestadual && e.finalidade === "uso_consumo" && gap > 0) {
    difal = preco * gap;
    memoria.push({ rotulo: `DIFAL (uso/consumo) ${pctStr(gap)}`, formula: "preço × (interna − interestadual)", resultado: difal, unidade: "BRL" });
  } else if (
    interestadual &&
    empresaSimples &&
    e.finalidade === "revenda" &&
    !e.st_retida &&
    gap > 0 &&
    p.equalizacao_simples === true
  ) {
    difal = preco * gap;
    memoria.push({ rotulo: `Equalização Simples ${pctStr(gap)}`, formula: "preço × (interna − interestadual)", resultado: difal, unidade: "BRL" });
  }

  // --- antecipação de ST na entrada (sem retenção) ---
  const precisaAntecip =
    interestadual && e.finalidade === "revenda" && e.consta_lista_st && !e.st_retida && p.antecipacao_st === true;
  let antecip = 0;
  if (precisaAntecip && mva > 0) {
    const baseST = (preco + vIpi + vFrete) * (1 + mva);
    antecip = Math.max(baseST * interna - preco * taxaDestaque, 0);
    memoria.push({ rotulo: "Antecipação de ST (estimada)", formula: "base×(1+MVA)×interna − crédito entrada", resultado: antecip, unidade: "BRL" });
  }

  // --- custo de cadastro ---
  const custo = preco + vIpi + vFrete + difal + antecip - credICMS - credPC;
  memoria.push({
    rotulo: "Custo de aquisição",
    formula: "preço + IPI + frete + DIFAL/antecip − créditos",
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

  memoria.push({ rotulo: "Carga tributária de saída", resultado: tribSaida, unidade: "%" });
  memoria.push({
    rotulo: e.tipo_margem === "venda" ? `Preço mínimo (margem ${pctStr(alvo)} s/ venda)` : `Preço mínimo (markup ${pctStr(alvo)})`,
    formula: e.tipo_margem === "venda" ? "custo ÷ (1 − tributos − margem)" : "custo × (1+markup) ÷ (1 − tributos)",
    resultado: pv,
    unidade: "BRL",
  });

  // --- pendências: parâmetros não confirmados que afetam a conta ---
  if (p.aliq_interna_destino === null) pendencias.push({ campo: "alíquota interna", motivo: "não confirmada pela pesquisa" });
  if (interestadual && p.regiao_destino === null)
    pendencias.push({ campo: "região do destino", motivo: "não confirmada — alíquota interestadual assumida em 12%" });
  if (empresaSimples && interestadual && !e.st_retida && p.equalizacao_simples === null)
    pendencias.push({ campo: "equalização do Simples", motivo: "não confirmada no destino" });
  if (e.consta_lista_st && !e.st_retida && p.antecipacao_st === null)
    pendencias.push({ campo: "antecipação de ST", motivo: "não confirmada no destino" });
  if (p.sujeito_st === null) pendencias.push({ campo: "sujeição a ST", motivo: "não confirmada para o NCM no destino" });

  const provisorio = pendencias.length > 0;

  // --- alertas educativos (linguagem simples) ---
  if (precisaAntecip && !(mva > 0))
    alertas.push({ nivel: "atencao", texto: "Produto na lista de ST sem retenção: há recolhimento antecipado na entrada. Informe a MVA ou envie o XML." });
  if (e.regime_fornecedor === "simples" && mSimples === 0 && !empresaSimples && !e.st_retida)
    alertas.push({ nivel: "atencao", texto: "Fornecedor do Simples sem % de crédito na nota: crédito ZERO (LC 123, art. 23)." });
  if (e.pis_cofins === "monofasico")
    alertas.push({ nivel: "info", texto: "Monofásico: sem crédito na compra e alíquota zero na venda de PIS/COFINS." });
  if (temST)
    alertas.push({ nivel: "info", texto: "ST: imposto da cadeia já pago. Não some diferenças ao custo; sem ICMS próprio na revenda." });
  if (interestadual && e.finalidade === "revenda" && !empresaSimples && !e.st_retida && gap > 0)
    alertas.push({ nivel: "info", texto: `A diferença ${pctStr(taxaDestaque)} → ${pctStr(interna)} NÃO é custo: entrada gera crédito, saída incide sobre a venda.` });

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
