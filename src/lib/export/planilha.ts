import * as XLSX from "xlsx";

import type { AnaliseFiscal } from "@/lib/ia/contrato";

/* ============================================================
   Masor — geração de planilhas (XLSX) a partir das análises.
   Client-side (usa a lib xlsx já presente). Cada exportação vira
   um arquivo com abas didáticas: Resumo, Formação de preço,
   Memória de cálculo, Parâmetros (com fonte) e Fundamentação.
   Números saem como número (planilha utilizável), não texto.
   ============================================================ */

export type MetaProduto = {
  produto?: string | null;
  ncm?: string | null;
  uf?: string | null;
  regime?: string | null;
  data?: string | null;
};

const nomeArquivo = (base: string, meta?: MetaProduto) => {
  const slug = (meta?.produto ?? "analise")
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .toLowerCase();
  return `masor-${base}-${slug || "produto"}.xlsx`;
};

const pct = (v: number | null | undefined) => (v == null ? null : v * 100);

/** Uma aba a partir de matriz (array de arrays). Aplica largura básica. */
function aba(wb: XLSX.WorkBook, nome: string, linhas: (string | number | null)[][]) {
  const ws = XLSX.utils.aoa_to_sheet(linhas);
  const largura = linhas.reduce<number[]>((acc, row) => {
    row.forEach((c, i) => {
      const len = c == null ? 0 : String(c).length;
      acc[i] = Math.max(acc[i] ?? 10, Math.min(60, len + 2));
    });
    return acc;
  }, []);
  ws["!cols"] = largura.map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws, nome.slice(0, 31));
}

/** Exporta UMA análise fiscal (resultado da consulta) como planilha multi-aba. */
export function exportarAnaliseXlsx(a: AnaliseFiscal, meta?: MetaProduto) {
  const wb = XLSX.utils.book_new();
  const fp = a.formacao_preco;

  aba(wb, "Resumo", [
    ["Masor — Inteligência Tributária"],
    ["Produto", meta?.produto ?? "—"],
    ["NCM", meta?.ncm ?? "—"],
    ["UF (destino)", meta?.uf ?? a.uf_supermercado ?? "—"],
    ["Regime", meta?.regime ?? "—"],
    ["Status", a.status],
    ["Verificação legislativa", a.data_verificacao_legislativa ?? meta?.data ?? "—"],
    [],
    ["Preço mínimo de venda (R$)", fp.preco_venda_sugerido],
    ["Custo tributário líquido (R$)", fp.custo_tributario_liquido],
    ["Carga de saída (%)", pct(fp.debitos_saida_percent)],
    ["Margem estimada (%)", pct(fp.margem_estimada_percent)],
    [],
    ["Resumo executivo", a.resumo_executivo ?? ""],
    ["Tratamento tributário atual", a.tratamento_atual ?? ""],
    ["Impactos da Reforma", a.impactos_reforma ?? ""],
  ]);

  aba(wb, "Formação de preço", [
    ["Componente", "Valor (R$)"],
    ["Custo de aquisição", fp.custo_aquisicao],
    ["Frete e despesas", fp.frete_despesas],
    ["Créditos tributários (−)", fp.creditos_tributarios],
    ["Custo tributário líquido", fp.custo_tributario_liquido],
    ["Markup aplicado (%)", pct(fp.markup_percent)],
    ["Margem estimada (%)", pct(fp.margem_estimada_percent)],
    ["Carga de saída (%)", pct(fp.debitos_saida_percent)],
    ["PREÇO MÍNIMO DE VENDA", fp.preco_venda_sugerido],
  ]);

  if (a.memoria_calculo.length)
    aba(wb, "Memória de cálculo", [
      ["Passo", "Fórmula", "Resultado", "Unidade"],
      ...a.memoria_calculo.map((p) => [
        p.rotulo,
        p.formula ?? "",
        p.unidade === "%" ? pct(p.resultado) : p.resultado,
        p.unidade,
      ]),
    ]);

  if (a.parametros_aplicados.length)
    aba(wb, "Parâmetros (fonte)", [
      ["Parâmetro", "Valor", "Confirmado?", "Fonte"],
      ...a.parametros_aplicados.map((p) => [
        p.rotulo,
        p.valor,
        p.confirmado ? "sim" : "A CONFIRMAR",
        p.fonte_url ?? "",
      ]),
    ]);

  if (a.fundamentacao_legal.length)
    aba(wb, "Fundamentação legal", [
      ["Norma", "Artigo", "Órgão", "Vigência", "Afirmação", "Fonte"],
      ...a.fundamentacao_legal.map((f) => [
        f.norma,
        f.artigo ?? "",
        f.orgao ?? "",
        f.vigencia ?? "",
        f.afirmacao,
        f.url ?? "",
      ]),
    ]);

  if (a.pendencias.length)
    aba(wb, "Pendências", [
      ["Campo", "Motivo"],
      ...a.pendencias.map((p) => [p.campo, p.motivo]),
    ]);

  if (a.fontes_oficiais.length)
    aba(wb, "Fontes", [
      ["Título", "URL"],
      ...a.fontes_oficiais.map((f) => [f.titulo ?? f.url, f.url]),
    ]);

  XLSX.writeFile(wb, nomeArquivo("analise", meta));
}

/** Linha do histórico (product_simulations) — forma tolerante. */
export type LinhaHistorico = {
  criado_em?: string | null;
  origem?: string | null;
  payload?: Record<string, unknown> | null;
  analise?: AnaliseFiscal | null;
};

/** Exporta o histórico do tenant como uma planilha (uma linha por análise). */
export function exportarHistoricoXlsx(linhas: LinhaHistorico[]) {
  const wb = XLSX.utils.book_new();
  aba(wb, "Histórico", [
    ["Data", "Origem", "Produto", "NCM", "UF", "Status", "Custo líquido (R$)", "Preço mínimo (R$)", "Margem (%)"],
    ...linhas.map((l) => {
      const p = l.payload ?? {};
      const fp = l.analise?.formacao_preco;
      return [
        l.criado_em ? String(l.criado_em).slice(0, 19).replace("T", " ") : "",
        l.origem ?? "",
        (p.produto_descricao as string) ?? "",
        (p.ncm as string) ?? "",
        (p.uf_supermercado as string) ?? "",
        l.analise?.status ?? "",
        fp?.custo_tributario_liquido ?? null,
        fp?.preco_venda_sugerido ?? null,
        pct(fp?.margem_estimada_percent),
      ];
    }),
  ]);
  XLSX.writeFile(wb, `masor-historico-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
