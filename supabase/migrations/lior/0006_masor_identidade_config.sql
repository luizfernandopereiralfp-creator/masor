-- ============================================================
-- Masor no banco do LIOR — 0006: identidade + config de cliente
-- ADITIVA. Roda no projeto Supabase do Lior (igzhwzgtxjgeaommatls).
-- NÃO altera nenhuma tabela/func existente do Lior. Só CRIA objetos
-- prefixados `masor_`. Rollback = drop dos objetos masor_* abaixo.
--
-- Reusa a identidade do Lior:
--   auth.users, public.profiles(id, full_name), public.user_roles + has_role(),
--   public.clientes (empresa/cliente), public.portal_clientes (login-cliente).
-- O Masor deixa de ter tenants/profiles próprios: papel vem de user_roles;
-- "empresa" = public.clientes; config fiscal extra = masor_cliente_config.
-- ============================================================

-- ---------- Helpers de identidade (namespaced, não colidem com o Lior) ----------

-- Equipe (G41): qualquer usuário com papel em user_roles (admin OU member).
create or replace function public.masor_is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid())
$$;

-- Cliente atual de um login-cliente do portal (supermercado). Best-effort:
-- portal_clientes.auth_user_id -> cliente_slug -> conta_azul_clientes -> clientes
-- (casando por CNPJ). Para a equipe (staff) devolve null: staff escolhe o cliente
-- na tela. Portal-cliente do Masor é fase posterior; hoje o uso é staff-first.
create or replace function public.masor_cliente_atual()
returns uuid language sql stable security definer set search_path = public as $$
  select c.id
  from public.portal_clientes pc
  join public.conta_azul_clientes ca on ca.slug = pc.cliente_slug
  join public.clientes c
    on regexp_replace(coalesce(c.cnpj_cpf,''),'\D','','g')
     = regexp_replace(coalesce(ca.cnpj,''),'\D','','g')
   and coalesce(regexp_replace(c.cnpj_cpf,'\D','','g'),'') <> ''
  where pc.auth_user_id = auth.uid()
  limit 1
$$;

-- Perfil do Masor sintetizado a partir da identidade do Lior. O app chama isto
-- (rpc) no lugar de ler um profiles próprio. role: admin | staff | cliente.
create or replace function public.masor_meu_perfil()
returns table (user_id uuid, cliente_id uuid, nome text, role text)
language sql stable security definer set search_path = public as $$
  select
    auth.uid(),
    public.masor_cliente_atual(),
    (select coalesce(p.full_name, p.email) from public.profiles p where p.id = auth.uid()),
    case
      when public.has_role(auth.uid(), 'admin') then 'admin'
      when public.masor_is_staff() then 'staff'
      else 'cliente'
    end
$$;

grant execute on function public.masor_is_staff() to authenticated;
grant execute on function public.masor_cliente_atual() to authenticated;
grant execute on function public.masor_meu_perfil() to authenticated;

-- ---------- Config fiscal do cliente (satélite de public.clientes) ----------
-- Não engorda a tabela clientes (produção/honorários). Só o que falta ao Masor.
create table if not exists public.masor_cliente_config (
  cliente_id     uuid primary key references public.clientes(id) on delete cascade,
  markup_padrao  numeric,          -- % markup/margem padrão
  das_efetivo    numeric,          -- % DAS efetivo (Simples)
  observacoes    text,
  atualizado_em  timestamptz not null default now()
);
alter table public.masor_cliente_config enable row level security;
create policy masor_ccfg_sel on public.masor_cliente_config for select to authenticated
  using (public.masor_is_staff() or cliente_id = public.masor_cliente_atual());
create policy masor_ccfg_ins on public.masor_cliente_config for insert to authenticated
  with check (public.masor_is_staff());
create policy masor_ccfg_upd on public.masor_cliente_config for update to authenticated
  using (public.masor_is_staff()) with check (public.masor_is_staff());

-- ---------- View segura de clientes p/ a equipe fiscal ----------
-- clientes tem RLS `pode_ver_honorarios` (só admin/finance). A equipe fiscal do
-- Masor precisa da IDENTIDADE do cliente (não do faturamento). Esta função
-- SECURITY DEFINER expõe só os campos fiscais a qualquer staff — sem ligar o
-- flag de honorários (que vazaria faturamento).
create or replace function public.masor_clientes_fiscais()
returns table (
  id uuid, razao_social text, nome_fantasia text, cnpj_cpf text,
  regime_tributario text, cnae_principal text, endereco jsonb
) language sql stable security definer set search_path = public as $$
  select c.id, c.razao_social, c.nome_fantasia, c.cnpj_cpf,
         c.regime_tributario, c.cnae_principal, c.endereco
  from public.clientes c
  where public.masor_is_staff()
$$;
grant execute on function public.masor_clientes_fiscais() to authenticated;
