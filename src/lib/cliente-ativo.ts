import { useEffect, useState } from "react";

/* ============================================================
   Masor — cliente ATIVO (a equipe escolhe qual cliente do Lior
   está analisando). Guardado em localStorage e compartilhado
   entre telas (consulta, importar, empresa, fiscal). Para um
   login-cliente do portal, o cliente vem do perfil e é fixo.
   ============================================================ */

const CHAVE = "masor-cliente-ativo";
const EVT = "masor-cliente-ativo-mudou";

export function getClienteAtivo(): string | null {
  try {
    return window.localStorage.getItem(CHAVE) || null;
  } catch {
    return null;
  }
}

export function setClienteAtivo(id: string | null) {
  try {
    if (id) window.localStorage.setItem(CHAVE, id);
    else window.localStorage.removeItem(CHAVE);
    window.dispatchEvent(new Event(EVT));
  } catch {
    /* ignore */
  }
}

/** Hook reativo do cliente ativo (atualiza quando muda em qualquer tela). */
export function useClienteAtivo(): [string | null, (id: string | null) => void] {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    setId(getClienteAtivo());
    const on = () => setId(getClienteAtivo());
    window.addEventListener(EVT, on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener(EVT, on);
      window.removeEventListener("storage", on);
    };
  }, []);
  return [id, setClienteAtivo];
}
