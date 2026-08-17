import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Building2, LogOut, FileText } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Protegido } from "@/components/Protegido";
import { supabase } from "@/integrations/supabase/client";
import { meuCliente, minhasAnalises, type MeuCliente, type MinhaAnalise } from "@/lib/portal";

export const Route = createFileRoute("/portal")({
  component: () => (
    <Protegido permitirCliente>
      <PortalConteudo />
    </Protegido>
  ),
});

const NAVY = "var(--navy)";
const AMBER = "var(--amber)";
const MONO = "var(--font-mono)";

function descricaoAnalise(a: MinhaAnalise): string {
  const p = a.payload ?? {};
  for (const k of ["descricao", "descricao_produto", "produto", "nome", "ean", "ncm"]) {
    const v = (p as Record<string, unknown>)[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "Análise";
}

function PortalConteudo() {
  const { lang } = useI18n();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);
  const { perfil } = useAuth();

  const [empresa, setEmpresa] = useState<MeuCliente | null>(null);
  const [analises, setAnalises] = useState<MinhaAnalise[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    void (async () => {
      setCarregando(true);
      const [e, a] = await Promise.all([meuCliente(), minhasAnalises(30)]);
      setEmpresa(e);
      setAnalises(a);
      setCarregando(false);
    })();
  }, []);

  const semVinculo = !carregando && !empresa;

  return (
    <div className="min-h-screen" style={{ background: "var(--app-bg,#eef1f6)" }}>
      <header className="flex items-center justify-between px-5 py-3" style={{ background: NAVY }}>
        <div className="flex items-center gap-3">
          <img src="/masor-logo.png" alt="Masor" className="h-6 w-auto rounded bg-white px-2 py-1" />
          <span className="text-sm font-bold text-white">· {tx("Portal do cliente", "Портал клиента")}</span>
        </div>
        <button
          type="button"
          onClick={() => supabase?.auth.signOut()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/85 hover:text-white"
        >
          <LogOut size={14} /> {tx("Sair", "Выйти")}
        </button>
      </header>

      <main className="mx-auto max-w-3xl p-4 md:p-6">
        {carregando ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin" style={{ color: AMBER }} /></div>
        ) : semVinculo ? (
          <div className="rounded-2xl border bg-white p-8 text-center" style={{ borderColor: "var(--border,#e2e8f0)" }}>
            <Building2 size={26} className="mx-auto" style={{ color: AMBER }} />
            <p className="mt-2 text-sm" style={{ color: "#8892A4" }}>
              {perfil?.role === "admin" || perfil?.role === "staff"
                ? tx("Esta é a área do cliente. Sua conta é da equipe — use o painel interno.", "Это область клиента.")
                : tx("Seu acesso ainda não está vinculado a uma empresa. Fale com a G41.", "Доступ ещё не привязан к компании.")}
            </p>
            {(perfil?.role === "admin" || perfil?.role === "staff") && (
              <Link to="/" className="mt-3 inline-block text-sm font-semibold" style={{ color: NAVY }}>
                {tx("Ir para o painel →", "В панель →")}
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm" style={{ color: "#6b7488" }}>
              {tx("Bem-vindo. Aqui você acompanha a inteligência tributária da sua empresa.", "Добро пожаловать.")}
            </p>

            {/* empresa */}
            <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border,#e2e8f0)" }}>
              <h2 className="mb-3 text-sm font-bold" style={{ color: NAVY }}>{empresa!.razao_social ?? empresa!.nome_fantasia ?? "—"}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Item label={tx("Nome fantasia", "Название")} valor={empresa!.nome_fantasia} />
                <Item label="CNPJ" valor={empresa!.cnpj_cpf} mono />
                <Item label={tx("Regime tributário", "Режим")} valor={empresa!.regime_tributario} />
                <Item label="CNAE" valor={empresa!.cnae_principal} mono />
              </div>
            </div>

            {/* análises */}
            <h2 className="mb-2 mt-6 text-sm font-bold uppercase tracking-widest" style={{ color: NAVY }}>{tx("Suas análises", "Ваши анализы")}</h2>
            {analises.length === 0 ? (
              <div className="rounded-2xl border bg-white p-8 text-center" style={{ borderColor: "var(--border,#e2e8f0)" }}>
                <FileText size={26} className="mx-auto" style={{ color: AMBER }} />
                <p className="mt-2 text-xs" style={{ color: "#8892A4" }}>{tx("Nenhuma análise ainda.", "Пока нет анализов.")}</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "var(--border,#e2e8f0)" }}>
                <ul>
                  {analises.map((a) => (
                    <li key={a.id} className="flex items-center justify-between border-b px-4 py-3 last:border-0" style={{ borderColor: "var(--border,#eef1f6)" }}>
                      <span className="text-sm" style={{ color: NAVY }}>{descricaoAnalise(a)}</span>
                      <span className="text-xs" style={{ color: "#8892A4", fontFamily: MONO }}>
                        {new Date(a.created_at).toLocaleDateString(lang === "ru" ? "ru-RU" : "pt-BR")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Item({ label, valor, mono }: { label: string; valor: string | null; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#8892A4" }}>{label}</p>
      <p className="text-sm" style={{ color: NAVY, fontFamily: mono ? MONO : undefined }}>{valor ?? "—"}</p>
    </div>
  );
}
