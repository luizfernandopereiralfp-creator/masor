# 10 — Carga inicial (migração de sistema), Ponto Eletrônico e Holerite

> **Escopo.** As três lacunas que a auditoria (`AUDITORIA-anti-invencao.md`, seção D) e a
> proposta de arquitetura (`07-arquitetura-modulo-lior.md`, seção 6) apontaram como não
> cobertas por nenhum dos seis documentos de pesquisa, e que **travam a implantação real**:
> (1) carga inicial de bases acumuladas na troca de sistema, (2) tratamento do arquivo de
> ponto até as horas apuradas, (3) conteúdo e desenho do holerite.
>
> **Data-base:** 30/08/2026. **Aplicação-alvo:** módulo de Folha do **Lior** (decisão de
> onde mora em `07`, seção 0). **Prefixo de tabelas:** `folha_`.
>
> **Natureza deste documento:** isto é **especificação de engenharia e de processo**, não
> pesquisa de legislação. Onde a regra legal é necessária e não pôde ser confirmada, está
> marcada como pendência e o motor a trata como `null` — nunca como valor padrão.

---

## 0. Selo de evidência (declarado na abertura, conforme exige a auditoria)

A auditoria de 30/08/2026 identificou que **o furo estrutural dos seis documentos foi cada
um inventar o próprio esquema de selo**, permitindo que o mesmo fato aparecesse confirmado
num arquivo e proibido de reproduzir em outro. Este documento adota o esquema do `06`
(o mais explícito dos seis) e acrescenta uma classe que os outros não tinham:

| Selo | Significado | Pode virar código? |
|---|---|---|
| `[V-DIRETO]` | Texto normativo aberto e lido nesta rodada | Sim |
| `[V-INDIRETO]` | Confirmado por busca em domínio oficial ou herdado de outro documento desta pasta, **sem leitura integral do dispositivo** | Só como parâmetro com `fonte_verificada = false` |
| `[ENG]` | **Decisão de engenharia deste documento.** Não é afirmação normativa: é escolha de desenho, de processo ou de modelo de dados, e responde ao autor, não à lei | Sim, e deve ser registrada como decisão, com dono e data |
| `○ PENDÊNCIA — não confirmado` | Não verificado. **Não vira parâmetro, prazo, cálculo, texto de tela nem cláusula de contrato** | Não |

**Mapeamento com o selo do `03`:** `CV` (convergência entre fontes secundárias) ≡
`[V-INDIRETO]`. `AR` (coerência aritmética) não se aplica aqui — este documento não
publica tabela oficial nenhuma.

**Três declarações que fecham o loop com a auditoria:**

1. **Nenhuma afirmação deste documento é `[V-DIRETO]`.** O egress para `*.gov.br` seguiu
   bloqueado por política de rede (403 no proxy) nesta rodada. Nada foi lido na origem.
2. **Este documento não eleva selo de ninguém.** Todo fato normativo repetido dos documentos
   `01` a `06` carrega **aqui o mesmo selo que carrega lá**, com a referência de origem
   (`03 §6.1`, por exemplo). Se lá é pendência, aqui é pendência.
3. **A maior parte do conteúdo é `[ENG]`** — e isso é proposital. Migração, apuração de
   ponto e desenho de holerite são 80% engenharia e processo; a lei entra em pontos
   específicos, todos marcados.

**Onde cada pendência se fecha:** ver `FONTES-A-BAIXAR.md`, blocos C (MTE/FGTS), D
(Planalto) e o **Bloco G**, acrescentado por este documento.

---
---

# PARTE I — CARGA INICIAL / MIGRAÇÃO DE SISTEMA

## 1. Por que esta é a parte que mais dá errado

Trocar de sistema de folha não é migrar cadastro. Cadastro é o que todo fornecedor entrega
bonito na proposta: nome, CPF, salário, cargo. O que quebra a implantação são as **bases
acumuladas** — números que não estão no contrato de trabalho, foram construídos mês a mês
pelo sistema antigo, e **não podem ser recalculados** pelo sistema novo porque o novo não
viveu aquele histórico.

Três propriedades tornam esse conjunto perigoso:

- **São invisíveis na conferência do dia 1.** O primeiro holerite fecha bonito mesmo com
  todas elas erradas. O erro aparece na primeira férias, no primeiro 13º, na primeira
  rescisão — três a onze meses depois.
- **Erram em silêncio.** Não geram exceção, não travam tela, não são rejeitadas pelo
  eSocial. Geram valor errado no lugar certo.
- **O erro é sempre a favor de quem reclama.** Avo a menos, dia de férias a menos, saldo de
  FGTS a menos — todos viram diferença devida ao empregado, com correção e honorários.

> Vale a regra do `00-LEIA-PRIMEIRO.md`, risco 1: **erro de folha não vira retificação —
> vira reclamatória.** Na migração isso é literal: o sistema novo assume, perante o
> empregado, números que ele não calculou.

---

## 2. O que precisa vir do sistema anterior

### 2.1 Bases acumuladas — as que a missão nomeou

| # | Base | Por que é acumulada (não se recalcula) | Granularidade mínima |
|---|---|---|---|
| B-01 | **Avos de 13º do ano corrente** | Depende de meses com ≥ 15 dias trabalhados, faltas injustificadas e afastamentos ocorridos antes do corte `[V-INDIRETO] 03 §8` | Por vínculo: nº de avos, mês a mês, com o motivo de cada avo perdido |
| B-02 | **Adiantamento de 13º já pago no ano** | A 1ª parcela pode ser paga de 1º de fevereiro a 30 de novembro `[V-INDIRETO] 04 §8.3`. Se já saiu, a 2ª parcela é abatimento, não pagamento novo | Por vínculo: valor, data, competência e o FGTS já recolhido sobre ela |
| B-03 | **Períodos aquisitivos de férias** | Contam 12 meses de contrato; o direito e o prazo vêm da admissão, não da migração `[V-INDIRETO] 03 §7.1` | Um registro por período: início, fim, dias de direito, dias gozados, dias vendidos (abono), dias em aberto, faltas injustificadas do período, situação (vencido / proporcional / em gozo / em dobra) |
| B-04 | **Faltas injustificadas do período aquisitivo aberto** | Definem os dias de direito pela tabela do art. 130 `[V-INDIRETO] 03 §7.2` — 6 faltas derrubam de 30 para 24 dias | Contagem por período aquisitivo, com as datas |
| B-05 | **Férias em gozo na data do corte** | Atravessam competência; foram pagas antes do início e o afastamento continua no sistema novo | Vínculo, período aquisitivo de origem, data início/fim, dias, valor pago, competência do pagamento, `S-2230` já enviado e seu recibo |
| B-06 | **Saldo e histórico de FGTS** | O saldo real é da Caixa/FGTS Digital, mas a **base declarada mês a mês** é do sistema — e é ela que a rescisão usa para conferir | Por vínculo e competência: base FGTS, valor recolhido, competências em atraso, existência de depósito recursal/parcelamento |
| B-07 | **Bases de INSS do ano** | Não há progressividade anual — o INSS é mensal `[ENG]`. Migra por **quatro** razões: teto em múltiplos vínculos, base própria do 13º, conferência com os totalizadores `S-5001`, e retificação de competência anterior ao corte | Por vínculo e competência: base, desconto, indicador de múltiplos vínculos |
| B-08 | **Bases de IRRF do ano** | Idem: o IRRF mensal também **não** é progressivo no ano `[ENG]`. Migra pelo **comprovante de rendimentos anual**, pelo `S-5002`/`S-1210` e pela dedução de dependentes já usada | Por vínculo e competência: rendimento tributável, INSS deduzido, dependentes, pensão, previdência privada, IRRF retido, e o **acumulado de PLR do ano** (tabela própria anual) |
| B-09 | **Afastamentos em curso** | O afastamento tem início antes do corte e efeitos depois: avos, férias, estabilidade no retorno, quem paga (empregador nos 15 primeiros dias, INSS a partir do 16º) | Vínculo, motivo (código eSocial), data início, previsão de retorno, se já passou de 15 dias, se ultrapassou 6 meses no período aquisitivo `[V-INDIRETO] 03 §7.2`, recibo do `S-2230` |
| B-10 | **Estabilidades** | São datas-limite que o sistema novo não tem como deduzir: gestante, acidentária, CIPA, dirigente sindical, e as convencionais (pré-aposentadoria, por exemplo) que vêm da CCT | Vínculo, tipo, fato gerador, data de início e **data de término**, documento comprobatório, origem (lei / CCT / acordo / sentença) |
| B-11 | **Contratos de experiência em andamento** | Prazo determinado com prorrogação única; vencido sem providência, converte-se em indeterminado sozinho | Vínculo, data início, data fim do 1º período, se já houve prorrogação, data fim final |
| B-12 | **Empréstimos consignados em curso** | Contrato com terceiro (banco), com saldo e parcelas; e a margem depende do líquido calculado `[V-INDIRETO] 03 §14.1 etapa 5.8` | Vínculo, banco, nº do contrato, valor da parcela, parcelas pagas, parcelas restantes, 1ª e última competência, tipo (consignado CLT / consignado FGTS), documento de averbação |
| B-13 | **Dependentes** | Dois cadastros diferentes com critérios diferentes: dependente de **IRRF** e dependente de **salário-família**. O mesmo filho pode ser um, outro, ambos ou nenhum | Por dependente: nome, CPF, data de nascimento, grau de parentesco, marca `dep_irrf`, marca `dep_salario_familia`, data-limite de cada direito, marca `titular_menor` (`07 §2.2`) |
| B-14 | **Pensões alimentícias** | Vêm de ofício judicial, com base e percentual próprios; não há regra geral que o sistema possa inferir | Vínculo, beneficiário, CPF, base (bruto / líquido / verbas nomeadas), percentual **ou** valor fixo, incidência sobre 13º e sobre férias, conta destino, nº do processo, vigência, cópia do ofício |

### 2.2 O que a lista não pedia e também trava a virada `[ENG]`

Estes não estavam no enunciado e, na prática, param a implantação com a mesma força:

| # | Base | Por que trava |
|---|---|---|
| B-15 | **Tabela de rubricas com o de-para de incidências (`S-1010`)** | É apontado em `01` e em `07 §3` como **o maior risco do módulo**, e tem especificação própria em **`09-rubricas-e-reconciliacao.md`**. Migrar rubrica sem os três códigos de incidência (previdenciária, IRRF, FGTS) é migrar o passivo junto. Rubrica sem os três códigos **não entra em cálculo** (`07 §3`, regra 2) |
| B-16 | **Estado do eSocial: recibos dos eventos já transmitidos** | Sem o nº do recibo do `S-2200` de cada vínculo, o sistema novo **não consegue retificar nem desligar** ninguém admitido antes do corte. É a base mais esquecida e a de recuperação mais cara |
| B-17 | **Matrícula do vínculo tal como está no eSocial** | Chave do trabalhador nos eventos. Renumerar na migração quebra a continuidade da série de eventos |
| B-18 | **Histórico salarial e alterações contratuais** | Base de rescisão, de estabilidade e de prova em reclamatória; e origem dos `S-2206` já enviados |
| B-19 | **Médias de variáveis dos últimos 12 meses** | Férias, 13º e rescisão usam médias de horas extras, adicional noturno e comissões `[V-INDIRETO] 03 §7.3, §8`. Sem os 12 meses, a primeira férias sai a menor |
| B-20 | **Saldo de banco de horas, com vencimento por lote** | Ver Parte II §8. Saldo sem data de vencimento não é saldo — é número solto |
| B-21 | **Opções e autorizações assinadas** | Vale-transporte (opção do empregado), VR/VA, plano de saúde e coparticipação, autorização de desconto sindical/assistencial e a oposição, adesão ao banco de horas, acordo de compensação, acordo de ponto por exceção |
| B-22 | **Aprendizes, PcD e cota** | A cota é calculada sobre a base de empregados; perder a marcação derruba o controle e a rubrica de FGTS 2% do aprendiz |
| B-23 | **Processos trabalhistas em curso (`S-2500`)** | Continuam produzindo eventos e podem gerar reintegração |
| B-24 | **Rescisões e avisos prévios em curso na data do corte** | Aviso prévio trabalhado iniciado antes do corte termina depois; e o prazo de pagamento da rescisão não espera migração |
| B-25 | **Documentos e anexos** | Ficha de registro, ASO, ficha de EPI, atestados, ofícios de pensão. Não são cálculo — são **prova**, e desaparecem junto com o contrato do fornecedor antigo |

