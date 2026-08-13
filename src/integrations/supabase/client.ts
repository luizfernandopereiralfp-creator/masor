import { createClient } from "@supabase/supabase-js";

/* ============================================================
   Masor — cliente Supabase (browser)
   Usa a chave PUBLISHABLE (anon), segura para o client. As
   variáveis VITE_* são injetadas no build. RLS protege os dados.
   ============================================================ */

/* Config PÚBLICA do projeto (URL + publishable key já vão no bundle do cliente,
   então podem ser default embutido). Isso torna o app robusto a build/painel que
   não injetam as VITE_* — e ignora placeholders do .env.example. */
const FALLBACK_URL = "https://jkerqallbmozlnttffsi.supabase.co";
const FALLBACK_ANON = "sb_publishable_UdTxgpsSF7NMnSJqssNURg___po5616";
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
