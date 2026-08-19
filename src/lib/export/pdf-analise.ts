import type { TDocumentDefinitions, Content, TableCell } from "pdfmake/interfaces";

import type { AnaliseFiscal } from "@/lib/ia/contrato";
import type { MetaProduto } from "@/lib/export/planilha";

/* ============================================================
   Masor — PDF do RESULTADO DA ANÁLISE (parecer fiscal).
   Client-side, via pdfmake (carregado sob demanda no clique).
   Layout com a identidade da marca (navy + âmbar), mesmas seções
   do relatório da tela: números em evidência, formação de preço,
   memória de cálculo, parâmetros (com fonte), fundamentação legal,
   pendências e fontes. Anti-invenção: número não confirmado sai
   como "a confirmar", nunca inventado.
   ============================================================ */

const NAVY = "#0B1740";
const AMBER = "#E9A74A";
const INK = "#14203F";
const MUTED = "#6B7488";
const AMBER_SOFT = "#FDEFD5";
const LINE = "#E2E8F0";
const SUCCESS = "#1F9D55";

const brl = (v: number | null | undefined) =>
  v == null ? "a confirmar" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
const pct = (v: number | null | undefined) => (v == null ? "a confirmar" : `${(v * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`);

/** Título de seção (barra âmbar + texto navy). */
const secao = (titulo: string): Content => ({
  table: { widths: ["*"], body: [[{ text: titulo, bold: true, color: NAVY, fontSize: 11, margin: [0, 2, 0, 2] }]] },
  layout: {
    hLineWidth: () => 0,
    vLineWidth: (i: number) => (i === 0 ? 3 : 0),
    vLineColor: () => AMBER,
    paddingLeft: () => 6,
    paddingTop: () => 2,
    paddingBottom: () => 2,
  },
  margin: [0, 10, 0, 4],
});

/** Cabeçalho de tabela (linha navy, texto branco). */
const th = (t: string): TableCell => ({ text: t, bold: true, color: "#fff", fillColor: NAVY, fontSize: 8.5, margin: [2, 3, 2, 3] });

