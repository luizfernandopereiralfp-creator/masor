import { z } from "zod";
import { jsonrepair } from "jsonrepair";

/* ============================================================
   Masor — Contrato de saída da análise fiscal (IA especialista)
   Fonte única da forma: o prompt instrui a IA a devolver ESTE
   JSON; o app valida com este schema; o n8n encaminha sem alterar.

   Princípio anti-invenção: todo NÚMERO é nullable. `null` = a IA
   NÃO confirmou por fonte oficial → não inventa, marca pendência,
   e a análise sai como PROVISÓRIA. Nunca um default silencioso.
   ============================================================ */

export const IDIOMAS = ["pt", "ru"] as const;
export type Idioma = (typeof IDIOMAS)[number];

/** Um número fiscal só existe se rastreável; senão `null` + pendência. */
const numeroFiscal = z.number().nullable();

/** Fundamento legal citável — exigido em cada conclusão relevante. */
export const FundamentoLegal = z.object({
  afirmacao: z.string().default(""), // a conclusão que este fundamento sustenta
  norma: z.string().default(""), // ex.: "RICMS/SP", "LC 214/2025", "Convênio ICMS 142/2018"
  artigo: z.string().nullable().optional(), // ex.: "art. 426-A"
  orgao: z.string().default(""), // ex.: "SEFAZ/SP", "CONFAZ", "Receita Federal"
  vigencia: z.string().nullable().optional(), // ISO ou texto: "desde 01/04/2026"
  url: z.string().nullable().default(null), // fonte oficial; null = não confirmado
});
export type FundamentoLegal = z.infer<typeof FundamentoLegal>;

/** Fonte oficial consultada (rastreabilidade). */
export const FonteConsultada = z.object({
  titulo: z.string().nullable().optional(),
  url: z.string().default(""),
  orgao: z.string().nullable().optional(),
  consultado_em: z.string().nullable().optional(), // ISO date
});
export type FonteConsultada = z.infer<typeof FonteConsultada>;

/** Passo da memória de cálculo — a IA mostra o trabalho, número a número. */
export const PassoCalculo = z.object({
  rotulo: z.string().default(""), // ex.: "Crédito de ICMS na entrada"
  formula: z.string().nullable().optional(), // ex.: "preço × alíquota destacada"
  valores: z.record(z.string(), z.number()).nullable().optional(), // insumos nomeados
  resultado: numeroFiscal.default(null), // null se depende de regra não confirmada / truncado
  unidade: z.enum(["BRL", "%", "un"]).default("BRL"),
  fonte_url: z.string().nullable().optional(),
  observacao: z.string().nullable().optional(),
});
export type PassoCalculo = z.infer<typeof PassoCalculo>;

/** Cenário comparativo (Reforma): atual x transição x futuro. */
export const Cenario = z.object({
  fase: z.enum(["atual", "transicao", "futuro"]).catch("atual"),
  vigencia: z.string().nullable().optional(), // ex.: "2026", "2029-2032", "a partir de 2033"
  resumo: z.string().default(""),
  carga_saida_percent: numeroFiscal.default(null), // carga tributária de saída no cenário
  preco_venda_sugerido: numeroFiscal.default(null),
  observacoes: z.string().nullable().optional(),
});
export type Cenario = z.infer<typeof Cenario>;

/** Formação do preço de venda — memória financeira completa. */
export const FormacaoPreco = z.object({
  custo_aquisicao: numeroFiscal,
  frete_despesas: numeroFiscal,
  creditos_tributarios: numeroFiscal,
  debitos_saida_percent: numeroFiscal,
  custo_tributario_liquido: numeroFiscal,
  markup_percent: numeroFiscal,
  margem_estimada_percent: numeroFiscal,
  preco_venda_sugerido: numeroFiscal,
  formulas: z.array(z.string()), // fórmulas usadas, por extenso
});
export type FormacaoPreco = z.infer<typeof FormacaoPreco>;

/** Enquadramento de NCM tecnicamente defensável (nunca por economia fiscal). */
export const EnquadramentoNCM = z.object({
  ncm: z.string().default(""),
  descricao: z.string().nullable().optional(),
  cest: z.string().nullable().optional(),
  justificativa: z.string().default(""), // base: composição/função/RGI/NESH — não "paga menos"
  fundamento_url: z.string().nullable().default(null),
});
export type EnquadramentoNCM = z.infer<typeof EnquadramentoNCM>;

