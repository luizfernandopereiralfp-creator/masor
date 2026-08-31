# eSocial — Eventos, Obrigatoriedade e Ciclo da Folha
### Documento base para o módulo de FOLHA DE PAGAMENTO do sistema Lior (G41 Inteligência Contábil)

**Data-base:** 30/08/2026 · **Autor:** pesquisa técnica DP/eSocial · **Status:** v1 — contém pendências abertas (ver seção final)

---

## Como este documento foi verificado

**Leia esta seção antes de usar qualquer número deste documento.**

### Limitação de ambiente (importante)

A sessão de pesquisa que produziu este documento **não teve acesso direto de download aos domínios `gov.br`,
`planalto.gov.br` e `in.gov.br`** — o proxy de saída da rede bloqueou todas as requisições HTTP a esses hosts
(retorno `403 CONNECT tunnel failed`). Portanto **nenhum PDF oficial (MOS, NT, NDE, leiaute) foi aberto e lido
integralmente nesta sessão.**

O que foi possível fazer:

1. **Localizar as URLs oficiais exatas** (títulos e endereços dos documentos no portal do eSocial) por
   mecanismo de busca restrito ao domínio `gov.br`.
2. **Ler trechos de texto das páginas oficiais** devolvidos pelo índice do mecanismo de busca.
3. **Verificar códigos, nomes e estrutura de eventos contra os XSDs oficiais da versão S-1.3**, por meio de
   *bindings* Python gerados automaticamente a partir do pacote oficial de esquemas
   (`http://www.esocial.gov.br/schema/evt/<evento>/v_S_01_03_00`). As anotações desses XSDs são texto literal
   do leiaute oficial e carregam o nome oficial de cada evento, as regras nomeadas e as condições de
   preenchimento.

### Níveis de verificação usados nas tabelas

| Nível | Significado | Confiabilidade |
|---|---|---|
| `V3` | Confirmado contra o **XSD oficial S-1.3** (anotação literal do leiaute, namespace `v_S_01_03_00`) | Alta — é o próprio artefato normativo técnico |
| `V2` | Trecho de **página oficial `gov.br`** devolvido pelo índice de busca; a URL é oficial, o PDF/HTML não foi aberto nesta sessão | Média — reconferir no documento antes de codar |
| `PENDÊNCIA` | **Não confirmado.** Não é afirmado neste documento | — |

### Regra aplicada

Nenhuma regra, prazo, versão ou valor foi escrito "de memória". Onde a fonte não pôde ser confirmada, consta
literalmente `PENDÊNCIA — não confirmado`, com indicação do que falta checar e onde. **Nenhum item marcado
como pendência pode virar código, validação ou mensagem de UI antes de ser confirmado em fonte primária.**

### Recomendação operacional para o time

Antes da primeira linha de código do módulo, alguém com acesso irrestrito à internet deve baixar e arquivar em
`/docs/folha/fontes/`:

- MOS S-1.3 consolidado (PDF)
- Leiautes S-1.3 (HTML + PDF)
- Pacote de Esquemas XSD S-1.3
- Manual de Orientação do Desenvolvedor (MOD)
- Tabelas do eSocial (arquivo de tabelas)

e registrar hash + data de download. Todo o restante deste documento passa então de `V2` para `V1`.

---

## 1. Versão do leiaute, MOS, NDE, leiautes e XSDs

### 1.1 Versão vigente

| Item | Conteúdo | Nível |
|---|---|---|
| Versão do leiaute vigente em 30/08/2026 | **S-1.3** | `V2` + `V3` |
| String de versão nos XSDs | `v_S_01_03_00` (ex.: `http://www.esocial.gov.br/schema/evt/evtRemun/v_S_01_03_00`) | `V3` |
| Consolidação técnica mais recente localizada | **NT S-1.3 nº 06/2026 (revisada em 09/04/2026)** | `V2` |
| MOS mais recente localizado | **MOS versão S-1.3, consolidado até a NO S-1.3 nº 11/2026 (retificado)** — publicado 26/05/2026, retificação 28/05/2026 | `V2` |
| Norma que aprovou a versão S-1.3 | Portaria Conjunta RFB/MPS/MTE nº 13, de 25/06/2024 | `V2` |
| Próxima versão anunciada (S-1.4 ou equivalente) | **PENDÊNCIA — não confirmado.** Não foi localizada notícia, NDE ou minuta anunciando versão posterior à S-1.3. Ausência de resultado **não** é prova de inexistência: conferir a página de Documentação Técnica e a coleção de notícias | — |

> Observação de engenharia: a versão S-1.3 está em produção desde 2024 e vem sendo **evoluída por Notas
> Técnicas e Notas Orientativas dentro da própria versão** (NT 01/2024 → 02/2024 → 03/2025 → 04/2025 →
> 06/2026 …). Para o Lior, isso significa que o versionamento do módulo deve rastrear **`versão + NT`**,
> não apenas `S-1.3`. Um XSD "S-1.3" baixado em 2024 não é o mesmo de 2026.

### 1.2 Onde ficam os artefatos (URLs oficiais)

| Artefato | URL | Nível |
|---|---|---|
| Documentação Técnica (raiz — ponto de entrada) | `https://www.gov.br/esocial/pt-br/documentacao-tecnica` | `V2` |
| Manuais (índice: MOS, MOD, NT, NDE, NO, XSD) | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais` | `V2` |
| Leiautes S-1.3 (cons. até NT 06/2026 rev. 09/04/2026) — HTML | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026-rev-09-04-2026/index.html` | `V2` |
| Leiautes S-1.3 — página de **Regras** | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026-rev-09-04-2026/regras.html` | `V2` |
| Leiautes S-1.3 — página de **Tabelas** | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026/tabelas.html` | `V2` |
| Leiautes S-1.3 — URL "corrente" (sem sufixo de NT) | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-v-1.3/index.html` | `V2` |
| **MOS** S-1.3 cons. até NO 11/2026 (retificada) | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-11-2026-retificada.pdf` | `V2` |
| MOS S-1.3 cons. até NO 10/2026 (versão anterior) | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-10-2026.pdf` | `V2` |
| **NT S-1.3 nº 06/2026 (revisada)** | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/nota-tecnica-s-1-3-06-2026-rev.pdf` | `V2` |
| **NO S-1.3 nº 11/2026 (retificada)** | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/nota-orientativa-s-1-3-11-2026-retificada.pdf` | `V2` |
| **Manual de Orientação do Desenvolvedor (MOD) v1.15 — abril/2025** | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/manualorientacaodesenvolvedoresocialv1-15.pdf` | `V2` |
| Versões anteriores da documentação técnica | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/versoes-anteriores-da-documentacao-tecnica` | `V2` |
| Versões do Sistema | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/versoes-do-sistema` | `V2` |
| Legislação do eSocial (empresas) | `https://www.gov.br/esocial/pt-br/centrais-de-conteudo/legislacao/empresas` | `V2` |
| Administração de Tabelas (consulta on-line) | `https://frontend.esocial.gov.br/adm/` | `V2` |

### 1.3 XSDs — download

O item listado na página de Documentação Técnica é rotulado
**"Esquemas XSD eSocial — Leiautes v. S-1.3 (até NT 06/2026) — CNPJ alfanumérico"** (`V2`).

O padrão de nome de arquivo histórico dos pacotes é `AAAA-MM-DD_esquemas_xsd_v_s_01_0X_00.zip` sob
`https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/`, confirmado por versões anteriores
(`2023-08-17_esquemas_xsd_v_s_01_02_00.zip`, `2021-08-31_esquemas_xsd_v_s_01_00_00_nt03.zip`) — `V2`.

> **PENDÊNCIA — não confirmado:** o **nome exato do arquivo ZIP do pacote XSD S-1.3 vigente**. Uma referência
> de terceiros (script `download_xsds.sh` do projeto open source `erpbrasil/esociallib`) aponta para
> `.../manuais/2026-02-13_esquemas_xsd_v_s_01_03_00.zip`, mas essa URL **não foi validada contra o portal**
> e é anterior à NT 06/2026 (rev. 09/04/2026). **Baixar sempre pelo link vivo da página de Documentação
> Técnica, nunca por URL fixa em código.**

> Nota relevante para o schema: o rótulo do pacote menciona **"CNPJ alfanumérico"**. Isso implica que os
> campos `nrInsc` do leiaute deixam de ser puramente numéricos. **Consequência direta para o Lior: `nrInsc`
> e todos os campos de inscrição devem ser `text`/`varchar` no Postgres, com validação de dígito
> verificador alfanumérico — nunca `bigint`.** A regra completa do CNPJ alfanumérico é `PENDÊNCIA`
> (conferir na NT 06/2026 e no MOS).

