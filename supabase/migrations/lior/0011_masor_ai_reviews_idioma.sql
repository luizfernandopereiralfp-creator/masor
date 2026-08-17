-- ============================================================
-- Masor no banco do LIOR — 0011: idioma no cache de pareceres
-- ADITIVA. Separa o cache por idioma (PT/RU) para não devolver
-- um parecer em português no modo russo (e vice-versa).
-- ============================================================
alter table public.masor_ai_reviews
  add column if not exists idioma text not null default 'pt';
create index if not exists masor_ar_cache on public.masor_ai_reviews (ncm, uf, regime, idioma, created_at desc);
