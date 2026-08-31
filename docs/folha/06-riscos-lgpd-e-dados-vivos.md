# 06 — Riscos, LGPD e Dados Vivos do módulo de Folha (Lior / G41)

> **Escopo.** Governança de dados, LGPD, prazos de guarda, incidentes, controles técnicos no
> Supabase/Postgres, responsabilidade civil do escritório e catálogo de **dados vivos** do módulo
> de FOLHA DE PAGAMENTO do sistema Lior.
> **Data-base:** 30/08/2026. **Padrão herdado:** `CLAUDE.md` (regra 1 — nada é inventado) e
> `docs/fontes-oficiais.md` (fonte canônica + cadência + aprovação humana).
> **Alertas na UI:** âmbar `#E9A74A` sobre navy `#0B1740`. **ZERO vermelho.**

---

## 0. Método e nível de verificação (leia antes de usar)

Este documento segue a regra anti-invenção: **nenhuma afirmação normativa sem fonte oficial citada**.
Cada item carrega um selo de verificação:

| Selo | Significado |
|---|---|
| `[V-DIRETO]` | Texto normativo conferido, com a redação essencial reproduzida ou parafraseada fielmente. |
| `[V-INDIRETO]` | Confirmado por busca em domínio oficial (`planalto.gov.br`, `gov.br`, `in.gov.br`, `cfc.org.br`, `stf.jus.br`, `tst.jus.br`), sem leitura integral do dispositivo. **Reconferir na fonte primária antes de virar regra de código.** |
| `PENDÊNCIA — não confirmado` | Não verificado nesta rodada. **Não pode virar parâmetro, prazo, cálculo nem texto de contrato.** |

> **Limitação técnica desta rodada (registrar no histórico):** o ambiente de pesquisa teve acesso
> direto a `planalto.gov.br`, `gov.br` e `in.gov.br` **bloqueado pelo proxy de saída** — a verificação
> foi feita por busca restrita a esses domínios, não por leitura do HTML/PDF oficial. Por isso a maior
> parte dos itens está como `[V-INDIRETO]`. **Antes do dia 1 em produção, um humano deve abrir cada URL
> da seção 10 e promover os itens para `[V-DIRETO]`.** Enquanto isso não ocorrer, todo texto jurídico
> aqui é insumo de trabalho, não parecer.

---

## 1. LGPD aplicada à folha de pagamento

### 1.1 O que a folha realmente contém

Folha não é "um dado pessoal". É um **agregado** que reúne, no mesmo registro, quase todas as
categorias que a LGPD protege — e é isso que faz dela um dos ativos de maior risco do escritório.

**Dado pessoal sensível** `[V-INDIRETO]` — Lei 13.709/2018 (LGPD), art. 5º, II: *"dado pessoal sobre
origem racial ou étnica, convicção religiosa, opinião política, filiação a sindicato ou a organização
de caráter religioso, filosófico ou político, dado referente à saúde ou vida sexual, dado genético ou
biométrico, quando vinculado a uma pessoa natural"*.

Aplicando a definição ao dataset de folha:

| Campo / evento da folha | Classificação LGPD | Por quê |
|---|---|---|
| Nome, CPF, PIS/NIS, endereço, data de nascimento | Pessoal comum | Identificação direta. |
| Salário, cargo, jornada, adicionais, descontos | Pessoal comum | Não é categoria do art. 5º, II — **mas é o dado de maior potencial de dano reputacional e patrimonial** (ver 4.3). |
| **Desconto de contribuição sindical / mensalidade de sindicato** | **SENSÍVEL** | Revela **filiação a sindicato** (art. 5º, II). Um único código de rubrica na folha já é dado sensível. |
| **Atestados médicos, CID, afastamento por doença, auxílio-doença** | **SENSÍVEL** | Dado referente à **saúde**. |
| **Eventos SST do eSocial (CAT e monitoramento da saúde do trabalhador)** | **SENSÍVEL** | Saúde + condição laboral. Ver 2.2. |
| **Biometria em ponto eletrônico (digital, face)** | **SENSÍVEL** | Dado **biométrico** vinculado a pessoa natural. |
| **Cota de PCD, laudo de deficiência, reabilitação INSS** | **SENSÍVEL** | Saúde. |
| **Licença-maternidade / gestação, licença-paternidade** | **SENSÍVEL na prática** | Revela dado de saúde/vida reprodutiva. Tratar como sensível. |
| **Raça/cor autodeclarada** (campo do eSocial) | **SENSÍVEL** | Origem racial ou étnica (art. 5º, II). |
| Dependentes (nome, CPF, data de nascimento, grau de parentesco) | Pessoal comum **de terceiro**, frequentemente **criança/adolescente** | Regime reforçado — ver seção 2. |
| Dependente com deficiência / dependente inválido para IRRF | **SENSÍVEL + menor** | Saúde de terceiro, muitas vezes menor. Pior combinação do banco. |
| Pensão alimentícia (percentual, beneficiário, nº do processo) | Pessoal + sigilo judicial | Frequentemente processo em segredo de justiça. |
| Dados bancários para crédito de salário | Pessoal comum, **financeiro** | Entra no critério de "risco relevante" de incidente (ver 4.2). |

> **Regra de engenharia derivada:** a coluna `sensivel BOOLEAN` não pode ser inferida por nome de campo.
> Cada rubrica e cada evento do eSocial precisa de uma **classificação explícita em tabela**
> (`folha_campos_classificacao`), com quem classificou e quando. Rubrica nova sem classificação =
> pendência, e o campo entra no sistema **bloqueado para exportação** até um humano classificar.

### 1.2 Base legal por categoria — e por que consentimento é a base ERRADA

`[V-INDIRETO]` A LGPD tem **duas listas separadas** de bases legais: art. 7º (dado pessoal comum) e
art. 11 (dado sensível). São listas taxativas e **distintas** — não se usa base do art. 7º para dado sensível.

| Categoria de dado da folha | Base legal correta | Fundamento |
|---|---|---|
| Cadastro do empregado, salário, jornada, descontos, rescisão | **Cumprimento de obrigação legal ou regulatória pelo controlador** | LGPD art. 7º, II `[V-INDIRETO]`. A obrigação existe: CLT, Lei 8.212/91, legislação do FGTS, eSocial. |
| Execução do contrato de trabalho (o que não for estritamente obrigação legal) | **Execução de contrato** | LGPD art. 7º, V `[V-INDIRETO]` — reconferir a redação exata do inciso antes de usar em contrato. |
| Dados de saúde (atestado, afastamento, SST, PCD) | **Obrigação legal ou regulatória**, e/ou **tutela da saúde em procedimento realizado por profissional de saúde** | LGPD art. 11, II, "a" e "f" `[V-INDIRETO]` — **a alínea exata de tutela da saúde precisa ser reconferida** (`PENDÊNCIA`, ver 9). |
| Filiação sindical (desconto em folha) | **Obrigação legal ou regulatória** | LGPD art. 11, II, "a" `[V-INDIRETO]`. |
| Biometria no ponto | **Não há base legal automática.** | Ponto biométrico não é imposto por lei; é escolha do empregador. Ver alerta abaixo. |
| Dependentes para IRRF/salário-família | **Obrigação legal ou regulatória** | LGPD art. 7º, II e art. 11, II, "a" `[V-INDIRETO]`. |
| Defesa em reclamatória trabalhista | **Exercício regular de direito em processo** | LGPD art. 7º, VI e art. 11, II, "d" `[V-INDIRETO]` — reconferir incisos. |

**Por que consentimento é a base errada para quase toda a folha — três motivos:**

1. **Assimetria de poder.** O consentimento na LGPD precisa ser **livre**. Na relação de emprego, o
   empregado que "não consente" com o processamento da própria folha não tem alternativa real. Um
   consentimento obtido nessas condições é frágil e pode ser considerado inválido. `[V-INDIRETO]` —
   este é o entendimento corrente derivado dos requisitos de consentimento da LGPD (art. 5º, XII e
   art. 8º); **a redação exata dos requisitos precisa ser reconferida** antes de virar cláusula.
2. **Revogabilidade.** Consentimento pode ser revogado a qualquer momento. Se a folha dependesse dele,
   um empregado poderia revogar e o empregador ficaria juridicamente impedido de… cumprir a lei. É um
   absurdo lógico: a obrigação de recolher INSS/FGTS e transmitir eSocial **não desaparece** porque o
   titular mudou de ideia.
3. **Base errada é tratamento irregular.** `[V-INDIRETO]` LGPD art. 44: o tratamento é irregular quando
   deixa de observar a legislação. Pedir consentimento quando a base é obrigação legal cria a ilusão de
   escolha e, pior, **contamina o registro**: a auditoria vai perguntar por que existe um consentimento
   para algo que é obrigatório.

> **Onde consentimento CABE (e só aí):** o que é **extra** à obrigação legal — foto no crachá para uso
> institucional, benefícios facultativos, pesquisa de clima, uso da imagem em material de marketing e,
> muito provavelmente, **biometria no ponto** quando houver alternativa não biométrica disponível.
> Nesses casos o consentimento precisa ser **específico, destacado e separado** do contrato de trabalho,
> com registro de data, versão do texto e canal.
> **`PENDÊNCIA — não confirmado`:** existe ou não manifestação da ANPD sobre base legal de **biometria
> em controle de jornada**? Não verificado nesta rodada. Até confirmar, o Lior **não** oferece ponto
> biométrico como padrão.