**Fontes da seção 1** (acesso em 30/08/2026):
- `https://www.gov.br/esocial/pt-br/documentacao-tecnica`
- `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais`
- `https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026-rev-09-04-2026/index.html`
- `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-11-2026-retificada.pdf`
- `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/nota-tecnica-s-1-3-06-2026-rev.pdf`
- XSDs oficiais S-1.3 (namespaces `v_S_01_03_00`), via *bindings* gerados em `github.com/erpbrasil/esociallib`

---

## 2. Grupos de obrigatoriedade e faseamento

### 2.1 Definição dos grupos

| Grupo | Quem é | Nível |
|---|---|---|
| **1** | Entidades empresariais com faturamento anual **superior a R$ 78 milhões** | `V2` |
| **2** | Entidades empresariais com faturamento (ano-base 2016) **até R$ 78.000.000,00** e **não** optantes pelo Simples Nacional | `V2` |
| **3** | Empregadores **optantes pelo Simples Nacional**, entidades sem fins lucrativos, e **empregadores pessoa física** (exceto doméstico) | `V2` |
| **4** | **Órgãos públicos** e **organizações internacionais** | `V2` |

> O empregador **doméstico** entrou no eSocial fora desse escalonamento (módulo próprio, desde 2015).
> **PENDÊNCIA — não confirmado:** data e norma exatas do início da obrigatoriedade do doméstico.

### 2.2 Fases (mesma lógica para todos os grupos)

| Fase | Conteúdo | Nível |
|---|---|---|
| 1ª | Eventos de **tabela** (S-1000 a S-1080 na numeração original) | `V2` |
| 2ª | Eventos **não periódicos** (S-2190 a S-2420), **exceto** SST | `V2` |
| 3ª | Eventos **periódicos** (S-1200 a S-1299) — folha de pagamento | `V2` |
| 4ª | Eventos de **SST**: S-2210, S-2220 e S-2240 | `V2` |

### 2.3 Datas confirmadas

| Grupo | 1ª fase | 2ª fase | 3ª fase (folha) | 4ª fase (SST) | Nível |
|---|---|---|---|---|---|
| 1 | 08/01/2018 | 01/03/2018 | 01/05/2018 | **13/10/2021** | `V2` |
| 2 | PENDÊNCIA | PENDÊNCIA | PENDÊNCIA | **10/01/2022** | `V2` (só SST) |
| 3 — PJ (Simples / s/ fins lucrativos) | 10/01/2019 | 10/04/2019 | **10/05/2021** | **10/01/2022** | `V2` |
| 3 — pessoa física | 10/01/2019 | 10/04/2019 | **19/07/2021** | PENDÊNCIA | `V2` (exceto SST) |
| 4 — órgãos públicos / org. internacionais | PENDÊNCIA | PENDÊNCIA | PENDÊNCIA (adiada) | **01/01/2023** | `V2` (só SST) |

Normas do cronograma citadas oficialmente: **Portaria Conjunta SEPRT/RFB/ME nº 71, de 29/06/2021** e
**Portaria Conjunta MTP/RFB/ME nº 2, de 19/04/2022** (`V2`).

### 2.4 O que ainda estava em implantação/evolução em 2026

| Frente | Situação | Nível |
|---|---|---|
| **Processos trabalhistas (S-2500 / S-2501)** | **Concluído** — obrigatório desde **01/10/2023** para decisões transitadas em julgado, acordos judiciais homologados e decisões homologatórias de cálculo **a partir de 1º/10/2023** | `V2` |
| **SST (S-2210 / S-2220 / S-2240)** | **Concluído** para Grupos 1–4 (última entrada: Grupo 4 em 01/01/2023) | `V2` |
| Recolhimento de contribuições via **eSocial/DCTFWeb** | Em curso em 2026 (substituição de guias) | `V2` |
| **Consignado / FGTS Digital** | A partir da competência **02/2026**, valores de consignado retidos e vencidos passam a ser pagos via **FGTS Digital** | `V2` |
| Novas alíquotas aplicadas automaticamente a partir da competência **04/2026** | Sem ação do empregador | `V2` |
| Ajustes **SESI/SENAI** (convênio de arrecadação direta) | Tratados na **NO S-1.3 nº 09/2026** | `V2` |
| **Certificado digital — novo padrão de segurança** | Produção Restrita em **12/01/2026**; Produção em **24/06/2026**. Não impacta os módulos web | `V2` |
| Nada em implantação restante para folha "empresa comum" | Não foi identificada fase pendente para o Grupo 3 PJ | `V2` (por ausência) |

> **Risco de projeto:** a troca de padrão de certificado em produção (24/06/2026) é exatamente o tipo de
> mudança que quebra integração TLS/assinatura. O módulo do Lior deve tratar o certificado A1 como
> configuração versionada e ter teste de *handshake* automatizado contra a Produção Restrita.
> Detalhes técnicos do novo padrão: **PENDÊNCIA** (ler a notícia e o MOD).

**Fontes da seção 2** (acesso em 30/08/2026):
- `https://www.gov.br/esocial/pt-br/acesso-ao-sistema/cronograma-de-implantacao`
- `https://www.gov.br/esocial/pt-br/noticias/comeca-hoje-a-obrigatoriedade-dos-eventos-de-saude-e-seguranca-no-trabalho-sst-para-as-empresas-do-grupo-1`
- `https://www.gov.br/esocial/pt-br/noticias/adiado-o-inicio-da-fase-de-envio-de-folhas-de-pagamento-para-orgaos-publicos-e-organizacoes-internacionais`
- `https://www.gov.br/esocial/pt-br/noticias/entenda-o-escalonamento-para-eventos-periodicos-do-grupo-3-de-obrigados-ao-esocial`
- `https://www.gov.br/esocial/pt-br/noticias/processos-trabalhistas-veja-o-prazo-para-envio-dos-eventos-s-2500-e-s-2501`
- `https://www.gov.br/esocial/pt-br/noticias/atualizacao-de-certificado-do-esocial-para-um-novo-padrao-de-seguranca`
- `https://www.gov.br/esocial/pt-br/noticias/prorrogacao-da-atualizacao-de-certificado-do-esocial-para-um-novo-padrao-de-seguranca`

---

## 3. Tabela completa de eventos — leiaute S-1.3

**Base de verificação:** os 50 eventos abaixo foram extraídos dos **XSDs oficiais da versão S-1.3**
(namespace `http://www.esocial.gov.br/schema/evt/<raiz>/v_S_01_03_00`). Código, nome oficial e elemento-raiz
são `V3`. **Os prazos são a parte fraca desta tabela** — ver coluna "Prazo" e a seção de pendências.

Legenda de tipo: `T` tabela · `NP` não periódico · `P` periódico · `R` retorno/totalizador · `X` exclusão

### 3.1 Eventos de tabela

| Código | Elemento-raiz | Nome oficial (XSD) | Tipo | Obrigatoriedade | Prazo de envio | Depende de |
|---|---|---|---|---|---|---|
| **S-1000** | `evtInfoEmpregador` | Informações do Empregador/Contribuinte/Órgão Público | T | **Obrigatório — é o primeiro evento de todos** | PENDÊNCIA | — (raiz) |
| **S-1005** | `evtTabEstab` | Tabela de Estabelecimentos, Obras ou Unidades de Órgãos Públicos | T | Obrigatório | PENDÊNCIA | S-1000 |
| **S-1010** | `evtTabRubrica` | Tabela de Rubricas | T | Obrigatório | PENDÊNCIA | S-1000 |
| **S-1020** | `evtTabLotacao` | Tabela de Lotações Tributárias | T | Obrigatório (condições em PENDÊNCIA) | PENDÊNCIA | S-1000 |
| **S-1070** | `evtTabProcesso` | Tabela de Processos Administrativos/Judiciais | T | Condicional — só se houver processo que altere tributação/FGTS | PENDÊNCIA | S-1000 |

> **Eventos de tabela extintos no leiaute simplificado:** `S-1030`, `S-1035`, `S-1040`, `S-1050`, `S-1060`,
> `S-1080` **não existem** no pacote XSD S-1.3. `V3` por ausência no pacote de esquemas; **confirmar a
> supressão formal no MOS/NDE do eSocial Simplificado antes de documentar para cliente** (`PENDÊNCIA` de
> confirmação normativa).

### 3.2 Eventos periódicos

