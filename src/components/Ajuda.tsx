import { HelpCircle } from "lucide-react";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useI18n } from "@/lib/i18n";

/* ============================================================
   Masor — "?" de ajuda contextual por campo.
   Mostra uma explicação curta no idioma atual (pt/ru) e, abaixo,
   a versão no outro idioma. Click-para-abrir (funciona no mobile).
   Uso: <Ajuda pt="..." ru="..." /> ao lado do rótulo de um campo.
   ============================================================ */

export function Ajuda({ pt, ru }: { pt: string; ru: string }) {
  const { lang } = useI18n();
  const principal = lang === "ru" ? ru : pt;
  const secundaria = lang === "ru" ? pt : ru;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Ajuda"
          // stopPropagation impede o <label> de focar o input ao clicar no "?".
          // NÃO usar preventDefault: o Radix pula o toggle se defaultPrevented=true.
          onClick={(e) => e.stopPropagation()}
          className="inline-flex h-4 w-4 items-center justify-center rounded-full align-middle opacity-70 transition hover:opacity-100"
          style={{ color: "var(--amber)" }}
        >
          <HelpCircle size={13} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-64 rounded-xl border p-3 shadow-lg"
        style={{ background: "var(--card)", borderColor: "var(--border,#e2e8f0)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[12px] leading-snug" style={{ color: "var(--app-ink)" }}>{principal}</p>
        <p className="mt-1.5 border-t pt-1.5 text-[11px] leading-snug" style={{ color: "var(--app-muted)", borderColor: "var(--border,#e2e8f0)" }}>
          {secundaria}
        </p>
      </PopoverContent>
    </Popover>
  );
}
