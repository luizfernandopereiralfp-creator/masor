import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2, ShieldCheck, TriangleAlert, RefreshCw, FileText, ExternalLink } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { Protegido } from "@/components/Protegido";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useClienteAtivo } from "@/lib/cliente-ativo";
import { useClientesFiscais } from "@/lib/empresa";

export const Route = createFileRoute("/fiscal")({
  component: () => (
    <Protegido permitirCliente>
      <Fiscal />
    </Protegido>
  ),
});

const NAVY = "var(--navy)";
const AMBER = "var(--amber)";
const MONO = "var(--font-mono)";
const LIOR_CLIENTES = "https://lior.g41one.com.br/admin/clientes";

type Cert = { filename: string | null; validade_ate: string | null; cnpj: string | null; titular: string | null };
type Doc = { id: string; nsu: string; chave44: string | null; tipo: string; resumo: Record<string, unknown>; capturado_em: string };

const brl = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return isNaN(n) ? "—" : n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

function Fiscal() {
  const { lang } = useI18n();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);
  const { perfil } = useAuth();
  const staff = perfil?.role === "admin" || perfil?.role === "staff";
  const [ativo, setAtivo] = useClienteAtivo();
  const { clientes, carregando: carregandoLista } = useClientesFiscais();

  const [cert, setCert] = useState<Cert | null>(null);
  const [cofreOk, setCofreOk] = useState(true);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [proxima, setProxima] = useState<number | null>(null); // próxima janela permitida (ms epoch)
  const [agora, setAgora] = useState(0);

  // tick para a contagem regressiva do botão (evita 656 por cliques repetidos)
  useEffect(() => {
    setAgora(Date.now());
    const t = setInterval(() => setAgora(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  // Cliente do portal: travado na PRÓPRIA empresa (sem seletor).
  useEffect(() => {
    if (!staff && perfil?.cliente_id && ativo !== perfil.cliente_id) setAtivo(perfil.cliente_id);
  }, [staff, perfil?.cliente_id, ativo, setAtivo]);

  const token = useCallback(async () => {
    if (!supabase) return null;
    return (await supabase.auth.getSession()).data.session?.access_token ?? null;
  }, []);

  const carregar = useCallback(async () => {
    if (!ativo) {
      setCert(null);
      setDocs([]);
      setProxima(null);
      return;
    }
    setCarregando(true);
    try {
      const tok = await token();
      const r = await fetch(`/api/certificado?cliente_id=${ativo}`, { headers: tok ? { authorization: `Bearer ${tok}` } : {} });
      const d = await r.json();
      if (d.ok) {
        setCert(d.certificado);
        setCofreOk(d.cofre_ok !== false);
      }
      if (supabase) {
        const [{ data }, { data: fc }] = await Promise.all([
          supabase
            .from("masor_dfe_documentos")
            .select("id,nsu,chave44,tipo,resumo,capturado_em")
            .eq("cliente_id", ativo)
            .order("capturado_em", { ascending: false })
            .limit(50),
          supabase.from("masor_fiscal_config").select("atualizado_em,bloqueado_ate").eq("cliente_id", ativo).maybeSingle(),
        ]);
        setDocs((data as Doc[]) ?? []);
        const cfg = fc as { atualizado_em?: string | null; bloqueado_ate?: string | null } | null;
        let p = 0;
        if (cfg?.atualizado_em) p = new Date(cfg.atualizado_em).getTime() + 60 * 60 * 1000;
        if (cfg?.bloqueado_ate) p = Math.max(p, new Date(cfg.bloqueado_ate).getTime());
        setProxima(p || null);
      }
    } finally {
      setCarregando(false);
    }
  }, [ativo, token]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function buscarNotas() {
    if (buscando || !ativo) return;
    setBuscando(true);
    setMsg(null);
    try {
      const tok = await token();
      const r = await fetch("/api/dfe/buscar", {
        method: "POST",
        headers: { "content-type": "application/json", ...(tok ? { authorization: `Bearer ${tok}` } : {}) },
        body: JSON.stringify({ cliente_id: ativo }),
      });
      const d = await r.json();
      if (d.proxima_busca) setProxima(new Date(d.proxima_busca).getTime());
      if (!d.ok) setMsg({ tipo: "erro", texto: d.erro ?? d.aviso ?? tx("Falha na busca.", "Ошибка.") });
      else setMsg({ tipo: "ok", texto: d.aviso ?? tx(`${d.capturados} documento(s) novo(s).`, `Получено: ${d.capturados}.`) });
      await carregar();
    } catch (e) {
      setMsg({ tipo: "erro", texto: (e as Error).message });
    } finally {
      setBuscando(false);
    }
  }

  const diasParaVencer = cert?.validade_ate ? Math.ceil((new Date(cert.validade_ate).getTime() - Date.now()) / 864e5) : null;
  const emEspera = proxima != null && agora > 0 && agora < proxima;
  const minEspera = emEspera ? Math.ceil((proxima! - agora) / 60000) : 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        {/* seletor de cliente (só equipe; cliente é travado na própria empresa) */}
        {staff && (
        <div className="mb-4 rounded-2xl border bg-white p-4" style={{ borderColor: "var(--border,#e2e8f0)" }}>
          <label className="grid gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#6b7488" }}>
              {tx("Cliente", "Клиент")}
            </span>
            {carregandoLista ? (
              <span className="flex items-center gap-2 text-sm" style={{ color: "#8892A4" }}>
                <Loader2 size={14} className="animate-spin" /> {tx("carregando…", "загрузка…")}
              </span>
            ) : (
              <select className="w-full rounded-md border bg-white px-3 py-2 text-sm outline-none" style={{ borderColor: "var(--border,#e2e8f0)", color: NAVY }} value={ativo ?? ""} onChange={(e) => setAtivo(e.target.value || null)}>
                <option value="">{tx("— selecione —", "— выберите —")}</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.razao_social ?? c.nome_fantasia ?? c.id}{c.cnpj_cpf ? ` · ${c.cnpj_cpf}` : ""}</option>
                ))}
              </select>
            )}
          </label>
        </div>
        )}

        {msg && (
          <div className="mb-4 rounded-xl border px-4 py-3 text-sm" style={msg.tipo === "ok" ? { borderColor: "var(--success,#1f9d55)", color: NAVY, background: "#fff" } : { borderColor: AMBER, background: "var(--amber-soft)", color: NAVY }}>
            {msg.texto}
          </div>
        )}
        {!cofreOk && (
          <div className="mb-4 flex gap-2 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: AMBER, background: "var(--amber-soft)", color: NAVY }}>
            <TriangleAlert size={16} style={{ color: AMBER, flexShrink: 0 }} />
            <span>{tx("A chave dos certificados (CERT_MASTER_KEY) não está no servidor do Masor. A busca fica bloqueada até isso ser configurado.", "CERT_MASTER_KEY не настроен.")}</span>
          </div>
        )}

        {!ativo ? (
          <div className="rounded-2xl border bg-white p-8 text-center text-sm" style={{ borderColor: "var(--border,#e2e8f0)", color: "#8892A4" }}>
            {tx("Selecione um cliente para ver o certificado e buscar as notas.", "Выберите клиента.")}
          </div>
        ) : (
          <>
            {/* certificado (do Lior) */}
            <section className="rounded-2xl border bg-white p-5" style={{ borderColor: "var(--border,#e2e8f0)" }}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: NAVY }}>{tx("Certificado A1 (e-CNPJ)", "Сертификат A1")}</h2>
                <a href={LIOR_CLIENTES} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold underline" style={{ color: NAVY }}>
                  {tx("gerir no Lior", "в Lior")} <ExternalLink size={11} />
                </a>
              </div>
              {carregando ? (
                <div className="flex justify-center py-4"><Loader2 className="animate-spin" style={{ color: AMBER }} /></div>
              ) : cert ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <ShieldCheck size={16} style={{ color: "var(--success,#1f9d55)" }} />
                  <span className="text-sm font-bold" style={{ color: NAVY }}>{cert.titular ?? "—"}</span>
                  {cert.cnpj && <span className="text-xs" style={{ color: "#8892A4", fontFamily: MONO }}>CNPJ {cert.cnpj}</span>}
                  <span className="text-xs" style={{ color: diasParaVencer != null && diasParaVencer < 30 ? AMBER : "#8892A4" }}>
                    · {tx("válido até", "до")} <b style={{ fontFamily: MONO }}>{cert.validade_ate ?? "—"}</b>
                    {diasParaVencer != null && diasParaVencer < 30 && ` ⚠ ${tx("renovar", "продлить")}`}
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-xs" style={{ color: "#8892A4" }}>
                  {tx("Este cliente não tem certificado A1 ativo. Cadastre o e-CNPJ no cadastro do cliente no Lior.", "Нет активного A1 — загрузите в Lior.")}
                </p>
              )}
            </section>

            {/* buscar */}
            <section className="mt-4 rounded-2xl border bg-white p-5" style={{ borderColor: "var(--border,#e2e8f0)" }}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: NAVY }}>{tx("Buscar notas na SEFAZ", "Получить накладные")}</h2>
                  <p className="mt-1 text-xs" style={{ color: "#6b7488" }}>{tx("NF-e emitidas contra o CNPJ. A SEFAZ limita a frequência — aguarde 1 hora entre buscas.", "Не чаще 1 раза в час.")}</p>
                </div>
                <button type="button" onClick={buscarNotas} disabled={!cert || buscando || emEspera} className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-40" style={{ background: NAVY }}>
                  {buscando ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                  {emEspera
                    ? tx(`Disponível em ${minEspera} min`, `Доступно через ${minEspera} мин`)
                    : tx("Buscar notas", "Получить")}
                </button>
              </div>
            </section>

            {/* documentos */}
            <h2 className="mb-2 mt-6 text-sm font-bold uppercase tracking-widest" style={{ color: NAVY }}>{tx("Documentos capturados", "Документы")}</h2>
            {docs.length === 0 ? (
              <div className="rounded-2xl border bg-white p-8 text-center" style={{ borderColor: "var(--border,#e2e8f0)" }}>
                <FileText size={26} className="mx-auto" style={{ color: AMBER }} />
                <p className="mt-2 text-xs" style={{ color: "#8892A4" }}>{tx("Nenhum documento ainda.", "Пока нет.")}</p>
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
                        <td className="px-3 py-2 text-[10px]" style={{ fontFamily: MONO, color: "#8892A4" }}>{d.chave44 ? `…${d.chave44.slice(-12)}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