---

## 3. O que acontece se cada base vier errada ou não vier

Esta é a tabela que justifica o orçamento da migração. Coluna "quando aparece" é o que
importa: **quase nada aparece no mês 1**.

| Base | Se vier errada ou não vier — sintoma prático | Quando aparece | Quem descobre |
|---|---|---|---|
| B-01 avos de 13º | 13º pago a menor (ou a maior) por um ou mais avos. Um avo de um salário de R$ 3.000 = R$ 250 por pessoa, mais reflexo de INSS, IRRF e FGTS | **Dezembro** — ou já na 1ª parcela, entre fevereiro e novembro | O empregado, comparando com o colega |
| B-02 adiantamento do 13º | 1ª parcela paga **duas vezes**; ou 2ª parcela calculada sem abater a 1ª, gerando pagamento em duplicidade e FGTS a maior | Dezembro | Conciliação bancária do cliente |
| B-03 períodos aquisitivos | Férias concedidas fora do prazo concessivo ⇒ **pagamento em dobro** `[V-INDIRETO] 03 §7.1`. Ou período vencido invisível, que ninguém programa | 1ª a 12ª competência após o corte; a dobra às vezes só na rescisão | Reclamatória |
| B-04 faltas do período aquisitivo | 30 dias de férias concedidos a quem tinha direito a 24 — o excedente é liberalidade irrecuperável; ou o inverso, que é diferença devida | Na 1ª programação de férias do vínculo | Ninguém, até a auditoria |
| B-05 férias em gozo | Empregado em férias aparece como falta, ou como trabalhando; folha do mês sai errada e o `S-2230` fica órfão | **Mês 1** — este é dos poucos que aparece cedo | O próprio empregado |
| B-06 FGTS | Rescisão com multa de 40% sobre saldo errado; base de conferência inexistente; competência em atraso não detectada continua rendendo multa e juros `○ P-04` | Na 1ª rescisão, ou na 1ª auditoria do FGTS Digital | O trabalhador ou a fiscalização |
| B-07 bases de INSS | Múltiplo vínculo desconta acima do teto (devolução) ou abaixo (diferença); divergência contra os totalizadores `S-5001` na 1ª competência; impossibilidade de retificar competência anterior | Mês 1 no múltiplo vínculo; meses depois na divergência | Retorno do eSocial |
| B-08 bases de IRRF | **Comprovante de rendimentos anual errado ou partido em dois** — o empregado cai em malha; PLR sem acumulado do ano tributa na faixa errada | Fevereiro do ano seguinte, na declaração do empregado | O empregado — e é o mais constrangedor |
| B-09 afastamentos | Empregado afastado recebe salário integral (pagamento indevido) ou é registrado como faltoso (desconto indevido); avos e férias contados errado; empresa continua pagando quem é do INSS | Mês 1 no pagamento; meses depois nos avos | Financeiro do cliente |
| B-10 estabilidades | **Demissão de estável.** É o erro mais caro possível: reintegração ou indenização do período completo, mais honorários | Na 1ª demissão — pode ser mês 1 | Advogado do empregado |
| B-11 contrato de experiência | Prazo vence sem aviso: o contrato vira indeterminado por omissão, e a rescisão que seria simples passa a ter aviso prévio e multa de 40% | 30 a 90 dias após o corte | O DP, tarde demais |
| B-12 consignados | Parcela não descontada ⇒ o **empregador** responde perante o banco; ou descontada depois de quitada ⇒ desconto indevido, com devolução em dobro no pior cenário | Mês 1 ou mês 2 | O banco, ou o empregado |
| B-13 dependentes | IRRF a maior (dependente perdido) ou a menor (dependente que já perdeu o direito por idade); salário-família pago indevidamente vira glosa | Mês 1 no valor; fevereiro do ano seguinte no informe | O empregado |
| B-14 pensões | **Pensão não descontada ou não repassada.** Vira execução judicial contra o empregador, com risco pessoal ao sócio | Mês 1 — e o beneficiário reclama rápido | O juízo da vara de família |
| B-15 rubricas / incidências | **Recolhimento a menor sem erro de sistema** (`07 §3`) — aparece como divergência entre a folha e o retorno do eSocial | 2 a 6 meses | Totalizadores `S-5001`/`S-5011` |
| B-16 recibos do eSocial | Impossível retificar ou desligar quem foi admitido antes do corte; o desligamento trava no dia em que precisa sair | Na 1ª rescisão de empregado antigo | O sistema, com rejeição |
| B-19 médias | 1ª férias, 1º 13º e 1ª rescisão a menor para quem tem variáveis | 1 a 12 meses | Reclamatória |
| B-20 banco de horas | Saldo perdido = horas extras devidas; saldo inflado = horas pagas indevidamente; sem vencimento, nada vence e o passivo cresce | Na 1ª rescisão | Reclamatória |
| B-24 rescisões em curso | Aviso prévio interrompido; prazo de pagamento da rescisão estourado, com a multa do art. 477, §8º `[V-INDIRETO] 03 §9.3` | Dias após o corte | O empregado |

> **Padrão a reter:** das 25 bases, **quatro** dão sintoma no mês 1 (B-05, B-09, B-12,
> B-14). As outras vinte e uma dormem. É exatamente o comportamento descrito no risco 2 do
> `00-LEIA-PRIMEIRO.md` — o bug dorme e estoura na carteira inteira de uma vez.

---

## 4. O momento seguro de virar — e o custo de virar fora dele

O `00-LEIA-PRIMEIRO.md` (risco 5) registra que **troca de sistema de folha só é segura na
virada do ano**. Aqui está o raciocínio desenvolvido, porque a frase sozinha não sustenta
negociação com fornecedor nem com cliente.

### 4.1 O raciocínio

A folha tem **três relógios** rodando ao mesmo tempo, e a migração só é barata onde os três
estão parados ou onde o menor número deles está em movimento:

| Relógio | Ciclo | Zera quando? |
|---|---|---|
| **Competência** | mensal | Todo mês, no fechamento (`S-1299`) |
| **Ano-calendário** | anual | 31 de dezembro — fecha IRRF acumulado, comprovante de rendimentos, PLR, DCTFWeb anual |
| **Ano do 13º** | anual | Na quitação da 2ª parcela, até 20 de dezembro `[V-INDIRETO] 04 §8.3` — os avos zeram |
| **Período aquisitivo de férias** | por vínculo | **Nunca em data comum.** Cada empregado tem o seu, ancorado na admissão |

O corte ideal é o instante em que **dois dos três relógios acabaram de zerar** e o terceiro
(competência) está fechado. Isso acontece **uma vez por ano**: entre o fechamento de
dezembro e a abertura de janeiro.

**Portanto, o momento seguro é: o sistema antigo fecha dezembro por inteiro — folha 12,
13º quitado, `S-1299` da competência 12 e da anual, FGTS e DCTFWeb de dezembro — e o
sistema novo abre na competência de janeiro.** `[ENG]`

Cinco razões concretas:

1. **O ano-calendário é a unidade do IRRF acumulado e do comprovante de rendimentos.**
   Virar no meio do ano obriga o informe do empregado a ser montado somando dois sistemas.
   Ou o fornecedor antigo permanece contratado até fevereiro do ano seguinte só para emitir
   o informe (custo real, e ele sabe disso), ou o sistema novo assina um informe cujos
   números não calculou.
2. **O 13º é indivisível na prática.** Migrar com 13º em curso significa avos formados num
   sistema, 1ª parcela paga por um e 2ª por outro, com INSS e IRRF do 13º incidindo sobre
   base própria e separada `[V-INDIRETO] 03 §8` que o novo sistema não construiu. É a
   fonte nº 1 de erro de migração no Brasil.
3. **O eSocial não "vira".** O empregador continua o mesmo: `S-1000`, `S-1005`, `S-1010` e
   `S-1020` seguem válidos, os vínculos seguem abertos, e a série de eventos é contínua. O
   `S-1299` de dezembro fechado pelo sistema antigo é o **marco natural** de transferência
   de responsabilidade: tudo antes dele é do antigo, tudo depois é do novo.
4. **Em janeiro migra-se o mínimo possível.** Depois da virada do ano, as únicas bases que
   obrigatoriamente atravessam são as que não têm ciclo anual: **férias (B-03/B-04/B-05),
   estabilidades (B-10), experiência (B-11), afastamentos (B-09), consignados (B-12),
   pensões (B-14), dependentes (B-13), banco de horas (B-20) e médias (B-19)**. Some-se o
   estado do eSocial (B-16/B-17) e as rubricas (B-15). B-01, B-02, B-07 e B-08 caem para
   "histórico para consulta e retificação", não para "insumo de cálculo".
5. **A folha de janeiro tem a competência inteira de paralelo antes do primeiro
   fechamento.** O `S-1299` de janeiro só vence no dia 15 de fevereiro `[V-INDIRETO] 04
   §8.1`. Isso dá seis semanas úteis entre o corte e a primeira obrigação irreversível.

### 4.2 O que **não** fecha no ano — e por isso a migração nunca é zero

Períodos aquisitivos de férias são ancorados na **admissão de cada pessoa**. Numa carteira
de 200 empregados há 200 datas diferentes. Nenhuma janela do calendário torna a migração de
férias trivial — ela é sempre trabalho manual de conferência, e é a base que mais consome
horas na implantação. `[ENG]`

### 4.3 Custo de virar fora da janela

| Janela do corte | O que quebra | Custo relativo | Veredito |
|---|---|---|---|
| **Competência de janeiro** (corte em 01/01) | Só o que nunca fecha: férias, estabilidades, afastamentos, consignados, banco de horas | **1×** (referência) | **Recomendado** |
| Fevereiro a maio | Bases do ano partidas (B-07/B-08); informe anual precisa de consolidação manual; possível 1ª parcela de 13º já paga a partir de fevereiro (B-02) | 2–3× | Aceitável com ressalva contratual |
| Junho a agosto | Tudo acima + férias coletivas de julho em vários setores + avos de 13º já relevantes (6 a 8 avos migrados) | 3–5× | Evitar |
| Setembro a novembro | Tudo acima + 13º em formação com 9 a 11 avos + prazo final da 1ª parcela em 30/11 + preparação do fechamento anual | 5–8× | **Não fazer** |
| **Dezembro** | 13º em quitação, `S-1299` anual, DCTFWeb anual, férias coletivas, pico de trabalho do escritório | 8–10× | **Proibido** `[ENG]` |
| **No meio de uma competência** | A competência é atômica: parte do mês calculada num sistema e parte no outro produz duas folhas parciais que nenhum totalizador do eSocial aceita | Irrecuperável | **Proibido** `[ENG]` |
| Com pendência aberta no eSocial do sistema antigo | Herda-se passivo alheio: eventos rejeitados, competências sem `S-1299`, retificações pendentes | Indeterminado | **Bloqueador de aceite** |

### 4.4 As três consequências comerciais que decorrem disso

1. **O fornecedor antigo sabe que você só sai em janeiro.** É por isso que o reajuste chega
   em outubro/novembro. Exigir **teto de reajuste em contrato** (índice + limite), como já
   registrado no risco 5 do `00-LEIA-PRIMEIRO.md`.
2. **Cláusula de saída, negociada na entrada.** No contrato com qualquer fornecedor de
   folha, exigir por escrito: extração completa em **formato aberto e legível** (CSV/JSON
   documentado, não dump proprietário), **os XML transmitidos ao eSocial e os recibos**, e
   **90 dias de acesso somente-leitura após o encerramento**. `[ENG]`
3. **Nunca rescindir o contrato antigo antes do aceite da migração.** Contrato encerrado =
   acesso cortado = bases B-03, B-12, B-19, B-20 e B-25 **perdidas de forma irreversível**,
   porque elas não existem em lugar nenhum fora daquele sistema. Ver §5.4.

---

## 5. Roteiro de migração passo a passo

Escala de referência: **uma empresa cliente**. Para carteira, o roteiro roda em ondas —
nunca a carteira inteira de uma vez. `[ENG]`

### 5.1 Fase 0 — Antes de qualquer extração (D-90 a D-75)

