import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Loader2, Check, Building2, Plus, Pencil, Search, X, ShieldCheck, Upload, UserPlus, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Protegido } from "@/components/Protegido";
import { AppShell } from "@/components/AppShell";
import { Ajuda } from "@/components/Ajuda";
import { useEmpresa, useClientesFiscais } from "@/lib/empresa";
import { useClienteAtivo } from "@/lib/cliente-ativo";
import {
  type ClienteForm,
  formVazio,
  carregarClienteParaEdicao,
  salvarCliente,
  buscarReceitaCNPJ,
  enviarCertificado,
  statusCertificado,
  onlyDigits,
  type CertStatusResp,
} from "@/lib/clientes";
import { avaliarValidade, textoValidade, estiloValidade } from "@/lib/certificado-validade";
import { listarAcessos, criarAcesso, revogarAcesso, type PortalAcesso } from "@/lib/portal";

export const Route = createFileRoute("/empresa")({
  component: () => (
    <Protegido>
      <EmpresaConteudo />
    </Protegido>
  ),
});

const NAVY = "var(--navy)";
const INK = "var(--app-ink)";
const AMBER = "var(--amber)";
const MONO = "var(--font-mono)";
const REGIMES = ["Simples Nacional", "Simples Nacional (MEI)", "Lucro Presumido", "Lucro Real"];

type Modo = "ver" | "novo" | "editar";

