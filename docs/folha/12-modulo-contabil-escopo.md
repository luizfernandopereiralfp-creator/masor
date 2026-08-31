# 12 — Módulo Contábil: escopo real, esforço e ordem de internalização

> **Para:** Fernando / G41 Inteligência Contábil (Curitiba).
> **Pergunta que este documento responde:** o que precisa existir para que "substituir o
> Domínio por completo" deixe de ser conversa — e quanto isso custa de verdade.
> **Data da pesquisa:** 30/08/2026. Todas as buscas foram feitas em 30/08/2026.
> **Aplicação-alvo:** módulo Contábil do **Lior** (mesma decisão de morada tomada para a
> folha em `07-arquitetura-modulo-lior.md`, seção 0). **Prefixo de tabelas proposto:** `ctb_`.
>
> **Por que este documento existe.** A pasta `docs/folha/` cobre folha, eSocial e obrigações
> trabalhistas em onze arquivos. O `docs/apuracao-prova-real.md` cobre parte do fiscal.
> **O contábil nunca foi estudado** — e ele é a terceira perna. Sem ele, o Lior não substitui
> o Domínio: substitui dois terços dele e mantém a mensalidade inteira.
>
> **Numeração:** não existe `11-` nesta pasta. Este arquivo é o `12-` por instrução direta.

---

## 0. Selo de evidência e limite de verificação (leia antes de usar qualquer número daqui)

### 0.1 A limitação de rede, declarada de saída

O ambiente desta pesquisa manteve **egress bloqueado por política de rede** (403 no proxy) para:

| Domínio | Resultado do teste em 30/08/2026 | O que ficou inacessível |
|---|---|---|
| `sped.rfb.gov.br` | **403** | Manuais de leiaute da ECD e da ECF, tabelas dinâmicas, guias práticos |
| `*.gov.br` (geral) | **403 no CONNECT** | IN RFB 2.003/2021, IN RFB 2.004/2021, IN RFB 2.142/2023, PVA |
| `planalto.gov.br` | **403** | Código Civil, DL 1.598/77, DL 9.295/46, MP 2.158-35, Lei 8.981/95 |
| `cfc.org.br` | **403 no CONNECT** (testado uma vez, sem insistir) | NBC TG 1000/1001/1002, ITG 2000 (R1), ITG 1000, resoluções |
| `febraban.org.br` | não testado diretamente; PDFs de leiaute CNAB240 aparecem indexados | leiaute CNAB 240 na origem |

**Consequência, dita sem rodeio: nenhuma afirmação normativa deste documento foi lida no
texto original.** Tudo que segue veio de fontes secundárias — editoras técnicas, conselhos
regionais, bases de conhecimento de fornecedores de software e portais de consultoria.
Isso é suficiente para **dimensionar** e **sequenciar**; **não é suficiente para codificar**.

### 0.2 Selo por afirmação

Este documento adota o esquema do `10-migracao-ponto-e-holerite.md`, que por sua vez adotou
o do `06`, para não repetir o erro apontado na `AUDITORIA-anti-invencao.md` (cada documento
inventando o próprio selo e promovendo fato entre arquivos):

| Selo | Significado | Pode virar código / parâmetro / cláusula? |
|---|---|---|
| `[V-DIRETO]` | Texto normativo aberto e lido integralmente nesta rodada | Sim |
| `[CV]` | **Convergência**: dois ou mais terceiros independentes dizem o mesmo, e nenhum contradiz | Só como parâmetro com `fonte_verificada = false`, resultado PROVISÓRIO |
| `[V-SEC]` | Uma única fonte secundária (editora, consultoria, base de fornecedor) | Não. Serve para dimensionar, não para afirmar |
| `[ENG]` | **Decisão de engenharia deste documento.** Não é afirmação normativa: é desenho, e responde ao autor, não à lei | Sim, registrada como decisão, com dono e data |
| `○ PENDÊNCIA — não confirmado` | Não verificado | Não. Nem em tela, nem em contrato, nem em proposta |

**Três declarações que fecham o loop com a auditoria:**

1. **Nenhuma afirmação deste documento é `[V-DIRETO]`.** Zero. O bloqueio de rede foi total
   para as fontes que importam aqui.
2. **Este documento não eleva o selo de ninguém.** Fatos herdados de `apuracao-prova-real.md`
   ou dos documentos `01`–`10` carregam aqui o mesmo selo que carregam lá.
3. **A maior parte do conteúdo é `[ENG]`** — modelo de dados, costura entre módulos,
   estimativa e sequenciamento são engenharia e decisão de negócio. A lei entra em pontos
   específicos, todos marcados.

**Onde as pendências se fecham:** `FONTES-A-BAIXAR.md`, **Bloco H**, aberto por este
documento (seção 12).

---
---

# PARTE I — O NÚCLEO CONTÁBIL

## 1. O que é obrigatório por norma e o que é conveniência

A distinção importa porque decide o que **não pode faltar no MVP** e o que pode esperar.
Um sistema contábil sem centro de custo é limitado; sem Diário fechado e assinado, é ilegal.

| Peça | Situação | Base citada | Selo |
|---|---|---|---|
| Sistema de contabilidade com escrituração uniforme dos livros, em correspondência com a documentação | **Obrigatório** para empresário e sociedade empresária | Código Civil, art. 1.179 | `[CV]` |
| **Balanço patrimonial e balanço de resultado econômico anuais** | **Obrigatório** | CC, art. 1.179 | `[CV]` |
| **Livro Diário** (pode ser substituído por fichas na escrituração mecanizada/eletrônica) | **Indispensável** — é o único livro nominado como tal | CC, art. 1.180 | `[CV]` |
| Lançamento do BP e do resultado econômico **no Diário**, assinados por contabilista habilitado e pelo empresário | **Obrigatório** | CC, art. 1.184, §2º | `[CV]` |
| Escrituração resumida do Diário (totais de até 30 dias), desde que haja **livros auxiliares** autenticados | Facultado | CC, art. 1.184 | `[V-SEC]` |
| **Livro Razão** | Tratado como livro contábil obrigatório | ITG 2000 (R1) | `[CV]` |
| Registro **"Balancetes Diários e Balanços"** quando o Diário/Razão nascem de fichas ou folhas soltas | Exigido nessa hipótese | ITG 2000 (R1) | `[CV]` |
| Termo de abertura e encerramento (forma não digital) assinados por titular/representante **e** pelo contabilista registrado no CRC | Obrigatório | ITG 2000 (R1) | `[CV]` |
| Livros em **forma digital**: assinatura digital pela entidade **e** pelo contabilista habilitado; autenticação no registro público quando exigível | Obrigatório | ITG 2000 (R1) | `[CV]` |
| Dispensa do **pequeno empresário** (art. 970) das exigências do art. 1.179 | Dispensa existe, mas **não** dispensa o uso do Diário/fichas para registro das operações | CC, art. 1.179, §2º | `[V-SEC]` — a leitura da fonte secundária é ambígua; ver **C-01** |
| **Método das partidas dobradas** como forma obrigatória de escrituração | Atribuído à ITG 2000 (R1); **item não conferido** | — | ○ **PENDÊNCIA C-02** |
| **Balancete mensal** | Não localizei norma que o torne obrigatório por si só. Ele é (a) exigência operacional do fechamento e (b) o conteúdo dos registros de saldos periódicos da ECD | — | ○ **PENDÊNCIA C-03** |
| **Centro de custo** | **Não é obrigatório.** Vira obrigatório *de fato* quando a empresa o usa: aí ele entra na chave do mapeamento referencial da ECD e da ECF | Registro I051 (ECD) / J051, K155 (ECF) | `[CV]` |
| **Histórico padronizado** de lançamento | Conveniência — mas ver seção 1.3 | — | `[ENG]` |
| **Lote de lançamentos** | Conveniência de operação; não é conceito da norma | — | `[ENG]` |

### 1.1 Plano de contas: são dois planos, e o de-para entre eles é trabalho recorrente

Este é o ponto onde quem nunca gerou uma ECD subestima o módulo.

- **Plano da empresa** — o que o contador desenhou para aquele cliente. Livre.
- **Plano referencial da RFB** — a taxonomia oficial, publicada como *tabela dinâmica* no
  ambiente do SPED, com versões por ano-calendário e por tipo de entidade. `[CV]`
- **De-para obrigatório** entre um e outro:
  - na **ECD**, registro **I051** — mapeia a conta analítica da empresa para a conta
    referencial; `[CV]`
  - na **ECF**, registros **J050/J051** (plano e mapeamento) alimentando **K155/K156** e
    **K355** (saldos). `[CV]`

Duas regras verificadas por convergência, e ambas mordem na hora de gerar o arquivo:

1. **A chave do I051 mudou.** Até o leiaute 8 da ECD ela era `[COD_CCUS] + [COD_CTA_REF]`;
   **a partir do leiaute 9, válido desde o ano-calendário 2020, é apenas `[COD_CCUS]`**. `[CV]`
2. **Só se mapeia conta referencial de mesma natureza** (ativo com ativo, passivo com
   passivo, e assim por diante). `[CV]`

`[ENG]` **Consequência de desenho, e é dura:** o de-para não é um `enum` no código. É
**dado versionado por cliente e por ano-calendário**, com aprovação humana — exatamente o
mesmo princípio que sustenta `masor_tax_states` e `folha_parametro`. Um cliente que muda o
plano de contas no meio do caminho gera um **I157** (transferência de saldos de plano
anterior) — que é o registro que existe justamente porque troca de plano e **troca de
sistema** acontecem. Guarde este registro: ele reaparece na seção 10, como a porta de
entrada da migração.

### 1.2 Lançamento, razão, balancete, diário — o que o motor precisa garantir

`[ENG]` O núcleo não é difícil de descrever. É difícil de manter íntegro sob concorrência,
reabertura de período e estorno. As invariantes que o banco precisa impor, não a aplicação:

| Invariante | Como se garante | Por que não pode ser só validação de tela |
|---|---|---|
| `soma(débitos) = soma(créditos)` por lançamento | *constraint* diferida ou *trigger* no fecho do lançamento | Importação em lote e API contornam a tela |
| Lançamento pertence a **uma** competência e a **um** cliente | FK + RLS por `cliente_id` | Vazamento entre clientes é o risco nº 1 do multi-tenant |
| Competência **fechada** não aceita partida nova | *trigger* que lê `ctb_competencia.status` | O balancete já foi entregue ao cliente; mudar depois é divergência silenciosa |
| Lançamento efetivado **nunca** é apagado nem editado | somente estorno, com `estorno_de_id` | O Diário é livro; livro não se rasura |
| Conta analítica é a única que recebe partida | `conta.tipo = 'analitica'` | O PVA rejeita saldo em conta sintética |
| Toda partida referencia conta **vigente na data** do lançamento | vigência na conta | Plano muda no meio do exercício |
| Reabertura de competência é **evento auditado** | tabela append-only, com autor e motivo | É a operação que mais gera "mas o balancete era outro" |

### 1.3 Histórico padronizado: conveniência que vira obrigação na prática

`[ENG]` O histórico livre é o que transforma razão em lixo pesquisável. A escolha de desenho
é **histórico como tabela** (`ctb_historico_padrao`, com código, texto e *placeholders*
tipados: `{documento}`, `{fornecedor}`, `{competencia}`), e histórico livre permitido apenas
com justificativa. Motivo prático: sem histórico padronizado, **não existe conciliação
automática nem classificação assistida** — o texto é a única chave que sobra quando valor e
data empatam entre dez lançamentos.

### 1.4 Encerramento de exercício e apuração de resultado

`[CV]` A mecânica que a própria ECD expõe: os valores da DRE (registro **J150**) saem dos
**saldos das contas de resultado antes do encerramento**, materializados no registro
**I355**. Ou seja, o arquivo exige que o sistema saiba distinguir *saldo antes* e *saldo
depois* do encerramento — não basta zerar as contas.

`[ENG]` O que o motor precisa produzir, na ordem:

1. Apuração do resultado do exercício (transferência das contas de resultado para a conta
   de apuração).
2. Destinação do resultado (lucro/prejuízo acumulado, reservas, dividendos).
3. Congelamento dos saldos finais como **saldos de abertura** do exercício seguinte.
4. Um **lote de encerramento** identificável e reversível — porque ele é refeito toda vez
   que aparece um lançamento retificador de dezembro em fevereiro. E aparece.

