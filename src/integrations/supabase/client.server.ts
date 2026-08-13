import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* ============================================================
   Masor — cliente Supabase (servidor)
   Cria um client por requisição, escopado ao token do usuário
   (respeita RLS). O SERVICE ROLE só é usado para operações
   privilegiadas (ex.: gravar cache ai_reviews) — nunca vaza ao client.
   ============================================================ */

// Públicas com fallback embutido (robusto a painel que não injeta env de runtime).
const valido = (v?: string) => !!v && !/SEU-PROJETO|sua-anon|example\.supabase/.test(v);
// Projeto UNIFICADO = Supabase do Lior (igzhwzgtxjgeaommatls).
const URL = valido(process.env.SUPABASE_URL) ? process.env.SUPABASE_URL! : "https://igzhwzgtxjgeaommatls.supabase.co";
const ANON = valido(process.env.SUPABASE_PUBLISHABLE_KEY)
  ? process.env.SUPABASE_PUBLISHABLE_KEY!
  : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlnemh3emd0eGpnZWFvbW1hdGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4Njc1ODMsImV4cCI6MjEwMTQ0MzU4M30.0CNd0391eP7rODf1HI3IWTSf3QMg5_IzsN8s-Wl1rG4";
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY; // segredo: só via env, sem fallback

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
