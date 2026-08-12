import { gzipSync } from "node:zlib";
import crypto from "node:crypto";

process.env.MASOR_CERT_ENC_KEY = crypto.randomBytes(32).toString("base64");

const { cifrar, decifrar, cifrarTexto, decifrarTexto, cofreConfigurado } = await import("../.test-build/fiscal/cofre.js");
const { envelopeDistDFe, endpointDFe, COD_UF } = await import("../.test-build/fiscal/envelope.js");
const { parseRetornoDFe, descompactarDocZip, CSTAT } = await import("../.test-build/fiscal/dfe-parser.js");

let falhas = 0;
const ok = (nome, cond, extra = "") => {
  console.log(`${cond ? "✅" : "❌"} ${nome}${extra ? " — " + extra : ""}`);
  if (!cond) falhas++;
};

// ---------- 1. COFRE (AES-256-GCM) ----------
ok("cofre configurado", cofreConfigurado());
const segredo = crypto.randomBytes(4096); // simula um .pfx
const blob = cifrar(segredo);
ok("ciphertext difere do original", !blob.equals(segredo));
ok("round-trip .pfx íntegro", decifrar(blob).equals(segredo));
ok("round-trip da senha", decifrarTexto(cifrarTexto("S3nh@ do cert")) === "S3nh@ do cert");
// adulteração deve falhar (GCM autentica)
const adulterado = Buffer.from(blob);
adulterado[adulterado.length - 1] ^= 0xff;
let detectou = false;
try { decifrar(adulterado); } catch { detectou = true; }
ok("detecta adulteração (authTag)", detectou);
// chave errada não decifra
const blobBase64 = blob.toString("base64"); // como vai para o banco
process.env.MASOR_CERT_ENC_KEY = crypto.randomBytes(32).toString("base64");
let negou = false;
try { decifrar(Buffer.from(blobBase64, "base64")); } catch { negou = true; }
ok("chave errada não decifra", negou);

// ---------- 2. ENVELOPE ----------
const env = envelopeDistDFe({ tpAmb: 1, uf: "SP", cnpj: "12.345.678/0001-95", consulta: { modo: "distNSU", ultNSU: 42 } });
ok("cUFAutor de SP = 35", env.includes("<cUFAutor>35</cUFAutor>"));
ok("CNPJ sem máscara", env.includes("<CNPJ>12345678000195</CNPJ>"));
ok("ultNSU com 15 dígitos", env.includes("<ultNSU>000000000000042</ultNSU>"));
ok("SOAP 1.2", env.includes("http://www.w3.org/2003/05/soap-envelope"));
ok("namespace nfe correto", env.includes('xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.01"'));
ok("XML balanceado", (env.match(/<distDFeInt/g) || []).length === 1 && env.includes("</distDFeInt>"));
ok("endpoint produção www1", endpointDFe(1).includes("www1.nfe.fazenda.gov.br"));
ok("endpoint homologação hom1", endpointDFe(2).includes("hom1.nfe.fazenda.gov.br"));
const envCh = envelopeDistDFe({ tpAmb: 2, uf: "BA", cnpj: "1", consulta: { modo: "consChNFe", chave: "1".repeat(44) } });
ok("modo consChNFe", envCh.includes("<chNFe>" + "1".repeat(44) + "</chNFe>") && envCh.includes("<cUFAutor>29</cUFAutor>"));
ok("todas as 27 UFs mapeadas", Object.keys(COD_UF).length === 27, Object.keys(COD_UF).length + " UFs");

// ---------- 3. PARSER docZip ----------
const resNFe = `<resNFe versao="1.01"><chNFe>35240612345678000195550010000001231000001234</chNFe><CNPJ>12345678000195</CNPJ><xNome>FORNECEDOR TESTE LTDA</xNome><dhEmi>2026-08-01T10:00:00-03:00</dhEmi><vNF>1234.56</vNF><tpNF>1</tpNF><cSitNFe>1</cSitNFe></resNFe>`;
const zip = gzipSync(Buffer.from(resNFe, "utf8")).toString("base64");
ok("gunzip do docZip", descompactarDocZip(zip) === resNFe);

