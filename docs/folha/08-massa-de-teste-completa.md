# Massa de teste completa — férias, 13º, rescisão, frequência e folha complementar

> **Documento de engenharia de cálculo do motor de folha do Lior.**
> Preenche a lacuna registrada na **seção D da `AUDITORIA-anti-invencao.md`**: os seis
> documentos de pesquisa descrevem rescisão, férias e 13º **sem um único exemplo numérico
> completo**, e não tratam de folha complementar, adiantamento, proporcionalização de
> admissão/demissão no meio do mês nem de faltas, atrasos e perda do DSR.
> **Data de elaboração: 30/08/2026.**

---

## 0. Selo de evidência — leia antes de usar qualquer número

**Todos os valores deste documento herdam o selo do `03-motor-calculo-folha.md`.**

| Selo herdado | Significado | Onde se aplica |
|---|---|---|
| **AR** | **Coerência aritmética provada.** Cada número foi produzido e reconferido por script, e fecha com os demais números do próprio caso. **Não é confirmação de vigência.** | Todos os cálculos deste documento |
| **CV** | **Convergência entre fontes secundárias**, sem leitura do texto normativo | As regras de incidência e as fórmulas herdadas do `03` |
| ○ | **PENDÊNCIA** — não confirmado. Não codificar | Seção 9 deste documento e seção 16 do `03` |

**Declaração obrigatória, repetida do documento `03`:**

> Nenhuma tabela usada aqui foi lida no texto normativo original. O egress desta sessão
> continua bloqueado para `*.gov.br`, `planalto.gov.br` e `in.gov.br`. As tabelas de INSS,
> IRRF, salário mínimo, salário-família e do redutor da Lei 15.270/2025 vêm do `03`, que as
> obteve por fonte secundária. **A aritmética é conferida; a vigência não.** Todo valor
> gravado no banco a partir daqui nasce com `fonte_verificada = false`, e todo cálculo que o
> use sai marcado como **PROVISÓRIO**.

**O que este documento acrescenta e o que não acrescenta.** Ele acrescenta **aritmética
conferida** e **ordem de apuração**. Ele **não** acrescenta lastro normativo: nenhuma regra
nova foi pesquisada, nenhuma fonte nova foi aberta. Onde uma regra necessária ao caso não
está confirmada no `03`, o parâmetro foi **fixado no enunciado do caso** e rotulado
**premissa do caso de teste, não regra do motor** — nunca embutido como valor padrão.

### 0.1 Método de conferência

Cada caso foi calculado por um script em Python com aritmética decimal (`Decimal`,
arredondamento *half-up*, 4 casas nos intermediários e 2 no resultado de cada verba,
conforme a seção 14.2 do `03`). O script contém **145 asserções**, das quais **22 reproduzem
os três holerites e os treze testes-âncora do `03`** — se o motor mudar e essas 22 quebrarem,
a mudança quebrou o que já estava provado. Uma segunda rodada de **41 verificações** conferiu
os totais, somas de holerite e comparativos escritos neste texto contra o script — **186
conferências no total, nenhuma falha**. **Nenhum número foi publicado aqui sem que o script
o reproduzisse.** Duas conferências manuais divergiram do script e o script estava
certo nas duas (INSS de R$ 2.700,00 — faixa 2, não faixa 3; e o redutor sobre RBM de
R$ 5.866,67). É exatamente para isso que o script existe.

### 0.2 Premissas comuns a todos os casos

| Parâmetro | Valor fixado | Classificação |
|---|---|---|
| Competência de referência | 2026 | — |
| Regime da empresa | normal (Lucro Real/Presumido), comércio | premissa do caso |
| RAT | 2% | **premissa do caso de teste, não regra do motor** (`03` §5.1 e auditoria O-05) |
| FAP | 1,0000 | **premissa do caso de teste** — FAP é individual por CNPJ, nunca presumido |
| Terceiros | 5,8% | **premissa do caso de teste** (rateio por FPAS é pendência P07 do `03`) |
| Divisor do salário-hora | 220 (44h/semana) | **premissa do caso de teste** (pendência P10 do `03` — não há norma única) |
| Adicional de hora extra | 50% | **premissa do caso de teste** (pendência P05 — a CCT pode exigir mais) |
| Divisor de dias | 30, sempre | herdado do `03` §14.2 (CLT art. 64, mensalista) |
| RBM do redutor do IRRF | rendimento **bruto** da base, antes das deduções | **premissa herdada** do `03` §3.2 — pendência P02, criticidade ALTA |
| Base de insalubridade/periculosidade | não aplicável (nenhum caso tem) | evita a pendência do `03` §6.4 |

**Parâmetros vigentes usados (todos do `03`, selo AR):** salário mínimo R$ 1.621,00;
faixas do INSS 1.621,00 / 2.902,84 / 4.354,27 / 8.475,55 (7,5% / 9% / 12% / 14%), com teto de
desconto R$ 988,09; tabela do IRRF isenta até R$ 2.428,80, com parcelas a deduzir 182,16 /
394,16 / 675,49 / 908,73; dependente R$ 189,59; desconto simplificado R$ 607,20; redutor da
Lei 15.270/2025 com coeficientes 5.000,00 / 7.350,00 / 978,62 / 0,133145; FGTS 8%.

⚠ **O redutor da Lei 15.270/2025 domina o resultado de quase todo caso deste documento.**
Ele zera o IRRF de bases até R$ 5.000,00 e decresce até R$ 7.350,00. Em consequência: (a)
vários casos que "deveriam" ter imposto saem com IRRF zero; (b) na faixa de R$ 5.000,01 a
R$ 7.350,00 a **alíquota marginal efetiva do IRRF é 27,5% + 13,3145% = 40,81%** — ver o
caso C1, onde a carga marginal total sobre uma hora extra chega a **50,96%**. Se a definição
de RBM (pendência P02) mudar, muda o resultado de praticamente toda esta massa de teste.

---

## 1. FÉRIAS

### 1.1 A assimetria que o documento `03` chama de erro nº 1

O `03` §7.4 registra: **"a remuneração de férias integra o salário de contribuição da
competência do pagamento e, portanto, soma-se ao salário do mês para determinar a faixa
progressiva. Diferente do IRRF, que é calculado em separado."**

Traduzindo para o motor, em duas linhas que não podem ser trocadas:

```
INSS  : UMA base = salário do mês + férias + 1/3, um único teto de R$ 8.475,55
IRRF  : DUAS bases independentes = f(salário do mês) e f(férias + 1/3), cada uma com
        sua própria tabela, seu próprio desconto simplificado e seu próprio redutor
```

O caso **F2** existe para provar isso ao centavo. Ali, calcular o INSS em bases separadas
desconta **R$ 574,93 a mais** do empregado — e desconto indevido de INSS é devolução com
correção, não é erro neutro.

**Decisão de motor adotada nesta massa (rateio do INSS entre as bases):** quando salário e
férias coexistem na competência, o INSS é apurado **uma vez sobre a soma** e depois
**atribuído sequencialmente** — primeiro ao salário do mês, o restante às férias:

```
INSS_total   = progressivo( MIN(salário + férias + 1/3 ; 8.475,55) )
INSS_salário = progressivo( salário )
INSS_férias  = INSS_total − INSS_salário
```

Isso é necessário porque o IRRF de cada base deduz "o INSS daquela base", e o rateio muda o
imposto. ⚠ **Pendência nova N01** — a alternativa proporcional muda o IRRF em R$ 59,96 no
caso F2. Ver seção 9.

---

### CASO F1 — Férias de 30 dias, salário fixo, mês sem salário

**Enunciado.** Empregado com salário fixo de **R$ 5.400,00**, 1 dependente, sem variáveis.
Período aquisitivo completo, **sem faltas** (30 dias de direito, art. 130 da CLT). Goza
01/09 a 30/09/2026; o pagamento e a competência de apuração são **09/2026**, e não há salário
de mês nesta folha (o empregado esteve afastado o mês inteiro).

| Cód. | Descrição | Referência | Provento | Desconto |
|---|---|---|---|---|
| 101 | Férias gozadas | 30/30 | 5.400,00 | |
| 102 | 1/3 constitucional | — | 1.800,00 | |
| 501 | INSS s/ férias | — | | **809,51** |
| 502 | IRRF s/ férias | — | | **776,54** |
| | **TOTAIS** | | **7.200,00** | **1.586,05** |
| | **LÍQUIDO** | | | **R$ 5.613,95** |

**Memória de cálculo**

- **Férias:** `(5.400,00 ÷ 30) × 30 = 5.400,00`. **1/3:** `5.400,00 ÷ 3 = 1.800,00`.
- **INSS** — base = férias + 1/3 = **7.200,00** (o 1/3 **integra** o salário de contribuição
  — STF, Tema 985, `03` §7.4). Abaixo do teto de 8.475,55, faixa 4:
  `7.200,00 × 14% − 198,4856 = 1.008,00 − 198,4856 = 809,5144 → 809,51`.
  Conferência por fatias: `121,5750 + 115,3656 + 174,1716 + (7.200,00 − 4.354,27) × 14%
  = 121,5750 + 115,3656 + 174,1716 + 398,4022 = 809,5144` ✔
- **IRRF** — base própria das férias, calculada em separado (`03` §3.5):
  - Base A (legal): `7.200,00 − 809,51 − 189,59 = 6.200,90` → faixa 27,5% →
    `6.200,90 × 27,5% − 908,73 = 1.705,2475 − 908,73 = 796,5175 → 796,52`
  - Base B (simplificada): `7.200,00 − 607,20 = 6.592,80` →
    `6.592,80 × 27,5% − 908,73 = 1.813,02 − 908,73 = 904,29`
  - **Menor imposto: R$ 796,52** (Base A vence — o dependente vale mais que a simplificada)
  - **Redutor:** RBM = 7.200,00, dentro da faixa 5.000,01–7.350,00 →
    `978,62 − (0,133145 × 7.200,00) = 978,62 − 958,644 = 19,976 → 19,98`
  - **IRRF devido:** `796,52 − 19,98 = 776,54`
- **FGTS** (encargo, não desconto): `7.200,00 × 8% = 576,00` — férias **gozadas** e o 1/3
  integram a base do FGTS (`03` §4.1).
- **Encargos patronais:** CPP `1.440,00` + RAT `144,00` + Terceiros `417,60` = **2.001,60**.

⚠ **Ponto de atenção — o redutor quase esgotado.** Com RBM de R$ 7.200,00 o redutor vale
R$ 19,98; a R$ 7.350,01 vale zero. Um aumento de R$ 150,00 na base custa R$ 19,98 de redutor
além do imposto normal. Não há degrau, mas há inclinação — e ela é forte.

---

### CASO F2 — Férias e salário na MESMA competência (a assimetria, com teto)

**Enunciado.** Salário de **R$ 6.000,00**, **2 dependentes**. Goza férias de 30 dias de
01/09 a 30/09/2026; o pagamento ocorre em **28/08/2026** (CLT art. 145 — até 2 dias antes),
portanto na competência **08/2026**, junto com o salário integral de agosto.
Premissa do caso: regime de caixa; férias e salário na mesma competência de apuração.

