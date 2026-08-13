import type { SupabaseClient } from "@supabase/supabase-js";

import { supabaseComUsuario } from "@/integrations/supabase/client.server";

/* ============================================================
   Masor — guard fail-closed para rotas sensíveis (certificado/DFe).
   Qualquer dúvida => nega. Nunca segue sem staff confirmado.
   ============================================================ */

export type Autorizado = {
  sb: SupabaseClient;
  userId: string;
  clienteId: string | null;
  role: string;
};

export type ResultadoGuard = { ok: true; auth: Autorizado } | { ok: false; resposta: Response };

const nega = (status: number, erro: string): ResultadoGuard => ({
  ok: false,
  resposta: Response.json({ ok: false, erro }, { status }),
});

/** Exige JWT válido + papel staff/admin. */
export async function exigirStaff(request: Request): Promise<ResultadoGuard> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  if (!token) return nega(401, "Não autenticado.");

  const sb = supabaseComUsuario(token);
  if (!sb) return nega(503, "Supabase não configurado no servidor.");

  const { data, error } = await sb.auth.getUser();
  if (error || !data?.user) return nega(401, "Sessão inválida.");

  const { data: perfilData } = await sb.rpc("masor_meu_perfil");
  const perfil = (Array.isArray(perfilData) ? perfilData[0] : perfilData) as
    | { role?: string; cliente_id?: string | null }
    | null;

  const role = perfil?.role ?? "";
  if (role !== "admin" && role !== "staff") return nega(403, "Apenas a equipe fiscal acessa este recurso.");

  return {
    ok: true,
    auth: {
      sb,
      userId: data.user.id,
      clienteId: perfil?.cliente_id ?? null,
      role,
    },
  };
}
