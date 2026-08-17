import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Check, ShieldCheck } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/entrar")({
  component: Entrar,
});

const NAVY = "var(--navy)";

function Entrar() {
  const { lang, setLang } = useI18n();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);
  const { session, carregando, entrar, cadastrar } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();

  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!carregando && session) navigate({ to: "/" });
  }, [carregando, session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setMsg(null);
    setEnviando(true);
    if (modo === "login") {
      const r = await entrar(email, senha);
      if (r.erro) setErro(r.erro);
      else router.invalidate();
    } else {
      const r = await cadastrar(email, senha, nome);
      if (r.erro) setErro(r.erro);
      else if (r.confirmar)
        setMsg(tx("Conta criada! Confirme pelo e-mail para entrar.", "Аккаунт создан! Подтвердите по почте."));
      else router.invalidate();
    }
    setEnviando(false);
  }

  async function esqueciSenha() {
    setErro(null);
    setMsg(null);
    if (!email.trim()) {
      setErro(tx("Digite seu e-mail acima para receber o link de redefinição.", "Введите e-mail выше, чтобы получить ссылку для сброса."));
      return;
    }
    if (!supabase) return setErro("Supabase indisponível.");
    setEnviando(true);
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/redefinir-senha` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    setEnviando(false);
    if (error) setErro(error.message);
    else setMsg(tx("Enviamos um link de redefinição para o seu e-mail.", "Мы отправили ссылку для сброса на вашу почту."));
  }

  return (
    <div className="grid min-h-screen md:grid-cols-[1.05fr_.95fr]">
      {/* Painel de marca (esquerda) — some no mobile */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden p-14 md:flex"
        style={{ background: NAVY }}
      >
        <div
          className="pointer-events-none absolute"
          style={{
            right: -120,
            top: -80,
            width: 460,
            height: 460,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, rgba(233,167,74,.22), transparent 62%)",
          }}
        />
        <Wordmark />
        <div className="relative z-[1]">
          <div
            className="text-xs font-semibold uppercase"
            style={{ letterSpacing: ".26em", color: "var(--amber)" }}
          >
            {tx("Inteligência tributária", "Налоговая аналитика")}
          </div>
          <h1
            className="mt-4 font-extrabold text-white"
            style={{ fontSize: 42, lineHeight: 1.08, letterSpacing: "-.02em", maxWidth: "14ch", fontFamily: "var(--font-display)" }}
          >
            {tx("O preço certo de cada produto, com a fonte ao lado.", "Правильная цена каждого товара — с указанием источника.")}
          </h1>
          <p className="mt-4" style={{ color: "#C7CEDE", fontSize: 15.5, lineHeight: 1.6, maxWidth: "40ch" }}>
            {tx(
              "Custo real, impostos e preço mínimo de venda — considerando a legislação vigente e a Reforma Tributária. Cada número com sua norma oficial.",
              "Реальная себестоимость, налоги и минимальная цена продажи — с учётом действующего законодательства и налоговой реформы. Каждая цифра со ссылкой на норму.",
            )}
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Pill icon={<Check size={14} />}>{tx("Anti-invenção", "Без выдумок")}</Pill>
            <Pill icon={<ShieldCheck size={14} />}>{tx("Auditável", "Проверяемо")}</Pill>
          </div>
        </div>
        <div
          className="relative z-[1] uppercase"
          style={{ color: "#7d88a8", fontSize: 11.5, letterSpacing: ".14em" }}
        >
          G41 Inteligência Contábil · masor.g41one.com.br
        </div>
      </aside>

      {/* Formulário (direita) */}
      <div className="relative flex items-center justify-center p-6 md:p-10" style={{ background: "var(--card)" }}>
        {/* seletor de idioma */}
        <div className="absolute right-6 top-6 md:right-8 md:top-8">
          <div
            className="flex overflow-hidden rounded-full border text-xs font-semibold"
            style={{ borderColor: "var(--app-line)" }}
          >
            {(["pt", "ru"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className="px-3 py-1.5"
                style={lang === l ? { background: NAVY, color: "#fff" } : { background: "transparent", color: "var(--app-muted)" }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="w-full" style={{ maxWidth: 380 }}>
          {/* logo compacto só no mobile */}
          <img src="/masor-logo.png" alt="Masor" className="mb-6 h-9 w-auto md:hidden" />

          <h2 className="text-[26px] font-bold" style={{ letterSpacing: "-.01em", color: "var(--app-ink)", fontFamily: "var(--font-display)" }}>
            {modo === "login" ? tx("Entrar", "Вход") : tx("Criar conta", "Регистрация")}
          </h2>
          <p className="mb-7 mt-2 text-sm" style={{ color: "var(--app-muted)" }}>
            {modo === "login"
              ? tx("Acesse o painel da sua conta.", "Войдите в панель вашего аккаунта.")
              : tx("Crie seu acesso ao Masor.", "Создайте доступ к Masor.")}
          </p>

          {modo === "cadastro" && (
            <Campo label={tx("Nome", "Имя")}>
              <input value={nome} onChange={(e) => setNome(e.target.value)} required className="masor-input" placeholder={tx("Seu nome", "Ваше имя")} />
            </Campo>
          )}
          <Campo label={tx("E-mail", "Эл. почта")}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="masor-input" placeholder="voce@empresa.com.br" autoComplete="email" />
          </Campo>
          <Campo label={tx("Senha", "Пароль")}>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
              className="masor-input"
              placeholder="••••••••"
              autoComplete={modo === "login" ? "current-password" : "new-password"}
            />
          </Campo>

          {modo === "login" && (
            <div className="mb-4 text-right">
              <button type="button" onClick={esqueciSenha} disabled={enviando} className="text-[13px] font-semibold disabled:opacity-60" style={{ color: NAVY }}>
                {tx("Esqueci a senha", "Забыли пароль")}
              </button>
            </div>
          )}

          {erro && (
            <div className="mb-3 rounded-lg px-3 py-2 text-[13px]" style={{ background: "var(--amber-soft)", color: NAVY }}>
              ⚠ {erro}
            </div>
          )}
          {msg && (
            <div className="mb-3 rounded-lg px-3 py-2 text-[13px]" style={{ background: "var(--infobg)", color: NAVY }}>
              {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-transform active:scale-[0.99] disabled:opacity-60"
            style={{ background: NAVY, boxShadow: "var(--shadow-app)" }}
          >
            {enviando && <Loader2 size={16} className="animate-spin" />}
            {modo === "login" ? tx("Entrar", "Войти") : tx("Criar conta", "Создать аккаунт")}
          </button>

          <div className="mt-5 text-center text-[13px]" style={{ color: "var(--app-muted)" }}>
            {modo === "login" ? (
              <>
                {tx("Não tem acesso?", "Нет доступа?")}{" "}
                <button type="button" onClick={() => { setModo("cadastro"); setErro(null); setMsg(null); }} className="font-semibold" style={{ color: NAVY }}>
                  {tx("Criar conta", "Регистрация")}
                </button>
              </>
            ) : (
              <>
                {tx("Já tem conta?", "Уже есть аккаунт?")}{" "}
                <button type="button" onClick={() => { setModo("login"); setErro(null); setMsg(null); }} className="font-semibold" style={{ color: NAVY }}>
                  {tx("Entrar", "Войти")}
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      <style>{`
        .masor-input{width:100%;border:1px solid var(--app-line);border-radius:12px;padding:.75rem .875rem;font-size:.9rem;color:var(--app-ink);outline:none;transition:border-color .15s, box-shadow .15s;background:var(--app-bg2);margin-bottom:1.125rem}
        .masor-input::placeholder{color:var(--app-faint)}
        .masor-input:focus{border-color:var(--amber);box-shadow:0 0 0 3px rgba(233,167,74,0.18)}
      `}</style>
    </div>
  );
}

function Wordmark() {
  return (
    <div
      className="relative z-[1] flex items-center font-extrabold text-white"
      style={{ gap: 2, fontSize: 30, letterSpacing: "-.02em" }}
    >
      Mas
      <img src="/globe.png" alt="o" style={{ height: "0.92em", transform: "translateY(0.12em)", margin: "0 -.01em" }} />
      r
    </div>
  );
}

function Pill({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] font-medium"
      style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", color: "#DCE3F2" }}
    >
      <span style={{ color: "var(--amber)" }}>{icon}</span>
      {children}
    </span>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold" style={{ color: "var(--app-ink)" }}>{label}</span>
      {children}
    </label>
  );
}
