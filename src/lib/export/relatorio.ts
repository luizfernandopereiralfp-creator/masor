import * as XLSX from "xlsx";

import type { AnaliseFiscal } from "@/lib/ia/contrato";
import type { Produto } from "@/lib/produtos";

/* ============================================================
   Masor — RELATÓRIOS PERSONALIZÁVEIS (XLSX).
   O staff escolhe QUAIS colunas, em que ORDEM, e um PRESET de
   layout. Cada coluna sabe seu rótulo, grupo, tipo (texto/moeda/
   percent/inteiro) e como extrair o valor de um Produto + sua
   análise fiscal. Números saem como número (planilha utilizável),
   com formato de célula (moeda/percent) — não texto.

   Objetivo: entregar a MESMA riqueza da planilha de formação de
   preço que o cliente já usa (ex.: time de MG), com toda a memória
   de cálculo por produto, num layout limpo e configurável.
   ============================================================ */

/** Tipos de formatação de coluna. */
export type TipoColuna = "texto" | "moeda" | "percent" | "inteiro" | "numero";

/** Uma coluna disponível no catálogo do relatório. */
export type ColunaRelatorio = {
  chave: string;
  rotulo: string;
  grupo: string;
  tipo: TipoColuna;
  /** Extrai o valor bruto (número ou texto) do produto + análise. */
  valor: (p: Produto, a: AnaliseParcial) => string | number | null;
  /** Soma na linha de TOTAIS? (só faz sentido p/ moeda/quantidade absoluta). */
  somavel?: boolean;
};

/** A análise vem como jsonb (unknown) no produto — lemos de forma tolerante. */
type AnaliseParcial = Partial<AnaliseFiscal> | null;

const fp = (a: AnaliseParcial) => a?.formacao_preco;
/** Busca um parâmetro aplicado por trecho do rótulo (case-insensitive). */
const param = (a: AnaliseParcial, ...termos: string[]): string | null => {
  const lista = a?.parametros_aplicados ?? [];
  for (const t of termos) {
    const hit = lista.find((p) => p.rotulo?.toLowerCase().includes(t.toLowerCase()));
    if (hit) return hit.valor ?? null;
  }
  return null;
};
/** Converte "12,5%" / "18%" / "0,18" em fração numérica (0.18) — tolerante. */
const fracDe = (s: string | null): number | null => {
  if (s == null) return null;
  const txt = String(s).trim();
  const temPct = txt.includes("%");
  const n = parseFloat(txt.replace(/[^\d,.-]/g, "").replace(".", "").replace(",", "."));
  if (isNaN(n)) return null;
  return temPct || n > 1 ? n / 100 : n;
};

/* ---------- CATÁLOGO de colunas (fonte única) ---------- */