| Código | Elemento-raiz | Nome oficial (XSD) | Tipo | Obrigatoriedade | Prazo de envio | Depende de |
|---|---|---|---|---|---|---|
| **S-1200** | `evtRemun` | Remuneração de Trabalhador vinculado ao Regime Geral de Previdência Social | P | **Obrigatório** (RGPS) | **Até o dia 15 do mês seguinte** ao da competência; antecipa para o dia útil imediatamente anterior se não houver expediente bancário (`V2`) | S-1000, S-1005, S-1010, S-1020, S-2200/S-2300 |
| **S-1202** | `evtRmnRPPS` | Remuneração de Servidor vinculado ao Regime Próprio de Previdência Social | P | Só entes públicos (RPPS) | idem S-1200 (`V2`) | S-1000, S-1005, S-1010, S-1020 |
| **S-1207** | `evtBenPrRP` | Benefícios — Entes Públicos | P | Só entes públicos | idem S-1200 (`V2`) | S-1000, S-2400/S-2410 |
| **S-1210** | `evtPgtos` | Pagamentos de Rendimentos do Trabalho | P | **Obrigatório** (IRRF) | PENDÊNCIA — o MOS trata o S-1210 em prazo próprio, ligado ao mês do **pagamento**, não ao da competência | S-1200 / S-2299 / S-2399 / S-1202 |
| **S-1260** | `evtComProd` | Comercialização da Produção Rural Pessoa Física | P | Condicional — produtor rural PF / segurado especial | idem S-1200 (`V2`) | S-1000, S-1005 |
| **S-1270** | `evtContratAvNP` | Contratação de Trabalhadores Avulsos Não Portuários | P | Condicional | idem S-1200 (`V2`) | S-1000, S-1005 |
| **S-1280** | `evtInfoComplPer` | Informações Complementares aos Eventos Periódicos | P | Condicional — desoneração da folha; Simples com atividades concomitantes | idem S-1200 (`V2`) | S-1000 |
| **S-1298** | `evtReabreEvPer` | Reabertura dos Eventos Periódicos | P | Condicional — só após S-1299 do período | Sem prazo fixo; libera o período fechado | S-1299 do mesmo período |
| **S-1299** | `evtFechaEvPer` | Fechamento dos Eventos Periódicos | P | **Obrigatório — todo mês, mesmo sem movimento** | **Até o dia 15 do mês seguinte** (`V2`) | Todos os periódicos do período |

Eventos periódicos **descontinuados / não presentes no XSD S-1.3**:

| Código | Situação | Nível |
|---|---|---|
| `S-1250` — Aquisição de Produção Rural | Anotação literal do XSD do S-5011: *"Evento de origem: S-1250 (existente até a versão 2.5 do leiaute)"*. **Não existe no S-1.3**; o S-1299 mantém apenas a flag `indExcApur1250` para expurgo de apurações antigas | `V3` |
| `S-1300` — Contribuição Sindical Patronal | **Citado** no XSD do S-3000 como tipo de evento periódico excluível (`tpEvento` = S-1200, S-1202, S-1207, S-1280, **S-1300**), porém **sem XSD próprio** no pacote analisado. **PENDÊNCIA — não confirmado** se ainda é enviável ou se a citação é apenas legado para exclusão de eventos antigos | parcial |

### 3.3 Eventos não periódicos

| Código | Elemento-raiz | Nome oficial (XSD) | Tipo | Obrigatoriedade | Prazo de envio | Depende de |
|---|---|---|---|---|---|---|
| **S-2190** | `evtAdmPrelim` | Registro Preliminar de Trabalhador | NP | **Opcional** | Até o **fim do dia imediatamente anterior** ao início da prestação de serviços (`V2`) | S-1000 |
| **S-2200** | `evtAdmissao` | Cadastramento Inicial do Vínculo e Admissão/Ingresso de Trabalhador | NP | **Obrigatório** | Até o **dia imediatamente anterior ao início da prestação de serviços**. **Se houve S-2190**: até o **dia 15 do mês seguinte** ao da ocorrência, ou antes de transmitir qualquer outro evento não periódico daquele trabalhador (`V2`) | S-1000, S-1005 |
| **S-2205** | `evtAltCadastral` | Alteração de Dados Cadastrais do Trabalhador | NP | Condicional | PENDÊNCIA | S-2200 / S-2300 |
| **S-2206** | `evtAltContratual` | Alteração de Contrato de Trabalho/Relação Estatutária | NP | Condicional | PENDÊNCIA | S-2200 |
| **S-2210** | `evtCAT` | Comunicação de Acidente de Trabalho | NP (SST) | Obrigatório na ocorrência | PENDÊNCIA — conferir MOS e Lei 8.213/1991 (prazo diferenciado em caso de óbito) | S-2200 / S-2300 |
| **S-2220** | `evtMonit` | Monitoramento da Saúde do Trabalhador | NP (SST) | Obrigatório | PENDÊNCIA — prazo **alterado** pela Nota Orientativa nº 04/2021 (`V2` quanto à existência da alteração; valor não confirmado) | S-2200 / S-2300 |
| **S-2221** | `evtToxic` | Exame Toxicológico do Motorista Profissional Empregado | NP | Condicional — motorista profissional | PENDÊNCIA | S-2200 |
| **S-2230** | `evtAfastTemp` | Afastamento Temporário | NP | Obrigatório na ocorrência | PENDÊNCIA | S-2200 / S-2300 |
| **S-2231** | `evtCessao` | Cessão/Exercício em Outro Órgão | NP | Só entes públicos | PENDÊNCIA | S-2200 |
| **S-2240** | `evtExpRisco` | Condições Ambientais do Trabalho — Agentes Nocivos | NP (SST) | Obrigatório | PENDÊNCIA — prazo **alterado** pela NO nº 04/2021 (`V2` quanto à alteração) | S-2200 / S-2300 |
| **S-2298** | `evtReintegr` | Reintegração/Outros Provimentos | NP | Condicional | PENDÊNCIA | S-2299 (exige desligamento anterior) |
| **S-2299** | `evtDeslig` | Desligamento | NP | **Obrigatório** | **Até o 10º dia seguinte à data do desligamento** (`V2`) | S-2200 |
| **S-2300** | `evtTSVInicio` | Trabalhador Sem Vínculo de Emprego/Estatutário — Início | NP | Condicional — TSVE (autônomo, dirigente sindical, estagiário, cooperado etc.) | PENDÊNCIA | S-1000, S-1005 |
| **S-2306** | `evtTSVAltContr` | TSVE — Alteração Contratual | NP | Condicional | PENDÊNCIA | S-2300 |
| **S-2399** | `evtTSVTermino` | TSVE — Término | NP | Condicional | PENDÊNCIA | S-2300 |
| **S-2400** | `evtCdBenefIn` | Cadastro de Beneficiário — Entes Públicos — Início | NP | Só entes públicos | PENDÊNCIA | S-1000 |
| **S-2405** | `evtCdBenefAlt` | Cadastro de Beneficiário — Entes Públicos — Alteração | NP | Só entes públicos | PENDÊNCIA | S-2400 |
| **S-2410** | `evtCdBenIn` | Cadastro de Benefício — Entes Públicos — Início | NP | Só entes públicos | PENDÊNCIA | S-2400 |
| **S-2416** | `evtCdBenAlt` | Cadastro de Benefício — Entes Públicos — Alteração | NP | Só entes públicos | PENDÊNCIA | S-2410 |
| **S-2418** | `evtReativBen` | Reativação de Benefício — Entes Públicos | NP | Só entes públicos | PENDÊNCIA | S-2420 (exige término anterior) |
| **S-2420** | `evtCdBenTerm` | Cadastro de Benefício — Entes Públicos — Término | NP | Só entes públicos | PENDÊNCIA | S-2410 |
| **S-2500** | `evtProcTrab` | Processo Trabalhista | NP | Obrigatório quando houver processo/acordo | **Até o dia 15 do mês seguinte**; se cair em feriado, até o 1º dia útil seguinte (`V2`) | S-1000 |
| **S-2501** | `evtContProc` | Informações de Tributos Decorrentes de Processo Trabalhista | NP | Obrigatório quando houver tributos a recolher | **Até o dia 15 do mês seguinte** (`V2`) | S-2500 |
| **S-2555** | `evtConsolidContProc` | Solicitação de Consolidação das Informações de Tributos Decorrentes de Processo Trabalhista | NP | Condicional | PENDÊNCIA | S-2501 (regra `REGRA_EXISTE_2501`) |
| **S-8200** | `evtAnotJud` | Anotação Judicial do Vínculo | NP | Enviado pelo **Judiciário** (`procEmi` = 8) | PENDÊNCIA | S-1000 |
| **S-8299** | `evtBaixa` | Baixa Judicial do Vínculo | NP | Enviado pelo **Judiciário** | PENDÊNCIA | S-8200 / S-2200 |

### 3.4 Eventos de exclusão