### 1.3 Papéis: o escritório é controlador ou operador?

`[V-INDIRETO]` LGPD, definições: **controlador** é a quem competem as decisões referentes ao tratamento;
**operador** é quem realiza o tratamento **em nome do controlador**. A ANPD publicou o *Guia Orientativo
para Definições dos Agentes de Tratamento de Dados Pessoais e do Encarregado* (v1 em 27/05/2021, **v2.0
em abril/2024**), com casos concretos.

**A resposta honesta é: depende da operação — e no mesmo contrato o escritório é as duas coisas.**

| Operação | Quem decide finalidade e meios | Papel da G41 |
|---|---|---|
| Calcular e processar a folha do cliente conforme as regras que o cliente define (política salarial, benefícios, jornada) | O **cliente empregador** | **OPERADOR** |
| Transmitir eSocial/FGTS em nome do cliente | O cliente (é obrigação **dele**) | **OPERADOR** |
| Guardar os papéis de trabalho contábeis, atender fiscalização do CRC, cumprir a Lei 9.613/1998 (PLD/FT), manter cadastro de clientes | A **própria G41** | **CONTROLADORA** |
| Dados dos **sócios e representantes** do cliente para contrato, cobrança, procuração e-CAC | A **própria G41** | **CONTROLADORA** |
| Usar dados agregados de folha para benchmark, estatística, produto ou treino de modelo | A **própria G41** | **CONTROLADORA** — e aqui precisa de base legal própria. Ver 5.8. |

> **Consequência prática que muita gente erra:** ser operador **não** é escudo. `[V-INDIRETO]` LGPD art. 42:
> o operador responde **solidariamente** pelos danos quando descumprir as obrigações da legislação de
> proteção de dados **ou** quando não seguir as instruções lícitas do controlador — hipótese em que
> **se equipara ao controlador**. E `[V-INDIRETO]` art. 44, parágrafo único: responde pelos danos da
> violação de segurança o controlador **ou o operador** que deixou de adotar as medidas do art. 46.
> Ou seja: **vazou por falha técnica da G41, a G41 responde — mesmo sendo "só" operadora.**

**E o transmissor white label?** Se a G41 contrata uma plataforma terceira que transmite eSocial/FGTS
sob a marca da G41, essa plataforma é, em regra, **suboperadora** (operador do operador) — ela trata
dados por conta da G41, que por sua vez trata por conta do cliente. Consequências:

- A G41 **continua respondendo** perante o cliente e perante o titular. O white label é fornecedor, não
  para-raios. O rótulo comercial não muda o regime de responsabilidade da LGPD.
- É preciso **autorização do controlador (o cliente)** para subcontratar. Isso tem que estar escrito no
  contrato com o cliente, não presumido.
- **`PENDÊNCIA — não confirmado`:** a LGPD **não** tem artigo próprio de "suboperador" com a clareza do
  GDPR (art. 28.2/28.4). A qualificação acima é construção contratual e doutrinária. **Antes de virar
  cláusula, verificar o que a v2.0 do Guia da ANPD diz sobre cadeia de operadores.**

### 1.4 O que precisa estar em contrato

`[V-INDIRETO]` **LGPD art. 39:** o operador deve realizar o tratamento **segundo as instruções fornecidas
pelo controlador**, que verificará a observância das próprias instruções e das normas sobre a matéria.
Isso significa: **as instruções precisam existir por escrito.** Um contrato de BPO de folha sem anexo de
tratamento de dados deixa a G41 sem prova de que agiu conforme instrução — e o art. 42 pune exatamente
quem não seguiu instrução lícita.

**Anexo de Tratamento de Dados (DPA) — conteúdo mínimo do contrato de folha:**

| # | Cláusula | Fundamento |
|---|---|---|
| 1 | Qualificação dos papéis: cliente = controlador; G41 = operadora para as operações de folha; G41 = controladora para papéis de trabalho e PLD/FT | LGPD arts. 5º, VI e VII `[V-INDIRETO]` |
| 2 | **Finalidades e instruções documentadas**, com vedação de tratamento fora delas | LGPD art. 39 `[V-INDIRETO]` |
| 3 | Categorias de dados e de titulares (incluindo **sensíveis e menores**) | LGPD arts. 11 e 14 `[V-INDIRETO]` |
| 4 | Autorização prévia e nominal para **subcontratação** (white label, cloud, folha de ponto) | Ver ressalva em 1.3 |
| 5 | Medidas técnicas e administrativas de segurança (ancorar na seção 5 deste documento) | LGPD art. 46 `[V-INDIRETO]` |
| 6 | **Fluxo de incidente:** a G41 notifica o cliente em **prazo interno menor** que o legal, com conteúdo mínimo pronto | LGPD art. 48 + Res. CD/ANPD 15/2024 `[V-INDIRETO]` — ver seção 4 |
| 7 | Auxílio ao controlador no atendimento a **direitos do titular** e a requisições da ANPD | LGPD arts. 18 e 38 `[V-INDIRETO]` |
| 8 | **Devolução/eliminação ao término do contrato**, com a ressalva expressa dos dados que a lei obriga a reter | LGPD art. 16 `[V-INDIRETO]` — ver 3.4 |
| 9 | **Registro das operações de tratamento** mantido por ambas as partes | LGPD art. 37 `[V-INDIRETO]` |
| 10 | Encarregado (DPO) indicado e canal publicado | LGPD art. 41 `[V-INDIRETO]` — reconferir o artigo |
| 11 | Cláusulas do **contrato contábil** que já são obrigatórias e conversam com risco: detalhamento dos serviços, responsabilidades das partes, **Carta de Responsabilidade da Administração**, ciência da Lei 9.613/1998, cláusula rescisória com prévio aviso | Resolução CFC nº 1.590/2020, art. 2º `[V-INDIRETO]` — ver 6.4 |

---

## 2. Menores, dependentes e dados de saúde — o cuidado extra

### 2.1 Dependentes e menores

`[V-INDIRETO]` **LGPD art. 14:** o tratamento de dados pessoais de crianças e adolescentes deve ser
realizado **em seu melhor interesse**. O **§1º** exige, para dados de **crianças**, consentimento
**específico e em destaque** de um dos pais ou do responsável legal. O **§3º** permite coleta sem esse
consentimento quando necessária para contatar os pais/responsável — usada uma única vez, sem
armazenamento — ou para a proteção da criança, e **em nenhum caso os dados podem ser repassados a
terceiro** sem o consentimento do §1º. O **§5º** determina "todos os esforços razoáveis" para verificar
que o consentimento veio de quem de direito.

**O nó prático da folha:** o dado do dependente **não é coletado da criança nem para a criança** — é
coletado do empregado, por **obrigação legal do empregador** (dedução de IRRF, salário-família,
plano de saúde, vale-creche). A leitura razoável é que a base é **obrigação legal**, e o art. 14 incide
como **camada de proteção adicional** (princípio do melhor interesse, minimização, publicidade), não
como exigência de consentimento parental para cada dependente.

> **`PENDÊNCIA — não confirmado` (alta prioridade):** a ANPD publicou **enunciado sobre hipóteses legais
> aplicáveis ao tratamento de dados de crianças e adolescentes** (notícia localizada em `gov.br/anpd`),
> precedido de tomada de subsídios. **O teor desse enunciado não foi lido nesta rodada.** Ele é a fonte
> que resolve se o art. 14, §1º exige consentimento parental **sempre** ou se convive com outras bases
> legais. **Nada sobre dependentes menores entra em contrato ou em texto de UI até esse enunciado ser
> lido.** Ver seção 9.

**Controles concretos para dependentes no Lior (independentes da pendência acima):**
- Minimização agressiva: nome, CPF, data de nascimento e grau de parentesco resolvem IRRF e
  salário-família. **Não coletar** escola, endereço próprio, foto, telefone do menor.
- Marcar `titular_menor = true` derivado da data de nascimento e **propagar a marca** para toda linhagem
  de exportação, log e relatório.
- Dependente **não aparece** em relatório, exportação ou tela que não tenha finalidade declarada de
  IRRF/benefício. Nunca em listagem geral, nunca em CSV "para conferência".
- No incidente, o número de crianças/adolescentes afetados **tem que ser contável em uma query** — a
  Resolução da ANPD exige discriminar esse número (ver 4.2).

### 2.2 Dados de saúde e SST

Atestados, CID, afastamentos, ASO, CAT e monitoramento da saúde do trabalhador são **dados sensíveis**.
No eSocial isso circula em eventos específicos de SST.

