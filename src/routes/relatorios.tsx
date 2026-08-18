import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, FileSpreadsheet, Download, ArrowUp, ArrowDown, X, Check } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { Protegido } from "@/components/Protegido";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useClienteAtivo } from "@/lib/cliente-ativo";
import { listarProdutos, type Produto } from "@/lib/produtos";
import { CATALOGO, PRESETS, gerarRelatorioXlsx } from "@/lib/export/relatorio";

export const Route = createFileRoute("/relatorios")({
  component: () => (
    <Protegido>
      <Relatorios />
    </Protegido>
  ),
});

const INK = "var(--app-ink)";
const AMBER = "var(--amber)";
const NAVY = "var(--navy)";
const MUTED = "var(--app-muted)";
const BORDER = "var(--border,#e2e8f0)";

type ClienteFiscal = { id: string; razao_social: string | null; nome_fantasia: string | null; cnpj_cpf: string | null; regime_tributario: string | null; endereco: { uf?: string } | null };

// Grupos na ordem em que aparecem no catálogo.
const GRUPOS = [...new Set(CATALOGO.map((c) => c.grupo))];

function Relatorios() {
  const { lang } = useI18n();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);

  const [clienteId, setClienteId] = useClienteAtivo();
  const [clientes, setClientes] = useState<ClienteFiscal[] | null>(null);
  const [produtos, setProdutos] = useState<Produto[] | null>(null);
  const [sel, setSel] = useState<string[]>(PRESETS[0].colunas);
  const [presetId, setPresetId] = useState<string>(PRESETS[0].id);
  const [gerando, setGerando] = useState(false);

  // Carrega os clientes fiscais (staff escolhe qual).
  useEffect(() => {
    void (async () => {
      if (!supabase) return setClientes([]);
      const { data } = await supabase.rpc("masor_clientes_fiscais");
      setClientes((data as ClienteFiscal[]) ?? []);
    })();
  }, []);

  // Carrega os produtos do cliente ativo.
  useEffect(() => {
    void (async () => {
      if (!clienteId) return setProdutos(null);
      setProdutos(null);
      setProdutos(await listarProdutos(clienteId));
    })();
  }, [clienteId]);

  const clienteAtual = useMemo(() => clientes?.find((c) => c.id === clienteId) ?? null, [clientes, clienteId]);
  const comAnalise = useMemo(() => (produtos ?? []).filter((p) => p.analise).length, [produtos]);

  function aplicarPreset(id: string) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPresetId(id);
    setSel(p.colunas);
  }

  function toggle(chave: string) {
    setPresetId("custom");
    setSel((s) => (s.includes(chave) ? s.filter((c) => c !== chave) : [...s, chave]));
  }

  function mover(chave: string, dir: -1 | 1) {
    setPresetId("custom");
    setSel((s) => {
      const i = s.indexOf(chave);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= s.length) return s;
      const n = [...s];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  }

  async function gerar() {
    if (!produtos?.length || !sel.length) return;
    setGerando(true);
    try {
      await gerarRelatorioXlsx(produtos, sel, {
        cliente: clienteAtual?.nome_fantasia || clienteAtual?.razao_social,
        cnpj: clienteAtual?.cnpj_cpf,
        uf: clienteAtual?.endereco?.uf,
        regime: clienteAtual?.regime_tributario,
        emitidoEm: new Date().toISOString(),
        titulo: tx("Masor — Relatório de formação de preço", "Masor — Отчёт о ценообразовании"),
      });
    } finally {
      setGerando(false);
    }
  }

  const rotuloCol = (ch: string) => CATALOGO.find((c) => c.chave === ch)?.rotulo ?? ch;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center gap-2.5">
          <FileSpreadsheet size={22} style={{ color: AMBER }} />
          <div>
            <h1 className="text-lg font-bold" style={{ color: INK }}>{tx("Relatórios", "Отчёты")}</h1>
            <p className="text-xs" style={{ color: MUTED }}>
              {tx("Gere uma planilha com toda a memória de cálculo por produto — escolha as colunas, a ordem e o modelo.", "Сформируйте таблицу с полным расчётом по каждому товару — выберите столбцы, порядок и шаблон.")}
            </p>
          </div>
        </div>

        {/* Cliente */}
        <div className="mb-4 rounded-2xl border bg-[var(--card)] p-4" style={{ borderColor: BORDER }}>
          <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: MUTED }}>{tx("Cliente", "Клиент")}</label>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <select
              value={clienteId ?? ""}
              onChange={(e) => setClienteId(e.target.value || null)}
              className="min-w-[240px] rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: BORDER, color: INK, background: "var(--card)" }}
            >
              <option value="">{tx("— selecione —", "— выберите —")}</option>
              {(clientes ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.nome_fantasia || c.razao_social || c.cnpj_cpf || c.id}</option>
              ))}
            </select>
            {produtos && (
              <span className="text-xs" style={{ color: MUTED }}>
                {produtos.length} {tx("produtos", "товаров")} · {comAnalise} {tx("com análise fiscal", "с анализом")}
              </span>
            )}
          </div>
        </div>

        {/* Presets */}
        <div className="mb-4">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: MUTED }}>{tx("Modelo", "Шаблон")}</div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const on = presetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => aplicarPreset(p.id)}
                  title={p.descricao}
                  className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
                  style={on ? { background: NAVY, color: "#fff", borderColor: NAVY } : { borderColor: BORDER, color: INK }}
                >
                  {p.nome}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Catálogo de colunas */}
          <div className="rounded-2xl border bg-[var(--card)] p-4" style={{ borderColor: BORDER }}>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: MUTED }}>{tx("Colunas disponíveis", "Доступные столбцы")}</div>
            <div className="space-y-3">
              {GRUPOS.map((g) => (
                <div key={g}>
                  <div className="mb-1 text-[11px] font-bold" style={{ color: INK }}>{g}</div>
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {CATALOGO.filter((c) => c.grupo === g).map((c) => {
                      const on = sel.includes(c.chave);
                      return (
                        <button
                          key={c.chave}
                          type="button"
                          onClick={() => toggle(c.chave)}
                          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs transition"
                          style={{ color: INK, background: on ? "var(--amber-soft)" : "transparent" }}
                        >
                          <span
                            className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border"
                            style={{ borderColor: on ? AMBER : BORDER, background: on ? AMBER : "transparent" }}
                          >
                            {on && <Check size={10} style={{ color: NAVY }} />}
                          </span>
                          {c.rotulo}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Colunas selecionadas (ordem) */}
          <div className="rounded-2xl border bg-[var(--card)] p-4" style={{ borderColor: BORDER }}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: MUTED }}>{tx("Colunas do relatório (ordem)", "Столбцы отчёта (порядок)")}</span>
              <span className="text-[10px]" style={{ color: MUTED }}>{sel.length}</span>
            </div>
            {sel.length === 0 ? (
              <p className="py-6 text-center text-xs" style={{ color: MUTED }}>{tx("Selecione colunas ao lado.", "Выберите столбцы слева.")}</p>
            ) : (
              <ol className="space-y-1">
                {sel.map((ch, i) => (
                  <li key={ch} className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs" style={{ borderColor: BORDER, color: INK }}>
                    <span className="w-4 text-right tabular-nums" style={{ color: MUTED }}>{i + 1}</span>
                    <span className="flex-1 truncate">{rotuloCol(ch)}</span>
                    <button type="button" onClick={() => mover(ch, -1)} disabled={i === 0} className="p-0.5 disabled:opacity-30" title={tx("Subir", "Вверх")}><ArrowUp size={13} /></button>
                    <button type="button" onClick={() => mover(ch, 1)} disabled={i === sel.length - 1} className="p-0.5 disabled:opacity-30" title={tx("Descer", "Вниз")}><ArrowDown size={13} /></button>
                    <button type="button" onClick={() => toggle(ch)} className="p-0.5" title={tx("Remover", "Убрать")}><X size={13} /></button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Ação */}
        <div className="mt-5 flex items-center justify-end gap-3">
          {produtos === null && clienteId && <Loader2 className="animate-spin" size={16} style={{ color: AMBER }} />}
          <button
            type="button"
            onClick={gerar}
            disabled={!produtos?.length || !sel.length || gerando}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-40"
            style={{ background: AMBER, color: NAVY }}
          >
            {gerando ? <Loader2 className="animate-spin" size={15} /> : <Download size={15} />}
            {tx("Gerar planilha (XLSX)", "Сформировать (XLSX)")}
          </button>
        </div>
        {clienteId && produtos?.length === 0 && (
          <p className="mt-2 text-right text-xs" style={{ color: MUTED }}>
            {tx("Este cliente ainda não tem produtos cadastrados.", "У этого клиента ещё нет товаров.")}
          </p>
        )}
      </div>
    </AppShell>
  );
}
