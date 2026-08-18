import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { IDIOMAS, parseParecer, ParecerIA } from "@/lib/ia/contrato";
import type { AnaliseFiscal } from "@/lib/ia/contrato";
import { supabaseComUsuario } from "@/integrations/supabase/client.server";
import { exigirAcesso } from "@/lib/fiscal/guard";
import {
  systemEspecialista,
  userEspecialista,
  type EntradaAnalise,
  type RegraUF,
} from "@/lib/ia/prompt-especialista";
import {
  calcularFiscal,
  type EntradaMotor,
  type Origem,
  type Finalidade,
  type RegimeEmpresa,
  type RegimeFornecedor,
  type PisCofins,
} from "@/lib/ia/motor-fiscal";

/* ============================================================
   POST /api/analisar (HÍBRIDO)
   1) monta o prompt e chama o n8n (Claude + web search);
   2) a IA devolve PARÂMETROS fiscais com fonte (não números);
   3) o motor determinístico faz a aritmética reproduzível;
   4) monta o relatório final (números do motor + narrativa da IA).
   ============================================================ */

const CorpoEntrada = z.object({
  operacao: z.record(z.string(), z.unknown()),
  idioma: z.enum(IDIOMAS).default("pt"),
  regras_uf: z.array(z.custom<RegraUF>()).optional(),
});

/** Parse pt-BR ("5,39") ou en ("5.39") → número. */
function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (v == null) return 0;
  const s = String(v).trim();
  if (!s) return 0;
  const norm = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  const n = parseFloat(norm);
  return isNaN(n) ? 0 : n;
}
const str = (v: unknown): string | null => (v == null || v === "" ? null : String(v));