function EmpresaConteudo() {
  const { lang } = useI18n();
  const { perfil } = useAuth();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);
  const staff = perfil?.role === "admin" || perfil?.role === "staff";
  const admin = perfil?.role === "admin";

  const [ativo, setAtivo] = useClienteAtivo();
  const { clientes, carregando: carregandoLista, recarregar: recarregarLista } = useClientesFiscais();
  const { empresa, carregando, salvar, recarregar: recarregarEmpresa } = useEmpresa();

  const [modo, setModo] = useState<Modo>("ver");

  // --- configuração fiscal (Masor) ---
  const [markup, setMarkup] = useState("20");
  const [das, setDas] = useState("");
  const [salvandoCfg, setSalvandoCfg] = useState(false);
  const [okCfg, setOkCfg] = useState(false);
  const [erroCfg, setErroCfg] = useState<string | null>(null);

  useEffect(() => {
    if (!empresa) return;
    setMarkup(empresa.markup_padrao != null ? String(empresa.markup_padrao) : "20");
    setDas(empresa.das_efetivo != null ? String(empresa.das_efetivo) : "");
  }, [empresa]);

  async function submitCfg(e: React.FormEvent) {
    e.preventDefault();
    setSalvandoCfg(true);
    setErroCfg(null);
    setOkCfg(false);
    const r = await salvar({
      markup_padrao: markup ? Number(markup.replace(",", ".")) : null,
      das_efetivo: das ? Number(das.replace(",", ".")) : null,
    });
    setSalvandoCfg(false);
    if (r.erro) setErroCfg(r.erro);
    else {
      setOkCfg(true);
      setTimeout(() => setOkCfg(false), 2500);
    }
  }

  async function aoSalvarCadastro(id: string) {
    await recarregarLista();
    setAtivo(id);
    await recarregarEmpresa();
    setModo("ver");
    toast.success(tx("Cliente salvo.", "Клиент сохранён."));
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        {!staff ? (
          <div className="rounded-2xl border bg-[var(--card)] p-8 text-center text-sm" style={{ borderColor: "var(--border,#e2e8f0)", color: "var(--app-muted)" }}>
            {tx("Apenas a equipe acessa o cadastro de clientes.", "Только команда.")}
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm" style={{ color: "var(--app-muted)" }}>
              {tx(
                "Os clientes são os mesmos do Lior (base única). Cadastre, edite e configure aqui — os dados pré-preenchem cada análise.",
                "Клиенты те же, что в Lior. Заводите и настраивайте здесь.",
              )}
            </p>

            {/* seletor + ações */}
            {modo === "ver" && (
              <div className="mb-4 rounded-2xl border bg-[var(--card)] p-4" style={{ borderColor: "var(--border,#e2e8f0)" }}>
                <label className="grid gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--app-muted)" }}>
                    {tx("Cliente ativo", "Активный клиент")}
                  </span>
                  {carregandoLista ? (
                    <span className="flex items-center gap-2 text-sm" style={{ color: "var(--app-muted)" }}>
                      <Loader2 size={14} className="animate-spin" /> {tx("carregando clientes…", "загрузка…")}
                    </span>
                  ) : (
                    <select className="ipt" value={ativo ?? ""} onChange={(e) => setAtivo(e.target.value || null)}>
                      <option value="">{tx("— selecione um cliente —", "— выберите клиента —")}</option>
                      {clientes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.razao_social ?? c.nome_fantasia ?? c.id}
                          {c.cnpj_cpf ? ` · ${c.cnpj_cpf}` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </label>
                {admin ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setModo("novo")}
                      className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white"
                      style={{ background: NAVY }}
                    >
                      <Plus size={15} /> {tx("Novo cliente", "Новый клиент")}
                    </button>
                    {ativo && (
                      <button
                        type="button"
                        onClick={() => setModo("editar")}
                        className="inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-bold"
                        style={{ borderColor: NAVY, color: INK }}
                      >
                        <Pencil size={15} /> {tx("Editar dados", "Изменить")}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-[11px]" style={{ color: "var(--app-muted)" }}>
                    {tx("Cadastro e edição de clientes são feitos por um administrador.", "Заведение клиентов — только администратор.")}
                  </p>
                )}
              </div>
            )}

            {/* cadastro (novo / editar) */}
            {(modo === "novo" || modo === "editar") && (
              <CadastroCliente
                key={modo === "editar" ? ativo ?? "novo" : "novo"}
                tx={tx}
                clienteId={modo === "editar" ? ativo ?? null : null}
                onCancelar={() => setModo("ver")}
                onSalvo={aoSalvarCadastro}
              />
            )}

            {/* visão + config + e-CNPJ (quando há cliente ativo) */}
            {modo === "ver" && ativo && (
              carregando ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin" style={{ color: AMBER }} />
                </div>
              ) : !empresa ? (
                <div className="rounded-2xl border bg-[var(--card)] p-8 text-center text-sm" style={{ borderColor: "var(--border,#e2e8f0)", color: "var(--app-muted)" }}>
                  {tx("Cliente não encontrado.", "Клиент не найден.")}
                </div>
              ) : (
                <>
                  {/* identidade */}
                  <div className="rounded-2xl border bg-[var(--card)] p-6" style={{ borderColor: "var(--border,#e2e8f0)" }}>
                    <h2 className="mb-3 text-sm font-bold" style={{ color: INK }}>{empresa.razao_social ?? empresa.nome ?? "—"}</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Leitura label={tx("Nome fantasia", "Название")} valor={empresa.nome} />
                      <Leitura label="CNPJ" valor={empresa.cnpj} mono />
                      <Leitura label={tx("Regime tributário", "Налоговый режим")} valor={empresa.regime_tributario} />
                      <Leitura label={tx("UF · Município", "Штат · Город")} valor={[empresa.uf, empresa.municipio].filter(Boolean).join(" · ") || null} />
                    </div>
                  </div>

                  {/* config do Masor */}
                  <form onSubmit={submitCfg} className="mt-4 grid gap-4 rounded-2xl border bg-[var(--card)] p-6" style={{ borderColor: "var(--border,#e2e8f0)" }}>
                    <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: INK }}>
                      {tx("Configuração fiscal (Masor)", "Настройки (Masor)")}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Campo label={tx("Markup/margem padrão (%)", "Наценка по умолчанию (%)")} ajuda={{ pt: "Margem padrão que já vem preenchida na análise dos produtos deste cliente. Pode ser mudada produto a produto. Ex.: 30.", ru: "Наценка по умолчанию, подставляется в анализ товаров этого клиента. Можно менять по каждому товару. Напр.: 30." }}>
                        <input className="ipt" style={{ fontFamily: MONO }} value={markup} onChange={(e) => setMarkup(e.target.value)} />
                      </Campo>
                      <Campo label={tx("DAS efetivo (%) — Simples", "DAS (%) — Simples")} ajuda={{ pt: "Só para clientes no Simples Nacional: o percentual efetivo do DAS que a empresa paga sobre o faturamento. Consta no PGDAS. Ex.: 6,8.", ru: "Только для Simples Nacional: эффективный % DAS с оборота. Смотрите в PGDAS. Напр.: 6,8." }}>
                        <input className="ipt" style={{ fontFamily: MONO }} value={das} onChange={(e) => setDas(e.target.value)} placeholder="ex.: 6,8" />
                      </Campo>
                    </div>
                    {erroCfg && <p className="text-xs" style={{ color: "var(--warn,#b45309)" }}>⚠ {erroCfg}</p>}
                    <div className="flex items-center gap-3">
                      <button type="submit" disabled={salvandoCfg} className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60" style={{ background: NAVY }}>
                        {salvandoCfg ? <Loader2 size={16} className="animate-spin" /> : okCfg ? <Check size={16} /> : null}
                        {okCfg ? tx("Salvo!", "Сохранено!") : tx("Salvar configuração", "Сохранить")}
                      </button>
                      <Link to="/consulta" className="text-sm font-semibold" style={{ color: INK }}>
                        {tx("Ir para a análise →", "К анализу →")}
                      </Link>
                    </div>
                  </form>

                  {/* e-CNPJ */}
                  <CertificadoBox tx={tx} clienteId={ativo} admin={admin} />

                  {/* acesso do cliente (portal) */}
                  {admin && <AcessoClienteBox tx={tx} clienteId={ativo} razao={empresa.razao_social ?? empresa.nome ?? ""} />}
                </>
              )
            )}

            {modo === "ver" && !ativo && (
              <div className="rounded-2xl border bg-[var(--card)] p-8 text-center" style={{ borderColor: "var(--border,#e2e8f0)" }}>
                <Building2 size={26} className="mx-auto" style={{ color: AMBER }} />
                <p className="mt-2 text-sm" style={{ color: "var(--app-muted)" }}>
                  {tx("Escolha um cliente acima ou cadastre um novo.", "Выберите клиента или создайте нового.")}
                </p>
              </div>
            )}
          </>
        )}
      </div>

    </AppShell>
  );
}

