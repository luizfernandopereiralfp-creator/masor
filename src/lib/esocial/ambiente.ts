/* ============================================================
   Folha — ambiente e endpoints do eSocial.

   FAIL-CLOSED POR DECISÃO. Nenhuma URL de webservice do eSocial
   está embutida aqui, e isso é deliberado: a pesquisa de 30/08/2026
   NÃO conseguiu ler o Manual de Orientação do Desenvolvedor (o
   egress para *.gov.br está bloqueado por política de rede), então
   qualquer endpoint escrito no código seria invenção.

   Ver `docs/folha/FONTES-A-BAIXAR.md`, item A5 (bloqueador): as URLs
   canônicas saem do MOD. Enquanto elas não forem lidas na origem e
   registradas em `docs/folha/fontes/` com data e hash, este módulo
   se recusa a montar uma chamada — em vez de "tentar" contra um
   endereço chutado.

   Contraste com o fiscal: `fiscal/envelope.ts` PODE fixar as URLs da
   SEFAZ porque elas foram confirmadas no Portal Nacional da NF-e.
   ============================================================ */

export type AmbienteESocial = "producao" | "restrita";

/** Nome da variável de ambiente que carrega cada endpoint. */
const VAR: Record<AmbienteESocial, string> = {
  producao: "ESOCIAL_WS_PRODUCAO",
  restrita: "ESOCIAL_WS_RESTRITA",
};

export class EndpointNaoConfirmado extends Error {
  constructor(ambiente: AmbienteESocial) {
    super(
      `Endpoint do eSocial (${ambiente}) não configurado. ` +
        `Defina ${VAR[ambiente]} com a URL lida no Manual de Orientação do Desenvolvedor ` +
        `e arquive a fonte em docs/folha/fontes/. Nenhuma URL é presumida por este módulo ` +
        `(ver docs/folha/FONTES-A-BAIXAR.md, item A5).`,
    );
    this.name = "EndpointNaoConfirmado";
  }
}

/** URL do webservice. Lança se não houver fonte confirmada configurada. */
export function endpointESocial(ambiente: AmbienteESocial): string {
  const url = process.env[VAR[ambiente]]?.trim();
  if (!url) throw new EndpointNaoConfirmado(ambiente);
  return url;
}

/** true se o ambiente está configurado — para a UI avisar antes de tentar. */
export function esocialConfigurado(ambiente: AmbienteESocial): boolean {
  return Boolean(process.env[VAR[ambiente]]?.trim());
}

/**
 * Trava de fonte única da verdade do eSocial por empregador.
 *
 * Enquanto o Domínio (ou qualquer outro sistema) transmitir por um CNPJ,
 * o Lior NÃO pode transmitir pelo mesmo CNPJ na mesma competência: os dois
 * gerariam eventos concorrentes, cada um conhecendo apenas os próprios
 * recibos, e a retificação passaria a ser decidida por ordem de chegada.
 * O eSocial não identifica o software transmissor — não existe trava do
 * lado do governo. Por isso ela é um `if` aqui.
 *
 * Ver `docs/folha/11-dominio-incumbente-e-integracao.md`, seção 3.
 */
export type FonteESocial = "lior" | "externo";

export class TransmissaoBloqueada extends Error {
  constructor(cnpj: string, fonte: FonteESocial) {
    super(
      `Transmissão bloqueada para o CNPJ ${cnpj}: a fonte da verdade do eSocial ` +
        `deste empregador está marcada como "${fonte}". Só existe um transmissor por ` +
        `empregador. Migre o empregador por inteiro, na virada do exercício, antes de ` +
        `transmitir pelo Lior.`,
    );
    this.name = "TransmissaoBloqueada";
  }
}

export function exigirFonteLior(cnpj: string, fonte: FonteESocial): void {
  if (fonte !== "lior") throw new TransmissaoBloqueada(cnpj, fonte);
}