`[V-INDIRETO]` **eSocial — eventos de SST:** o leiaute vigente é a série **S-1.3**, com Manual de
Orientação (MOS) consolidado **até a Nota Orientativa S-1.3 de 07/2026** (documento publicado no portal
`gov.br/esocial`). Os eventos de SST citados pelo escopo (**S-2210 — Comunicação de Acidente de Trabalho**
e **S-2220 — Monitoramento da Saúde do Trabalhador**) integram essa série.
> **`PENDÊNCIA — não confirmado`:** o **layout campo a campo** de S-2210 e S-2220 na versão S-1.3 vigente
> em 30/08/2026 **não foi lido**. Nenhum campo, regra de validação ou prazo de envio desses eventos pode
> ser codificado a partir deste documento. Fonte a abrir: MOS S-1.3 consolidado (seção 10).

**Regras não negociáveis para saúde na folha:**

1. **Separação física, não só lógica.** Dados clínicos (CID, laudo, resultado de exame) **não moram na
   tabela de folha**. Vão para um schema apartado (`sst`) com política de acesso própria e whitelist
   curta. O motor de cálculo precisa saber que houve *afastamento de X a Y por código legal Z* — **não
   precisa do CID**.
2. **O CID é o caso mais grave.** Ele revela diagnóstico. Regra do Lior: o CID é **cifrado em coluna**,
   nunca indexado, nunca em log, nunca em resposta de API de folha, e **jamais** sai para IA (seção 5.8).
3. **Retenção longa colide com minimização.** `[V-INDIRETO]` **NR-07 (PCMSO):** os registros do prontuário
   clínico individual devem ser mantidos por período mínimo de **20 anos após o desligamento** do
   trabalhador — e **30 anos** para expostos a radiações ionizantes. Ou seja: o dado mais sensível do
   conjunto é também o de guarda mais longa. Isso exige tratamento de **arquivo frio cifrado**, fora do
   banco quente. Ver 3.2 e 5.5.
4. **Quem vê:** acesso a dado clínico é de **profissional de saúde / responsável de SST**, não do analista
   de folha. O analista de folha vê "afastado" e o código do afastamento; não vê o motivo clínico.

---

## 3. Prazos legais de guarda — três relógios distintos

O erro clássico é falar em "prazo de guarda de documento trabalhista" no singular. **São relógios
diferentes, com fundamentos diferentes, e o sistema tem que modelar os três.**

### 3.1 Os três relógios

| Relógio | O que mede | Fundamento | Como corre |
|---|---|---|---|
| **A — Prescrição trabalhista** | Até quando o **empregado** pode cobrar em juízo | `[V-INDIRETO]` CF/1988, art. 7º, XXIX + CLT, art. 11 | **5 anos** de créditos, **até o limite de 2 anos após a extinção do contrato**. Isto é: passados 2 anos do fim do contrato, não cabe mais ação; dentro da ação, alcança os 5 anos anteriores ao ajuizamento. |
| **B — Prescrição/decadência previdenciária e tributária** | Até quando o **Fisco** pode cobrar contribuição | `[V-INDIRETO]` Lei 8.212/91, art. 32, §11 (documentos comprobatórios **arquivados na empresa até ocorrer a prescrição** dos créditos das operações a que se refiram) + **Súmula Vinculante 8/STF** (12/06/2008), que declarou inconstitucionais os arts. 45 e 46 da Lei 8.212/91 → aplica-se o **CTN** | **5 anos** (CTN, arts. 173 e 174). O prazo de guarda é **derivado** do prazo de cobrança: guarda-se enquanto o crédito puder ser exigido. |
| **C — Prazos setoriais/SST** | Vigilância da saúde ocupacional, prova de nexo | `[V-INDIRETO]` NR-07 (PCMSO) | **20 anos após o desligamento** (30 anos para radiações ionizantes). Descolado dos relógios A e B. |

> **Consequência de modelagem:** a data de expurgo de um documento **não é um campo único**. É
> `max(relógio A, relógio B, relógio C aplicável)` calculado por **tipo de documento**, com a **data de
> rescisão** como âncora de vários deles. O Lior precisa de uma tabela `retencao_politica` versionada,
> não de um número no código.

### 3.2 Tabela de prazos por documento

| Documento / dado | Prazo | Fundamento | Selo |
|---|---|---|---|
| Créditos trabalhistas em geral (folha, recibos de pagamento, prova de pagamento de verbas) | 5 anos, limitado a 2 anos após a extinção do contrato | CF art. 7º, XXIX; CLT art. 11 | `[V-INDIRETO]` |
| Documentos comprobatórios de contribuições previdenciárias (folha, GFIP/eSocial, guias) | Até a prescrição dos créditos → **5 anos** | Lei 8.212/91 art. 32, §11 + Súmula Vinculante 8/STF + CTN arts. 173/174 | `[V-INDIRETO]` |
| **FGTS** — comprovantes de recolhimento | **5 anos** (prescrição quinquenal), observado o limite de 2 anos após a extinção do contrato | **STF, ARE 709.212 (Tema 608), julgado em 13/11/2014**, com modulação *ex nunc*, que declarou inconstitucionais o art. 23, §5º da Lei 8.036/90 e o art. 55 do Decreto 99.684/90 na parte que previa prescrição trintenária; **Súmula 362 do TST** alterada em decorrência | `[V-INDIRETO]` |
| **Prontuário clínico ocupacional (PCMSO), ASO** | **20 anos após o desligamento** (30 anos p/ radiações ionizantes) | NR-07 | `[V-INDIRETO]` |
| Registro de empregados (dados de admissão, duração, férias, acidentes, rescisão) | Enquanto durar o contrato + prazos A e B após a rescisão | `[V-INDIRETO]` Portaria MTP nº 671, de 08/11/2021 (registro eletrônico dispensa livro/ficha), c/c CLT art. 41 — **o artigo específico de prazo de guarda não foi lido** → ver PENDÊNCIA P-04 | `[V-INDIRETO]` parcial |
| **Cartões/registros de ponto** | `PENDÊNCIA — não confirmado` | Prazo específico não verificado nesta rodada. Não usar "5 anos" por analogia sem checar a Portaria MTP 671/2021 | — |
| **Termos de rescisão (TRCT), homologações, recibos de férias** | `PENDÊNCIA — não confirmado` | Idem. O prazo prescricional A é o piso lógico, mas o dispositivo específico não foi verificado | — |
| **PPP / LTCAT** | `PENDÊNCIA — não confirmado` | Prazo (frequentemente citado como 20 anos) não verificado. Fonte a abrir: normativo do INSS sobre PPP | — |
| **eSocial — recibos de entrega dos eventos** | Guardar como prova de cumprimento; prazo segue o relógio B | `[V-INDIRETO]` orientação do portal eSocial: o eSocial **não cria obrigação nova**, é nova forma de cumprir obrigações existentes → o prazo de guarda é o da obrigação subjacente | `[V-INDIRETO]` |

### 3.3 O que o eSocial exige guardar — leitura correta

`[V-INDIRETO]` O eSocial **não institui um prazo de guarda próprio**. Ele institui a **forma** de prestar
a informação trabalhista, previdenciária, fiscal e tributária. Portanto:

- O prazo de guarda continua sendo o da obrigação de origem (relógios A, B e C).
- O que **passa a existir** é a necessidade de guardar os **recibos de entrega** dos eventos — a prova de
  que a informação foi transmitida, quando e com qual conteúdo.
- **Implicação de arquitetura:** o Lior precisa arquivar, por evento, **o XML enviado, o recibo, o
  timestamp e a versão do leiaute usada**. Sem a versão do leiaute, é impossível reconstruir por que o
  cálculo saiu daquele jeito em 2026 quando alguém questionar em 2030.

### 3.4 O conflito: guardar × eliminar

`[V-INDIRETO]` LGPD art. 16: os dados devem ser eliminados após o término do tratamento, **ressalvadas**
as hipóteses de conservação — entre elas o **cumprimento de obrigação legal ou regulatória pelo
controlador**. É esta ressalva que permite (e obriga) guardar folha por 5 anos e prontuário por 20.

**A ressalva não é um cheque em branco.** Ela autoriza guardar **o que a lei manda**, na **finalidade
restrita** de cumpri-la. Consequência prática, que é onde quase todo sistema falha:

> **Dado retido por obrigação legal deve sair da operação e entrar em regime de arquivo.** Depois do
> encerramento do contrato de trabalho (e do contrato com o cliente), o dado não pode continuar
> pesquisável por qualquer usuário, aparecendo em busca global, alimentando relatório gerencial ou
> saindo em exportação. Ele vira **arquivo frio, cifrado, com acesso sob justificativa registrada**.

Regra do Lior: ao encerrar o contrato com um cliente, o tenant vai para `estado = arquivado` — RLS
passa a negar leitura ao perfil operacional, o acesso exige perfil `custodia` + motivo textual, e cada
leitura gera evento de auditoria.

---

## 4. Incidente de segurança

### 4.1 O dever e o prazo

`[V-INDIRETO]` **LGPD art. 48:** o **controlador** deve comunicar à autoridade nacional e ao titular a
ocorrência de incidente de segurança que possa acarretar **risco ou dano relevante** aos titulares, em
prazo razoável, a ser regulamentado pela ANPD. A comunicação deve mencionar, no mínimo: a natureza dos
dados afetados, as informações sobre os titulares envolvidos, as medidas técnicas e de segurança
utilizadas, os riscos, os motivos da demora (se houver) e as medidas adotadas para reverter ou mitigar
os efeitos.

