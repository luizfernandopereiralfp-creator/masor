import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2, ShieldCheck, Scale, TrendingDown, TrendingUp, Layers, Upload } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { Protegido } from "@/components/Protegido";
import { AppShell } from "@/components/AppShell";
import { useEmpresa, useClientesFiscais } from "@/lib/empresa";
import { useClienteAtivo } from "@/lib/cliente-ativo";
import { apurarEntradas, apurarSaidas, rotuloCFOP, type Apuracao, type SaidaResumo } from "@/lib/apuracao";

export const Route = createFileRoute("/apuracao")({
  component: () => (
    <Protegido>
      <ApuracaoPage />
    </Protegido>
  ),
});

const INK = "var(--app-ink)";
const MUTED = "var(--app-muted)";
const MONO = "var(--font-mono)";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function ApuracaoPage() {
  const { lang } = useI18n();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);

  const [ativo, setAtivo] = useClienteAtivo();
  const { clientes, carregando: carregandoLista } = useClientesFiscais();
  const { empresa } = useEmpresa();
  const clienteId = empresa?.id ?? null;

  const [ap, setAp] = useState<Apuracao | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [saida, setSaida] = useState<SaidaResumo | null>(null);
  const [processando, setProcessando] = useState(false);

  async function onCupons(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setProcessando(true);
    const xmls = await Promise.all(files.map((f) => f.text()));
    setSaida(apurarSaidas(xmls));
    setProcessando(false);
  }

  const carregar = useCallback(async () => {
    if (!clienteId) {
      setAp(null);
      return;
    }
    setCarregando(true);
    setAp(await apurarEntradas(clienteId));
    setCarregando(false);
  }, [clienteId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        {/* seletor de cliente */}
        <div className="app-card mb-4 p-4">
          <label className="grid gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: MUTED }}>
              {tx("Cliente", "Клиент")}
            </span>
            {carregandoLista ? (
              <span className="flex items-center gap-2 text-sm" style={{ color: MUTED }}>
                <Loader2 size={14} className="animate-spin" /> {tx("carregando…", "загрузка…")}
              </span>
            ) : (
              <select
                className="rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--app-line)", background: "var(--app-bg2)", color: INK }}
                value={ativo ?? ""}
                onChange={(e) => setAtivo(e.target.value || null)}
              >
                <option value="">{tx("— selecione —", "— выберите —")}</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.razao_social ?? c.nome_fantasia ?? c.id}
                    {c.cnpj_cpf ? ` · ${c.cnpj_cpf}` : ""}
                  </option>
                ))}
              </select>
            )}
          </label>
        </div>

        {!clienteId ? (
          <Vazio texto={tx("Selecione um cliente para apurar.", "Выберите клиента.")} />
        ) : carregando ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin" style={{ color: "var(--amber)" }} />
          </div>
        ) : !ap || ap.totalDocs === 0 ? (
          <div className="app-card p-8 text-center">
            <ShieldCheck size={26} className="mx-auto" style={{ color: "var(--amber)" }} />
            <p className="mt-2 text-sm font-semibold" style={{ color: INK }}>
              {tx("Nenhuma nota de entrada capturada ainda.", "Пока нет входящих накладных.")}
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm" style={{ color: MUTED }}>
              {tx(
                "A apuração usa as NF-e de compra capturadas na SEFAZ. Assim que houver notas, mostramos aqui o crédito de imposto aproveitável.",
                "Расчёт использует накладные из SEFAZ. Как только они появятся, здесь будет доступный налоговый кредит.",
              )}
            </p>
            <Link to="/fiscal" className="mt-4 inline-block text-sm font-semibold" style={{ color: "var(--navy)" }}>
              {tx("Ir para a SEFAZ →", "Перейти в SEFAZ →")}
            </Link>
          </div>
        ) : (
          <Resultado ap={ap} tx={tx} />
        )}

        {clienteId && (
          <section className="mt-6">
            <div className="app-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold" style={{ color: INK }}>
                    {tx("Cupons fiscais de saída (vendas)", "Кассовые чеки (продажи)")}
                  </p>
                  <p className="text-xs" style={{ color: MUTED }}>
                    {tx(
                      "Importe os XML dos cupons (CF-e-SAT / NFC-e) em lote — selecione vários arquivos de uma vez.",
                      "Импортируйте XML чеков (CF-e-SAT / NFC-e) пакетом — выберите несколько файлов.",
                    )}
                  </p>
                </div>
                <label
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white"
                  style={{ background: "var(--navy)" }}
                >
                  {processando ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                  {tx("Importar cupons (XML)", "Импорт чеков (XML)")}
                  <input type="file" accept=".xml,text/xml,application/xml" multiple className="hidden" onChange={onCupons} />
                </label>
              </div>
            </div>
            {saida && <SaidaBlock saida={saida} entrada={ap} tx={tx} />}
          </section>
        )}
      </div>
    </AppShell>
  );
}

