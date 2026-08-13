import { createClient } from "@supabase/supabase-js";

/* ============================================================
   Masor — cliente Supabase (browser)
   Usa a chave PUBLISHABLE (anon), segura para o client. As
   variáveis VITE_* são injetadas no build. RLS protege os dados.
   ============================================================ */

/* Config PÚBLICA do projeto (URL + publishable key já vão no bundle do cliente,
   então podem ser default embutido). Isso torna o app robusto a build/painel que
   não injetam as VITE_* — e ignora placeholders do .env.example. */
// Projeto UNIFICADO = Supabase do Lior (igzhwzgtxjgeaommatls). URL + anon são públicas.
const FALLBACK_URL = "https://igzhwzgtxjgeaommatls.supabase.co";
const FALLBACK_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlnemh3emd0eGpnZWFvbW1hdGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4Njc1ODMsImV4cCI6MjEwMTQ0MzU4M30.0CNd0391eP7rODf1HI3IWTSf3QMg5_IzsN8s-Wl1rG4";
const valido = (v?: string) => !!v && !/SEU-PROJETO|sua-anon|example\.supabase/.test(v);

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envAnon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const url = valido(envUrl) ? envUrl! : FALLBACK_URL;
const anon = valido(envAnon) ? envAnon! : FALLBACK_ANON;

/** true quando o Supabase está configurado (sempre true agora, via fallback público). */
export const supabaseConfigurado = Boolean(url && anon);

export const supabase = supabaseConfigurado
  ? createClient(url!, anon!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
