# Tabela de rubricas e reconciliação com os totalizadores
### Especificação do de-para rubrica → incidência (S-1010) e do teste de aceite do módulo de Folha do Lior

**Data-base:** 30/08/2026 · **Status:** v1 — especificação proposta, com pendências abertas
**Fecha a lacuna** apontada em `AUDITORIA-anti-invencao.md`, seção D ("Dados e integração") e em
`07-arquitetura-modulo-lior.md`, seções 3 e 6.

---

## 0. Como este documento foi verificado

**Leia antes de usar qualquer código de incidência daqui.**

### 0.1 Limitação de ambiente (a mesma dos seis documentos anteriores)

O egress desta sessão continua **bloqueado por política de rede para `*.gov.br`, `planalto.gov.br`
e `in.gov.br`** (403 no proxy). **Nenhum PDF, HTML ou ZIP oficial foi aberto.** Onde o texto
normativo é indispensável, o documento escreve `PENDÊNCIA — não confirmado` e diz qual documento
fecha. A checklist já existe: `FONTES-A-BAIXAR.md`.

### 0.2 Evidência nova disponível nesta sessão, e sua procedência

Diferente das frentes anteriores, esta sessão teve acesso a um artefato derivado dos XSDs oficiais,
obtido **por caminho que não é gov.br**:

| Artefato | Origem | O que é | Licença |
|---|---|---|---|
| `esociallib/esocial/bindings/v_s13/*.py` | repositório open source **`github.com/erpbrasil/esociallib`** (KMEE Informática), clonado nesta máquina | *bindings* Python gerados por `xsdata` a partir do **pacote oficial de XSD S-1.3**. As docstrings são **transcrição literal das anotações do leiaute** (descrição do campo, validações, condições de grupo, regras nomeadas) | MIT |
| `esociallib/tabelas/*.csv` | mesmo repositório; o script `scripts/download_tabelas.sh` as baixa de **`frontend.esocial.gov.br/adm/`** (Administração de Tabelas) | as tabelas de domínio do eSocial em CSV separado por `\|` — inclusive a **Tabela 03 (Natureza das Rubricas)**, a **Tabela 21 (Incidência Tributária de IRRF)** e a **Tabela 54 (Rubricas do eSocial)** | MIT (o conteúdo é do governo) |

**Ressalvas que precisam andar junto com essa evidência:**

1. **O snapshot é de fevereiro/março de 2026, não de hoje.** O script do repositório aponta para o
   ZIP `2026-02-13_esquemas_xsd_v_s_01_03_00.zip` e o último commit do clone é de **10/03/2026**.
   Os demais documentos desta pasta apontam a consolidação vigente como **NT S-1.3 nº 06/2026,
   revisada em 09/04/2026** — **posterior ao snapshot**. O comentário do próprio script cita ainda
   uma "NT 07/2026 (março 2026)", que **não aparece em nenhum dos seis documentos**.
   → Isso é uma **contradição nova**, registrada como `P09-1` na seção 8 e endereçada ao item **A4**
   da checklist de fontes.
2. **Nada aqui substitui o download oficial.** Um binding é fiel ao XSD que o gerou; não prova qual
   XSD está vigente hoje.
3. **As tabelas CSV são transcrição de terceiro.** O XSD prova a *estrutura*; a tabela CSV traz o
   *domínio* — e domínio é justamente o que muda por Nota Orientativa sem mudar o schema.

### 0.3 Selo de evidência — o mesmo de `01-esocial-eventos-e-obrigatoriedade.md`

A auditoria interna determinou que **um mesmo fato carrega o mesmo selo em todos os documentos**.
Este documento **não cria escala nova**; usa a de `01`:

| Selo | Significado neste documento | Confiabilidade |
|---|---|---|
| `V3` | Confirmado contra o **XSD oficial S-1.3** — anotação literal do leiaute, via os bindings descritos em 0.2. É o mesmo nível e a **mesma origem** que o documento `01` já chamou de `V3` | Alta, **com a ressalva de data de 0.2** |
| `V2` | Conteúdo de **tabela oficial do eSocial** obtido por terceiro (os CSV de 0.2) ou trecho de página oficial. O arquivo original **não foi aberto** nesta sessão | Média — reconferir antes de codar |
| `PENDÊNCIA` | **Não confirmado. Não é afirmado neste documento** | — |
| `PROPOSTA` | **Decisão de engenharia do Lior**, não norma. Vale para o desenho da tabela, para as travas e para o catálogo inicial | É opinião, e está marcada como tal |

> **Regra que o documento respeita do começo ao fim:** todo o catálogo da seção 3 é **`PROPOSTA` a
> conferir por humano**, mesmo quando existe âncora `V2` na Tabela 54. O leiaute não foi lido. Um
> código de incidência só sai de "proposta" quando alguém abrir o MOS e a tabela oficial e assinar.

---

## 1. O risco, em uma frase

**Errar o código de incidência não gera erro de sistema.** O XML valida, o evento é aceito, o recibo
volta, o holerite fecha e o cliente paga. O erro aparece meses depois, como **diferença entre a folha
calculada e o que o Ambiente Nacional apurou nos totalizadores** — e a essa altura já virou
recolhimento a menor, com multa e juros, multiplicado por todos os empregados de todos os meses em
que a rubrica rodou.

Por isso este documento tem duas metades que não se separam:

- **Seções 2–4:** a tabela de rubricas, o de-para e as travas que impedem uma rubrica mal
  classificada de entrar em cálculo.
- **Seções 5–6:** a reconciliação contra os totalizadores — a **única prova** de que o de-para está
  certo, e o ciclo de correção quando não está.

Os holerites de teste provam aritmética. **A reconciliação prova classificação.** São coisas
diferentes, e só a segunda é teste de aceite.

---

## 2. Modelo de dados: `folha_rubrica`

### 2.1 O que o evento S-1010 exige — campos do leiaute

Estrutura confirmada `V3` (namespace `http://www.esocial.gov.br/schema/evt/evtTabRubrica/v_S_01_03_00`):

```
evtTabRubrica
├── ideEvento (tpAmb, procEmi, verProc)
├── ideEmpregador (tpInsc, nrInsc)
└── infoRubrica
    ├── inclusao   { ideRubrica, dadosRubrica }
    ├── alteracao  { ideRubrica, dadosRubrica, novaValidade? }
    └── exclusao   { ideRubrica }
```

**Grupo `ideRubrica` — a chave do registro** (`CHAVE_GRUPO: {codRubr*}, {ideTabRubr*}, {iniValid*}, {fimValid*}`, `V3`):

| Campo | Tipo no XSD | Obrig. | Domínio / regra | Selo |
|---|---|---|---|---|
| `codRubr` | texto | **Sim** | Código **atribuído pelo empregador**. Validação literal do leiaute: *"O código não pode conter a expressão 'eSocial' nas 7 primeiras posições"*; sujeito a `REGRA_CARACTERE_ESPECIAL` | `V3` |
| `ideTabRubr` | texto | **Sim** | Identificador da **tabela de rubricas no âmbito do empregador** — permite mais de uma tabela por CNPJ (ex.: por convenção coletiva). Mesma proibição do prefixo `eSocial` | `V3` |
| `iniValid` | texto `AAAA-MM` | **Sim** | Início da validade daquela versão da rubrica | `V3` estrutura · formato `V2` |
| `fimValid` | texto `AAAA-MM` | Não | Fim da validade. Ausente = vigente | `V3` |

> **O tamanho máximo de `codRubr`, `ideTabRubr` e `dscRubr` é `PENDÊNCIA`.** Os bindings não
> preservaram as facetas `maxLength` do XSD. Não inventar `varchar(30)`: usar `text` com
> `CHECK (length(...) <= :limite)` alimentado por parâmetro, e fechar o número no leiaute.

**Grupo `dadosRubrica` — o de-para propriamente dito** (`V3`):

| Campo | Tipo | Obrig. | Domínio | Onde vive o domínio | Selo |
|---|---|---|---|---|---|
| `dscRubr` | texto | **Sim** | Descrição da rubrica no sistema de folha da empresa | livre | `V3` |
| `natRubr` | texto numérico | **Sim** | **Natureza da rubrica** | **Tabela 03** — fora do XSD | `V3` (obrigatoriedade) · domínio `V2` |
| `tpRubr` | inteiro | **Sim** | `1` Vencimento, provento ou pensão · `2` Desconto · `3` Informativa · `4` Informativa dedutora. Validação: *se `natRubr = 9253`, deve ser `2`* | **enumerado no XSD** | `V3` |
| `codIncCP` | texto | **Sim** | **Incidência previdenciária** — 26 valores, enumerados no XSD (tabela completa em 2.2) | **enumerado no XSD** | `V3` |
| `codIncIRRF` | texto, `pattern \d{1,4}` | **Sim** | **Incidência de IRRF** — o XSD **só valida o formato**; os valores são da **Tabela 21** | **Tabela 21** — fora do XSD | `V3` (formato) · domínio `V2` |
| `codIncFGTS` | texto | **Sim** | **Incidência de FGTS** — 8 valores, enumerados no XSD (2.2) | **enumerado no XSD** | `V3` |
| `codIncCPRP` | texto | Não | Incidência para RPPS/SPSMFA — 7 valores. **Fora do escopo do MVP** (Grupo 4 / entes públicos) | XSD | `V3` |
| `codIncPisPasep` | texto | Não | Incidência do PIS/PASEP **sobre a folha de salários**, exigível quando `indTribFolhaPisPasep = S` no S-1000. *"Caso o campo não seja informado, será presumido o valor `00`"* | XSD | `V3` |
| `tetoRemun` | S/N | Condicional | Compõe o teto do art. 37, XI, da CF/1988. *"Preenchimento obrigatório se a natureza jurídica do declarante for Administração Pública"* | — | `V3` |
| `observacao` | texto | Não | Observações sobre a rubrica ou seu uso | livre | `V3` |
| `ideProcessoCP` | grupo, 0..99 | Condicional | *Obrigatório se `codIncCP = 9X`*. Campos: `tpProc`, `nrProc` (que deve existir no **S-1070** com `indMatProc = 1`), `extDecisao` (`1` patronal · `2` patronal + descontada), `codSusp` | XSD | `V3` |
| `ideProcessoIRRF` | grupo, 0..99 | Condicional | *Obrigatório se `codIncIRRF = 9X` ou `9XXX`*. Campos: `nrProc`, `codSusp` | XSD | `V3` |
| `ideProcessoFGTS` | grupo, 0..99 | Condicional | *Obrigatório se `codIncFGTS = 9X`*. Campo: `nrProc` | XSD | `V3` |
| `ideProcessoPisPasep` | grupo, 0..99 | Condicional | *Obrigatório se `codIncPisPasep = 9X`*. Campos: `nrProc`, `codSusp` | XSD | `V3` |

