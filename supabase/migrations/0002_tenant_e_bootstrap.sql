-- ============================================================
-- Masor — migração 0002: tenant âncora + bootstrap de perfil
-- O 1º usuário que se cadastrar vira ADMIN (equipe G41); os
-- demais entram como 'cliente' no tenant âncora. Automatiza o
-- vínculo usuário->tenant->papel sem service role.
-- ============================================================

-- Tenant âncora (Svetofor / Vantajoso) — só cria se não houver nenhum.
insert into public.tenants (nome, uf)
select 'Svetofor / Vantajoso', 'SP'
where not exists (select 1 from public.tenants);

-- Ao criar um usuário no Auth, cria o profile correspondente.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant uuid;
  v_role public.app_role;
begin
  select id into v_tenant from public.tenants order by created_at limit 1;
  if exists (select 1 from public.profiles where role = 'admin') then
    v_role := 'cliente';
  else
    v_role := 'admin'; -- primeiro usuário = admin G41
  end if;
  insert into public.profiles (user_id, tenant_id, nome, role)
  values (new.id, v_tenant, coalesce(new.raw_user_meta_data->>'nome', new.email), v_role)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
