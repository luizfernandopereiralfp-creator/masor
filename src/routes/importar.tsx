import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ArrowLeft, Upload, Loader2, TriangleAlert, FileSpreadsheet, FileText } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Protegido } from "@/components/Protegido";
import { supabase } from "@/integrations/supabase/client";
import { parseNFe, itemParaOperacao, type NFeParsed, type NFeItem } from "@/lib/nfe/parse-nfe";
import { parseXlsx, linhaParaOperacao, type LinhaPlanilha } from "@/lib/planilha/parse-xlsx";
import { useEmpresa } from "@/lib/empresa";
import type { AnaliseFiscal } from "@/lib/ia/contrato";

export const Route = createFileRoute("/importar")({
  component: Importar,
});

const NAVY = "var(--navy)";
const AMBER = "var(--amber)";
const MONO = "var(--font-mono)";
const brl = (v: number | null | undefined) =>
  v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

type LinhaResultado = {
  estado: "loading" | "ok" | "error";
  pv?: number | null;
  status?: AnaliseFiscal["status"];
  pendencias?: number;
  erro?: string;
};

function Importar() {
  return (
    <Protegido>
      <ImportarConteudo />
    </Protegido>
  );
}

function ImportarConteudo() {
  const { lang } = useI18n();
  const { perfil } = useAuth();
  const { empresa } = useEmpresa();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);

  const [nfe, setNfe] = useState<NFeParsed | null>(null);
  const [planilha, setPlanilha] = useState<LinhaPlanilha[] | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [erroArquivo, setErroArquivo] = useState<string | null>(null);
  const [regime, setRegime] = useState("lucro_real");
  const [markup, setMarkup] = useState("20");
  const [municipio, setMunicipio] = useState("");
  const [resultados, setResultados] = useState<Record<string, LinhaResultado>>({});
  const [resultadosPl, setResultadosPl] = useState<Record<number, LinhaResultado>>({});

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErroArquivo(null);
    setResultados({});
    setFileName(file.name);
    const texto = await file.text();
    const parsed = parseNFe(texto);
    if (!parsed.ok) {
      setNfe(null);
      setErroArquivo(parsed.erro ?? tx("Falha ao ler o XML.", "Ошибка чтения XML."));
      return;
    }
    setNfe(parsed);
  }

  async function analisar(item: NFeItem) {
    if (!nfe) return;
    setResultados((r) => ({ ...r, [item.nItem]: { estado: "loading" } }));
    const operacao = itemParaOperacao(item, nfe, {
      regime_empresa: regime,
      markup_percent: markup,
      municipio: municipio || undefined,
    });
    try {
      const tok = supabase ? (await supabase.auth.getSession()).data.session?.access_token : null;
      const resp = await fetch("/api/analisar", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(tok ? { authorization: `Bearer ${tok}` } : {}),
        },
        body: JSON.stringify({ operacao, idioma: lang }),
      });
      const data = await resp.json();
      if (!data.ok) {
        setResultados((r) => ({ ...r, [item.nItem]: { estado: "error", erro: data.erro } }));
        return;
      }
      const a = data.analise as AnaliseFiscal;
      setResultados((r) => ({
        ...r,
        [item.nItem]: {
          estado: "ok",
          pv: a.formacao_preco.preco_venda_sugerido,
          status: a.status,
          pendencias: a.pendencias.length,
        },
      }));
      if (supabase && perfil?.tenant_id) {
        void supabase
          .from("product_simulations")
          .insert({ tenant_id: perfil.tenant_id, origem: "importacao", payload: operacao, analise: a });
      }
    } catch (err) {
      setResultados((r) => ({ ...r, [item.nItem]: { estado: "error", erro: (err as Error).message } }));
    }
  }

  async function analisarTodos() {
    if (!nfe) return;
    for (const item of nfe.itens) {
      // sequencial para não estourar rate limit da IA
      // eslint-disable-next-line no-await-in-loop
      await analisar(item);
    }
  }

  async function onXlsx(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErroArquivo(null);
    setResultadosPl({});
    setNfe(null);
    setFileName(file.name);
    const parsed = parseXlsx(await file.arrayBuffer());
    if (!parsed.ok) {
      setPlanilha(null);
      setErroArquivo(parsed.erro ?? tx("Falha ao ler a planilha.", "Ошибка чтения таблицы."));
      return;
    }
    setPlanilha(parsed.linhas);
  }

  async function analisarLinha(l: LinhaPlanilha) {
    setResultadosPl((r) => ({ ...r, [l.n]: { estado: "loading" } }));
    const operacao = linhaParaOperacao(l, empresa ?? {}, markup);
    try {
      const tok = supabase ? (await supabase.auth.getSession()).data.session?.access_token : null;
      const resp = await fetch("/api/analisar", {
        method: "POST",
        headers: { "content-type": "application/json", ...(tok ? { authorization: `Bearer ${tok}` } : {}) },
        body: JSON.stringify({ operacao, idioma: lang }),
      });
      const data = await resp.json();
      if (!data.ok) {
        setResultadosPl((r) => ({ ...r, [l.n]: { estado: "error", erro: data.erro } }));
        return;
      }
      const a = data.analise as AnaliseFiscal;
      setResultadosPl((r) => ({
        ...r,
        [l.n]: { estado: "ok", pv: a.formacao_preco.preco_venda_sugerido, status: a.status, pendencias: a.pendencias.length },
      }));
      if (supabase && perfil?.tenant_id) {
        void supabase.from("product_simulations").insert({ tenant_id: perfil.tenant_id, origem: "importacao", payload: operacao, analise: a });
      }
    } catch (err) {
      setResultadosPl((r) => ({ ...r, [l.n]: { estado: "error", erro: (err as Error).message } }));
    }
  }

  async function analisarTodasLinhas() {
    if (!planilha) return;
    for (const l of planilha) {
      if (l.custo != null && l.ncm && l.ncm.length === 8) {
        // eslint-disable-next-line no-await-in-loop
        await analisarLinha(l);
      }
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--app-bg, #eef1f6)" }}>
      <header className="flex items-center gap-3 px-5 py-3" style={{ background: NAVY }}>
        <Link to="/" className="text-white/80 hover:text-white">
          <ArrowLeft size={18} />
        </Link>
        <img src="/masor-logo.png" alt="Masor" className="h-6 w-auto brightness-0 invert" />
        <h1 className="text-sm font-bold tracking-wide text-white">· {tx("Importar em lote", "Массовый импорт")}</h1>
      </header>

      <main className="mx-auto max-w-6xl p-4 md:p-6">
        {/* upload */}
        <section className="grid gap-4 rounded-2xl border bg-white p-5" style={{ borderColor: "var(--border,#e2e8f0)" }}>
          <div className="flex flex-wrap items-end gap-4">
            <label className="grid gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: NAVY }}>
                {tx("Nota fiscal (NF-e XML)", "Накладная (NF-e XML)")}
              </span>
              <label
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
                style={{ background: AMBER, color: NAVY }}
              >
                <Upload size={16} />
                {tx("Escolher XML", "Выбрать XML")}
                <input type="file" accept=".xml,text/xml,application/xml" className="hidden" onChange={onFile} />
              </label>
            </label>
            <Campo label={tx("Regime da empresa", "Режим компании")}>
              <select value={regime} onChange={(e) => setRegime(e.target.value)} className="rounded-md border bg-white px-3 py-2 text-sm" style={{ borderColor: "var(--border,#e2e8f0)", color: NAVY }}>
                <option value="lucro_real">{tx("Lucro Real", "Lucro Real")}</option>
                <option value="presumido">{tx("Lucro Presumido", "Presumido")}</option>
                <option value="simples">{tx("Simples Nacional", "Simples")}</option>
              </select>
            </Campo>
            <Campo label={tx("Markup alvo (%)", "Наценка (%)")}>
              <input value={markup} onChange={(e) => setMarkup(e.target.value)} className="w-24 rounded-md border px-3 py-2 text-sm" style={{ borderColor: "var(--border,#e2e8f0)", color: NAVY, fontFamily: MONO }} />
            </Campo>
            <Campo label={tx("Município", "Город")}>
              <input value={municipio} onChange={(e) => setMunicipio(e.target.value)} placeholder="Campinas" className="w-40 rounded-md border px-3 py-2 text-sm" style={{ borderColor: "var(--border,#e2e8f0)", color: NAVY }} />
            </Campo>
          </div>
          {fileName && <p className="text-xs" style={{ color: "#8892A4" }}>{fileName}</p>}
          {erroArquivo && (
            <div className="flex gap-2 rounded-md px-3 py-2 text-xs" style={{ background: "var(--amber-soft)", color: NAVY }}>
              <TriangleAlert size={14} style={{ color: AMBER }} /> {erroArquivo}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-4 text-[11px]" style={{ color: "#8892A4" }}>
            <label className="inline-flex cursor-pointer items-center gap-1 font-semibold" style={{ color: NAVY }}>
              <FileSpreadsheet size={13} /> {tx("Importar planilha (XLSX/CSV)", "Импорт таблицы (XLSX/CSV)")}
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onXlsx} />
            </label>
            <span className="inline-flex items-center gap-1">
              <FileText size={13} /> {tx("PDF (DANFE): envie o XML da NF-e", "PDF: отправьте XML")}
            </span>
          </div>
        </section>

        {/* grid de itens */}
        {nfe && (
          <section className="mt-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm" style={{ color: NAVY }}>
                <b>{nfe.itens.length}</b> {tx("itens", "позиций")} ·{" "}
                <span style={{ color: "#8892A4" }}>
                  {nfe.emit_nome} ({nfe.emit_uf}) → {nfe.dest_uf}
                </span>
              </p>
              <button
                onClick={analisarTodos}
                className="rounded-lg px-4 py-2 text-sm font-bold"
                style={{ background: NAVY, color: "#fff" }}
              >
                {tx("Analisar todos com IA", "Анализ всех с ИИ")}
              </button>
            </div>
            <div className="overflow-x-auto rounded-2xl border bg-white" style={{ borderColor: "var(--border,#e2e8f0)" }}>
              <table className="w-full text-xs" style={{ color: NAVY }}>
                <thead>
                  <tr className="text-left" style={{ borderBottom: "2px solid var(--border,#e2e8f0)" }}>
                    {["#", tx("Produto", "Товар"), "NCM", "CEST", "CST", tx("Qtd", "Кол"), tx("Vlr unit.", "Цена"), tx("Crítica", "Проверка"), tx("Preço mín. (IA)", "Мин. цена (ИИ)")].map((h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-2 text-[10px] font-bold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {nfe.itens.map((item) => {
                    const r = resultados[item.nItem];
                    return (
                      <tr key={item.nItem} style={{ borderBottom: "1px solid var(--border,#e2e8f0)" }}>
                        <td className="px-3 py-2" style={{ fontFamily: MONO }}>{item.nItem}</td>
                        <td className="px-3 py-2">{item.xProd}</td>
                        <td className="px-3 py-2" style={{ fontFamily: MONO }}>{item.ncm ?? "—"}</td>
                        <td className="px-3 py-2" style={{ fontFamily: MONO }}>{item.cest ?? "—"}</td>
                        <td className="px-3 py-2" style={{ fontFamily: MONO }}>{item.cst_icms ?? "—"}</td>
                        <td className="px-3 py-2" style={{ fontFamily: MONO }}>{item.qCom ?? "—"}</td>
                        <td className="px-3 py-2" style={{ fontFamily: MONO }}>{brl(item.vUnCom)}</td>
                        <td className="px-3 py-2">
                          {item.criticas.length === 0 ? (
                            <span style={{ color: "var(--success,#16a34a)" }}>✓</span>
                          ) : (
                            <span className="inline-flex items-center gap-1" title={item.criticas.join(" · ")} style={{ color: AMBER }}>
                              <TriangleAlert size={12} /> {item.criticas.length}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2">
                          {!r && (
                            <button onClick={() => analisar(item)} className="rounded px-2 py-1 text-[10px] font-bold" style={{ background: AMBER, color: NAVY }}>
                              {tx("Analisar", "Анализ")}
                            </button>
                          )}
                          {r?.estado === "loading" && <Loader2 size={14} className="animate-spin" style={{ color: AMBER }} />}
                          {r?.estado === "ok" && (
                            <span className="inline-flex items-center gap-1.5">
                              <b style={{ fontFamily: MONO }}>{brl(r.pv)}</b>
                              {r.status !== "aprovado" && (
                                <span className="rounded px-1 py-0.5 text-[9px] font-bold" style={{ background: "var(--amber-soft)", color: NAVY }}>
                                  {r.pendencias ? `${r.pendencias} pend.` : r.status}
                                </span>
                              )}
                            </span>
                          )}
                          {r?.estado === "error" && <span title={r.erro} style={{ color: AMBER }}>⚠ erro</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[10px]" style={{ color: "#8892A4" }}>
              {tx(
                "Crítica estrutural é imediata e gratuita. A análise por IA (com fonte) roda sob demanda, item a item.",
                "Структурная проверка — сразу и бесплатно. Анализ ИИ — по запросу, по позиции.",
              )}
            </p>
          </section>
        )}

        {planilha && (
          <section className="mt-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm" style={{ color: NAVY }}>
                <b>{planilha.length}</b> {tx("linhas", "строк")}{" "}
                <span style={{ color: "#8892A4" }}>
                  · {tx("empresa", "компания")}: {empresa?.regime_tributario ?? regime} · {empresa?.uf ?? "—"}
                </span>
              </p>
              <button onClick={analisarTodasLinhas} className="rounded-lg px-4 py-2 text-sm font-bold" style={{ background: NAVY, color: "#fff" }}>
                {tx("Analisar todas com IA", "Анализ всех с ИИ")}
              </button>
            </div>
            <div className="overflow-x-auto rounded-2xl border bg-white" style={{ borderColor: "var(--border,#e2e8f0)" }}>
              <table className="w-full text-xs" style={{ color: NAVY }}>
                <thead>
                  <tr className="text-left" style={{ borderBottom: "2px solid var(--border,#e2e8f0)" }}>
                    {["#", tx("Produto", "Товар"), "NCM", tx("Custo", "Себест."), tx("Crítica", "Проверка"), tx("Preço mín. (IA)", "Мин. цена (ИИ)")].map((h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-2 text-[10px] font-bold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {planilha.map((l) => {
                    const r = resultadosPl[l.n];
                    const analisavel = !!l.ncm && l.ncm.length === 8 && l.custo != null;
                    return (
                      <tr key={l.n} style={{ borderBottom: "1px solid var(--border,#e2e8f0)" }}>
                        <td className="px-3 py-2" style={{ fontFamily: MONO }}>{l.n}</td>
                        <td className="px-3 py-2">{l.descricao ?? "—"}</td>
                        <td className="px-3 py-2" style={{ fontFamily: MONO }}>{l.ncm ?? "—"}</td>
                        <td className="px-3 py-2" style={{ fontFamily: MONO }}>{brl(l.custo)}</td>
                        <td className="px-3 py-2">
                          {l.criticas.length === 0 ? (
                            <span style={{ color: "var(--success,#16a34a)" }}>✓</span>
                          ) : (
                            <span className="inline-flex items-center gap-1" title={l.criticas.join(" · ")} style={{ color: AMBER }}>
                              <TriangleAlert size={12} /> {l.criticas.length}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2">
                          {!r && (
                            <button onClick={() => analisarLinha(l)} disabled={!analisavel} className="rounded px-2 py-1 text-[10px] font-bold disabled:opacity-40" style={{ background: AMBER, color: NAVY }}>
                              {tx("Analisar", "Анализ")}
                            </button>
                          )}
                          {r?.estado === "loading" && <Loader2 size={14} className="animate-spin" style={{ color: AMBER }} />}
                          {r?.estado === "ok" && (
                            <span className="inline-flex items-center gap-1.5">
                              <b style={{ fontFamily: MONO }}>{brl(r.pv)}</b>
                              {r.status !== "aprovado" && (
                                <span className="rounded px-1 py-0.5 text-[9px] font-bold" style={{ background: "var(--amber-soft)", color: NAVY }}>
                                  {r.pendencias ? `${r.pendencias} pend.` : r.status}
                                </span>
                              )}
                            </span>
                          )}
                          {r?.estado === "error" && <span title={r.erro} style={{ color: AMBER }}>⚠ erro</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[10px]" style={{ color: "#8892A4" }}>
              {tx(
                "Colunas mapeadas por heurística (descrição, NCM, custo, EAN, CFOP, UF). Os dados fixos vêm do cadastro da empresa.",
                "Столбцы сопоставлены эвристически; фиксированные данные — из профиля компании.",
              )}
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: NAVY }}>{label}</span>
      {children}
    </label>
  );
}
