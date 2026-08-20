import ExcelJS from "exceljs";

import type { AnaliseFiscal } from "@/lib/ia/contrato";

/* ============================================================
   Masor — geração de planilhas (XLSX) a partir das análises.
   Client-side, via exceljs (estilo real: cabeçalho na cor da
   marca, formatos de moeda/%, larguras, congelamento). Cada
   exportação vira um arquivo com abas didáticas: Resumo, Formação
   de preço, Memória de cálculo, Parâmetros (com fonte) e
   Fundamentação. Números saem como número (planilha utilizável).
   ============================================================ */

export type MetaProduto = {
  produto?: string | null;
  ncm?: string | null;
  uf?: string | null;
  regime?: string | null;
  data?: string | null;
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
  border: "FFE2E8F0",
};
const BRL = '"R$" #,##0.00';
const PCT = "0.0%";

const bordaFina: Partial<ExcelJS.Borders> = {
  bottom: { style: "thin", color: { argb: C.border } },
  right: { style: "thin", color: { argb: C.border } },
};

const nomeArquivo = (base: string, meta?: MetaProduto) => {
  const slug = (meta?.produto ?? "analise")
    .toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).toLowerCase();
  return `masor-${base}-${slug || "produto"}.xlsx`;
};

const pct = (v: number | null | undefined) => (v == null ? null : v); // fração; formato 0.0% cuida do ×100

/** Faz o download do workbook no navegador (via Blob). */
async function baixar(wb: ExcelJS.Workbook, nome: string) {
  const buf = await wb.xlsx.writeBuffer();
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

type Celula = string | number | null;

/** Banda de título navy + linha de metadados. Devolve a próxima linha livre. */
function bandaTitulo(ws: ExcelJS.Worksheet, nc: number, titulo: string, meta?: string): number {
  ws.mergeCells(1, 1, 1, Math.max(nc, 1));
  const t = ws.getCell(1, 1);
  t.value = titulo;
  t.font = { bold: true, size: 13, color: { argb: C.amber } };
  t.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.navy } };
  t.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  ws.getRow(1).height = 26;
  if (meta) {
    ws.mergeCells(2, 1, 2, Math.max(nc, 1));
    const m = ws.getCell(2, 1);
    m.value = meta;
    m.font = { size: 9, color: { argb: C.metaInk } };
    m.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.metaBg } };
    m.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    ws.getRow(2).height = 18;
    ws.getRow(3).height = 5;
    return 4;
  }
  ws.getRow(2).height = 5;
  return 3;
}

/** Escreve uma tabela estilizada (cabeçalho navy) a partir de `linha0`. `fmt` mapeia coluna→numFmt. */
function tabela(ws: ExcelJS.Worksheet, linha0: number, header: string[], linhas: Celula[][], fmt: Record<number, string> = {}, larguras: number[] = []) {
  const hdr = ws.getRow(linha0);
  header.forEach((h, i) => {
    const cell = hdr.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, size: 9.5, color: { argb: C.white } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.navy } };
    cell.alignment = { vertical: "middle", horizontal: i === 0 ? "left" : "center", wrapText: true, indent: i === 0 ? 1 : 0 };
    cell.border = { bottom: { style: "medium", color: { argb: C.amber } } };
  });
  hdr.height = 20;
  linhas.forEach((row, ri) => {
    const r = ws.getRow(linha0 + 1 + ri);
    row.forEach((v, i) => {
      const cell = r.getCell(i + 1);
      cell.value = v == null ? "" : v;
      if (fmt[i] && typeof v === "number") cell.numFmt = fmt[i];
      cell.font = { size: 9.5, color: { argb: C.ink } };
      cell.alignment = { vertical: "middle", horizontal: i === 0 ? "left" : "right", indent: i === 0 ? 1 : 0 };
      cell.border = bordaFina;
    });
  });
  header.forEach((h, i) => {
    ws.getColumn(i + 1).width = larguras[i] ?? Math.max(14, h.length + 2);
  });
}

const FP_VAZIO: AnaliseFiscal["formacao_preco"] = {
  custo_aquisicao: null, frete_despesas: null, creditos_tributarios: null,
  debitos_saida_percent: null, custo_tributario_liquido: null, markup_percent: null,
  margem_estimada_percent: null, preco_venda_sugerido: null, formulas: [],
};

