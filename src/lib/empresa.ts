import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

/* ============================================================
   Masor — dados fixos da empresa (tenant), preenchidos 1x.
   Pré-preenchem as análises (regime, UF, município, markup),
   evitando redigitar a cada consulta.
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

export function useEmpresa() {
  const { perfil } = useAuth();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    if (!supabase || !perfil?.tenant_id) {
      setCarregando(false);
      return;
    }
    const { data } = await supabase.from("tenants").select("*").eq("id", perfil.tenant_id).maybeSingle();
    setEmpresa((data as Empresa) ?? null);
    setCarregando(false);
  }, [perfil?.tenant_id]);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  const salvar = useCallback(
    async (dados: Partial<Empresa>): Promise<{ erro?: string }> => {
      if (!supabase || !perfil?.tenant_id) return { erro: "sem empresa vinculada" };
      const { error } = await supabase.from("tenants").update(dados).eq("id", perfil.tenant_id);
      if (error) return { erro: error.message };
      await recarregar();
      return {};
    },
    [perfil?.tenant_id, recarregar],
  );

  return { empresa, carregando, salvar, recarregar };
}
