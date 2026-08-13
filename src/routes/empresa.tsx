import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Loader2, Check, Building2, ExternalLink } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Protegido } from "@/components/Protegido";
import { useEmpresa, useClientesFiscais } from "@/lib/empresa";
import { useClienteAtivo } from "@/lib/cliente-ativo";

export const Route = createFileRoute("/empresa")({
  component: () => (
    <Protegido>
      <EmpresaConteudo />
    </Protegido>
  ),
});

const NAVY = "var(--navy)";
const AMBER = "var(--amber)";
const MONO = "var(--font-mono)";
const LIOR_CLIENTES = "https://lior.g41one.com.br/admin/clientes";

function EmpresaConteudo() {
  const { lang } = useI18n();
  const { perfil } = useAuth();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);
  const staff = perfil?.role === "admin" || perfil?.role === "staff";

  const [ativo, setAtivo] = useClienteAtivo();
  const { clientes, carregando: carregandoLista } = useClientesFiscais();
  const { empresa, carregando, salvar } = useEmpresa();

  const [markup, setMarkup] = useState("20");
  const [das, setDas] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!empresa) return;
    setMarkup(empresa.markup_padrao != null ? String(empresa.markup_padrao) : "20");
    setDas(empresa.das_efetivo != null ? String(empresa.das_efetivo) : "");
  }, [empresa]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    setOk(false);
    const r = await salvar({
      markup_padrao: markup ? Number(markup.replace(",", ".")) : null,
      das_efetivo: das ? Number(das.replace(",", ".")) : null,
    });
    setSalvando(false);
    if (r.erro) setErro(r.erro);
    else {
      setOk(true);
      setTimeout(() => setOk(false), 2500);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--app-bg,#eef1f6)" }}>
      <header className="flex items-center gap-3 px-5 py-3" style={{ background: NAVY }}>
        <Link to="/" className="text-white/80 hover:text-white">
          <ArrowLeft size={18} />
        </Link>
        <img src="/masor-logo.png" alt="Masor" className="h-6 w-auto rounded bg-white px-2 py-1" />
        <span className="text-sm font-bold text-white">· {tx("Cliente / empresa", "Клиент / компания")}</span>
      </header>

      <main className="mx-auto max-w-2xl p-4 md:p-6">
        <p className="mb-4 text-sm" style={{ color: "#6b7488" }}>
          {tx(
            "Os clientes são os mesmos do Lior. Escolha um para trabalhar — os dados pré-preenchem cada análise.",
            "Клиенты те же, что в Lior. Выберите одного — данные подставляются в анализ.",
          )}
        </p>

        {/* seletor de cliente (equipe) */}
        {staff && (
          <div className="mb-4 rounded-2xl border bg-white p-4" style={{ borderColor: "var(--border,#e2e8f0)" }}>
            <label className="grid gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#6b7488" }}>
                {tx("Cliente ativo", "Активный клиент")}
              </span>
              {carregandoLista ? (
                <span className="flex items-center gap-2 text-sm" style={{ color: "#8892A4" }}>
                  <Loader2 size={14} className="animate-spin" /> {tx("carregando clientes…", "загрузка…")}
                </span>
              ) : (
                <select className="ipt" value={ativo ?? ""} onChange={(e) => setAtivo(e.target.value || null)}>
                  <option value="">{tx("— selecione um cliente —", "— выберите клиента —")}</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.razao_social ?? c.nome_fantasia ?? c.id}
                      {c.cnpj_cpf ? ` · ${c.cnpj_cpf}` : ""}
                    </option>
                  ))}
                </select>
              )}
            </label>
            <a href={LIOR_CLIENTES} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold underline" style={{ color: NAVY }}>
              {tx("Cadastrar/editar clientes no Lior", "Клиенты — в Lior")}
              <ExternalLink size={11} />
            </a>
          </div>
        )}

        {!ativo && staff ? (
          <div className="rounded-2xl border bg-white p-8 text-center" style={{ borderColor: "var(--border,#e2e8f0)" }}>
            <Building2 size={26} className="mx-auto" style={{ color: AMBER }} />
            <p className="mt-2 text-sm" style={{ color: "#8892A4" }}>
              {tx("Escolha um cliente acima para ver os dados e configurar.", "Выберите клиента выше.")}
            </p>
          </div>
        ) : carregando ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin" style={{ color: AMBER }} />
          </div>
        ) : !empresa ? (
          <div className="rounded-2xl border bg-white p-8 text-center text-sm" style={{ borderColor: "var(--border,#e2e8f0)", color: "#8892A4" }}>
            {tx("Cliente não encontrado.", "Клиент не найден.")}
          </div>
        ) : (
          <>
            {/* identidade (do Lior — leitura) */}
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border,#e2e8f0)" }}>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-bold" style={{ color: NAVY }}>{empresa.razao_social ?? empresa.nome ?? "—"}</h2>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "var(--amber-soft)", color: NAVY }}>
                  {tx("dados do Lior", "из Lior")}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Leitura label={tx("Nome fantasia", "Название")} valor={empresa.nome} />
                <Leitura label="CNPJ" valor={empresa.cnpj} mono />
                <Leitura label={tx("Regime tributário", "Налоговый режим")} valor={regimeLabel(empresa.regime_tributario, tx)} />
                <Leitura label={tx("UF · Município", "Штат · Город")} valor={[empresa.uf, empresa.municipio].filter(Boolean).join(" · ") || null} />
              </div>
              <p className="mt-3 text-[11px]" style={{ color: "#8892A4" }}>
                {tx("Identidade, CNPJ e endereço são geridos no Lior (fonte única).", "Идентичность и адрес — в Lior.")}
              </p>
            </div>

            {/* config do Masor (editável) */}
            <form onSubmit={submit} className="mt-4 grid gap-4 rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border,#e2e8f0)" }}>
              <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: NAVY }}>
                {tx("Configuração fiscal (Masor)", "Настройки (Masor)")}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo label={tx("Markup/margem padrão (%)", "Наценка по умолчанию (%)")}>
                  <input className="ipt" style={{ fontFamily: MONO }} value={markup} onChange={(e) => setMarkup(e.target.value)} />
                </Campo>
                <Campo label={tx("DAS efetivo (%) — Simples", "DAS (%) — Simples")}>
                  <input className="ipt" style={{ fontFamily: MONO }} value={das} onChange={(e) => setDas(e.target.value)} placeholder="ex.: 6,8" />
                </Campo>
              </div>
              {erro && <p className="text-xs" style={{ color: "var(--warn,#b45309)" }}>⚠ {erro}</p>}
              <div className="flex items-center gap-3">
                <button type="submit" disabled={salvando} className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60" style={{ background: NAVY }}>
                  {salvando ? <Loader2 size={16} className="animate-spin" /> : ok ? <Check size={16} /> : null}
                  {ok ? tx("Salvo!", "Сохранено!") : tx("Salvar", "Сохранить")}
                </button>
                <Link to="/consulta" className="text-sm font-semibold" style={{ color: NAVY }}>
                  {tx("Ir para a análise →", "К анализу →")}
                </Link>
              </div>
            </form>
          </>
        )}
      </main>

      <style>{`.ipt{width:100%;border:1px solid #e3e7ef;border-radius:.6rem;padding:.55rem .75rem;font-size:.875rem;color:var(--navy);outline:none;background:#fff}.ipt:focus{border-color:var(--amber);box-shadow:0 0 0 3px rgba(233,167,74,.16)}`}</style>
    </div>
  );
}

function regimeLabel(r: string | null, tx: (pt: string, ru: string) => string): string | null {
  if (!r) return null;
  const k = r.toLowerCase();
  if (k.includes("real")) return "Lucro Real";
  if (k.includes("presum")) return tx("Lucro Presumido", "Presumido");
  if (k.includes("simples")) return "Simples Nacional";
  return r;
}

function Leitura({ label, valor, mono }: { label: string; valor: string | null; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#8892A4" }}>{label}</p>
      <p className="text-sm" style={{ color: NAVY, fontFamily: mono ? MONO : undefined }}>{valor ?? "—"}</p>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#6b7488" }}>{label}</span>
      {children}
    </label>
  );
}