export const CATALOGO: ColunaRelatorio[] = [
  // Identificação
  { chave: "descricao", rotulo: "Produto", grupo: "Identificação", tipo: "texto", valor: (p) => p.descricao ?? "" },
  { chave: "ean", rotulo: "EAN / Código de barras", grupo: "Identificação", tipo: "texto", valor: (p) => p.ean ?? "" },
  { chave: "ncm", rotulo: "NCM", grupo: "Identificação", tipo: "texto", valor: (p) => p.ncm ?? "" },
  { chave: "cest", rotulo: "CEST", grupo: "Identificação", tipo: "texto", valor: (p) => p.cest ?? "" },
  { chave: "categoria", rotulo: "Categoria", grupo: "Identificação", tipo: "texto", valor: (p) => p.categoria ?? "" },
  { chave: "unidade", rotulo: "Unidade", grupo: "Identificação", tipo: "texto", valor: (p) => p.unidade ?? "" },

  // Custos e preço (formação de preço)
  { chave: "custo_nf", rotulo: "Custo NF (R$)", grupo: "Formação de preço", tipo: "moeda", somavel: true, valor: (p, a) => p.custo_nf ?? fp(a)?.custo_aquisicao ?? null },
  { chave: "frete_despesas", rotulo: "Frete e despesas (R$)", grupo: "Formação de preço", tipo: "moeda", somavel: true, valor: (_p, a) => fp(a)?.frete_despesas ?? null },
  { chave: "creditos", rotulo: "Créditos tributários (−) (R$)", grupo: "Formação de preço", tipo: "moeda", somavel: true, valor: (_p, a) => fp(a)?.creditos_tributarios ?? null },
  { chave: "custo_liquido", rotulo: "Custo líquido (R$)", grupo: "Formação de preço", tipo: "moeda", somavel: true, valor: (_p, a) => fp(a)?.custo_tributario_liquido ?? null },
  { chave: "markup", rotulo: "Markup (%)", grupo: "Formação de preço", tipo: "percent", valor: (p, a) => (p.markup_pct != null ? p.markup_pct / 100 : fp(a)?.markup_percent ?? null) },
  { chave: "carga_saida", rotulo: "Carga de saída (%)", grupo: "Formação de preço", tipo: "percent", valor: (_p, a) => fp(a)?.debitos_saida_percent ?? null },
  { chave: "margem", rotulo: "Margem estimada (%)", grupo: "Formação de preço", tipo: "percent", valor: (_p, a) => fp(a)?.margem_estimada_percent ?? null },
  { chave: "preco_venda", rotulo: "Preço mínimo de venda (R$)", grupo: "Formação de preço", tipo: "moeda", somavel: true, valor: (_p, a) => fp(a)?.preco_venda_sugerido ?? null },

  // Tributação (parâmetros aplicados — a memória de cálculo tributária)
  { chave: "aliq_entrada", rotulo: "Alíq. ICMS entrada (%)", grupo: "Tributação", tipo: "percent", valor: (_p, a) => fracDe(param(a, "icms entrada", "crédito de icms", "alíquota de entrada", "icms na entrada")) },
  { chave: "aliq_saida", rotulo: "Alíq. ICMS saída (%)", grupo: "Tributação", tipo: "percent", valor: (_p, a) => fracDe(param(a, "icms saída", "icms de saída", "alíquota interna", "débito de icms")) },
  { chave: "st", rotulo: "ICMS-ST?", grupo: "Tributação", tipo: "texto", valor: (_p, a) => { const v = param(a, "substituição tributária", "sujeito a st", "st"); return v ?? ""; } },
  { chave: "mva", rotulo: "MVA (%)", grupo: "Tributação", tipo: "percent", valor: (_p, a) => fracDe(param(a, "mva", "margem de valor agregado")) },
  { chave: "monofasico", rotulo: "PIS/COFINS monofásico?", grupo: "Tributação", tipo: "texto", valor: (_p, a) => param(a, "monofás", "monofas") ?? "" },
  { chave: "pis_cofins", rotulo: "Regime PIS/COFINS", grupo: "Tributação", tipo: "texto", valor: (_p, a) => param(a, "pis/cofins", "pis e cofins", "pis cofins") ?? "" },

  // Situação / auditoria
  { chave: "status", rotulo: "Status da análise", grupo: "Situação", tipo: "texto", valor: (_p, a) => a?.status ?? "sem análise" },
  { chave: "pendencias", rotulo: "Pendências (nº)", grupo: "Situação", tipo: "inteiro", valor: (_p, a) => a?.pendencias?.length ?? 0 },
  { chave: "verificado_em", rotulo: "Legislação verificada em", grupo: "Situação", tipo: "texto", valor: (_p, a) => a?.data_verificacao_legislativa ?? "" },
  { chave: "analisado_em", rotulo: "Analisado em", grupo: "Situação", tipo: "texto", valor: (p) => (p.analise_em ? String(p.analise_em).slice(0, 10) : "") },
];

const porChave = (ch: string) => CATALOGO.find((c) => c.chave === ch);

/* ---------- PRESETS de layout ---------- */

export type Preset = { id: string; nome: string; descricao: string; colunas: string[] };

export const PRESETS: Preset[] = [
  {
    id: "formacao_preco",
    nome: "Formação de preço (modelo completo)",
    descricao: "Espelha a planilha de formação de preço do cliente: identificação + custos + tributos + preço.",
    colunas: ["descricao", "ncm", "cest", "custo_nf", "aliq_entrada", "creditos", "custo_liquido", "markup", "aliq_saida", "st", "carga_saida", "margem", "preco_venda", "status"],
  },
  {
    id: "enxuto",
    nome: "Enxuto (preço final)",
    descricao: "Só o essencial para conferência rápida de preço.",
    colunas: ["descricao", "ncm", "custo_nf", "markup", "preco_venda", "margem"],
  },
  {
    id: "tributacao",
    nome: "Tributário (memória de cálculo)",
    descricao: "Foco nos parâmetros fiscais aplicados por produto (ICMS, ST, MVA, PIS/COFINS).",
    colunas: ["descricao", "ncm", "cest", "aliq_entrada", "aliq_saida", "st", "mva", "monofasico", "pis_cofins", "carga_saida", "status", "pendencias"],
  },
  {
    id: "completo",
    nome: "Tudo (todas as colunas)",
    descricao: "Todas as informações disponíveis, uma coluna por campo.",
    colunas: CATALOGO.map((c) => c.chave),
  },
];

/* ---------- Formatos de célula ---------- */

const FMT: Record<TipoColuna, string | undefined> = {
  moeda: "R$ #,##0.00",
  percent: "0.0%",
  inteiro: "#,##0",
  numero: "#,##0.00",
  texto: undefined,
};