export const Route = createFileRoute("/api/analisar")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Exige sessão (staff ou cliente) — evita proxy aberto/abuso do webhook pago da IA.
        const g = await exigirAcesso(request);
        if (!g.ok) return g.resposta;

        const WEBHOOK_URL = process.env.MASOR_ANALISE_WEBHOOK_URL;
        const TOKEN = process.env.MASOR_WEBHOOK_TOKEN;
        if (!WEBHOOK_URL || !TOKEN) {
          return Response.json(
            { ok: false, erro: "Integração de IA não configurada (env ausente)." },
            { status: 503 },
          );
        }

        let corpo: z.infer<typeof CorpoEntrada>;
        try {
          corpo = CorpoEntrada.parse(await request.json());
        } catch (e) {
          return Response.json({ ok: false, erro: `Entrada inválida: ${(e as Error).message}` }, { status: 400 });
        }
        const op = corpo.operacao;
        const hoje = new Date().toISOString().slice(0, 10);

        const entrada: EntradaAnalise = {
          operacao: op,
          idioma: corpo.idioma,
          regras_uf: corpo.regras_uf,
          hoje,
        };

        // Chave de cache: NCM + UF de destino + regime da empresa.
        const ncmKey = String(op.ncm ?? "").replace(/\D/g, "");
        const ufKey = str(op.uf_supermercado);
        const regimeKey = str(op.regime_empresa);
        const authToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
        const sb = authToken ? supabaseComUsuario(authToken) : null;

        let parecer: ParecerIA | null = null;
        let origemParecer: "cache" | "ia" = "ia";

        // 1a) Cache: reusa parecer < 30 dias p/ o mesmo NCM+UF+regime (corta custo/tempo da IA).
        if (sb && ncmKey.length >= 8 && ufKey) {
          const limite = new Date(Date.now() - 30 * 864e5).toISOString();
          const { data } = await sb
            .from("masor_ai_reviews")
            .select("parecer")
            .eq("ncm", ncmKey)
            .eq("uf", ufKey)
            .eq("regime", regimeKey ?? "")
            .eq("idioma", corpo.idioma)
            .gte("created_at", limite)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          const r = data?.parecer ? ParecerIA.safeParse(data.parecer) : null;
          if (r?.success) {
            parecer = r.data;
            origemParecer = "cache";
          }
        }

        // 1b) Sem cache → chama o n8n (que chama o Claude) e grava o parecer no cache.
        if (!parecer) {
          let respostaN8n: Response;
          try {
            respostaN8n = await fetch(WEBHOOK_URL, {
              method: "POST",
              headers: { "content-type": "application/json", "x-masor-token": TOKEN },
              body: JSON.stringify({
                system: systemEspecialista(entrada),
                user: userEspecialista(entrada),
                idioma: entrada.idioma,
                meta: { hoje },
              }),
              signal: AbortSignal.timeout(190_000),
            });
          } catch (e) {
            return Response.json({ ok: false, erro: `Falha ao contatar a IA: ${(e as Error).message}` }, { status: 502 });
          }
          if (!respostaN8n.ok) {
            return Response.json({ ok: false, erro: `IA retornou status ${respostaN8n.status}.` }, { status: 502 });
          }
          const dadosN8n = (await respostaN8n.json()) as { analise_bruta?: string };
          const parsed = parseParecer(dadosN8n.analise_bruta ?? "");
          if (!parsed.ok) {
            return Response.json(
              {
                ok: false,
                erro: "A IA não retornou os parâmetros no formato esperado — validação manual necessária.",
                detalhe: parsed.erro,
              },
              { status: 422 },
            );
          }
          parecer = parsed.data;
          if (sb && ncmKey.length >= 8 && ufKey) {
            void sb.from("masor_ai_reviews").insert({ ncm: ncmKey, uf: ufKey, regime: regimeKey, idioma: corpo.idioma, parecer });
          }
        }
        const pf = parecer.parametros_fiscais;

        // 2) a IA pode CORRIGIR o enquadramento PIS/COFINS informado pelo usuário
        let pisCofins = (str(op.pis_cofins) ?? "normal") as PisCofins;
        if (pf.monofasico === true) pisCofins = "monofasico";
        else if (pf.aliquota_zero_pc === true) pisCofins = "zero";

        // 3) motor determinístico faz a aritmética
        const entradaMotor: EntradaMotor = {
          custo_nf: num(op.custo_nf),
          ipi: num(op.ipi),
          frete: num(op.frete),
          descontos: num(op.descontos),
          origem: (str(op.origem_mercadoria) ?? "interna") as Origem,
          finalidade: (str(op.finalidade) ?? "revenda") as Finalidade,
          regime_empresa: (str(op.regime_empresa) ?? "lucro_real") as RegimeEmpresa,
          regime_fornecedor: (str(op.regime_fornecedor) ?? "normal") as RegimeFornecedor,
          credito_simples_pct: num(op.credito_simples_percent),
          st_retida: op.st_retida === true,
          consta_lista_st: op.consta_lista_st === true,
          pis_cofins: pisCofins,
          markup_pct: num(op.markup_percent) || 20,
          tipo_margem: op.tipo_margem === "markup" ? "markup" : "venda",
          das_efetivo_pct: num(op.das_efetivo_percent) || 4,
          params: {
            ...pf,
            mva_pct: pf.mva_pct ?? (op.mva_estimado ? num(op.mva_estimado) : null),
          },
          idioma: corpo.idioma,
        };
        const m = calcularFiscal(entradaMotor);

        // Rastreabilidade: cada parâmetro que entrou na conta, com sua fonte.
        const fonteDe = (campo: string): string | null =>
          parecer.fontes_parametros.find((x) => x.campo === campo && x.url)?.url ?? null;
        const vigenciaDe = (campo: string): string | null =>
          parecer.fontes_parametros.find((x) => x.campo === campo)?.vigencia ?? null;
        const T = (ptTxt: string, ruTxt: string) => (corpo.idioma === "ru" ? ruTxt : ptTxt);
        const simNao = (b: boolean | null) => (b === null ? null : b ? T("Sim", "Да") : T("Não", "Нет"));
        const parametros_aplicados: AnaliseFiscal["parametros_aplicados"] = [];
        const addParam = (rotulo: string, campo: string, valor: string | null) =>
          parametros_aplicados.push({
            rotulo,
            valor: valor ?? T("a confirmar", "уточняется"),
            fonte_url: fonteDe(campo),
            vigencia: vigenciaDe(campo),
            confirmado: valor !== null,
          });
        addParam(
          T("Alíquota interna (destino)", "Внутренняя ставка (назначение)"),
          "aliq_interna_destino",
          pf.aliq_interna_destino != null ? `${pf.aliq_interna_destino}%` : null,
        );
        if (entradaMotor.origem !== "interna")
          addParam(
            T("Região do destino (entrada interestadual)", "Регион назначения (межштатный вход)"),
            "regiao_destino",
            pf.regiao_destino
              ? pf.regiao_destino === "n_ne_co_es"
                ? T("N/NE/CO/ES · 7%", "С/СВ/ЦЗ/ES · 7%")
                : T("Sul/Sudeste · 12%", "Юг/Юго-Восток · 12%")
              : null,
          );
        addParam(T("Sujeito a ICMS-ST", "Облагается ICMS-ST"), "sujeito_st", simNao(pf.sujeito_st));
        addParam(T("PIS/COFINS monofásico", "PIS/COFINS монофазный"), "monofasico", simNao(pf.monofasico));
        if (pf.aliquota_zero_pc !== null)
          addParam(T("PIS/COFINS alíquota zero (cesta básica)", "PIS/COFINS нулевая ставка (базовая корзина)"), "aliquota_zero_pc", simNao(pf.aliquota_zero_pc));
        if (pf.reducao_base_icms_pct != null && pf.reducao_base_icms_pct > 0)
          addParam(T("Redução de base de ICMS", "Снижение базы ICMS"), "reducao_base_icms_pct", `${pf.reducao_base_icms_pct}%`);
        if (entradaMotor.consta_lista_st) {
          addParam(T("Antecipação de ST (destino)", "Предоплата ST (назначение)"), "antecipacao_st", simNao(pf.antecipacao_st));
          if (pf.mva_pct != null) addParam("MVA / IVA-ST", "mva_pct", `${pf.mva_pct}%`);
        }
        if (entradaMotor.regime_empresa === "simples")
          addParam(T("Equalização do Simples (destino)", "Уравнивание Simples (назначение)"), "equalizacao_simples", simNao(pf.equalizacao_simples));

        // 4) monta o relatório final: NÚMEROS do motor + NARRATIVA da IA
        const provisorio = m.provisorio || parecer.status === "provisorio";
        const analise: AnaliseFiscal = {
          status: provisorio ? "provisorio" : parecer.status,
          provisorio,
          idioma: parecer.idioma,
          formacao_preco: {
            custo_aquisicao: m.custo_aquisicao,
            frete_despesas: m.frete_despesas,
            creditos_tributarios: m.creditos_tributarios,
            debitos_saida_percent: m.debitos_saida_pct,
            custo_tributario_liquido: m.custo_tributario_liquido,
            markup_percent: m.markup_pct,
            margem_estimada_percent: m.margem_estimada_pct,
            preco_venda_sugerido: m.preco_venda_sugerido,
            formulas: m.memoria.filter((p) => p.formula).map((p) => `${p.rotulo}: ${p.formula}`),
          },
          parametros_aplicados,
          memoria_calculo: m.memoria.map((p) => ({
            rotulo: p.rotulo,
            formula: p.formula ?? null,
            valores: null,
            resultado: p.resultado,
            unidade: p.unidade,
            fonte_url: null,
            observacao: null,
          })),
          cenarios: parecer.cenarios,
          resumo_executivo: parecer.resumo_executivo,
          dados_considerados: op,
          uf_supermercado: str(op.uf_supermercado),
          uf_fornecedor: str(op.uf_fornecedor),
          tratamento_atual: parecer.tratamento_atual,
          impactos_reforma: parecer.impactos_reforma,
          oportunidades_economia: parecer.oportunidades_economia,
          ncms_enquadramentos: parecer.ncms_enquadramentos,
          beneficios_creditos_regimes: parecer.beneficios_creditos_regimes,
          riscos_pontos_atencao: [
            ...parecer.riscos_pontos_atencao,
            ...m.alertas.filter((a) => a.nivel === "info").map((a) => a.texto),
          ],
          fundamentacao_legal: parecer.fundamentacao_legal,
          fontes_oficiais: [
            ...parecer.fontes_oficiais,
            ...parecer.fontes_parametros
              .filter((f) => f.url)
              .map((f) => ({ titulo: f.campo, url: f.url as string, orgao: null, consultado_em: hoje })),
          ],
          data_verificacao_legislativa: hoje,
          dados_adicionais_necessarios: parecer.dados_adicionais_necessarios,
          pendencias: [
            ...parecer.pendencias,
            ...m.pendencias.map((p) => ({ campo: p.campo, motivo: p.motivo, impacto: null })),
          ],
          autoverificacao: {
            contas_consistentes: true,
            observacao: "Aritmética pelo motor determinístico Masor (reproduzível).",
          },
        };

        const avisos_sanidade = m.alertas.filter((a) => a.nivel === "atencao").map((a) => a.texto);
        return Response.json({ ok: true, analise, avisos_sanidade, origem_parecer: origemParecer });
      },
    },
  },
});