function SaidaBlock({
  saida,
  entrada,
  tx,
}: {
  saida: SaidaResumo;
  entrada: Apuracao | null;
  tx: (pt: string, ru: string) => string;
}) {
  const saldoICMS = saida.debitoICMS - (entrada?.creditoICMS ?? 0);
  const saldoPC = saida.debitoPisCofins - (entrada?.creditoPisCofins ?? 0);
  const fmtSaldo = (v: number) => (v >= 0 ? tx("a pagar ", "к уплате ") : tx("crédito ", "кредит ")) + brl(Math.abs(v));
  return (
    <>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          titulo={tx("Total de saídas", "Всего продаж")}
          valor={brl(saida.totalSaidas)}
          sub={tx(`${saida.totalCupons} cupom(ns)`, `${saida.totalCupons} чек.`)}
          icon={<TrendingUp size={18} />}
        />
        <Kpi titulo={tx("Débito de ICMS", "Дебет ICMS")} valor={brl(saida.debitoICMS)} sub={tx("venda tributada", "облагаемая")} icon={<Scale size={18} />} />
        <Kpi
          titulo={tx("Débito de PIS/COFINS", "Дебет PIS/COFINS")}
          valor={brl(saida.debitoPisCofins)}
          sub={tx("9,25% da base", "9,25% базы")}
          icon={<Scale size={18} />}
        />
        {saida.cuponsInvalidos > 0 && (
          <Kpi
            titulo={tx("Cupons ignorados", "Пропущено")}
            valor={String(saida.cuponsInvalidos)}
            sub={tx("XML inválido", "неверный XML")}
            icon={<TrendingDown size={18} />}
          />
        )}
      </div>
      <div className="app-card mt-3 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: MUTED }}>
          {tx("Saldo do período (débito da venda − crédito da compra)", "Сальдо периода")}
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="flex items-baseline justify-between rounded-lg px-3 py-2" style={{ background: "var(--app-bg2)" }}>
            <span className="text-sm font-semibold" style={{ color: INK }}>ICMS</span>
            <span className="text-sm font-bold" style={{ color: saldoICMS > 0 ? "var(--warn)" : "var(--success)", fontFamily: MONO }}>
              {fmtSaldo(saldoICMS)}
            </span>
          </div>
          <div className="flex items-baseline justify-between rounded-lg px-3 py-2" style={{ background: "var(--app-bg2)" }}>
            <span className="text-sm font-semibold" style={{ color: INK }}>PIS/COFINS</span>
            <span className="text-sm font-bold" style={{ color: saldoPC > 0 ? "var(--warn)" : "var(--success)", fontFamily: MONO }}>
              {fmtSaldo(saldoPC)}
            </span>
          </div>
        </div>
        <p className="mt-2 text-[11px]" style={{ color: MUTED }}>
          {tx(
            "Negativo = crédito acumulado a favor da empresa (abate impostos futuros). Importação client-side; para milhares de cupons/dia migramos p/ .zip no servidor.",
            "Отрицательное = накопленный кредит компании.",
          )}
        </p>
      </div>
    </>
  );
}

