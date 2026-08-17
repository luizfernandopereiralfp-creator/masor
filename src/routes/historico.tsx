import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, PackageSearch, Download } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { Protegido } from "@/components/Protegido";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { exportarHistoricoXlsx } from "@/lib/export/planilha";
import type { AnaliseFiscal } from "@/lib/ia/contrato";

export const Route = createFileRoute("/historico")({
  component: () => (
    <Protegido>
      <Historico />
    </Protegido>
  ),
});

const NAVY = "var(--navy)";
const INK = "var(--app-ink)";
const AMBER = "var(--amber)";
const MONO = "var(--font-mono)";

type Registro = {
  id: string;
  origem: string;
  created_at: string;
  payload: Record<string, unknown> | null;
  analise: {
    status?: string;
    formacao_preco?: { preco_venda_sugerido?: number | null; custo_tributario_liquido?: number | null };
    pendencias?: unknown[];
  } | null;
};

const brl = (v: number | null | undefined) =>
  v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

function Historico() {
  const { lang } = useI18n();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);
  const { perfil } = useAuth();
  const [regs, setRegs] = useState<Registro[] | null>(null);

  useEffect(() => {
    void (async () => {
      if (!supabase || !perfil) {
        setRegs([]);
        return;
      }
      const { data } = await supabase
        .from("masor_product_simulations")
        .select("id,origem,created_at,payload,analise")
        .order("created_at", { ascending: false })
        .limit(100);
      setRegs((data as Registro[]) ?? []);
    })();
  }, [perfil?.user_id]);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        {regs && regs.length > 0 && (
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() =>
                exportarHistoricoXlsx(
                  regs.map((r) => ({
                    criado_em: r.created_at,
                    origem: r.origem,
                    payload: r.payload,
                    analise: r.analise as unknown as AnaliseFiscal,
                  })),
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold"
              style={{ background: AMBER, color: INK }}
            >
              <Download size={13} /> {tx("Exportar", "Экспорт")}
            </button>
          </div>
        )}
        {regs === null ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin" style={{ color: AMBER }} />
          </div>
        ) : regs.length === 0 ? (
          <div className="rounded-2xl border bg-[var(--card)] p-10 text-center" style={{ borderColor: "var(--border,#e2e8f0)" }}>
            <PackageSearch size={30} className="mx-auto" style={{ color: AMBER }} />
            <p className="mt-3 text-sm font-semibold" style={{ color: INK }}>
              {tx("Nenhuma análise ainda", "Пока нет анализов")}
            </p>
            <Link to="/consulta" className="mt-3 inline-block text-sm font-semibold underline" style={{ color: INK }}>
              {tx("Analisar um produto →", "Анализ товара →")}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border bg-[var(--card)]" style={{ borderColor: "var(--border,#e2e8f0)" }}>
            <table className="w-full text-xs" style={{ color: INK }}>
              <thead>
                <tr className="text-left" style={{ borderBottom: "2px solid var(--border,#e2e8f0)" }}>
                  {[tx("Data", "Дата"), tx("Produto", "Товар"), tx("NCM", "NCM"), tx("Origem", "Источник"), tx("Status", "Статус"), tx("Custo líq.", "Себест."), tx("Preço mín.", "Мин. цена")].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2 text-[10px] font-bold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {regs.map((r) => {
                  const p = (r.payload ?? {}) as Record<string, unknown>;
                  const st = r.analise?.status ?? "—";
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--border,#e2e8f0)" }}>
                      <td className="whitespace-nowrap px-3 py-2" style={{ color: "var(--app-muted)" }}>
                        {new Date(r.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-3 py-2">{String(p.produto_descricao ?? "—")}</td>
                      <td className="px-3 py-2" style={{ fontFamily: MONO }}>{String(p.ncm ?? "—")}</td>
                      <td className="px-3 py-2">{r.origem === "importacao" ? tx("NF-e", "NF-e") : tx("Consulta", "Запрос")}</td>
                      <td className="px-3 py-2">
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                          style={st === "aprovado" ? { background: NAVY, color: "#fff" } : { background: "var(--amber-soft)", color: INK }}
                        >
                          {st}
                        </span>
                      </td>
                      <td className="px-3 py-2" style={{ fontFamily: MONO }}>{brl(r.analise?.formacao_preco?.custo_tributario_liquido)}</td>
                      <td className="px-3 py-2 font-bold" style={{ fontFamily: MONO }}>{brl(r.analise?.formacao_preco?.preco_venda_sugerido)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