/** Monta o workbook da análise (puro — sem browser). Exposto p/ teste. */
export function montarWorkbookAnalise(a: AnaliseFiscal, meta?: MetaProduto): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Masor — G41 Inteligência Contábil";
  const fp = a.formacao_preco ?? FP_VAZIO;
  const metaLinha = [
    meta?.produto ? `Produto: ${meta.produto}` : null,
    meta?.ncm ? `NCM: ${meta.ncm}` : null,
    meta?.uf ? `UF: ${meta.uf}` : null,
    meta?.regime ? `Regime: ${meta.regime}` : null,
    a.data_verificacao_legislativa || meta?.data ? `Verificação: ${a.data_verificacao_legislativa || meta?.data}` : null,
    `Status: ${a.status}`,
  ].filter(Boolean).join("   ·   ");

  // ---- Resumo ----
  {
    const ws = wb.addWorksheet("Resumo", { views: [{ state: "frozen", ySplit: 4 }] });
    ws.getColumn(1).width = 34;
    ws.getColumn(2).width = 22;
    const l0 = bandaTitulo(ws, 2, "Masor — Parecer fiscal do produto", metaLinha);
    const kv: [string, Celula, string?][] = [
      ["Preço mínimo de venda", fp.preco_venda_sugerido, BRL],
      ["Custo tributário líquido", fp.custo_tributario_liquido, BRL],
      ["Custo de aquisição", fp.custo_aquisicao, BRL],
      ["Créditos tributários (−)", fp.creditos_tributarios, BRL],
      ["Margem estimada", pct(fp.margem_estimada_percent), PCT],
      ["Carga de saída", pct(fp.debitos_saida_percent), PCT],
    ];
    kv.forEach(([rot, val, f], i) => {
      const r = ws.getRow(l0 + i);
      const c1 = r.getCell(1);
      c1.value = rot;
      c1.font = { size: 10, bold: i < 2, color: { argb: C.ink } };
      c1.alignment = { indent: 1, vertical: "middle" };
      c1.border = bordaFina;
      const c2 = r.getCell(2);
      c2.value = val == null ? "a confirmar" : val;
      if (f && typeof val === "number") c2.numFmt = f;
      c2.font = { size: i === 0 ? 12 : 10, bold: i < 2, color: { argb: C.navy } };
      c2.alignment = { horizontal: "right", vertical: "middle", indent: 1 };
      c2.border = bordaFina;
      if (i === 0) { c1.fill = c2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.amberSoft } }; r.height = 22; }
    });
    let ln = l0 + kv.length + 1;
    const texto = (rot: string, val?: string) => {
      if (!val) return;
      const r1 = ws.getRow(ln++);
      const t = r1.getCell(1);
      t.value = rot;
      t.font = { bold: true, size: 9.5, color: { argb: C.navy } };
      ws.mergeCells(ln, 1, ln, 2);
      const r2 = ws.getRow(ln++);
      const v = r2.getCell(1);
      v.value = val;
      v.alignment = { wrapText: true, vertical: "top" };
      v.font = { size: 9.5, color: { argb: C.ink } };
      r2.height = Math.min(120, 16 + Math.floor(val.length / 55) * 13);
      ln++;
    };
    texto("Resumo executivo", a.resumo_executivo);
    texto("Tratamento tributário atual", a.tratamento_atual);
    texto("Impactos da Reforma", a.impactos_reforma);
  }

  // ---- Formação de preço ----
  {
    const ws = wb.addWorksheet("Formação de preço", { views: [{ state: "frozen", ySplit: 2 }] });
    const l0 = bandaTitulo(ws, 2, "Formação de preço");
    tabela(ws, l0, ["Componente", "Valor"], [
      ["Custo de aquisição", fp.custo_aquisicao],
      ["Frete e despesas", fp.frete_despesas],
      ["Créditos tributários (−)", fp.creditos_tributarios],
      ["Custo tributário líquido", fp.custo_tributario_liquido],
      ["Markup aplicado", pct(fp.markup_percent)],
      ["Carga de saída", pct(fp.debitos_saida_percent)],
      ["Margem estimada", pct(fp.margem_estimada_percent)],
      ["PREÇO MÍNIMO DE VENDA", fp.preco_venda_sugerido],
    ], { 1: BRL }, [34, 20]);
    // formato % nas linhas de markup/carga/margem (5..7) e destaque no preço
    [5, 6, 7].forEach((ri) => { const c = ws.getRow(l0 + 1 + ri).getCell(2); if (typeof c.value === "number") c.numFmt = PCT; });
    const rp = ws.getRow(l0 + 1 + 8);
    rp.eachCell((c) => { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: C.amberSoft } }; c.font = { bold: true, color: { argb: C.navy }, size: 10 }; });
  }

  // ---- Memória de cálculo ----
  if (a.memoria_calculo?.length) {
    const ws = wb.addWorksheet("Memória de cálculo", { views: [{ state: "frozen", ySplit: 2 }] });
    const l0 = bandaTitulo(ws, 4, "Memória de cálculo");
    tabela(ws, l0, ["Passo", "Fórmula", "Resultado", "Un."],
      a.memoria_calculo.map((p) => [p.rotulo, p.formula ?? "", p.unidade === "%" ? pct(p.resultado) : p.resultado, p.unidade]),
      {}, [30, 34, 16, 8]);
    a.memoria_calculo.forEach((p, ri) => {
      const c = ws.getRow(l0 + 1 + ri).getCell(3);
      if (typeof c.value === "number") c.numFmt = p.unidade === "%" ? PCT : p.unidade === "BRL" ? BRL : "#,##0.00";
    });
  }

  // ---- Parâmetros aplicados (fonte) ----
  if (a.parametros_aplicados?.length) {
    const ws = wb.addWorksheet("Parâmetros (fonte)", { views: [{ state: "frozen", ySplit: 2 }] });
    const l0 = bandaTitulo(ws, 4, "Parâmetros aplicados (com fonte)");
    tabela(ws, l0, ["Parâmetro", "Valor", "Confirmado?", "Fonte"],
      a.parametros_aplicados.map((p) => [p.rotulo, p.valor, p.confirmado ? "sim" : "A CONFIRMAR", p.fonte_url ?? ""]),
      {}, [32, 18, 14, 46]);
  }

  // ---- Fundamentação legal ----
  if (a.fundamentacao_legal?.length) {
    const ws = wb.addWorksheet("Fundamentação legal", { views: [{ state: "frozen", ySplit: 2 }] });
    const l0 = bandaTitulo(ws, 6, "Fundamentação legal");
    tabela(ws, l0, ["Norma", "Artigo", "Órgão", "Vigência", "Afirmação", "Fonte"],
      a.fundamentacao_legal.map((f) => [f.norma, f.artigo ?? "", f.orgao ?? "", f.vigencia ?? "", f.afirmacao, f.url ?? ""]),
      {}, [18, 12, 16, 14, 44, 40]);
  }

  // ---- Pendências ----
  if (a.pendencias?.length) {
    const ws = wb.addWorksheet("Pendências", { views: [{ state: "frozen", ySplit: 2 }] });
    const l0 = bandaTitulo(ws, 2, "Pendências (a confirmar em fonte oficial)");
    tabela(ws, l0, ["Campo", "Motivo"], a.pendencias.map((p) => [p.campo, p.motivo]), {}, [28, 60]);
  }

  // ---- Fontes ----
  if (a.fontes_oficiais?.length) {
    const ws = wb.addWorksheet("Fontes", { views: [{ state: "frozen", ySplit: 2 }] });
    const l0 = bandaTitulo(ws, 2, "Fontes oficiais consultadas");
    tabela(ws, l0, ["Título", "URL"], a.fontes_oficiais.map((f) => [f.titulo ?? f.url, f.url]), {}, [40, 60]);
  }

  return wb;
}

