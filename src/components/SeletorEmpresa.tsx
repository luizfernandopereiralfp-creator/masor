import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, ChevronDown, Check, Search } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useClienteAtivo } from "@/lib/cliente-ativo";
import { useI18n } from "@/lib/i18n";

/* ============================================================
   Masor — Seletor de EMPRESA global (padrão Lior).
   Existe um só, no topo; a empresa escolhida (cliente ativo)
   persiste entre telas (localStorage via useClienteAtivo).
   Só a equipe (staff/admin) troca; para login-cliente é fixo.
   ============================================================ */

type ClienteFiscal = { id: string; razao_social: string | null; nome_fantasia: string | null; cnpj_cpf: string | null };

const nomeDe = (c: ClienteFiscal) => c.nome_fantasia || c.razao_social || c.cnpj_cpf || c.id;

export function SeletorEmpresa({ somenteLeitura = false }: { somenteLeitura?: boolean }) {
  const { lang } = useI18n();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);
  const [clienteId, setClienteId] = useClienteAtivo();
  const [clientes, setClientes] = useState<ClienteFiscal[] | null>(null);
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void (async () => {
      if (!supabase) return setClientes([]);
      const { data } = await supabase.rpc("masor_clientes_fiscais");
      setClientes((data as ClienteFiscal[]) ?? []);
    })();
  }, []);

  useEffect(() => {
    const on = (e: MouseEvent) => {
      if (aberto && wrap.current && !wrap.current.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("mousedown", on);
    return () => document.removeEventListener("mousedown", on);
  }, [aberto]);

  const atual = useMemo(() => clientes?.find((c) => c.id === clienteId) ?? null, [clientes, clienteId]);
  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const lista = clientes ?? [];
    return q ? lista.filter((c) => nomeDe(c).toLowerCase().includes(q) || (c.cnpj_cpf ?? "").includes(q)) : lista;
  }, [clientes, busca]);

  const rotulo = atual ? nomeDe(atual) : tx("Selecione a empresa", "Выберите компанию");

  if (somenteLeitura) {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm" style={{ borderColor: "var(--app-line)", color: "var(--app-ink)", background: "var(--app-surface)" }}>
        <Building2 size={15} style={{ color: "var(--amber)" }} />
        <span className="max-w-[220px] truncate font-semibold">{rotulo}</span>
      </div>
    );
  }

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold transition"
        style={{ borderColor: "var(--app-line)", color: "var(--app-ink)", background: "var(--app-surface)" }}
        title={tx("Empresa ativa", "Активная компания")}
      >
        <Building2 size={15} style={{ color: "var(--amber)" }} />
        <span className="max-w-[180px] truncate md:max-w-[240px]">{rotulo}</span>
        <ChevronDown size={15} style={{ color: "var(--app-muted)" }} />
      </button>

      {aberto && (
        <div className="absolute right-0 z-40 mt-1 w-[300px] overflow-hidden rounded-xl border shadow-lg" style={{ borderColor: "var(--app-line)", background: "var(--card)" }}>
          <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: "var(--app-line)" }}>
            <Search size={14} style={{ color: "var(--app-muted)" }} />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder={tx("Buscar empresa…", "Поиск компании…")}
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: "var(--app-ink)" }}
              autoFocus
            />
          </div>
          <div className="max-h-[320px] overflow-y-auto py-1">
            {clientes === null ? (
              <p className="px-3 py-3 text-xs" style={{ color: "var(--app-muted)" }}>{tx("Carregando…", "Загрузка…")}</p>
            ) : filtradas.length === 0 ? (
              <p className="px-3 py-3 text-xs" style={{ color: "var(--app-muted)" }}>{tx("Nenhuma empresa.", "Нет компаний.")}</p>
            ) : (
              filtradas.map((c) => {
                const ativo = c.id === clienteId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setClienteId(c.id); setAberto(false); setBusca(""); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
                    style={{ color: "var(--app-ink)", background: ativo ? "var(--tint-amber)" : "transparent" }}
                  >
                    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">{ativo && <Check size={14} style={{ color: "var(--amber)" }} />}</span>
                    <span className="flex-1 truncate">{nomeDe(c)}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
