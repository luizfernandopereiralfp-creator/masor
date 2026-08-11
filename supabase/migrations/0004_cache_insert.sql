-- ============================================================
-- Masor — migração 0004: cache de pareceres gravável
-- ai_reviews é conhecimento COMPARTILHADO (não tem dado de tenant).
-- Qualquer usuário autenticado pode contribuir com o cache.
-- ============================================================

drop policy if exists ai_reviews_ins on public.ai_reviews;
create policy ai_reviews_ins on public.ai_reviews for insert to authenticated with check (true);
