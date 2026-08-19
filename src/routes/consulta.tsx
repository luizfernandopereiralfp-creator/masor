import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Loader2, ShieldCheck, TriangleAlert, ExternalLink, Upload, ChevronDown, Download, FileText, RefreshCw } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Protegido } from "@/components/Protegido";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useEmpresa } from "@/lib/empresa";
import { parseNFe } from "@/lib/nfe/parse-nfe";
import { parsePdfNFe } from "@/lib/nfe/parse-pdf-nfe";
import { AnaliseFiscal } from "@/lib/ia/contrato";
import { ChatDock } from "@/components/ChatDock";
import { exportarAnaliseXlsx } from "@/lib/export/planilha";
import { gerarPdfAnalise } from "@/lib/export/pdf-analise";
import {
  VIEW_PADRAO,
  aplicarDiretriz,
  ROTULO_SECAO,
  type ViewPrefs,
  type SecaoId,
  type DiretrizView,
} from "@/lib/ia/apresentacao";

export const Route = createFileRoute("/consulta")({
  component: Consulta,
});

/* ---------- helpers ---------- */
const NAVY = "var(--navy)";
const INK = "var(--app-ink)";
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
    <Protegido permitirCliente>
      <ConsultaConteudo />
    </Protegido>
  );
}

function ConsultaConteudo() {
  const { lang } = useI18n();
  const { perfil } = useAuth();
  const { empresa } = useEmpresa();
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
  const [infoAdicional, setInfoAdicional] = useState("");
  const [contribuido, setContribuido] = useState(false);

  // ---- estado da análise ----
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [analise, setAnalise] = useState<AnaliseFiscal | null>(null);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [nfInfo, setNfInfo] = useState<string | null>(null);

  // ---- apresentação do relatório (a IA/os chips controlam) ----
  const [view, setView] = useState<ViewPrefs>(VIEW_PADRAO);
  const aplicarView = (d: DiretrizView) => setView((v) => aplicarDiretriz(v, d));
  const toggleSecao = (s: SecaoId) =>
    setView((v) => ({ ...v, abertas: v.abertas.includes(s) ? v.abertas.filter((x) => x !== s) : [...v.abertas, s] }));

  const metaExport = () => ({
    produto: descricao,
    ncm,
    uf: ufSuper,
    regime: regimeEmpresa,
    data: analise?.data_verificacao_legislativa,
  });

  async function exportar() {
    if (!analise) return;
    await exportarAnaliseXlsx(analise, metaExport());
  }

  async function exportarPdf() {
    if (!analise) return;
    await gerarPdfAnalise(analise, metaExport());
  }

  // Pré-preenche os dados fixos vindos do cadastro da empresa.
  useEffect(() => {
    if (!empresa) return;
    if (empresa.regime_tributario) setRegimeEmpresa(empresa.regime_tributario);
    if (empresa.uf) setUfSuper(empresa.uf);
    if (empresa.municipio) setMunicipio(empresa.municipio);
    if (empresa.markup_padrao != null) setMarkup(String(empresa.markup_padrao).replace(".", ","));
  }, [empresa]);

  // Importa uma NF-e (XML) e preenche os campos do produto (1º item).
  async function onNF(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    // PDF (DANFE): leitura best-effort; pré-preenche o que der.
    if (/\.pdf$/i.test(f.name) || f.type === "application/pdf") {
      const r = await parsePdfNFe(await f.arrayBuffer());
      if (!r.ok) {
        setNfInfo(r.erro ?? tx("Não consegui ler o PDF.", "Не удалось прочитать PDF."));
        return;
      }
      const it = r.itens[0];
      if (it) {
        if (it.descricao) setDescricao(it.descricao);
        if (it.ncm) setNcm(it.ncm);
        if (it.valor != null) setCusto(String(it.valor).replace(".", ","));
      }
      if (r.emit_uf) setUfForn(r.emit_uf);
      setNfInfo(r.aviso ?? tx("PDF lido.", "PDF прочитан."));
      return;
    }
    const parsed = parseNFe(await f.text());
    if (!parsed.ok || !parsed.itens.length) {
      setNfInfo(tx("Não consegui ler o XML.", "Не удалось прочитать XML."));
      return;
    }
    const it = parsed.itens[0];
    setDescricao(it.xProd ?? "");
    setGtin(it.cEAN && it.cEAN !== "SEM GTIN" ? it.cEAN : "");
    setNcm(it.ncm ?? "");
    setCest(it.cest ?? "");
    setUnidade(it.uCom ?? "UN");
    if (it.vUnCom != null) setCusto(String(it.vUnCom).replace(".", ","));
    if (parsed.emit_uf) setUfForn(parsed.emit_uf);
    const imp = ["1", "2", "3", "8"].includes(it.orig ?? "");
    setOrigem(imp ? "importado" : parsed.emit_uf && parsed.emit_uf === parsed.dest_uf ? "interna" : "sul_sudeste");
    const cst = it.cst_icms ?? "";
    setStRetida(cst === "60" || cst === "500" ? "S" : "N");
    const pis = it.cst_pis ?? "";
    setPisCofins(["04", "05"].includes(pis) ? "monofasico" : ["06", "07", "08", "09"].includes(pis) ? "zero" : "normal");
    setNfInfo(
      parsed.itens.length > 1
        ? tx(`NF com ${parsed.itens.length} itens — carreguei o 1º. Vários? use Importar em lote.`, `${parsed.itens.length} позиций — загрузил 1-ю.`)
        : tx("Dados do produto carregados da NF.", "Данные загружены из NF."),
    );
  }

  // Aprendizado: envia a análise + info do usuário como proposta de regra (fila de revisão).
  async function contribuir() {
    if (!supabase || !perfil || !analise) return;
    const { error } = await supabase.from("masor_rule_change_requests").insert({
      cliente_id: perfil.cliente_id,
      proposto_por: perfil.user_id,
      alvo: `ncm_rules:${ncm.replace(/\D/g, "")}:${ufSuper}`,
      proposta: {
        ncm: ncm.replace(/\D/g, ""),
        uf: ufSuper,
        regime: regimeEmpresa,
        parametros_aplicados: analise.parametros_aplicados,
        informacao_adicional: infoAdicional || null,
      },
      justificativa: infoAdicional || null,
      fontes: analise.fontes_oficiais,
    });
    if (error) setErro(tx("Não consegui enviar à revisão agora.", "Не удалось отправить на проверку."));
    else setContribuido(true);
  }

  const podeAnalisar = useMemo(
    () => descricao.trim() !== "" && ncm.replace(/\D/g, "").length >= 8 && Number(custo.replace(",", ".")) > 0,
    [descricao, ncm, custo],
  );

  async function analisar() {
    setStatus("loading");
    setErro(null);
    setAnalise(null);
    setContribuido(false);
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
      informacao_adicional: infoAdicional || null,
    };
    try {
      const tok = supabase ? (await supabase.auth.getSession()).data.session?.access_token : null;
      const r = await fetch("/api/analisar", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(tok ? { authorization: `Bearer ${tok}` } : {}),
        },
        body: JSON.stringify({ operacao, idioma: lang }),
      });
      const data = await r.json();
      if (!data.ok) {
        setErro(data.erro ?? tx("Falha na análise.", "Ошибка анализа."));
        setStatus("error");
        return;
      }
      const parsed = AnaliseFiscal.safeParse(data.analise);
      setAnalise(parsed.success ? parsed.data : (data.analise as AnaliseFiscal));
      setAvisos((data.avisos_sanidade as string[]) ?? []);
      setStatus("ok");
      // Persiste no histórico (RLS garante o tenant). Fire-and-forget.
      if (supabase && perfil) {
        void supabase
          .from("masor_product_simulations")
          .insert({ cliente_id: perfil.cliente_id, origem: "consulta", payload: operacao, analise: data.analise });
      }
    } catch (e) {
      setErro((e as Error).message);
      setStatus("error");
    }
  }

  return (
    <AppShell>
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_420px]">
        {/* ---------- formulário guiado ---------- */}
        <div className="grid gap-4">
          <Bloco n="01" titulo={tx("Operação", "Операция")}>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2" style={{ background: "#f1f3f8" }}>
              <span className="text-xs" style={{ color: INK }}>
                {tx("Empresa", "Компания")}:{" "}
                <b>{regimeEmpresa === "lucro_real" ? "Lucro Real" : regimeEmpresa === "presumido" ? "Presumido" : "Simples"}</b>
                {ufSuper ? ` · ${ufSuper}` : ""}
                {municipio ? ` · ${municipio}` : ""}
              </span>
              <Link to="/empresa" className="text-[11px] font-semibold underline" style={{ color: INK }}>
                {tx("editar cadastro", "изменить")}
              </Link>
            </div>
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
            <label
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs font-semibold"
              style={{ borderColor: AMBER, color: INK }}
            >
              <Upload size={14} />
              {tx("Preencher a partir de uma NF-e (XML ou PDF)", "Заполнить из NF-e (XML или PDF)")}
              <input type="file" accept=".xml,text/xml,application/xml,.pdf,application/pdf" className="hidden" onChange={onNF} />
              {nfInfo && <span className="ml-1 font-normal" style={{ color: "var(--app-muted)" }}>· {nfInfo}</span>}
            </label>
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

          <Bloco
            n="05"
            titulo={tx("Informação adicional (opcional)", "Доп. информация (необязательно)")}
            sub={tx(
              "A IA considera e VERIFICA em fonte oficial — não aceita cega. Ajuda o sistema a aprender.",
              "ИИ учитывает и ПРОВЕРЯЕТ по официальному источнику.",
            )}
          >
            <textarea
              value={infoAdicional}
              onChange={(e) => setInfoAdicional(e.target.value)}
              rows={2}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none"
              style={{ borderColor: "var(--border,#e2e8f0)", color: INK }}
              placeholder={tx("ex.: benefício estadual, regra específica, correção…", "напр.: льгота, правило, поправка…")}
            />
          </Bloco>

          <button
            type="button"
            onClick={analisar}
            disabled={!podeAnalisar || status === "loading"}
            className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-opacity disabled:opacity-40"
            style={{ background: AMBER, color: INK }}
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
            <p className="text-[11px]" style={{ color: "var(--app-muted)" }}>
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
            <div className="rounded-2xl border bg-[var(--card)] p-6 text-center" style={{ borderColor: "var(--border,#e2e8f0)" }}>
              <ShieldCheck size={28} className="mx-auto" style={{ color: AMBER }} />
              <p className="mt-3 text-sm font-semibold" style={{ color: INK }}>
                {tx("O parecer aparece aqui", "Заключение появится здесь")}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--app-muted)" }}>
                {tx(
                  "Cada valor vem com a fonte oficial. Sem confirmação, o resultado sai como provisório.",
                  "Каждое значение — с официальным источником. Без подтверждения — предварительно.",
                )}
              </p>
            </div>
          )}
          {status === "loading" && (
            <div className="rounded-2xl border bg-[var(--card)] p-6 text-center" style={{ borderColor: AMBER }}>
              <Loader2 size={28} className="mx-auto animate-spin" style={{ color: AMBER }} />
              <p className="mt-3 text-sm" style={{ color: INK }}>
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
          {status === "ok" && analise && (
            <>
              <Relatorio
                a={analise}
                avisos={avisos}
                tx={tx}
                view={view}
                onDiretriz={aplicarView}
                onToggle={toggleSecao}
                onExport={exportar}
                onPdf={exportarPdf}
              />
              <button
                type="button"
                onClick={contribuir}
                disabled={contribuido}
                className="mt-3 w-full rounded-lg border px-4 py-2 text-xs font-semibold disabled:opacity-60"
                style={{ borderColor: NAVY, color: INK }}
              >
                {contribuido
                  ? tx("Enviado à revisão da equipe fiscal ✓", "Отправлено на проверку ✓")
                  : tx("Contribuir com a base fiscal (enviar à revisão)", "Внести в базу (на проверку)")}
              </button>
            </>
          )}
        </aside>
      </div>

      {/* caixa de IA sempre disponível */}
      <ChatDock
        idioma={lang}
        contexto={{ analise, operacao: { ncm, uf: ufSuper, regime: regimeEmpresa, produto: descricao } }}
        onDiretriz={aplicarView}
        onExport={analise ? exportar : undefined}
      />
    </AppShell>
  );
}

