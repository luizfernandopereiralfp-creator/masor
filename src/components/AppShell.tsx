import { type ReactNode, useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Package,
  PackageSearch,
  Upload,
  ShieldCheck,
  Building2,
  History,
  ClipboardList,
  Settings2,
  Calculator,
  Home,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  type LucideIcon,
} from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { ChatDock } from "@/components/ChatDock";

/* ============================================================
   Masor — App Shell (sidebar + top bar)
   Layout de "sistema": navegação lateral fixa + barra superior.
   Rótulos bilíngues locais (pt/ru) — não mexe no dicionário i18n.
   Navegação por perfil: equipe (staff/admin) x cliente (portal).
   ============================================================ */

type NavItem = {
  to: string;
  icon: LucideIcon;
  pt: string;
  ru: string;
  soon?: boolean;
  badge?: string;
};

const NAV_STAFF: NavItem[] = [
  { to: "/", icon: Home, pt: "Início", ru: "Главная" },
  { to: "/produtos", icon: Package, pt: "Produtos & Estoque", ru: "Товары и склад" },
  { to: "/consulta", icon: PackageSearch, pt: "Consulta", ru: "Проверка" },
  { to: "/importar", icon: Upload, pt: "Importar", ru: "Импорт" },
  { to: "/fiscal", icon: ShieldCheck, pt: "SEFAZ", ru: "SEFAZ" },
  { to: "/empresa", icon: Building2, pt: "Empresa", ru: "Компания" },
  { to: "/historico", icon: History, pt: "Histórico", ru: "История" },
  { to: "/pendencias", icon: ClipboardList, pt: "Pendências", ru: "Очередь" },
  { to: "/admin", icon: Settings2, pt: "Admin", ru: "Админ" },
  { to: "__apuracao", icon: Calculator, pt: "Apuração", ru: "Расчёт", soon: true },
];

const NAV_CLIENTE: NavItem[] = [
  { to: "/portal", icon: Home, pt: "Início", ru: "Главная" },
  { to: "/produtos", icon: Package, pt: "Meus produtos", ru: "Мои товары" },
  { to: "/consulta", icon: PackageSearch, pt: "Analisar", ru: "Анализ" },
  { to: "/importar", icon: Upload, pt: "Importar", ru: "Импорт" },
];

/** Título da página atual (breadcrumb simples) a partir do path. */
function tituloDaRota(path: string, lang: "pt" | "ru", itens: NavItem[]): string {
  const hit = itens.find((i) => i.to !== "/" && path.startsWith(i.to));
  if (hit) return lang === "ru" ? hit.ru : hit.pt;
  return lang === "ru" ? "Главная" : "Início";
}