`[V-INDIRETO]` **Resolução CD/ANPD nº 15, de 24/04/2024** (Regulamento de Comunicação de Incidente de
Segurança, publicada no DOU em 26/04/2024) fixou o prazo:

| Destinatário | Prazo | Contagem |
|---|---|---|
| **ANPD** | **3 dias úteis** | Do momento em que o **controlador toma conhecimento** de que o incidente afetou dados pessoais — salvo prazo previsto em legislação específica |
| **Titulares afetados** | **3 dias úteis** | Mesma contagem |

### 4.2 Quando comunicar — critério de "risco relevante"

`[V-INDIRETO]` Pela Resolução 15/2024, há risco ou dano relevante quando o incidente **puder afetar
significativamente interesses e direitos fundamentais dos titulares** e, **cumulativamente**, envolver
ao menos um dos seguintes: **dados sensíveis**; dados de **crianças, adolescentes ou idosos**; **dados
financeiros**; **dados de autenticação em sistemas**; dados protegidos por **sigilo legal, judicial ou
profissional**; ou **dados em larga escala**.

**Conteúdo mínimo da comunicação** `[V-INDIRETO]`: descrição da **natureza e categoria** dos dados
afetados; **número de titulares afetados**, discriminando, quando aplicável, o **número de crianças,
adolescentes e idosos**; **medidas técnicas e de segurança** adotadas antes e depois do incidente; e as
medidas para reverter ou mitigar os danos.

> **Requisito de engenharia que nasce daqui:** o Lior precisa conseguir responder, **em minutos e sob
> estresse**: *quais tenants, quais titulares, quantos menores, quais categorias, quais registros e
> quem acessou.* Isso não se improvisa em um incidente — depende de a classificação (1.1), da marca de
> menor (2.1) e da trilha de auditoria (5.4) já existirem. **Sem esses três, o escritório não consegue
> cumprir o prazo de 3 dias úteis.**

### 4.3 O que significa vazar uma folha de pagamento

Não é "um vazamento de dados". É o pior conjunto possível de um escritório contábil, por seis razões
simultâneas:

1. **Aciona quase todos os gatilhos de risco relevante ao mesmo tempo** — sensíveis (sindicato, saúde),
   menores (dependentes), financeiros (conta bancária), larga escala (todos os empregados do cliente).
   A comunicação à ANPD deixa de ser avaliação e passa a ser praticamente automática.
2. **É irreversível socialmente.** Salário vazado não se "revoga". Ele destrói relações internas do
   cliente, gera pedidos de equiparação salarial, alimenta assédio e chantagem, e vira insumo de fraude
   direcionada (o vazamento revela quem tem salário alto e onde recebe).
3. **O dano é do cliente, mas a falha é do escritório.** O cliente é controlador; ele responde perante
   seus empregados. E se cobra da G41 em regresso. `[V-INDIRETO]` LGPD art. 42 e art. 44, parágrafo
   único, sustentam a responsabilização direta do operador que falhou na segurança.
4. **Multiplicação por tenant.** Um vazamento na base do escritório não atinge uma empresa — atinge
   **todas**. Um sistema multi-tenant transforma um incidente em N incidentes, com N comunicações à ANPD
   e N conversas com clientes furiosos, **todas em 3 dias úteis**.
5. **É evento de fim de contrato.** Perda de confiança em BPO de folha não se recupera. Some-se a isso
   as sanções do art. 52 da LGPD `[V-INDIRETO]` (advertência, multa, publicização, bloqueio, eliminação
   dos dados) — **valores e critérios de dosimetria não foram verificados nesta rodada; ver P-09**.
6. **Vira caso público.** Vazamento de salário é notícia. E a marca do escritório contábil vende
   exatamente aquilo que o incidente destrói: confiança na custódia de informação sensível.

### 4.4 Runbook mínimo (a escrever antes do dia 1)

| Etapa | Prazo interno | Responsável |
|---|---|---|
| Detecção → acionamento do encarregado | **imediato** | quem detectar |
| Contenção (revogar chaves, encerrar sessões, isolar tenant) | ≤ 1h | engenharia |
| Escopo: tenants, titulares, categorias, nº de menores | ≤ 12h | engenharia + encarregado |
| Comunicação ao **cliente controlador** | **≤ 24h** (mais curto que o legal, por contrato) | encarregado |
| Comunicação à ANPD e aos titulares (quando o cliente é o controlador, **é o cliente quem comunica** — a G41 fornece o dossiê) | dentro dos **3 dias úteis** legais | cliente, apoiado pela G41 |
| Pós-morte + plano corretivo + registro | ≤ 15 dias | engenharia |

> **Cuidado com o papel:** como a G41 é normalmente **operadora**, quem comunica à ANPD é o **cliente
> controlador**. A obrigação contratual da G41 é **entregar o dossiê completo a tempo** de o cliente
> cumprir o prazo. Isso precisa estar na cláusula 6 do DPA (1.4).

---

## 5. Controles técnicos para a base no Postgres/Supabase

Todos os itens abaixo são **recomendação de engenharia** — não são afirmações normativas e não precisam
de citação legal, exceto onde indicado. Ancoram no dever genérico de adotar medidas técnicas e
administrativas de segurança `[V-INDIRETO]` (LGPD art. 46).

### 5.1 Isolamento multi-tenant (RLS)

| Controle | Detalhe |
|---|---|
| RLS **habilitada e forçada** | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` **e** `FORCE ROW LEVEL SECURITY` em toda tabela do domínio folha. `FORCE` é o que impede o dono da tabela de escapar da política — sem isso, migrations e jobs furam o isolamento. |
| Tenant vem do **token**, nunca do payload | A policy lê o `tenant_id` do JWT/claim de sessão. Se o `tenant_id` puder vir do corpo da requisição, o isolamento é decorativo. |
| **Default deny** | Nenhuma tabela de folha sem policy. Teste automatizado no CI: falha o build se existir tabela no schema `folha`/`sst` sem RLS forçada. |
| Sem `service_role` na aplicação | A chave de serviço do Supabase **ignora RLS**. Ela só pode viver em jobs de backend isolados, nunca no app, nunca no navegador, nunca em n8n com credencial compartilhada. |
| Teste de fuga como caso de teste | Suíte que autentica como tenant A e tenta ler/atualizar/deletar linhas de B em **toda** tabela — inclusive por views, funções `SECURITY DEFINER` e RPC. Funções `SECURITY DEFINER` são o furo mais comum: elas rodam como o dono e **contornam a RLS**; cada uma precisa de revisão explícita e `search_path` fixo. |
| Tenant arquivado | Estado `arquivado` bloqueia leitura pelo perfil operacional (ver 3.4). |

### 5.2 Quem vê salário de quem

Isolamento entre clientes é o problema fácil. O problema difícil é **dentro do escritório e dentro do
cliente**. Modelo proposto — RLS por **papel × tenant × escopo**, e não por "usuário logado":

| Perfil | Vê | Não vê |
|---|---|---|
| `folha_operador` (analista da G41) | Folha dos tenants **atribuídos a ele** | Tenants não atribuídos; CID e prontuário; folha da própria G41 |
| `folha_supervisor` | Todos os tenants da sua carteira | Dado clínico |
| `sst_responsavel` | Dado clínico dos tenants atribuídos | Valores de folha que não precise |
| `cliente_rh` | Folha do **próprio** tenant | Outros tenants |
| `cliente_gestor` | Apenas a **sua equipe** (hierarquia), se o cliente exigir | Folha de pares e superiores |
| `cliente_socio` | Tudo do próprio tenant | — |
| `custodia` | Tenants arquivados, **mediante motivo textual registrado** | Uso rotineiro |
| `auditoria` | **A trilha**, não o dado | Conteúdo dos salários |

Três regras que fazem esse modelo valer alguma coisa:

1. **Autoexclusão obrigatória.** Ninguém consulta a própria folha pelo perfil administrativo — nem o
   sócio da G41 pela ferramenta de operação. Consulta da própria folha é pelo canal do empregado.
2. **Atribuição é dado, não código.** `usuario_tenant` com início/fim de vigência. Analista sai da
   carteira → perde o acesso na hora, sem deploy.
3. **Acesso a folha de diretoria/sócios do cliente é escopo separado.** É onde vazamento dói mais e é o
   primeiro alvo de curiosidade interna.

### 5.3 Cifragem em repouso e mascaramento

| Camada | O que fazer | Observação |
|---|---|---|
| Disco/volume | Cifragem gerenciada pelo provedor | Necessária, **e insuficiente** — protege contra roubo de disco, não contra `SELECT *` de credencial vazada. |
| **Coluna** | Cifrar em coluna os campos de maior dano: **CID/diagnóstico, laudo, dados bancários, biometria, nº de processo de pensão** | Chave **fora do banco** (KMS/secret manager). Chave no mesmo Postgres que o dado = teatro de segurança. |
| Salário | **Não** cifrar em coluna | Ele precisa ser somado, comparado e agregado. Proteger por **RLS + auditoria + mascaramento em view**, não por criptografia — cifrar o que é calculado quebra o motor e cria falsa sensação de proteção. |
| **Mascaramento** | Views de leitura por perfil: CPF `***.***.789-**`, conta bancária com 3 últimos dígitos, salário em faixa para perfis que só precisam conferir cadastro | O mascaramento é a defesa contra **exportação em massa**: se a view padrão já vem mascarada, o CSV que vaza vale menos. |
| **`PENDÊNCIA — não confirmado`** | Qual é hoje o mecanismo **suportado e recomendado** para cifragem em coluna no Supabase gerenciado (`pgcrypto` × Vault × extensão de TCE). O ecossistema mudou de recomendação mais de uma vez. **Verificar na documentação vigente do Supabase antes de escolher.** Ver P-10. | — |

### 5.4 Trilha de auditoria

`[V-INDIRETO]` LGPD art. 37 exige que controlador e operador mantenham **registro das operações de
tratamento**. Para folha, a trilha precisa responder quatro perguntas — **quem, o quê, quando, por quê**:

| Requisito | Implementação |
|---|---|
| Auditar **leitura**, não só escrita | Sistema de folha vaza por **consulta**, não por `UPDATE`. Registrar `SELECT` sensível (folha completa, exportação, consulta a CID) é o controle mais subestimado. |
| Append-only | Tabela de auditoria em schema próprio, sem `UPDATE`/`DELETE` para a aplicação, com role dedicada de escrita. |
| Identidade real | Registrar o **usuário humano**, não `service_role`. Se todo acesso é logado como serviço, a trilha não serve para nada. |
| Contexto | `tenant_id`, `titular_id`, tipo de operação, volume de linhas, IP, `request_id`, **finalidade declarada** quando o acesso for excepcional. |
| Nunca dado dentro do log | O log registra **que houve** acesso ao CID; **não registra o CID**. Log é o lugar onde dado sensível escapa de toda a proteção construída acima. |
| Alerta comportamental | Volume anômalo de leitura, exportação fora do horário, acesso a tenant fora da carteira → alerta e **tarefa no Kanban G41**. Na UI, o alerta é **âmbar** (`#E9A74A`) — nunca vermelho. |
| Retenção da trilha | A trilha deve sobreviver ao dado que ela audita. **`PENDÊNCIA — não confirmado`:** prazo mínimo de guarda da trilha não tem norma verificada; definir por política interna e registrar a decisão. |

