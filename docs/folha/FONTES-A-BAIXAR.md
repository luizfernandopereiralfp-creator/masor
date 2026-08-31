# Checklist de verificação em fonte primária — módulo de Folha

> **Por que este arquivo existe.** A pesquisa de 30/08/2026 rodou num ambiente com
> **egress bloqueado por política de rede para `*.gov.br`, `planalto.gov.br` e `in.gov.br`**
> (403 no proxy, registrado em `recentRelayFailures`). Nenhum PDF oficial pôde ser aberto.
> Os seis documentos de pesquisa foram escritos com selo de confiança por afirmação e
> acumulam **cerca de 85 pendências numeradas**.
>
> Pela regra inegociável do projeto (`CLAUDE.md`), **nada disso está lastreado** enquanto
> não for lido no texto original. Este arquivo é a lista do que baixar, numa máquina com
> acesso aberto, para converter pesquisa em especificação.

## Como executar

1. Baixar cada item da lista **da origem oficial**.
2. Arquivar em `docs/folha/fontes/` com **nome, data de download e hash SHA-256**
   (mesmo padrão de versionamento do `docs/fontes-oficiais.md`).
3. Reabrir o documento de pesquisa correspondente e **elevar o selo** das afirmações que o
   texto original confirmar; corrigir as que ele contrariar.
4. O que o texto original **não** responder continua pendência — e o motor trata como
   parâmetro não confirmado: resultado **PROVISÓRIO**, pendência visível, tarefa no Kanban.

**Regra de corte:** os itens marcados **BLOQUEADOR** impedem o início da codificação da
área correspondente. Os demais podem correr em paralelo ao desenvolvimento.

---

## Bloco A — eSocial (portal → Documentação Técnica)

| # | Documento | Fecha | Prioridade |
|---|---|---|---|
| A1 | **MOS S-1.3 consolidado** (versão mais recente) | prazo de envio de 25 eventos; semântica do `infoFech` do S-1299; obrigatoriedade condicional do S-1020; eventos extemporâneos | **BLOQUEADOR** |
| A2 | **Leiautes S-1.3** (documento de leiaute por evento) | campo "Prazo de envio" de cada evento; conferência do mapa de 50 eventos | **BLOQUEADOR** |
| A3 | **NT S-1.3 nº 06/2026** | regra do **CNPJ alfanumérico** — define o tipo de `nrInsc` no modelo de dados | **BLOQUEADOR** |
| A4 | **Pacote ZIP de XSD S-1.3 vigente** (eventos + comunicação) | geração dos tipos do módulo; versões vigentes de cada schema | **BLOQUEADOR** |
| A5 | **Manual de Orientação do Desenvolvedor (MOD)**, v1.15 ou posterior | as 8 URLs de webservice; limite de eventos e de bytes por lote; confirmação de que o lote não é assinado, só o evento; formação do `Id`; política de polling | **BLOQUEADOR** |
| A6 | **Mensagens do Sistema** (catálogo de ocorrências) | tabela de `cdResposta` e tratamento de retorno com erro | Alta |
| A7 | **Tabelas do eSocial** (em especial a de FPAS/Terceiros) | rateio de Terceiros por FPAS — divergência entre fontes na pesquisa | Alta |
| A8 | Notícia/norma do **novo padrão de certificado em produção (24/06/2026)** | requisitos de TLS e cadeia; risco de parada silenciosa da integração | Alta |
| A9 | **Cronograma de implantação** + Portarias Conjuntas de obrigatoriedade | matriz de grupos e fases | Média |
| A10 | Documentação técnica — verificar se existe **S-1.4 anunciada** | roadmap do módulo | Média |

> **Contradição a resolver neste bloco:** dois documentos de pesquisa citam consolidações
> diferentes do MOS (`NO 11/2026` e `NO 07/2026`). O MOS baixado decide qual é a vigente.

## Bloco B — Receita Federal

| # | Documento | Fecha | Prioridade |
|---|---|---|---|
| B1 | **Lei 15.270/2025** + **IN RFB 2.299/2025** | **definição de RBM do redutor do IRRF** (bruto ou tributável após INSS). Muda o imposto de toda folha entre R$ 5.000,01 e R$ 7.350,00 | **BLOQUEADOR** |
| B2 | **Portaria Interministerial MPS/MF nº 13/2026** (Anexo II) | tabela de faixas e teto do INSS 2026 | **BLOQUEADOR** |
| B3 | **IN RFB 2.005/2021 consolidada** + **IN RFB 2.248/2025** | prazo da DCTFWeb, DCTFWeb Anual do 13º e regra de dia não útil | **BLOQUEADOR** |
| B4 | **IN RFB 2.110/2022** (Anexos II e III) | Terceiros por FPAS; posição da RFB sobre **INSS no aviso prévio indenizado** | Alta |
| B5 | **IN RFB 1.500/2014** (arts. 11 e 65) | IRRF de férias calculado em separado; isenção do abono pecuniário | Alta |
| B6 | **Manual DCTFWeb** + Perguntas e Respostas | procedimento de **retificação com DARF já pago** — caso mais frequente de suporte | Alta |
| B7 | **Manual da EFD-Reinf** vigente | eventos das séries R-2xxx/R-4xxx e prazos | Média |
| B8 | Norma do **comprovante de rendimentos** pós-extinção da DIRF | obrigação anual do módulo, hoje sem base normativa confirmada | Alta |
| B9 | Legislação do **IRRF sobre rendimentos do trabalho** | prazo e código de recolhimento da guia mensal | Alta |

