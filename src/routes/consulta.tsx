import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, Loader2, ShieldCheck, TriangleAlert, ExternalLink } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Protegido } from "@/components/Protegido";
import { supabase } from "@/integrations/supabase/client";
import type { AnaliseFiscal } from "@/lib/ia/contrato";

export const Route = createFileRoute("/consulta")({
  component: Consulta,
});

/* ---------- helpers ---------- */
const NAVY = "var(--navy)";
const AMBER = "var(--amber)";
const MONO = "var(--font-mono)";

const brl = (v: number | null | undefined) =>
  v == null
    ? "—"
    : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
const pctFmt = (v: number | null | undefined) =>
  v == null ? "—" : `${(v * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

type Operacao = Record<string, unknown>;

function Consulta() {
  return (
    <Protegido>
      <ConsultaConteudo />
    </Protegido>
  );
}

function ConsultaConteudo() {
  const { lang } = useI18n();
  const { perfil } = useAuth();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);

  // ---- estado do formulário ----
  const [regimeEmpresa, setRegimeEmpresa] = useState("lucro_real");
  const [ufSuper, setUfSuper] = useState("SP");
  const [municipio, setMunicipio] = useState("");
  const [finalidade, setFinalidade] = useState("revenda");

  const [ufForn, setUfForn] = useState("");
  const [regimeForn, setRegimeForn] = useState("normal");
  const [credSimples, setCredSimples] = useState("");
  const [origem, setOrigem] = useState("sul_sudeste");

  const [descricao, setDescricao] = useState("");
  const [gtin, setGtin] = useState("");
  const [ncm, setNcm] = useState("");
  const [cest, setCest] = useState("");
  const [unidade, setUnidade] = useState("UN");
  const [custo, setCusto] = useState("");
  const [ipi, setIpi] = useState("");
  const [frete, setFrete] = useState("");
  const [descontos, setDescontos] = useState("");
  const [stRetida, setStRetida] = useState("N");
  const [naListaST, setNaListaST] = useState("N");
  const [mva, setMva] = useState("");
  const [pisCofins, setPisCofins] = useState("normal");

  const [markup, setMarkup] = useState("20");
  const [tipoMargem, setTipoMargem] = useState("venda");

  // ---- estado da análise ----
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [analise, setAnalise] = useState<AnaliseFiscal | null>(null);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const podeAnalisar = useMemo(
    () => descricao.trim() !== "" && ncm.replace(/\D/g, "").length >= 8 && Number(custo.replace(",", ".")) > 0,
    [descricao, ncm, custo],
  );

  async function analisar() {
    setStatus("loading");
    setErro(null);
    setAnalise(null);
    const operacao: Operacao = {
      uf_supermercado: ufSuper,
      municipio_supermercado: municipio || null,
      regime_empresa: regimeEmpresa,
      uf_fornecedor: ufForn || null,
      regime_fornecedor: regimeForn,
      credito_simples_percent: regimeForn === "simples" ? credSimples || null : null,
      origem_mercadoria: origem,
      finalidade,
      produto_descricao: descricao,
      gtin: gtin || null,
      ncm,
      cest: cest || null,
      unidade,
      custo_nf: custo,
      ipi: ipi || null,
      frete: frete || null,
      descontos: descontos || null,
      st_retida: stRetida === "S",
      consta_lista_st: naListaST === "S",
      mva_estimado: mva || null,
      pis_cofins: pisCofins,
      markup_percent: markup,
      tipo_margem: tipoMargem,
    };
    try {
      const r = await fetch("/api/analisar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ operacao, idioma: lang }),
      });
      const data = await r.json();
      if (!data.ok) {
        setErro(data.erro ?? tx("Falha na análise.", "Ошибка анализа."));
        setStatus("error");
        return;
      }
      setAnalise(data.analise as AnaliseFiscal);
      setAvisos((data.avisos_sanidade as string[]) ?? []);
      setStatus("ok");
      // Persiste no histórico (RLS garante o tenant). Fire-and-forget.
      if (supabase && perfil?.tenant_id) {
        void supabase
          .from("product_simulations")
          .insert({ tenant_id: perfil.tenant_id, origem: "consulta", payload: operacao, analise: data.analise });
      }
    } catch (e) {
      setErro((e as Error).message);
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--app-bg, #eef1f6)" }}>
      <header
        className="flex items-center justify-between gap-3 px-5 py-3"
        style={{ background: NAVY }}
      >
        <div className="flex items-center gap-3">
          <Link to="/" className="text-white/80 hover:text-white">
            <ArrowLeft size={18} />
          </Link>
          <div
            className="flex h-8 w-8 items-center justify-center rounded font-black text-sm"
            style={{ background: AMBER, color: NAVY }}
          >
            G41
          </div>
          <h1 className="text-sm font-bold tracking-wide text-white">
            Masor · {tx("Analisar um produto", "Анализ товара")}
          </h1>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 p-4 md:p-6 lg:grid-cols-[1fr_420px]">
        {/* ---------- formulário guiado ---------- */}
        <div className="grid gap-4">
          <Bloco n="01" titulo={tx("Sua empresa e a operação", "Ваша компания и операция")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label={tx("Regime da sua empresa", "Налоговый режим компании")}>
                <Sel
                  value={regimeEmpresa}
                  onChange={setRegimeEmpresa}
                  opts={[
                    ["lucro_real", tx("Lucro Real", "Lucro Real (общий)")],
                    ["presumido", tx("Lucro Presumido", "Lucro Presumido")],
                    ["simples", tx("Simples Nacional", "Simples Nacional")],
                  ]}
                />
              </Campo>
              <Campo label={tx("UF do supermercado (destino)", "Штат супермаркета")}>
                <Texto value={ufSuper} onChange={(v) => setUfSuper(v.toUpperCase().slice(0, 2))} mono />
              </Campo>
              <Campo label={tx("Município", "Город")}>
                <Texto value={municipio} onChange={setMunicipio} placeholder={tx("ex.: Campinas", "напр.: Кампинас")} />
              </Campo>
              <Campo
                label={tx("Finalidade da compra", "Цель покупки")}
                hint={tx("DIFAL só existe em uso/consumo/ativo.", "DIFAL только для потребления/актива.")}
              >
                <Alternar
                  value={finalidade}
                  onChange={setFinalidade}
                  opts={[
                    ["revenda", tx("Revenda", "Перепродажа")],
                    ["uso_consumo", tx("Uso / consumo / ativo", "Потребление / актив")],
                  ]}
                />
              </Campo>
            </div>
          </Bloco>

          <Bloco n="02" titulo={tx("Fornecedor", "Поставщик")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label={tx("UF de origem do fornecedor", "Штат поставщика")}>
                <Texto value={ufForn} onChange={(v) => setUfForn(v.toUpperCase().slice(0, 2))} mono placeholder="RS" />
              </Campo>
              <Campo label={tx("Origem da mercadoria", "Происхождение товара")}>
                <Sel
                  value={origem}
                  onChange={setOrigem}
                  opts={[
                    ["interna", tx("Mesmo estado (interna)", "Тот же штат")],
                    ["sul_sudeste", tx("Sul / Sudeste (exceto ES)", "Юг/Юго-восток (кроме ES)")],
                    ["n_ne_co_es", tx("Norte / NE / CO / ES", "Север / NE / CO / ES")],
                    ["importado", tx("Importado (Res. 13/2012) · 4%", "Импорт (Рез. 13/2012) · 4%")],
                  ]}
                />
              </Campo>
              <Campo label={tx("Regime do fornecedor", "Режим поставщика")}>
                <Alternar
                  value={regimeForn}
                  onChange={setRegimeForn}
                  opts={[
                    ["normal", tx("Regime normal", "Общий")],
                    ["simples", tx("Simples Nacional", "Simples")],
                  ]}
                />
              </Campo>
              {regimeForn === "simples" && (
                <Campo
                  label={tx("% ICMS creditável na NF", "% ICMS к зачёту в НН")}
                  hint={tx("LC 123 art. 23. Sem info = 0.", "LC 123 ст.23. Без данных = 0.")}
                >
                  <Texto value={credSimples} onChange={setCredSimples} mono placeholder="2,8" />
                </Campo>
              )}
            </div>
          </Bloco>

          <Bloco
            n="03"
            titulo={tx("Produto", "Товар")}
            sub={tx(
              "Comece pelo código de barras (EAN) — o NCM costuma vir dele.",
              "Начните со штрихкода (EAN) — NCM обычно из него.",
            )}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label={tx("Descrição do produto", "Описание товара")}>
                <Texto value={descricao} onChange={setDescricao} placeholder={tx("ex.: Shampoo 1 L", "напр.: Шампунь 1 л")} />
              </Campo>
              <Campo label={tx("Código de barras (EAN/GTIN)", "Штрихкод (EAN/GTIN)")}>
                <Texto value={gtin} onChange={setGtin} mono placeholder="7891234567890" />
              </Campo>
              <Campo label="NCM">
                <Texto value={ncm} onChange={setNcm} mono placeholder="3305.10.00" />
              </Campo>
              <Campo label={tx("CEST (se houver)", "CEST (если есть)")}>
                <Texto value={cest} onChange={setCest} mono placeholder="20.001.00" />
              </Campo>
              <Campo label={tx("Custo na NF (R$)", "Стоимость по НН (R$)")}>
                <Texto value={custo} onChange={setCusto} mono placeholder="5,39" />
              </Campo>
              <div className="grid grid-cols-3 gap-2">
                <Campo label="IPI (R$)">
                  <Texto value={ipi} onChange={setIpi} mono />
                </Campo>
                <Campo label={tx("Frete (R$)", "Доставка")}>
                  <Texto value={frete} onChange={setFrete} mono />
                </Campo>
                <Campo label={tx("Desc. (R$)", "Скидка")}>
                  <Texto value={descontos} onChange={setDescontos} mono />
                </Campo>
              </div>
              <Campo label={tx("ST retida na nota?", "ST удержан в НН?")}>
                <Alternar
                  value={stRetida}
                  onChange={setStRetida}
                  opts={[["N", tx("Não", "Нет")], ["S", tx("Sim", "Да")]]}
                />
              </Campo>
              <Campo
                label={tx("Produto na lista de ST do destino?", "Товар в списке ST штата?")}
                hint={tx("Não sabe? Deixe 'não' — a IA verifica.", "Не знаете? 'Нет' — ИИ проверит.")}
              >
                <Alternar
                  value={naListaST}
                  onChange={setNaListaST}
                  opts={[["N", tx("Não / não sei", "Нет / не знаю")], ["S", tx("Sim", "Да")]]}
                />
              </Campo>
              {naListaST === "S" && stRetida === "N" && (
                <Campo label={tx("MVA / IVA-ST estimado (%)", "MVA / IVA-ST (%)")}>
                  <Texto value={mva} onChange={setMva} mono placeholder="40" />
                </Campo>
              )}
              <Campo label={tx("PIS / COFINS do produto", "PIS / COFINS товара")}>
                <Sel
                  value={pisCofins}
                  onChange={setPisCofins}
                  opts={[
                    ["normal", tx("Tributação normal", "Обычное")],
                    ["monofasico", tx("Monofásico", "Монофазное")],
                    ["zero", tx("Alíquota zero", "Нулевая ставка")],
                  ]}
                />
              </Campo>
            </div>
          </Bloco>

          <Bloco n="04" titulo={tx("Margem desejada", "Желаемая маржа")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label={tx("Margem / markup alvo (%)", "Целевая маржа (%)")}>
                <Texto value={markup} onChange={setMarkup} mono />
              </Campo>
              <Campo label={tx("Como aplicar", "Как применять")}>
                <Alternar
                  value={tipoMargem}
                  onChange={setTipoMargem}
                  opts={[
                    ["venda", tx("Sobre a venda", "От продажи")],
                    ["markup", tx("Markup s/ custo", "Наценка от себест.")],
                  ]}
                />
              </Campo>
            </div>
          </Bloco>

          <button
            type="button"
            onClick={analisar}
            disabled={!podeAnalisar || status === "loading"}
            className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-opacity disabled:opacity-40"
            style={{ background: AMBER, color: NAVY }}
          >
            {status === "loading" ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {tx("Pesquisando a legislação e calculando…", "Изучаю законодательство и считаю…")}
              </>
            ) : (
              tx("Analisar com a IA especialista", "Анализ с ИИ-экспертом")
            )}
          </button>
          {!podeAnalisar && (
            <p className="text-[11px]" style={{ color: "#8892A4" }}>
              {tx(
                "Preencha ao menos descrição, NCM (8 dígitos) e custo para analisar.",
                "Укажите описание, NCM (8 цифр) и стоимость для анализа.",
              )}
            </p>
          )}
        </div>

        {/* ---------- painel de resultado ---------- */}
        <aside className="lg:sticky lg:top-6 self-start">
          {status === "idle" && (
            <div className="rounded-2xl border bg-white p-6 text-center" style={{ borderColor: "var(--border,#e2e8f0)" }}>
              <ShieldCheck size={28} className="mx-auto" style={{ color: AMBER }} />
              <p className="mt-3 text-sm font-semibold" style={{ color: NAVY }}>
                {tx("O parecer aparece aqui", "Заключение появится здесь")}
              </p>
              <p className="mt-1 text-xs" style={{ color: "#8892A4" }}>
                {tx(
                  "Cada valor vem com a fonte oficial. Sem confirmação, o resultado sai como provisório.",
                  "Каждое значение — с официальным источником. Без подтверждения — предварительно.",
                )}
              </p>
            </div>
          )}
          {status === "loading" && (
            <div className="rounded-2xl border bg-white p-6 text-center" style={{ borderColor: AMBER }}>
              <Loader2 size={28} className="mx-auto animate-spin" style={{ color: AMBER }} />
              <p className="mt-3 text-sm" style={{ color: NAVY }}>
                {tx(
                  "A IA está pesquisando a legislação vigente (pode levar até ~2 min com busca na web).",
                  "ИИ изучает действующее законодательство (до ~2 мин с веб-поиском).",
                )}
              </p>
            </div>
          )}
          {status === "error" && (
            <Alerta forte>
              {tx("Não foi possível concluir a análise:", "Не удалось завершить анализ:")} {erro}
            </Alerta>
          )}
          {status === "ok" && analise && <Relatorio a={analise} avisos={avisos} tx={tx} />}
        </aside>
      </main>
    </div>
  );
}

/* ============================================================
   Relatório — formato da persona (canhoto de NF + seções)
   ============================================================ */
function Relatorio({
  a,
  avisos,
  tx,
}: {
  a: AnaliseFiscal;
  avisos: string[];
  tx: (pt: string, ru: string) => string;
}) {
  const fp = a.formacao_preco;
  const statusLabel =
    a.status === "aprovado"
      ? tx("APROVADO", "ОДОБРЕНО")
      : a.status === "com_ressalvas"
        ? tx("COM RESSALVAS", "С ОГОВОРКАМИ")
        : tx("PROVISÓRIO", "ПРЕДВАРИТЕЛЬНО");

  return (
    <div className="grid gap-4">
      {/* canhoto de NF */}
      <div className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: "var(--border,#e2e8f0)" }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ background: NAVY }}>
          <span className="text-xs font-bold uppercase tracking-widest text-white">
            {tx("Resultado", "Результат")}
          </span>
          <span
            className="rounded px-2 py-0.5 text-[10px] font-bold"
            style={{
              background: a.status === "aprovado" ? AMBER : "var(--amber-soft)",
              color: NAVY,
            }}
          >
            {statusLabel}
          </span>
        </div>
        <div className="px-4 py-3">
          <LinhaNota label={tx("Custo de aquisição", "Себестоимость")} valor={brl(fp.custo_aquisicao)} />
          {fp.frete_despesas != null && fp.frete_despesas > 0 && (
            <LinhaNota label={tx("Frete e despesas", "Доставка и расходы")} valor={brl(fp.frete_despesas)} />
          )}
          {fp.creditos_tributarios != null && fp.creditos_tributarios > 0 && (
            <LinhaNota label={tx("Créditos", "Кредиты")} valor={brl(fp.creditos_tributarios)} negativo />
          )}
          <Tracejado />
          <LinhaNota label={tx("Custo tributário líquido", "Чистая налог. себест.")} valor={brl(fp.custo_tributario_liquido)} forte />
          <LinhaNota label={tx("Carga de saída", "Налог на выходе")} valor={pctFmt(fp.debitos_saida_percent)} />
          <LinhaNota label={tx("Margem estimada", "Оценка маржи")} valor={pctFmt(fp.margem_estimada_percent)} />
          <Tracejado />
          <div className="mt-1 rounded-lg p-3" style={{ background: "var(--amber-soft)" }}>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: NAVY }}>
              {tx("Preço mínimo de venda", "Мин. цена продажи")}
            </p>
            <p className="text-2xl font-bold" style={{ color: NAVY, fontFamily: MONO }}>
              {brl(fp.preco_venda_sugerido)}
            </p>
          </div>
        </div>
      </div>

      {/* parâmetros aplicados com fonte (rastreabilidade) */}
      {a.parametros_aplicados.length > 0 && (
        <Secao titulo={tx("Parâmetros aplicados (com fonte)", "Применённые параметры (с источником)")}>
          <div className="grid gap-1.5">
            {a.parametros_aplicados.map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-3 text-xs" style={{ color: NAVY }}>
                <span>{p.rotulo}</span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <b style={{ fontFamily: MONO }}>{p.valor}</b>
                  {p.fonte_url ? (
                    <a
                      href={p.fonte_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-0.5 underline"
                      style={{ color: "var(--info, #2563eb)" }}
                    >
                      {tx("fonte", "источник")}
                      <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                      style={{ background: "var(--amber-soft)", color: NAVY }}
                    >
                      ⚠ {tx("a confirmar", "уточнить")}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </Secao>
      )}

      {/* avisos de sanidade */}
      {avisos.length > 0 &&
        avisos.map((av, i) => (
          <Alerta key={i} forte>
            {av}
          </Alerta>
        ))}

      {/* pendências anti-invenção */}
      {a.pendencias.length > 0 && (
        <Secao titulo={tx("Pendências (não presumidas)", "Ожидает проверки")}>
          {a.pendencias.map((p, i) => (
            <Alerta key={i} forte>
              <b>{p.campo}:</b> {p.motivo}
            </Alerta>
          ))}
        </Secao>
      )}

      <Secao titulo={tx("Resumo executivo", "Резюме")}>
        <p className="text-sm leading-relaxed" style={{ color: NAVY }}>{a.resumo_executivo}</p>
      </Secao>

      <Secao titulo={tx("Tratamento tributário atual", "Текущий налоговый режим")}>
        <p className="text-sm leading-relaxed" style={{ color: NAVY }}>{a.tratamento_atual}</p>
      </Secao>

      <Secao titulo={tx("Impactos da Reforma Tributária", "Влияние налоговой реформы")}>
        <p className="text-sm leading-relaxed" style={{ color: NAVY }}>{a.impactos_reforma}</p>
      </Secao>

      {a.cenarios.length > 0 && (
        <Secao titulo={tx("Cenários: atual × transição × futuro", "Сценарии: сейчас × переход × будущее")}>
          <div className="grid gap-2">
            {a.cenarios.map((c, i) => (
              <div key={i} className="rounded-lg border p-2 text-xs" style={{ borderColor: "var(--border,#e2e8f0)", color: NAVY }}>
                <b className="uppercase">{c.fase}</b>
                {c.vigencia ? ` · ${c.vigencia}` : ""} — {c.resumo}
                {c.preco_venda_sugerido != null && (
                  <span style={{ fontFamily: MONO }}> · PV {brl(c.preco_venda_sugerido)}</span>
                )}
              </div>
            ))}
          </div>
        </Secao>
      )}

      {a.memoria_calculo.length > 0 && (
        <Secao titulo={tx("Memória de cálculo", "Расчёт")}>
          <div className="grid gap-1">
            {a.memoria_calculo.map((p, i) => (
              <div key={i} className="flex items-baseline justify-between gap-3 text-xs" style={{ color: NAVY }}>
                <span>
                  {p.rotulo}
                  {p.formula ? <span style={{ color: "#8892A4" }}> · {p.formula}</span> : null}
                </span>
                <span style={{ fontFamily: MONO, whiteSpace: "nowrap" }}>
                  {p.unidade === "%" ? pctFmt(p.resultado) : p.unidade === "un" ? (p.resultado ?? "—") : brl(p.resultado)}
                </span>
              </div>
            ))}
          </div>
        </Secao>
      )}

      {a.oportunidades_economia.length > 0 && (
        <Secao titulo={tx("Oportunidades de economia", "Возможности экономии")}>
          <Lista itens={a.oportunidades_economia} />
        </Secao>
      )}

      {a.beneficios_creditos_regimes.length > 0 && (
        <Secao titulo={tx("Benefícios, créditos e regimes", "Льготы, кредиты, режимы")}>
          <div className="grid gap-1">
            {a.beneficios_creditos_regimes.map((b, i) => (
              <div key={i} className="text-xs" style={{ color: NAVY }}>
                <b>{b.tipo}</b> — {b.descricao}{" "}
                {b.aplicavel === null ? (
                  <span style={{ color: AMBER }}>({tx("a confirmar", "уточнить")})</span>
                ) : b.aplicavel ? (
                  "✓"
                ) : (
                  "✕"
                )}
                {b.fundamento_url && <FonteLink url={b.fundamento_url} />}
              </div>
            ))}
          </div>
        </Secao>
      )}

      {a.ncms_enquadramentos.length > 0 && (
        <Secao titulo={tx("NCMs / enquadramentos possíveis", "Возможные NCM")}>
          <div className="grid gap-1">
            {a.ncms_enquadramentos.map((n, i) => (
              <div key={i} className="text-xs" style={{ color: NAVY }}>
                <b style={{ fontFamily: MONO }}>{n.ncm}</b>
                {n.cest ? ` · CEST ${n.cest}` : ""} — {n.justificativa}
                {n.fundamento_url && <FonteLink url={n.fundamento_url} />}
              </div>
            ))}
          </div>
        </Secao>
      )}

      {a.riscos_pontos_atencao.length > 0 && (
        <Secao titulo={tx("Riscos e pontos de atenção", "Риски")}>
          <Lista itens={a.riscos_pontos_atencao} />
        </Secao>
      )}

      {a.fundamentacao_legal.length > 0 && (
        <Secao titulo={tx("Fundamentação legal", "Правовое обоснование")}>
          <div className="grid gap-1">
            {a.fundamentacao_legal.map((f, i) => (
              <div key={i} className="text-xs" style={{ color: NAVY }}>
                <b>{f.norma}</b>
                {f.artigo ? `, ${f.artigo}` : ""} ({f.orgao}
                {f.vigencia ? ` · ${f.vigencia}` : ""}) — {f.afirmacao}
                {f.url && <FonteLink url={f.url} />}
              </div>
            ))}
          </div>
        </Secao>
      )}

      {a.dados_adicionais_necessarios.length > 0 && (
        <Secao titulo={tx("Dados adicionais úteis", "Доп. данные")}>
          <Lista itens={a.dados_adicionais_necessarios} />
        </Secao>
      )}

      {a.fontes_oficiais.length > 0 && (
        <Secao titulo={tx("Fontes oficiais consultadas", "Официальные источники")}>
          <div className="grid gap-1">
            {a.fontes_oficiais.map((f, i) => (
              <a
                key={i}
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs underline"
                style={{ color: NAVY }}
              >
                {f.titulo ?? f.url}
                <ExternalLink size={11} />
              </a>
            ))}
          </div>
        </Secao>
      )}

      <p className="text-[10px]" style={{ color: "#8892A4" }}>
        {tx("Última verificação legislativa:", "Последняя проверка:")} {a.data_verificacao_legislativa} ·{" "}
        {tx(
          "Simulação orientativa — pendências viram tarefa para a equipe fiscal G41.",
          "Ориентировочно — пункты уходят команде G41.",
        )}
      </p>
    </div>
  );
}

/* ---------- UI primitives ---------- */
function Bloco({ n, titulo, sub, children }: { n: string; titulo: string; sub?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-white" style={{ borderColor: "var(--border,#e2e8f0)" }}>
      <header className="flex items-baseline gap-3 border-b px-5 py-3" style={{ borderColor: "var(--border,#e2e8f0)" }}>
        <span className="text-xs font-bold tracking-widest" style={{ color: AMBER, fontFamily: MONO }}>{n}</span>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: NAVY }}>{titulo}</h2>
          {sub && <p className="mt-0.5 text-xs" style={{ color: "#8892A4" }}>{sub}</p>}
        </div>
      </header>
      <div className="grid gap-4 px-5 py-4">{children}</div>
    </section>
  );
}
function Campo({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: NAVY }}>{label}</span>
      {children}
      {hint && <span className="text-[11px] leading-snug" style={{ color: "#8892A4" }}>{hint}</span>}
    </label>
  );
}
function Texto({
  value,
  onChange,
  placeholder,
  mono,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <input
      type="text"
      inputMode={mono ? "decimal" : "text"}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-[color:var(--amber)]"
      style={{ borderColor: "var(--border,#e2e8f0)", color: NAVY, fontFamily: mono ? MONO : undefined }}
    />
  );
}
function Sel({ value, onChange, opts }: { value: string; onChange: (v: string) => void; opts: [string, string][] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border bg-white px-3 py-2 text-sm outline-none"
      style={{ borderColor: "var(--border,#e2e8f0)", color: NAVY }}
    >
      {opts.map(([v, t]) => (
        <option key={v} value={v}>{t}</option>
      ))}
    </select>
  );
}
function Alternar({ value, onChange, opts }: { value: string; onChange: (v: string) => void; opts: [string, string][] }) {
  return (
    <div className="inline-flex overflow-hidden rounded-md border" style={{ borderColor: "var(--border,#e2e8f0)" }}>
      {opts.map(([v, t]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className="px-3 py-1.5 text-xs font-semibold"
          style={value === v ? { background: NAVY, color: "#fff" } : { background: "#fff", color: NAVY }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
function LinhaNota({ label, valor, negativo, forte }: { label: string; valor: string; negativo?: boolean; forte?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-0.5">
      <span className="text-[10px] uppercase tracking-widest" style={{ color: forte ? NAVY : "#8892A4" }}>{label}</span>
      <span className={forte ? "text-base font-bold" : "text-sm"} style={{ color: NAVY, fontFamily: MONO, whiteSpace: "nowrap" }}>
        {negativo ? "−" : ""}
        {valor}
      </span>
    </div>
  );
}
const Tracejado = () => <div className="my-2" style={{ borderTop: "1px dashed #8892A4", opacity: 0.5 }} />;
function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-white p-4" style={{ borderColor: "var(--border,#e2e8f0)" }}>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: NAVY }}>{titulo}</h3>
      {children}
    </section>
  );
}
function Alerta({ children, forte }: { children: ReactNode; forte?: boolean }) {
  return (
    <div
      className="flex gap-2 rounded-md px-3 py-2 text-xs leading-relaxed"
      style={{
        background: forte ? "var(--amber-soft)" : "#fff",
        border: `1px solid ${forte ? AMBER : "var(--border,#e2e8f0)"}`,
        color: NAVY,
      }}
    >
      <TriangleAlert size={14} style={{ color: AMBER, flexShrink: 0, marginTop: 1 }} />
      <span>{children}</span>
    </div>
  );
}
function Lista({ itens }: { itens: string[] }) {
  return (
    <ul className="grid list-disc gap-1 pl-4 text-sm" style={{ color: NAVY }}>
      {itens.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
function FonteLink({ url }: { url: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="ml-1 inline-flex items-center underline" style={{ color: NAVY }}>
      <ExternalLink size={11} />
    </a>
  );
}
