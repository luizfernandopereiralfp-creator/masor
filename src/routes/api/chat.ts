import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { jsonrepair } from "jsonrepair";

import { supabaseComUsuario } from "@/integrations/supabase/client.server";

/* ============================================================
   POST /api/chat — diálogo com a IA sobre a análise atual.
   A IA pode (1) responder em texto, (2) devolver uma diretriz de
   apresentação (diretriz_view) que o cliente aplica no relatório,
   e (3) propor uma mudança no sistema (proposta) que vai para a
   fila de aprovação do administrador (/pendencias) — nunca aplica
   sozinha algo que altere regras/base fiscal.
   A chave da IA fica no n8n (mesmo padrão de /api/analisar).
   ============================================================ */

const Corpo = z.object({
  mensagem: z.string().min(1),
  historico: z
    .array(z.object({ papel: z.enum(["user", "assistant"]), texto: z.string() }))
    .max(20)
    .default([]),
  contexto: z.record(z.string(), z.unknown()).default({}),
  idioma: z.enum(["pt", "ru"]).default("pt"),
});

const SISTEMA = `Você é o assistente do Masor (inteligência tributária para supermercados no Brasil).
Fale de forma clara e didática. Você conversa sobre a análise fiscal em contexto e pode AJUSTAR a apresentação do relatório.
Regras anti-invenção: nunca invente alíquotas, NCMs, benefícios ou regras; se algo não for confirmável por fonte oficial, diga que é pendência.
Você NÃO altera regras fiscais/base do sistema diretamente: quando o usuário pedir uma mudança que afete a base (ex.: alíquota de uma UF, regra de um NCM), gere uma "proposta" — ela vai para aprovação do administrador.

Responda SEMPRE em JSON válido, sem markdown, com o formato:
{
  "resposta": "texto para o usuário",
  "diretriz_view": { "densidade": "enxuto|completo", "leigo": true|false, "abrir": ["fundamentacao","memoria","reforma","cenarios","beneficios","ncms","riscos","fontes","parametros","dados_adicionais"] | "todas", "fechar": [...] | "todas" } | null,
  "proposta": { "alvo": "tax_states:SP" | "ncm_rules:33051000:SP", "proposta": {campos}, "justificativa": "...", "fontes": [{"campo":"...","url":"..."}] } | null
}
Só inclua "diretriz_view" se o usuário pediu para mudar como o relatório aparece. Só inclua "proposta" se pediu uma mudança na base fiscal.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Fail-closed: só usuário autenticado usa a IA (evita proxy aberto p/ o n8n).
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
        const sb = token ? supabaseComUsuario(token) : null;
        if (!sb) return Response.json({ ok: false, erro: "Não autenticado." }, { status: 401 });
        const { data: userData, error: authErr } = await sb.auth.getUser();
        if (authErr || !userData?.user) return Response.json({ ok: false, erro: "Sessão inválida." }, { status: 401 });

        let corpo: z.infer<typeof Corpo>;
        try {
          corpo = Corpo.parse(await request.json());
        } catch (e) {
          return Response.json({ ok: false, erro: `Entrada inválida: ${(e as Error).message}` }, { status: 400 });
        }

        const WEBHOOK_URL = process.env.MASOR_CHAT_WEBHOOK_URL ?? process.env.MASOR_ANALISE_WEBHOOK_URL;
        const TOKEN = process.env.MASOR_WEBHOOK_TOKEN;
        if (!WEBHOOK_URL || !TOKEN || !process.env.MASOR_CHAT_WEBHOOK_URL) {
          // Sem workflow de chat conectado ainda: degrada com transparência.
          return Response.json({
            ok: true,
            resposta:
              corpo.idioma === "ru"
                ? "Чат ИИ ещё не подключён (нужен вебхук n8n masor-chat). Кнопки изменения вида уже работают."
                : "O chat livre da IA ainda não está conectado (falta o webhook n8n `masor-chat`). Os botões de apresentação já funcionam — posso deixar o relatório mais enxuto, mostrar a base legal, a memória de cálculo, etc.",
            diretriz_view: null,
            proposta: null,
            desconectado: true,
          });
        }

        let resp: Response;
        try {
          resp = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "content-type": "application/json", "x-masor-token": TOKEN },
            body: JSON.stringify({
              modo: "chat",
              system: SISTEMA,
              mensagem: corpo.mensagem,
              historico: corpo.historico,
              contexto: corpo.contexto,
              idioma: corpo.idioma,
            }),
            signal: AbortSignal.timeout(120_000),
          });
        } catch (e) {
          return Response.json({ ok: false, erro: `Falha ao contatar a IA: ${(e as Error).message}` }, { status: 502 });
        }
        if (!resp.ok) return Response.json({ ok: false, erro: `IA retornou status ${resp.status}.` }, { status: 502 });

        const bruto = (await resp.json()) as { resposta_bruta?: string; analise_bruta?: string; resposta?: string };
        const texto = bruto.resposta_bruta ?? bruto.analise_bruta ?? bruto.resposta ?? "";
        let out: { resposta?: string; diretriz_view?: unknown; proposta?: unknown } = {};
        try {
          out = JSON.parse(texto);
        } catch {
          try {
            const m = texto.match(/\{[\s\S]*\}/);
            out = m ? JSON.parse(jsonrepair(m[0])) : { resposta: texto };
          } catch {
            out = { resposta: texto || "—" };
          }
        }
        return Response.json({
          ok: true,
          resposta: out.resposta ?? "—",
          diretriz_view: out.diretriz_view ?? null,
          proposta: out.proposta ?? null,
        });
      },
    },
  },
});
