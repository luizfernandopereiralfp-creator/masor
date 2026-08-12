import { createFileRoute } from "@tanstack/react-router";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { exigirStaff } from "@/lib/fiscal/guard";
import { decifrar, decifrarTexto, cofreConfigurado } from "@/lib/fiscal/cofre";
import { agentMtls, soapPost } from "@/lib/fiscal/mtls";
import { envelopeDistDFe, endpointDFe } from "@/lib/fiscal/envelope";
import { parseRetornoDFe, CSTAT } from "@/lib/fiscal/dfe-parser";

/* ============================================================
   POST /api/dfe/buscar — captura as NF-e emitidas contra o CNPJ
   do tenant no Ambiente Nacional (NFeDistribuicaoDFe).

   Loop por NSU: começa do ult_nsu guardado, pede lotes até
   ultNSU >= maxNSU, grava cada documento (idempotente por NSU) e
   faz CHECKPOINT do ult_nsu a cada lote — se o processo morrer,
   retoma de onde parou.

   Regra oficial anti-"consumo indevido" (cStat 656): não consultar
   de novo enquanto ultNSU == maxNSU; aguardar ao menos 1 hora.
   ============================================================ */

const LIMITE_LOTES = 50; // trava de segurança contra loop infinito
const INTERVALO_MIN_MS = 60 * 60 * 1000; // 1h entre ciclos completos

export const Route = createFileRoute("/api/dfe/buscar")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const g = await exigirStaff(request);
        if (!g.ok) return g.resposta;

        if (!cofreConfigurado())
          return Response.json({ ok: false, erro: "Cofre não configurado (MASOR_CERT_ENC_KEY)." }, { status: 503 });
        const admin = supabaseAdmin();
        if (!admin) return Response.json({ ok: false, erro: "SUPABASE_SERVICE_ROLE_KEY ausente." }, { status: 503 });

        const corpo = (await request.json().catch(() => ({}))) as { tenant_id?: string; forcar?: boolean };
        const tenantId = corpo.tenant_id ?? g.auth.tenantId;
        if (!tenantId) return Response.json({ ok: false, erro: "tenant_id ausente." }, { status: 400 });

        // --- certificado ativo do tenant ---
        const { data: cert } = await admin
          .from("certificados_digitais")
          .select("id,cnpj,pfx_cifrado,senha_cifrada,validade_ate")
          .eq("tenant_id", tenantId)
          .eq("ativo", true)
          .order("criado_em", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!cert)
          return Response.json(
            { ok: false, erro: "Nenhum certificado ativo para esta empresa. Cadastre o A1 em /fiscal." },
            { status: 409 },
          );
        if (cert.validade_ate && cert.validade_ate < new Date().toISOString().slice(0, 10))
          return Response.json({ ok: false, erro: `Certificado vencido em ${cert.validade_ate}.` }, { status: 409 });

        // --- config / checkpoint ---
        const { data: cfg } = await admin
          .from("tenant_fiscal_config")
          .select("ult_nsu,atualizado_em")
          .eq("tenant_id", tenantId)
          .maybeSingle();

        // Respeita o intervalo mínimo (evita cStat 656 / bloqueio do CNPJ).
        if (!corpo.forcar && cfg?.atualizado_em) {
          const desde = Date.now() - new Date(cfg.atualizado_em).getTime();
          if (desde < INTERVALO_MIN_MS)
            return Response.json(
              {
                ok: false,
                erro: `Aguarde ${Math.ceil((INTERVALO_MIN_MS - desde) / 60000)} min. A SEFAZ bloqueia consultas frequentes (consumo indevido).`,
              },
              { status: 429 },
            );
        }

        // --- UF do tenant (para cUFAutor) ---
        const { data: tenant } = await admin.from("tenants").select("uf").eq("id", tenantId).maybeSingle();
        const uf = (tenant as { uf?: string } | null)?.uf ?? "SP";
        const tpAmb: 1 | 2 = process.env.NFE_TP_AMB === "2" ? 2 : 1;

        // --- decifra o certificado só em memória ---
        let pfx: Buffer, senha: string;
        try {
          pfx = decifrar(Buffer.from(String(cert.pfx_cifrado), "base64"));
          senha = decifrarTexto(Buffer.from(String(cert.senha_cifrada), "base64"));
        } catch (e) {
          return Response.json({ ok: false, erro: `Falha ao abrir o certificado guardado: ${(e as Error).message}` }, { status: 500 });
        }

        const agent = agentMtls(pfx, senha);
        const endpoint = endpointDFe(tpAmb);
        let ultNSU = String(cfg?.ult_nsu ?? "0");
        let maxNSU = "0";
        let capturados = 0;
        let lotes = 0;
        let cStat: string | null = null;
        let xMotivo: string | null = null;

        try {
          while (lotes < LIMITE_LOTES) {
            lotes++;
            const envelope = envelopeDistDFe({ tpAmb, uf, cnpj: cert.cnpj as string, consulta: { modo: "distNSU", ultNSU } });
            const resp = await soapPost(endpoint, envelope, agent);
            if (resp.status !== 200) {
              xMotivo = `HTTP ${resp.status} da SEFAZ`;
              break;
            }
            const ret = parseRetornoDFe(resp.corpo);
            cStat = ret.cStat;
            xMotivo = ret.xMotivo;
            maxNSU = ret.maxNSU ?? maxNSU;

            if (ret.docs.length) {
              const linhas = ret.docs.map((d) => ({
                tenant_id: tenantId,
                nsu: d.nsu,
                chave44: d.chave44,
                tipo: d.tipo,
                schema_dfe: d.schema,
                xml: d.xml,
                resumo: d.resumo,
              }));
              // Idempotente: unique(tenant_id, nsu).
              const { error: insErr, count } = await admin
                .from("dfe_documentos")
                .upsert(linhas, { onConflict: "tenant_id,nsu", ignoreDuplicates: true, count: "exact" });
              if (!insErr) capturados += count ?? linhas.length;
            }

            if (ret.ultNSU) ultNSU = ret.ultNSU;
            // checkpoint a cada lote
            await admin.from("tenant_fiscal_config").upsert(
              { tenant_id: tenantId, ult_nsu: ultNSU, atualizado_em: new Date().toISOString() },
              { onConflict: "tenant_id" },
            );

            if (cStat === CSTAT.CONSUMO_INDEVIDO) break; // 656: recuar imediatamente
            if (cStat === CSTAT.NENHUM_DOCUMENTO) break; // 137: nada novo
            if (!ret.docs.length) break;
            if (Number(ultNSU) >= Number(maxNSU)) break;
          }
        } catch (e) {
          return Response.json(
            { ok: false, erro: `Falha na comunicação com a SEFAZ: ${(e as Error).message}`, ultNSU, capturados },
            { status: 502 },
          );
        } finally {
          agent.destroy();
          pfx.fill(0);
          senha = "";
        }

        return Response.json({
          ok: cStat !== CSTAT.CONSUMO_INDEVIDO,
          capturados,
          lotes,
          ultNSU,
          maxNSU,
          cStat,
          xMotivo,
          aviso:
            cStat === CSTAT.CONSUMO_INDEVIDO
              ? "A SEFAZ sinalizou consumo indevido (656). Aguarde pelo menos 1 hora antes de tentar de novo."
              : cStat === CSTAT.NENHUM_DOCUMENTO
                ? "Nenhum documento novo."
                : null,
        });
      },
    },
  },
});