export type CabecalhoRelatorio = {
  cliente?: string | null;
  cnpj?: string | null;
  uf?: string | null;
  regime?: string | null;
  emitidoEm?: string | null; // ISO; se ausente, sem data (ambiente sem clock)
  titulo?: string | null;
};

/**
 * Gera o XLSX do relatório personalizado.
 * @param produtos linhas
 * @param colunasSel chaves das colunas escolhidas, NA ORDEM desejada
 * @param cab cabeçalho (cliente/emissão)
 */
export function gerarRelatorioXlsx(produtos: Produto[], colunasSel: string[], cab: CabecalhoRelatorio = {}) {
  const cols = colunasSel.map(porChave).filter((c): c is ColunaRelatorio => !!c);
  if (!cols.length) throw new Error("Selecione ao menos uma coluna.");

  const wb = XLSX.utils.book_new();
  const aoa: (string | number | null)[][] = [];

  // Banda de cabeçalho (institucional). Sem cor (xlsx community ignora estilo),
  // mas com título e metadados — layout limpo e identificável.
  const titulo = cab.titulo || "Masor — Relatório de formação de preço";
  aoa.push([titulo]);
  const metaLinha = [
    cab.cliente ? `Cliente: ${cab.cliente}` : null,
    cab.cnpj ? `CNPJ: ${cab.cnpj}` : null,
    cab.uf ? `UF: ${cab.uf}` : null,
    cab.regime ? `Regime: ${cab.regime}` : null,
    cab.emitidoEm ? `Emitido em: ${String(cab.emitidoEm).slice(0, 10)}` : null,
    `Produtos: ${produtos.length}`,
  ].filter(Boolean) as string[];
  aoa.push([metaLinha.join("   ·   ")]);
  aoa.push([]); // linha em branco

  const linhaCabecalho = aoa.length; // índice (0-based) da linha de títulos das colunas
  aoa.push(cols.map((c) => c.rotulo));

  // Dados
  for (const p of produtos) {
    const a = (p.analise ?? null) as AnaliseParcial;
    aoa.push(cols.map((c) => c.valor(p, a)));
  }

  // Linha de TOTAIS (só nas colunas somáveis de moeda)
  const temSomavel = cols.some((c) => c.somavel);
  if (temSomavel && produtos.length > 1) {
    aoa.push([]);
    const totalRow: (string | number | null)[] = cols.map((c, i) => {
      if (i === 0) return "TOTAL";
      if (!c.somavel) return null;
      const soma = produtos.reduce((s, p) => {
        const v = c.valor(p, (p.analise ?? null) as AnaliseParcial);
        return s + (typeof v === "number" ? v : 0);
      }, 0);
      return Math.round(soma * 100) / 100;
    });
    aoa.push(totalRow);
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Formatos de célula por coluna (a partir da 1ª linha de dados)
  const primeiraDados = linhaCabecalho + 1;
  for (let r = primeiraDados; r < aoa.length; r++) {
    cols.forEach((c, ci) => {
      const fmt = FMT[c.tipo];
      if (!fmt) return;
      const ref = XLSX.utils.encode_cell({ r, c: ci });
      const cell = ws[ref];
      if (cell && typeof cell.v === "number") cell.z = fmt;
    });
  }

  // Larguras: rótulo vs. conteúdo (texto largo p/ descrição, médio p/ números)
  ws["!cols"] = cols.map((c) => {
    if (c.tipo === "texto") return { wch: c.chave === "descricao" ? 42 : Math.max(14, c.rotulo.length + 2) };
    return { wch: Math.max(13, c.rotulo.length + 2) };
  });

  // Mesclar a banda de título nas colunas
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: cols.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: cols.length - 1 } },
  ];

  // Congelar cabeçalho + filtro automático na tabela
  ws["!freeze"] = { xSplit: 0, ySplit: linhaCabecalho + 1, topLeftCell: XLSX.utils.encode_cell({ r: linhaCabecalho + 1, c: 0 }), activePane: "bottomLeft", state: "frozen" };
  const ultimaDados = primeiraDados + produtos.length - 1;
  ws["!autofilter"] = { ref: `${XLSX.utils.encode_cell({ r: linhaCabecalho, c: 0 })}:${XLSX.utils.encode_cell({ r: ultimaDados, c: cols.length - 1 })}` };

  XLSX.utils.book_append_sheet(wb, ws, "Relatório");

  const slug = (cab.cliente ?? "masor")
    .toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).toLowerCase();
  const dia = (cab.emitidoEm ? String(cab.emitidoEm).slice(0, 10) : "").replace(/-/g, "");
  XLSX.writeFile(wb, `masor-relatorio-${slug || "produtos"}${dia ? "-" + dia : ""}.xlsx`);
}