export function AppShell({ children }: { children: ReactNode }) {
  const { lang, setLang, t } = useI18n();
  const { user, perfil, sair } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [menuAberto, setMenuAberto] = useState(false);
  const [tema, setTema] = useState<"light" | "dark">("light");

  useEffect(() => {
    const salvo = (typeof localStorage !== "undefined" ? localStorage.getItem("masor-tema") : null) as
      | "light"
      | "dark"
      | null;
    const inicial = salvo === "dark" ? "dark" : "light";
    setTema(inicial);
    if (typeof document !== "undefined") document.documentElement.setAttribute("data-theme", inicial);
  }, []);

  function alternarTema() {
    setTema((atual) => {
      const novo = atual === "dark" ? "light" : "dark";
      if (typeof document !== "undefined") document.documentElement.setAttribute("data-theme", novo);
      try {
        localStorage.setItem("masor-tema", novo);
      } catch {
        /* ignore */
      }
      return novo;
    });
  }

  const cliente = perfil?.role === "cliente";
  const itens = cliente ? NAV_CLIENTE : NAV_STAFF;
  const titulo = tituloDaRota(path, lang, itens);

  return (
    <div className="min-h-screen" style={{ background: "var(--app-bg)" }}>
      {/* Sidebar desktop */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col md:flex"
        style={{ background: "var(--sidebar, var(--navy))" }}
      >
        <MarcaSidebar />
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {itens.map((it) => (
            <ItemNav key={it.to} it={it} path={path} lang={lang} />
          ))}
        </nav>
        <RodapeSidebar email={user?.email ?? null} onSair={() => sair()} sairLabel={t("nav.sair")} />
      </aside>

      {/* Drawer mobile */}
      {menuAberto && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuAberto(false)} />
          <aside
            className="absolute inset-y-0 left-0 flex w-[260px] flex-col"
            style={{ background: "var(--sidebar, var(--navy))" }}
          >
            <div className="flex items-center justify-between pr-2">
              <MarcaSidebar />
              <button type="button" onClick={() => setMenuAberto(false)} className="p-2 text-white/70">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" onClick={() => setMenuAberto(false)}>
              {itens.map((it) => (
                <ItemNav key={it.to} it={it} path={path} lang={lang} />
              ))}
            </nav>
            <RodapeSidebar email={user?.email ?? null} onSair={() => sair()} sairLabel={t("nav.sair")} />
          </aside>
        </div>
      )}

      {/* Coluna de conteúdo */}
      <div className="md:pl-[250px]">
        {/* Barra superior */}
        <header
          className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b px-4 md:px-6"
          style={{ background: "var(--card)", borderColor: "var(--app-line)" }}
        >
          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            className="grid h-9 w-9 place-items-center rounded-lg md:hidden"
            style={{ background: "var(--app-bg2)", color: "var(--app-ink)" }}
            aria-label="Menu"
          >
            <Menu size={18} />
          </button>
          <h1 className="text-base font-bold md:text-lg" style={{ color: "var(--app-ink)", fontFamily: "var(--font-display)" }}>
            {titulo}
          </h1>
          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={alternarTema}
              className="grid h-9 w-9 place-items-center rounded-lg"
              style={{ background: "var(--app-bg2)", color: "var(--app-ink)", border: "1px solid var(--app-line)" }}
              aria-label={tema === "dark" ? "Modo claro" : "Modo escuro"}
              title={tema === "dark" ? "Modo claro" : "Modo escuro"}
            >
              {tema === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <PilulaIdioma lang={lang} setLang={setLang} />
            {user?.email && (
              <span className="hidden max-w-[180px] truncate text-xs md:inline" style={{ color: "var(--app-muted)" }}>
                {user.email}
              </span>
            )}
          </div>
        </header>

        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>

      {/* IA sempre disponível (flutuante). A /consulta tem a sua própria (ligada
          à análise da tela), então aqui suprimimos para não duplicar. */}
      {path !== "/consulta" && (
        <ChatDock contexto={{ rota: path }} onDiretriz={() => {}} idioma={lang} />
      )}
    </div>
  );
}

function MarcaSidebar() {
  return (
    <div className="flex items-center gap-2 px-4 pb-3 pt-5">
      <img src="/masor-logo.png" alt="Masor" className="h-8 w-auto rounded bg-white px-2 py-1" />
    </div>
  );
}

function ItemNav({ it, path, lang }: { it: NavItem; path: string; lang: "pt" | "ru" }) {
  const Icon = it.icon;
  const label = lang === "ru" ? it.ru : it.pt;
  const ativo = it.to === "/" ? path === "/" : path.startsWith(it.to);

  if (it.soon) {
    return (
      <div className="app-nav" style={{ opacity: 0.55, cursor: "default" }}>
        <span className="app-nav-ic">
          <Icon size={18} />
        </span>
        <span className="flex-1">{label}</span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: "rgba(233,167,74,0.18)", color: "var(--amber)" }}
        >
          {lang === "ru" ? "скоро" : "em breve"}
        </span>
      </div>
    );
  }

  return (
    <Link to={it.to} className="app-nav" data-active={ativo}>
      <span className="app-nav-ic">
        <Icon size={18} />
      </span>
      <span className="flex-1">{label}</span>
      {it.badge && (
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: "var(--amber)", color: "var(--navy)" }}
        >
          {it.badge}
        </span>
      )}
    </Link>
  );
}

function RodapeSidebar({ email, onSair, sairLabel }: { email: string | null; onSair: () => void; sairLabel: string }) {
  return (
    <div className="border-t px-3 py-3" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      {email && (
        <p className="truncate px-2 pb-2 text-[11px]" style={{ color: "var(--sidebar-ink)" }}>
          {email}
        </p>
      )}
      <button type="button" onClick={onSair} className="app-nav w-full" style={{ color: "var(--sidebar-ink)" }}>
        <span className="app-nav-ic">
          <LogOut size={18} />
        </span>
        <span className="flex-1 text-left">{sairLabel}</span>
      </button>
    </div>
  );
}

function PilulaIdioma({ lang, setLang }: { lang: "pt" | "ru"; setLang: (l: "pt" | "ru") => void }) {
  return (
    <div
      className="inline-flex overflow-hidden rounded-full border"
      style={{ borderColor: "var(--app-line)" }}
    >
      {(["pt", "ru"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className="px-2.5 py-1 text-xs font-semibold transition-colors"
          style={
            lang === l
              ? { background: "var(--amber)", color: "var(--navy)" }
              : { background: "transparent", color: "var(--app-muted)" }
          }
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
