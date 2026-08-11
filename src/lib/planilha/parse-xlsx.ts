import * as XLSX from "xlsx";

/* ============================================================
   Masor — leitor de planilha XLSX/CSV de produtos.
   Mapeia colunas por heurística (o cliente manda a planilha dele,
   sem padrão fixo) e critica linha a linha. Cada linha vira uma
   operação analisável. Parse client-side no upload.
   ============================================================ */

export type LinhaPlanilha = {
  n: number;
  descricao: string | null;
  ncm: string | null;
  cest: string | null;
  ean: string | null;
  custo: number | null;
  cfop: string | null;
  uf_fornecedor: string | null;
  criticas: string[];
};

const norm = (s: unknown) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

const num = (v: unknown): number | null => {
  if (v == null || v === "") return null;
  if (typeof v === "number") return v;
  const s = String(v).trim();
  const norm2 = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  const n = parseFloat(norm2.replace(/[^\d.-]/g, ""));
  return isNaN(n) ? null : n;
};

const acharColuna = (chaves: string[], padrao: RegExp): string | null =>
  chaves.find((k) => padrao.test(norm(k))) ?? null;

export function parseXlsx(buf: ArrayBuffer): { ok: boolean; erro?: string; linhas: LinhaPlanilha[] } {
  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(buf, { type: "array" });
  } catch (e) {
    return { ok: false, erro: `Não consegui ler o arquivo: ${(e as Error).message}`, linhas: [] };
  }
  const nome = wb.SheetNames[0];
  if (!nome) return { ok: false, erro: "Planilha vazia.", linhas: [] };
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[nome], { defval: null });
  if (!rows.length) return { ok: false, erro: "Sem linhas de dados.", linhas: [] };

  const chaves = Object.keys(rows[0]);
  const cDesc = acharColuna(chaves, /descr|produto|mercadoria|\bitem\b|nome/);
  const cNcm = acharColuna(chaves, /ncm/);
  const cCest = acharColuna(chaves, /cest/);
  const cEan = acharColuna(chaves, /ean|gtin|barra/);
  const cCusto = acharColuna(chaves, /custo|pre[cç]o|valor|unit/);
  const cCfop = acharColuna(chaves, /cfop/);
  const cUf = acharColuna(chaves, /uf.*forn|forn.*uf|origem|fornecedor/);

  const linhas = rows
    .map((r, i): LinhaPlanilha => {
      const item: LinhaPlanilha = {
        n: i + 1,
        descricao: cDesc && r[cDesc] != null ? String(r[cDesc]) : null,
        ncm: cNcm && r[cNcm] != null ? String(r[cNcm]).replace(/\D/g, "") : null,
        cest: cCest && r[cCest] != null ? String(r[cCest]) : null,
        ean: cEan && r[cEan] != null ? String(r[cEan]) : null,
        custo: cCusto ? num(r[cCusto]) : null,
        cfop: cCfop && r[cCfop] != null ? String(r[cCfop]) : null,
        uf_fornecedor: cUf && r[cUf] != null ? String(r[cUf]).toUpperCase().slice(0, 2) : null,
        criticas: [],
      };
      if (!item.descricao) item.criticas.push("sem descrição");
      if (!item.ncm || item.ncm.length !== 8) item.criticas.push("NCM ausente ou fora do padrão de 8 dígitos");
      if (item.custo == null || item.custo <= 0) item.criticas.push("custo ausente");
      return item;
    })
    .filter((l) => l.descricao || l.ncm || l.custo != null);

  return { ok: true, linhas };
}

/** Mapeia uma linha de planilha para o payload de operação (usa os dados fixos da empresa). */
export function linhaParaOperacao(
  l: LinhaPlanilha,
  empresa: { uf?: string | null; regime_tributario?: string | null; municipio?: string | null },
  markup: string,
): Record<string, unknown> {
  return {
    uf_supermercado: empresa.uf ?? null,
    municipio_supermercado: empresa.municipio ?? null,
    regime_empresa: empresa.regime_tributario ?? "lucro_real",
    uf_fornecedor: l.uf_fornecedor,
    regime_fornecedor: "normal",
    origem_mercadoria: l.uf_fornecedor && empresa.uf && l.uf_fornecedor === empresa.uf ? "interna" : "sul_sudeste",
    finalidade: "revenda",
    produto_descricao: l.descricao,
    gtin: l.ean,
    ncm: l.ncm,
    cest: l.cest,
    unidade: "UN",
    custo_nf: l.custo != null ? String(l.custo) : null,
    st_retida: false,
    consta_lista_st: false,
    pis_cofins: "normal",
    markup_percent: markup,
    tipo_margem: "venda",
  };
}
