-- ============================================================
-- Masor no banco do LIOR — 0010: cooldown do "consumo indevido" (656)
-- ADITIVA. Coluna p/ registrar até quando a SEFAZ bloqueou o CNPJ,
-- para o guard estender o intervalo além de 1h quando levar 656.
-- ============================================================
alter table public.masor_fiscal_config
  add column if not exists bloqueado_ate timestamptz;