## Bloco C — Ministério do Trabalho e FGTS

| # | Documento | Fecha | Prioridade |
|---|---|---|---|
| C1 | **Manual do FGTS Digital** (versão vigente) | prazo do dia 20 e **regra de ajuste quando não é dia útil**; base da multa de 40%; multa rescisória do aprendiz | **BLOQUEADOR** |
| C2 | **Portaria MTP 667/2021 compilada** + **Portaria MTE 1.131/2025** | **valores das multas do eSocial** — nenhum número de multa foi reproduzido na pesquisa, por decisão | **BLOQUEADOR** para telas de risco e material comercial |
| C3 | **Portaria MTP 671/2021 compilada** + anexos | ponto eletrônico; **layouts AFD e AEJ**; dispensa do livro de registro em papel | Alta |
| C4 | Legislação do **FGTS Digital** (Portaria MTE 240/2024 e correlatas) | norma vigente; data formal do fim da GFIP para fins de FGTS | Média |
| C5 | **Sistema Mediador (CCT/ACT)** — verificar existência de API ou dados abertos | alimentação da tabela viva de convenção coletiva por cliente | **BLOQUEADOR** para o cadastro de CCT |

## Bloco D — Planalto (texto de lei)

| # | Norma | Fecha | Prioridade |
|---|---|---|---|
| D1 | **Decreto 12.797/2025** | salário mínimo vigente, valor-dia e valor-hora | **BLOQUEADOR** |
| D2 | **Lei 8.036/1990**, arts. 18 e 22 | percentual de **juros de mora do FGTS** em atraso — fontes divergem entre 0,5% e 1% ao mês | Alta |
| D3 | **Lei 8.212/1991**, arts. 21, 22, 22-A, 25 e 32-A | alíquotas de contribuinte individual; encargos patronais; rural | Alta |
| D4 | **CLT**, arts. 41, 47, 47-A, 64, 135, 145, 459, 462, 477, 482 e 484-A | multas administrativas; divisor do salário-hora; prazos de férias e de pagamento; limite de descontos; rescisão | Alta |
| D5 | **Lei 12.546/2011** (arts. 7º e 8º) + **Lei 14.973/2024** | setores e alíquotas da CPRB; cronograma da reoneração | Alta |
| D6 | **LC 123/2006**, arts. 13, 18 e 18-C | Simples Anexo IV; limite do MEI empregador | Média |
| D7 | **Decreto 9.579/2018** (arts. 51–57) e **Lei 11.788/2008** | cota e regras do aprendiz; o que não incide sobre estágio | Média |
| D8 | Verificar **lei de licença-paternidade** publicada em 2025/2026 | duração vigente do afastamento | Média |

## Bloco E — ANPD e outros

| # | Documento | Fecha | Prioridade |
|---|---|---|---|
| E1 | **Resolução CD/ANPD nº 15/2024** | critérios de risco relevante e prazo de comunicação de incidente | Alta |
| E2 | Orientação da ANPD sobre **dados de crianças e adolescentes** | tratamento de dependentes menores na folha | Alta |
| E3 | **Layout CNAB 240 (FEBRABAN)** vigente | remessa bancária de pagamento de salários em lote | Média |
| E4 | Leis estaduais de **piso regional** das UFs atendidas | piso por UF — hoje `null` no modelo, por decisão | Alta |

---

## RESOLVIDOS EM 30/08/2026 (ver `fontes/VERIFICACAO.md`)

Baixados da origem, com hash arquivado: **MOD v1.15**, **MOS S-1.3 consolidado até a NO
11/2026 retificada**, **NT S-1.3 06/2026 rev.** e o **pacote de XSD de 01/07/2026**.

