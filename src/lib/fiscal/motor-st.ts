import { supabase } from "@/integrations/supabase/client";
import type { NFeItem } from "@/lib/nfe/parse-nfe";

/* ============================================================
   Masor — Motor determinístico de ICMS-ST (estadual, multi-tenant).
   O motor CALCULA; a camada de regras versionada (masor_tax_states por UF +
   masor_ncm_rules.parametros por NCM/CEST) FORNECE os números (MVA, PMPF,
   alíquota interna, FCP, redução). A NF-e fornece os valores da operação.
   Anti-invenção: regra faltando (CEST não mapeado, sem MVA/PMPF, origem
   indefinida) → o item vira PENDÊNCIA e o motor NÃO chuta.
   Fórmulas: parecer tributarista-mestre (RICMS/SP art. 40-A/41/44/268/426-A/
   269/56-C; CAT 42/2018). Ressarcimento/complemento exigem vínculo entrada↔
   saída (Fase 7c) — aqui ficam como pendência quando não há a venda casada.
   ============================================================ */

export type RegraUF = {
  sigla: string;
  aliq_interna: number | null; // % (ex.: 18)
  antecipacao_st: boolean;
  fcp_default_pct: number; // % (0 se a UF não tem FCP geral)
};

export type RegraCest = {
  cest: string | null;
  sujeito_st: boolean;
  mva_pct: number | null; // MVA/IVA-ST original (%)
  mva_ajustada_por_origem: Record<string, number> | null; // { "4": .., "7": .., "12": .. } (% já ajustada)
  pmpf_unitario: number | null; // R$ por unidade comercial — quando existe, PREVALECE sobre MVA
  base_reduzida_pct: number; // fração 0..1 de REDUÇÃO da base (0 = sem redução)
  reducao_alcanca_st: boolean; // a redução se estende à etapa subsequente (ST)?
  fcp_pct: number | null; // % (null = usa o default da UF; 0 = produto sem FCP)
  aliq_interna_override: number | null; // % quando o NCM foge da alíquota geral da UF
};

export type PassoST = { rotulo: string; formula?: string; valor: number | null };
export type PendenciaST = { campo: string; motivo: string };

export type SaidaST = {
  aplicavel: boolean; // o item é sujeito a ST?
  provisorio: boolean; // faltou regra confirmada → não calculou
  icms_proprio: number | null;
  st_base: number | null;
  st_devida: number | null; // ICMS-ST a reter/recolher
  antecipacao_426a: number | null; // quando entra de outro estado SEM retenção
  fcp: number | null;
  st_ja_retida: number; // vICMSST da nota (informativo)
  memoria: PassoST[];
  pendencias: PendenciaST[];
};

const n = (v: number | null | undefined) => (v == null || isNaN(v) ? 0 : v);

/** Alíquota interestadual pela origem da mercadoria + UFs (para a MVA ajustada).
 *  Importado (origem 1/2/3/8) = 4%. Interestadual p/ destino Sul/Sudeste: origem
 *  Sul/Sudeste = 12%; origem N/NE/CO/ES = 7%. Retorna null se não for interestadual. */
const UF_SUL_SUDESTE = new Set(["PR", "SC", "RS", "SP", "RJ", "MG"]);
function aliqInterestadual(item: NFeItem, ufOrigem: string | null, ufDestino: string | null): number | null {
  if (!ufOrigem || !ufDestino || ufOrigem === ufDestino) return null; // operação interna
  if (["1", "2", "3", "8"].includes(item.orig ?? "")) return 4; // importado (Res. Senado 13/2012)
  // destino Sul/Sudeste (caso do SP): 12% se origem S/SE, 7% se origem N/NE/CO/ES.
  if (UF_SUL_SUDESTE.has(ufDestino)) return UF_SUL_SUDESTE.has(ufOrigem) ? 12 : 7;
  return 12; // fallback conservador p/ destinos fora do S/SE (refinar por UF via regra)
}

/** Núcleo determinístico: item + regra da UF + regra do CEST → apuração de ST.
 *  Puro e testável; toda alíquota/MVA/PMPF vem das regras (nunca fixo no código). */
