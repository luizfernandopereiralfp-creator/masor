-- ============================================================
-- Masor — migração inicial
-- Multi-tenant + config tributária + cache IA + histórico +
-- base de aprendizado + config fiscal por tenant (captura DFe).
-- Aplicar no SQL Editor do Supabase (ou via CLI).
-- Princípio: RLS explícita por tabela; regras de config são
-- GLOBAIS (conhecimento compartilhado); dados operacionais são
-- por TENANT. Segredos (certificado) nunca aqui em claro.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Tenants e perfis ----------
create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text,
  uf char(2),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

do $$ begin
  create type public.app_role as enum ('admin', 'staff', 'cliente');
exception when duplicate_object then null; end $$;

-- Perfil liga o usuário do Supabase Auth a um tenant e a um papel.
-- admin/staff = equipe G41 (veem todos os tenants); cliente = supermercado.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references public.tenants(id) on delete set null,
  nome text,
  role public.app_role not null default 'cliente',
  created_at timestamptz not null default now()
);

-- ---------- Helpers SECURITY DEFINER (evitam recursão de RLS) ----------
create or replace function public.current_tenant()
returns uuid language sql stable security definer set search_path = public as $$
  select tenant_id from public.profiles where user_id = auth.uid()
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role in ('admin', 'staff')
  )
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where user_id = auth.uid() and role = 'admin'
  )
$$;

alter table public.tenants enable row level security;
alter table public.profiles enable row level security;

-- tenants: staff vê todos; cliente vê o seu. Escrita só staff.
create policy tenants_sel on public.tenants for select to authenticated
  using (public.is_staff() or id = public.current_tenant());
create policy tenants_ins on public.tenants for insert to authenticated
  with check (public.is_staff());
create policy tenants_upd on public.tenants for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- profiles: o próprio usuário vê/edita o seu; staff vê todos.
create policy profiles_sel on public.profiles for select to authenticated
  using (user_id = auth.uid() or public.is_staff());
create policy profiles_upd on public.profiles for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
-- INSERT de profile só admin (evita auto-promoção — lição do Kanban).
create policy profiles_ins on public.profiles for insert to authenticated
  with check (public.is_admin());

-- ============================================================
-- CONFIG TRIBUTÁRIA (GLOBAL) — regras vivem em dados, com fonte.
-- Leitura: todo autenticado. Escrita: staff. (server usa service role.)
-- ============================================================

