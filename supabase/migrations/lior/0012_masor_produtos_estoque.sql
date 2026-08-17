-- ============================================================
-- Masor no banco do LIOR — 0012: catálogo de produtos + estoque
-- ADITIVA. Escopado por cliente (RLS: staff OU o próprio cliente).
--   masor_produtos            — cadastro (editável) + análise fiscal salva
--   masor_estoque_movimentos  — razão de estoque (entrada/saida/ajuste)
--   masor_estoque_saldo (view)— saldo atual por produto (security_invoker)
-- Fase 2 (auto-entrada por NF-e) usará origem='nfe' + ref=chave|item.
-- ============================================================

-- ---------- Catálogo de produtos ----------
create table if not exists public.masor_produtos (
  id            uuid primary key default gen_random_uuid(),
  cliente_id    uuid not null references public.clientes(id) on delete cascade,
  descricao     text not null,
  ean           text,
  ncm           text,
  cest          text,
  unidade       text default 'UN',
  categoria     text,
  custo_nf      numeric,
  markup_pct    numeric,
  analise       jsonb,            -- último parecer fiscal salvo (AnaliseFiscal)
  analise_em    timestamptz,
  estoque_min   numeric,          -- alerta de estoque mínimo (opcional)
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists masor_produtos_cliente on public.masor_produtos(cliente_id, ativo);
create index if not exists masor_produtos_ncm on public.masor_produtos(cliente_id, ncm);
create index if not exists masor_produtos_ean on public.masor_produtos(cliente_id, ean);

alter table public.masor_produtos enable row level security;
create policy masor_prod_sel on public.masor_produtos for select to authenticated
  using (public.masor_is_staff() or cliente_id = public.masor_cliente_atual());
create policy masor_prod_ins on public.masor_produtos for insert to authenticated
  with check (public.masor_is_staff() or cliente_id = public.masor_cliente_atual());
create policy masor_prod_upd on public.masor_produtos for update to authenticated
  using (public.masor_is_staff() or cliente_id = public.masor_cliente_atual())
  with check (public.masor_is_staff() or cliente_id = public.masor_cliente_atual());
create policy masor_prod_del on public.masor_produtos for delete to authenticated
  using (public.masor_is_staff() or cliente_id = public.masor_cliente_atual());

-- ---------- Razão de estoque (movimentos) ----------
create table if not exists public.masor_estoque_movimentos (
  id          uuid primary key default gen_random_uuid(),
  produto_id  uuid not null references public.masor_produtos(id) on delete cascade,
  cliente_id  uuid not null references public.clientes(id) on delete cascade,
  tipo        text not null check (tipo in ('entrada','saida','ajuste')),
  quantidade  numeric not null,   -- entrada/saida: positivo; ajuste: pode ser +/-
  custo_unit  numeric,
  origem      text not null default 'manual',  -- manual | nfe | planilha
  ref         text,               -- chave NF-e|item (auto) ou observação
  data        timestamptz not null default now(),
  criado_por  uuid references auth.users(id) on delete set null
);
create index if not exists masor_estq_produto on public.masor_estoque_movimentos(produto_id, data desc);
create index if not exists masor_estq_cliente on public.masor_estoque_movimentos(cliente_id);
-- idempotência da auto-entrada por NF-e (não duplica o mesmo item da mesma nota)
create unique index if not exists masor_estq_ref_nfe
  on public.masor_estoque_movimentos(produto_id, ref) where origem = 'nfe';

alter table public.masor_estoque_movimentos enable row level security;
create policy masor_estq_sel on public.masor_estoque_movimentos for select to authenticated
  using (public.masor_is_staff() or cliente_id = public.masor_cliente_atual());
create policy masor_estq_ins on public.masor_estoque_movimentos for insert to authenticated
  with check (public.masor_is_staff() or cliente_id = public.masor_cliente_atual());
create policy masor_estq_del on public.masor_estoque_movimentos for delete to authenticated
  using (public.masor_is_staff() or cliente_id = public.masor_cliente_atual());

-- ---------- Saldo atual por produto (view, respeita RLS) ----------
create or replace view public.masor_estoque_saldo
with (security_invoker = true) as
  select
    produto_id,
    cliente_id,
    sum(case tipo when 'saida' then -abs(quantidade) when 'entrada' then abs(quantidade) else quantidade end) as saldo,
    max(data) as ultima_mov
  from public.masor_estoque_movimentos
  group by produto_id, cliente_id;
grant select on public.masor_estoque_saldo to authenticated;
