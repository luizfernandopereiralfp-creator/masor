import { createFileRoute } from "@tanstack/react-router";

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { exigirAcesso, clienteEfetivo } from "@/lib/fiscal/guard";
import { decifrarArquivoLior, decifrarSenhaLior, certLiorConfigurado } from "@/lib/fiscal/cofre-lior";
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
const COOLDOWN_656_MS = 75 * 60 * 1000; // após 656, esperar mais que 1h (algumas UFs punem além disso)
const DELAY_LOTE_MS = 300; // pausa entre lotes p/ evitar rajada (throttling da SEFAZ)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const Route = createFileRoute("/api/dfe/buscar")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const g = await exigirAcesso(request);
        if (!g.ok) return g.resposta;

        if (!certLiorConfigurado())
          return Response.json({ ok: false, erro: "Chave dos certificados (CERT_MASTER_KEY) não configurada no servidor." }, { status: 503 });
        const admin = supabaseAdmin();
        if (!admin) return Response.json({ ok: false, erro: "SUPABASE_SERVICE_ROLE_KEY ausente." }, { status: 503 });

        const corpo = (await request.json().catch(() => ({}))) as { cliente_id?: string; forcar?: boolean };
        const clienteId = clienteEfetivo(g.auth, corpo.cliente_id);
        if (!clienteId) return Response.json({ ok: false, erro: "cliente_id ausente." }, { status: 400 });

        // --- certificado A1 ATIVO do cliente (reusa o e-CNPJ guardado no LIOR) ---
        const { data: cert } = await admin
          .from("clientes_certificados")
          .select("storage_path,cifra_iv,cifra_auth_tag,senha_cifrada,senha_iv,senha_auth_tag,valido_ate")
          .eq("cliente_id", clienteId)
          .eq("ativo", true)
          .order("uploaded_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!cert)
          return Response.json(
            { ok: false, erro: "Cliente sem certificado A1 ativo. Cadastre o e-CNPJ no Lior (cadastro do cliente)." },
            { status: 409 },
          );
        if (cert.valido_ate && cert.valido_ate < new Date().toISOString().slice(0, 10))
          return Response.json({ ok: false, erro: `Certificado vencido em ${cert.valido_ate}.` }, { status: 409 });

        // --- config / checkpoint ---
        const { data: cfg } = await admin
          .from("masor_fiscal_config")
          .select("ult_nsu,atualizado_em,bloqueado_ate")
          .eq("cliente_id", clienteId)
          .maybeSingle();

        // Próxima janela permitida = max(último ciclo + 1h, bloqueio do 656).
        const agora = Date.now();
        let proximaMs = 0;
        if (cfg?.atualizado_em) proximaMs = new Date(cfg.atualizado_em).getTime() + INTERVALO_MIN_MS;
        if (cfg?.bloqueado_ate) proximaMs = Math.max(proximaMs, new Date(cfg.bloqueado_ate).getTime());

        // Respeita o intervalo mínimo (evita cStat 656 / bloqueio do CNPJ).
        if (!corpo.forcar && proximaMs > agora) {
          return Response.json(
            {
              ok: false,
              erro: `Aguarde ${Math.ceil((proximaMs - agora) / 60000)} min. A SEFAZ bloqueia consultas frequentes (consumo indevido).`,
              proxima_busca: new Date(proximaMs).toISOString(),
            },
            { status: 429 },
          );
        }

        // --- UF + CNPJ do cliente (do Lior) — UF em clientes.endereco (jsonb) ---
        const { data: cli } = await admin.from("clientes").select("endereco,cnpj_cpf").eq("id", clienteId).maybeSingle();
        const clienteRow = cli as { endereco?: { uf?: string }; cnpj_cpf?: string } | null;
        const uf = (clienteRow?.endereco?.uf as string) ?? "SP";
        const cnpj = (clienteRow?.cnpj_cpf ?? "").replace(/\D/g, "");
        if (cnpj.length !== 14)
          return Response.json({ ok: false, erro: "Cliente sem CNPJ válido cadastrado no Lior." }, { status: 409 });
        const tpAmb: 1 | 2 = process.env.NFE_TP_AMB === "2" ? 2 : 1;

        // --- baixa o cert cifrado do bucket do Lior e decifra só em memória ---
        let pfx: Buffer, senha: string;
        try {
          const { data: blob, error: dlErr } = await admin.storage.from("client-certificados").download(cert.storage_path);
          if (dlErr || !blob) throw new Error(dlErr?.message ?? "download do certificado falhou");
          const ciphertext = Buffer.from(await blob.arrayBuffer());
          pfx = decifrarArquivoLior(ciphertext, cert.cifra_iv, cert.cifra_auth_tag);
          senha = decifrarSenhaLior(cert.senha_cifrada, cert.senha_iv, cert.senha_auth_tag);
        } catch (e) {
          return Response.json({ ok: false, erro: `Falha ao abrir o certificado do Lior: ${(e as Error).message}` }, { status: 500 });
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
            if (lotes > 1) await sleep(DELAY_LOTE_MS); // evita rajada entre lotes
            const envelope = envelopeDistDFe({ tpAmb, uf, cnpj, consulta: { modo: "distNSU", ultNSU } });
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
                cliente_id: clienteId,
                nsu: d.nsu,
                chave44: d.chave44,
                tipo: d.tipo,
                schema_dfe: d.schema,
                xml: d.xml,
                resumo: d.resumo,
              }));
              // Idempotente: unique(cliente_id, nsu).
              const { error: insErr, count } = await admin
                .from("masor_dfe_documentos")
                .upsert(linhas, { onConflict: "cliente_id,nsu", ignoreDuplicates: true, count: "exact" });
              if (!insErr) capturados += count ?? linhas.length;
            }

            if (ret.ultNSU) ultNSU = ret.ultNSU;
            // checkpoint a cada lote
            await admin.from("masor_fiscal_config").upsert(
              { cliente_id: clienteId, ult_nsu: ultNSU, atualizado_em: new Date().toISOString() },
              { onConflict: "cliente_id" },
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

        // Consumo indevido (656): impõe cooldown maior que o intervalo normal.
        const bloqueio656 = cStat === CSTAT.CONSUMO_INDEVIDO;
        if (bloqueio656) {
          await admin.from("masor_fiscal_config").upsert(
            { cliente_id: clienteId, bloqueado_ate: new Date(Date.now() + COOLDOWN_656_MS).toISOString(), atualizado_em: new Date().toISOString() },
            { onConflict: "cliente_id" },
          );
        }
        const proximaBusca = new Date(Date.now() + (bloqueio656 ? COOLDOWN_656_MS : INTERVALO_MIN_MS)).toISOString();

        return Response.json({
          ok: !bloqueio656,
          capturados,
          lotes,
          ultNSU,
          maxNSU,
          cStat,
          xMotivo,
          proxima_busca: proximaBusca,
          aviso: bloqueio656
            ? "A SEFAZ sinalizou consumo indevido (656). Aguarde pelo menos 1 hora antes de tentar de novo."
            : cStat === CSTAT.NENHUM_DOCUMENTO
              ? "Nenhum documento novo."
              : null,
        });
      },
    },
  },
});
