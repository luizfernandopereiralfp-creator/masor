import https from "node:https";

/* ============================================================
   Transporte SOAP com mTLS (certificado A1 do cliente).

   Extraído de `fiscal/mtls.ts` para ser compartilhado entre o
   módulo FISCAL (NFeDistribuiçãoDFe) e o módulo de FOLHA (eSocial).

   CORREÇÃO DE 30/08/2026. A extração foi feita sob a premissa de que o
   eSocial falava SOAP 1.1 com cabeçalho `SOAPAction`. Está errado: o
   Manual de Orientação do Desenvolvedor v1.15 declara o envelope como
   `http://www.w3.org/2003/05/soap-envelope`, que é **SOAP 1.2**, e não
   menciona `SOAPAction` em nenhuma das suas 125 páginas. Os DOIS serviços
   são SOAP 1.2 — o `soapPost` do fiscal serviria ao eSocial sem alteração.

   O arquivo continua aqui porque a parametrização é barata e útil (o dia
   em que um terceiro serviço exigir 1.1, já está pronto), mas ninguém deve
   repetir que "o eSocial é 1.1". Fonte arquivada em
   docs/folha/fontes/MOD-v1.15.pdf, com hash em fontes/VERIFICACAO.md.

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
