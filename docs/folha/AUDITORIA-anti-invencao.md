# Auditoria anti-invenção — documentos de pesquisa do módulo de Folha

> Executada em **30/08/2026** pelo agente `auditor-anti-invencao` sobre os seis documentos
> de pesquisa, mais conferência aritmética independente. Auditoria **100% interna**: o
> egress para `*.gov.br` estava bloqueado, então nada foi reverificado em fonte externa.
> Alertas em âmbar; zero vermelho, conforme `CLAUDE.md`.

## Veredito por documento

| Documento | Veredito | Condição para liberar |
|---|---|---|
| `01-esocial-eventos-e-obrigatoriedade.md` | **APROVADO COM RESSALVA** | Definir o nível `V1` na legenda; rebaixar as datas de certificado para pendência; declarar que os "50 eventos" incluem os 8 de retorno |
| `02-esocial-integracao-tecnica.md` | **APROVADO COM RESSALVA** | Corrigir "44 eventos"; reconciliar C-01 e C-08; reconciliar a unidade de esforço (C-09) |
| `03-motor-calculo-folha.md` | **NÃO USAR ANTES DE VERIFICAR** | Corrigir a aritmética das linhas 251, 249 e 39; adotar selo de evidência por número; remover o fallback da linha 624; corrigir as citações 422, 611 e 494; parametrizar as âncoras da linha 1211 |
| `04-obrigacoes-acessorias-e-calendario.md` | **Seção de multas: NÃO USAR** · resto: **APROVADO COM RESSALVA** | Rebaixar os valores de multa de confirmado para pendência até a portaria ser lida |
| `05-construir-x-comprar-e-fornecedores.md` | **Alegação de API REST: NÃO USAR** · resto: **APROVADO COM RESSALVA** | Resolver C-01 |
| `06-riscos-lgpd-e-dados-vivos.md` | **APROVADO COM RESSALVA** | Rebaixar o único selo de verificação direta; o manifesto anti-invenção deste documento deveria virar o teste de aceite dos outros cinco |

## O furo estrutural

Os seis documentos compartilham a mesma limitação de rede, mas **cada um inventou um
esquema próprio de selo de confiança** — e o mesmo fato recebeu selos opostos em documentos
diferentes. Valores de multa aparecem como confirmados no `04` e como proibidos de
reproduzir no `01`; o limite de 50 eventos por lote é oficial no `02` e pendência no `01`.

**Consequência:** a invenção não entra por afirmação nova. Entra por **promoção de selo
entre documentos** — basta o desenvolvedor abrir o `04` em vez do `01`.

**Correções estruturais necessárias:** um esquema de selo único para os seis; um registro
central de fontes em `docs/folha/fontes/` com hash e data (prometido no `01` e nunca criado);
e a regra de que **um mesmo fato carrega o mesmo selo em todos os documentos**.

## A. Contradições entre documentos

| # | Tema | Documento A | Documento B | Impacto | O que resolve |
|---|---|---|---|---|---|
| C-01 | Existe API REST oficial do eSocial? | `05:57` afirma que sim, com URL de especificação no portal | `02:44`, `02:105`, `02:662` afirmam que não existe (P-01) | **Crítico** — define transporte, esforço e a decisão construir x comprar | Abrir a especificação de recepção de lote citada em `05:57` e o Manual do Desenvolvedor |
| C-02 | Valores da multa do eSocial | `04:364` publica valores como confirmados | `01:549`, `01:555-558` proíbem reproduzir; `05:220` e `06:716` tratam como não confirmado | **Crítico** — vai para proposta comercial e para tela | Portaria MTP 667/2021 art. 81, na redação da Portaria MTE 1.131/2025 |
| C-03 | Multa por atraso da DCTFWeb | `04:363` publica percentuais e mínimo como confirmados | `01:550` mantém em pendência | Alto | Lei 8.212/1991, art. 32-A |
| C-04 | Consolidação vigente do MOS | `01:68`, `02:58` — uma nota de orientação | `04:74`, `05:203`, `06:209` — outra, quatro notas anterior | Alto | Página de manuais do eSocial |
| C-05 | Nota técnica vigente do leiaute | `03:1375`, `03:450` — NT 04/2025 | `01:83`, `02:62`, `04:74`, `05:202` — NT 06/2026 | Alto — define XSD e validação | Página de documentação técnica |
| C-06 | Versão do Manual do FGTS Digital | `03:406`, `03:1376` — v1.50 | `04:189`, `04:490` — v1.60 | Médio-alto — base de cálculo do FGTS | Página do FGTS Digital |
| C-07 | Número de eventos do leiaute S-1.3 | `01:195` — 50, com lista que soma 50 | `02:586` — 44 (órfão); `05:67` — 48 (do fornecedor) | Médio — dimensiona escopo | Índice de eventos do leiaute |
| C-08 | Limite de eventos por lote | `02:208` — 1 a 50, marcado como oficial | `01:585` — pendência | Médio | Manual do Desenvolvedor |
| C-09 | Esforço da camada de transmissão | `02:595` — 4 a 7 **semanas** (núcleo de transporte) | `05:191` — 4 a 7 **pessoa-mês** (transmissão incluindo geração do XML dos eventos) | **Alto para a decisão** | Escopos diferentes; reconciliar antes de usar em decisão |
| C-10 | Início do consignado no FGTS Digital | `01:171` — competência 02/2026 | `03:401` — março/2026 | Baixo-médio | Comunicados do FGTS Digital |
| C-11 | Multas dos arts. 47 e 47-A da CLT | `04:367` | `06:716` — valores diferentes | Médio | CLT + Portaria 667/2021 |
| C-12 | Licença da biblioteca `sped-esocial` | `02:526` — tri-licença lida no LICENSE | `05:154` — GitHub reporta indefinida; mandar ler o LICENSE | Médio (jurídico) | Abrir o LICENSE e registrar hash |

