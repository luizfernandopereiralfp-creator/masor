-- Masor — camada de regras estaduais para o motor de ICMS-ST (Fase estadual).
-- ADITIVO e seguro: só adiciona coluna jsonb (nullable/default), nada destrutivo.
-- Guarda regras por-UF estruturadas (fcp_default_pct, mva_ajustada_formula,
-- pauta/PMPF, fecoep...) sem precisar de DDL por estado novo. As regras por
-- produto continuam em masor_ncm_rules.parametros (jsonb, por NCM x UF/CEST).

alter table public.masor_tax_states
  add column if not exists parametros jsonb not null default '{}';

comment on column public.masor_tax_states.parametros is
  'Regras estaduais estruturadas (jsonb): fcp_default_pct, mva_ajustada_formula, regras de pauta/PMPF, fecoep. Preenchido por curadoria/IA com fonte+vigência; nada hardcoded no motor.';