| Cód. | Descrição | Referência | Provento | Desconto |
|---|---|---|---|---|
| 001 | Salário base (agosto) | 30/30 | 6.000,00 | |
| 101 | Férias gozadas | 30/30 | 6.000,00 | |
| 102 | 1/3 constitucional | — | 2.000,00 | |
| 501 | INSS (base única: salário + férias + 1/3) | — | | **988,09** |
| 502 | IRRF s/ salário | base separada | | **280,83** |
| 503 | IRRF s/ férias | base separada | | **1.124,29** |
| | **TOTAIS** | | **14.000,00** | **2.393,21** |
| | **LÍQUIDO** | | | **R$ 11.606,79** |

**Memória de cálculo**

- **INSS — UMA base:** `6.000,00 + 8.000,00 = 14.000,00` → excede o teto → `SC = 8.475,55`
  → `8.475,55 × 14% − 198,4856 = 988,0914 → **988,09**` (teto do desconto em 2026).
  - Atribuição sequencial: `INSS_salário = progressivo(6.000,00) = 641,51`;
    `INSS_férias = 988,09 − 641,51 = 346,58`. Soma = 988,09 ✔
- ⚠ **ERRO Nº 1 QUANTIFICADO.** Se o motor calculasse o INSS em bases separadas:
  `progressivo(6.000,00) = 641,51` + `progressivo(8.000,00) = 921,51` = **1.563,02**.
  Diferença: **R$ 574,93 descontados a mais do empregado**, em um único mês, em um único
  empregado. É devolução com correção e passivo no eSocial.
- **IRRF — DUAS bases:**

  | | Base A (legal) | Imposto A | Base B (simplif.) | Imposto B | Escolhida | Redutor | **Devido** |
  |---|---|---|---|---|---|---|---|
  | **Salário** | 6.000,00 − 641,51 − 379,18 = **4.979,31** | 460,58 | 5.392,80 | 574,29 | A | 179,75 | **280,83** |
  | **Férias + 1/3** | 8.000,00 − 346,58 = **7.653,42** | 1.195,96 | 7.392,80 | 1.124,29 | B | 0,00 | **1.124,29** |

  - Salário: `4.979,31 × 27,5% − 908,73 = 460,58`; redutor com RBM 6.000,00 →
    `978,62 − 798,87 = 179,75`; devido `460,58 − 179,75 = 280,83`.
    **Este resultado reproduz exatamente o CASO B do `03`** — é a prova de que introduzir
    férias na competência não pode mexer no IRRF do salário.
  - Férias: a **simplificada vence** (`7.392,80 × 27,5% − 908,73 = 1.124,29`); RBM de
    8.000,00 está acima de 7.350,00 → **redutor = 0**.
- **FGTS:** `14.000,00 × 8% = 1.120,00`. **O FGTS não tem teto** — ao contrário do INSS.
- **Dedução do dependente:** os 2 dependentes foram aplicados **na base do salário**.
  Regra adotada: *as deduções pessoais (dependente, pensão, previdência privada) são
  aplicadas uma única vez na competência, na base do salário do mês; se não houver salário
  no mês, na base das férias.* ⚠ **Pendência nova N02** — alocá-los às férias elevaria o
  IRRF total de R$ 1.405,12 para R$ 1.476,79 (**R$ 71,67 a mais**), porque nas férias a
  simplificada vence e o dependente é desperdiçado.

**Variantes conferidas (para o teste de regressão)**

| Variante | IRRF salário | IRRF férias | Total | Δ vs. adotado |
|---|---|---|---|---|
| **Adotada** — INSS sequencial, dependentes no salário | 280,83 | 1.124,29 | **1.405,12** | — |
| INSS rateado proporcionalmente (564,62 / 423,47) | 340,79 | 1.124,29 | 1.465,08 | +59,96 |
| Dependentes alocados às férias | 385,10 | 1.091,69 | 1.476,79 | +71,67 |
| RBM do redutor = soma das duas bases (14.000,00) | 460,58 | 1.124,29 | 1.584,87 | +179,75 |

⚠ As quatro linhas são **defensáveis** e **nenhuma tem norma lida**. A terceira e a quarta
dependem da pendência P02 do `03`. O motor precisa escolher, **registrar a escolha na
memória de cálculo do holerite** e marcar o resultado como PROVISÓRIO.

---

### CASO F3 — Abono pecuniário (venda de 10 dias) + 10 dias trabalhados

**Enunciado.** Salário de **R$ 6.600,00**, sem dependentes. Requereu abono pecuniário de
1/3 do período (CLT art. 143) — **vende 10 dias e goza 20**. Gozo de 01/09 a 20/09/2026,
retorno em 21/09, trabalhando 10 dias de setembro. Premissa do caso: pagamento e apuração
na competência **09/2026** (simplificação declarada; o art. 145 exigiria pagamento em
28/08 — ver pendência N11).

| Cód. | Descrição | Referência | Provento | Desconto |
|---|---|---|---|---|
| 001 | Salário base | 10/30 | 2.200,00 | |
| 101 | Férias gozadas | 20/30 | 4.400,00 | |
| 102 | 1/3 s/ férias gozadas | — | 1.466,67 | |
| 103 | **Abono pecuniário** | 10/30 | 2.200,00 | |
| 104 | **1/3 s/ abono pecuniário** | — | 733,33 | |
| 501 | INSS (salário + férias + 1/3) | — | | **930,85** |
| 502 | IRRF s/ salário | — | | **0,00** |
| 503 | IRRF s/ férias | — | | **298,89** |
| | **TOTAIS** | | **11.000,00** | **1.229,74** |
| | **LÍQUIDO** | | | **R$ 9.770,26** |

**Memória de cálculo**

- Valor-dia: `6.600,00 ÷ 30 = 220,00`.
  Salário `220,00 × 10 = 2.200,00`; férias `220,00 × 20 = 4.400,00`; 1/3 `4.400,00 ÷ 3
  = 1.466,6667 → 1.466,67`; abono `220,00 × 10 = 2.200,00`; 1/3 do abono
  `2.200,00 ÷ 3 = 733,3333 → 733,33`.
- **Base de INSS, IRRF e FGTS = 8.066,67** (`2.200,00 + 4.400,00 + 1.466,67`).
  **O abono pecuniário e o seu 1/3 estão FORA de todas as três bases** — Lei 8.212/1991
  art. 28, §9º, "e"; Lei 8.036/1990 art. 15, §6º; `03` §7.4. São **R$ 2.933,33 que entram
  líquidos no bolso do empregado.**
- **INSS:** base 8.066,67, abaixo do teto → `8.066,67 × 14% − 198,4856 = 930,8482 → 930,85`.
  Atribuição sequencial: `progressivo(2.200,00) = 2.200,00 × 9% − 24,3150 = 173,685 → 173,69`
  (salário); `930,85 − 173,69 = 757,16` (férias).
- **IRRF do salário:** Base A `2.200,00 − 173,69 = 2.026,31` → isento;
  Base B `2.200,00 − 607,20 = 1.592,80` → isento. **IRRF = 0,00.**
- **IRRF das férias** (base = 5.866,67, **sem o abono**):
  - Base A: `5.866,67 − 757,16 = 5.109,51` → `× 27,5% − 908,73 = 496,39`
  - Base B: `5.866,67 − 607,20 = 5.259,47` → `× 27,5% − 908,73 = 537,62`
  - Menor: **496,39**. Redutor com RBM 5.866,67 → `978,62 − 781,1178 = 197,5022 → 197,50`.
  - **IRRF devido: `496,39 − 197,50 = 298,89`**
- **FGTS:** `8.066,67 × 8% = 645,33` — o abono e seu 1/3 **não** entram.

⚠ **Limite do abono é 1/3 do PERÍODO, não 10 dias fixos.** Com 30 dias de direito, o máximo
é 10; com 24 dias (6 a 14 faltas), o máximo é **8** — ver caso P5. Codificar
`abono_máx = dias_de_direito ÷ 3`, não `10`.

---

### CASO F4 — Férias com média de variáveis (horas extras + comissões)

**Enunciado.** Salário fixo de **R$ 2.800,00**, sem dependentes. Período aquisitivo
01/07/2025 a 30/06/2026, sem faltas. Goza 30 dias em 10/2026.
**Premissas do caso de teste, não regras do motor:** divisor 220; adicional de HE 50%;
no período aquisitivo houve **264 horas extras** (média física de 22h/mês), comissões
somando **R$ 14.400,00** (média R$ 1.200,00) e DSR sobre variáveis somando **R$ 3.120,00**
(média R$ 260,00); média aritmética simples, **sem atualização monetária** (ver pendência
N10).

**Composição da remuneração de férias (CLT art. 142, §§1º a 6º)**

| Parcela | Cálculo | Valor |
|---|---|---|
| Salário base | — | 2.800,00 |
| Média de horas extras | valor-hora `2.800,00 ÷ 220 = 12,7273`; HE 50% `× 1,5 = 19,0909`; `× 22h` | 420,00 |
| Média de comissões | `14.400,00 ÷ 12` | 1.200,00 |
| Média de DSR sobre variáveis | `3.120,00 ÷ 12` | 260,00 |
| **Remuneração de férias** | | **4.680,00** |

| Cód. | Descrição | Referência | Provento | Desconto |
|---|---|---|---|---|
| 101 | Férias gozadas (sobre a remuneração do art. 142) | 30/30 | 4.680,00 | |
| 102 | 1/3 constitucional | — | 1.560,00 | |
| 501 | INSS | — | | **675,11** |
| 502 | IRRF | — | | **473,81** |
| | **TOTAIS** | | **6.240,00** | **1.148,92** |
| | **LÍQUIDO** | | | **R$ 5.091,08** |

**Memória de cálculo**

- **INSS:** `6.240,00 × 14% − 198,4856 = 873,60 − 198,4856 = 675,1144 → 675,11`.
- **IRRF:** Base A `6.240,00 − 675,11 = 5.564,89` → `× 27,5% − 908,73 = 621,61`;
  Base B `6.240,00 − 607,20 = 5.632,80` → `× 27,5% − 908,73 = 640,29`. Menor: **621,61**.
  Redutor com RBM 6.240,00 → `978,62 − 830,8248 = 147,7952 → 147,80`.
  **IRRF = `621,61 − 147,80 = 473,81`.**
- **FGTS:** `6.240,00 × 8% = 499,20`.

⚠ **ERRO QUANTIFICADO — calcular férias só sobre o salário base.** Daria
`2.800,00 + 933,33 = 3.733,33` de bruto, contra **6.240,00**. São **R$ 2.506,67 a menos**
por período de férias. É o passivo trabalhista mais fácil de gerar e o mais fácil de provar
em juízo, porque a folha do próprio empregador demonstra a habitualidade (Súmulas 45, 60,
172 e 347 do TST).

