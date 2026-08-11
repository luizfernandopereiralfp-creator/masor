import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* ============================================================
   Masor — cliente Supabase (servidor)
   Cria um client por requisição, escopado ao token do usuário
   (respeita RLS). O SERVICE ROLE só é usado para operações
   privilegiadas (ex.: gravar cache ai_reviews) — nunca vaza ao client.
   ============================================================ */

const URL = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_PUBLISHABLE_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Client escopado ao usuário (RLS aplicada). `token` = JWT do usuário. */
export function supabaseComUsuario(token: string): SupabaseClient | null {
  if (!URL || !ANON) return null;
  return createClient(URL, ANON, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Client com service role — ignora RLS. Só para tarefas internas do servidor. */
export function supabaseAdmin(): SupabaseClient | null {
  if (!URL || !SERVICE) return null;
  return createClient(URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });
}
