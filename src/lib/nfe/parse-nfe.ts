/* ============================================================
   Masor — Parser de NF-e (leiaute 4.00) + crítica estrutural
   Extrai cada item (prod + imposto) de forma DETERMINÍSTICA para
   alimentar a análise fiscal. A NF-e é a entrada mais confiável:
   NCM, CEST, CST, origem e valores já vêm estruturados.
   Parse client-side (DOMParser) no upload.
   ============================================================ */

export type NFeItem = {
  nItem: string;
  cProd: string | null;
  cEAN: string | null; // GTIN
  xProd: string | null; // descrição
  ncm: string | null;
  cest: string | null;
  cfop: string | null;
  uCom: string | null;
  qCom: number | null;
  vUnCom: number | null; // valor unitário
  vProd: number | null; // valor total do item
  vIPI: number | null;
  orig: string | null; // origem da mercadoria (0..8)
  cst_icms: string | null; // CST ou CSOSN de ICMS
  vICMSST: number | null;
  cst_pis: string | null;
  cst_cofins: string | null;
  criticas: string[]; // crítica estrutural (determinística)
};

export type NFeParsed = {
  ok: boolean;
  erro?: string;
  emit_uf: string | null;
  emit_nome: string | null;
  dest_uf: string | null;
  natOp: string | null;
  itens: NFeItem[];
};

const num = (s: string | null | undefined): number | null => {
  if (s == null || s === "") return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
};

/** primeiro texto de uma tag (local name) dentro de um elemento. */
function txt(el: Element | Document, tag: string): string | null {
  const found = el.getElementsByTagName(tag);
  return found.length ? (found[0].textContent?.trim() ?? null) : null;
}

/** UFs do Sul/Sudeste (exceto ES) recebem 12% na entrada interestadual. */
export const UF_SUL_SUDESTE = new Set(["PR", "SC", "RS", "SP", "RJ", "MG"]);

export function parseNFe(xml: string): NFeParsed {
  if (typeof DOMParser === "undefined")
    return { ok: false, erro: "Parser disponível apenas no navegador.", emit_uf: null, emit_nome: null, dest_uf: null, natOp: null, itens: [] };

  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(xml, "application/xml");
  } catch (e) {
    return { ok: false, erro: `XML inválido: ${(e as Error).message}`, emit_uf: null, emit_nome: null, dest_uf: null, natOp: null, itens: [] };
  }
  if (doc.getElementsByTagName("parsererror").length || !doc.getElementsByTagName("infNFe").length)
    return { ok: false, erro: "Não parece uma NF-e (infNFe não encontrado).", emit_uf: null, emit_nome: null, dest_uf: null, natOp: null, itens: [] };

  const emit = doc.getElementsByTagName("emit")[0];
  const dest = doc.getElementsByTagName("dest")[0];
  const emit_uf = emit ? txt(emit, "UF") : null;
  const dest_uf = dest ? txt(dest, "UF") : null;
  const emit_nome = emit ? txt(emit, "xNome") : null;
  const natOp = txt(doc, "natOp");

  const dets = Array.from(doc.getElementsByTagName("det"));
  const itens: NFeItem[] = dets.map((det) => {
    const prod = det.getElementsByTagName("prod")[0];
    const imposto = det.getElementsByTagName("imposto")[0];
    const icms = imposto?.getElementsByTagName("ICMS")[0];
    const icmsInner = icms?.children[0]; // ICMS00/10/60/CSOSN...
    const pis = imposto?.getElementsByTagName("PIS")[0]?.children[0];
    const cofins = imposto?.getElementsByTagName("COFINS")[0]?.children[0];
    const ipi = imposto?.getElementsByTagName("IPI")[0];

    const item: NFeItem = {
      nItem: det.getAttribute("nItem") ?? "",
      cProd: prod ? txt(prod, "cProd") : null,
      cEAN: prod ? txt(prod, "cEAN") : null,
      xProd: prod ? txt(prod, "xProd") : null,
      ncm: prod ? txt(prod, "NCM") : null,
      cest: prod ? txt(prod, "CEST") : null,
      cfop: prod ? txt(prod, "CFOP") : null,
      uCom: prod ? txt(prod, "uCom") : null,
      qCom: prod ? num(txt(prod, "qCom")) : null,
      vUnCom: prod ? num(txt(prod, "vUnCom")) : null,
      vProd: prod ? num(txt(prod, "vProd")) : null,
      vIPI: ipi ? num(txt(ipi, "vIPI")) : null,
      orig: icmsInner ? txt(icmsInner, "orig") : null,
      cst_icms: icmsInner ? txt(icmsInner, "CST") ?? txt(icmsInner, "CSOSN") : null,
      vICMSST: icmsInner ? num(txt(icmsInner, "vICMSST")) : null,
      cst_pis: pis ? txt(pis, "CST") : null,
      cst_cofins: cofins ? txt(cofins, "CST") : null,
      criticas: [],
    };

    // crítica estrutural determinística (sem IA)
    const c = item.criticas;
    if (!item.ncm || item.ncm.replace(/\D/g, "").length !== 8) c.push("NCM ausente ou fora do padrão de 8 dígitos.");
    if (item.cEAN === "SEM GTIN" || !item.cEAN) c.push("Produto sem GTIN/EAN — dificulta o cruzamento de regra por código de barras.");
    const cst = item.cst_icms ?? "";
    const temST = ["10", "30", "60", "70", "201", "202", "203", "500"].includes(cst);
    if (temST && !item.cest) c.push("CST/CSOSN indica ST, mas o item não trouxe CEST.");
    if (["1", "2", "3", "8"].includes(item.orig ?? "")) c.push("Mercadoria importada (origem " + item.orig + ") — verificar 4% (Res. 13/2012) e FCI.");
    if (cst === "60" || cst === "500") c.push("ICMS-ST já retido na cadeia (CST/CSOSN " + cst + "): valor cheio é custo, sem ICMS próprio na revenda.");
    return item;
  });

  return { ok: true, emit_uf, emit_nome, dest_uf, natOp, itens };
}

