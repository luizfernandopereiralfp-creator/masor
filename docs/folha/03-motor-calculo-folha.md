# Motor de Cálculo de Folha de Pagamento — Sistema Lior

> **Documento normativo do motor.** Cada regra traz FÓRMULA + FUNDAMENTO LEGAL + FONTE.
> **Data de pesquisa e acesso a todas as URLs: 30/08/2026.**
> Regra do projeto (anti-invenção): número sem fonte não entra no motor. O que não foi
> confirmado está em **PENDÊNCIA — não confirmado** e o motor deve tratar como `null`,
> bloqueando o cálculo ou marcando o resultado como PROVISÓRIO.

---

## 0. Nota de método e limitação desta rodada de pesquisa

**Limitação de rede desta sessão (registrar para auditoria):** o proxy de egresso bloqueou
o acesso direto a `planalto.gov.br`, `in.gov.br`, `gov.br` e `camara.leg.br`. Os textos
normativos **não foram abertos na íntegra**; os valores abaixo foram obtidos por busca web
e submetidos a **três filtros de validação**:

1. **Convergência entre fontes independentes** (mínimo 2 fontes distintas com o mesmo número).
2. **Prova aritmética interna** — cada tabela foi recalculada e precisa fechar sozinha
   (ex.: o teto de desconto do INSS de R$ 988,09 tem de sair da soma das 4 faixas; as
   parcelas a deduzir do IRRF têm de casar nos pontos de fronteira). Toda prova aritmética
   está registrada na seção 15 e **vira teste automatizado**.
3. **Marcação explícita** do que não passou nos dois filtros anteriores → seção PENDÊNCIAS.

**Ação obrigatória antes do go-live:** abrir o DOU / Planalto e conferir literalmente
Decreto 12.797/2025, Portaria Interministerial MPS/MF 13/2026 (Anexo II), Lei 15.270/2025
e IN RFB 2.299/2025. Enquanto isso não ocorrer, as tabelas devem estar marcadas no banco
com `fonte_verificada = false`.

---

## 1. Salário mínimo e pisos

### 1.1 Salário mínimo nacional 2026

| Parâmetro | Valor 2026 | Fórmula |
|---|---|---|
| Mensal | **R$ 1.621,00** | — |
| Diário | **R$ 54,04** | `1.621,00 ÷ 30` = 54,0333 → 54,04 |
| Horário | **R$ 7,37** | `1.621,00 ÷ 220` = 7,3682 → 7,37 |

- **Fundamento legal:** CF/88, art. 7º, IV; Lei 14.663/2023 (política de valorização);
  **Decreto nº 12.797/2025**, art. 1º — vigência **01/01/2026**.
- **Fontes (acesso 30/08/2026):**
  - https://www.gov.br/esocial/pt-br/noticias/novo-salario-minimo-2026-veja-como-registrar-o-reajuste-no-esocial-domestico
  - https://www.serasaexperian.com.br/carreiras/blog-carreiras/qual-e-o-salario-minimo-2026/
  - https://www.buk.com.br/blog/reajuste-do-salario-minimo-decreto-2026
- **Prova aritmética:** 1.621,00 = 1.518,00 × 1,06785 (reajuste ≈ 6,79% sobre o SM/2025 de
  R$ 1.518,00) e 1.621,00 − 1.518,00 = R$ 103,00 — confere com o divulgado.
- ⚠ **PENDÊNCIA de forma:** o número do decreto (12.797/2025) veio de fonte secundária.
  Confirmar no Planalto antes do go-live.

**Regra do motor:** o divisor mensal para salário-hora é a **jornada contratual**, não fixo 220.
`salário_hora = salário_mensal ÷ (jornada_semanal × 5)` — 44h/sem → 220; 40h/sem → 200;
36h/sem → 180; 30h/sem → 150. Fundamento: CF/88 art. 7º, XIII (44h semanais) e CLT art. 64
(`salário_hora = salário_mensal ÷ 30 ÷ jornada_diária` para mensalista, quando aplicável).
⚠ **PENDÊNCIA:** definir por parâmetro do cliente qual dos dois divisores (220 ou art. 64)
o sistema usa — é fonte clássica de divergência de centavos e **não há norma única**.

### 1.2 Pisos regionais e pisos de categoria

- **Existem pisos regionais estaduais**, instituídos por lei estadual com base na
  **Lei Complementar nº 103/2000**, que delegou aos Estados e ao DF a fixação de piso
  salarial (CF/88, art. 22, parágrafo único). Hoje existem em **PR, RJ, RS, SC e SP**
  (rol a confirmar anualmente).
- **Pisos de categoria** vêm de CCT/ACT (CLT art. 611-A e 611-B).
- **Regra hierárquica do motor:** `piso_aplicável = MAIOR(SM nacional; piso regional da UF
  para a ocupação; piso da CCT da categoria)`. Nunca pagar abaixo do maior deles.
- ⚠ **PENDÊNCIA — não confirmado:** valores de cada piso regional 2026 e das CCTs.
  Precisa: lei estadual de reajuste do piso de cada UF (publicada geralmente entre jan e mai)
  e o instrumento coletivo registrado no **Mediador/MTE**. **O motor NÃO deve chutar piso.**
  Campo `piso_regional` e `piso_cct` = `null` até cadastro com fonte.

---

## 2. INSS do segurado (desconto do empregado)

### 2.1 Tabela progressiva 2026 — empregado, doméstico e trabalhador avulso

Vigência **01/01/2026** — **Portaria Interministerial MPS/MF nº 13, de 09/01/2026**, Anexo II
(publicada no DOU em 12/01/2026).

| # | Faixa do salário de contribuição | Alíquota da faixa | Parcela a deduzir (uso interno) |
|---|---|---|---|
| 1 | até R$ 1.621,00 | 7,5% | R$ 0,0000 |
| 2 | de R$ 1.621,01 até R$ 2.902,84 | 9% | R$ 24,3150 |
| 3 | de R$ 2.902,85 até R$ 4.354,27 | 12% | R$ 111,4002 |
| 4 | de R$ 4.354,28 até R$ 8.475,55 | 14% | R$ 198,4856 |

- **Teto do salário de contribuição 2026: R$ 8.475,55**
- **Desconto máximo do empregado 2026: R$ 988,09**
- **Alíquota efetiva no teto: 11,66%**

**Fundamento legal:** Lei 8.212/1991, art. 20 (redação da EC 103/2019, art. 28);
EC 103/2019 art. 28 (progressividade por faixa); Portaria Interministerial MPS/MF 13/2026.

**Fontes (acesso 30/08/2026):**
- https://www.gov.br/previdencia/pt-br/assuntos/rpps/destaques/publicada-a-portaria-interministerial-mps-mf-no-13-de-9-01-2026-que-dispoe-sobre-o-reajuste-dos-beneficios-pagos-pelo-inss-e-demais-valores
- https://www.gov.br/previdencia/pt-br/assuntos/rpps/documentos/PortariaInterministerialMPSMF13de9dejaneirode2026.pdf
- https://www.totvs.com/blog/fiscal-clientes/inss-nova-tabela-de-contribuicao-e-reajuste-dos-beneficios-para-2026/
- https://www.contabilizei.com.br/contabilidade-online/tabela-inss/
- https://www.metadados.com.br/blog/tabela-do-inss

### 2.2 Como se calcula (progressivo por fatia) — FÓRMULA CANÔNICA

```
SC = MIN(salário_de_contribuição_do_mês ; 8.475,55)

INSS = 0
para cada faixa i (limite_inferior_i, limite_superior_i, alíquota_i):
    parcela_na_faixa = MAX(0 ; MIN(SC, limite_superior_i) − limite_inferior_i)
    INSS += parcela_na_faixa × alíquota_i
INSS = arredondar(INSS, 2)
```

Forma equivalente e mais barata (usar como implementação, a de cima como oráculo de teste):

```
INSS = arredondar( SC × alíquota_da_faixa_de_SC − parcela_a_deduzir_da_faixa , 2 )
```

**Exemplo numérico obrigatório (SC = R$ 3.500,00):**

| Faixa | Base na faixa | Alíq. | Contribuição |
|---|---|---|---|
| 1 | 1.621,00 − 0 = 1.621,00 | 7,5% | 121,5750 |
| 2 | 2.902,84 − 1.621,00 = 1.281,84 | 9% | 115,3656 |
| 3 | 3.500,00 − 2.902,84 = 597,16 | 12% | 71,6592 |
| 4 | — (SC < 4.354,28) | 14% | 0,0000 |
| **Total** | | | **R$ 308,60** |

Conferência pela forma curta: `3.500,00 × 12% − 111,4002 = 420,00 − 111,4002 = 308,5998 → 308,60` ✔

⚠ **Erro clássico a evitar:** aplicar 12% sobre os R$ 3.500,00 inteiros (daria R$ 420,00 —
R$ 111,40 a mais). A progressividade por fatia é obrigatória desde 01/03/2020 (EC 103/2019).

### 2.3 Contribuinte individual, pró-labore e autônomo

| Situação | Alíquota | Base | Fundamento |
|---|---|---|---|
| Contribuinte individual (sócio/pró-labore) que presta serviço **a empresa** | **11%**, descontado e recolhido pela empresa | remuneração, limitada ao teto R$ 8.475,55 | Lei 10.666/2003, art. 4º; Lei 8.212/1991, art. 30, §4º |
| Contribuinte individual / facultativo **por conta própria** (plano normal) | **20%** | entre 1 SM (R$ 1.621,00) e o teto | Lei 8.212/1991, art. 21, *caput* |
| Plano simplificado do contribuinte individual/facultativo | **11%** sobre 1 SM (sem direito a aposentadoria por tempo de contribuição) | R$ 1.621,00 | Lei 8.212/1991, art. 21, §2º, I |
| Facultativo baixa renda (dona de casa) | **5%** sobre 1 SM | R$ 1.621,00 | Lei 8.212/1991, art. 21, §2º, II, "b" |
| Autônomo que presta serviço **a pessoa física** | 20% (recolhimento próprio, GPS) | 1 SM ao teto | Lei 8.212/1991, art. 21 |

**Fórmula do pró-labore:** `INSS_desconto = MIN(pró_labore ; 8.475,55) × 11%`
→ desconto máximo do pró-labore em 2026 = **R$ 932,31** (`8.475,55 × 0,11 = 932,3105`).

**Fontes:** https://www.jusbrasil.com.br/topicos/11003152/artigo-4-da-lei-n-10666-de-08-de-maio-de-2003 ·
https://www.coad.com.br/home/noticias-detalhe/120325/orientacao-contribuinte-individual-retencao-da-contribuicao-pela-empresa
(acesso 30/08/2026).

⚠ **PENDÊNCIA — não confirmado:** as alíquotas de 20%/11%/5% e a redação vigente do art. 21
da Lei 8.212/1991 **não foram lidas no texto oficial nesta sessão** (Planalto bloqueado).
Confirmar antes do go-live. Os valores em reais derivam do SM e do teto já confirmados.

### 2.4 Teto com múltiplos vínculos (regra crítica)

Quando o segurado tem **mais de um vínculo/atividade** no RGPS, a contribuição é devida em
cada um, **mas o conjunto respeita o teto**.

**Fórmula (ordem canônica):**
```
1. O segurado declara por escrito a cada fonte pagadora os valores das demais fontes
   (declaração com identificação das empresas e valores).
2. Ordenar os vínculos: primeiro os de EMPREGADO/avulso, depois contribuinte individual.
3. Para cada vínculo n, na ordem:
     base_acumulada_anterior = soma das bases já consideradas nos vínculos 1..n−1
     base_do_vínculo_n = MIN( remuneração_n ; 8.475,55 − base_acumulada_anterior )
     INSS_n = progressivo(base_acumulada_anterior + base_do_vínculo_n)
              − progressivo(base_acumulada_anterior)
4. Soma dos INSS_n ≤ 988,09
```
Ponto essencial: **a alíquota de cada vínculo é determinada pela SOMA das remunerações**,
não pela remuneração isolada — por isso o vínculo secundário costuma começar já na faixa
mais alta.

**Fundamento legal:** Lei 8.212/1991, art. 28, §5º (limite máximo do salário de contribuição
considerado o total das remunerações); IN RFB nº 2.110/2022 (procedimento da declaração de
múltiplos vínculos e forma de rateio).

⚠ **PENDÊNCIA — não confirmado:** o **número do artigo da IN RFB 2.110/2022** que disciplina
o procedimento de múltiplos vínculos não foi confirmado (a IN foi localizada, o artigo não).
Consultar: IN RFB 2.110/2022, Seção de salário de contribuição.
Fonte da IN: https://www.legisweb.com.br/legislacao/?id=437340 (acesso 30/08/2026).