| Código | Elemento-raiz | Nome oficial (XSD) | Tipo | Uso |
|---|---|---|---|---|
| **S-3000** | `evtExclusao` | Exclusão de Eventos | X | Torna sem efeito qualquer evento periódico ou não periódico enviado indevidamente |
| **S-3500** | `evtExcProcTrab` | Exclusão de Eventos — Processo Trabalhista | X | Torna sem efeito um **S-2500** ou **S-2501** enviado indevidamente |

### 3.5 Eventos de retorno / totalizadores (gerados pelo Ambiente Nacional — o Lior **consome**, não envia)

| Código | Elemento-raiz | Nome oficial (XSD) | Granularidade | Gerado a partir de |
|---|---|---|---|---|
| **S-5001** | `evtBasesTrab` | Informações das Contribuições Sociais por Trabalhador | por trabalhador | S-1200 / S-2299 / S-2399 |
| **S-5002** | `evtIrrfBenef` | Imposto de Renda Retido na Fonte por Trabalhador | por trabalhador | S-1210 |
| **S-5003** | `evtBasesFGTS` | Informações do FGTS por Trabalhador | por trabalhador | S-1200 / S-2299 / S-2399 |
| **S-5011** | `evtCS` | Informações das Contribuições Sociais Consolidadas por Contribuinte | por empregador | **S-1299 (fechamento)** |
| **S-5012** | `evtIrrf` | Imposto de Renda Retido na Fonte Consolidado por Contribuinte | por empregador | **S-1299 (fechamento)** |
| **S-5013** | `evtFGTS` | Informações do FGTS Consolidadas por Contribuinte | por empregador | **S-1299 (fechamento)** |
| **S-5501** | `evtTribProcTrab` | Informações Consolidadas de Tributos Decorrentes de Processo Trabalhista | por processo/empregador | S-2501 / S-2555 |
| **S-5503** | `evtFGTSProcTrab` | Informações do FGTS por Trabalhador em Processo Trabalhista | por trabalhador | S-2500 / S-2501 |

> **Armadilha comum (verificada `V3`):** muitas tabelas de mercado — inclusive um mapa de eventos do projeto
> open source `erpbrasil/esociallib` — trocam **S-5002 ↔ S-5012** e **S-2420 ↔ S-2231**. O correto, conforme
> o XSD oficial: `evtIrrfBenef` = **S-5002** (por trabalhador), `evtIrrf` = **S-5012** (consolidado);
> `evtCessao` = **S-2231**, `evtCdBenTerm` = **S-2420**. **Não copiar mapa de terceiros — gerar o mapa a
> partir do XSD.**

**Fontes da seção 3** (acesso em 30/08/2026):
- XSDs oficiais S-1.3 — namespaces `http://www.esocial.gov.br/schema/evt/<raiz>/v_S_01_03_00`, anotações literais do leiaute
- `https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026-rev-09-04-2026/index.html`
- `https://www.gov.br/esocial/pt-br/canais_atendimento/formularios/empresas/s-2190-admissao-de-trabalhador-registro-preliminar`
- `https://www.gov.br/esocial/pt-br/canais_atendimento/formularios/empresas/s-2299-desligamento`
- `https://www.gov.br/esocial/pt-br/canais_atendimento/formularios/empresas/Totalizacao_CP_IR`
- `https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/escola/e-social-aprenda-ponto-a-ponto/eventos-totalizadores`
- `https://www.gov.br/esocial/pt-br/noticias/nota-orientativa-04-2021-traz-alteracoes-no-prazo-para-envio-dos-eventos-s-2220-e-s-2240`
- `https://www.gov.br/esocial/pt-br/noticias/processos-trabalhistas-veja-o-prazo-para-envio-dos-eventos-s-2500-e-s-2501`

---

## 4. MVP — subconjunto mínimo para operar folha mensal

Cenário-alvo do MVP: **empresa comum brasileira** — pessoa jurídica, RGPS, empregados CLT, sem servidores
estatutários, sem produção rural, sem trabalhadores avulsos, sem benefícios previdenciários próprios.

### 4.1 Escopo do MVP (15 eventos de envio + 6 de retorno consumidos)

| # | Evento | Papel no MVP | Frequência |
|---|---|---|---|
| 1 | **S-1000** | Cadastro do empregador. Sem ele, **nada** é aceito (`REGRA_EXISTE_INFO_EMPREGADOR` está em todos os eventos) | uma vez + alterações |
| 2 | **S-1005** | Matriz, filiais, obras. CNAE preponderante, RAT/FAP, aprendiz, PcD | uma vez + alterações |
| 3 | **S-1010** | **Tabela de rubricas** — o coração da folha. Cada verba precisa de natureza, incidência CP, incidência IRRF, incidência FGTS | uma vez + manutenção |
| 4 | **S-1020** | Lotações tributárias (FPAS/terceiros) | uma vez + alterações |
| 5 | **S-1070** | Só se houver processo administrativo/judicial suspendendo exigibilidade | condicional |
| 6 | **S-2200** | **Admissão** | por admissão |
| 7 | **S-2205** | Alteração cadastral (dados pessoais) | eventual |
| 8 | **S-2206** | Alteração contratual (cargo, salário, jornada) | eventual |
| 9 | **S-2230** | **Afastamento — inclui FÉRIAS** (ver 4.3) | por ocorrência |
| 10 | **S-2299** | **Desligamento** (rescisão com verbas) | por desligamento |
| 11 | **S-1200** | **Remuneração mensal** (a folha propriamente dita) | mensal |
| 12 | **S-1210** | **Pagamentos** (base do IRRF) | mensal |
| 13 | **S-1299** | **Fechamento** — sem ele não há apuração nem guia | mensal |
| 14 | **S-1298** | Reabertura (correção pós-fechamento) | sob demanda |
| 15 | **S-3000** | Exclusão de evento enviado indevidamente | sob demanda |
| R1–R6 | **S-5001, S-5002, S-5003, S-5011, S-5012, S-5013** | Retornos a **consumir e persistir** — são a prova fiscal do que o governo apurou | automático |

### 4.2 Fora do MVP (escopo estendido)

| Bloco | Eventos | Por que fica fora | Quando entra |
|---|---|---|---|
| **SST** | S-2210 (CAT), S-2220 (ASO/monitoramento), S-2240 (agentes nocivos) | Domínio de medicina e segurança do trabalho, não de folha. Depende de PGR/PCMSO, laudos, eSocial + LTCAT. Modelo de dados próprio | Fase 2 — vender como módulo separado |
| **Processo trabalhista** | S-2500, S-2501, S-2555, S-3500, retornos S-5501/S-5503 | Fluxo jurídico, não folha. Alta complexidade de cálculo retroativo por competência | Fase 3 |
| **Motorista profissional** | S-2221 | Nicho | sob demanda |
| **TSVE** | S-2300, S-2306, S-2399 | Autônomos, estagiários, cooperados, dirigentes sindicais. **Atenção: estagiário é comum em PME — avaliar antecipar** | Fase 1.5 |
| **Entes públicos / RPPS** | S-1202, S-1207, S-2231, S-2400, S-2405, S-2410, S-2416, S-2418, S-2420 | Grupo 4. Fora do ICP da G41 | não previsto |
| **Rural / avulsos** | S-1260, S-1270 | Nicho | sob demanda |
| **Desoneração / Simples concomitante** | S-1280 | Condicional; entra quando houver cliente com desoneração | Fase 1.5 |
| **Judiciário** | S-8200, S-8299 | Empregador **não envia** — apenas recebe efeito no RET | consumir, nunca gerar |

### 4.3 Onde estão as férias (ponto que confunde todo mundo)

**Não existe evento "S-2xxx Férias" no eSocial.** As férias aparecem em três lugares:

| Aspecto | Onde entra | Verificação |
|---|---|---|
| **Gozo** | **S-2230** com `codMotAfast = [15]` (férias), com o grupo `perAquis` (período aquisitivo: `dtInicio`/`dtFim`) obrigatório para as categorias de empregado com `tpRegTrab = 1` e `dtIniAfast >= 2021-07-19` | `V3` |
| **Programação antecipada** | O S-2230 de férias admite `dtIniAfast` **até 60 dias posterior à data atual** — é o único motivo, junto com o `[18]`, que aceita data futura (o `[18]` aceita até 120 dias) | `V3` |
| **Remuneração** | Rubricas de férias + 1/3 constitucional no **S-1200** (competência) e no **S-1210** (pagamento), classificadas na **S-1010** | `V3` (dependência), naturezas específicas em PENDÊNCIA |

> Consequência de arquitetura para o Lior: a entidade `ferias` do domínio **não** mapeia 1:1 para um evento.
> Ela gera **um S-2230 (com início e fim)** e **rubricas em S-1200/S-1210**. O `codMotAfast = 15` deve ser
> constante nomeada, não literal espalhado no código.