⚠ **A média de HE é FÍSICA (horas), não financeira (reais).** Aplicam-se as 22 horas médias
ao valor-hora **vigente na concessão** das férias. Guardar a média em reais congela um
valor-hora antigo e subpaga sempre que houve reajuste.

---

## 2. 13º SALÁRIO

### 2.1 As três regras que estruturam o cálculo

1. **A 1ª parcela não tem desconto algum.** Nem INSS, nem IRRF. É adiantamento puro
   (Lei 4.749/1965, art. 2º). **Tem FGTS**, no mês em que é paga.
2. **A 2ª parcela concentra INSS e IRRF do 13º inteiro**, e é onde o valor pode chegar
   baixo — em salários altos, próximo de zero. Explicar isso ao cliente antes de dezembro
   evita a ligação de 21 de dezembro.
3. **O IRRF do 13º é exclusivo na fonte, com base própria**, separado de tudo o mais pago no
   mês (`03` §3.4). Não se soma ao salário de dezembro nem às férias. **O redutor da
   Lei 15.270/2025 se aplica também a ele**, com RBM próprio.

O INSS do 13º tem **base separada e teto próprio** de R$ 8.475,55 — o empregado pode pagar
o teto no salário de dezembro **e outra vez** no 13º.

---

### CASO T1 — 13º de ano completo (12/12)

**Enunciado.** Salário de **R$ 7.500,00**, 2 dependentes, admitido antes de 2026, sem
variáveis. 1ª parcela paga em 30/11/2026; 2ª em 18/12/2026.

**1ª PARCELA — competência 11/2026**

| Cód. | Descrição | Referência | Provento | Desconto |
|---|---|---|---|---|
| 201 | Adiantamento de 13º (1ª parcela) | 50% de 12/12 | 3.750,00 | |
| | **TOTAIS** | | **3.750,00** | **0,00** |
| | **VALOR PAGO** | | | **R$ 3.750,00** |

- `13º bruto = (7.500,00 ÷ 12) × 12 = 7.500,00`; `1ª parcela = 7.500,00 × 50% = 3.750,00`.
- **Sem INSS e sem IRRF.** **FGTS:** `3.750,00 × 8% = 300,00`, na competência 11/2026.

**2ª PARCELA — competência 12/2026 (quitação)**

| Cód. | Descrição | Referência | Provento | Desconto |
|---|---|---|---|---|
| 202 | 13º salário — quitação | 12/12 | 7.500,00 | |
| 203 | (−) Adiantamento pago em novembro | — | | **3.750,00** |
| 501 | INSS s/ 13º (base própria, teto próprio) | — | | **851,51** |
| 502 | IRRF s/ 13º (exclusivo na fonte) | — | | **815,33** |
| | **TOTAIS** | | **7.500,00** | **5.416,84** |
| | **LÍQUIDO DA 2ª PARCELA** | | | **R$ 2.083,16** |

**Memória de cálculo**

- **INSS do 13º:** base 7.500,00 (abaixo do teto) → `7.500,00 × 14% − 198,4856
  = 1.050,00 − 198,4856 = 851,5144 → 851,51`. **Retido integralmente na quitação.**
- **IRRF do 13º:** Base A `7.500,00 − 851,51 − 379,18 = 6.269,31` →
  `× 27,5% − 908,73 = 815,33`; Base B `7.500,00 − 607,20 = 6.892,80` →
  `× 27,5% − 908,73 = 986,79`. Menor: **815,33**.
  **Redutor:** RBM = 7.500,00 > 7.350,00 → **redutor = 0**. **IRRF = 815,33.**
- **FGTS:** `3.750,00 × 8% = 300,00` na 2ª parcela; total do 13º `600,00 = 7.500,00 × 8%` ✔
- **Encargos patronais sobre o 13º:** CPP `1.500,00` + RAT `150,00` + Terceiros `435,00`
  = **R$ 2.085,00**, apurados na competência **13/anual**.
  ⚠ Empresa optante pela CPRB: o 13º é **isento de CPP** em 2025–2027 (`03` §5.3), mas
  RAT e Terceiros continuam devidos — e essa afirmação está marcada como fonte que não
  sustenta na auditoria (item O-09). Não codificar sem confirmar.

⚠ **Ponto de atenção.** O empregado recebeu R$ 3.750,00 em novembro e R$ 2.083,16 em
dezembro. Se ele espera "mais um salário" em dezembro, a diferença de R$ 5.416,84 vira
reclamação no balcão. O holerite tem de exibir o 13º bruto e os dois descontos, não só o
líquido.

---

### CASO T2 — Admissão no meio do ano (avos)

**Enunciado.** Admissão em **18/03/2026**, salário de **R$ 3.900,00**, 1 dependente.

**Contagem de avos (Lei 4.090/1962, art. 1º, §§1º e 2º — fração ≥ 15 dias = 1 avo)**

| Mês | Dias de contrato | Conta avo? |
|---|---|---|
| Janeiro e fevereiro | 0 | não |
| **Março** | `31 − 18 + 1 = 14` | **NÃO** — 14 < 15 |
| Abril a dezembro | mês cheio | sim (9 avos) |
| **TOTAL** | | **9/12** |

⚠ **Um dia de diferença vale um avo.** Admissão em 17/03 daria 15 dias em março e
**10 avos** — R$ 325,00 a mais de 13º. É a fronteira mais errada dos motores de folha.

**1ª PARCELA — 30/11/2026:** `13º bruto = (3.900,00 ÷ 12) × 9 = 2.925,00`;
`1ª parcela = 1.462,50`, **sem descontos**. FGTS `117,00`.

**2ª PARCELA — 18/12/2026**

| Cód. | Descrição | Referência | Provento | Desconto |
|---|---|---|---|---|
| 202 | 13º salário — quitação | 9/12 | 2.925,00 | |
| 203 | (−) Adiantamento pago em novembro | — | | **1.462,50** |
| 501 | INSS s/ 13º | — | | **239,60** |
| 502 | IRRF s/ 13º | — | | **0,00** |
| | **TOTAIS** | | **2.925,00** | **1.702,10** |
| | **LÍQUIDO DA 2ª PARCELA** | | | **R$ 1.222,90** |

**Memória de cálculo**

- **INSS:** base 2.925,00 → faixa 3 → `2.925,00 × 12% − 111,4002 = 351,00 − 111,4002
  = 239,5998 → 239,60`.
- **IRRF:** Base A `2.925,00 − 239,60 − 189,59 = 2.495,81` → faixa 7,5% →
  `× 7,5% − 182,16 = 5,03`; Base B `2.925,00 − 607,20 = 2.317,80` → **isento**.
  **A simplificada vence e zera o imposto** — o redutor nem chega a ser acionado.
- **FGTS total:** `2.925,00 × 8% = 234,00`.

⚠ **Se a 1ª parcela for paga antes de novembro** (a lei permite de 1º/fev a 30/nov), os avos
do ano ainda não estão fechados. A prática é estimar o total anual e acertar a diferença na
quitação. ⚠ **Pendência nova N14** — a base de estimativa (remuneração do mês anterior x
projeção do ano) não está normatizada no `03`.

---

### CASO T3 — 13º com média de variáveis (âncora do redutor)

**Enunciado.** Salário de dezembro **R$ 3.200,00**, comissões do ano somando **R$ 21.600,00**
(média R$ 1.800,00), sem dependentes, 12/12 avos.

| Cód. | Descrição | Referência | Provento | Desconto |
|---|---|---|---|---|
| 202 | 13º salário (salário dez. + média de comissões) | 12/12 | 5.000,00 | |
| 203 | (−) 1ª parcela | — | | **2.500,00** |
| 501 | INSS s/ 13º | — | | **501,51** |
| 502 | IRRF s/ 13º | — | | **0,00** |
| | **TOTAIS** | | **5.000,00** | **3.001,51** |
| | **LÍQUIDO DA 2ª PARCELA** | | | **R$ 1.998,49** |

**Memória de cálculo**

- **Base do 13º:** `3.200,00 + (21.600,00 ÷ 12) = 3.200,00 + 1.800,00 = 5.000,00`
  (Lei 4.090/1962 art. 1º; Súmulas 45 e 347 do TST).
- **INSS:** `5.000,00 × 14% − 198,4856 = 501,5144 → 501,51`.
- **IRRF:** Base A `5.000,00 − 501,51 = 4.498,49` → `× 22,5% − 675,49 = 336,67`;
  Base B `5.000,00 − 607,20 = 4.392,80` → `× 22,5% − 675,49 = **312,89**`. Menor: 312,89.
  **Redutor:** RBM = 5.000,00 ≤ 5.000,00 → `redutor = imposto = 312,89` → **IRRF = 0,00**.

✔ **Este caso reproduz, no 13º, o teste-âncora do redutor da seção 15 do `03`**
(`imposto = redutor = 312,89`). Ele prova que o redutor foi implementado também na
tributação exclusiva do 13º, como manda a Lei 15.270/2025 (`03` §3.2).

---

## 3. RESCISÃO

### 3.1 Base comum dos casos R1 a R4

Para que as diferenças entre os tipos de desligamento apareçam isoladas, **os quatro
primeiros casos usam o mesmo empregado, o mesmo salário e a mesma data**. Só muda o motivo.

| Dado | Valor |
|---|---|
| Admissão | **10/03/2023** |
| Desligamento (comunicação/afastamento) | **15/09/2026** |
| Salário | **R$ 3.600,00** (valor-dia R$ 120,00) |
| Dependentes | 1 |
| Tempo de serviço | **3 anos completos** + 6 meses e 6 dias |
| **Aviso prévio proporcional** | `30 + (3 × 3) = **39 dias**` (Lei 12.506/2011; teto de 90 dias) |
| Férias **vencidas** | período 10/03/2025–09/03/2026 **não gozado** → 30 dias + 1/3 |
| Último período aquisitivo aberto | a partir de **10/03/2026** |
| **Extrato analítico do FGTS Digital** (saldo de depósitos corrigidos até 08/2026) | **R$ 14.061,60** — **premissa do caso de teste, não regra do motor** |

### 3.2 A regra dura da multa do FGTS

O `03` §9.4 e a auditoria já registraram, e esta massa de teste reafirma como regra de
implementação:

> **A multa de 40% (ou 20%) incide sobre o somatório histórico dos depósitos do contrato,
> corrigidos, mesmo que o trabalhador já os tenha sacado — não sobre o saldo da conta.**

**Consequência de engenharia:** o **extrato analítico do FGTS Digital é insumo obrigatório
do cálculo**. O motor **não estima** essa base. Sem o extrato carregado, a rescisão **não
calcula a multa**, marca a verba como pendente e abre tarefa no Kanban. Estimar a multa a
partir de "8% × meses × salário atual" está errado por três motivos independentes: ignora
reajustes salariais passados, ignora a correção do FGTS, e ignora saques já feitos —
inclusive saque-aniversário, que **reduz o saldo mas não reduz a base da multa**.