## B. Afirmações órfãs, silenciosas e com fonte que não sustenta

| # | Arquivo:linha | Problema | Classe |
|---|---|---|---|
| O-01 | `04:364` | valores de multa marcados como confirmados sem a portaria ter sido aberta | Selo inflacionado |
| O-02 | `05:57` | "existe hoje API REST oficial", sem selo e contra a própria pendência do documento | Órfã |
| O-03 | `03:624` | `senão → salário mínimo nacional` dentro do bloco FÓRMULA da insalubridade | Fallback silencioso |
| O-04 | `03:525`, `03:1140` | divisor 220 e limite de 6% do vale-transporte aplicados como padrão | Silenciosa |
| O-05 | `03:1211-1214` | massa-âncora fixa RAT 2%, FAP 1,0000 e Terceiros 5,8% | Silenciosa — o desenvolvedor "prova" o motor com parâmetros que o próprio documento proíbe presumir |
| O-06 | `03:1163-1168` | arredondamento half-up, 4 casas e divisor 30 — escolha do autor, sem norma | Órfã assumida |
| O-07 | `03:422` | adicional de aposentadoria especial citado como Lei 8.212/1991, art. 57 | Fonte não sustenta — o art. 57 é da Lei 8.213/1991 |
| O-08 | `03:611` | número e relator da reclamação que afastou a Súmula 228 do TST | Fonte não sustenta — não usar o número |
| O-09 | `03:494` | isenção do 13º da contribuição patronal fundamentada no artigo de incidência | Fonte não sustenta |
| O-10 | `03:836` | "IRRF não incide sobre aviso prévio indenizado" | Órfã — a pendência vizinha cobre só o INSS |
| O-11 | `03:887`, `03:1144` | margem de consignado de 35%, sem artigo e sem vigência | Órfã de vigência |
| O-12 | `06:537` | único item marcado como verificado direto, com o Planalto bloqueado | Selo inflacionado |
| O-13 | `01:174` | datas do novo padrão de certificado com selo médio, sendo que `05:205` registra ambiguidade | Selo inflacionado |
| O-14 | `02:586`, `02:609` | "o S-1.3 tem 44 eventos" | Órfã |

## C. Aritmética

**Confere (recalculado de forma independente):**
- INSS 2026 — as três parcelas a deduzir batem, e a soma das quatro faixas fecha exatamente
  no desconto máximo declarado; alíquota efetiva no teto confere.
- Coerência de reajuste — as quatro faixas do INSS e as duas referências do salário-família
  fecham com um mesmo índice. Isso é coerência interna, **não** confirmação da norma.
- IRRF — as quatro fronteiras fecham nos dois sentidos; o desconto simplificado é exatamente
  25% do limite de isenção.
- Redutor — zera exatamente no topo da faixa.
- Os três holerites e os treze testes-âncora batem no centavo.
- A lista de eventos do `01` soma exatamente 50.

**Não confere:**

| # | Arquivo:linha | Problema |
|---|---|---|
| A-01 | `03:251` | A cadeia de cálculo do teste-âncora do redutor usa a faixa e a parcela a deduzir erradas. O resultado final está certo, mas por outra faixa — a conta escrita não fecha |
| A-02 | `03:249`, `03:39` | Arredondamento contra a regra half-up que o próprio documento define, em dois valores |
| A-03 | `03:110-113` vs `03:119` | O laço de apuração e as parcelas a deduzir foram construídos sobre limites de faixa ligeiramente diferentes — divergência capaz de virar um centavo na fronteira |

## D. Cobertura — o que falta nos seis documentos

**Cálculo:** rescisão, férias e 13º **sem nenhum exemplo numérico completo**; folha
complementar e adiantamento; proporcionalização de admissão e demissão no meio do mês;
faltas, atrasos e perda do DSR; férias que atravessam competências; RPA e autônomo com a
ponte para a EFD-Reinf; cota de aprendiz e de PcD; salário-maternidade com variáveis.

**Dados e integração:** o **de-para de rubrica interna para os códigos de incidência do
S-1010** — que o próprio `01` aponta como o maior risco do módulo e não tem especificação
em lugar nenhum; carga inicial de bases acumuladas na migração de sistema; códigos de
retorno do CNAB; conteúdo legal obrigatório do holerite; tratamento do arquivo de ponto até
as horas apuradas.

**Processo:** massa de teste oficial da folha — a planilha citada no `CLAUDE.md` é fiscal e
não serve; plano de reconciliação da folha contra os totalizadores de retorno do eSocial; e
o registro de fontes com hash e data.

## E. Encaminhamento

1. Correções aritméticas e de citação aplicadas diretamente nos documentos, quando
   verificáveis sem fonte externa.
2. Selos inflacionados rebaixados.
3. Contradições marcadas no próprio texto, nos dois lados, até a fonte primária decidir.
4. Itens novos incorporados a `FONTES-A-BAIXAR.md`.