○ **PENDÊNCIA C-04** — não confirmei se o leiaute vigente da ECD exige que os lançamentos
de encerramento apareçam como partidas normais no Bloco I ou se há registro próprio. Fecha
com o Manual de Orientação do Leiaute da ECD (item H1 do Bloco H).

---
---

# PARTE II — ESCRITURAÇÃO DIGITAL (ECD e ECF)

## 2. O que são, quem entrega, quando

### 2.1 Quadro comparativo

| | **ECD** (SPED Contábil) | **ECF** (Escrituração Contábil Fiscal) |
|---|---|---|
| O que é | Versão digital dos **livros**: Diário e auxiliares, Razão e auxiliares, Balancetes Diários, Balanços e fichas de lançamento comprobatórias `[CV]` | Substituta da antiga DIPJ: **apuração do IRPJ e da CSLL**, com e-LALUR e e-LACS `[CV]` |
| Quem entrega | PJ, inclusive equiparadas, **imunes e isentas**, obrigadas a manter escrituração contábil pela legislação comercial — IN RFB 2.003/2021, art. 3º `[CV]` | **Todas** as PJ: Lucro Real, Presumido, Arbitrado, imunes e isentas — IN RFB 2.004/2021 `[CV]` |
| Quem **não** entrega | Optantes pelo Simples Nacional, **salvo** se distribuírem lucros/dividendos sem retenção em valor superior à base de cálculo do imposto diminuída dos tributos devidos `[CV]` | Optantes pelo Simples Nacional; órgãos públicos, autarquias e fundações públicas; **PJ inativas** `[CV]` |
| Prazo | **Último dia útil de junho** do ano seguinte ao da escrituração — redação dada pela **IN RFB 2.142/2023** ao art. 5º da IN RFB 2.003/2021. Para o AC 2025: **30/06/2026** `[CV]` | **Último dia útil de julho** — para o AC 2025: **31/07/2026** `[CV]` |
| Multa por atraso | **R$ 1.500,00 por mês-calendário ou fração** para PJ que apurou lucro real na última declaração — MP 2.158-35, art. 57 `[V-SEC]` | **0,25% por mês-calendário ou fração** sobre o lucro líquido antes do IRPJ/CSLL, **limitada a 10%** desse lucro — DL 1.598/77, art. 8º-A. Tetos: **R$ 100.000,00** (receita bruta do ano anterior até R$ 3.600.000,00) e **R$ 5.000.000,00** nos demais casos `[V-SEC]` |
| Leiaute vigente em 2026 | ○ **PENDÊNCIA C-05** — o leiaute 9 é citado como válido desde o AC 2020; não confirmei qual está em vigor para o AC 2025/2026 | **Leiaute 12**, com PVA na versão 12.x `[CV]` |

> **ALERTA de selo, e é importante.** A busca devolveu **duas versões do prazo da ECD**:
> "último dia útil de **maio**" (redação original da IN RFB 2.003/2021, ainda replicada em
> muito material antigo) e "último dia útil de **junho**" (redação da IN RFB 2.142/2023).
> Adotei junho por convergência e por ser a citação mais recente e mais específica — mas
> **isso é exatamente o tipo de fato que não pode ir para tela nem para calendário de
> cliente sem leitura da IN.** Ver `C-06`.

### 2.2 A relação com o que o Masor já toca

| Obrigação | Periodicidade | Módulo dono | Conexão |
|---|---|---|---|
| EFD ICMS/IPI (SPED Fiscal) | Mensal | Fiscal (Masor) | `apuracao-prova-real.md` — prova real = reproduzir o **E110** |
| EFD-Contribuições | Mensal | Fiscal (Masor) | prova real = reproduzir **M200/M600** |
| **ECD** | **Anual** | **Contábil** | Consome o Diário inteiro do exercício |
| **ECF** | **Anual** | **Contábil + Fiscal** | **Recupera dados da ECD** já transmitida `[CV]` |
| DCTFWeb / FGTS Digital | Mensal | Folha | `04-obrigacoes-acessorias-e-calendario.md` |

`[ENG]` **O encadeamento é a parte que ninguém desenha e todo mundo sofre:** a ECD tem de
estar transmitida e aceita **antes** da ECF, porque a ECF recupera dela o plano de contas e
os saldos. E há um efeito colateral com nome e endereço: **a PJ deve entregar ECF
retificadora sempre que apresentar ECD substituta que altere contas ou saldos recuperados
na ECF ativa** `[CV]`. Isto é, corrigir a contabilidade de um exercício encerrado dispara
uma cascata de duas entregas — e o sistema precisa **saber disso e avisar**, senão o
escritório descobre por autuação.

## 3. Blocos e registros — o mapa, com o que foi conferido e o que não foi

### 3.1 ECD

| Bloco | Papel | Registros que **consegui confirmar** | Registros que **cito de memória** — ○ PENDÊNCIA C-07 |
|---|---|---|---|
| **0** | Abertura, identificação e referências | — | 0000, 0001, 0007, 0020, 0150, 0180 |
| **I** | **Lançamentos contábeis** — o corpo da escrituração | **I051** (de-para com o plano referencial) `[CV]` · **I150** (saldos periódicos: identificação do período) `[CV]` · **I155** (detalhe dos saldos periódicos) `[CV]` · **I157** (transferência de saldos de plano de contas anterior) `[CV]` · **I200** (lançamento contábil) `[CV]` · **I250** (partidas do lançamento) `[CV]` · **I355** (saldos das contas de resultado **antes** do encerramento) `[CV]` | I010, I012, I015, I020, I030, I050 (plano de contas), I052, I053, I075, I100 (centro de custo), I300/I310 (balancetes diários), I350 |
| **J** | **Demonstrações contábeis** | **J100** (Balanço Patrimonial) `[CV]` · **J150** (DRE) `[CV]` · Demonstração dos Lucros ou Prejuízos Acumulados `[V-SEC]` | J005, J210, J215, J800 (outras informações / notas explicativas), J900, J930 (signatários), J935 |
| **K** | Conglomerados / consolidação | — | K030, K100, K200, K300 |
| **9** | Encerramento do arquivo | — | 9900, 9990, 9999 |

**Leitura honesta da tabela acima:** confirmei **sete registros** do Bloco I e **dois** do
Bloco J. O leiaute completo da ECD tem **dezenas** de registros. O que está na coluna da
direita é conhecimento de mercado que **não vale como especificação** — está ali para
dimensionar o trabalho, não para orientar código. Fecha com o item **H1**.

### 3.2 ECF

| Bloco | Papel | Selo |
|---|---|---|
| **0** | Abertura e identificação | `[V-SEC]` |
| **C** | **Recuperação dos dados da ECD** | `[V-SEC]` |
| **E** | Recuperação de saldos e cálculo fiscal do exercício anterior | ○ **PENDÊNCIA C-08** |
| **J** | **Plano de contas e mapeamento** (J050 plano, J051 de-para referencial) | `[CV]` |
| **K** | **Saldos das contas contábeis e referenciais** (K155/K156, K355) | `[CV]` |
| **L** | Balanço Patrimonial e DRE — **Lucro Real** | `[CV]` |
| **M** | **e-LALUR e e-LACS** (adições, exclusões, compensações) | `[CV]` |
| **N** | Cálculo do **IRPJ e da CSLL** — Lucro Real | `[CV]` |
| **P** | **Lucro Presumido** (P150 balanço, P300 apuração) | `[CV]` |
| **Q** | **Livro Caixa** (Q100) | `[CV]` |
| **T, U, V, W, X, Y** | Lucro arbitrado, imunes/isentas, demonstrações do exercício, declarações de país-a-país, informações econômicas e informações gerais | `[V-SEC]` — composição exata não confirmada, ver **C-09** |
| **9** | Encerramento | `[V-SEC]` |

`[CV]` **Novidades do leiaute 12 relatadas:** novos campos e validações nos Blocos **J** e
**K**, e tratamento mais detalhado de adições e exclusões recorrentes no Bloco **M**.
Isto é `[V-SEC]` reforçado por dois portais; **não use em comunicado a cliente sem ler o
manual** (item **H2**).

## 4. Assinatura, autenticação e retificação — as três armadilhas

### 4.1 Assinatura e autenticação

`[CV]` Desde 2016, **a autenticação dos livros contábeis digitais ocorre no momento da
transmissão do SPED, e é comprovada pelo recibo** — não há mais o rito separado de levar o
livro à Junta Comercial. O arcabouço citado é o **Decreto 9.555/2018** e a **IN DREI
11/2020**.

`[CV]` Os livros em forma digital devem ser **assinados digitalmente pela entidade e pelo
profissional da contabilidade habilitado** (ITG 2000 R1), com certificado ICP-Brasil.

○ **PENDÊNCIA C-10** — a combinação exata de certificados aceita (e-CNPJ da empresa +
e-CPF do contador; procuração eletrônica; assinatura de terceiro signatário) e o limite de
signatários por arquivo **não foram confirmados**. Isso muda o desenho do cofre de
certificados do Lior, que já guarda A1 de clientes (ver `07`, seção 4). Item **H1**.

### 4.2 Retificação da ECD: não existe "retificar"

`[CV]` Esta é a regra que mais surpreende quem vem do mundo das declarações mensais:

> **Na ECD não há retificação, há substituição.** Livro contábil autenticado só pode ser
> substituído quando o erro **inviabiliza** a escrituração de forma que não se resolva com
> lançamentos contábeis extemporâneos.

E as duas consequências:

1. **Erro que *não* inviabiliza** → o correto é lançamento retificador **no exercício em
   que o erro foi detectado**. O livro autenticado permanece como está. `[CV]`
2. **Erro que inviabiliza** → substituição, **válida somente se acompanhada do Termo de
   Verificação para Fins de Substituição**, assinado pelo profissional da contabilidade que
   assina os livros substitutos. `[CV]`

`[ENG]` **O que isso obriga o sistema a fazer, e é caro:** manter o **arquivo transmitido**
e o **recibo** de cada exercício, imutáveis, para sempre; ser capaz de **gerar o Termo de
Verificação**; e — o ponto que quase ninguém prevê — ser capaz de **regerar um arquivo no
leiaute do ano a que ele se refere**, não no leiaute do ano corrente. Um sistema próprio que
só sabe gerar o leiaute atual **não consegue substituir uma ECD de 2023**. Volta na seção 11,
como risco de saída do Domínio.

### 4.3 ECF: retificação existe, mas puxa a ECD junto

`[CV]` A ECF admite retificadora. O laço perigoso é o inverso: **ECD substituta que altere
contas ou saldos recuperados obriga ECF retificadora**. O sistema precisa modelar essa
dependência como grafo, não como checklist mental do analista.

## 5. O tamanho real do trabalho de gerar ECD e ECF

Esta é a seção que a missão pediu sem dourar. Vou dar os seis motivos concretos pelos quais
**é aqui que sistemas contábeis próprios morrem** — e nenhum deles é "montar o TXT".

**(1) O arquivo é a parte fácil; o laço fechado é a parte difícil.**
O fluxo real é `gerar TXT → importar no PVA → validar → assinar → transmitir via Receitanet`
`[CV]`. O **PVA é um programa Java de mesa**. ○ **PENDÊNCIA C-11:** não localizei, nesta
rodada, **nenhuma API pública de transmissão** de ECD ou ECF equivalente ao webservice do
eSocial. Se essa pendência se confirmar, o desfecho da entrega **continua sendo manual ou
automatizado por RPA em cima de um executável de terceiro** — e isso não é detalhe: é a
diferença entre "o sistema entrega" e "o sistema gera um arquivo que alguém entrega".
Compare com a folha, onde existe canal programático (`02-esocial-integracao-tecnica.md`).

**(2) A especificação de verdade é o validador, e ele não é publicado como schema.**
No eSocial há **XSD** — dá para validar offline (é a Fase 3 do faseamento do `07`). Na
ECD/ECF há um manual em PDF e um PVA que rejeita. As centenas de regras de consistência
cruzada (conta analítica que precisa existir no J050 **e** ter J051 filho ligando ao
referencial, para satisfazer o K155 — erro real, documentado em três bases de fornecedores
diferentes `[CV]`) **você descobre por rejeição**, não por leitura de contrato de dados.

