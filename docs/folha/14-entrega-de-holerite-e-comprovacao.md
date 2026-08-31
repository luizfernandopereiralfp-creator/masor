# 14 — Entrega do Holerite e Comprovação de Recebimento (Portal do Empregado no Lior)

> **Escopo.** O que a lei exige na entrega do demonstrativo/recibo de pagamento; o que faz uma
> comprovação eletrônica ter valor probatório; o registro mínimo para a prova se sustentar; prazo de
> guarda; LGPD na distribuição; e **o risco de troca de destinatário na quebra do PDF em lote exportado
> do Domínio** — que é o ponto de maior dano deste módulo.
> **Data-base:** 30/08/2026. **Padrão herdado:** `CLAUDE.md` (regra 1 — nada é inventado),
> `06-riscos-lgpd-e-dados-vivos.md` (papéis, prazos, trilha, incidente) e
> `10-migracao-ponto-e-holerite.md` **Parte III** (conteúdo, layout e regras D-01 a D-07).
> **Alertas na UI:** âmbar `#E9A74A` sobre navy `#0B1740`. **ZERO vermelho.**

---

## 0. Método, selos e a limitação desta rodada

### 0.1 Limitação técnica — leia antes de usar qualquer citação

O ambiente desta pesquisa teve **egress bloqueado pelo proxy** para `*.gov.br`, `planalto.gov.br`,
`in.gov.br`, `tst.jus.br`, `cfc.org.br` e para os sites de fornecedores (403 no CONNECT). **Nenhuma norma
foi lida na origem.** O que existiu foi o **índice de busca**: títulos, trechos e paráfrases de fontes
**secundárias** (escritórios de advocacia, portais de legislação privados, agregadores de jurisprudência).

Isso obriga um selo mais duro que o do `06`. A promoção indevida de selo entre documentos é exatamente a
falha que a `AUDITORIA-anti-invencao.md` já apanhou neste conjunto — então aqui **nada sobe de nível por
conveniência**.

| Selo | Significado | Pode virar código/contrato/tela? |
|---|---|---|
| `[V-DIRETO]` | Texto normativo lido na fonte oficial. **Nenhum item deste documento tem este selo.** | Sim |
| `[V-INDIRETO]` | Confirmado por busca **em domínio oficial**, sem leitura integral. | Só depois de reconferido |
| `[V-SECUNDÁRIO]` | **Selo novo deste documento.** Redação convergente em **duas ou mais fontes secundárias independentes**, nenhuma delas oficial. É o teto de confiança que este ambiente permitiu. | **Não.** É insumo de trabalho |
| `PENDÊNCIA — não confirmado` | Não verificado. | **Não** |
| `[ENG]` | Decisão de engenharia/produto. Não é afirmação normativa e não precisa de fonte legal. | Sim, é do projeto |

> **Regra de leitura:** tudo que este documento diz sobre **lei** é, no máximo, `[V-SECUNDÁRIO]`.
> Tudo que ele diz sobre **como construir o portal** é `[ENG]` e vale como especificação. A parte de
> engenharia — em especial a seção 6 — **não depende** de fechar as pendências jurídicas: ela é mais
> restritiva que qualquer norma provável.

### 0.2 O que este documento não refaz

| Assunto | Onde está |
|---|---|
| Conteúdo e layout do holerite, memória de cálculo, wireframe | `10` Parte III §1 a §5 |
| Regras D-01 a D-07 de distribuição e a tabela `folha_holerite` | `10` Parte III §6 — **este documento estende e substitui a tabela `folha_holerite` no que toca a entrega** |
| Papéis LGPD, DPA, incidente, trilha de auditoria, prazos dos três relógios | `06` §1, §3, §4, §5.4 |
| Regra de não mandar dado de folha para LLM | `06` §5.8 — **vale integralmente aqui** |
| Comprovante de rendimentos: norma e prazo vigentes | `04` §7 e `04 P-01` — **continua pendente** |

---

# PARTE I — O QUE A LEI EXIGE NA ENTREGA

## 1. Dois documentos que o mercado trata como um só

O erro conceitual mais comum do assunto: chamar tudo de "holerite". São **duas funções jurídicas
distintas**, que podem ou não estar no mesmo papel.

| | **Demonstrativo de pagamento** | **Recibo de pagamento (quitação)** |
|---|---|---|
| Função | **Informar**: discriminar as parcelas pagas e descontadas, com referência e base | **Provar**: que o valor foi efetivamente pago e recebido |
| Quem produz | Empregador | Empregador, **com a manifestação do empregado** (assinatura) — ou substituído pelo comprovante de depósito |
| Natureza | Documento **informativo/declaratório** unilateral | **Prova de quitação** — declaração de recebimento |
| Vale sozinho em juízo? | **Não prova pagamento.** Prova o que o empregador *diz* que pagou | Sim, é a prova do pagamento |
| Norma-âncora | Discriminação das parcelas — **`PENDÊNCIA`**, ver §3 | CLT, art. 464 `[V-SECUNDÁRIO]` |

**Por que a distinção decide o produto:** um portal que só *disponibiliza* PDF entrega o **demonstrativo**
e não produz o **recibo**. Ele resolve comunicação e não resolve prova. O que a G41 está construindo só
substitui o portal do Domínio com vantagem se produzir os dois — e é a comprovação de ciência que faz a
segunda metade.

> **Nuance honesta, que precisa estar na conversa com o cliente:** mesmo com a melhor trilha eletrônica
> possível, **quem quita o salário é o comprovante do crédito em conta**, não o holerite. O aceite no
> portal é prova de **ciência do demonstrativo** — que é o que ganha a discussão sobre *verba não
> discriminada* e sobre *ciência do desconto*, não a discussão sobre *o dinheiro entrou na conta*. Vender
> o aceite como "quitação eletrônica" é superdimensionar. Ver §5.

---

## 2. CLT, art. 464 — o que ele diz e o que ele não diz

`[V-SECUNDÁRIO]` **CLT, art. 464** (Decreto-Lei nº 5.452/1943), redação reproduzida de forma convergente
em fontes secundárias independentes:

> *"O pagamento do salário deverá ser efetuado contra recibo, assinado pelo empregado; em se tratando de
> analfabeto, mediante sua impressão digital, ou, não sendo esta possível, a seu rogo."*
>
> **Parágrafo único** (acrescido pela Lei nº 9.528/1997): *"Terá força de recibo o comprovante de depósito
> em conta bancária, aberta para esse fim em nome de cada empregado, com o consentimento deste, em
> estabelecimento de crédito próximo ao local de trabalho."*

**O que o artigo estabelece:**

| # | Comando | Consequência para o portal |
|---|---|---|
| 1 | Pagamento **contra recibo** — o recibo é condição de forma do pagamento | O sistema precisa produzir algo que funcione como recibo, ou depender do comprovante bancário |
| 2 | Recibo **assinado pelo empregado** | Sem manifestação do empregado, o papel é declaração unilateral do empregador |
| 3 | Forma alternativa para analfabeto (impressão digital / a rogo) | Acessibilidade não é opcional: o portal precisa de um caminho para quem não usa o portal. Ver §12 |
| 4 | **Equivalência**: o comprovante de depósito em conta aberta para esse fim, com consentimento, **tem força de recibo** | É a razão pela qual quase ninguém coleta assinatura hoje — e é também o limite do que o aceite eletrônico substitui |

**O que o artigo NÃO diz** — e é preciso ser explícito, porque o mercado preenche essas lacunas com
suposição:

- **Não define o conteúdo** do demonstrativo. Nenhuma rubrica, base ou campo obrigatório está no art. 464.
- **Não veda** a forma eletrônica. Também **não a autoriza expressamente**.
- **Não define** o que é "assinatura" para esse fim, nem se assinatura eletrônica satisfaz o requisito.
- **Não fixa prazo de guarda** do recibo.

> `PENDÊNCIA — não confirmado` **(E-01, bloqueadora):** a redação acima é `[V-SECUNDÁRIO]`. Enquanto o art.
> 464 não for lido no texto compilado da CLT, **nenhuma tela, contrato ou material de cliente pode citá-lo
> com aspas**. É o mesmo item **G4 / D4** de `FONTES-A-BAIXAR.md`, já marcado como **BLOQUEADOR do
> holerite** em `10` (H-01 a H-05).

---

## 3. Conteúdo obrigatório do demonstrativo — a lacuna que ninguém mapeou

Aqui aparece um achado que **contradiz parcialmente** o que circula no mercado e que precisa ficar
registrado.

A referência normativa que quase todo material de RH cita para "o holerite precisa discriminar as parcelas"
é a **Portaria MTB nº 3.626, de 13/11/1991** `[V-SECUNDÁRIO]`. Ocorre que:

`[V-SECUNDÁRIO]` a **Portaria MTP nº 671, de 08/11/2021** consolidou e **revogou** um conjunto amplo de
portarias trabalhistas anteriores, e há indicação de que a **Portaria 3.626/1991 está entre as revogadas**.

Isso abre três possibilidades, e **não sei qual é a correta**:

| Hipótese | Consequência |
|---|---|
| A regra de discriminação foi **reproduzida** em algum artigo da Portaria 671/2021 | A obrigação continua, com nova base — e é preciso saber o artigo |
| A regra **não foi reproduzida** e a exigência hoje se sustenta em outro fundamento (art. 464 lido em conjunto com a vedação a pagamento sem discriminação, jurisprudência, fiscalização) | A obrigação continua, com fundamento mais fraco e menos citável |
| A regra caiu | Só a jurisprudência sustenta a exigência |

> `PENDÊNCIA — não confirmado` **(E-02, bloqueadora do catálogo de campos):** qual norma vigente em 2026
> obriga a **discriminação das parcelas** no demonstrativo, e qual o conteúdo mínimo exigido. Fecha com a
> leitura da **Portaria MTP 671/2021 na íntegra** (item **C3** de `FONTES-A-BAIXAR.md`) e do **art. 464 da
> CLT** (item **D4/G4**).

**Regra de engenharia enquanto isso** `[ENG]` — é a mesma de `10` Parte III §1, e ela continua correta:
o gerador imprime o **conjunto amplo** de campos, cada campo carrega `obrigatorio_por_norma = null` até
confirmação, e a confirmação depois **trava** o que não pode sair, em vez de acrescentar o que faltava.
Como neste projeto os PDFs vêm prontos do Domínio, a consequência prática é menor: **o conteúdo é o que o
Domínio imprime**. Mas isso cria uma pendência de responsabilidade, e ela precisa estar escrita:

> **`[ENG]` A G41 distribui um documento que não produziu.** Se o layout do Domínio omitir um campo que a
> norma exige, o defeito é do documento e a G41 está no caminho da entrega. Antes do dia 1, alguém do DP
> precisa **conferir uma amostra do PDF do Domínio contra o catálogo de campos** de `10` §1.1 e registrar o
> resultado. Não é conferência de cálculo — é conferência de **forma**.

---

## 4. Entrega em meio eletrônico — o que dá para afirmar

**O que dá para afirmar com o material desta rodada:**