/** Benefício / crédito / regime especial identificado. */
export const BeneficioRegime = z.object({
  tipo: z.enum([
    "st",
    "monofasico",
    "aliquota_zero",
    "cesta_basica",
    "reducao_base",
    "isencao",
    "credito_presumido",
    "diferimento",
    "outro",
  ]).catch("outro"),
  descricao: z.string().default(""),
  aplicavel: z.boolean().nullable().default(null), // null = não confirmado
  fundamento_url: z.string().nullable().default(null),
});
export type BeneficioRegime = z.infer<typeof BeneficioRegime>;

/** Pendência anti-invenção: campo que a IA não confirmou. */
export const Pendencia = z.object({
  campo: z.string().default(""),
  motivo: z.string().default(""),
  impacto: z.string().nullable().optional(),
});
export type Pendencia = z.infer<typeof Pendencia>;

/** Status geral da análise (guardrail anti-invenção). */
export const STATUS = ["aprovado", "com_ressalvas", "provisorio"] as const;

/* ============================================================
   MODO HÍBRIDO — a IA devolve PARÂMETROS (com fonte), não números.
   O motor determinístico (motor-fiscal.ts) faz a aritmética.
   ============================================================ */

/** Parâmetros fiscais que a IA pesquisa e confirma (null = não confirmado). */
export const ParametrosFiscais = z.object({
  aliq_interna_destino: z.number().nullable().default(null),
  regiao_destino: z.enum(["sul_sudeste", "n_ne_co_es"]).nullable().default(null),
  equalizacao_simples: z.boolean().nullable().default(null),
  antecipacao_st: z.boolean().nullable().default(null),
  sujeito_st: z.boolean().nullable().default(null),
  monofasico: z.boolean().nullable().default(null),
  aliquota_zero_pc: z.boolean().nullable().default(null),
  reducao_base_icms_pct: z.number().nullable().default(null),
  mva_pct: z.number().nullable().default(null),
});
export type ParametrosFiscais = z.infer<typeof ParametrosFiscais>;

/** Parecer BRUTO da IA — parâmetros + narrativa + fontes. SEM números finais. */
export const ParecerIA = z.object({
  status: z.enum(STATUS).default("provisorio"),
  idioma: z.enum(IDIOMAS).default("pt"),
  parametros_fiscais: ParametrosFiscais.default({}),
  fontes_parametros: z
    .array(
      z.object({
        campo: z.string().default(""),
        url: z.string().nullable().default(null),
        vigencia: z.string().nullable().optional(), // "vale desde X" (início de vigência da regra)
      }),
    )
    .default([]).catch([]),
  resumo_executivo: z.string().default(""),
  tratamento_atual: z.string().default(""),
  impactos_reforma: z.string().default(""),
  cenarios: z.array(Cenario).default([]).catch([]),
  oportunidades_economia: z.array(z.string()).default([]).catch([]),
  ncms_enquadramentos: z.array(EnquadramentoNCM).default([]).catch([]),
  beneficios_creditos_regimes: z.array(BeneficioRegime).default([]).catch([]),
  riscos_pontos_atencao: z.array(z.string()).default([]).catch([]),
  fundamentacao_legal: z.array(FundamentoLegal).default([]).catch([]),
  fontes_oficiais: z.array(FonteConsultada).default([]).catch([]),
  dados_adicionais_necessarios: z.array(z.string()).default([]).catch([]),
  pendencias: z.array(Pendencia).default([]).catch([]),
});
export type ParecerIA = z.infer<typeof ParecerIA>;

const FORMACAO_VAZIA = {
  custo_aquisicao: null,
  frete_despesas: null,
  creditos_tributarios: null,
  debitos_saida_percent: null,
  custo_tributario_liquido: null,
  markup_percent: null,
  margem_estimada_percent: null,
  preco_venda_sugerido: null,
  formulas: [] as string[],
};

/**
 * Objeto raiz — o formato da persona, estruturado.
 * TOLERANTE A TRUNCAMENTO: só `status` é estritamente exigido; os demais têm
 * default. Assim, se a IA truncar a resposta, o parse não falha — o que faltou
 * fica vazio/nulo (coerente com o anti-invenção: ausência = pendência, não erro).
 * A ordem do esqueleto no prompt emite os NÚMEROS primeiro (menos risco de corte).
 */
