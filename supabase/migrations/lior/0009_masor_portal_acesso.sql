-- ============================================================
-- Masor no banco do LIOR — 0009: acesso de cliente (portal)
-- ADITIVA. Cria a ponte auth.users -> public.clientes(id) para o
-- login-cliente do Masor e RELIGA masor_cliente_atual() (que em 0006
-- estava stubbed em null — rollout staff-first, "fase 2").
--
-- Com isso, um usuário-cliente logado passa a resolver o próprio
-- cliente_id, e as RLS já existentes (masor_is_staff() OR
-- cliente_id = masor_cliente_atual()) liberam SÓ os dados da empresa dele.
-- Staff NÃO tem linha aqui -> masor_cliente_atual() segue null p/ staff.
-- Rollback = drop masor_portal_acessos + restaurar masor_cliente_atual()=null.
-- ============================================================

create table if not exists public.masor_portal_acessos (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  cliente_id   uuid not null references public.clientes(id) on delete cascade,
  email        text,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references auth.users(id) on delete set null
);
create index if not exists masor_pa_cliente on public.masor_portal_acessos(cliente_id);
alter table public.masor_portal_acessos enable row level security;

-- staff gerencia todos; um cliente só enxerga a própria linha.
create policy masor_pa_sel on public.masor_portal_acessos for select to authenticated
  using (public.masor_is_staff() or auth_user_id = auth.uid());
create policy masor_pa_ins on public.masor_portal_acessos for insert to authenticated
  with check (public.masor_is_staff());
create policy masor_pa_del on public.masor_portal_acessos for delete to authenticated
  using (public.masor_is_staff());

-- Religa: cliente atual = mapeamento do portal (staff não tem linha -> null).
create or replace function public.masor_cliente_atual()
returns uuid language sql stable security definer set search_path = public as $$
  select cliente_id from public.masor_portal_acessos where auth_user_id = auth.uid()
$$;

-- Identidade da PRÓPRIA empresa para o cliente logado (não-staff).
-- masor_clientes_fiscais() exige staff; o cliente usa esta, restrita ao seu id.
create or replace function public.masor_meu_cliente()
returns table (
  id uuid, razao_social text, nome_fantasia text, cnpj_cpf text,
  regime_tributario text, cnae_principal text, endereco jsonb
) language sql stable security definer set search_path = public as $$
  select c.id, c.razao_social, c.nome_fantasia, c.cnpj_cpf,
         c.regime_tributario, c.cnae_principal, c.endereco
  from public.clientes c
  where c.id = public.masor_cliente_atual()
$$;
grant execute on function public.masor_meu_cliente() to authenticated;