-- Regras por UF (preenchidas por pesquisa de IA, nunca presumidas).
create table if not exists public.tax_states (
  sigla char(2) primary key,
  nome text,
  regiao text check (regiao in ('sul_sudeste', 'n_ne_co_es')),
  aliq_interna numeric,                 -- null = não confirmada
  equalizacao_simples boolean,          -- null = não confirmada
  antecipacao_st boolean,               -- null = não confirmada
  base_legal text,
  fontes jsonb not null default '[]',   -- [{campo, url}]
  pendencias jsonb not null default '[]',
  pesquisado_em date,
  origem_dados text,                    -- 'pesquisa IA' | 'curadoria G41' | '+ ajuste manual'
  ativo boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Regras por NCM (+UF) — base de aprendizado (parâmetros com fonte).
create table if not exists public.ncm_rules (
  id uuid primary key default gen_random_uuid(),
  ncm text not null,
  uf char(2),                           -- null = federal (monofásico, cesta básica)
  parametros jsonb not null default '{}', -- {sujeito_st, monofasico, aliquota_zero_pc, ...}
  fontes jsonb not null default '[]',
  status text not null default 'ativo', -- 'ativo' | 'em_revisao'
  origem text,                          -- 'pesquisa IA' | 'usuario+verificado' | 'curadoria'
  pesquisado_em date,
  updated_at timestamptz not null default now(),
  unique (ncm, uf)
);

-- Cache de pareceres da IA (reusar < 30 dias) por NCM+UF+regime.
create table if not exists public.ai_reviews (
  id uuid primary key default gen_random_uuid(),
  ncm text not null,
  uf char(2),
  regime text,
  parecer jsonb not null,               -- ParecerIA cru + parâmetros
  created_at timestamptz not null default now()
);
create index if not exists ai_reviews_lookup on public.ai_reviews (ncm, uf, regime, created_at desc);

alter table public.tax_states enable row level security;
alter table public.ncm_rules enable row level security;
alter table public.ai_reviews enable row level security;

create policy tax_states_sel on public.tax_states for select to authenticated using (true);
create policy tax_states_ins on public.tax_states for insert to authenticated with check (public.is_staff());
create policy tax_states_upd on public.tax_states for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy tax_states_del on public.tax_states for delete to authenticated using (public.is_admin());

create policy ncm_rules_sel on public.ncm_rules for select to authenticated using (true);
create policy ncm_rules_ins on public.ncm_rules for insert to authenticated with check (public.is_staff());
create policy ncm_rules_upd on public.ncm_rules for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy ai_reviews_sel on public.ai_reviews for select to authenticated using (true);
create policy ai_reviews_ins on public.ai_reviews for insert to authenticated with check (public.is_staff());

-- Fila de revisão do APRENDIZADO: info nova do usuário só sobrescreve
-- regra confirmada após aprovação humana (staff).
create table if not exists public.rule_change_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete set null,
  proposto_por uuid references auth.users(id) on delete set null,
  alvo text not null,                   -- 'tax_states:SP' | 'ncm_rules:33051000:SP'
  proposta jsonb not null,              -- novo valor sugerido
  justificativa text,
  fontes jsonb not null default '[]',
  status text not null default 'pendente', -- 'pendente' | 'aprovado' | 'rejeitado'
  revisado_por uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.rule_change_requests enable row level security;
create policy rcr_sel on public.rule_change_requests for select to authenticated
  using (public.is_staff() or tenant_id = public.current_tenant());
create policy rcr_ins on public.rule_change_requests for insert to authenticated
  with check (tenant_id = public.current_tenant() or public.is_staff());
create policy rcr_upd on public.rule_change_requests for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ============================================================
-- DADOS OPERACIONAIS (POR TENANT)
-- ============================================================

-- Histórico de análises (consulta item-a-item e lote).
create table if not exists public.product_simulations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  origem text not null default 'consulta', -- 'consulta' | 'importacao'
  payload jsonb not null,               -- operação enviada
  analise jsonb not null,               -- AnaliseFiscal final
  created_at timestamptz not null default now()
);
create index if not exists product_simulations_tenant on public.product_simulations (tenant_id, created_at desc);
alter table public.product_simulations enable row level security;
create policy psim_sel on public.product_simulations for select to authenticated
  using (public.is_staff() or tenant_id = public.current_tenant());
create policy psim_ins on public.product_simulations for insert to authenticated
  with check (tenant_id = public.current_tenant() or public.is_staff());

-- Config fiscal por tenant (captura de DFe — Fase 8).
-- O certificado NÃO fica aqui: guarda-se apenas a REFERÊNCIA ao cofre.
create table if not exists public.tenant_fiscal_config (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  modo_captura text not null default 'procuracao', -- 'procuracao' | 'certificado_proprio' | 'upload'
  cert_ref text,                        -- referência ao segredo no cofre (Vault), nunca o cert em si
  ult_nsu text,                         -- controle incremental do NFeDistribuiçãoDFe
  atualizado_em timestamptz not null default now()
);
alter table public.tenant_fiscal_config enable row level security;
-- Sensível: só staff. (Config de certificado/procuração.)
create policy tfc_sel on public.tenant_fiscal_config for select to authenticated using (public.is_staff());
create policy tfc_ins on public.tenant_fiscal_config for insert to authenticated with check (public.is_staff());
create policy tfc_upd on public.tenant_fiscal_config for update to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---------- Seed: SP (curadoria G41, verificada jul/2026) ----------
insert into public.tax_states (sigla, nome, regiao, aliq_interna, equalizacao_simples, antecipacao_st, base_legal, origem_dados, pesquisado_em)
values ('SP', 'São Paulo', 'sul_sudeste', 18, true, true,
  'RICMS/SP art. 426-A (antecipação); art. 2º XVI (equalização Simples); Portaria SRE 94/2025 (fim da ST de perfumaria/higiene desde 01/04/2026).',
  'curadoria G41', '2026-07-16')
on conflict (sigla) do nothing;
