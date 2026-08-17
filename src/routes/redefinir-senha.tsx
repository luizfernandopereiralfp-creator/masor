import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, KeyRound } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/redefinir-senha")({
  component: Redefinir,
});

const NAVY = "var(--navy)";

/**
 * Destino do link "Esqueci a senha" enviado por e-mail. O Supabase
 * (detectSessionInUrl) processa o token de recuperação e cria uma sessão
 * temporária; aqui o usuário define a nova senha via updateUser.
 */
function Redefinir() {
  const { lang, setLang } = useI18n();
  const tx = (pt: string, ru: string) => (lang === "ru" ? ru : pt);
  const navigate = useNavigate();

  const [prontoRecovery, setProntoRecovery] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    // Se o token de recuperação já virou sessão, libera o formulário.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setProntoRecovery(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((evento, sessao) => {
      if (evento === "PASSWORD_RECOVERY" || (evento === "SIGNED_IN" && sessao)) setProntoRecovery(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senha.length < 6) return setErro(tx("A senha precisa ter ao menos 6 caracteres.", "Пароль должен быть не менее 6 символов."));
    if (senha !== confirmar) return setErro(tx("As senhas não coincidem.", "Пароли не совпадают."));
    if (!supabase) return setErro("Supabase indisponível.");
    setEnviando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setEnviando(false);
    if (error) return setErro(error.message);
    setOk(true);
    setTimeout(() => navigate({ to: "/" }), 1200);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6" style={{ background: "var(--app-bg)" }}>
      <div className="absolute right-6 top-6">
        <div className="flex overflow-hidden rounded-full border text-xs font-semibold" style={{ borderColor: "var(--app-line)" }}>
          {(["pt", "ru"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className="px-3 py-1.5"
              style={lang === l ? { background: NAVY, color: "#fff" } : { background: "var(--card)", color: "var(--app-muted)" }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="app-card w-full p-7" style={{ maxWidth: 400 }}>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "var(--navy)", color: "var(--amber)" }}>
          <KeyRound size={20} />
        </span>
        <h1 className="mt-4 text-xl font-bold" style={{ color: "var(--app-ink)", fontFamily: "var(--font-display)" }}>
          {tx("Definir nova senha", "Задать новый пароль")}
        </h1>

        {ok ? (
          <p className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: "var(--successbg)", color: "var(--success)" }}>
            {tx("Senha atualizada! Entrando…", "Пароль обновлён! Входим…")}
          </p>
        ) : !prontoRecovery ? (
          <>
            <p className="mt-2 text-sm" style={{ color: "var(--app-muted)" }}>
              {tx(
                "Abra esta página pelo link que enviamos ao seu e-mail. Se você chegou aqui direto, volte e solicite o link novamente.",
                "Откройте эту страницу по ссылке из письма. Если вы попали сюда напрямую, запросите ссылку заново.",
              )}
            </p>
            <Link to="/entrar" className="mt-4 inline-block text-sm font-semibold" style={{ color: NAVY }}>
              {tx("← Voltar ao login", "← Назад ко входу")}
            </Link>
          </>
        ) : (
          <form onSubmit={submit} className="mt-4 grid gap-3">
            <p className="text-sm" style={{ color: "var(--app-muted)" }}>
              {tx("Escolha uma nova senha para sua conta.", "Выберите новый пароль для вашего аккаунта.")}
            </p>
            <label className="grid gap-1.5">
              <span className="text-[13px] font-semibold" style={{ color: "var(--app-ink)" }}>{tx("Nova senha", "Новый пароль")}</span>
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} className="ds-input" placeholder="••••••••" autoComplete="new-password" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[13px] font-semibold" style={{ color: "var(--app-ink)" }}>{tx("Confirmar senha", "Подтвердите пароль")}</span>
              <input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} required minLength={6} className="ds-input" placeholder="••••••••" autoComplete="new-password" />
            </label>
            {erro && (
              <div className="rounded-lg px-3 py-2 text-[13px]" style={{ background: "var(--amber-soft)", color: NAVY }}>⚠ {erro}</div>
            )}
            <button
              type="submit"
              disabled={enviando}
              className="mt-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60"
              style={{ background: NAVY, boxShadow: "var(--shadow-app)" }}
            >
              {enviando && <Loader2 size={16} className="animate-spin" />}
              {tx("Salvar nova senha", "Сохранить пароль")}
            </button>
          </form>
        )}
      </div>

      <style>{`
        .ds-input{width:100%;border:1px solid var(--app-line);border-radius:12px;padding:.75rem .875rem;font-size:.9rem;color:var(--app-ink);outline:none;transition:border-color .15s, box-shadow .15s;background:var(--app-bg2)}
        .ds-input::placeholder{color:var(--app-faint)}
        .ds-input:focus{border-color:var(--amber);box-shadow:0 0 0 3px rgba(233,167,74,0.18)}
      `}</style>
    </div>
  );
}
