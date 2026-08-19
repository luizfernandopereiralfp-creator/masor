import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Loader2, Plus, Pencil, Trash2, Boxes, Sparkles, Check, X, PackagePlus, PackageMinus, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Protegido } from "@/components/Protegido";
import { AppShell } from "@/components/AppShell";
import { Ajuda } from "@/components/Ajuda";
import { useEmpresa, useClientesFiscais } from "@/lib/empresa";
import { useClienteAtivo } from "@/lib/cliente-ativo";
import {
  type Produto,
  type ProdutoForm,
  type Movimento,
  produtoFormVazio,
  produtoParaForm,
  listarProdutos,
  saldos as carregarSaldos,
  salvarProduto,
  excluirProduto,
  listarMovimentos,
  lancarMovimento,
  analisarProduto,
} from "@/lib/produtos";

export const Route = createFileRoute("/produtos")({
  component: () => (
    <Protegido permitirCliente>
      <Produtos />
    </Protegido>
  ),
});

const NAVY = "var(--navy)";
const INK = "var(--app-ink)";
const AMBER = "var(--amber)";
const MONO = "var(--font-mono)";

function Produtos() {
  const { lang } = useI18n();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);
  const { perfil } = useAuth();
  const staff = perfil?.role === "admin" || perfil?.role === "staff";

  const [ativo, setAtivo] = useClienteAtivo();
  const { clientes, carregando: carregandoLista } = useClientesFiscais();
  const { empresa } = useEmpresa();
  const clienteId = empresa?.id ?? null;

  // cliente do portal: travado na própria empresa
  useEffect(() => {
    if (!staff && perfil?.cliente_id && ativo !== perfil.cliente_id) setAtivo(perfil.cliente_id);
  }, [staff, perfil?.cliente_id, ativo, setAtivo]);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [saldos, setSaldos] = useState<Record<string, number>>({});
  const [carregando, setCarregando] = useState(false);
  const [modo, setModo] = useState<"lista" | "novo" | "editar">("lista");
  const [form, setForm] = useState<ProdutoForm>(produtoFormVazio());
  const [estoqueDe, setEstoqueDe] = useState<Produto | null>(null);
  const [analisando, setAnalisando] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ produto: Produto; analise: unknown } | null>(null);

  const carregar = useCallback(async () => {
    if (!clienteId) {
      setProdutos([]);
      setSaldos({});
      return;
    }
    setCarregando(true);
    const [ps, sd] = await Promise.all([listarProdutos(clienteId), carregarSaldos(clienteId)]);
    setProdutos(ps);
    setSaldos(sd);
    setCarregando(false);
  }, [clienteId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteId) return;
    const r = await salvarProduto(clienteId, form);
    if (r.erro) return toast.error(r.erro);
    // estoque inicial (só no cadastro): vira uma entrada de estoque
    if (modo === "novo" && r.id) {
      const q = Number((form.estoque_inicial || "").replace(",", "."));
      if (q > 0) await lancarMovimento(clienteId, r.id, "entrada", q, form.custo_nf ? Number(form.custo_nf.replace(",", ".")) : null, tx("estoque inicial", "начальный остаток"));
    }
    toast.success(tx("Produto salvo.", "Товар сохранён."));
    setModo("lista");
    await carregar();
  }

  async function excluir(p: Produto) {
    if (!confirm(tx(`Excluir "${p.descricao}"? (o histórico de estoque é preservado)`, `Удалить "${p.descricao}"?`))) return;
    const r = await excluirProduto(p.id);
    if (r.erro) return toast.error(r.erro);
    toast.success(tx("Produto excluído.", "Товар удалён."));
    await carregar();
  }

  async function analisar(p: Produto) {
    if (analisando) return;
    setAnalisando(p.id);
    const r = await analisarProduto(p, { uf: empresa?.uf ?? null, regime_tributario: empresa?.regime_tributario ?? null, das_efetivo: empresa?.das_efetivo ?? null }, lang);
    setAnalisando(null);
    if (r.erro) return toast.error(r.erro);
    await carregar();
    if (r.analise) setResultado({ produto: p, analise: r.analise }); // mostra o resultado (o clímax)
    else toast.success(tx("Análise fiscal atualizada.", "Анализ обновлён."));
  }

  function verAnalise(p: Produto) {
    if (p.analise) setResultado({ produto: p, analise: p.analise });
  }

  const set = <K extends keyof ProdutoForm>(k: K, v: ProdutoForm[K]) => setForm((s) => ({ ...s, [k]: v }));

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        {/* seletor de cliente (só equipe) */}
        {staff && (
          <div className="mb-4 rounded-2xl border bg-[var(--card)] p-4" style={{ borderColor: "var(--border,#e2e8f0)" }}>
            <label className="grid gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--app-muted)" }}>{tx("Cliente", "Клиент")}</span>
              {carregandoLista ? (
                <span className="flex items-center gap-2 text-sm" style={{ color: "var(--app-muted)" }}><Loader2 size={14} className="animate-spin" /> {tx("carregando…", "загрузка…")}</span>
              ) : (
                <select className="ipt" value={ativo ?? ""} onChange={(e) => setAtivo(e.target.value || null)}>
                  <option value="">{tx("— selecione —", "— выберите —")}</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.razao_social ?? c.nome_fantasia ?? c.id}{c.cnpj_cpf ? ` · ${c.cnpj_cpf}` : ""}</option>
                  ))}
                </select>
              )}
            </label>
          </div>
        )}

        {!clienteId ? (
          <Vazio tx={tx} texto={tx("Selecione um cliente para ver os produtos.", "Выберите клиента.")} />
        ) : modo !== "lista" ? (
          <FormProduto tx={tx} form={form} set={set} editando={modo === "editar"} onSalvar={salvar} onCancelar={() => setModo("lista")} />
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: INK }}>{tx("Catálogo", "Каталог")}</h2>
              <button type="button" onClick={() => { setForm(produtoFormVazio()); setModo("novo"); }} className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white" style={{ background: NAVY }}>
                <Plus size={15} /> {tx("Novo produto", "Новый товар")}
              </button>
            </div>

            {carregando ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin" style={{ color: AMBER }} /></div>
            ) : produtos.length === 0 ? (
              <Vazio tx={tx} texto={tx("Nenhum produto ainda. Cadastre o primeiro.", "Пока нет товаров.")} />
            ) : (
              <div className="overflow-x-auto rounded-2xl border bg-[var(--card)]" style={{ borderColor: "var(--border,#e2e8f0)" }}>
                <table className="w-full text-sm" style={{ color: INK }}>
                  <thead>
                    <tr className="text-left" style={{ borderBottom: "2px solid var(--border,#e2e8f0)" }}>
                      {[tx("Produto", "Товар"), "NCM", tx("Custo", "Стоим."), tx("Estoque", "Склад"), tx("Análise", "Анализ"), ""].map((h, i) => (
                        <th key={i} className="whitespace-nowrap px-3 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--app-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((p) => {
                      const saldo = saldos[p.id] ?? 0;
                      const baixo = p.estoque_min != null && saldo <= p.estoque_min;
                      return (
                        <tr key={p.id} style={{ borderBottom: "1px solid var(--border,#eef1f6)" }}>
                          <td className="px-3 py-2">
                            <div className="font-semibold">{p.descricao}</div>
                            {p.ean && <div className="text-[10px]" style={{ color: "var(--app-muted)", fontFamily: MONO }}>EAN {p.ean}</div>}
                          </td>
                          <td className="px-3 py-2" style={{ fontFamily: MONO }}>{p.ncm ?? "—"}</td>
                          <td className="px-3 py-2" style={{ fontFamily: MONO }}>{p.custo_nf != null ? p.custo_nf.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}</td>
                          <td className="px-3 py-2">
                            <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={baixo ? { background: "rgba(180,83,9,.12)", color: "#b45309" } : { background: "rgba(16,122,87,.1)", color: "#0f7a57" }}>
                              {saldo.toLocaleString("pt-BR")} {p.unidade ?? "UN"}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {p.analise ? (
                              <button type="button" onClick={() => verAnalise(p)} className="text-[11px] font-bold underline" style={{ color: INK }}>
                                {tx("Ver resultado", "Результат")}
                              </button>
                            ) : (
                              <span className="text-[11px]" style={{ color: "var(--app-muted)" }}>—</span>
                            )}
                            {p.analise_em && <div className="text-[10px]" style={{ color: "var(--app-muted)" }}>{new Date(p.analise_em).toLocaleDateString(lang === "ru" ? "ru-RU" : "pt-BR")}</div>}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-end gap-1.5">
                              <button type="button" onClick={() => analisar(p)} disabled={analisando === p.id} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold disabled:opacity-50" style={{ background: AMBER, color: INK }}>
                                {analisando === p.id ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                                {tx("Analisar imposto", "Рассчитать налог")}
                              </button>
                              <IconBtn title={tx("Estoque", "Склад")} onClick={() => setEstoqueDe(p)}><Boxes size={15} /></IconBtn>
                              <IconBtn title={tx("Editar", "Изменить")} onClick={() => { setForm(produtoParaForm(p)); setModo("editar"); }}><Pencil size={15} /></IconBtn>
                              <IconBtn title={tx("Excluir", "Удалить")} onClick={() => excluir(p)} warn><Trash2 size={15} /></IconBtn>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {estoqueDe && clienteId && (
        <EstoqueDialog tx={tx} produto={estoqueDe} clienteId={clienteId} onFechar={() => { setEstoqueDe(null); void carregar(); }} />
      )}

      {resultado && (
        <ResultadoAnaliseModal tx={tx} lang={lang} produto={resultado.produto} analise={resultado.analise} onFechar={() => setResultado(null)} />
      )}

      <style>{`.ipt{width:100%;border:1px solid var(--app-line);border-radius:.6rem;padding:.55rem .75rem;font-size:.875rem;color:var(--app-ink);outline:none;background:var(--app-bg2)}.ipt:focus{border-color:var(--amber);box-shadow:0 0 0 3px rgba(233,167,74,.16)}`}</style>
    </AppShell>
  );
}

function FormProduto({
  tx,
  form,
  set,
  editando,
  onSalvar,
  onCancelar,
}: {
  tx: (pt: string, ru: string) => string;
  form: ProdutoForm;
  set: <K extends keyof ProdutoForm>(k: K, v: ProdutoForm[K]) => void;
  editando: boolean;
  onSalvar: (e: React.FormEvent) => void;
  onCancelar: () => void;
}) {
  return (
    <form onSubmit={onSalvar} className="grid gap-4 rounded-2xl border bg-[var(--card)] p-6" style={{ borderColor: "var(--border,#e2e8f0)" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: INK }}>{editando ? tx("Editar produto", "Изменить товар") : tx("Novo produto", "Новый товар")}</h3>
        <button type="button" onClick={onCancelar} className="text-[var(--app-muted)]"><X size={18} /></button>
      </div>
      <Campo label={tx("Descrição *", "Описание *")} ajuda={{ pt: "Nome do produto como aparece na nota/etiqueta. Quanto mais específico (marca, sabor, tamanho), melhor a IA acha NCM/CEST e estratégias.", ru: "Название товара как в накладной/на ценнике. Чем конкретнее (бренд, вкус, размер), тем точнее ИИ подберёт NCM/CEST." }}>
        <input className="ipt" value={form.descricao} onChange={(e) => set("descricao", e.target.value)} required />
      </Campo>
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo label="NCM" hint={tx("código fiscal do produto — deixe em branco se não souber", "налоговый код товара — оставьте пустым, если не знаете")} ajuda={{ pt: "Código de 8 dígitos que classifica a mercadoria (NCM). Define a maioria dos impostos. Se não souber, deixe em branco e use 'Buscar NCM' pela descrição.", ru: "8-значный код классификации товара (NCM). Определяет большинство налогов. Не знаете — оставьте пустым, используйте «Поиск NCM» по описанию." }}><input className="ipt" style={{ fontFamily: MONO }} value={form.ncm} onChange={(e) => set("ncm", e.target.value)} /></Campo>
        <Campo label="CEST" hint={tx("opcional (ST)", "необязательно")} ajuda={{ pt: "Código de 7 dígitos usado quando o produto está em Substituição Tributária (ICMS-ST). Só preencha se houver; a IA sugere o correto pelo NCM.", ru: "7-значный код для товаров с налоговым замещением (ICMS-ST). Заполняйте только если есть; ИИ подскажет по NCM." }}><input className="ipt" style={{ fontFamily: MONO }} value={form.cest} onChange={(e) => set("cest", e.target.value)} /></Campo>
        <Campo label="EAN / GTIN" hint={tx("código de barras", "штрих-код")} ajuda={{ pt: "Código de barras da embalagem. Ajuda a identificar o produto e muitas vezes já traz o NCM.", ru: "Штрихкод упаковки. Помогает опознать товар и часто уже содержит NCM." }}><input className="ipt" style={{ fontFamily: MONO }} value={form.ean} onChange={(e) => set("ean", e.target.value)} /></Campo>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <Campo label={tx("Custo de compra (R$)", "Стоимость закупки (R$)")} ajuda={{ pt: "Quanto você paga por unidade na nota do fornecedor (sem contar o seu lucro). Use vírgula para centavos: 5,39.", ru: "Сколько вы платите за единицу по накладной поставщика (без вашей наценки). Копейки через запятую: 5,39." }}><input className="ipt" style={{ fontFamily: MONO }} value={form.custo_nf} onChange={(e) => set("custo_nf", e.target.value)} /></Campo>
        <Campo label={tx("Markup (%)", "Наценка (%)")} ajuda={{ pt: "Margem que você quer somar sobre o custo para formar o preço. Ex.: 30 = vender ~30% acima do custo líquido.", ru: "Наценка, которую вы добавляете к себестоимости для цены. Напр.: 30 = продавать примерно на 30% выше чистой себестоимости." }}><input className="ipt" style={{ fontFamily: MONO }} value={form.markup_pct} onChange={(e) => set("markup_pct", e.target.value)} /></Campo>
        <Campo label={tx("Unidade", "Ед.")} ajuda={{ pt: "Como o produto é vendido/contado: UN (unidade), KG, L, CX (caixa), etc.", ru: "Как товар продаётся/считается: UN (шт.), KG (кг), L (л), CX (коробка) и т.д." }}><input className="ipt" value={form.unidade} onChange={(e) => set("unidade", e.target.value)} /></Campo>
        <Campo label={tx("Estoque mín.", "Мин. склад")} ajuda={{ pt: "Quantidade mínima em estoque. Abaixo disso o sistema sinaliza reposição. Opcional.", ru: "Минимальный остаток. Ниже него система напомнит о пополнении. Необязательно." }}><input className="ipt" style={{ fontFamily: MONO }} value={form.estoque_min} onChange={(e) => set("estoque_min", e.target.value)} /></Campo>
      </div>
      <Campo label={tx("Categoria", "Категория")} ajuda={{ pt: "Agrupamento livre para organizar (ex.: Bebidas, Limpeza, Hortifrúti). Ajuda a filtrar relatórios.", ru: "Свободная группировка для порядка (напр.: Напитки, Бытовая химия, Овощи). Помогает фильтровать отчёты." }}><input className="ipt" value={form.categoria} onChange={(e) => set("categoria", e.target.value)} /></Campo>
      {!editando && (
        <Campo label={tx("Estoque inicial (qtd)", "Начальный остаток (кол-во)")} hint={tx("opcional — lança uma entrada de estoque agora", "необязательно — создаёт приход на складе")}>
          <input className="ipt" style={{ fontFamily: MONO }} value={form.estoque_inicial} onChange={(e) => set("estoque_inicial", e.target.value)} />
        </Campo>
      )}
      <div className="flex items-center gap-3">
        <button type="submit" className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white" style={{ background: NAVY }}><Check size={16} /> {tx("Salvar", "Сохранить")}</button>
        <button type="button" onClick={onCancelar} className="text-sm font-semibold" style={{ color: "var(--app-muted)" }}>{tx("Cancelar", "Отмена")}</button>
      </div>
    </form>
  );
}

function EstoqueDialog({ tx, produto, clienteId, onFechar }: { tx: (pt: string, ru: string) => string; produto: Produto; clienteId: string; onFechar: () => void }) {
  const [movs, setMovs] = useState<Movimento[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [tipo, setTipo] = useState<"entrada" | "saida" | "ajuste">("entrada");
  const [qtd, setQtd] = useState("");
  const [custo, setCusto] = useState("");
  const [obs, setObs] = useState("");
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    // saldo vem da VIEW (soma TODOS os movimentos); a lista é só o histórico recente.
    const [ms, sd] = await Promise.all([listarMovimentos(produto.id), carregarSaldos(clienteId)]);
    setMovs(ms);
    setSaldo(sd[produto.id] ?? 0);
    setCarregando(false);
  }, [produto.id, clienteId]);
  useEffect(() => { void carregar(); }, [carregar]);

  async function lancar() {
    const q = Number((qtd || "").replace(",", "."));
    if (!q) return toast.error(tx("Informe a quantidade.", "Укажите количество."));
    setSalvando(true);
    const r = await lancarMovimento(clienteId, produto.id, tipo, q, custo ? Number(custo.replace(",", ".")) : null, obs);
    setSalvando(false);
    if (r.erro) return toast.error(r.erro);
    setQtd(""); setCusto(""); setObs("");
    await carregar();
    toast.success(tx("Movimento lançado.", "Движение записано."));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onFechar}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-[var(--card)] p-6 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold" style={{ color: INK }}>{produto.descricao}</h3>
            <p className="text-[11px]" style={{ color: "var(--app-muted)" }}>{tx("Controle de estoque", "Управление складом")}</p>
          </div>
          <button type="button" onClick={onFechar} className="text-[var(--app-muted)]"><X size={18} /></button>
        </div>

        <div className="mb-4 rounded-xl border p-4 text-center" style={{ borderColor: "var(--border,#e2e8f0)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--app-muted)" }}>{tx("Saldo atual", "Текущий остаток")}</p>
          <p className="text-2xl font-bold" style={{ color: INK, fontFamily: MONO }}>{saldo.toLocaleString("pt-BR")} <span className="text-sm">{produto.unidade ?? "UN"}</span></p>
        </div>

        {/* lançar movimento */}
        <div className="mb-4 grid gap-3 rounded-xl border p-4" style={{ borderColor: "var(--border,#e2e8f0)", background: "var(--app-bg2)" }}>
          <div className="flex gap-2">
            {([["entrada", tx("Entrada", "Приход"), <PackagePlus size={14} key="e" />], ["saida", tx("Saída", "Расход"), <PackageMinus size={14} key="s" />], ["ajuste", tx("Ajuste", "Корр."), <SlidersHorizontal size={14} key="a" />]] as const).map(([t, rot, ic]) => (
              <button key={t} type="button" onClick={() => setTipo(t)} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold" style={tipo === t ? { background: NAVY, color: "#fff" } : { border: "1px solid var(--border,#e2e8f0)", color: INK }}>
                {ic} {rot}
              </button>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <input className="ipt" placeholder={tx("Quantidade", "Количество")} style={{ fontFamily: MONO }} value={qtd} onChange={(e) => setQtd(e.target.value)} />
            <input className="ipt" placeholder={tx("Custo unit. (opc.)", "Цена ед. (опц.)")} style={{ fontFamily: MONO }} value={custo} onChange={(e) => setCusto(e.target.value)} />
            <input className="ipt" placeholder={tx("Obs. (opc.)", "Прим. (опц.)")} value={obs} onChange={(e) => setObs(e.target.value)} />
          </div>
          {tipo === "ajuste" && <p className="text-[10px]" style={{ color: "var(--app-muted)" }}>{tx("Ajuste aceita valor negativo (ex.: −3 para corrigir para baixo).", "Корректировка допускает отрицательное значение.")}</p>}
          <button type="button" onClick={lancar} disabled={salvando} className="inline-flex w-fit items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold text-white disabled:opacity-50" style={{ background: NAVY }}>
            {salvando ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} {tx("Lançar", "Записать")}
          </button>
        </div>

        {/* histórico */}
        <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--app-muted)" }}>{tx("Movimentações", "Движения")}</h4>
        {carregando ? (
          <div className="flex justify-center py-4"><Loader2 className="animate-spin" style={{ color: AMBER }} /></div>
        ) : movs.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--app-muted)" }}>{tx("Nenhuma movimentação.", "Нет движений.")}</p>
        ) : (
          <ul className="grid gap-1">
            {movs.map((m) => (
              <li key={m.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs" style={{ borderColor: "var(--border,#eef1f6)" }}>
                <span className="flex items-center gap-2">
                  <b style={{ color: m.tipo === "saida" ? "#b45309" : m.tipo === "entrada" ? "#0f7a57" : INK }}>
                    {m.tipo === "entrada" ? "+" : m.tipo === "saida" ? "−" : "±"}{Math.abs(m.quantidade).toLocaleString("pt-BR")}
                  </b>
                  <span style={{ color: "var(--app-muted)" }}>{m.tipo === "entrada" ? tx("entrada", "приход") : m.tipo === "saida" ? tx("saída", "расход") : tx("ajuste", "корр.")}{m.origem === "nfe" ? " · NF-e" : ""}</span>
                  {m.ref && <span style={{ color: "var(--app-muted)" }}>· {m.ref}</span>}
                </span>
                <span style={{ color: "var(--app-muted)", fontFamily: MONO }}>{new Date(m.data).toLocaleDateString("pt-BR")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

type AnaliseView = {
  provisorio?: boolean;
  formacao_preco?: {
    custo_aquisicao?: number | null;
    frete_despesas?: number | null;
    creditos_tributarios?: number | null;
    custo_tributario_liquido?: number | null;
    debitos_saida_percent?: number | null;
    markup_percent?: number | null;
    margem_estimada_percent?: number | null;
    preco_venda_sugerido?: number | null;
    formulas?: string[];
  };
  memoria_calculo?: { rotulo?: string; formula?: string | null; resultado?: number | null; unidade?: string }[];
  resumo_executivo?: string;
  oportunidades_economia?: string[];
  fontes_oficiais?: { url: string }[];
};

function ResultadoAnaliseModal({
  tx,
  lang,
  produto,
  analise,
  onFechar,
}: {
  tx: (pt: string, ru: string) => string;
  lang: string;
  produto: Produto;
  analise: unknown;
  onFechar: () => void;
}) {
  const a = (analise ?? {}) as AnaliseView;
  const fp = a.formacao_preco ?? {};
  const brl = (v?: number | null) => (v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
  const pct = (frac?: number | null) => (frac == null ? "—" : `${(frac * 100).toLocaleString(lang === "ru" ? "ru-RU" : "pt-BR", { maximumFractionDigits: 1 })}%`);
  const pv = fp.preco_venda_sugerido ?? null;
  const carga = fp.debitos_saida_percent ?? null;
  const impostoUn = pv != null && carga != null ? pv * carga : null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onFechar}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-[var(--card)] p-6 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold" style={{ color: INK }}>{produto.descricao}</h3>
            <p className="text-[11px]" style={{ color: "var(--app-muted)" }}>
              {tx("Resultado da análise fiscal", "Результат налогового анализа")}
              {a.provisorio ? ` · ${tx("provisório", "предварительно")}` : ""}
            </p>
          </div>
          <button type="button" onClick={onFechar} className="text-[var(--app-muted)]"><X size={18} /></button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <BigCard destaque titulo={tx("Preço de venda sugerido", "Рекоменд. цена продажи")} valor={brl(pv)} />
          <BigCard titulo={tx("Imposto na venda", "Налог с продажи")} valor={pct(carga)} sub={impostoUn != null ? `${brl(impostoUn)}/${produto.unidade ?? "un"}` : undefined} />
          <BigCard titulo={tx("Margem estimada", "Оценка маржи")} valor={pct(fp.margem_estimada_percent)} />
        </div>

        {a.resumo_executivo && (
          <div className="mt-4 rounded-xl border p-4 text-sm" style={{ borderColor: "var(--border,#e2e8f0)", color: INK }}>{a.resumo_executivo}</div>
        )}

        {/* Memória de cálculo — formação de preço passo a passo (prova real na calculadora) */}
        <div className="mt-4 rounded-xl border p-4" style={{ borderColor: "var(--border,#e2e8f0)" }}>
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--app-muted)" }}>
            {tx("Memória de cálculo — como chegamos no preço", "Расчёт — как получена цена")}
          </p>
          <div className="mt-2 grid gap-1 text-sm">
            <LinhaCalc rot={tx("Custo de compra (na nota)", "Стоимость закупки")} val={brl(fp.custo_aquisicao)} />
            {fp.frete_despesas ? <LinhaCalc op="+" rot={tx("Frete e despesas", "Доставка и расходы")} val={brl(fp.frete_despesas)} /> : null}
            {fp.creditos_tributarios ? (
              <LinhaCalc op="−" rot={tx("Créditos de imposto (você recupera)", "Налоговые кредиты")} val={brl(fp.creditos_tributarios)} />
            ) : null}
            <LinhaCalc destaque op="=" rot={tx("Custo real depois dos impostos", "Реальная себестоимость")} val={brl(fp.custo_tributario_liquido)} />
            {carga != null ? <LinhaCalc rot={tx("Imposto sobre a venda", "Налог с продажи")} val={pct(carga)} /> : null}
            {fp.margem_estimada_percent != null ? (
              <LinhaCalc rot={tx("Margem desejada", "Желаемая маржа")} val={pct(fp.margem_estimada_percent)} />
            ) : null}
            <LinhaCalc destaque op="=" rot={tx("Preço mínimo de venda", "Мин. цена продажи")} val={brl(fp.preco_venda_sugerido)} />
          </div>
          {fp.formulas && fp.formulas.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--app-muted)" }}>
                {tx("Fórmulas usadas", "Использованные формулы")}
              </p>
              <ul className="mt-1 grid gap-0.5">
                {fp.formulas.map((f, i) => (
                  <li key={i} className="text-[11px]" style={{ color: "var(--app-muted)", fontFamily: MONO }}>• {f}</li>
                ))}
              </ul>
            </div>
          )}
          {a.memoria_calculo && a.memoria_calculo.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--app-muted)" }}>
                {tx("Passo a passo", "Шаг за шагом")}
              </p>
              <div className="mt-1 grid gap-1">
                {a.memoria_calculo.map((p, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-2 text-xs" style={{ color: INK }}>
                    <span>
                      {p.rotulo}
                      {p.formula ? <span style={{ color: "var(--app-muted)" }}> · {p.formula}</span> : null}
                    </span>
                    <span style={{ fontFamily: MONO, whiteSpace: "nowrap" }}>
                      {p.unidade === "%" ? pct(p.resultado) : brl(p.resultado)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="mt-3 text-[10px]" style={{ color: "var(--app-muted)" }}>
            {tx(
              "Confira na calculadora: cada linha é um passo. Precisa ajustar custo ou margem? Edite o produto e reanalise.",
              "Проверьте на калькуляторе: каждая строка — шаг. Нужно изменить? Отредактируйте товар и пересчитайте.",
            )}
          </p>
        </div>

        {a.oportunidades_economia && a.oportunidades_economia.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#0f7a57" }}>{tx("Oportunidades de economia", "Возможности экономии")}</p>
            <ul className="mt-1 grid gap-1">
              {a.oportunidades_economia.slice(0, 3).map((o, i) => (
                <li key={i} className="text-xs" style={{ color: INK }}>• {o}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[10px]" style={{ color: "var(--app-muted)" }}>
            {a.fontes_oficiais && a.fontes_oficiais.length > 0
              ? tx(`${a.fontes_oficiais.length} fonte(s) oficial(is) citada(s)`, `${a.fontes_oficiais.length} офиц. источник(ов)`)
              : tx("Cálculo pelo motor determinístico Masor.", "Расчёт детерминированным движком Masor.")}
          </span>
          <Link to="/consulta" className="text-xs font-semibold" style={{ color: INK }}>{tx("Refazer na consulta →", "В консультацию →")}</Link>
        </div>
      </div>
    </div>
  );
}

function LinhaCalc({ rot, val, op, destaque }: { rot: string; val: string; op?: string; destaque?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2" style={destaque ? { fontWeight: 700 } : undefined}>
      <span style={{ color: destaque ? INK : "var(--app-muted)" }}>
        {op ? <b style={{ color: "var(--app-muted)" }}>{op} </b> : null}
        {rot}
      </span>
      <span style={{ fontFamily: MONO, whiteSpace: "nowrap", color: INK }}>{val}</span>
    </div>
  );
}

function BigCard({ titulo, valor, sub, destaque }: { titulo: string; valor: string; sub?: string; destaque?: boolean }) {
  return (
    <div className="rounded-xl border p-4 text-center" style={destaque ? { borderColor: "var(--amber)", background: "var(--amber-soft,#fbebd2)" } : { borderColor: "var(--border,#e2e8f0)" }}>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--app-muted)" }}>{titulo}</p>
      <p className="mt-1 text-xl font-bold" style={{ color: INK, fontFamily: MONO }}>{valor}</p>
      {sub && <p className="text-[10px]" style={{ color: "var(--app-muted)", fontFamily: MONO }}>{sub}</p>}
    </div>
  );
}

function IconBtn({ children, title, onClick, warn }: { children: ReactNode; title: string; onClick: () => void; warn?: boolean }) {
  return (
    <button type="button" title={title} onClick={onClick} className="rounded-lg p-1.5 transition hover:bg-[color:var(--amber-soft,#fbebd2)]" style={{ color: warn ? "var(--warn,#b45309)" : INK }}>
      {children}
    </button>
  );
}

function Vazio({ tx, texto }: { tx: (pt: string, ru: string) => string; texto: string }) {
  return (
    <div className="rounded-2xl border bg-[var(--card)] p-8 text-center" style={{ borderColor: "var(--border,#e2e8f0)" }}>
      <PackagePlus size={26} className="mx-auto" style={{ color: AMBER }} />
      <p className="mt-2 text-sm" style={{ color: "var(--app-muted)" }}>{texto}</p>
      <span className="hidden">{tx("", "")}</span>
    </div>
  );
}

function Campo({ label, children, hint, ajuda }: { label: string; children: ReactNode; hint?: string; ajuda?: { pt: string; ru: string } }) {
  return (
    <label className="grid gap-1">
      <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--app-muted)" }}>
        {label}
        {ajuda && <Ajuda {...ajuda} />}
      </span>
      {children}
      {hint && <span className="text-[10px]" style={{ color: "var(--app-muted)" }}>{hint}</span>}
    </label>
  );
}
