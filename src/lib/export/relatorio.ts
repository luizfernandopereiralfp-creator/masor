import ExcelJS from "exceljs";

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

/* ---------- Formatos de célula (numFmt do Excel) ---------- */

const FMT: Record<TipoColuna, string | undefined> = {
  moeda: '"R$" #,##0.00',
  percent: "0.0%",
  inteiro: "#,##0",
  numero: "#,##0.00",
  texto: undefined,
};

/* ---------- Paleta da marca (igual ao PDF) ---------- */
const C = {
  navy: "FF0B1740",
  amber: "FFE9A74A",
  white: "FFFFFFFF",
  ink: "FF14203F",
  amberSoft: "FFFDEFD5",
  metaBg: "FFF6F8FB",
  metaInk: "FF6B7488",
  zebra: "FFF9FAFB",
  border: "FFE2E8F0",
};

const bordaFina: Partial<ExcelJS.Borders> = {
  bottom: { style: "thin", color: { argb: C.border } },
  right: { style: "thin", color: { argb: C.border } },
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
 * Gera o XLSX do relatório personalizado, com cabeçalho pintado na cor da marca
 * (navy + âmbar, igual ao PDF). Dispara o download no navegador.
 * @param produtos linhas
 * @param colunasSel chaves das colunas escolhidas, NA ORDEM desejada
 * @param cab cabeçalho (cliente/emissão)
 */
export async function gerarRelatorioXlsx(produtos: Produto[], colunasSel: string[], cab: CabecalhoRelatorio = {}) {
  const cols = colunasSel.map(porChave).filter((c): c is ColunaRelatorio => !!c);
  if (!cols.length) throw new Error("Selecione ao menos uma coluna.");
  const nc = cols.length;

  const wb = new ExcelJS.Workbook();
  wb.creator = "Masor — G41 Inteligência Contábil";
  const ws = wb.addWorksheet("Relatório", { views: [{ state: "frozen", ySplit: 4 }] });

  // Larguras
  cols.forEach((c, i) => {
    ws.getColumn(i + 1).width = c.tipo === "texto" ? (c.chave === "descricao" ? 44 : Math.max(15, c.rotulo.length + 2)) : Math.max(13, c.rotulo.length + 2);
  });

  // --- Linha 1: banda de título (navy + âmbar) ---
  ws.mergeCells(1, 1, 1, nc);
  const t1 = ws.getCell(1, 1);
  t1.value = cab.titulo || "Masor — Relatório de formação de preço";
  t1.font = { bold: true, size: 14, color: { argb: C.amber } };
  t1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.navy } };
  t1.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  ws.getRow(1).height = 30;

  // --- Linha 2: metadados (fundo claro) ---
  ws.mergeCells(2, 1, 2, nc);
  const meta = [
    cab.cliente ? `Cliente: ${cab.cliente}` : null,
    cab.cnpj ? `CNPJ: ${cab.cnpj}` : null,
    cab.uf ? `UF: ${cab.uf}` : null,
    cab.regime ? `Regime: ${cab.regime}` : null,
    cab.emitidoEm ? `Emitido em: ${String(cab.emitidoEm).slice(0, 10)}` : null,
    `Produtos: ${produtos.length}`,
  ].filter(Boolean).join("   ·   ");
  const t2 = ws.getCell(2, 1);
  t2.value = meta;
  t2.font = { size: 10, color: { argb: C.metaInk } };
  t2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.metaBg } };
  t2.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  ws.getRow(2).height = 20;

  // Linha 3 em branco (fina)
  ws.getRow(3).height = 6;

  // --- Linha 4: cabeçalho das colunas (navy, texto branco) ---
  const hdr = ws.getRow(4);
  cols.forEach((c, i) => {
    const cell = hdr.getCell(i + 1);
    cell.value = c.rotulo;
    cell.font = { bold: true, size: 10, color: { argb: C.white } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.navy } };
    cell.alignment = { vertical: "middle", horizontal: c.tipo === "texto" ? "left" : "center", wrapText: true, indent: c.tipo === "texto" ? 1 : 0 };
    cell.border = { bottom: { style: "medium", color: { argb: C.amber } } };
  });
  hdr.height = 26;

  // --- Dados ---
  produtos.forEach((p, ri) => {
    const a = (p.analise ?? null) as AnaliseParcial;
    const row = ws.getRow(5 + ri);
    const zebra = ri % 2 === 1;
    cols.forEach((c, i) => {
      const cell = row.getCell(i + 1);
      const v = c.valor(p, a);
      cell.value = v == null ? "" : v;
      const fmt = FMT[c.tipo];
      if (fmt && typeof v === "number") cell.numFmt = fmt;
      cell.font = { size: 10, color: { argb: C.ink } };
      cell.alignment = { vertical: "middle", horizontal: c.tipo === "texto" ? "left" : "right", indent: c.tipo === "texto" ? 1 : 0 };
      cell.border = bordaFina;
      if (zebra) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.zebra } };
    });
  });

  // --- Linha de TOTAIS (colunas somáveis) ---
  const temSomavel = cols.some((c) => c.somavel);
  if (temSomavel && produtos.length > 1) {
    const tr = ws.getRow(5 + produtos.length);
    cols.forEach((c, i) => {
      const cell = tr.getCell(i + 1);
      if (i === 0) cell.value = "TOTAL";
      else if (c.somavel) {
        const soma = produtos.reduce((s, p) => {
          const v = c.valor(p, (p.analise ?? null) as AnaliseParcial);
          return s + (typeof v === "number" ? v : 0);
        }, 0);
        cell.value = Math.round(soma * 100) / 100;
        const fmt = FMT[c.tipo];
        if (fmt) cell.numFmt = fmt;
      }
      cell.font = { bold: true, size: 10, color: { argb: C.navy } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.amberSoft } };
      cell.alignment = { vertical: "middle", horizontal: c.tipo === "texto" ? "left" : "right", indent: c.tipo === "texto" ? 1 : 0 };
    });
    tr.height = 20;
  }

  // Filtro automático na tabela
  ws.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4 + produtos.length, column: nc } };

  // Download no navegador
  const buf = await wb.xlsx.writeBuffer();
  const slug = (cab.cliente ?? "masor")
    .toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).toLowerCase();
  const dia = (cab.emitidoEm ? String(cab.emitidoEm).slice(0, 10) : "").replace(/-/g, "");
  const nome = `masor-relatorio-${slug || "produtos"}${dia ? "-" + dia : ""}.xlsx`;
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