Regras nomeadas que o evento carrega (`V3`): `REGRA_ENVIO_PROC_FECHAMENTO`, `REGRA_EXISTE_INFO_EMPREGADOR`,
`REGRA_TABGERAL_ALTERACAO_PERIODO_CONFLITANTE`, `REGRA_TABGERAL_EXISTE_REGISTRO_ALTERADO`,
`REGRA_TABGERAL_EXISTE_REGISTRO_EXCLUIDO`, `REGRA_TABGERAL_INCLUSAO_PERIODO_CONFLITANTE`,
`REGRA_TABRUBR_INCLUSAO`, `REGRA_TAB_PERMITE_EXCLUSAO`, **`REGRA_VALIDA_CODINCCP_EXC_SEGURADO`**,
`REGRA_VALIDA_DT_FUTURA`. **O conteúdo de cada uma é `PENDÊNCIA`** — está na página de Regras do
leiaute (item A2 da checklist). As três destacadas são as que decidem se uma alteração de vigência é
aceita ou rejeitada, e por isso governam a seção 4.

> **Consequência de desenho, e é a mais importante deste documento:** dos quatro códigos que
> classificam a rubrica, **dois têm domínio fora do XSD** (`natRubr` na Tabela 03, `codIncIRRF` na
> Tabela 21) — e **as duas tabelas são versionadas por vigência**, com códigos que nascem, mudam de
> nome e morrem. Exemplos lidos no CSV (`V2`): `1016 Férias` e `1017 Terço constitucional` foram
> **reeditados com início em 01/01/2026**; `1800` passou de *"Alimentação concedida em pecúnia"* para
> *"Alimentação concedida em pecúnia **com caráter salarial**"* em 01/01/2026; `1810` passou de
> *"Transporte"* para *"Vale-transporte ou auxílio-transporte **com caráter indenizatório**"* na
> mesma data.
> **Logo: `natRubr` e `codIncIRRF` não podem virar `enum` do Postgres nem união de literais no
> TypeScript.** Precisam de tabela de domínio versionada, no mesmo padrão de `folha_parametro`.
> Um `enum` congelado é uma bomba com data marcada: quando o eSocial encerra um código, a rubrica
> continua válida no banco e passa a ser rejeitada — ou pior, aceita com semântica trocada.

### 2.2 Os domínios enumerados no XSD

**`codIncCP` — incidência previdenciária** (26 valores, `V3`). Validação literal: *"Para utilização
de código `[91, 92, 93, 94, 95, 96, 97, 98]`, é necessária a existência de grupo com informações
relativas ao processo."*

| Código | Significado |
|---|---|
| `00` | Não é base de cálculo |
| `01` | Não é base de cálculo em função de acordos internacionais de previdência social |
| `11` | Base de cálculo — salário de contribuição **mensal** |
| `12` | Base de cálculo — **13º salário** |
| `13` / `14` | Exclusiva do **empregador** — mensal / 13º |
| `15` / `16` | Exclusiva do **segurado** — mensal / 13º |
| `21` / `22` | Salário-maternidade pago **pelo empregador** — mensal / 13º |
| `25` / `26` | Salário-maternidade pago **pelo INSS** — mensal / 13º |
| `31` / `32` | **Contribuição descontada do segurado** — mensal / 13º |
| `34` / `35` | SEST / SENAT |
| `51` | Outros: **salário-família** |
| `91`–`98` | Suspensão de incidência por decisão judicial (mensal, 13º, salário-maternidade, exclusivas do empregador) |

**`codIncFGTS` — incidência do FGTS** (8 valores, `V3`). Validações literais: *"Para utilização de
código `[91, 92, 93]`, é necessária a existência de grupo com informações relativas ao processo. A
utilização do código `[31]` é obrigatória e exclusiva quando `natRubr = 9253`"* (empréstimo
eConsignado).

| Código | Significado |
|---|---|
| `00` | Não é base de cálculo do FGTS |
| `11` | Base do FGTS **mensal** |
| `12` | Base do FGTS **13º salário** |
| `21` | Base do FGTS **aviso prévio indenizado** |
| `31` | **Desconto eConsignado** (exclusivo de `natRubr = 9253`) |
| `91` / `92` / `93` | Incidência suspensa por decisão judicial — mensal / 13º / aviso prévio indenizado |

**`tpRubr`** (`V3`): `1` vencimento/provento/pensão · `2` desconto · `3` informativa ·
`4` informativa dedutora.

**`codIncIRRF`** não tem enumeração no XSD — só `pattern \d{1,4}`. O domínio é a **Tabela 21**
(`V2`), cujas famílias vigentes são: `9` verba de natureza diversa · `11`–`14` rendimentos
tributáveis (mensal, 13º, férias, PLR) · `31`–`34` retenções · `41`–`48` deduções de previdência
oficial e complementar · `51`–`54` pensão alimentícia · `61`–`67` FAPI/previdência do servidor/
**plano privado coletivo de assistência à saúde** · `68` desconto simplificado mensal (a partir de
01/05/2023) · `70`–`79` e `700`–`704` isenções e não tributáveis · `9XXX` exigibilidade suspensa e
depósito judicial. Os códigos `0`, `1`, `15`, `35`, `44`, `55`, `78`, `81`–`83` e `91`–`95` constam
com **fim de vigência em 30/06/2021** (`V2`) — outra prova de que o domínio precisa de vigência.

### 2.3 O que é do Lior e não vai no XML

O S-1010 é o mínimo que o governo exige. O motor de folha precisa de mais para calcular, e o
escritório precisa de mais para auditar. **Estes campos são `PROPOSTA`:**

| Campo | Para que serve |
|---|---|
| `incide_dsr`, `incide_13`, `incide_ferias`, `incide_rescisao`, `incide_afastamento` | **Reflexos.** Dizem se a rubrica compõe a base do DSR, do 13º, das férias, da rescisão e da média de afastamento. Achado relevante: a **Tabela 54 do próprio eSocial traz colunas equivalentes** — `repDSR`, `rep13`, `repFerias`, `repResc`, `repAfast` (`V2`) —, o que confirma que o de-para completo tem **oito** dimensões, não três |
| `fator_padrao` | Fator/percentual sugerido (ex.: 0,5 para HE 50%). A Tabela 54 também tem `fatorRubr` (`V2`) |
| `formula_id` | Referência à fórmula do motor. Regra do projeto: **fórmula é dado versionado, não `switch` em código** |
| `base_referencia` | Qual base a fórmula consome (salário-hora, salário-dia, remuneração variável do mês) |
| `ordem_holerite`, `grupo_holerite` | Apresentação. Conteúdo legal obrigatório do holerite é `PENDÊNCIA` (seção 6 do doc `07`) |
| `conta_contabil_debito`, `conta_contabil_credito` | Integração contábil |
| `status_classificacao` | `proposta` · `em_revisao` · `aprovada` · `suspensa`. **Só `aprovada` entra em cálculo** |
| `aprovada_por`, `aprovada_em`, `revisada_por`, `revisada_em` | **Quatro olhos.** O doc `01`, recomendação 8, pede revisão dupla para esta tabela |
| `fonte_url`, `fonte_verificada`, `norma`, `pesquisado_em` | Mesmo padrão de `folha_parametro`: **rubrica com `fonte_verificada = false` produz resultado PROVISÓRIO** |
| `origem` | `catalogo_lior` · `migracao_sistema_anterior` · `manual` · `importada_cct`. Rubrica migrada de outro sistema é a que mais erra e precisa ficar marcada |
| `esocial_evento_id`, `esocial_recibo`, `esocial_status` | Estado da transmissão do S-1010 daquela vigência |
| `hash_incidencia` | Hash dos quatro códigos + vigência. Muda ⇒ a rubrica precisa de novo S-1010 e de nova aprovação |

### 2.4 DDL proposto (Postgres / Supabase)

Convenções seguidas: prefixo `folha_`, `cliente_id` para multi-tenant, RLS habilitada,
`text` para inscrições (CNPJ alfanumérico), numérico com escala explícita.

