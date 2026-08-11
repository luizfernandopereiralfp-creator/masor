# CLAUDE.md — Motor de Cálculo Tributário G41

## O que é este projeto

Sistema para automatizar cálculos tributários de produtos (ICMS, ST, DIFAL, antecipação, PIS/COFINS, formação de custo e preço mínimo de venda) para clientes da G41 Inteligência Contábil. Evolução do "Simulador Tributário" prototipado em jul/2026; este repositório é o motor/sistema definitivo.

**Idioma: tudo em português brasileiro** — código pode ter identificadores em inglês, mas UI, mensagens, comentários de regra fiscal e commits em pt-BR.

## Arquivos de referência (em `/docs` ou raiz — NÃO reescrever, são fonte da verdade)

- `HANDOFF-simulador-tributario-g41.md` — contexto completo da conversa de origem. LEIA PRIMEIRO em sessão nova.
- `simulador-tributario-g41-v3.jsx` — protótipo aprovado: motor de cálculo, textos, alertas e layout de referência.
- `complemento-tarefa-simulador-implantacao.md` — spec de implantação: schema Supabase + RLS, rotas, ordem de execução com critérios de aceite.
- `n8n-workflow-validacao-fiscal-g41.json` — workflow W1 pronto (validação de produto por IA).
- `G41_custo_precificacao_produtos.xlsx` — massa de teste oficial (casos reais).

## Regras de negócio INEGOCIÁVEIS

1. **Nada é inventado.** Regra tributária não confirmada por fonte = `null` no dado, pendência visível, e o cálculo NÃO a aplica (nem sim nem não) — resultado sai marcado como PROVISÓRIO. Nunca usar valor padrão silencioso para regra fiscal.
2. **Anti-invenção em 3 camadas:** prompt de IA exige fonte (URL) por campo e null quando não confirmado; parser aceita apenas tipos estritos (número/booleano); UI/saída expõe pendências.
3. **Toda pendência abre tarefa no Kanban G41** (`tarefas.g41.com.br/api/public/tasks`, POST, headers `X-API-Key` + `X-Idempotency-Key`). Idempotência obrigatória.
4. **IA sem botões:** validação de produto dispara automática (debounce ~2s quando preço + NCM de 8 dígitos presentes); cadastro de UF = sigla → pesquisa de legislação automática grava regras com fontes e data.
5. **Cache de pareceres por NCM+UF** (reutilizar < 30 dias) antes de chamar IA com web search — controle de custo obrigatório.
6. **Re-pesquisa mensal de UFs:** divergência detectada abre tarefa para aprovação humana ANTES de sobrescrever regra.
7. **Regras vivem em dados, não em código:** tabelas `tax_states`, `custom_fields` (+ `product_simulations`, `ai_reviews`); campos dinâmicos entram no formulário e no payload da IA sem deploy.

## Motor fiscal — regras vigentes (verificadas em jul/2026)

- Alíquotas interestaduais: 12% (S/SE → S/SE), 7% (destino N/NE/CO/ES), 4% (importado, Res. 13/2012). Interna default SP: 18% (parametrizada por UF/NCM).
- DIFAL só em uso/consumo/ativo. Em REVENDA no regime normal: entrada gera crédito, saída debita alíquota interna sobre o preço de venda — **diferença de alíquotas NUNCA é somada ao custo**.
- Cosméticos/perfumaria/higiene: FORA da ST em SP desde 01/04/2026 (Portaria SRE 94/2025).
- ST retida na nota: valor cheio é custo, sem crédito, sem ICMS na revenda (o diferencial já está dentro do cálculo da ST).
- Item da lista de ST do destino chegando sem retenção: antecipação na entrada (art. 426-A RICMS/SP), estimável com MVA.
- Empresa Simples: sem créditos; equalização na entrada interestadual conforme flag da UF (SP: sim). Fornecedor Simples: crédito limitado ao % informado na NF (LC 123 art. 23); sem informação = zero.
- PIS/COFINS Lucro Real: crédito 9,25% sobre (preço − ICMS destacado); monofásico (Lei 10.147/2000): SEM crédito na compra, alíquota zero na venda; alíquota zero (cesta básica): sem débito na venda.
- Reforma Tributária (LC 214/2025): 2026 é ano-teste — IBS 0,1% + CBS 0,9% apenas informativos (art. 348), sem impacto no custo. Preparar revisões: 2027 (fim PIS/COFINS/monofásico) e 2029–2032 (transição ICMS→IBS).
- Preço mínimo: `PV = custo ÷ (1 − tributos_saída − margem)` (margem líquida sobre a venda). Markup entrega margem líquida menor que o alvo — mostrar as duas.

## Regra de desenvolvimento fiscal

**NUNCA implementar ou alterar regra tributária de memória.** Antes de codar qualquer regra nova: pesquisar a legislação vigente, citar a fonte no comentário do código e, em caso de dúvida, marcar como pendência em vez de assumir. Legislação muda (ex.: Portaria SRE 94/2025 mudou a ST de SP em abril/2026).

## Testes

Todo cálculo novo/alterado deve passar na massa de teste oficial (xlsx). Casos-âncora (Lucro Real, fornecedor regime normal, SP destino, margem 20% sobre venda):
- Shampoo R$ 5,39 (monofásico, sem ST): custo 4,74 · PV mínimo 7,65
- Pão de queijo R$ 6,67 (MG, sem ST): custo 5,87 — e os "6%" NÃO entram no custo
- Bolinho R$ 15,05 e Lasanha R$ 11,38 (MG, com ST): custo = valor da nota; ICMS de saída = 0

## Identidade visual (qualquer UI)

Navy `#0B1740`, âmbar `#E9A74A`, branco. **ZERO vermelho** (alertas/erros em âmbar). Valores fiscais e códigos em fonte mono (IBM Plex Mono); texto em Archivo. Painel de resultado no estilo "canhoto de nota fiscal". Tagline em fechos: "Insights Impulsionam".

## Infraestrutura do ecossistema G41

- Kanban: `tarefas.g41.com.br` (Lovable + Supabase) — endpoint público de tarefas acima.
- Sistema cliente: `sistema.g41.com.br` (dashboard integração Conta Azul; painel de implantação em `/admin/implantacao`).
- n8n: `n8n.ferpereira.com` (ATENÇÃO: config do n8n-mcp no Claude Desktop aponta para instância errada `sparoyoutube.app.n8n.cloud` — corrigir antes de automatizar via MCP).
- Evolution API (WhatsApp): `evo.ferpereira.com`, instância `g41-principal`.

## Pendências herdadas (estado em 16/07/2026)

- [ ] Aguardar build do Lovable concluir + checkpoint antes de implantar no sistema existente (migração Supabase isolada).
- [ ] Complementar tarefa em `sistema.g41.com.br/admin/implantacao` com a spec.
- [ ] Criar workflow W2 "Pesquisa de Legislação UF" + schedule mensal (padrão do W1).
- [ ] Corrigir URL do n8n-mcp.
- [ ] Caso de origem: aguardando NCMs e regime dos fornecedores do cliente para números definitivos.

## Preferências do Fernando (dono do projeto)

Desafie ideias e aponte riscos proativamente — não concorde por padrão. Respostas concisas e objetivas. Sequenciamento importa: questionar ordem de implementação quando houver dependências. Nunca afirmar legislação sem verificar.
