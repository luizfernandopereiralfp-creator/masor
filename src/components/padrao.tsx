import { type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

/* ============================================================
   Masor — componentes canônicos do padrão (Lior).
   Um padrão só por elemento: chip de status, erro legível,
   faixa de seção e estado-vazio. ZERO VERMELHO — atenção/atraso
   = âmbar; sucesso = verde.
   ============================================================ */

type TomChip = "pendente" | "atrasado" | "aVencer" | "concluido" | "pago" | "na" | "ativo" | "info";

const TONS: Record<TomChip, { bg: string; fg: string; dot: string }> = {
  pendente: { bg: "var(--tint-amber)", fg: "var(--amber-text)", dot: "var(--amber)" },
  atrasado: { bg: "var(--tint-amber)", fg: "var(--amber-text)", dot: "var(--amber)" },
  aVencer: { bg: "var(--tint-amber)", fg: "var(--amber-text)", dot: "var(--amber)" },
  concluido: { bg: "var(--success-soft)", fg: "var(--success)", dot: "var(--success)" },
  pago: { bg: "var(--success-soft)", fg: "var(--success)", dot: "var(--success)" },
  na: { bg: "var(--app-bg2)", fg: "var(--app-muted)", dot: "var(--app-faint)" },
  ativo: { bg: "var(--tint-navy)", fg: "var(--navy)", dot: "var(--navy)" },
  info: { bg: "var(--tint-navy)", fg: "var(--navy)", dot: "var(--info)" },
};

/** Chip de status (pílula + ponto de cor). Padrão único em todo o sistema. */
export function Chip({ tom, children }: { tom: TomChip; children: ReactNode }) {
  const c = TONS[tom];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: c.bg, color: c.fg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.dot }} />
      {children}
    </span>
  );
}

/** Erro legível: caixa âmbar + texto humano (nunca "Error 409"). */
export function ErroLegivel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border px-3 py-2 text-sm" style={{ background: "var(--tint-amber)", borderColor: "var(--amber-soft)", color: "var(--app-ink)" }}>
      <TriangleAlert size={16} className="mt-0.5 shrink-0" style={{ color: "var(--amber-text)" }} />
      <span className="leading-snug">{children}</span>
    </div>
  );
}

/** Faixa de seção: barra navy 4px + título 15/600 + chip de contagem opcional. */
export function FaixaSecao({ titulo, contagem, direita }: { titulo: string; contagem?: ReactNode; direita?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="h-4 w-1 rounded" style={{ background: "var(--navy)" }} />
      <h3 className="text-[15px] font-semibold" style={{ color: "var(--app-ink)" }}>{titulo}</h3>
      {contagem != null && <Chip tom="info">{contagem}</Chip>}
      {direita && <div className="ml-auto">{direita}</div>}
    </div>
  );
}

/** Estado vazio que ensina o próximo passo (globo esmaecido + frase + ação). */
export function EstadoVazio({ titulo, descricao, acao }: { titulo: string; descricao?: string; acao?: ReactNode }) {
  return (
    <div className="rounded-2xl border p-10 text-center" style={{ borderColor: "var(--app-line)", background: "var(--card)" }}>
      <img src="/globe.png" alt="" className="mx-auto" style={{ height: 40, opacity: 0.28 }} />
      <p className="mt-3 text-sm font-semibold" style={{ color: "var(--app-ink)" }}>{titulo}</p>
      {descricao && <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed" style={{ color: "var(--app-muted)" }}>{descricao}</p>}
      {acao && <div className="mt-3 flex justify-center">{acao}</div>}
    </div>
  );
}