const soap = `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"><soap:Body>
<retDistDFeInt versao="1.01"><tpAmb>1</tpAmb><cStat>138</cStat><xMotivo>Documento(s) localizado(s)</xMotivo>
<dhResp>2026-08-11T22:00:00-03:00</dhResp><ultNSU>000000000000045</ultNSU><maxNSU>000000000000200</maxNSU>
<loteDistDFeInt><docZip NSU="000000000000045" schema="resNFe_v1.01">${zip}</docZip></loteDistDFeInt>
</retDistDFeInt></soap:Body></soap:Envelope>`;
const r = parseRetornoDFe(soap);
ok("cStat 138 lido", r.cStat === "138");
ok("ultNSU lido", r.ultNSU === "000000000000045");
ok("maxNSU lido", r.maxNSU === "000000000000200");
ok("1 documento extraído", r.docs.length === 1);
ok("tipo resNFe", r.docs[0]?.tipo === "resNFe");
ok("NSU do doc", r.docs[0]?.nsu === "000000000000045");
ok("chave 44 extraída", r.docs[0]?.chave44 === "35240612345678000195550010000001231000001234");
ok("emitente no resumo", r.docs[0]?.resumo.emit_nome === "FORNECEDOR TESTE LTDA");
ok("valor no resumo", r.docs[0]?.resumo.vNF === "1234.56");

// resposta "nada novo" (137)
const soap137 = `<retDistDFeInt><cStat>137</cStat><xMotivo>Nenhum documento localizado</xMotivo><ultNSU>000000000000200</ultNSU><maxNSU>000000000000200</maxNSU></retDistDFeInt>`;
const r137 = parseRetornoDFe(soap137);
ok("137 sem documentos", r137.cStat === CSTAT.NENHUM_DOCUMENTO && r137.docs.length === 0);

// docZip corrompido não derruba o parser
const soapRuim = `<retDistDFeInt><cStat>138</cStat><ultNSU>1</ultNSU><maxNSU>1</maxNSU><loteDistDFeInt><docZip NSU="1" schema="resNFe_v1.01">LIXO!!!</docZip></loteDistDFeInt></retDistDFeInt>`;
let sobreviveu = true;
try { const rr = parseRetornoDFe(soapRuim); sobreviveu = rr.docs.length === 0; } catch { sobreviveu = false; }
ok("docZip corrompido é ignorado sem quebrar", sobreviveu);

// procNFe completo
const procNFe = `<nfeProc versao="4.00"><NFe><infNFe Id="NFe35240612345678000195550010000001231000001234"><ide><nNF>123</nNF><serie>1</serie><dhEmi>2026-08-01T10:00:00-03:00</dhEmi></ide><emit><CNPJ>12345678000195</CNPJ><xNome>FORN LTDA</xNome></emit><det nItem="1"></det><det nItem="2"></det><total><ICMSTot><vNF>1234.56</vNF><vICMS>222.22</vICMS><vST>0.00</vST></ICMSTot></total></infNFe></NFe></nfeProc>`;
const zip2 = gzipSync(Buffer.from(procNFe)).toString("base64");
const soap2 = `<retDistDFeInt><cStat>138</cStat><ultNSU>50</ultNSU><maxNSU>50</maxNSU><loteDistDFeInt><docZip NSU="000000000000050" schema="procNFe_v4.00">${zip2}</docZip></loteDistDFeInt></retDistDFeInt>`;
const r2 = parseRetornoDFe(soap2);
ok("procNFe classificado", r2.docs[0]?.tipo === "procNFe");
ok("procNFe: emitente", r2.docs[0]?.resumo.emit_nome === "FORN LTDA");
ok("procNFe: total vNF", r2.docs[0]?.resumo.vNF === "1234.56");
ok("procNFe: conta itens", r2.docs[0]?.resumo.qtd_itens === 2, "qtd=" + r2.docs[0]?.resumo.qtd_itens);
ok("procNFe: chave do Id", r2.docs[0]?.chave44 === "35240612345678000195550010000001231000001234");

console.log(falhas === 0 ? "\n🟢 TODOS OS TESTES PASSARAM" : `\n🔴 ${falhas} FALHA(S)`);
process.exit(falhas ? 1 : 0);