**(3) O PVA velho é recusado na transmissão.**
`[CV]` Mensagem documentada: *"A versão do PVA utilizada para transmitir o arquivo de
escrituração não é mais válida."* Ou seja: **toda temporada exige acompanhar versão de PVA
e leiaute**, e o acompanhamento é obrigatório, não opcional.

**(4) A cadência anual destrói o ciclo de aprendizado.**
Um bug de folha aparece em 30 dias. Um bug de ECD aparece **12 meses depois**, na temporada,
**em toda a carteira ao mesmo tempo**, com prazo de 30 dias para consertar. Você tem
**duas** oportunidades de acertar por ano (ECD em junho, ECF em julho) e elas são
consecutivas. Isso significa, na prática, que **o gerador precisa de duas temporadas
completas em modo sombra antes de ser confiável** — dois anos de calendário.

**(5) Três arquivos precisam concordar entre si.**
ECD do ano ↔ ECF do ano (recuperação) ↔ ECD do ano anterior (I157 e saldos de abertura).
Divergência de um centavo em qualquer vértice trava a entrega.

**(6) O de-para referencial é trabalho humano recorrente, por cliente e por ano.**
A tabela referencial muda; o plano do cliente muda; a chave do I051 já mudou uma vez de
leiaute. Isso não é código — é operação com curadoria, e precisa de tela, versionamento e
trilha de aprovação.

`[ENG]` **Veredito da seção:** ECD é um projeto de porte médio. **ECF é o maior componente
isolado do módulo contábil** — ela não é "exportar contabilidade", ela **é a apuração de
IRPJ e CSLL**, com LALUR, LACS, compensação de prejuízo, presumido, arbitrado e imunes/isentas.
Quem estima ECF junto com ECD numa linha só de planilha está subestimando por um fator de dois.

---
---

# PARTE III — A COSTURA: COMO FOLHA, FISCAL E CONTÁBIL SE AMARRAM

> Leia junto com `11-dominio-incumbente-e-integracao.md`, publicado nesta mesma pasta.
> Ele mapeou o incumbente e concluiu, para a folha, pelo cenário (A). Esta parte
> **não contradiz aquela conclusão** — ela mostra que o contábil tem uma propriedade que a
> folha não tem, e que muda a ordem recomendada na Parte VII.

## 6. O princípio: "integrado" só significa alguma coisa se três coisas forem compartilhadas

`[ENG]` Escritório que diz ter "sistema integrado" quase sempre tem **exportação de arquivo
com nome bonito**. A diferença é objetiva, e cabe em três itens. Sem os três, é exportação:

1. **Um único cadastro de cliente e estabelecimento.** Um `cliente_id`, um CNPJ, um
   calendário. Se folha e contábil têm cadastros próprios que "se conversam", o de-para vira
   o produto e ninguém mantém.
2. **Um único conceito de competência, com estado de fechamento compartilhado.** Se o
   contábil considera março fechado e a folha ainda aceita lançamento em março, a
   integração está mentindo.
3. **Um único de-para, versionado, com dono e aprovação.** O mesmo `folha_rubrica` que já
   carrega os três códigos de incidência do eSocial (`09-rubricas-e-reconciliacao.md`)
   passa a carregar também a chave contábil. A rubrica é a junta: **eSocial de um lado,
   razão do outro.**

## 7. O modelo — evento contabilizável, regra e lançamento

`[ENG]` Três tabelas explicam o mecanismo inteiro. Tudo o mais é detalhe.

```
  módulo de origem            contábil
  ────────────────            ────────────────────────────────────────────
  folha  ──┐
  fiscal ──┼──▶  ctb_evento_origem  ──▶  ctb_regra_contabilizacao  ──▶  ctb_lancamento
  banco  ──┘        (o fato)              (como se contabiliza)          + ctb_partida
                         │                        │
                         │                        └─▶ ctb_depara_conta (a chave → conta)
                         │
                         └─▶ sem regra ou sem de-para ⇒ QUARENTENA, nunca lançamento
```

### 7.1 `ctb_evento_origem` — o fato, antes de virar lançamento

| Campo | Papel |
|---|---|
| `cliente_id`, `competencia_id` | de quem e de quando |
| `modulo` | `folha` · `fiscal` · `banco` · `manual` |
| `tipo_evento` | `folha_mensal`, `provisao_ferias`, `nf_entrada_item`, `extrato_credito`, … |
| `referencia_tipo` + `referencia_id` | FK lógica para a origem (`folha_calculo`, `documento_item`, `ctb_extrato_linha`) |
| `payload` jsonb | o fato como a origem o descreve |
| `hash_idempotencia` | **UNIQUE (cliente_id, modulo, tipo_evento, hash)** |
| `status` | `pendente` · `contabilizado` · `quarentena` · `descartado` |

`[ENG]` **A chave de idempotência não é conveniência — é a única defesa contra o erro mais
comum de integração contábil: contabilizar a mesma folha duas vezes** porque alguém rodou o
processo de novo. O mesmo princípio que o `id_evento` estável cumpre no eSocial (`07`, §2.3).

### 7.2 `ctb_regra_contabilizacao` — o template do lançamento

| Campo | Papel |
|---|---|
| `cliente_id` **nullable** | `null` = template global da G41; preenchido = regra do cliente, que sobrepõe |
| `modulo`, `tipo_evento`, `condicao` jsonb | quando a regra se aplica |
| `partidas[]` | cada uma com: papel (`debito`/`credito`), **seletor de conta** (de-para ou conta fixa), **base do valor** (campo do payload ou expressão), centro de custo |
| `historico_template` | texto com `{placeholders}` tipados |
| `vigencia_inicio` / `vigencia_fim` | regra muda; histórico não se reescreve |
| `aprovado_por`, `aprovado_em` | quem assumiu a regra |

### 7.3 `ctb_depara_conta` — a chave que vira conta

| Origem | Chave do de-para | Vai para |
|---|---|---|
| Folha | `rubrica_id` (+ lotação / centro de custo) | conta de despesa ou de passivo |
| Fiscal — entrada | `CFOP` + `CST/CSOSN` (+ NCM ou produto, quando necessário) | estoque / custo / despesa / imobilizado **e** conta de imposto a recuperar |
| Fiscal — saída | `CFOP` + `CST` | receita bruta por natureza, imposto sobre vendas, CMV |
| Banco | `natureza` classificada da linha do extrato | conta de disponibilidade e contrapartida |

> **REGRA INEGOCIÁVEL, no mesmo espírito do `CLAUDE.md`:**
> **chave sem de-para não vira lançamento.** Vai para quarentena, abre pendência visível e
> tarefa no Kanban. **Não existe conta padrão silenciosa.** O pecado clássico do setor é a
> conta "3.x.x.99 — Outras despesas" engolindo o que ninguém classificou; ela transforma o
> balancete em ficção e só aparece quando o cliente pergunta por que a despesa dobrou.

## 8. Folha → contábil

`[CV]` O reconhecimento de férias e 13º é **mensal, por competência**, na razão de **1/12**
da remuneração (13º) e de 1/12 acrescido do terço constitucional (férias), **somados os
encargos** de INSS e FGTS, com ajuste dos meses anteriores quando há reajuste salarial. A
contrapartida é **passivo circulante**, e o fundamento citado é o **CPC 33 (R1) / NBC TG 33 —
Benefícios a Empregados** e o regime de competência.

○ **PENDÊNCIA C-12** — dois pontos que a fonte secundária divergiu ou não respondeu:
(a) o corte de **15 dias trabalhados no mês** aparece citado para o 13º e não para férias;
(b) a discussão terminológica "provisão x passivo estimado" (se o correto é chamar de
*provisão*, dada a NBC TG 25). Não muda o número; muda a nomenclatura do plano de contas e
a nota explicativa. Fecha com a NBC TG 33 e a NBC TG 25 (itens **H5** e **H6**).

### 8.1 O ciclo mensal, na ordem em que os lançamentos precisam sair

| # | Evento | Débito | Crédito | Nota |
|---|---|---|---|---|
| 1 | Provisão de férias + 1/3 | despesa de pessoal (por centro de custo) | provisão de férias | 1/12 `[CV]` |
| 2 | Encargos sobre a provisão de férias | despesa de encargos | provisão de encargos s/ férias | INSS + FGTS `[CV]` |
| 3 | Provisão de 13º | despesa de pessoal | provisão de 13º | 1/12 `[CV]` |
| 4 | Encargos sobre a provisão de 13º | despesa de encargos | provisão de encargos s/ 13º | `[CV]` |
| 5 | Folha do mês — proventos | despesa de pessoal por rubrica e centro de custo | salários a pagar | grão = **rubrica** |
| 6 | Folha do mês — descontos | salários a pagar | INSS retido · IRRF retido · VT · adiantamento · pensão · consignado | cada um em conta própria |
| 7 | Encargos patronais | despesa de encargos | INSS patronal · RAT · terceiros · FGTS a recolher | `[ENG]` |
| 8 | Pagamento da folha | salários a pagar | banco | casa com o retorno CNAB / extrato |
| 9 | Recolhimentos | INSS/IRRF/FGTS a recolher | banco | casa com DCTFWeb e FGTS Digital (`04`) |
| 10 | **Baixa da provisão** quando férias ou 13º são efetivamente pagos | provisão de férias / de 13º | salários a pagar | **`[CV]` este é o passo que se esquece** |

`[CV]` A fonte é explícita sobre o passo 10: *"quando você faz a provisão mensal de 13º e
férias e tem o pagamento, você não lançará na despesa o débito, e sim descontará das contas
de provisão"*. **Esquecer isso duplica a despesa de pessoal** — e é o erro de integração
contábil de folha mais frequente que existe.

### 8.2 As três conferências que provam a contabilização (extensão da prova real)

`[ENG]` No mesmo padrão de `apuracao-prova-real.md` e de `09-rubricas-e-reconciliacao.md`,
por competência e por cliente:

| Conferência | Lado A | Lado B |
|---|---|---|
| **Despesa** | soma dos débitos de despesa de pessoal e encargos no mês | total da folha calculada (`folha_calculo`) |
| **Passivo** | saldo das contas de provisão | passivo trabalhista recalculado pelo módulo de folha |
| **Guias** | saldo das contas "a recolher" | DCTFWeb, FGTS Digital e os totalizadores de retorno do eSocial |

Se as três batem, a contabilização está certa. Se qualquer uma não bate, **não se fecha a
competência** — trava, não aviso.

### 8.3 O caminho de curto prazo, que já existe

`[CV]`, herdado de `11-dominio-incumbente-e-integracao.md` §2.2.2: **o módulo Folha do
Domínio exporta um arquivo de integração contábil** (*"Exportar integração contábil do módulo
folha"*, artigo `codigo=4497`; *"Como gerar arquivo texto da Integração Contábil?"*,
`codigo=3554`), com caso de uso declarado de **"cálculo da folha feito em um sistema e a
contabilidade em outro"**, e com a regra de que **o total de débito precisa igualar o total
de crédito**, sob pena de a exportação ser barrada.

`[ENG]` **Este é o achado que reordena o projeto, e vale sublinhar:** existe caminho
confirmado para **a folha ficar no Domínio e a contabilidade sair para o Lior**. O contábil
não depende de a folha ser internalizada. Volta na Parte VII.

○ **PENDÊNCIA C-13** — o **leiaute campo a campo** desse arquivo (o "Formato 19" citado por
integrador) não pôde ser lido; o domínio do suporte está bloqueado. Sem ele, não se escreve
o *parser*. Mesmo bloqueio, mesmo remédio: abrir as URLs listadas em `11` §9.1.

## 9. Fiscal → contábil

`[ENG]` **O grão é o item da nota, não o total da nota.** É a mesma decisão já tomada em
`apuracao-prova-real.md` (§7, tabela `documento_item`), e a razão é a mesma: **CFOP, CST/CSOSN
e origem decidem a conta** — se é estoque, consumo, imobilizado ou despesa — **e decidem a
recuperabilidade do imposto**. Contabilizar por total de nota destrói exatamente a informação
que separa custo de crédito.

### 9.1 As regras que já estão fixadas no `CLAUDE.md` e que o contábil tem de obedecer