/** Exporta UMA análise fiscal (resultado da consulta) como planilha multi-aba estilizada. */
export async function exportarAnaliseXlsx(a: AnaliseFiscal, meta?: MetaProduto) {
  await baixar(montarWorkbookAnalise(a, meta), nomeArquivo("analise", meta));
}

/** Linha do histórico (product_simulations) — forma tolerante. */
export type LinhaHistorico = {
  criado_em?: string | null;
  origem?: string | null;
  payload?: Record<string, unknown> | null;
  analise?: AnaliseFiscal | null;
};

/** Monta o workbook do histórico (puro — sem browser). Exposto p/ teste. */
export function montarWorkbookHistorico(linhas: LinhaHistorico[]): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Masor — G41 Inteligência Contábil";
  const ws = wb.addWorksheet("Histórico", { views: [{ state: "frozen", ySplit: 4 }] });
  const header = ["Data", "Origem", "Produto", "NCM", "UF", "Status", "Custo líquido (R$)", "Preço mínimo (R$)", "Margem (%)"];
  const l0 = bandaTitulo(ws, header.length, "Masor — Histórico de análises", `Análises: ${linhas.length}`);
  const rows: Celula[][] = linhas.map((l) => {
    const p = l.payload ?? {};
    const fp = l.analise?.formacao_preco;
    return [
      l.criado_em ? String(l.criado_em).slice(0, 19).replace("T", " ") : "",
      l.origem === "importacao" ? "NF-e" : l.origem ?? "",
      (p.produto_descricao as string) ?? "",
      (p.ncm as string) ?? "",
      (p.uf_supermercado as string) ?? "",
      l.analise?.status ?? "",
      fp?.custo_tributario_liquido ?? null,
      fp?.preco_venda_sugerido ?? null,
      pct(fp?.margem_estimada_percent),
    ];
  });
  tabela(ws, l0, header, rows, { 6: BRL, 7: BRL, 8: PCT }, [18, 10, 40, 12, 6, 13, 15, 15, 11]);
  ws.autoFilter = { from: { row: l0, column: 1 }, to: { row: l0 + rows.length, column: header.length } };
  return wb;
}

/** Exporta o histórico do tenant como uma planilha estilizada (uma linha por análise). */
export async function exportarHistoricoXlsx(linhas: LinhaHistorico[]) {
  await baixar(montarWorkbookHistorico(linhas), `masor-historico-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