| # | Passo | Ponto de conferência obrigatório |
|---|---|---|
| 0.1 | Confirmar por escrito a **cláusula de saída** com o fornecedor antigo (§4.4.2) | Documento assinado, arquivado |
| 0.2 | Inventário: nº de empresas, nº de vínculos, regimes tributários, CCTs aplicáveis, estabelecimentos, categorias especiais (aprendiz, PcD, estagiário, TSVE) | Planilha de inventário aceita pelo responsável do escritório |
| 0.3 | Levantar **pendências abertas no eSocial** de cada empresa: competências sem `S-1299`, eventos rejeitados, retificações em aberto | **Bloqueador**: pendência aberta não migra. Resolve-se no sistema antigo |
| 0.4 | Congelar customizações e cadastros novos no sistema antigo a partir de D-30 | Comunicado ao cliente |
| 0.5 | Definir a **data de corte** e registrá-la como parâmetro imutável do cliente | `folha_migracao.data_corte` gravada |

### 5.2 Fase 1 — Extração (D-75 a D-60)

Ordem de confiabilidade das fontes — e este é o ponto mais subestimado da migração `[ENG]`:

| Prioridade | Fonte | O que ela prova | O que ela **não** tem |
|---|---|---|---|
| **1ª** | **XML dos eventos transmitidos ao eSocial + recibos + retornos `S-5001`/`S-5002`/`S-5003`** | É o que o governo tem. Bases de INSS, IRRF e FGTS por trabalhador e competência, rubricas com incidências, admissões, afastamentos, desligamentos — tudo com recibo | Férias (períodos aquisitivos), banco de horas, consignados, médias, documentos |
| **2ª** | **FGTS Digital** e **DCTFWeb** | Valores efetivamente declarados e recolhidos | Idem |
| **3ª** | Exportação estruturada do sistema antigo (CSV/JSON) | Férias, banco de horas, consignados, dependentes, pensões, documentos — **as bases que só existem lá** | Confiabilidade: é declaração do fornecedor, não de terceiro |
| **4ª** | Relatórios em PDF do sistema antigo | Serve para conferência visual e prova | Não é dado; é imagem de dado |

> **Consequência de desenho:** as bases que vêm do eSocial são **conferíveis contra
> terceiro**. As que vêm só do sistema antigo (férias, banco de horas, consignados) **não
> são conferíveis contra ninguém** — e por isso exigem conferência humana amostral e ficam
> marcadas para sempre como saldo declarado (§6). É também por isso que perder o acesso ao
> sistema antigo é irreversível.

| # | Passo | Ponto de conferência |
|---|---|---|
| 1.1 | Puxar todos os XML enviados e recibos, por empresa e competência, do início do vínculo mais antigo até a data de corte | Contagem de eventos por competência bate com o esperado; nenhum mês sem `S-1299` |
| 1.2 | Puxar retornos `S-5001`/`S-5002`/`S-5003`/`S-5011`/`S-5012` | Arquivados com hash |
| 1.3 | Exportar do sistema antigo tudo o que a §2 lista, em formato aberto | Checklist das 25 bases, item a item, com "recebido / não recebido / não aplicável" |
| 1.4 | Baixar documentos e anexos (B-25) | Contagem de arquivos por vínculo |
| 1.5 | Registrar **hash SHA-256 e data** de cada arquivo recebido | Nenhum arquivo entra em staging sem hash |

### 5.3 Fase 2 — De-para de rubricas (D-60 a D-45)

Fase separada por ser a mais longa e a que não dá para paralelizar com a carga. `07 §3`
aponta como o maior risco do módulo, e **`09-rubricas-e-reconciliacao.md`** é a
especificação de referência do de-para e das travas de integridade — esta fase **executa**
o que está lá, não redefine nada.

| # | Passo | Ponto de conferência |
|---|---|---|
| 2.1 | Listar toda rubrica usada nas últimas 24 competências (extraídas dos `S-1200`, não do cadastro — cadastro tem rubrica morta) | Lista fechada, com frequência de uso |
| 2.2 | Mapear cada rubrica para a rubrica do Lior, com os **três códigos de incidência** (previdenciária, IRRF, FGTS) e a natureza | **Bloqueador**: rubrica sem os três códigos não entra em cálculo (`07 §3`, regra 2) |
| 2.3 | Conferir o mapeamento contra o `S-1010` efetivamente transmitido pelo sistema antigo | Divergência entre o que a empresa declarou e o que se pretende declarar = pendência com aprovação humana |
| 2.4 | Classificação humana de toda rubrica nova | Toda rubrica nasce com pendência até um humano classificar (`07 §3`, regra 3) |

### 5.4 Fase 3 — Carga em staging e validação automática (D-45 a D-35)

| # | Passo | Ponto de conferência |
|---|---|---|
| 3.1 | Carregar os arquivos nas tabelas `folha_stg_*` (§6), **sem transformação** | Nº de linhas lidas = nº de linhas do arquivo; linha inválida vira rejeito com o texto original preservado |
| 3.2 | Rodar as validações de tipo e domínio | Nenhuma linha promovida com campo obrigatório nulo |
| 3.3 | Rodar as validações de coerência (§5.6) | Toda divergência vira registro em `folha_migracao_divergencia` |
| 3.4 | Promover para as tabelas definitivas **apenas** o que passou, marcado como `MIGRADO` | Nenhuma linha promovida sem `folha_saldo_migrado` correspondente |

### 5.5 Fase 4 — Paralelo (D-35 a D-1, mínimo duas competências)

`07 §5` já estabelece: **fase 5 não é opcional** — dois meses seguidos sem divergência.
Aqui isso se aplica à migração, com uma diferença: no paralelo de migração o sistema
**antigo continua sendo o oficial**; o Lior calcula em sombra.

| # | Passo | Ponto de conferência |
|---|---|---|
| 4.1 | Calcular a competência inteira nos dois sistemas | Comparação vínculo a vínculo (§5.6) |
| 4.2 | Investigar **toda** divergência — inclusive de um centavo | Divergência sem causa identificada = **não pode ser aceita**. Centavo sem explicação é sintoma de regra de arredondamento diferente (`03 §14.2`), e regra de arredondamento diferente reaparece multiplicada |
| 4.3 | Repetir na competência seguinte | Duas competências consecutivas com zero divergência inexplicada |
| 4.4 | Gerar os XML da competência **sem transmitir** e validar contra o XSD offline (`07`, fase 3) | Todos validam |

### 5.6 Batimentos obrigatórios — a bateria de conferência

Tolerância declarada por batimento. **Tolerância não é margem de erro: é o limite acima do
qual o sistema recusa o aceite.** `[ENG]`

| # | Batimento | Contra o quê | Tolerância |
|---|---|---|---|
| V-01 | Nº de vínculos ativos na data de corte | Sistema antigo **e** eSocial (admissões − desligamentos) | **0** |
| V-02 | Soma dos salários-base | Sistema antigo | **0,00** |
| V-03 | Soma da base de INSS da última competência | Retorno `S-5001` | **0,00** |
| V-04 | Soma da base de FGTS da última competência | Retorno `S-5003` **e** FGTS Digital | **0,00** |
| V-05 | Soma do IRRF retido do ano | Retorno `S-5002` / `S-1210` | **0,00** |
| V-06 | Avos de 13º, vínculo a vínculo | Recálculo independente a partir de admissão + afastamentos + faltas | **0 avo** |
| V-07 | Dias de férias em aberto, vínculo a vínculo | Recálculo independente a partir de admissão + faltas (tabela do art. 130) | **0 dia** |
| V-08 | Períodos aquisitivos vencidos | Lista nominal, conferida um a um por humano | **0** |
| V-09 | Saldo de consignado × parcelas restantes × valor da parcela | Contrato do banco | **0,00** |
| V-10 | Pensões: base, percentual e conta destino | Ofício judicial, um a um | **0** |
| V-11 | Estabilidades com data de término | Documento comprobatório, um a um | **0** |
| V-12 | Saldo de banco de horas, com lotes e vencimentos | Espelhos de ponto do período | **0 minuto** |
| V-13 | Líquido por vínculo, nas duas competências de paralelo | Sistema antigo | **0,00** |
| V-14 | Encargos patronais (CPP, RAT×FAP, Terceiros, FGTS) | Sistema antigo e DCTFWeb | **0,00** |
| V-15 | Rubricas sem os três códigos de incidência | — | **0 rubrica** |
| V-16 | Vínculos sem recibo do `S-2200` | — | **0 vínculo** |

### 5.7 Critério de "migração aceita" `[ENG]`

Migração está aceita quando **todas** as afirmações abaixo são verdadeiras, registradas com
data, responsável e evidência anexada. Uma falsa = não aceita, sem exceção e sem "aceita com
ressalva":

1. Os dezesseis batimentos de §5.6 fecham dentro da tolerância declarada.
2. **Zero** divergência inexplicada em **duas** competências consecutivas de paralelo.
3. Zero pendência bloqueadora aberta no eSocial da empresa na data de corte.
4. Toda rubrica em uso tem os três códigos de incidência preenchidos e classificados por um
   humano nomeado.
5. Todo vínculo ativo tem o recibo do seu `S-2200` gravado.
6. Todo saldo migrado tem registro em `folha_saldo_migrado` com origem, documento e
   conferente (§6).
7. Os XML da última competência de paralelo validam contra o XSD **offline**.
8. Existe um responsável nomeado pelo aceite — pessoa, não área.
9. Os arquivos de origem estão arquivados com hash e data, e o acesso somente-leitura ao
   sistema antigo está garantido por, no mínimo, 90 dias após o corte.
10. O comprovante de rendimentos do ano anterior foi emitido pelo sistema antigo, ou existe
    plano escrito de como será emitido.

**Só depois de 1 a 10 verdadeiras** o contrato com o fornecedor antigo pode ser encerrado.

### 5.8 Fase 5 — Corte e primeiras competências

| Quando | Passo | Ponto de conferência |
|---|---|---|
| D-0 (01/01) | Competência de janeiro aberta **somente** no Lior. Sistema antigo em somente-leitura | Nenhuma escrita no antigo após o corte |
| D+15 a D+30 | Fechamento da folha de janeiro | Conferência do escritório antes de qualquer transmissão |
| D+15 (fev) | `S-1299` de janeiro | Reconciliação contra `S-5011`/`S-5012` (`07`, fase 4) |
| D+20 (fev) | DARF e FGTS de janeiro | Valores conferidos contra o cálculo, não contra o sistema |
| D+45 | 2ª competência fechada | Segunda reconciliação sem divergência |
| D+90 | Desmobilização do sistema antigo | Só após o item 10 do §5.7 |

### 5.9 Plano de reversão `[ENG]`

Migração sem plano de volta é aposta. O ponto de não-retorno é a **transmissão do `S-1299`
da primeira competência pelo Lior**. Antes dele, reverter é reabrir o sistema antigo e
recalcular. Depois dele, a reversão exige retificação de eventos já aceitos — caro e
visível. Portanto:

- O sistema antigo permanece em condição de **operar**, não só de ler, até o `S-1299` da
  primeira competência ser aceito sem ocorrência.
- A decisão de reverter tem dono nomeado e prazo: **até 48 h antes do dia 15**.

---

## 6. Modelo de dados da carga

### 6.1 Princípio

> **Dado migrado e dado calculado nunca se misturam na mesma linha.** `[ENG]`

Três camadas, e a fronteira entre elas é explícita:

```
 ARQUIVO BRUTO (imutável, com hash)
        │
        ▼
 folha_stg_*        ← staging: cópia fiel, sem transformação, com o texto original
        │  validação + conferência humana
        ▼
 folha_* (definitivas)  ← só o que passou, marcado origem = 'MIGRADO'
        │
        ▼
 folha_saldo_migrado    ← o "de onde veio este número", para sempre
```

### 6.2 Tabelas de controle da migração

```sql
-- Um lote por empresa cliente e por tentativa de migração.
create table folha_migracao (
  id                uuid primary key default gen_random_uuid(),
  cliente_id        uuid not null,
  empresa_cnpj      text not null,          -- texto: CNPJ alfanumérico (07 §2.3)
  sistema_origem    text not null,          -- nome do fornecedor anterior
  data_corte        date not null,          -- imutável após o aceite
  status            text not null,          -- rascunho|extraido|staging|conciliacao|
                                            -- paralelo|aceita|revertida
  competencia_ultima_origem  text not null, -- AAAA-MM fechada pelo sistema antigo
  competencia_primeira_lior  text not null,
  aceite_responsavel text,                  -- pessoa nomeada, não área
  aceite_em          timestamptz,
  criado_em          timestamptz not null default now()
);

-- Todo arquivo recebido, imutável, com hash. Nada entra em staging sem passar por aqui.
create table folha_migracao_arquivo (
  id             uuid primary key default gen_random_uuid(),
  migracao_id    uuid not null references folha_migracao(id),
  tipo           text not null,   -- xml_esocial|retorno_esocial|export_sistema|
                                  -- fgts_digital|dctfweb|documento|planilha
  nome_original  text not null,
  storage_path   text not null,
  sha256         text not null,
  bytes          bigint not null,
  recebido_em    timestamptz not null default now(),
  recebido_de    text not null,   -- quem entregou
  observacao     text
);
create unique index on folha_migracao_arquivo (migracao_id, sha256);
```

