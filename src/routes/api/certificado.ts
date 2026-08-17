import { createFileRoute } from "@tanstack/react-router";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { exigirAcesso, clienteEfetivo } from "@/lib/fiscal/guard";
import { certLiorConfigurado } from "@/lib/fiscal/cofre-lior";

/* ============================================================
   GET /api/certificado — status do certificado A1 ATIVO do cliente.

   O Masor REUSA o e-CNPJ que o cliente já cadastrou no LIOR
   (tabela clientes_certificados). Não há upload aqui — o certificado
   é gerido no cadastro do cliente no Lior. Lê via service role
   (clientes_certificados é admin-only), então qualquer staff vê o
   status. Devolve só metadados (validade/nome), nunca o segredo.
   ============================================================ */

export const Route = createFileRoute("/api/certificado")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const g = await exigirAcesso(request);
        if (!g.ok) return g.resposta;
        const clienteId = clienteEfetivo(g.auth, new URL(request.url).searchParams.get("cliente_id"));
        if (!clienteId) return Response.json({ ok: true, certificado: null, cofre_ok: certLiorConfigurado() });

        const admin = supabaseAdmin();
        if (!admin) return Response.json({ ok: false, erro: "SUPABASE_SERVICE_ROLE_KEY ausente." }, { status: 503 });

        const { data, error } = await admin
          .from("clientes_certificados")
          .select("filename_original,valido_de,valido_ate,ativo,uploaded_at")
          .eq("cliente_id", clienteId)
          .eq("ativo", true)
          .order("uploaded_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) return Response.json({ ok: false, erro: error.message }, { status: 500 });

        const cnpjRow = await admin.from("clientes").select("cnpj_cpf,razao_social").eq("id", clienteId).maybeSingle();

        return Response.json({
          ok: true,
          certificado: data
            ? {
                filename: data.filename_original,
                validade_ate: data.valido_ate,
                validade_de: data.valido_de,
                cnpj: (cnpjRow.data as { cnpj_cpf?: string } | null)?.cnpj_cpf ?? null,
                titular: (cnpjRow.data as { razao_social?: string } | null)?.razao_social ?? null,
              }
            : null,
          cofre_ok: certLiorConfigurado(),
        });
      },
    },
  },
});