/* ============================================================
   Formulário de cadastro/edição — grava direto em clientes.
   ============================================================ */
function CadastroCliente({
  tx,
  clienteId,
  onCancelar,
  onSalvo,
}: {
  tx: (pt: string, ru: string) => string;
  clienteId: string | null;
  onCancelar: () => void;
  onSalvo: (id: string) => void;
}) {
  const editando = !!clienteId;
  const [f, setF] = useState<ClienteForm>(formVazio());
  const [carregando, setCarregando] = useState(editando);
  const [buscandoReceita, setBuscandoReceita] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!clienteId) return;
    void (async () => {
      setCarregando(true);
      const r = await carregarClienteParaEdicao(clienteId);
      if (r.erro) setErro(r.erro);
      else if (r.form) setF(r.form);
      setCarregando(false);
    })();
  }, [clienteId]);

  const set = <K extends keyof ClienteForm>(k: K, v: ClienteForm[K]) => setF((s) => ({ ...s, [k]: v }));
  const setEnd = (k: keyof ClienteForm["endereco"], v: string) => setF((s) => ({ ...s, endereco: { ...s.endereco, [k]: v } }));

  async function buscarReceita() {
    if (buscandoReceita) return;
    setBuscandoReceita(true);
    setErro(null);
    const r = await buscarReceitaCNPJ(f.cnpj_cpf);
    setBuscandoReceita(false);
    if (r.erro) {
      toast.error(r.erro);
      return;
    }
    if (r.dados) {
      const d = r.dados;
      setF((s) => ({
        ...s,
        razao_social: d.razao_social ?? s.razao_social,
        nome_fantasia: d.nome_fantasia ?? s.nome_fantasia,
        cnae_principal: d.cnae_principal ?? s.cnae_principal,
        regime_tributario: d.regime_tributario ?? s.regime_tributario,
        email: d.email ?? s.email,
        telefone_whatsapp: d.telefone_whatsapp ?? s.telefone_whatsapp,
        endereco: {
          logradouro: d.endereco?.logradouro ?? s.endereco.logradouro,
          numero: d.endereco?.numero ?? s.endereco.numero,
          complemento: d.endereco?.complemento ?? s.endereco.complemento,
          bairro: d.endereco?.bairro ?? s.endereco.bairro,
          cidade: d.endereco?.cidade ?? s.endereco.cidade,
          uf: d.endereco?.uf ?? s.endereco.uf,
          cep: d.endereco?.cep ?? s.endereco.cep,
        },
      }));
      toast.success(tx("Dados da Receita preenchidos.", "Данные заполнены."));
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (salvando) return;
    setSalvando(true);
    setErro(null);
    const r = await salvarCliente(f);
    setSalvando(false);
    if (r.erro || !r.id) {
      setErro(r.erro ?? tx("Falha ao salvar.", "Ошибка."));
      return;
    }
    if (r.jaExistia)
      toast.success(tx("Este CNPJ já estava cadastrado — carreguei o registro existente.", "Этот CNPJ уже был — загружен существующий."));
    onSalvo(r.id);
  }

  if (carregando) {
    return (
      <div className="flex justify-center rounded-2xl border bg-[var(--card)] py-12" style={{ borderColor: "var(--border,#e2e8f0)" }}>
        <Loader2 className="animate-spin" style={{ color: AMBER }} />
      </div>
    );
  }

  const cnpjDigits = onlyDigits(f.cnpj_cpf);

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-2xl border bg-[var(--card)] p-6" style={{ borderColor: "var(--border,#e2e8f0)" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: INK }}>
          {editando ? tx("Editar cliente", "Изменить клиента") : tx("Novo cliente", "Новый клиент")}
        </h3>
        <button type="button" onClick={onCancelar} className="text-[var(--app-muted)] hover:text-[color:var(--app-ink)]">
          <X size={18} />
        </button>
      </div>

      <p className="-mt-1 text-[11px]" style={{ color: "var(--app-muted)" }}>
        {tx(
          'Só a razão social é obrigatória. Digite o CNPJ e clique "Buscar na Receita" para preencher o resto automaticamente.',
          "Обязательно только название. Введите CNPJ (14 цифр) и нажмите «Из Receita» — остальное заполнится само.",
        )}
      </p>

      {/* CNPJ + Receita */}
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <Campo label="CNPJ / CPF" ajuda={{ pt: "Documento da empresa (14 dígitos, CNPJ) ou pessoa (11, CPF). Digite e clique 'Buscar na Receita' para preencher razão social, endereço e CNAE automaticamente.", ru: "Документ компании (14 цифр, CNPJ) или лица (11, CPF). Введите и нажмите «Из Receita» — данные заполнятся автоматически." }}>
          <input
            className="ipt"
            style={{ fontFamily: MONO }}
            value={f.cnpj_cpf}
            onChange={(e) => set("cnpj_cpf", e.target.value)}
            placeholder="00.000.000/0000-00"
          />
        </Campo>
        <button
          type="button"
          onClick={buscarReceita}
          disabled={buscandoReceita || cnpjDigits.length !== 14}
          className="inline-flex h-[42px] items-center gap-1.5 rounded-xl border px-4 text-sm font-bold disabled:opacity-40"
          style={{ borderColor: NAVY, color: INK }}
        >
          {buscandoReceita ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          {tx("Buscar na Receita", "Из Receita")}
        </button>
      </div>

      <Campo label={tx("Razão social *", "Название *")}>
        <input className="ipt" value={f.razao_social} onChange={(e) => set("razao_social", e.target.value)} required />
      </Campo>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label={tx("Nome fantasia", "Бренд")}>
          <input className="ipt" value={f.nome_fantasia} onChange={(e) => set("nome_fantasia", e.target.value)} />
        </Campo>
        <Campo label={tx("Regime tributário", "Режим")} ajuda={{ pt: "Como a empresa é tributada: Simples Nacional, Lucro Presumido ou Lucro Real. Determina PIS/COFINS e o cálculo do preço. Para supermercado, normalmente Lucro Real.", ru: "Как облагается компания: Simples Nacional, Presumido или Real. Определяет PIS/COFINS и расчёт цены. Для супермаркета обычно Lucro Real." }}>
          <input className="ipt" list="regimes" value={f.regime_tributario} onChange={(e) => set("regime_tributario", e.target.value)} placeholder="Simples Nacional…" />
          <datalist id="regimes">
            {REGIMES.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </Campo>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo label={tx("CNAE principal", "CNAE")} ajuda={{ pt: "Código da atividade econômica principal (ex.: 4711-3/02 = supermercado). Vem da Receita. É o código do ESTATUTO, não do produto.", ru: "Код основной деятельности (напр. 4711-3/02 = супермаркет). Из Receita. Это код УСТАВА, а не товара." }}>
          <input className="ipt" style={{ fontFamily: MONO }} value={f.cnae_principal} onChange={(e) => set("cnae_principal", e.target.value)} />
        </Campo>
        <Campo label={tx("Inscr. Estadual", "IE")} ajuda={{ pt: "Registro da empresa na Secretaria da Fazenda do estado (para ICMS). Obrigatório para quem vende mercadoria. Consta no cadastro estadual.", ru: "Регистрация в налоговой штата (для ICMS). Обязательна для торговли товаром. Из реестра штата." }}>
          <input className="ipt" value={f.inscricao_estadual} onChange={(e) => set("inscricao_estadual", e.target.value)} />
        </Campo>
        <Campo label={tx("Inscr. Municipal", "IM")} ajuda={{ pt: "Registro na prefeitura (para ISS de serviços). Nem todo supermercado precisa. Opcional.", ru: "Регистрация в мэрии (для ISS по услугам). Нужна не всем супермаркетам. Необязательно." }}>
          <input className="ipt" value={f.inscricao_municipal} onChange={(e) => set("inscricao_municipal", e.target.value)} />
        </Campo>
      </div>

      {/* endereço */}
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--app-muted)" }}>{tx("Endereço", "Адрес")}</p>
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <Campo label={tx("Logradouro", "Улица")}>
          <input className="ipt" value={f.endereco.logradouro ?? ""} onChange={(e) => setEnd("logradouro", e.target.value)} />
        </Campo>
        <Campo label={tx("Número", "Номер")}>
          <input className="ipt" value={f.endereco.numero ?? ""} onChange={(e) => setEnd("numero", e.target.value)} />
        </Campo>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo label={tx("Bairro", "Район")}>
          <input className="ipt" value={f.endereco.bairro ?? ""} onChange={(e) => setEnd("bairro", e.target.value)} />
        </Campo>
        <Campo label={tx("Complemento", "Доп.")}>
          <input className="ipt" value={f.endereco.complemento ?? ""} onChange={(e) => setEnd("complemento", e.target.value)} />
        </Campo>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo label={tx("Cidade", "Город")}>
          <input className="ipt" value={f.endereco.cidade ?? ""} onChange={(e) => setEnd("cidade", e.target.value)} />
        </Campo>
        <Campo label="UF">
          <input className="ipt" maxLength={2} value={f.endereco.uf ?? ""} onChange={(e) => setEnd("uf", e.target.value.toUpperCase())} />
        </Campo>
        <Campo label="CEP">
          <input className="ipt" style={{ fontFamily: MONO }} value={f.endereco.cep ?? ""} onChange={(e) => setEnd("cep", e.target.value)} />
        </Campo>
      </div>

      {/* contato */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo label={tx("Responsável", "Ответственный")}>
          <input className="ipt" value={f.nome_responsavel} onChange={(e) => set("nome_responsavel", e.target.value)} />
        </Campo>
        <Campo label="E-mail">
          <input className="ipt" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} />
        </Campo>
        <Campo label={tx("Telefone/WhatsApp", "Телефон")}>
          <input className="ipt" value={f.telefone_whatsapp} onChange={(e) => set("telefone_whatsapp", e.target.value)} />
        </Campo>
      </div>

      {erro && <p className="text-xs" style={{ color: "var(--warn,#b45309)" }}>⚠ {erro}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={salvando} className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60" style={{ background: NAVY }}>
          {salvando ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {editando ? tx("Salvar alterações", "Сохранить") : tx("Cadastrar cliente", "Создать")}
        </button>
        <button type="button" onClick={onCancelar} className="text-sm font-semibold" style={{ color: "var(--app-muted)" }}>
          {tx("Cancelar", "Отмена")}
        </button>
      </div>
    </form>
  );
}

/* ============================================================
   e-CNPJ (certificado A1) — status + upload via edge function.
   ============================================================ */
function CertificadoBox({ tx, clienteId, admin }: { tx: (pt: string, ru: string) => string; clienteId: string; admin: boolean }) {
  const [status, setStatus] = useState<CertStatusResp | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [abrirUpload, setAbrirUpload] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setStatus(await statusCertificado(clienteId));
    setCarregando(false);
  }, [clienteId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function enviar() {
    if (!arquivo || enviando) return;
    setEnviando(true);
    const r = await enviarCertificado(clienteId, arquivo, senha);
    setEnviando(false);
    if (r.erro) {
      toast.error(r.erro);
      return;
    }
    toast.success(tx("e-CNPJ enviado.", "Сертификат загружен."));
    setArquivo(null);
    setSenha("");
    setAbrirUpload(false);
    await carregar();
  }

  const cert = status?.certificado ?? null;
  const val = avaliarValidade(cert?.validade_ate ?? null);
  const est = estiloValidade(val.status);

  return (
    <section className="mt-4 rounded-2xl border bg-[var(--card)] p-6" style={{ borderColor: "var(--border,#e2e8f0)" }}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: INK }}>{tx("Certificado e-CNPJ (A1)", "Сертификат A1")}</h3>
        {admin && !abrirUpload && (
          <button type="button" onClick={() => setAbrirUpload(true)} className="inline-flex items-center gap-1.5 text-[12px] font-bold" style={{ color: INK }}>
            <Upload size={13} /> {cert ? tx("Substituir", "Заменить") : tx("Anexar", "Загрузить")}
          </button>
        )}
      </div>

      {carregando ? (
        <div className="flex justify-center py-4"><Loader2 className="animate-spin" style={{ color: AMBER }} /></div>
      ) : cert ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <ShieldCheck size={16} style={{ color: "var(--success,#0f7a57)" }} />
          <span className="text-sm font-bold" style={{ color: INK }}>{cert.titular ?? cert.filename ?? "e-CNPJ"}</span>
          <span className="rounded-full border px-2 py-0.5 text-[11px] font-semibold" style={{ background: est.bg, color: est.fg, borderColor: est.bd }}>
            {textoValidade(val)}
          </span>
        </div>
      ) : (
        <p className="mt-3 text-xs" style={{ color: "var(--app-muted)" }}>
          {tx("Nenhum e-CNPJ ativo para este cliente.", "Нет активного сертификата.")}
          {!admin && " " + tx("(o upload exige admin)", "(нужен админ)")}
        </p>
      )}

      {status && !status.cofre_ok && (
        <p className="mt-2 text-[11px]" style={{ color: "var(--warn,#b45309)" }}>
          ⚠ {tx("Captura de notas na SEFAZ temporariamente indisponível (configuração do servidor).", "Загрузка накладных из SEFAZ временно недоступна.")}
        </p>
      )}

      {admin && abrirUpload && (
        <div className="mt-4 grid gap-3 rounded-xl border p-4" style={{ borderColor: "var(--border,#e2e8f0)", background: "var(--app-bg2)" }}>
          <Campo label={tx("Arquivo do certificado (.pfx / .p12)", "Файл (.pfx / .p12)")}>
            <input type="file" accept=".pfx,.p12" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)} className="text-xs" />
          </Campo>
          <Campo label={tx("Senha do certificado", "Пароль")}>
            <input type="password" className="ipt" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="off" />
          </Campo>
          <p className="text-[11px]" style={{ color: "var(--app-muted)" }}>
            {tx("O arquivo é criptografado no servidor (AES-256-GCM) e nunca trafega para outros clientes. Mesma cofre do Lior.", "Файл шифруется на сервере.")}
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={enviar} disabled={!arquivo || !senha || enviando} className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold text-white disabled:opacity-50" style={{ background: NAVY }}>
              {enviando ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {tx("Enviar e-CNPJ", "Загрузить")}
            </button>
            <button type="button" onClick={() => setAbrirUpload(false)} className="text-sm font-semibold" style={{ color: "var(--app-muted)" }}>
              {tx("Cancelar", "Отмена")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ============================================================
   Acesso do cliente (portal) — admin cria login e recebe e-mail+senha
   para enviar (WhatsApp). Não depende de SMTP.
   ============================================================ */
function AcessoClienteBox({ tx, clienteId, razao }: { tx: (pt: string, ru: string) => string; clienteId: string; razao: string }) {
  const [acessos, setAcessos] = useState<PortalAcesso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [abrir, setAbrir] = useState(false);
  const [email, setEmail] = useState("");
  const [criando, setCriando] = useState(false);
  const [cred, setCred] = useState<{ email: string; senha: string } | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setAcessos(await listarAcessos(clienteId));
    setCarregando(false);
  }, [clienteId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function criar() {
    if (!email.trim() || criando) return;
    setCriando(true);
    const r = await criarAcesso(clienteId, email.trim());
    setCriando(false);
    if (r.erro) {
      toast.error(r.erro);
      return;
    }
    setCred({ email: r.email ?? email.trim(), senha: r.senha ?? "" });
    setEmail("");
    setAbrir(false);
    await carregar();
    toast.success(tx("Acesso criado.", "Доступ создан."));
  }

  async function revogar(uid: string) {
    if (!confirm(tx("Revogar este acesso? O login deixa de funcionar.", "Отозвать доступ?"))) return;
    const r = await revogarAcesso(uid);
    if (r.erro) {
      toast.error(r.erro);
      return;
    }
    await carregar();
    toast.success(tx("Acesso revogado.", "Доступ отозван."));
  }

  function copiar() {
    if (!cred) return;
    const msg = tx(
      `Acesso ao Masor (${razao})\nSite: https://masor.g41one.com.br\nE-mail: ${cred.email}\nSenha: ${cred.senha}`,
      `Доступ к Masor (${razao})\nСайт: https://masor.g41one.com.br\nE-mail: ${cred.email}\nПароль: ${cred.senha}`,
    );
    navigator.clipboard?.writeText(msg).then(
      () => toast.success(tx("Credenciais copiadas.", "Скопировано.")),
      () => toast.error(tx("Não foi possível copiar.", "Ошибка копирования.")),
    );
  }

  return (
    <section className="mt-4 rounded-2xl border bg-[var(--card)] p-6" style={{ borderColor: "var(--border,#e2e8f0)" }}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: INK }}>{tx("Acesso do cliente (portal)", "Доступ клиента")}</h3>
        {!abrir && (
          <button type="button" onClick={() => { setAbrir(true); setCred(null); }} className="inline-flex items-center gap-1.5 text-[12px] font-bold" style={{ color: INK }}>
            <UserPlus size={13} /> {tx("Novo acesso", "Новый доступ")}
          </button>
        )}
      </div>
      <p className="mt-1 text-[11px]" style={{ color: "var(--app-muted)" }}>
        {tx("O cliente entra no site e vê só os dados desta empresa.", "Клиент видит только данные этой компании.")}
      </p>

      {/* credenciais recém-criadas */}
      {cred && (
        <div className="mt-3 rounded-xl border p-4" style={{ borderColor: "var(--amber)", background: "var(--amber-soft,#fbebd2)" }}>
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: INK }}>{tx("Envie estes dados ao cliente", "Отправьте клиенту")}</p>
          <div className="mt-1 grid gap-0.5 text-sm" style={{ color: INK, fontFamily: MONO }}>
            <span>E-mail: <b>{cred.email}</b></span>
            <span>{tx("Senha", "Пароль")}: <b>{cred.senha}</b></span>
          </div>
          <button type="button" onClick={copiar} className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ background: NAVY }}>
            <Copy size={13} /> {tx("Copiar credenciais", "Скопировать")}
          </button>
          <p className="mt-2 text-[10px]" style={{ color: "var(--app-muted)" }}>
            {tx("A senha não é exibida de novo. Se perder, gere um novo acesso.", "Пароль больше не показывается.")}
          </p>
        </div>
      )}

      {/* form novo acesso */}
      {abrir && (
        <div className="mt-3 grid gap-3 rounded-xl border p-4" style={{ borderColor: "var(--border,#e2e8f0)", background: "var(--app-bg2)" }}>
          <Campo label={tx("E-mail do cliente", "E-mail клиента")}>
            <input className="ipt" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@empresa.com" autoComplete="off" />
          </Campo>
          <div className="flex items-center gap-3">
            <button type="button" onClick={criar} disabled={!email.trim() || criando} className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold text-white disabled:opacity-50" style={{ background: NAVY }}>
              {criando ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
              {tx("Criar acesso", "Создать")}
            </button>
            <button type="button" onClick={() => setAbrir(false)} className="text-sm font-semibold" style={{ color: "var(--app-muted)" }}>{tx("Cancelar", "Отмена")}</button>
          </div>
          <p className="text-[10px]" style={{ color: "var(--app-muted)" }}>
            {tx("Gera uma senha automática; você a envia ao cliente (WhatsApp/e-mail).", "Пароль генерируется автоматически.")}
          </p>
        </div>
      )}

      {/* lista de acessos */}
      <div className="mt-3">
        {carregando ? (
          <div className="flex justify-center py-3"><Loader2 size={16} className="animate-spin" style={{ color: AMBER }} /></div>
        ) : acessos.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--app-muted)" }}>{tx("Nenhum acesso ainda.", "Пока нет доступов.")}</p>
        ) : (
          <ul className="grid gap-1">
            {acessos.map((a) => (
              <li key={a.auth_user_id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border,#e2e8f0)", color: INK }}>
                <span>{a.email ?? a.auth_user_id}</span>
                <button type="button" onClick={() => revogar(a.auth_user_id)} className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: "var(--warn,#b45309)" }}>
                  <Trash2 size={12} /> {tx("Revogar", "Отозвать")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Leitura({ label, valor, mono }: { label: string; valor: string | null; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--app-muted)" }}>{label}</p>
      <p className="text-sm" style={{ color: INK, fontFamily: mono ? MONO : undefined }}>{valor ?? "—"}</p>
    </div>
  );
}

function Campo({ label, children, ajuda }: { label: string; children: ReactNode; ajuda?: { pt: string; ru: string } }) {
  return (
    <label className="grid gap-1">
      <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--app-muted)" }}>
        {label}
        {ajuda && <Ajuda {...ajuda} />}
      </span>
      {children}
    </label>
  );
}