Nesta massa de teste, o extrato foi **fixado no enunciado** (R$ 14.061,60) exatamente para
não simular a estimativa que o motor tem proibido de fazer.

⚠ **A multa é creditada na conta vinculada do FGTS, não paga em dinheiro no TRCT.** Ela
**não entra no líquido a receber** — entra no custo do empregador. Ver pendência N12.

### 3.3 Quadro comparativo — verbas devidas por tipo de desligamento

| Verba | R1 Sem justa causa | R2 Pedido de demissão | R3 Justa causa | R4 Comum acordo (484-A) | R5 Término de experiência |
|---|---|---|---|---|---|
| Saldo de salário | **devido** | **devido** | **devido** | **devido** | **devido** |
| Aviso prévio | **devido, 39 dias** | **devido PELO empregado**, 30 dias | não devido | **devido, 50% = 19,5 dias** | não devido |
| 13º proporcional | **devido** | **devido** | **não devido** | **devido** | **devido** |
| Férias vencidas + 1/3 | **devido** | **devido** | **devido** | **devido** | não há período completo |
| Férias proporcionais + 1/3 | **devido** | **devido** (Súm. 261 TST) | **não devido** (Súm. 171 TST) | **devido** | **devido** |
| Multa do FGTS | **40%** | não devida | não devida | **20%** | não devida |
| Saque do FGTS | 100% | não | não | 80% | sim (fim de contrato) |
| Seguro-desemprego | sim | não | não | não | não |

Fundamentos: CLT arts. 477, 479, 481, 482, 484, 484-A, 487; Lei 8.036/1990 art. 18, §§1º e
2º, e art. 20; Súmulas 171 e 261 do TST — todos herdados do `03` §9.1, selo CV.

---

### CASO R1 — Dispensa sem justa causa, aviso prévio INDENIZADO

**Enunciado.** Base comum. Aviso de 39 dias **indenizado**, com afastamento imediato em
15/09/2026. **A projeção do aviso (CLT art. 487, §1º) leva o término do contrato para
24/10/2026** — e é essa data projetada que conta avos de 13º e de férias.

| Cód. | Descrição | Referência | Provento | Desconto |
|---|---|---|---|---|
| 001 | Saldo de salário | 15/30 | 1.800,00 | |
| 301 | Aviso prévio indenizado | 39 dias | 4.680,00 | |
| 302 | 13º proporcional | 10/12 | 3.000,00 | |
| 303 | Férias vencidas (2025/2026) | 30/30 | 3.600,00 | |
| 304 | 1/3 s/ férias vencidas | — | 1.200,00 | |
| 305 | Férias proporcionais | 8/12 | 2.400,00 | |
| 306 | 1/3 s/ férias proporcionais | — | 800,00 | |
| 501 | INSS s/ saldo de salário | — | | **137,69** |
| 502 | INSS s/ 13º (base separada) | — | | **248,60** |
| 503 | IRRF s/ saldo de salário | — | | **0,00** |
| 504 | IRRF s/ 13º (exclusivo) | — | | **0,00** |
| | **TOTAIS** | | **17.480,00** | **386,29** |
| | **LÍQUIDO DO TRCT** | | | **R$ 17.093,71** |

**Memória de cálculo**

- **Data projetada:** `15/09/2026 + 39 dias = 24/10/2026`.
- **Saldo de salário:** `(3.600,00 ÷ 30) × 15 = 1.800,00`.
- **Aviso indenizado:** `120,00 × 39 = 4.680,00`.
- **13º proporcional — 10 avos.** Jan a set = 9 meses cheios; outubro tem `24 dias ≥ 15`
  → 10º avo. `(3.600,00 ÷ 12) × 10 = 3.000,00`.
  ⚠ **Sem a projeção do aviso seriam 9 avos** = R$ 2.700,00. A projeção vale **R$ 300,00**.
- **Férias proporcionais — 8 avos.** Do aquisitivo aberto em 10/03/2026: sete períodos
  mensais completos até 09/10/2026, mais `10/10 a 24/10 = 15 dias ≥ 15` → 8º avo.
  `(3.600,00 ÷ 12) × 8 = 2.400,00`; 1/3 = 800,00.
- **INSS — duas bases separadas:**
  - Saldo: `1.800,00 × 9% − 24,3150 = 137,685 → **137,69**` (idêntico ao CASO A do `03` ✔)
  - 13º: `3.000,00 × 12% − 111,4002 = 248,5998 → **248,60**`
  - **FORA do INSS:** aviso prévio indenizado (⚠ pendência P06 do `03` — STJ Tema 478 pela
    não incidência; resultado **PROVISÓRIO**), férias vencidas + 1/3 e férias proporcionais
    + 1/3 (indenizadas — Lei 8.212/1991, art. 28, §9º, "d").
- **IRRF:**
  - Saldo: Base A `1.800,00 − 137,69 − 189,59 = 1.472,72` → isento; Base B `1.192,80` →
    isento. **0,00**
  - 13º: Base A `3.000,00 − 248,60 = 2.751,40` → `× 7,5% − 182,16 = 24,20`;
    Base B `2.392,80` → isento. Menor: **0,00**
  - Férias indenizadas e o aviso indenizado: **fora da base do IRRF** (Súmula 125 do STJ
    para as férias; ⚠ para o aviso, a auditoria marca a afirmação como órfã — item O-10).
- **FGTS rescisório:** base = saldo + aviso indenizado + 13º = `1.800,00 + 4.680,00 +
  3.000,00 = 9.480,00` → `× 8% = **758,40**`.
  **O aviso indenizado ENTRA na base do FGTS** (Súmula 305 do TST) embora esteja fora de
  INSS e IRRF — é a inversão que mais confunde. **As férias indenizadas não entram.**
- **Multa de 40%:** base = extrato `14.061,60` + depósitos rescisórios `758,40` =
  **14.820,00** → `× 40% = **R$ 5.928,00**` — creditada na conta vinculada, fora do líquido.
- **Encargos patronais:** base = saldo + 13º = 4.800,00 → CPP `960,00` + RAT `96,00` +
  Terceiros `278,40` = **1.334,40**.
- **CUSTO TOTAL DO EMPREGADOR:** `17.480,00 + 758,40 + 5.928,00 + 1.334,40 = **25.500,80**`.

**Prazo:** 10 dias corridos do término do contrato (CLT art. 477, §6º); atraso gera multa de
1 salário nominal (§8º).

---

### CASO R1b — A mesma dispensa, com aviso prévio TRABALHADO

**Enunciado.** Base comum, comunicação em 15/09/2026, **aviso trabalhado** de 39 dias, com
redução de 7 dias corridos ao final (CLT art. 488) sem prejuízo do salário — **premissa do
caso**. Data de saída: **24/10/2026**. Setembro é folha **normal** (R$ 3.600,00, INSS
R$ 320,60); a rescisão é apurada na competência **10/2026**.

| Cód. | Descrição | Referência | Provento | Desconto |
|---|---|---|---|---|
| 001 | Saldo de salário (outubro) | 24/30 | 2.880,00 | |
| — | *Aviso prévio* | *não existe rubrica: é salário do período trabalhado* | — | |
| 302 | 13º proporcional | 10/12 | 3.000,00 | |
| 303 | Férias vencidas + 1/3 | 30/30 | 4.800,00 | |
| 305 | Férias proporcionais + 1/3 | 8/12 | 3.200,00 | |
| 501 | INSS s/ saldo de salário | — | | **234,89** |
| 502 | INSS s/ 13º | — | | **248,60** |
| 503 | IRRF s/ saldo | — | | **0,00** |
| 504 | IRRF s/ 13º | — | | **0,00** |
| | **TOTAIS** | | **13.880,00** | **483,49** |
| | **LÍQUIDO DO TRCT** | | | **R$ 13.396,51** |

- Saldo: `120,00 × 24 = 2.880,00`. INSS `2.880,00 × 9% − 24,3150 = 234,885 → 234,89`.
- IRRF do saldo: Base A `2.880,00 − 234,89 − 189,59 = 2.455,52` → `2,00`; Base B `2.272,80`
  → isento. Menor: **0,00**.
- FGTS rescisório: base `2.880,00 + 3.000,00 = 5.880,00` → **470,40**.
- Encargos patronais: base 5.880,00 → **1.634,64**.

⚠ **COMPARATIVO — os mesmos 39 dias (R$ 4.680,00), nas duas modalidades**

| Item | Aviso **trabalhado** | Aviso **indenizado** |
|---|---|---|
| Natureza da verba | salário | indenização |
| INSS do empregado | **incide** | não incide (P06 — PROVISÓRIO) |
| IRRF | **incide** | não incide (auditoria O-10) |
| FGTS | incide | **incide** (Súmula 305 TST) |
| CPP + RAT + Terceiros | **incide** | não incide |
| **Encargo patronal sobre os 39 dias** | `4.680,00 × 27,8% + 8% = **1.675,44**` | `4.680,00 × 8% = **374,40**` |
| **Diferença de encargo** | | **R$ 1.301,04 a mais no trabalhado** |

O empregado leva **mais líquido** no aviso indenizado (não sofre INSS nem IRRF sobre a
verba) e o empregador paga **menos encargo**. Em contrapartida, no indenizado o empregador
perde 39 dias de trabalho. É uma decisão de negócio — mas o motor tem de mostrar os dois
números, porque hoje ela é tomada no escuro.

---

### CASO R2 — Pedido de demissão (aviso não cumprido)

**Enunciado.** Base comum. O empregado pede demissão em 15/09/2026 e **não cumpre o aviso**.
O empregador desconta 30 dias (CLT art. 487, §2º). **Sem projeção do contrato** — o término
é 15/09/2026.

| Cód. | Descrição | Referência | Provento | Desconto |
|---|---|---|---|---|
| 001 | Saldo de salário | 15/30 | 1.800,00 | |
| 302 | 13º proporcional | 9/12 | 2.700,00 | |
| 303 | Férias vencidas + 1/3 | 30/30 | 4.800,00 | |
| 305 | Férias proporcionais + 1/3 | 6/12 | 2.400,00 | |
| 501 | INSS s/ saldo | — | | **137,69** |
| 502 | INSS s/ 13º | — | | **218,69** |
| 503/504 | IRRF (saldo e 13º) | — | | **0,00** |
| 510 | **Aviso prévio não cumprido** | 30 dias | | **3.600,00** |
| | **TOTAIS** | | **11.700,00** | **3.956,38** |
| | **LÍQUIDO DO TRCT** | | | **R$ 7.743,62** |

**Memória de cálculo e pontos críticos**

- **Avos sem projeção.** 13º: jan a set = **9 avos** (setembro tem 15 dias ≥ 15) →
  R$ 2.700,00. Férias proporcionais: seis períodos mensais completos até 09/09/2026;
  `10/09 a 15/09 = 6 dias < 15` → **6 avos** → R$ 1.800,00 + 1/3 600,00.
  ⚠ **Comparar com R1: 10 e 8 avos.** A projeção do aviso indenizado vale, sozinha,
  R$ 300,00 de 13º + R$ 800,00 de férias proporcionais + 1/3 = **R$ 1.100,00**.