### 5.5 Retenção e expurgo

- Política em **dados**: `retencao_politica(tipo_documento, relogio, prazo, fundamento_url, versao, aprovado_por, aprovado_em)`. Prazo em código = prazo que ninguém revisa.
- Cada registro carrega `data_ancora` (rescisão, competência, desligamento) e `expurgo_previsto` derivado.
- **O expurgo nunca é automático e silencioso.** Ele gera **proposta**, abre tarefa no Kanban G41, espera **aprovação humana** e só então executa — mesmo padrão de `docs/fontes-oficiais.md`. Apagar folha por engano é irreversível e é, ele mesmo, um incidente (perda de disponibilidade).
- Expurgo registra o que foi eliminado (metadado, não conteúdo), quando, por qual política e quem aprovou.
- Fim de contrato com o cliente ≠ apagar tudo: devolve-se o que é do cliente e **retém-se o que a lei manda** (3.4), em arquivo frio.

### 5.6 Backup — o risco de o backup virar o vazamento

O backup é a cópia **menos protegida** do dado mais sensível. Ele tipicamente não tem RLS, não tem
mascaramento, não tem trilha, e mora em outro lugar.

| Controle | Detalhe |
|---|---|
| Cifrado com **chave própria** | Não apenas "criptografia do provedor". Chave sob controle da G41, rotacionada. |
| **Acesso ao backup é acesso privilegiado** | Restaurar/baixar backup exige aprovação de duas pessoas e gera evento de auditoria. Download de dump por um desenvolvedor **é** um evento de segurança. |
| **Nunca restaurar produção em homologação** | É o vazamento mais comum e mais banal do mercado. Ambiente não-produtivo usa **dados sintéticos** ou anonimizados de forma irreversível. |
| Retenção do backup entra na política | Backup guardado "para sempre" derrota o expurgo: o dado que você apagou continua vivo na cópia. Definir janela e destruição verificada. |
| Teste de restauração | Backup não testado é backup que não existe. Testar em ambiente isolado, com dado mascarado. |
| Cópia local proibida | Dump em notebook, planilha em Drive pessoal, PDF de folha em WhatsApp. **A maior superfície de vazamento de um escritório contábil não é o banco — é o hábito.** |

### 5.7 Menor privilégio

- Roles de banco distintas por função (`app_leitura`, `app_folha`, `job_esocial`, `auditoria`), sem
  reuso de superusuário.
- Zero acesso permanente à produção. Acesso humano ao banco é **temporário, justificado e expirável**.
- Segregação de funções: quem transmite eSocial não é quem aprova alteração de política de retenção.
- Chaves e certificados A1 no **cofre cifrado**, nunca no repositório, nunca em variável de ambiente de
  serviço compartilhado. Uso do certificado gera evento de auditoria (quem, quando, para qual tenant,
  qual transmissão).
- Todo acesso de terceiro (white label, integrador, n8n) com **credencial nominal e escopo mínimo**,
  revogável isoladamente.

### 5.8 Mandar dado de folha para IA/LLM

Esta é a regra mais fácil de violar por conveniência — e a de consequência mais direta.

**Princípio:** a G41 é **operadora** para folha. Mandar dado do cliente para um LLM é **tratamento fora
da instrução do controlador**, salvo autorização expressa. `[V-INDIRETO]` LGPD art. 39 e art. 42 (o
operador que não segue instrução lícita **se equipara ao controlador**).

**NUNCA pode sair do sistema:**

- CPF, PIS/NIS, RG, CTPS, título de eleitor
- Nome completo do empregado, do dependente e do cônjuge
- Endereço, telefone, e-mail pessoal
- **CID, diagnóstico, laudo, conteúdo de atestado**
- **Dados de dependentes menores** — nenhum campo, em nenhuma hipótese
- Dados bancários, chave PIX
- Biometria
- Filiação sindical identificada
- Nº de processo de pensão alimentícia / reclamatória
- Certificado A1, chave privada, senha, token
- **Salário nominal atrelado a pessoa identificável**

**Pode sair, se necessário e com registro:** rubrica genérica, código de evento do eSocial, faixa
salarial sem identificação, quantidade de empregados, mensagem de erro **higienizada**, trecho de
leiaute, texto de norma.

**Controles obrigatórios:**

1. **Camada de saída ("saída controlada").** Toda chamada a LLM passa por uma função única que aplica
   uma **whitelist de campos** — não uma blacklist. Blacklist falha no primeiro campo novo.
2. **Pseudonimização com mapa local.** Substituir identificadores por tokens (`EMP_001`), com o mapa
   **dentro** do banco. O LLM raciocina sobre a estrutura; o sistema remonta.
3. **Cuidado honesto com "anonimização".** Folha é **reidentificável com facilidade**: salário +
   cargo + data de admissão + município identifica gente em empresa pequena. Chamar isso de anônimo é
   se enganar. Trate como **pseudonimizado** — que continua sendo dado pessoal.
4. **Log de toda chamada:** payload enviado (após filtro), modelo, versão, custo, tenant, finalidade.
   Se não é auditável, não pode acontecer.
5. **Sem treino com dado de cliente.** Contratar o provedor com vedação a uso para treinamento e
   verificar retenção do provedor. **`PENDÊNCIA — não confirmado`:** política de retenção/treino do
   provedor de LLM que a G41 vai usar não foi verificada.
6. **IA não decide folha.** Ela sugere, explica, classifica rubrica, lê norma. **Cálculo é motor
   determinístico.** Um LLM não pode ser a fonte de uma alíquota, de uma faixa de INSS ou de um prazo
   (ver seção 8).

---

## 6. Responsabilidade civil do escritório contábil por erro na folha

### 6.1 O ponto de partida: quem é o obrigado

O **obrigado tributário e trabalhista é o cliente empregador**. A multa do eSocial, a diferença de INSS,
o depósito de FGTS e a condenação na reclamatória são lançados **contra ele**. O escritório não é
sujeito passivo — o que **não** significa que não pague. Significa que a via é **regressiva**: o cliente
é autuado e cobra o escritório.

### 6.2 As bases legais

