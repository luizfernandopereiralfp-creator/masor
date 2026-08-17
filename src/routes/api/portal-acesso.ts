import { createFileRoute } from "@tanstack/react-router";
import crypto from "node:crypto";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { exigirAdmin } from "@/lib/fiscal/guard";

/* ============================================================
   /api/portal-acesso — provisionamento de acesso de CLIENTE (portal).
   Admin-only + service role. Espelha o padrão do Lior (portal-cliente-
   acesso): cria o usuário com senha definida (email_confirm=true) e NÃO
   depende de SMTP — devolve e-mail+senha para o admin enviar (WhatsApp).
   Vincula o auth.user ao cliente em masor_portal_acessos (ponte usada
   por masor_cliente_atual()).
   POST   { cliente_id, email, senha? }  -> cria/reseta acesso
   GET    ?cliente_id=...                 -> lista acessos do cliente
   DELETE { auth_user_id }                -> revoga acesso (apaga login)
   ============================================================ */

function gerarSenha(): string {
  // 12 chars legíveis (base64url), com dígito garantido.
  return crypto.randomBytes(9).toString("base64url").replace(/[-_]/g, "") + Math.floor(Math.random() * 10);
}

async function acharUsuarioPorEmail(admin: ReturnType<typeof supabaseAdmin>, email: string): Promise<string | null> {
  if (!admin) return null;
  const alvo = email.trim().toLowerCase();
  for (let page = 1; page <= 5; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return null;
    const u = data.users.find((x) => (x.email ?? "").toLowerCase() === alvo);
    if (u) return u.id;
    if (data.users.length < 200) break;
  }
  return null;
}

export const Route = createFileRoute("/api/portal-acesso")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const g = await exigirAdmin(request);
        if (!g.ok) return g.resposta;
        const clienteId = new URL(request.url).searchParams.get("cliente_id");
        if (!clienteId) return Response.json({ ok: true, acessos: [] });
        const admin = supabaseAdmin();
        if (!admin) return Response.json({ ok: false, erro: "SUPABASE_SERVICE_ROLE_KEY ausente." }, { status: 503 });
        const { data, error } = await admin
          .from("masor_portal_acessos")
          .select("auth_user_id,email,criado_em")
          .eq("cliente_id", clienteId)
          .order("criado_em", { ascending: false });
        if (error) return Response.json({ ok: false, erro: error.message }, { status: 500 });
        return Response.json({ ok: true, acessos: data ?? [] });
      },

      POST: async ({ request }) => {
        const g = await exigirAdmin(request);
        if (!g.ok) return g.resposta;
        const admin = supabaseAdmin();
        if (!admin) return Response.json({ ok: false, erro: "SUPABASE_SERVICE_ROLE_KEY ausente." }, { status: 503 });

        let body: { cliente_id?: string; email?: string; senha?: string };
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, erro: "Corpo inválido." }, { status: 400 });
        }
        const clienteId = (body.cliente_id ?? "").trim();
        const email = (body.email ?? "").trim().toLowerCase();
        if (!clienteId) return Response.json({ ok: false, erro: "Cliente não informado." }, { status: 400 });
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Response.json({ ok: false, erro: "E-mail inválido." }, { status: 400 });
        const senha = (body.senha ?? "").trim() || gerarSenha();
        if (senha.length < 8) return Response.json({ ok: false, erro: "A senha deve ter ao menos 8 caracteres." }, { status: 400 });

        // valida que o cliente existe
        const { data: cli } = await admin.from("clientes").select("id,razao_social").eq("id", clienteId).maybeSingle();
        if (!cli) return Response.json({ ok: false, erro: "Cliente não encontrado." }, { status: 404 });

        // cria (ou reaproveita) o usuário
        let userId: string | null = null;
        const criar = await admin.auth.admin.createUser({
          email,
          password: senha,
          email_confirm: true,
          user_metadata: { portal: "masor", cliente_id: clienteId },
        });
        if (criar.error) {
          const m = criar.error.message.toLowerCase();
          if (m.includes("already") || m.includes("registered") || m.includes("exists")) {
            userId = await acharUsuarioPorEmail(admin, email);
            if (!userId) return Response.json({ ok: false, erro: "E-mail já cadastrado e não foi possível localizá-lo." }, { status: 409 });
            const upd = await admin.auth.admin.updateUserById(userId, { password: senha, email_confirm: true });
            if (upd.error) return Response.json({ ok: false, erro: upd.error.message }, { status: 500 });
          } else {
            return Response.json({ ok: false, erro: criar.error.message }, { status: 500 });
          }
        } else {
          userId = criar.data.user?.id ?? null;
        }
        if (!userId) return Response.json({ ok: false, erro: "Falha ao criar usuário." }, { status: 500 });

        // vincula ao cliente (ponte do portal). Segurança: não cria user_roles (seria staff).
        const map = await admin
          .from("masor_portal_acessos")
          .upsert({ auth_user_id: userId, cliente_id: clienteId, email, criado_por: g.auth.userId }, { onConflict: "auth_user_id" });
        if (map.error) return Response.json({ ok: false, erro: map.error.message }, { status: 500 });

        return Response.json({ ok: true, email, senha, cliente: (cli as { razao_social?: string }).razao_social ?? null });
      },

      DELETE: async ({ request }) => {
        const g = await exigirAdmin(request);
        if (!g.ok) return g.resposta;
        const admin = supabaseAdmin();
        if (!admin) return Response.json({ ok: false, erro: "SUPABASE_SERVICE_ROLE_KEY ausente." }, { status: 503 });
        let body: { auth_user_id?: string };
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, erro: "Corpo inválido." }, { status: 400 });
        }
        const uid = (body.auth_user_id ?? "").trim();
        if (!uid) return Response.json({ ok: false, erro: "Usuário não informado." }, { status: 400 });
        // apaga a ponte e o próprio login (não deixa acesso órfão)
        await admin.from("masor_portal_acessos").delete().eq("auth_user_id", uid);
        const del = await admin.auth.admin.deleteUser(uid);
        if (del.error) return Response.json({ ok: false, erro: del.error.message }, { status: 500 });
        return Response.json({ ok: true });
      },
    },
  },
});