| Situação fiscal | Efeito contábil | Origem da regra |
|---|---|---|
| Entrada tributada, revenda, regime normal | ICMS destacado → **ICMS a recuperar** (ativo); o resto vai ao estoque | `CLAUDE.md` |
| **ST retida na nota** | **valor cheio é custo**, sem crédito | `CLAUDE.md` |
| Revenda **monofásica** (PIS/COFINS) | **sem crédito na entrada**, alíquota zero na saída | `CLAUDE.md` |
| Fornecedor do Simples | crédito limitado ao % informado na NF; **sem informação = zero** | `CLAUDE.md` (LC 123, art. 23) |
| DIFAL em revenda no regime normal | **nunca somado ao custo** | `CLAUDE.md` |

> **A regra de ouro da costura:** essas classificações são **calculadas uma única vez, no
> Masor, e consumidas pelo contábil**. Se o módulo contábil reclassificar por conta própria,
> aparece a divergência mais cara que existe num escritório: **o balancete não bate com a
> EFD**, e ninguém sabe qual dos dois está errado.

### 9.2 O que fecha o ciclo

`[ENG]` A apuração mensal também é lançamento: transferência de `ICMS a recuperar` contra
`ICMS a recolher`, apurando o saldo. E aí a prova real de `apuracao-prova-real.md` ganha
uma terceira perna:

| Prova | Já especificada | O que este documento acrescenta |
|---|---|---|
| ICMS | calculado × **E110** × guia | **× saldo contábil** das contas de ICMS |
| PIS/COFINS | calculado × **M200/M600** × guia | **× saldo contábil** |
| Receita | calculada × declarada | **× receita contábil** — e, ao fim do ano, **× a DRE da ECD e o Bloco L/P da ECF** |

`[ENG]` **Esta é a peça de maior valor competitivo do módulo inteiro.** Fiscal, contábil e
folha se conferindo cruzadamente, por competência, de forma automática, é exatamente o que o
mercado não entrega — porque nos sistemas tradicionais os três módulos *convivem*, mas
raramente *se auditam*.

## 10. Banco → contábil: extrato, conciliação e o que não pode ser automático

### 10.1 Entrada de dados

| Canal | O que é | Selo | Observação |
|---|---|---|---|
| **OFX** | Formato de arquivo *tagueado*, desenhado para trocar dados bancários e de pagamento de contas | `[CV]` | O `FITID` é o identificador da transação — **é a chave de idempotência natural** `[ENG]` |
| **CNAB 240 (FEBRABAN)** | Padrão de troca de arquivos bancários, organizado em lotes: cobrança, pagamentos e tributos. Versão de leiaute localizada: **10.11, de 21/08/2023** | `[CV]` | Há campos específicos para **conciliação bancária** dentro do padrão `[V-SEC]` |
| **Open Finance / API do banco** | Extrato por API | ○ **PENDÊNCIA C-14** | Viabilidade para PJ de cliente de escritório, custo e habilitação não confirmados |

○ **PENDÊNCIA C-15** — a **versão vigente** do leiaute CNAB 240 em 2026 não foi confirmada
(a 10.11 é de 2023 e é a mais recente localizada). Item **H7**.

### 10.2 A conciliação, e a linha que separa automação de invenção

`[ENG]` O motor de casamento, do mais forte para o mais fraco:

| Nível | Critério | Ação |
|---|---|---|
| 1 | Valor + data exata + documento | casa automático |
| 2 | Valor + janela de data (± N dias) + único candidato | casa automático |
| 3 | Valor exato, vários candidatos | sugere, humano escolhe |
| 4 | N:1 (um depósito, várias notas) ou 1:N | sugere agrupamento, humano confirma |
| 5 | Sem candidato | **pendência.** Nunca vira "outras receitas" |

**O nível 5 é o teste de caráter do módulo.** Todo sistema tem uma tentação de "classificar
automaticamente o que sobrou". É a mesma tentação da regra tributária inventada — e o
resultado é o mesmo: número plausível, errado, e sem rastro de quem decidiu.

### 10.3 A conciliação de três pontas

`[ENG]` `saldo contábil da conta banco` = `saldo do extrato` = `saldo conciliado`.
Enquanto os três não empatam, a competência não fecha. Simples de escrever, e é o item que
mais consome hora de escritório todo mês.

---
---

# PARTE IV — NORMAS CONTÁBEIS: O QUE O CFC EXIGE

## 11. O arcabouço, e o que ele obriga o software a fazer

| Norma | O que trata | Consequência direta no software | Selo |
|---|---|---|---|
| **Código Civil, arts. 1.179 a 1.195** | Escrituração, Diário, balanço anual, dispensa do pequeno empresário | Diário fechável e assinável; balanço anual lançado no Diário | `[CV]` |
| **ITG 2000 (R1)** — Escrituração Contábil | Formalidades, Diário e Razão, escrituração de filial, documentação contábil, contas de compensação, **retificação de lançamento** | Termos de abertura/encerramento; assinatura digital da entidade **e** do contabilista; livros auxiliares; registro "Balancetes Diários e Balanços" quando há fichas ou folhas soltas | `[CV]` |
| **NBC TG 1000** — Contabilidade para PMEs | Passou a ser obrigatória **apenas para as médias empresas** | Conjunto de demonstrações e notas | `[CV]` |
| **NBC TG 1001** — Pequenas Empresas | Receita bruta **acima de R$ 4,8 milhões até R$ 78 milhões** por ano | Modelo simplificado | `[CV]` — faixas em `[V-SEC]`, ver **C-16** |
| **NBC TG 1002** — Microentidades | Receita bruta **até R$ 4,8 milhões** por ano. **Revoga a ITG 1000** (Resolução CFC 1.418/2012) | Modelo mais simples ainda | `[CV]` |
| **Decreto-Lei 9.295/1946** | Cria o CFC; serviços técnicos contábeis só podem ser executados por profissional **habilitado e registrado**; **responsabilidade solidária** pelas multas entre o infrator e a empresa a cujos serviços ele se acha | Identidade do signatário com CRC; trilha de quem assinou o quê | `[CV]` |
| **Código Civil, arts. 1.177 e 1.178** | Responsabilidade do contabilista preposto — perante o preponente por culpa, e **solidariamente com ele perante terceiros por atos dolosos** | Não é regra de software; é a razão de o bloqueio duro da seção 11.2 existir | `[V-SEC]` |
| **NBC PG 300 / NBC PG 100 / 200** | Normas profissionais do contador que presta serviços | ○ **PENDÊNCIA C-17** — não confirmei o conteúdo aplicável | ○ |

> **ATENÇÃO — informação vencida circulando no projeto.** O enunciado da missão fala em
> "**ITG 1000 para PME**". Pela convergência apurada, **a ITG 1000 foi revogada pela
> NBC TG 1002**, com vigência nos exercícios iniciados em **1º de janeiro de 2023**, e o
> desenho por porte passou a ser **NBC TG 1002 (micro) · NBC TG 1001 (pequena) ·
> NBC TG 1000 (média)**. Isso não é detalhe acadêmico: **muda qual conjunto de demonstrações
> o sistema tem de produzir por cliente**. Confirmar antes de codar — item **H4**.

## 12. O que muda por porte e por regime

`[ENG]` Esta tabela é o **seletor de perfil** do módulo: cada cliente cadastrado no Lior
carrega um perfil, e o perfil decide obrigações, demonstrações e bloqueios.

| Perfil do cliente | Escrituração contábil | ECD | ECF | Norma contábil aplicável |
|---|---|---|---|---|
| **MEI / pequeno empresário (art. 970)** | Dispensado das exigências do art. 1.179; **não dispensado** do Diário/fichas para registro das operações `[V-SEC]` — ver **C-01** | Não | Não | — |
| **Simples Nacional (ME/EPP)** | Obrigado pela legislação comercial (CC) `[CV]` | **Dispensado**, salvo se distribuir lucros sem retenção acima da base de cálculo diminuída dos tributos `[CV]` | **Dispensado** `[CV]` | NBC TG 1002 ou 1001 |
| **Lucro Presumido** | Escrituração comercial **ou** livro Caixa com toda a movimentação, inclusive bancária (Lei 8.981/95, art. 45, parágrafo único) `[CV]` — mas a **legislação comercial continua exigindo contabilidade e balanço anual** `[CV]` | **Sim**, como regra geral `[CV]` | **Sim** (Bloco P; Q100 se livro Caixa) `[CV]` | NBC TG 1001 ou 1000 |
| **Lucro Real** | Obrigatória, sem alternativa | **Sim** | **Sim** (Blocos L, M, N) `[CV]` | NBC TG 1000 ou conjunto completo |
| **Imunes e isentas** | Obrigadas quando obrigadas a manter escrituração pela legislação comercial `[CV]` | Condicional | **Sim** (Bloco U) `[V-SEC]` | conforme porte |

○ **PENDÊNCIA C-18** — o **limite de receita/contribuições** que dispara a ECD para imunes e
isentas não foi confirmado. Item **H3**.

`[ENG]` **A armadilha do Lucro Presumido, e ela é comercial antes de ser técnica:** a
faculdade do livro Caixa é *tributária*. A obrigação de contabilidade é *comercial*, e a
**distribuição de lucro isento acima da presunção depende de escrituração contábil que a
comprove** — matéria já judicializada no CARF `[V-SEC]`. Um sistema que oferece "modo livro
Caixa" sem alertar isso está ajudando o cliente a construir um passivo. **O módulo deve
emitir o alerta, não escolher pelo cliente.**

---
---
---

# PARTE V — O QUE UM ESCRITÓRIO USA TODO DIA

`[ENG]` Esta parte é quase inteiramente engenharia e processo. Ela existe porque é onde o
sistema próprio costuma decepcionar: a norma foi atendida, a ECD saiu, e **a operação
continua sendo planilha**.

## 13. As sete rotinas que decidem se o módulo é usável

| # | Rotina | O que precisa existir | Erro típico de sistema próprio |
|---|---|---|---|
| 1 | **Importação de extrato bancário** | OFX e CNAB 240 retorno; `FITID`/hash como idempotência; detecção de sobreposição de períodos | Reimportar o mesmo mês e duplicar tudo |
| 2 | **Conciliação** | motor de casamento em 5 níveis (§10.2); tela de duas colunas; conciliação parcial; desfazer | Só casar 1:1 por valor exato — que resolve 60% e deixa o pior |
| 3 | **Importação de XML de notas** | NF-e (55), NFC-e (65), CT-e; **grão de item**; casamento com o `documento_item` do Masor | Importar por total de nota e perder CFOP/CST |
| 4 | **NFS-e (serviços)** | ○ **PENDÊNCIA C-19** — padrão municipal fragmentado; a NFS-e de padrão nacional muda o quadro, mas cobertura por município não confirmada | Assumir que "XML de nota" resolve serviços. Não resolve |
| 5 | **Lançamentos recorrentes** | template + vigência + geração automática no fechamento + revisão antes de efetivar | Gerar direto como efetivado, sem conferência |
| 6 | **Rateio** | por centro de custo, por percentual fixo ou por base (receita, headcount, área); versionado | Rateio hardcoded numa planilha do analista |
| 7 | **Relatórios gerenciais para o cliente** | DRE comparativa, DRE por centro de custo, fluxo de caixa, indicadores, exportação | Entregar balancete e chamar de relatório gerencial |

`[ENG]` **O item 7 é o único da lista que é diferencial de verdade.** Os seis primeiros são
higiene — o cliente não paga a mais por eles, mas vai embora se faltarem. O item 7 é onde a
contabilidade consultiva da G41 encosta no software, e é o único que justifica construir em
vez de comprar.

## 14. Fechamento mensal com checklist — o checklist como objeto, não como cultura

`[ENG]` `ctb_fechamento_checklist` e `ctb_fechamento_item`: por cliente e competência, com
responsável, evidência anexada, status e **flag de bloqueio**. Item bloqueador aberto ⇒
competência não fecha. É o mesmo mecanismo de portão usado no faseamento do `07`.

**Checklist inicial proposto** (bloqueadores em negrito):

