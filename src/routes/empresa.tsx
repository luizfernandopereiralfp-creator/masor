import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Loader2, Check } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { Protegido } from "@/components/Protegido";
import { useEmpresa } from "@/lib/empresa";

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

function EmpresaConteudo() {
  const { lang } = useI18n();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);
  const { empresa, carregando, salvar } = useEmpresa();

  const [nome, setNome] = useState("");
  const [razao, setRazao] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [uf, setUf] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [regime, setRegime] = useState("lucro_real");
  const [markup, setMarkup] = useState("20");
  const [salvando, setSalvando] = useState(false);
  const [ok, setOk] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!empresa) return;
    setNome(empresa.nome ?? "");
    setRazao(empresa.razao_social ?? "");
    setCnpj(empresa.cnpj ?? "");
    setUf(empresa.uf ?? "");
    setMunicipio(empresa.municipio ?? "");
    setRegime(empresa.regime_tributario ?? "lucro_real");
    setMarkup(empresa.markup_padrao != null ? String(empresa.markup_padrao) : "20");
  }, [empresa]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    setOk(false);
    const r = await salvar({
      nome: nome || null,
      razao_social: razao || null,
      cnpj: cnpj || null,
      uf: uf ? uf.toUpperCase().slice(0, 2) : null,
      municipio: municipio || null,
      regime_tributario: regime,
      markup_padrao: markup ? Number(markup.replace(",", ".")) : null,
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
        <span className="text-sm font-bold text-white">· {tx("Cadastro da empresa", "Данные компании")}</span>
      </header>

      <main className="mx-auto max-w-2xl p-4 md:p-6">
        <p className="mb-4 text-sm" style={{ color: "#6b7488" }}>
          {tx(
            "Preencha uma vez os dados que não mudam. Eles pré-preenchem cada análise.",
            "Заполните один раз неизменные данные — они подставляются в каждый анализ.",
          )}
        </p>

        {carregando ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin" style={{ color: AMBER }} />
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-4 rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border,#e2e8f0)" }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label={tx("Nome fantasia", "Название")}>
                <input className="ipt" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Vantajoso" />
              </Campo>
              <Campo label={tx("Razão social", "Юр. название")}>
                <input className="ipt" value={razao} onChange={(e) => setRazao(e.target.value)} />
              </Campo>
              <Campo label="CNPJ">
                <input className="ipt" style={{ fontFamily: MONO }} value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
              </Campo>
              <Campo label={tx("Regime tributário", "Налоговый режим")}>
                <select className="ipt" value={regime} onChange={(e) => setRegime(e.target.value)}>
                  <option value="lucro_real">{tx("Lucro Real", "Lucro Real")}</option>
                  <option value="presumido">{tx("Lucro Presumido", "Presumido")}</option>
                  <option value="simples">{tx("Simples Nacional", "Simples")}</option>
                </select>
              </Campo>
              <Campo label={tx("UF (destino/loja)", "Штат (магазин)")}>
                <input className="ipt" style={{ fontFamily: MONO }} value={uf} onChange={(e) => setUf(e.target.value.toUpperCase().slice(0, 2))} placeholder="SP" />
              </Campo>
              <Campo label={tx("Município", "Город")}>
                <input className="ipt" value={municipio} onChange={(e) => setMunicipio(e.target.value)} placeholder="Campinas" />
              </Campo>
              <Campo label={tx("Markup/margem padrão (%)", "Наценка по умолчанию (%)")}>
                <input className="ipt" style={{ fontFamily: MONO }} value={markup} onChange={(e) => setMarkup(e.target.value)} />
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
        )}
      </main>

      <style>{`.ipt{width:100%;border:1px solid #e3e7ef;border-radius:.6rem;padding:.55rem .75rem;font-size:.875rem;color:var(--navy);outline:none;background:#fff}.ipt:focus{border-color:var(--amber);box-shadow:0 0 0 3px rgba(233,167,74,.16)}`}</style>
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
