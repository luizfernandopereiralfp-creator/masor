import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, History, ClipboardList, Settings2, type LucideIcon } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { Protegido } from "@/components/Protegido";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/configuracoes")({
  component: () => (
    <Protegido>
      <AppShell>
        <Configuracoes />
      </AppShell>
    </Protegido>
  ),
});

type Item = { to: string; icon: LucideIcon; pt: string; ru: string; descPt: string; descRu: string };

const ITENS: Item[] = [
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
  },
  {
    to: "/admin",
    icon: Settings2,
    pt: "Administração",
    ru: "Администрирование",
    descPt: "Parâmetros por UF, regras de NCM e inteligência configurável.",
    descRu: "Параметры по штатам, правила НКМ и настраиваемая логика.",
  },
];

function Configuracoes() {
  const { lang } = useI18n();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);

  return (
    <div className="mx-auto max-w-5xl">
      <h2
        className="text-2xl font-bold leading-tight md:text-3xl"
        style={{ color: "var(--app-ink)", fontFamily: "var(--font-display)" }}
      >
        {tx("Configurações", "Настройки")}
      </h2>
      <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--app-muted)" }}>
        {tx("Empresa, histórico, pendências e administração.", "Компания, история, очередь и администрирование.")}
      </p>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {ITENS.map((it) => (
          <Link key={it.to} to={it.to} className="app-card group flex flex-col p-5 transition-shadow hover:shadow-lg">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
              style={{ background: "var(--navy)", color: "var(--amber)" }}
            >
              <it.icon size={20} />
            </span>
            <h3 className="mt-4 text-base font-bold" style={{ color: "var(--app-ink)" }}>
              {tx(it.pt, it.ru)}
            </h3>
            <p className="mt-1 flex-1 text-[13px] leading-relaxed" style={{ color: "var(--app-muted)" }}>
              {tx(it.descPt, it.descRu)}
            </p>
            <span className="mt-3 text-[13px] font-semibold" style={{ color: "var(--navy)" }}>
              {tx(it.pt, it.ru)} →
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