- **INSS do 13º:** base 2.700,00 está na **faixa 2**, não na 3 (o limite da faixa 2 é
  2.902,84) → `2.700,00 × 9% − 24,3150 = 243,00 − 24,3150 = 218,685 → **218,69**`.
  ⚠ Esta é uma das duas conferências manuais que o script corrigiu. Fronteira clássica.
- **O desconto do aviso NÃO reduz base.** É desconto do art. 487, §2º, não estorno de
  provento: INSS, IRRF e FGTS continuam apurados sobre a remuneração devida. ⚠ Decisão de
  motor declarada — ver pendência N13.
- **Sem proporcionalidade no aviso do empregado:** desconta-se **30 dias**, não 39. O
  acréscimo da Lei 12.506/2011 é benefício exclusivo do empregado (`03` §9.2).
- **FGTS:** base `1.800,00 + 2.700,00 = 4.500,00` → **360,00**. **Sem multa, sem saque,
  sem seguro-desemprego.**
- **Férias proporcionais são devidas** mesmo no pedido de demissão — **Súmula 261 do TST**.
  Negá-las é o erro mais caro e mais comum deste tipo de rescisão.

---

### CASO R3 — Justa causa (CLT art. 482)

**Enunciado.** Base comum. Dispensa por justa causa em 15/09/2026.

| Cód. | Descrição | Referência | Provento | Desconto |
|---|---|---|---|---|
| 001 | Saldo de salário | 15/30 | 1.800,00 | |
| 303 | Férias vencidas | 30/30 | 3.600,00 | |
| 304 | 1/3 s/ férias vencidas | — | 1.200,00 | |
| 501 | INSS s/ saldo | — | | **137,69** |
| 503 | IRRF s/ saldo | — | | **0,00** |
| | **TOTAIS** | | **6.600,00** | **137,69** |
| | **LÍQUIDO DO TRCT** | | | **R$ 6.462,31** |

**Não devidos:** aviso prévio, 13º proporcional, férias proporcionais + 1/3 (Súmula 171 do
TST), multa do FGTS, saque do FGTS, seguro-desemprego.
**Devidas em qualquer hipótese:** saldo de salário e **férias vencidas + 1/3** — o direito
já estava adquirido antes da falta.

- **FGTS:** `1.800,00 × 8% = 144,00` (o depósito do mês continua devido).
- **Encargos patronais:** base 1.800,00 → **500,40**. Custo total: **R$ 7.244,40**.

⚠ **CONTRASTE R1 × R3 — por que a justa causa é o campo mais litigado da folha**

| | R1 sem justa causa | R3 justa causa | Diferença |
|---|---|---|---|
| Líquido ao empregado | 17.093,71 | 6.462,31 | **10.631,40** |
| Custo do empregador | 25.500,80 | 7.244,40 | **18.256,40** |

Uma justa causa revertida em juízo custa a diferença **mais** correção, juros, honorários e,
eventualmente, danos morais. **Regra de motor recomendada:** rescisão por justa causa deve
exigir campo obrigatório com a alínea do art. 482 e a data do fato, e abrir tarefa no Kanban
para revisão humana antes de gerar o TRCT — mesmo tratamento que o `03` §12.1 dá à
estabilidade.

---

### CASO R4 — Comum acordo (CLT art. 484-A)

**Enunciado.** Base comum. Distrato em 15/09/2026, com **aviso indenizado pela metade**.

**Premissa do caso de teste, não regra do motor:** metade de 39 dias = **19,5 dias** pagos
em valor; para a **projeção de avos**, adotam-se **20 dias corridos** (arredondamento para
cima, favorável ao empregado) → **data projetada 05/10/2026**. ⚠ **Pendência nova N04** —
não há norma sobre a projeção do aviso reduzido do art. 484-A nem sobre o arredondamento da
metade de um número ímpar de dias.

| Cód. | Descrição | Referência | Provento | Desconto |
|---|---|---|---|---|
| 001 | Saldo de salário | 15/30 | 1.800,00 | |
| 301 | Aviso prévio indenizado (50%) | 19,5 dias | 2.340,00 | |
| 302 | 13º proporcional | 9/12 | 2.700,00 | |
| 303 | Férias vencidas + 1/3 | 30/30 | 4.800,00 | |
| 305 | Férias proporcionais + 1/3 | 7/12 | 2.800,00 | |
| 501 | INSS s/ saldo | — | | **137,69** |
| 502 | INSS s/ 13º | — | | **218,69** |
| 503/504 | IRRF (saldo e 13º) | — | | **0,00** |
| | **TOTAIS** | | **14.440,00** | **356,38** |
| | **LÍQUIDO DO TRCT** | | | **R$ 14.083,62** |

**Memória de cálculo**

- **Aviso:** `120,00 × 19,5 = 2.340,00`.
- **Avos com projeção até 05/10/2026:** 13º → jan a set = 9; outubro tem `5 dias < 15` →
  **9 avos**. Férias → seis períodos mensais completos até 09/09; `10/09 a 05/10 = 26 dias
  ≥ 15` → **7 avos** → R$ 2.100,00 + 1/3 700,00.
  ⚠ Observe: no 13º a projeção de 20 dias **não** acrescentou avo; nas férias, acrescentou.
  As duas contagens têm bases diferentes (ano civil × período aquisitivo) e não podem
  compartilhar código.
- **FGTS rescisório:** base `1.800,00 + 2.340,00 + 2.700,00 = 6.840,00` → **547,20**
  (o aviso indenizado entra — Súmula 305 do TST, também na metade).
- **Multa de 20%** (CLT art. 484-A, I, "b"): base = `14.061,60 + 547,20 = 14.608,80` →
  `× 20% = **R$ 2.921,76**`.
- **Saque:** 80% do saldo. **Seguro-desemprego: não devido.**
- **Encargos patronais:** base = saldo + 13º = 4.500,00 → **1.251,00**.
  **Custo total do empregador: R$ 19.159,96.**

---

### CASO R5 — Término de contrato de experiência, no termo final

**Enunciado.** Empregado admitido em **01/07/2026**, contrato de experiência de **90 dias
(45 + 45)**, término em **28/09/2026**, salário de **R$ 2.400,00**, sem dependentes.
**Premissa do caso:** contrato **sem cláusula assecuratória** recíproca (CLT art. 481).

| Cód. | Descrição | Referência | Provento | Desconto |
|---|---|---|---|---|
| 001 | Saldo de salário | 28/30 | 2.240,00 | |
| 302 | 13º proporcional | 3/12 | 600,00 | |
| 305 | Férias proporcionais | 3/12 | 600,00 | |
| 306 | 1/3 s/ férias proporcionais | — | 200,00 | |
| 501 | INSS s/ saldo | — | | **177,29** |
| 502 | INSS s/ 13º | — | | **45,00** |
| 503/504 | IRRF (saldo e 13º) | — | | **0,00** |
| | **TOTAIS** | | **3.640,00** | **222,29** |
| | **LÍQUIDO DO TRCT** | | | **R$ 3.417,71** |

**Não devidos:** aviso prévio (o termo final é conhecido desde a assinatura), férias
vencidas (não há período aquisitivo completo), **multa do FGTS**, seguro-desemprego.
**Devido:** **saque do FGTS** por fim de contrato (Lei 8.036/1990, art. 20).

**Memória de cálculo**

- **Avos:** 13º → julho (31 dias), agosto (31), setembro (`28 ≥ 15`) = **3/12**.
  Férias → 01/07–31/07 (1), 01/08–31/08 (2), 01/09–28/09 = 28 dias ≥ 15 (3) = **3/12**.
- **INSS do saldo:** `2.240,00 × 9% − 24,3150 = 201,60 − 24,3150 = 177,285 → 177,29`.
- **INSS do 13º:** base 600,00, faixa 1 → `600,00 × 7,5% = 45,00`.
- **IRRF do 13º:** Base A `600,00 − 45,00 = 555,00` → isento;
  Base B `600,00 − 607,20 = −7,20` → ⚠ **negativa**. **Regra de motor: piso zero.**
  O desconto simplificado nunca gera base negativa nem crédito. Pendência nova N15.
- **FGTS rescisório:** `(2.240,00 + 600,00) × 8% = **227,20**`.

**Sub-caso R5b — rescisão ANTECIPADA do contrato a prazo (CLT art. 479)**

Se o empregador rescindisse em **31/08/2026**, faltariam **28 dias** para o termo. A
indenização do art. 479 é **metade da remuneração do período faltante**:

```
indenização_479 = (valor-dia × dias faltantes) ÷ 2 = (80,00 × 28) ÷ 2 = R$ 1.120,00
```

⚠ **Pendência nova N08:** as incidências (INSS, IRRF, FGTS) sobre a indenização do art. 479
**não estão tratadas no `03`** e **não são afirmadas aqui**. Enquanto não confirmadas, a
verba entra como `null` de incidência e o TRCT sai marcado **PROVISÓRIO**.
Havendo **cláusula assecuratória**, aplicam-se as regras da dispensa sem justa causa
(CLT art. 481) — ou seja, o caso vira R1.

---

## 4. PROPORCIONALIZAÇÃO E DESCONTOS DE FREQUÊNCIA

### 4.1 Fórmulas

```
valor-dia   = salário_mensal ÷ 30                       (sempre 30 — CLT art. 64, mensalista)
valor-hora  = salário_mensal ÷ divisor_contratual        (220 para 44h/sem — PREMISSA, P10)

salário_proporcional  = valor-dia × dias_a_pagar
desconto_de_faltas    = valor-dia × nº de faltas injustificadas
desconto_de_DSR       = valor-dia × nº de repousos das SEMANAS em que houve falta
desconto_de_atraso    = valor-hora × horas de atraso (após a tolerância do art. 58, §1º)

dias_a_pagar = 30, se o vínculo cobre todos os dias do mês civil
             = dias corridos de vínculo no mês, caso contrário   (nunca > 30)
```

⚠ **Faltas, DSR perdido e atrasos REDUZEM A BASE** de INSS, IRRF e FGTS — são redução de
remuneração devida, não desconto sobre o líquido. Isso os coloca na **ETAPA 5.9** da ordem
canônica do `03`, mas com efeito retroativo sobre as ETAPAS 2 a 4. Ver seção 5 abaixo, que
corrige essa ordem.

---

### CASO P1 — Admissão no meio do mês (salário R$ 3.000,00)

| Admissão | Dias de vínculo no mês | Mês tem | Dias pagos | Valor |
|---|---|---|---|---|
| 12/08/2026 | 20 | 31 | 20/30 | **2.000,00** |
| 02/08/2026 | 30 | 31 | 30/30 | **3.000,00** |
| 01/08/2026 | 31 | 31 | **30/30** (teto) | **3.000,00** |
| 01/02/2026 | 28 | 28 | **30/30** (regra "cobre o mês") | **3.000,00** |
| 09/02/2026 | 20 | 28 | 20/30 | **2.000,00** |