```sql
-- ============================================================
-- folha_rubrica — de-para rubrica interna → incidências do S-1010
-- PROPOSTA. Nenhum domínio abaixo pode ser considerado fechado
-- antes dos itens A1/A2/A4 de FONTES-A-BAIXAR.md.
-- ============================================================

-- 0) Domínio versionado: espelho das tabelas oficiais do eSocial.
--    Tabelas 03 (natureza) e 21 (incidência de IRRF) NÃO estão no XSD
--    e mudam por vigência — por isso são dado, não enum.
create table if not exists public.folha_esocial_dominio (
  id             uuid primary key default gen_random_uuid(),
  tabela         text not null,          -- '03_natureza_rubrica' | '21_incidencia_irrf' | ...
  codigo         text not null,
  descricao      text not null,
  vigencia_inicio date not null,
  vigencia_fim   date,                   -- null = vigente
  atributos      jsonb not null default '{}',
  fonte_url      text,
  fonte_verificada boolean not null default false,
  hash_fonte     text,
  pesquisado_em  date,
  unique (tabela, codigo, vigencia_inicio)
);
create index on public.folha_esocial_dominio (tabela, codigo)
  where vigencia_fim is null;

-- 1) A tabela de rubricas por empregador (ideTabRubr do leiaute).
create table if not exists public.folha_rubrica_tabela (
  id             uuid primary key default gen_random_uuid(),
  cliente_id     uuid not null,
  ide_tab_rubr   text not null,
  descricao      text not null,
  padrao         boolean not null default false,
  unique (cliente_id, ide_tab_rubr),
  -- validação literal do leiaute (V3)
  constraint folha_rt_prefixo_esocial
    check (lower(left(ide_tab_rubr, 7)) <> 'esocial')
);

-- 2) A rubrica, versionada por vigência.
create table if not exists public.folha_rubrica (
  id             uuid primary key default gen_random_uuid(),
  cliente_id     uuid not null,
  tabela_id      uuid not null references public.folha_rubrica_tabela(id),

  -- ideRubrica (S-1010) ------------------------------------------------
  cod_rubr       text not null,
  ini_valid      date not null,            -- normalizar sempre no dia 1
  fim_valid      date,                     -- null = vigente; sempre o dia 1

  -- dadosRubrica (S-1010) ----------------------------------------------
  dsc_rubr       text not null,
  nat_rubr       text not null,            -- Tabela 03
  tp_rubr        smallint not null,        -- enumerado no XSD
  cod_inc_cp     text not null,            -- enumerado no XSD
  cod_inc_irrf   text not null,            -- Tabela 21
  cod_inc_fgts   text not null,            -- enumerado no XSD
  cod_inc_cprp   text,                     -- fora do MVP
  cod_inc_pis_pasep text,                  -- só se S-1000.indTribFolhaPisPasep = 'S'
  teto_remun     char(1),                  -- só Administração Pública
  observacao     text,
  processos      jsonb not null default '[]',  -- ideProcessoCP/IRRF/FGTS/PisPasep

  -- campos do Lior (não vão no XML) ------------------------------------
  incide_dsr        boolean,
  incide_13         boolean,
  incide_ferias     boolean,
  incide_rescisao   boolean,
  incide_afastamento boolean,
  fator_padrao      numeric(9,6),
  formula_id        uuid,
  base_referencia   text,
  ordem_holerite    integer,
  grupo_holerite    text,
  conta_contabil_debito  text,
  conta_contabil_credito text,
  origem            text not null default 'manual',
  status_classificacao text not null default 'proposta',
  revisada_por   uuid, revisada_em timestamptz,
  aprovada_por   uuid, aprovada_em timestamptz,
  norma          text,
  fonte_url      text,
  fonte_verificada boolean not null default false,
  pesquisado_em  date,

  -- estado do S-1010 ---------------------------------------------------
  esocial_evento_id text,
  esocial_recibo    text,
  esocial_status    text not null default 'rascunho',

  criado_em      timestamptz not null default now(),
  criado_por     uuid not null,
  atualizado_em  timestamptz not null default now(),

  -- Vigência como intervalo, para a restrição de sobreposição.
  -- ATENÇÃO à semântica do leiaute: fimValid = AAAA-MM é o ÚLTIMO mês
  -- válido, inclusive. Por isso o limite superior do range é o mês
  -- SEGUINTE, com fronteira aberta.
  vigencia daterange generated always as (
    daterange(
      ini_valid,
      case when fim_valid is null then null
           else (fim_valid + interval '1 month')::date end,
      '[)')
  ) stored,

  -- chave do leiaute: codRubr + ideTabRubr + iniValid
  unique (cliente_id, tabela_id, cod_rubr, ini_valid)
);

-- Uma linha por rubrica aplicada em cada cálculo. É a memória de cálculo
-- exigida em 07-arquitetura-modulo-lior.md, seção 2.2, e é ela que torna
-- possível o diagnóstico da seção 5.6 deste documento.
create table if not exists public.folha_calculo_rubrica (
  id            uuid primary key default gen_random_uuid(),
  cliente_id    uuid not null,
  calculo_id    uuid not null,            -- folha_calculo
  competencia   date not null,
  vinculo_id    uuid not null,
  rubrica_id    uuid not null references public.folha_rubrica(id),
  -- cópia congelada da classificação no momento do cálculo: o de-para
  -- muda por vigência, e o passado precisa continuar explicável
  nat_rubr      text not null,
  tp_rubr       smallint not null,
  cod_inc_cp    text not null,
  cod_inc_irrf  text not null,
  cod_inc_fgts  text not null,
  referencia    numeric(15,6),
  valor         numeric(15,2) not null,
  base_usada    numeric(15,2),
  parametro_id  uuid,                     -- folha_parametro que alimentou
  formula       text
);
create index on public.folha_calculo_rubrica (cliente_id, competencia, cod_inc_cp);
create index on public.folha_calculo_rubrica (rubrica_id);
```

As restrições de integridade vêm na **seção 4** — elas são o coração da especificação e merecem
leitura separada.

---

## 3. Catálogo inicial de rubricas — **PROPOSTA a conferir**

### 3.1 Aviso, e ele não é formalidade

> **Nada nesta seção é fato.** É o **rascunho que um humano valida**. O leiaute não foi lido nesta
> sessão. Cada linha traz uma **âncora** — o código da **Tabela 54 (Rubricas do eSocial)** cuja
> classificação oficial foi lida no CSV (`V2`) — para que a conferência seja rápida e apontada, não
> uma pesquisa do zero.
>
> **O que a âncora prova e o que não prova.** A Tabela 54 é a tabela de rubricas **do próprio
> eSocial**, usada nos módulos web (Doméstico, Segurado Especial e Simplificado). Ela mostra como o
> **eSocial classifica uma rubrica equivalente**. Ela **não** é a tabela da empresa: uma empresa com
> folha própria cria as suas rubricas, com `codRubr` próprio, e é **ela** quem responde pela
> classificação. Usar a âncora como ponto de partida é legítimo; usá-la como autorização não é.

Convenção das colunas: `nat` = `natRubr` · `tp` = `tpRubr` · `CP` = `codIncCP` ·
`IR` = `codIncIRRF` · `FG` = `codIncFGTS`.

> **Detalhe de formato que já causou bug em produção alheia:** o CSV da Tabela 54 grava os códigos
> de CP e FGTS **sem o zero à esquerda** (`0`), enquanto o **enumerado do XSD exige dois dígitos**
> (`00`) — `V3`. O catálogo abaixo usa a forma do XSD. Ao importar qualquer tabela de terceiro,
> **normalizar com `lpad(codigo, 2, '0')` antes de comparar**; `codIncIRRF`, ao contrário, tem
> largura variável (`\d{1,4}`) e **não** deve ser preenchido com zeros.

### 3.2 Proventos e vencimentos

| # | Rubrica (folha CLT comum) | nat | tp | CP | IR | FG | Âncora T54 | Ponto de conferência |
|---|---|---|---|---|---|---|---|---|
| 1 | Salário base / mensalista | 1000 | 1 | 11 | 11 | 11 | `eSocial1000` | A rubrica-mãe. Se esta estiver errada, tudo está |
| 2 | Horas extras 50% / 100% | 1003 | 1 | 11 | 11 | 11 | `eSocial1100` | Uma rubrica por percentual, com `fator_padrao` distinto — não uma rubrica genérica com fator digitado |
| 3 | Horas extras — banco de horas | 1004 | 1 | 11 | 11 | 11 | `eSocial1120` | Natureza **diferente** da HE comum |
| 4 | Adicional noturno | 1205 | 1 | 11 | 11 | 11 | `eSocial1130` | Compõe base do DSR |
| 5 | Adicional de insalubridade | 1202 | 1 | 11 | 11 | 11 | `eSocial1300` | A **base** do adicional é parâmetro por empresa (doc `03`, achado O-03: não usar salário mínimo como padrão silencioso) |
| 6 | Adicional de periculosidade | 1203 | 1 | 11 | 11 | 11 | `eSocial1310` | — |
| 7 | DSR sobre verbas variáveis | 1002 | 1 | 11 | 11 | 11 | `eSocial1210`/`1211`/`1213` | A T54 tem uma rubrica de DSR **por origem** (HE, adicional noturno, comissões). Replicar a separação facilita a auditoria |
| 8 | Férias gozadas no mês | 1016 | 1 | 11 | **13** | 11 | `eSocial1910` | `IR = 13` (férias), **não** `11`. Erro clássico: cair no rendimento mensal e misturar a tributação |
| 9 | Terço constitucional de férias | 1017 | 1 | 11 | 13 | 11 | `eSocial1920` | A âncora traz `CP = 11`. **A discussão judicial sobre a incidência previdenciária do terço é `PENDÊNCIA` — este documento não a afirma nem a nega.** Fechar com o MOS e a norma antes de aprovar |
| 10 | Abono pecuniário (venda de férias) | 1023 | 1 | 00 | **75** | 00 | `eSocial1930` | Verba isenta com código próprio |
| 11 | Terço sobre o abono pecuniário | 1023 | 1 | 00 | **13** | 00 | `eSocial1940` | **Mesma natureza da linha 10, `codIncIRRF` diferente** (`13`, não `75`). É o tipo de detalhe que ninguém acerta de memória |
| 12 | 13º salário — parcela final | 5001 | 1 | **12** | **12** | **12** | `eSocial1810` | Toda a família do 13º usa os códigos `12`, nunca `11` |
| 13 | 13º salário — adiantamento (1ª parcela) | 5504 | 1 | **00** | 9 | **12** | `eSocial1800` | **Armadilha:** sem CP e **com FGTS**. Classificar com `CP = 12` na 1ª parcela antecipa contribuição que não é devida ali |
| 14 | Adiantamento de salário (provento) | 5501 | 1 | 00 | 11 | 00 | `eSocial1040` | Ver a divergência da linha 30 |
| 15 | Saldo de salário na rescisão | 6000 | 1 | 11 | 11 | 11 | `eSocial3000` | Natureza rescisória própria — não reaproveitar a 1000 |
| 16 | Aviso prévio indenizado | 6003 | 1 | **00** | **74** | **21** | `eSocial3030` | **A rubrica mais perigosa da folha.** `FGTS = 21` é um código exclusivo dessa base. Marcar `FG = 11` mistura a base mensal; marcar `00` some com o depósito |
| 17 | 13º sobre o aviso prévio indenizado | 6001 | 1 | **12** | **74** | **21** | `eSocial3010` | **Combinação contraintuitiva:** tem CP de 13º, IRRF de indenização e FGTS de aviso — três famílias diferentes na mesma linha |
| 18 | Férias proporcionais na rescisão | 6006 | 1 | 00 | 74 | 00 | `eSocial3050` | Indenizatória: sem CP e **sem FGTS** |
| 19 | Férias vencidas na rescisão | 6007 | 1 | 00 | 74 | 00 | `eSocial3060` | idem |
| 20 | Multa rescisória de 40% | 6101 | 1 | 00 | 74 | 00 | — (sem âncora na T54) | `PENDÊNCIA` de âncora — conferir no MOS |
| 21 | Salário-família | 1409 | 1 | **51** | 9 | 00 | `eSocial1720` | `CP = 51` é código próprio ("Outros: salário-família"); é **dedução** da guia, não base |
| 22 | Vale-transporte pago em pecúnia | 1810 | 1 | 00 | 9 | 00 | `eSocial1550` | A natureza `1810` **mudou de nome em 01/01/2026** para "com caráter indenizatório" (`V2`). Se a empresa paga transporte com caráter salarial, a natureza é **outra** (`1811`) e a incidência muda |
| 23 | Vale-refeição / alimentação — PAT (ticket) | 1806 | **3** | 00 | 9 | 00 | `eSocial1562` | **`tpRubr = 3` (informativa)** — não é provento. Lançar como provento infla o bruto do holerite e a base de tudo |
| 24 | Cesta básica / refeição — PAT | 1808 | 3 | 00 | 9 | 00 | `eSocial1564` | idem |
| 25 | Assistência médica (custo do empregador) | 1405 | 1 | 00 | 9 | 00 | `eSocial1640` | Ver linha 34 para o **desconto** |
| 26 | Arredondamento (provento) | 2999 | 1 | 00 | 9 | 00 | `eSocial2050` | Rubrica de fechamento de centavo; **jamais** com incidência |

