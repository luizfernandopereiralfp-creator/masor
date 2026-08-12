import { createFileRoute } from "@tanstack/react-router";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { exigirStaff } from "@/lib/fiscal/guard";
import { cifrar, cifrarTexto, cofreConfigurado } from "@/lib/fiscal/cofre";
import { lerCertificado } from "@/lib/fiscal/cert";

/* ============================================================
   /api/certificado — cadastro do certificado digital A1 (.pfx).

   O arquivo NUNCA é lido no browser além do File handle: sobe por
   multipart direto para cá, é validado (senha correta? qual CNPJ?
   qual validade?), CIFRADO (AES-256-GCM) e gravado pelo service
   role. A resposta devolve só metadados — nunca o blob.

   GET  -> status do certificado ativo do tenant (sem segredo).
   POST -> upload (multipart: arquivo, senha, tenant_id, empresa).
   ============================================================ */

export const Route = createFileRoute("/api/certificado")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const g = await exigirStaff(request);
        if (!g.ok) return g.resposta;
        const tenantId = new URL(request.url).searchParams.get("tenant_id") ?? g.auth.tenantId;
        if (!tenantId) return Response.json({ ok: false, erro: "tenant_id ausente." }, { status: 400 });

        // Metadados via client do usuário (RLS: só staff enxerga).
        const { data, error } = await g.auth.sb
          .from("certificados_digitais")
          .select("id,empresa,cnpj,titular,validade_ate,ativo,criado_em")
          .eq("tenant_id", tenantId)
          .eq("ativo", true)
          .order("criado_em", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) return Response.json({ ok: false, erro: error.message }, { status: 500 });

        return Response.json({ ok: true, certificado: data ?? null, cofre_ok: cofreConfigurado() });
      },

      POST: async ({ request }) => {
        const g = await exigirStaff(request);
        if (!g.ok) return g.resposta;

        if (!cofreConfigurado())
          return Response.json(
            { ok: false, erro: "Cofre não configurado no servidor (MASOR_CERT_ENC_KEY ausente)." },
            { status: 503 },
          );
        const admin = supabaseAdmin();
        if (!admin)
          return Response.json(
            { ok: false, erro: "SUPABASE_SERVICE_ROLE_KEY ausente — necessário para guardar o certificado." },
            { status: 503 },
          );

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ ok: false, erro: "Envio inválido (esperado multipart/form-data)." }, { status: 400 });
        }
        const arquivo = form.get("arquivo");
        const senha = String(form.get("senha") ?? "");
        const tenantId = String(form.get("tenant_id") ?? g.auth.tenantId ?? "");
        const empresa = String(form.get("empresa") ?? "") || null;

        if (!(arquivo instanceof File)) return Response.json({ ok: false, erro: "Arquivo .pfx ausente." }, { status: 400 });
        if (!senha) return Response.json({ ok: false, erro: "Senha do certificado ausente." }, { status: 400 });
        if (!tenantId) return Response.json({ ok: false, erro: "tenant_id ausente." }, { status: 400 });
        if (arquivo.size > 512 * 1024) return Response.json({ ok: false, erro: "Arquivo muito grande para um .pfx." }, { status: 400 });

        const pfx = Buffer.from(await arquivo.arrayBuffer());

        // Valida a senha e extrai metadados — se a senha estiver errada, lança aqui.
        let meta;
        try {
          meta = lerCertificado(pfx, senha);
        } catch (e) {
          const msg = (e as Error).message ?? "";
          const senhaErrada = /mac could not be verified|invalid password|wrong password/i.test(msg);
          return Response.json(
            { ok: false, erro: senhaErrada ? "Senha do certificado incorreta." : `Não consegui ler o certificado: ${msg}` },
            { status: 400 },
          );
        }
        if (meta.expirado)
          return Response.json({ ok: false, erro: `Certificado vencido em ${meta.validade_ate}.` }, { status: 400 });
        if (!meta.cnpj)
          return Response.json({ ok: false, erro: "Não identifiquei o CNPJ no certificado (é um e-CNPJ A1?)." }, { status: 400 });

        // Desativa o anterior e grava o novo (service role — a tabela não aceita insert do usuário).
        await admin.from("certificados_digitais").update({ ativo: false }).eq("tenant_id", tenantId).eq("ativo", true);
        const { data, error } = await admin
          .from("certificados_digitais")
          .insert({
            tenant_id: tenantId,
            empresa,
            cnpj: meta.cnpj,
            titular: meta.titular,
            validade_ate: meta.validade_ate,
            pfx_cifrado: cifrar(pfx).toString("base64"),
            senha_cifrada: cifrarTexto(senha).toString("base64"),
            criado_por: g.auth.userId,
            ativo: true,
          })
          .select("id")
          .single();
        if (error) return Response.json({ ok: false, erro: error.message }, { status: 500 });

        await admin.from("tenant_fiscal_config").upsert(
          {
            tenant_id: tenantId,
            modo_captura: "certificado_proprio",
            cert_ref: data.id,
            atualizado_em: new Date().toISOString(),
          },
          { onConflict: "tenant_id" },
        );

        return Response.json({
          ok: true,
          certificado: {
            id: data.id,
            cnpj: meta.cnpj,
            titular: meta.titular,
            validade_ate: meta.validade_ate,
            emissor: meta.emissor,
          },
        });
      },
    },
  },
});
