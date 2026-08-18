import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Loader2, ExternalLink, Copy, Check } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { Protegido } from "@/components/Protegido";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

type Candidato = {
  ncm: string;
  descricao_oficial?: string;
  cest?: string | null;
  sujeito_st_hint?: boolean | null;
  justificativa?: string;
  fonte_url?: string | null;
  confianca?: "alta" | "media" | "baixa" | string;
};

export const Route = createFileRoute("/ncm")({
  component: () => (
    <Protegido permitirCliente>
      <AppShell>
        <BuscaNCM />
      </AppShell>
    </Protegido>
  ),
});

const INK = "var(--app-ink)";
const MUTED = "var(--app-muted)";
const MONO = "var(--font-mono)";

function BuscaNCM() {
  const { lang } = useI18n();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);
  const [q, setQ] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [cands, setCands] = useState<Candidato[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim() || carregando) return;
    setCarregando(true);
    setErro(null);
    setCands(null);
    try {
      const tok = supabase ? (await supabase.auth.getSession()).data.session?.access_token : null;
      const r = await fetch("/api/ncm-busca", {
        method: "POST",
        headers: { "content-type": "application/json", ...(tok ? { authorization: `Bearer ${tok}` } : {}) },
        body: JSON.stringify({ descricao: q.trim(), idioma: lang }),
      });
      const d = await r.json();
      if (!r.ok || d.ok === false) setErro(d.erro ?? `Erro ${r.status}`);
      else setCands((d.candidatos as Candidato[]) ?? []);
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  function copiar(ncm: string) {
    navigator.clipboard?.writeText(ncm).then(() => {
      setCopiado(ncm);
      setTimeout(() => setCopiado(null), 1500);
    });
  }

  const corConf = (c?: string) =>
    c === "alta" ? "var(--success)" : c === "baixa" ? "var(--warn)" : "var(--amber)";

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-2xl font-bold leading-tight md:text-3xl" style={{ color: INK, fontFamily: "var(--font-display)" }}>
        {tx("Buscar NCM por descrição", "Поиск NCM по описанию")}
      </h2>
      <p className="mt-2 text-sm" style={{ color: MUTED }}>
        {tx(
          "Descreva o produto e a IA sugere os códigos NCM mais prováveis — com o CEST, a justificativa e a fonte oficial.",
          "Опишите товар — ИИ предложит наиболее вероятные коды NCM с источником.",
        )}
      </p>

      <form onSubmit={buscar} className="mt-4 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={tx("Ex.: sabão em pó para roupa, 1kg", "Напр.: стиральный порошок 1 кг")}
          className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none"
          style={{ borderColor: "var(--app-line)", background: "var(--app-bg2)", color: INK }}
        />
        <button
          type="submit"
          disabled={carregando}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          style={{ background: "var(--navy)" }}
        >
          {carregando ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {tx("Buscar", "Найти")}
        </button>
      </form>

      {erro && (
        <div className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--amber-soft)", color: INK }}>
          ⚠ {erro}
        </div>
      )}

      {cands && cands.length === 0 && !erro && (
        <p className="mt-4 text-sm" style={{ color: MUTED }}>{tx("Nenhum candidato encontrado. Detalhe mais a descrição.", "Ничего не найдено.")}</p>
      )}

      <div className="mt-4 grid gap-3">
        {cands?.map((c, i) => (
          <div key={i} className="app-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black" style={{ color: INK, fontFamily: MONO }}>{c.ncm}</span>
                <button
                  type="button"
                  onClick={() => copiar(c.ncm)}
                  className="rounded p-1"
                  style={{ color: MUTED }}
                  title={tx("Copiar", "Копировать")}
                >
                  {copiado === c.ncm ? <Check size={14} style={{ color: "var(--success)" }} /> : <Copy size={14} />}
                </button>
              </div>
              {c.confianca && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={{ background: "var(--app-bg2)", color: corConf(c.confianca) }}
                >
                  {tx("confiança", "уверенность")}: {c.confianca}
                </span>
              )}
            </div>
            {c.descricao_oficial && <p className="mt-1 text-sm font-semibold" style={{ color: INK }}>{c.descricao_oficial}</p>}
            {c.justificativa && <p className="mt-1 text-[13px]" style={{ color: MUTED }}>{c.justificativa}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
              {c.cest && (
                <span style={{ color: MUTED }}>
                  CEST <b style={{ color: INK, fontFamily: MONO }}>{c.cest}</b>
                  {c.sujeito_st_hint === true ? ` · ${tx("provável ST", "вероятно ST")}` : ""}
                </span>
              )}
              {c.fonte_url && (
                <a href={c.fonte_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline" style={{ color: "var(--info)" }}>
                  {tx("fonte oficial", "источник")} <ExternalLink size={11} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {cands && cands.length > 0 && (
        <p className="mt-4 text-[11px]" style={{ color: MUTED }}>
          {tx(
            "A IA sugere; a decisão final de enquadramento é do responsável. Confirme na fonte antes de usar na nota.",
            "ИИ предлагает; окончательное решение за ответственным.",
          )}
        </p>
      )}
    </div>
  );
}