### 3.3 Descontos

| # | Rubrica | nat | tp | CP | IR | FG | Âncora T54 | Ponto de conferência |
|---|---|---|---|---|---|---|---|---|
| 27 | INSS do segurado — mensal | 9201 | 2 | **31** | ver nota | 00 | `eSocial5180` | `CP = 31` é o que alimenta `tpValor = 21` do S-5001 e, por consequência, `vrDescSeg` |
| 28 | INSS do segurado — 13º | 9201 | 2 | **32** | **42** | 00 | `eSocial5181` | Aqui a âncora traz `IR = 42` (dedução PSO do 13º) |
| 29 | IRRF — mensal / férias / 13º / PLR | 9203 | 2 | 00 | **31 / 33 / 32 / 34** | 00 | `eSocial5190`–`5193` | **Quatro rubricas distintas.** Uma rubrica de IRRF só, com `31`, joga o imposto de férias e de 13º no balde mensal e quebra o S-5002 |
| 30 | Desconto do adiantamento de salário | 9200 | 2 | 00 | **11 ou 9** | 00 | `eSocial5020` (IR 11) e `eSocial5098` (IR 9) | **A própria tabela oficial traz duas classificações para a mesma natureza.** `PENDÊNCIA` — não escolher no chute |
| 31 | Desconto do adiantamento do 13º | 9214 | 2 | 00 | 9 | **12** | `eSocial5040` | Desconto **com FGTS `12`** — espelha a linha 13 |
| 32 | Faltas | 9207 | 2 | **11** | **11** | **11** | `eSocial5060` | **Desconto com incidência `11`.** É correto e antinatural: `tpRubr = 2` faz o valor **subtrair** da base. Classificar como `00` mantém a base cheia e recolhe a maior |
| 33 | DSR sobre faltas e atrasos | 9210 | 2 | 11 | 11 | 11 | `eSocial5070` | idem |
| 34 | Plano de saúde — desconto (coletivo empresarial) | 9219 | 2 | 00 | **9** | 00 | `eSocial5165` | **Ver nota crítica abaixo** — a dedução de IRRF do plano de saúde é o código `67` da Tabela 21, que **não aparece em nenhuma rubrica da T54** |
| 35 | Pensão alimentícia — mensal / 13º / férias / PLR | 9213 | 2 | 00 | **51 / 52 / 53 / 54** | 00 | `eSocial5110`–`5113` | Mesma lógica da linha 29: **quatro rubricas**, não uma |
| 36 | Vale-transporte — desconto | 9216 | 2 | 00 | 9 | 00 | `eSocial5090` | O limite de 6% é `PENDÊNCIA` no doc `03` (achado O-04) — não embutir como padrão |
| 37 | Vale-refeição PAT — desconto | 9241 | 2 | 00 | 9 | 00 | `eSocial5102` | Casa com a linha 23 |
| 38 | Alimentação em pecúnia — desconto | 9240 | 2 | **11** | **11** | **11** | `eSocial5101` | **Com incidência**, ao contrário do PAT. Confirma que "vale-refeição" não é uma rubrica só |
| 39 | Desconto do aviso prévio não cumprido | 6901 | 2 | 00 | 9 | 00 | `eSocial5000` | — |
| 40 | Empréstimo consignado — desconto | 9254 | 2 | 00 | 9 | 00 | `eSocial5161` | Consignado **eConsignado** é outra natureza (`9253`), com `tpRubr = 2` obrigatório e `FG = 31` obrigatório e exclusivo (`V3`) |
| 41 | Contribuição sindical / associativa | 9230 / 9231 | 2 | 00 | 9 | 00 | `eSocial5120`/`5121` | — |
| 42 | Arredondamento (desconto) | 2999 | 2 | 00 | 9 | 00 | `eSocial5117` | Par da linha 26 |

### 3.4 Três notas que decidem se o catálogo funciona

**Nota A — a dedução de IRRF do INSS mensal (linha 27).** A âncora `eSocial5180` traz
`codIncIRRF = 9` desde 01/07/2021 (`V2`) — ou seja, a rubrica de desconto do INSS **não** carrega
a dedução. Na mesma tabela existe `eSocial9510` — *"PSO - Mensal"*, `natRubr = 9989`,
**`tpRubr = 4` (informativa dedutora)**, `codIncIRRF = 41` — que é quem informa a dedução.
Já no 13º (linha 28) a dedução vai **na própria rubrica de desconto** (`IR = 42`).
**Isso é assimétrico e não pode ser adivinhado.** Duas leituras possíveis:

- *(a)* o modelo do eSocial web usa rubrica informativa dedutora separada para o mensal; ou
- *(b)* o sistema de folha próprio deve classificar o próprio desconto com `41`.

**Efeito de errar:** se a dedução da previdência oficial não chegar ao S-5002 por nenhum caminho, o
**rendimento tributável apurado pelo governo fica maior que o da folha**, e o IRRF que o eSocial
espera é maior que o retido. A divergência aparece no `vlrPrevOficial` do S-5002 — e a seção 5 a
detecta no primeiro mês. **`PENDÊNCIA P09-3`, impacto alto.**

**Nota B — a dedução do plano de saúde (linha 34).** A Tabela 21 tem o código `67`
("Plano privado coletivo de assistência à saúde") e o S-5002 tem campo próprio para deduções — mas
**nenhuma rubrica da Tabela 54 usa `67`**. Ou o eSocial web não trata o caso, ou a dedução entra por
outro grupo do S-1210. **`PENDÊNCIA P09-4`, impacto alto** — é uma dedução presente em quase toda
folha de PME com plano coletivo.

**Nota C — o que o catálogo não cobre e por quê.** Ficam de fora, por dependerem de cálculo ainda sem
especificação (doc `07`, seção 6): médias de férias e 13º sobre variáveis, rescisão complementar,
folha complementar, proporcionalização de admissão e demissão no meio do mês, e salário-maternidade
com variáveis. **Não são rubricas faltantes: são cálculos faltantes.** Criar a rubrica sem o cálculo
produz um campo que alguém preenche na mão.

---

## 4. Regras de integridade

### 4.1 As cinco travas, em linguagem de negócio

| # | Trava | Por quê |
|---|---|---|
| T1 | **Rubrica sem os três códigos não entra em cálculo** | Não existe padrão. `natRubr`, `codIncCP`, `codIncIRRF` e `codIncFGTS` são `NOT NULL` no leiaute (`V3`); no Lior, `status_classificacao <> 'aprovada'` **bloqueia o cálculo**, não só o envio |
| T2 | **Rubrica nova nasce com pendência** | `status_classificacao = 'proposta'` no `INSERT`, sempre. Abre tarefa no Kanban G41 (regra 3 do `CLAUDE.md`), com `X-Idempotency-Key` derivada de `cliente_id + cod_rubr + ini_valid` |
| T3 | **Mudança de incidência é nova vigência, nunca `UPDATE`** | Alterar os códigos de uma linha vigente reescreve o passado em silêncio. A mudança cria **nova linha** com `ini_valid` no mês seguinte e fecha a anterior |
| T4 | **Competência fechada não retroage** | Nenhuma vigência pode começar dentro de competência com `status = 'fechada'`. Corrigir o passado exige o ciclo da seção 6 — reabertura formal —, não um `INSERT` mais antigo |
| T5 | **Rubrica em uso não se exclui** | Só `fim_valid`. Exclusão física de rubrica referenciada por `folha_calculo_rubrica` quebra a memória de cálculo e a trilha de auditoria |

### 4.2 As travas em SQL

