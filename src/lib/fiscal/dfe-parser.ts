import { gunzipSync } from "node:zlib";

/* ============================================================
   Masor — leitura da resposta do NFeDistribuicaoDFe.
   Cada <docZip> é base64 -> gunzip -> XML. Guardamos o XML
   íntegro (fonte da verdade) e extraímos um resumo indexável.
   Extração por regex proposital: sem dependência nova de XML e
   os campos são posicionais e estáveis no leiaute 4.00.
   ============================================================ */

export type DocDFe = {
  nsu: string;
  schema: string | null;
  tipo: "resNFe" | "procNFe" | "resEvento" | "procEventoNFe" | "desconhecido";
  chave44: string | null;
  xml: string;
  resumo: Record<string, unknown>;
};

export type RetornoDFe = {
  cStat: string | null;
  xMotivo: string | null;
  ultNSU: string | null;
  maxNSU: string | null;
  dhResp: string | null;
  docs: DocDFe[];
};

const tag = (xml: string, nome: string): string | null => {
  const m = xml.match(new RegExp(`<${nome}[^>]*>([\\s\\S]*?)</${nome}>`));
  return m ? m[1].trim() : null;
};

/** cStat conhecidos do serviço de distribuição. */
export const CSTAT = {
  DOCUMENTOS_LOCALIZADOS: "138",
  NENHUM_DOCUMENTO: "137",
  CONSUMO_INDEVIDO: "656",
} as const;

function classificar(schema: string | null, xml: string): DocDFe["tipo"] {
  const s = schema ?? "";
  if (s.startsWith("resNFe")) return "resNFe";
  if (s.startsWith("procNFe")) return "procNFe";
  if (s.startsWith("resEvento")) return "resEvento";
  if (s.startsWith("procEventoNFe")) return "procEventoNFe";
  if (xml.includes("<resNFe")) return "resNFe";
  if (xml.includes("<nfeProc")) return "procNFe";
  if (xml.includes("<resEvento")) return "resEvento";
  if (xml.includes("<procEventoNFe")) return "procEventoNFe";
  return "desconhecido";
}

/** Extrai um resumo indexável (emitente, valor, data) conforme o tipo. */
function resumir(tipo: DocDFe["tipo"], xml: string): Record<string, unknown> {
  const base: Record<string, unknown> = {};
  if (tipo === "resNFe") {
    base.emit_cnpj = tag(xml, "CNPJ");
    base.emit_nome = tag(xml, "xNome");
    base.dhEmi = tag(xml, "dhEmi");
    base.vNF = tag(xml, "vNF");
    base.tpNF = tag(xml, "tpNF");
    base.situacao = tag(xml, "cSitNFe");
  } else if (tipo === "procNFe") {
    const emit = xml.match(/<emit>([\s\S]*?)<\/emit>/)?.[1] ?? "";
    base.emit_cnpj = tag(emit, "CNPJ");
    base.emit_nome = tag(emit, "xNome");
    const ide = xml.match(/<ide>([\s\S]*?)<\/ide>/)?.[1] ?? "";
    base.dhEmi = tag(ide, "dhEmi");
    base.nNF = tag(ide, "nNF");
    base.serie = tag(ide, "serie");
    const total = xml.match(/<ICMSTot>([\s\S]*?)<\/ICMSTot>/)?.[1] ?? "";
    base.vNF = tag(total, "vNF");
    base.vICMS = tag(total, "vICMS");
    base.vST = tag(total, "vST");
    base.qtd_itens = (xml.match(/<det\b/g) ?? []).length;
  } else if (tipo === "resEvento" || tipo === "procEventoNFe") {
    base.tpEvento = tag(xml, "tpEvento");
    base.descEvento = tag(xml, "xEvento") ?? tag(xml, "descEvento");
    base.dhEvento = tag(xml, "dhEvento");
    base.emit_cnpj = tag(xml, "CNPJ");
  }
  return base;
}

/** Descompacta um docZip (base64 + gzip) para XML. */
export function descompactarDocZip(b64: string): string {
  return gunzipSync(Buffer.from(b64.replace(/\s/g, ""), "base64")).toString("utf8");
}

/** Interpreta o corpo SOAP da resposta (retDistDFeInt). */
export function parseRetornoDFe(soapXml: string): RetornoDFe {
  const ret = soapXml.match(/<retDistDFeInt[\s\S]*?<\/retDistDFeInt>/)?.[0] ?? soapXml;
  const docs: DocDFe[] = [];

  const re = /<docZip([^>]*)>([\s\S]*?)<\/docZip>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(ret)) !== null) {
    const attrs = m[1];
    const nsu = attrs.match(/NSU="(\d+)"/)?.[1] ?? "";
    const schema = attrs.match(/schema="([^"]+)"/)?.[1] ?? null;
    let xml: string;
    try {
      xml = descompactarDocZip(m[2]);
    } catch {
      continue; // documento corrompido: ignora, não inventa conteúdo
    }
    const tipo = classificar(schema, xml);
    const chave44 = (tag(xml, "chNFe") ?? xml.match(/Id="NFe(\d{44})"/)?.[1] ?? xml.match(/\b(\d{44})\b/)?.[1] ?? null);
    docs.push({ nsu, schema, tipo, chave44, xml, resumo: resumir(tipo, xml) });
  }

  return {
    cStat: tag(ret, "cStat"),
    xMotivo: tag(ret, "xMotivo"),
    ultNSU: tag(ret, "ultNSU"),
    maxNSU: tag(ret, "maxNSU"),
    dhResp: tag(ret, "dhResp"),
    docs,
  };
}