### 6.3 Staging — cópia fiel, sem esperteza

Regra: **staging não transforma, não corrige, não completa.** Se o arquivo traz `"30/02"`,
o staging guarda `"30/02"` como texto e a validação reprova. Staging que corrige esconde o
erro do fornecedor e ele reaparece depois, sem rastro. `[ENG]`

```sql
create table folha_stg_vinculo (
  id            uuid primary key default gen_random_uuid(),
  migracao_id   uuid not null references folha_migracao(id),
  arquivo_id    uuid not null references folha_migracao_arquivo(id),
  linha_num     integer not null,
  linha_original text not null,      -- SEMPRE preservada
  -- campos como TEXTO, sem cast; o cast é da validação
  cpf                text,
  matricula_origem   text,
  matricula_esocial  text,
  admissao           text,
  categoria          text,
  cargo_cbo          text,
  salario            text,
  jornada            text,
  status_validacao   text not null default 'pendente', -- pendente|ok|rejeitado
  erros              jsonb not null default '[]'::jsonb,
  promovido_para     uuid                              -- id em folha_vinculo
);
```

Mesmo padrão, uma tabela por base (as 25 da §2):
`folha_stg_dependente`, `folha_stg_ferias_periodo`, `folha_stg_afastamento`,
`folha_stg_estabilidade`, `folha_stg_consignado`, `folha_stg_pensao`,
`folha_stg_base_mensal` (INSS/IRRF/FGTS por competência), `folha_stg_13_avos`,
`folha_stg_banco_horas`, `folha_stg_rubrica_depara`, `folha_stg_esocial_recibo`,
`folha_stg_media_variavel`, `folha_stg_documento`.

### 6.4 A marca que muda tudo: `folha_saldo_migrado`

```sql
-- O registro permanente de "este número não fomos nós que calculamos".
create table folha_saldo_migrado (
  id               uuid primary key default gen_random_uuid(),
  migracao_id      uuid not null references folha_migracao(id),
  entidade         text not null,   -- 'folha_ferias_periodo','folha_banco_horas_mov', ...
  entidade_id      uuid not null,
  campo            text,            -- null = a linha inteira é migrada
  valor_migrado    jsonb not null,  -- o valor tal como recebido
  sistema_origem   text not null,
  documento_origem text not null,   -- arquivo + linha, ou nº do ofício/contrato
  arquivo_id       uuid references folha_migracao_arquivo(id),
  conferido_por    text,            -- pessoa que conferiu (obrigatório nas bases
                                    -- não conferíveis contra terceiro — §5.2)
  conferido_em     timestamptz,
  metodo_conferencia text,          -- 'esocial'|'fgts_digital'|'documento'|'amostral'|
                                    -- 'declaracao_fornecedor'
  criado_em        timestamptz not null default now()
);
```

E, em **toda** tabela definitiva que possa receber carga, dois campos de primeira classe
(não dentro de jsonb — eles são consultados, filtrados e auditados, mesmo argumento de
`07 §3`):

```sql
alter table folha_ferias_periodo
  add column origem text not null default 'CALCULADO'    -- CALCULADO | MIGRADO
    check (origem in ('CALCULADO','MIGRADO')),
  add column migracao_id uuid references folha_migracao(id);
```

### 6.5 As regras que a distinção habilita

| # | Regra | Por quê |
|---|---|---|
| R-01 | O motor **recusa recalcular** competência anterior à `data_corte` | Recalcular período que não vivemos produz número diferente do que foi declarado e pago — e o declarado é que está no eSocial |
| R-02 | Saldo `MIGRADO` **nunca** é apagado nem sobrescrito. Correção entra como **movimento de ajuste** com data, motivo e autor | Preserva a diferença entre "veio errado" e "mudou depois" |
| R-03 | `origem = 'MIGRADO'` **não** é `fonte_verificada = true` | São coisas diferentes: `fonte_verificada` fala de **norma**; `origem` fala de **procedência do dado**. Um saldo migrado é declaração de terceiro, não parâmetro legal `[ENG]` |
| R-04 | Toda tela que exibe saldo com componente migrado mostra a marca e a origem | O empregado e o auditor têm direito de saber de onde veio |
| R-05 | Holerite, espelho e relatórios exibem o rodapé de procedência quando houver saldo migrado no cálculo | Ver Parte III §5 |
| R-06 | Base migrada **sem** `conferido_por` em item de tolerância zero (§5.6) bloqueia o aceite | Sem isso, "conferido" vira carimbo |

### 6.6 Por que essa distinção importa numa auditoria futura

Três cenários reais, todos com a mesma pergunta no centro — *de onde veio este número?*

| Cenário | Sem a distinção | Com a distinção |
|---|---|---|
| **Reclamatória** pedindo diferenças de férias de período anterior à migração | O sistema responde "é o que está aqui". Sem procedência, a versão do empregado tende a prevalecer, porque o ônus da prova do registro é do empregador | O sistema responde: saldo declarado pelo sistema X, arquivo Y (hash Z), recebido em DD/MM, conferido por Fulano contra o documento W. Vira prova documental |
| **Fiscalização do trabalho ou da Receita** questionando base de competência anterior ao corte | Impossível separar o que foi declarado pelo antigo do que o Lior recalculou; qualquer recálculo posterior gera divergência inexplicável contra o eSocial | A fronteira é explícita: até a `data_corte`, o declarante é outro, e o Lior só custodia |
| **Erro descoberto seis meses depois** | Investigação arqueológica: ninguém sabe se o número nasceu errado ou foi corrompido depois | `folha_saldo_migrado` guarda o valor **como veio**; a diferença contra o valor atual é a trilha do que aconteceu depois |

> **O ponto:** sem a marca, o sistema novo assume autoria de números que não produziu — e
> autoria, em folha, é responsabilidade.

---
---

# PARTE II — PONTO ELETRÔNICO: DO ARQUIVO ÀS HORAS

## 1. O que já está lastreado e o que não está

Herdado de `04 §11`, **com os mesmos selos**:

| Fato | Selo (mantido) |
|---|---|
| Portaria MTP 671/2021 é a norma vigente do ponto | `[V-INDIRETO]` |
| Obrigatoriedade de anotação acima de 20 trabalhadores; REP eletrônico **não** é obrigatório | `[V-INDIRETO]` |
| Tipos REP-C, REP-A e REP-P; ponto por exceção é forma de consignação, não tipo de REP | `[V-INDIRETO]` |
| Todo REP gera **AFD**; o programa de tratamento gera **Espelho de Ponto** e **AEJ** | `[V-INDIRETO]` |
| **Layout exato do AFD e do AEJ** | **○ PENDÊNCIA** (`04 P-14`; fecha com `FONTES-A-BAIXAR` item **C3**) |
| Percentuais de HE, regras de intervalo e banco de horas vêm da **CCT**, não de padrão do sistema | `[V-INDIRETO]` (`04 §11`, `04 §12`) |

**Consequência imediata de desenho:** sem o layout do AFD/AEJ (C3), o parser **não pode ser
escrito**. O que pode ser escrito agora é tudo o que vem **depois** do parser — e é o que
esta parte especifica. O parser entra atrás de uma interface: `ParserPonto → Marcacao[]`,
com implementações por formato. `[ENG]`

---

## 2. A cadeia completa

```
 [REP-C / REP-A / REP-P]                   [App / portal / folha de ponto digitalizada]
          │  AFD                                        │
          └──────────────┬─────────────────────────────┘
                         ▼
  (1) INGESTÃO ......... arquivo bruto imutável + SHA-256 + quem entregou + quando
                         ▼
  (2) PARSING .......... linha → marcação. Linha inválida NÃO é descartada: vira rejeito
                         ▼                              com o texto original preservado
  (3) DEDUPE ........... repique marcado (não apagado)
                         ▼
  (4) ATRIBUIÇÃO ....... cada marcação ganha a data_referencia da JORNADA — não o dia
                         ▼                              do calendário  ◄── vira do dia
  (5) PAREAMENTO ....... entrada/saída alternadas dentro da jornada
                         ▼                              ◄── marcação ímpar para aqui
  (6) APURAÇÃO ......... tempo trabalhado, intervalo, noturno, comparação com a prevista
                         ▼
  (7) CLASSIFICAÇÃO .... normal | extra por faixa | noturno | falta | atraso | saída
                         ▼      antecipada | DSR perdido | intervalo suprimido |
                         ▼      sobreaviso | feriado | banco de horas
  (8) ESPELHO .......... versão fechada, hash, disponibilizada ao empregado
                         ▼
  (9) APROVAÇÃO ........ gestor da empresa  +  conferência do DP   ◄── portão humano
                         ▼
 (10) LANÇAMENTO ....... horas → rubricas → folha_lancamento (origem = 'ponto')
                         ▼
 (11) AEJ ............. reproduzível a partir de (2)+(5)+ajustes, a qualquer momento
```

**Regra dura:** nenhum passo pula, e **jornada com ocorrência aberta não vira lançamento** —
vira pendência visível, no mesmo padrão do motor fiscal. `[ENG]`

---

## 3. Ingestão e parsing

| # | Regra | Selo |
|---|---|---|
| I-01 | O arquivo bruto é armazenado **antes** de qualquer processamento, imutável, com SHA-256, tamanho, origem e responsável pela entrega | `[ENG]` |
| I-02 | Reimportação do mesmo hash é **idempotente**: não duplica marcação (mesmo princípio do `id_evento` estável do eSocial, `07 §2.3`) | `[ENG]` |
| I-03 | Linha que não parseia **não é descartada**: vira `folha_ponto_rejeito` com o texto original, o nº da linha e o motivo | `[ENG]` |
| I-04 | O **NSR** (número sequencial de registro do AFD) é preservado e usado para detectar **buraco de sequência** — sequência com salto é indício de arquivo truncado ou adulterado | `[ENG]` — depende do layout `○ C3` |
| I-05 | Buraco de NSR bloqueia a apuração da competência até tratativa humana registrada | `[ENG]` |
| I-06 | Marcação sem vínculo identificado (PIS/CPF desconhecido) vira ocorrência, nunca é jogada fora | `[ENG]` |

---

## 4. Marcações ímpares e batidas faltantes

O erro clássico de implementação é **inventar o par que falta**. Não se faz. `[ENG]`

| Situação | O que o sistema faz | O que o sistema **nunca** faz |
|---|---|---|
| Nº ímpar de marcações no dia | Jornada entra em `PAR_INCOMPLETO`; nenhuma hora é apurada; ocorrência aberta com o dia e o vínculo | Assumir a saída no fim da jornada prevista |
| Marcação de entrada sem saída no fim do turno | Idem | Fechar na meia-noite |
| Marcação de saída sem entrada | Idem | Assumir a entrada no início da jornada prevista |
| Repique (duas marcações da mesma pessoa em < N segundos) | Segunda marcada como `DUPLICADA` (não apagada); N é parâmetro por cliente, sem padrão silencioso | Deletar a linha |
| Dia inteiro sem marcação, com jornada prevista | Candidato a **falta**, mas entra como ocorrência `SEM_MARCACAO` para tratativa | Lançar falta automática — falta desconta DSR e pode ser atestado não entregue |
| Dia sem marcação e sem jornada prevista (folga/escala) | Nada, sem ocorrência | — |

### 4.1 As três saídas para uma batida faltante — todas com trilha

| Saída | Efeito | Exige |
|---|---|---|
| **Abono** (justificativa aceita: atestado, atraso de transporte, licença legal) | Dia tratado como trabalhado ou justificado; não desconta e não perde DSR | Justificativa em texto + documento anexo + aprovação |
| **Ajuste de marcação** (a batida existiu e não foi registrada) | Marcação **sobreposta** é criada; a original permanece intocada | Justificativa + aprovação + a marca de ajuste no espelho e no AEJ |
| **Desconto** (ausência sem justificativa) | Falta ou atraso; pode arrastar perda de DSR `[V-INDIRETO] 03 §14.1 etapa 5.9` | Aprovação; e ciência do empregado no espelho |

