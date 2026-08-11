import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/* ============================================================
   g41Tax — internacionalização PT / RU
   Sistema bilíngue: a Svetofor (Светофор) opera em russo; a
   conformidade fiscal é brasileira (português). Toda a interface
   existe nos dois idiomas. Chaves planas, fáceis de estender.
   ============================================================ */

export type Lang = "pt" | "ru";

const STORAGE_KEY = "g41tax-lang";

type Dict = Record<string, string>;

const pt: Dict = {
  "app.name": "Masor",
  "app.tagline": "Inteligência Tributária · Insights Impulsionam",
  "lang.pt": "Português",
  "lang.ru": "Русский",
  "lang.switch": "Idioma",
  "nav.sair": "Sair",

  "home.title": "Inteligência tributária para o seu supermercado",
  "home.subtitle":
    "Descubra o custo real, os impostos e o preço mínimo de venda de cada produto — com a legislação vigente pesquisada e a fonte de cada resposta.",
  "home.consulta.title": "Analisar um produto",
  "home.consulta.desc":
    "Responda algumas perguntas simples e receba o cálculo completo com a explicação de cada valor.",
  "home.consulta.cta": "Começar análise",
  "home.importar.title": "Importar em lote",
  "home.importar.desc":
    "Envie uma nota fiscal (XML ou PDF) ou uma planilha de produtos. O sistema analisa e critica linha por linha.",
  "home.importar.cta": "Enviar arquivo",

  "home.trust.title": "Nada é inventado",
  "home.trust.desc":
    "Quando a lei de um ponto não é confirmada por uma fonte oficial, o resultado sai marcado como provisório e a equipe é avisada — nunca um chute.",

  "footer.note":
    "Simulação orientativa. As regras são pesquisadas na legislação vigente com fonte e data; pontos não confirmados ficam visíveis como pendência.",

  "notFound.title": "Página não encontrada",
  "notFound.desc": "O endereço acessado não existe ou foi movido.",
  "notFound.back": "Voltar ao início",
  "error.title": "Não foi possível carregar",
  "error.desc": "Algo deu errado. Tente novamente ou volte ao início.",
  "error.retry": "Tentar novamente",
  "error.home": "Início",
};

const ru: Dict = {
  "app.name": "Masor",
  "app.tagline": "Налоговый интеллект · Insights Impulsionam",
  "lang.pt": "Português",
  "lang.ru": "Русский",
  "lang.switch": "Язык",
  "nav.sair": "Выход",

  "home.title": "Налоговый интеллект для вашего супермаркета",
  "home.subtitle":
    "Узнайте реальную себестоимость, налоги и минимальную цену продажи каждого товара — на основе действующего законодательства с указанием источника каждого ответа.",
  "home.consulta.title": "Анализ товара",
  "home.consulta.desc":
    "Ответьте на несколько простых вопросов и получите полный расчёт с пояснением каждого значения.",
  "home.consulta.cta": "Начать анализ",
  "home.importar.title": "Массовый импорт",
  "home.importar.desc":
    "Загрузите налоговую накладную (XML или PDF) или таблицу товаров. Система проверит и оценит каждую строку.",
  "home.importar.cta": "Загрузить файл",

  "home.trust.title": "Ничего не выдумывается",
  "home.trust.desc":
    "Если норма не подтверждена официальным источником, результат помечается как предварительный, и команда получает уведомление — никаких догадок.",

  "footer.note":
    "Ориентировочный расчёт. Нормы берутся из действующего законодательства с источником и датой; неподтверждённые пункты отображаются как ожидающие проверки.",

  "notFound.title": "Страница не найдена",
  "notFound.desc": "Запрошенный адрес не существует или был перемещён.",
  "notFound.back": "На главную",
  "error.title": "Не удалось загрузить",
  "error.desc": "Что-то пошло не так. Повторите попытку или вернитесь на главную.",
  "error.retry": "Повторить",
  "error.home": "Главная",
};

const DICTS: Record<Lang, Dict> = { pt, ru };

type I18nValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");

  // Hidrata do localStorage após o mount (evita mismatch de SSR).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "pt" || saved === "ru") setLangState(saved);
    } catch {
      /* localStorage indisponível */
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") document.documentElement.lang = l === "ru" ? "ru" : "pt-BR";
  }, []);

  const t = useCallback(
    (key: string) => DICTS[lang][key] ?? DICTS.pt[key] ?? key,
    [lang],
  );

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n precisa estar dentro de <I18nProvider>");
  return ctx;
}
