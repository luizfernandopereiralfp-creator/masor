import { supabase } from "@/integrations/supabase/client";
import { lerValidadeCertificado } from "@/lib/certificado-validade";

/* ============================================================
   Masor — cadastro/edição de CLIENTE (mesma base do Lior).
   Grava DIRETO em public.clientes (RLS do Lior = pode_ver_honorarios:
   admin OU profiles.pode_ver_honorarios). O e-CNPJ reusa a edge
   function `cliente-certificado` do Lior (mesma secret CERT_MASTER_KEY).
   Fiel ao src/routes/_authenticated/admin/clientes.tsx do Lior.
   ============================================================ */

export type EnderecoJson = {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string; // ATENÇÃO: o Lior usa `cidade`, não `municipio`.
  uf?: string;
  cep?: string;
};

export type ClienteForm = {
  id?: string | null;
  razao_social: string;
  nome_fantasia: string;
  cnpj_cpf: string;
  inscricao_estadual: string;
  inscricao_municipal: string;
  regime_tributario: string;
  cnae_principal: string;
  email: string;
  telefone_whatsapp: string;
  nome_responsavel: string;
  endereco: EnderecoJson;
};

export function formVazio(): ClienteForm {
  return {
    id: null,
    razao_social: "",
    nome_fantasia: "",
    cnpj_cpf: "",
    inscricao_estadual: "",
    inscricao_municipal: "",
    regime_tributario: "",
    cnae_principal: "",
    email: "",
    telefone_whatsapp: "",
    nome_responsavel: "",
    endereco: {},
  };
}

export const onlyDigits = (s: string | null | undefined) => (s ?? "").replace(/\D+/g, "");

/** Carrega um cliente para edição (leitura direta — exige permissão de escrita/honorários). */
export async function carregarClienteParaEdicao(id: string): Promise<{ form?: ClienteForm; erro?: string }> {
  if (!supabase) return { erro: "Supabase indisponível." };
  const { data, error } = await supabase
    .from("clientes")
    .select(
      "id,razao_social,nome_fantasia,cnpj_cpf,inscricao_estadual,inscricao_municipal,regime_tributario,cnae_principal,email,telefone_whatsapp,nome_responsavel,endereco",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    return { erro: error.message.includes("row-level security") ? "Sem permissão para editar este cliente." : error.message };
  }
  if (!data) return { erro: "Cliente não encontrado." };
  const end = (data.endereco ?? {}) as EnderecoJson;
  return {
    form: {
      id: data.id,
      razao_social: data.razao_social ?? "",
      nome_fantasia: data.nome_fantasia ?? "",
      cnpj_cpf: data.cnpj_cpf ?? "",
      inscricao_estadual: data.inscricao_estadual ?? "",
      inscricao_municipal: data.inscricao_municipal ?? "",
      regime_tributario: data.regime_tributario ?? "",
      cnae_principal: data.cnae_principal ?? "",
      email: data.email ?? "",
      telefone_whatsapp: data.telefone_whatsapp ?? "",
      nome_responsavel: data.nome_responsavel ?? "",
      endereco: {
        logradouro: end.logradouro,
        numero: end.numero,
        complemento: end.complemento,
        bairro: end.bairro,
        cidade: end.cidade,
        uf: end.uf,
        cep: end.cep,
      },
    },
  };
}

/** INSERT (id vazio) ou UPDATE em public.clientes. Devolve o id salvo.
 *  Se o CNPJ já existir na base única (Lior), carrega o registro existente
 *  (jaExistia=true) em vez de falhar. */
export async function salvarCliente(f: ClienteForm): Promise<{ id?: string; erro?: string; jaExistia?: boolean }> {
  if (!supabase) return { erro: "Supabase indisponível." };
  const razao = f.razao_social.trim();
  if (!razao) return { erro: "Razão social é obrigatória." };
  const doc = onlyDigits(f.cnpj_cpf);
  if (doc && doc.length !== 11 && doc.length !== 14) return { erro: "CNPJ/CPF deve ter 11 (CPF) ou 14 (CNPJ) dígitos." };

  const endereco: EnderecoJson = {
    logradouro: f.endereco.logradouro?.trim() || undefined,
    numero: f.endereco.numero?.trim() || undefined,
    complemento: f.endereco.complemento?.trim() || undefined,
    bairro: f.endereco.bairro?.trim() || undefined,
    cidade: f.endereco.cidade?.trim() || undefined,
    uf: f.endereco.uf?.trim().toUpperCase() || undefined,
    cep: onlyDigits(f.endereco.cep) || undefined,
  };
  const hasEndereco = Object.values(endereco).some(Boolean);

  const payload = {
    razao_social: razao,
    nome_fantasia: f.nome_fantasia.trim() || null,
    cnpj_cpf: doc || null,
    inscricao_estadual: f.inscricao_estadual.trim() || null,
    inscricao_municipal: f.inscricao_municipal.trim() || null,
    regime_tributario: f.regime_tributario.trim() || null,
    cnae_principal: f.cnae_principal.trim() || null,
    email: f.email.trim() || null,
    telefone_whatsapp: f.telefone_whatsapp.trim() || null,
    nome_responsavel: f.nome_responsavel.trim() || null,
    endereco: hasEndereco ? endereco : {},
  };

  const res = f.id
    ? await supabase.from("clientes").update(payload).eq("id", f.id).select("id").maybeSingle()
    : await supabase.from("clientes").insert(payload).select("id").maybeSingle();

  if (res.error) {
    const m = res.error.message;
    if (m.includes("duplicate") || m.includes("unique") || m.includes("clientes_cnpj_cpf")) {
      // CNPJ já existe na base única — carrega o registro existente em vez de falhar.
      const { data: ex } = await supabase.from("clientes").select("id").eq("cnpj_cpf", doc).maybeSingle();
      const exId = (ex as { id?: string } | null)?.id;
      if (exId) return { id: exId, jaExistia: true };
      return { erro: "Já existe um cliente com este CNPJ/CPF." };
    }
    if (m.includes("row-level security")) return { erro: "Sem permissão para salvar cliente (necessário admin ou acesso a honorários)." };
    return { erro: m };
  }
  return { id: (res.data as { id?: string } | null)?.id ?? f.id ?? undefined };
}

