import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PackageSearch,
  FileSpreadsheet,
  FileBarChart2,
  BookOpen,
  Package,
  ShieldCheck,
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
  novo?: boolean;
};

const MODULOS: Modulo[] = [
  {
    to: "/consulta",
    icon: PackageSearch,
    pt: "Consultar produto individualmente",
    ru: "Проверить товар отдельно",
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
    pt: "Busca automática de NFs SEFAZ",
    ru: "Автопоиск НФ в SEFAZ",
    descPt: "Puxa automaticamente as NF-e de compra emitidas contra o seu CNPJ na SEFAZ.",
    descRu: "Автоматически загружает входящие НФ-е по вашему CNPJ из SEFAZ.",
    soStaff: true,
  },
  {
    to: "/relatorios",
    icon: FileBarChart2,
    pt: "Relatórios personalizados",
    ru: "Настраиваемые отчёты",
    descPt: "Planilha com toda a memória de cálculo por produto — escolha colunas, ordem e modelo, e exporte em XLSX.",
    descRu: "Таблица с полным расчётом по каждому товару — выберите столбцы, порядок и шаблон, и выгрузите в XLSX.",
    soStaff: true,
    novo: true,
  },
  {
    to: "/manual",
    icon: BookOpen,
    pt: "Manual de uso",
    ru: "Руководство",
    descPt: "O que o sistema faz e como usar cada tela, em português e russo. Cada campo tem um '?' com explicação.",
    descRu: "Что делает система и как пользоваться каждым экраном, на португальском и русском. У каждого поля есть «?».",
  },
  {
    to: "/configuracoes",
    icon: Settings2,
    pt: "Configurações",
    ru: "Настройки",
    descPt: "Empresa, histórico de análises, pendências e administração — reunidos num lugar.",
    descRu: "Компания, история, очередь и администрирование — в одном месте.",
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
      {/* Hero — wordmark do Masor centralizado (padrão launcher Lior) */}
      <section className="pb-2 pt-2 text-center md:pt-4">
        <span
          className="inline-flex items-center justify-center font-extrabold"
          style={{ gap: 1, fontSize: 44, letterSpacing: "-.02em", color: "var(--navy)", fontFamily: "var(--font-display)" }}
          aria-label="Masor"
        >
          Mas
          <img src="/globe.png" alt="o" style={{ height: "0.86em", transform: "translateY(0.1em)", margin: "0 -.01em" }} />
          r
        </span>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em]" style={{ color: "var(--app-faint)" }}>
          {tx("Auditor Fiscal · G41 Inteligência", "Налоговый аудитор · G41")}
        </p>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modulos.map((m) => (
          <ModuloCard key={m.to} to={m.to} icon={m.icon} title={tx(m.pt, m.ru)} desc={tx(m.descPt, m.descRu)} novo={m.novo} lang={lang} />
        ))}
      </section>

      {/* Confiança / anti-invenção */}
      <section className="mt-5 flex items-start gap-3 rounded-2xl border p-5" style={{ borderColor: "var(--app-line)", background: "var(--tint-amber)" }}>
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--navy)", color: "var(--bulb)" }}>
          <ShieldTrust size={20} />
        </span>
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--app-ink)" }}>
            {t("home.trust.title")}
          </p>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--app-body)" }}>
            {t("home.trust.desc")}
          </p>
        </div>
      </section>
    </div>
  );
}

function ModuloCard({ to, icon: Icon, title, desc, novo, lang }: { to: string; icon: LucideIcon; title: string; desc: string; novo?: boolean; lang: "pt" | "ru" }) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
      style={{ background: "var(--navy)", boxShadow: "var(--shadow-app)" }}
    >
      {novo && (
        <span className="absolute right-4 top-4 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: "var(--amber)", color: "var(--navy)" }}>
          {lang === "ru" ? "Новое" : "Novo"}
        </span>
      )}
      <span
        className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
        style={{ background: "rgba(233,167,74,0.16)", color: "var(--bulb)" }}
      >
        <Icon size={20} />
      </span>
      <h3 className="mt-4 text-base font-bold text-white">{title}</h3>
      <p className="mt-1 flex-1 text-[13px] leading-relaxed" style={{ color: "#C7CEDE" }}>
        {desc}
      </p>
    </Link>
  );
}
