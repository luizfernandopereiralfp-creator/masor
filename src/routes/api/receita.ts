import { createFileRoute } from "@tanstack/react-router";

import { exigirAcesso } from "@/lib/fiscal/guard";

/* ============================================================
   GET /api/receita?cnpj=XXXXXXXXXXXXXX — consulta CNPJ na Receita
   (BrasilAPI) do lado do SERVIDOR. Evita o "Failed to fetch" de
   CORS/CSP do navegador e mantém a consulta server-side (regra do
   projeto p/ Receita/QSA, LGPD). Exige sessão (evita proxy aberto).
   ============================================================ */

export const Route = createFileRoute("/api/receita")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const g = await exigirAcesso(request);
        if (!g.ok) return g.resposta;

        const cnpj = (new URL(request.url).searchParams.get("cnpj") ?? "").replace(/\D/g, "");
        if (cnpj.length !== 14) return Response.json({ ok: false, erro: "Informe um CNPJ com 14 dígitos." }, { status: 400 });

        let r: Response;
        try {
          r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, { signal: AbortSignal.timeout(15000) });
        } catch (e) {
          return Response.json({ ok: false, erro: `Falha ao consultar a Receita: ${(e as Error).message}` }, { status: 502 });
        }
        if (r.status === 404) return Response.json({ ok: false, erro: "CNPJ não encontrado na Receita." }, { status: 404 });
        if (!r.ok) return Response.json({ ok: false, erro: `Falha na consulta (${r.status}).` }, { status: 502 });

        const dados = await r.json();
        return Response.json({ ok: true, dados });
      },
    },
  },
});