/* ---------- Consulta Receita (BrasilAPI) — só pré-preenche o form ---------- */

type ReceitaResp = {
  razao_social?: string;
  nome_fantasia?: string;
  cnae_fiscal?: number | string;
  cnae_fiscal_descricao?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  email?: string;
  ddd_telefone_1?: string;
  opcao_pelo_simples?: boolean | null;
  opcao_pelo_mei?: boolean | null;
};

/** Busca CNPJ na BrasilAPI e devolve os campos para pré-preencher (não grava nada). */
export async function buscarReceitaCNPJ(cnpj: string): Promise<{ dados?: Partial<ClienteForm>; erro?: string }> {
  const doc = onlyDigits(cnpj);
  if (doc.length !== 14) return { erro: "Informe um CNPJ com 14 dígitos." };
  try {
    // Consulta server-side (evita CORS/CSP no navegador e mantém a Receita fora do cliente).
    const tok = supabase ? (await supabase.auth.getSession()).data.session?.access_token : null;
    const r = await fetch(`/api/receita?cnpj=${doc}`, { headers: tok ? { authorization: `Bearer ${tok}` } : {} });
    const j = (await r.json().catch(() => ({}))) as { ok?: boolean; erro?: string; dados?: ReceitaResp };
    if (!r.ok || j.ok === false) return { erro: j.erro ?? `Falha na consulta (${r.status}).` };
    const d = (j.dados ?? {}) as ReceitaResp;
    const regime = d.opcao_pelo_mei ? "Simples Nacional (MEI)" : d.opcao_pelo_simples ? "Simples Nacional" : "";
    return {
      dados: {
        razao_social: d.razao_social ?? undefined,
        nome_fantasia: d.nome_fantasia ?? undefined,
        cnae_principal: d.cnae_fiscal ? String(d.cnae_fiscal) : undefined,
        regime_tributario: regime || undefined,
        email: d.email ?? undefined,
        telefone_whatsapp: d.ddd_telefone_1 ?? undefined,
        endereco: {
          logradouro: d.logradouro ?? undefined,
          numero: d.numero ?? undefined,
          complemento: d.complemento ?? undefined,
          bairro: d.bairro ?? undefined,
          cidade: d.municipio ?? undefined,
          uf: d.uf ?? undefined,
          cep: d.cep ? onlyDigits(d.cep) : undefined,
        },
      },
    };
  } catch (e) {
    return { erro: e instanceof Error ? e.message : "Erro de rede na consulta." };
  }
}

/* ---------- e-CNPJ (certificado A1) — reusa a edge function do Lior ---------- */

async function fileToBase64(file: File): Promise<string> {
  const buf = new Uint8Array(await file.arrayBuffer());
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < buf.length; i += chunk) bin += String.fromCharCode(...buf.subarray(i, i + chunk));
  return btoa(bin);
}

/** Envia o e-CNPJ do cliente para a edge function `cliente-certificado` (criptografa server-side). */
export async function enviarCertificado(
  clienteId: string,
  file: File,
  senha: string,
): Promise<{ ok?: true; valido_ate?: string | null; erro?: string }> {
  if (!supabase) return { erro: "Supabase indisponível." };
  if (file.size > 5 * 1024 * 1024) return { erro: "Arquivo acima de 5MB." };
  if (!senha) return { erro: "Informe a senha do certificado." };

  const valido_ate = await lerValidadeCertificado(file, senha);
  if (!valido_ate) return { erro: "Não foi possível ler o certificado (senha incorreta ou arquivo inválido)." };

  const file_base64 = await fileToBase64(file);
  const { error } = await supabase.functions.invoke("cliente-certificado", {
    body: { action: "upload", cliente_id: clienteId, filename: file.name, file_base64, senha, valido_ate },
  });
  if (error) {
    const status = (error as { context?: { status?: number } }).context?.status;
    if (status === 401 || status === 403) return { erro: "Sem permissão (upload de e-CNPJ exige admin)." };
    return { erro: error.message };
  }
  return { ok: true, valido_ate };
}

export type CertStatusResp = {
  certificado: { filename: string; validade_ate: string | null; validade_de: string | null; cnpj: string | null; titular: string | null } | null;
  cofre_ok: boolean;
};

/** Status do e-CNPJ ativo do cliente (via /api/certificado GET, service-role server-side). */
export async function statusCertificado(clienteId: string): Promise<CertStatusResp | null> {
  try {
    const tok = supabase ? (await supabase.auth.getSession()).data.session?.access_token ?? null : null;
    const r = await fetch(`/api/certificado?cliente_id=${encodeURIComponent(clienteId)}`, {
      headers: tok ? { authorization: `Bearer ${tok}` } : {},
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { ok?: boolean; certificado?: CertStatusResp["certificado"]; cofre_ok?: boolean };
    if (!j.ok) return null;
    return { certificado: j.certificado ?? null, cofre_ok: !!j.cofre_ok };
  } catch {
    return null;
  }
}