export function calcularST(
  item: NFeItem,
  uf: RegraUF,
  cest: RegraCest | null,
  ctx: { uf_origem: string | null; uf_destino: string | null },
): SaidaST {
  const memoria: PassoST[] = [];
  const pendencias: PendenciaST[] = [];
  const out: SaidaST = {
    aplicavel: false,
    provisorio: false,
    icms_proprio: null,
    st_base: null,
    st_devida: null,
    antecipacao_426a: null,
    fcp: null,
    st_ja_retida: n(item.vICMSST),
    memoria,
    pendencias,
  };

  // 1) O item é sujeito a ST? Sem CEST/regra não dá para afirmar → pendência.
  if (!cest) {
    pendencias.push({ campo: "cest", motivo: "CEST/regra do produto não mapeado — não é possível apurar ST." });
    out.provisorio = true;
    return out;
  }
  if (!cest.sujeito_st) {
    out.aplicavel = false;
    memoria.push({ rotulo: "Produto não sujeito a ST", valor: 0 });
    return out;
  }
  out.aplicavel = true;

  // 2) Alíquota interna do destino (da regra; override por NCM quando houver).
  const aliqIntra = cest.aliq_interna_override ?? uf.aliq_interna;
  if (aliqIntra == null) {
    pendencias.push({ campo: "aliq_interna", motivo: `Alíquota interna de ${uf.sigla} não confirmada para este produto.` });
    out.provisorio = true;
    return out;
  }

  // 3) Base de cálculo da ST: PMPF (pauta) PREVALECE sobre MVA quando existe.
  const valorOperacao = n(item.vProd) + n(item.vIPI); // frete/seguro/desconto não vêm por item na NF-e; refinar no rateio (Fase 7c)
  let stBase: number | null = null;
  if (cest.pmpf_unitario != null) {
    stBase = cest.pmpf_unitario * n(item.qCom);
    memoria.push({ rotulo: "Base ST (pauta/PMPF)", formula: `PMPF ${cest.pmpf_unitario} × ${n(item.qCom)} un`, valor: stBase });
  } else if (cest.mva_pct != null || cest.mva_ajustada_por_origem) {
    const alqInter = aliqInterestadual(item, ctx.uf_origem, ctx.uf_destino);
    let mva = cest.mva_pct;
    if (alqInter != null) {
      // interestadual → MVA ajustada. Usa a tabela pronta da regra, senão calcula.
      const pronta = cest.mva_ajustada_por_origem?.[String(alqInter)];
      if (pronta != null) {
        mva = pronta;
      } else if (cest.mva_pct != null) {
        // MVA_aj = [(1+MVA)×(1−ALQ_inter)/(1−ALQ_intra)] − 1
        mva = ((1 + cest.mva_pct / 100) * (1 - alqInter / 100)) / (1 - aliqIntra / 100) * 100 - 100;
      }
    }
    if (mva == null) {
      pendencias.push({ campo: "mva", motivo: "MVA/IVA-ST não confirmada para o CEST." });
      out.provisorio = true;
      return out;
    }
    let base = valorOperacao * (1 + mva / 100);
    if (cest.base_reduzida_pct > 0 && cest.reducao_alcanca_st) base = base * (1 - cest.base_reduzida_pct);
    stBase = base;
    memoria.push({
      rotulo: "Base ST (MVA)",
      formula: `(vProd+IPI ${valorOperacao.toFixed(2)}) × (1 + MVA ${mva.toFixed(2)}%)${cest.base_reduzida_pct > 0 && cest.reducao_alcanca_st ? ` × (1 − red. ${(cest.base_reduzida_pct * 100).toFixed(0)}%)` : ""}`,
      valor: stBase,
    });
  } else {
    pendencias.push({ campo: "mva_pmpf", motivo: "Sem MVA nem PMPF confirmado para o CEST — não é possível montar a base de ST." });
    out.provisorio = true;
    return out;
  }
  out.st_base = stBase;

  // 4) ICMS próprio da operação (o destaque da nota, abatido da ST).
  const icmsProprio = n(item.vICMS);
  out.icms_proprio = icmsProprio;

  // 5) ICMS-ST devido = base × alíq. interna − ICMS próprio.
  const stDevida = Math.max(0, stBase * (aliqIntra / 100) - icmsProprio);
  out.st_devida = stDevida;
  memoria.push({ rotulo: "ICMS-ST devido", formula: `base ${stBase.toFixed(2)} × ${aliqIntra}% − ICMS próprio ${icmsProprio.toFixed(2)}`, valor: stDevida });

  // 6) FCP (quando o produto tem — % da regra do CEST, senão default da UF).
  const fcpPct = cest.fcp_pct ?? uf.fcp_default_pct;
  const fcp = fcpPct > 0 ? stBase * (fcpPct / 100) : 0;
  out.fcp = fcp;
  if (fcp > 0) memoria.push({ rotulo: "FCP-ST", formula: `base ${stBase.toFixed(2)} × ${fcpPct}%`, valor: fcp });

  // 7) Antecipação 426-A: entrada interestadual SEM retenção → antecipa a ST.
  const interestadual = aliqInterestadual(item, ctx.uf_origem, ctx.uf_destino) != null;
  if (interestadual && out.st_ja_retida === 0) {
    if (icmsProprio === 0) {
      pendencias.push({ campo: "ic_426a", motivo: "ICMS de entrada não destacado — não zerar por padrão (art. 426-A); confirmar." });
    }
    out.antecipacao_426a = stDevida; // mesma conta; recolhido pelo adquirente
    memoria.push({ rotulo: "Antecipação (art. 426-A)", formula: "entrada interestadual sem retenção", valor: stDevida });
  }

  // 8) Ressarcimento/complemento (art. 269 / CAT 42/2018): exige vínculo entrada↔saída.
  if (out.st_ja_retida > 0) {
    pendencias.push({
      campo: "ressarcimento_st",
      motivo: "ST retida na entrada — o ressarcimento/complemento só é apurável ao casar com a VENDA ao consumidor (Fase 7c).",
    });
  }

  return out;
}

