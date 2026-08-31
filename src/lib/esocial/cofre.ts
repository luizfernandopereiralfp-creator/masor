/* ============================================================
   Folha — certificado A1 para o eSocial.

   NÃO HÁ CÓDIGO NOVO AQUI, e é esse o ponto: o cofre de
   certificados do Lior e a leitura de metadados do A1 já existem e
   funcionam no módulo fiscal. O eSocial usa o MESMO e-CNPJ, o mesmo
   blob cifrado (AES-256-GCM no Storage) e a mesma decifragem só em
   memória. Este arquivo apenas dá ao módulo de folha uma porta com
   o nome do domínio dele.

   O que o fiscal NÃO tem e a folha vai precisar: assinatura XMLDSig
   do evento. O NFeDistribuiçãoDFe se autentica só pelo handshake
   TLS; o eSocial exige o evento assinado. Essa peça é nova — ver
   `docs/folha/02-esocial-integracao-tecnica.md` (canonicalização
   inclusiva, diferente da exclusiva usada na NF-e).
   ============================================================ */

export {
  decifrarArquivoLior,
  decifrarSenhaLior,
  certLiorConfigurado,
} from "@/lib/fiscal/cofre-lior";

export { lerCertificado, type MetaCertificado } from "@/lib/fiscal/cert";

export { agentMtls, soapPostMtls, type RespostaSoap, type OpcoesSoap } from "@/lib/transporte/mtls";