**Fontes da seção 4** (acesso em 30/08/2026): XSDs oficiais S-1.3 (`evtAfastTemp`, `evtRemun`, `evtTabRubrica`,
`evtExclusao`, `evtFechaEvPer`) — namespaces `v_S_01_03_00`.

---

## 5. Ordem de envio, dependências e o ciclo mensal

### 5.1 Dependências duras (verificadas nas regras nomeadas dos XSDs)

Toda a estrutura de dependência é observável nas regras que cada evento carrega no XSD (`V3`):

| Regra no XSD | O que impõe | Aparece em |
|---|---|---|
| `REGRA_EXISTE_INFO_EMPREGADOR` | Exige **S-1000** válido | **Todos** os eventos de envio |
| `REGRA_VALIDA_EMPREGADOR` | Empregador ativo/compatível na competência | S-1000, S-1200, S-1299, S-2299, S-2500, S-3000 … |
| `REGRA_EXISTE_VINCULO` / `REGRA_EXISTE_EVENTO_TSV_INICIO` | Exige **S-2200** (ou **S-2300**) prévio | S-2220, S-2221 |
| `REGRA_VINCULO_ATIVO_NA_DTEVENTO` | Vínculo ativo na data do evento | S-2206, S-2210, S-2230, S-2231, S-2299, S-8299 |
| `REGRA_EXISTE_EVENTO_DESLIGAMENTO` | Exige **S-2299** prévio | S-2298 (reintegração) |
| `REGRA_EXISTE_EVENTO_BENEFICIO_TERMINO` | Exige **S-2420** prévio | S-2418 |
| `REGRA_EXISTE_2501` | Exige **S-2501** prévio | S-2555 |
| `REGRA_ENVIO_PROC_FECHAMENTO` | **Bloqueia envio enquanto o fechamento está em processamento** | **Todos** |
| `REGRA_VALIDA_FECHAMENTO_FOPAG` | Consistência do conjunto no fechamento | S-1299 |
| `REGRA_REABERTURA_VALIDA_PERIODO_APURACAO` | Só reabre período efetivamente fechado | S-1298 |
| `REGRA_REGISTRO_PRELIMINAR` | Liga S-2190 → S-2200/S-2300 | S-2200, S-2300 |
| `REGRA_REMUN_JA_EXISTE_DESLIGAMENTO` | Impede S-1200 após desligamento na competência | S-1200, S-1202 |
| `REGRA_DESLIG_EXISTE_EVENTO_POSTERIOR` | Impede desligamento com eventos posteriores pendentes | S-2299, S-8299 |

Além disso, o XSD do **S-1200** referencia explicitamente rubricas de **S-1010** (`codRubr`, `codIncCP`,
`natRubr`) e o grupo `ideEstabLot` com `codLotacao` de **S-1020** sobre estabelecimento de **S-1005** (`V3`).

### 5.2 Ordem de implantação de um cliente novo (carga inicial)

```
1. S-1000  Informações do empregador                (obrigatório, primeiro de tudo)
2. S-1005  Estabelecimentos                          (matriz + filiais + obras)
3. S-1010  Rubricas                                  (todas as verbas da folha)
4. S-1020  Lotações tributárias
5. S-1070  Processos administrativos/judiciais       (só se houver)
   ── a partir daqui, trabalhadores ──
6. S-2200  Admissão de cada trabalhador ativo        (ou S-2190 antes, se admissão de última hora)
7. S-2230  Afastamentos em curso na data de corte
   ── a partir daqui, folha ──
8. S-1200 → S-1210 → S-1299
```

> **Sequenciamento é a maior fonte de retrabalho.** Tentar cadastrar trabalhador antes de fechar a tabela de
> rubricas e lotações gera rejeição em massa. O Lior deve **bloquear na UI** o avanço de etapa enquanto a
> anterior não tiver recibo válido — não deixar o usuário "tentar e ver".

### 5.3 Ciclo mensal completo