**Nenhuma das três roda sozinha.** Ajuste sem justificativa é o achado nº 1 da fiscalização
e o argumento nº 1 da reclamatória. Ver §10.3.

---

## 5. Tolerância

○ **PENDÊNCIA — não confirmado.** O regime de tolerância de marcação (CLT, art. 58, §1º e a
jurisprudência consolidada do TST sobre o tema) **não foi lido nesta rodada** — o egress
para `*.gov.br` seguiu bloqueado. **Fecha com:** `FONTES-A-BAIXAR` item **D4** (CLT) e a
Portaria MTP 671/2021 (item **C3**), acrescido do verbete do TST aplicável.

O que pode ser especificado agora sem inventar norma `[ENG]`:

| Parâmetro | Onde vive | Padrão |
|---|---|---|
| `tolerancia_por_marcacao_min` | `folha_parametro_ponto` (por cliente/estabelecimento, com vigência) | **`null`** |
| `tolerancia_dia_min` | idem | **`null`** |
| `modo_tolerancia` | idem | **`null`** — valores possíveis: `integral` \| `excedente` |
| `tolerancia_conta_para_atraso` | idem | **`null`** |

**A armadilha de implementação, e é grave:** tolerância é **limiar**, não dedução. Nos dois
modos possíveis, o resultado é diferente:

- `modo = integral`: excedido o limite, computa-se **todo** o tempo, não só o que passou do
  limite. (10 min de tolerância; trabalhou 12 min a mais ⇒ computa **12**.)
- `modo = excedente`: computa-se apenas o que passou do limite. (⇒ computa **2**.)

Escolher errado gera diferença sistemática em toda a carteira, todo mês. Enquanto o
parâmetro for `null`, **a apuração de extras não roda** e a jornada sai marcada como
PROVISÓRIA, com pendência visível — mesma regra do motor fiscal (`CLAUDE.md`, regra 1).

**Tolerância nunca se aplica a:** intervalo intrajornada (§6), adicional noturno (§7) e
banco de horas (§8) — são apurações de tempo, não de jornada extraordinária. `[ENG]`

---

## 6. Intervalo intrajornada

○ **PENDÊNCIA — não confirmado.** Duração mínima e máxima do intervalo por faixa de jornada,
possibilidade de redução por norma coletiva, e a **consequência da supressão** (CLT, art.
71 e §4º, na redação da Lei 13.467/2017) **não foram lidos**. **Fecha com:** item **D4**.
Três coisas dependem literalmente do texto e **não podem ser assumidas**:

1. o **percentual** devido sobre o período suprimido;
2. se o devido é **só o período suprimido** ou o intervalo inteiro;
3. a **natureza** da parcela (indenizatória ou salarial) — que decide as incidências de
   INSS, IRRF e FGTS, e portanto a classificação da rubrica no `S-1010`.

O que a engenharia especifica agora `[ENG]`:

| # | Regra |
|---|---|
| N-01 | O intervalo é **apurado**, não presumido: minutos entre a saída e o retorno do intervalo, dentro da jornada |
| N-02 | **Pré-assinalação** (`04 §11`, `[V-INDIRETO]`) é uma configuração explícita por estabelecimento, com o acordo que a autoriza anexado. Pré-assinalado significa: o intervalo não é marcado e é presumido pelo valor cadastrado — e essa presunção fica **visível no espelho** |
| N-03 | Detecção de supressão: `intervalo_apurado < intervalo_minimo_previsto` para a faixa de jornada do dia |
| N-04 | Supressão gera **ocorrência**, nunca rubrica automática. O valor só nasce com o percentual, a base e a natureza cadastrados |
| N-05 | A rubrica de intervalo suprimido é rubrica **própria**, com os três códigos de incidência preenchidos por humano (`07 §3`). Sem eles, não calcula |
| N-06 | Supressão é apurada e paga **por dia**, e o espelho lista os dias |
| N-07 | Intervalo **maior** que o previsto também é ocorrência: pode ser jornada elástica não autorizada, e é pedido comum em reclamatória |
| N-08 | Sistema sinaliza o padrão de **intervalo idêntico todos os dias** junto de marcações variáveis — indício de pré-assinalação disfarçada de marcação |

---

## 7. Jornada noturna, hora reduzida e a virada do dia

### 7.1 Os parâmetros (herdados, mesmo selo)

De `03 §6.3`, `[V-INDIRETO]`: urbano 20% e horário 22h–5h, com hora reduzida de **52 min
30 s**; rural 25%, horários próprios e **sem** redução; prorrogação após as 5h mantém o
adicional enquanto a jornada noturna se prorroga (Súmula 60, II, do TST); a redução pode ser
flexibilizada por norma coletiva mediante aumento correspondente do percentual.

### 7.2 A virada do dia — onde os sistemas quebram `[ENG]`

> **A jornada, não o calendário, é a unidade de apuração.**

Uma marcação às 02:15 do dia 01/09 pertence, quase sempre, à jornada iniciada em 31/08. Se
o sistema atribui marcações ao dia do relógio, três coisas quebram de uma vez: o pareamento
(fica ímpar dos dois lados), a apuração da jornada (duas jornadas curtas em vez de uma
longa) e a **competência** (horas do dia 31/08 caem em setembro).

Regras:

| # | Regra |
|---|---|
| VD-01 | Cada marcação recebe `data_referencia`, que é a data da jornada, não a data do relógio |
| VD-02 | A `data_referencia` vem da **escala/jornada prevista** do vínculo. Havendo âncora prevista, a marcação cai na jornada cuja janela a contém |
| VD-03 | Sem jornada prevista, aplica-se a janela: marcações dentro de `N` horas a partir da primeira marcação do turno pertencem à mesma jornada. `N` é parâmetro por cliente (jornada máxima admitida + folga), **sem padrão silencioso** |
| VD-04 | Marcação que não cabe em nenhuma janela vira ocorrência — nunca é forçada na jornada mais próxima |
| VD-05 | A jornada pertence à **competência da sua `data_referencia`**. Jornada iniciada em 31/08 e encerrada em 01/09 é integralmente da competência 08 |
| VD-06 | O adicional noturno é apurado sobre **minutos dentro da faixa noturna**, independentemente do dia civil em que caiam |

### 7.3 Ordem de apuração do noturno `[ENG]`

```
1. Somar os MINUTOS efetivamente trabalhados dentro da faixa noturna da jornada
   (excluindo intervalo), atravessando a virada do dia.
2. Se houver prorrogação após o fim da faixa e a regra da Súmula 60, II estiver
   habilitada para o cliente (parâmetro), somar também os minutos da prorrogação.
3. horas_noturnas_computadas = total_minutos ÷ 52,5        [V-INDIRETO] 03 §6.3
4. As horas computadas entram na CONTAGEM da jornada (é por isso que 7 h de relógio
   podem valer 8 h de jornada) e na base do adicional.
5. Só então se compara com a jornada contratual para apurar extra.
6. adicional_noturno = horas_noturnas_computadas × valor_hora_integrado × percentual
   (percentual: mínimo legal OU o da CCT — CCT prevalece; sem CCT cadastrada, PROVISÓRIO)
7. Hora que é noturna E extra recebe os dois adicionais — não se escolhe um.
```

**Exemplo de conferência (vira teste automatizado)** `[ENG]`, com os parâmetros de `03 §6.3`:

| Item | Valor |
|---|---|
| Entrada | 22:00 do dia 31/08 |
| Intervalo | 01:00 → 02:00 |
| Saída | 06:00 do dia 01/09 |
| Tempo em jornada (relógio) | 8 h 00 |
| Tempo trabalhado (relógio) | 7 h 00 |
| Minutos na faixa 22h–5h | 180 (22:00→01:00) + 180 (02:00→05:00) = **360** |
| Minutos de prorrogação após 5h | 60 (05:00→06:00) |
| Minutos noturnos totais | 420 |
| Horas noturnas computadas | 420 ÷ 52,5 = **8,0000 h** |
| Competência | **08/2026** (data de referência 31/08) |
| Leitura | 7 h de relógio = 8 h computadas; o adicional incide sobre as 8,0000 h |

> Se o cliente **não** tiver a regra da prorrogação habilitada, o resultado muda para
> 360 ÷ 52,5 = 6,8571 h noturnas + 1 h diurna. A diferença é material — por isso o
> parâmetro é explícito por cliente, e não um `if` escondido no código.

---

## 8. Banco de horas

### 8.1 Parâmetros (herdados, mesmo selo)

De `03 §6.1`, `[V-INDIRETO]`: compensação em até **6 meses** por acordo individual escrito
e até **12 meses** por acordo ou convenção coletiva; limite diário de 2 horas extras;
adicional mínimo de 50%, e o da CCT quando maior.

### 8.2 O desenho: saldo é derivado, movimento é o dado `[ENG]`

> **Saldo de banco de horas não é um campo. É a soma de movimentos com vencimento.**

Guardar um número mutável de saldo perde três informações que a rescisão e a reclamatória
exigem: **quando** a hora foi gerada, **quando** ela vence, e **por que** ela saiu.

| # | Regra |
|---|---|
| BH-01 | Tabela **append-only** de movimentos. Nunca `UPDATE`, nunca `DELETE`. Estorno é movimento contrário, com referência ao original |
| BH-02 | Todo crédito nasce com `vence_em` = data do crédito + prazo do **acordo vigente** (6 ou 12 meses conforme o instrumento). Sem acordo cadastrado, **não há banco de horas** — as horas são extras e se pagam |
| BH-03 | Consumo por **FIFO de vencimento**: compensa-se primeiro a hora que vence antes |
| BH-04 | `fator_credito` e `fator_debito` são parâmetros da CCT/acordo (a hora extra pode ser creditada 1:1 ou com o adicional). **Sem padrão silencioso** |
| BH-05 | Crédito que atinge `vence_em` sem compensação gera movimento `VENCIMENTO` e **pendência**: vira hora extra a pagar, com o adicional aplicável. O sistema não paga sozinho — abre a pendência e a tarefa |
| BH-06 | Saldo **negativo** nunca vira desconto automático. Vira ocorrência; o tratamento (compensação futura, desconto autorizado, abono) é decisão humana registrada |
| BH-07 | Na rescisão, saldo positivo é pago e saldo negativo segue a regra do acordo/CCT — parâmetro, com pendência quando ausente |
| BH-08 | Alterar o instrumento (acordo individual → coletivo, ou vice-versa) **não** recalcula o vencimento dos lotes antigos: cada lote guarda o prazo com que nasceu |
| BH-09 | Saldo migrado (B-20) entra como movimentos com `origem = 'MIGRADO'` e `vence_em` declarado. Sem vencimento declarado, o saldo entra em pendência antes do aceite (§5.6, V-12) |

---

## 9. Sobreaviso, escalas e feriados

### 9.1 Sobreaviso

`[V-INDIRETO] 03 §6.6`: valor de 1/3 do valor-hora normal; a Súmula 428 do TST exige
**escala de plantão** com restrição da liberdade de locomoção — o mero porte de celular não
caracteriza. Sobreaviso **não** é hora extra; o tempo efetivamente acionado vira hora normal
ou extra.

Desenho `[ENG]`:

| # | Regra |
|---|---|
| SB-01 | Sobreaviso vem de **escala cadastrada**, não de marcação de ponto. Não existe "sobreaviso apurado do AFD" |
| SB-02 | O acionamento **é** marcação (ou registro de chamado), e converte o intervalo acionado em tempo de trabalho, que sai da contagem de sobreaviso |
| SB-03 | Sobreaviso e tempo acionado nunca são pagos em duplicidade sobre o mesmo minuto |
| SB-04 | Escala de sobreaviso sem instrumento que a autorize (CCT/ACT/acordo) gera pendência |

### 9.2 Escalas

| # | Regra `[ENG]` |
|---|---|
| ES-01 | Toda jornada apurada é comparada com uma **jornada prevista**, que vem do calendário de escala do vínculo (5x2, 6x1, 12x36, turno ininterrupto, jornada parcial, intermitente) |
| ES-02 | O calendário de escala é **material**: gerado por regra, mas persistido dia a dia, para que a apuração de meses passados não mude quando a escala for alterada no futuro |
| ES-03 | Troca de escala tem vigência e não retroage |
| ES-04 | Em 12x36, o tratamento de feriado, DSR e intervalo é **parâmetro da CCT** — não regra do código |