⚠ **Duas armadilhas do divisor 30, ambas quantificadas.**

1. **Admitir dia 1º ou dia 2 de um mês de 31 dias paga o mesmo** (R$ 3.000,00): o divisor é
   30, então o 31º dia não acrescenta. Nunca pagar 31/30.
2. **Fevereiro.** Sem a regra "vínculo cobre o mês inteiro → salário integral", o admitido
   em 01/02/2026 receberia `3.000,00 ÷ 30 × 28 = **2.800,00**` por um mês inteiro de
   trabalho — **R$ 200,00 a menos** que o admitido em 01/08. A regra adotada aqui evita isso,
   mas **é decisão de motor sem norma expressa**. ⚠ Pendência nova N07.

---

### CASO P2 — Demissão no meio do mês (salário R$ 3.000,00)

| Desligamento | Mês tem | Dias pagos | Valor |
|---|---|---|---|
| dia 15 de setembro | 30 | 15/30 | **1.500,00** |
| dia 27 de fevereiro | 28 | 27/30 | **2.700,00** |
| dia 28 de fevereiro | 28 | **30/30** (cobre o mês) | **3.000,00** |

A regra é simétrica à da admissão. Em rescisão, o saldo de salário segue exatamente esta
fórmula — é o que R1 a R5 usam.

---

### CASO P3 — Faltas injustificadas e a perda do DSR

**Enunciado.** Salário **R$ 2.640,00** (valor-dia R$ 88,00; valor-hora R$ 12,00 com divisor
220). Competência **09/2026**. Setembro de 2026 tem 30 dias, quatro domingos (6, 13, 20 e
27) e o feriado nacional de **07/09, que cai numa segunda-feira**.

**Fundamento:** Lei 605/1949, art. 6º — o repouso semanal remunerado é devido a quem cumpre
**integralmente** a jornada da semana. Falta injustificada na semana → perde-se o repouso
daquela semana.

**Premissas do caso de teste, não regras do motor:** semana considerada de **segunda a
domingo**; **o feriado da semana também se perde**, junto com o domingo.

| Cenário | Faltas | Repousos perdidos | Dias descontados | **Desconto** |
|---|---|---|---|---|
| **A** — 3 faltas em 3 semanas distintas (09, 16 e 23/09) | 3 | **4** (domingos 13, 20 e 27 + feriado 07/09) | 7 | **R$ 616,00** |
| **B** — as mesmas 3 faltas na MESMA semana (15, 16 e 17/09) | 3 | **1** (domingo 20/09) | 4 | **R$ 352,00** |
| **C** — 3 faltas na mesma semana, que contém o feriado (09, 10 e 11/09) | 3 | **2** (domingo 13/09 + feriado 07/09) | 5 | **R$ 440,00** |
| **D** — cenário A, variante que **não** perde o feriado | 3 | 3 | 6 | **R$ 528,00** |

⚠ **O mesmo número de faltas custa de R$ 352,00 a R$ 616,00 — uma variação de 75%** — só
pela distribuição delas no calendário. Espalhar três faltas por três semanas custa
**R$ 264,00 a mais** que concentrá-las em uma. Nenhum motor pode tratar falta como
"quantidade": tem de tratar como **data**.

⚠ A diferença entre os cenários A e D (**R$ 88,00**) é exatamente a pendência do feriado —
ver N05.

**Folha do cenário A**

| Cód. | Descrição | Referência | Provento | Desconto |
|---|---|---|---|---|
| 001 | Salário base | 30/30 | 2.640,00 | |
| 511 | Faltas injustificadas | 3 dias | | **264,00** |
| 512 | DSR sobre faltas | 4 dias | | **352,00** |
| 501 | INSS (sobre a base **reduzida**) | — | | **157,85** |
| 502 | IRRF | — | | **0,00** |
| | **TOTAIS** | | **2.640,00** | **773,85** |
| | **LÍQUIDO** | | | **R$ 1.866,15** |

- **Base de INSS, IRRF e FGTS = `2.640,00 − 616,00 = 2.024,00`.**
- **INSS:** `2.024,00 × 9% − 24,3150 = 182,16 − 24,3150 = 157,845 → 157,85`.
- **IRRF:** Base A `2.024,00 − 157,85 = 1.866,15` → isento; Base B `1.416,80` → isento.
  **0,00**
- **FGTS:** `2.024,00 × 8% = 161,92` — e não `2.640,00 × 8% = 211,20`.

⚠ **Dias úteis para o DSR sobre variáveis, no mesmo mês, com duas convenções:**
sábado como **dia útil** → 25 dias úteis e 5 repousos; sábado como **repouso** (jornada de
5 dias) → 21 dias úteis e 9 repousos. A escolha muda o valor do DSR sobre horas extras e
comissões em quase 80%. É a pendência **P05** do `03` e **precisa vir da CCT do cliente** —
não do código.

---

### CASO P4 — Atrasos

**Enunciado.** Mesmo empregado do P3. Atrasos apurados no ponto: **3h20min** no mês.

```
horas de atraso  = 3h20min = 3,3333 h
valor-hora       = 2.640,00 ÷ 220 = 12,00
desconto         = 3,3333 × 12,00 = R$ 40,00
```

**Tolerância legal (CLT art. 58, §1º):** variações de até **5 minutos por marcação**,
limitadas a **10 minutos por dia**, **não** são computadas como atraso nem como hora extra.
O motor tem de aplicar a tolerância **na apuração do ponto**, antes de chegar à folha —
descontar minutos tolerados é desconto ilegal.

⚠ **Pendência nova N06:** o atraso injustificado faz perder o DSR da semana? A leitura
literal do art. 6º da Lei 605/1949 ("cumprir integralmente a jornada") sugere que sim, e há
jurisprudência nos dois sentidos. **Neste caso o DSR NÃO foi descontado** — comportamento
conservador, que evita passivo. A escolha tem de ser parâmetro do cliente, com a premissa
exibida no holerite.

---

### CASO P5 — Efeito das faltas sobre os DIAS DE DIREITO a férias

**Enunciado.** Salário **R$ 3.000,00**. Tabela do art. 130 da CLT (herdada do `03` §7.2).

| Faltas injustificadas no período aquisitivo | Dias de férias | **Abono máximo** (1/3) | Férias + 1/3 |
|---|---|---|---|
| até 5 | **30** | **10 dias** | 3.000,00 + 1.000,00 = 4.000,00 |
| 6 a 14 | **24** | **8 dias** | 2.400,00 + 800,00 = **3.200,00** |
| 15 a 23 | **18** | **6 dias** | 1.800,00 + 600,00 = 2.400,00 |
| 24 a 32 | **12** | **4 dias** | 1.200,00 + 400,00 = 1.600,00 |
| acima de 32 | **0** | 0 | 0,00 |

**Exemplo desenvolvido — 8 faltas injustificadas:** 24 dias de direito.
`(3.000,00 ÷ 30) × 24 = 2.400,00`; 1/3 = `800,00`; total **R$ 3.200,00**.
**Abono pecuniário máximo: 8 dias**, não 10 — `abono_máx = dias_de_direito ÷ 3`.

⚠ **NÃO descontar as faltas outra vez nas férias.** As faltas já foram descontadas no mês em
que ocorreram (caso P3). A redução de dias do art. 130 é um **efeito legal autônomo** sobre
o direito, não um segundo desconto. Descontar duas vezes é erro material e gera diferença
a pagar com correção.

⚠ **A fronteira de 5 para 6 faltas custa 6 dias de férias.** Entre 5 e 6 faltas a diferença
é de `4.000,00 − 3.200,00 = R$ 800,00` na remuneração de férias. Uma falta mal classificada
(justificada × injustificada, CLT art. 473) move o empregado de faixa. O motor precisa
armazenar a **natureza** de cada ausência, não só a quantidade.

---

## 5. FOLHA COMPLEMENTAR E ADIANTAMENTO

### 5.1 Adiantamento salarial (vale)

**Quando ocorre.** Pagamento antecipado de parte do salário da **mesma competência**,
usualmente entre os dias 15 e 20, com quitação no fechamento do mês. Fundamento: CLT
art. 462 (o adiantamento é a única exceção genérica à vedação de descontos).

**Premissas do caso de teste, não regras do motor:** percentual de **40%**, definido em
contrato ou CCT — o motor **não tem percentual padrão**; e **não há retenção de INSS nem de
IRRF no ato do adiantamento**, porque a competência só fecha no último dia do mês. ⚠ Esta
segunda premissa é prática dominante, mas convive com o regime de caixa do IRRF
(Lei 7.713/1988, art. 7º, §1º) — ver pendência N09.

### CASO A1 — Adiantamento de 40% (salário R$ 3.000,00, competência 09/2026)

**Pagamento em 20/09/2026:** `3.000,00 × 40% = **R$ 1.200,00**`, sem descontos.

**Folha de fechamento, 30/09/2026**

| Cód. | Descrição | Referência | Provento | Desconto |
|---|---|---|---|---|
| 001 | Salário base | 30/30 | 3.000,00 | |
| 501 | INSS | — | | **248,60** |
| 502 | IRRF | — | | **0,00** |
| 520 | (−) Adiantamento pago em 20/09 | — | | **1.200,00** |
| | **TOTAIS** | | **3.000,00** | **1.448,60** |
| | **LÍQUIDO DA 2ª QUINZENA** | | | **R$ 1.551,40** |

- **INSS:** `3.000,00 × 12% − 111,4002 = 248,5998 → 248,60` — sobre **R$ 3.000,00**, não
  sobre os R$ 1.800,00 do saldo.
- **IRRF:** Base A `3.000,00 − 248,60 = 2.751,40` → `24,20`; Base B `2.392,80` → isento.
  Menor: **0,00**.
- **FGTS:** `3.000,00 × 8% = 240,00`, sobre a remuneração do mês.

⚠ **A regra dura:** o adiantamento é **ETAPA 5.6** da ordem canônica — desconto puro, depois
de INSS e IRRF. **Nunca reduz base.** Calcular INSS sobre o saldo da 2ª quinzena subestima a
contribuição e, pela progressividade, subestima muito.

---

### 5.2 Folha complementar

**Quando ocorre.** Quatro situações distintas, com tratamentos diferentes:

| Situação | Tratamento |
|---|---|
| Verba da competência apurada depois do fechamento (HE do fim do mês, comissão apurada tarde) | **folha complementar da competência original** |
| Reajuste salarial retroativo (data-base da CCT homologada depois) | **folha complementar** de cada competência afetada |
| Erro de folha corrigido após o pagamento | **folha complementar** (a maior) ou desconto na seguinte (a menor), com autorização |
| Verba de competência passada decorrente de processo trabalhista | **não é folha complementar** — é evento **S-2500** do eSocial, com regra própria |

**A regra que evita o segundo erro mais caro do motor:**