```
┌─ Competência AAAA-MM ────────────────────────────────────────────────────┐
│                                                                          │
│  (1) Movimento do mês — eventos NÃO periódicos, ao longo do mês          │
│      S-2200 admissões   ·  S-2206 alterações  ·  S-2230 afastamentos     │
│      S-2299 desligamentos (prazo próprio: 10 dias)                       │
│                                                                          │
│  (2) Folha — eventos PERIÓDICOS                                          │
│      S-1200 remuneração por trabalhador                                  │
│      S-1210 pagamentos efetuados                                         │
│      S-1280 informações complementares (se aplicável)                    │
│      → retornos por trabalhador: S-5001 (CP), S-5002 (IRRF), S-5003 (FGTS)│
│                                                                          │
│  (3) FECHAMENTO                                                          │
│      S-1299  evtFechaEvPer                                               │
│        infoFech: evtRemun / evtPgtos / evtComProd /                      │
│                  evtContratAvNP / evtInfoComplPer  = S ou N              │
│        campos S-1.3: indGuia · transDCTFWeb · naoValid · indExcApur1250  │
│      → o Ambiente Nacional processa e devolve os CONSOLIDADOS:           │
│        S-5011 (contribuições sociais) · S-5012 (IRRF) · S-5013 (FGTS)    │
│                                                                          │
│  (4) Consumo dos totalizadores → DCTFWeb / FGTS Digital                  │
│                                                                          │
│  (5) Precisa corrigir depois do fechamento?                              │
│      S-1298 reabre → corrige (retificação ou S-3000) → S-1299 refecha    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

Pontos verificados (`V3`) sobre o **S-1299**:

- O grupo `infoFech` declara, com `S`/`N`, se existem: `evtRemun` (S-1200/S-1202/S-1207/S-2299/S-2399),
  `evtPgtos` (S-1210), `evtComProd` (S-1260), `evtContratAvNP` (S-1270), `evtInfoComplPer` (S-1280).
  **Se declarar `S`, o evento correspondente tem de existir; se declarar `N`, não pode existir.** É uma
  checagem cruzada — o Lior precisa derivar esses flags do próprio estado, nunca deixar o usuário digitar.
- `indGuia` (S-1.3) segmenta o fechamento por guia — a validação de existência dos eventos é feita
  "considerando o campo `indGuia`". Isso permite **mais de um fechamento por competência**.
  Semântica completa de `indGuia`: **PENDÊNCIA**.
- Existem ainda os campos `transDCTFWeb`, `naoValid` e `indExcApur1250` no `infoFech` (`V3`);
  significado exato: **PENDÊNCIA**.

Sobre os **retornos**: são gerados pelo Ambiente Nacional, **não são enviados** pelo empregador. Não têm
`Signature` do empregador nem prazo. O Lior deve tratá-los como fato imutável e reconciliar contra a folha
calculada internamente — **divergência entre o calculado e o S-5011/S-5013 é o principal sinal de erro de
parametrização de rubrica**.

**Fontes da seção 5** (acesso em 30/08/2026): XSDs oficiais S-1.3 (`evtFechaEvPer`, `evtReabreEvPer`,
`evtRemun`, `evtExclusao`, `evtAdmissao`, `evtDeslig`, `evtAfastTemp`) — anotações e regras nomeadas;
`https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026-rev-09-04-2026/regras.html`

---

## 6. Retificação, exclusão e o que não dá para desfazer

### 6.1 Retificação (dentro do próprio evento)

| Campo | Regra | Nível |
|---|---|---|
| `indRetif` | `[1]` original · `[2]` retificação | `V3` |
| `nrRecibo` | Número do recibo do evento retificado. **Obrigatório se `indRetif = 2`** | `V2` + `V3` |
| Validade do recibo | Deve referir-se a evento **válido** — ainda não excluído nem já retificado | `V2` |
| Mesmo tipo e mesmo período | O evento retificador deve ser **do mesmo tipo** e do **mesmo período de apuração** do retificado | `V2` |
| Mesmo vínculo | `REGRA_RETIFICA_MESMO_VINCULO` — não se troca o trabalhador por retificação | `V3` |
| Mesmo `procEmi` | `REGRA_MESMO_PROCEMI` — evento emitido por aplicativo do empregador não é retificado pelo módulo web e vice-versa | `V3` |

> Consequência prática: **retificação não migra evento entre trabalhadores nem entre competências.** Erro de
> CPF ou de competência exige **exclusão (S-3000) + novo envio**, não retificação.

### 6.2 Exclusão — S-3000

| Aspecto | Regra | Nível |
|---|---|---|
| Conteúdo | `tpEvento` (6 posições) + `nrRecEvt` (recibo do evento a excluir) | `V3` |
| Grupo `ideTrabalhador` | **Obrigatório** se `tpEvento` for evento não periódico (S-2190 a S-2420, S-8200 ou S-8299) **ou** periódico de S-1200 a S-1210 | `V3` |
| Grupo `ideFolhaPagto` | **Obrigatório** se `tpEvento` for periódico (S-1200 a S-1280 ou S-1300) | `V3` |
| `indApuracao` | Obrigatório e exclusivo se `tpEvento` = S-1200, S-1202, S-1207, S-1280, S-1300. `[1]` mensal · `[2]` anual (13º) | `V3` |
| Recibo | Deve ser do mesmo tipo de evento e **não** estar já excluído ou retificado | `V3` |
| S-1250 | Só é excluível se a data de envio do S-3000 for **igual ou anterior a 20/07/2021** | `V2` |

### 6.3 O que NÃO pode ser corrigido depois do fechamento

| Situação | Regra | Nível |
|---|---|---|
| Qualquer evento periódico de período **já fechado** (existe S-1299) | **Não pode ser excluído nem alterado** antes do envio do **S-1298** (reabertura) daquele período | `V2` |
| Envio durante o processamento do fechamento | `REGRA_ENVIO_PROC_FECHAMENTO` **bloqueia** todos os eventos enquanto o fechamento está sendo processado | `V3` |
| Exclusão de S-2299 com `mtvDeslig = [36]` | **Vedada** se já existir novo S-2200 para o novo CPF com `tpAdmissao = [6]` (mudança de CPF) | `V2` |
| Exclusão de S-2399 com `mtvDesligTSV = [07]` | **Vedada** se já existir novo S-2300 para o novo CPF com grupo `mudancaCPF` preenchido | `V2` |
| Exclusão de S-2420 com `mtvTermino = [10]` | **Vedada** se já existir novo S-2410 para o novo CPF com `indSitBenef = [3]` | `V2` |
| Desligamento com eventos posteriores | `REGRA_DESLIG_EXISTE_EVENTO_POSTERIOR` impede desligar deixando eventos posteriores pendentes | `V3` |
| Eventos extemporâneos | `REGRA_EVENTOS_EXTEMP` — tratamento próprio para envio fora de prazo; a validação difere do envio tempestivo | `V3` (existência da regra) · conteúdo em **PENDÊNCIA** |

> **PENDÊNCIA — não confirmado:** existe **prazo-limite para reabrir** uma competência (por exemplo,
> decadência ou trava do Ambiente Nacional após N meses/anos)? Não foi possível confirmar. Este é um item
> crítico para a UX do Lior (a tela precisa dizer ao usuário se ainda dá tempo). Checar no MOS, capítulo de
> eventos periódicos, e nas regras `REGRA_REABERTURA_VALIDA_PERIODO_APURACAO` e
> `REGRA_VALIDA_PERIODO_APURACAO` na página de Regras do leiaute.

**Fontes da seção 6** (acesso em 30/08/2026): XSDs oficiais S-1.3 (`evtExclusao`, `evtFechaEvPer`,
`evtReabreEvPer`, `tipos.py` → `TsIndRetif`, `TsIndApuracao`);
`https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026-rev-09-04-2026/regras.html`;
`https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-11-2026-retificada.pdf`

---

## 7. Prazos legais e multas

### 7.1 Prazos confirmados

| Evento(s) | Prazo | Nível |
|---|---|---|
| Eventos periódicos S-1200 a S-1299 (inclui **S-1299 fechamento**) | **Até o dia 15 do mês seguinte** ao da competência; **antecipa** para o dia útil imediatamente anterior quando não houver expediente bancário | `V2` |
| S-2200 (admissão) | Até o **dia imediatamente anterior ao início da prestação de serviços** (empregado e trabalhador temporário) | `V2` |
| S-2190 (registro preliminar) | Até o **fim do dia imediatamente anterior** ao início da prestação de serviços | `V2` |
| S-2200 **quando precedido de S-2190** | Até o **dia 15 do mês seguinte** ao da ocorrência, **ou antes** de transmitir qualquer outro evento não periódico daquele trabalhador | `V2` |
| S-2299 (desligamento) | Até o **10º dia seguinte** à data do desligamento | `V2` |
| S-2500 / S-2501 (processo trabalhista) | Até o **dia 15 do mês seguinte**; se cair em feriado/sem expediente, **1º dia útil seguinte** | `V2` |
| Janela entre S-2190 e S-2200/S-2300 | Nesse intervalo o Ambiente Nacional só recebe **eventos de remuneração/pagamento e eventos de SST** daquele trabalhador | `V2` |

### 7.2 Prazos NÃO confirmados nesta sessão

`PENDÊNCIA — não confirmado` para: **S-1000, S-1005, S-1010, S-1020, S-1070, S-1210, S-2205, S-2206, S-2210,
S-2220, S-2221, S-2230, S-2231, S-2240, S-2298, S-2300, S-2306, S-2399, S-2400 a S-2420, S-2555, S-3000,
S-3500, S-8200, S-8299.**

Onde checar: **MOS S-1.3**, seção de cada evento, campo "Prazo de envio"
(`https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-11-2026-retificada.pdf`).

Pista confirmada para SST: a **Nota Orientativa nº 04/2021** alterou o prazo de envio dos eventos **S-2220 e
S-2240** (`V2` quanto à existência da alteração; o novo prazo **não** foi lido).
Fonte: `https://www.gov.br/esocial/pt-br/noticias/nota-orientativa-04-2021-traz-alteracoes-no-prazo-para-envio-dos-eventos-s-2220-e-s-2240`

> **Não implementar nenhum desses prazos "por analogia com o dia 15".** O S-2299 já prova que existem prazos
> próprios; o S-2210 (CAT) tem prazo legal de origem diversa (Lei 8.213/1991).

### 7.3 Multas — o que foi possível confirmar

| Norma | O que é | Status |
|---|---|---|
| **Portaria MTE nº 1.131, de 03/07/2025** | Altera o art. 81 da **Portaria MTP nº 667, de 08/11/2021** — que aprova as normas de auto de infração trabalhista e fixa os **parâmetros de aplicação das multas administrativas de valor variável** previstas na legislação trabalhista. Publicada no **DOU de 04/07/2025, Edição 124, Seção 1, p. 357** | `V2` — existência, data e objeto confirmados |
| Valores da tabela de multas | **PENDÊNCIA — não confirmado.** O PDF da Portaria não pôde ser aberto nesta sessão. Valores citados em fontes não oficiais **não** foram reproduzidos aqui | — |
| **Lei nº 8.212/1991, art. 32-A** | Multa por atraso/incorreção na entrega da declaração (linhagem GFIP → DCTFWeb) | `V2` — dispositivo existe; **percentuais e mínimo em PENDÊNCIA** |
| **CLT, arts. 41, 47 e 47-A** | Registro de empregado e falta de registro | **PENDÊNCIA — não confirmado** (Planalto inacessível nesta sessão) |
| **Lei nº 8.036/1990** (FGTS) | Penalidades de FGTS | **PENDÊNCIA — não confirmado** |
| **Lei nº 8.213/1991, art. 22** (CAT) | Prazo e multa por CAT fora do prazo | **PENDÊNCIA — não confirmado** |

> **Aviso ao time comercial da G41:** circulam amplamente na internet valores de "multa do eSocial"
> (mínimo, valor por trabalhador, teto). **Nenhum deles é reproduzido neste documento** porque não foi
> possível confirmá-los na norma. Não usar em proposta, material de venda ou tela do sistema até que alguém
> abra a Portaria MTE 1.131/2025 e a Portaria MTP 667/2021 e transcreva a tabela com o artigo.

**Fontes da seção 7** (acesso em 30/08/2026):
- `https://www.gov.br/esocial/pt-br/noticias/comite-gestor-confirma-que-havera-mudanca-no-prazo-de-envio-do-fechamento-de-folha`
- `https://www.gov.br/esocial/pt-br/canais_atendimento/formularios/empresas/s-2190-admissao-de-trabalhador-registro-preliminar`
- `https://www.gov.br/esocial/pt-br/canais_atendimento/formularios/empresas/s-2299-desligamento`
- `https://www.gov.br/esocial/pt-br/noticias/processos-trabalhistas-veja-o-prazo-para-envio-dos-eventos-s-2500-e-s-2501`
- `https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/credito-do-trabalhador/legislacao-do-governo-federal/portaria-mte-no-1-131-de-3-de-julho-de-2025-multas.pdf`
- `https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3/PDFPortarian667de8novembrode2021compilada21.03.2024.pdf`
- `https://www.planalto.gov.br/ccivil_03/leis/l8212cons.htm`

---

## 7-A. PRAZOS DE ENVIO — lidos no MOS em 30/08/2026

Extraídos do **MOS S-1.3 consolidado até a NO 11/2026 retificada** (426 páginas, baixado e
com hash em `fontes/VERIFICACAO.md`). Fecha a pendência **P1**, que era a de maior impacto
deste documento.