| # | Item | Evidência |
|---|---|---|
| 1 | **Todos os extratos importados e conciliados** | saldo contábil = saldo do extrato |
| 2 | **Nenhum evento em quarentena** (sem regra ou sem de-para) | fila vazia |
| 3 | **Folha contabilizada e as três conferências de §8.2 batendo** | relatório de conferência |
| 4 | **Provisões de férias e 13º lançadas e baixadas corretamente** | movimentação da conta de provisão |
| 5 | Notas de entrada e saída importadas e contabilizadas | contagem × EFD |
| 6 | **Impostos a recolher × guias emitidas** | conciliação de guias |
| 7 | **Apuração fiscal × contábil** (ICMS, PIS/COFINS) | prova real de §9.2 |
| 8 | Estoque e CMV movimentados | razão de estoque |
| 9 | Depreciação e amortização do mês | lote recorrente |
| 10 | Contas a pagar e a receber × razão | conciliação de subsistema |
| 11 | **Nenhum saldo impossível** — caixa credor, banco credor sem conta garantida, estoque negativo | relatório de anomalias |
| 12 | **Contas transitórias zeradas** | razão das transitórias |
| 13 | Partidas sem histórico ou com histórico livre não justificado | relatório de exceção |
| 14 | Balancete revisado e assinado pelo responsável técnico | registro do revisor |

`[ENG]` Os itens **11 e 12** merecem destaque: **caixa credor** e **transitória com saldo**
são os dois sintomas que denunciam contabilidade mal feita a qualquer auditor em trinta
segundos. Um sistema que os detecta sozinho, todo mês, entrega mais valor do que qualquer
tela bonita.

---
---

# PARTE VI — DIMENSIONAMENTO

## 15. Estimativa de esforço — **é estimativa**, e a base está declarada

> **Rótulo obrigatório:** os números abaixo são **estimativa**, não medição. Nenhuma linha
> deste módulo foi escrita. A estimativa vale como **ordem de grandeza para decisão**, e
> perde validade se a base mudar.

**Base do cálculo, em três apoios:**

1. **Superfície do leiaute como proxy de esforço.** Contagem de blocos e registros da ECD e
   da ECF, mais as regras de consistência cruzada observadas em bases de fornecedores.
2. **Analogia interna com o método já usado em `05-construir-x-comprar-e-fornecedores.md`**,
   que estimou a folha em 40–75 pessoa-mês pelo mesmo tipo de decomposição. Manter o método
   é o que torna os dois números comparáveis.
3. **Regra das duas temporadas.** Obrigação **anual** só se estabiliza depois de duas
   entregas reais. Isso não aparece como pessoa-mês de código — aparece como **dois anos de
   calendário** antes de confiar no gerador (§5, motivo 4).

Unidade: **pessoa-mês** de um desenvolvedor sênior que já conhece o domínio contábil.
Não inclui: gestão, design, infraestrutura, suporte, nem o tempo do contador que especifica.

| Bloco | Escopo | Otimista | **Conservador** |
|---|---|---|---|
| **A. Núcleo contábil** | Plano de contas (empresa + referencial + de-para), lançamento/partida com invariantes, lote, razão, balancete, Diário, encerramento de exercício, centro de custo, histórico padronizado | 5 | **8 – 14** |
| **B. Motor de contabilização + folha→contábil** | `ctb_evento_origem`, regras, de-para, quarentena, ciclo de 10 lançamentos de §8.1, as três conferências de §8.2, *parser* do arquivo de integração do Domínio | 3 | **6 – 10** |
| **C. Fiscal→contábil** | Contabilização por item, de-para CFOP/CST, apuração como lançamento, prova real de três pontas | 2 | **4 – 7** |
| **D. Banco e conciliação** | OFX, CNAB 240 retorno, motor de casamento em 5 níveis, tela de conciliação, conciliação de três pontas | 3 | **5 – 8** |
| **E. ECD** | Gerador dos Blocos 0/I/J/9, de-para referencial versionado, I157, Termo de Verificação, laço com o PVA, guarda de arquivo e recibo, **capacidade de gerar leiaute de anos anteriores** | 4 | **7 – 12** |
| **F. ECF** | Blocos J, K, L, M (e-LALUR/e-LACS), N (IRPJ/CSLL), P (presumido), Q (livro Caixa), T/U/W/X/Y; recuperação da ECD; compensação de prejuízo; retificadora em cascata | 8 | **14 – 24** |
| **G. Operação diária** | Recorrentes, rateio, importação de XML, relatórios gerenciais, fechamento com checklist, portal do cliente | 4 | **7 – 12** |
| **H. Migração e ano-sombra** | Carga inicial por importação da ECD anterior, saldos de abertura, execução em paralelo e conciliação com o Domínio | 2 | **4 – 6** |
| | **TOTAL** | **31** | **55 – 93 pessoa-mês** |
| | Manutenção normativa **perpétua** | — | **1,5 – 3 pessoa-mês por ano** |

**Tradução para calendário:** 55–93 pessoa-mês são **4,5 a 8 anos de um desenvolvedor**, ou
**1,5 a 2,5 anos de um time de três** em dedicação integral — e, por causa da regra das duas
temporadas, **o gerador de ECD/ECF só é confiável no terceiro ano**, independentemente de
quantas pessoas trabalhem nele. Dinheiro não compra temporada.

> **O número que dói, e é o ponto desta seção.** Some com o que já está estimado nesta pasta:
>
> | Módulo | Estimativa conservadora | Fonte |
> |---|---|---|
> | Folha (motor + transmissão + cadastros) | **40 – 75** pessoa-mês | `05`, §4 |
> | **Contábil (este documento)** | **55 – 93** pessoa-mês | §15 |
> | Fiscal — geração de EFD ICMS/IPI e EFD-Contribuições, ainda **não estimada** | ○ **PENDÊNCIA C-20** — o Masor faz apuração e prova real, **não gera os arquivos** | `apuracao-prova-real.md` |
> | Honorários, patrimônio/imobilizado, controle de processos e prazos | **não estimados** | — |
> | **Piso do que já está contado** | **95 – 168 pessoa-mês** | |
>
> **Substituir o Domínio por completo não é um projeto: é fundar uma software house.**
> 95–168 pessoa-mês é o **piso**, com dois módulos inteiros ainda fora da conta, e sem
> contar que a **Reforma Tributária (2027–2033) vai consumir a mesma equipe** exatamente
> nessa janela. `11-dominio-incumbente-e-integracao.md` §5.3 já havia classificado esse
> cenário como risco existencial; **esta seção é a aritmética que sustenta aquela conclusão.**

## 16. Comparação honesta com o mercado

`[CV]` O mercado de sistema contábil para escritório é maduro e povoado: **Domínio (Thomson
Reuters), Alterdata, Questor, Contmatic, Nasajon, Prosoft, Fortes, Calima, Mastermaq, SCI,
Netspeed, PH Software, Athenas, Sage/Folhamatic, Dexio**, entre outros. Vários publicam base
de conhecimento aberta sobre ECD, ECF e registro I157 — o que, de passagem, foi a principal
fonte deste documento.

`[CV]` **A integração fiscal↔contábil já é padrão de fábrica** nos concorrentes: a Alterdata
documenta integração **em tempo real**, sem exportação manual; a Nasajon vende folha, escrita
fiscal e contabilidade no mesmo ambiente; o Domínio roda Contabilidade, Fiscal, Folha,
eSocial, DCTFWeb, EFD-Contribuições e SPED Fiscal juntos.

`[CV]` **Open source ajuda menos aqui do que no fiscal, mas ajuda mais do que na folha.**
Existem bibliotecas para gerar arquivos do SPED — `sped-br/python-sped` e
`sped-br/python-sped-ecd` (Python, **o principal está arquivado pelo autor**, com a
justificativa de que "o SPED necessita de atualizações constantes"), `nfephp-org/sped-ecd` e
`nfephp-org/sped-ecf` (PHP), `SsInformatica/SPEDBr` e `AOPack/SPEDBr.NET` (.NET, este último
migrado para outro repositório), e `akretion/sped-extractor` (extração de leiautes para o
Odoo). ○ **PENDÊNCIA C-21** — **nenhuma** em TypeScript/JavaScript foi localizada, e
manutenção, licença e cobertura de leiaute vigente de cada uma **não foram verificadas**.

`[ENG]` **O que o repositório arquivado ensina é mais valioso que o código dele:** o autor
desistiu porque o SPED exige atualização constante. É a mesma conclusão do `05` sobre a
folha, e é a natureza do custo — **não é o build, é o assinar embaixo para sempre.**

### 16.1 Commodity x diferencial

| Peça | Classificação | Por quê |
|---|---|---|
| Plano de contas, lançamento, razão, balancete, Diário | **Commodity** | Todos têm. Ninguém contrata a G41 por causa disso |
| Geração de ECD e ECF | **Commodity cara** | Todos têm; construir é caro; errar gera multa. Pior combinação possível |
| De-para referencial | **Commodity operacional** | O trabalho é humano; o software só organiza |
| Importação de OFX/CNAB e XML | **Commodity** | Existe há vinte anos |
| Conciliação bancária **assistida**, com aprendizado por cliente | **Diferencial fraco** | Existe no mercado, mas mal feito. Dá para ser melhor |
| Fechamento com checklist bloqueante e detecção de anomalias | **Diferencial** | Raro, e é o que reduz retrabalho do escritório |
| **Prova real cruzada folha × fiscal × contábil, automática, por competência** | **Diferencial forte** | Os sistemas tradicionais fazem os três módulos *conviverem*; quase nenhum os faz *se auditarem* |
| Relatório gerencial e leitura consultiva para o cliente final | **Diferencial forte** | É o produto que a G41 vende. É a camada com marca |
| Portal do cliente com dado próprio | **Diferencial de posicionamento** | Ver `11` §4.1: o Domínio tem portal — **com a marca dele** |

> **A conclusão que decorre da tabela, e ela é desconfortável:** tudo que é **obrigatório**
> no módulo contábil é **commodity**, e tudo que é **diferencial** fica **em cima** do
> obrigatório. Construir a base inteira para chegar ao diferencial é pagar 80% do custo pelo
> que ninguém escolhe. **A pergunta certa não é "como construímos o contábil?" — é "dá para
> ter o diferencial sem ser dono do obrigatório?"** Parte VII responde.

---
---
---

# PARTE VII — SEQUENCIAMENTO E A UNIDADE SEGURA DE MIGRAÇÃO

## 17. A restrição do eSocial vale para o contábil e para o fiscal? Não do mesmo jeito

A restrição já identificada em `11-dominio-incumbente-e-integracao.md` §3 é: **só pode haver
uma fonte da verdade do eSocial por empregador**, o que impede dividir a folha de um mesmo
cliente entre dois sistemas. A pergunta da missão é se o mesmo vale para os outros dois.

A resposta é **não, e a diferença é de natureza, não de grau**:

| | **Folha / eSocial** | **Contábil / ECD-ECF** | **Fiscal / EFD** |
|---|---|---|---|
| Cadência da obrigação | **Mensal e viva** — eventos entram no ambiente nacional o ano inteiro | **Anual**, um arquivo por exercício | **Mensal**, arquivo autocontido |
| O que acontece se dois sistemas atuarem | **Duplicidade no ambiente nacional**, com limpeza manual evento a evento e passivo do cliente (`11` §3.2) | Nada durante o ano. Na entrega, o segundo arquivo é **substituto**, e exige Termo de Verificação `[CV]` | Retificação de EFD é rotina |
| Natureza da restrição | **Exclusividade viva** — um único declarante, o tempo todo | **Indivisibilidade temporal** — o Diário do exercício é um livro só | **Encadeamento de saldo** — saldo credor de ICMS e créditos de PIS/COFINS atravessam a competência |
| Pode rodar em sombra? | **Só o cálculo.** A transmissão não tem sombra | **Sim, o ano inteiro, com exposição legal zero** | Sim, mês a mês, barato |
| **Unidade indivisível** | **Empregador (CNPJ), inteiro** | **CNPJ × exercício social** | **CNPJ × competência (mês)** |
| Momento natural de corte | 1º de janeiro (13º, bases anuais, informe de rendimentos) | **1º de janeiro, obrigatoriamente** | Qualquer mês, com saldo de abertura conhecido — mas 1º de janeiro por coerência com a ECF |

### 17.1 A propriedade que só o contábil tem, e ela vale ouro

> **O módulo contábil é o único dos três que admite um ano inteiro de operação em paralelo
> com exposição legal zero.**

Durante o exercício, o contábil **não transmite nada**. A primeira entrega é a ECD, em junho
do ano seguinte. Isso significa que o Lior pode escriturar o ano de 2027 inteiro, ao lado do
Domínio, comparando balancete contra balancete todo mês — e **só em junho de 2028** se decide
de qual sistema sai o arquivo. Se o Lior errar, ninguém fica sabendo além do escritório.

