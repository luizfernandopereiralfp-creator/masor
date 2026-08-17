import { supabase } from "@/integrations/supabase/client";

/* ============================================================
   Masor — catálogo de produtos + estoque (por cliente).
   Reusa /api/analisar para a análise fiscal por produto.
   ============================================================ */

export type Produto = {
  id: string;
  cliente_id: string;
  descricao: string;
  ean: string | null;
  ncm: string | null;
  cest: string | null;
  unidade: string | null;
  categoria: string | null;
  custo_nf: number | null;
  markup_pct: number | null;
  analise: unknown | null;
  analise_em: string | null;
  estoque_min: number | null;
  ativo: boolean;
  atualizado_em: string;
};

export type ProdutoForm = {
  id?: string | null;
  descricao: string;
  ean: string;
  ncm: string;
  cest: string;
  unidade: string;
  categoria: string;
  custo_nf: string;
  markup_pct: string;
  estoque_min: string;
};

export type Movimento = {
  id: string;
  produto_id: string;
  tipo: "entrada" | "saida" | "ajuste";
  quantidade: number;
  custo_unit: number | null;
  origem: string;
  ref: string | null;
  data: string;
};

export type Saldo = { produto_id: string; saldo: number; ultima_mov: string | null };

const nOrNull = (s: string): number | null => {
  const t = (s ?? "").trim().replace(/\./g, "").replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return isNaN(n) ? null : n;
};

export function produtoFormVazio(): ProdutoForm {
  return { id: null, descricao: "", ean: "", ncm: "", cest: "", unidade: "UN", categoria: "", custo_nf: "", markup_pct: "", estoque_min: "" };
}

export function produtoParaForm(p: Produto): ProdutoForm {
  return {
    id: p.id,
    descricao: p.descricao,
    ean: p.ean ?? "",
    ncm: p.ncm ?? "",
    cest: p.cest ?? "",
    unidade: p.unidade ?? "UN",
    categoria: p.categoria ?? "",
    custo_nf: p.custo_nf != null ? String(p.custo_nf) : "",
    markup_pct: p.markup_pct != null ? String(p.markup_pct) : "",
    estoque_min: p.estoque_min != null ? String(p.estoque_min) : "",
  };
}

export async function listarProdutos(clienteId: string): Promise<Produto[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("masor_produtos")
    .select("*")
    .eq("cliente_id", clienteId)
    .eq("ativo", true)
    .order("descricao");
  return (data as Produto[]) ?? [];
}

export async function saldos(clienteId: string): Promise<Record<string, number>> {
  if (!supabase) return {};
  const { data } = await supabase.from("masor_estoque_saldo").select("produto_id,saldo").eq("cliente_id", clienteId);
  const map: Record<string, number> = {};
  for (const r of (data as Saldo[]) ?? []) map[r.produto_id] = Number(r.saldo) || 0;
  return map;
}

export async function salvarProduto(clienteId: string, f: ProdutoForm): Promise<{ id?: string; erro?: string }> {
  if (!supabase) return { erro: "Supabase indisponível." };
  if (!f.descricao.trim()) return { erro: "Descrição é obrigatória." };
  const payload = {
    cliente_id: clienteId,
    descricao: f.descricao.trim(),
    ean: f.ean.trim() || null,
    ncm: f.ncm.replace(/\D/g, "") || null,
    cest: f.cest.trim() || null,
    unidade: f.unidade.trim() || "UN",
    categoria: f.categoria.trim() || null,
    custo_nf: nOrNull(f.custo_nf),
    markup_pct: nOrNull(f.markup_pct),
    estoque_min: nOrNull(f.estoque_min),
    atualizado_em: new Date().toISOString(),
  };
  const res = f.id
    ? await supabase.from("masor_produtos").update(payload).eq("id", f.id).select("id").maybeSingle()
    : await supabase.from("masor_produtos").insert(payload).select("id").maybeSingle();
  if (res.error) {
    const m = res.error.message;
    return { erro: m.includes("row-level security") ? "Sem permissão para salvar produto." : m };
  }
  return { id: (res.data as { id?: string } | null)?.id ?? f.id ?? undefined };
}