/* ============================================================
   Relatório — enxuto e didático: números em evidência no topo,
   detalhes em seções colapsáveis que a IA/os chips abrem.
   ============================================================ */
function Relatorio({
  a,
  avisos,
  tx,
  view,
  onDiretriz,
  onToggle,
  onExport,
  onPdf,
}: {
  a: AnaliseFiscal;
  avisos: string[];
  tx: (pt: string, ru: string) => string;
  view: ViewPrefs;
  onDiretriz: (d: DiretrizView) => void;
  onToggle: (s: SecaoId) => void;
  onExport: () => void;
  onPdf: () => void;
}) {
  const fp = a.formacao_preco;
  const statusLabel =
    a.status === "aprovado"
      ? tx("Aprovado", "Одобрено")
      : a.status === "com_ressalvas"
        ? tx("Com ressalvas", "С оговорками")
        : tx("Provisório", "Предварительно");
  const statusCor = a.status === "aprovado" ? "var(--success,#1f9d55)" : AMBER;

  // Frase didática. Só afirma o número quando a análise está APROVADA e os
  // valores existem — senão mostra o resumo da IA (com as ressalvas), nunca
  // apresenta um preço provisório como fato (anti-invenção).
  const margem = fp.margem_estimada_percent != null ? Math.round(fp.margem_estimada_percent * 100) : null;
  const podeTemplate =
    view.leigo && a.status === "aprovado" && fp.preco_venda_sugerido != null && fp.custo_tributario_liquido != null;
  const frase = podeTemplate
    ? tx(
        `Depois de impostos e créditos, cada unidade custa ${brl(fp.custo_tributario_liquido)}. Para ter cerca de ${margem ?? "—"}% de margem, venda por no mínimo ${brl(fp.preco_venda_sugerido)}.`,
        `После налогов и кредитов единица стоит ${brl(fp.custo_tributario_liquido)}. Для маржи около ${margem ?? "—"}% продавайте минимум за ${brl(fp.preco_venda_sugerido)}.`,
      )
    : a.resumo_executivo;

  const estaAberta = (s: SecaoId) => view.abertas.includes(s);

  return (
    <div className="grid gap-3">
      {/* barra de controle: densidade + exportar */}
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex overflow-hidden rounded-lg border" style={{ borderColor: "var(--border,#e2e8f0)" }}>
          {(["enxuto", "completo"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDiretriz(d === "completo" ? { densidade: "completo", abrir: "todas" } : { densidade: "enxuto", fechar: "todas" })}
              className="px-3 py-1 text-[11px] font-bold"
              style={view.densidade === d ? { background: NAVY, color: "#fff" } : { background: "var(--card)", color: INK }}
            >
              {d === "enxuto" ? tx("Enxuto", "Кратко") : tx("Completo", "Полный")}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPdf}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold"
            style={{ background: AMBER, color: NAVY }}
          >
            <FileText size={13} /> {tx("Gerar PDF", "Скачать PDF")}
          </button>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold"
            style={{ borderColor: NAVY, color: INK }}
          >
            <Download size={13} /> {tx("Exportar planilha", "Экспорт")}
          </button>
        </div>
      </div>

      {/* HERO — números em evidência */}
      <div className="overflow-hidden rounded-2xl border bg-[var(--card)]" style={{ borderColor: "var(--border,#e2e8f0)" }}>
        <div className="flex items-center justify-between px-4 py-2.5" style={{ background: NAVY }}>
          <span className="text-xs font-bold uppercase tracking-widest text-white">{tx("Resultado", "Результат")}</span>
          <span className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white" style={{ background: statusCor }}>
            {a.status === "aprovado" ? <ShieldCheck size={11} /> : <TriangleAlert size={11} />}
            {statusLabel}
          </span>
        </div>
        <div className="p-4">
          {/* preço mínimo — o número que mais importa */}
          <div className="rounded-xl p-4 text-center" style={{ background: "var(--amber-soft)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: INK }}>
              {tx("Preço mínimo de venda", "Мин. цена продажи")}
            </p>
            <p className="text-4xl font-black leading-tight" style={{ color: INK, fontFamily: MONO }}>
              {brl(fp.preco_venda_sugerido)}
            </p>
          </div>
          {/* dois indicadores de apoio */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Indicador rotulo={tx("Custo tributário líquido", "Чистая себест.")} valor={brl(fp.custo_tributario_liquido)} />
            <Indicador rotulo={tx("Margem estimada", "Маржа")} valor={pctFmt(fp.margem_estimada_percent)} />
          </div>
          {/* frase didática */}
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--app-muted)" }}>{frase}</p>
        </div>
      </div>

      {/* SIMULADOR DA REFORMA — preço mínimo hoje × pós-CBS/IBS/IS */}
      {(() => {
        const futuro = a.cenarios.find((c) => c.fase === "futuro" && c.preco_venda_sugerido != null);
        const hoje = fp.preco_venda_sugerido;
        if (!futuro || hoje == null || futuro.preco_venda_sugerido == null) return null;
        const pv2 = futuro.preco_venda_sugerido;
        const delta = pv2 - hoje;
        const pct = hoje > 0 ? Math.round((delta / hoje) * 1000) / 10 : null;
        const sobe = delta > 0.005;
        const desce = delta < -0.005;
        const cor = sobe ? "var(--warn,#b45309)" : desce ? "var(--success,#1f9d55)" : "var(--app-muted)";
        return (
          <div className="overflow-hidden rounded-2xl border bg-[var(--card)]" style={{ borderColor: "var(--border,#e2e8f0)" }}>
            <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "var(--info,#0047AA)" }}>
              <RefreshCw size={13} className="text-white" />
              <span className="text-xs font-bold uppercase tracking-widest text-white">
                {tx("Simulador da Reforma", "Симулятор реформы")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4">
              <div className="rounded-xl p-3 text-center" style={{ background: "var(--app-bg2)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--app-muted)" }}>
                  {tx("Preço mínimo hoje", "Мин. цена сегодня")}
                </p>
                <p className="text-2xl font-black" style={{ color: INK, fontFamily: MONO }}>{brl(hoje)}</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "var(--app-bg2)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--app-muted)" }}>
                  {tx("Pós-Reforma (CBS/IBS/IS)", "После реформы")}
                </p>
                <p className="text-2xl font-black" style={{ color: INK, fontFamily: MONO }}>{brl(pv2)}</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 pb-2 text-sm font-bold" style={{ color: cor, fontFamily: MONO }}>
              {sobe ? "▲" : desce ? "▼" : "="} {brl(Math.abs(delta))}
              {pct != null ? ` (${pct > 0 ? "+" : ""}${pct}%)` : ""}
            </div>
            <p className="px-4 pb-4 text-[11px] leading-relaxed" style={{ color: "var(--app-muted)" }}>
              ⚠{" "}
              {tx(
                `Estimativa — a Reforma (CBS/IBS/IS) está em transição${futuro.vigencia ? `, ${futuro.vigencia}` : ""} (base LC 214/2025 e EC 132/2023). ${futuro.resumo ?? ""}`,
                `Оценка — реформа (CBS/IBS/IS) в переходном периоде. ${futuro.resumo ?? ""}`,
              )}
            </p>
          </div>
        );
      })()}

      {/* avisos + pendências — sempre visíveis (anti-invenção) */}
      {avisos.map((av, i) => (
        <Alerta key={`av${i}`} forte>{av}</Alerta>
      ))}
      {a.pendencias.length > 0 && (
        <div className="rounded-xl border p-3" style={{ borderColor: AMBER, background: "var(--amber-soft)" }}>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest" style={{ color: INK }}>
            {tx("A confirmar (não presumido)", "Уточнить")}
          </p>
          <div className="grid gap-1.5">
            {a.pendencias.map((p, i) => (
              <div key={i} className="text-xs leading-relaxed" style={{ color: INK }}>
                <b>{p.campo}:</b> {p.motivo}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* formação do preço (decomposição) — sempre visível, enxuta ou completa */}
      <div className="rounded-xl border bg-[var(--card)] px-4 py-3" style={{ borderColor: "var(--border,#e2e8f0)" }}>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--app-muted)" }}>
          {tx("Como se forma o preço", "Как формируется цена")}
        </p>
        <MiniLinha label={tx("Custo de aquisição", "Себестоимость")} valor={brl(fp.custo_aquisicao)} />
        {fp.frete_despesas != null && fp.frete_despesas > 0 && (
          <MiniLinha label={tx("+ Frete e despesas", "+ Доставка")} valor={brl(fp.frete_despesas)} />
        )}
        {fp.creditos_tributarios != null && fp.creditos_tributarios > 0 && (
          <MiniLinha label={tx("− Créditos", "− Кредиты")} valor={brl(fp.creditos_tributarios)} />
        )}
        <MiniLinha label={tx("= Custo líquido", "= Чистая себест.")} valor={brl(fp.custo_tributario_liquido)} forte />
      </div>

      {/* ---- seções colapsáveis ---- */}
      <Colapsavel
        id="parametros"
        titulo={ROTULO_SECAO.parametros}
        n={a.parametros_aplicados.length}
        aberta={estaAberta("parametros")}
        onToggle={onToggle}
        tx={tx}
      >
        <div className="grid gap-1.5">
          {a.parametros_aplicados.map((p, i) => (
            <div key={i} className="flex items-center justify-between gap-3 text-xs" style={{ color: INK }}>
              <span className="flex flex-col">
                <span>{p.rotulo}</span>
                {p.vigencia ? (
                  <span className="text-[10px]" style={{ color: "var(--app-muted)" }}>
                    {p.vigencia}
                  </span>
                ) : null}
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <b style={{ fontFamily: MONO }}>{p.valor}</b>
                {p.fonte_url ? (
                  <a href={p.fonte_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 underline" style={{ color: "var(--info,#2563eb)" }}>
                    {tx("fonte", "источник")}
                    <ExternalLink size={10} />
                  </a>
                ) : (
                  <span className="rounded px-1.5 py-0.5 text-[10px] font-bold" style={{ background: "var(--amber-soft)", color: INK }}>
                    ⚠ {tx("a confirmar", "уточнить")}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </Colapsavel>

      <Colapsavel id="memoria" titulo={ROTULO_SECAO.memoria} n={a.memoria_calculo.length} aberta={estaAberta("memoria")} onToggle={onToggle} tx={tx}>
        <div className="grid gap-1">
          {a.memoria_calculo.map((p, i) => (
            <div key={i} className="flex items-baseline justify-between gap-3 text-xs" style={{ color: INK }}>
              <span>
                {p.rotulo}
                {p.formula ? <span style={{ color: "var(--app-muted)" }}> · {p.formula}</span> : null}
              </span>
              <span style={{ fontFamily: MONO, whiteSpace: "nowrap" }}>
                {p.unidade === "%" ? pctFmt(p.resultado) : p.unidade === "un" ? (p.resultado ?? "—") : brl(p.resultado)}
              </span>
            </div>
          ))}
        </div>
      </Colapsavel>

      <Colapsavel id="reforma" titulo={ROTULO_SECAO.reforma} aberta={estaAberta("reforma")} onToggle={onToggle} tx={tx}>
        <p className="mb-2 text-sm leading-relaxed" style={{ color: INK }}>
          <b className="text-xs uppercase tracking-wide" style={{ color: "var(--app-muted)" }}>{tx("Hoje", "Сегодня")}: </b>
          {a.tratamento_atual}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: INK }}>
          <b className="text-xs uppercase tracking-wide" style={{ color: "var(--app-muted)" }}>{tx("Reforma", "Реформа")}: </b>
          {a.impactos_reforma}
        </p>
      </Colapsavel>

      {a.cenarios.length > 0 && (
        <Colapsavel id="cenarios" titulo={ROTULO_SECAO.cenarios} n={a.cenarios.length} aberta={estaAberta("cenarios")} onToggle={onToggle} tx={tx}>
          <div className="grid gap-2">
            {a.cenarios.map((c, i) => (
              <div key={i} className="rounded-lg border p-2 text-xs" style={{ borderColor: "var(--border,#e2e8f0)", color: INK }}>
                <b className="uppercase">{c.fase}</b>
                {c.vigencia ? ` · ${c.vigencia}` : ""} — {c.resumo}
                {c.preco_venda_sugerido != null && <span style={{ fontFamily: MONO }}> · PV {brl(c.preco_venda_sugerido)}</span>}
              </div>
            ))}
          </div>
        </Colapsavel>
      )}

      {a.beneficios_creditos_regimes.length > 0 && (
        <Colapsavel id="beneficios" titulo={ROTULO_SECAO.beneficios} n={a.beneficios_creditos_regimes.length} aberta={estaAberta("beneficios")} onToggle={onToggle} tx={tx}>
          <div className="grid gap-1">
            {a.beneficios_creditos_regimes.map((b, i) => (
              <div key={i} className="text-xs" style={{ color: INK }}>
                <b>{b.tipo}</b> — {b.descricao}{" "}
                {b.aplicavel === null ? <span style={{ color: AMBER }}>({tx("a confirmar", "уточнить")})</span> : b.aplicavel ? "✓" : "✕"}
                {b.fundamento_url && <FonteLink url={b.fundamento_url} />}
              </div>
            ))}
          </div>
        </Colapsavel>
      )}

      {a.ncms_enquadramentos.length > 0 && (
        <Colapsavel id="ncms" titulo={ROTULO_SECAO.ncms} n={a.ncms_enquadramentos.length} aberta={estaAberta("ncms")} onToggle={onToggle} tx={tx}>
          <div className="grid gap-1">
            {a.ncms_enquadramentos.map((n, i) => (
              <div key={i} className="text-xs" style={{ color: INK }}>
                <b style={{ fontFamily: MONO }}>{n.ncm}</b>
                {n.cest ? ` · CEST ${n.cest}` : ""} — {n.justificativa}
                {n.fundamento_url && <FonteLink url={n.fundamento_url} />}
              </div>
            ))}
          </div>
        </Colapsavel>
      )}

      {(a.riscos_pontos_atencao.length > 0 || a.oportunidades_economia.length > 0) && (
        <Colapsavel
          id="riscos"
          titulo={ROTULO_SECAO.riscos}
          n={a.riscos_pontos_atencao.length + a.oportunidades_economia.length}
          aberta={estaAberta("riscos")}
          onToggle={onToggle}
          tx={tx}
        >
          {a.oportunidades_economia.length > 0 && (
            <>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--success,#1f9d55)" }}>
                {tx("Oportunidades", "Возможности")}
              </p>
              <Lista itens={a.oportunidades_economia} />
            </>
          )}
          {a.riscos_pontos_atencao.length > 0 && (
            <>
              <p className="mb-1 mt-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: AMBER }}>
                {tx("Atenção", "Внимание")}
              </p>
              <Lista itens={a.riscos_pontos_atencao} />
            </>
          )}
        </Colapsavel>
      )}

      {a.fundamentacao_legal.length > 0 && (
        <Colapsavel id="fundamentacao" titulo={ROTULO_SECAO.fundamentacao} n={a.fundamentacao_legal.length} aberta={estaAberta("fundamentacao")} onToggle={onToggle} tx={tx}>
          <div className="grid gap-1">
            {a.fundamentacao_legal.map((f, i) => (
              <div key={i} className="text-xs" style={{ color: INK }}>
                <b>{f.norma}</b>
                {f.artigo ? `, ${f.artigo}` : ""} ({f.orgao}
                {f.vigencia ? ` · ${f.vigencia}` : ""}) — {f.afirmacao}
                {f.url && <FonteLink url={f.url} />}
              </div>
            ))}
          </div>
        </Colapsavel>
      )}

      {a.fontes_oficiais.length > 0 && (
        <Colapsavel id="fontes" titulo={ROTULO_SECAO.fontes} n={a.fontes_oficiais.length} aberta={estaAberta("fontes")} onToggle={onToggle} tx={tx}>
          <div className="grid gap-1">
            {a.fontes_oficiais.map((f, i) => (
              <a key={i} href={f.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs underline" style={{ color: INK }}>
                {f.titulo ?? f.url}
                <ExternalLink size={11} />
              </a>
            ))}
          </div>
        </Colapsavel>
      )}

      {a.dados_adicionais_necessarios.length > 0 && (
        <Colapsavel id="dados_adicionais" titulo={ROTULO_SECAO.dados_adicionais} n={a.dados_adicionais_necessarios.length} aberta={estaAberta("dados_adicionais")} onToggle={onToggle} tx={tx}>
          <Lista itens={a.dados_adicionais_necessarios} />
        </Colapsavel>
      )}

      <p className="text-[10px]" style={{ color: "var(--app-muted)" }}>
        {tx("Última verificação legislativa:", "Последняя проверка:")} {a.data_verificacao_legislativa} ·{" "}
        {tx("Simulação orientativa — pendências viram tarefa para a equipe.", "Ориентировочно — пункты уходят команде.")}
      </p>
    </div>
  );
}

function Indicador({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-xl border p-3 text-center" style={{ borderColor: "var(--border,#e2e8f0)" }}>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--app-muted)" }}>{rotulo}</p>
      <p className="mt-0.5 text-lg font-bold" style={{ color: INK, fontFamily: MONO }}>{valor}</p>
    </div>
  );
}
function MiniLinha({ label, valor, forte }: { label: string; valor: string; forte?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5">
      <span className="text-xs" style={{ color: forte ? INK : "var(--app-muted)" }}>{label}</span>
      <span className={forte ? "text-sm font-bold" : "text-xs"} style={{ color: INK, fontFamily: MONO, whiteSpace: "nowrap" }}>{valor}</span>
    </div>
  );
}
function Colapsavel({
  id,
  titulo,
  n,
  aberta,
  onToggle,
  tx,
  children,
}: {
  id: SecaoId;
  titulo: string;
  n?: number;
  aberta: boolean;
  onToggle: (s: SecaoId) => void;
  tx: (pt: string, ru: string) => string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-[var(--card)]" style={{ borderColor: "var(--border,#e2e8f0)" }}>
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left"
        aria-expanded={aberta}
      >
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide" style={{ color: INK }}>
          {titulo}
          {n != null && n > 0 && (
            <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ background: "#f1f3f8", color: "var(--app-muted)" }}>{n}</span>
          )}
        </span>
        <ChevronDown size={16} style={{ color: "var(--app-muted)", transform: aberta ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </button>
      {aberta && <div className="border-t px-4 py-3" style={{ borderColor: "var(--border,#e2e8f0)" }}>{children}</div>}
    </section>
  );
}

/* ---------- UI primitives ---------- */
function Bloco({ n, titulo, sub, children }: { n: string; titulo: string; sub?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border bg-[var(--card)]" style={{ borderColor: "var(--border,#e2e8f0)" }}>
      <header className="flex items-baseline gap-3 border-b px-5 py-3" style={{ borderColor: "var(--border,#e2e8f0)" }}>
        <span className="text-xs font-bold tracking-widest" style={{ color: AMBER, fontFamily: MONO }}>{n}</span>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: INK }}>{titulo}</h2>
          {sub && <p className="mt-0.5 text-xs" style={{ color: "var(--app-muted)" }}>{sub}</p>}
        </div>
      </header>
      <div className="grid gap-4 px-5 py-4">{children}</div>
    </section>
  );
}
function Campo({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: INK }}>{label}</span>
      {children}
      {hint && <span className="text-[11px] leading-snug" style={{ color: "var(--app-muted)" }}>{hint}</span>}
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
      style={{ borderColor: "var(--border,#e2e8f0)", color: INK, fontFamily: mono ? MONO : undefined }}
    />
  );
}
function Sel({ value, onChange, opts }: { value: string; onChange: (v: string) => void; opts: [string, string][] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border bg-[var(--card)] px-3 py-2 text-sm outline-none"
      style={{ borderColor: "var(--border,#e2e8f0)", color: INK }}
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
          style={value === v ? { background: NAVY, color: "#fff" } : { background: "var(--card)", color: INK }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
function Alerta({ children, forte }: { children: ReactNode; forte?: boolean }) {
  return (
    <div
      className="flex gap-2 rounded-md px-3 py-2 text-xs leading-relaxed"
      style={{
        background: forte ? "var(--amber-soft)" : "var(--card)",
        border: `1px solid ${forte ? AMBER : "var(--border,#e2e8f0)"}`,
        color: INK,
      }}
    >
      <TriangleAlert size={14} style={{ color: AMBER, flexShrink: 0, marginTop: 1 }} />
      <span>{children}</span>
    </div>
  );
}
function Lista({ itens }: { itens: string[] }) {
  return (
    <ul className="grid list-disc gap-1 pl-4 text-sm" style={{ color: INK }}>
      {itens.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
function FonteLink({ url }: { url: string }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="ml-1 inline-flex items-center underline" style={{ color: INK }}>
      <ExternalLink size={11} />
    </a>
  );
}