### A regra geral de dia não útil — e o documento 04 estava errado

O MOS diz, com todas as letras:

> "Caso a data do término do prazo de envio do evento caia em dia não útil para fins fiscais,
> será **postergada** para o dia útil imediatamente posterior, **exceto em relação ao segurado
> especial, cujo prazo deve ser antecipado para o dia útil anterior**."

Ou seja: **o eSocial POSTERGA por padrão.** O documento `04` afirmava o contrário — que o
eSocial antecipa e só a EFD-Reinf e a DCTFWeb postergam — e isso é falso.

Há **exceções que antecipam**, e são nominadas: o **segurado especial**, e o prazo especial de
dez dias após o desligamento (caso do diretor não empregado com FGTS, com pagamento entre o
1º e o 4º dia do mês). Fora delas, posterga.

A recomendação de engenharia continua valendo, mas por outro motivo: não é que o eSocial
difere das outras obrigações — é que **o eSocial difere de si mesmo**. A função de ajuste
precisa receber a exceção como parâmetro do evento, não do sistema.

### Prazos por evento

| Evento | Prazo |
|---|---|
| **S-2200** admissão | **Dia imediatamente anterior ao início da prestação de serviços.** Exceção: admissão por transferência, ou uso do S-2190 → dia 15 do mês seguinte |
| **S-2190** admissão preliminar | Até o dia imediatamente anterior ao início. É a válvula que empurra o S-2200 para o dia 15 |
| S-1000 tabela do empregador | No início da utilização; alteração, quando ocorrer |
| S-1010 rubricas | **Antes** dos eventos de remuneração (S-1200, S-1202, S-1207) e antes de S-2299 e S-2399 |
| S-1020 lotações | Antes dos eventos que a utilizem |
| S-1200 remuneração | Dia 15 do mês seguinte |
| S-1202 · S-1207 · S-1210 · S-1260 · S-1270 · S-1280 | Dia 15 do mês seguinte |
| **S-1299** fechamento | Dia 15 do mês seguinte, depois dos eventos do período |
| **S-2299** desligamento | Dia 15 do mês seguinte |
| S-2206 alteração contratual | Dia 15 do mês seguinte, **ou até o envio da folha** da competência em que ocorreu |
| **S-2210** CAT | **Primeiro dia útil seguinte** ao acidente; **em caso de morte, de imediato** |
| S-2220 monitoramento da saúde | Dia 15 do mês seguinte ao ASO; ASO **admissional** tem prazo próprio |
| S-2221 exame toxicológico | Dia 15 do mês seguinte; o pré-admissional tem prazo próprio |
| S-2230 afastamento | Prazo escalonado por motivo; acidente ou doença do trabalho de até 15 dias tem regra própria |
| S-2240 condições ambientais | Dia 15 do mês seguinte ao início da obrigatoriedade de SST ou à admissão |
| S-2298 reintegração | Dia 15 do mês seguinte à reintegração |
| S-2300 trabalhador sem vínculo | **5 dias úteis** após o início das atividades (contrato temporário, Lei 6.019/1974) |
| S-2400 · S-2410 benefício | Dia 15 do mês seguinte à concessão, **ou antes de qualquer outro evento** daquele beneficiário |
| S-2405 · S-2416 · S-2418 | Dia 15 do mês seguinte |
| S-2500 · S-2501 · S-2555 processo trabalhista | Dia 15 do mês seguinte ao trânsito em julgado, homologação ou pagamento |
| S-8200 · S-8299 | **De acordo com a decisão judicial** |
| S-3000 exclusão | Evento de retorno; não depende de solicitação |

**O prazo que mais gera multa e não é dia 15:** o **S-2200**. Admissão tem que ser enviada
**antes de a pessoa começar a trabalhar** — não no mês seguinte. Quem tratar admissão como
evento mensal vai multar o cliente em toda contratação. O S-2190 existe justamente para
quem não consegue fechar o cadastro completo a tempo.

---

## 8. Ambientes: produção e produção restrita

| Aspecto | Produção | Produção Restrita | Nível |
|---|---|---|---|
| Código `tpAmb` no XML (`ideEvento/tpAmb`) | **1** | **2** | `V3` |
| Outros valores de `tpAmb` no XSD | `7` Validação (uso interno) · `8` Teste (uso interno) · `9` Desenvolvimento (uso interno) — **não usar** | — | `V3` |
| Efeito jurídico | Pleno | **Nenhum** | `V2` |
| Cadastro prévio | Sim (certificado ICP-Brasil) | **Não exige cadastro prévio**; aberto a qualquer empresa, não só desenvolvedoras | `V2` |
| Migração de dados entre ambientes | — | **Nenhum evento é migrado** para produção | `V2` |
| Escopo de teste | — | **Todos os eventos**, inclusive **testes de convivência de versões**. Número **limitado de trabalhadores** por empresa; uso funcional | `V2` |
| Papel no ciclo de release | Recebe a mudança depois | **Toda evolução é implantada primeiro na Produção Restrita**, ficando disponível para testes por prazo definido conforme o tamanho da mudança | `V2` |
| Login web | — | `https://login.producaorestrita.esocial.gov.br/Login.aspx` | `V2` |
| Webservice — envio de lote | PENDÊNCIA | `https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc` | `V2` |
| Webservice — consulta de lote | PENDÊNCIA | `https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc` | `V2` |
| Limite de eventos por lote | **PENDÊNCIA — não confirmado** (uma biblioteca de terceiros usa 50; **conferir no MOD**) | idem | — |

> **PENDÊNCIA — não confirmado:** as URLs de **produção** dos webservices. O portal tem notícia específica
> ("Divulgadas novas URL para transmissão dos dados de produção do eSocial") e o **MOD v1.15** traz a lista
> canônica. **Nunca hard-codear endpoint** — colocar em variável de ambiente por ambiente
> (`ESOCIAL_WS_BASE_URL`), como já é padrão nos demais módulos.

> Recomendação de teste para o Lior: rodar a **massa de teste oficial da folha** inteiramente contra a
> Produção Restrita (`tpAmb = 2`) num pipeline noturno, incluindo ciclo completo
> S-1000 → S-1005 → S-1010 → S-1020 → S-2200 → S-1200 → S-1210 → S-1299 → leitura de S-5011/S-5012/S-5013 →
> S-1298 → retificação → S-1299. Se esse ciclo não roda verde ponta a ponta, o módulo não vai para produção.

**Fontes da seção 8** (acesso em 30/08/2026):
- `https://www.gov.br/esocial/pt-br/acesso-ao-sistema/ambiente-de-producao-restrita`
- `https://www.gov.br/esocial/pt-br/acesso-ao-sistema/cronograma-de-implantacao/perguntas-frequentes-producao-empresas-e-producao-restrita`
- `https://www.gov.br/esocial/pt-br/empresas/perguntas-frequentes/perguntas-frequentes-producao-empresas-e-ambiente-de-testes`
- `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/manualorientacaodesenvolvedoresocialv1-15.pdf`
- XSD oficial S-1.3 — tipo `TS_tpAmb`

---

## 9. Recomendações de arquitetura decorrentes desta pesquisa

Não são normas — são consequências de engenharia do que foi verificado. Estão aqui para não se perderem.

1. **Versionar `leiaute + NT`, não só `S-1.3`.** Guardar em cada evento persistido: versão do leiaute, NT de
   consolidação, hash do XSD usado e `tpAmb`. Sem isso não há como reprocessar histórico.
2. **Gerar o mapa de eventos a partir do XSD**, nunca digitar à mão. Foi encontrado mapa de terceiros com
   S-5002/S-5012 e S-2231/S-2420 trocados. Um gerador de tipos a partir dos XSDs elimina essa classe de bug.
3. **`nrInsc` como texto.** O pacote XSD vigente é rotulado "CNPJ alfanumérico".
4. **Máquina de estados por evento**, não booleano de "enviado": `rascunho → assinado → em_lote →
   processando → aceito(recibo) → retificado | excluído`. O recibo é a chave de retificação/exclusão e
   precisa ser imutável e indexado.
5. **Bloquear a UI durante o fechamento.** `REGRA_ENVIO_PROC_FECHAMENTO` rejeita qualquer envio enquanto o
   S-1299 processa. Melhor bloquear no Lior do que colecionar rejeições.
6. **Derivar os flags do `infoFech` do S-1299 do próprio estado**, jamais do usuário — é validação cruzada e
   errar significa fechamento rejeitado.
7. **Persistir os totalizadores como fato fiscal** e criar uma tela de reconciliação
   "folha calculada × S-5011/S-5012/S-5013". Divergência = erro de parametrização de rubrica (S-1010).
