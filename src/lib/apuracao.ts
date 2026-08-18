import { supabase } from "@/integrations/supabase/client";
import { parseNFe, type NFeParsed } from "@/lib/nfe/parse-nfe";
import { parseCupom } from "@/lib/nfe/parse-cupom";
import { calcularST, resolverRegra, type RegraUF, type RegraCest } from "@/lib/fiscal/motor-st";

/* ============================================================
   Masor — Apuração fiscal / Prova Real (Fase 7) — ENTRADAS.
   Lê as NF-e de entrada capturadas na SEFAZ (masor_dfe_documentos,
   tipo procNFe), extrai os itens (parse-nfe determinístico) e apura
   o CRÉDITO POTENCIAL para empresa de Lucro Real:
   - ICMS aproveitável = Σ vICMS dos itens com ICMS próprio (CST 00/20)
   - ICMS-ST retido = Σ vICMSST — NÃO é crédito, é custo (mostra à parte)
   - PIS/COFINS não cumulativo = 9,25% da base elegível (exclui
     monofásico/alíquota-zero, que não geram crédito)
   - IPI destacado = custo (supermercado não credita IPI)
   Anti-invenção: só soma valores que vêm da própria NF-e; nada de
   alíquota presumida. Sem saídas (empresa pré-operação), o resultado
   é o "estoque de crédito" que abaterá o 1º mês de venda.
   Base legal e limites: docs/apuracao-prova-real.md.
   ============================================================ */

export type LinhaCFOP = {
  cfop: string;
  qtdItens: number;
  vProd: number;
  vICMS: number;
  vICMSST: number;
};

export type Apuracao = {
  totalDocs: number;
  totalEntradas: number; // Σ vProd
  creditoICMS: number; // Σ vICMS dos itens CST 00/20
  stRetido: number; // Σ vICMSST (custo, não crédito)
  ipiCusto: number; // Σ vIPI (custo)
  basePisCofins: number; // Σ vProd elegível a crédito
  creditoPisCofins: number; // 9,25% da base elegível
  porCFOP: LinhaCFOP[];
};

// CST de ICMS com ICMS PRÓPRIO destacado (creditável na entrada p/ revenda).
// Inclui 10 e 70 (tributada/red.BC + ST): o parser separa vICMS (próprio) de
// vICMSST (retido), então soma-se só o próprio — sem risco de creditar a ST.
const CST_CRED_ICMS = new Set(["00", "10", "20", "70"]);
// CST de PIS que NÃO geram crédito (monofásico 04/05; alíquota-zero/isenta 06/07/08/09).
const CST_PIS_SEM_CREDITO = new Set(["04", "05", "06", "07", "08", "09"]);
// CFOPs de ENTRADA que geram crédito (compra p/ revenda/industrialização, com ou
// sem ST). Uso/consumo (1556), devolução (1202), bonificação (1910) e
// transferência (1152) NÃO entram — não dão crédito de revenda; ficam só informativos.
const CFOP_REVENDA = new Set([
  "1101", "2101", "1102", "2102", // compra p/ industrialização / revenda
  "1401", "2401", "1403", "2403", // idem, com substituição tributária
  "1116", "2116", "1117", "2117", // compra p/ revenda por encomenda / ordem
]);
// Alíquota do PIS/COFINS não cumulativo (1,65% + 7,6%) — constante legal, não presumida.
const ALIQ_PIS_COFINS = 0.0925;
// CST de ICMS com DÉBITO próprio na SAÍDA (venda tributada). CST 60 (ST já
// retida na cadeia) e 40/41 (isento/não tributado) não geram débito próprio.
const CST_DEB_ICMS = new Set(["00", "10", "20", "70", "90"]);

