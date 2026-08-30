/* ============================================================
   Masor — chamada SOAP com mTLS para a SEFAZ (NFeDistribuiçãoDFe).

   O transporte foi extraído para `@/lib/transporte/mtls` quando o
   módulo de FOLHA passou a precisar do mesmo handshake para o
   eSocial. Este arquivo permanece como a porta do módulo fiscal e
   fixa o que é específico dele: SOAP 1.2.

   O NFeDistribuicaoDFe NÃO exige assinatura XML do pedido: a
   autenticação é o próprio handshake TLS com o certificado.
   (O eSocial exige — ver `@/lib/esocial`.)
   ============================================================ */

import type https from "node:https";

import { agentMtls, soapPostMtls, type RespostaSoap } from "@/lib/transporte/mtls";

export { agentMtls };
export type { RespostaSoap };

/** POST SOAP 1.2 com o agent mTLS. Resolve com o corpo bruto (XML). */
export function soapPost(
  url: string,
  envelope: string,
  agent: https.Agent,
  timeoutMs = 60_000,
): Promise<RespostaSoap> {
  return soapPostMtls(url, envelope, agent, {
    contentType: "application/soap+xml; charset=utf-8",
    timeoutMs,
    servico: "a SEFAZ",
  });
}
