import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/lib/auth";

/**
 * Envolve conteúdo que exige login.
 * - Sem sessão → /entrar.
 * - Papel 'cliente' → /portal (a menos que permitirCliente, usado pela própria tela do portal).
 */
export function Protegido({ children, permitirCliente = false }: { children: ReactNode; permitirCliente?: boolean }) {
  const { carregando, session, perfil } = useAuth();
  const navigate = useNavigate();
  const ehCliente = perfil?.role === "cliente";

  useEffect(() => {
    if (carregando) return;
    if (!session) {
      navigate({ to: "/entrar" });
      return;
    }
    if (!permitirCliente && ehCliente) navigate({ to: "/portal" });
  }, [carregando, session, ehCliente, permitirCliente, navigate]);

  if (carregando)
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--app-bg,#eef1f6)" }}>
        <Loader2 size={28} className="animate-spin" style={{ color: "var(--amber)" }} />
      </div>
    );
  if (!session) return null;
  if (!permitirCliente && ehCliente) return null; // evita piscar a tela interna antes do redirect
  return <>{children}</>;
}