export async function apurarEntradas(clienteId: string): Promise<Apuracao> {
  const ap: Apuracao = {
    totalDocs: 0,
    totalEntradas: 0,
    creditoICMS: 0,
    stRetido: 0,
    ipiCusto: 0,
    basePisCofins: 0,
    creditoPisCofins: 0,
    porCFOP: [],
  };
  if (!supabase) return ap;

  const { data } = await supabase
    .from("masor_dfe_documentos")
    .select("xml,tipo")
    .eq("cliente_id", clienteId)
    .eq("tipo", "procNFe");
  const docs = (data as { xml: string; tipo: string }[]) ?? [];
  ap.totalDocs = docs.length;

  const cfopMap = new Map<string, LinhaCFOP>();
  for (const d of docs) {
    const nf: NFeParsed = parseNFe(d.xml);
    if (!nf.ok) continue;
    for (const it of nf.itens) {
      const vProd = it.vProd ?? 0;
      const vICMS = it.vICMS ?? 0;
      const vICMSST = it.vICMSST ?? 0;
      const cfopNum = (it.cfop ?? "").replace(/\D/g, "");
      const ehRevenda = CFOP_REVENDA.has(cfopNum);
      ap.totalEntradas += vProd;
      ap.stRetido += vICMSST;
      ap.ipiCusto += it.vIPI ?? 0;
      // Crédito só em entrada de REVENDA (gate por CFOP) E com ICMS próprio (CST).
      if (ehRevenda && it.cst_icms && CST_CRED_ICMS.has(it.cst_icms)) ap.creditoICMS += vICMS;
      if (ehRevenda && !CST_PIS_SEM_CREDITO.has(it.cst_pis ?? "")) ap.basePisCofins += vProd;

      const cfop = it.cfop ?? "—";
      const linha = cfopMap.get(cfop) ?? { cfop, qtdItens: 0, vProd: 0, vICMS: 0, vICMSST: 0 };
      linha.qtdItens += 1;
      linha.vProd += vProd;
      linha.vICMS += vICMS;
      linha.vICMSST += vICMSST;
      cfopMap.set(cfop, linha);
    }
  }
  ap.creditoPisCofins = ap.basePisCofins * ALIQ_PIS_COFINS;
  ap.porCFOP = [...cfopMap.values()].sort((a, b) => b.vProd - a.vProd);
  return ap;
}

export type SaidaResumo = {
  totalCupons: number;
  cuponsInvalidos: number;
  totalSaidas: number; // Σ vProd
  debitoICMS: number; // Σ vICMS próprio dos itens tributados (CST 00/10/20/70/90)
  baseDebitoPisCofins: number;
  debitoPisCofins: number; // 9,25% da base tributada
  porCFOP: LinhaCFOP[];
};

/** Apura o DÉBITO das SAÍDAS a partir dos XML de cupons fiscais (CF-e-SAT/NFC-e).
 *  Parse client-side (ok p/ lotes moderados); p/ milhares de cupons/dia o alvo é
 *  server-side via .zip + agregação por competência (Fase 7b). */
export function apurarSaidas(xmls: string[]): SaidaResumo {
  const r: SaidaResumo = {
    totalCupons: 0,
    cuponsInvalidos: 0,
    totalSaidas: 0,
    debitoICMS: 0,
    baseDebitoPisCofins: 0,
    debitoPisCofins: 0,
    porCFOP: [],
  };
  const cfopMap = new Map<string, LinhaCFOP>();
  for (const xml of xmls) {
    const c = parseCupom(xml);
    if (!c.ok) {
      r.cuponsInvalidos++;
      continue;
    }
    r.totalCupons++;
    for (const it of c.itens) {
      const vProd = it.vProd ?? 0;
      const vICMS = it.vICMS ?? 0;
      const vICMSST = it.vICMSST ?? 0;
      r.totalSaidas += vProd;
      if (it.cst_icms && CST_DEB_ICMS.has(it.cst_icms)) r.debitoICMS += vICMS;
      // monofásico/alíquota-zero (mesmos CST do lado do crédito) não geram débito.
      if (!CST_PIS_SEM_CREDITO.has(it.cst_pis ?? "")) r.baseDebitoPisCofins += vProd;

      const cfop = it.cfop ?? "—";
      const linha = cfopMap.get(cfop) ?? { cfop, qtdItens: 0, vProd: 0, vICMS: 0, vICMSST: 0 };
      linha.qtdItens += 1;
      linha.vProd += vProd;
      linha.vICMS += vICMS;
      linha.vICMSST += vICMSST;
      cfopMap.set(cfop, linha);
    }
  }
  r.debitoPisCofins = r.baseDebitoPisCofins * ALIQ_PIS_COFINS;
  r.porCFOP = [...cfopMap.values()].sort((a, b) => b.vProd - a.vProd);
  return r;
}

/* ---------- Radar de crédito recuperável (#3) ---------- */

export type CreditoTipo = "ressarcimento_st" | "credito_icms" | "credito_pis_cofins" | "despesas_pis_cofins";
export type OportunidadeCredito = { tipo: CreditoTipo; valor: number | null };

/** A partir da apuração das entradas, lista o crédito recuperável / não aproveitado.
 *  valor null = lembrete estrutural (sem valor calculável a partir da NF-e). */
