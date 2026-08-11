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

  // Já logado → vai pra home.
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
      else if (r.confirmar) setMsg(tx("Cadastro criado. Confirme pelo e-mail para entrar.", "Аккаунт создан. Подтвердите по почте."));
      else router.invalidate();
    }
    setEnviando(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--app-bg,#eef1f6)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded font-black" style={{ background: AMBER, color: NAVY }}>
            G41
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: NAVY }}>Masor</h1>
            <p className="text-[11px]" style={{ color: "#8892A4" }}>{tx("Inteligência Tributária", "Налоговый интеллект")}</p>
          </div>
        </div>

        <form onSubmit={submit} className="grid gap-3 rounded-2xl border bg-white p-6" style={{ borderColor: "var(--border,#e2e8f0)" }}>
          <div className="mb-1 inline-flex self-center overflow-hidden rounded-full border" style={{ borderColor: "var(--border,#e2e8f0)" }}>
            {(["login", "cadastro"] as const).map((m) => (
              <button key={m} type="button" onClick={() => setModo(m)} className="px-4 py-1 text-xs font-semibold"
                style={modo === m ? { background: NAVY, color: "#fff" } : { background: "#fff", color: NAVY }}>
                {m === "login" ? tx("Entrar", "Вход") : tx("Criar conta", "Регистрация")}
              </button>
            ))}
          </div>

          {modo === "cadastro" && (
            <Campo label={tx("Nome", "Имя")}>
              <input value={nome} onChange={(e) => setNome(e.target.value)} required className="input" />
            </Campo>
          )}
          <Campo label="E-mail">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input" autoComplete="email" />
          </Campo>
          <Campo label={tx("Senha", "Пароль")}>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} className="input" autoComplete={modo === "login" ? "current-password" : "new-password"} />
          </Campo>

          {erro && <p className="text-xs" style={{ color: "var(--warn,#b45309)" }}>⚠ {erro}</p>}
          {msg && <p className="text-xs" style={{ color: NAVY }}>{msg}</p>}

          <button type="submit" disabled={enviando} className="mt-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold disabled:opacity-50" style={{ background: AMBER, color: NAVY }}>
            {enviando && <Loader2 size={16} className="animate-spin" />}
            {modo === "login" ? tx("Entrar", "Войти") : tx("Criar conta", "Создать аккаунт")}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs" style={{ color: "#8892A4" }}>
          {(["pt", "ru"] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} className="font-semibold" style={{ color: lang === l ? NAVY : "#8892A4" }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <style>{`.input{width:100%;border:1px solid var(--border,#e2e8f0);border-radius:.5rem;padding:.5rem .75rem;font-size:.875rem;color:var(--navy);outline:none}.input:focus{border-color:var(--amber)}`}</style>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: NAVY }}>{label}</span>
      {children}
    </label>
  );
}