/** Exclusão lógica (preserva histórico de estoque). */
export async function excluirProduto(id: string): Promise<{ ok?: true; erro?: string }> {
  if (!supabase) return { erro: "Supabase indisponível." };
  const { error } = await supabase.from("masor_produtos").update({ ativo: false, atualizado_em: new Date().toISOString() }).eq("id", id);
  return error ? { erro: error.message } : { ok: true };
}

export async function listarMovimentos(produtoId: string): Promise<Movimento[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("masor_estoque_movimentos")
    .select("id,produto_id,tipo,quantidade,custo_unit,origem,ref,data")
    .eq("produto_id", produtoId)
    .order("data", { ascending: false })
    .limit(100);
  return (data as Movimento[]) ?? [];
}

export async function lancarMovimento(
  clienteId: string,
  produtoId: string,
  tipo: "entrada" | "saida" | "ajuste",
  quantidade: number,
  custoUnit?: number | null,
  ref?: string,
): Promise<{ ok?: true; erro?: string }> {
  if (!supabase) return { erro: "Supabase indisponível." };
  if (!quantidade || isNaN(quantidade)) return { erro: "Quantidade inválida." };
  const { error } = await supabase.from("masor_estoque_movimentos").insert({
    cliente_id: clienteId,
    produto_id: produtoId,
    tipo,
    quantidade,
    custo_unit: custoUnit ?? null,
    origem: "manual",
    ref: ref?.trim() || null,
  });
  return error ? { erro: error.message } : { ok: true };
}

/* ---------- Análise fiscal por produto (reusa /api/analisar) ---------- */

type EmpresaCtx = { uf: string | null; regime_tributario: string | null; das_efetivo: number | null };

function mapRegime(r: string | null): string {
  const k = (r ?? "").toLowerCase();
  if (k.includes("simples")) return "simples";
  if (k.includes("presum")) return "presumido";
  return "lucro_real";
}

async function bearer(): Promise<Record<string, string>> {
  if (!supabase) return {};
  const tok = (await supabase.auth.getSession()).data.session?.access_token ?? null;
  return tok ? { authorization: `Bearer ${tok}` } : {};
}

/** Roda a análise fiscal do produto e salva o parecer nele. */
export async function analisarProduto(
  p: Produto,
  empresa: EmpresaCtx,
  idioma: "pt" | "ru",
): Promise<{ ok?: true; erro?: string }> {
  if (!supabase) return { erro: "Supabase indisponível." };
  const operacao = {
    descricao: p.descricao,
    ncm: p.ncm ?? "",
    cest: p.cest ?? "",
    ean: p.ean ?? "",
    custo_nf: p.custo_nf ?? 0,
    markup_percent: p.markup_pct ?? 20,
    tipo_margem: "venda",
    origem_mercadoria: "interna",
    finalidade: "revenda",
    uf_supermercado: empresa.uf ?? "",
    regime_empresa: mapRegime(empresa.regime_tributario),
    das_efetivo_percent: empresa.das_efetivo ?? 4,
    pis_cofins: "normal",
  };
  let data: { ok?: boolean; analise?: unknown; erro?: string };
  try {
    const r = await fetch("/api/analisar", {
      method: "POST",
      headers: { "content-type": "application/json", ...(await bearer()) },
      body: JSON.stringify({ operacao, idioma }),
    });
    data = await r.json();
  } catch (e) {
    return { erro: e instanceof Error ? e.message : "Falha ao contatar a IA." };
  }
  if (!data.ok || !data.analise) return { erro: data.erro ?? "A IA não retornou a análise." };
  const { error } = await supabase
    .from("masor_produtos")
    .update({ analise: data.analise, analise_em: new Date().toISOString(), atualizado_em: new Date().toISOString() })
    .eq("id", p.id);
  return error ? { erro: error.message } : { ok: true };
}
