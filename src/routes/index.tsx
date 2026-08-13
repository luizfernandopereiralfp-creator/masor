import { createFileRoute, Link } from "@tanstack/react-router";
import { FileSpreadsheet, PackageSearch, ShieldCheck } from "lucide-react";

import { useI18n, type Lang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Protegido } from "@/components/Protegido";

export const Route = createFileRoute("/")({
  component: Home,
});

function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  const opts: Lang[] = ["pt", "ru"];
  return (
    <div
      className="inline-flex overflow-hidden rounded-full border"
      style={{ borderColor: "rgba(255,255,255,0.25)" }}
      aria-label={t("lang.switch")}
    >
      {opts.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className="px-3 py-1 text-xs font-semibold transition-colors"
          style={
            lang === l
              ? { background: "var(--amber)", color: "var(--navy)" }
              : { background: "transparent", color: "#fff" }
          }
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function Home() {
  return (
    <Protegido>
      <HomeConteudo />
    </Protegido>
  );
}

function HomeConteudo() {
  const { t } = useI18n();
  const { sair, user, perfil } = useAuth();
  const staff = perfil?.role === "admin" || perfil?.role === "staff";

  return (
    <div className="min-h-screen" style={{ background: "var(--app-bg, #eef1f6)" }}>
      {/* Cabeçalho */}
      <header
        className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
        style={{ background: "var(--navy)" }}
      >
        <div className="flex items-center gap-3">
          <img src="/masor-logo.png" alt="Masor" className="h-8 w-auto rounded bg-white px-2 py-1" />
          <div>
            <p className="text-[11px]" style={{ color: "var(--amber)" }}>
              {t("app.tagline")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user?.email && <span className="hidden text-[11px] text-white/70 sm:inline">{user.email}</span>}
          <button
            type="button"
            onClick={() => sair()}
            className="rounded-full border px-3 py-1 text-xs font-semibold text-white"
            style={{ borderColor: "rgba(255,255,255,0.25)" }}
          >
            {t("nav.sair")}
          </button>
          <LangSwitch />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        {/* Hero */}
        <section className="mx-auto max-w-3xl text-center">
          <h2
            className="text-2xl font-bold leading-tight md:text-4xl"
            style={{ color: "var(--navy)", fontFamily: "var(--font-display)" }}
          >
            {t("home.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed md:text-base" style={{ color: "#4a5568" }}>
            {t("home.subtitle")}
          </p>
        </section>

        {/* Dois caminhos */}
        <section className="mt-10 grid gap-4 md:grid-cols-2">
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

        <div className="mt-4 flex items-center justify-center gap-4 text-center">
          <Link to="/empresa" className="text-xs font-semibold underline" style={{ color: "var(--navy)" }}>
            {t("home.empresa")}
          </Link>
          <Link to="/historico" className="text-xs font-semibold underline" style={{ color: "var(--navy)" }}>
            {t("home.historico")}
          </Link>
          {staff && (
            <>
              <Link to="/pendencias" className="text-xs font-semibold underline" style={{ color: "var(--navy)" }}>
                {t("home.pendencias")}
              </Link>
              <Link to="/admin" className="text-xs font-semibold underline" style={{ color: "var(--navy)" }}>
                {t("home.admin")}
              </Link>
              <Link to="/fiscal" className="text-xs font-semibold underline" style={{ color: "var(--navy)" }}>
                {t("home.fiscal")}
              </Link>
            </>
          )}
        </div>

        {/* Confiança / anti-invenção */}
        <section
          className="mt-8 flex items-start gap-3 rounded-xl border bg-white p-5"
          style={{ borderColor: "var(--amber-soft)" }}
        >
          <span
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "var(--amber-soft)", color: "var(--navy)" }}
          >
            <ShieldCheck size={20} />
          </span>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--navy)" }}>
              {t("home.trust.title")}
            </p>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: "#4a5568" }}>
              {t("home.trust.desc")}
            </p>
          </div>
        </section>

        <footer className="mx-auto mt-10 max-w-3xl text-center">
          <p className="text-[11px] leading-relaxed" style={{ color: "#8892A4" }}>
            {t("footer.note")}
          </p>
        </footer>
      </main>
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
    <Link
      to={to}
      className="group flex flex-col rounded-2xl border bg-white p-6 transition-shadow hover:shadow-lg"
      style={{ borderColor: "var(--border, #e2e8f0)" }}
    >
      <span
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ background: "var(--navy)", color: "var(--amber)" }}
      >
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-bold" style={{ color: "var(--navy)" }}>
        {title}
      </h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed" style={{ color: "#4a5568" }}>
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
