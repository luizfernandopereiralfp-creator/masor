/**
 * Utilitários de validade do certificado e-CNPJ (portado do Lior).
 * Leitura client-side do .pfx/.p12 via node-forge e cálculo do status de vencimento.
 * Marca Masor: sem vermelho — estados de alerta usam âmbar/laranja (token warn).
 */

export type CertStatus = "sem_certificado" | "ok" | "atencao" | "urgente" | "vencido";

export type CertValidade = {
  status: CertStatus;
  /** Dias restantes (negativo se vencido). null quando não há certificado. */
  dias: number | null;
  /** Data formatada dd/mm/aaaa, ou null. */
  dataBR: string | null;
};

export function formatarDataBR(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (!y || !m || !d) return null;
  return `${d}/${m}/${y}`;
}

/** Calcula dias restantes até a validade (em dias inteiros, base meia-noite local). */
export function diasAteValidade(iso: string | null | undefined, hoje = new Date()): number | null {
  if (!iso) return null;
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  const alvo = new Date(y, m - 1, d).getTime();
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();
  return Math.round((alvo - base) / 86_400_000);
}

export function avaliarValidade(iso: string | null | undefined, hoje = new Date()): CertValidade {
  const dias = diasAteValidade(iso, hoje);
  if (dias === null) return { status: "sem_certificado", dias: null, dataBR: null };
  const dataBR = formatarDataBR(iso);
  if (dias < 0) return { status: "vencido", dias, dataBR };
  if (dias <= 30) return { status: "urgente", dias, dataBR };
  if (dias <= 60) return { status: "atencao", dias, dataBR };
  return { status: "ok", dias, dataBR };
}

/** Texto longo usado no destaque dentro do cadastro. */
export function textoValidade(v: CertValidade): string {
  switch (v.status) {
    case "sem_certificado":
      return "Nenhum certificado cadastrado";
    case "vencido":
      return `VENCIDO em ${v.dataBR}`;
    case "urgente":
      return v.dias === 0
        ? `URGENTE: vence hoje (${v.dataBR})`
        : `URGENTE: vence em ${v.dias} dia${v.dias === 1 ? "" : "s"} (${v.dataBR})`;
    case "atencao":
      return `Atenção: vence em ${v.dias} dias (${v.dataBR})`;
    default:
      return `Válido até ${v.dataBR} (${v.dias} dias)`;
  }
}

/** Texto curto usado no badge da listagem. */
export function textoCurtoValidade(v: CertValidade): string {
  switch (v.status) {
    case "sem_certificado": return "—";
    case "vencido": return "Vencido";
    case "urgente":
    case "atencao": return `Vence em ${v.dias}d`;
    default: return "Válido";
  }
}

/** Estilos do badge — marca Masor (sem vermelho; vencido/urgente = âmbar forte). */
export function estiloValidade(status: CertStatus): { bg: string; fg: string; bd: string } {
  switch (status) {
    case "vencido":
    case "urgente":
      return { bg: "rgba(180,83,9,.12)", fg: "#b45309", bd: "rgba(180,83,9,.28)" };
    case "atencao":
      return { bg: "rgba(233,167,74,.16)", fg: "#a1650f", bd: "rgba(233,167,74,.35)" };
    case "ok":
      return { bg: "rgba(16,122,87,.12)", fg: "#0f7a57", bd: "rgba(16,122,87,.28)" };
    default:
      return { bg: "rgba(11,23,64,.05)", fg: "#8892A4", bd: "rgba(11,23,64,.10)" };
  }
}

/**
 * Lê a validade (notAfter) do certificado .pfx/.p12 no navegador.
 * Retorna a data em ISO (yyyy-mm-dd) ou null se não conseguir (senha errada, formato inválido).
 */
export async function lerValidadeCertificado(file: File, senha: string): Promise<string | null> {
  try {
    const forge = (await import("node-forge")).default;
    const buf = new Uint8Array(await file.arrayBuffer());
    let bin = "";
    for (const b of buf) bin += String.fromCharCode(b);
    const asn1 = forge.asn1.fromDer(forge.util.createBuffer(bin));
    const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, false, senha);
    const bags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] ?? [];
    let melhor: Date | null = null;
    for (const bag of bags) {
      const cert = bag.cert;
      if (!cert) continue;
      const notAfter = cert.validity?.notAfter;
      if (!notAfter) continue;
      // O certificado do titular normalmente é o de menor validade final entre os bags.
      if (!melhor || notAfter.getTime() < melhor.getTime()) melhor = notAfter;
    }
    if (!melhor) return null;
    const y = melhor.getFullYear();
    const m = String(melhor.getMonth() + 1).padStart(2, "0");
    const d = String(melhor.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  } catch {
    return null;
  }
}
