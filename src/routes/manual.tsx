import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  BookOpen, Home, Building2, PackageSearch, Search, Upload, Package, ShieldCheck,
  Calculator, FileBarChart2, History, ClipboardList, Settings2, Sparkles, FileText,
  Languages, ShieldAlert, ChevronDown, type LucideIcon,
} from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { Protegido } from "@/components/Protegido";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/manual")({
  component: () => (
    <Protegido>
      <Manual />
    </Protegido>
  ),
});

const INK = "var(--app-ink)";
const AMBER = "var(--amber)";
const NAVY = "var(--navy)";
const MUTED = "var(--app-muted)";
const BORDER = "var(--border,#e2e8f0)";

type Item = { pt: string; ru: string };
type Secao = {
  icon: LucideIcon;
  to?: string;
  tituloPt: string; tituloRu: string;
  introPt: string; introRu: string;
  itens: Item[];
};

const SECOES: Secao[] = [
  {
    icon: Home, to: "/",
    tituloPt: "Início — os módulos", tituloRu: "Главная — модули",
    introPt: "A tela inicial reúne todos os recursos em cartões. Clique num cartão para abrir o módulo.",
    introRu: "На главной все возможности собраны в карточках. Нажмите карточку, чтобы открыть модуль.",
    itens: [
      { pt: "Cada cartão é um módulo do sistema (consultar produto, importar, relatórios, etc.).", ru: "Каждая карточка — модуль системы (проверка товара, импорт, отчёты и т.д.)." },
      { pt: "O menu lateral esquerdo tem os mesmos atalhos, sempre à mão.", ru: "В левом меню те же ярлыки, всегда под рукой." },
      { pt: "No topo direito você troca o idioma (PT/RU) e sai do sistema.", ru: "Справа вверху — переключение языка (PT/RU) и выход." },
    ],
  },
  {
    icon: Building2, to: "/empresa",
    tituloPt: "Empresa — cadastro do cliente", tituloRu: "Компания — карточка клиента",
    introPt: "Cadastre o supermercado (cliente) que você vai analisar. É o primeiro passo: a UF e o regime daqui alimentam todos os cálculos.",
    introRu: "Заведите супермаркет (клиента) для анализа. Первый шаг: штат и режим отсюда питают все расчёты.",
    itens: [
      { pt: "Digite o CNPJ e clique 'Buscar na Receita' — razão social, endereço e CNAE vêm sozinhos.", ru: "Введите CNPJ и нажмите «Из Receita» — название, адрес и CNAE подставятся сами." },
      { pt: "Defina o regime tributário (supermercado normalmente é Lucro Real) e a UF — eles definem os impostos.", ru: "Укажите налоговый режим (для супермаркета обычно Lucro Real) и штат — они задают налоги." },
      { pt: "Markup padrão e DAS efetivo já vêm preenchidos na análise dos produtos deste cliente.", ru: "Наценка по умолчанию и DAS подставляются в анализ товаров этого клиента." },
      { pt: "Só admin: 'Acesso do cliente (portal)' cria um login para o próprio supermercado ver seus dados.", ru: "Только админ: «Доступ клиента» создаёт логин, чтобы супермаркет видел свои данные." },
      { pt: "Você troca de cliente ativo aqui e nas outras telas — tudo passa a se referir a ele.", ru: "Активного клиента меняете здесь и на других экранах — всё относится к нему." },
    ],
  },
  {
    icon: PackageSearch, to: "/consulta",
    tituloPt: "Consulta — analisar um produto", tituloRu: "Проверка — анализ товара",
    introPt: "O coração do sistema: informe um produto e receba custo real, impostos, preço mínimo de venda e a memória de cálculo passo a passo.",
    introRu: "Сердце системы: укажите товар и получите реальную себестоимость, налоги, минимальную цену и пошаговый расчёт.",
    itens: [
      { pt: "Preencha os campos (cada um tem um '?' explicando). Pode carregar uma NF-e (XML/PDF) e o sistema preenche.", ru: "Заполните поля (у каждого есть «?»). Можно загрузить NF-e (XML/PDF) — система заполнит сама." },
      { pt: "Clique 'Analisar com a IA especialista'. A IA pesquisa a legislação e conclui — sem mandar você conferir.", ru: "Нажмите «Анализ с ИИ». ИИ изучает закон и делает вывод — не отправляя вас проверять." },
      { pt: "O resultado mostra o preço mínimo, a margem e a formação de preço com cada número explicado.", ru: "Результат: минимальная цена, маржа и формирование цены с пояснением каждого числа." },
      { pt: "Abra 'Ver tudo' para base legal, memória de cálculo, cenários da Reforma e oportunidades de economia.", ru: "«Показать всё»: правовая база, расчёт, сценарии реформы и возможности экономии." },
      { pt: "Botões: 'Gerar PDF' (parecer completo) e 'Exportar planilha' (XLSX com todas as abas).", ru: "Кнопки: «Скачать PDF» (полное заключение) и «Экспорт» (XLSX со всеми вкладками)." },
    ],
  },
  {
    icon: Search, to: "/ncm",
    tituloPt: "Buscar NCM — pela descrição", tituloRu: "Поиск NCM — по описанию",
    introPt: "Não sabe o código NCM do produto? Descreva em português e a IA sugere os NCMs prováveis, com o CEST quando houver.",
    introRu: "Не знаете код NCM? Опишите товар, и ИИ подскажет вероятные NCM и CEST, если есть.",
    itens: [
      { pt: "Digite algo como 'queijo muçarela' ou 'detergente líquido' e veja os códigos sugeridos.", ru: "Введите, напр., «сыр моцарелла» или «жидкое моющее» — увидите коды." },
      { pt: "Útil para o cadastro do produto e para achar o CEST correto (Substituição Tributária).", ru: "Помогает при заведении товара и в поиске правильного CEST (налоговое замещение)." },
    ],
  },
  {
    icon: Upload, to: "/importar",
    tituloPt: "Importar — em lote", tituloRu: "Импорт — пакетом",
    introPt: "Analise muitos produtos de uma vez: planilha, XML de NF-e ou PDF. O sistema lê os itens e roda a análise de cada um.",
    introRu: "Анализируйте много товаров сразу: таблица, XML NF-e или PDF. Система читает позиции и анализирует каждую.",
    itens: [
      { pt: "Arraste o arquivo. Colunas reconhecidas: descrição, NCM, custo, etc.", ru: "Перетащите файл. Распознаются столбцы: описание, NCM, себестоимость и т.д." },
      { pt: "Ideal para importar a lista inteira de compras ou o catálogo do supermercado.", ru: "Удобно для всего списка закупок или каталога супермаркета." },
    ],
  },
  {
    icon: Package, to: "/produtos",
    tituloPt: "Produtos & Estoque", tituloRu: "Товары и склад",
    introPt: "O catálogo de produtos do cliente, com a análise fiscal salva por item e controle de estoque.",
    introRu: "Каталог товаров клиента с сохранённым налоговым анализом и учётом склада.",
    itens: [
      { pt: "Cadastre produtos (cada campo tem '?'). A análise fiscal fica salva junto do item.", ru: "Заводите товары (у каждого поля «?»). Анализ хранится вместе с товаром." },
      { pt: "Lance entradas e saídas de estoque; o sistema avisa quando fica abaixo do mínimo.", ru: "Вносите приход/расход; система предупредит о минимуме." },
    ],
  },
  {
    icon: ShieldCheck, to: "/fiscal",
    tituloPt: "SEFAZ — busca automática de NF-e", tituloRu: "SEFAZ — автопоиск NF-e",
    introPt: "Puxa automaticamente as notas de compra emitidas contra o CNPJ do cliente na SEFAZ (precisa do certificado e-CNPJ).",
    introRu: "Автоматически загружает входящие накладные по CNPJ клиента из SEFAZ (нужен сертификат e-CNPJ).",
    itens: [
      { pt: "Envie o certificado A1 (.pfx) do cliente na tela Empresa para habilitar.", ru: "Загрузите сертификат A1 (.pfx) клиента на экране «Компания»." },
      { pt: "As NF-e encontradas alimentam a importação e a apuração sem digitação.", ru: "Найденные NF-e питают импорт и расчёт без ручного ввода." },
    ],
  },
  {
    icon: Calculator, to: "/apuracao",
    tituloPt: "Apuração fiscal", tituloRu: "Налоговый расчёт",
    introPt: "Não só aponta, mas resolve: apura ICMS, ST, antecipação, ressarcimento e complemento conforme a legislação do estado do cliente.",
    introRu: "Не только показывает, но и решает: считает ICMS, ST, авансы, возмещение и доплату по закону штата клиента.",
    itens: [
      { pt: "Cruza entradas e saídas para achar crédito recuperável e ST a ressarcir/complementar.", ru: "Сопоставляет приход и расход: возмещаемый кредит и ST к возврату/доплате." },
      { pt: "Tudo com base legal; o que a legislação não confirmar vira pendência (nunca chute).", ru: "Всё с правовой базой; неподтверждённое становится «к уточнению» (без догадок)." },
    ],
  },
  {
    icon: FileBarChart2, to: "/relatorios",
    tituloPt: "Relatórios personalizados", tituloRu: "Настраиваемые отчёты",
    introPt: "Gere uma planilha (XLSX) com toda a memória de cálculo por produto — você escolhe as colunas, a ordem e o modelo.",
    introRu: "Сформируйте таблицу (XLSX) с полным расчётом по каждому товару — выбираете столбцы, порядок и шаблон.",
    itens: [
      { pt: "Modelos prontos: Formação de preço, Enxuto, Tributário e Completo.", ru: "Готовые шаблоны: Ценообразование, Кратко, Налоговый и Полный." },
      { pt: "Marque as colunas que quiser, reordene e exporte — cabeçalho e formatação profissionais.", ru: "Отметьте столбцы, измените порядок и выгрузите — с профессиональным оформлением." },
    ],
  },
  {
    icon: History, to: "/historico",
    tituloPt: "Histórico", tituloRu: "История",
    introPt: "Todas as análises já feitas, com data, produto, preço e status. Exportável em planilha.",
    introRu: "Все выполненные анализы: дата, товар, цена, статус. Выгружается в таблицу.",
    itens: [
      { pt: "Reabra qualquer análise anterior e compare no tempo.", ru: "Откройте любой прошлый анализ и сравните во времени." },
    ],
  },
  {
    icon: ClipboardList, to: "/pendencias",
    tituloPt: "Pendências — fila de aprovação", tituloRu: "Очередь — на утверждение",
    introPt: "Quando a IA ou um usuário sugere mudar uma regra fiscal (alíquota de UF, regra de NCM), a mudança espera aprovação do admin aqui.",
    introRu: "Когда ИИ или пользователь предлагает изменить правило (ставка штата, правило NCM), оно ждёт утверждения админа здесь.",
    itens: [
      { pt: "Garante que a base fiscal só muda com revisão humana — nada entra sozinho.", ru: "Гарантия: база меняется только после проверки человеком." },
    ],
  },
  {
    icon: Settings2, to: "/admin",
    tituloPt: "Admin — base fiscal por estado", tituloRu: "Админ — база по штатам",
    introPt: "Só para a equipe: cadastro das regras estaduais (alíquotas, ST, antecipação) e das regras por NCM, com fonte e data.",
    introRu: "Только для команды: правила штатов (ставки, ST, авансы) и правила по NCM, с источником и датой.",
    itens: [
      { pt: "É a memória fiscal multi-tenant que o motor de cálculo usa para cada cliente.", ru: "Это мультиарендная налоговая память, которую движок использует для каждого клиента." },
    ],
  },
  {
    icon: Sparkles,
    tituloPt: "IA especialista + apresentação", tituloRu: "ИИ-эксперт + вид отчёта",
    introPt: "A IA é especialista em supermercados: pesquisa a lei, conclui e mostra a base legal sempre. Os botões mudam COMO o relatório aparece, sem alterar os números.",
    introRu: "ИИ — эксперт по супермаркетам: изучает закон, делает вывод и всегда показывает правовую базу. Кнопки меняют ВИД отчёта, не трогая числа.",
    itens: [
      { pt: "Chips 'Mais enxuto', 'Ver tudo', 'Base legal', 'Memória' ajustam a exibição na hora.", ru: "Кнопки «Кратко», «Всё», «Правовая база», «Расчёт» меняют показ мгновенно." },
      { pt: "A IA nunca altera a base fiscal sozinha: sugere e a mudança vai para Pendências.", ru: "ИИ не меняет базу сам: предлагает, а изменение идёт в «Очередь»." },
    ],
  },
];

