-- Masor — seed de regras de ICMS-ST de SP (curadoria especialista, 2026).
-- ADITIVO. Só semeia o que está CONFIRMADO em fonte oficial; MVA/PMPF exatos
-- ficam null (→ o motor marca pendência, não chuta). SP está desmontando a ST
-- em ondas em 2026: a maioria dos itens de supermercado SAIU do regime.

-- Correção do FCP de SP: FECOEP (Lei 16.006/2015) = 2% SÓ sobre bebidas
-- alcoólicas e fumo; ZERO para o resto do supermercado. Corrige o mito de "2%
-- em tudo" dos ERPs (destacar FCP indevido = imposto a maior).
update public.masor_tax_states
   set parametros = coalesce(parametros, '{}'::jsonb) || jsonb_build_object('fcp_default_pct', 0),
       updated_at = now()
 where sigla = 'SP';

-- Helper de seed por NCM (SP). parametros jsonb guarda a regra confirmada.
insert into public.masor_ncm_rules (ncm, uf, parametros, fontes, origem, pesquisado_em) values
-- SAÍRAM da ST em SP (sujeito_st=false → motor não cobra ST; correto e datado):
('22011000','SP', '{"sujeito_st":false,"fcp_pct":0,"vigencia":"fora da ST desde 01/07/2026","motivo":"água mineral excluída da ST-SP"}', '[{"ref":"Portaria SRE 09/2026","url":"https://legislacao.fazenda.sp.gov.br"}]', 'curadoria G41', '2026-08-18'),
('21050000','SP', '{"sujeito_st":false,"fcp_pct":0,"vigencia":"fora da ST desde 01/07/2026","motivo":"sorvete excluído da ST-SP"}', '[{"ref":"Portaria SRE 09/2026","url":"https://legislacao.fazenda.sp.gov.br"}]', 'curadoria G41', '2026-08-18'),
('48181000','SP', '{"sujeito_st":false,"fcp_pct":0,"vigencia":"fora da ST desde 01/07/2026","motivo":"papel higiênico excluído da ST-SP"}', '[{"ref":"Portaria SRE 09/2026","url":"https://legislacao.fazenda.sp.gov.br"}]', 'curadoria G41', '2026-08-18'),
('85395000','SP', '{"sujeito_st":false,"fcp_pct":0,"vigencia":"fora da ST desde 01/01/2026","motivo":"lâmpadas excluídas da ST-SP"}', '[{"ref":"Portaria SRE 64/2025","url":"https://legislacao.fazenda.sp.gov.br"}]', 'curadoria G41', '2026-08-18'),
-- Cesta básica: NÃO é ST; redução de base p/ carga 7% (Dec 69.207/2024, até 31/12/2026):
('09012100','SP', '{"sujeito_st":false,"fcp_pct":0,"base_reduzida_pct":0.611,"reducao_alcanca_st":false,"aliq_interna_override":7,"vigencia":"carga 7% até 31/12/2026","motivo":"café — cesta básica, base reduzida"}', '[{"ref":"Decreto 69.207/2024; RICMS/SP Anexo II art.3º","url":"https://legislacao.fazenda.sp.gov.br/Paginas/an2art003.aspx"}]', 'curadoria G41', '2026-08-18'),
('15071000','SP', '{"sujeito_st":false,"fcp_pct":0,"base_reduzida_pct":0.611,"reducao_alcanca_st":false,"aliq_interna_override":7,"vigencia":"carga 7% até 31/12/2026","motivo":"óleo de soja — cesta básica"}', '[{"ref":"Decreto 69.207/2024; RICMS/SP Anexo II art.3º","url":"https://legislacao.fazenda.sp.gov.br/Paginas/an2art003.aspx"}]', 'curadoria G41', '2026-08-18'),
('17019900','SP', '{"sujeito_st":false,"fcp_pct":0,"base_reduzida_pct":0.611,"reducao_alcanca_st":false,"aliq_interna_override":7,"vigencia":"carga 7% até 31/12/2026","motivo":"açúcar — cesta básica"}', '[{"ref":"Decreto 69.207/2024; RICMS/SP Anexo II art.3º","url":"https://legislacao.fazenda.sp.gov.br/Paginas/an2art003.aspx"}]', 'curadoria G41', '2026-08-18'),
('10063021','SP', '{"sujeito_st":false,"fcp_pct":0,"base_reduzida_pct":0.611,"reducao_alcanca_st":false,"aliq_interna_override":7,"vigencia":"carga 7% até 31/12/2026","motivo":"arroz — cesta básica"}', '[{"ref":"Decreto 69.207/2024; RICMS/SP Anexo II art.3º","url":"https://legislacao.fazenda.sp.gov.br/Paginas/an2art003.aspx"}]', 'curadoria G41', '2026-08-18'),
-- PERMANECE na ST: cerveja (FCP 2%); MVA/PMPF exatos = PENDENTE (motor não chuta):
('22030000','SP', '{"sujeito_st":true,"fcp_pct":2,"mva_pct":null,"pmpf_unitario":null,"vigencia":"permanece na ST em 2026","motivo":"cerveja — na ST; MVA/PMPF a confirmar no anexo"}', '[{"ref":"Portaria SRE 64/2025 (exceção cerveja/chope)","url":"https://legislacao.fazenda.sp.gov.br"}]', 'curadoria G41', '2026-08-18')
on conflict (ncm, uf) do update
  set parametros = excluded.parametros,
      fontes = excluded.fontes,
      origem = excluded.origem,
      pesquisado_em = excluded.pesquisado_em,
      updated_at = now();