function Resultado({ ap, tx }: { ap: Apuracao; tx: (pt: string, ru: string) => string }) {
  return (
    <>
      {/* nota didática: pré-operação */}
      <div
        className="mb-4 flex items-start gap-3 rounded-xl p-4 text-sm"
        style={{ background: "var(--infobg)", color: INK }}
      >
        <Layers size={18} className="mt-0.5 shrink-0" style={{ color: "var(--info)" }} />
        <p>
          {tx(
            "Enquanto não há vendas, isto é o seu “estoque de crédito”: o imposto que você já pagou na compra e vai abater do imposto das primeiras vendas. Crédito acumula e não se perde.",
            "Пока нет продаж, это ваш «запас кредита»: налог, уже уплаченный при покупке, который уменьшит налог первых продаж. Кредит накапливается.",
          )}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          titulo={tx("Total de entradas", "Всего закупок")}
          valor={brl(ap.totalEntradas)}
          sub={tx(`${ap.totalDocs} nota(s)`, `${ap.totalDocs} накл.`)}
          icon={<Layers size={18} />}
        />
        <Kpi
          destaque
          titulo={tx("Crédito de ICMS aproveitável", "Кредит ICMS к зачёту")}
          valor={brl(ap.creditoICMS)}
          sub={tx("itens tributados (CST 00/20)", "облагаемые (CST 00/20)")}
          icon={<Scale size={18} />}
        />
        <Kpi
          titulo={tx("Crédito de PIS/COFINS", "Кредит PIS/COFINS")}
          valor={brl(ap.creditoPisCofins)}
          sub={tx("9,25% da base elegível", "9,25% базы")}
          icon={<Scale size={18} />}
        />
        <Kpi
          titulo={tx("ICMS-ST retido (custo)", "ICMS-ST удержан (затраты)")}
          valor={brl(ap.stRetido)}
          sub={tx("já pago na cadeia — não é crédito", "уже уплачен — не кредит")}
          icon={<TrendingDown size={18} />}
        />
      </div>

      {ap.ipiCusto > 0 && (
        <p className="mt-2 text-xs" style={{ color: MUTED }}>
          {tx(
            `IPI destacado nas entradas: ${brl(ap.ipiCusto)} — supermercado não credita IPI; entra como custo.`,
            `Выделенный IPI: ${brl(ap.ipiCusto)} — не кредитуется, идёт в затраты.`,
          )}
        </p>
      )}

      {/* Tabela por CFOP */}
      <h2 className="mb-2 mt-6 text-sm font-bold uppercase tracking-wide" style={{ color: INK }}>
        {tx("Entradas por CFOP", "Закупки по CFOP")}
      </h2>
      <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--app-line)", background: "var(--card)" }}>
        <table className="w-full text-sm" style={{ color: INK }}>
          <thead>
            <tr className="text-left" style={{ borderBottom: "2px solid var(--app-line)" }}>
              {["CFOP", tx("Operação", "Операция"), tx("Itens", "Позиции"), tx("Valor", "Сумма"), "ICMS", "ICMS-ST"].map((h, i) => (
                <th key={i} className="whitespace-nowrap px-3 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: MUTED }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ap.porCFOP.map((l) => (
              <tr key={l.cfop} style={{ borderBottom: "1px solid var(--app-line)" }}>
                <td className="px-3 py-2 font-semibold" style={{ fontFamily: MONO }}>{l.cfop}</td>
                <td className="px-3 py-2" style={{ color: MUTED }}>{rotuloCFOP(l.cfop)}</td>
                <td className="px-3 py-2" style={{ fontFamily: MONO }}>{l.qtdItens}</td>
                <td className="px-3 py-2" style={{ fontFamily: MONO }}>{brl(l.vProd)}</td>
                <td className="px-3 py-2" style={{ fontFamily: MONO }}>{brl(l.vICMS)}</td>
                <td className="px-3 py-2" style={{ fontFamily: MONO }}>{brl(l.vICMSST)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Kpi({
  titulo,
  valor,
  sub,
  icon,
  destaque,
}: {
  titulo: string;
  valor: string;
  sub?: string;
  icon: React.ReactNode;
  destaque?: boolean;
}) {
  return (
    <div
      className="app-card p-4"
      style={destaque ? { borderColor: "var(--amber)", background: "var(--amber-soft)" } : undefined}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--navy)", color: "var(--amber)" }}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: MUTED }}>
        {titulo}
      </p>
      <p className="mt-1 text-xl font-bold" style={{ color: INK, fontFamily: MONO }}>
        {valor}
      </p>
      {sub && (
        <p className="text-[10px]" style={{ color: MUTED }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function Vazio({ texto }: { texto: string }) {
  return (
    <div className="app-card p-8 text-center">
      <Scale size={26} className="mx-auto" style={{ color: "var(--amber)" }} />
      <p className="mt-2 text-sm" style={{ color: MUTED }}>
        {texto}
      </p>
    </div>
  );
}
