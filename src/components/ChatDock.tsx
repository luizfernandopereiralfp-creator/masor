import { useEffect, useRef, useState } from "react";
import { X, Send, Loader2, Sparkles } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { DiretrizView } from "@/lib/ia/apresentacao";

/* ============================================================
   Masor — caixa de IA sempre disponível.
   - Aplica comandos de APRESENTAÇÃO na hora (offline), ex.:
     "deixa mais enxuto", "mostra a base legal", "exporta planilha".
   - Perguntas livres vão para /api/chat (n8n).
   - Mudanças na base fiscal viram PROPOSTA -> aprovação (/pendencias).
     O alvo é VALIDADO antes de gravar (nada de blob arbitrário do LLM).
   ============================================================ */

const NAVY = "var(--navy)";
const AMBER = "var(--amber)";

/** Alvos aceitos: tax_states:UF | ncm_rules:NCM(8) [:UF]. */
const ALVO_VALIDO = /^(tax_states:[A-Z]{2}|ncm_rules:\d{8}(:[A-Z]{2})?)$/;

type Msg = { papel: "user" | "assistant"; texto: string };

type Eco = [pt: string, ru: string];
type IntentResult =
  | { tipo: "view"; diretriz: DiretrizView; eco: Eco }
  | { tipo: "export" }
  | null;

const CHIPS_LOCAIS: { pt: string; ru: string; diretriz: DiretrizView }[] = [
  { pt: "Mais enxuto", ru: "Кратко", diretriz: { densidade: "enxuto", leigo: true, fechar: "todas" } },
  { pt: "Ver tudo", ru: "Показать всё", diretriz: { densidade: "completo", abrir: "todas" } },
  { pt: "Base legal", ru: "Правовая база", diretriz: { abrir: ["fundamentacao", "fontes"] } },
  { pt: "Memória", ru: "Расчёт", diretriz: { abrir: ["memoria"] } },
];

/** Interpreta comandos de apresentação sem gastar IA. */
function intentLocal(texto: string): IntentResult {
  const t = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  if (/export|planilha|excel|baixar|download|xlsx/.test(t)) return { tipo: "export" };
  if (/(mais )?(enxut|resum|curt|simplific|menos deta)/.test(t))
    return { tipo: "view", diretriz: { densidade: "enxuto", leigo: true, fechar: "todas" }, eco: ["Deixei o relatório mais enxuto.", "Сделал отчёт короче."] };
  if (/(ver|mostrar?) tudo|completo|expandir|todos os detalh|detalhad/.test(t))
    return { tipo: "view", diretriz: { densidade: "completo", abrir: "todas" }, eco: ["Abri o relatório completo.", "Открыл полный отчёт."] };
  if (/t[eé]cnic/.test(t)) return { tipo: "view", diretriz: { leigo: false }, eco: ["Modo técnico ativado.", "Технический режим включён."] };
  if (/(simpl|leig|f[aá]cil|explica|como se|para (um )?leig)/.test(t))
    return { tipo: "view", diretriz: { leigo: true }, eco: ["Explicando de forma simples.", "Объясняю простыми словами."] };
  if (/(base )?legal|lei\b|norma|fundament|artigo/.test(t))
    return { tipo: "view", diretriz: { abrir: ["fundamentacao", "fontes"] }, eco: ["Mostrei a fundamentação legal e as fontes.", "Показал правовую базу и источники."] };
  if (/mem[oó]ria|c[aá]lculo|as contas|memoria/.test(t))
    return { tipo: "view", diretriz: { abrir: ["memoria"] }, eco: ["Abri a memória de cálculo.", "Открыл расчёт."] };
  if (/reforma|ibs|cbs|iva/.test(t))
    return { tipo: "view", diretriz: { abrir: ["reforma", "cenarios"] }, eco: ["Mostrei os impactos da Reforma e os cenários.", "Показал влияние реформы и сценарии."] };
  if (/fonte/.test(t)) return { tipo: "view", diretriz: { abrir: ["fontes"] }, eco: ["Mostrei as fontes oficiais.", "Показал официальные источники."] };
  if (/risco|aten[cç][aã]o/.test(t))
    return { tipo: "view", diretriz: { abrir: ["riscos"] }, eco: ["Mostrei os riscos e pontos de atenção.", "Показал риски."] };
  return null;
}

