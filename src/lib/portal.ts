import { supabase } from "@/integrations/supabase/client";

/* ============================================================
   Masor — acesso de cliente (portal).
   - Admin: criar/listar/revogar acesso (via /api/portal-acesso).
   - Cliente: ler a própria empresa e as próprias análises (RLS já
     restringe por masor_cliente_atual()).
   ============================================================ */

async function bearer(): Promise<Record<string, string>> {
  if (!supabase) return {};
  const tok = (await supabase.auth.getSession()).data.session?.access_token ?? null;
  return tok ? { authorization: `Bearer ${tok}` } : {};
}

export type PortalAcesso = { auth_user_id: string; email: string | null; criado_em: string };

export async function listarAcessos(clienteId: string): Promise<PortalAcesso[]> {
  const r = await fetch(`/api/portal-acesso?cliente_id=${encodeURIComponent(clienteId)}`, { headers: await bearer() });
  if (!r.ok) return [];
  const j = (await r.json()) as { ok?: boolean; acessos?: PortalAcesso[] };
  return j.ok ? j.acessos ?? [] : [];
}

export async function criarAcesso(
  clienteId: string,
  email: string,
  senha?: string,
): Promise<{ ok?: true; email?: string; senha?: string; erro?: string }> {
  const r = await fetch("/api/portal-acesso", {
    method: "POST",
    headers: { "content-type": "application/json", ...(await bearer()) },
    body: JSON.stringify({ cliente_id: clienteId, email, senha: senha || undefined }),
  });
  const j = (await r.json()) as { ok?: boolean; email?: string; senha?: string; erro?: string };
  if (!j.ok) return { erro: j.erro ?? "Falha ao criar acesso." };
  return { ok: true, email: j.email, senha: j.senha };
}

export async function revogarAcesso(authUserId: string): Promise<{ ok?: true; erro?: string }> {
  const r = await fetch("/api/portal-acesso", {
    method: "DELETE",
    headers: { "content-type": "application/json", ...(await bearer()) },
    body: JSON.stringify({ auth_user_id: authUserId }),
  });
  const j = (await r.json()) as { ok?: boolean; erro?: string };
  return j.ok ? { ok: true } : { erro: j.erro ?? "Falha ao revogar." };
}

/* ---------- lado do cliente ---------- */

export type MeuCliente = {
  id: string;
  razao_social: string | null;
  nome_fantasia: string | null;
  cnpj_cpf: string | null;
  regime_tributario: string | null;
  cnae_principal: string | null;
  endereco: Record<string, unknown> | null;
};

export async function meuCliente(): Promise<MeuCliente | null> {
  if (!supabase) return null;
  const { data } = await supabase.rpc("masor_meu_cliente");
  const row = (Array.isArray(data) ? data[0] : data) as MeuCliente | undefined;
  return row ?? null;
}

export type MinhaAnalise = { id: string; origem: string | null; payload: Record<string, unknown>; analise: unknown; created_at: string };

export async function minhasAnalises(limite = 30): Promise<MinhaAnalise[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("masor_product_simulations")
    .select("id,origem,payload,analise,created_at")
    .order("created_at", { ascending: false })
    .limit(limite);
  return (data as MinhaAnalise[]) ?? [];
}