8. **Tabela de rubricas é o ativo mais valioso e o maior risco.** Natureza + incidências (CP, IRRF, FGTS) mal
   parametrizadas contaminam toda a apuração. Merece revisão de quatro olhos e trilha de auditoria própria.
9. **Toda pendência deste documento vira tarefa no Kanban G41** (`tarefas.g41.com.br/api/public/tasks`, POST,
   `X-API-Key` + `X-Idempotency-Key`), conforme regra 3 do `CLAUDE.md`.

---

## 10. PENDÊNCIAS consolidadas

Ordenadas por impacto no desenvolvimento. **Nenhuma pode virar código antes de resolvida.**

| # | Pendência | O que falta | Onde checar | Impacto |
|---|---|---|---|---|
| ~~P1~~ **RESOLVIDO 30/08/2026 — ver seção 7-A** | ~~Prazos de envio de 25 eventos~~ (S-1000, S-1005, S-1010, S-1020, S-1070, S-1210, S-2205, S-2206, S-2210, S-2220, S-2221, S-2230, S-2231, S-2240, S-2298, S-2300, S-2306, S-2399, S-2400–S-2420, S-2555, S-3000, S-3500, S-8200, S-8299) | Ler o campo "Prazo de envio" de cada evento | MOS S-1.3 cons. até NO 11/2026 | **Alto** — alertas e SLA do módulo |
| P2 | **Valores e artigos das multas** (Portaria MTE 1.131/2025 + Portaria MTP 667/2021 art. 81; Lei 8.212 art. 32-A; CLT 41/47/47-A; Lei 8.036/1990; Lei 8.213/1991 art. 22) | Transcrever a tabela com artigo e valor | PDFs das portarias e Planalto | **Alto** — material comercial e telas de risco |
| P3 | **URLs de webservice de PRODUÇÃO** e **limite de eventos por lote** | Lista canônica de endpoints e limites | MOD v1.15 + notícia "Divulgadas novas URL…" | **Alto** — integração |
| P4 | **Nome/URL exata do ZIP de XSD S-1.3 vigente** (pós NT 06/2026) | Link vivo na página de Documentação Técnica | Documentação Técnica | **Alto** — build |
| P5 | **Regra do CNPJ alfanumérico** | Formato, dígito verificador, campos afetados | NT S-1.3 06/2026 + MOS | **Alto** — modelo de dados |
| P6 | **Existe prazo-limite para reabertura (S-1298) de competência antiga?** | Confirmar trava do Ambiente Nacional | MOS + página de Regras | **Alto** — UX de correção |
| P7 | **Próxima versão do leiaute (S-1.4 ou equivalente)** | Existe NDE/minuta publicada? Cronograma? | Documentação Técnica + coleção de notícias | **Médio** — roadmap |
| P8 | **Semântica de `indGuia`, `transDCTFWeb`, `naoValid`, `indExcApur1250` no S-1299** | Definição e regras de uso | MOS + Leiautes S-1.3 | **Médio** — fechamento |
| P9 | **Prazo dos eventos S-2220 e S-2240 após a NO 04/2021** | Valor do novo prazo | NO 04/2021 | **Médio** — só afeta módulo SST |
| P10 | **S-1300 (Contribuição Sindical Patronal) ainda é enviável no S-1.3?** | Confirmar se há XSD próprio ou se é só legado de exclusão | Leiautes S-1.3 (índice de eventos) | **Médio** |
| P11 | **Supressão formal de S-1030/S-1035/S-1040/S-1050/S-1060/S-1080** | Confirmar na norma (não só por ausência no XSD) | NDE/MOS do eSocial Simplificado | **Baixo** — documentação |
| P12 | **Datas de 1ª/2ª/3ª fase dos Grupos 2 e 4** e **SST do Grupo 3 pessoa física** | Completar a matriz do cronograma | Cronograma de Implantação + Portarias Conjuntas 71/2021 e 2/2022 | **Baixo** — histórico |
| P13 | **Início da obrigatoriedade do empregador doméstico** (data + norma) | Confirmar | Legislação do eSocial | **Baixo** |
| P14 | **Detalhes do novo padrão de certificado** (produção em 24/06/2026) | Requisitos de TLS/assinatura | Notícia + MOD | **Médio** — integração |
| P15 | **Obrigatoriedade condicional do S-1020** | Quando é exigível | MOS, evento S-1020 | **Médio** — carga inicial |
| P16 | **Tratamento de eventos extemporâneos** (`REGRA_EVENTOS_EXTEMP`) | Conteúdo da regra | Página de Regras do leiaute S-1.3 | **Médio** |

### Como fechar as pendências

Todas as P1–P16 se resolvem **abrindo cinco documentos**: MOS S-1.3, Leiautes S-1.3 (HTML, incluindo Regras e
Tabelas), NT 06/2026, MOD v1.15 e as Portarias de multas. **Prioridade: baixar esses cinco arquivos, arquivar
em `/docs/folha/fontes/` com hash e data, e reescrever este documento elevando `V2` para `V1`.**

---

**Fontes gerais** — todas acessadas em **30/08/2026** (via índice de busca; download direto bloqueado no
ambiente desta sessão):

| # | URL |
|---|---|
| 1 | `https://www.gov.br/esocial/pt-br/documentacao-tecnica` |
| 2 | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais` |
| 3 | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026-rev-09-04-2026/index.html` |
| 4 | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026-rev-09-04-2026/regras.html` |
| 5 | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026/tabelas.html` |
| 6 | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-11-2026-retificada.pdf` |
| 7 | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/nota-tecnica-s-1-3-06-2026-rev.pdf` |
| 8 | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/nota-orientativa-s-1-3-11-2026-retificada.pdf` |
| 9 | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/manualorientacaodesenvolvedoresocialv1-15.pdf` |
| 10 | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/versoes-anteriores-da-documentacao-tecnica` |
| 11 | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/versoes-do-sistema` |
| 12 | `https://www.gov.br/esocial/pt-br/acesso-ao-sistema/cronograma-de-implantacao` |
| 13 | `https://www.gov.br/esocial/pt-br/acesso-ao-sistema/ambiente-de-producao-restrita` |
| 14 | `https://www.gov.br/esocial/pt-br/acesso-ao-sistema/cronograma-de-implantacao/perguntas-frequentes-producao-empresas-e-producao-restrita` |
| 15 | `https://www.gov.br/esocial/pt-br/empresas/manual-web-geral` |
| 16 | `https://www.gov.br/esocial/pt-br/centrais-de-conteudo/legislacao/empresas` |
| 17 | `https://www.gov.br/esocial/pt-br/noticias/comeca-hoje-a-obrigatoriedade-dos-eventos-de-saude-e-seguranca-no-trabalho-sst-para-as-empresas-do-grupo-1` |
| 18 | `https://www.gov.br/esocial/pt-br/noticias/processos-trabalhistas-veja-o-prazo-para-envio-dos-eventos-s-2500-e-s-2501` |
| 19 | `https://www.gov.br/esocial/pt-br/noticias/nota-orientativa-04-2021-traz-alteracoes-no-prazo-para-envio-dos-eventos-s-2220-e-s-2240` |
| 20 | `https://www.gov.br/esocial/pt-br/noticias/comite-gestor-confirma-que-havera-mudanca-no-prazo-de-envio-do-fechamento-de-folha` |
| 21 | `https://www.gov.br/esocial/pt-br/noticias/atualizacao-de-certificado-do-esocial-para-um-novo-padrao-de-seguranca` |
| 22 | `https://www.gov.br/esocial/pt-br/canais_atendimento/formularios/empresas/s-2190-admissao-de-trabalhador-registro-preliminar` |
| 23 | `https://www.gov.br/esocial/pt-br/canais_atendimento/formularios/empresas/s-2299-desligamento` |
| 24 | `https://www.gov.br/esocial/pt-br/canais_atendimento/formularios/empresas/Totalizacao_CP_IR` |
| 25 | `https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/escola/e-social-aprenda-ponto-a-ponto/eventos-totalizadores` |
| 26 | `https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/credito-do-trabalhador/legislacao-do-governo-federal/portaria-mte-no-1-131-de-3-de-julho-de-2025-multas.pdf` |
| 27 | `https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3/PDFPortarian667de8novembrode2021compilada21.03.2024.pdf` |
| 28 | `https://www.planalto.gov.br/ccivil_03/leis/l8212cons.htm` |
| 29 | `https://frontend.esocial.gov.br/adm/` |
| 30 | XSDs oficiais S-1.3 — `http://www.esocial.gov.br/schema/evt/<raiz>/v_S_01_03_00` (anotações literais do leiaute) |

*Insights Impulsionam.*