export const AnaliseFiscal = z.object({
  status: z.enum(STATUS).default("provisorio"),
  provisorio: z.boolean().default(true),
  idioma: z.enum(IDIOMAS).default("pt"),

  formacao_preco: FormacaoPreco.default(FORMACAO_VAZIA).catch(FORMACAO_VAZIA),
  /** Cada parâmetro que ENTROU na conta, com sua fonte (rastreabilidade/confiança). */
  parametros_aplicados: z
    .array(
      z.object({
        rotulo: z.string(),
        valor: z.string(),
        fonte_url: z.string().nullable(),
        vigencia: z.string().nullable().optional(), // "vale desde X" — trilha de auditoria
        confirmado: z.boolean(),
      }),
    )
    .default([]).catch([]),
  memoria_calculo: z.array(PassoCalculo).default([]).catch([]),
  cenarios: z.array(Cenario).default([]).catch([]),

  resumo_executivo: z.string().default(""),
  dados_considerados: z.record(z.string(), z.unknown()).default({}).catch({}),
  uf_supermercado: z.string().nullable().default(null),
  uf_fornecedor: z.string().nullable().default(null),
  tratamento_atual: z.string().default(""),
  impactos_reforma: z.string().default(""),

  oportunidades_economia: z.array(z.string()).default([]).catch([]),
  ncms_enquadramentos: z.array(EnquadramentoNCM).default([]).catch([]),
  beneficios_creditos_regimes: z.array(BeneficioRegime).default([]).catch([]),
  riscos_pontos_atencao: z.array(z.string()).default([]).catch([]),

  fundamentacao_legal: z.array(FundamentoLegal).default([]).catch([]),
  fontes_oficiais: z.array(FonteConsultada).default([]).catch([]),
  data_verificacao_legislativa: z.string().default(""),
  dados_adicionais_necessarios: z.array(z.string()).default([]).catch([]),

  pendencias: z.array(Pendencia).default([]).catch([]),

  /** Sanity-check leve: a IA declara se as contas que MOSTROU fecham entre si. */
  autoverificacao: z
    .object({
      contas_consistentes: z.boolean(),
      observacao: z.string().nullable().optional(),
    })
    .default({ contas_consistentes: false, observacao: null })
    .catch({ contas_consistentes: false, observacao: null }),
});
export type AnaliseFiscal = z.infer<typeof AnaliseFiscal>;

/**
 * Faz o parse defensivo do texto retornado pela IA (pode vir com cercas de
 * markdown). Retorna { ok, data } ou { ok:false, erro } — nunca lança.
 */
/** Extrai o objeto JSON do texto da IA (tolerante: strip de markdown + jsonrepair). */
function extrairJson(texto: string): { ok: true; json: unknown } | { ok: false; erro: string } {
  const limpo = texto.replace(/```json|```/g, "").trim();
  const ini = limpo.indexOf("{");
  const fim = limpo.lastIndexOf("}");
  if (ini < 0 || fim <= ini) return { ok: false, erro: "JSON não encontrado" };
  const candidato = limpo.slice(ini, fim + 1);
  try {
    return { ok: true, json: JSON.parse(candidato) };
  } catch {
    // LLMs erram JSON grande (vírgula faltando, aspas não escapadas, truncamento).
    try {
      return { ok: true, json: JSON.parse(jsonrepair(candidato)) };
    } catch (e) {
      return { ok: false, erro: `JSON inválido: ${(e as Error).message}` };
    }
  }
}

/** Parse do parecer BRUTO da IA (modo híbrido). */
export function parseParecer(texto: string):
  | { ok: true; data: ParecerIA }
  | { ok: false; erro: string; bruto: string } {
  const ex = extrairJson(texto);
  if (!ex.ok) return { ok: false, erro: ex.erro, bruto: texto };
  const r = ParecerIA.safeParse(ex.json);
  if (!r.success) return { ok: false, erro: r.error.message, bruto: texto };
  return { ok: true, data: r.data };
}

/** (Legado) parse do formato antigo em que a IA emitia os números. */
export function parseAnalise(texto: string):
  | { ok: true; data: AnaliseFiscal }
  | { ok: false; erro: string; bruto: string } {
  const ex = extrairJson(texto);
  if (!ex.ok) return { ok: false, erro: ex.erro, bruto: texto };
  const r = AnaliseFiscal.safeParse(ex.json);
  if (!r.success) return { ok: false, erro: r.error.message, bruto: texto };
  return { ok: true, data: r.data };
}