| Afirmação | Selo |
|---|---|
| A CLT não veda expressamente a entrega eletrônica do demonstrativo | `[V-SECUNDÁRIO]`, por ausência — e **argumento por ausência é fraco**; ver a pendência abaixo |
| A prática de mercado (portais do empregado, inclusive o do próprio Domínio) é amplamente disseminada e não há notícia de vedação | Observação de fato, **não é norma** |
| `[V-SECUNDÁRIO]` Para **comprovante de registro de ponto**, a Portaria MTP 671/2021 admite expressamente o formato eletrônico: arquivo **em PDF, assinado eletronicamente**, com acesso ao trabalhador por sistema eletrônico após cada marcação | É de **ponto**, não de holerite — ver o alerta abaixo |
| `[V-SECUNDÁRIO]` A Portaria 671/2021, em seus **arts. 87 e 88**, trata das assinaturas eletrônicas de REP-C, REP-A e REP-P: exige **certificado ICP-Brasil** (assinatura **qualificada**, nos termos da Lei 14.063/2020) para REP-A, REP-P e programas de tratamento, com padrão **PAdES** para o comprovante em PDF e **CAdES** destacado (`.p7s`) para AFD e AEJ | É de **ponto**, não de holerite |

> **Âmbar — o erro de analogia que eu recomendo não cometer.** É tentador ler os arts. 87/88 e concluir
> "logo, holerite eletrônico também precisa de ICP-Brasil". **Não conclua isso.** Aqueles artigos regulam a
> assinatura **do equipamento/programa de ponto** — é o *fabricante/empregador* assinando um arquivo
> técnico para provar que ele não foi adulterado, dentro de um regime de homologação do INMETRO. Não é o
> *empregado* assinando um recibo. Transportar a exigência por analogia superdimensiona o requisito e custa
> caro sem ganho probatório proporcional (ver §7).

> `PENDÊNCIA — não confirmado` **(E-03):** existe norma, orientação de fiscalização ou precedente
> administrativo que trate **especificamente** da entrega eletrônica do demonstrativo/recibo de pagamento?
> Não localizado nesta rodada. Fecha com: Portaria MTP 671/2021 na íntegra + **Consolidação dos Precedentes
> Administrativos** do MTE (documento localizado no índice, não lido).

---

## 5. Para que serve, na prática, a comprovação de recebimento

Esta é a pergunta que decide o desenho — e a resposta não é "cumprir formalidade".

### 5.1 O ônus da prova

`[V-SECUNDÁRIO]` Em reclamatória sobre verba não paga, **o ônus de provar o pagamento é do empregador**.
Não é o empregado que prova que não recebeu; é a empresa que prova que pagou. Consequência direta: **todo
documento que a empresa não conseguir produzir vira presunção contra ela.**

`[V-SECUNDÁRIO]` Há notícia institucional do TST com o título *"Recibo de pagamento de salário sem
assinatura do empregado não serve como prova"*, e material convergente de escritórios afirmando que a
jurisprudência trabalhista só admite como prova de pagamento **o recibo assinado ou o comprovante de
depósito bancário**.

> `PENDÊNCIA — não confirmado` **(E-04):** número do processo, órgão julgador e data da decisão noticiada
> pelo TST — a URL foi localizada mas **o proxy bloqueou `tst.jus.br`**. **Não citar a decisão em material
> de cliente até ler o inteiro teor ou ao menos a notícia.** Uma paráfrase de escritório sobre uma notícia
> sobre um acórdão são três camadas de distância da fonte.

### 5.2 O que o aceite eletrônico ganha e o que ele não ganha

| A discussão em juízo é sobre... | O aceite no portal ajuda? | Por quê |
|---|---|---|
| "Nunca recebi meu salário de março" | **Pouco** | Quem resolve é o comprovante do crédito em conta (art. 464, p.ú.) |
| "A empresa nunca me deu demonstrativo / não sei o que foi descontado" | **Muito** | O aceite prova ciência do documento, com data |
| "Esse desconto de consignado eu nunca autorizei / nunca soube" | **Muito** | Prova que o desconto estava discriminado num documento que o empregado abriu e declarou ciência |
| "Fiz horas extras que nunca foram pagas" | **Médio** | O demonstrativo com ciência mostra o que foi pago naquele mês; a prova das horas é do ponto |
| "Meu holerite era diferente do que a empresa juntou aos autos" | **Muito** | É aqui que o **hash** e a **trilha** decidem. Ver §8 |
| "A empresa alterou o holerite depois" | **Muito** | Idem: versionamento + hash + trilha append-only |
| Prescrição — "reclamo verba de 2021" | **Indireto** | Só se a empresa **ainda tiver** o documento e a prova de entrega. Ver §10 |

### 5.3 O valor que ninguém contabiliza

O aceite datado cria uma **linha do tempo verificável de ciência**. Numa reclamatória com dez verbas, o que
faz diferença não é um documento — é conseguir montar, em uma tabela, *o que foi entregue, quando, para
quem, com qual conteúdo, aberto em que data*. Escritório que produz esse dossiê em uma consulta ganha
credibilidade antes do mérito. É o mesmo argumento da trilha de auditoria em `06` §6.2: **o controle que
decide a discussão não é jurídico, é de produto.**

---

# PARTE II — VALIDADE DA COMPROVAÇÃO ELETRÔNICA

## 6. Os quatro elementos de um aceite que sobrevive à contestação

Um "aceite" não vale por ser um botão clicado. Vale se responder quatro perguntas quando alguém disser
"não fui eu" ou "não era isso":

| # | Elemento | A pergunta que ele responde | O que o sustenta tecnicamente |
|---|---|---|---|
| 1 | **Autoria** (identificação inequívoca) | Foi **essa pessoa**? | Como a conta foi criada e vinculada ao CPF; como o acesso foi autenticado; o que foi registrado da sessão |
| 2 | **Integridade** | O documento aceito é **este**? | `sha256` do PDF gravado no mesmo evento do aceite |
| 3 | **Tempo** | **Quando** foi? | Timestamp do servidor; idealmente carimbo de tempo de terceiro |
| 4 | **Trilha** | Dá para **reconstituir** e ela **não foi alterada**? | Log append-only, encadeado por hash, com retenção maior que a do documento |

**A hierarquia importa:** integridade e tempo são fáceis e baratos — é engenharia. **Autoria é o elo
fraco**, e é onde toda contestação real vai bater. Investir em criptografia forte sobre um cadastro cuja
identidade nunca foi verificada é blindar a porta de uma casa sem parede.

> `[ENG]` **Corolário de produto:** o momento mais importante do portal **não é o aceite — é o
> onboarding**. Como o empregado provou que era ele quando criou a senha. Se esse momento é frouxo (link
> por WhatsApp para um número que o RH digitou), todo o resto herda a fragilidade. Ver §9.3 e a trava
> **ID-14**.

---

## 7. MP 2.200-2/2001, Lei 14.063/2020 e o nível proporcional

### 7.1 MP 2.200-2/2001 — a norma que realmente se aplica aqui

`[V-SECUNDÁRIO]` A MP nº 2.200-2, de 24/08/2001, instituiu a **ICP-Brasil**. O ponto que interessa é o
**art. 10, §2º**: a instituição da ICP-Brasil **não exclui** a utilização de outro meio de comprovação da
autoria e da integridade de documentos em forma eletrônica, **inclusive os que utilizem certificados não
emitidos pela ICP-Brasil**, desde que **admitido pelas partes como válido** ou **aceito pela pessoa a quem
for oposto o documento**.

Traduzindo para o caso: **holerite não precisa de certificado digital ICP-Brasil.** Precisa de um meio de
comprovar autoria e integridade que **as partes tenham admitido**.

`[V-SECUNDÁRIO]` A jurisprudência do **STJ** vem em reforço: a 3ª Turma decidiu que documento particular
com assinatura eletrônica **não certificada pela ICP-Brasil é válido** quando não houver dúvida sobre a
autenticidade, cabendo a quem contesta produzir prova técnica capaz de infirmá-la; e que a assinatura
qualificada **não é requisito absoluto de validade** de documento particular, justamente porque a própria
MP 2.200-2 admite outros meios.

> `PENDÊNCIA — não confirmado` **(E-05):** números dos julgados do STJ (há notícia datada de 31/03/2026 e
> matéria de 28/11/2025 nos resultados) e a redação literal do art. 10, §2º da MP 2.200-2. **Não citar
> julgado por paráfrase de escritório em material de cliente.**

### 7.2 Lei 14.063/2020 — por que ela **não** rege este caso (e por que ainda serve)

`[V-SECUNDÁRIO]` A Lei nº 14.063, de 23/09/2020, dispõe sobre o uso de assinaturas eletrônicas **em
interações com entes públicos**: seu art. 2º delimita o âmbito a (i) interação interna de órgãos e
entidades da administração, (ii) interação entre pessoas físicas/jurídicas de direito privado **e esses
entes públicos**, e (iii) interação entre entes públicos.

**Holerite entregue pelo empregador ao empregado é relação privada.** A Lei 14.063 **não incide
diretamente** sobre ele.

Ela serve, ainda assim, para duas coisas — e as duas são úteis:

1. **Vocabulário.** `[V-SECUNDÁRIO]` A lei classifica as assinaturas em três níveis de confiança —
   **simples**, **avançada** e **qualificada** (esta usando certificado na forma do art. 10, §1º da MP
   2.200-2). É a taxonomia que o mercado e os tribunais usam. Adotá-la evita conversa confusa.
2. **Régua de proporcionalidade.** `[V-SECUNDÁRIO]` O **Decreto nº 10.543/2020** regulamentou o art. 5º
   dessa lei fixando **níveis mínimos por risco**: assinatura simples admitida quando o conteúdo **não
   envolve informação protegida por grau de sigilo** e **não oferece risco direto de dano**. Ou seja: até o
   poder público calibra o nível pelo risco, em vez de exigir o máximo sempre. É o melhor argumento
   disponível contra o superdimensionamento — **por analogia, e analogia não é fundamento**.

### 7.3 Os três níveis aplicados ao holerite

| Nível | O que é | Custo e atrito | Cabe no holerite? |
|---|---|---|---|
| **Simples** | Identifica o signatário por dado cadastral e um ato de vontade (login + clique) | Baixíssimo | **Insuficiente sozinha** se o cadastro não teve verificação de identidade. Com portal autenticado + trilha completa, é o piso aceitável |
| **Avançada** | Usa certificado não-ICP ou **outro meio de comprovar autoria e integridade admitido pelas partes**; associa a assinatura ao signatário de modo unívoco e detecta alteração posterior | Médio — dá para construir **dentro do próprio portal** | **É o nível proporcional.** Recomendação deste documento |
| **Qualificada** | Certificado ICP-Brasil (e-CPF) do empregado | Alto: o empregado precisa **ter e pagar** um e-CPF. Inviável na base operária | **Não.** Superdimensionado e excludente |

### 7.4 A recomendação, sem inflar

> **`[ENG]` Nível proporcional para holerite: assinatura eletrônica AVANÇADA construída pelo próprio
> portal** — e não contratação de certificado digital para o empregado.

Na prática isso significa **seis** requisitos, todos internos, todos baratos:

| # | Requisito | Como |
|---|---|---|
| A-1 | **Adesão prévia ao meio eletrônico**, registrada | É o "admitido pelas partes" da MP 2.200-2. Termo com versão, data, IP. Sem isso, o resto perde o fundamento |
| A-2 | **Vínculo verificado** entre conta e CPF no onboarding | Ver ID-14. É o elo fraco |
| A-3 | **Autenticação com segundo fator** no ato do aceite, ou sessão originada de autenticação forte | Eleva o nível sem exigir certificado |
| A-4 | **Integridade**: `sha256` do PDF gravado no evento de aceite | Detecta alteração posterior — requisito central do nível avançado |
| A-5 | **Trilha append-only encadeada** por hash | Impede a alegação de que o log foi editado |
| A-6 | **Declaração de vontade explícita e versionada** | Um checkbox com texto fixo, cuja versão é gravada. "Clicou em Baixar" não é aceite |

**Quando subir o nível** `[ENG]` — o holerite mensal é rotina de baixo litígio unitário; estes não são:

| Documento | Nível recomendado | Por quê |
|---|---|---|
| Holerite mensal, informe de rendimentos, espelho de ponto | **Avançada (portal)** | Volume alto, dano unitário baixo, contestação rara |
| **TRCT / termo de rescisão**, acordo de compensação, adesão a banco de horas, autorização de desconto novo | **Avaliar nível superior + assinatura em plataforma dedicada** | Documento de quitação, litígio concentrado, valor alto |
| Documento que o cliente empregador exigir por política | O que ele contratar | Decisão dele; a G41 registra e cobra |

> **Riscos que eu registro contra a minha própria recomendação** — para não ficar parecendo que a solução é
> sem custo:
> 1. **A adesão (A-1) pode ser atacada como adesão obrigatória.** O empregado que "aceita o meio
>    eletrônico" no primeiro dia de trabalho não tem alternativa real — é o mesmo problema de assimetria de
>    poder que invalida consentimento em LGPD (`06` §1.2). Mitigação: manter **sempre** um canal
>    alternativo em papel, disponível sem justificativa e sem atrito (ID-13/§12).
> 2. **Não há precedente trabalhista verificado** aceitando aceite em portal como equivalente à assinatura
>    do art. 464. `PENDÊNCIA — não confirmado` (**E-06**). Enquanto não houver, o comprovante de depósito
>    bancário continua sendo a prova principal do pagamento, e o aceite é prova **complementar** de ciência.
>    **Vender de outro jeito é promessa que a G41 não pode cumprir.**
> 3. **Assinatura avançada "caseira" tem um ponto cego:** ela é auditável por quem controla o sistema — a
>    própria G41. Um perito pode questionar a autotutela do log. Mitigação parcial e barata: **carimbo de
>    tempo externo** e/ou publicação periódica do **hash-raiz** da cadeia em local fora do controle da G41
>    (ver §8.4). Isso é o que converte "meu log diz" em "meu log dizia isso antes do processo existir".

---

# PARTE III — O QUE REGISTRAR PARA A PROVA SE SUSTENTAR

## 8. O registro de entrega e de ciência

### 8.1 Campos mínimos — e por que cada um existe

| Campo | Responde | Observação |
|---|---|---|
| `documento_id` + `versao` | Qual documento | Reemissão nunca sobrescreve (`10` D-07) |
| `sha256_documento` | **Qual arquivo exatamente** | O campo mais importante da tabela. Sem ele, "entreguei" é opinião |
| `vinculo_id` / `titular_id` | Para quem | Vínculo, não pessoa: quem tem dois contratos tem dois documentos |
| `evento_tipo` | O que aconteceu | Enumerado fechado — ver 8.2 |
| `ocorrido_em` (timestamptz, UTC) | Quando | Servidor, nunca cliente. Fuso resolvido só na exibição |
| `ator_tipo` / `ator_id` | Quem agiu | Empregado, usuário da G41, ou job. **Job não é pessoa** — se tudo é `service_role`, a trilha não serve (`06` §5.4) |
| `ip` (inet) | De onde | Prova fraca sozinha (CGNAT, VPN), **corroborante** junto com o resto |
| `user_agent` + `dispositivo_hash` | Em qual aparelho | Hash de características do dispositivo — **não** fingerprint invasivo. Serve para mostrar consistência: os doze aceites do ano vieram do mesmo aparelho |
| `sessao_id` | Qual sessão | Liga o aceite ao login que o originou |
| `metodo_autenticacao` | Como se autenticou | `senha`, `senha+otp`, `magic_link`, `biometria_dispositivo` |
| `nivel_assinatura` | Qual nível | `simples` / `avancada` — congelado no evento, porque a política muda com o tempo |
| `canal_aviso` + `mensagem_id_externo` | Por onde foi avisado | ID da Evolution API / provedor. Prova o envio, **não** a leitura |
| `aviso_status` | Entregue? Lido? | Estado reportado pelo provedor, com o momento |
| `aberto_em` / `baixado_em` | Quando olhou | Abertura ≠ ciência |
| `ciencia_em` + `texto_versao` | Quando declarou ciência **e de qual texto** | Sem a versão do texto, não se sabe o que foi aceito |
| `hash_evento` / `hash_anterior` | A cadeia | Torna a trilha detectavelmente imutável |

> **Regra de ouro** `[ENG]`: **nenhum dado de conteúdo do holerite entra no log.** Valor, rubrica, salário —
> nada. O log registra **que houve** e **sobre qual hash**. Log é onde dado sensível escapa de toda a
> proteção construída (`06` §5.4).

### 8.2 A máquina de estados da entrega

```
                                        ┌──────────────┐
  IMPORTADO ──► IDENTIFICADO ──► CONCILIADO ──► PUBLICADO ──► AVISADO ──► ABERTO ──► CIENTE
      │              │               │              │                                   │
      │              ▼               ▼              ▼                                   ▼
      └──────► QUARENTENA ◄──── DIVERGENTE      REVOGADO ◄─────────── CONTESTADO ────────┘
                    │                                (incidente / reemissão)
                    ▼
              (pendência no Kanban G41 — nunca distribui)
```

Três invariantes verificáveis `[ENG]`:

| # | Invariante |
|---|---|
| INV-1 | Um documento **só chega a PUBLICADO** se o **lote inteiro** estiver CONCILIADO. Publicação é por lote, nunca por página. Ver §14 |
| INV-2 | **AVISADO nunca precede PUBLICADO.** O aviso no WhatsApp só dispara depois de o documento estar acessível e correto — aviso antes cria a corrida em que o empregado abre no meio da correção |
| INV-3 | **CIENTE exige ABERTO** do mesmo `sha256`. Não existe ciência de documento não aberto, nem de outra versão |

### 8.3 Modelo de dados (Postgres / Supabase)

Estende `folha_holerite` de `10` Parte III §6. Vale tudo de `06` §5.1: **RLS habilitada e forçada**,
`tenant_id` vindo do token, default deny, sem `service_role` na aplicação.

```sql
-- ============================================================
-- LOTE E PÁGINAS (quebra do PDF exportado do Domínio)
-- ============================================================

create table holerite_lote (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null,
  competencia        text not null,                 -- 'AAAA-MM'
  tipo               text not null,                 -- mensal|ferias|13_1|13_2|rescisao|complementar
  origem_sistema     text not null default 'dominio',
  arquivo_nome       text not null,
  sha256_origem      text not null,                 -- hash do PDF em lote, como veio
  paginas_total      integer not null,
  tem_camada_texto   boolean not null,              -- false => ID-02 barra o lote
  importado_por      uuid not null,                 -- pessoa, nunca job
  importado_em       timestamptz not null default now(),
  estado             text not null default 'importado',
  conciliado_por     uuid,
  conciliado_em      timestamptz,
  publicado_por      uuid,
  publicado_em       timestamptz,
  constraint lote_unico unique (tenant_id, competencia, tipo, sha256_origem)
);

create table holerite_pagina (
  id                 uuid primary key default gen_random_uuid(),
  lote_id            uuid not null references holerite_lote(id),
  numero_pagina      integer not null,
  sha256_pagina      text not null,                 -- hash do PDF de 1 página extraído
  -- identificadores extraídos do TEXTO da própria página (null quando ausente)
  cpf_extraido       text,
  cpf_valido         boolean,                       -- dígitos verificadores conferidos
  matricula_extraida text,
  pis_extraido       text,
  pis_valido         boolean,
  cnpj_extraido      text,
  competencia_extraida text,
  nome_extraido      text,
  nome_normalizado   text,                          -- unaccent + upper + colapso de espaços
  liquido_extraido   numeric(14,2),
  pagina_de          integer,                       -- "página X de Y", quando o layout traz
  pagina_ate         integer,
  -- resolução
  vinculo_id         uuid,
  score_resolucao    text,                          -- 'forte_2_chaves'|'forte_1_chave'|'ambiguo'|'orfao'
  estado             text not null default 'importada',
  motivo_quarentena  text,
  resolvido_por      uuid,                          -- quem confirmou manualmente, se houve
  resolvido_em       timestamptz,
  constraint pagina_unica unique (lote_id, numero_pagina)
);

-- Uma página nunca pertence a dois vínculos; garantido pela unicidade acima
-- e pela verificação VER-3 (§15).

-- ============================================================
-- DOCUMENTO ENTREGÁVEL (1 por vínculo por competência por tipo)
-- ============================================================

create table holerite_documento (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null,
  vinculo_id         uuid not null,
  lote_id            uuid not null references holerite_lote(id),
  competencia        text not null,
  tipo               text not null,
  versao             integer not null default 1,
  paginas            integer[] not null,            -- páginas do lote que o compõem
  sha256_pdf         text not null,                 -- hash do PDF entregue ao empregado
  sha256_origem_paginas text not null,              -- hash das páginas como saíram do lote
  storage_path       text not null,
  provisorio         boolean not null default false,-- 10 §L-03
  estado             text not null default 'publicado',
  publicado_em       timestamptz not null default now(),
  revogado_em        timestamptz,
  motivo_revogacao   text,
  motivo_reemissao   text,
  constraint doc_unico unique (tenant_id, vinculo_id, competencia, tipo, versao)
);

-- ============================================================
-- ADESÃO AO MEIO ELETRÔNICO  (o "admitido pelas partes" da MP 2.200-2)
-- ============================================================

create table portal_adesao_meio (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null,
  vinculo_id         uuid not null,
  texto_versao       text not null,
  texto_sha256       text not null,
  aceito_em          timestamptz not null default now(),
  ip                 inet,
  user_agent         text,
  metodo_autenticacao text not null,
  revogado_em        timestamptz,                   -- empregado pode voltar ao papel
  motivo_revogacao   text
);

-- ============================================================
-- TRILHA DE ENTREGA E CIÊNCIA  — APPEND-ONLY, ENCADEADA
-- ============================================================

create table entrega_evento (
  id                 bigserial primary key,
  tenant_id          uuid not null,
  documento_id       uuid not null references holerite_documento(id),
  vinculo_id         uuid not null,
  evento_tipo        text not null
    check (evento_tipo in ('gerado','publicado','avisado','aviso_entregue','aviso_lido',
                           'aberto','baixado','ciencia','contestado','revogado',
                           'acesso_negado','reenvio_aviso')),
  ocorrido_em        timestamptz not null default now(),
  sha256_documento   text not null,                 -- SEMPRE, em todo evento
  ator_tipo          text not null check (ator_tipo in ('empregado','usuario_g41','sistema')),
  ator_id            uuid,
  ip                 inet,
  user_agent         text,
  dispositivo_hash   text,
  sessao_id          uuid,
  metodo_autenticacao text,
  nivel_assinatura   text check (nivel_assinatura in ('simples','avancada','qualificada')),
  canal_aviso        text,                          -- whatsapp|email|sms|portal
  destino_mascarado  text,                          -- '+55 11 ****-1234' — NUNCA o número inteiro
  mensagem_id_externo text,
  texto_versao       text,                          -- versão do texto de ciência (só em 'ciencia')
  observacao         text,
  payload            jsonb not null default '{}'::jsonb,
  hash_anterior      text,                          -- encadeamento por tenant
  hash_evento        text not null
);

create index on entrega_evento (tenant_id, documento_id, ocorrido_em);
create index on entrega_evento (tenant_id, vinculo_id, evento_tipo);

-- Append-only de verdade: a aplicação não tem UPDATE/DELETE.
revoke update, delete on entrega_evento from public;

create or replace function entrega_evento_imutavel()
returns trigger language plpgsql as $$
begin
  raise exception 'entrega_evento e append-only (documento_id=%, id=%)',
    coalesce(old.documento_id::text,'?'), coalesce(old.id::text,'?');
end $$;

create trigger trg_entrega_evento_imutavel
  before update or delete on entrega_evento
  for each row execute function entrega_evento_imutavel();

-- Encadeamento: hash_evento = sha256(hash_anterior || campos canônicos)
create or replace function entrega_evento_encadeia()
returns trigger language plpgsql as $$
declare h_ant text;
begin
  select hash_evento into h_ant
    from entrega_evento
   where tenant_id = new.tenant_id
   order by id desc limit 1;

  new.hash_anterior := coalesce(h_ant, repeat('0', 64));
  new.hash_evento := encode(digest(
      new.hash_anterior
      || new.tenant_id::text || new.documento_id::text || new.vinculo_id::text
      || new.evento_tipo || new.ocorrido_em::text || new.sha256_documento
      || coalesce(new.ator_id::text,'') || coalesce(new.ip::text,'')
      || coalesce(new.texto_versao,''), 'sha256'), 'hex');
  return new;
end $$;

create trigger trg_entrega_evento_encadeia
  before insert on entrega_evento
  for each row execute function entrega_evento_encadeia();

-- ============================================================
-- ÂNCORA EXTERNA DA CADEIA (§8.4)
-- ============================================================

create table entrega_ancora (
  id                 bigserial primary key,
  tenant_id          uuid not null,
  ate_evento_id      bigint not null,
  hash_raiz          text not null,
  ancorado_em        timestamptz not null default now(),
  meio               text not null,                 -- 'carimbo_tempo'|'publicacao'|'email_notarial'
  comprovante        jsonb not null
);
```

