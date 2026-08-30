import https from "node:https";

/* ============================================================
   Transporte SOAP com mTLS (certificado A1 do cliente).

   Extraído de `fiscal/mtls.ts` para ser compartilhado entre o
   módulo FISCAL (NFeDistribuiçãoDFe, SOAP 1.2) e o módulo de
   FOLHA (eSocial, SOAP 1.1). A mecânica de handshake é a mesma;
   o que muda entre os dois é só o cabeçalho.

   ⚠ TRAVADO EM `node:https` DE PROPÓSITO.
   O fetch global do Node (undici) NÃO aceita https.Agent — trocar
   por fetch quebra o mTLS SILENCIOSAMENTE (conecta sem apresentar
   o certificado e o servidor rejeita). Não "modernize" isto.
   ============================================================ */

export type RespostaSoap = { status: number; corpo: string };

export type OpcoesSoap = {
  /** SOAP 1.2 → "application/soap+xml; charset=utf-8" (padrão da SEFAZ).
   *  SOAP 1.1 → "text/xml; charset=utf-8" + cabeçalho SOAPAction. */
  contentType?: string;
  /** Obrigatório em SOAP 1.1. Ignorado em SOAP 1.2. */
  soapAction?: string | null;
  timeoutMs?: number;
  /** Nome do serviço, só para a mensagem de timeout ficar legível. */
  servico?: string;
};

export function agentMtls(pfx: Buffer, passphrase: string): https.Agent {
  return new https.Agent({
    pfx,
    passphrase,
    minVersion: "TLSv1.2",
    keepAlive: false,
  });
}

/** POST SOAP com o agent mTLS. Resolve com o corpo bruto (XML). */
export function soapPostMtls(
  url: string,
  envelope: string,
  agent: https.Agent,
  opts: OpcoesSoap = {},
): Promise<RespostaSoap> {
  const contentType = opts.contentType ?? "application/soap+xml; charset=utf-8";
  const timeoutMs = opts.timeoutMs ?? 60_000;
  const servico = opts.servico ?? "o serviço";

  const headers: Record<string, string | number> = {
    "Content-Type": contentType,
    "Content-Length": Buffer.byteLength(envelope, "utf8"),
  };
  // SOAPAction só existe em SOAP 1.1; em 1.2 a ação vai dentro do Content-Type.
  if (opts.soapAction) headers.SOAPAction = `"${opts.soapAction}"`;

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
        headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () =>
          resolve({ status: res.statusCode ?? 0, corpo: Buffer.concat(chunks).toString("utf8") }),
        );
      },
    );
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Timeout de ${timeoutMs}ms ao contatar ${servico}.`));
    });
    req.on("error", reject);
    req.write(envelope, "utf8");
    req.end();
  });
}
