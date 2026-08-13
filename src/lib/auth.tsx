import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

/* ============================================================
   Masor — autenticação (Supabase Auth) + perfil/tenant
   O perfil (cliente_id, role) é carregado após o login. A RLS do
   banco garante o isolamento; aqui só expomos o contexto ao app.
   ============================================================ */

export type Perfil = {
  user_id: string;
  cliente_id: string | null; // cliente atual (portal); null p/ equipe (staff escolhe)
  nome: string | null;
  role: "admin" | "staff" | "cliente";
};

type AuthValue = {
  carregando: boolean;
  session: Session | null;
  user: User | null;
  perfil: Perfil | null;
  entrar: (email: string, senha: string) => Promise<{ erro?: string }>;
  cadastrar: (email: string, senha: string, nome: string) => Promise<{ erro?: string; confirmar?: boolean }>;
  sair: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  async function carregarPerfil(_userId: string) {
    if (!supabase) return;
    // Identidade unificada com o Lior: RPC sintetiza role (admin/staff/cliente)
    // a partir de user_roles/has_role e o cliente atual (portal) do Lior.
    const { data } = await supabase.rpc("masor_meu_perfil");
    const row = Array.isArray(data) ? data[0] : data;
    setPerfil((row as Perfil) ?? null);
  }

  useEffect(() => {
    if (!supabase) {
      setCarregando(false);
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) await carregarPerfil(data.session.user.id);
      setCarregando(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s);
      if (s?.user) await carregarPerfil(s.user.id);
      else setPerfil(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const entrar: AuthValue["entrar"] = async (email, senha) => {
    if (!supabase) return { erro: "Auth não configurada." };
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    return error ? { erro: error.message } : {};
  };

  const cadastrar: AuthValue["cadastrar"] = async (email, senha, nome) => {
    if (!supabase) return { erro: "Auth não configurada." };
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    });
    if (error) return { erro: error.message };
    // Se o projeto exigir confirmação de e-mail, não há sessão ainda.
    return { confirmar: !data.session };
  };

  const sair: AuthValue["sair"] = async () => {
    if (supabase) await supabase.auth.signOut();
    setPerfil(null);
  };

  return (
    <AuthContext.Provider
      value={{ carregando, session, user: session?.user ?? null, perfil, entrar, cadastrar, sair }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
