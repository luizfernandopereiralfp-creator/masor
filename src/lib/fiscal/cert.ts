import forge from "node-forge";

/* ============================================================
   Masor — leitura do certificado digital A1 (.pfx / .p12).
   Só extrai METADADOS (titular, CNPJ, validade) e valida a senha.
   O material criptográfico em si nunca sai daqui em claro: quem
   usa é o https.Agent (mTLS), a partir do buffer decifrado.
   ============================================================ */

export type MetaCertificado = {
  titular: string | null; // CN
  cnpj: string | null; // extraído do CN ("EMPRESA:00000000000191") ou do subject
  validade_ate: string | null; // ISO date (YYYY-MM-DD)
  emissor: string | null;
  expirado: boolean;
};

/**
 * Abre o .pfx com a senha informada. Lança se a senha estiver errada
 * ou o arquivo não for um PKCS#12 válido — é assim que validamos o upload.
 */
export function lerCertificado(pfx: Buffer, senha: string): MetaCertificado {
  const p12Der = forge.util.createBuffer(pfx.toString("binary"));
  const p12Asn1 = forge.asn1.fromDer(p12Der);
  // Lança "PKCS#12 MAC could not be verified" se a senha estiver errada.
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, senha);

  const bags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] ?? [];
  const certs = bags.map((b) => b.cert).filter(Boolean) as forge.pki.Certificate[];
  if (!certs.length) throw new Error("Certificado não encontrado no arquivo.");

  // O certificado do titular é o que NÃO é CA (o da cadeia é).
  const cert = certs.find((c) => !c.getExtension("basicConstraints") || !(c.getExtension("basicConstraints") as { cA?: boolean })?.cA) ?? certs[0];

  const cn = (cert.subject.getField("CN")?.value as string | undefined) ?? null;
  const emissor = (cert.issuer.getField("CN")?.value as string | undefined) ?? null;
  const validade = cert.validity?.notAfter ?? null;

  // e-CNPJ ICP-Brasil: o CN costuma ser "RAZAO SOCIAL:CNPJ".
  let cnpj: string | null = null;
  const doCn = cn?.match(/:(\d{14})\s*$/);
  if (doCn) cnpj = doCn[1];
  if (!cnpj) {
    // fallback: procura 14 dígitos em qualquer atributo do subject
    const todos = cert.subject.attributes.map((a) => String(a.value ?? "")).join(" ");
    cnpj = todos.match(/\d{14}/)?.[0] ?? null;
  }

  return {
    titular: cn,
    cnpj,
    validade_ate: validade ? validade.toISOString().slice(0, 10) : null,
    emissor,
    expirado: validade ? validade.getTime() < Date.now() : false,
  };
}
