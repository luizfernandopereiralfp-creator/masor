import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Check, X, ExternalLink } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { Protegido } from "@/components/Protegido";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/pendencias")({
  component: () => (
    <Protegido>
      <Pendencias />
    </Protegido>
  ),
});

const NAVY = "var(--navy)";
const INK = "var(--app-ink)";
const AMBER = "var(--amber)";
const MONO = "var(--font-mono)";

type Solicitacao = {
  id: string;
  alvo: string;
  proposta: { ncm?: string; uf?: string; regime?: string; informacao_adicional?: string | null } & Record<string, unknown>;
  justificativa: string | null;
  fontes: { url?: string; campo?: string }[];
  status: string;
  created_at: string;
};

function Pendencias() {
  const { lang } = useI18n();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);
  const { perfil } = useAuth();
  const [regs, setRegs] = useState<Solicitacao[] | null>(null);
  const staff = perfil?.role === "admin" || perfil?.role === "staff";

  const carregar = useCallback(async () => {
    if (!supabase) return setRegs([]);
    const { data } = await supabase
      .from("masor_rule_change_requests")
      .select("id,alvo,proposta,justificativa,fontes,status,created_at")
      .eq("status", "pendente")
      .order("created_at", { ascending: false })
      .limit(100);
    setRegs((data as Solicitacao[]) ?? []);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function decidir(s: Solicitacao, aprovar: boolean) {
    if (!supabase) return;
    const hoje = new Date().toISOString().slice(0, 10);
    const [tipo, chave, ufAlvo] = s.alvo.split(":");
    const p = s.proposta as Record<string, unknown>;

    // Gate humano visível: mostra exatamente o que será gravado antes de aplicar.
    if (aprovar) {
      const preview = `${s.alvo}\n\n${JSON.stringify(s.proposta, null, 2).slice(0, 900)}`;
      const ok = window.confirm(
        tx("Aplicar esta mudança na base fiscal? Ela passa a valer para as próximas análises.\n\n", "Применить это изменение в базе?\n\n") + preview,
      );
      if (!ok) return;
    }

    const { error: upErr } = await supabase
      .from("masor_rule_change_requests")
      .update({ status: aprovar ? "aprovado" : "rejeitado", revisado_por: perfil?.user_id ?? null })
      .eq("id", s.id);
    if (upErr) {
      window.alert(tx("Não consegui atualizar a solicitação.", "Не удалось обновить запрос."));
      return;
    }

    if (aprovar) {
      if (tipo === "ncm_rules" && /^\d{8}$/.test(chave ?? "")) {
        await supabase.from("masor_ncm_rules").upsert(
          {
            ncm: chave,
            uf: ufAlvo ?? (typeof p.uf === "string" ? p.uf : null),
            parametros: (p.parametros_aplicados ?? p.parametros ?? p) as Record<string, unknown>,
            fontes: s.fontes ?? [],
            origem: "usuario+verificado",
            status: "ativo",
            pesquisado_em: hoje,
          },
          { onConflict: "ncm,uf" },
        );
      } else if (tipo === "tax_states" && /^[A-Z]{2}$/.test(chave ?? "")) {
        // Só campos conhecidos de tax_states — nunca o blob inteiro da IA.
        const campos: Record<string, unknown> = { origem_dados: "usuario+verificado", updated_at: new Date().toISOString() };
        for (const k of ["nome", "regiao", "aliq_interna", "equalizacao_simples", "antecipacao_st", "base_legal"])
          if (p[k] !== undefined) campos[k] = p[k];
        await supabase.from("masor_tax_states").update(campos).eq("sigla", chave);
      } else {
        window.alert(tx("Alvo não reconhecido — solicitação marcada, mas nada aplicado automaticamente.", "Цель не распознана — ничего не применено."));
      }
    }
    await carregar();
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        {!staff ? (
          <div className="rounded-2xl border bg-[var(--card)] p-8 text-center text-sm" style={{ borderColor: "var(--border,#e2e8f0)", color: INK }}>
            {tx("Apenas a equipe fiscal G41 acessa esta fila.", "Только команда G41.")}
          </div>
        ) : regs === null ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin" style={{ color: AMBER }} />
          </div>
        ) : regs.length === 0 ? (
          <div className="rounded-2xl border bg-[var(--card)] p-10 text-center text-sm" style={{ borderColor: "var(--border,#e2e8f0)", color: "var(--app-muted)" }}>
            {tx("Nenhuma pendência. Tudo em dia. 🎉", "Нет ожидающих. 🎉")}
          </div>
        ) : (
          <div className="grid gap-3">
            {regs.map((s) => (
              <div key={s.id} className="rounded-2xl border bg-[var(--card)] p-4" style={{ borderColor: "var(--border,#e2e8f0)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="text-xs" style={{ color: INK }}>
                    <span className="font-bold" style={{ fontFamily: MONO }}>{s.alvo}</span>
                    <span className="ml-2" style={{ color: "var(--app-muted)" }}>{new Date(s.created_at).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => decidir(s, true)} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ background: "var(--success,#16a34a)" }}>
                      <Check size={13} /> {tx("Aprovar", "Одобрить")}
                    </button>
                    <button onClick={() => decidir(s, false)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold" style={{ borderColor: "var(--border,#e2e8f0)", color: INK }}>
                      <X size={13} /> {tx("Rejeitar", "Отклонить")}
                    </button>
                  </div>
                </div>
                {s.justificativa && <p className="mt-2 text-sm" style={{ color: INK }}>{s.justificativa}</p>}
                {s.proposta?.informacao_adicional && (
                  <p className="mt-1 text-xs" style={{ color: "var(--app-muted)" }}>“{s.proposta.informacao_adicional}”</p>
                )}
                {Array.isArray(s.fontes) && s.fontes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {s.fontes.filter((f) => f.url).map((f, i) => (
                      <a key={i} href={f.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-[11px] underline" style={{ color: INK }}>
                        {f.campo ?? tx("fonte", "источник")}
                        <ExternalLink size={10} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
