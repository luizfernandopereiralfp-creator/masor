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