### 9.3 Feriados — dado vivo, no padrão da CCT

| # | Regra |
|---|---|
| FE-01 | Tabela de feriados por **estabelecimento** (município), com camadas: nacional, estadual, municipal e ponto facultativo, cada uma com vigência e fonte `[ENG]` |
| FE-02 | Sem tabela de feriados do município do estabelecimento, **não se apura** trabalho em feriado, e portanto não se apura a faixa de 100% `[V-INDIRETO] 03 §6.1` — resultado PROVISÓRIO + pendência |
| FE-03 | A tabela é atualizada por rotina anual com **aprovação humana antes de sobrescrever**, no mesmo padrão da re-pesquisa mensal de UFs do motor fiscal (`CLAUDE.md`, regra 6) |
| FE-04 | O DSR depende de dias úteis e de domingos/feriados do mês `[V-INDIRETO] 03 §6.2`; a definição de "dia útil" (se o sábado entra) é **parâmetro da CCT**, e é pendência aberta em `03 §6.2` |

---

## 10. Modelo de dados do ponto

### 10.1 Marcação — imutável

```sql
create table folha_ponto_arquivo (
  id           uuid primary key default gen_random_uuid(),
  cliente_id   uuid not null,
  estab_id     uuid not null,
  tipo         text not null,        -- afd|api_fornecedor|planilha|app
  nome_original text not null,
  storage_path text not null,
  sha256       text not null,
  competencia  text,                 -- AAAA-MM de referência
  importado_em timestamptz not null default now(),
  importado_por text not null
);
create unique index on folha_ponto_arquivo (cliente_id, sha256);   -- idempotência

create table folha_ponto_marcacao (
  id            uuid primary key default gen_random_uuid(),
  arquivo_id    uuid not null references folha_ponto_arquivo(id),
  vinculo_id    uuid references folha_vinculo(id),   -- null = não identificado → ocorrência
  nsr           bigint,                              -- do AFD  ○ layout pendente (C3)
  momento       timestamptz not null,                -- instante da marcação
  data_referencia date,                              -- a JORNADA (VD-01), não o calendário
  tipo_marcacao text,                                -- entrada|saida|indefinido
  origem        text not null,                       -- rep_c|rep_a|rep_p|app|manual|importado
  identificador_rep text,
  linha_original text not null,                      -- SEMPRE preservada
  situacao      text not null default 'valida',      -- valida|duplicada|rejeitada
  hash_registro text not null,                       -- encadeado com o anterior do vínculo
  criado_em     timestamptz not null default now()
);
-- Trigger + RLS bloqueiam UPDATE e DELETE nesta tabela. Sem exceção.
```

### 10.2 Jornada apurada

```sql
create table folha_jornada_apurada (
  id             uuid primary key default gen_random_uuid(),
  vinculo_id     uuid not null references folha_vinculo(id),
  data_referencia date not null,
  competencia    text not null,                 -- AAAA-MM (VD-05)
  escala_id      uuid,
  prevista_min   integer,                       -- jornada prevista, em minutos
  trabalhada_min integer,                       -- relógio
  computada_min  integer,                       -- com hora noturna reduzida aplicada
  intervalo_min  integer,
  intervalo_previsto_min integer,
  noturno_min    integer,                       -- minutos na faixa noturna
  noturno_computado_centesimos integer,         -- horas fictas × 100
  extra_50_min   integer,
  extra_100_min  integer,
  falta_min      integer,
  atraso_min     integer,
  banco_credito_min integer,
  banco_debito_min  integer,
  situacao       text not null,                 -- apurada|par_incompleto|sem_marcacao|
                                                -- bloqueada|provisoria
  memoria        jsonb not null,                -- CADA etapa: pares usados, faixas,
                                                -- parâmetros e o folha_parametro.id
  parametros_provisorios boolean not null default false,
  apurada_em     timestamptz,
  versao         integer not null default 1
);
```

A `memoria` segue o mesmo princípio do `folha_calculo` (`07 §2.2`): guarda os pares de
marcação usados, os limiares aplicados, e o **id do parâmetro** que alimentou cada etapa. É
o que permite responder "por que essa hora extra apareceu?" sem reapurar na mão — e é o que
alimenta o espelho.

### 10.3 Ajuste de marcação e a trilha de auditoria

> Este é **o** ponto de reclamatória. A regra é uma só: **a marcação original nunca é
> alterada nem apagada.** O ajuste é um registro sobreposto, e ele aparece no espelho e no
> AEJ. `[ENG]`

```sql
create table folha_ponto_ajuste (
  id              uuid primary key default gen_random_uuid(),
  marcacao_id     uuid references folha_ponto_marcacao(id),  -- null = inclusão de batida
  vinculo_id      uuid not null references folha_vinculo(id),
  data_referencia date not null,
  tipo            text not null,      -- inclusao|exclusao_logica|alteracao_horario|
                                      -- abono|reclassificacao
  valor_anterior  jsonb,              -- estado antes (null na inclusão)
  valor_novo      jsonb not null,
  justificativa   text not null,      -- obrigatória, com tamanho mínimo; texto livre
  motivo_codigo   text not null,      -- taxonomia fechada: esquecimento|falha_rep|
                                      -- atestado|servico_externo|erro_importacao|
                                      -- decisao_gestor|ordem_judicial|outro
  documento_path  text,               -- anexo (atestado, declaração)
  solicitado_por  text not null,
  solicitado_em   timestamptz not null default now(),
  aprovado_por    text,               -- SEMPRE diferente de solicitado_por
  aprovado_em     timestamptz,
  ciencia_empregado_em timestamptz,   -- aceite no espelho
  ip              inet,
  user_agent      text,
  hash_anterior   text,               -- encadeamento
  hash_registro   text not null
);
-- Append-only: sem UPDATE, sem DELETE. Correção de ajuste = novo ajuste referenciando.
```

**As nove regras da trilha** `[ENG]`:

| # | Regra | Por que existe |
|---|---|---|
| A-01 | Marcação original imutável; ajuste é sobreposição | Sem o original, não há como provar o que o relógio registrou |
| A-02 | Justificativa em **texto livre obrigatória** + código de motivo de taxonomia fechada | Texto livre serve à defesa; o código serve ao relatório de padrão |
| A-03 | **Quatro olhos**: quem solicita nunca é quem aprova | Ajuste unilateral do gestor é o achado clássico |
| A-04 | Ajuste **retroativo além de N dias** exige aprovação de nível superior e entra em relatório | Ajuste antigo é o mais suspeito |
| A-05 | Registro do IP, do agente e do momento | Prova de autoria |
| A-06 | Hash encadeado por vínculo | Adulteração em massa fica detectável |
| A-07 | O espelho **mostra** que o dia foi ajustado, o motivo e por quem | O empregado que assina precisa saber o que assina |
| A-08 | O **AEJ carrega os ajustes**. AFD e AEJ divergindo sem trilha é o achado de fiscalização mais comum, e a presunção corre contra o empregador | O AEJ tem de ser reproduzível a partir dos dados (`04 §11`) |
| A-09 | Relatório mensal de **ajustes por gestor, por motivo e por empregado**, disponível ao DP | Concentração de ajustes num gestor é sinal, não coincidência |

**Detecções que o sistema deve sinalizar** (âmbar, nunca vermelho) `[ENG]`:

- **Marcação britânica**: horários idênticos ao minuto, dia após dia — indício de registro
  não fidedigno, tanto para a fiscalização quanto para o juízo.
- Volume anormal de ajustes num gestor, num empregado ou num motivo.
- Ajustes concentrados nos dias que gerariam hora extra.
- Intervalo sempre exatamente no mínimo.
- Marcações fora do horário de funcionamento do estabelecimento.

### 10.4 Banco de horas

```sql
create table folha_banco_horas_mov (
  id             uuid primary key default gen_random_uuid(),
  vinculo_id     uuid not null references folha_vinculo(id),
  data_mov       date not null,
  competencia    text not null,
  tipo           text not null,     -- credito|debito|vencimento|pagamento|estorno|
                                    -- rescisao|migrado
  minutos        integer not null,  -- sempre positivo; o sinal está no tipo
  fator          numeric(8,6) not null,   -- da CCT/acordo (BH-04)
  lote_credito_id uuid,             -- para consumo FIFO (BH-03)
  vence_em       date,              -- obrigatório em credito (BH-02)
  jornada_id     uuid references folha_jornada_apurada(id),
  instrumento_id uuid,              -- acordo/CCT que autoriza
  origem         text not null default 'CALCULADO',   -- CALCULADO|MIGRADO
  migracao_id    uuid,
  aprovado_por   text,
  observacao     text,
  criado_em      timestamptz not null default now()
);
-- Append-only. Saldo é sempre consultado por agregação, nunca armazenado.
```

### 10.5 Espelho de ponto

```sql
create table folha_ponto_espelho (
  id            uuid primary key default gen_random_uuid(),
  vinculo_id    uuid not null,
  competencia   text not null,
  versao        integer not null,
  conteudo      jsonb not null,     -- reprodutível: dias, marcações, ajustes, totais
  pdf_path      text,
  sha256        text not null,
  fechado_em    timestamptz,
  aceite_em     timestamptz,        -- aceite/assinatura do empregado
  aceite_meio   text,               -- portal|assinatura_eletronica|papel_digitalizado
  aceite_ip     inet
);
```

O espelho assinado é **prova documental** (`04 §11`) — guardado e versionado, nunca
regerado por cima. Nova versão é nova linha.

---

## 11. O portão humano: o que precisa de aprovação antes de virar hora extra paga

> Nenhuma hora extra vai para a folha por caminho automático. `[ENG]`

Quatro condições cumulativas:

| # | Condição | Quem |
|---|---|---|
| G-01 | A jornada está **apurada** — sem par incompleto, sem buraco de NSR, sem parâmetro `null` em uso | Sistema |
| G-02 | Todo ajuste do período está aprovado por quem não o solicitou (A-03) | Gestor / DP |
| G-03 | O **espelho** da competência está fechado e disponibilizado ao empregado, com aceite quando o processo do cliente o exigir | Empregado |
| G-04 | Aprovação explícita do gestor da empresa cliente **e** conferência do DP do escritório | Cliente + G41 |

### 11.1 Hora extra não autorizada previamente

Quando a CCT ou a política interna exige autorização prévia e ela não existe, o excedente
**não desaparece**. Isso é o erro que gera passivo: sistema que "corta" hora trabalhada por
falta de autorização está descartando prova de trabalho prestado, e o descarte não apaga o
fato — apaga só o registro. `[ENG]`

Tratamento correto:

```
hora trabalhada além da jornada
   ├─ com autorização prévia registrada  → classifica como extra → segue para G-01..G-04
   └─ sem autorização                    → classifica como EXCEDENTE NÃO AUTORIZADO
                                          → permanece registrada e visível
                                          → ocorrência para decisão humana:
                                             pagar | compensar em banco | tratar como
                                             indevida COM justificativa e ciência
```

### 11.2 De-para: hora apurada → rubrica da folha

| Grandeza apurada | Rubrica | Observação |
|---|---|---|
| Extra na faixa comum | Hora extra (percentual mínimo ou o da CCT) | Base = valor-hora **integrado** `[V-INDIRETO] 03 §14.1 etapa 1.3` |
| Extra em domingo/feriado sem folga compensatória | Hora extra faixa 100% | `[V-INDIRETO] 03 §6.1`; depende da tabela de feriados (FE-02) |
| Horas noturnas computadas | Adicional noturno | Sobre horas fictas, §7.3 |
| Intervalo suprimido | Rubrica própria | Percentual, base e natureza: **○ pendente** (§6) |
| Sobreaviso | Sobreaviso | 1/3 do valor-hora `[V-INDIRETO] 03 §6.6` |
| Falta / atraso | Desconto + eventual **DSR perdido** | `[V-INDIRETO] 03 §14.1 etapa 5.9` |
| Variáveis do mês (extras, noturno) | **DSR sobre variáveis** | Fórmula em `03 §6.2`; depende de dias úteis e da definição de sábado (○ pendente) |
| Crédito/débito de banco | Nenhuma rubrica no mês | Só movimenta o banco (§8) |
| Vencimento de lote de banco | Hora extra a pagar | Com pendência (BH-05) |

Todo lançamento entra em `folha_lancamento` com `origem = 'ponto'` e o `jornada_id` de
proveniência (`07 §2.2`) — para que o holerite consiga voltar da rubrica até o dia
trabalhado.

