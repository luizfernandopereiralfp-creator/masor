import { createFileRoute, Link } from "@tanstack/react-router";
import { FileSpreadsheet, PackageSearch, ShieldCheck, Package, Building2, ClipboardList } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Protegido } from "@/components/Protegido";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  component: Home,
});

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
  const staff = perfil?.role === "admin" || perfil?.role === "staff";

  return (
    <div className="mx-auto max-w-5xl">
      {/* Boas-vindas */}
      <section>
        <h2
          className="text-2xl font-bold leading-tight md:text-3xl"
          style={{ color: "var(--app-ink)", fontFamily: "var(--font-display)" }}
        >
          {t("home.title")}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed md:text-base" style={{ color: "var(--app-muted)" }}>
          {t("home.subtitle")}
        </p>
      </section>

      {/* Dois caminhos principais */}
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <ActionCard
          to="/consulta"
          icon={<PackageSearch size={22} />}
          title={t("home.consulta.title")}
          desc={t("home.consulta.desc")}
          cta={t("home.consulta.cta")}
        />
        <ActionCard
          to="/importar"
          icon={<FileSpreadsheet size={22} />}
          title={t("home.importar.title")}
          desc={t("home.importar.desc")}
          cta={t("home.importar.cta")}
        />
      </section>

      {/* Acesso rápido */}
      <section className="mt-4 grid gap-3 sm:grid-cols-3">
        <QuickCard to="/produtos" icon={<Package size={18} />} label={t("home.produtos")} />
        <QuickCard to="/empresa" icon={<Building2 size={18} />} label={t("home.empresa")} />
        {staff ? (
          <QuickCard to="/pendencias" icon={<ClipboardList size={18} />} label={t("home.pendencias")} />
        ) : (
          <QuickCard to="/historico" icon={<ClipboardList size={18} />} label={t("home.historico")} />
        )}
      </section>

      {/* Confiança / anti-invenção */}
      <section className="app-card mt-6 flex items-start gap-3 p-5">
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "var(--amber-soft)", color: "var(--navy)" }}
        >
          <ShieldCheck size={20} />
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

      <footer className="mt-8">
        <p className="text-[11px] leading-relaxed" style={{ color: "var(--app-faint)" }}>
          {t("footer.note")} {lang === "ru" ? "" : ""}
        </p>
      </footer>
    </div>
  );
}

function ActionCard({
  to,
  icon,
  title,
  desc,
  cta,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta: string;
}) {
  return (
    <Link to={to} className="app-card group flex flex-col p-6 transition-shadow hover:shadow-lg">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ background: "var(--navy)", color: "var(--amber)" }}
      >
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-bold" style={{ color: "var(--app-ink)" }}>
        {title}
      </h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed" style={{ color: "var(--app-muted)" }}>
        {desc}
      </p>
      <span
        className="mt-4 inline-flex w-fit items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold transition-transform group-hover:translate-x-0.5"
        style={{ background: "var(--amber)", color: "var(--navy)" }}
      >
        {cta} →
      </span>
    </Link>
  );
}

function QuickCard({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="app-card flex items-center gap-3 p-4 transition-shadow hover:shadow-lg">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ background: "var(--app-bg2)", color: "var(--navy)" }}
      >
        {icon}
      </span>
      <span className="text-sm font-semibold" style={{ color: "var(--app-ink)" }}>
        {label}
      </span>
    </Link>
  );
}
