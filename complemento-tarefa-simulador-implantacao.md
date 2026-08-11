# COMPLEMENTO DA TAREFA — Simulador Tributário de Produto (Área do Cliente)
_Especificação de implantação · G41 · 16/07/2026 · pronta para execução após conclusão das alterações atuais do Lovable_

---

## 1. Objetivo

Aba de acesso do cliente no dashboard (integração Conta Azul) onde ele informa os dados de um produto e recebe: custo de cadastro, tributos de saída e preço mínimo de venda para a margem alvo — com validação automática por IA (pesquisa de legislação) e regras por UF cadastráveis. **Referência funcional completa: arquivo `simulador-tributario-g41-v3.jsx`** (protótipo aprovado — contém o motor de cálculo, os textos, os alertas e o layout na identidade G41: navy #0B1740, âmbar #E9A74A, branco, zero vermelho).

## 2. Banco de dados (Supabase) — criar em migração única e isolada

**`tax_states`** — regras tributárias por UF (preenchidas por pesquisa de IA, nunca presumidas)
- `sigla` (PK, char 2), `nome`, `regiao` (enum: sul_sudeste | n_ne_co_es | NULL)
- `aliq_interna` (numeric, NULL = não confirmada), `equalizacao_simples` (bool, NULL), `antecipacao_st` (bool, NULL)
- `base_legal` (text), `fontes` (jsonb: [{campo, url}]), `pendencias` (jsonb: [string])
- `pesquisado_em` (date), `origem_dados` (text: "pesquisa IA" | "+ ajuste manual"), `ativo` (bool)
- Seed inicial: SP (18%, equalização=true, antecipação=true, base: RICMS/SP art. 426-A; art. 2º XVI; Portaria SRE 94/2025)

**`custom_fields`** — campos dinâmicos do formulário
- `id` (PK), `label`, `tipo` (enum: texto | numero | sim_nao), `obrigatorio` (bool), `ativo` (bool), `ordem` (int)

**`product_simulations`** — histórico por cliente
- `id`, `client_id` (FK auth), `payload` (jsonb com todos os campos preenchidos, incluindo custom_fields), `resultado` (jsonb: custo, pv, tributos), `created_at`

**`ai_reviews`** — pareceres da IA (cache por NCM+UF para reduzir custo de API)
- `id`, `simulation_id` (FK), `ncm`, `uf`, `status` (aprovado | aprovado_com_ressalvas | pendente), `resumo`, `achados` (jsonb), `created_at`
- Índice em (ncm, uf, created_at) — reutilizar parecer < 30 dias para mesmo NCM+UF antes de chamar a IA

**RLS (mesmo padrão das Configurações do Kanban):**
- `tax_states` e `custom_fields`: SELECT para todos autenticados; INSERT/UPDATE/DELETE só admin
- `product_simulations` e `ai_reviews`: cliente vê/insere apenas as próprias (client_id = auth.uid()); admin vê tudo
- Atenção à lição registrada do Kanban: conferir políticas de INSERT/UPDATE/DELETE (vulnerabilidade de auto-promoção já ocorreu lá) — rodar o Security check do Lovable antes do publish

## 3. Frontend (Lovable) — rotas NOVAS, sem tocar em telas existentes

**`/simulador`** (cliente): formulário em blocos (empresa/operação → fornecedor → produto/ICMS → PIS-COFINS → campos dinâmicos → margem) + painel de resultado estilo canhoto fiscal + alertas. Copiar lógica e textos do v3. Validação por IA é AUTOMÁTICA (debounce ~2s quando preço + NCM de 8 dígitos preenchidos; indicador de status, sem botão).

**`/admin/config-tributaria`** (admin): cadastro de UF informando APENAS a sigla → dispara webhook n8n de pesquisa de legislação → grava em `tax_states` com fontes e data. Tabela com pendências visíveis ("⚠ confirmar"), ajuste manual de alíquota (auditado em origem_dados), ação "atualizar" (re-pesquisa), gestão de campos dinâmicos.

**Regras de negócio inegociáveis (anti-invenção):**
1. Campo de UF não confirmado pela pesquisa = NULL no banco — NUNCA valor padrão silencioso
2. Parser aceita só tipos estritos (número/booleano); resposta fora do formato → NULL + pendência
3. Simulação com UF pendente = resultado marcado PROVISÓRIO; regra não confirmada NÃO é aplicada (nem sim nem não — alerta ao cliente)
4. Toda pendência (UF ou parecer ≠ aprovado) abre tarefa automática no Kanban para o setor fiscal

## 4. Workflows n8n (instância n8n.ferpereira.com)

**W1 — "G41 — Validação Fiscal de Produto (IA)"**: JSON pronto para importar (`n8n-workflow-validacao-fiscal-g41.json`). Webhook `/valida-produto-g41` → Claude (claude-sonnet-4-6 + web_search) → parser → IF pendência → cria tarefa no Kanban (endpoint público, com X-Idempotency-Key = execution.id) → responde ao app.

**W2 — "G41 — Pesquisa de Legislação UF"** (criar no mesmo padrão): Webhook `/pesquisa-uf-g41` recebe {sigla} → Claude + web_search com o prompt anti-invenção do v3 (fontes obrigatórias por campo; não confirmado = null) → UPSERT em `tax_states` via Supabase REST → responde. **+ Schedule mensal**: re-pesquisa todas as UFs ativas; se detectar mudança de regra vs. valor gravado, abre tarefa no Kanban ("Mudança legislativa detectada em <UF>") ANTES de sobrescrever — humano aprova.

**Secrets (nunca no workflow; criar em Credentials do n8n):** ANTHROPIC_API_KEY (header x-api-key), N8N_TASK_INTAKE_API_KEY (Kanban), SUPABASE_SERVICE_ROLE_KEY (upsert tax_states). No Lovable: URL dos webhooks em Edge Function secret, com token de assinatura X-Webhook-Token validado no n8n.

## 5. Ordem de implantação e critérios de aceite

1. ✅ Pré-requisito: alterações atuais do Lovable concluídas, build verde, checkpoint criado
2. Migração Supabase (tabelas + RLS + seed SP) — isolada, sem outra migração na fila
3. Rota `/simulador` com motor de cálculo (sem IA ainda) — aceite: reproduz os 8 casos do e-mail de referência (shampoo custo 4,74 / PV 7,65; pão de queijo 5,87; bolinho 15,05 sem ICMS na saída; lasanha 11,38)
4. Rota `/admin/config-tributaria` (leitura/edição manual) — aceite: RLS bloqueia edição por não-admin
5. Importar W1 no n8n + conectar validação automática — aceite: parecer aparece no app; pendência cria card no Kanban sem duplicar em reexecução
6. Criar W2 + conectar cadastro de UF — aceite: cadastrar "MG" preenche a tabela com fontes/data; campo não confirmado aparece como pendência; simulação com MG pendente sai como provisória
7. Ativar schedule mensal do W2 — aceite: execução manual gera tarefa de revisão quando há divergência
8. Security check do Lovable + teste completo na aba logada de produção (padrão do projeto)

## 6. Bloqueios conhecidos

- n8n-mcp do Claude ainda aponta para sparoyoutube.app.n8n.cloud (correto: n8n.ferpereira.com) — corrigir config no claude_desktop_config.json para permitir criação/teste dos workflows assistida; enquanto isso, importar os JSONs manualmente
- Custo de API: validação automática usa web_search — o cache por NCM+UF (tabela ai_reviews) é obrigatório antes de liberar para todos os clientes

## 7. Contexto de negócio (para quem pegar a tarefa)

Nasceu do caso real de precificação com margem de 20% (cosméticos RS→SP e alimentos MG→SP): confusões clássicas de DIFAL em revenda, "diferença de 6%" somada indevidamente ao custo, ST embutida, monofásico com CST errado. O simulador educa o cliente e filtra o que realmente precisa do fiscal. Regras mudam (ex.: Portaria SRE 94/2025 tirou cosméticos da ST em SP em 04/2026) — por isso pesquisa com fontes + re-verificação mensal, e nada preenchido sem confirmação.
