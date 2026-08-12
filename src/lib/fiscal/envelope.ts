/* ============================================================
   Masor — envelope SOAP do NFeDistribuicaoDFe (Ambiente Nacional).

   Endpoints oficiais (os antigos sem o "1" foram desativados em
   23/05/2022 — usar sempre www1/hom1):
   - Produção:    https://www1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx
   - Homologação: https://hom1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx

   SOAP 1.2 · método nfeDistDFeInteresse · distDFeInt versão 1.01.
   Fonte: Portal Nacional NF-e (webServices) / NT 2014.002.
   ============================================================ */

export const ENDPOINT_PROD = "https://www1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx";
export const ENDPOINT_HOM = "https://hom1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx";

export function endpointDFe(tpAmb: 1 | 2): string {
  const custom = tpAmb === 1 ? process.env.NFE_DIST_ENDPOINT_PROD : process.env.NFE_DIST_ENDPOINT_HOM;
  return custom || (tpAmb === 1 ? ENDPOINT_PROD : ENDPOINT_HOM);
}

/** Código IBGE da UF (cUFAutor). */
export const COD_UF: Record<string, string> = {
  RO: "11", AC: "12", AM: "13", RR: "14", PA: "15", AP: "16", TO: "17",
  MA: "21", PI: "22", CE: "23", RN: "24", PB: "25", PE: "26", AL: "27", SE: "28", BA: "29",
  MG: "31", ES: "32", RJ: "33", SP: "35",
  PR: "41", SC: "42", RS: "43",
  MS: "50", MT: "51", GO: "52", DF: "53",
};

const nsu15 = (v: string | number | null | undefined) => String(v ?? "0").replace(/\D/g, "").padStart(15, "0").slice(-15);

export type ModoConsulta =
  | { modo: "distNSU"; ultNSU: string | number }
  | { modo: "consNSU"; nsu: string | number }
  | { modo: "consChNFe"; chave: string };

/** Monta o envelope SOAP 1.2 do nfeDistDFeInteresse. */
export function envelopeDistDFe(opts: {
  tpAmb: 1 | 2;
  uf: string;
  cnpj: string;
  consulta: ModoConsulta;
}): string {
  const cUF = COD_UF[opts.uf?.toUpperCase()] ?? "35";
  const cnpj = opts.cnpj.replace(/\D/g, "");
  const c = opts.consulta;
  const bloco =
    c.modo === "distNSU"
      ? `<distNSU><ultNSU>${nsu15(c.ultNSU)}</ultNSU></distNSU>`
      : c.modo === "consNSU"
        ? `<consNSU><NSU>${nsu15(c.nsu)}</NSU></consNSU>`
        : `<consChNFe><chNFe>${c.chave.replace(/\D/g, "")}</chNFe></consChNFe>`;

  return `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <nfeDistDFeInteresse xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe">
      <nfeDadosMsg>
        <distDFeInt xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.01">
          <tpAmb>${opts.tpAmb}</tpAmb>
          <cUFAutor>${cUF}</cUFAutor>
          <CNPJ>${cnpj}</CNPJ>
          ${bloco}
        </distDFeInt>
      </nfeDadosMsg>
    </nfeDistDFeInteresse>
  </soap12:Body>
</soap12:Envelope>`;
}
