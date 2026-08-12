import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, ShieldCheck, TriangleAlert, Upload, RefreshCw, FileText } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { Protegido } from "@/components/Protegido";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/fiscal")({
  component: () => (
    <Protegido>
      <Fiscal />
    </Protegido>
  ),
});

const NAVY = "var(--navy)";
const AMBER = "var(--amber)";
const MONO = "var(--font-mono)";

type Certificado = {
  id: string;
  empresa: string | null;
  cnpj: string;
  titular: string | null;
  validade_ate: string | null;
  criado_em: string;
};

type Doc = {
  id: string;
  nsu: string;
  chave44: string | null;
  tipo: string;
  resumo: Record<string, unknown>;
  capturado_em: string;
};

const brl = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return isNaN(n) ? "—" : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

function Fiscal() {
  const { lang } = useI18n();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);
  const { perfil } = useAuth();
  const staff = perfil?.role === "admin" || perfil?.role === "staff";

  const [cert, setCert] = useState<Certificado | null>(null);
  const [cofreOk, setCofreOk] = useState(true);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const token = useCallback(async () => {
    if (!supabase) return null;
    return (await supabase.auth.getSession()).data.session?.access_token ?? null;
  }, []);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const tok = await token();
      const r = await fetch("/api/certificado", { headers: tok ? { authorization: `Bearer ${tok}` } : {} });
      const d = await r.json();
      if (d.ok) {
        setCert(d.certificado);
        setCofreOk(d.cofre_ok !== false);
      }
      if (supabase) {
        const { data } = await supabase
          .from("dfe_documentos")
          .select("id,nsu,chave44,tipo,resumo,capturado_em")
          .order("capturado_em", { ascending: false })
          .limit(50);
        setDocs((data as Doc[]) ?? []);
      }
    } finally {
      setCarregando(false);
    }
  }, [token]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function enviarCertificado() {
    if (!arquivo || !senha || enviando) return;
    setEnviando(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("arquivo", arquivo);
      fd.append("senha", senha);
      if (perfil?.tenant_id) fd.append("tenant_id", perfil.tenant_id);
      const tok = await token();
      const r = await fetch("/api/certificado", {
        method: "POST",
        headers: tok ? { authorization: `Bearer ${tok}` } : {},
        body: fd,
      });
      const d = await r.json();
      if (!d.ok) setMsg({ tipo: "erro", texto: d.erro ?? tx("Falha no envio.", "Ошибка загрузки.") });
      else {
        setMsg({ tipo: "ok", texto: tx("Certificado cadastrado com segurança.", "Сертификат сохранён.") });
        setArquivo(null);
        setSenha("");
        await carregar();
      }
    } catch (e) {
      setMsg({ tipo: "erro", texto: (e as Error).message });
    } finally {
      setEnviando(false);
    }
  }

  async function buscarNotas() {
    if (buscando) return;
    setBuscando(true);
    setMsg(null);
    try {
      const tok = await token();
      const r = await fetch("/api/dfe/buscar", {
        method: "POST",
        headers: { "content-type": "application/json", ...(tok ? { authorization: `Bearer ${tok}` } : {}) },
        body: JSON.stringify({ tenant_id: perfil?.tenant_id }),
      });
      const d = await r.json();
      if (!d.ok) setMsg({ tipo: "erro", texto: d.erro ?? d.aviso ?? tx("Falha na busca.", "Ошибка.") });
      else
        setMsg({
          tipo: "ok",
          texto:
            d.aviso ??
            tx(`${d.capturados} documento(s) novo(s) capturado(s).`, `Получено документов: ${d.capturados}.`),
        });
      await carregar();
    } catch (e) {
      setMsg({ tipo: "erro", texto: (e as Error).message });
    } finally {
      setBuscando(false);
    }
  }

  if (!staff)
    return (
      <div className="flex min-h-screen items-center justify-center text-sm" style={{ color: NAVY }}>
        {tx("Apenas a equipe fiscal acessa esta área.", "Только налоговая команда.")}
      </div>
    );

  const diasParaVencer = cert?.validade_ate
    ? Math.ceil((new Date(cert.validade_ate).getTime() - Date.now()) / 864e5)
    : null;

  return (
    <div className="min-h-screen" style={{ background: "var(--app-bg,#eef1f6)" }}>
      <header className="flex items-center gap-3 px-5 py-3" style={{ background: NAVY }}>
        <Link to="/" className="text-white/80 hover:text-white">
          <ArrowLeft size={18} />
        </Link>
        <img src="/masor-logo.png" alt="Masor" className="h-6 w-auto brightness-0 invert" />
        <span className="text-sm font-bold text-white">· {tx("Notas fiscais (SEFAZ)", "Накладные (SEFAZ)")}</span>
      </header>

      <main className="mx-auto max-w-4xl p-4 md:p-6">
        {msg && (
          <div
            className="mb-4 rounded-xl border px-4 py-3 text-sm"
            style={
              msg.tipo === "ok"
                ? { borderColor: "var(--success,#1f9d55)", color: NAVY, background: "#fff" }
                : { borderColor: AMBER, background: "var(--amber-soft)", color: NAVY }
            }
          >
            {msg.texto}
          </div>
        )}

        {!cofreOk && (
          <div className="mb-4 flex gap-2 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: AMBER, background: "var(--amber-soft)", color: NAVY }}>
            <TriangleAlert size={16} style={{ color: AMBER, flexShrink: 0 }} />
            <span>
              {tx(
                "O cofre de certificados não está configurado no servidor (MASOR_CERT_ENC_KEY). O upload fica bloqueado até isso ser feito.",
                "Хранилище сертификатов не настроено (MASOR_CERT_ENC_KEY).",
              )}
            </span>
          </div>
        )}

        {/* ---- certificado ---- */}
        <section className="rounded-2xl border bg-white p-5" style={{ borderColor: "var(--border,#e2e8f0)" }}>
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: NAVY }}>
            {tx("Certificado digital A1", "Цифровой сертификат A1")}
          </h2>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: "#6b7488" }}>
            {tx(
              "O arquivo é enviado direto ao servidor, guardado criptografado e usado só para consultar a SEFAZ. Ele nunca fica no navegador nem é exibido de volta.",
              "Файл отправляется на сервер, хранится в зашифрованном виде и используется только для запросов в SEFAZ.",
            )}
          </p>

          {carregando ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin" style={{ color: AMBER }} />
            </div>
          ) : cert ? (
            <div className="mt-3 rounded-xl border p-3" style={{ borderColor: "var(--border,#e2e8f0)" }}>
              <div className="flex flex-wrap items-center gap-2">
                <ShieldCheck size={16} style={{ color: "var(--success,#1f9d55)" }} />
                <span className="text-sm font-bold" style={{ color: NAVY }}>{cert.titular ?? cert.empresa ?? "—"}</span>
                <span className="text-xs" style={{ color: "#8892A4", fontFamily: MONO }}>CNPJ {cert.cnpj}</span>
              </div>
              <p className="mt-1 text-xs" style={{ color: diasParaVencer != null && diasParaVencer < 30 ? AMBER : "#8892A4" }}>
                {tx("Válido até", "Действует до")} <b style={{ fontFamily: MONO }}>{cert.validade_ate ?? "—"}</b>
                {diasParaVencer != null && ` · ${diasParaVencer} ${tx("dias", "дн.")}`}
                {diasParaVencer != null && diasParaVencer < 30 && ` ⚠ ${tx("renovar em breve", "скоро продлить")}`}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-xs" style={{ color: "#8892A4" }}>
              {tx("Nenhum certificado cadastrado ainda.", "Сертификат ещё не загружен.")}
            </p>
          )}

          {/* upload */}
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="grid gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: NAVY }}>
                {tx("Arquivo .pfx / .p12", "Файл .pfx / .p12")}
              </span>
              <label
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs font-semibold"
                style={{ borderColor: AMBER, color: NAVY }}
              >
                <Upload size={14} />
                {arquivo ? arquivo.name.slice(0, 28) : tx("Escolher arquivo", "Выбрать файл")}
                <input
                  type="file"
                  accept=".pfx,.p12,application/x-pkcs12"
                  className="hidden"
                  onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                />
              </label>
            </label>
            <label className="grid gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: NAVY }}>
                {tx("Senha do certificado", "Пароль сертификата")}
              </span>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="off"
                className="w-full rounded-md border px-3 py-2 text-sm outline-none"
                style={{ borderColor: "var(--border,#e2e8f0)", color: NAVY }}
              />
            </label>
            <button
              type="button"
              onClick={enviarCertificado}
              disabled={!arquivo || !senha || enviando || !cofreOk}
              className="rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-40"
              style={{ background: AMBER, color: NAVY }}
            >
              {enviando ? <Loader2 size={15} className="animate-spin" /> : tx("Enviar", "Отправить")}
            </button>
          </div>
        </section>

        {/* ---- captura ---- */}
        <section className="mt-4 rounded-2xl border bg-white p-5" style={{ borderColor: "var(--border,#e2e8f0)" }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: NAVY }}>
                {tx("Buscar notas na SEFAZ", "Получить накладные")}
              </h2>
              <p className="mt-1 text-xs" style={{ color: "#6b7488" }}>
                {tx(
                  "Traz as NF-e emitidas contra o seu CNPJ. A SEFAZ limita a frequência — aguarde 1 hora entre buscas.",
                  "Загружает NF-e, выставленные на ваш CNPJ. Не чаще 1 раза в час.",
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={buscarNotas}
              disabled={!cert || buscando}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
              style={{ background: NAVY }}
            >
              {buscando ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
              {tx("Buscar notas", "Получить")}
            </button>
          </div>
        </section>

        {/* ---- documentos capturados ---- */}
        <h2 className="mb-2 mt-6 text-sm font-bold uppercase tracking-widest" style={{ color: NAVY }}>
          {tx("Documentos capturados", "Полученные документы")}
        </h2>
        {docs.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-center" style={{ borderColor: "var(--border,#e2e8f0)" }}>
            <FileText size={26} className="mx-auto" style={{ color: AMBER }} />
            <p className="mt-2 text-xs" style={{ color: "#8892A4" }}>
              {tx("Nenhum documento ainda.", "Пока нет документов.")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border bg-white" style={{ borderColor: "var(--border,#e2e8f0)" }}>
            <table className="w-full text-xs" style={{ color: NAVY }}>
              <thead>
                <tr className="text-left" style={{ borderBottom: "2px solid var(--border,#e2e8f0)" }}>
                  {["NSU", tx("Tipo", "Тип"), tx("Emitente", "Поставщик"), tx("Valor", "Сумма"), tx("Chave", "Ключ")].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2 text-[10px] font-bold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} style={{ borderBottom: "1px solid var(--border,#e2e8f0)" }}>
                    <td className="px-3 py-2" style={{ fontFamily: MONO }}>{d.nsu}</td>
                    <td className="px-3 py-2">{d.tipo}</td>
                    <td className="px-3 py-2">{String(d.resumo?.emit_nome ?? d.resumo?.emit_cnpj ?? "—")}</td>
                    <td className="px-3 py-2" style={{ fontFamily: MONO }}>{brl(d.resumo?.vNF)}</td>
                    <td className="px-3 py-2 text-[10px]" style={{ fontFamily: MONO, color: "#8892A4" }}>
                      {d.chave44 ? `…${d.chave44.slice(-12)}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
