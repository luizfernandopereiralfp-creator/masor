# HANDOFF — Simulador Tributário G41 (contexto completo da conversa de origem)
_Leia este arquivo por inteiro antes de qualquer ação. Ele substitui o histórico da conversa no claude.ai (16/07/2026)._

## O que é este projeto

Nova aba de acesso do cliente no sistema G41 (dashboard de integração Conta Azul, dentro do ecossistema construído no Lovable + Supabase + n8n): o cliente informa os dados de um produto e recebe custo de cadastro, tributos de saída e preço mínimo de venda para a margem alvo. Validação por IA é AUTOMÁTICA (sem botão) e o cadastro de novas UFs é feito por PESQUISA DE LEGISLAÇÃO via IA — nada preenchido sem fonte.

Nasceu de um caso real: e-mail de cliente (Lucro Real, SP) comprando cosméticos do RS e alimentos de MG, confuso com DIFAL, "diferença de 6%", ST e margem de 20%. As respostas técnicas que fundamentam toda a lógica estão resumidas na seção "Regras fiscais" abaixo.

## Arquivos nesta pasta

1. `simulador-tributario-g41-v3.jsx` — protótipo APROVADO e referência funcional completa (motor de cálculo, textos, alertas, layout). É a fonte da verdade da lógica.
2. `n8n-workflow-validacao-fiscal-g41.json` — workflow W1 pronto para importar no n8n (validação de produto: webhook → Claude+web search → parser → IF pendência → tarefa no Kanban → resposta).
3. `complemento-tarefa-simulador-implantacao.md` — ESPECIFICAÇÃO DE IMPLANTAÇÃO completa: tabelas Supabase + RLS, rotas, workflows, ordem de execução em 8 passos com critérios de aceite, bloqueios. Seguir à risca.
4. `G41_custo_precificacao_produtos.xlsx` — planilha com os 8 produtos do caso real; os valores servem de massa de teste (critério de aceite do passo 3 da spec).

## Decisões travadas (não reabrir sem o Fernando autorizar)

- **Anti-invenção em 3 camadas**: prompt exige fonte por campo e null quando não confirmado; parser aceita só tipos estritos; UI mostra pendência e o simulador NÃO aplica regra não confirmada (marca resultado como provisório). Nenhum valor padrão silencioso.
- **IA sem botões**: validação de produto dispara sozinha (debounce ~2s com preço + NCM de 8 dígitos); cadastro de UF = digitar a sigla → pesquisa automática grava na tabela com fontes e data.
- **Toda pendência abre tarefa no Kanban** (tarefas.g41.com.br, endpoint público /api/public/tasks, header X-API-Key, idempotência via X-Idempotency-Key).
- **Cache de pareceres por NCM+UF** (tabela ai_reviews, reutilizar < 30 dias) é obrigatório antes de liberar a todos — controla custo de API com web search.
- **Re-pesquisa mensal de UFs** (schedule no W2): mudança detectada abre tarefa para aprovação humana ANTES de sobrescrever.
- **Identidade visual**: navy #0B1740, âmbar #E9A74A, branco. ZERO vermelho (alertas em âmbar). Fontes: Archivo + IBM Plex Mono (valores fiscais em mono, painel de resultado estilo canhoto de NF).
- **Adaptabilidade**: regras vivem em tabelas (tax_states, custom_fields), editáveis sem deploy; campos dinâmicos entram no formulário e no payload da IA.

## Regras fiscais que o motor implementa (vigentes jul/2026, verificadas)

- DIFAL só em uso/consumo/ativo; revenda no regime normal = crédito na entrada (12% S/SE→SP; 7% N/NE/CO/ES; 4% importado), débito da alíquota interna sobre o preço de venda. A "diferença de alíquotas" NUNCA é somada ao custo.
- Perfumaria/cosméticos/higiene SAÍRAM da ST em SP desde 01/04/2026 (Portaria SRE 94/2025).
- ST retida na nota = custo cheio, sem crédito, sem ICMS na revenda; o diferencial já está dentro do cálculo da ST.
- Produto na lista de ST do destino sem retenção = antecipação na entrada (art. 426-A RICMS/SP), estimável com MVA.
- Empresa Simples: sem créditos; SP cobra equalização na entrada interestadual p/ revenda (flag por UF).
- Fornecedor Simples: crédito limitado ao % informado na NF (LC 123 art. 23); sem informação = zero.
- Lucro Real: crédito PIS/COFINS 9,25% sobre (preço − ICMS destacado), EXCETO monofásico (Lei 10.147/2000 — sem crédito na compra, alíquota zero na venda) e alíquota zero.
- Reforma (LC 214/2025): 2026 é ano-teste (IBS 0,1% + CBS 0,9% informativos, art. 348) — sem impacto no custo; revisões em 2027 e 2029–2032.
- Margem: alvo líquido sobre a VENDA → PV = custo ÷ (1 − tributos de saída − margem). Markup gera margem líquida menor que o alvo (o app mostra as duas).

## Estado atual e bloqueios

- O Lovable está executando OUTRAS alterações no sistema → NÃO implantar nada até o build atual concluir, publicar e criar checkpoint (decisão já tomada: implementar como rota/página nova + migração isolada, sem tocar telas existentes).
- A tarefa de implantação já existe em sistema.g41.com.br/admin/implantacao — falta colar/complementar com o conteúdo do arquivo 3 (a tentativa via navegador falhou por conflito de sessão do Chrome).
- n8n-mcp do Claude aponta para URL errada (sparoyoutube.app.n8n.cloud; correto: n8n.ferpereira.com) — corrigir em %APPDATA%\Claude\claude_desktop_config.json ou importar os JSONs manualmente.
- Falta criar o W2 ("Pesquisa de Legislação UF" + schedule mensal), no mesmo padrão do W1.

## Próximos passos sugeridos (nesta ordem)

1. Confirmar com o Fernando se o build do Lovable terminou.
2. Gerar o prompt único do Lovable (migração + rotas) a partir do arquivo 3.
3. Criar o JSON do W2.
4. Executar a ordem de implantação do arquivo 3, validando cada critério de aceite (usar a planilha como massa de teste).

## Sobre o Fernando / estilo de trabalho

Founder da G41 Inteligência Contábil (Curitiba). Prefere ser desafiado a ser validado; quer riscos apontados proativamente; conteúdo extremamente conciso e objetivo; tudo em português brasileiro; NUNCA afirmar legislação/frameworks sem verificar (pesquisar antes); zero vermelho em qualquer material G41.