```sql
-- ---------- T1: os quatro códigos, sempre, e dentro do domínio ----------

-- Domínios enumerados no XSD viram CHECK (são estáveis: mudam com o leiaute).
alter table public.folha_rubrica
  add constraint folha_rub_tp_rubr_dom
    check (tp_rubr in (1,2,3,4)),
  add constraint folha_rub_cod_inc_cp_dom
    check (cod_inc_cp in ('00','01','11','12','13','14','15','16',
                          '21','22','25','26','31','32','34','35','51',
                          '91','92','93','94','95','96','97','98')),
  add constraint folha_rub_cod_inc_fgts_dom
    check (cod_inc_fgts in ('00','11','12','21','31','91','92','93')),
  -- codIncIRRF: o XSD só valida o formato. O domínio é a Tabela 21 e é
  -- verificado por trigger contra folha_esocial_dominio (ver abaixo).
  add constraint folha_rub_cod_inc_irrf_fmt
    check (cod_inc_irrf ~ '^\d{1,4}$'),
  -- validação literal do leiaute (V3)
  add constraint folha_rub_prefixo_esocial
    check (lower(left(cod_rubr, 7)) <> 'esocial'),
  -- vigência sempre no primeiro dia do mês (o leiaute é AAAA-MM)
  add constraint folha_rub_vigencia_mes
    check (extract(day from ini_valid) = 1
           and (fim_valid is null or extract(day from fim_valid) = 1)),
  add constraint folha_rub_vigencia_ordem
    check (fim_valid is null or fim_valid >= ini_valid),
  add constraint folha_rub_status_dom
    check (status_classificacao in ('proposta','em_revisao','aprovada','suspensa')),
  -- regra de validação do XSD: natRubr 9253 (eConsignado) força tpRubr 2 e FGTS 31
  add constraint folha_rub_econsignado
    check (nat_rubr <> '9253' or (tp_rubr = 2 and cod_inc_fgts = '31')),
  -- e o inverso: FGTS 31 é exclusivo do eConsignado
  add constraint folha_rub_fgts31_exclusivo
    check (cod_inc_fgts <> '31' or nat_rubr = '9253'),
  -- códigos 9X exigem o grupo de processo correspondente (V3).
  -- coalesce é obrigatório: CHECK que resulta NULL PASSA em Postgres,
  -- e uma trava que passa por omissão não é trava.
  add constraint folha_rub_processo_cp
    check (left(cod_inc_cp,1) <> '9'
           or coalesce(jsonb_array_length(processos -> 'cp'), 0) > 0),
  add constraint folha_rub_processo_fgts
    check (left(cod_inc_fgts,1) <> '9'
           or coalesce(jsonb_array_length(processos -> 'fgts'), 0) > 0),
  add constraint folha_rub_processo_irrf
    check (left(cod_inc_irrf,1) <> '9'
           or coalesce(jsonb_array_length(processos -> 'irrf'), 0) > 0);

-- Não sobrepor vigências da mesma rubrica (espelha
-- REGRA_TABGERAL_INCLUSAO_PERIODO_CONFLITANTE — conteúdo é PENDÊNCIA).
create extension if not exists btree_gist;
alter table public.folha_rubrica
  add constraint folha_rub_sem_sobreposicao
  exclude using gist (
    cliente_id with =, tabela_id with =, cod_rubr with =,
    vigencia with &&
  );
```

```sql
-- ---------- T1 (parte 2): codIncIRRF e natRubr contra o domínio VIGENTE ----------
create or replace function public.folha_rubrica_valida_dominio()
returns trigger language plpgsql as $$
declare
  v_ok boolean;
begin
  select exists (
    select 1 from public.folha_esocial_dominio d
     where d.tabela = '03_natureza_rubrica'
       and d.codigo = new.nat_rubr
       and d.vigencia_inicio <= new.ini_valid
       and (d.vigencia_fim is null or d.vigencia_fim >= new.ini_valid)
  ) into v_ok;
  if not v_ok then
    raise exception
      'natRubr % não existe ou não está vigente em % na Tabela 03',
      new.nat_rubr, to_char(new.ini_valid,'YYYY-MM');
  end if;

  select exists (
    select 1 from public.folha_esocial_dominio d
     where d.tabela = '21_incidencia_irrf'
       and d.codigo = new.cod_inc_irrf
       and d.vigencia_inicio <= new.ini_valid
       and (d.vigencia_fim is null or d.vigencia_fim >= new.ini_valid)
  ) into v_ok;
  if not v_ok then
    raise exception
      'codIncIRRF % não existe ou não está vigente em % na Tabela 21',
      new.cod_inc_irrf, to_char(new.ini_valid,'YYYY-MM');
  end if;
  return new;
end $$;

create trigger folha_rubrica_dominio
  before insert or update on public.folha_rubrica
  for each row execute function public.folha_rubrica_valida_dominio();
```

```sql
-- ---------- T2: nasce proposta, e o cálculo só enxerga aprovada ----------
create or replace function public.folha_rubrica_nasce_pendente()
returns trigger language plpgsql as $$
begin
  new.status_classificacao := 'proposta';
  new.aprovada_por := null;
  new.aprovada_em  := null;
  return new;
end $$;

create trigger folha_rubrica_pendente
  before insert on public.folha_rubrica
  for each row execute function public.folha_rubrica_nasce_pendente();

-- Aprovação exige quatro olhos: quem aprova não pode ser quem criou nem quem revisou.
alter table public.folha_rubrica
  add constraint folha_rub_quatro_olhos
  check (
    status_classificacao <> 'aprovada'
    or (aprovada_por is not null
        and aprovada_em  is not null
        and revisada_por is not null
        and aprovada_por is distinct from criado_por
        and aprovada_por is distinct from revisada_por)
  );

-- A view que o motor consome. O motor NUNCA lê folha_rubrica direto.
create or replace view public.folha_rubrica_calculavel as
  select *
    from public.folha_rubrica
   where status_classificacao = 'aprovada'
     and fonte_verificada = true;
```

> **Sobre `fonte_verificada` na view:** é a mesma regra de ouro de `07-arquitetura-modulo-lior.md`,
> seção 2.1. Enquanto o leiaute não for lido, **nenhuma rubrica terá `fonte_verificada = true`** — e
> a view virá vazia. Isso é o comportamento correto, não um bug: **o módulo não calcula antes do
> portão da checklist de fontes.** Para o desenvolvimento em produção restrita, usar um flag de
> ambiente que troque a view por uma versão permissiva e **carimbe todo resultado como PROVISÓRIO**.

```sql
-- ---------- T3 + T4: imutabilidade da incidência e não-retroação ----------
create or replace function public.folha_rubrica_protege_incidencia()
returns trigger language plpgsql as $$
begin
  -- T3: os códigos de uma vigência existente são imutáveis.
  if (old.nat_rubr, old.tp_rubr, old.cod_inc_cp, old.cod_inc_irrf, old.cod_inc_fgts)
     is distinct from
     (new.nat_rubr, new.tp_rubr, new.cod_inc_cp, new.cod_inc_irrf, new.cod_inc_fgts)
  then
    raise exception
      'incidência é versionada: encerre a vigência atual (fim_valid) e crie nova linha';
  end if;
  return new;
end $$;

create trigger folha_rubrica_incidencia_imutavel
  before update on public.folha_rubrica
  for each row execute function public.folha_rubrica_protege_incidencia();

create or replace function public.folha_rubrica_nao_retroage()
returns trigger language plpgsql as $$
declare
  v_fechada date;
begin
  -- T4: nenhuma vigência pode iniciar dentro de competência fechada.
  select max(c.competencia) into v_fechada
    from public.folha_competencia c
   where c.cliente_id = new.cliente_id
     and c.status = 'fechada';

  if v_fechada is not null and new.ini_valid <= v_fechada then
    raise exception
      'competência % está fechada: use o ciclo de reabertura (S-1298) antes de alterar rubrica',
      to_char(v_fechada,'YYYY-MM');
  end if;
  return new;
end $$;

create trigger folha_rubrica_sem_retroacao
  before insert or update on public.folha_rubrica
  for each row execute function public.folha_rubrica_nao_retroage();
```

```sql
-- ---------- T5: rubrica em uso não some ----------
create or replace function public.folha_rubrica_bloqueia_exclusao()
returns trigger language plpgsql as $$
begin
  if exists (select 1 from public.folha_calculo_rubrica r
              where r.rubrica_id = old.id)
     or old.esocial_recibo is not null
  then
    raise exception
      'rubrica já usada em cálculo ou já transmitida: encerre com fim_valid, não exclua';
  end if;
  return old;
end $$;

create trigger folha_rubrica_sem_delete
  before delete on public.folha_rubrica
  for each row execute function public.folha_rubrica_bloqueia_exclusao();

-- Trilha de auditoria própria (recomendação 8 do doc 01), append-only.
create table if not exists public.folha_rubrica_auditoria (
  id           bigserial primary key,
  rubrica_id   uuid not null,
  cliente_id   uuid not null,
  operacao     text not null,          -- insert | update | aprovacao | encerramento
  antes        jsonb,
  depois       jsonb,
  ator         uuid,
  em           timestamptz not null default now()
);
alter table public.folha_rubrica_auditoria enable row level security;
-- sem UPDATE e sem DELETE: nenhuma policy os concede.
```

### 4.3 Segurança

Vale integralmente a seção 4 de `07-arquitetura-modulo-lior.md`: RLS com `FORCE`, teste de fuga de
tenant no CI, autoexclusão (ninguém vê a própria folha pelo perfil administrativo) e auditoria de
leitura. Duas observações específicas da rubrica:

- A tabela de rubricas **não contém dado pessoal**, então é a única do módulo que pode ir para uma
  IA de apoio à classificação. Isso está dentro da *whitelist* do doc `07`: *"o que se manda para um
  modelo é rubrica, base e resultado — nunca a pessoa"*.
- Mesmo assim, **IA não aprova rubrica.** Ela pode propor `status_classificacao = 'proposta'` com
  fonte; a aprovação é humana, com quatro olhos, pela restrição `folha_rub_quatro_olhos`.

---

## 5. Plano de reconciliação contra os totalizadores

### 5.1 A ideia central, e ela é simples

O Ambiente Nacional **não valida o valor da rubrica**. Ele **reagrupa** o que foi enviado, seguindo
os códigos de incidência declarados no S-1010, e devolve as bases e os tributos apurados. Portanto:

> **Se o de-para estiver certo, as bases que voltam nos totalizadores são exatamente a soma das
> rubricas que a folha calculou. Não é "aproximadamente": é exatamente.**

Daí sai o discriminador que torna a reconciliação **diagnóstica**, e não apenas um sinal luminoso:

| Classe de valor | Quem produz | Tolerância | O que uma diferença significa |
|---|---|---|---|
| **Bases** — `tpValor` 11–19 do S-5001, `remFGTS` do S-5003, `vlrRendTrib` do S-5002 | **Soma do que o Lior enviou**, reagrupado por código de incidência | **`0,00`. Zero.** | **Erro de classificação de rubrica.** Não é arredondamento, não é regra de negócio: alguma rubrica caiu no balde errado |
| **Valores calculados** — `vrCpSeg` do S-5001, `dpsFGTS` do S-5003, `vlrCRMen` do S-5002, `vrCR` do S-5011/S-5013 | **O governo aplica alíquotas** sobre as bases | `R$ 0,01` por trabalhador por linha | **Erro de parâmetro** (faixa de INSS, RAT, FAP, alíquota, teto) ou arredondamento — **não** de rubrica |