Compare: a folha em sombra prova o cálculo, mas **a transmissão continua sendo um salto sem
rede**. O fiscal em sombra é barato, mas a decisão de quem transmite se repete **todo mês**.

`[ENG]` **Isso inverte a intuição comum.** A leitura natural é "comece pelo mais fácil e
deixe o contábil por último, porque a ECD é anual e assusta". É o contrário: **a cadência
anual, que torna o contábil caro de acertar, é a mesma que o torna seguro de começar.**

### 17.2 A ponte que já existe nos dois sentidos

Confirmado em `11` §2.2 `[CV]`:

- **Domínio Folha → arquivo de integração contábil** (`codigo=4497`, `codigo=3554`), com caso
  de uso declarado de "cálculo da folha em um sistema, contabilidade em outro", validado por
  débito = crédito. **É o caminho para a folha ficar onde está e a contabilidade sair.**
- **Arquivo de lançamentos contábeis → Domínio** (leiaute com separador `|`, leiaute em lote),
  que é como a Omie e outros já entregam. **É o caminho de volta**, se a decisão se reverter.

`[ENG]` Duas pontes, dois sentidos, **reversibilidade preservada**. Este é o critério que o
`11` usou para preferir o cenário (A), e ele se aplica igual aqui.

## 18. A unidade segura de migração

> **UNIDADE SEGURA DE MIGRAÇÃO = UM CNPJ, NA VIRADA DO EXERCÍCIO (1º DE JANEIRO), COM O
> CONJUNTO DE MÓDULOS QUE ESTIVER PRONTO — E NUNCA METADE DE UM MÓDULO.**

Desdobrando, porque cada palavra está fazendo trabalho:

| Elemento | Por quê |
|---|---|
| **Um CNPJ** | A integração é intra-cliente. Migrar "o módulo contábil de toda a carteira" obriga a construir e manter uma ponte Domínio↔Lior para **todos** os clientes ao mesmo tempo, e essa ponte é descartável |
| **Na virada do exercício** | A ECD é indivisível por exercício. Migrar em julho significa gerar um Diário com metade em cada sistema — inviável |
| **Módulos que estiverem prontos** | Migrar o contábil de um cliente **não** exige migrar a folha dele. A ponte de arquivo existe (§17.2) |
| **Nunca metade de um módulo** | Meio módulo obriga a uma ponte permanente e a duas fontes de verdade. É a definição do problema que se queria evitar |

> **Alinhamento com o `00-LEIA-PRIMEIRO.md`.** O sumário executivo já registrou que
> "a unidade segura de migração é o cliente, não o módulo". Este documento **confirma e
> refina**: a unidade é o cliente **na virada do exercício**, e a amarração do contábil é de
> natureza diferente da do eSocial — **indivisibilidade temporal**, não **exclusividade
> viva** (§17). A consequência prática é que **o contábil de um cliente pode migrar sozinho**,
> com folha e fiscal permanecendo no Domínio e alimentando o Lior por arquivo (§17.2). O
> inverso — folha sozinha — carrega o risco de duplicidade descrito em `11` §3.


**Corolário operacional:** a migração é **por coorte de clientes, uma vez por ano**. Isso dá
**uma janela de migração por ano** — o que parece pouco, e é exatamente por isso que o
ano-sombra não é custo extra: **ele cabe dentro da espera pela janela.**

**Ordem das coortes, do mais simples ao mais difícil** `[ENG]`:

| Coorte | Perfil | Por que nessa ordem |
|---|---|---|
| 0 | **O CNPJ da própria G41** | Cliente zero. Se der errado, o prejudicado é quem decidiu |
| 1 | Simples Nacional **sem** obrigação de ECD | Não gera ECD nem ECF. Exercita núcleo, integração e relatórios sem tocar em entrega |
| 2 | Simples Nacional **com** ECD (distribuição de lucros acima do limite) | Estreia a ECD, sem ECF |
| 3 | Lucro Presumido | ECD + ECF Bloco P. Complexidade média |
| 4 | Lucro Real | ECD + ECF Blocos L, M, N — LALUR, LACS, compensação de prejuízo. **O mais difícil, por último** |
| 5 | Imunes e isentas, e qualquer caso com particularidade societária | Casos de exceção só depois de a regra estar provada |

## 19. Ordem de internalização dos três módulos

`[ENG]` **Ordem de construção não é ordem de migração.** Confundir as duas é o erro que faz
projetos como este pararem no meio.

### 19.1 Ordem de construção

| Ordem | Módulo | Razão |
|---|---|---|
| **1º** | **Contábil — núcleo e costura** (blocos A, B, C, D de §15) | É o **consumidor** dos outros dois: nasce provando que folha e fiscal estão certos, e entrega valor (prova real, checklist, relatório gerencial) **antes** de gerar qualquer arquivo. Exposição legal zero durante a construção |
| **2º** | **ECD** (bloco E) | Só depois de pelo menos **um ano-sombra** com balancete batendo mês a mês |
| **3º** | **ECF** (bloco F) | Depende da ECD e é o maior item isolado do módulo. Não se começa antes de a ECD ter sobrevivido a **uma temporada real** |
| **4º** | **Fiscal — geração das EFD** | O Masor hoje faz apuração e prova real, **não gera os arquivos** (C-20). E a Reforma disputa a mesma equipe |
| **5º** | **Folha** | Último, ou nunca. `11` §9 recomenda **não construir agora**, e nada neste documento contradiz isso |

### 19.2 Ordem de migração

Diferente, e mais lenta: **ninguém sai do Domínio por completo enquanto a folha estiver lá.**
O que se migra é o **contábil de um cliente por vez**, na virada do ano, mantendo folha e
fiscal onde estão e alimentando o Lior pelo arquivo de integração.

```
 2026 (agora)  │ construir A+B+C+D · ano-sombra do CNPJ da G41
 2027          │ ECD do CNPJ da G41 sai do Lior · ano-sombra da coorte 1
 2028          │ coortes 1 e 2 migram o contábil · construir ECF
 2029+         │ coortes 3 e 4 · reavaliar fiscal · folha continua no Domínio
```

○ Este calendário é **`[ENG]` ilustrativo do encadeamento**, não compromisso de datas.

### 19.3 O que precisa ser dito ao dono do projeto

**Três desafios, na ordem de importância:**

**1. "Substituir o Domínio por completo" e "não construir folha" são incompatíveis.**
`11-dominio-incumbente-e-integracao.md` recomenda **não construir folha** e classifica a
substituição total como risco existencial. Este documento chega ao mesmo lugar pela
aritmética (§15): o piso é 95–168 pessoa-mês, com dois módulos ainda fora da conta. **As duas
posições não podem coexistir.** Ou a substituição total volta a ser *direção de longo prazo*
— e não plano —, ou a decisão de não construir folha precisa ser reaberta com o número na
mesa. Recomendo a primeira.

**2. Internalizar o contábil não corta a conta do Domínio — compra o diferencial.**
Se folha e fiscal continuam no Domínio, a mensalidade continua. O ganho não é economia: é
**propriedade do dado contábil, da conciliação e do relatório que a G41 vende**. Se a
justificativa apresentada for "economizar com o Domínio", ela não se sustenta nesta fase, e é
melhor descobrir isso agora do que no meio da construção.

**3. A janela de construção colide com a Reforma Tributária.**
2027 encerra PIS/COFINS e o monofásico; 2029–2032 é a transição ICMS→IBS (`CLAUDE.md`). O
mesmo time. **Se o contábil entra agora, alguma coisa do Masor sai da fila explicitamente** —
é o mesmo alerta que o `00-LEIA-PRIMEIRO.md` §6 já fez sobre a folha, e ele não foi endereçado.

---
---

# PARTE VIII — RISCOS DA TROCA DE SISTEMA CONTÁBIL

## 20. O que dá errado, e o que fazer antes

| # | Risco | Por que acontece | Mitigação `[ENG]` |
|---|---|---|---|
| **R1** | **Perder o histórico ao encerrar o contrato** | O acesso ao Domínio termina com o contrato. Razão, balancete, Diário e arquivos ficam lá dentro. O banco é Sybase e os termos proíbem engenharia reversa (`11` §2.3) | **Exportar tudo ANTES de qualquer rescisão**: ECD e ECF transmitidas de todos os clientes e todos os anos, balancetes, razões, planos de contas. Guardar com hash e data. Isto é tarefa de meses, não de semanas |
| **R2** | **Saldos de abertura errados** | Migra-se o saldo, não a memória. Um saldo errado envenena o exercício inteiro e só aparece no fechamento | **Importar a ECD do exercício anterior** como carga inicial — o próprio arquivo transmitido é o artefato de migração, e os sistemas do mercado já fazem isso `[CV]`. Conferir conta a conta, não por total |
| **R3** | **Troca de plano de contas sem I157** | Sistema novo, plano novo, saldos não amarram com o ano anterior | Gerar o **registro I157** (transferência de saldos de plano anterior) `[CV]`, e tratar o de-para plano-antigo→plano-novo como dado versionado com aprovação |
| **R4** | **Comparativo do exercício anterior sem lastro** | O BP e a DRE exigem a coluna do ano anterior. Migrando só saldos, você tem a coluna e **não tem o razão por trás dela**. O cliente pergunta "por que essa linha mudou" e não há resposta | Decidir explicitamente: (a) migrar razão do ano anterior, ou (b) manter o sistema antigo em leitura por N anos. **Não existe opção (c)** |
| **R5** | **Não conseguir substituir uma escrituração antiga** | Substituir a ECD de 2024 exige gerar o arquivo **no leiaute de 2024**, não no atual (§4.2) | Ou o gerador suporta leiautes históricos (custo real, incluído no bloco E de §15), **ou o Domínio fica contratado em modo leitura por anos**. Orçar isso desde já — é a razão pela qual escritórios pagam duas licenças |
| **R6** | **Duas verdades para o mesmo cliente** | Alguém lança no sistema antigo depois do corte. Ninguém percebe até o balancete divergir | Corte com **congelamento formal**: o cliente migrado é bloqueado no sistema de origem, com evidência. Mesmo rito do desligamento do eSocial descrito em `11` §3.3 |
| **R7** | **Temporada concentrando todo o risco** | ECD em junho e ECF em julho, para a carteira inteira, com 30 dias de janela | Migrar por coorte pequena (§18); nunca estrear gerador com mais de 3 clientes; ter plano B contratado (o Domínio ainda ativo naquele ano) |
| **R8** | **Responsabilidade técnica pessoal do contador** | Quem assina a ECD é o profissional, com o CRC dele. Uma flag "PROVISÓRIO" **não protege uma assinatura** | **Bloqueio duro, não aviso:** o sistema recusa gerar arquivo de escrituração com qualquer pendência aberta, evento em quarentena ou conferência de §8.2 sem bater. Este é o ponto onde o padrão anti-invenção do projeto deixa de ser filosofia e vira *constraint* |
| **R9** | **Cascata de retificação subestimada** | ECD substituta que altere saldos recuperados **obriga ECF retificadora** `[CV]` | Modelar a dependência como grafo e avisar antes de o usuário confirmar a substituição |
| **R10** | **Sigilo e LGPD** | Menos crítico que na folha, mas o módulo concentra extrato bancário, faturamento e resultado de todos os clientes | Herdar integralmente os controles do `06-riscos-lgpd-e-dados-vivos.md`: RLS `FORCE`, auditoria de leitura, whitelist do que pode ir para IA |
| **R11** | **A Reforma Tributária chegando no meio** | 2027 e 2029–2032 alteram tributos que a ECF apura e a contabilidade registra | Não congelar o plano de contas referencial nem a estrutura da ECF como constante. Mesmo princípio de `masor_tax_states` |

`[ENG]` **R1, R4 e R5 formam um bloco, e é o bloco que ninguém orça:** os três dizem a mesma
coisa por caminhos diferentes — **você não sai do sistema antigo no dia em que para de usá-lo.
Você sai anos depois.** Quem planeja a substituição sem contar esses anos de licença
sobreposta está subestimando o custo total, não o cronograma.

---
---
---

# PARTE IX — MODELO DE DADOS PROPOSTO

