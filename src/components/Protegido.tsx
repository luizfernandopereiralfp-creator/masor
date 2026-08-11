import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/lib/auth";

/** Envolve conteúdo que exige login. Sem sessão → redireciona para /entrar. */
export function Protegido({ children }: { children: ReactNode }) {
  const { carregando, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!carregando && !session) navigate({ to: "/entrar" });
  }, [carregando, session, navigate]);

  if (carregando)
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--app-bg,#eef1f6)" }}>
        <Loader2 size={28} className="animate-spin" style={{ color: "var(--amber)" }} />
      </div>
    );
  if (!session) return null;
  return <>{children}</>;
}
