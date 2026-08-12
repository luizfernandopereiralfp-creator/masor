import https from "node:https";

/* ============================================================
   Masor — chamada SOAP com mTLS (certificado A1 do cliente).

   ⚠ TRAVADO EM `node:https` DE PROPÓSITO.
   O fetch global do Node (undici) NÃO aceita https.Agent — trocar
   por fetch quebra o mTLS SILENCIOSAMENTE (conecta sem apresentar
   o certificado e a SEFAZ rejeita). Não "modernize" isto.

   O NFeDistribuicaoDFe NÃO exige assinatura XML do pedido: a
   autenticação é o próprio handshake TLS com o certificado.
   ============================================================ */

export type RespostaSoap = { status: number; corpo: string };

export function agentMtls(pfx: Buffer, passphrase: string): https.Agent {
  return new https.Agent({
    pfx,
    passphrase,
    minVersion: "TLSv1.2",
    keepAlive: false,
  });
}

/** POST SOAP 1.2 com o agent mTLS. Resolve com o corpo bruto (XML). */
export function soapPost(
  url: string,
  envelope: string,
  agent: https.Agent,
  timeoutMs = 60_000,
): Promise<RespostaSoap> {
  return new Promise((resolve, reject) => {
    const alvo = new URL(url);
    const req = https.request(
      {
        protocol: alvo.protocol,
        hostname: alvo.hostname,
        port: alvo.port || 443,
        path: alvo.pathname + alvo.search,
        method: "POST",
        agent,
        headers: {
          "Content-Type": "application/soap+xml; charset=utf-8",
          "Content-Length": Buffer.byteLength(envelope, "utf8"),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, corpo: Buffer.concat(chunks).toString("utf8") }));
      },
    );
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Timeout de ${timeoutMs}ms ao contatar a SEFAZ.`));
    });
    req.on("error", reject);
    req.write(envelope, "utf8");
    req.end();
  });
}
