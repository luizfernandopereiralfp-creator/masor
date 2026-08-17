import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Loader2, Plus, Check, ExternalLink } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { Protegido } from "@/components/Protegido";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  component: () => (
    <Protegido>
      <Admin />
    </Protegido>
  ),
});

const NAVY = "var(--navy)";
const AMBER = "var(--amber)";
const MONO = "var(--font-mono)";

type TaxState = {
  sigla: string;
  nome: string | null;
  regiao: string | null;
  aliq_interna: number | null;
  equalizacao_simples: boolean | null;
  antecipacao_st: boolean | null;
  base_legal: string | null;
  fontes: { campo?: string; url?: string }[] | null;
  pesquisado_em: string | null;
  origem_dados: string | null;
  ativo: boolean;
};

type NcmRule = {
  id: string;
  ncm: string;
  uf: string | null;
  origem: string | null;
  pesquisado_em: string | null;
  fontes: { campo?: string; url?: string }[] | null;
};

function Admin() {
  const { lang } = useI18n();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);
  const { perfil } = useAuth();
  const staff = perfil?.role === "admin" || perfil?.role === "staff";

  const [estados, setEstados] = useState<TaxState[] | null>(null);
  const [regras, setRegras] = useState<NcmRule[]>([]);
  const [novaUF, setNovaUF] = useState("");
  const [salvo, setSalvo] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!supabase) return setEstados([]);
    const [{ data: e }, { data: r }] = await Promise.all([
      supabase.from("masor_tax_states").select("*").order("sigla"),
      supabase.from("masor_ncm_rules").select("id,ncm,uf,origem,pesquisado_em,fontes").order("updated_at", { ascending: false }).limit(50),
    ]);
    setEstados((e as TaxState[]) ?? []);
    setRegras((r as NcmRule[]) ?? []);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  function editar(sigla: string, campo: keyof TaxState, valor: unknown) {
    setEstados((es) => (es ?? []).map((e) => (e.sigla === sigla ? { ...e, [campo]: valor } : e)));
  }

  async function salvar(e: TaxState) {
    if (!supabase) return;
    await supabase
      .from("masor_tax_states")
      .update({
        nome: e.nome,
        regiao: e.regiao,
        aliq_interna: e.aliq_interna,
        equalizacao_simples: e.equalizacao_simples,
        antecipacao_st: e.antecipacao_st,
        base_legal: e.base_legal,
        ativo: e.ativo,
        origem_dados: (e.origem_dados ?? "") + (e.origem_dados?.includes("ajuste manual") ? "" : " + ajuste manual"),
        updated_at: new Date().toISOString(),
      })
      .eq("sigla", e.sigla);
    setSalvo(e.sigla);
    setTimeout(() => setSalvo(null), 2000);
  }

  async function adicionarUF() {
    const s = novaUF.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(s) || !supabase) return;
    await supabase.from("masor_tax_states").insert({ sigla: s, nome: s, ativo: true, origem_dados: "manual", pesquisado_em: new Date().toISOString().slice(0, 10) });
    setNovaUF("");
    await carregar();
  }

  if (!staff)
    return (
      <div className="flex min-h-screen items-center justify-center text-sm" style={{ color: NAVY }}>
        {tx("Apenas a equipe G41.", "Только команда G41.")}
      </div>
    );

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        {/* Adicionar UF */}
        <div className="mb-4 flex items-end gap-2">
          <label className="grid gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#6b7488" }}>{tx("Adicionar UF", "Добавить штат")}</span>
            <input value={novaUF} onChange={(e) => setNovaUF(e.target.value.toUpperCase().slice(0, 2))} placeholder="MG" className="w-24 rounded-md border px-3 py-2 text-sm" style={{ borderColor: "var(--border,#e2e8f0)", color: NAVY, fontFamily: MONO }} />
          </label>
          <button onClick={adicionarUF} className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-bold" style={{ background: AMBER, color: NAVY }}>
            <Plus size={15} /> {tx("Adicionar", "Добавить")}
          </button>
        </div>

        {estados === null ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin" style={{ color: AMBER }} /></div>
        ) : (
          <div className="grid gap-3">
            {estados.map((e) => (
              <div key={e.sigla} className="rounded-2xl border bg-white p-4" style={{ borderColor: "var(--border,#e2e8f0)" }}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: NAVY, fontFamily: MONO }}>
                    {e.sigla} <span style={{ color: "#8892A4", fontFamily: "inherit" }}>· {e.origem_dados}{e.pesquisado_em ? ` · ${e.pesquisado_em}` : ""}</span>
                  </span>
                  <button onClick={() => salvar(e)} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ background: NAVY }}>
                    {salvo === e.sigla ? <Check size={13} /> : null}
                    {salvo === e.sigla ? tx("Salvo", "Сохр.") : tx("Salvar", "Сохранить")}
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <Campo label={tx("Nome", "Имя")}>
                    <input className="ipt" value={e.nome ?? ""} onChange={(ev) => editar(e.sigla, "nome", ev.target.value)} />
                  </Campo>
                  <Campo label={tx("Alíq. interna (%)", "Внутр. ставка")}>
                    <input className="ipt" style={{ fontFamily: MONO }} value={e.aliq_interna ?? ""} onChange={(ev) => editar(e.sigla, "aliq_interna", ev.target.value === "" ? null : Number(ev.target.value.replace(",", ".")))} placeholder="⚠" />
                  </Campo>
                  <Campo label={tx("Região", "Регион")}>
                    <select className="ipt" value={e.regiao ?? ""} onChange={(ev) => editar(e.sigla, "regiao", ev.target.value || null)}>
                      <option value="">⚠ —</option>
                      <option value="sul_sudeste">Sul/Sudeste (12%)</option>
                      <option value="n_ne_co_es">N/NE/CO/ES (7%)</option>
                    </select>
                  </Campo>
                  <Campo label={tx("Ativo", "Активен")}>
                    <Toggle value={e.ativo} onChange={(v) => editar(e.sigla, "ativo", v)} />
                  </Campo>
                  <Campo label={tx("Equaliz. Simples", "Экв. Simples")}>
                    <TriToggle value={e.equalizacao_simples} onChange={(v) => editar(e.sigla, "equalizacao_simples", v)} tx={tx} />
                  </Campo>
                  <Campo label={tx("Antecip. ST", "Аванс ST")}>
                    <TriToggle value={e.antecipacao_st} onChange={(v) => editar(e.sigla, "antecipacao_st", v)} tx={tx} />
                  </Campo>
                  <div className="sm:col-span-2">
                    <Campo label={tx("Base legal", "Правовая база")}>
                      <input className="ipt" value={e.base_legal ?? ""} onChange={(ev) => editar(e.sigla, "base_legal", ev.target.value)} />
                    </Campo>
                  </div>
                </div>
                {Array.isArray(e.fontes) && e.fontes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {e.fontes.filter((f) => f.url).map((f, i) => (
                      <a key={i} href={f.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-[11px] underline" style={{ color: NAVY }}>
                        {f.campo ?? "fonte"}<ExternalLink size={10} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ncm_rules aprendidas */}
        <h2 className="mb-2 mt-8 text-sm font-bold uppercase tracking-widest" style={{ color: NAVY }}>{tx("Regras por NCM (base aprendida)", "Правила по NCM")}</h2>
        {regras.length === 0 ? (
          <p className="text-xs" style={{ color: "#8892A4" }}>{tx("Nenhuma regra gravada ainda. Aprovações em /pendencias alimentam esta base.", "Пока нет правил.")}</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border bg-white" style={{ borderColor: "var(--border,#e2e8f0)" }}>
            <table className="w-full text-xs" style={{ color: NAVY }}>
              <thead>
                <tr className="text-left" style={{ borderBottom: "2px solid var(--border,#e2e8f0)" }}>
                  {["NCM", "UF", tx("Origem", "Источник"), tx("Data", "Дата"), tx("Fontes", "Источники")].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {regras.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--border,#e2e8f0)" }}>
                    <td className="px-3 py-2" style={{ fontFamily: MONO }}>{r.ncm}</td>
                    <td className="px-3 py-2" style={{ fontFamily: MONO }}>{r.uf ?? "—"}</td>
                    <td className="px-3 py-2">{r.origem ?? "—"}</td>
                    <td className="px-3 py-2" style={{ color: "#8892A4" }}>{r.pesquisado_em ?? "—"}</td>
                    <td className="px-3 py-2">{Array.isArray(r.fontes) ? r.fontes.filter((f) => f.url).length : 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`.ipt{width:100%;border:1px solid #e3e7ef;border-radius:.5rem;padding:.4rem .6rem;font-size:.85rem;color:var(--navy);outline:none;background:#fff}.ipt:focus{border-color:var(--amber)}`}</style>
    </AppShell>
  );
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#6b7488" }}>{label}</span>
      {children}
    </label>
  );
}
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="rounded-md px-3 py-1.5 text-xs font-bold" style={value ? { background: NAVY, color: "#fff" } : { background: "#f1f3f8", color: NAVY }}>
      {value ? "Sim" : "Não"}
    </button>
  );
}
function TriToggle({ value, onChange, tx }: { value: boolean | null; onChange: (v: boolean | null) => void; tx: (pt: string, ru: string) => string }) {
  const opts: [boolean | null, string][] = [
    [true, "Sim"],
    [false, "Não"],
    [null, tx("⚠", "⚠")],
  ];
  return (
    <div className="inline-flex overflow-hidden rounded-md border" style={{ borderColor: "var(--border,#e2e8f0)" }}>
      {opts.map(([v, t]) => (
        <button key={String(v)} type="button" onClick={() => onChange(v)} className="px-2 py-1 text-[11px] font-bold" style={value === v ? { background: NAVY, color: "#fff" } : { background: "#fff", color: NAVY }}>
          {t}
        </button>
      ))}
    </div>
  );
}