`[ENG]` Prefixo `ctb_`, no mesmo Supabase, seguindo a convenção já em uso (`masor_`, `folha_`)
e o princípio estruturante do `07-arquitetura-modulo-lior.md`: **todo parâmetro é registro
versionado com vigência e selo de verificação, nunca constante no código.**

## 21. Tabelas

### 21.1 Estrutura contábil

| Tabela | Papel |
|---|---|
| `ctb_plano_conta` | Conta do plano da empresa: `cliente_id`, código, descrição, natureza, tipo (`sintetica`/`analitica`), conta-pai, `vigencia_inicio/fim`, `nivel` |
| `ctb_conta_referencial` | **Snapshot versionado** do plano referencial da RFB, por ano-calendário e tipo de entidade. Nunca embutido no código — mesma escolha de `masor_ncm_rules` |
| `ctb_depara_referencial` | `cliente_id` + `conta_id` + `centro_custo_id` + `conta_referencial_id` + ano-calendário + `aprovado_por`. Alimenta o **I051** da ECD e o **J051/K155** da ECF |
| `ctb_depara_plano_anterior` | De-para plano antigo → plano novo. Alimenta o **I157**. É a tabela da migração |
| `ctb_centro_custo` | `cliente_id`, código, descrição, vigência |
| `ctb_historico_padrao` | Código, texto com placeholders tipados, uso obrigatório ou livre |

### 21.2 Movimento

| Tabela | Papel |
|---|---|
| `ctb_competencia` | `cliente_id`, ano, mês, `status` (`aberta`/`em_fechamento`/`fechada`/`reaberta`), datas, quem fechou. **É o cadeado de tudo** |
| `ctb_exercicio` | Exercício social, status, data do encerramento, lote de encerramento |
| `ctb_lote` | Agrupamento de lançamentos: origem, status (`rascunho`/`conferido`/`efetivado`), autor |
| `ctb_lancamento` | Data, competência, lote, histórico, `origem_evento_id`, `estorno_de_id`. **Nunca editado nem apagado depois de efetivado** |
| `ctb_partida` | `lancamento_id`, `conta_id`, `centro_custo_id`, `natureza` (D/C), valor. Invariante `soma(D) = soma(C)` no banco |
| `ctb_saldo` | Saldo por conta, centro de custo e competência — materializado, com recomputação auditável. Alimenta **I150/I155** e o balancete |

### 21.3 Integração

| Tabela | Papel |
|---|---|
| `ctb_evento_origem` | §7.1 — o fato, com `hash_idempotencia` único |
| `ctb_regra_contabilizacao` | §7.2 — o template, versionado por vigência e aprovado |
| `ctb_depara_conta` | §7.3 — chave de origem → conta. **Sem entrada, o evento vai para quarentena** |
| `ctb_extrato_conta` | Conta bancária do cliente: banco, agência, conta, moeda |
| `ctb_extrato_linha` | Linha do extrato: data, valor, descrição, documento, `fitid`, `hash`, `status_conciliacao` |
| `ctb_conciliacao` | Casamento N:M entre `ctb_extrato_linha` e `ctb_lancamento`, com nível de confiança, quem confirmou e quando |

### 21.4 Obrigações e controle

| Tabela | Papel |
|---|---|
| `ctb_escrituracao` | Uma linha por ECD/ECF: tipo, exercício, leiaute, situação, **arquivo gerado**, hash, recibo, signatários, se é original ou substituta, `substitui_id`, Termo de Verificação |
| `ctb_fechamento_checklist` / `ctb_fechamento_item` | §14 — com `bloqueador boolean` |
| `ctb_pendencia` | Toda pendência do módulo, ligada à origem e à tarefa criada no Kanban G41 (`CLAUDE.md`, regra 3) |
| `ctb_anomalia` | Caixa credor, transitória com saldo, partida sem histórico, conta fora de vigência — detecção automática, no fechamento |

## 22. As travas que precisam viver no banco, não na aplicação

`[ENG]` Repetindo §1.2 como especificação executável, porque é o que separa este desenho de
um CRUD:

1. `soma(débitos) = soma(créditos)` por lançamento — *constraint* diferida.
2. Partida só em conta **analítica** e **vigente na data** do lançamento.
3. Competência `fechada` recusa qualquer escrita — *trigger*.
4. `UPDATE`/`DELETE` em lançamento efetivado: negado. Só estorno.
5. `UNIQUE (cliente_id, modulo, tipo_evento, hash_idempotencia)` em `ctb_evento_origem`.
6. RLS por `cliente_id`, com `FORCE`, e teste de fuga de tenant no CI (herdado do `07` §4).
7. **`ctb_escrituracao` não aceita `INSERT` de arquivo gerado se houver pendência bloqueadora
   aberta** — é o **R8** virando código.

---
---

# PARTE X — PENDÊNCIAS

## 23. Lista numerada

Nenhum item abaixo pode virar código, tela, calendário de cliente, cláusula de contrato ou
número de proposta antes de ser lido na fonte primária.

| # | Pendência | Impacto se ficar errado | Fecha com |
|---|---|---|---|
| **C-01** | Extensão exata da dispensa do **pequeno empresário** (CC art. 1.179, §2º) e se ele mantém a obrigação do Diário | Cobrar ou não cobrar escrituração de uma classe inteira de clientes | H3 |
| **C-02** | **Partidas dobradas** como método obrigatório — item da ITG 2000 (R1) não conferido | Fundamento do invariante nº 1 do banco | H4 |
| **C-03** | Existe norma que torne o **balancete mensal** obrigatório por si só? | Se é entrega obrigatória ou serviço | H4 |
| **C-04** | Como os **lançamentos de encerramento** aparecem no Bloco I da ECD | Desenho do encerramento de exercício | H1 |
| **C-05** | **Leiaute da ECD vigente** para o AC 2025/2026 | Estrutura inteira do gerador | H1 |
| **C-06** | **Prazo da ECD**: "último dia útil de maio" (redação original da IN 2.003/2021) × "de junho" (IN 2.142/2023). Adotei junho por convergência | Calendário de obrigações do escritório e multa | H3 |
| **C-07** | **Lista completa e conferida dos registros** da ECD. Só sete do Bloco I e dois do Bloco J foram confirmados | Estimativa do bloco E de §15 e o gerador inteiro | H1 |
| **C-08** | Conteúdo dos **Blocos C e E da ECF** (recuperação da ECD e do exercício anterior) | Encadeamento entre as duas escriturações | H2 |
| **C-09** | Composição exata dos **Blocos T, U, V, W, X, Y** da ECF | Cobertura de imunes/isentas e arbitrado | H2 |
| **C-10** | **Combinação de certificados** aceita na assinatura da ECD/ECF, número de signatários e uso de procuração | Desenho do cofre de certificados do Lior | H1 |
| **C-11** | **Existe API pública de transmissão** de ECD/ECF, ou o desfecho é sempre PVA + Receitanet? | Muda a arquitetura da entrega e a estimativa do bloco E. **É o C-11 o equivalente contábil do F1 da folha** | H1 |
| **C-12** | Regra dos **15 dias** aplicada a férias; terminologia provisão × passivo estimado (NBC TG 25 × 33) | Nomenclatura do plano de contas e nota explicativa | H5, H6 |
| **C-13** | **Leiaute campo a campo** do arquivo de integração contábil do Domínio Folha ("Formato 19") | Sem ele não se escreve o *parser* — é o portão do bloco B de §15 | `11` §9.1 |
| **C-14** | Viabilidade real de **Open Finance** para extrato de PJ de cliente de escritório | Canal de entrada do banco | H7 |
| **C-15** | **Versão vigente do CNAB 240** em 2026 (a mais recente localizada é 10.11, de 2023) | *Parser* de retorno bancário | H7 |
| **C-16** | Faixas exatas de receita da **NBC TG 1001 e 1002** e a redação da revogação da ITG 1000 | Seletor de perfil e conjunto de demonstrações por cliente | H4 |
| **C-17** | Conteúdo aplicável das **NBC PG 100/200/300** ao contador que presta serviço | Registro de responsabilidade técnica no sistema | H4 |
| **C-18** | **Limite** que dispara a ECD para **imunes e isentas** | Obrigatoriedade de uma carteira inteira de terceiro setor | H3 |
| **C-19** | Cobertura real da **NFS-e de padrão nacional** por município | Escopo da importação de notas de serviço | H8 |
| **C-20** | Esforço de **gerar EFD ICMS/IPI e EFD-Contribuições** — nunca estimado. O Masor apura, **não gera** | Deixa um módulo inteiro fora do total de §15 | interno |
| **C-21** | Manutenção, licença e cobertura de leiaute das **bibliotecas open source de SPED**; nenhuma em TypeScript localizada | Decisão de reuso × construir do zero | GitHub, verificável |

---

# PARTE XI — BLOCO H DA CHECKLIST DE FONTES

`[ENG]` Para acrescentar a `FONTES-A-BAIXAR.md`, no mesmo padrão dos blocos A–G. Baixar da
origem, arquivar em `docs/folha/fontes/` com nome, data e hash SHA-256.

| # | Documento | Fecha | Prioridade |
|---|---|---|---|
| **H1** | **Manual de Orientação do Leiaute da ECD**, versão vigente para o AC 2025/2026 (portal SPED → ECD) | C-04, C-05, C-07, C-10, C-11 | **BLOQUEADOR do gerador de ECD** |
| **H2** | **Manual de Orientação do Leiaute 12 da ECF** + tabelas dinâmicas (portal SPED → ECF) | C-08, C-09 | **BLOQUEADOR do gerador de ECF** |
| **H3** | **IN RFB 2.003/2021** (com a redação da **IN RFB 2.142/2023**) e **IN RFB 2.004/2021** | C-01, C-06, C-18 | **BLOQUEADOR** de calendário e de tela |
| **H4** | **ITG 2000 (R1)**, **NBC TG 1000**, **NBC TG 1001**, **NBC TG 1002** e a resolução que revoga a ITG 1000 (site do CFC) | C-02, C-03, C-16, C-17 | **BLOQUEADOR** do seletor de perfil |
| **H5** | **NBC TG 33 / CPC 33 (R1)** — Benefícios a Empregados | C-12 | Alta |
| **H6** | **NBC TG 25** — Provisões, Passivos Contingentes e Ativos Contingentes | C-12 | Média |
| **H7** | **Leiaute CNAB 240 FEBRABAN** na versão vigente + especificação **OFX** | C-14, C-15 | Alta (bloco D de §15) |
| **H8** | Documentação da **NFS-e de padrão nacional** e a lista de municípios aderentes | C-19 | Média |
| **H9** | **Plano de contas referencial da RFB** — tabelas dinâmicas por ano-calendário e tipo de entidade | Popular `ctb_conta_referencial` | **BLOQUEADOR do de-para** |
| **H10** | **Código Civil, arts. 1.179 a 1.195**; **Decreto-Lei 9.295/1946**; **MP 2.158-35, art. 57**; **DL 1.598/77, art. 8º-A**; **Lei 8.981/95, art. 45** | Fundamento normativo e valores de multa | Alta |
| **H11** | **Decreto 9.555/2018** e **IN DREI 11/2020** | Autenticação e Termo de Verificação para Substituição | Alta |

> **Contradição a resolver neste bloco (padrão dos blocos A e F):** **prazo da ECD — maio ou
> junho?** Fecha com H3. Enquanto não fechar, **nenhum calendário de obrigações da G41 deve
> exibir a data**, em nenhuma tela e em nenhum comunicado a cliente.

---

# PARTE XII — FONTES

> **Todas acessadas em 30/08/2026, por busca.** Nenhuma origem oficial (`*.gov.br`,
> `cfc.org.br`) pôde ser aberta — ver §0.1. As URLs abaixo são o **rastro do que foi lido**,
> não o lastro normativo. O lastro está no Bloco H, e ainda não foi obtido.

