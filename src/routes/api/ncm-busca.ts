import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { jsonrepair } from "jsonrepair";

import { exigirAcesso } from "@/lib/fiscal/guard";

/* ============================================================
   POST /api/ncm-busca — classifica um produto na NCM a partir da
   DESCRIÇÃO (reduz o trabalho manual de achar o código). Reusa o
   webhook da IA (Claude + web). Anti-invenção: devolve candidatos
   com nível de confiança e FONTE; nunca escolhe por pagar menos.
   ============================================================ */

const Corpo = z.object({
  descricao: z.string().min(2),
  idioma: z.enum(["pt", "ru"]).default("pt"),
});

const SISTEMA = `Você é um classificador fiscal especialista em NCM (Nomenclatura Comum do Mercosul — a mesma tabela da TIPI/TEC) e CEST, no Brasil. Dada a DESCRIÇÃO de um produto, PESQUISE (web) e devolva os NCMs mais prováveis.

Regras anti-invenção:
- Use as Regras Gerais de Interpretação (RGI), as Notas de Seção/Capítulo e a NESH. Só afirme um NCM sustentado por essas regras.
- Se houver dúvida entre enquadramentos, liste os candidatos ordenados por probabilidade, cada um com "confianca" (alta|media|baixa). Nunca escolha um NCM só porque gera menos imposto.
- Explique em linguagem de LEIGO (o usuário pode ser estrangeiro): diga em palavras simples por que o produto se encaixa naquele código.

Responda SOMENTE com JSON válido, sem markdown, no formato:
{ "candidatos": [ { "ncm": "8 dígitos", "descricao_oficial": "texto oficial da posição NCM", "cest": "código CEST ou null", "sujeito_st_hint": true|false|null, "justificativa": "por que se enquadra, em linguagem simples", "fonte_url": "url oficial ou null", "confianca": "alta|media|baixa" } ] }
Máximo 6 candidatos, do mais provável ao menos provável.`;

export const Route = createFileRoute("/api/ncm-busca")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const g = await exigirAcesso(request);
        if (!g.ok) return g.resposta;

        let corpo: z.infer<typeof Corpo>;
        try {
          corpo = Corpo.parse(await request.json());
        } catch (e) {
          return Response.json({ ok: false, erro: `Entrada inválida: ${(e as Error).message}` }, { status: 400 });
        }

        const WEBHOOK_URL = process.env.MASOR_CHAT_WEBHOOK_URL ?? process.env.MASOR_ANALISE_WEBHOOK_URL;
        const TOKEN = process.env.MASOR_WEBHOOK_TOKEN;
        if (!WEBHOOK_URL || !TOKEN) {
          return Response.json({ ok: false, erro: "Integração de IA não configurada." }, { status: 503 });
        }

        let resp: Response;
        try {
          resp = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "content-type": "application/json", "x-masor-token": TOKEN },
            body: JSON.stringify({
              modo: "ncm",
              system: SISTEMA,
              user: `DESCRIÇÃO DO PRODUTO:\n${corpo.descricao}`,
              idioma: corpo.idioma,
              meta: { modo: "ncm" },
            }),
            signal: AbortSignal.timeout(120_000),
          });
        } catch (e) {
          return Response.json({ ok: false, erro: `Falha ao contatar a IA: ${(e as Error).message}` }, { status: 502 });
        }
        if (!resp.ok) return Response.json({ ok: false, erro: `IA retornou status ${resp.status}.` }, { status: 502 });

        const bruto = (await resp.json()) as { analise_bruta?: string; resposta_bruta?: string; resposta?: string };
        const texto = bruto.analise_bruta ?? bruto.resposta_bruta ?? bruto.resposta ?? "";
        let out: { candidatos?: unknown } = {};
        try {
          out = JSON.parse(texto);
        } catch {
          try {
            const m = texto.match(/\{[\s\S]*\}/);
            out = m ? JSON.parse(jsonrepair(m[0])) : {};
          } catch {
            out = {};
          }
        }
        const candidatos = Array.isArray(out.candidatos) ? out.candidatos : [];
        return Response.json({ ok: true, candidatos });
      },
    },
  },
});
