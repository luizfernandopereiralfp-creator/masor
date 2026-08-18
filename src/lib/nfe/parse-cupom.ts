import { parseNFe } from "./parse-nfe";

/* ============================================================
   Masor — Parser de CUPOM FISCAL de SAÍDA (vendas do supermercado).
   Dois modelos:
   - NFC-e (mod 65): mesmo schema da NF-e (infNFe) → reusa parse-nfe.
   - CF-e-SAT (mod 59): schema próprio (infCFe) → parser dedicado aqui.
   Extrai o mínimo p/ a apuração de SAÍDA (débito): CFOP, NCM, vProd,
   vICMS próprio, CST/CSOSN, ST, CST de PIS/COFINS.
   Determinístico, client-side (DOMParser). Anti-invenção: só lê o XML.
   ============================================================ */

export type CupomItem = {
  cfop: string | null;
  ncm: string | null;
  xProd: string | null;
  qCom: number | null; // quantidade vendida
  vProd: number | null;
  vICMS: number | null; // ICMS próprio destacado (débito na saída)
  vICMSST: number | null;
  cst_icms: string | null; // CST ou CSOSN
  cst_pis: string | null;
  cst_cofins: string | null;
};

export type CupomParsed = {
  ok: boolean;
  erro?: string;
  modelo: "65" | "59" | null; // NFC-e | CF-e-SAT
  chave44: string | null;
  dhEmi: string | null;
  emit_cnpj: string | null;
  vTotal: number | null;
  itens: CupomItem[];
};

const num = (s: string | null | undefined): number | null => {
  if (s == null || s === "") return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
};
function txt(el: Element | Document, tag: string): string | null {
  const f = el.getElementsByTagName(tag);
  return f.length ? (f[0].textContent?.trim() ?? null) : null;
}

const vazio = (erro?: string): CupomParsed => ({
  ok: false,
  erro,
  modelo: null,
  chave44: null,
  dhEmi: null,
  emit_cnpj: null,
  vTotal: null,
  itens: [],
});

/** Roteia pelo tipo de documento: NFC-e (infNFe) x CF-e-SAT (infCFe). */
export function parseCupom(xml: string): CupomParsed {
  if (typeof DOMParser === "undefined") return vazio("Parser disponível apenas no navegador.");
  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(xml, "application/xml");
  } catch (e) {
    return vazio(`XML inválido: ${(e as Error).message}`);
  }
  if (doc.getElementsByTagName("parsererror").length) return vazio("XML inválido.");

  // CF-e-SAT (modelo 59)
  if (doc.getElementsByTagName("infCFe").length) return parseCFeSAT(doc);

  // NFC-e (modelo 65) — mesmo schema da NF-e; reusa o parser existente.
  if (doc.getElementsByTagName("infNFe").length) {
    const mod = txt(doc, "mod");
    const nf = parseNFe(xml);
    if (!nf.ok) return vazio(nf.erro);
    const inf = doc.getElementsByTagName("infNFe")[0];
    const chave44 = inf?.getAttribute("Id")?.replace(/\D/g, "")?.slice(-44) ?? null;
    return {
      ok: true,
      modelo: "65",
      chave44,
      dhEmi: txt(doc, "dhEmi"),
      emit_cnpj: txt(doc.getElementsByTagName("emit")[0] ?? doc, "CNPJ"),
      vTotal: num(txt(doc.getElementsByTagName("ICMSTot")[0] ?? doc, "vNF")),
      itens: nf.itens.map((it) => ({
        cfop: it.cfop,
        ncm: it.ncm,
        xProd: it.xProd,
        qCom: it.qCom,
        vProd: it.vProd,
        vICMS: it.vICMS,
        vICMSST: it.vICMSST,
        cst_icms: it.cst_icms,
        cst_pis: it.cst_pis,
        cst_cofins: it.cst_cofins,
      })),
      // mod já validado como 65 quando presente; se vier 55 é NF-e (entrada), não cupom.
      erro: mod && mod !== "65" ? undefined : undefined,
    };
  }

  return vazio("Não parece um cupom fiscal (sem infCFe nem infNFe).");
}

/** Parser do CF-e-SAT (modelo 59) — estrutura infCFe. */
function parseCFeSAT(doc: Document): CupomParsed {
  const inf = doc.getElementsByTagName("infCFe")[0];
  const chave44 = inf?.getAttribute("Id")?.replace(/\D/g, "")?.slice(-44) ?? null;
  const emit = doc.getElementsByTagName("emit")[0];
  const ide = doc.getElementsByTagName("ide")[0];
  const totalIcms = doc.getElementsByTagName("ICMSTot")[0];

  const itens: CupomItem[] = Array.from(doc.getElementsByTagName("det")).map((det) => {
    const prod = det.getElementsByTagName("prod")[0];
    const imposto = det.getElementsByTagName("imposto")[0];
    const icms = imposto?.getElementsByTagName("ICMS")[0]?.children[0]; // ICMS00/40/60/SN...
    const pis = imposto?.getElementsByTagName("PIS")[0]?.children[0];
    const cofins = imposto?.getElementsByTagName("COFINS")[0]?.children[0];
    return {
      cfop: prod ? txt(prod, "CFOP") : null,
      ncm: prod ? txt(prod, "NCM") : null,
      xProd: prod ? txt(prod, "xProd") : null,
      qCom: prod ? num(txt(prod, "qCom")) : null,
      vProd: prod ? num(txt(prod, "vProd")) : null,
      vICMS: icms ? num(txt(icms, "vICMS")) : null,
      vICMSST: icms ? num(txt(icms, "vICMSST")) : null,
      cst_icms: icms ? (txt(icms, "CST") ?? txt(icms, "CSOSN")) : null,
      cst_pis: pis ? txt(pis, "CST") : null,
      cst_cofins: cofins ? txt(cofins, "CST") : null,
    };
  });

  return {
    ok: true,
    modelo: "59",
    chave44,
    dhEmi: ide ? (txt(ide, "dEmi") ?? txt(ide, "dhEmi")) : null,
    emit_cnpj: emit ? txt(emit, "CNPJ") : null,
    vTotal: totalIcms ? num(txt(totalIcms, "vProd")) : num(txt(doc, "vCFe")),
    itens,
  };
}