Essa separação é o que permite dizer, na tela, *qual das duas coisas quebrou* — em vez de mostrar
uma diferença de R$ 3,47 e deixar o analista procurando.

### 5.2 O que cada totalizador devolve

Estrutura confirmada `V3`; os valores dos enumerados idem.

| Evento | Elemento-raiz | Granularidade | Gerado a partir de | O que traz de aproveitável |
|---|---|---|---|---|
| **S-5001** | `evtBasesTrab` | por trabalhador (`cpfTrab`) | S-1200 / S-2299 / S-2399 | `infoCpCalc` com `tpCR`, **`vrCpSeg`** (o que o governo calculou) e **`vrDescSeg`** (o que o Lior descontou); `infoCp` → `classTrib`, `ideEstabLot` (`tpInsc`, `nrInsc`, `codLotacao`) → `infoCategIncid` (`matricula`, `codCateg`, `indSimples`) → **`infoBaseCS` (`ind13`, `tpValor`, `valor`)**; `infoPerRef` para períodos anteriores; `infoPisPasep` |
| **S-5002** | `evtIrrfBenef` | por trabalhador (`cpfBenef`) | S-1210 | `dmDev` por `perRef`/`ideDmDev`/`tpPgto`/`dtPgto`/`codCateg`; **`infoIR` (`tpInfoIR`, `valor`)**; `totApurMen` com `CRMen`, **`vlrRendTrib`**, `vlrRendTrib13`, **`vlrPrevOficial`**, `vlrPrevOficial13`, **`vlrCRMen`**, `vlrCR13Men`, e os campos de isentos (`vlrDiarias`, `vlrAjudaCusto`, `vlrIndResContrato`, `vlrAbonoPec`, `vlrJurosMora`, `vlrIsenOutros`…); `totApurDia`; `infoIRComplem` |
| **S-5003** | `evtBasesFGTS` | por trabalhador | S-1200 / S-2299 / S-2399 | `dtVenc`; `ideEstab` → `ideLotacao` → `infoTrabFGTS` (`matricula`, `codCateg`, `dtDeslig`, `mtvDeslig`) → **`infoBaseFGTS.basePerApur` (`tpValor`, `indIncid`, **`remFGTS`**, **`dpsFGTS`**, **`natRubr`**)**; `infoBasePerAntE` para períodos anteriores; **`detRubrSusp` com `codRubr`, `ideTabRubr`, `vrRubr`**; `eConsignado` com `vreConsignado` |
| **S-5011** | `evtCS` | por empregador | **S-1299** | `indExistInfo`; `infoCPSeg` (**`vrDescCP`**, **`vrCpSeg`** totais); `infoContrib`/`infoPJ` (`indCoop`, `indConstr`, `indSubstPatr`, `percRedContrib`); `ideEstab` → `infoEstab` (`cnaePrep`, **`aliqRat`**, **`fap`**, **`aliqRatAjust`**) → `ideLotacao` (`fpas`, `codTercs`) → **`basesRemun`**; **`infoCREstab`** e **`infoCRContrib` (`tpCR`, `vrCR`, `vrCRSusp`)** |
| **S-5012** | `evtIrrf` | por empregador | **S-1299** | `indExistInfo`; **`infoCRMen` (`CRMen`, `vrCRMen`)** e `infoCRDia` (`perApurDia`, `CRDia`, `vrCRDia`) |
| **S-5013** | `evtFGTS` | por empregador | **S-1299** | `indExistInfo`; `ideEstab` → `ideLotacao` → bases por `tpValor` (mesmo domínio do S-5003, com `19` para avulsos não portuários) |

Dois campos que precisam de destaque porque estruturam toda a reconciliação:

- **`nrRecArqBase`** (presente em todos, `V3`): *"número do recibo do arquivo que deu origem ao
  presente arquivo"*. **É a chave que liga o totalizador à versão exata do S-1200/S-1299 que o
  gerou.** Sem persistir esse campo, uma retificação faz o painel comparar a folha nova com o
  totalizador velho — e "resolver" a divergência com uma ilusão.
- **`indExistInfo`** nos consolidados (`V3`): `1` há informações · `2` há movimento, porém não há
  informações · `3` não há movimento no período. **É a primeira verificação da reconciliação.**
  Folha calculada com valor e `indExistInfo = 3` significa que o problema é anterior a qualquer
  rubrica — evento não chegou, competência errada, `perApur` errado.

### 5.3 A verificação que o próprio S-5001 já entrega de graça

O S-5001 traz, **para o mesmo trabalhador e o mesmo `tpCR`**, dois números:

- **`vrCpSeg`** — *"valor da contribuição do segurado, devida à Previdência Social, **calculada
  segundo as regras da legislação em vigor**"* (`V3`);
- **`vrDescSeg`** — *"valor **efetivamente descontado** do segurado, correspondente a
  `tpValor = 21`"* (`V3`), isto é, o que o Lior informou ter descontado.

**A diferença entre os dois é uma auditoria pronta, por trabalhador, sem nenhum cálculo do nosso
lado.** Se `vrCpSeg ≠ vrDescSeg`, ou a base declarada está errada, ou o desconto está errado.

Há uma exceção legítima e ela precisa estar na tela: a anotação do leiaute condiciona o cálculo ao
**`indMV` (múltiplos vínculos)** do S-1200 — com `indMV = 3` o `vrCpSeg` é zero; com `indMV = 2` o
cálculo considera a remuneração declarada em outras empresas (`vlrRemunOE`). **Trabalhador com
múltiplos vínculos diverge por desenho** e deve ser classificado como divergência esperada, não como
erro.

### 5.4 Matriz de conferência

`indApuracao`: `1` mensal · `2` 13º (domínio a confirmar — `PENDÊNCIA`).

| # | Agregado da folha calculada | Contra | Tolerância |
|---|---|---|---|
| R1 | Σ rubricas com `codIncCP ∈ (11,13,15)`, por trabalhador/lotação | S-5001 `infoBaseCS.valor` com `tpValor` correspondente e `ind13 = 0` | **0,00** |
| R2 | Σ rubricas com `codIncCP = 12` | S-5001 `infoBaseCS.valor`, `ind13 = 1` | **0,00** |
| R3 | Σ rubricas com `codIncCP = 31` (INSS descontado) | S-5001 `infoBaseCS.valor` com `tpValor = 21` **e** `infoCpCalc.vrDescSeg` | **0,00** |
| R4 | INSS do segurado que o motor calculou | S-5001 `infoCpCalc.vrCpSeg` | 0,01/trab. — **exceto múltiplos vínculos** (5.3) |
| R5 | Σ rubricas com `codIncFGTS = 11` | S-5003 `basePerApur.remFGTS` com `tpValor = 11` | **0,00** |
| R6 | Σ rubricas com `codIncFGTS = 12` | S-5003 `tpValor = 12` | **0,00** |
| R7 | Σ rubricas com `codIncFGTS = 21` (aviso prévio indenizado) | S-5003 `tpValor = 23` | **0,00** |
| R8 | FGTS a depositar que o motor calculou | S-5003 `basePerApur.dpsFGTS` | 0,01/trab. |
| R9 | Base de FGTS **por natureza de rubrica** | S-5003 `basePerApur.natRubr` — o totalizador devolve a natureza; **é o caminho mais curto para achar a rubrica culpada** | **0,00** |
| R10 | Rendimento tributável mensal (rubricas com `codIncIRRF ∈ 11–14`) | S-5002 `totApurMen.vlrRendTrib` | **0,00** |
| R11 | Dedução de previdência oficial | S-5002 `totApurMen.vlrPrevOficial` | **0,00** — é aqui que a Nota A da seção 3.4 aparece |
| R12 | IRRF retido pelo motor | S-5002 `totApurMen.vlrCRMen` | 0,01/trab. |
| R13 | Rendimentos isentos por espécie | S-5002 `vlrDiarias`, `vlrAjudaCusto`, `vlrIndResContrato`, `vlrAbonoPec`, `vlrIsenOutros` | **0,00** — pega verba indenizatória classificada como remuneratória |
| R14 | Σ R1…R4 de todos os trabalhadores | **S-5011** `infoCPSeg.vrDescCP` e `vrCpSeg` | 0,01 × nº de trabalhadores |
| R15 | Contribuição patronal + RAT/FAP + Terceiros que o motor calculou | **S-5011** `infoCRContrib.tpCR`/`vrCR` e `infoCREstab` | 0,01 × nº de trabalhadores |
| R16 | RAT, FAP e RAT ajustado usados no cálculo | **S-5011** `infoEstab.aliqRat`, `fap`, `aliqRatAjust` | **igualdade exata** — é comparação de parâmetro, não de valor |
| R17 | FPAS e código de Terceiros usados | **S-5011** `ideLotacao.fpas`, `codTercs` | **igualdade exata** |
| R18 | Σ R12 de todos os trabalhadores, por código de receita | **S-5012** `infoCRMen.CRMen`/`vrCRMen` | 0,01 × nº de trabalhadores |
| R19 | Σ R8 de todos os trabalhadores | **S-5013** bases por `tpValor` | 0,01 × nº de trabalhadores |
| R20 | Competência tem folha calculada | `indExistInfo` de S-5011/S-5012/S-5013 ≠ 3 | booleano |

**Regra de escalonamento que a tolerância sozinha não pega:** uma diferença **do mesmo sinal, na mesma
linha, por três competências seguidas** deixa de ser arredondamento — vira divergência aberta mesmo
dentro da tolerância. Arredondamento oscila; erro de fórmula, não.

### 5.5 As tabelas

