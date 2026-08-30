import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/lib/auth";

/**
 * Envolve conteúdo que exige login.
 * - Sem sessão → /entrar.
 * - Sessão válida mas SEM liberação para o Masor → barra e desloga.
 * - Papel 'cliente' → /portal (a menos que permitirCliente, usado pela própria tela do portal).
 *
 * A trava de produto existe porque o Masor e o Lior dividem o MESMO Supabase:
 * uma sessão válida pode ser de alguém que só tem direito ao Lior. Antes disto,
 * qualquer sessão do projeto entrava aqui. O Lior fecha a porta equivalente no
 * `beforeLoad` dele desde 26/08/2026 (mig 20260826225502_login_sistemas_liberados).
 */
export function Protegido({
  children,
  permitirCliente = false,
}: {
  children: ReactNode;
  permitirCliente?: boolean;
}) {
  const { carregando, session, perfil, liberado, sair } = useAuth();
  const navigate = useNavigate();
  const ehCliente = perfil?.role === "cliente";
  // Fail-closed: só passa com `true` explícito. `null` ainda está carregando.
  const barrado = session != null && liberado === false;

  useEffect(() => {
    if (carregando) return;
    if (!session) {
      navigate({ to: "/entrar" });
      return;
    }
    if (barrado) return; // a tela abaixo explica; não redireciona em silêncio
    if (!permitirCliente && ehCliente) navigate({ to: "/portal" });
  }, [carregando, session, barrado, ehCliente, permitirCliente, navigate]);

  if (carregando)
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "var(--app-bg,#eef1f6)" }}
      >
        <Loader2 size={28} className="animate-spin" style={{ color: "var(--amber)" }} />
      </div>
    );
  if (!session) return null;

  if (barrado)
    return (
      <div
        className="flex min-h-screen items-center justify-center px-6"
        style={{ background: "var(--app-bg,#eef1f6)" }}
      >
        <div className="max-w-md text-center">
          <h1 className="text-lg font-semibold" style={{ color: "var(--navy,#0B1740)" }}>
            Seu acesso não inclui o Masor
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--navy,#0B1740)", opacity: 0.75 }}>
            Este login existe, mas não está liberado para este produto. Fale com a equipe da G41
            para solicitar a liberação.
          </p>
          <button
            type="button"
            onClick={() => void sair()}
            className="mt-5 rounded-md px-4 py-2 text-sm font-semibold"
            style={{ background: "var(--amber,#E9A74A)", color: "var(--navy,#0B1740)" }}
          >
            Sair
          </button>
        </div>
      </div>
    );

  // Ainda decidindo a liberação: não mostra a tela interna antes de saber.
  if (liberado === null) return null;

  if (!permitirCliente && ehCliente) return null; // evita piscar a tela interna antes do redirect
  return <>{children}</>;
}