> **`PENDÊNCIA — não confirmado` (E-07):** `digest()` exige `pgcrypto`. Qual o mecanismo suportado e
> recomendado hoje no Supabase gerenciado para hash e cifragem em coluna é a pendência **P-10 do `06`** —
> ainda aberta. Resolver antes de escolher.

### 8.4 Como se prova que o arquivo entregue é o mesmo que está guardado

Cadeia de custódia em cinco elos `[ENG]`. Cada elo é um hash gravado, e cada um responde a uma alegação
específica:

| Elo | Hash | Derruba a alegação |
|---|---|---|
| 1 | `sha256_origem` do PDF em lote, no ato da importação, com quem importou | "O escritório montou esse documento depois" |
| 2 | `sha256_pagina` de cada página extraída | "Essa página foi trocada na quebra" |
| 3 | `sha256_origem_paginas` do documento montado | "O PDF do empregado não corresponde ao lote" |
| 4 | `sha256_pdf` do arquivo entregue (com carimbo/marca d'água, se houver) | "Eu baixei outra coisa" |
| 5 | `hash_evento` encadeado em cada evento, com o `sha256_documento` dentro | "O log foi editado depois" |

Quatro regras que fazem isso valer `[ENG]`:

1. **O PDF entregue é imutável.** Se o portal aplica marca d'água ou carimbo de acesso, o arquivo carimbado
   é **derivado e gravado**, com os dois hashes (3 e 4) guardados. Nunca se gera o carimbado on-the-fly sem
   registrar — senão nunca se reproduz o que o empregado viu.
2. **Reemissão é versão nova**, com motivo, e a anterior fica visível marcada como substituída
   (`10` D-07). Documento não é sobrescrito.
3. **Verificação periódica de integridade**: job semanal relê os PDFs do storage e confere contra
   `sha256_pdf`. Divergência = **incidente**, não erro de rotina — abre tarefa no Kanban G41 e alerta em
   âmbar.
4. **Âncora externa** (`entrega_ancora`): diária ou semanal, publica-se o `hash_raiz` da cadeia por tenant
   num meio fora do controle da G41 (carimbo de tempo de terceiro é o caminho limpo). Custo baixo, e é o
   que responde a "vocês controlam o próprio log".

### 8.5 O dossiê de uma linha

`[ENG]` O portal precisa de **um botão**, no perfil do empregado, que gere um PDF de duas páginas com:
identificação do documento, hash, data de publicação, canal e horário do aviso, momento da abertura,
momento e texto da declaração de ciência, IP e dispositivo, cadeia de hashes com o ponto de ancoragem, e a
versão do termo de adesão ao meio eletrônico.

Isso não é enfeite: é o artefato que o advogado do cliente vai anexar. Se ele precisa pedir para o
suporte, a prova chega tarde e desorganizada. **Se a G41 não consegue produzir esse dossiê em um clique, a
comprovação de recebimento não está pronta — independentemente de o dado estar no banco.**

---

## 9. Prazo de guarda — e uma divergência que precisa ser dita

### 9.1 Os relógios

Vale a estrutura de `06` §3.1 (relógio A trabalhista, B previdenciário/tributário, C SST). Para holerite e
comprovante de entrega:

| Item | Prazo | Fundamento | Selo |
|---|---|---|---|
| Holerite / recibo de pagamento — **relógio A** | **5 anos**, limitado a **2 anos após a extinção do contrato** | CF art. 7º, XXIX + CLT art. 11 | `[V-INDIRETO]` (herdado de `06` §3.2) |
| Folha de pagamento — **relógio B, leitura pela prescrição** | **5 anos** | Lei 8.212/91 art. 32, §11 + Súmula Vinculante 8/STF + CTN arts. 173/174 | `[V-INDIRETO]` (herdado de `06`) |
| Folha de pagamento — **relógio B, leitura pelo regulamento** | **10 anos** | `[V-SECUNDÁRIO]` **Decreto nº 3.048/1999, art. 225, §5º** — obrigação acessória de manter as folhas de pagamento **por dez anos** à disposição da fiscalização | `[V-SECUNDÁRIO]` |
| **Comprovante de entrega e trilha de ciência** | **Igual ou maior que o do documento que ele prova** | `[ENG]` — não há norma identificada | `PENDÊNCIA` (E-09) |

### 9.2 A divergência 5 × 10 e como resolvê-la sem inventar

`06` §3.2 registra **5 anos** para documentos previdenciários, derivando o prazo de guarda do prazo de
cobrança. As fontes secundárias desta rodada trazem **10 anos** para folha de pagamento, apoiadas no art.
225, §5º do Decreto 3.048/1999 — que é **obrigação acessória autônoma**, não prazo de prescrição.

**As duas coisas podem ser verdadeiras ao mesmo tempo**: o crédito prescreve em 5 anos (SV 8/STF) *e* o
regulamento manda manter a folha por 10. Prescrição do crédito e dever de guarda de documento não são a
mesma norma.

> **`PENDÊNCIA — não confirmado` (E-08, alta prioridade):** confirmar (a) a redação e a vigência do art.
> 225, §5º do Decreto 3.048/1999 e (b) se ele alcança **holerite/recibo individual** ou apenas a **folha de
> pagamento** da empresa. **Esta pendência corrige uma possível lacuna no `06` §3.2 — que trata o relógio B
> como 5 anos sem mencionar o dever decenal do RPS.** Registrar nos dois documentos.

**Decisão de engenharia enquanto a pendência estiver aberta** `[ENG]`, declarada como decisão e não como
norma:

| # | Decisão |
|---|---|
| G-1 | Holerite e comprovante de entrega são guardados pelo **maior prazo defensável** entre os candidatos — hoje, **10 anos contados do pagamento**, e nunca menos que 2 anos após a rescisão + o resíduo do quinquênio |
| G-2 | A escolha é **parâmetro em `retencao_politica`** (`06` §5.5), com `fundamento_url = null` e `aprovado_por` preenchido. **Prazo em código é prazo que ninguém revisa** |
| G-3 | A **trilha** sobrevive ao documento (`06` §5.4). Comprovante que morre antes do documento que ele prova é inútil |
| G-4 | Expurgo **nunca é automático e silencioso**: proposta → tarefa no Kanban → aprovação humana → execução registrada (`06` §5.5) |
| G-5 | Guarda longa **não** é guarda quente: passado o uso corrente, o documento vai para **arquivo frio cifrado**, fora da busca global e da exportação (`06` §3.4) |

> **Assimetria que justifica G-1:** descartar cedo é **irreversível** e faz o empregador perder a prova num
> processo em que **o ônus é dele**. Guardar a mais é violação de minimização — real, mas corrigível, e
> mitigada por G-5. Entre um erro irreversível e um corrigível, guarda-se.

---

# PARTE IV — LGPD NA DISTRIBUIÇÃO

## 10. Papéis e o que eles exigem

Confirmando o desenho de `06` §1.3, aplicado a **este** fluxo:

| Quem | Papel | Nesta operação |
|---|---|---|
| **Empregado** | **Titular** | Os dados são dele; ele tem os direitos do art. 18 |
| **Cliente empregador** | **Controlador** | Decide que existe holerite, o que ele contém, quem recebe, por qual canal |
| **G41** | **Operadora** | Importa, quebra, identifica, publica, avisa e guarda **por instrução do controlador** |
| **G41** (outro chapéu) | **Controladora** | Para os dados de **acesso ao portal** enquanto ferramenta dela (logs de segurança, antifraude) — e isso precisa estar declarado, não presumido |

`[V-INDIRETO]` LGPD art. 39: o operador trata **segundo instruções documentadas**. `[V-INDIRETO]` art. 42:
o operador que não segue instrução lícita **se equipara ao controlador** e responde solidariamente.
**Operador não é escudo** (`06` §1.3).

### 10.1 O que precisa estar em contrato — específico deste módulo

Além do DPA de `06` §1.4, o contrato de portal do empregado precisa de **sete** itens que não estão lá:

| # | Cláusula | Por quê |
|---|---|---|
| C-1 | **Instrução expressa** do cliente para distribuir holerite pelo portal e avisar por WhatsApp, com o modelo de mensagem **anexado e versionado** | Sem isso, o aviso é tratamento fora da instrução |
| C-2 | **Quem fornece e mantém o número de telefone** do empregado, e o dever do cliente de comunicar mudanças | Número errado = entrega para terceiro. Ver §11.2 |
| C-3 | **Termo de adesão ao meio eletrônico** e a garantia do **canal alternativo em papel**, sem atrito | §7.4 A-1 e a trava ID-13 |
| C-4 | **Base de identificação**: o cliente declara qual identificador forte estará no PDF (CPF e/ou matrícula) e garante sua unicidade no cadastro | É o insumo da seção 6. Sem ele, não há distribuição segura |
| C-5 | **Regra de não distribuição**: a G41 **não entrega** documento não identificado inequivocamente, e isso **atrasa a entrega**. O cliente concorda com o atraso | Impede a pressão operacional de "libera assim mesmo" no dia 5 |
| C-6 | **Fluxo de incidente de troca de destinatário**, com prazo interno menor que o legal e conteúdo mínimo pronto | `06` §4.4 |
| C-7 | **Devolução/eliminação ao fim do contrato**, ressalvado o que a lei obriga a reter (§9) | LGPD art. 16 |

### 10.2 Conduta — o que muda no dia a dia

- Analista da G41 **não abre holerite** de empregado sem finalidade registrada. Acesso a documento
  individual gera evento de auditoria (`06` §5.4).
- **Ninguém reenvia holerite por WhatsApp pessoal**, nem "só dessa vez". `06` §5.6 já diz: a maior
  superfície de vazamento de um escritório não é o banco, é o hábito.
- **Nenhum conteúdo de holerite vai para LLM** (`06` §5.8). Se um dia houver assistente que explique o
  documento, ele recebe rubrica, base e resultado — nunca a pessoa.
- Empregado desligado mantém acesso **de leitura** aos seus documentos por janela definida e depois recebe
  um pacote; o acesso não fica aberto indefinidamente nem some no dia da rescisão.

---

## 11. O canal: WhatsApp

### 11.1 O que NÃO pode ir na mensagem

| Proibido | Por quê |
|---|---|
| **O PDF anexado** | `10` D-01: mensageria carrega **link**, não arquivo. Anexo se replica, vai para backup do aparelho, para a nuvem pessoal, para o print |
| **Qualquer valor** — líquido, bruto, desconto | É o dado de maior dano reputacional (`06` §1.1) e o que mais vira print de grupo |
| Rubrica que revele dado sensível (sindicato, afastamento, pensão) | Dado sensível em canal não controlado |
| CPF, PIS, matrícula, dados bancários | Identificador direto num canal onde o destinatário pode estar errado |
| **Nome completo** | Vazamento de vínculo empregatício para quem tiver o aparelho, mais reforço a phishing |
| Link **direto para o PDF** (URL assinada que abre o arquivo) | Quem tem o link tem o documento. O link vai para o **portal autenticado**, sempre |
| Qualquer texto que permita deduzir variação salarial ("seu holerite deste mês teve alteração") | Prévia na tela bloqueada revela informação sem autenticação nenhuma |

### 11.2 Por que número de telefone é identificação fraca

Não é ceticismo genérico — são seis mecanismos concretos, e todos acontecem:

| # | Mecanismo | Efeito |
|---|---|---|
| 1 | **Número é reciclado.** Linha cancelada volta ao mercado e é reatribuída | O aviso chega a um estranho — sem erro nenhum do sistema |
| 2 | **Portabilidade e troca de chip** sem aviso ao RH | Cadastro desatualiza sozinho |
| 3 | **Digitação no cadastro** — um dígito trocado gera número válido de outra pessoa | Não há dígito verificador em telefone. **Diferente de CPF e PIS, telefone não tem como ser validado** |
| 4 | **Aparelho compartilhado** — família, cônjuge, casa | A notificação aparece para quem estiver com o celular |
| 5 | **SIM swap / sequestro de conta de WhatsApp** | O canal é alvo conhecido de fraude |
| 6 | **Número corporativo** de aparelho que roda entre turnos | O "titular" muda sem que ninguém atualize nada |

> **Consequência de arquitetura** `[ENG]`: **o telefone é canal de aviso, nunca fator de identificação.**
> Ele não autentica, não autoriza, não recupera senha sozinho e **jamais** é a chave de vinculação de um
> documento a uma pessoa. Quem identifica é o CPF verificado no onboarding; quem autentica é a sessão do
> portal.

### 11.3 Como desenhar o aviso — a prévia na tela bloqueada

O modelo mental correto: **a mensagem será lida por alguém que não é o empregado.** Talvez o cônjuge, o
colega no ônibus, o assaltante com o aparelho, o desconhecido que herdou o número. O texto tem que ser
inofensivo nessa hipótese.

**Modelo aprovado** `[ENG]` — versionado, anexo ao contrato (C-1):

```
G41 · [Nome do Empregador]
Há um novo documento disponível para você no portal.
Acesse: portal.g41.com.br
```

Regras de redação, e o que cada uma evita:

| # | Regra | Evita |
|---|---|---|
| AV-01 | **Sem valor, sem rubrica, sem competência** na mensagem | Revelar quanto e do quê |
| AV-02 | **Sem a palavra "holerite"/"salário"/"pagamento"** no corpo — "documento" basta | Revelar a natureza do documento na prévia |
| AV-03 | **Primeiras 60 caracteres são o pior caso**: a tela bloqueada mostra o começo. Escreva o começo pensando nisso | Vazamento na notificação |
| AV-04 | **Nome do empregado não entra** na mensagem | Revelar o vínculo empregatício |
| AV-05 | **Link do portal, nunca do arquivo.** URL fixa e conhecida, sem token no texto | Link vazado = documento vazado; e treina o empregado contra phishing |
| AV-06 | **Sem encurtador.** Domínio próprio, o mesmo sempre | Encurtador é indistinguível de golpe |
| AV-07 | **Não pedir dado na conversa.** O canal avisa; nunca coleta | Phishing por imitação do canal oficial |
| AV-08 | **Aviso é por vínculo, individual.** Nunca lista de transmissão, nunca grupo | `10` D-03 |
| AV-09 | **Número confirmado** (opt-in registrado) antes do primeiro aviso; número novo exige reconfirmação | Entrega a terceiro |
| AV-10 | **Falha ou não entrega vira pendência**, não silêncio. Três avisos sem abertura em N dias abrem tarefa no Kanban | Empregado que nunca recebe e ninguém percebe |
| AV-11 | **E-mail segue as mesmas regras** — inclusive o assunto, que é a prévia do e-mail | O assunto é a tela bloqueada do e-mail |

> **Âmbar:** o aviso **não é prova de ciência**. O provedor confirma *entregue* e às vezes *lido* — de uma
> **mensagem**, não do documento. Confundir "lida no WhatsApp" com "ciência do holerite" é o tipo de erro
> que só aparece quando alguém contesta.

---

# PARTE V — O RISCO CENTRAL: TROCA DE DESTINATÁRIO

## 12. Por que este é o pior risco do módulo

O Domínio exporta **um PDF em lote**; o Lior precisa quebrá-lo por empregado. Se uma página for associada à
pessoa errada, o sistema entrega o salário de A para B.

Sete características fazem disso o pior risco do módulo — e a combinação é rara:

| # | Característica | Consequência |
|---|---|---|
| 1 | **Silencioso** | Nenhuma exceção é lançada. O sistema faz exatamente o que foi mandado |
| 2 | **Irreversível** | Depois de aberto, não há como "desentregar". Revogar o link não apaga o que foi visto ou printado |
| 3 | **Bilateral** | Um erro produz **duas** vítimas: A teve o salário exposto e B recebeu documento errado (e talvez não perceba) |
| 4 | **Escala** | Um erro de offset no algoritmo não erra uma página — desloca **o lote inteiro**. Cem empregados, cem vazamentos |
| 5 | **É incidente de segurança da LGPD** | Salário é o dado de maior dano do conjunto (`06` §4.3). Envolve dado financeiro; pode envolver sensível (sindicato, pensão, afastamento). Aciona os gatilhos de "risco relevante" da Res. CD/ANPD 15/2024 e o prazo de **3 dias úteis** |
| 6 | **A falha é da G41, o dano é do cliente** | O cliente é controlador e responde perante os empregados; cobra a G41 em regresso (`06` §1.3) |
| 7 | **Destrói exatamente o que o produto vende** | O portal existe para ser mais confiável que o do Domínio. Um único caso encerra a conversa |

> **Postura de projeto** `[ENG]`: **não entregar é um erro barato; entregar errado é um erro caro.**
> Todo o desenho abaixo assume essa assimetria. Um lote atrasado gera reclamação; um lote trocado gera
> incidente, comunicação à ANPD e fim de contrato.

---

## 13. As três formas de casar página com pessoa — e por que duas são inaceitáveis

### 13.1 Por ordem de página — **inaceitável**

Casar a i-ésima página com o i-ésimo empregado de uma lista pressupõe **quatro** coisas que o Domínio não
garante, nem promete, nem versiona:

| Pressuposto | Como ele quebra na prática |
|---|---|
| Todo empregado ocupa exatamente **uma** página | Quem tem muitas rubricas (férias no mês, rescisão, 13º, muitos descontos) **transborda para a segunda página**. A partir dali, todo o resto do lote desloca |
| **Todos** os empregados ativos aparecem no lote | Afastado sem remuneração, admitido depois do corte, desligado no mês, licença — **não aparecem**. A lista do sistema e a ordem do PDF divergem |
| A **ordem** do relatório é a mesma da lista | A ordem depende de opção de impressão: matrícula, nome, centro de custo, estabelecimento. **Muda quando alguém marca outra caixa** |
| O lote contém **só** páginas de empregado | Relatórios trazem **capa, resumo por centro de custo, totalizador final, páginas em branco**, e reiniciam a paginação por estabelecimento |

E o pior atributo: **falha silenciosamente e em cascata**. Um único transbordo desloca todos os
subsequentes. O sistema não tem como perceber, porque não conferiu nada — só contou.

> **Regra:** ordem de página **nunca** é chave, **nem como desempate**, **nem como fallback quando a chave
> forte falta**. Ela pode ser, no máximo, **sinal de conferência** (§14, ID-08): se a resolução por chave
> forte produzir uma ordem muito diferente da ordem do arquivo, isso é motivo para **olhar**, nunca para
> **decidir**.

### 13.2 Por nome — **frágil, e não serve como chave**

| Falha | Exemplo real | Efeito |
|---|---|---|
| **Homônimos** | Dois "José Carlos da Silva" na mesma empresa — comum em empresa de 200 pessoas | Ambiguidade insolúvel por nome. É a falha que **entrega o documento errado** |
| **Homônimo parcial + truncamento** | "MARIA APARECIDA DOS SANTOS S..." cortada na largura da coluna | Duas pessoas colapsam na mesma string |
| **Acentuação e cedilha** | "ANDRÉ GONÇALVES" × "ANDRE GONCALVES"; extração de PDF que perde diacríticos | Sem normalização, não casa; com normalização agressiva, casa demais |
| **Nome social** | Cadastro com nome social, PDF com nome de registro (ou o inverso) | Não casa — e o erro **expõe justamente quem já está mais exposto**. Nunca resolver isso "no olho" |
| **Abreviação** | "M. A. DOS SANTOS", "JOSE C. DA SILVA" | Casamento fuzzy vira loteria |
| **Mudança de nome** | Casamento, divórcio, retificação de registro | Cadastro e PDF divergem por meses |
| **Ordem invertida** | "SILVA, JOSE CARLOS DA" | Comparação direta falha |
| **Preposições e espaços** | "DA"/"DE"/"DOS", espaço duplo, tabulação virando espaço | Ruído puro |
| **Caixa e encoding** | Tudo em caixa alta; caracteres mal decodificados na extração | Ruído |
| **Similaridade fuzzy** | "ANA PAULA SOUZA" × "ANA PAULA SOUSA" — pessoas diferentes com similaridade altíssima | **Fuzzy alto não significa mesma pessoa.** Limiar que aceita isso troca destinatário |

> **Regra:** nome **nunca** é chave. Nome é **corroborante** — serve para *confirmar* uma resolução já feita
> por chave forte e, sobretudo, para **derrubá-la** (ID-06). Divergência de nome contra chave forte é
> motivo de quarentena, mesmo com o CPF batendo, porque pode indicar página remontada ou extração
> desalinhada.

### 13.3 Por identificador forte extraído do texto da própria página — **o único caminho**

**Três propriedades** fazem um identificador ser "forte" para este fim:

1. **Unicidade** no universo do tenant (um CPF = um vínculo ativo naquele empregador e competência).
2. **Autoverificação** — tem dígito verificador, então erro de leitura é **detectável**, não silencioso. CPF
   e PIS/NIS têm; matrícula e telefone **não têm**.
3. **Presença no texto da própria página** — extraído de onde o documento realmente está, não de metadado,
   não de nome de arquivo, não de posição no lote.

| Identificador | Unicidade | Autoverificação | Presença típica no holerite | Papel |
|---|---|---|---|---|
| **CPF** | Alta | **Sim** (dígitos verificadores) | Muito comum | **Chave primária** |
| **Matrícula** + CNPJ do estabelecimento | Alta **dentro do tenant** | Não | Quase sempre | **Chave secundária** — a que confirma |
| **PIS/NIS** | Alta | **Sim** | Frequente | Chave alternativa |
| **CNPJ do empregador** | — | Sim | Cabeçalho | **Guarda de lote** (ID-04) |
| **Competência** | — | Não | Cabeçalho | **Guarda de lote** (ID-05) |
| **Valor líquido** | — | Não | Sempre | **Corroborante independente** (ID-07) — o mais valioso |
| **Nome** | Baixa | Não | Sempre | Corroborante / veto (ID-06) |
| **Ordem da página** | Nenhuma | Não | — | **Nada.** No máximo, sinal de conferência |

> **O corroborante que mais protege é o líquido.** Ele é **independente** da identificação: mesmo que o CPF
> seja lido errado de um jeito que ainda passe no dígito verificador (improvável, mas possível numa
> remontagem de texto), o valor líquido daquela página tem que bater com o líquido daquele empregado
> naquela competência, vindo de outra fonte — a exportação de conferência do Domínio, ou o arquivo CNAB de
> pagamento. **Duas leituras independentes concordando é o que transforma "provavelmente certo" em
> "verificado".**

---

## 14. As travas — regras numeradas e verificáveis

Namespace `ID-` (identificação do destinatário). Cada trava é escrita como **condição verificável**, para
virar teste automatizado. `[ENG]` em todas.

### 14.1 Travas de admissão do lote

| # | Trava | Condição | Falha ⇒ |
|---|---|---|---|
| **ID-01** | Lote precisa de **origem declarada e hash** | `sha256_origem` gravado e `importado_por` é pessoa física identificada | Recusa a importação |
| **ID-02** | **Sem camada de texto, não processa** | `tem_camada_texto = true` para **100%** das páginas | **Lote inteiro barrado.** OCR **não** habilita distribuição automática (ID-03) |
| **ID-03** | **OCR nunca resolve sozinho** | Se houver OCR, `score_resolucao` é rebaixado e toda página exige confirmação humana nominal | Quarentena de todas as páginas |
| **ID-04** | **CNPJ do lote confere com o tenant** | Todo `cnpj_extraido` ∈ CNPJs do tenant (matriz/filiais) | Lote barrado — é o teste que pega **lote do cliente errado**, o pior erro possível |
| **ID-05** | **Competência confere** | Toda `competencia_extraida` = competência declarada na importação | Lote barrado — pega **reimportação de mês antigo** sobre o mês atual |
| **ID-06** | **Lote duplicado é idempotente** | `unique (tenant_id, competencia, tipo, sha256_origem)` | Reimportação não gera segunda entrega |

### 14.2 Travas de resolução por página

| # | Trava | Condição | Falha ⇒ |
|---|---|---|---|
| **ID-07** | **Chave forte obrigatória** | A página tem CPF válido (dígitos conferidos) **ou** PIS válido **ou** matrícula presente | Página → `orfa`, quarentena |
| **ID-08** | **Resolução para exatamente um vínculo ativo** | `count(vínculos que casam) = 1`, considerando tenant + competência + vínculo ativo ou desligado na competência | `0` → `orfa`; `>1` → `ambigua`. **Ambos em quarentena** |
| **ID-09** | **Duas chaves independentes concordando** | (CPF **ou** PIS) **e** (matrícula **ou** líquido conferido) apontam para o **mesmo** vínculo | Só uma chave → `forte_1_chave` → **confirmação humana obrigatória** |
| **ID-10** | **Nome tem poder de veto, não de decisão** | Similaridade normalizada (unaccent + upper + colapso de espaços + ordenação de tokens) ≥ limiar **ou** justificativa registrada (nome social, mudança de nome) | Divergência sem justificativa → quarentena, **mesmo com CPF batendo** |
| **ID-11** | **Líquido corroborado quando houver segunda fonte** | `liquido_extraido` = líquido do mesmo vínculo/competência na fonte de conferência, com tolerância **zero** | Divergência → quarentena. Centavo diferente é sinal, não ruído |
| **ID-12** | **Nenhuma página é atribuída por adjacência** | Página de continuação só é anexada se **carregar a mesma chave forte**; se o layout traz "página X de Y", os dois valores conferem | Continuação sem chave → quarentena da página **e** do documento a que ela se anexaria |
| **ID-13** | **Uma página, um vínculo** | Nenhuma página aparece em mais de um `holerite_documento` | Erro de conciliação — lote barrado |
| **ID-14** | **Um documento por vínculo/competência/tipo** | `unique (tenant_id, vinculo_id, competencia, tipo, versao)` | Segunda página não relacionada não se agrega silenciosamente ao mesmo documento |

### 14.3 Travas de fechamento do lote

| # | Trava | Condição | Falha ⇒ |
|---|---|---|---|
| **ID-15** | **Cobertura**: todo empregado esperado tem documento | Para cada vínculo com remuneração na competência, existe exatamente 1 documento | Faltante → pendência. **Ausência de entrega é falha, ainda que segura** |
| **ID-16** | **Sem órfã**: nenhuma página sobra | `count(páginas em quarentena) = 0` | Lote **não publica** |
| **ID-17** | **Publicação é atômica por lote** | Enquanto houver 1 página em quarentena, **0 documentos** ficam visíveis | Não há publicação parcial |
| **ID-18** | **Página não-empregado é classificada, não descartada** | Capa, resumo, totalizador e página em branco recebem `tipo = 'nao_empregado'` por **regra explícita**, com o texto que a identificou | Descarte silencioso é proibido: é assim que uma página de gente vira "resumo" |
| **ID-19** | **Sinal de conferência por ordem** | Se a ordem resolvida divergir muito da ordem do arquivo, gera **alerta âmbar** para revisão — **nunca** altera a atribuição | Alerta, não decisão |
| **ID-20** | **Primeiro lote de cada tenant exige aprovação humana nominal** | `conciliado_por is not null` no primeiro lote; nos seguintes, auto-publicação só com 100% em `forte_2_chaves` | Aprovação manual |

### 14.4 Travas de última milha e pós-entrega

| # | Trava | Condição | Falha ⇒ |
|---|---|---|---|
| **ID-21** | **Reverificação no download** | No momento de servir o arquivo, o sistema **relê a chave forte** gravada no documento e compara com o vínculo da sessão autenticada | Divergência → **nega o acesso**, registra `acesso_negado`, abre incidente. É a rede de segurança que pega falha de conciliação já publicada |
| **ID-22** | **Onboarding vincula CPF verificado** | A conta do portal só se liga a um vínculo depois de conferir o CPF por dado que o empregado sabe e o RH confirma; **nunca** só pelo telefone que o RH digitou | Sem isso, ID-21 compara com um vínculo que pode estar errado desde a origem |
| **ID-23** | **Botão "este documento não é meu"** | Presente em toda tela de documento; aciona revogação **do lote inteiro** e incidente | O empregado é o último detector — e o único que enxerga o erro de fora |
| **ID-24** | **Revogação em cascata** | Revogar um documento revoga o **lote**, retira todos do ar e preserva a trilha | Revogar só o documento errado deixa o par trocado no ar |
| **ID-25** | **Canal alternativo em papel** | Existe e é acionável sem justificativa | Quem não usa portal (ver art. 464, analfabeto) não pode ficar sem documento |
| **ID-26** | **Toda quarentena abre tarefa no Kanban G41** | POST em `tarefas.g41.com.br/api/public/tasks`, `X-API-Key` + `X-Idempotency-Key` = `tenant + competência + tipo + página` | `CLAUDE.md` regra 3. Pendência que só aparece na tela não existe |

### 14.5 A regra que resume todas

> **Sem identificação inequívoca, não distribui — abre pendência.**
>
> "Inequívoca" = **duas chaves independentes** apontando para **exatamente um** vínculo ativo, **sem veto do
> nome** e, quando houver segunda fonte, **com o líquido conferindo**. Qualquer coisa abaixo disso é
> quarentena, e quarentena de uma página **segura o lote inteiro**.
>
> **Não existe fallback.** Não há "se não achar, usa a ordem". Não há "se o nome for parecido, entrega". Não
> há "libera porque é dia 5 e o cliente está cobrando". É a regra 1 do `CLAUDE.md` aplicada a destinatário:
> **valor padrão silencioso é proibido, e destinatário presumido é o pior deles.**

---

## 15. Como testar

### 15.1 Massa de teste sintética — casos obrigatórios

Cada caso é um PDF de lote gerado propositalmente. `TE-` = teste de entrega.

| # | Caso | Resultado esperado |
|---|---|---|
| TE-01 | Lote limpo, 1 página por empregado, todos com CPF e matrícula | Publica; 100% `forte_2_chaves` |
| TE-02 | Um empregado com **holerite de 2 páginas** (transbordo) | Documento com 2 páginas; **nenhum deslocamento** dos demais |
| TE-03 | Lote **fora da ordem** do cadastro | Publica igual; ID-19 gera alerta, não muda atribuição |
| TE-04 | **Dois homônimos exatos**, ambos com CPF distinto | Publica correto — porque a chave é CPF |
| TE-05 | Dois homônimos, um **sem CPF** na página | A página sem CPF vai para quarentena; **lote não publica** (ID-16/17) |
| TE-06 | **Página órfã** (empregado que não existe no cadastro) | Quarentena, pendência, lote barrado |
| TE-07 | **Empregado sem página** (afastado sem remuneração) | ID-15 aponta; classificado como esperado-ausente com motivo, ou pendência |
| TE-08 | Página com **CPF de dígito trocado** | `cpf_valido = false` → quarentena. **Este teste prova o valor do dígito verificador** |
| TE-09 | Página com CPF válido **de outra empresa** | ID-04/ID-08 barram |
| TE-10 | Lote de **competência anterior** importado como atual | ID-05 barra |
| TE-11 | Lote **do cliente errado** | ID-04 barra — o teste mais importante da suíte |
| TE-12 | Lote **sem camada de texto** (digitalizado) | ID-02 barra; OCR não libera (ID-03) |
| TE-13 | Nome com **acentuação divergente** e CPF batendo | Publica: normalização resolve, ID-10 não veta |
| TE-14 | **Nome social** no cadastro, nome de registro no PDF | Quarentena com motivo específico; resolução humana registrada e **memorizada** para os próximos lotes |
| TE-15 | Nome **completamente diferente** com CPF batendo | Quarentena (ID-10 veta). Detecta remontagem/desalinhamento de texto |
| TE-16 | **Líquido divergente** em um centavo | Quarentena (ID-11) |
| TE-17 | Lote com **capa, resumo por centro de custo e totalizador** | Classificados por regra explícita (ID-18); não entram em documento |
| TE-18 | Lote com **página em branco** no meio | Classificada; não desloca nada |
| TE-19 | **Reimportação do mesmo arquivo** | Idempotente (ID-06); nenhuma segunda entrega, nenhum segundo aviso |
| TE-20 | Reimportação **corrigida** (arquivo diferente, mesma competência) | Novo lote, versão 2, motivo obrigatório, aviso de retificação |
| TE-21 | **Sessão do empregado A** tentando baixar documento de B por URL manipulada | ID-21 nega, registra `acesso_negado`, abre incidente |
| TE-22 | Empregado clica **"este documento não é meu"** | Lote inteiro sai do ar (ID-23/24); incidente aberto; trilha preservada |
| TE-23 | **Paginação reiniciada por estabelecimento** | Sem efeito — número de página não é chave |
| TE-24 | Empregado com **dois vínculos** no mesmo empregador | Dois documentos distintos, cada um no seu vínculo; nenhum agregado (ID-14) |
| TE-25 | Rescisão no meio do mês (holerite + TRCT no mesmo lote) | Tipos separados; TRCT não vira holerite |

### 15.2 Testes de invariante (property tests)

Rodam sobre **qualquer** lote, incluindo os de produção em ambiente restrito:

| # | Invariante | Consulta |
|---|---|---|
| VER-1 | Toda página publicada tem chave forte que pertence ao vínculo | `∀ p publicada: chave_forte(p) ∈ chaves(vinculo(p))` |
| VER-2 | Nenhuma página em dois documentos | `select ... group by pagina having count(distinct documento_id) > 1` = vazio |
| VER-3 | Nenhum documento com páginas de chaves diferentes | agrupar por `documento_id`, `count(distinct cpf_extraido) = 1` |
| VER-4 | Nenhum documento publicado com página em quarentena no lote | join `lote → páginas` = vazio |
| VER-5 | Soma dos líquidos dos documentos = total do lote | Bate contra o totalizador impresso no próprio PDF |
| VER-6 | Contagem: documentos publicados = páginas de empregado classificadas | Fecha a aritmética do lote |
| VER-7 | Cadeia de hash íntegra | Recalcular `hash_evento` do primeiro ao último; qualquer quebra é incidente |

> **VER-5 é o teste que eu colocaria em primeiro lugar se só desse para ter um.** Ele fecha a aritmética
> contra um número que **o próprio Domínio imprimiu**, sem depender de nenhuma decisão do Lior. Se o total
> bate e as contagens batem, um erro de atribuição precisaria ser uma **troca simétrica** entre duas pessoas
> com o **mesmo líquido** — que é exatamente o que ID-07/ID-09 (chave forte) já barram.

### 15.3 Testes de processo, não de código

| # | Teste | Frequência |
|---|---|---|
| TE-P1 | **Prova cega**: um humano do DP recebe 10 páginas aleatórias sem ver a atribuição do sistema e diz de quem é cada uma. Compara-se depois | Primeiro lote de cada cliente, depois trimestral |
| TE-P2 | **Ensaio de incidente**: simular troca de destinatário e cronometrar o dossiê para a ANPD — tenants, titulares, categorias, nº de menores (`06` §4.2) | Semestral |
| TE-P3 | **Teste de pressão**: subir um lote com uma quarentena no dia 5 e verificar que ninguém tem botão para "liberar assim mesmo" | A cada release |

---

# PARTE VI — O QUE O EMPREGADO PERGUNTA

## 16. O que o portal responde hoje, com PDF do holerite + ponto

Premissa desta seção: o Lior tem **o PDF do holerite** (não o cálculo) e **o ponto** (em produção). A folha
continua no Domínio.

| Pergunta | Responde hoje? | Com o quê | Ressalva |
|---|---|---|---|
| **"Cadê meu holerite?"** | **Sim** | Distribuição + histórico por competência | É o núcleo do produto |
| **"Cadê o de março do ano passado?"** | **Sim**, se estiver no acervo | Histórico | Depende de importar o passado — e cada lote antigo passa pelas mesmas travas da §14 |
| **"Cadê meu informe de rendimentos?"** | **Sim** | É outro **tipo de documento** no mesmo pipeline (`tipo = 'informe_rendimentos'`), com as **mesmas travas** de identificação | O portal **distribui**; não emite. A obrigação e o prazo do comprovante são do empregador e continuam `PENDÊNCIA` (`04 P-01`) |
| **"Cadê meu espelho de ponto?"** | **Sim** | O Lior já tem ponto | Ganho imediato: unifica dois portais num só |
| **"Quantas horas extras eu fiz?"** | **Sim**, do ponto | Ponto | Horas **apuradas**, que podem não ser as **pagas** — dizer isso na tela |
| **"Quanto tenho de banco de horas?"** | **Parcial** | Ponto | Saldo depende de regra de CCT (`06` DV-05, `10` T-08). Sem CCT confirmada, sai **PROVISÓRIO** ou não sai |
| **"Quando cai meu pagamento?"** | **Sim** | Cadastro do cliente | Data prevista, não confirmação de crédito |
| **"Por que o líquido caiu?"** | **Parcial — e a ressalva é grande** | Comparativo entre PDFs | Ver §16.1 |
| **"Quanto ganhei no ano?"** | **Parcial** | Soma dos documentos entregues | Só cobre o que passou pelo portal. Se o ano começou no Domínio sem importação, **falta pedaço** — e o portal tem que dizer isso (`10` R-04/R-05), não fingir autoria |
| **"Quantos dias de férias eu tenho?"** | **Não** | — | Ver §16.2 |
| **"Quanto tenho de FGTS?"** | **Não** | — | Dado do FGTS Digital / Caixa, não do holerite |
| **"Minha rescisão está certa?"** | **Não** | — | Depende do motor |
| **"Meu INSS está certo?"** | **Não** | — | Depende do motor e dos parâmetros verificados (`03`) |

### 16.1 "Por que o líquido caiu?" — o que dá e o que não dá

`10` Parte III §3.1 desenha esse bloco **assumindo o motor de cálculo**: a explicação sai da `memoria` do
`folha_calculo`. **Sem motor, não existe memória** — existe um PDF.

O que dá para fazer só com PDF `[ENG]`:

| Nível | Entrega | Confiança |
|---|---|---|
| **N1 — Diferença do líquido** | "Seu líquido foi R$ X, contra R$ Y em [mês]. Diferença: −R$ Z." | Alta: dois números lidos do documento |
| **N2 — Diferença por rubrica** | Tabela lado a lado das rubricas de duas competências, ordenada pela maior variação | **Média** — depende de extrair rubricas do PDF de forma estável. Layout que muda quebra a leitura |
| **N3 — A causa** | "O IRRF subiu porque você mudou de faixa" | **Não dá.** Exige base de cálculo, parâmetro versionado e memória — tudo do motor |

Duas regras inegociáveis para esse bloco `[ENG]`:

1. **Rotular a origem.** O bloco diz **"leitura do seu holerite"**, não "memória de cálculo". Prometer
   explicação e entregar comparação é criar chamado, não evitar.
2. **Nenhum texto gerado por LLM sobre o conteúdo do documento** (`06` §5.8, `10` §3.1). Template preenchido
   com valores locais. Um "assistente que explica o holerite" lendo o PDF é exatamente o vazamento que `06`
   proíbe.

> **Avaliação honesta:** o N1 e o N2 respondem talvez **metade** dos chamados de "por que caiu" — os casos
> em que a causa é óbvia depois de ver a diferença (menos hora extra, uma falta, um desconto novo). A outra
> metade — faixa de IRRF, teto de INSS, média de variáveis, competência partida por férias — **só fecha com
> o motor**. Prometer a resposta inteira antes disso é vender o que ainda não existe.

### 16.2 "Quantos dias de férias eu tenho?" — por que não

Responder isso exige **quatro** dados que nem o PDF nem o ponto têm:

| Dado | Onde vive hoje | Por que o PDF não resolve |
|---|---|---|
| Período aquisitivo em curso | Domínio | Deriva da admissão e dos afastamentos; o holerite não imprime |
| Férias já gozadas e vendidas | Domínio | O holerite mostra o mês em que houve pagamento, não o saldo |
| Faltas que reduzem o direito (escala do art. 130 da CLT) | Ponto + Domínio | O ponto tem as faltas; **a regra de redução é do motor** |
| Afastamentos que suspendem/interrompem o período | Domínio / eSocial | Não aparece no holerite |

> `[ENG]` **O que dá para fazer no lugar, e é honesto:** se o Domínio exportar um **relatório de férias**,
> ele entra no portal como **documento** (com data de emissão e as mesmas travas de identificação), não como
> número vivo. A tela diz: *"posição de férias em DD/MM/AAAA, conforme relatório do sistema de folha"*.
> **Número vivo de férias só depois que a folha for própria** — e depende de B-03 correto na migração
> (`10`).

### 16.3 A pergunta que o portal cria (e precisa responder)

Um portal novo gera uma pergunta que não existia: **"por que agora é aqui?"** Sem uma tela de primeira vez
explicando o que mudou, onde estão os documentos antigos e como pedir papel, o portal **aumenta** o volume
de chamado nos dois primeiros meses em vez de reduzir. Isso é custo de implantação, não defeito — mas
precisa estar no plano, e não é o suporte da G41 que deve absorvê-lo sem aviso.

---

## 17. PENDÊNCIAS

Namespace `E-` (entrega). Nenhum item vira código, contrato ou texto de cliente antes de resolvido.

| ID | Pendência | Por que bloqueia | Onde fecha |
|---|---|---|---|
| **E-01** | **CLT art. 464 e parágrafo único** — redação literal | Toda a Parte I depende. É `[V-SECUNDÁRIO]` | `FONTES-A-BAIXAR` **D4/G4** (já BLOQUEADOR em `10`) |
| **E-02** | **Norma vigente que obriga a discriminação das parcelas** — se a Portaria MTB 3.626/1991 foi revogada pela Portaria MTP 671/2021, qual dispositivo a substituiu | Catálogo de campos do holerite e a conferência de forma do PDF do Domínio (§3) | Portaria MTP 671/2021 na íntegra (**C3**) + **D4** |
| **E-03** | Norma, orientação de fiscalização ou precedente **específico sobre entrega eletrônica** do demonstrativo | Hoje o fundamento é ausência de vedação — argumento fraco | Portaria 671/2021 + **Consolidação dos Precedentes Administrativos** do MTE |
| **E-04** | **Processo, órgão e data** da decisão do TST sobre recibo sem assinatura | Citação em material de cliente | `tst.jus.br` (bloqueado nesta rodada) |
| **E-05** | **MP 2.200-2/2001, art. 10, §§1º e 2º** — redação literal; e os **números dos julgados do STJ** de 2025/2026 | Fundamento central do §7.1 | `planalto.gov.br` e `stj.jus.br` |
| **E-06** | **Precedente trabalhista** sobre aceite em portal como equivalente/suficiente para o art. 464 | Define o que a G41 pode prometer ao cliente | Jurisprudência TST/TRTs |
| **E-07** | Mecanismo de hash/cifragem em coluna no Supabase gerenciado (`pgcrypto` × Vault) | Modelo de dados §8.3 | É a **P-10 do `06`**, ainda aberta |
| **E-08** | **Decreto 3.048/1999, art. 225, §5º** — redação, vigência e se alcança o holerite individual ou só a folha da empresa. **Divergência 5 × 10 anos com o `06` §3.2** | Política de retenção; expurgo | `planalto.gov.br`. **Registrar a correção nos dois documentos** |
| **E-09** | Prazo de guarda do **comprovante de entrega e da trilha** — norma não identificada | Retenção da trilha | É a **P-18 do `06`**. Definir por política interna e registrar como decisão |
| **E-10** | **Lei 14.063/2020, arts. 2º, 4º e 5º** e **Decreto 10.543/2020** — redação literal | O argumento de proporcionalidade do §7.2 usa analogia; analogia com texto errado é pior | `planalto.gov.br` |
| **E-11** | **Portaria MTP 671/2021, arts. 87 e 88** — leitura literal, para confirmar que o regime ICP-Brasil é do REP e **não** alcança o holerite | Evita superdimensionar o nível de assinatura | **C3** |
| **E-12** | Existe **exigência de forma** para o empregado manifestar o consentimento do art. 464, p.ú. (conta aberta para esse fim)? | Toca o desenho do onboarding e do termo de adesão | **D4** |
| **E-13** | Regras específicas de **doméstico** e **aprendiz** na entrega do recibo | Escopo do portal | `10` H-06 / `04 P-21` |
| **E-14** | Layout real do **PDF em lote exportado do Domínio**: quais identificadores efetivamente aparecem no texto de cada página (CPF? matrícula? PIS?), se há camada de texto e como é o cabeçalho | **BLOQUEADOR de toda a Parte V.** Sem isso, as travas ID-07 a ID-11 não têm insumo | Amostra real do cliente. **É o primeiro item a resolver, e não depende de norma nenhuma** |
| **E-15** | O Domínio exporta **PDF por empregado** em vez de lote? Ou nome de arquivo com CPF/matrícula? | Se exportar por empregado, o risco da Parte V **cai drasticamente** — e é a primeira coisa a perguntar | Documentação/suporte do Domínio (`11`) |

> **E-14 e E-15 antes de tudo.** São as duas únicas pendências deste documento que **não** dependem de
> acesso a norma e que mudam o desenho: se o Domínio já exporta um arquivo por empregado com identificador
> no nome, metade da Parte V vira conferência em vez de reconstrução. **Perguntar antes de construir.**

---

## 18. Fontes

Todas **localizadas pelo índice de busca em 30/08/2026**, nenhuma aberta na origem (ver §0.1). As URLs de
domínio oficial ficam registradas para a rodada de promoção de selo.

### Normas a abrir (nenhuma lida nesta rodada)

| Norma | URL |
|---|---|
| CLT (Decreto-Lei nº 5.452/1943) — **art. 464 e parágrafo único**, art. 11 | https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm |
| Lei nº 9.528/1997 (acrescentou o p.ú. do art. 464) | https://www.planalto.gov.br/ccivil_03/leis/l9528.htm |
| **MP nº 2.200-2, de 24/08/2001** — ICP-Brasil, art. 10, §§1º e 2º | https://www.planalto.gov.br/ccivil_03/mpv/antigas_2001/2200-2.htm |
| **Lei nº 14.063, de 23/09/2020** — assinaturas eletrônicas em interações com entes públicos | https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/lei/l14063.htm |
| **Decreto nº 10.543, de 13/11/2020** — níveis mínimos de assinatura por risco | https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/decreto/d10543.htm |
| **Portaria MTP nº 671, de 08/11/2021** — compilada (arts. 87 e 88; revogações) | https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3/portaria-no-671-de-8-de-novembro-de-2021-compilada-20-10-2023.pdf |
| **Decreto nº 3.048/1999** (RPS) — **art. 225, §5º** | https://www.planalto.gov.br/ccivil_03/decreto/d3048.htm |
| Lei nº 13.709/2018 (LGPD) — arts. 16, 18, 39, 42, 46, 48 | https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm |
| Resolução CD/ANPD nº 15, de 24/04/2024 — comunicação de incidente | https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-aprova-o-regulamento-de-comunicacao-de-incidente-de-seguranca |
| TST — notícia *"Recibo de pagamento de salário sem assinatura do empregado não serve como prova"* | https://www.tst.jus.br/en/-/recibo-de-pagamento-de-salario-sem-assinatura-do-empregado-nao-serve-como-prova |
| STJ — 3ª Turma, procuração eletrônica sem ICP-Brasil (notícia de 31/03/2026) | https://www.stj.jus.br/sites/portalp/Paginas/Comunicacao/Noticias/2026/31032026-Para-Terceira-Turma--procuracao-eletronica-sem-ICP-Brasil-e-valida-desde-que-nao-haja-duvida-sobre-autenticidade.aspx |
| MTE — Consolidação dos Precedentes Administrativos | https://acesso.mte.gov.br/data/files/FF8080814373793B0143D539387E0188/CONSOLIDA%C3%87%C3%83O%20DOS%20PRECEDENTES%20ADMINISTRATIVOS%20com%20ato%20declarat%C3%B3rio%2014_2014.pdf |

### Fontes secundárias que sustentaram os selos `[V-SECUNDÁRIO]`

| Assunto | Fonte |
|---|---|
| Redação do art. 464 e do parágrafo único | [LegJur — art. 464 da CLT](https://www.legjur.com/legislacao/art/dcl_00054521943-464) · [Câmara dos Deputados — legislação citada](https://www.camara.leg.br/proposicoesWeb/prop_mostrarintegra?codteor=239119) · [Modelo Inicial — art. 464](https://modeloinicial.com.br/lei/CLT/consolidacao-leis-trabalho/art-464) |
| Recibo sem assinatura não serve como prova; ônus do empregador | [Machado Meyer — assinatura do empregado em recibos](https://www.machadomeyer.com.br/pt/inteligencia-juridica/publicacoes-ij/inteligencia-juridica-trabalhista/como-evitar-riscos-relacionados-a-necessidade-de-assinatura-do-empregado-em-recibos-de-pagamento) · [De Marck — ausência de assinatura nos holerites](https://demarckadvogados.com.br/a-ausencia-de-assinatura-nos-holerites-riscos-e-medidas-preventivas-para-as-empresas/) |
| MP 2.200-2, art. 10, §2º — outros meios admitidos pelas partes | [TJDFT — jurisprudência em temas](https://www.tjdft.jus.br/consultas/jurisprudencia/jurisprudencia-em-temas/jurisprudencia-em-detalhes/contratos/assinatura-eletronica-2013-certificado-privado-nao-emitido-pela-icp-brasil-2013-validade) · [LH Law — STJ valida assinaturas fora da ICP-Brasil](https://www.lhlaw.com.br/publicacoes/stj-valida-assinaturas-eletronicas-emitidas-por-plataformas-nao-credenciadas-na-icp-brasil/) |
| STJ — validade de assinatura eletrônica não ICP-Brasil | [Conjur, 28/11/2025](https://conjur.com.br/2025-nov-28/documento-com-assinatura-eletronica-nao-certificada-pela-icp-brasil-pode-ser-validado/) · [Pinheiro Guimarães](https://www.pinheiroguimaraes.com.br/stj-admite-validade-de-assinaturas-eletronicas-fora-da-icp-brasil/) · [IRIB](https://irib.org.br/noticias/detalhes/stj-reconhece-validade-de-assinatura-eletronica-avancada-certificada-fora-do-sistema-icp-brasil) |
| Lei 14.063 — âmbito (entes públicos) e os três níveis | [normas.leg.br — Lei 14.063/2020](https://normas.leg.br/?urn=urn%3Alex%3Abr%3Afederal%3Alei%3A2020-09-23%3B14063%21cap2) · [CM Legis](https://cassiusmarques.adv.br/legislacao/lei-14063-2020-assinaturas-eletronicas/) |
| Decreto 10.543/2020 — nível mínimo por risco | [Normas Legais — Decreto 10.543/2020](https://www.normaslegais.com.br/legislacao/decreto-10543-2020.htm) |
| Portaria 671/2021 — arts. 87/88, PAdES/CAdES, comprovante de ponto em PDF assinado | [Normas Legais — Portaria MTP 671/2021](https://www.normaslegais.com.br/legislacao/portaria-mtp-671-2021.htm) · [Senior — Portaria 671](https://documentacao.senior.com.br/exigenciaslegais/destaques/portaria-671/) |
| Revogação da Portaria MTB 3.626/1991 | [Guia Trabalhista — sinopse das alterações da Portaria 671/2021](https://www.guiatrabalhista.com.br/tematicas/sinopse-alteracoes-portaria-671-2021.htm) · [Portaria MTB 3.626/1991](https://www.normaslegais.com.br/legislacao/trabalhista/portariamtb3626_1991.htm) |
| Decreto 3.048/1999, art. 225, §5º — guarda por 10 anos | [Modelo Inicial — art. 225 do RPS](https://modeloinicial.com.br/lei/RPS/regulamento-previdencia-social/art-225) · [Jusbrasil — art. 225, §5º](https://www.jusbrasil.com.br/jurisprudencia/busca?q=art.+225%2C+%C2%A7+5+do+decreto+3048%2F99) |
| Prazos de guarda de documentos trabalhistas (divergência 5 × 10) | [Gescont — tabela de temporalidade](http://www.gescont.srv.br/informativos/guarda-de-documentos-tabela-de-temporalidade-de-documentos-trabalhistas-e-previdenciarios/) · [Quality Contábil](https://www.qualitycontabil.com.br/boletim/guarda-de-documentos-trabalhistas-e-previdenciarios-255) |
| Holerite eletrônico — trilha auditável em vez de assinatura qualificada | [SuperSign — holerite eletrônico com assinatura digital](https://supersign.com.br/blog/holerite-eletronico-assinatura-digital/) |

### Documentos internos

- `/home/user/masor/CLAUDE.md` — regras inegociáveis, identidade visual, preferências.
- `/home/user/masor/docs/folha/06-riscos-lgpd-e-dados-vivos.md` — papéis, DPA, incidente, trilha, prazos.
- `/home/user/masor/docs/folha/10-migracao-ponto-e-holerite.md` — Parte III (holerite), D-01 a D-07, H-01 a H-07.
- `/home/user/masor/docs/folha/11-dominio-incumbente-e-integracao.md` — o Domínio como incumbente e os caminhos de integração.
- `/home/user/masor/docs/folha/FONTES-A-BAIXAR.md` — itens **C3**, **D4/G4**, **D2**.

---

*G41 Inteligência Contábil — Insights Impulsionam.*
