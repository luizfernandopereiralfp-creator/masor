import { extractText, getDocumentProxy } from "unpdf";

/* ============================================================
   Masor — leitura de NF-e em PDF (DANFE).
   O XML é sempre mais preciso; o PDF é best-effort. O campo
   confiável é a CHAVE DE ACESSO (44 dígitos). NCM/descrição/valor
   saem por heurística do texto do DANFE — sempre confira.
   Roda no cliente (unpdf embute o pdf.js).
   ============================================================ */

export type PdfNFe = {
  ok: boolean;
  erro?: string;
  chave44: string | null;
  emit_uf: string | null;
  itens: { descricao: string | null; ncm: string | null; cest: string | null; valor: number | null }[];
  aviso: string | null;
};

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

function acharChave(txt: string): string | null {
  // "CHAVE DE ACESSO" seguido de 44 dígitos (geralmente em grupos de 4).
  const rot = txt.match(/chave\s*de\s*acesso[^\d]{0,20}((?:\d[\s.]*){44})/i);
  const bruto = rot?.[1] ?? "";
  const soDig = bruto.replace(/\D/g, "");
  if (soDig.length === 44) return soDig;
  // fallback: qualquer sequência que, sem separadores, dê 44 dígitos.
  const m = txt.match(/(?:\d[\s.]*){44}/);
  const d = (m?.[0] ?? "").replace(/\D/g, "");
  return d.length === 44 ? d : null;
}

function num(s: string): number | null {
  const n = parseFloat(s.replace(/\./g, "").replace(",", "."));
  return isNaN(n) ? null : n;
}

export async function parsePdfNFe(buf: ArrayBuffer): Promise<PdfNFe> {
  let texto = "";
  try {
    const pdf = await getDocumentProxy(new Uint8Array(buf));
    const r = await extractText(pdf, { mergePages: true });
    texto = Array.isArray(r.text) ? r.text.join("\n") : r.text;
  } catch (e) {
    return { ok: false, erro: `Não consegui ler o PDF: ${(e as Error).message}`, chave44: null, emit_uf: null, itens: [], aviso: null };
  }
  if (!texto || texto.trim().length < 40)
    return {
      ok: false,
      erro: "PDF parece digitalizado (imagem) — envie o XML ou o PDF original com texto.",
      chave44: null,
      emit_uf: null,
      itens: [],
      aviso: null,
    };

  const chave44 = acharChave(texto);
  // UF do emitente: da chave (dígitos 1-2 = código IBGE da UF) ou heurística de texto.
  const codUf: Record<string, string> = {
    "11":"RO","12":"AC","13":"AM","14":"RR","15":"PA","16":"AP","17":"TO","21":"MA","22":"PI","23":"CE","24":"RN","25":"PB","26":"PE","27":"AL","28":"SE","29":"BA","31":"MG","32":"ES","33":"RJ","35":"SP","41":"PR","42":"SC","43":"RS","50":"MS","51":"MT","52":"GO","53":"DF",
  };
  let emit_uf: string | null = chave44 ? (codUf[chave44.slice(0, 2)] ?? null) : null;
  if (!emit_uf) {
    const mu = texto.match(new RegExp("\\b(" + UFS.join("|") + ")\\b"));
    emit_uf = mu?.[1] ?? null;
  }

  // Heurística de item: procura NCM (8 dígitos) e tenta descrição/valor próximos.
  const itens: PdfNFe["itens"] = [];
  const ncmRe = /\b(\d{8})\b/g;
  const vistos = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = ncmRe.exec(texto)) !== null && itens.length < 5) {
    const ncm = m[1];
    if (ncm === "00000000" || vistos.has(ncm)) continue;
    // ignora sequências que sejam parte da chave de 44 dígitos
    if (chave44 && chave44.includes(ncm)) continue;
    vistos.add(ncm);
    const janela = texto.slice(Math.max(0, m.index - 80), m.index);
    const desc = janela.replace(/[\d.,/-]+\s*$/, "").split(/\n/).pop()?.trim() || null;
    const valMatch = texto.slice(m.index, m.index + 120).match(/(\d{1,3}(?:\.\d{3})*,\d{2})/);
    itens.push({ descricao: desc && desc.length > 2 ? desc : null, ncm, cest: null, valor: valMatch ? num(valMatch[1]) : null });
  }

  return {
    ok: true,
    chave44,
    emit_uf,
    itens,
    aviso:
      "Li o PDF por aproximação (DANFE). Confira NCM, descrição e custo — o XML é mais preciso." +
      (chave44 ? ` Chave: ${chave44}.` : " Não achei a chave de acesso."),
  };
}
