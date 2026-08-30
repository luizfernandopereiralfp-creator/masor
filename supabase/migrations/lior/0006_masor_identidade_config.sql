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
--
-- ------------------------------------------------------------
-- ATENÇÃO — ARQUIVO HISTÓRICO, JÁ APLICADO EM PRODUÇÃO
-- ------------------------------------------------------------
-- `scripts/apply-migration.mjs` aplica UM arquivo por caminho, sem histórico
-- de versão. Ou seja: nada impede alguém de reaplicar este arquivo.
--
-- A definição original de `masor_is_staff()` aqui era insegura — "tem linha em
-- user_roles" —, o que fazia os logins de cliente do Masor contarem como STAFF
-- e poderem ESCREVER regra tributária compartilhada entre clientes. Isso foi
-- corrigido do lado do Lior em 27/08/2026, pela migração
-- `20260827000916_masor_staff_e_acesso_por_produto.sql`.
--
-- Como este arquivo usa `CREATE OR REPLACE`, reaplicá-lo reverteria aquela
-- correção EM SILÊNCIO. Por isso a definição abaixo passou a ser
-- AUTOCORRETIVA (30/08/2026): ela detecta em que mundo está e escreve a versão
-- certa para aquele mundo. Reaplicar este arquivo hoje é inofensivo.
--
-- Não reescrever o bloco de `masor_is_staff()` para um `create or replace`
-- simples. A vulnerabilidade volta junto.
-- ============================================================

-- ---------- Helpers de identidade (namespaced, não colidem com o Lior) ----------

-- Equipe (G41). Definição AUTOCORRETIVA — ver o aviso no cabeçalho.
--
-- Mundo novo (o de hoje): existe `pode_usar_sistema` e existe
-- `organizacao_membros`, então staff do Masor é pessoa da EQUIPE liberada para
-- o produto. É a definição canônica, idêntica à de
-- `20260827000916_masor_staff_e_acesso_por_produto.sql` no repositório do Lior.
--
-- Mundo antigo (banco anterior a 26/08/2026, sem `pode_usar_sistema`): cai na
-- definição de origem, porque a nova não teria como ser resolvida ali.
do $$
begin
  if to_regprocedure('public.pode_usar_sistema(uuid, text)') is not null
     and to_regclass('public.organizacao_membros') is not null then
    execute $fn$
      create or replace function public.masor_is_staff()
      returns boolean language sql stable security definer set search_path = public as $inner$
        select exists (
                 select 1 from public.organizacao_membros m
                  where m.user_id = auth.uid() and m.is_staff = true
               )
           and public.pode_usar_sistema(auth.uid(), 'masor')
      $inner$;
    $fn$;
  else
    execute $fn$
      create or replace function public.masor_is_staff()
      returns boolean language sql stable security definer set search_path = public as $inner$
        select exists (select 1 from public.user_roles where user_id = auth.uid())
      $inner$;
    $fn$;
  end if;
end $$;

comment on function public.masor_is_staff() is
  'Equipe da G41 liberada para o Masor. A definição vive em dois lugares: aqui '
  '(autocorretiva) e em 20260827000916 no repositório do Lior. Mudar uma exige '
  'mudar a outra.';

-- Cliente atual de um login-cliente do portal (supermercado).
-- Rollout STAFF-FIRST: o Masor hoje é usado pela equipe G41 (staff escolhe o
-- cliente na tela). O mapeamento portal_clientes -> cliente para login-cliente
-- do Masor fica para a fase 2 (depende de casar conta_azul_clientes<->clientes).
-- Por ora devolve null: RLS das tabelas operacionais dá acesso via masor_is_staff().
create or replace function public.masor_cliente_atual()
returns uuid language sql stable security definer set search_path = public as $$
  select null::uuid
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
