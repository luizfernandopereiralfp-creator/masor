import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PackageSearch,
  FileSpreadsheet,
  Package,
  ShieldCheck,
  Building2,
  History,
  ClipboardList,
  Settings2,
  ShieldCheck as ShieldTrust,
  type LucideIcon,
} from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Protegido } from "@/components/Protegido";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  component: Home,
});

type Modulo = {
  to: string;
  icon: LucideIcon;
  pt: string;
  ru: string;
  descPt: string;
  descRu: string;
  soStaff?: boolean;
};

const MODULOS: Modulo[] = [
  {
    to: "/consulta",
    icon: PackageSearch,
    pt: "Consultar imposto",
    ru: "Проверить налог",
    descPt: "Um produto por vez: custo real, impostos e preço mínimo de venda, com a fonte de cada número.",
    descRu: "Один товар за раз: реальная себестоимость, налоги и минимальная цена продажи — с источником.",
  },
  {
    to: "/importar",
    icon: FileSpreadsheet,
    pt: "Importar em lote",
    ru: "Импорт пакетом",
    descPt: "Planilha, XML de NF-e ou PDF — o Masor analisa todos os itens de uma vez.",
    descRu: "Таблица, XML НФ-е или PDF — Masor анализирует все позиции сразу.",
  },
  {
    to: "/produtos",
    icon: Package,
    pt: "Produtos & Estoque",
    ru: "Товары и склад",
    descPt: "Catálogo de produtos, controle de estoque e análise fiscal salva por item.",
    descRu: "Каталог товаров, учёт склада и сохранённый налоговый анализ по позиции.",
  },
  {
    to: "/fiscal",
    icon: ShieldCheck,
    pt: "SEFAZ",
    ru: "SEFAZ",
    descPt: "Certificado digital e busca de notas fiscais direto na SEFAZ.",
    descRu: "Цифровой сертификат и загрузка накладных прямо из SEFAZ.",
    soStaff: true,
  },
  {
    to: "/empresa",
    icon: Building2,
    pt: "Empresa",
    ru: "Компания",
    descPt: "Dados da empresa, regime tributário e acessos do portal do cliente.",
    descRu: "Данные компании, налоговый режим и доступы клиентского портала.",
  },
  {
    to: "/historico",
    icon: History,
    pt: "Histórico",
    ru: "История",
    descPt: "Todas as análises já feitas, com exportação em planilha.",
    descRu: "Все выполненные анализы с экспортом в таблицу.",
  },
  {
    to: "/pendencias",
    icon: ClipboardList,
    pt: "Pendências",
    ru: "Очередь",
    descPt: "Fila de aprovação da inteligência fiscal antes de virar padrão.",
    descRu: "Очередь утверждения налоговых правил до применения.",
    soStaff: true,
  },
  {
    to: "/admin",
    icon: Settings2,
    pt: "Administração",
    ru: "Администрирование",
    descPt: "Parâmetros por UF, regras de NCM e inteligência configurável.",
    descRu: "Параметры по штатам, правила НКМ и настраиваемая логика.",
    soStaff: true,
  },
];

function Home() {
  return (
    <Protegido>
      <AppShell>
        <HomeConteudo />
      </AppShell>
    </Protegido>
  );
}

function HomeConteudo() {
  const { t, lang } = useI18n();
  const { perfil } = useAuth();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);
  const staff = perfil?.role === "admin" || perfil?.role === "staff";
  const modulos = MODULOS.filter((m) => staff || !m.soStaff);

  return (
    <div className="mx-auto max-w-5xl">
      <section>
        <h2
          className="text-2xl font-bold leading-tight md:text-3xl"
          style={{ color: "var(--app-ink)", fontFamily: "var(--font-display)" }}
        >
          {tx("Por onde começar?", "С чего начать?")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed md:text-base" style={{ color: "var(--app-muted)" }}>
          {tx(
            "Escolha uma ferramenta abaixo. Cada análise vem com a legislação vigente e a fonte oficial de cada número.",
            "Выберите инструмент ниже. Каждый анализ сопровождается действующим законодательством и официальным источником.",
          )}
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modulos.map((m) => (
          <ModuloCard key={m.to} to={m.to} icon={m.icon} title={tx(m.pt, m.ru)} desc={tx(m.descPt, m.descRu)} />
        ))}
      </section>

      {/* Confiança / anti-invenção */}
      <section className="app-card mt-6 flex items-start gap-3 p-5">
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "var(--amber-soft)", color: "var(--navy)" }}
        >
          <ShieldTrust size={20} />
        </span>
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--app-ink)" }}>
            {t("home.trust.title")}
          </p>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--app-muted)" }}>
            {t("home.trust.desc")}
          </p>
        </div>
      </section>
    </div>
  );
}

function ModuloCard({ to, icon: Icon, title, desc }: { to: string; icon: LucideIcon; title: string; desc: string }) {
  return (
    <Link to={to} className="app-card group flex flex-col p-5 transition-shadow hover:shadow-lg">
      <span
        className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
        style={{ background: "var(--navy)", color: "var(--amber)" }}
      >
        <Icon size={20} />
      </span>
      <h3 className="mt-4 text-base font-bold" style={{ color: "var(--app-ink)" }}>
        {title}
      </h3>
      <p className="mt-1 flex-1 text-[13px] leading-relaxed" style={{ color: "var(--app-muted)" }}>
        {desc}
      </p>
      <span className="mt-3 text-[13px] font-semibold transition-transform group-hover:translate-x-0.5" style={{ color: "var(--navy)" }}>
        {title} →
      </span>
    </Link>
  );
}