---
---

# PARTE III — HOLERITE

## 1. Conteúdo obrigatório por norma

○ **PENDÊNCIA — não confirmado.** O conteúdo legal obrigatório do recibo de pagamento de
salário **não foi lido na fonte nesta rodada**. Os dispositivos que fecham a questão, e que
precisam ser abertos antes de qualquer campo virar obrigatório na tela:

| # | O que falta confirmar | Onde fecha |
|---|---|---|
| H-01 | Exigência e forma do **comprovante/recibo de pagamento** e da discriminação das parcelas (CLT, art. 464 e parágrafo único) | `FONTES-A-BAIXAR` item **D4** |
| H-02 | Obrigação de **informar ao empregado o valor do FGTS** depositado, e a periodicidade | Item **D2** (Lei 8.036/1990) e item **C1** (Manual do FGTS Digital) |
| H-03 | Se há exigência de discriminar **base de cálculo** de INSS, FGTS e IRRF no documento | Itens **D3**, **D4** e a legislação do IRRF (item **B9**) |
| H-04 | Exigência de **assinatura/aceite** do empregado e as formas eletrônicas admitidas | Item **D4** + Portaria MTP 671/2021 (item **C3**) |
| H-05 | **Prazo de guarda** do recibo | Item **D4**; cruzar com `06` (LGPD e prazos de guarda) |
| H-06 | Regras específicas de **doméstico** e de **aprendiz** | Fora do escopo desta rodada (`04 P-21`) |

**Regra de implementação enquanto H-01 a H-05 estiverem abertos** `[ENG]`: o gerador de
holerite trabalha com um **catálogo de campos versionado** (`folha_holerite_campo`), onde
cada campo carrega `obrigatorio_por_norma` como **`null`** até a confirmação. Nenhum campo é
suprimido por decisão do sistema, e nenhum é declarado obrigatório sem fonte. Na prática:
imprime-se o conjunto amplo abaixo, e a confirmação normativa depois apenas **trava** o que
não pode sair, em vez de acrescentar o que faltava.

### 1.1 Conjunto de campos que o gerador produz `[ENG]`

| Bloco | Campos |
|---|---|
| Identificação do empregador | Razão social, CNPJ (texto — CNPJ alfanumérico, `07 §2.3`), endereço do estabelecimento, CNAE preponderante |
| Identificação do empregado | Nome, matrícula (a **mesma** do eSocial, B-17), CPF, cargo e CBO, data de admissão, lotação, categoria |
| Competência | Mês/ano, tipo (mensal, adiantamento, férias, 13º 1ª/2ª parcela, rescisão, complementar), data de pagamento |
| Rubricas | Código, descrição, **referência** (dias, horas, percentual, quantidade), valor, coluna (provento/desconto) |
| Totais | Total de proventos, total de descontos, **líquido** |
| Bases | Base INSS, base FGTS, **FGTS do mês**, base IRRF, faixa de IRRF aplicada, nº de dependentes de IRRF |
| Salário | Salário-base contratual, salário-hora usado no mês, divisor aplicado |
| Rodapé | Instrumento coletivo aplicável (sindicato e vigência), espaço de assinatura/aceite, identificação do sistema e a **marca PROVISÓRIO** quando houver parâmetro não verificado |

---

## 2. O que a G41 acrescenta por clareza

O holerite de mercado responde "quanto você recebeu". Ele **não** responde as duas perguntas
que o empregado de fato faz. Este é o espaço de diferenciação do Lior — e é diferenciação de
**experiência e dados**, exatamente onde `00-LEIA-PRIMEIRO.md §5` diz que está o ativo.

| Bloco adicional | Responde | Custo de implementar |
|---|---|---|
| **O que mudou** — comparativo com a competência anterior, rubrica a rubrica, ordenado pela maior variação | "por que o líquido caiu?" | Baixo: os dados já estão em `folha_calculo` |
| **Acumulado do ano** — rendimentos, INSS, IRRF, FGTS, com o mês a mês | "quanto eu ganhei no ano?" | Baixo |
| **Suas férias** — período aquisitivo, dias disponíveis, data-limite de gozo | Reduz a pergunta mais frequente ao DP | Médio: depende de B-03 correto |
| **Seu 13º** — avos acumulados e estimativa da próxima parcela | Antecipa a dúvida de novembro | Baixo |
| **Banco de horas** — saldo e **quando vence** | Evita a surpresa da rescisão | Médio: depende do modelo §8 da Parte II |
| **Memória de cálculo** — três níveis (§4) | "essa conta está certa?" | Médio |
| Rodapé de **procedência** quando há saldo migrado no cálculo (R-05) | Auditoria e honestidade | Baixo |

### 2.1 Um bloco que eu **não** recomendaria por padrão `[ENG]`

Muitos sistemas oferecem "custo total para o empregador" no holerite. Antes de ligar isso:

- é dado do **empregador**, não do empregado, e a decisão de expor é do cliente, não do
  escritório;
- em empresa com clima ruim, lido como "veja quanto você me custa", produz atrito imediato;
- e é o número que mais vira print em grupo de WhatsApp.

Recomendação: **desligado por padrão**, ligável por cliente, com registro de quem ligou e
quando. Se o cliente quiser, o lugar natural é o portal do gestor — não o holerite do
empregado.

---

## 3. As duas perguntas

### 3.1 "Por que o líquido caiu?"

O bloco compara a competência atual com a anterior e **explica**, não só exibe. Fonte da
explicação: a `memoria` do `folha_calculo` — nunca texto livre gerado por modelo. `[ENG]`

> **Regra de segurança que vem do `06` e do `07 §4`:** o gerador de texto é de **template**,
> preenchido com valores locais. Nome, CPF, salário e dado de saúde **não saem** para
> nenhum modelo. Se um dia houver assistente explicando holerite, ele recebe rubrica, base e
> resultado — nunca a pessoa.

Causas típicas e o texto correspondente:

| Causa detectada na memória | Texto ao empregado |
|---|---|
| Menos horas extras que no mês anterior | "Você teve X h de hora extra neste mês, contra Y h em [mês]. Diferença: −R$ Z." |
| Faltas ou atrasos no mês | "Foram descontados N dias/horas de ausência, mais o descanso semanal correspondente." |
| Mudança de faixa de IRRF | "Seu rendimento tributável subiu de R$ A para R$ B e passou para outra faixa da tabela do imposto de renda. O imposto subiu R$ C." |
| Teto do INSS atingido no mês anterior e não neste | "No mês passado seu desconto de INSS parou no teto. Neste mês, a base ficou abaixo dele." |
| Início de desconto novo (consignado, plano, coparticipação) | "Começou neste mês o desconto de [rubrica], parcela N de M." |
| Fim de adicional (noturno, insalubridade) | "O adicional de [X] deixou de ser pago porque [condição] mudou em DD/MM." |
| Dependente que perdeu o direito por idade | "A dedução de dependente de [nome] terminou em DD/MM, conforme a regra de idade." |
| Férias no mês (competência partida) | "Parte do mês foi paga como férias, no recibo de férias de DD/MM. Some os dois documentos para o total do período." |
| Adiantamento já recebido | "O adiantamento de R$ X, pago em DD/MM, foi abatido aqui." |

Se a variação **não** é explicada por nenhuma regra conhecida, o bloco diz isso — e abre
pendência interna para o DP antes de o holerite ser liberado. Silêncio, aqui, é o erro.
`[ENG]`

### 3.2 "Quanto eu ganhei no ano?"

| Item | Regra |
|---|---|
| Bloco de acumulados | Rendimento bruto, rendimento tributável, INSS, IRRF, FGTS depositado — acumulados no ano-calendário, com o mês a mês disponível no portal |
| Marca de procedência | Se parte do acumulado é migrada de outro sistema (B-08), o bloco **diz isso**: "R$ X referentes a jan–mar/AAAA vêm do sistema anterior" (R-04/R-05). Não fingir autoria |
| Comprovante de rendimentos | Documento anual, separado. ○ **PENDÊNCIA** — norma vigente e prazo após a extinção da DIRF (`04 P-01`; fecha com item **B8**) |
| Coerência | O acumulado exibido tem de bater com o `S-5002`/`S-1210` da mesma janela. Divergência = pendência, não nota de rodapé |

---

## 4. A memória de cálculo que o empregado entende

Três níveis, progressivos. O nível 1 está no papel; os níveis 2 e 3 abrem no portal. `[ENG]`

```
SALÁRIO DE CONTRIBUIÇÃO DO MÊS: R$ 6.000,00

NÍVEL 1 — O NÚMERO             INSS                                     −  641,51

NÍVEL 2 — A CONTA, EM LINGUAGEM DE GENTE
   "Seu INSS é calculado por faixas, como degraus. Cada pedaço do salário paga
    uma alíquota diferente — não é uma alíquota única sobre tudo."
      1ª faixa   até 1.621,00 ......... 1.621,00 × 7,5%  →  121,58
      2ª faixa   1.621,01–2.902,84 .... 1.281,84 ×  9,0%  →  115,37
      3ª faixa   2.902,85–4.354,27 .... 1.451,43 × 12,0%  →  174,17
      4ª faixa   4.354,28–8.475,55 .... 1.645,73 × 14,0%  →  230,40
      -------------------------------------------------------------
      total ..................................................  641,51
      alíquota efetiva sobre o seu salário ...................  10,69%

NÍVEL 3 — A FONTE
   Tabela vigente desde DD/MM/AAAA · norma [ref] · parâmetro #id · verificada em DD/MM/AAAA
```

> As faixas do exemplo são as de `03 §2.1` — selo `AR`/`CV`, **○ pendentes** de leitura no
> texto original (itens **B2** e **D1**). Servem para provar o layout e a redação, não para
> validar o motor. O gerador lê sempre de `folha_parametro`, nunca de constante; quando o
> parâmetro tem `fonte_verificada = false`, o holerite sai marcado **PROVISÓRIO**.

Quatro regras de redação `[ENG]`:

| # | Regra |
|---|---|
| M-01 | Sem jargão sem tradução: "base de cálculo" vira "o valor sobre o qual a conta é feita" |
| M-02 | Toda linha de cálculo mostra **de onde saiu o número de entrada** (que rubricas somaram a base) |
| M-03 | Percentual efetivo aparece junto do nominal — é o que responde "por que dizem 11% e o meu deu 9,4%?" |
| M-04 | Nenhuma explicação afirma norma que esteja pendente. Onde o parâmetro não está verificado, o nível 3 diz "aguardando verificação da fonte", e não inventa a citação |

---

## 5. Layout

### 5.1 Identidade (`CLAUDE.md`)

Navy `#0B1740`, âmbar `#E9A74A`, branco. **ZERO vermelho.** Valores fiscais e códigos em
**IBM Plex Mono**; texto em **Archivo**. Painel no estilo **canhoto de nota fiscal**.

**Desconto não é vermelho** — e essa não é só uma regra de marca, é boa prática: cor sozinha
nunca deve carregar informação (daltonismo, impressão em preto e branco, fotocópia). Um
desconto se identifica por **três** sinais redundantes: a **coluna** em que está, o **sinal
`−`** e o **rótulo**. Âmbar fica reservado para atenção e pendência. `[ENG]`

### 5.2 Wireframe