---

## 3. IRRF

### 3.1 Tabela progressiva mensal vigente em 2026

| Base de cálculo mensal | Alíquota | Parcela a deduzir |
|---|---|---|
| até R$ 2.428,80 | — (isento) | R$ 0,00 |
| de R$ 2.428,81 até R$ 2.826,65 | 7,5% | R$ 182,16 |
| de R$ 2.826,66 até R$ 3.751,05 | 15% | R$ 394,16 |
| de R$ 3.751,06 até R$ 4.664,68 | 22,5% | R$ 675,49 |
| acima de R$ 4.664,68 | 27,5% | R$ 908,73 |

- **Dedução por dependente:** **R$ 189,59/mês**
- **Desconto simplificado mensal (alternativo):** **R$ 607,20** (= 25% do limite da 1ª faixa:
  `2.428,80 × 0,25 = 607,20` ✔)

**Fundamento legal:** Lei 11.482/2007, art. 1º (tabela mensal), com a redação dada pela
**Lei 15.191/2025**; Lei 9.250/1995, art. 4º (deduções e dependente); Lei 13.149/2015 e
Lei 14.848/2024 (desconto simplificado mensal); regulamentação: **IN RFB nº 2.299/2025**.

**Fontes (acesso 30/08/2026):**
- https://www.ecalculo.net.br/tabelas/irrf
- https://www.creditas.com/exponencial/tabela-imposto-de-renda/
- https://contabilidade.com/tabela-irpf/
- https://www.legisweb.com.br/legislacao/?id=488041 (IN RFB 2.299/2025)

**Prova aritmética das parcelas a deduzir (todas fecham nos pontos de fronteira):**

| Fronteira | Pela faixa de baixo | Pela faixa de cima | ✔ |
|---|---|---|---|
| 2.428,80 | isento = 0,00 | 2.428,80×7,5% − 182,16 = 0,00 | ✔ |
| 2.826,65 | ×7,5% − 182,16 = 29,84 | ×15% − 394,16 = 29,84 | ✔ |
| 3.751,05 | ×15% − 394,16 = 168,50 | ×22,5% − 675,49 = 168,50 | ✔ |
| 4.664,68 | ×22,5% − 675,49 = 374,06 | ×27,5% − 908,73 = 374,06 | ✔ |

### 3.2 A isenção efetiva até R$ 5.000 — o "redutor" da Lei 15.270/2025

A tabela acima **não mudou** a faixa de isenção nominal. O que zera o imposto de quem ganha
até R$ 5.000 é um **redutor aplicado sobre o imposto apurado**, criado pela
**Lei nº 15.270, de 26/11/2025**, com vigência a partir de **01/01/2026**.

**FÓRMULA DO REDUTOR MENSAL:**

```
RBM = rendimentos tributáveis sujeitos à incidência mensal, pagos pela fonte pagadora

se RBM ≤ 5.000,00        →  redutor = imposto_apurado           (zera o IRRF)
se 5.000,01 ≤ RBM ≤ 7.350,00 →  redutor = 978,62 − (0,133145 × RBM)
se RBM > 7.350,00        →  redutor = 0

redutor = MIN(redutor ; imposto_apurado)     -- nunca gera restituição na fonte
redutor = MAX(redutor ; 0)

IRRF_devido = imposto_apurado − redutor
```

**Prova aritmética do redutor (dois pontos de ancoragem):**
- Em RBM = 7.350,00 → `978,62 − 0,133145×7.350 = 978,62 − 978,616 = 0,004 ≈ 0` ✔
  (a fórmula zera exatamente no fim da faixa — como tem de ser)
- Em RBM = 5.000,00 → `978,62 − 665,725 = 312,895 ≈ 312,89` ✔
  e o imposto apurado em R$ 5.000 pelo desconto simplificado é
  `(5.000 − 607,20) × 27,5% − 908,73 = 988,38 − 908,73 = 312,89` ✔ → **IRRF = 0**.
  Os dois caminhos batem no centavo. Esse é o teste-âncora do motor.

**Aplicação ao 13º salário:** a redução **também se aplica** ao imposto exclusivo de fonte
do 13º salário (Lei 15.270/2025, dispositivo que remete ao art. 7º, VIII, da CF/88).

**Anual (para conferência e para o cliente entender):** isenção até R$ 60.000/ano de
rendimentos tributáveis; redução parcial de R$ 60.000,01 a R$ 88.200,00; acima disso, sem
redutor. Instituído também o **IRPFM** (imposto mínimo) para rendimentos anuais acima de
R$ 600 mil — **não é assunto de folha**, mas afeta sócios/pró-labore alto.

**Fontes (acesso 30/08/2026):**
- https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/dezembro/receita-federal-orienta-fontes-pagadoras-e-contribuintes-a-calcular-a-reducao-do-imposto-de-renda-a-partir-de-1o-de-janeiro-de-2026
- https://www.legisweb.com.br/noticia/?id=31995
- https://www.migalhas.com.br/depeso/445501/reforma-do-irpf-o-que-muda-em-cada-faixa-de-renda-com-a-lei-15-270-25
- https://www.metadados.com.br/blog/isencao-do-ir

⚠ **PENDÊNCIA — não confirmado (ALTA criticidade):**
1. **Definição exata de RBM** para o redutor: se a base é o rendimento **bruto** do mês ou o
   rendimento **tributável após INSS**. As fontes usam "rendimentos tributáveis sujeitos à
   incidência mensal", o que sugere o **bruto antes das deduções**, mas isso precisa ser lido
   na **Lei 15.270/2025** e na **IN RFB 2.299/2025**. Um erro aqui muda o IRRF de toda a folha.
2. Se férias pagas em separado formam **RBM próprio** ou somam ao RBM do salário do mês para
   fins do redutor.
3. Tratamento do redutor quando há **mais de uma fonte pagadora**.
   → Até a leitura da norma, campo `redutor_base` = `null` e resultado marcado **PROVISÓRIO**.

### 3.3 Base de cálculo — o que deduz antes

```
Base_IRRF (deduções legais) = rendimentos tributáveis do mês
                            − INSS retido no mês
                            − (189,59 × nº de dependentes)
                            − pensão alimentícia (decisão/acordo judicial ou escritura pública)
                            − contribuição a previdência privada / FAPI paga pelo empregado
                            − parcela isenta de aposentadoria (65+), quando aplicável

Base_IRRF (simplificada)    = rendimentos tributáveis do mês − 607,20

IRRF = MENOR imposto entre as duas bases, aplicada a tabela, e então o redutor
```

**Fundamento legal:** Lei 9.250/1995, art. 4º, incisos II a VI (deduções: INSS, dependente,
pensão, previdência privada); Lei 11.482/2007 art. 1º (tabela); Lei 13.149/2015 (desconto
simplificado como alternativa); Lei 7.713/1988, art. 3º e 7º (retenção na fonte).

**Regras de detalhe que o motor deve respeitar:**
- **Vale-transporte, VR/VA, plano de saúde e consignado NÃO deduzem** da base do IRRF.
  (Plano de saúde deduz apenas na **declaração anual**, não na fonte.)
- Dependente é dedução **fixa por dependente**, sem proporcionalidade por dias.
- Pensão alimentícia deduz **pelo valor integral** determinado judicialmente, mas **só a
  parcela decorrente de decisão judicial/acordo homologado/escritura pública**.
- O desconto simplificado **substitui todas** as deduções legais — não se somam.

**Regime:** **caixa**. Vale a tabela vigente no **mês do pagamento**, não no mês de competência.
Fundamento: Lei 7.713/1988, art. 7º, §1º (retenção na data do pagamento ou crédito).

### 3.4 IRRF sobre 13º salário

- **Tributação exclusiva na fonte**, **separada** dos demais rendimentos do mês.
- **Não há retenção na 1ª parcela** (adiantamento).
- Retenção integral na **quitação** (2ª parcela, em dezembro, ou na rescisão), sobre o
  **13º bruto do ano**, com base na tabela do **mês da quitação**.
- Base do 13º = `13º bruto − INSS sobre o 13º − dependentes − pensão alimentícia sobre o 13º`.
- Não é compensável na Declaração de Ajuste Anual (é definitivo).
- O **redutor da Lei 15.270/2025 se aplica** também ao 13º.

**Fundamento legal:** Lei 7.713/1988, art. 26; **IN RFB nº 1.500/2014, art. 13 e §1º**
(mês de quitação = dezembro ou o da rescisão).
**Fontes:** https://blog.econeteditora.com.br/incidencia-do-imposto-de-renda-na-fonte-sobre-o-13o-salario/ ·
https://www.normaslegais.com.br/legislacao/instrucao-normativa-rfb-1500-2014.htm (acesso 30/08/2026).

### 3.5 IRRF sobre férias

- **Férias gozadas + 1/3 constitucional são tributáveis** e a retenção é calculada
  **em separado** dos demais rendimentos pagos no mesmo mês.
- **Abono pecuniário** (venda de 1/3) e o respectivo terço: **isentos**.
- Tabela do **mês do pagamento** (regime de caixa).
- Deduções admitidas na base de férias: dependentes e pensão alimentícia relativos às férias
  (não duplicar os mesmos dependentes na folha do mês — ver seção 14).

**Fundamento legal:** Lei 7.713/1988, art. 3º e 7º; IN RFB nº 1.500/2014.
**Fontes:** https://www.davanzo.com.br/capa.asp?infoid=5896 ·
http://www.ebs.com.br/treinamento/cursos/Ferias/co/calculo_inss_irrf.html (acesso 30/08/2026).

⚠ **PENDÊNCIA — não confirmado (MÉDIA/ALTA criticidade):** o **artigo exato** da IN RFB
1.500/2014 que determina a tributação das férias em separado do salário do mês, e o
**dispositivo que isenta o abono pecuniário**. É prática consolidada de mercado e sustentada
por doutrina, mas o motor precisa do artigo citado no código. Consultar IN RFB 1.500/2014
(arts. 11 e 65 são os candidatos) e Lei 7.713/1988, art. 6º.
**Enquanto não confirmado:** implementar em separado (prática dominante) **mas expor a
premissa no holerite/memória de cálculo**, e deixar o comportamento parametrizável.

---

## 4. FGTS

| Item | Regra | Fundamento |
|---|---|---|
| Alíquota geral | **8%** sobre a remuneração do mês | Lei 8.036/1990, art. 15, *caput* |
| Aprendiz | **2%** | Lei 8.036/1990, art. 15, §7º |
| Doméstico | 8% + **3,2%** (antecipação da multa rescisória) | LC 150/2015, art. 34, IV e V |
| Diretor não empregado | facultativo (8%, se a empresa optar) | Lei 8.036/1990, art. 16 |
| Multa rescisória (dispensa sem justa causa) | **40%** sobre o saldo de todos os depósitos do contrato, corrigido | Lei 8.036/1990, art. 18, §1º |
| Multa em culpa recíproca / força maior | **20%** | Lei 8.036/1990, art. 18, §2º |
| Multa no distrato (art. 484-A) | **20%** | CLT, art. 484-A, I, "b" |
| Contribuição social de 10% (LC 110/2001) | **EXTINTA** desde 01/01/2020 | Lei 13.932/2019, art. 12 |
| Prazo de recolhimento | até o dia **20** do mês seguinte (antecipa se não útil) | Lei 8.036/1990, art. 15 (redação da Lei 14.438/2022) |
| Multa por atraso | encargos do FGTS Digital (multa + juros + atualização) | Lei 8.036/1990, art. 22 |

**Fórmula:** `FGTS_mês = arredondar(base_FGTS × alíquota, 2)`.
O FGTS **não é desconto do empregado** — é encargo do empregador; aparece no holerite
apenas como informativo.

### 4.1 O que integra e o que NÃO integra a base do FGTS

**INTEGRA** (natureza salarial — art. 15 c/c art. 457 e 458 da CLT):
salário base; horas extras e adicional; adicional noturno; insalubridade; periculosidade;
adicional de transferência; comissões; gratificações habituais; DSR sobre variáveis;
13º salário; **férias gozadas + 1/3**; **aviso prévio, trabalhado ou indenizado**
(**Súmula 305 do TST**); salário-maternidade; primeiros 15 dias de afastamento por doença;
todo o período de afastamento por **acidente de trabalho** e de **licença-maternidade**
(Lei 8.036/1990, art. 15, §5º).

