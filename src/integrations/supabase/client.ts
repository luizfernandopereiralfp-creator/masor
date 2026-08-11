import { createClient } from "@supabase/supabase-js";

/* ============================================================
   Masor — cliente Supabase (browser)
   Usa a chave PUBLISHABLE (anon), segura para o client. As
   variáveis VITE_* são injetadas no build. RLS protege os dados.
   ============================================================ */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/** true quando o Supabase está configurado (evita quebrar antes da Fase 4 estar ligada). */
export const supabaseConfigurado = Boolean(url && anon);

export const supabase = supabaseConfigurado
  ? createClient(url!, anon!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