export function ChatDock({
  contexto,
  onDiretriz,
  onExport,
  idioma = "pt",
}: {
  contexto: Record<string, unknown>;
  onDiretriz: (d: DiretrizView) => void;
  onExport?: () => void;
  idioma?: "pt" | "ru";
}) {
  const { perfil } = useAuth();
  const tx = (pt: string, ru: string) => (idioma === "ru" ? ru : pt);
  const [aberto, setAberto] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, aberto]);

  const responder = (texto: string) => setMsgs((m) => [...m, { papel: "assistant", texto }]);

  function dispararDiretriz(d: DiretrizView, eco: string) {
    onDiretriz(d);
    responder(eco);
  }

  async function enviar(txt: string) {
    const mensagem = txt.trim();
    if (!mensagem || enviando) return;
    setTexto("");
    setMsgs((m) => [...m, { papel: "user", texto: mensagem }]);

    // 1) tenta resolver localmente (apresentação/exportação) — sem gastar IA
    const intent = intentLocal(mensagem);
    if (intent?.tipo === "export") {
      if (onExport) {
        onExport();
        responder(tx("Gerando a planilha…", "Создаю таблицу…"));
      } else {
        responder(tx("A exportação só está disponível quando há uma análise na tela.", "Экспорт доступен только при наличии анализа."));
      }
      return;
    }
    if (intent?.tipo === "view") {
      dispararDiretriz(intent.diretriz, tx(intent.eco[0], intent.eco[1]));
      return;
    }

    // 2) pergunta livre -> IA (n8n)
    setEnviando(true);
    try {
      const tok = supabase ? (await supabase.auth.getSession()).data.session?.access_token : null;
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json", ...(tok ? { authorization: `Bearer ${tok}` } : {}) },
        body: JSON.stringify({
          mensagem,
          historico: msgs.slice(-10).map((m) => ({ papel: m.papel, texto: m.texto })),
          contexto,
          idioma,
        }),
      });
      const data = await r.json();
      if (!r.ok || data.ok === false) {
        responder(tx("Não consegui responder agora: ", "Не удалось ответить: ") + (data.erro ?? r.status));
        return;
      }
      if (data.diretriz_view) onDiretriz(data.diretriz_view as DiretrizView);

      // proposta de mudança na base fiscal -> valida o alvo e enfileira p/ aprovação
      let enfileirada = false;
      const p = data.proposta as { alvo?: string; proposta?: unknown; justificativa?: string; fontes?: unknown } | null;
      if (p?.alvo && ALVO_VALIDO.test(p.alvo) && supabase && perfil?.tenant_id) {
        const { error } = await supabase.from("rule_change_requests").insert({
          tenant_id: perfil.tenant_id,
          proposto_por: perfil.user_id,
          alvo: p.alvo,
          proposta: p.proposta && typeof p.proposta === "object" ? p.proposta : {},
          justificativa: p.justificativa ?? mensagem,
          fontes: Array.isArray(p.fontes) ? p.fontes : [],
        });
        enfileirada = !error;
      }
      const sufixo = enfileirada
        ? tx(
            "\n\n📋 Registrei como proposta de mudança na base fiscal — vai para aprovação do administrador em Pendências.",
            "\n\n📋 Отправил как предложение об изменении базы — на одобрение администратора.",
          )
        : "";
      responder((data.resposta ?? "—") + sufixo);
    } catch (e) {
      responder(tx("Não consegui responder agora: ", "Не удалось ответить: ") + (e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  if (!aberto)
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold shadow-lg"
        style={{ background: NAVY, color: "#fff" }}
      >
        <Sparkles size={16} style={{ color: AMBER }} />
        {tx("Falar com a IA", "Спросить ИИ")}
      </button>
    );

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl"
      style={{ borderColor: "var(--border,#e2e8f0)", height: "min(560px, calc(100vh - 3rem))" }}
    >
      <header className="flex items-center justify-between px-4 py-3" style={{ background: NAVY }}>
        <span className="flex items-center gap-2 text-sm font-bold text-white">
          <Sparkles size={15} style={{ color: AMBER }} /> {tx("IA Masor", "ИИ Masor")}
        </span>
        <button type="button" onClick={() => setAberto(false)} className="text-white/70 hover:text-white">
          <X size={17} />
        </button>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3" style={{ background: "#f7f8fb" }}>
        {msgs.length === 0 && (
          <div className="rounded-lg bg-white p-3 text-xs leading-relaxed" style={{ color: "#4a5568", border: "1px solid var(--border,#e2e8f0)" }}>
            {tx(
              "Pergunte sobre a análise, ou peça para mudar o relatório — ex.: “deixa mais enxuto”, “mostra a base legal”, “exporta planilha”.",
              "Спросите об анализе или измените вид отчёта — напр.: «короче», «покажи правовую базу», «экспорт».",
            )}
          </div>
        )}
        {msgs.map((m, i) => (
          <div
            key={i}
            className="max-w-[90%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-xs leading-relaxed"
            style={
              m.papel === "user"
                ? { marginLeft: "auto", background: NAVY, color: "#fff" }
                : { background: "#fff", color: NAVY, border: "1px solid var(--border,#e2e8f0)" }
            }
          >
            {m.texto}
          </div>
        ))}
        {enviando && (
          <div className="flex items-center gap-2 text-xs" style={{ color: "#8892A4" }}>
            <Loader2 size={13} className="animate-spin" /> {tx("pensando…", "думаю…")}
          </div>
        )}
        <div ref={fimRef} />
      </div>

      {/* chips de apresentação */}
      <div className="flex flex-wrap gap-1.5 border-t px-3 py-2" style={{ borderColor: "var(--border,#e2e8f0)" }}>
        {CHIPS_LOCAIS.map((c) => (
          <button
            key={c.pt}
            type="button"
            onClick={() => dispararDiretriz(c.diretriz, `✓ ${tx(c.pt, c.ru)}`)}
            className="rounded-full border px-2.5 py-1 text-[11px] font-semibold"
            style={{ borderColor: "var(--border,#e2e8f0)", color: NAVY }}
          >
            {tx(c.pt, c.ru)}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t px-3 py-2" style={{ borderColor: "var(--border,#e2e8f0)" }}>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviar(texto)}
          placeholder={tx("Escreva uma mensagem…", "Напишите сообщение…")}
          className="flex-1 rounded-full border px-3 py-2 text-xs outline-none"
          style={{ borderColor: "var(--border,#e2e8f0)", color: NAVY }}
        />
        <button
          type="button"
          onClick={() => enviar(texto)}
          disabled={enviando}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full disabled:opacity-50"
          style={{ background: AMBER, color: NAVY }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