**NÃO INTEGRA:**
férias **indenizadas** + 1/3 (vencidas e proporcionais na rescisão) e **abono pecuniário**
(Lei 8.036/1990, art. 15, §6º); salário-família; ajuda de custo e diárias nos termos do
art. 457, §2º, da CLT (Lei 13.467/2017); vale-transporte; auxílio-alimentação in natura /
PAT nos termos do art. 457, §2º; participação nos lucros (Lei 10.101/2000, art. 3º);
abono do art. 457, §2º; prêmios nos termos do art. 457, §4º.

**Fontes:** https://www.coad.com.br/busca/detalhe_16/975/Sumulas_e_enunciados (Súmula 305 TST) ·
https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/perguntas-frequentes
(acesso 30/08/2026).

### 4.2 FGTS do 13º salário

Incide 8% sobre cada parcela do 13º, **no mês do pagamento de cada parcela** (a 1ª parcela
gera FGTS no mês em que é paga; a 2ª, no mês da quitação). Fundamento: Lei 8.036/1990, art. 15.

### 4.3 O que mudou com o FGTS Digital

- Em produção desde **março/2024** (competência 03/2024), substituindo GFIP/SEFIP e a guia GRF.
- **Prazo passou do dia 7 para o dia 20** do mês seguinte (Lei 14.438/2022).
- Arrecadação por **PIX**, via guia gerada no ambiente FGTS Digital, com **individualização
  por trabalhador** e por competência.
- **Base vem do eSocial** (eventos S-1200/S-2299/S-2399 e, para rescisões, **S-2500** em
  processos trabalhistas) — não há mais digitação paralela de base.
- Permite **individualizar** e parcelar débitos, e desde **maio/2026** recebe também os
  recolhimentos de **FGTS decorrentes de processos trabalhistas**.
- Desde março/2026 recebe as parcelas em atraso do **Crédito do Trabalhador** (consignado CLT).

**Fontes (acesso 30/08/2026):**
- https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/perguntas-frequentes
- https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/comunicados/recolhimentos-de-fgts-em-processos-trabalhistas-serao-efetuados-via-fgts-digital-a-partir-de-maio-2026
- https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/manual-e-documentacao-tecnica/manual-do-orientacao-do-fgts-digital-versao-1-50-20-03-2026.pdf
  (**Manual FGTS Digital v1.50, de 20/03/2026** — fonte oficial do leiaute e das regras de base)

---

## 5. Contribuição patronal (encargos do empregador)

### 5.1 Regime normal (Lucro Real / Presumido / Arbitrado)

| Contribuição | Alíquota | Base | Fundamento |
|---|---|---|---|
| **CPP** (INSS patronal) | **20%** | total das remunerações de empregados e avulsos | Lei 8.212/1991, art. 22, I |
| **CPP sobre contribuinte individual** (pró-labore, autônomo PF) | **20%** | remuneração paga a CI — **sem teto** | Lei 8.212/1991, art. 22, III |
| **RAT / GILRAT** | **1%, 2% ou 3%** conforme o grau de risco do **CNAE preponderante do estabelecimento** | remunerações de empregados e avulsos (**não** incide sobre CI) | Lei 8.212/1991, art. 22, II; Decreto 3.048/1999, Anexo V |
| **FAP** (multiplicador do RAT) | **0,5000 a 2,0000** | multiplica a alíquota RAT | Lei 10.666/2003, art. 10; Decreto 6.042/2007 |
| **Terceiros** (Sistema S + salário-educação + INCRA) | variável por **código FPAS**; nos códigos mais comuns = **5,8%** | remunerações de empregados e avulsos | Lei 11.457/2007, art. 3º, §1º; IN RFB 2.110/2022, Anexos II e III |
| Adicional de aposentadoria especial (exposição a agente nocivo) | +12%, +9% ou +6% | remuneração do exposto | Lei 8.212/1991, art. 57, §6º c/c art. 22, II |

**FÓRMULA DO RAT AJUSTADO:**
```
RAT_ajustado (%) = alíquota_RAT_do_CNAE (1, 2 ou 3) × FAP (0,5000 a 2,0000)
Contribuição_RAT = base_empregados × RAT_ajustado
```
Exemplo: CNAE com RAT 2% e FAP 0,7345 → RAT ajustado = 1,4690%.
O FAP é divulgado **anualmente**, com vigência no ano seguinte. **O FAP 2026 foi
disponibilizado em 30/09/2025** nos portais do MPS e da RFB — é **individual por CNPJ** e
tem de ser **buscado empresa a empresa**, nunca presumido.

**Composição de Terceiros (códigos FPAS comuns — total 5,8%):**

| Componente | Alíquota |
|---|---|
| Salário-educação | 2,5% |
| INCRA | 0,2% |
| SENAI **ou** SENAC (formação profissional) | 1,0% |
| SESI **ou** SESC (serviço social) | 1,5% |
| SEBRAE | 0,6% |
| **Total** | **5,8%** |