function Manual() {
  const { lang } = useI18n();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);
  const [abertas, setAbertas] = useState<Set<number>>(new Set([0, 1, 2]));
  const toggle = (i: number) => setAbertas((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        {/* Hero */}
        <div className="mb-5 overflow-hidden rounded-2xl border" style={{ borderColor: BORDER, background: NAVY }}>
          <div className="flex items-start gap-3 p-5">
            <BookOpen size={26} style={{ color: AMBER }} />
            <div>
              <h1 className="text-lg font-bold text-white">{tx("Manual do Masor", "Руководство Masor")}</h1>
              <p className="mt-1 text-sm" style={{ color: "#C7CEDE" }}>
                {tx(
                  "O que o sistema faz e como usar cada tela. Em cada campo de preenchimento há um '?' com uma explicação rápida.",
                  "Что делает система и как пользоваться каждым экраном. У каждого поля есть «?» с кратким пояснением.",
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Anti-invenção — princípio */}
        <div className="mb-5 flex items-start gap-3 rounded-xl border p-4" style={{ borderColor: BORDER, background: "var(--amber-soft)" }}>
          <ShieldAlert size={20} style={{ color: NAVY }} className="mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold" style={{ color: NAVY }}>{tx("Princípio anti-invenção", "Принцип: без выдумок")}</p>
            <p className="mt-0.5 text-xs" style={{ color: INK }}>
              {tx(
                "O Masor nunca inventa alíquota, NCM ou benefício. Se a legislação não confirmar um número por fonte oficial, ele marca como pendência — a análise sai como provisória em vez de arriscar um valor errado.",
                "Masor не выдумывает ставки, NCM или льготы. Если закон не подтверждает число официальным источником, оно помечается «к уточнению» — анализ выходит предварительным, без риска ошибки.",
              )}
            </p>
          </div>
        </div>

        {/* Seções */}
        <div className="space-y-2.5">
          {SECOES.map((s, i) => {
            const Icon = s.icon;
            const aberta = abertas.has(i);
            return (
              <div key={i} className="overflow-hidden rounded-xl border bg-[var(--card)]" style={{ borderColor: BORDER }}>
                <button type="button" onClick={() => toggle(i)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--amber-soft)" }}>
                    <Icon size={17} style={{ color: NAVY }} />
                  </span>
                  <span className="flex-1 text-sm font-bold" style={{ color: INK }}>{tx(s.tituloPt, s.tituloRu)}</span>
                  {s.to && (
                    <Link to={s.to} onClick={(e) => e.stopPropagation()} className="rounded-md px-2 py-1 text-[11px] font-semibold" style={{ color: NAVY, background: "var(--amber-soft)" }}>
                      {tx("abrir", "открыть")}
                    </Link>
                  )}
                  <ChevronDown size={16} style={{ color: MUTED, transform: aberta ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
                </button>
                {aberta && (
                  <div className="border-t px-4 py-3" style={{ borderColor: BORDER }}>
                    <p className="text-xs" style={{ color: MUTED }}>{tx(s.introPt, s.introRu)}</p>
                    <ul className="mt-2 space-y-1.5">
                      {s.itens.map((it, j) => (
                        <li key={j} className="flex gap-2 text-xs" style={{ color: INK }}>
                          <span style={{ color: AMBER }}>•</span>
                          <span>{tx(it.pt, it.ru)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Rodapé — exportações e idioma */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border p-4" style={{ borderColor: BORDER }}>
            <div className="flex items-center gap-2"><FileText size={16} style={{ color: AMBER }} /><span className="text-sm font-bold" style={{ color: INK }}>{tx("Exportações", "Экспорт")}</span></div>
            <p className="mt-1 text-xs" style={{ color: MUTED }}>
              {tx("Toda análise vira PDF (parecer) ou planilha XLSX. Relatórios personalizados também saem em XLSX com layout profissional.", "Любой анализ — в PDF (заключение) или XLSX. Настраиваемые отчёты тоже в XLSX с профессиональным видом.")}
            </p>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: BORDER }}>
            <div className="flex items-center gap-2"><Languages size={16} style={{ color: AMBER }} /><span className="text-sm font-bold" style={{ color: INK }}>{tx("Idioma PT / RU", "Язык PT / RU")}</span></div>
            <p className="mt-1 text-xs" style={{ color: MUTED }}>
              {tx("Troque o idioma no topo da tela a qualquer momento. Todo o sistema, o manual e as ajudas '?' acompanham.", "Переключайте язык вверху экрана в любой момент. Вся система, руководство и подсказки «?» следуют за ним.")}
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