/** Mapeia um item de NF-e para o payload de operação da análise. */
export function itemParaOperacao(
  item: NFeItem,
  nfe: NFeParsed,
  base: { regime_empresa: string; markup_percent: string; municipio?: string },
): Record<string, unknown> {
  const importado = ["1", "2", "3", "8"].includes(item.orig ?? "");
  const mesmaUF = nfe.emit_uf && nfe.dest_uf && nfe.emit_uf === nfe.dest_uf;
  const origem = importado
    ? "importado"
    : mesmaUF
      ? "interna"
      : UF_SUL_SUDESTE.has(nfe.emit_uf ?? "")
        ? "sul_sudeste"
        : "n_ne_co_es";
  const cst = item.cst_icms ?? "";
  const stRetida = cst === "60" || cst === "500";
  const pis = item.cst_pis ?? "";
  const pis_cofins = ["04", "05"].includes(pis) ? "monofasico" : ["06", "07", "08", "09"].includes(pis) ? "zero" : "normal";

  return {
    uf_supermercado: nfe.dest_uf,
    municipio_supermercado: base.municipio ?? null,
    regime_empresa: base.regime_empresa,
    uf_fornecedor: nfe.emit_uf,
    regime_fornecedor: "normal",
    origem_mercadoria: origem,
    finalidade: "revenda",
    produto_descricao: item.xProd,
    gtin: item.cEAN && item.cEAN !== "SEM GTIN" ? item.cEAN : null,
    ncm: item.ncm,
    cest: item.cest,
    unidade: item.uCom,
    custo_nf: item.vUnCom != null ? String(item.vUnCom) : null,
    ipi: item.vIPI != null && item.qCom ? String(item.vIPI / item.qCom) : null,
    st_retida: stRetida,
    consta_lista_st: ["10", "30", "70", "201", "202", "203"].includes(cst),
    pis_cofins,
    markup_percent: base.markup_percent,
    tipo_margem: "venda",
  };
}
