import { Languages } from "lucide-react";

import { useI18n } from "@/lib/i18n";

/**
 * Seletor de idioma PT/RU flutuante — renderizado no root, disponível
 * em TODAS as telas. Persiste no localStorage (via I18nProvider).
 */
export function SeletorIdioma() {
  const { lang, setLang } = useI18n();
  const btn = (l: "pt" | "ru", rotulo: string) => (
    <button
      type="button"
      onClick={() => setLang(l)}
      aria-label={l === "ru" ? "Русский" : "Português"}
      aria-pressed={lang === l}
      className="rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors"
      style={lang === l ? { background: "var(--navy)", color: "#fff" } : { color: "var(--navy)" }}
    >
      {rotulo}
    </button>
  );
  return (
    <div
      className="fixed bottom-4 right-4 z-[60] flex items-center gap-0.5 rounded-full border bg-white/95 p-0.5 shadow-lg backdrop-blur"
      style={{ borderColor: "rgba(11,23,64,.12)" }}
    >
      <Languages size={13} className="ml-1.5 mr-0.5" style={{ color: "#8892A4" }} aria-hidden />
      {btn("pt", "PT")}
      {btn("ru", "RU")}
    </div>
  );
}
