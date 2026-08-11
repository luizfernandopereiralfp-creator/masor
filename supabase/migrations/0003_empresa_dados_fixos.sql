-- ============================================================
-- Masor — migração 0003: dados fixos da empresa (tenant)
-- Campos que NÃO mudam a cada consulta ficam no cadastro da
-- empresa (tenant) e pré-preenchem as análises.
-- ============================================================

alter table public.tenants add column if not exists razao_social text;
alter table public.tenants add column if not exists regime_tributario text;   -- lucro_real|presumido|simples
alter table public.tenants add column if not exists municipio text;
alter table public.tenants add column if not exists markup_padrao numeric;     -- % markup/margem padrão
alter table public.tenants add column if not exists das_efetivo numeric;        -- % DAS efetivo (Simples)

-- Permite o próprio tenant editar seus dados (além da equipe G41).
drop policy if exists tenants_upd on public.tenants;
create policy tenants_upd on public.tenants for update to authenticated
  using (public.is_staff() or id = public.current_tenant())
  with check (public.is_staff() or id = public.current_tenant());

-- Semente de conveniência para o tenant âncora (Svetofor/Vantajoso).
update public.tenants
set regime_tributario = coalesce(regime_tributario, 'lucro_real'),
    uf = coalesce(uf, 'SP'),
    markup_padrao = coalesce(markup_padrao, 20)
where nome = 'Svetofor / Vantajoso';
