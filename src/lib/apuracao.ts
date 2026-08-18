import { supabase } from "@/integrations/supabase/client";
import { parseNFe, type NFeParsed } from "@/lib/nfe/parse-nfe";

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