| Item | Situação |
|---|---|
| **F1** — existe API REST oficial? | **FECHADO: não existe.** O documento 05 estava errado |
| **F3** — qual MOS está vigente | **FECHADO: NO 11/2026 retificada.** Os documentos 04, 05 e 06 estavam desatualizados |
| **F4** — qual NT do leiaute | **FECHADO: NT 06/2026 rev. 09/04/2026.** O documento 03 estava desatualizado |
| **F6** — eventos por lote | **FECHADO: 50** |
| **A5** — endpoints e limites | **FECHADO.** Quatro hosts e o teto de 5 MB registrados |
| **P09-1** — snapshot de XSD do catálogo de rubricas | **Continua aberto.** O pacote vigente é de 01/07/2026; o catálogo foi montado sobre um de 13/02/2026 e precisa ser reconferido |

---

## Bloco F — itens abertos pela auditoria interna

Ver `AUDITORIA-anti-invencao.md`. Estes não são pendências das frentes de pesquisa: são
**contradições entre os documentos**, que só a fonte primária resolve.

| # | Contradição | Fecha com | Prioridade |
|---|---|---|---|
| F1 | **Existe API REST oficial do eSocial?** Um documento afirma que sim, com URL de especificação de recepção de lote no portal; outro conclui que não existe. Muda a arquitetura do transporte e o esforço de construção | A especificação de recepção de lote citada + o MOD (item A5) | **BLOQUEADOR da decisão** |
| F2 | **Valores das multas do eSocial e da DCTFWeb** — publicados como confirmados num documento, proibidos de reproduzir em outro | Itens C2 e B-art. 32-A | **BLOQUEADOR** de proposta comercial e de tela |
| F3 | **Qual consolidação do MOS está vigente** — dois documentos citam notas de orientação com quatro versões de diferença | Item A1 | Alta |
| F4 | **Qual nota técnica do leiaute está vigente** — um documento usa NT de 2025, cinco usam a de 2026 | Item A3 | Alta |
| F5 | **Versão do Manual do FGTS Digital** — duas versões diferentes citadas | Item C1 | Média |
| F6 | **Número de eventos do S-1.3** — 50 (conferido contra XSD), 44 e 48 aparecem nos documentos | Item A2 | Média |
| F7 | **Licença da biblioteca `sped-esocial`** — um documento diz ter lido o LICENSE, outro diz que o GitHub reporta licença indefinida | Abrir o LICENSE e registrar o hash | Média (jurídico) |
| F8 | **Esforço da camada de transmissão** — 4 a 7 semanas num documento, 4 a 7 pessoa-mês em outro, para escopos que se sobrepõem | Reconciliar os escopos antes de usar o número em decisão | **Alta para a decisão** |

## Bloco G — itens abertos por `10-migracao-ponto-e-holerite.md`

Aberto em 30/08/2026 pela especificação de **migração de sistema, ponto eletrônico e
holerite**. São as regras legais de que a engenharia dessas três frentes depende e que a
rodada de pesquisa não pôde ler (egress `*.gov.br` bloqueado).

| # | Documento | Fecha | Prioridade |
|---|---|---|---|
| G1 | **Portaria MTP 671/2021 — ANEXOS** (layout do **AFD** e do **AEJ**) | Parser do arquivo de ponto; reprodutibilidade do AEJ; se o AEJ carrega os ajustes de marcação. Complementa o item **C3**, mas o anexo precisa de download e hash próprios | **BLOQUEADOR do parser de ponto** (T-01) |
| G2 | **CLT, art. 58 e §1º** + o verbete do TST sobre tolerância de marcação | Limite por marcação, limite diário e o **modo** (computa o tempo integral × só o excedente). Escolher errado erra em toda a carteira, todo mês | **BLOQUEADOR da apuração de horas extras** (T-02) |
| G3 | **CLT, art. 71 e §4º** (redação da Lei 13.467/2017) | Duração mínima do intervalo por faixa de jornada, percentual devido na supressão, se o devido é o período suprimido ou o intervalo inteiro, e a **natureza** da parcela — que decide as três incidências no `S-1010` | **BLOQUEADOR da rubrica de intervalo** (T-03) |
| G4 | **CLT, art. 464 e parágrafo único** | Conteúdo obrigatório do recibo de pagamento, discriminação das parcelas, assinatura/aceite e guarda | **BLOQUEADOR do holerite** (H-01, H-03, H-04, H-05) |
| G5 | **Lei 8.036/1990, art. 17** e correlatos | Obrigação de informar ao trabalhador o FGTS depositado e a periodicidade | Alta (H-02) |
| G6 | **MOS S-1.3** — capítulo de **eventos extemporâneos e retificação** | Se e como se retifica competência anterior à data de corte quando o declarante era outro sistema; se o `S-1010` precisa ser reenviado na troca de sistema | Alta (M-02, M-03) — já sob **A1**, com pergunta específica de migração |
| G7 | **Súmula 60 do TST, item II** | Prorrogação do adicional noturno após o fim da faixa. Muda o resultado da jornada noturna em ~1,14 h por turno | Média (T-09) |