export function radarCredito(ap: Apuracao): OportunidadeCredito[] {
  const ops: OportunidadeCredito[] = [];
  if (ap.stRetido > 0) ops.push({ tipo: "ressarcimento_st", valor: ap.stRetido });
  if (ap.creditoICMS > 0) ops.push({ tipo: "credito_icms", valor: ap.creditoICMS });
  if (ap.creditoPisCofins > 0) ops.push({ tipo: "credito_pis_cofins", valor: ap.creditoPisCofins });
  // Estrutural — quase sempre esquecido pelo varejo: crédito de PIS/COFINS sobre
  // energia, aluguel PJ e fretes. Não sai da NF-e de mercadoria; fica como lembrete.
  ops.push({ tipo: "despesas_pis_cofins", valor: null });
  return ops;
}

/* ---------- Motor de ICMS-ST aplicado às entradas capturadas ---------- */

export type ResumoST = {
  itensComST: number;
  itensPendentes: number;
  stDevida: number;
  antecipacao: number;
  fcp: number;
  pendencias: { ncm: string; motivo: string }[];
};

/** Roda o motor de ST (motor-st.ts) sobre cada item das NF-e de entrada
 *  capturadas. Resolve a regra da UF/CEST (com cache) e agrega ST devida,
 *  antecipação e FCP. Item sem regra confirmada vira PENDÊNCIA (não chuta). */
export async function apurarST(clienteId: string): Promise<ResumoST> {
  const r: ResumoST = { itensComST: 0, itensPendentes: 0, stDevida: 0, antecipacao: 0, fcp: 0, pendencias: [] };
  if (!supabase) return r;
  const { data } = await supabase
    .from("masor_dfe_documentos")
    .select("xml")
    .eq("cliente_id", clienteId)
    .eq("tipo", "procNFe");
  const docs = (data as { xml: string }[]) ?? [];

  const cacheUF = new Map<string, RegraUF | null>();
  const cacheCest = new Map<string, RegraCest | null>(); // chave = uf|ncm
  const pendVistas = new Set<string>();

  for (const d of docs) {
    const nf = parseNFe(d.xml);
    if (!nf.ok || !nf.dest_uf) continue;
    const uf = nf.dest_uf;
    for (const it of nf.itens) {
      const ncm = (it.ncm ?? "").replace(/\D/g, "");
      const key = `${uf}|${ncm}`;
      if (!cacheCest.has(key)) {
        const res = await resolverRegra(ncm, uf);
        cacheUF.set(uf, res.uf);
        cacheCest.set(key, res.cest);
      }
      const regraUF = cacheUF.get(uf) ?? null;
      const regraCest = cacheCest.get(key) ?? null;
      if (!regraUF) continue; // UF sem regra base cadastrada
      const st = calcularST(it, regraUF, regraCest, { uf_origem: nf.emit_uf, uf_destino: uf });
      if (!st.aplicavel && st.pendencias.length === 0) continue; // não sujeito a ST
      if (st.aplicavel) r.itensComST += 1;
      if (st.provisorio || st.pendencias.length > 0) {
        if (st.provisorio) r.itensPendentes += 1;
        for (const p of st.pendencias) {
          const pk = `${ncm}|${p.campo}`;
          if (!pendVistas.has(pk)) {
            pendVistas.add(pk);
            r.pendencias.push({ ncm: ncm || "—", motivo: p.motivo });
          }
        }
      }
      if (!st.provisorio) {
        r.stDevida += st.st_devida ?? 0;
        r.antecipacao += st.antecipacao_426a ?? 0;
        r.fcp += st.fcp ?? 0;
      }
    }
  }
  return r;
}

/** Rótulo didático (leigo) dos CFOPs de entrada mais comuns em supermercado. */
export function rotuloCFOP(cfop: string): string {
  const c = cfop.replace(/\D/g, "");
  const t: Record<string, string> = {
    "1102": "Compra p/ revenda (mesmo estado)",
    "2102": "Compra p/ revenda (outro estado)",
    "1403": "Compra p/ revenda com ST (mesmo estado)",
    "2403": "Compra p/ revenda com ST (outro estado)",
    "1401": "Compra industrialização com ST",
    "1910": "Bonificação / brinde (entrada)",
    "2910": "Bonificação / brinde (outro estado)",
    "1202": "Devolução de venda (mesmo estado)",
    "2202": "Devolução de venda (outro estado)",
    "1152": "Transferência entre lojas (mesmo estado)",
    "2152": "Transferência entre lojas (outro estado)",
    "1556": "Compra de material de uso/consumo",
  };
  return t[c] ?? "Entrada";
}