> **A folha complementar NÃO tem base própria de INSS e de IRRF.** Ela **soma à base da
> competência**, o tributo é **recalculado sobre o total**, e retém-se apenas a diferença.

```
INSS_complementar = progressivo(base_original + base_complementar) − INSS_já_retido
IRRF_complementar = f(base_total_recalculada)                      − IRRF_já_retido
```

Isso é consequência direta da progressividade do INSS e da tabela do IRRF: uma verba
adicional entra **no topo** da base, sujeita à **alíquota marginal**, e não recomeça na
primeira faixa.

### CASO C1 — Complementar de horas extras (salário R$ 6.400,00)

**Enunciado.** Competência **09/2026** fechada e paga com salário de R$ 6.400,00, sem
dependentes. Em **12/10/2026** apura-se hora extra de setembro no valor de **R$ 900,00**
(DSR já incluído — premissa do caso).

**Folha original — competência 09/2026**

| Descrição | Provento | Desconto |
|---|---|---|
| Salário base | 6.400,00 | |
| INSS | | **697,51** |
| IRRF | | **532,96** |
| **LÍQUIDO** | | **R$ 5.169,53** |

- INSS: `6.400,00 × 14% − 198,4856 = 697,5144 → 697,51`.
- IRRF: Base A `6.400,00 − 697,51 = 5.702,49` → `659,45`; Base B `5.792,80` → `684,29`.
  Menor: **659,45**. Redutor com RBM 6.400,00 → `978,62 − 852,128 = 126,492 → 126,49`.
  **IRRF = `659,45 − 126,49 = 532,96`.**

**Folha COMPLEMENTAR — competência 09/2026, paga em 10/2026**

| Descrição | Provento | Desconto |
|---|---|---|
| Horas extras de 09/2026 (apuração complementar) | 900,00 | |
| INSS complementar | | **126,00** |
| IRRF complementar | | **332,68** |
| **LÍQUIDO DA COMPLEMENTAR** | | **R$ 441,32** |

**Memória de cálculo — recálculo sobre a base total (R$ 7.300,00)**

| Etapa | Original (6.400,00) | Total (7.300,00) | **Complementar** |
|---|---|---|---|
| INSS | 697,51 | `7.300,00 × 14% − 198,4856 = 823,51` | **126,00** |
| IRRF — Base A | 5.702,49 → 659,45 | `7.300,00 − 823,51 = 6.476,49` → 872,30 | |
| IRRF — Base B | 5.792,80 → 684,29 | `6.692,80` → 931,79 | |
| Imposto apurado | 659,45 | 872,30 | |
| Redutor (RBM 6.400 → 7.300) | 126,49 | **6,66** | |
| IRRF devido | 532,96 | 865,64 | **332,68** |

⚠ **DOIS ERROS QUANTIFICADOS**

| Erro | Cálculo errado | Correto | Diferença |
|---|---|---|---|
| INSS sobre a verba isolada | `900,00 × 7,5% = 67,50` | **126,00** | **58,50 a menos** |
| IRRF sobre base isolada | `900,00 − 607,20 = 292,80` → **isento = 0,00** | **332,68** | **332,68 a menos** |

O erro do IRRF é total: tratada isoladamente, a verba de R$ 900,00 fica **isenta**; somada à
base da competência, custa R$ 332,68. Um motor que erre isso gera **R$ 391,18 de retenção a
menor por empregado**, com multa e juros no acerto.

⚠ **A carga marginal real.** Sobre os R$ 900,00 de hora extra: INSS 14,00% + IRRF 36,96% =
**50,96%**. O empregado leva **R$ 441,32**. A causa é o **redutor decrescente** da
Lei 15.270/2025: na faixa de RBM entre R$ 5.000,01 e R$ 7.350,00, cada real adicional
aumenta o imposto em 27,5% **e** reduz o redutor em 13,3145% — **alíquota marginal teórica
de 40,81%**. Aqui ela sai em 36,96% porque o INSS adicional também deduziu da base A.
**Este número precisa aparecer no holerite e na conversa com o cliente:** hora extra nessa
faixa salarial rende metade do que o empregado imagina.

⚠ **Pendência nova N09 — competência da retenção do IRRF.** A base do INSS é recomposta na
competência **original** (09/2026), via S-1200 complementar. O IRRF, por ser regime de caixa
(Lei 7.713/1988, art. 7º, §1º), é retido no mês do **pagamento efetivo** (10/2026) — e aí
poderia compor a base do IRRF de outubro, e não a de setembro. **As duas leituras existem no
mercado e mudam o resultado.** Enquanto não lida a norma, marcar PROVISÓRIO.

---

## 6. ORDEM CANÔNICA DE APURAÇÃO CONSOLIDADA

Estende a seção 14.1 do `03`, que cobre apenas a folha mensal. **A ordem abaixo é a fonte
clássica de divergência de centavos — executar exatamente assim.**

### 6.1 Regra-mãe

```
1. As verbas entram nas bases; as bases produzem os tributos; os tributos e os demais
   descontos saem do líquido. Nada que já é tributo volta para dentro de uma base.
2. INSS tem UMA base por "grupo de incidência" da competência:
       grupo 1 = salário do mês + férias + 1/3          (um teto compartilhado)
       grupo 2 = 13º salário                            (base e TETO PRÓPRIOS)
3. IRRF tem UMA base por "evento tributável":
       evento A = salário do mês        evento B = férias + 1/3
       evento C = 13º (exclusivo na fonte)
   Cada evento tem sua própria tabela, seu próprio desconto simplificado e seu próprio
   redutor. Nunca somar A + B + C.
4. Faltas, atrasos e DSR perdido REDUZEM a base; adiantamento, aviso descontado, pensão,
   VT, coparticipações e consignado NÃO reduzem a base.
```

### 6.2 Sequência para a folha MENSAL COM FÉRIAS

```
 1  Salário base do mês, já proporcionalizado por admissão/demissão
 2  Reduzir faltas, atrasos e DSR perdido            <- ANTES de qualquer base
 3  Adicionais fixos (insalubridade OU periculosidade, transferência)
 4  Recalcular o valor-hora integrado (Súmula 264 TST)
 5  Horas extras, adicional noturno, comissões, prêmios habituais
 6  DSR sobre as variáveis de (5)
 7  Remuneração de FÉRIAS = (remuneração do art. 142 ÷ 30) × dias de direito
 8  1/3 constitucional sobre (7)
 9  Abono pecuniário e seu 1/3 — FORA de INSS, IRRF e FGTS
10  Salário-família — provento, FORA de todas as bases
11  BASE_INSS_grupo1 = (1..8), excluídas as verbas do art. 28, §9º
12  INSS_total = progressivo( MIN(BASE_INSS_grupo1 ; 8.475,55) )
13  Atribuir: INSS_salário = progressivo(salário); INSS_férias = INSS_total − INSS_salário
14  IRRF evento A: base = salário − INSS_salário − deduções pessoais  |  vs. simplificada
15  IRRF evento B: base = férias + 1/3 − INSS_férias                   |  vs. simplificada
16  Aplicar o redutor a CADA evento, com RBM próprio
17  Demais descontos (ETAPA 5 do `03`, na ordem 5.3 a 5.8)
18  Líquido
19  FGTS 8% sobre (1..8), excluídos abono, férias indenizadas e salário-família
20  Encargos patronais sobre a base do INSS
```

### 6.3 Sequência para o 13º SALÁRIO

```
 1  avos = meses do ano civil com >= 15 dias de trabalho efetivo (máx. 12)
 2  base_13 = (remuneração de dezembro + médias de variáveis do ano) ÷ 12 × avos
 3  1ª parcela = base_13_estimada × 50%    -> SEM INSS, SEM IRRF; COM FGTS no mês do pagamento
 4  Na quitação: INSS_13 = progressivo( MIN(base_13 ; 8.475,55) )   -- base e teto PRÓPRIOS
 5  IRRF_13 = MENOR( f(base_13 − INSS_13 − deduções) ; f(base_13 − 607,20) )
 6  Aplicar o redutor com RBM = base_13 (própria)
 7  2ª parcela = base_13 − 1ª parcela − INSS_13 − IRRF_13 − outros descontos do 13º
 8  FGTS 8% sobre CADA parcela, no mês em que cada uma é paga
 9  CPP + RAT + Terceiros sobre base_13, na competência 13/anual
```

### 6.4 Sequência para a RESCISÃO

```
 1  Determinar o motivo -> quais verbas são devidas (quadro 3.3)
 2  Aviso prévio: dias = MIN(30 + 3 × anos completos ; 90)
 3  Se INDENIZADO: data_projetada = data do afastamento + dias do aviso
    Se TRABALHADO: data_projetada = data da saída (o aviso é salário, não rubrica)
 4  Contar avos SEMPRE sobre a data projetada:
       13º       -> meses do ANO CIVIL com >= 15 dias, até a data projetada
       férias    -> períodos mensais do AQUISITIVO, fração final >= 15 dias = 1 avo
    (as duas contagens têm bases diferentes e não compartilham código)
 5  Saldo de salário = valor-dia × dias trabalhados no mês do desligamento
 6  Férias VENCIDAS + 1/3 (todos os períodos aquisitivos completos não gozados)
 7  Férias PROPORCIONAIS + 1/3 (avos do passo 4)
 8  13º proporcional (avos do passo 4)
 9  BASE_INSS_salário = saldo + aviso TRABALHADO   (aviso INDENIZADO fica fora — P06)
10  BASE_INSS_13 = 13º proporcional                (base e teto próprios)
11  INSS de cada base, separadamente
12  IRRF: evento saldo (com as deduções pessoais) e evento 13º (exclusivo)
       -> férias indenizadas, seu 1/3 e o aviso indenizado ficam FORA
13  BASE_FGTS = saldo + 13º + aviso INDENIZADO (Súmula 305) — férias indenizadas FORA
14  Depósito rescisório = BASE_FGTS × 8%
15  MULTA: base = EXTRATO ANALÍTICO do FGTS Digital + depósitos rescisórios
       -> sem extrato carregado, NÃO calcular; abrir pendência e tarefa no Kanban
16  Descontos: INSS, IRRF, aviso não cumprido, pensão, consignado, adiantamentos
17  Líquido do TRCT (a multa do FGTS NÃO entra aqui — vai à conta vinculada)
18  Encargos patronais sobre as bases de INSS
19  Verificar estabilidade ativa -> BLOQUEAR e abrir tarefa (`03` §12.1)
20  Prazo: 10 dias corridos do término (CLT art. 477, §6º)
```

### 6.5 Sequência para a FOLHA COMPLEMENTAR

```
 1  Identificar a COMPETÊNCIA ORIGINAL da verba (não o mês do pagamento)
 2  Recuperar as bases e os tributos JÁ RETIDOS naquela competência
 3  base_total = base_original + verba complementar
 4  INSS_complementar = progressivo(base_total) − INSS_já_retido
 5  IRRF_complementar = f(base_total recalculada, com redutor) − IRRF_já_retido
 6  FGTS complementar = verba × 8%, na competência original
 7  NUNCA calcular tributo sobre a verba complementar isolada
 8  Retificar o S-1200 da competência original; recolher a diferença com os encargos
```