```
╔══════════════════════════════════════════════════════════════════════════════╗
║ [G41]  RECIBO DE PAGAMENTO DE SALÁRIO            Competência  08/2026        ║  navy
║ EMPREGADOR LTDA · CNPJ 00.000.000/0001-00        Pagamento    05/09/2026     ║  branco
╠══════════════════════════════════════════════════════════════════════════════╣
║ Nome do Empregado                    Matrícula 000123   Admissão 12/03/2021  ║
║ Cargo · CBO 000000                   Lotação Matriz     Categoria 101        ║
╠══════╤═══════════════════════════════╤═══════════╤══════════════╤════════════╣
║ Cód  │ Descrição                     │ Referência│   Proventos  │  Descontos ║
╟──────┼───────────────────────────────┼───────────┼──────────────┼────────────╢
║ 0001 │ Salário base                  │      30 d │     6.000,00 │            ║  mono
║ 0102 │ Horas extras 50%              │   12h30m  │       511,36 │            ║
║ 0110 │ Adicional noturno             │  8,00 h*  │        43,64 │            ║
║ 0150 │ DSR sobre variáveis           │    4 dom. │       100,91 │            ║
║ 9001 │ INSS                          │    11,02 %│              │ −   733,34 ║
║ 9002 │ IRRF                          │    faixa 3│              │ −   402,18 ║
║ 9210 │ Consignado — parcela 7 de 24  │           │              │ −   380,00 ║
╠══════╧═══════════════════════════════╧═══════════╪══════════════╪════════════╣
║                                        TOTAIS    │     6.655,91 │ − 1.515,52 ║
║                                        LÍQUIDO A RECEBER        │   5.140,39 ║  ← destaque
╠══════════════════════════════════════════════════════════════════════════════╣
║ Base INSS 6.655,91 │ Base FGTS 6.655,91 │ FGTS do mês 532,47 │ Base IRRF ... ║
╠═══════════════════ canhoto ══════════════════════════════════════════════════╣
║ O QUE MUDOU EM RELAÇÃO A 07/2026            ▸ líquido −R$ 214,80             ║
║   Horas extras          12h30m  ◂ 18h00m    −R$ 224,64                       ║
║   IRRF                  −402,18 ◂ −412,02   +R$   9,84                       ║
║                                                                              ║
║ NO ANO (jan–ago/2026)   Bruto 52.918,40 · INSS 5.702,10 · IRRF 3.114,55      ║
║                         FGTS depositado 4.233,47                             ║
║                                                                              ║
║ SUAS FÉRIAS   período 12/03/2025–11/03/2026 · 30 dias · gozar até 11/03/2027 ║
║ SEU 13º       8 avos acumulados                                              ║
║ BANCO DE HORAS  +6h20m · vencem 4h00m em 30/11/2026                          ║
║                                                                              ║
║ * hora noturna computada com redução legal. Detalhe da conta no portal.       ║
║ [QR]  Ver memória de cálculo · portal do empregado                           ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

Números do wireframe são **ilustrativos** — servem para provar o layout, não para validar o
motor. Os testes-âncora do cálculo são os de `03 §15`.

### 5.3 Regras de renderização `[ENG]`

| # | Regra |
|---|---|
| L-01 | **Um alinhamento decimal só** para toda coluna de valor, em mono. Valor desalinhado é o que faz o holerite parecer improvisado |
| L-02 | Coluna de referência sempre preenchida quando houver quantidade (dias, horas, percentual). Rubrica sem referência é a que gera dúvida |
| L-03 | Faixa **PROVISÓRIO** em âmbar, no topo, quando qualquer parâmetro do cálculo tem `fonte_verificada = false` (`CLAUDE.md`, regra 1; `07 §2.1`) |
| L-04 | Rodapé de procedência quando há saldo migrado no cálculo (R-05) |
| L-05 | Versão em **uma página** para impressão; blocos do canhoto colapsáveis no portal |
| L-06 | Acessibilidade: contraste mínimo 4,5:1, e nenhuma informação transmitida só por cor |
| L-07 | O PDF é **derivado**, nunca a fonte: tem de ser reproduzível byte a byte a partir de `folha_calculo` + versão do template |

---

## 6. Distribuição, prova de entrega e LGPD

Folha é o agregado de maior risco do escritório (`06 §1.1`). O holerite é o momento em que
ela **sai** do sistema. `[ENG]`, com o desenho herdado de `06` e `07 §4`:

| # | Regra |
|---|---|
| D-01 | Canal preferencial: **portal do empregado com autenticação**. E-mail e mensageria carregam link, não o arquivo |
| D-02 | Se PDF anexado for inevitável, ele vai **protegido**, e a senha nunca viaja pelo mesmo canal |
| D-03 | **Nunca** enviar holerite para grupo, lista ou número não confirmado. Envio em lote para o gestor é vazamento de dado de terceiro |
| D-04 | Log de **leitura**, não só de envio (`07 §4` — em folha, quem olhou importa tanto quanto quem alterou) |
| D-05 | Aceite/assinatura eletrônica registrada com momento, meio e IP |
| D-06 | Retenção conforme prazo de guarda — ○ **pendente** (H-05), cruzar com `06` |
| D-07 | Reemissão gera **nova versão**, com o motivo. Holerite não é sobrescrito |

```sql
create table folha_holerite (
  id             uuid primary key default gen_random_uuid(),
  calculo_id     uuid not null references folha_calculo(id),
  vinculo_id     uuid not null,
  competencia    text not null,
  tipo           text not null,   -- mensal|adiantamento|ferias|13_1|13_2|rescisao|
                                  -- complementar
  versao         integer not null,
  template_versao text not null,
  provisorio     boolean not null,       -- L-03
  contem_saldo_migrado boolean not null, -- L-04
  conteudo       jsonb not null,         -- tudo que o PDF mostra, reproduzível
  pdf_path       text,
  sha256         text not null,
  gerado_em      timestamptz not null default now(),
  entregue_em    timestamptz,
  entregue_meio  text,
  lido_em        timestamptz,
  aceite_em      timestamptz,
  motivo_reemissao text
);
```

---
---

# PENDÊNCIAS

## Como ler esta seção

Nenhum item abaixo pode virar constante, prazo, texto de tela ou cláusula de contrato antes
de ser lido na fonte. Onde o item é bloqueador, a área correspondente **não começa a ser
codificada**. Namespace: `M-` migração, `T-` ponto (tempo), `H-` holerite.

## Migração

| # | Pendência | O que trava | Fecha com |
|---|---|---|---|
| M-01 | Prazo de guarda dos dados migrados e dos arquivos de origem | Política de retenção da carga; conflito potencial com a minimização da LGPD | `FONTES-A-BAIXAR` **D4**, **C3**, e o `06` |
| M-02 | Regra de **retificação de competência anterior à data de corte** no eSocial quando o declarante era outro sistema | Define se R-01 é definitiva ou tem exceção | **A1** (MOS) e **A5** (MOD) |
| M-03 | Se é exigível reenviar `S-1010` ao trocar de sistema, ou se as rubricas do declarante anterior permanecem válidas | Escopo da fase 2 do roteiro (§5.3) | **A1**, **A2** |
| M-04 | Norma e prazo do **comprovante de rendimentos** após a extinção da DIRF | Item 10 do critério de aceite (§5.7) e o bloco "no ano" do holerite | **B8** (já em `04 P-01`) |
| M-05 | Regras de **FGTS em atraso** herdado (juros e atualização) | Conferência V-04 quando a empresa vem com competências em aberto | **D2** (já em `04 P-04`) |
| M-06 | Existência de **API do FGTS Digital** e de transmissão programática da DCTFWeb | Automatizar as conferências V-04 e V-14 ou fazê-las à mão | **C1**, **B6** (já em `04 P-18`) |

## Ponto eletrônico

| # | Pendência | O que trava | Fecha com |
|---|---|---|---|
| T-01 | **Layout do AFD e do AEJ** (anexos da Portaria MTP 671/2021) | **BLOQUEADOR do parser.** Nada do passo (2) da cadeia é escrito sem isso | **C3** (já em `04 P-14`) |
| T-02 | **Tolerância** de marcação: limites por marcação e diário, e o **modo** (integral × excedente) | **BLOQUEADOR da apuração de extras** (§5). Enquanto `null`, jornada sai PROVISÓRIA | **D4** (CLT art. 58, §1º) + verbete do TST aplicável |
| T-03 | **Intervalo intrajornada**: duração por faixa de jornada, redução por norma coletiva, percentual devido na supressão, se o devido é o período suprimido ou o intervalo inteiro, e a **natureza** da parcela | **BLOQUEADOR da rubrica de intervalo** (§6) — a natureza decide as três incidências do `S-1010` | **D4** (CLT art. 71 e §4º) |
| T-04 | Requisitos formais do **ponto por exceção** e da **pré-assinalação** | Configuração N-02 e o que o espelho precisa declarar | **C3** |
| T-05 | **Prazo de guarda** dos registros de ponto, do AFD e dos espelhos | Retenção e custo de armazenamento | **C3**, **D4** |
| T-06 | Se o **AEJ** precisa carregar formalmente os ajustes e em que campo | Regra A-08 — hoje é decisão de engenharia, precisa de lastro | **C3** |
| T-07 | Regra de arredondamento de **minutos para horas centesimais** na conversão para rubrica | Divergência de centavos contra o sistema antigo no paralelo (§5.5). Conecta com a pendência de arredondamento de `03 §14.2` | Definir no projeto e validar contra os totalizadores `S-5001`/`S-5011` em produção restrita |
| T-08 | Percentuais de hora extra, fator de banco de horas, prazo de compensação e tratamento de feriado em 12x36 | Vêm da **CCT**, não da lei — e o cadastro de CCT é bloqueador próprio | **C5** (Mediador) + `04 §12` |
| T-09 | Aplicabilidade da prorrogação do adicional noturno após as 5h (Súmula 60, II) como parâmetro por cliente | Muda o resultado do exemplo de §7.3 em ~1,14 h por jornada | Verbete do TST + CCT |

## Holerite

| # | Pendência | O que trava | Fecha com |
|---|---|---|---|
| H-01 | Exigência e forma do recibo e da **discriminação das parcelas** | Quais campos são obrigatórios × opcionais | **D4** (CLT art. 464) |
| H-02 | Obrigação de informar o **FGTS depositado** e a periodicidade | Bloco de bases do holerite | **D2**, **C1** |
| H-03 | Exigência de discriminar as **bases** de INSS, FGTS e IRRF | Idem | **D3**, **D4**, **B9** |
| H-04 | **Assinatura/aceite** do empregado e formas eletrônicas admitidas | D-05 e o valor probatório do aceite | **D4**, **C3** |
| H-05 | **Prazo de guarda** do recibo | D-06 | **D4**, `06` |
| H-06 | Regras específicas de **doméstico** e **aprendiz** | Escopo do gerador | Fora desta rodada (`04 P-21`) |
| H-07 | Se há vedação a exibir determinados dados no holerite (custo do empregador, por exemplo) | O bloco opcional de §2.1 | **D4** + `06` |

## Bloco G — já acrescentado a `FONTES-A-BAIXAR.md`

Os sete itens abaixo foram incorporados à checklist em 30/08/2026, como **Bloco G**
(encaminhamento 4 da `AUDITORIA-anti-invencao.md`). Repetidos aqui para leitura local.

| # | Documento | Fecha | Prioridade |
|---|---|---|---|
| G1 | **Portaria MTP 671/2021 — Anexos** (layout do AFD e do AEJ) | T-01, T-04, T-05, T-06. Já parcialmente coberto pelo item **C3**, mas o anexo precisa ser baixado **separado** e ter hash próprio | **BLOQUEADOR do parser de ponto** |
| G2 | **CLT, art. 58 e §1º** + verbete do TST sobre tolerância | T-02 | **BLOQUEADOR da apuração de extras** |
| G3 | **CLT, art. 71 e §4º** (redação da Lei 13.467/2017) | T-03 | **BLOQUEADOR da rubrica de intervalo** |
| G4 | **CLT, art. 464 e parágrafo único** | H-01, H-03, H-04, H-05 | **BLOQUEADOR do holerite** |
| G5 | **Lei 8.036/1990, art. 17** e correlatos sobre informação ao trabalhador | H-02 | Alta |
| G6 | **MOS S-1.3** — capítulo de **eventos extemporâneos e retificação** | M-02, M-03 | Alta (já sob **A1**, mas com pergunta específica de migração) |
| G7 | **Súmula 60 do TST** (item II) | T-09 | Média |

---

## O que este documento não resolve

Registrado para não virar promessa implícita:

- **Rescisão, férias e 13º ainda não têm exemplo numérico completo** (`AUDITORIA` seção D,
  `07 §6`). Este documento especifica a **migração** dessas bases e o **consumo** delas no
  holerite; não especifica o cálculo.
- **Massa de teste oficial da folha** continua inexistente — a planilha citada no
  `CLAUDE.md` é fiscal. Os batimentos de §5.6 e o exemplo de §7.3 são candidatos naturais a
  primeiros casos.
- **Plano de reconciliação contra os totalizadores** do eSocial é citado aqui (V-03 a V-05)
  como batimento de migração; a especificação completa está em
  **`09-rubricas-e-reconciliacao.md` §5** — os batimentos desta parte são um caso particular
  dela, aplicado ao corte.
- **Portal do empregado** — o holerite pressupõe um, e ele não está desenhado.
- **CCT como tabela viva** é pré-requisito de metade da Parte II (T-08) e tem bloqueador
  próprio no item **C5**.

---

**Insights Impulsionam.**