⚠ **PENDÊNCIA — não confirmado:** a **correspondência FPAS 507 ↔ indústria** e
**FPAS 515 ↔ comércio** apareceu **invertida entre fontes** na pesquisa. O **total de 5,8%
é o mesmo** nos dois códigos, mas o **rateio por entidade** (SESI/SENAI vs. SESC/SENAC) muda
e afeta o preenchimento da DCTFWeb. **Confirmar no Anexo II/III da IN RFB 2.110/2022**
(https://www.normaslegais.com.br/legislacao/anexos-II-VIII-in-rfb-2110-2022.htm) e na
**Tabela 4 do eSocial** (https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-cons-ate-nt-04-2025-rev-26-08-2025/index.html/tabelas.html).
Até lá, o campo `fpas_composicao` fica `null` e o motor só apura o total de 5,8%
**quando o FPAS estiver cadastrado com fonte**.

**Fontes (acesso 30/08/2026):**
- https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/gfip-sefip-guia-do-fgts-e-informacoes-a-previdencia-social-1/fap-fator-acidentario-de-prevencao-legislacao-perguntas-frequentes-dados-da-empresa
- https://www.demarest.com.br/fap-2026-divulgado-o-multiplicador-do-sat/
- https://www.coad.com.br/imagensMat/terceiros.pdf
- https://www.legisweb.com.br/legislacao/?id=437340 (IN RFB 2.110/2022)

### 5.2 Simples Nacional

| Anexo | CPP 20% | RAT | Terceiros |
|---|---|---|---|
| **I, II, III e V** | **incluída no DAS** — não recolhe 20% à parte | não devido | **não devido** |
| **IV** | **NÃO incluída** — recolhe **20% sobre a folha**, fora do DAS, via DCTFWeb/DARF | **devido** (1/2/3% × FAP) | **não devido** |

**Fundamento legal:** LC 123/2006, art. 13, VI e §3º (dispensa das contribuições a terceiros
para todos os optantes); LC 123/2006, art. 18, §5º-C (Anexo IV — CPP fora do DAS).
**Fonte:** https://blog.esimplesauditoria.com.br/anexo-4-do-simples-nacional/ ·
https://confirp.com.br/tabela-simples-nacional-para-prestacao-de-servicos-anexo-iv/ (acesso 30/08/2026).

⚠ **PENDÊNCIA — não confirmado:** se o Anexo IV recolhe **RAT** de forma plena e se há
dispensa de terceiros também nesse anexo — as fontes convergem no "sim para RAT / dispensa
de terceiros", mas o texto da LC 123 não foi lido nesta sessão.

### 5.3 Desoneração da folha / CPRB — situação em 2026 (**mudou; confirmado nesta pesquisa**)

A CPRB está em **reoneração gradual** desde 2025, pela **Lei nº 14.973/2024**, e será
**extinta em 2028**.

| Ano | % da alíquota **CPRB** aplicada sobre a receita bruta | % da alíquota **CPP** (20%) aplicada sobre a folha | CPP efetiva sobre a folha |
|---|---|---|---|
| 2024 | 100% | 0% | 0% |
| 2025 | 80% | 25% | 5% |
| **2026** | **60%** | **50%** | **10%** |
| 2027 | 40% | 75% | 15% |
| 2028 em diante | CPRB extinta | 100% | 20% |

**FÓRMULA 2026 para empresa optante pela CPRB:**
```
CPRB_2026        = receita_bruta_do_mês × (alíquota_CPRB_do_setor × 0,60)
CPP_folha_2026   = base_folha × (20% × 0,50) = base_folha × 10%
RAT + Terceiros  = apurados normalmente sobre a folha (não são substituídos pela CPRB)
13º salário      = ISENTO da CPP (art. 22, I e III, da Lei 8.212/91) em 2025–2027;
                   RAT e Terceiros sobre o 13º são devidos normalmente
```

**Decisão do STF em 2026 (importante e já pacificada):** no julgamento da **ADI 7.633**,
concluído em **30/04/2026**, o STF declarou a **inconstitucionalidade formal dos arts. 1º, 2º,
4º e 5º da Lei 14.784/2023** (a lei que prorrogou a desoneração), **sem pronúncia de nulidade**,
fixando tese de que ampliação de benefício fiscal exige estimativa de impacto orçamentário
(ADCT art. 113 e LRF art. 14). **Efeito prático para a folha:** os efeitos produzidos durante
a vigência foram **integralmente preservados** — **não há cobrança retroativa** dos 20% de CPP
de quem aderiu à CPRB no período. **O cronograma de 2026 acima (60% / 50%) permanece válido**,
porque decorre da **Lei 14.973/2024**, que não foi atingida.

**Fontes (acesso 30/08/2026):**
- https://www.migalhas.com.br/depeso/447519/reoneracao-da-folha-de-salarios--2026
- https://www.migalhas.com.br/depeso/416036/lei-14-973-24--reoneracao-gradual-da-folha-de-pagamentos
- https://www.contabeis.com.br/noticias/74532/desoneracao-da-folha-em-2026-o-que-muda-com-a-reoneracao-gradual/
- https://www.conjur.com.br/2026-mai-11/stf-declara-inconstitucional-lei-14-784-23-mas-preserva-efeitos-da-cprb-durante-sua-vigencia/
- https://www.ibdp.org.br/2026/05/04/ampliacao-da-desoneracao-da-folha-exige-estimativa-de-impacto-orcamentario-decide-stf/

⚠ **PENDÊNCIA — não confirmado:** a **lista dos 17 setores** beneficiados e a **alíquota de
CPRB de cada um** (1% a 4,5%, conforme Lei 12.546/2011, arts. 7º e 8º). O motor **não deve
ter essa tabela hard-coded** — cadastrar por CNAE/CNPJ com fonte e data.

---

## 6. Verbas variáveis

### 6.1 Horas extras

```
valor_hora_normal = salário_base ÷ divisor_mensal   (220 para 44h/sem — ver 1.1)
valor_HE          = valor_hora_normal × (1 + adicional)
total_HE          = Σ (qtd_horas_i × valor_HE_i)
```

| Situação | Adicional mínimo | Fundamento |
|---|---|---|
| Hora extra comum | **50%** | CF/88, art. 7º, XVI |
| Domingos e feriados (sem folga compensatória) | **100%** | Súmula 146 do TST; Lei 605/1949, art. 9º |
| Percentual maior previsto em CCT/ACT | o da norma coletiva | CLT, art. 611-A |
| Limite diário | 2 horas | CLT, art. 59, *caput* |
| Banco de horas (acordo individual escrito) | compensação em até **6 meses** | CLT, art. 59, §5º |
| Banco de horas (acordo/convenção coletiva) | compensação em até **12 meses** | CLT, art. 59, §2º |

**Base da hora extra:** o **salário-hora acrescido dos adicionais de caráter salarial**
(insalubridade, periculosidade, adicional noturno, gratificações habituais) — **Súmula 264
do TST**. Erro comum: calcular HE só sobre o salário base.

**Habitualidade:** HE habituais integram a base de férias, 13º, DSR, FGTS e aviso prévio
(Súmulas 45, 60, 172 e 347 do TST).

⚠ **PENDÊNCIA — não confirmado:** o motor precisa da **CCT vigente da categoria de cada
cliente** para saber se o adicional é 50% ou maior. Campo `adicional_he_cct` = `null` até
cadastro com número de registro do instrumento no Mediador/MTE. **Não assumir 50%
silenciosamente** — assumir 50% e a CCT ser 60% gera passivo.

### 6.2 DSR sobre verbas variáveis — FÓRMULA

```
DSR = ( Σ verbas_variáveis_do_mês ÷ nº_de_dias_ÚTEIS_do_mês )
      × nº_de_domingos_e_feriados_do_mês
```

- Compõem "verbas variáveis": horas extras, adicional noturno, comissões, prêmios de produção
  habituais, gratificações variáveis.
- **NÃO** compõem: adicionais fixos mensais (insalubridade, periculosidade), porque já são
  pagos por mês cheio, com o DSR embutido.
- **Sábado**: é dia útil **não trabalhado** para este cálculo em jornada de 5 dias — salvo
  disposição de norma coletiva que o considere repouso. **Parametrizar por CCT.**
- Comissionistas: o DSR sobre comissões é devido — **Súmula 27 do TST**.
- **Mensalista já tem o DSR do salário fixo embutido** no salário mensal (Lei 605/1949,
  art. 7º, §2º) — o DSR se calcula **apenas sobre as variáveis**. Pagar DSR sobre o fixo é
  duplicidade.

**Fundamento legal:** Lei 605/1949, arts. 1º e 7º; Decreto 27.048/1949; Súmula 27 do TST.

⚠ **PENDÊNCIA — não confirmado:** a definição de "dia útil" (se o sábado entra) e o
tratamento do **DSR sobre DSR** em caso de reflexos. Confirmar em CCT e na jurisprudência
do TRT da região do cliente.

### 6.3 Adicional noturno

| Item | Trabalhador **urbano** | Trabalhador **rural** |
|---|---|---|
| Percentual mínimo | **20%** | **25%** |
| Horário noturno | 22h00 às 5h00 | lavoura 21h–5h; pecuária 20h–4h |
| **Hora reduzida** | **52 min 30 s** (a hora noturna vale 1h para efeito de contagem) | **não há redução** |
| Prorrogação após as 5h | o adicional continua enquanto a jornada noturna se prorroga (Súmula 60, II, do TST) | — |
| Fundamento | CLT, art. 73, *caput*, §§1º e 2º | Lei 5.889/1973, art. 7º |

**FÓRMULA (urbano):**
```
horas_noturnas_reduzidas = minutos_trabalhados_entre_22h_e_5h ÷ 52,5
adicional_noturno        = horas_noturnas_reduzidas × valor_hora_normal × 20%
```
Ou, equivalente e mais comum na folha: `horas_relógio × (60 ÷ 52,5) × valor_hora × 20%`
— o fator **1,142857** (8/7) é a "hora ficta".

A redução de 52'30" pode ser **flexibilizada para 60 minutos por norma coletiva**, desde que
haja **aumento correspondente do percentual** do adicional.

**Fontes:** CLT art. 73; https://www.jusbrasil.com.br/ (Súmula 60 TST) — acesso 30/08/2026.

### 6.4 Insalubridade (atenção à controvérsia da base)

| Grau | Percentual | Fundamento |
|---|---|---|
| Mínimo | **10%** | CLT, art. 192 |
| Médio | **20%** | CLT, art. 192 |
| Máximo | **40%** | CLT, art. 192 |

Caracterização: **NR-15** do MTE, mediante **laudo de perito** (CLT, art. 195).

**BASE DE CÁLCULO — a controvérsia, resolvida na prática assim:**
1. A **Súmula Vinculante nº 4 do STF** proíbe usar o salário mínimo como indexador e
   **proíbe o Judiciário de fixar outra base** por decisão judicial.
2. O STF (Rcl 6.275, min. Lewandowski) **anulou definitivamente** a parte da **Súmula 228 do
   TST** que mandava usar o salário-base — a súmula está **suspensa** desde 2008 nesse ponto.
3. Resultado: **enquanto não houver lei nova ou norma coletiva dispondo diferente, a base
   continua sendo o SALÁRIO MÍNIMO** (art. 192 da CLT).
4. **Se houver CCT/ACT ou norma interna da empresa** fixando base maior (salário-base,
   piso da categoria), **essa prevalece** — e não pode ser reduzida depois. A **2ª Turma do
   STF, em novembro/2025**, afastou o salário mínimo em favor do parâmetro anteriormente
   adotado pela empresa, invocando direito adquirido.

**FÓRMULA:**
```
base_insalubridade = CCT/ACT/norma interna, se houver e for mais benéfica
                     senão → salário mínimo nacional (R$ 1.621,00 em 2026)
insalubridade = base_insalubridade × grau (10% / 20% / 40%)
```

**Fontes (acesso 30/08/2026):**
- https://portal.stf.jus.br/jurisprudencia/sumariosumulas.asp?base=26&sumula=1195 (SV 4)
- https://portal.stf.jus.br/noticias/verNoticiaDetalhe.asp?idConteudo=375438 (Rcl 6.275)
- https://www.migalhas.com.br/quentes/443568/stf-afasta-salario-minimo-no-calculo-de-adicional-de-insalubridade
- https://conjur.com.br/2025-nov-02/stf-afasta-salario-minimo-como-base-para-insalubridade-de-enfermeiro

**Regra do motor:** campo `base_insalubridade` é **obrigatório e explícito** por cliente
(`salario_minimo` | `salario_base` | `piso_cct` | `valor_fixo`), com o fundamento anotado.
Nunca default silencioso.

### 6.5 Periculosidade

```
periculosidade = salário_base × 30%
```
- **Base: o salário-base**, **sem** os adicionais, gratificações, prêmios e participações
  (CLT, art. 193, §1º; **Súmula 191 do TST**).
- Não se acumula com insalubridade — o empregado **opta** pelo mais favorável (art. 193, §2º).
- Eletricitários têm regra própria de base (Súmula 191, II, do TST).

### 6.6 Sobreaviso

```
sobreaviso = horas_de_sobreaviso × valor_hora_normal × 1/3
```
- **Fundamento:** CLT, art. 244, §2º (ferroviários), aplicado por analogia às demais
  categorias; **Súmula 428 do TST** — o simples uso de celular/instrumento telemático **não**
  caracteriza sobreaviso; é preciso **escala de plantão** com restrição da liberdade de
  locomoção.
- Sobreaviso **não é hora extra**; se o empregado é efetivamente acionado, o tempo acionado
  vira hora normal ou extra.

### 6.7 Comissões

- **Fundamento:** Lei 3.207/1957; CLT, art. 457, §1º (comissão integra o salário).
- Base para férias e 13º: **média das comissões** do período aquisitivo / do ano
  (CLT, arts. 142, §3º, e 457).
- Comissionista puro: garantia do **salário mínimo/piso** da categoria (CF/88, art. 7º, VII).
- Comissões **geram DSR** (Súmula 27 do TST) e integram FGTS e INSS.
- Estorno de comissão só é lícito na **insolvência do comprador** (Lei 3.207/1957, art. 7º).

---

## 7. Férias

### 7.1 Períodos

| Conceito | Regra | Fundamento |
|---|---|---|
| Período **aquisitivo** | 12 meses de vigência do contrato | CLT, art. 130 |
| Período **concessivo** | os 12 meses **seguintes** ao aquisitivo | CLT, art. 134 |
| Fracionamento | até **3 períodos**; um deles ≥ **14 dias**; os demais ≥ **5 dias** cada; com concordância do empregado | CLT, art. 134, §1º (Lei 13.467/2017) |
| Vedação | não iniciar férias nos **2 dias** anteriores a feriado ou dia de repouso | CLT, art. 134, §3º |
| Prazo de pagamento | até **2 dias antes** do início do gozo | CLT, art. 145 |
| Não concessão no prazo | pagamento **em dobro** | CLT, art. 137; Súmula 81 do TST |

### 7.2 Faltas × dias de direito (tabela do art. 130 da CLT)

| Faltas **injustificadas** no período aquisitivo | Dias de férias |
|---|---|
| até 5 | **30** |
| de 6 a 14 | **24** |
| de 15 a 23 | **18** |
| de 24 a 32 | **12** |
| **acima de 32** | **0** (perde o direito) |

Regras associadas:
- Faltas **justificadas** (CLT, art. 473) **não** reduzem férias.
- Afastamento por **auxílio por incapacidade** por **mais de 6 meses**, ainda que
  descontínuos, dentro do período aquisitivo → **perde o direito** e inicia novo período
  aquisitivo no retorno (CLT, art. 133, IV e §2º).
- **Regime de tempo parcial**: desde a Lei 13.467/2017 aplica-se a **mesma tabela do art. 130**
  (o antigo art. 130-A foi revogado).

### 7.3 Cálculo

```
remuneração_de_férias = (remuneração_do_mês* ÷ 30) × dias_de_férias
terço_constitucional  = remuneração_de_férias ÷ 3
```
\* Remuneração do mês = salário + **médias** de horas extras, adicional noturno, comissões,
insalubridade/periculosidade e demais variáveis habituais do período aquisitivo
(CLT, art. 142, §§1º a 6º).

**Abono pecuniário ("venda de férias"):**
```
abono            = (remuneração_do_mês ÷ 30) × dias_vendidos     -- máx. 1/3 dos dias
terço_sobre_abono = abono ÷ 3
```
- Limite: **1/3** do período (CLT, art. 143). Requerimento até **15 dias antes** do fim do
  período aquisitivo (art. 143, §1º).
- Em férias coletivas o abono depende de **acordo coletivo** (art. 143, §2º).

**Férias coletivas** (CLT, arts. 139 a 141):
- Até **2 períodos anuais**, nenhum inferior a **10 dias corridos**.
- Comunicar ao **MTE** e ao **sindicato** com **15 dias** de antecedência, e afixar aviso.
- Empregado com menos de 12 meses: goza **férias proporcionais** e **inicia novo período
  aquisitivo** na data do início das coletivas.

### 7.4 Incidências sobre férias

| Verba | INSS | IRRF | FGTS |
|---|---|---|---|
| Férias **gozadas** | **SIM** | **SIM** | **SIM** |
| **1/3** sobre férias **gozadas** | **SIM** (STF, Tema 985) | **SIM** | **SIM** |
| Férias **indenizadas** (vencidas/proporcionais na rescisão) | **NÃO** | **NÃO** | **NÃO** |
| **1/3** sobre férias **indenizadas** | **NÃO** | **NÃO** | **NÃO** |
| **Abono pecuniário** e seu 1/3 | **NÃO** | **NÃO** | **NÃO** |

**Fundamento das não-incidências:** Lei 8.212/1991, art. 28, §9º, "d" e "e" (férias
indenizadas e abono fora do salário de contribuição); Lei 8.036/1990, art. 15, §6º (FGTS);
Súmula 125 do STJ (férias indenizadas e IR).

**Fundamento da incidência sobre o 1/3 de férias gozadas — decisão que mudou o cenário:**
**STF, Tema 985 (RE 1.072.485)**, tese: *"É legítima a incidência de contribuição social
sobre o valor satisfeito a título de terço constitucional de férias."* Julgado em 31/08/2020,
com **modulação**: vedada a cobrança retroativa sobre fatos anteriores a **15/09/2020**, e
sem devolução do que foi pago e não impugnado até esse marco. **Trânsito em julgado em
24/09/2025.**
**Fontes:** https://www.stf.jus.br/portal/jurisprudenciaRepercussao/verAndamentoProcesso.asp?incidente=5255826&numeroProcesso=1072485&classeProcesso=RE&numeroTema=985 ·
https://conjur.com.br/2026-fev-25/o-tema-no-985-do-stf-modulacao-dos-efeitos-e-contencioso-administrativo-2/ (acesso 30/08/2026).

**Regra de cálculo do INSS nas férias:** a remuneração de férias **integra o salário de
contribuição da competência do pagamento** e, portanto, **soma-se ao salário do mês** para
determinar a faixa progressiva (Lei 8.212/1991, art. 28, I). **Diferente do IRRF**, que é
calculado **em separado**. ⚠ Esta assimetria INSS-soma / IRRF-separa é o **erro nº 1** dos
motores de folha.

---

## 8. 13º salário (gratificação natalina)

| Item | Regra | Fundamento |
|---|---|---|
| Direito | 1/12 da remuneração de dezembro por **mês trabalhado**; fração **≥ 15 dias** = 1 mês (avo) | Lei 4.090/1962, art. 1º, §§1º e 2º |
| **1ª parcela** | 50% da remuneração do mês anterior; paga entre **1º de fevereiro e 30 de novembro** | Lei 4.749/1965, art. 2º |
| 1ª parcela nas férias | se o empregado requerer **em janeiro**, a 1ª parcela sai junto com as férias | Lei 4.749/1965, art. 2º, §2º |
| **2ª parcela** | até **20 de dezembro** | Lei 4.749/1965, art. 1º |
| Base | remuneração de **dezembro**, incluindo médias de variáveis (HE, comissões, adicionais) | Lei 4.090/1962, art. 1º; Súmula 45 e 347 do TST |

**FÓRMULAS:**
```
avos            = nº de meses com ≥ 15 dias trabalhados no ano civil (máx. 12)
13º_bruto       = (remuneração_base_13º ÷ 12) × avos
1ª_parcela      = 13º_bruto_estimado × 50%           -- sem INSS e sem IRRF
2ª_parcela      = 13º_bruto − 1ª_parcela − INSS_13º − IRRF_13º − outros descontos
```

**Incidências:**

| Tributo | Incide? | Como |
|---|---|---|
| **INSS** | SIM | **base própria e separada** do salário do mês; retido **integralmente na quitação** (2ª parcela) ou na rescisão. Teto próprio de R$ 8.475,55. |
| **IRRF** | SIM | **exclusivo na fonte**, separado, na quitação; tabela do mês da quitação; **com o redutor da Lei 15.270/2025** |
| **FGTS** | SIM | 8% sobre **cada parcela**, no mês do pagamento de cada uma |

**Fundamento das bases separadas:** Lei 8.212/1991, art. 28, §7º; Decreto 3.048/1999, art. 214,
§6º; IN RFB 1.500/2014, art. 13. **Súmula 688 do STF** (incidência do INSS sobre o 13º).
**Fontes:** https://www.normaslegais.com.br/trab/7trabalhista200110.htm ·
https://www.guiatrabalhista.com.br/guia/13_inss.htm (acesso 30/08/2026).

**Faltas:** faltas **injustificadas** podem reduzir avos — o mês só conta se houver **15 dias
ou mais** de trabalho efetivo.

**Afastamentos:** período de auxílio por incapacidade **não** gera avos a cargo do empregador
(a partir do 16º dia é do INSS); os primeiros 15 dias contam.

---

## 9. Rescisão do contrato de trabalho

### 9.1 Verbas devidas por tipo de desligamento

| Verba | Sem justa causa (empregador) | Pedido de demissão | Justa causa (empregado) | **Comum acordo** (art. 484-A) | Término de contrato a prazo | Morte do empregado | Culpa recíproca | Rescisão indireta (art. 483) |
|---|---|---|---|---|---|---|---|---|
| Saldo de salário | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Aviso prévio | ✔ integral (indenizado ou trabalhado) | devido **pelo** empregado (30 dias; descontável) | ✖ | ✔ **50%** se indenizado (integral se trabalhado) | ✖ (salvo art. 481) | ✖ | ✔ **50%** | ✔ integral |
| 13º proporcional | ✔ | ✔ | ✖ | ✔ | ✔ | ✔ | ✔ **50%** | ✔ |
| Férias vencidas + 1/3 | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Férias proporcionais + 1/3 | ✔ | ✔ (Súmula 261 TST) | ✖ (Súmula 171 TST) | ✔ | ✔ | ✔ | ✔ **50%** | ✔ |
| **Multa FGTS** | ✔ **40%** | ✖ | ✖ | ✔ **20%** | ✖ (salvo art. 481) | ✖ | ✔ **20%** | ✔ **40%** |
| **Saque do FGTS** | ✔ **100%** | ✖ | ✖ | ✔ **80%** | ✔ (fim de contrato) | ✔ (dependentes) | ✔ 100% | ✔ 100% |
| Seguro-desemprego | ✔ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ |

**Fundamentos:** CLT, arts. 477, 479, 481, 482, 483, 484, 484-A, 487; Lei 8.036/1990,
art. 18, §§1º e 2º, e art. 20; Súmulas 171, 261 e 14 do TST; Lei 6.858/1980 (pagamento a
dependentes em caso de morte); Lei 7.998/1990 (seguro-desemprego).

**Notas críticas:**
- **Culpa recíproca (art. 484):** a redução a 50% do aviso, 13º e férias proporcionais decorre
  da **Súmula 14 do TST**; a multa de FGTS cai a **20%** por força do art. 18, §2º, da Lei 8.036/1990.
- **Contrato a prazo rescindido antecipadamente:** indenização de **metade** do que faltava
  (CLT, art. 479) ou, havendo **cláusula assecuratória** recíproca, aplicam-se as regras da
  rescisão sem justa causa (CLT, art. 481).
- **Morte do empregado:** não há aviso prévio nem multa de 40%; FGTS é sacado pelos
  dependentes habilitados na Previdência (Lei 6.858/1980).

### 9.2 Aviso prévio

**Aviso prévio proporcional — FÓRMULA (Lei 12.506/2011):**
```
dias_aviso = 30 + (3 × anos_completos_de_serviço)
dias_aviso = MIN(dias_aviso ; 90)
```
Ou seja: 30 dias até 1 ano; +3 dias por ano completo; teto de **90 dias** (= 20 anos de casa).

| Modalidade | Efeitos |
|---|---|
| **Trabalhado** | contrato ativo; redução de **2h/dia** ou **7 dias corridos** no fim (CLT, art. 488); incide INSS, IRRF e FGTS; **conta como tempo de serviço** |
| **Indenizado** | pago sem trabalho; **projeta** o contrato para todos os efeitos (CLT, art. 487, §1º) — soma avos de 13º e férias e antecipa a data-base; **FGTS incide** (Súmula 305 do TST); **INSS NÃO incide** sobre o aviso prévio indenizado; **IRRF NÃO incide** |
| **Pedido de demissão sem cumprir** | empregador pode **descontar** 30 dias (CLT, art. 487, §2º) — **apenas 30 dias**, sem proporcionalidade, pois o acréscimo é benefício exclusivo do empregado |

⚠ **PENDÊNCIA — não confirmado (MÉDIA criticidade):** a **não incidência de INSS sobre o
aviso prévio indenizado** decorre do art. 28, §9º, "e", item 5, da Lei 8.212/1991 — o
dispositivo foi **revogado pelo Decreto 6.727/2009** e é objeto de litígio (STJ REsp
1.230.957, Tema 478, decidiu pela **não incidência**). **Confirmar o entendimento atual da
RFB (IN RFB 2.110/2022) antes de codificar** — hoje a prática de mercado e a jurisprudência
do STJ são pela não incidência. Marcar o resultado como PROVISÓRIO até a checagem.

### 9.3 Prazo de pagamento e multa

| Item | Regra | Fundamento |
|---|---|---|
| Prazo de pagamento das verbas rescisórias | **10 dias corridos** contados do **término do contrato**, para **todas** as modalidades (trabalhado ou indenizado) | CLT, art. 477, §6º (Lei 13.467/2017) |
| Multa por atraso | **1 salário nominal** do empregado, em favor do empregado | CLT, art. 477, §8º |
| Anotação na CTPS e entrega de documentos | mesmo prazo de 10 dias | CLT, art. 477, §§4º e 6º |
| Homologação sindical | **não é mais obrigatória** desde a Lei 13.467/2017 (revogado o §1º do art. 477) | Lei 13.467/2017 |
| Multa do art. 467 (verbas incontroversas em juízo) | **50%** | CLT, art. 467 |

**Fontes:** https://www.jusbrasil.com.br/artigos/demissao-sem-justa-causa-em-2026-verbas-rescisorias-aviso-previo-proporcional-seguro-desemprego-e-multa-por-atraso/6324030122 ·
https://juslaboris.tst.jus.br/handle/20.500.12178/213958 (acesso 30/08/2026).

### 9.4 Multa do FGTS

```
base_multa = saldo de TODOS os depósitos do contrato na conta vinculada,
             + depósitos da rescisão,
             + atualização monetária e juros,
             MESMO que o trabalhador já tenha sacado (saque-aniversário incluído)
multa_40 = base_multa × 40%      -- sem justa causa e rescisão indireta
multa_20 = base_multa × 20%      -- comum acordo (484-A) e culpa recíproca
```
**Fundamento:** Lei 8.036/1990, art. 18, §§1º e 2º.
⚠ **Erro comum:** calcular a multa apenas sobre o que está na conta. A base é o **somatório
histórico dos depósitos**, o que torna o **extrato analítico do FGTS Digital insumo
obrigatório** do cálculo — o motor **não pode estimar** essa base.

---

## 10. Descontos na folha

| Desconto | Limite / regra | Fundamento |
|---|---|---|
| **Vale-transporte** | **até 6% do salário BÁSICO**, limitado ao **custo real** do transporte. Desconta-se o **MENOR** entre 6% do básico e o custo. Base = salário contratual fixo, **sem** HE, comissões, adicionais e prêmios | Lei 7.418/1985, art. 4º, parágrafo único; Decreto 10.854/2021 |
| **Vale-refeição / alimentação (PAT)** | desconto do empregado limitado ao previsto no programa/CCT (usualmente até 20%); benefício tem **natureza não salarial** e **não integra** base de INSS/FGTS/IRRF quando concedido nos termos legais | CLT, art. 457, §2º; Lei 6.321/1976; **Lei 14.442/2022**; Decreto 11.678/2023 |
| **Plano de saúde (coparticipação)** | admitido com **autorização escrita** do empregado; **não** deduz do IRRF na fonte (só na DAA) | CLT, art. 462, *caput*; Súmula 342 do TST |
| **Adiantamento salarial** | livre, mediante autorização; compõe o limite global | CLT, art. 462 |
| **Pensão alimentícia** | **valor/percentual determinado na decisão judicial**; a base é a que o **título judicial** definir | CLT, art. 462, §1º (desconto por lei); Lei 5.478/1968 |
| **Contribuição sindical** | **FACULTATIVA** — exige **autorização prévia e expressa** do empregado | CLT, arts. 578 e 579 (Lei 13.467/2017); STF, ADI 5.794 |
| **Contribuição assistencial** | pode ser cobrada de **toda a categoria**, inclusive não sindicalizados, **desde que garantido o direito de oposição** | STF, **Tema 935** (ARE 1.018.459) |
| **Empréstimo consignado (Crédito do Trabalhador)** | margem de **35%** (30% empréstimo + 5% cartão consignado), calculada sobre a **remuneração disponível** (após descontos obrigatórios) | Lei 10.820/2003 e alterações |
| **Danos causados pelo empregado** | só com **dolo**, ou com **culpa** se houver **previsão contratual** | CLT, art. 462, §1º |

### 10.1 Limite legal de descontos

**Não existe no Brasil um teto único e geral** de desconto em folha. O que existe:
- **CLT, art. 462:** veda desconto salvo adiantamento, dispositivo de lei, contrato coletivo
  ou dano com dolo/culpa contratada.
- **Consignado:** **35%** da remuneração disponível (Lei 10.820/2003).
- **Doutrina/jurisprudência:** aplica-se por analogia o limite de **70%** do salário
  (garantia de 30% intangível), por analogia ao art. 82, parágrafo único, da CLT e ao
  princípio da intangibilidade salarial.

⚠ **PENDÊNCIA — não confirmado (MÉDIA criticidade):** o **limite global de 70%/30%** é
**construção doutrinária e jurisprudencial**, não norma expressa de aplicação geral.
O motor deve: (a) aplicar o teto de 35% do consignado como regra dura; (b) **alertar** —
sem bloquear — quando o total de descontos ultrapassar 70% do bruto; (c) **nunca** zerar
um desconto por conta própria. Confirmar se a CCT do cliente fixa teto próprio.

### 10.2 O que mudou com o PAT (Lei 14.442/2022 + Decreto 11.678/2023)

- **Uso exclusivo para alimentação** — proibido o uso do VR/VA para outra finalidade e a
  transferência do saldo para outras contas.
- **Fim do "rebate"/deságio**: proibido que a empresa receba desconto ou vantagem financeira
  da operadora do benefício.
- **Portabilidade** garantida: o trabalhador escolhe o emissor/cartão (Decreto 11.678/2023).
- **Interoperabilidade**: a partir de **novembro/2026**, qualquer cartão de VR deve funcionar
  em qualquer maquininha, independentemente de bandeira ou operadora.
- **Natureza não salarial**: reafirmada — não integra INSS, FGTS nem IRRF quando pago nos
  termos do art. 457, §2º, da CLT.
- Entendimento do MTE em 2026: as regras valem **inclusive para empresas não inscritas no PAT**.

**Fontes (acesso 30/08/2026):**
- https://www.gov.br/trabalho-e-emprego/pt-br/noticias-e-conteudo/2026/marco/governo-do-brasil-reforca-aplicacao-das-regras-do-auxilio-alimentacao-e-refeicao-para-todas-as-empresas
- https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/decreto/d11678.htm
- https://blog.caju.com.br/leis-trabalhistas/portabilidade-vale-refeicao/

### 10.3 Contribuição sindical — estado atual (confirmado)

1. A **Lei 13.467/2017** tornou a contribuição sindical **facultativa** (arts. 578, 579, 582,
   583 e 602 da CLT). O **STF confirmou a constitucionalidade** na **ADI 5.794** (2018).
2. **Não é possível** cobrar por decisão de assembleia sem autorização individual e expressa.
3. **Contribuição assistencial** é diferente: o **STF, no Tema 935 (ARE 1.018.459)**, fixou:
   *"É constitucional a instituição, por acordo ou convenção coletivos, de contribuições
   assistenciais a serem impostas a todos os empregados da categoria, ainda que não
   sindicalizados, desde que assegurado o direito de oposição."*
4. Em **24/12/2025**, o STF vedou a **cobrança retroativa** de não sindicalizados, proibiu
   interferência de terceiros no direito de oposição e exigiu que os valores sejam
   **razoáveis** e compatíveis com a capacidade econômica da categoria.

**Regra do motor:** desconto de contribuição sindical exige flag `autorizacao_expressa = true`
com data. Contribuição assistencial exige `cct_id` + `prazo_oposicao` cadastrados.
Sem isso, **não descontar**.

**Fontes:** https://www.migalhas.com.br/depeso/402997/a-nova-contribuicao-assistencial-e-o-tema-935-do-stf ·
https://www.barbieriadvogados.com/contribuicao-assistencial-sindical-2026/ (acesso 30/08/2026).

### 10.4 Pensão alimentícia — ordem de cálculo e base

**Não existe base única legal** — a base é a que **o título judicial determinar**. As três
mais comuns:

| Base determinada na sentença | Fórmula |
|---|---|
| "% sobre o **salário líquido**" | `pensão = (bruto − INSS − IRRF − descontos legais) × %` |
| "% sobre o **salário bruto**" | `pensão = bruto × %` |
| "% sobre o **salário mínimo**" | `pensão = 1.621,00 × %` (valor fixo) |

**Ordem canônica quando a base é o líquido (evita referência circular):**
```
1. Apurar proventos brutos
2. INSS
3. IRRF  → e aqui está a circularidade: a pensão DEDUZ do IRRF (Lei 9.250/1995, art. 4º, II),
           mas o IRRF entra na base da pensão quando a sentença diz "líquido".
   SOLUÇÃO PADRÃO DE MERCADO: calcular o IRRF **já deduzindo a pensão**, apurando a pensão
   sobre (bruto − INSS − demais descontos legais), SEM incluir o IRRF na conta de "líquido".
4. Deduzir a pensão da base do IRRF
5. Descontar a pensão do líquido
```

⚠ **PENDÊNCIA — não confirmado (ALTA criticidade):** a definição de "salário líquido" para
fins de pensão **varia por decisão judicial e por TRT**. O motor **não pode escolher sozinho**.
Campo obrigatório por empregado: `pensao_base` (`bruto` | `liquido_sem_irrf` |
`liquido_com_irrf` | `salario_minimo` | `valor_fixo`) + `pensao_percentual` +
`processo_numero`. Sem esses campos, o desconto **não é calculado** e abre pendência.

**IRRF:** a pensão **judicial** deduz integralmente da base (Lei 9.250/1995, art. 4º, II) —
a pensão **por acordo informal** NÃO deduz.

---

## 11. Salário-família e salário-maternidade

### 11.1 Salário-família 2026

| Parâmetro | Valor 2026 |
|---|---|
| Valor da **cota por filho** (até 14 anos incompletos, ou inválido de qualquer idade) | **R$ 67,54** |
| **Limite** de remuneração mensal para ter direito | **R$ 1.980,38** |

```
salário_família = 67,54 × nº_de_dependentes_habilitados
                  SE remuneração_mensal ≤ 1.980,38 ; senão 0
```

- **Fundamento legal:** CF/88, art. 7º, XII; Lei 8.213/1991, arts. 65 a 70;
  **Portaria Interministerial MPS/MF nº 13/2026** (valores).
- **Não integra** base de INSS, IRRF nem FGTS (Lei 8.212/1991, art. 28, §9º, "j") — é
  **provento** no holerite, mas **fora de todas as bases**.
- Pago **pelo empregador** e **compensado** nas contribuições previdenciárias devidas.
- Exige **certidão de nascimento** e, anualmente, **caderneta de vacinação** (até 6 anos) e
  **comprovante de frequência escolar** (a partir de 7 anos) — Lei 8.213/1991, art. 67.
- Em caso de **múltiplos vínculos**, o limite de renda considera a **soma** das remunerações.

**Fonte:** https://www.gov.br/previdencia/pt-br/assuntos/rpps/destaques/publicada-a-portaria-interministerial-mps-mf-no-13-de-9-01-2026-que-dispoe-sobre-o-reajuste-dos-beneficios-pagos-pelo-inss-e-demais-valores
(acesso 30/08/2026).

### 11.2 Salário-maternidade

| Item | Regra | Fundamento |
|---|---|---|
| Duração | **120 dias** | CF/88, art. 7º, XVIII; CLT, art. 392; Lei 8.213/1991, art. 71 |
| Prorrogação (Empresa Cidadã) | **+60 dias** (mãe) e **+15 dias** (pai), com incentivo fiscal para empresas do **Lucro Real** | Lei 11.770/2008; Lei 13.257/2016 |
| Valor | **remuneração integral** da segurada empregada | Lei 8.213/1991, art. 72, *caput* |
| **Quem paga** | a **EMPRESA** paga à empregada e **compensa** com as contribuições previdenciárias devidas sobre a folha | Lei 8.213/1991, art. 72, §1º |
| Pago direto pelo INSS | **empregada doméstica**, avulsa, contribuinte individual, facultativa, segurada especial, e **desempregada** no período de graça; **MEI** | Lei 8.213/1991, art. 73 |
| Adoção | mesmo direito | Lei 8.213/1991, art. 71-A |
| Incidências | **INSS SIM** (é salário de contribuição), **IRRF SIM**, **FGTS SIM** (art. 15, §5º, Lei 8.036/1990) | — |
| Licença-paternidade | **5 dias** (+15 no Empresa Cidadã) | ADCT, art. 10, §1º; Lei 11.770/2008 |

**FÓRMULA DA COMPENSAÇÃO:**
```
valor_a_recolher_de_CPP = CPP_apurada − salário_maternidade_pago
(se negativo → saldo credor, compensável nas competências seguintes via DCTFWeb)
```

**Fonte:** https://www.leinamao.com.br/leis/lei-de-beneficios-da-previdencia-social/art-72 ·
https://nossodireito.com/salario-maternidade/empresa-paga-ou-inss (acesso 30/08/2026).

⚠ **PENDÊNCIA — não confirmado:** se houve, em 2025/2026, **nova lei de licença-paternidade**
(o STF havia dado prazo ao Congresso para regulamentar o art. 7º, XIX, da CF). **Verificar
no Planalto/DOU** antes de fixar os 5 dias no motor.

---

## 12. Afastamentos

| Situação | Quem paga | Regra | Fundamento |
|---|---|---|---|
| **Doença — primeiros 15 dias** | **EMPREGADOR** (salário integral) | conta como tempo de serviço; **INSS, IRRF e FGTS incidem** | Lei 8.213/1991, art. 60, §3º |
| **Doença — a partir do 16º dia** | **INSS** (auxílio por incapacidade temporária) | contrato **suspenso**; **sem** salário, **sem** FGTS, **sem** INSS patronal | Lei 8.213/1991, art. 60; CLT, art. 476 |
| **Acidente de trabalho / doença ocupacional** | 15 dias empregador; depois INSS (**auxílio-acidente/incapacidade acidentária, B-91**) | **FGTS CONTINUA sendo devido durante todo o afastamento** | Lei 8.036/1990, art. 15, §5º |
| **Licença-maternidade** | empresa paga e compensa | **FGTS devido** durante todo o período | Lei 8.036/1990, art. 15, §5º |
| **Serviço militar** | — | contrato suspenso, mas **FGTS devido** | Lei 8.036/1990, art. 15, §5º |
| Novo afastamento pela **mesma doença** em até **60 dias** | INSS desde o 1º dia | não reinicia a contagem dos 15 dias | Decreto 3.048/1999, art. 75, §3º |

**Emissão de CAT** obrigatória em acidente de trabalho, até o **1º dia útil** seguinte
(ou **imediatamente** em caso de óbito) — Lei 8.213/1991, art. 22.

### 12.1 Estabilidades

| Estabilidade | Prazo | Fundamento |
|---|---|---|
| **Acidentária** | **12 meses** após a cessação do auxílio-doença acidentário | Lei 8.213/1991, art. 118; Súmula 378 do TST |
| **Gestante** | da **confirmação da gravidez** até **5 meses após o parto** | ADCT, art. 10, II, "b"; Súmula 244 do TST |
| **Cipeiro (titular eleito)** | do registro da candidatura até **1 ano** após o fim do mandato | ADCT, art. 10, II, "a" |
| **Dirigente sindical** | do registro da candidatura até **1 ano** após o fim do mandato | CLT, art. 543, §3º |
| **Membro da CCP / Conselho Curador FGTS / CNPS** | conforme lei específica | Lei 8.036/1990, art. 3º, §9º; CLT, art. 625-B, §1º |

**Regra do motor:** rescisão de empregado com estabilidade ativa deve **bloquear** e abrir
tarefa no Kanban, não apenas alertar.

---

## 13. Categorias especiais

| Categoria | INSS empregado | CPP patronal | RAT | Terceiros | FGTS | IRRF | 13º / férias | Observações |
|---|---|---|---|---|---|---|---|---|
| **Empregado CLT** | progressivo 7,5–14% | 20% | 1–3% × FAP | 5,8% (regra geral) | 8% | tabela | sim / sim | — |
| **Aprendiz** (Lei 10.097/2000) | progressivo | 20% | sim | sim | **2%** | tabela | sim / sim | Cota **5% a 15%** dos empregados cujas funções demandem formação profissional (CLT, art. 429). Contrato máx. **2 anos**; salário-hora mínimo. FGTS 8% na multa? → ver pendência |
| **Estagiário** (Lei 11.788/2008) | **NÃO** (salvo se optar como facultativo) | **NÃO** | não | não | **NÃO** | **SIM** — bolsa é rendimento do trabalho | **NÃO** (tem **recesso** de 30 dias remunerado a cada 12 meses) | **Não há vínculo empregatício** (art. 3º). Obrigatórios: termo de compromisso, plano de atividades, **seguro contra acidentes pessoais** (art. 9º, IV) e supervisor. Jornada máx. 6h/dia e 30h/sem (art. 10) |
| **Doméstico** (LC 150/2015) | progressivo 7,5–14% | **8%** | **0,8%** | não | **8% + 3,2%** | tabela | sim / sim | **Simples Doméstico** — guia **DAE** única, vencimento **dia 7** do mês seguinte (art. 35). Os 3,2% são antecipação da multa rescisória |
| **Rural** (Lei 5.889/1973) | progressivo | ver pendência | ver pendência | **SENAR** | 8% | tabela | sim / sim | Adicional noturno **25%**; horário noturno diferenciado |
| **Diretor não empregado** | **11%** (CI), limitado ao teto | **20%**, sem teto | **não incide** sobre CI | **não incide** sobre CI | **facultativo** (art. 16, Lei 8.036/1990) | tabela | não (salvo previsão estatutária) | Pró-labore |
| **MEI empregador** | progressivo (do empregado) | **3%** | — | não | **8%** | tabela | sim / sim | **1 único empregado** recebendo 1 SM ou o piso da categoria (LC 123/2006, art. 18-C) |
| **Simples Nacional — Anexos I, II, III, V** | progressivo | **no DAS** | não | não | 8% | tabela | sim / sim | CPP embutida na alíquota do DAS |
| **Simples Nacional — Anexo IV** | progressivo | **20% fora do DAS** | sim | não | 8% | tabela | sim / sim | Recolhe DARF de folha via DCTFWeb |

**Fontes (acesso 30/08/2026):**
- https://www.guiatrabalhista.com.br/trabalhista/simples-domestico.htm
- https://www.gov.br/esocial/pt-br/empregador-domestico/perguntas-frequentes
- https://cieesc.org.br/blog/diferenca-entre-estagio-e-jovem-aprendiz/
- https://www.fecomercio.com.br/noticia/empresa-que-concede-a-vaga-de-estagio-e-responsavel-por-reter-na-fonte-o-imposto-de-renda (IRRF sobre bolsa — **Solução de Consulta COSIT nº 186/2019**)
- https://blog.esimplesauditoria.com.br/anexo-4-do-simples-nacional/

⚠ **PENDÊNCIAS desta seção:**
1. **Multa rescisória do FGTS do aprendiz** — se é 40% sobre depósitos de 2% ou regra própria.
   Consultar Lei 8.036/1990, art. 18, e Manual FGTS Digital v1.50.
2. **Encargos do empregador rural** (pessoa física sub-rogado e PJ agroindústria): alíquotas
   sobre receita bruta da comercialização (Lei 8.212/1991, arts. 22-A e 25; Lei 13.606/2018).
   **Não confirmadas nesta sessão — não codificar.**
3. **MEI empregador**: confirmar se o limite de **1 empregado** continua vigente em 2026
   (houve projetos para ampliar). Consultar LC 123/2006, art. 18-C, texto atualizado.
4. **Cota de aprendizes**: base de cálculo da cota e funções excluídas — Decreto 9.579/2018,
   arts. 51 a 57, e **Decreto 11.061/2022**.

---

## 14. ORDEM CANÔNICA DE APURAÇÃO E ARREDONDAMENTO

Esta é a seção que evita a divergência de centavos. **O motor deve executar exatamente nesta
ordem**, e a memória de cálculo deve exibir cada etapa.

### 14.1 Ordem canônica — folha mensal

```
ETAPA 1 — PROVENTOS (montar a remuneração do mês)
  1.1  Salário base do mês (proporcional a dias trabalhados, se admissão/demissão/afastamento)
  1.2  Adicionais FIXOS, na ordem: insalubridade OU periculosidade → adicional de transferência
       (insalubridade/periculosidade entram ANTES porque compõem a base da hora extra)
  1.3  Recalcular o valor-hora incluindo 1.2  → "salário-hora integrado" (Súmula 264 TST)
  1.4  Horas extras (sobre o valor-hora integrado)
  1.5  Adicional noturno (com hora reduzida de 52'30")
  1.6  Comissões, prêmios e gratificações habituais
  1.7  DSR sobre as VARIÁVEIS de 1.4 a 1.6
  1.8  Férias / 13º / rescisão, quando houver na competência
  1.9  Salário-família (PROVENTO, mas FORA de todas as bases)

ETAPA 2 — BASES
  2.1  BASE_INSS   = 1.1 a 1.8, excluídas as verbas do art. 28, §9º, da Lei 8.212/91
                     (exclui salário-família, VT, VR/VA-PAT, ajuda de custo, PLR,
                      férias indenizadas, abono pecuniário, aviso prévio indenizado*)
  2.2  BASE_FGTS   = 1.1 a 1.8, excluídas as verbas do art. 15, §6º, da Lei 8.036/90
                     (INCLUI o aviso prévio indenizado — Súmula 305 TST)
  2.3  BASE_IRRF   = rendimentos tributáveis (exclui salário-família, VT, VR/VA, PLR
                     — que tem tabela própria —, e as verbas indenizatórias)

ETAPA 3 — INSS
  3.1  Aplicar a progressiva sobre MIN(BASE_INSS ; 8.475,55)
  3.2  13º tem base SEPARADA e teto PRÓPRIO
  3.3  Férias SOMAM ao salário do mês na mesma competência

ETAPA 4 — IRRF
  4.1  Base A (legal) = BASE_IRRF − INSS − dependentes − pensão − previdência privada
  4.2  Base B (simplificada) = BASE_IRRF − 607,20
  4.3  imposto = MÍNIMO( f(Base A) ; f(Base B) ) usando a tabela mensal
  4.4  aplicar o REDUTOR da Lei 15.270/2025
  4.5  13º: cálculo exclusivo e SEPARADO. Férias: cálculo SEPARADO.

ETAPA 5 — DESCONTOS (nesta ordem, porque o consignado depende do resultado)
  5.1  INSS
  5.2  IRRF
  5.3  Pensão alimentícia
  5.4  Vale-transporte (MIN(6% do salário BÁSICO ; custo real))
  5.5  Coparticipações: VR/VA, plano de saúde, farmácia
  5.6  Adiantamentos
  5.7  Contribuição sindical/assistencial (só com autorização/oposição válidas)
  5.8  Consignado — margem de 35% sobre a REMUNERAÇÃO DISPONÍVEL (após 5.1 e 5.2)
  5.9  Faltas, atrasos e DSR perdido

ETAPA 6 — LÍQUIDO
  líquido = Σ proventos − Σ descontos

ETAPA 7 — ENCARGOS DO EMPREGADOR (não afetam o líquido)
  7.1  CPP (20%, ou 10% em 2026 se CPRB, ou no DAS se Simples I/II/III/V)
  7.2  RAT ajustado = RAT × FAP
  7.3  Terceiros (FPAS)
  7.4  FGTS 8% (2% aprendiz)
  7.5  Compensações: salário-família e salário-maternidade
```
\* aviso prévio indenizado — ver pendência da seção 9.2.

### 14.2 Regras de arredondamento

| Regra | Definição adotada |
|---|---|
| Casas decimais dos **valores monetários** | **2**, arredondamento **aritmético (half-up)**: 0,005 → 0,01 |
| Casas decimais dos **cálculos intermediários** | **mínimo 4**, sem arredondar antes do resultado final de cada verba |
| Quando arredondar | **uma única vez, no fim de cada verba** — nunca a cada parcela de faixa |
| Percentuais | armazenar como decimal com **6 casas** (ex.: FAP 0,733400; RAT ajustado 0,014668) |
| Horas | armazenar em **centésimos** ou em minutos inteiros; converter para decimal apenas no cálculo |
| Dias | inteiros; proporcionalidade de salário sempre **/30**, não pelo nº real de dias do mês (CLT, art. 64 — mensalista) |

⚠ **PENDÊNCIA — não confirmado (MÉDIA criticidade):** **não há norma federal única** que
fixe o critério de arredondamento da folha. O que existe é a **validação do eSocial**, que
aceita valores com **2 casas decimais** e faz **batimentos de totalizadores** (S-5001/S-5002/
S-5003/S-5011). Antes do go-live: rodar a folha completa no ambiente de **produção restrita
do eSocial** e ajustar o critério até os totalizadores S-5001 e S-5011 fecharem sem
diferença. **Documentar o critério escolhido no contrato com o cliente.**

### 14.3 Matriz de incidências (referência rápida do motor)

| Verba | INSS | IRRF | FGTS |
|---|---|---|---|
| Salário base | S | S | S |
| Horas extras + adicional | S | S | S |
| Adicional noturno | S | S | S |
| Insalubridade / Periculosidade | S | S | S |
| DSR sobre variáveis | S | S | S |
| Comissões | S | S | S |
| Gratificações e prêmios **habituais** | S | S | S |
| Prêmios do art. 457, §4º (liberalidade, por desempenho) | N | S | N |
| 13º salário | S (base separada) | S (exclusivo, separado) | S |
| Férias gozadas + 1/3 | S | S | S |
| Férias indenizadas + 1/3 | N | N | N |
| Abono pecuniário + 1/3 | N | N | N |
| Aviso prévio **trabalhado** | S | S | S |
| Aviso prévio **indenizado** | N* | N | **S** |
| Salário-família | N | N | N |
| Salário-maternidade | S | S | S |
| 15 primeiros dias de afastamento | S | S | S |
| Vale-transporte (o benefício) | N | N | N |
| VR/VA nos termos do PAT / art. 457, §2º | N | N | N |
| Ajuda de custo e diárias (art. 457, §2º) | N | N | N |
| PLR (Lei 10.101/2000) | N | **tabela própria anual** | N |
| Multa do FGTS (40%/20%) | N | N | N |
| Multa do art. 477, §8º | N | N | N |

\* ver pendência da seção 9.2.

---

## 15. MASSA DE TESTE — 3 holerites completos (2026)

> Premissas comuns: competência **08/2026**; empresa do **regime normal**, **comércio**,
> **RAT 2%**, **FAP 1,0000**, **Terceiros 5,8%**; mês com 22 dias úteis; sem horas extras.
> Estes três casos são os **testes-âncora** do motor: qualquer refatoração tem de reproduzi-los
> ao centavo.

### CASO A — Salário baixo (R$ 1.800,00), 1 dependente, 1 filho de 6 anos, opta por VT

| | Descrição | Referência | Provento | Desconto |
|---|---|---|---|---|
| 001 | Salário base | 30 dias | 1.800,00 | |
| 002 | Salário-família | 1 cota | 67,54 | |
| 501 | INSS | — | | **137,69** |
| 502 | IRRF | — | | **0,00** |
| 503 | Vale-transporte | 6% | | **108,00** |
| | **TOTAIS** | | **1.867,54** | **245,69** |
| | **LÍQUIDO** | | | **R$ 1.621,85** |

**Memória de cálculo:**
- **INSS:** faixa 1 → `1.621,00 × 7,5% = 121,5750`; faixa 2 → `(1.800,00 − 1.621,00) × 9%
  = 179,00 × 9% = 16,1100`. Total `137,6850 → 137,69`.
  Conferência curta: `1.800,00 × 9% − 24,3150 = 162,00 − 24,3150 = 137,685` ✔
- **Salário-família:** remuneração 1.800,00 ≤ 1.980,38 → tem direito. `1 × 67,54 = 67,54`.
  **Fora de todas as bases.**
- **IRRF:** Base A = `1.800,00 − 137,69 − 189,59 = 1.472,72` → isento.
  Base B = `1.800,00 − 607,20 = 1.192,80` → isento. **IRRF = 0,00** (redutor nem é acionado).
- **VT:** `MIN(1.800,00 × 6% ; custo real)` = `108,00` (assumindo custo real ≥ 108,00).
- **FGTS (não é desconto):** `1.800,00 × 8% = 144,00`.
- **Encargos patronais:** CPP `360,00` + RAT `36,00` + Terceiros `104,40` + FGTS `144,00`
  = **R$ 644,40**. Compensação de salário-família: `−67,54` → CPP líquida a recolher `292,46`.
- **Custo total do empregado:** `1.800,00 + 644,40 = R$ 2.444,40` (+ VT líquido de 108,00).

### CASO B — Salário médio (R$ 6.000,00), 2 dependentes, plano de saúde R$ 250,00

| | Descrição | Referência | Provento | Desconto |
|---|---|---|---|---|
| 001 | Salário base | 30 dias | 6.000,00 | |
| 501 | INSS | — | | **641,51** |
| 502 | IRRF | — | | **280,83** |
| 505 | Plano de saúde (coparticipação) | — | | **250,00** |
| | **TOTAIS** | | **6.000,00** | **1.172,34** |
| | **LÍQUIDO** | | | **R$ 4.827,66** |

**Memória de cálculo:**
- **INSS:** `6.000,00` está na faixa 4 → `6.000,00 × 14% − 198,4856 = 840,00 − 198,4856
  = 641,5144 → 641,51`.
  Conferência por fatias: `121,5750 + 115,3656 + 174,1716 + (6.000,00 − 4.354,27) × 14%
  = 121,5750 + 115,3656 + 174,1716 + 230,4022 = 641,5144` ✔
- **IRRF — Base A (legal):** `6.000,00 − 641,51 − (2 × 189,59) = 6.000,00 − 641,51 − 379,18
  = 4.979,31` → faixa 27,5% → `4.979,31 × 27,5% − 908,73 = 1.369,3103 − 908,73 = 460,58`.
- **IRRF — Base B (simplificada):** `6.000,00 − 607,20 = 5.392,80` → `5.392,80 × 27,5%
  − 908,73 = 1.483,02 − 908,73 = 574,29`. **Base A é melhor.** Imposto apurado = **460,58**.
- **REDUTOR (Lei 15.270/2025):** RBM = 6.000,00, dentro da faixa 5.000,01–7.350,00 →
  `978,62 − (0,133145 × 6.000,00) = 978,62 − 798,87 = 179,75`.
- **IRRF devido:** `460,58 − 179,75 = 280,83`.
  ⚠ Sem o redutor o sistema descontaria 460,58 — **erro de R$ 179,75 por empregado por mês**.
- **Plano de saúde:** desconta do líquido, **não** deduz da base do IRRF na fonte.
- **FGTS:** `6.000,00 × 8% = 480,00`.
- **Encargos patronais:** CPP `1.200,00` + RAT `120,00` + Terceiros `348,00` + FGTS `480,00`
  = **R$ 2.148,00** (35,80% da folha + FGTS).
- **Custo total do empregado:** `6.000,00 + 2.148,00 = R$ 8.148,00`.

### CASO C — Acima do teto (R$ 15.000,00), 1 dependente, pensão R$ 1.500,00, PGBL R$ 600,00

| | Descrição | Referência | Provento | Desconto |
|---|---|---|---|---|
| 001 | Salário base | 30 dias | 15.000,00 | |
| 501 | INSS (teto) | — | | **988,09** |
| 502 | IRRF | — | | **2.314,91** |
| 506 | Pensão alimentícia judicial | — | | **1.500,00** |
| 507 | Previdência privada (PGBL) | — | | **600,00** |
| | **TOTAIS** | | **15.000,00** | **5.403,00** |
| | **LÍQUIDO** | | | **R$ 9.597,00** |

**Memória de cálculo:**
- **INSS:** base > teto → `SC = 8.475,55` → `8.475,55 × 14% − 198,4856 = 1.186,577 − 198,4856
  = 988,0914 → 988,09` (**teto do desconto em 2026**).
- **IRRF — Base A (legal):** `15.000,00 − 988,09 − 189,59 − 1.500,00 − 600,00 = 11.722,32`
  → `11.722,32 × 27,5% − 908,73 = 3.223,638 − 908,73 = 2.314,908 → 2.314,91`.
- **IRRF — Base B (simplificada):** `15.000,00 − 607,20 = 14.392,80` → `14.392,80 × 27,5%
  − 908,73 = 3.958,02 − 908,73 = 3.049,29`. **Base A é muito melhor** (a simplificada
  **substitui** a pensão e a previdência privada). Imposto apurado = **2.314,91**.
- **REDUTOR:** RBM = 15.000,00 > 7.350,00 → **redutor = 0**.
- **FGTS:** `15.000,00 × 8% = 1.200,00` (**FGTS não tem teto** — erro clássico é aplicar o
  teto do INSS ao FGTS).
- **Encargos patronais:** CPP `3.000,00` (**sem teto**) + RAT `300,00` + Terceiros `870,00`
  + FGTS `1.200,00` = **R$ 5.370,00**.
- **Custo total do empregado:** `15.000,00 + 5.370,00 = R$ 20.370,00`.

### Testes-âncora adicionais (assertions unitárias)

| Teste | Entrada | Saída esperada |
|---|---|---|
| INSS no teto | SC ≥ 8.475,55 | 988,09 |
| INSS na fronteira f1/f2 | SC = 1.621,00 | 121,58 (`121,575` → half-up) |
| INSS na fronteira f2/f3 | SC = 2.902,84 | 236,94 (`121,5750+115,3656 = 236,9406`) |
| INSS na fronteira f3/f4 | SC = 4.354,27 | 411,11 (`236,9406+174,1716 = 411,1122`) |
| IRRF fronteira isenção | Base = 2.428,80 | 0,00 |
| IRRF fronteira 7,5/15 | Base = 2.826,65 | 29,84 |
| IRRF fronteira 15/22,5 | Base = 3.751,05 | 168,50 |
| IRRF fronteira 22,5/27,5 | Base = 4.664,68 | 374,06 |
| Redutor — teto da isenção | RBM = 5.000,00, sem dependentes, simplificada | IRRF = 0,00 (redutor 312,89 = imposto 312,89) |
| Redutor — fim da faixa | RBM = 7.350,00 | redutor ≈ 0,00 |
| Redutor — acima da faixa | RBM = 7.350,01 | redutor = 0,00 |
| Salário-família — fronteira | remuneração = 1.980,38 | 67,54 por cota |
| Salário-família — acima | remuneração = 1.980,39 | 0,00 |

---

## 16. PENDÊNCIAS

> Nenhum número deste documento pode entrar em produção enquanto o item correspondente
> estiver aberto. Cada linha vira **uma tarefa no Kanban G41**
> (`tarefas.g41.com.br/api/public/tasks`, com `X-Idempotency-Key`).

| # | Pendência | Criticidade | Norma a consultar | Efeito enquanto aberta |
|---|---|---|---|---|
| P01 | Ler o **texto oficial** do Decreto 12.797/2025, da Portaria Interministerial MPS/MF 13/2026 (Anexo II), da Lei 15.270/2025 e da IN RFB 2.299/2025 — o proxy bloqueou Planalto/DOU/gov.br nesta sessão | **ALTA** | Planalto + DOU | tabelas com `fonte_verificada = false` |
| P02 | **Definição de RBM** para o redutor do IRRF: bruto do mês ou tributável após INSS? Tratamento em férias pagas em separado e em múltiplas fontes pagadoras | **ALTA** | Lei 15.270/2025 + IN RFB 2.299/2025 | resultado **PROVISÓRIO** em toda folha com RBM entre 5.000,01 e 7.350,00 |
| P03 | **Base da pensão alimentícia** ("líquido" definido caso a caso pela sentença) | **ALTA** | título judicial de cada empregado | desconto não calculado sem `pensao_base` cadastrado |
| P04 | **Pisos regionais 2026** (PR, RJ, RS, SC, SP) e **pisos de CCT** de cada cliente | **ALTA** | leis estaduais + Mediador/MTE | `piso_regional`/`piso_cct` = `null`; motor usa só o SM e alerta |
| P05 | **Adicional de HE por CCT** (50% ou mais) e definição de "dia útil" para o DSR | **ALTA** | CCT/ACT do cliente | não assumir 50%; abrir pendência por cliente |
| P06 | **INSS sobre aviso prévio indenizado** — situação atual no entendimento da RFB (STJ Tema 478 é pela não incidência) | **MÉDIA-ALTA** | IN RFB 2.110/2022 + STJ REsp 1.230.957 | rescisão marcada PROVISÓRIA |
| P07 | **Rateio de Terceiros por FPAS** — fontes divergiram sobre 507 = indústria ou comércio (o total de 5,8% é o mesmo) | **MÉDIA** | IN RFB 2.110/2022, Anexos II e III + Tabela 4 do eSocial | apurar só o total; não detalhar por entidade na DCTFWeb |
| P08 | **Artigo da IN RFB 1.500/2014** que determina o cálculo do IRRF de férias em separado e o dispositivo que isenta o **abono pecuniário** | **MÉDIA** | IN RFB 1.500/2014, arts. 11 e 65; Lei 7.713/1988, art. 6º | implementar prática dominante, expor premissa na memória de cálculo |
| P09 | **Critério de arredondamento** validado contra os totalizadores S-5001/S-5011 do eSocial | **MÉDIA** | ambiente de produção restrita do eSocial | rodar folha-piloto antes do go-live |
| P10 | **Divisor do salário-hora** (220 fixo vs. art. 64 da CLT) — parametrizar por cliente | **MÉDIA** | CLT, art. 64 + CCT | escolha explícita no cadastro, sem default |
| P11 | **Limite global de descontos (70%/30%)** — construção doutrinária, não norma expressa | **MÉDIA** | CLT, art. 462; art. 82, par. único | alertar, nunca bloquear ou zerar |
| P12 | **Encargos do empregador rural** (sub-rogação PF e agroindústria PJ) | **MÉDIA** | Lei 8.212/1991, arts. 22-A e 25; Lei 13.606/2018 | não codificar |
| P13 | **Lista dos setores da CPRB e a alíquota de cada um** (1% a 4,5%) | **MÉDIA** | Lei 12.546/2011, arts. 7º e 8º | cadastrar por CNAE com fonte; sem hard-code |
| P14 | **MEI empregador**: limite de 1 empregado continua vigente em 2026? | **BAIXA-MÉDIA** | LC 123/2006, art. 18-C, texto atualizado | bloquear 2º empregado com alerta |
| P15 | **Multa rescisória do FGTS do aprendiz** (40% sobre depósitos de 2%?) | **BAIXA-MÉDIA** | Lei 8.036/1990, art. 18; Manual FGTS Digital v1.50 | rescisão de aprendiz marcada PROVISÓRIA |
| P16 | **Nova lei de licença-paternidade** em 2025/2026? | **BAIXA-MÉDIA** | Planalto/DOU; ADCT art. 10, §1º | manter 5 dias, com alerta de verificação |
| P17 | **Cota de aprendizagem**: base de cálculo e funções excluídas | **BAIXA** | Decreto 9.579/2018, arts. 51–57; Decreto 11.061/2022 | módulo de cota desativado |
| P18 | **Alíquotas do art. 21 da Lei 8.212/1991** (20% / 11% / 5%) não lidas no texto oficial | **BAIXA** (convergência forte entre fontes) | Lei 8.212/1991, art. 21 | confirmar antes do go-live |
| P19 | **Simples Nacional Anexo IV**: RAT devido e dispensa de Terceiros — texto da LC 123 não lido | **BAIXA** | LC 123/2006, art. 13, VI e §3º; art. 18, §5º-C | confirmar antes do go-live |

---

## 17. VALORES QUE MUDAM TODO ANO — rotina de atualização

> Rotina obrigatória do motor: **job anual em dezembro/janeiro** + **verificação mensal** dos
> itens de cadência irregular. Toda alteração passa por **staging → diff legível → aprovação
> humana → publicação versionada** (mesmo padrão de `docs/fontes-oficiais.md`). Regra antiga
> vira histórico com data de vigência — **o motor precisa recalcular competências passadas
> com a tabela da época**, então **nunca sobrescrever: versionar**.

| Item | Valor 2026 | Norma que fixa | Quando muda | Onde buscar |
|---|---|---|---|---|
| **Salário mínimo** | R$ 1.621,00 | Decreto anual (12.797/2025) | **01/jan** | DOU / Planalto |
| **Tabela INSS** (4 faixas) | 1.621,00 / 2.902,84 / 4.354,27 / 8.475,55 | Portaria Interministerial MPS/MF (13/2026) | **jan** (publicada na 2ª quinzena, retroativa a 01/jan) | gov.br/previdencia + DOU |
| **Teto do INSS** | R$ 8.475,55 | mesma portaria | jan | idem |
| **Desconto máx. do empregado** | R$ 988,09 | derivado da tabela | jan | recalcular, não copiar |
| **Salário-família — cota** | R$ 67,54 | mesma portaria | jan | idem |
| **Salário-família — limite de renda** | R$ 1.980,38 | mesma portaria | jan | idem |
| **Tabela IRRF mensal** (5 faixas + parcelas a deduzir) | isento até 2.428,80 … 27,5% / 908,73 | Lei 11.482/2007 (red. Lei 15.191/2025) | **irregular** — por lei ou MP; mudou em mai/2025 e jan/2026 | DOU / Receita Federal |
| **Dedução por dependente** | R$ 189,59 | Lei 9.250/1995, art. 4º | irregular | idem |
| **Desconto simplificado mensal** | R$ 607,20 | Lei 13.149/2015 / Lei 14.848/2024 | acompanha a 1ª faixa (25% dela) | idem |
| **Redutor do IRRF — limites e coeficiente** | 5.000 / 7.350 / 978,62 / 0,133145 | Lei 15.270/2025 | **verificar anualmente** — os limites tendem a ser corrigidos | DOU / RFB |
| **FAP de cada empresa** | individual (0,5000–2,0000) | Decreto 6.042/2007; divulgação anual | **divulgado em 30/set**, vigora no ano seguinte | portal MPS + RFB, **por CNPJ** |
| **RAT por CNAE** | 1% / 2% / 3% | Decreto 3.048/1999, Anexo V | irregular (decreto) | Planalto |
| **CPRB / reoneração** | 2026: 60% CPRB + 50% CPP | Lei 14.973/2024 | **degrau anual até 2028** | Planalto |
| **Alíquotas de Terceiros por FPAS** | 5,8% (códigos comuns) | IN RFB 2.110/2022 | irregular | RFB + Tabela 4 do eSocial |
| **Pisos regionais estaduais** | variável por UF | lei estadual | jan–mai | Diário Oficial de cada Estado |
| **Pisos e adicionais de CCT** | variável por categoria | CCT/ACT | **data-base de cada categoria** | Mediador/MTE |
| **Leiautes e tabelas do eSocial** | S-1.3 (NT 04/2025) | Portaria do eSocial | por Nota Técnica | gov.br/esocial |
| **Manual do FGTS Digital** | v1.50 de 20/03/2026 | MTE | por versão | gov.br/trabalho-e-emprego |
| **Teto de benefícios do INSS** | R$ 8.475,55 | Portaria Interministerial | jan | gov.br/previdencia |

### Rotina sugerida (a codificar como job)

| Quando | O quê |
|---|---|
| **01/out** | Buscar o **FAP do ano seguinte** de cada CNPJ da carteira; abrir tarefa por divergência |
| **20/dez a 20/jan** | Monitorar DOU diariamente: decreto do salário mínimo, portaria interministerial do INSS, eventual lei/MP do IRRF |
| **Ao detectar publicação** | Extrair valores → staging → **diff** contra a tabela vigente → tarefa no Kanban para **aprovação humana** → publicar com `vigencia_inicio` |
| **Mensal** | Verificar NTs do eSocial e novas versões do Manual do FGTS Digital |
| **Data-base de cada categoria** | Verificar CCT nova no Mediador; atualizar piso, adicional de HE e contribuições |
| **Sempre** | Nenhuma tabela é sobrescrita — **novo registro com vigência**; o motor seleciona pela competência |

---

*G41 Inteligência Contábil — motor de folha do sistema Lior. Documento vivo: reverificar a
cada publicação normativa. **Insights Impulsionam.***
