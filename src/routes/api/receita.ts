import { createFileRoute } from "@tanstack/react-router";

import { exigirAcesso } from "@/lib/fiscal/guard";

/* ============================================================
   GET /api/receita?cnpj=XXXXXXXXXXXXXX — consulta CNPJ na Receita
   do lado do SERVIDOR (evita CORS/CSP no navegador e mantém a
   Receita/QSA fora do cliente — LGPD). Exige sessão.
   Robusto: tenta BrasilAPI; se ela rate-limitar/cair (403/429/5xx),
   cai para cnpj.ws e devolve no MESMO shape da BrasilAPI.
   ============================================================ */

const TIMEOUT = { signal: AbortSignal.timeout(15000) };

type Dados = Record<string, unknown>;

/** Fallback cnpj.ws (publica) mapeado para o shape que o cliente espera. */
async function viaCnpjWs(cnpj: string): Promise<Dados | null> {
  const r = await fetch(`https://publica.cnpj.ws/cnpj/${cnpj}`, TIMEOUT);
  if (!r.ok) return null;
  const j = (await r.json()) as {
    razao_social?: string;
    estabelecimento?: {
      nome_fantasia?: string;
      atividade_principal?: { subclasse?: string };
      logradouro?: string; numero?: string; complemento?: string; bairro?: string; cep?: string;
      cidade?: { nome?: string }; estado?: { sigla?: string };
      email?: string; ddd1?: string; telefone1?: string;
    };
    simples?: { simples?: string; mei?: string } | null;
  };
  const est = j.estabelecimento ?? {};
  const cnae = est.atividade_principal?.subclasse ? Number(String(est.atividade_principal.subclasse).replace(/\D/g, "")) : null;
  return {
    razao_social: j.razao_social ?? null,
    nome_fantasia: est.nome_fantasia ?? null,
    cnae_fiscal: cnae,
    opcao_pelo_simples: j.simples?.simples === "Sim",
    opcao_pelo_mei: j.simples?.mei === "Sim",
    email: est.email ?? null,
    ddd_telefone_1: est.ddd1 && est.telefone1 ? `${est.ddd1}${est.telefone1}` : null,
    logradouro: est.logradouro ?? null,
    numero: est.numero ?? null,
    complemento: est.complemento ?? null,
    bairro: est.bairro ?? null,
    municipio: est.cidade?.nome ?? null,
    uf: est.estado?.sigla ?? null,
    cep: est.cep ?? null,
  };
}

export const Route = createFileRoute("/api/receita")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const g = await exigirAcesso(request);
        if (!g.ok) return g.resposta;

        const cnpj = (new URL(request.url).searchParams.get("cnpj") ?? "").replace(/\D/g, "");
        if (cnpj.length !== 14) return Response.json({ ok: false, erro: "Informe um CNPJ com 14 dígitos." }, { status: 400 });

        let dados: Dados | null = null;
        let naoEncontrado = false;

        // 1) BrasilAPI
        try {
          const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, TIMEOUT);
          if (r.status === 404) naoEncontrado = true;
          else if (r.ok) dados = (await r.json()) as Dados;
        } catch {
          /* tenta o fallback abaixo */
        }

        // 2) Fallback cnpj.ws quando a BrasilAPI rate-limita/cai (não em 404 confirmado)
        if (!dados && !naoEncontrado) {
          try {
            dados = await viaCnpjWs(cnpj);
          } catch {
            /* segue para o erro genérico */
          }
        }

        if (!dados && naoEncontrado) return Response.json({ ok: false, erro: "CNPJ não encontrado na Receita." }, { status: 404 });
        if (!dados) return Response.json({ ok: false, erro: "Consulta à Receita indisponível no momento — tente novamente em instantes." }, { status: 502 });
        return Response.json({ ok: true, dados });
      },
    },
  },
});
