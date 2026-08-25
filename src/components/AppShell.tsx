import { type ReactNode, useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Package,
  PackageSearch,
  Search,
  Upload,
  ShieldCheck,
  Building2,
  History,
  ClipboardList,
  Settings2,
  Calculator,
  FileSpreadsheet,
  BookOpen,
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
import { SeletorEmpresa } from "@/components/SeletorEmpresa";

/* ============================================================
   Masor — App Shell (padrão Lior)
   Rail navy estreito (ícone + micro-rótulo, logo do Masor no topo)
   para trocar de TELA + topbar com SELETOR DE EMPRESA global
   (persiste entre telas), idioma, avatar e Sair. Cabeçalho de tela
   com overline + título. Rótulos bilíngues locais (pt/ru).
   ============================================================ */

type NavItem = {
  to: string;
  icon: LucideIcon;
  pt: string;
  ru: string;
  ptMicro?: string; // micro-rótulo do rail (curto)
  ruMicro?: string;
};

const NAV_STAFF: NavItem[] = [
  { to: "/", icon: Home, pt: "Início", ru: "Главная" },
  { to: "/produtos", icon: Package, pt: "Produtos & Estoque", ru: "Товары и склад", ptMicro: "Produtos", ruMicro: "Товары" },
  { to: "/consulta", icon: PackageSearch, pt: "Consulta", ru: "Проверка" },
  { to: "/ncm", icon: Search, pt: "Buscar NCM", ru: "Поиск NCM", ptMicro: "NCM", ruMicro: "NCM" },
  { to: "/importar", icon: Upload, pt: "Importar", ru: "Импорт" },
  { to: "/fiscal", icon: ShieldCheck, pt: "SEFAZ", ru: "SEFAZ" },
  { to: "/empresa", icon: Building2, pt: "Empresa", ru: "Компания" },
  { to: "/historico", icon: History, pt: "Histórico", ru: "История" },
  { to: "/relatorios", icon: FileSpreadsheet, pt: "Relatórios", ru: "Отчёты" },
  { to: "/pendencias", icon: ClipboardList, pt: "Pendências", ru: "Очередь" },
  { to: "/admin", icon: Settings2, pt: "Admin", ru: "Админ" },
  { to: "/apuracao", icon: Calculator, pt: "Apuração", ru: "Расчёт" },
  { to: "/manual", icon: BookOpen, pt: "Manual", ru: "Руководство" },
];

const NAV_CLIENTE: NavItem[] = [
  { to: "/portal", icon: Home, pt: "Início", ru: "Главная" },
  { to: "/produtos", icon: Package, pt: "Meus produtos", ru: "Мои товары", ptMicro: "Produtos", ruMicro: "Товары" },
  { to: "/consulta", icon: PackageSearch, pt: "Analisar", ru: "Анализ" },
  { to: "/ncm", icon: Search, pt: "Buscar NCM", ru: "Поиск NCM", ptMicro: "NCM", ruMicro: "NCM" },
  { to: "/importar", icon: Upload, pt: "Importar", ru: "Импорт" },
  { to: "/manual", icon: BookOpen, pt: "Manual", ru: "Руководство" },
];

const micro = (it: NavItem, lang: "pt" | "ru") => (lang === "ru" ? it.ruMicro ?? it.ru : it.ptMicro ?? it.pt);

/** Título da tela atual a partir do path. */
function tituloDaRota(path: string, lang: "pt" | "ru", itens: NavItem[]): string {
  const hit = itens.find((i) => i.to !== "/" && path.startsWith(i.to));
  if (hit) return lang === "ru" ? hit.ru : hit.pt;
  return lang === "ru" ? "Главная" : "Início";
}

const iniciais = (nome: string) =>
  nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";

export function AppShell({ children }: { children: ReactNode }) {
  const { lang, setLang, t } = useI18n();
  const { user, perfil, sair } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [menuAberto, setMenuAberto] = useState(false);
  const [tema, setTema] = useState<"light" | "dark">("light");

  useEffect(() => {
    const salvo = (typeof localStorage !== "undefined" ? localStorage.getItem("masor-tema") : null) as "light" | "dark" | null;
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
  const nomeUsuario = perfil?.nome || user?.email || "";
  const papel = cliente ? tx(lang, "Cliente", "Клиент") : perfil?.role === "admin" ? "Administrador" : "Equipe";

  return (
    <div className="min-h-screen" style={{ background: "var(--app-bg)" }}>
      {/* Rail navy estreito (desktop) */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-[84px] flex-col md:flex"
        style={{ background: "var(--sidebar, var(--navy))" }}
      >
        <MarcaRail />
        <nav className="app-scroll flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {itens.map((it) => (
            <ItemRail key={it.to} it={it} path={path} lang={lang} />
          ))}
        </nav>
      </aside>

      {/* Drawer mobile (com rótulos completos) */}
      {menuAberto && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuAberto(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[260px] flex-col" style={{ background: "var(--sidebar, var(--navy))" }}>
            <div className="flex items-center justify-between px-4 pt-4">
              <MarcaWordmark />
              <button type="button" onClick={() => setMenuAberto(false)} className="p-2 text-white/70">
                <X size={20} />
              </button>
            </div>
            <nav className="app-scroll flex-1 space-y-1 overflow-y-auto px-3 py-4" onClick={() => setMenuAberto(false)}>
              {itens.map((it) => (
                <ItemDrawer key={it.to} it={it} path={path} lang={lang} />
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Coluna de conteúdo */}
      <div className="md:pl-[84px]">
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

          {/* Cabeçalho de tela (overline + título) */}
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--app-faint)" }}>
              {tx(lang, "Auditor tributário", "Налоговый аудитор")}
            </div>
            <h1 className="-mt-0.5 truncate text-base font-bold md:text-lg" style={{ color: "var(--app-ink)", fontFamily: "var(--font-display)" }}>
              {titulo}
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            {!cliente && <div className="hidden sm:block"><SeletorEmpresa /></div>}
            <PilulaIdioma lang={lang} setLang={setLang} />
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

            {/* Usuário + avatar */}
            <div className="hidden items-center gap-2 lg:flex">
              <div className="text-right leading-tight">
                <div className="max-w-[150px] truncate text-xs font-semibold" style={{ color: "var(--app-ink)" }}>{nomeUsuario}</div>
                <div className="text-[10px]" style={{ color: "var(--app-muted)" }}>{papel}</div>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-full text-xs font-bold" style={{ background: "var(--navy)", color: "var(--bulb)" }}>
                {iniciais(nomeUsuario)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => sair()}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors"
              style={{ background: "var(--app-bg2)", color: "var(--app-ink)", border: "1px solid var(--app-line)" }}
              title={t("nav.sair")}
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">{t("nav.sair")}</span>
            </button>
          </div>
        </header>

        {/* Seletor de empresa no mobile (abaixo da topbar) */}
        {!cliente && (
          <div className="border-b px-4 py-2 sm:hidden" style={{ background: "var(--card)", borderColor: "var(--app-line)" }}>
            <SeletorEmpresa />
          </div>
        )}

        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>

      {path !== "/consulta" && <ChatDock contexto={{ rota: path }} onDiretriz={() => {}} idioma={lang} />}
    </div>
  );
}

/** helper local de tradução por idioma */
function tx(lang: "pt" | "ru", pt: string, ru: string) {
  return lang === "ru" ? ru : pt;
}

/** Logo do Masor no topo do rail (isótipo âmbar). */
function MarcaRail() {
  return (
    <Link to="/" className="flex items-center justify-center py-4" title="Masor">
      <img src="/globe.png" alt="Masor" style={{ height: 34, width: "auto" }} />
    </Link>
  );
}

/** Wordmark completo (drawer mobile). */
function MarcaWordmark() {
  return (
    <span className="flex items-center font-extrabold text-white" style={{ gap: 1, fontSize: 24, letterSpacing: "-.02em" }} aria-label="Masor">
      Mas
      <img src="/globe.png" alt="o" style={{ height: "0.92em", transform: "translateY(0.12em)", margin: "0 -.01em" }} />
      r
    </span>
  );
}

/** Item do rail vertical: ícone + micro-rótulo. Ativo = acento âmbar. */
function ItemRail({ it, path, lang }: { it: NavItem; path: string; lang: "pt" | "ru" }) {
  const Icon = it.icon;
  const ativo = it.to === "/" ? path === "/" : path.startsWith(it.to);
  return (
    <Link
      to={it.to}
      className="relative flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-center transition"
      style={{ background: ativo ? "var(--nav-active)" : "transparent" }}
      title={lang === "ru" ? it.ru : it.pt}
    >
      {ativo && <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r" style={{ background: "var(--amber)" }} />}
      <Icon size={20} style={{ color: ativo ? "var(--amber)" : "var(--sidebar-ink)" }} />
      <span className="text-[9.5px] font-semibold leading-tight" style={{ color: ativo ? "#fff" : "var(--sidebar-ink)" }}>
        {micro(it, lang)}
      </span>
    </Link>
  );
}

/** Item do drawer mobile: ícone + rótulo completo. */
function ItemDrawer({ it, path, lang }: { it: NavItem; path: string; lang: "pt" | "ru" }) {
  const Icon = it.icon;
  const label = lang === "ru" ? it.ru : it.pt;
  const ativo = it.to === "/" ? path === "/" : path.startsWith(it.to);
  return (
    <Link to={it.to} className="app-nav" data-active={ativo}>
      <span className="app-nav-ic">
        <Icon size={18} />
      </span>
      <span className="flex-1">{label}</span>
    </Link>
  );
}

function PilulaIdioma({ lang, setLang }: { lang: "pt" | "ru"; setLang: (l: "pt" | "ru") => void }) {
  return (
    <div className="inline-flex overflow-hidden rounded-full border" style={{ borderColor: "var(--app-line)" }}>
      {(["pt", "ru"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className="px-2.5 py-1 text-xs font-semibold transition-colors"
          style={lang === l ? { background: "var(--amber)", color: "var(--navy)" } : { background: "transparent", color: "var(--app-muted)" }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