## Bloco H — itens abertos por `12-modulo-contabil-escopo.md`

Aberto em 30/08/2026 pelo levantamento do **módulo contábil** (núcleo, ECD/ECF, integração
entre os três módulos e normas do CFC). Mesmo bloqueio de rede dos outros blocos: nesta
rodada, `sped.rfb.gov.br`, `*.gov.br` e **também `cfc.org.br`** responderam 403 no proxy.
As 21 pendências numeradas `C-01` a `C-21` estão no documento; abaixo, o que as fecha.

| # | Documento | Fecha | Prioridade |
|---|---|---|---|
| H1 | **Manual de Orientação do Leiaute da ECD**, versão vigente para o AC 2025/2026 | C-04, C-05, C-07, C-10, **C-11** (existe API de transmissão ou o desfecho é sempre PVA + Receitanet?) | **BLOQUEADOR do gerador de ECD** |
| H2 | **Manual de Orientação do Leiaute 12 da ECF** + tabelas dinâmicas | C-08, C-09 | **BLOQUEADOR do gerador de ECF** |
| H3 | **IN RFB 2.003/2021** (com a redação da **IN RFB 2.142/2023**) e **IN RFB 2.004/2021** | C-01, **C-06** (prazo da ECD: maio ou junho?), C-18 | **BLOQUEADOR** de calendário e de tela |
| H4 | **ITG 2000 (R1)**, **NBC TG 1000**, **NBC TG 1001**, **NBC TG 1002** e a resolução que revoga a ITG 1000 | C-02, C-03, C-16, C-17 | **BLOQUEADOR** do seletor de perfil por porte |
| H5 | **NBC TG 33 / CPC 33 (R1)** — Benefícios a Empregados | C-12 | Alta |
| H6 | **NBC TG 25** — Provisões, Passivos Contingentes e Ativos Contingentes | C-12 | Média |
| H7 | **Leiaute CNAB 240 FEBRABAN** vigente + especificação **OFX** | C-14, C-15 | Alta |
| H8 | Documentação da **NFS-e de padrão nacional** e municípios aderentes | C-19 | Média |
| H9 | **Plano de contas referencial da RFB** — tabelas dinâmicas por ano-calendário e tipo de entidade | Popular `ctb_conta_referencial`; sem ele não há de-para | **BLOQUEADOR do de-para** |
| H10 | **CC arts. 1.179–1.195**, **DL 9.295/1946**, **MP 2.158-35 art. 57**, **DL 1.598/77 art. 8º-A**, **Lei 8.981/95 art. 45** | Fundamento normativo e valores de multa | Alta |
| H11 | **Decreto 9.555/2018** e **IN DREI 11/2020** | Autenticação da ECD e Termo de Verificação para Substituição | Alta |

> **Contradição a resolver neste bloco:** **prazo da ECD — "último dia útil de maio"
> (redação original da IN 2.003/2021) ou "de junho" (IN 2.142/2023)?** O documento `12`
> adotou junho por convergência. Fecha com H3. Até fechar, **nenhuma tela ou comunicado da
> G41 deve exibir a data**.
>
> **Fora do Bloco H, mas do mesmo documento:** `C-13` (leiaute campo a campo do arquivo de
> integração contábil do Domínio Folha) fecha com as URLs de `11-dominio-incumbente-e-integracao.md`
> §9.1 — é o portão do *parser* de folha→contábil. `C-20` (esforço de gerar EFD ICMS/IPI e
> EFD-Contribuições) e `C-21` (bibliotecas open source de SPED) são levantamento interno.

## Estado do lastro, por área

| Área | Situação após esta pesquisa |
|---|---|
| Eventos e leiaute do eSocial | Mapa de 50 eventos conferido contra XSD. Prazos **não confirmados**. |
| Integração técnica | Canal e mecânica descritos. Endpoints e limites **não confirmados**. |
| Motor de cálculo | Tabelas 2026 com convergência entre fontes e prova aritmética interna. Texto normativo **não lido**. |
| Obrigações e calendário | Ciclo mensal montado. Vários prazos **não confirmados** no texto original. |
| Construir x comprar | Categorias e fornecedores mapeados. **Nenhum preço** — o mercado não publica. |
| LGPD e dados vivos | Um único item verificado direto no texto normativo. |
| **Contábil (ECD, ECF, núcleo e integração)** | Escopo dimensionado e sequenciado. **Nenhuma afirmação lida na origem** — `sped.rfb.gov.br` e `cfc.org.br` bloqueados. 21 pendências. |

**Conclusão honesta:** o processo está entendido e mapeado. A informação **ainda não está
verificada no padrão que este projeto exige**. Executar esta checklist é o que fecha o loop.
