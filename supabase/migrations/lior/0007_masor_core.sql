-- ============================================================
-- Masor no banco do LIOR — 0007: tabelas próprias (prefixo masor_)
-- ADITIVA. Renomeadas das migrações 0001/0004/0005 do Masor:
--   tenant_id -> cliente_id (referencia public.clientes), RLS via
--   masor_is_staff()/masor_cliente_atual() (ver 0006).
-- Globais (conhecimento compartilhado, sem cliente): tax_states, ncm_rules,
--   ai_reviews. Operacionais (por cliente): o resto.
-- ============================================================

-- ---------- GLOBAIS (conhecimento fiscal compartilhado) ----------
create table if not exists public.masor_tax_states (
  sigla char(2) primary key,
  nome text,
  regiao text check (regiao in ('sul_sudeste','n_ne_co_es')),
  aliq_interna numeric,
  equalizacao_simples boolean,
  antecipacao_st boolean,
  base_legal text,
  fontes jsonb not null default '[]',
  pendencias jsonb not null default '[]',
  pesquisado_em date,
  origem_dados text,
  ativo boolean not null default true,
  updated_at timestamptz not null default now()
);
create table if not exists public.masor_ncm_rules (
  id uuid primary key default gen_random_uuid(),
  ncm text not null,
  uf char(2),
  parametros jsonb not null default '{}',
  fontes jsonb not null default '[]',
  status text not null default 'ativo',
  origem text,
  pesquisado_em date,
  updated_at timestamptz not null default now(),
  unique (ncm, uf)
);
create table if not exists public.masor_ai_reviews (
  id uuid primary key default gen_random_uuid(),
  ncm text not null,
  uf char(2),
  regime text,
  parecer jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.masor_tax_states enable row level security;
alter table public.masor_ncm_rules enable row level security;
alter table public.masor_ai_reviews enable row level security;
-- leitura p/ qualquer autenticado; escrita só staff (cache: insert autenticado)
create policy masor_ts_sel on public.masor_tax_states for select to authenticated using (true);
create policy masor_ts_ins on public.masor_tax_states for insert to authenticated with check (public.masor_is_staff());
create policy masor_ts_upd on public.masor_tax_states for update to authenticated using (public.masor_is_staff()) with check (public.masor_is_staff());
create policy masor_ts_del on public.masor_tax_states for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create policy masor_nr_sel on public.masor_ncm_rules for select to authenticated using (true);
create policy masor_nr_ins on public.masor_ncm_rules for insert to authenticated with check (public.masor_is_staff());
create policy masor_nr_upd on public.masor_ncm_rules for update to authenticated using (public.masor_is_staff()) with check (public.masor_is_staff());
create policy masor_ar_sel on public.masor_ai_reviews for select to authenticated using (true);
create policy masor_ar_ins on public.masor_ai_reviews for insert to authenticated with check (true);

-- Seed SP (curadoria G41) — idêntico ao 0001 do Masor.
insert into public.masor_tax_states (sigla, nome, regiao, aliq_interna, equalizacao_simples, antecipacao_st, base_legal, origem_dados, pesquisado_em)
values ('SP','São Paulo','sul_sudeste',18,true,true,
  'RICMS/SP art. 426-A (antecipação); art. 2º XVI (equalização Simples); Portaria SRE 94/2025 (fim da ST de perfumaria/higiene desde 01/04/2026).',
  'curadoria G41','2026-07-16')
on conflict (sigla) do nothing;

-- ---------- OPERACIONAIS (por cliente) ----------

-- Fila de aprendizado (aprovação humana).
create table if not exists public.masor_rule_change_requests (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes(id) on delete set null,
  proposto_por uuid references auth.users(id) on delete set null,
  alvo text not null,
  proposta jsonb not null,
  justificativa text,
  fontes jsonb not null default '[]',
  status text not null default 'pendente',
  revisado_por uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.masor_rule_change_requests enable row level security;
create policy masor_rcr_sel on public.masor_rule_change_requests for select to authenticated
  using (public.masor_is_staff() or cliente_id = public.masor_cliente_atual());
create policy masor_rcr_ins on public.masor_rule_change_requests for insert to authenticated
  with check (public.masor_is_staff() or cliente_id = public.masor_cliente_atual());
create policy masor_rcr_upd on public.masor_rule_change_requests for update to authenticated
  using (public.masor_is_staff()) with check (public.masor_is_staff());

-- Histórico de análises.
create table if not exists public.masor_product_simulations (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes(id) on delete set null,
  origem text,
  payload jsonb not null default '{}',
  analise jsonb,
  created_at timestamptz not null default now()
);
alter table public.masor_product_simulations enable row level security;
create policy masor_ps_sel on public.masor_product_simulations for select to authenticated
  using (public.masor_is_staff() or cliente_id = public.masor_cliente_atual());
create policy masor_ps_ins on public.masor_product_simulations for insert to authenticated
  with check (public.masor_is_staff() or cliente_id = public.masor_cliente_atual());

-- Config de captura fiscal por cliente (SEFAZ).
create table if not exists public.masor_fiscal_config (
  cliente_id uuid primary key references public.clientes(id) on delete cascade,
  modo_captura text not null default 'procuracao',
  cert_ref text,
  ult_nsu text,
  atualizado_em timestamptz not null default now()
);
alter table public.masor_fiscal_config enable row level security;
create policy masor_fc_sel on public.masor_fiscal_config for select to authenticated using (public.masor_is_staff());
create policy masor_fc_ins on public.masor_fiscal_config for insert to authenticated with check (public.masor_is_staff());
create policy masor_fc_upd on public.masor_fiscal_config for update to authenticated using (public.masor_is_staff()) with check (public.masor_is_staff());

-- Certificado A1 (ciphertext base64; AES-256-GCM na app).
create table if not exists public.masor_certificados_digitais (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  empresa text,
  cnpj text not null,
  pfx_cifrado text not null,
  senha_cifrada text not null,
  titular text,
  validade_ate date,
  ativo boolean not null default true,
  criado_por uuid references auth.users(id),
  criado_em timestamptz not null default now()
);
create index if not exists masor_cert_cliente on public.masor_certificados_digitais(cliente_id, ativo);
alter table public.masor_certificados_digitais enable row level security;
create policy masor_cert_sel on public.masor_certificados_digitais for select to authenticated using (public.masor_is_staff());
-- INSERT/UPDATE só service role (sem policy p/ authenticated).

-- Documentos DFe capturados.
create table if not exists public.masor_dfe_documentos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  nsu text not null,
  chave44 text,
  tipo text not null,
  schema_dfe text,
  xml text not null,
  resumo jsonb not null default '{}',
  capturado_em timestamptz not null default now(),
  unique (cliente_id, nsu)
);
create index if not exists masor_dfe_cliente on public.masor_dfe_documentos(cliente_id, capturado_em desc);
alter table public.masor_dfe_documentos enable row level security;
create policy masor_dfe_sel on public.masor_dfe_documentos for select to authenticated
  using (public.masor_is_staff() or cliente_id = public.masor_cliente_atual());
-- INSERT só service role.
