import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useClienteAtivo } from "@/lib/cliente-ativo";

/* ============================================================
   Masor — dados da empresa (agora = cliente do Lior).
   Identidade fiscal (razão social, CNPJ, regime, UF, município)
   vem de public.clientes (via a função segura masor_clientes_fiscais,
   que não expõe honorários). Config extra do Masor (markup, DAS)
   vem da satélite masor_cliente_config.
   Passe o clienteId ativo (staff escolhe); default = cliente do perfil.
   ============================================================ */

export type Empresa = {
  id: string;
  nome: string | null;
  razao_social: string | null;
  cnpj: string | null;
  uf: string | null;
  municipio: string | null;
  regime_tributario: string | null;
  markup_padrao: number | null;
  das_efetivo: number | null;
};

type ClienteFiscal = {
  id: string;
  razao_social: string | null;
  nome_fantasia: string | null;
  cnpj_cpf: string | null;
  regime_tributario: string | null;
  cnae_principal: string | null;
  endereco: Record<string, unknown> | null;
};

export type ClienteResumo = { id: string; razao_social: string | null; nome_fantasia: string | null; cnpj_cpf: string | null };

/** Lista de clientes (via função segura) para o seletor da equipe. */
export function useClientesFiscais() {
  const [clientes, setClientes] = useState<ClienteResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const recarregar = useCallback(async () => {
    if (!supabase) return setCarregando(false);
    setCarregando(true);
    const { data } = await supabase.rpc("masor_clientes_fiscais");
    const lista = (Array.isArray(data) ? data : []) as ClienteResumo[];
    lista.sort((a, b) => (a.razao_social ?? "").localeCompare(b.razao_social ?? ""));
    setClientes(lista);
    setCarregando(false);
  }, []);
  useEffect(() => {
    void recarregar();
  }, [recarregar]);
  return { clientes, carregando, recarregar };
}

export function useEmpresa(clienteId?: string | null) {
  const { perfil } = useAuth();
  const [ativo] = useClienteAtivo();
  const alvo = clienteId ?? ativo ?? perfil?.cliente_id ?? null;
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    if (!supabase || !alvo) {
      setEmpresa(null);
      setCarregando(false);
      return;
    }
    // Identidade (clientes) via função segura + config (markup/DAS) via satélite.
    const [{ data: clientes }, { data: cfg }] = await Promise.all([
      supabase.rpc("masor_clientes_fiscais"),
      supabase.from("masor_cliente_config").select("*").eq("cliente_id", alvo).maybeSingle(),
    ]);
    const c = (Array.isArray(clientes) ? (clientes as ClienteFiscal[]) : []).find((x) => x.id === alvo) ?? null;
    const end = (c?.endereco ?? {}) as Record<string, unknown>;
    const conf = (cfg ?? {}) as { markup_padrao?: number | null; das_efetivo?: number | null };
    setEmpresa(
      c
        ? {
            id: c.id,
            nome: c.nome_fantasia ?? c.razao_social,
            razao_social: c.razao_social,
            cnpj: c.cnpj_cpf,
            uf: (end.uf as string) ?? null,
            municipio: (end.cidade as string) ?? null,
            regime_tributario: c.regime_tributario,
            markup_padrao: conf.markup_padrao ?? null,
            das_efetivo: conf.das_efetivo ?? null,
          }
        : null,
    );
    setCarregando(false);
  }, [alvo]);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  // Só grava o que é do Masor (markup/DAS) na satélite; identidade é do Lior.
  const salvar = useCallback(
    async (dados: Partial<Empresa>): Promise<{ erro?: string }> => {
      if (!supabase || !alvo) return { erro: "sem cliente selecionado" };
      const { error } = await supabase.from("masor_cliente_config").upsert(
        { cliente_id: alvo, markup_padrao: dados.markup_padrao ?? null, das_efetivo: dados.das_efetivo ?? null, atualizado_em: new Date().toISOString() },
        { onConflict: "cliente_id" },
      );
      if (error) return { erro: error.message };
      await recarregar();
      return {};
    },
    [alvo, recarregar],
  );

  return { empresa, carregando, salvar, recarregar };
}