/** Busca as regras vigentes da UF e do NCM/CEST na camada versionada.
 *  Retorna cest=null quando não há regra do produto (→ pendência no motor). */
export async function resolverRegra(
  ncm: string | null,
  uf: string | null,
): Promise<{ uf: RegraUF | null; cest: RegraCest | null }> {
  if (!supabase || !uf) return { uf: null, cest: null };

  const { data: ts } = await supabase
    .from("masor_tax_states")
    .select("sigla,aliq_interna,antecipacao_st,parametros")
    .eq("sigla", uf)
    .maybeSingle();
  const p = (ts?.parametros ?? {}) as { fcp_default_pct?: number };
  const regraUF: RegraUF | null = ts
    ? {
        sigla: ts.sigla,
        aliq_interna: ts.aliq_interna ?? null,
        antecipacao_st: !!ts.antecipacao_st,
        fcp_default_pct: Number(p.fcp_default_pct ?? 0),
      }
    : null;

  let regraCest: RegraCest | null = null;
  if (ncm) {
    const ncmDig = ncm.replace(/\D/g, "");
    const { data: nr } = await supabase
      .from("masor_ncm_rules")
      .select("parametros")
      .eq("ncm", ncmDig)
      .or(`uf.eq.${uf},uf.is.null`)
      .order("uf", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();
    const q = (nr?.parametros ?? null) as Record<string, unknown> | null;
    if (q) {
      regraCest = {
        cest: (q.cest as string) ?? null,
        sujeito_st: q.sujeito_st === true,
        mva_pct: q.mva_pct != null ? Number(q.mva_pct) : null,
        mva_ajustada_por_origem: (q.mva_ajustada_por_origem as Record<string, number>) ?? null,
        pmpf_unitario: q.pmpf_unitario != null ? Number(q.pmpf_unitario) : (q.pmpf != null ? Number(q.pmpf) : null),
        base_reduzida_pct: q.base_reduzida_pct != null ? Number(q.base_reduzida_pct) : 0,
        reducao_alcanca_st: q.reducao_alcanca_st === true,
        fcp_pct: q.fcp_pct != null ? Number(q.fcp_pct) : null,
        aliq_interna_override: q.aliq_interna_override != null ? Number(q.aliq_interna_override) : null,
      };
    }
  }
  return { uf: regraUF, cest: regraCest };
}