| Base | Conteúdo | Selo |
|---|---|---|
| **CC art. 1.177, parágrafo único** | *"No exercício de suas funções, os prepostos são pessoalmente responsáveis, perante os preponentes, pelos atos culposos; e, perante terceiros, solidariamente com o preponente, pelos atos dolosos."* O contabilista é enquadrado como **preposto** do cliente. | `[V-DIRETO]` (redação conferida) |
| **CC art. 1.178** | Trata dos efeitos dos atos dos prepostos no estabelecimento perante terceiros. **Redação exata não conferida** → ver P-11. | `[V-INDIRETO]` |
| **CC arts. 186 e 927** | Responsabilidade civil geral por ato ilícito e dever de reparar. **Redação exata não conferida nesta rodada** → ver P-11. | `PENDÊNCIA` parcial |
| **Resolução CFC nº 1.590/2020, art. 3º** | Ao avaliar recusa de entrega da Carta de Responsabilidade da Administração, o profissional considera **sua responsabilidade solidária perante a prática de atos culposos ou dolosos**. | `[V-INDIRETO]` |
| **NBC PG 01** (Código de Ética Profissional do Contador, aprovada em 07/02/2019, vigência 01/06/2019) | Deveres de conduta, zelo, competência e gestão de conflito de interesse. Revogou a Resolução CFC nº 803/1996. | `[V-INDIRETO]` |
| **Decreto-Lei nº 9.295/1946** | Cria o CFC e define as atribuições do contador; fundamento da responsabilidade **disciplinar** perante o CRC. **Não verificado nesta rodada** → ver P-11. | `PENDÊNCIA` |

**A distinção que decide o caso concreto:**

| Situação | Quem suporta | Raciocínio |
|---|---|---|
| Multa do eSocial por **atraso de transmissão** causado pelo escritório | Escritório, em regresso | Culpa do preposto no exercício da função (CC art. 1.177, p.ú.) |
| Multa do eSocial porque **o cliente entregou a informação em cima da hora ou errada** | Cliente | Sem culpa do escritório — **desde que haja prova documental** do fluxo de entrega |
| **INSS/FGTS a menor** por erro de parametrização de rubrica pelo escritório | Escritório responde pela **multa e juros**; o **principal** é do cliente (ele sempre deveu o tributo) | Não há dano no principal: o cliente pagaria de qualquer forma. O dano é o acréscimo. |
| **Rescisão calculada errado** que vira reclamatória | Escritório responde pelo diferencial decorrente do erro + custos; **não** pelo que o cliente já devia | Mesma lógica |
| Erro por **instrução expressa do cliente**, com ressalva escrita do escritório | Cliente | Por isso a **ressalva por escrito** vale ouro |
| Dolo (fraude, omissão intencional) | Escritório, **solidariamente perante terceiros** | CC art. 1.177, p.ú. |

> **O controle que decide tudo isso não é jurídico, é de produto:** *quem informou o quê, quando, e o
> que o sistema respondeu.* Sem trilha (5.4), sem versionamento de parâmetro (seção 7) e sem registro de
> ressalva, a discussão vira palavra contra palavra — e o escritório, sendo o profissional técnico,
> tende a perder. **A trilha de auditoria é, além de exigência da LGPD, a apólice não-securitária do
> escritório.**

### 6.3 Cláusulas de contrato que a G41 deve exigir

1. **Escopo fechado e negativo:** o que a G41 faz **e o que não faz** (ex.: não define política salarial,
   não interpreta cláusula de CCT sem provocação, não valida CCT que o cliente não informou).
2. **Prazo de entrega de insumos pelo cliente** (variáveis, admissões, afastamentos, atestados) com
   efeito expresso: entrega fora do prazo → **responsabilidade pela multa é do cliente**.
3. **Carta de Responsabilidade da Administração** — já obrigatória `[V-INDIRETO]` pela Resolução CFC
   1.590/2020, art. 2º, "j".
4. **Dever do cliente de informar a CCT aplicável** e suas alterações — ver 7.2, é o dado vivo mais
   perigoso da folha.
5. **Limitação de responsabilidade** a valor pactuado (multa/juros/perdas diretas), com exclusão de lucros
   cessantes. **`PENDÊNCIA — não confirmado`:** validade e limites dessa cláusula em contrato de serviço
   contábil no direito brasileiro — não verificado; **submeter ao jurídico antes de usar**.
6. **Cláusula de dados (DPA)** — seção 1.4.
7. **Distrato formal** com transferência de responsabilidade e comunicação ao novo responsável técnico
   `[V-INDIRETO]` (Resolução CFC 1.590/2020).

### 6.4 Seguro de responsabilidade profissional — existe no Brasil?

**Sim.** `[V-INDIRETO]` O seguro de **Responsabilidade Civil Profissional / Erros e Omissões (E&O)** é
comercializado no Brasil, registrado na SUSEP sob o **ramo 0378**, e é oferecido especificamente para
contadores e organizações contábeis por seguradoras do mercado. A **Circular SUSEP nº 637**, com vigência
a partir de **01/09/2021**, dispõe sobre a modalidade.

**O que checar antes de contratar (não verificado — decisão comercial):**
- Base **"claims made"** (à base de reclamações) × ocorrência, e o **prazo complementar** — erro de folha
  costuma aparecer 2 a 5 anos depois. Apólice claims made sem prazo complementar adequado é inútil para
  esse risco.
- Cobertura para **multas e penalidades** — muitas apólices **excluem** multa de natureza fiscal. Este é
  exatamente o sinistro típico do escritório.
- Cobertura para **cyber / violação de dados** e para custos de resposta a incidente e notificação de
  titulares — é cobertura **diferente** de E&O. Provavelmente exige apólice cyber separada.
- Retroatividade, franquia, limite agregado, e se cobre atos de **prepostos e subcontratados** (o white
  label).

> **`PENDÊNCIA — não confirmado`:** coberturas, exclusões e preços de apólices específicas. Não pesquisado.
> **Recomendação de sequenciamento:** cotar **E&O + cyber** antes de assinar o primeiro contrato de folha
> — o risco de folha é qualitativamente maior que o de escrita fiscal, e é o momento certo para revisar a
> proteção do escritório.

---

## 7. DADOS VIVOS — o que o sistema NÃO pode inventar

Mesmo padrão de `docs/fontes-oficiais.md`: **coleta → detecção de mudança → staging → diff legível →
proposta estruturada → aprovação humana → publicação versionada.** Nenhum parâmetro entra em produção por
sinal único, e a regra antiga vira histórico (com origem, data e hash).

### 7.1 Catálogo

| # | Dado vivo | Fonte canônica | Cadência de verificação | Se ficar desatualizado |
|---|---|---|---|---|
| **DV-01** | **Tabela de contribuição do INSS (faixas e alíquotas 7,5% / 9% / 12% / 14%) e teto** | Portaria Interministerial **MPS/MF** (a de 2026 é a **nº 13, de 09/01/2026**), publicada no DOU / `gov.br/previdencia` | **Anual em janeiro**, com **vigilância diária de 01 a 20/01** (a portaria costuma sair depois da virada) + gatilho a cada nova portaria | Desconto de INSS errado em **todos** os empregados de **todos** os clientes. Recolhimento a menor → multa e juros; a maior → devolução e retrabalho. **Erro sistêmico, não pontual.** |
| **DV-02** | **Salário mínimo nacional** | Norma federal anual (decreto/MP) + reflexo na Portaria Interministerial MPS/MF | Anual em janeiro + gatilho legislativo | Piso salarial, salário-família, cálculo proporcional e vários limites saem errados em cascata. |
| **DV-03** | **Salário-família (valor da cota e limite de renda)** | Portaria Interministerial MPS/MF (mesma norma do DV-01) | Anual em janeiro | Benefício pago a menor/maior; reflexo em INSS. Afeta justamente famílias com **dependentes menores**. |
| **DV-04** | **Tabela do IRRF mensal e o redutor da Lei 15.270/2025** | **Lei nº 15.270, de 26/11/2025** (Planalto) + **IN RFB nº 2.299/2025** + página de orientação da Receita Federal | **Anual + gatilho legislativo.** Em 2026 o regime é novo (redutor de até **R$ 312,89**, isenção efetiva até **R$ 5.000,00**, redução decrescente até **R$ 7.350,00**) → **verificação trimestral** enquanto houver ajuste normativo | IRRF retido a menor → responsabilidade da fonte pagadora. A menor **ou** a maior gera correção em DIRF/DCTFWeb e reclamação do empregado. **Regime novo = risco alto em 2026.** |
| **DV-05** | **Convenções e Acordos Coletivos (CCT/ACT) por sindicato e base territorial** | Sistema **Mediador** do Ministério do Trabalho e Emprego (`mediador.trabalho.gov.br`) — registro oficial dos instrumentos | **Mensal por cliente**, + **gatilho na data-base** de cada categoria, + confirmação do cliente por escrito | **O pior de todos.** Piso, reajuste retroativo, adicionais, tíquete, hora extra, banco de horas, contribuição assistencial. Erro aqui gera **passivo retroativo** com correção e reclamatória — e o escritório dificilmente escapa de responsabilidade porque a CCT é pública. |
| **DV-06** | **Versão de leiaute do eSocial e Notas Orientativas** | Portal `gov.br/esocial` — Manual de Orientação (MOS). Vigente: série **S-1.3**, consolidada até a **NO S-1.3 07/2026** | **Por release** (NO/NT) — assinar/monitorar a página de documentação técnica. **Quinzenal** como piso | Rejeição em massa de eventos, folha travada, multa por atraso. **Precedente real:** em 2026 o envio de eventos de folha ficou **liberado apenas após a publicação da portaria** que reajustou os valores previdenciários — o eSocial **valida contra a tabela vigente**, então tabela errada = evento rejeitado. |
| **DV-07** | **FAP (Fator Acidentário de Prevenção) anual, por empresa (CNPJ)** | `PENDÊNCIA — não confirmado` (norma, órgão publicador, data de divulgação e prazo de contestação **não verificados**) | A definir após confirmar a fonte | Multiplica a alíquota RAT. Erro incide sobre **toda a folha** do cliente durante o ano. **É dado por CNPJ, não geral** — não existe "valor padrão"; sem FAP confirmado, o cálculo é PROVISÓRIO. |
| **DV-08** | **RAT e códigos de FPAS / Terceiros** | `PENDÊNCIA — não confirmado` (a referência usual é normativo da RFB — **não verificado nesta rodada**) | A definir após confirmar a fonte | Alíquota de terceiros errada (SESI/SENAI/SEBRAE/INCRA/salário-educação) → recolhimento a menor em toda a folha. Muda com CNAE e com enquadramento. |
| **DV-09** | **Tabelas do eSocial (rubricas, natureza, motivos de afastamento e desligamento, países, CBO)** | Portal `gov.br/esocial` — tabelas do leiaute | **Por release do leiaute** | Código inválido → evento rejeitado; código válido mas errado → informação falsa transmitida (pior, porque passa). |
| **DV-10** | **Prazos de guarda (a própria seção 3)** | Normas da seção 10 | **Semestral** + gatilho jurisprudencial | Expurgo antes da hora = perda de prova em reclamatória e em fiscalização. Guarda além da hora = violação de minimização. **Os dois lados doem.** |
| **DV-11** | **Marco regulatório de proteção de dados (LGPD + resoluções da ANPD)** | `gov.br/anpd` — resoluções, guias e enunciados | **Mensal** | Prazo de incidente, conteúdo de comunicação e regime de agentes de pequeno porte mudam por resolução, não por lei. |