---

## 7. Índice das asserções automatizadas

O script de conferência contém **145 asserções**, todas verdes. Distribuição:

| Bloco | Asserções | O que garante |
|---|---|---|
| Reprodução do `03` (3 holerites + 13 âncoras) | 22 | que esta massa não contradiz a que já existia |
| Férias (F1 a F4, com 3 variantes) | 34 | assimetria INSS/IRRF, abono fora das bases, médias do art. 142 |
| 13º (T1 a T3) | 17 | 1ª parcela sem desconto, base e teto próprios, redutor no exclusivo |
| Rescisão (R1, R1b, R2 a R5b) | 39 | avos com e sem projeção, incidências do aviso, base da multa |
| Frequência (P1 a P5) | 16 | proporcionalização, DSR perdido, tabela do art. 130 |
| Complementar e adiantamento (A1, C1) | 17 | recálculo sobre a base total e carga marginal |

Somam-se a elas **41 verificações** dos totais e comparativos publicados neste texto —
**186 conferências, zero falha**.

**Regra de regressão:** qualquer alteração no motor tem de reproduzir as 145 asserções ao
centavo. As 22 primeiras são intocáveis — quebrá-las significa quebrar o `03`.

⚠ **Duas conferências manuais divergiram do script e o script estava certo nas duas:** o
INSS de R$ 2.700,00 (faixa 2, não faixa 3 — o limite da faixa 2 é R$ 2.902,84) e o redutor
sobre RBM de R$ 5.866,67. Ambas viraram asserção. É a razão de a regra de método deste
projeto ser "não publique número que o script não reproduza".

---

## 8. Erros de motor quantificados nesta massa (resumo executivo)

| # | Erro | Onde | Custo por ocorrência |
|---|---|---|---|
| 1 | INSS de férias em base separada do salário do mês | F2 | **R$ 574,93** a mais descontado do empregado |
| 2 | IRRF de verba complementar em base isolada | C1 | **R$ 332,68** de retenção a menor |
| 3 | Férias calculadas só sobre o salário base, sem médias | F4 | **R$ 2.506,67** a menos no bruto |
| 4 | Ignorar a projeção do aviso indenizado na contagem de avos | R1 × R2 | **R$ 1.100,00** de verbas a menos |
| 5 | INSS complementar sobre a verba isolada | C1 | **R$ 58,50** a menor, com multa e juros |
| 6 | Tratar falta como quantidade, não como data | P3 | até **R$ 264,00** de diferença |
| 7 | Perder o avo por um dia na fronteira dos 15 dias | T2 | **R$ 325,00** de 13º |
| 8 | Pagar 28/30 em fevereiro a quem trabalhou o mês inteiro | P1 | **R$ 200,00** |
| 9 | Estimar a multa do FGTS sem o extrato analítico | R1 | indeterminado — proibido no motor |

---

## 9. PENDÊNCIAS NOVAS

> Nenhuma destas existia nos documentos `01` a `07`. Cada linha vira **uma tarefa no Kanban
> G41** (`tarefas.g41.com.br/api/public/tasks`, com `X-Idempotency-Key`), no mesmo padrão da
> seção 16 do `03`. Enquanto abertas, o cálculo correspondente sai **PROVISÓRIO**.

| # | Pendência | Criticidade | Onde decide | Efeito enquanto aberta |
|---|---|---|---|---|
| **N01** | **Rateio do INSS entre salário e férias** na mesma competência: sequencial (adotado) ou proporcional. Não há norma; muda o IRRF em **R$ 59,96** no caso F2 | **ALTA** | Lei 8.212/1991, art. 28; leiaute S-1200 (rubricas e bases por evento) | expor o método na memória de cálculo; PROVISÓRIO |
| **N02** | **Alocação da dedução de dependente** (e de pensão e previdência privada) entre bases concorrentes na mesma competência — salário, férias e 13º. Muda o IRRF em **R$ 71,67** no F2. Cabe ao motor **otimizar** (menor imposto total) ou seguir regra fixa? | **ALTA** | Lei 9.250/1995, art. 4º; IN RFB 1.500/2014 | regra adotada: dedução na base do salário; expor no holerite |
| **N03** | **RBM do redutor em bases separadas** (desdobramento da P02 do `03`): cada evento tributável tem RBM próprio ou o RBM é a soma do que a fonte pagou no mês? Muda o IRRF em **R$ 179,75** no F2 | **ALTA** | Lei 15.270/2025 + IN RFB 2.299/2025 | RBM próprio por evento (adotado); PROVISÓRIO |
| **N04** | **Projeção do aviso do art. 484-A** e arredondamento da metade de número ímpar de dias (39 ÷ 2 = 19,5): projeta 19, 19,5 ou 20 dias? Muda avos de 13º e de férias | **ALTA** para o distrato | CLT art. 484-A c/c art. 487, §1º | premissa fixada (20 dias); PROVISÓRIO |
| **N05** | **Perda do FERIADO da semana** em que houve falta, além do domingo. Diferença de **R$ 88,00** no caso P3 | **MÉDIA-ALTA** | Lei 605/1949, arts. 6º e 9º; CCT do cliente | parametrizar por cliente; premissa no holerite |
| **N06** | **Atraso injustificado faz perder o DSR** da semana? Jurisprudência dividida | **MÉDIA-ALTA** | Lei 605/1949, art. 6º; jurisprudência do TRT da região | adotado: NÃO desconta (conservador); parametrizar |
| **N07** | **Mês civil com menos de 30 dias.** Vínculo que cobre fevereiro inteiro paga 30/30 ou 28/30? Diferença de **R$ 200,00** por empregado | **MÉDIA-ALTA** | CLT art. 64; não há norma expressa | regra adotada: cobre o mês → integral; documentar no contrato |
| **N08** | **Incidências (INSS, IRRF, FGTS) sobre a indenização do art. 479** da CLT — rescisão antecipada de contrato a prazo | **MÉDIA** | CLT art. 479; Lei 8.212/1991, art. 28, §9º | incidências = `null`; TRCT PROVISÓRIO |
| **N09** | **Competência da retenção do IRRF na folha complementar** paga em mês diferente: base da competência original ou do mês do pagamento (caixa)? | **ALTA** | Lei 7.713/1988, art. 7º, §1º; IN RFB 1.500/2014; MOS do eSocial | PROVISÓRIO em toda complementar que atravessa competências |
| **N10** | **Média de comissões para férias**: aritmética simples ou **atualizada monetariamente**? O art. 142, §3º, fala em correção | **MÉDIA** | CLT art. 142, §§1º a 6º | premissa: média simples; expor no holerite |
| **N11** | **Competência de apuração das férias pagas na competência anterior ao gozo** (art. 145 exige pagamento 2 dias antes). Competência do pagamento ou do gozo, para INSS e para o S-1200? | **ALTA** | Lei 8.212/1991, art. 28, I; MOS do eSocial | premissa: competência do pagamento; PROVISÓRIO |
| **N12** | **A multa do FGTS entra no líquido do TRCT?** Ela é creditada na conta vinculada, não paga em dinheiro — mas alguns TRCTs a exibem como verba | **MÉDIA** | Lei 8.036/1990, art. 18; leiaute do TRCT e do FGTS Digital | adotado: fora do líquido, dentro do custo do empregador |
| **N13** | **O desconto do aviso não cumprido reduz a base** de INSS/FGTS? Adotado: **não** reduz | **BAIXA-MÉDIA** | CLT art. 487, §2º; Lei 8.212/1991, art. 28 | decisão declarada; confirmar antes do go-live |
| **N14** | **Base de estimativa da 1ª parcela do 13º** quando paga antes de novembro (avos ainda abertos) | **BAIXA-MÉDIA** | Lei 4.749/1965, art. 2º | premissa: estimar o ano e acertar na quitação |
| **N15** | **Base negativa pelo desconto simplificado** (base < R$ 607,20, como no 13º do caso R5). Regra adotada: **piso zero**, nunca crédito | **BAIXA** | Lei 13.149/2015; IN RFB 2.299/2025 | regra dura no motor; sem norma lida |
| **N16** | **Redução do aviso do art. 488** (2h/dia ou 7 dias corridos) aplicada ao aviso **proporcional** de mais de 30 dias: reduz sobre 30 ou sobre o total? | **BAIXA-MÉDIA** | CLT art. 488; Lei 12.506/2011 | premissa: 7 dias ao final, sem prejuízo salarial |

### 9.1 Pendências herdadas que esta massa AGRAVA

| Pendência do `03` | Como esta massa a agrava |
|---|---|
| **P02** — definição de RBM do redutor | Deixou de ser questão de um caso: **domina o resultado de F1, F2, F3, F4, T1, T3, C1**. Um erro aqui erra a folha inteira, não uma linha |
| **P05** — dia útil para o DSR | Quantificado: 25 × 21 dias úteis no mesmo mês (setembro/2026), dependendo do tratamento do sábado |
| **P06** — INSS sobre aviso indenizado | Quantificado em R1: R$ 4.680,00 de base em disputa, mais R$ 1.301,04 de encargo patronal no comparativo R1 × R1b |
| **P10** — divisor do salário-hora | Atinge o cálculo de médias de HE para férias (F4) e o desconto de atrasos (P4) |
| **O-05** da auditoria — RAT/FAP/Terceiros presumidos | Repetido aqui como **premissa do caso**, explicitamente rotulada, e não como parâmetro do motor |

---

## 10. O que este documento NÃO cobre

Registro honesto do que continua faltando na seção D da auditoria, para que ninguém suponha
cobertura que não existe:

- **Férias coletivas** e férias que atravessam duas competências com médias diferentes.
- **Rescisão de empregado com estabilidade** (gestante, acidentária, cipeiro) — o `03` §12.1
  manda bloquear, e o bloqueio não tem caso de teste.
- **Rescisão por morte do empregado**, **culpa recíproca** e **rescisão indireta**
  (art. 483) — as três estão no quadro do `03` §9.1 sem exemplo numérico.
- **Rescisão de aprendiz** (multa sobre depósitos de 2% — pendência P15 do `03`) e de
  **doméstico** (LC 150/2015, com os 3,2% de antecipação da multa).
- **Salário-maternidade com variáveis** e a compensação na CPP.
- **RPA / autônomo** e a ponte para a EFD-Reinf.
- **Múltiplos vínculos** na rescisão e nas férias (o `03` §2.4 tem a fórmula, sem caso).
- **Pensão alimentícia** nas férias, no 13º e na rescisão — depende da pendência P03 do `03`,
  que é bloqueante.
- **De-para de rubrica interna para os códigos de incidência do S-1010** — o maior risco do
  módulo segundo o `01`, e continua sem especificação.

---

*G41 Inteligência Contábil — módulo de folha do sistema Lior. Documento de engenharia de
cálculo: a aritmética está provada, a vigência não. **Insights Impulsionam.***
