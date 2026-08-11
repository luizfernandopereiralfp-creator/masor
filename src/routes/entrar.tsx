import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/entrar")({
  component: Entrar,
});

const NAVY = "var(--navy)";
const AMBER = "var(--amber)";

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

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"
      style={{
        background:
          "radial-gradient(1200px 600px at 50% -10%, rgba(233,167,74,0.14), transparent 60%), linear-gradient(180deg, #f7f9fc 0%, #eef1f6 100%)",
      }}
    >
      {/* faixa decorativa navy no topo */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5" style={{ background: NAVY }} />

      <div className="w-full max-w-[400px]">
        {/* logo */}
        <div className="mb-7 flex flex-col items-center">
          <img src="/masor-logo.png" alt="Masor" className="h-12 w-auto" style={{ maxWidth: 200 }} />
          <p className="mt-3 text-[13px] font-medium tracking-wide" style={{ color: "#6b7488" }}>
            {tx("Inteligência tributária para supermercados", "Налоговый интеллект для супермаркетов")}
          </p>
        </div>

        {/* card */}
        <form
          onSubmit={submit}
          className="grid gap-4 rounded-3xl border bg-white p-7"
          style={{
            borderColor: "rgba(20,29,51,0.06)",
            boxShadow: "0 24px 60px -28px rgba(11,23,64,0.28), 0 8px 24px -16px rgba(11,23,64,0.12)",
          }}
        >
          {/* segmentado */}
          <div className="grid grid-cols-2 gap-1 rounded-xl p-1" style={{ background: "#f1f3f8" }}>
            {(["login", "cadastro"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setModo(m);
                  setErro(null);
                  setMsg(null);
                }}
                className="rounded-lg py-2 text-[13px] font-semibold transition-all"
                style={
                  modo === m
                    ? { background: "#fff", color: NAVY, boxShadow: "0 1px 3px rgba(11,23,64,0.12)" }
                    : { background: "transparent", color: "#8892A4" }
                }
              >
                {m === "login" ? tx("Entrar", "Вход") : tx("Criar conta", "Регистрация")}
              </button>
            ))}
          </div>

          {modo === "cadastro" && (
            <Campo label={tx("Nome", "Имя")}>
              <input value={nome} onChange={(e) => setNome(e.target.value)} required className="masor-input" placeholder={tx("Seu nome", "Ваше имя")} />
            </Campo>
          )}
          <Campo label="E-mail">
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

          {erro && (
            <div className="rounded-lg px-3 py-2 text-[13px]" style={{ background: "var(--amber-soft)", color: NAVY }}>
              ⚠ {erro}
            </div>
          )}
          {msg && (
            <div className="rounded-lg px-3 py-2 text-[13px]" style={{ background: "#eef2fb", color: NAVY }}>
              {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-transform active:scale-[0.99] disabled:opacity-60"
            style={{ background: NAVY }}
          >
            {enviando && <Loader2 size={16} className="animate-spin" />}
            {modo === "login" ? tx("Entrar", "Войти") : tx("Criar conta", "Создать аккаунт")}
          </button>
        </form>

        {/* rodapé */}
        <div className="mt-5 flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: AMBER }}>
            Insights Impulsionam
          </span>
          <div className="flex items-center gap-2 text-xs">
            {(["pt", "ru"] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)} className="font-bold" style={{ color: lang === l ? NAVY : "#b3b9c6" }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .masor-input{width:100%;border:1px solid #e3e7ef;border-radius:.7rem;padding:.6rem .8rem;font-size:.9rem;color:var(--navy);outline:none;transition:border-color .15s, box-shadow .15s;background:#fff}
        .masor-input::placeholder{color:#aab0be}
        .masor-input:focus{border-color:var(--amber);box-shadow:0 0 0 3px rgba(233,167,74,0.18)}
      `}</style>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#6b7488" }}>{label}</span>
      {children}
    </label>
  );
}