```sql
-- ============================================================
-- Reconciliação folha calculada × totalizadores do eSocial
-- ============================================================
create table if not exists public.folha_reconciliacao (
  id             uuid primary key default gen_random_uuid(),
  cliente_id     uuid not null,
  competencia    date not null,             -- primeiro dia do mês
  ind_apuracao   smallint not null,         -- 1 mensal | 2 13º (domínio: PENDÊNCIA)
  evento         text not null
                 check (evento in ('S-5001','S-5002','S-5003',
                                   'S-5011','S-5012','S-5013')),
  nr_rec_arq_base text not null,            -- recibo do S-1200/S-1299 de origem
  regra          text not null,             -- 'R1'..'R20'
  escopo         text not null
                 check (escopo in ('trabalhador','contribuinte')),
  cpf_trab       text,                      -- null no consolidado
  matricula      text,
  chave          jsonb not null default '{}',  -- {tpValor, ind13, tpCR, CRMen,
                                               --  codLotacao, natRubr, codCateg}
  classe         text not null
                 check (classe in ('base','calculado','parametro')),
  valor_esocial  numeric(15,2) not null,
  valor_folha    numeric(15,2),
  diferenca      numeric(15,2)
                 generated always as (coalesce(valor_folha,0) - valor_esocial) stored,
  tolerancia     numeric(15,2) not null default 0,
  status         text not null
                 check (status in ('ok','divergente','so_no_esocial',
                                   'so_na_folha','esperada')),
  motivo_esperada text,                     -- ex.: 'multiplos_vinculos'
  xml_hash       text,
  criado_em      timestamptz not null default now()
);

-- unique com expressão precisa ser índice, não constraint
create unique index if not exists folha_recon_chave
  on public.folha_reconciliacao (
    cliente_id, competencia, ind_apuracao, evento,
    nr_rec_arq_base, regra, coalesce(cpf_trab,''), chave
  );

create index on public.folha_reconciliacao (cliente_id, competencia)
  where status = 'divergente';

-- Uma divergência é um caso a tratar, com dono e desfecho.
create table if not exists public.folha_divergencia (
  id                uuid primary key default gen_random_uuid(),
  cliente_id        uuid not null,
  competencia       date not null,
  reconciliacao_ids uuid[] not null,
  gravidade         text not null
                    check (gravidade in ('bloqueante','alta','media','informativa')),
  causa_provavel    text,                   -- preenchida pelo diagnóstico (5.6)
  rubricas_suspeitas uuid[] not null default '{}',
  acao              text,                   -- retificar_s1010 | retificar_s1200 |
                                            -- reabrir_competencia | corrigir_parametro |
                                            -- sem_acao_justificada
  tarefa_kanban_id  text,                   -- tarefas.g41.com.br
  responsavel       uuid,
  status            text not null default 'aberta'
                    check (status in ('aberta','em_analise','resolvida','aceita')),
  justificativa     text,                   -- obrigatória para 'aceita'
  aberta_em         timestamptz not null default now(),
  fechada_em        timestamptz,
  check (status <> 'aceita' or justificativa is not null)
);
```

**Gravidade, por classe:** divergência em `classe = 'base'` é **sempre bloqueante** — impede o
fechamento da competência seguinte até ter desfecho. Divergência em `calculado` dentro da tolerância
é informativa; acima dela, alta. Divergência em `parametro` (R16, R17) é bloqueante: RAT, FAP e FPAS
errados contaminam a guia inteira.

### 5.6 Da divergência à rubrica culpada

O caminho do diagnóstico, que a tela precisa percorrer sozinha:

```
divergência em R5 (base de FGTS mensal, trabalhador X, R$ 412,90)
   │
   ├─ 1. o S-5003 devolve natRubr por basePerApur  → a natureza divergente é a 1017
   │
   ├─ 2. folha_calculo_rubrica do trabalhador X, competência,
   │     filtrado por rubricas com nat_rubr = '1017'
   │        → rubrica interna 'FER-TERCO', valor R$ 412,90
   │
   ├─ 3. folha_rubrica dessa rubrica, vigência da competência
   │        → cod_inc_fgts = '00'   (a folha não somou)
   │           o eSocial somou porque a natureza declarada no S-1010 vigente é outra
   │
   └─ 4. causa provável: 'incidencia_fgts_divergente'
         ação sugerida: retificar_s1010 + reabrir_competencia
         rubricas_suspeitas: [FER-TERCO]
```

Isso só funciona porque a **memória de cálculo** guarda, por linha, a rubrica e o parâmetro que a
alimentaram — exigência já posta em `07-arquitetura-modulo-lior.md`, seção 2.2. **Sem memória de
cálculo, a reconciliação vira um alerta sem endereço** — e o analista volta a conferir
holerite na mão.

### 5.7 A tela de divergência

Identidade visual do `CLAUDE.md`: navy `#0B1740`, âmbar `#E9A74A`, branco, **zero vermelho** — o
alerta é âmbar. Valores e códigos em IBM Plex Mono; texto em Archivo. O painel segue o estilo
"canhoto de nota fiscal" já usado no motor fiscal.

**Cabeçalho — o veredito em uma linha:**
`Competência 08/2026 · 47 trabalhadores · 312 linhas conferidas · 3 divergentes · 1 bloqueante`
com o selo grande: **CONFERIDA** · **DIVERGENTE** · **PROVISÓRIA** (esta última quando alguma rubrica
ou parâmetro em uso tem `fonte_verificada = false`).

**Corpo — três abas, na ordem em que se investiga:**

1. **Bases** (tolerância zero). Uma linha por regra e por trabalhador, com `valor_folha`,
   `valor_esocial`, `diferença`. Ordenado por diferença absoluta. Esta aba **é o de-para sob teste**.
2. **Calculados** (tolerância de centavo). Separa o que é arredondamento do que é parâmetro errado,
   e destaca a comparação `vrCpSeg × vrDescSeg` da seção 5.3.
3. **Parâmetros** (igualdade exata). RAT, FAP, RAT ajustado, FPAS, código de Terceiros, `classTrib`,
   `indSimples` — lado a lado com o que o Lior usou.

**Cada linha divergente abre a gaveta de diagnóstico da seção 5.6**, com: rubricas suspeitas, a
vigência do S-1010 que estava valendo, o recibo do evento (`nr_rec_arq_base`), a ação sugerida e o
botão que abre a tarefa no Kanban G41 — com `X-Idempotency-Key` derivada de
`cliente_id + competencia + regra + cpf_trab`, para que reprocessar a reconciliação não crie tarefa
duplicada.

**Fechos:** "Insights Impulsionam".

### 5.8 O teste de aceite do módulo

> **O módulo de folha só é aceito quando, por duas competências consecutivas de uma empresa real:**
>
> 1. **100% das linhas de classe `base` fecham com diferença `0,00`** — R1, R2, R3, R5, R6, R7, R9,
>    R10, R11, R13;
> 2. **nenhuma linha de classe `calculado` excede a tolerância**, e nenhuma repete o mesmo sinal por
>    três meses;
> 3. **todas as linhas de classe `parametro` são idênticas** (R16, R17);
> 4. **`indExistInfo = 1`** nos três consolidados;
> 5. **nenhuma rubrica em uso está com `status_classificacao <> 'aprovada'`** ou com
>    `fonte_verificada = false`;
> 6. **nenhuma divergência foi fechada como `aceita` sem justificativa escrita** — e a lista das
>    aceitas é revisada por um segundo par de olhos.

Isso é a **Fase 5** do faseamento do doc `07` — folha em paralelo com o sistema atual, por dois
meses. Os treze testes-âncora do doc `03` continuam valendo, mas provam outra coisa: **eles provam
que a conta fecha; a reconciliação prova que a conta foi somada no lugar certo.**

---

## 6. Ciclo de correção

### 6.1 Onde a divergência foi detectada muda tudo

| Momento | O que fazer | Custo |
|---|---|---|
| **Antes do S-1200** (conferência interna) | Corrigir a rubrica com **nova vigência**, recalcular, gerar o XML | Baixo. É o momento que se quer maximizar |
| **Depois do S-1200, antes do S-1299** | Se a incidência mudou: **S-1010 com `alteracao`** e nova vigência; depois **S-1200 com `indRetif = 2` + `nrRecibo`** do evento retificado (`V3`/`V2`) | Médio |
| **Depois do S-1299** | **S-1298 reabre** → corrigir (retificação ou **S-3000**) → **S-1299 refecha** → novos totalizadores chegam com **novo `nrRecArqBase`** → reconciliar de novo | Alto — e a reconciliação **tem de rodar outra vez**, contra o novo recibo |
| **Depois da DCTFWeb transmitida** | Retificação da DCTFWeb. **Procedimento com DARF já pago é `PENDÊNCIA`** — item **B6** da checklist, e é o caso mais frequente de suporte | Alto |
| **Depois do FGTS pago** | Depósito feito não volta. Diferença a menor vira complementar com encargos; diferença a maior vira pedido de restituição | Alto e demorado |

Regras confirmadas do ciclo (`V3`/`V2`, do doc `01`): `indRetif = 1` original, `2` retificação;
`nrRecibo` **obrigatório** se `indRetif = 2`; o recibo referenciado deve ser de evento **válido** —
ainda não excluído nem já retificado; `REGRA_ENVIO_PROC_FECHAMENTO` **rejeita qualquer envio enquanto
o S-1299 processa** — o Lior deve bloquear a UI em vez de colecionar rejeição.

### 6.2 A armadilha específica da alteração de rubrica

O S-1010 aceita `alteracao` com `novaValidade` (`V3`). Isso significa que é **tecnicamente possível
mudar a incidência de uma rubrica com vigência retroativa** — e o Ambiente Nacional então
**reprocessa competências já fechadas**, mudando bases que já viraram guia paga.

**Por isso a trava T4 existe no banco, e não só na tela.** A regra operacional que ela materializa:

> Alteração de incidência **nunca** retroage por conta própria. Se o passado precisa mudar, o caminho
> é explícito e auditado: abrir divergência → decidir → **S-1298** → corrigir → **S-1299** →
> reconciliar. O sistema não deve oferecer atalho para isso, porque o atalho é exatamente o erro que
> ninguém percebe.

### 6.3 O que fica irreversível

- **Recibo de evento aceito.** Não se apaga: só se retifica (`indRetif = 2`) ou se torna sem efeito
  (**S-3000**). O histórico permanece.