export async function gerarPdfAnalise(a: AnaliseFiscal, meta: MetaProduto = {}) {
  const fp = a.formacao_preco;
  const statusLabel = a.status === "aprovado" ? "Aprovado" : a.status === "com_ressalvas" ? "Com ressalvas" : "Provisório";
  const statusCor = a.status === "aprovado" ? SUCCESS : AMBER;

  const content: Content[] = [];

  // --- Banda de título (navy + âmbar) ---
  content.push({
    table: {
      widths: ["*", "auto"],
      body: [
        [
          { text: "Masor — Parecer fiscal do produto", color: AMBER, bold: true, fontSize: 15, margin: [8, 8, 0, 2] },
          { text: statusLabel, color: NAVY, fillColor: statusCor === SUCCESS ? "#D8F3E3" : AMBER_SOFT, bold: true, fontSize: 9, alignment: "center", margin: [8, 10, 8, 0] },
        ],
        [
          {
            text: [
              meta.produto ? { text: `${meta.produto}` } : { text: "Produto —" },
              meta.ncm ? { text: `   ·   NCM ${meta.ncm}`, color: "#C7CEDE" } : "",
              meta.uf ? { text: `   ·   UF ${meta.uf}`, color: "#C7CEDE" } : "",
              meta.regime ? { text: `   ·   ${meta.regime}`, color: "#C7CEDE" } : "",
            ],
            color: "#fff",
            fontSize: 9,
            margin: [8, 0, 8, 8],
            colSpan: 2,
          },
          {},
        ],
      ],
    },
    layout: { hLineWidth: () => 0, vLineWidth: () => 0, fillColor: () => NAVY },
    margin: [0, 0, 0, 6],
  });

  // --- Números em evidência ---
  const kpi = (rot: string, val: string, destaque = false): TableCell => ({
    stack: [
      { text: rot, color: MUTED, fontSize: 7.5, margin: [0, 0, 0, 2] },
      { text: val, color: destaque ? NAVY : INK, bold: true, fontSize: destaque ? 13 : 11 },
    ],
    fillColor: destaque ? AMBER_SOFT : "#F6F8FB",
    margin: [6, 6, 6, 6],
  });
  content.push({
    table: {
      widths: ["*", "*", "*", "*"],
      body: [[
        kpi("Preço mínimo de venda", brl(fp.preco_venda_sugerido), true),
        kpi("Custo tributário líquido", brl(fp.custo_tributario_liquido)),
        kpi("Margem estimada", pct(fp.margem_estimada_percent)),
        kpi("Carga de saída", pct(fp.debitos_saida_percent)),
      ]],
    },
    layout: { hLineWidth: () => 0, vLineWidth: () => 4, vLineColor: () => "#fff" },
  });

  // --- Resumo executivo ---
  if (a.resumo_executivo) {
    content.push(secao("Resumo"));
    content.push({ text: a.resumo_executivo, fontSize: 9.5, color: INK, margin: [0, 0, 0, 2], lineHeight: 1.15 });
  }

  // --- Formação de preço ---
  content.push(secao("Formação de preço"));
  content.push({
    table: {
      widths: ["*", "auto"],
      body: [
        [th("Componente"), th("Valor")],
        ["Custo de aquisição", brl(fp.custo_aquisicao)],
        ["Frete e despesas", brl(fp.frete_despesas)],
        ["Créditos tributários (−)", brl(fp.creditos_tributarios)],
        ["Custo tributário líquido", brl(fp.custo_tributario_liquido)],
        ["Markup aplicado", pct(fp.markup_percent)],
        ["Carga de saída", pct(fp.debitos_saida_percent)],
        [{ text: "PREÇO MÍNIMO DE VENDA", bold: true, fillColor: AMBER_SOFT }, { text: brl(fp.preco_venda_sugerido), bold: true, fillColor: AMBER_SOFT }],
      ].map((r) => r.map((c) => (typeof c === "string" ? { text: c, fontSize: 9, margin: [2, 2, 2, 2] } : c))) as TableCell[][],
    },
    layout: linhaFina(),
  });
  if (fp.formulas?.length)
    content.push({ text: fp.formulas.map((f) => `• ${f}`).join("\n"), fontSize: 8, color: MUTED, margin: [0, 3, 0, 0] });

  // --- Memória de cálculo ---
  if (a.memoria_calculo?.length) {
    content.push(secao("Memória de cálculo"));
    content.push({
      table: {
        widths: ["*", "*", "auto"],
        body: [
          [th("Passo"), th("Fórmula"), th("Resultado")],
          ...a.memoria_calculo.map((p) => [
            cel(p.rotulo),
            cel(p.formula ?? "—"),
            cel(p.unidade === "%" ? pct(p.resultado) : p.unidade === "BRL" ? brl(p.resultado) : p.resultado == null ? "a confirmar" : String(p.resultado)),
          ]),
        ],
      },
      layout: linhaFina(),
    });
  }

  // --- Parâmetros aplicados (com fonte) ---
  if (a.parametros_aplicados?.length) {
    content.push(secao("Parâmetros aplicados (com fonte)"));
    content.push({
      table: {
        widths: ["*", "auto", "auto", "*"],
        body: [
          [th("Parâmetro"), th("Valor"), th("Confirmado?"), th("Fonte")],
          ...a.parametros_aplicados.map((p) => [
            cel(p.rotulo),
            cel(p.valor),
            { text: p.confirmado ? "sim" : "A CONFIRMAR", color: p.confirmado ? SUCCESS : "#B4791F", bold: !p.confirmado, fontSize: 8.5, margin: [2, 2, 2, 2] } as TableCell,
            p.fonte_url ? ({ text: p.fonte_url, link: p.fonte_url, color: "#1C5DBB", fontSize: 7.5, margin: [2, 2, 2, 2] } as TableCell) : cel("—"),
          ]),
        ],
      },
      layout: linhaFina(),
    });
  }

  // --- Fundamentação legal ---
  if (a.fundamentacao_legal?.length) {
    content.push(secao("Fundamentação legal"));
    content.push({
      table: {
        widths: ["auto", "auto", "auto", "*"],
        body: [
          [th("Norma"), th("Artigo"), th("Órgão"), th("Afirmação / fonte")],
          ...a.fundamentacao_legal.map((f) => [
            cel(f.norma || "—"),
            cel(f.artigo ?? "—"),
            cel([f.orgao, f.vigencia].filter(Boolean).join(" · ") || "—"),
            {
              stack: [
                { text: f.afirmacao || "—", fontSize: 8.5 },
                ...(f.url ? [{ text: f.url, link: f.url, color: "#1C5DBB", fontSize: 7 }] : []),
              ],
              margin: [2, 2, 2, 2],
            } as TableCell,
          ]),
        ],
      },
      layout: linhaFina(),
    });
  }

  // --- Pendências (anti-invenção) ---
  if (a.pendencias?.length) {
    content.push(secao("Pendências (a confirmar em fonte oficial)"));
    content.push({
      ul: a.pendencias.map((p) => ({ text: [{ text: `${p.campo}: `, bold: true }, p.motivo], fontSize: 8.5, color: INK })),
      margin: [0, 0, 0, 2],
    });
  }

  // --- Fontes oficiais ---
  if (a.fontes_oficiais?.length) {
    content.push(secao("Fontes oficiais consultadas"));
    content.push({
      ul: a.fontes_oficiais.map((f) => ({ text: f.titulo || f.url, link: f.url, color: "#1C5DBB", fontSize: 8 })),
      margin: [0, 0, 0, 2],
    });
  }

  const doc: TDocumentDefinitions = {
    pageSize: "A4",
    pageMargins: [32, 32, 32, 44],
    defaultStyle: { font: "Roboto", fontSize: 9, color: INK },
    content,
    footer: (page, total) => ({
      columns: [
        { text: "Masor — G41 Inteligência Contábil · inteligência tributária para supermercados", color: MUTED, fontSize: 7, margin: [32, 0, 0, 0] },
        { text: `${page}/${total}`, color: MUTED, fontSize: 7, alignment: "right", margin: [0, 0, 32, 0] },
      ],
    }),
  };

  // Carrega o pdfmake sob demanda (evita SSR e mantém o bundle inicial leve).
  const [{ default: pdfMake }, fontsMod] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ]);
  // A forma do export mudou entre versões do pdfmake:
  //  - 0.1/0.2: { pdfMake: { vfs } } (às vezes em `default`)
  //  - 0.3.x:  o `default` JÁ É o mapa de fontes ({ "Roboto-Regular.ttf": ... })
  const anyFonts = fontsMod as unknown as {
    default?: { pdfMake?: { vfs?: unknown }; vfs?: unknown } & Record<string, unknown>;
    pdfMake?: { vfs?: unknown };
    vfs?: unknown;
  } & Record<string, unknown>;
  const vfs =
    anyFonts.default?.pdfMake?.vfs ??
    anyFonts.pdfMake?.vfs ??
    anyFonts.default?.vfs ??
    anyFonts.vfs ??
    anyFonts.default ?? // 0.3.x: default é o próprio vfs
    anyFonts;
  (pdfMake as unknown as { vfs: unknown }).vfs = vfs;

  const slug = (meta.produto ?? "analise")
    .toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).toLowerCase();
  pdfMake.createPdf(doc).download(`masor-parecer-${slug || "produto"}.pdf`);
}

/* ---------- helpers ---------- */
function cel(t: string | number): TableCell {
  return { text: String(t), fontSize: 8.5, margin: [2, 2, 2, 2] };
}
function linhaFina() {
  return {
    hLineWidth: (i: number, node: { table: { body: unknown[] } }) => (i === 0 || i === 1 || i === node.table.body.length ? 0.7 : 0.3),
    vLineWidth: () => 0,
    hLineColor: () => LINE,
    paddingTop: () => 2,
    paddingBottom: () => 2,
    paddingLeft: () => 3,
    paddingRight: () => 3,
  };
}