### 7.2 Por que a CCT (DV-05) merece tratamento especial

É o único dado vivo que:
- **não tem fonte única nacional consolidada** — são milhares de instrumentos, por categoria e base territorial;
- **muda em datas diferentes** para cada categoria (data-base), sem calendário unificado;
- costuma ser **retroativo** — publicado em julho, com efeito de maio, gerando diferenças a pagar;
- depende de **informação do cliente** para saber qual instrumento se aplica (enquadramento sindical não
  é dedutível só do CNAE); e
- é onde o **erro se acumula silenciosamente** por meses antes de aparecer.

**Regra do Lior:** todo tenant tem `cct_vigente` com **número de registro no Mediador, vigência, data da
última verificação e quem confirmou**. Sem CCT confirmada e vigente, a folha **é processada e marcada
PROVISÓRIA**, com pendência aberta — e o relatório sai com o carimbo. Nunca "assume-se" piso ou reajuste.

---

## 8. MANIFESTO ANTI-INVENÇÃO DA FOLHA

> Extensão direta da regra 1 do `CLAUDE.md` ("Nada é inventado") para o domínio de folha. Estas onze
> regras são **inegociáveis** e valem para código, IA, UI e conversa com cliente.

**1. Parâmetro não confirmado é `null` — nunca zero, nunca "o do ano passado".**
Se a tabela de INSS de 2026 ainda não foi publicada e confirmada, o campo é `null`. `0` é um número e o
motor calcula com ele. `null` para o motor.

**2. Todo parâmetro carrega procedência.**
Nenhum valor de tabela existe sem `{valor, vigencia_inicio, vigencia_fim, fonte_url, norma, data_coleta,
hash, aprovado_por, aprovado_em}`. Parâmetro sem procedência **não é publicado**.

**3. Sem parâmetro confirmado, o resultado sai PROVISÓRIO — e o cálculo não "chuta" o ausente.**
O motor não aplica a regra faltante nem como sim nem como não. Ele calcula o que é seguro, marca o
resultado como PROVISÓRIO, lista **qual** parâmetro falta e **por quê**.

**4. Nenhum valor padrão silencioso. Jamais.**
Não existe `DEFAULT 0.20`, `?? 1.0`, "se não achar FAP usa 1,0000", "se não achar CCT usa o mínimo".
Fallback silencioso em folha é como o motor mente com cara de certeza.

**5. Toda pendência abre tarefa no Kanban G41.**
`tarefas.g41.com.br/api/public/tasks`, POST, `X-API-Key` + `X-Idempotency-Key`. Idempotência obrigatória
(chave = tipo de pendência + tenant + competência). Pendência que só aparece na tela não existe.

**6. A UI expõe a pendência no mesmo lugar do número.**
Nunca em rodapé, nunca em aba escondida. Selo **âmbar `#E9A74A`** ao lado do valor, com o nome do
parâmetro faltante. Valores em **IBM Plex Mono**. **Zero vermelho.**

**7. Documento com valor PROVISÓRIO não é transmitido nem entregue.**
Holerite, guia, TRCT e evento do eSocial saem **bloqueados** enquanto houver parâmetro pendente. A
liberação é ato humano, nominal e registrado. O sistema pode calcular provisório; **não pode publicar
provisório.**

**8. IA não é fonte de parâmetro.**
LLM pode ler norma, resumir, classificar rubrica, apontar divergência e **propor**. O valor entra na
tabela vindo de **fonte oficial com URL**, passando por **aprovação humana**. Modelo de linguagem nunca
é a origem de uma alíquota, faixa, prazo ou piso. E vale a seção 5.8: dado de folha não sai do sistema.

**9. Mudança de parâmetro nunca sobrescreve — versiona.**
Divergência detectada abre tarefa e espera **aprovação humana antes de publicar**. O valor antigo vira
histórico. Toda folha guarda **qual versão de cada parâmetro** usou. Recalcular 2026 em 2030 tem que
reproduzir o mesmo número.

**10. Regra fiscal/trabalhista nunca é implementada de memória.**
Antes de codar: pesquisar a norma vigente, **citar a URL no comentário do código**, registrar a data de
verificação. Em dúvida, pendência — não suposição. (Mesma regra do motor tributário; muda o domínio, não
o princípio.)

**11. Memória de cálculo auditável por evento.**
Cada verba, cada desconto, cada base: fórmula aplicada, parâmetros com versão, e o "porquê" em linguagem
simples. Se a G41 não consegue explicar um centavo do holerite a um juiz do trabalho, o cálculo não está
pronto — **independentemente de estar certo**.

> *Insights Impulsionam.*

---

## 9. PENDÊNCIAS

Ordenadas por bloqueio. **Nenhum item abaixo pode virar código, contrato ou texto de cliente antes de resolvido.**

| ID | Pendência | Por que bloqueia | Onde verificar |
|---|---|---|---|
| **P-01** | **Promover todos os `[V-INDIRETO]` para `[V-DIRETO]`** abrindo cada URL da seção 10 fora deste ambiente (o proxy bloqueou `planalto`, `gov.br` e `in.gov.br`) | É a base de todo o documento | Seção 10 |
| **P-02** | **Enunciado da ANPD sobre dados de crianças e adolescentes** — teor não lido | Define se dependente menor exige consentimento parental ou convive com obrigação legal. Bloqueia contrato e UI de dependentes | `gov.br/anpd` — notícia "ANPD divulga enunciado sobre o tratamento de dados pessoais de crianças e adolescentes" |
| **P-03** | **Incisos exatos** de LGPD art. 7º (V, VI) e art. 11, II (alíneas de tutela da saúde e de processo) | Base legal citada com inciso errado em DPA é defeito grave | Lei 13.709/2018 |
| **P-04** | **Portaria MTP 671/2021: artigos de prazo de guarda** de registro de empregados, **ponto** e rescisão | Sem isso, três linhas da tabela 3.2 ficam vazias e o expurgo não pode ser configurado | Portaria MTP 671/2021 compilada (PDF em `gov.br/trabalho-e-emprego`) |
| **P-05** | **Prazo de guarda de PPP e LTCAT** | Retenção longa de dado sensível de SST | Normativo do INSS sobre PPP — fonte a identificar |
| **P-06** | **DV-07 — FAP:** norma, órgão, data de divulgação anual, prazo de contestação | Multiplica o RAT de toda a folha. **Sem isso o RAT do Lior sai PROVISÓRIO** | `gov.br/previdencia` / `gov.br/inss` |
| **P-07** | **DV-08 — FPAS e alíquotas de Terceiros:** normativo vigente e anexos | Recolhimento a menor em toda a folha | Normativo da RFB — identificar o vigente em 2026 |
| **P-08** | **Leiaute S-1.3 campo a campo de S-2210 e S-2220** e prazos de envio | Nenhum evento de SST pode ser codificado sem isso | MOS S-1.3 consolidado (seção 10) |
| **P-09** | **LGPD art. 52** — sanções, valores e dosimetria; e **Resolução CD/ANPD nº 2/2022** (agentes de tratamento de **pequeno porte**), que pode alterar obrigações e prazos aplicáveis à G41 | Muda o dimensionamento do risco e possivelmente as obrigações | `planalto.gov.br` e `gov.br/anpd` |
| **P-10** | **Mecanismo vigente de cifragem em coluna no Supabase gerenciado** (`pgcrypto` × Vault × TCE) e onde a chave reside | Decide a arquitetura de 5.3 | Documentação vigente do Supabase |
| **P-11** | **Redação de CC arts. 186, 927 e 1.178** e do **Decreto-Lei 9.295/1946** | Fundamentação da seção 6 | `planalto.gov.br` |
| **P-12** | **Valores atualizados de multas em 2026:** CLT arts. 47 e 47-A (citados como R$ 3.000 e R$ 600) e Lei 8.212/91 art. 32-A | **Não usar nenhum valor de multa em material de cliente até confirmar.** Valores encontrados em fontes secundárias, divergentes entre si | `planalto.gov.br` (CLT e Lei 8.212/91) |
| **P-13** | **CLT art. 614, §3º** — vigência máxima de CCT/ACT | Regra de expiração do DV-05 | `planalto.gov.br` |
| **P-14** | **Mediador/MTE** como fonte consultável programaticamente (existe API? só HTML?) | Define se DV-05 é automatizável ou processo humano | `mediador.trabalho.gov.br` |
| **P-15** | **Base legal de biometria em controle de jornada** — manifestação da ANPD | Enquanto pendente, **Lior não oferece ponto biométrico** | `gov.br/anpd` |
| **P-16** | **Validade de cláusula de limitação de responsabilidade** em contrato contábil | Cláusula 5 de 6.3 | Jurídico |
| **P-17** | **Política de retenção/treino do provedor de LLM** contratado | Bloqueia qualquer chamada com dado real, mesmo pseudonimizado | Contrato/DPA do provedor |
| **P-18** | **Prazo mínimo de guarda da trilha de auditoria** — norma não identificada | Definir por política interna e registrar a decisão como tal | — |
| **P-19** | **Cotação de seguro E&O + cyber** com verificação de exclusão de multas fiscais e de base claims made | Decisão comercial antes do 1º contrato de folha | Corretora / SUSEP |
| **P-20** | **Redação exata dos requisitos de consentimento** (LGPD art. 5º, XII e art. 8º) para sustentar o argumento de 1.2.1 | Argumento usado com cliente precisa de citação firme | `planalto.gov.br` |