### ECD — obrigatoriedade, prazo, blocos e registros
- Manual de Orientação do Leiaute 9 da ECD (PDF oficial, **indexado, não aberto**) — http://sped.rfb.gov.br/estatico/2D/9C01A0E619B48BAB27486D63FF9E4E750025D0/Manual_de_Orienta%C3%A7%C3%A3o_da_ECD_Leiaute9_2023_12_21.pdf
- ECD — modificações de regra e da chave do registro I051 (**indexado, não aberto**) — http://sped.rfb.gov.br/pagina/show/5722
- Bloco I da ECD, guia — https://www.e-auditoria.com.br/blog/bloco-i-ecd-um-guia-completo/
- Registro I051 — plano de contas referencial — https://www.vriconsulting.com.br/guias/guiasIndex.php?idGuia=670
- Manual de Orientação da ECD, capítulos 3 / Bloco I e Bloco J — https://taxshape.com/especial-sped/manual-de-orientacao-da-ecd-layout-7-sped-online/capitulo-3-e-bloco-i-manual-de-orientacao-layout-7-ecd/ · https://taxshape.com/especial-sped/manual-de-orientacao-da-ecd-layout-7-sped-online/1788-2/
- ECD 2026 — prazo, quem é obrigado, como entregar — https://www.dattos.com.br/en/blog/ecd
- ECD 2026 — prazo (30/06/2026, IN RFB 2.142/2023) — https://www.ozai.com.br/prazo-entrega-ecd-2026/ · https://iob.com.br/escrituracao-contabil-digital/
- ECD e ECF 2026 — prazos e obrigatoriedade — https://www.blog.aciescontabilidade.com.br/post/ecd-ecf-2026-prazo-junho-julho-obrigatoriedade · https://www.cigam.com.br/wiki/index.php?title=COMUNICADO_CIGAM_013%2F26_-_ECD_e_ECF_2026
- IN RFB 2.003/2021, texto — https://www.legisweb.com.br/legislacao/?id=408129 · https://www.normaslegais.com.br/legislacao/instrucao-normativa-rfb-2003-2021.htm
- ECD para empresas do Simples Nacional — https://pedroreisconsultoria.com.br/ecd-para-empresas-do-simples-nacional-base-de-conhecimento/
- ECD para Lucro Presumido — https://tributodevido.com.br/portal/ecd-para-empresas-do-lucro-presumido/

### ECD — assinatura, autenticação, retificação e multa
- Retificação e substituição de livros autenticados; Termo de Verificação; Decreto 9.555/2018 e IN DREI 11/2020 — https://www.contabeis.com.br/noticias/48112/ecd-entenda-como-funciona-a-retificacao-e-substituicao-de-livros-autenticados/ · https://blog.econeteditora.com.br/erros-na-ecd-retificacao-ou-substituicao-de-livros-autenticados/
- Multas pela falta ou atraso da ECD — https://www.crcsc.org.br/noticia/view/44069 · https://www.rfaa.com.br/multas-por-atraso-ou-falta-de-entrega-da-ecd-das-pessoas-juridicas/
- PVA — gerar, validar, assinar e transmitir; versão de PVA recusada na transmissão — https://www.e-auditoria.com.br/blog/download-ecd-como-gerar-revisar-e-transmitir-o-sped-ecd-com-seguranca/ · https://makrosystem.com.br/blog/pva-o-que-e-e-como-funciona-o-programa-validador-de-assinatura/ · https://www.cigam.com.br/wiki/index.php?title=Ao_transmitir_a_ECD_j%C3%A1_validada_ocorre_:_A_Escritura%C3%A7%C3%A3o_n%C3%A3o_ser%C3%A1_transmitida._A_vers%C3%A3o_do_PVA_utilizada_para_transmitir_o_arquivo_de_escritura%C3%A7%C3%A3o_n%C3%A3o_%C3%A9_mais_v%C3%A1lida.

### ECF — obrigatoriedade, blocos, leiaute 12 e multa
- IN RFB 2.004/2021, texto — https://www.normaslegais.com.br/legislacao/instrucao-normativa-rfb-2004-2021.htm · https://www.legisweb.com.br/legislacao/?id=408117
- ECF — blocos e registros — https://aprendo.iob.com.br/ajudaonline/artigo.aspx?artigo=13457
- ECF 2026 — leiaute 12, prazos, blocos — https://escolasuperioresn.com.br/ecf-2026-leiaute-12-prazos-blocos-mudancas/ · https://www.totvs.com/blog/fiscal-clientes/ecf-receita-federal-publica-versao-12-0-0-e-atualiza-manual-com-leiaute-12/
- Tabelas dinâmicas da ECF (leiaute 12) — https://taxcel.com.br/tabelas-ecf
- ECF — quem entrega, dispensas e multas — https://blog.econeteditora.com.br/ecf-2026-quem-deve-entregar-prazo-dispensas-e-multas/ · https://www.sinfacsp.com.br/conteudo/entrega-da-ecf-com-atraso-inexatidao-ou-omissao-gera-multas-conheca-os-valores-e-evite-as-penalidades

### Plano de contas referencial, de-para e troca de plano/sistema
- Erro K155 — J050 analítica com J051 filho ligando ao referencial — https://autoatendimento.contmatic.com.br/hc/pt-br/articles/36522853686419-Erro-no-registro-K155-A-conta-cont%C3%A1bil-constante-neste-registro-deve-existir-no-registro-J050-como-anal%C3%ADtica-e-deve-haver-um-registro-J051-filho-que-vincula-a-conta-cont%C3%A1bil-e-centro-de-custo-constantes-neste-registro-a-um-referencial · https://suporte.senior.com.br/hc/pt-br/articles/4408638968340-ERP-SPED-ECF-Conta-n%C3%A3o-%C3%A9-anal%C3%ADtica-Esta-conta-e-centro-de-custo-devem-estar-cadastradas-no-plano-de-contas-J050-J051-e-ser-anal%C3%ADtica
- Registro I157 — transferência de saldos de plano anterior, incluindo troca de sistema — https://ajuda.alterdata.com.br/bdcc/sped-ecd-tudo-que-voce-precisa-saber-sobre-o-registro-i157-troca-de-plano-de-contas-60457774.html · https://ajuda.omie.com.br/pt-BR/articles/6142034-sped-ecd-gerando-o-registro-i157-sobre-o-relacionamento-do-plano-de-contas-atual-com-o-plano-de-contas-anterior · https://ajuda.fortestecnologia.com.br/kb/pt-br/article/120603/sped-contabil-transferencia-de-saldos-de-plano-de-contas-anterio · https://autoatendimento.contmatic.com.br/hc/pt-br/articles/36080910781459-Cont%C3%A1bil-Configura%C3%A7%C3%A3o-do-registro-I157-transfer%C3%AAncia-de-saldos-de-plano-de-contas-anterior
- Importar plano de contas com base na ECD anterior (Domínio) — https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=2631

### Normas contábeis (CFC) e Código Civil
- ITG 2000 (R1) — Escrituração Contábil — https://www.normaslegais.com.br/legislacao/itg-2000-r1-escrituracao-contabil.htm · https://cosif.com.br/mostra.asp?arquivo=nbc-itg-2000-r1
- NBC TG 1001 e NBC TG 1002; revogação da ITG 1000 — https://online.crcsp.org.br/portal/noticias/noticia.asp?c=5869 · https://www3.crcpr.org.br/crcpr/noticias/micro-e-pequenas-empresas-terao-novas-normas-de-contabilidade-a-partir-de-1-de-janeiro · https://www.comunidadecontabilbrasil.com/contabil/post/revogacao-itg-1000-e-novos-nbc-tg-1001-e-1002---pequenas-e-micro-empresas-Vp58ZY4J227hr59
- ITG 1000 — Resolução CFC 1.418/2012 — https://www.legisweb.com.br/noticia/?id=7015 · https://www.legisweb.com.br/legislacao/?id=440233
- Código Civil, arts. 1.179, 1.180, 1.184 — escrituração e Diário — https://www.jusbrasil.com.br/topicos/10656770/artigo-1179-da-lei-n-10406-de-10-de-janeiro-de-2002 · https://lcrcontadores.com.br/boletim/obrigatoriedade-de-escrituracao-contabil-213 · https://www.crcsc.org.br/noticia/view/41643
- Decreto-Lei 9.295/1946 e responsabilidade do contabilista — https://www.jusbrasil.com.br/topicos/12059750/artigo-24-do-decreto-lei-n-9295-de-27-de-maio-de-1946 · https://www.contabeis.com.br/artigos/277/a-responsabilidade-do-contabilista-conforme-novo-codigo-civil/
- Lucro Presumido — art. 45 da Lei 8.981/95 e livro Caixa — https://www.jusbrasil.com.br/topicos/11644330/paragrafo-1-artigo-45-da-lei-n-8981-de-20-de-janeiro-de-1995 · https://www.tononicontabilidade.com.br/irpj-csl-escrituracao-do-livro-caixa-das-pessoas-juridicas-que-optaram-pelo-lucro-presumido/ · https://www.conjur.com.br/2019-nov-13/carf-analisa-tributacao-lucros-distribuidos-empresas-lucro-presumido-caixa/

### Contabilização da folha
- Provisão de férias e 13º, encargos, CPC 33 (R1), baixa da provisão no pagamento — https://planning.com.br/provisao-ferias-decimo-terceiro-encargos/ · https://cosif.com.br/publica.asp?arquivo=20121108regimecompetencia · https://lefisc.com.br/materias/2007/2122007contabilidade2.asp · https://www.contabeis.com.br/forum/contabilidade/289202/provisao-de-ferias-e-13o-salario-contabilizacao/

### Banco, conciliação e mercado
- Leiaute padrão CNAB 240 FEBRABAN v10.11, 21/08/2023 (PDF, **indexado**) — https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Layout%20padrao%20CNAB240%20V%2010%2011%20-%2021_08_2023.pdf · página do padrão: https://portal.febraban.org.br/pagina/3053/33/pt-br/layout-240
- OFX, OFC e CNAB — https://boavistatecnologia.com.br/blog/ofc-ofx-money-2000-cnab/
- Integração Fiscal × Contábil em tempo real (Alterdata) — https://ajuda.alterdata.com.br/fiscalbase/integracao-fiscal-x-contabil-tudo-que-voce-precisa-saber-sobre-integracao-fiscalxcontabil-84260204.html
- Nasajon, segmento contábil — https://nasajon.com.br/nsj-segmento-contabil/
- Domínio × Contmatic, módulos — https://pastacontabil.com.br/blog/dominio-contabil-vs-contmatic
- Lista de sistemas contábeis integrados — https://ajuda.contaazul.com/hc/pt-br/articles/115008426488-Conta-Azul-Mais-sistemas-cont%C3%A1beis-integrados

### Open source de SPED (verificável no GitHub)
- https://github.com/sped-br/python-sped (arquivado pelo autor) · https://github.com/sped-br/python-sped-ecd
- https://github.com/nfephp-org/sped-ecf · https://github.com/nfephp-org/sped-efd
- https://github.com/SsInformatica/SPEDBr · https://github.com/AOPack/SPEDBr.NET
- https://github.com/akretion/sped-extractor

### Internas (esta pasta e este repositório)
- `docs/apuracao-prova-real.md` — apuração fiscal, grão de item e prova real
- `docs/folha/07-arquitetura-modulo-lior.md` — princípio estruturante, schema e faseamento
- `docs/folha/09-rubricas-e-reconciliacao.md` — `folha_rubrica` e o de-para de incidências
- `docs/folha/10-migracao-ponto-e-holerite.md` — esquema de selo adotado aqui
- `docs/folha/11-dominio-incumbente-e-integracao.md` — o incumbente, o arquivo de integração contábil e a restrição do eSocial
- `docs/folha/05-construir-x-comprar-e-fornecedores.md` — método de estimativa reaproveitado
- `CLAUDE.md` — regras de negócio inegociáveis e regras fiscais vigentes

---

## Fecho

O módulo contábil é **maior que o de folha**, tem **cadência mais lenta para aprender com o
erro** e é composto quase inteiramente de **commodity obrigatória**. A boa notícia é a
propriedade que nenhum dos outros dois tem: **ele pode rodar um ano inteiro em paralelo sem
transmitir nada.** Isso o torna, simultaneamente, o mais caro de terminar e o **mais seguro
de começar**.

A recomendação, em uma linha: **construir o núcleo e a costura agora, em sombra, sobre o
Domínio que continua sendo o motor; adiar ECD e ECF até haver um ano de balancete batendo; e
tratar "substituir o Domínio por completo" como direção, não como plano** — porque a
aritmética de §15 diz que o plano custa, no piso, 95–168 pessoa-mês com dois módulos ainda
fora da conta.

**Nada deste documento vira código antes do Bloco H.**

*Insights Impulsionam.*