- **Depósito de FGTS efetuado** e **DARF pago** — viram processo de restituição ou complemento.
- **Valor pago ao empregado.** Desconto de pagamento a maior em folha futura tem limite legal
  (`PENDÊNCIA` — CLT art. 462, item **D4** da checklist).
- **Rescisão com TRCT entregue e homologada.**
- **Prazo-limite para reabertura de competência antiga:** `PENDÊNCIA` — é a **P6** do doc `01`, e é
  ela que define se um erro de 2025 ainda tem conserto pelo eSocial ou só por processo.

---

## 7. Riscos específicos do de-para, com o efeito prático

| # | Erro | Efeito imediato | Como aparece | Gravidade |
|---|---|---|---|---|
| 1 | Rubrica **remuneratória marcada `codIncCP = 00`** | Base de INSS a menor; empregado **e** patronal recolhidos a menor | R1 divergente, `valor_folha < valor_esocial`; `vrCpSeg > vrDescSeg` no S-5001 | **Bloqueante.** Contribuição a menor com multa e juros, e reflexo no benefício do empregado |
| 2 | Rubrica **indenizatória marcada `codIncCP = 11`** | Recolhimento a **maior** | R1 divergente ao contrário | Alta. Dinheiro perdido do cliente, e restituição é lenta |
| 3 | **Aviso prévio indenizado com `codIncFGTS = 11`** em vez de `21` | Base de FGTS vai para o balde mensal | R5 e R7 divergentes ao mesmo tempo, em sinais opostos | **Bloqueante.** Guia do FGTS errada e multa de 40% calculada sobre base errada |
| 4 | **13º adiantamento com `codIncCP = 12`** | Antecipa contribuição não devida na 1ª parcela | R2 divergente em novembro | Alta |
| 5 | **Verba indenizatória com `codIncIRRF = 11`** em vez de `74` | Rendimento tributável inflado; IRRF retido a maior do empregado | R10 e R13 divergentes; empregado reclama na declaração anual | Alta. **Erro que vira reclamatória**, não retificação |
| 6 | **Férias com `codIncIRRF = 11`** em vez de `13` | Férias tributadas junto com o salário do mês | R10 fecha, mas o S-5002 devolve a composição errada por `tpInfoIR` | Média-alta |
| 7 | **Dedução de previdência oficial ausente** (Nota A) | Base de IRRF do governo maior que a da folha | **R11 divergente** | Alta — e é o erro mais provável do catálogo, porque a classificação é assimétrica |
| 8 | **Dedução de plano de saúde ausente** (Nota B) | IRRF retido a maior | R11/R13 | Alta |
| 9 | **Faltas com `codIncCP = 00`** | A base não é reduzida: recolhe sobre salário cheio | R1 divergente a maior | Média-alta |
| 10 | **Vale-refeição PAT lançado como `tpRubr = 1`** em vez de `3` | Bruto do holerite inflado; se ainda vier com `codInc 11`, infla todas as bases | R1, R5 e R10 divergentes juntos | Alta |
| 11 | **`natRubr` fora de vigência** (ex.: `1020` para férias após 30/04/2023) | Rejeição do S-1010 — **ou pior**, aceitação com semântica antiga | Erro no envio ou R9 divergente | Média — mas silenciosa se não houver a trava de domínio versionado |
| 12 | **Uma rubrica genérica de IRRF** para mensal, férias, 13º e PLR | Impostos de regimes diferentes somados num código só | S-5002 devolve `CRMen` incompatível | Alta |
| 13 | **Alteração retroativa de incidência** sem reabertura | Ambiente Nacional reprocessa competência fechada; a guia paga deixa de bater | Divergência aparece **em competência já conciliada** — a pior de achar | **Bloqueante.** É a razão da trava T4 |
| 14 | **`codIncFGTS = 31` fora do eConsignado**, ou `natRubr 9253` sem `tpRubr 2` | Rejeição por regra do XSD (`V3`) | Erro no envio | Baixa — falha barulhenta, que é a boa |
| 15 | **Rubrica migrada de outro sistema, herdada sem conferência** | Todos os erros acima, de uma vez, no primeiro mês | Reconciliação inteira acesa | **Bloqueante.** É por isso que `origem = 'migracao_sistema_anterior'` precisa existir e forçar revisão linha a linha |

Os três que a auditoria nomeou aparecem aqui como **#1** (não incidente sobre INSS quando incide),
**#3** (base de FGTS errada) e **#5** (verba indenizatória tratada como remuneratória). Os outros
doze foram achados ao percorrer o leiaute e a tabela de rubricas — e **quase todos são invisíveis
sem a reconciliação**.

---

## 8. PENDÊNCIAS

Numeração `P09-x` para não colidir com as dos outros documentos. **Nenhuma pode virar código antes de
resolvida.**

| # | Pendência | O que falta | Onde fecha | Impacto |
|---|---|---|---|---|
| **P09-1** | **Qual snapshot do leiaute é o vigente** — a evidência desta sessão vem de um pacote XSD de 13/02/2026 e de um repositório com último commit em 10/03/2026, enquanto os demais documentos apontam a **NT 06/2026 rev. 09/04/2026**; o script do repositório ainda cita uma "NT 07/2026" que não aparece em lugar nenhum | Baixar o ZIP vigente e comparar `evtTabRubrica.xsd` campo a campo | **A4** + **A3** | **BLOQUEADOR** — se o domínio mudou, todo o catálogo muda |
| **P09-2** | **`maxLength` de `codRubr`, `ideTabRubr` e `dscRubr`** | Ler as facetas no XSD | **A4** | Alto — define o `CHECK` e a UI |
| **P09-3** | **Como a dedução de previdência oficial mensal chega ao IRRF** (Nota A da seção 3.4) — `codIncIRRF = 41` na própria rubrica de desconto, ou rubrica informativa dedutora separada | MOS, seção do S-1010 e do S-1210; Tabela 21 | **A1** + **A7** | **Alto** — erra o IRRF de toda a folha |
| **P09-4** | **Como a dedução de plano de saúde coletivo chega ao IRRF** — o código `67` da Tabela 21 não é usado por nenhuma rubrica da Tabela 54 | MOS, S-1210; Tabela 21 | **A1** | **Alto** |
| **P09-5** | **Desconto de adiantamento de salário: `codIncIRRF` 11 ou 9?** A própria Tabela 54 traz as duas para a mesma natureza | Tabela 54 oficial + MOS | **A1** + **A7** | Médio-alto |
| **P09-6** | **Incidência previdenciária do terço constitucional de férias gozadas** — a Tabela 54 traz `CP = 11`; a discussão judicial **não foi verificada e não é afirmada aqui** | MOS + norma vigente; jurisprudência com citação completa | **A1** + Bloco D | **Alto** — vale para toda a carteira |
| **P09-7** | **Conteúdo das regras `REGRA_TABRUBR_INCLUSAO`, `REGRA_TABGERAL_ALTERACAO_PERIODO_CONFLITANTE`, `REGRA_TABGERAL_INCLUSAO_PERIODO_CONFLITANTE`, `REGRA_VALIDA_CODINCCP_EXC_SEGURADO`, `REGRA_TAB_PERMITE_EXCLUSAO`** | Página de Regras do leiaute | **A2** | **Alto** — as travas T3/T4/T5 estão desenhadas por inferência |
| **P09-8** | **Domínio de `indApuracao`** nos totalizadores (assumido `1` mensal / `2` 13º) | Leiaute dos eventos S-50xx | **A2** | Médio |
| **P09-9** | **Prazo de envio do S-1010** | Campo "Prazo de envio" do evento | **A1** (é a P1 do doc `01`) | Médio |
| **P09-10** | **Tolerância oficial de arredondamento** — o `0,01` proposto é decisão de engenharia, não norma | MOS / Manual do FGTS Digital | **A1** + **C1** | Médio |
| **P09-11** | **Âncora da multa rescisória de 40%** (linha 20 do catálogo) — sem correspondente na Tabela 54 | MOS + Manual do FGTS Digital | **A1** + **C1** | Médio |
| **P09-12** | **Vigência das naturezas reeditadas em 01/01/2026** (`1016`, `1017`, `1800`, `1810`) — o CSV mostra a reedição, mas **não** a norma que a motivou | Tabelas do eSocial + Notas Orientativas de 2025/2026 | **A7** | Médio-alto — muda a classificação de VT e VR na virada |
| **P09-13** | **`indGuia` do S-1299 e o efeito de mais de um fechamento por competência sobre a reconciliação** | MOS | **A1** (é a P8 do doc `01`) | Médio — pode duplicar linha de reconciliação |
| **P09-14** | **Prazo-limite de reabertura (S-1298)** | MOS + Regras | **A1** (é a P6 do doc `01`) | **Alto** — define o que ainda tem conserto |
| **P09-15** | **Retificação de DCTFWeb com DARF já pago** | Manual DCTFWeb + Perguntas e Respostas | **B6** | **Alto** — caso mais frequente de suporte |
| **P09-16** | **Massa de teste oficial da folha** — a planilha citada no `CLAUDE.md` é fiscal e não serve; a reconciliação precisa de casos reais com totalizadores de retorno arquivados | Produção restrita + piloto da Fase 5 | — | **BLOQUEADOR do aceite** |

### Como fechar

**P09-1, P09-2, P09-7, P09-8** fecham com **um download**: o pacote XSD S-1.3 vigente e a página de
Regras (itens A2 e A4). **P09-3 a P09-6, P09-9 a P09-13** fecham com o **MOS** e o arquivo de
**Tabelas** (A1 e A7). São **quatro artefatos** para tirar este documento inteiro de proposta e
levá-lo a especificação.

**P09-16 não fecha com download nenhum.** Fecha rodando a Fase 5 — dois meses de folha em paralelo,
com os totalizadores arquivados. É o único item desta lista que custa tempo de calendário e não pode
ser antecipado.

---

> **O que este documento muda na régua do projeto.** Antes dele, o módulo tinha um teste de aceite
> implícito: "os holerites batem". Isso prova aritmética e nada mais. Depois dele, o aceite é a
> reconciliação — e ela é verificável, automatizável e roda todo mês, sozinha, para sempre. É a
> diferença entre um sistema que **parece** certo e um que **prova** que está.
>
> Insights Impulsionam.