---

## 10. Fontes

Todas acessadas/verificadas em **30/08/2026**, por **busca restrita a domínio oficial** — ver a limitação
declarada na seção 0. `[V-DIRETO]` apenas onde indicado.

### Proteção de dados
| Norma / documento | URL |
|---|---|
| Lei nº 13.709/2018 (LGPD) | https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm |
| LGPD — texto compilado | http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm |
| Resolução CD/ANPD nº 15, de 24/04/2024 — Regulamento de Comunicação de Incidente de Segurança | https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-aprova-o-regulamento-de-comunicacao-de-incidente-de-seguranca |
| ANPD — canal de comunicação de incidente (CIS) | https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis |
| ANPD — Guia Orientativo: definições dos agentes de tratamento e do encarregado (v2.0, abr/2024) | https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-para-definicoes-dos-agentes-de-tratamento-de-dados-pessoais-e-do-encarregado |
| ANPD — Guia Orientativo: atuação do encarregado | https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/copy_of_guia_da_atuacao_do_encarregado_anpd.pdf |
| ANPD — enunciado sobre dados de crianças e adolescentes (**a ler — P-02**) | https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-divulga-enunciado-sobre-o-tratamento-de-dados-pessoais-de-criancas-e-adolescentes |

### Trabalhista, previdenciário e SST
| Norma / documento | URL |
|---|---|
| CLT (Decreto-Lei nº 5.452/1943) — arts. 11, 41, 47, 47-A, 614 | https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm |
| CLT compilada | http://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm |
| Constituição Federal — art. 7º, XXIX | http://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm |
| Portaria MTP nº 671, de 08/11/2021 — compilada | https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3/portaria-no-671-de-8-de-novembro-de-2021-compilada-20-10-2023.pdf |
| Portaria MTP nº 671/2021 — página oficial | https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3/portarias-consolidadas |
| NR-07 — PCMSO (versão atualizada) | https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-07-atualizada-2022-1.pdf |
| Lei nº 8.212/1991 — art. 32, §11 e art. 32-A | https://www.planalto.gov.br/ccivil_03/leis/l8212cons.htm |
| STF — Súmula Vinculante 8 | https://portal.stf.jus.br/jurisprudencia/sumariosumulas.asp?base=26&sumula=1209 |
| STF — ARE 709.212 (Tema 608), prescrição quinquenal do FGTS, 13/11/2014 | https://noticias.stf.jus.br/postsnoticias/prazo-prescricional-para-cobranca-de-valores-referentes-ao-fgts-e-de-cinco-anos/ |
| STF — voto no ARE 709.212 | https://www.stf.jus.br/arquivo/cms/noticiaNoticiaStf/anexo/ARE709212voto.pdf |
| Sistema Mediador (registro de CCT/ACT) | https://mediador.trabalho.gov.br/ |

### eSocial
| Documento | URL |
|---|---|
| MOS — Manual de Orientação do eSocial, versão **S-1.3**, consolidado até a **NO S-1.3 07/2026** | https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-07-2026.pdf |
| eSocial — documentação técnica (manuais e leiautes) | https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais |
| eSocial — nota: envio de eventos de folha liberado após portaria de reajuste dos valores previdenciários de 2026 | https://www.gov.br/esocial/pt-br/noticias/liberado-o-envio-de-eventos-de-folha-para-o-esocial-apos-publicacao-de-portaria-que-reajusta-valores-previdenciarios-em-2026-1 |
| eSocial — perguntas frequentes | https://www.gov.br/esocial/pt-br/empresas/perguntas-frequentes/historico-de-perguntas-frequentes |

### Parâmetros anuais (dados vivos)
| Documento | URL |
|---|---|
| **Portaria Interministerial MPS/MF nº 13, de 09/01/2026** — reajuste de benefícios e demais valores (INSS, teto, salário-família) | https://www.gov.br/previdencia/pt-br/assuntos/rpps/documentos/PortariaInterministerialMPSMF13de9dejaneirode2026.pdf |
| Nota oficial sobre a Portaria MPS/MF nº 13/2026 | https://www.gov.br/previdencia/pt-br/assuntos/rpps/destaques/publicada-a-portaria-interministerial-mps-mf-no-13-de-9-01-2026-que-dispoe-sobre-o-reajuste-dos-beneficios-pagos-pelo-inss-e-demais-valores |
| INSS — teto de R$ 8.475,55 em 2026 (reajuste de 3,9%) | https://www.gov.br/inss/pt-br/assuntos/com-reajuste-de-3-9-teto-do-inss-chega-a-r-8-475-55-em-2026 |
| INSS — tabela de contribuição mensal | https://www.gov.br/inss/pt-br/direitos-e-deveres/inscricao-e-contribuicao/tabela-de-contribuicao-mensal |
| **Lei nº 15.270, de 26/11/2025** — redução do IR e tributação mínima | https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15270.htm |
| Receita Federal — orientação de cálculo da redução do IR a partir de 01/01/2026 | https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/dezembro/receita-federal-orienta-fontes-pagadoras-e-contribuintes-a-calcular-a-reducao-do-imposto-de-renda-a-partir-de-1o-de-janeiro-de-2026 |
| Receita Federal — exemplos de aplicação da Lei 15.270/2025 | https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/exemplos-de-aplicacao-da-lei-15-270-2025 |
| Receita Federal — atualização das normas do IRPF (IN RFB nº 2.299/2025) | https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/dezembro/receita-federal-atualiza-normas-relativas-ao-imposto-sobre-a-renda-das-pessoas-fisicas |

### Responsabilidade profissional
| Documento | URL |
|---|---|
| Código Civil (Lei nº 10.406/2002) — arts. 186, 927, 1.177, 1.178 | https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm |
| CFC — NBC PG 01 (Código de Ética Profissional do Contador, 07/02/2019) | https://www1.cfc.org.br/sisweb/SRE/docs/NBCPG01.pdf |
| CFC — nota sobre a atualização do Código de Ética | https://cfc.org.br/noticias/codigo-de-etica-profissional-do-contador-e-atualizado-saiba-o-que-mudou/ |
| Resolução CFC nº 1.590/2020 — contrato de prestação de serviços contábeis (revogou a Res. CFC nº 987/2003) | https://crcms.org.br/wp-content/uploads/2020/05/Res.-CFC-1590_Contratos_Definitivo-18-03.pdf |
| CRC-MG — cláusulas mínimas do art. 2º da Resolução CFC nº 1.590/2020 | https://crcmg.org.br/acc-prof/o-que-o-contrato-de-prestacao-de-servicos-devera-ter-no-minimo-artigo-2o-da-resolucao-cfc-1590-2020/ |
| Circular SUSEP nº 637 (RC Profissional / E&O, vigência 01/09/2021) — ramo SUSEP 0378 | https://www.gov.br/susep/pt-br |

### Documentos internos do projeto
- `/home/user/masor/CLAUDE.md` — regras inegociáveis, identidade visual, preferências.
- `/home/user/masor/docs/fontes-oficiais.md` — padrão de catálogo de fontes, cadência e fluxo de aprovação.

---

*G41 Inteligência Contábil — Insights Impulsionam.*
