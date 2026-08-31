# Folha de Pagamento — Ecossistema de Obrigações Acessórias e Calendário do DP

> Módulo **Lior — Folha de Pagamento** · G41 Inteligência Contábil
> Pesquisa realizada e revisada em **30/08/2026**. Data de acesso de todas as URLs: **30/08/2026**.
> Documento sujeito à regra anti-invenção do projeto: **nada aqui pode virar código sem a norma literal lida**.

---

## 0. MÉTODO E LIMITAÇÃO DESTA PESQUISA (leia antes de usar)

**Como foi verificado.** Nesta sessão o acesso HTTP direto aos domínios `gov.br`, `planalto.gov.br`,
`in.gov.br`, `normas.receita.fazenda.gov.br` e `sped.rfb.gov.br` está **bloqueado pela política de
egresso da rede**. A verificação foi feita por **busca indexada restrita aos domínios oficiais**,
que retorna o conteúdo das páginas oficiais mas **não substitui a leitura literal do artigo**.

**Legenda de confiabilidade usada em todas as tabelas:**

| Marca | Significado | Pode virar regra de cálculo/prazo no Lior? |
|---|---|---|
| ✅ | Confirmado em página/documento de domínio oficial, com URL | Sim, com a URL no comentário do código |
| ⚠️ | Confirmado em fonte oficial, mas **sem leitura do texto literal da norma** (redação, exceções e §§ não conferidos) | **Não** — ler a norma antes |
| ○ | **PENDÊNCIA — não confirmado** | **Não.** Vai para a seção 13 e abre tarefa no Kanban |

**Regra do projeto aplicada aqui:** prazo/obrigação/multa sem fonte oficial confirmada entra no
sistema como `null` + pendência visível, nunca como valor padrão silencioso.

---

## 1. MAPA DO ECOSSISTEMA — por que "enviar o eSocial" não basta

```
                       ┌──────────────────────────────────────────┐
   PONTO ELETRÔNICO ──►│  CÁLCULO DA FOLHA (motor Lior)           │◄── CCT/ACT (Mediador)
   (AFD / AEJ)         │  proventos, descontos, bases             │    piso, reajuste, benefícios
                       └───────────────┬──────────────────────────┘
                                       │
                    ┌──────────────────┼───────────────────┐
                    ▼                  ▼                   ▼
              ┌───────────┐     ┌─────────────┐     ┌──────────────┐
              │  eSocial  │     │ EFD-Reinf   │     │     MIT      │
              │ S-1200…   │     │ R-2010/R-40 │     │ (IRPJ, CSLL, │
              │ S-1299    │     │ R-2099/R-40 │     │ PIS, COFINS…)│
              └─────┬─────┘     └──────┬──────┘     └──────┬───────┘
                    │  S-5001/5002/5003│                   │
        ┌───────────┴──────────┐       │                   │
        ▼                      ▼       ▼                   ▼
  ┌─────────────┐        ┌──────────────────────────────────────┐
  │ FGTS DIGITAL│        │            DCTFWeb                   │
  │ guia + Pix  │        │  confissão de dívida → DARF numerado │
  └─────────────┘        └──────────────────────────────────────┘
        │                                  │
        ▼                                  ▼
   FGTS até dia 20                 DARF prev. até dia 20
                                   Entrega DCTFWeb até último dia útil
```

**A leitura operacional:** o eSocial é **escrituração**, não é pagamento nem declaração de débito.
Quem constitui o crédito tributário é a **DCTFWeb**; quem gera a guia do FGTS é o **FGTS Digital**;
quem cobre retenções de serviços/IRRF de terceiros é a **EFD-Reinf**. Errar a folha contamina os
três a jusante.

---

## 2. eSocial — a base de tudo

| Item | Conteúdo | Fonte | Status |
|---|---|---|---|
| Prazo dos eventos periódicos e do fechamento **S-1299** | Até o **dia 15 do mês seguinte** ao da competência, **antecipando para o dia útil imediatamente anterior** quando não houver expediente bancário | [S-1299 — eSocial](https://www.gov.br/esocial/pt-br/canais_atendimento/formularios/empresas/S-1299-Fechamento-dos-Eventos-Periodicos) · [Comitê Gestor — mudança do prazo](https://www.gov.br/esocial/pt-br/noticias/comite-gestor-confirma-que-havera-mudanca-no-prazo-de-envio-do-fechamento-de-folha) | ✅ |
| Eventos periódicos | S-1200, S-1202, S-1207, S-1260, S-1270, S-1280 (**regime de competência**); S-1210 (**regime de caixa**); S-1298 reabertura; S-1299 fechamento | [S-1299 — eSocial](https://www.gov.br/esocial/pt-br/canais_atendimento/formularios/empresas/S-1299-Fechamento-dos-Eventos-Periodicos) | ✅ |
| Competência **anual (13º)** | S-1200 e S-1299 da competência anual devem ser enviados **entre 1º e 20 de dezembro** | [S-1299 — eSocial](https://www.gov.br/esocial/pt-br/canais_atendimento/formularios/empresas/S-1299-Fechamento-dos-Eventos-Periodicos) | ✅ |
| **S-2200 / S-2190** (admissão) | Até o **dia anterior** ao do início da prestação de serviços | [MOS S-1.3 (07/2026)](https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-07-2026.pdf) | ⚠️ |
| **S-2299** (desligamento) | Até o **10º dia** seguinte à data do desligamento | [MOS S-1.3 (07/2026)](https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-07-2026.pdf) | ⚠️ |
| **S-2230** (afastamento temporário) | Regras próprias por motivo/duração (evento único para afastamento ≤ 15 dias; > 15 dias sem preencher retorno) | [S-2230 — eSocial](https://www.gov.br/esocial/pt-br/canais_atendimento/formularios/empresas/s-2230-afastamento-temporario) | ⚠️ |
| Versão vigente do leiaute | **S-1.3**, manual consolidado até a NO S-1.3 **07/2026**; leiautes consolidados até a **NT 06/2026 (rev. 09/04/2026)** | [Manuais eSocial](https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-07-2026.pdf) · [Leiautes S-1.3](https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026-rev-09-04-2026/index.html) | ✅ |

> **Armadilha nº 1 (data):** eSocial **antecipa** o dia 15 para o dia útil anterior; EFD-Reinf e
> DCTFWeb **postergam** para o dia útil seguinte. O sistema não pode tratar as três com a mesma
> função de ajuste de data.

---

## 3. DCTFWeb

### 3.1 O que é e como se relaciona com eSocial/EFD-Reinf

A DCTFWeb é a aplicação que **edita, transmite e gera o documento de arrecadação** da Declaração de
Débitos e Créditos Tributários Federais. É **módulo do SPED** e **não tem digitação de folha**: ela
é **gerada a partir** do que já foi escriturado. Recebe os débitos e créditos automaticamente,
realiza as vinculações, calcula o saldo a pagar e emite o **DARF numerado**.
✅ [DCTFWeb — Receita Federal](https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/DCTFWeb)

**Escriturações que a alimentam (as "geradoras"):** eSocial, EFD-Reinf, **MIT** e Sero.
✅ [IN RFB 2.237/2024 — notícia RFB](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2024/dezembro/publicada-instrucao-normativa-que-institui-o-modulo-de-inclusao-de-tributos-2013-mit-na-dctfweb-e-substitui-a-dctf)

**Sequência obrigatória:** enviar os eventos → **fechar** (S-1299 no eSocial e/ou R-2099/R-4099 na
EFD-Reinf) → só então a DCTFWeb fica disponível para editar e transmitir → transmissão libera o
**DARF numerado**.
✅ [DCTFWeb — Receita Federal](https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/DCTFWeb)

### 3.2 Mudança recente de escopo — a DCTF PGD morreu

| Marco | Conteúdo | Fonte | Status |
|---|---|---|---|
| **IN RFB nº 2.237/2024** | Unifica DCTF (PGD) e DCTFWeb; institui o **MIT — Módulo de Inclusão de Tributos**. Para fatos geradores **a partir de 01/01/2025**, os débitos antes declarados na DCTF PGD passam a ser declarados na **DCTFWeb mensal via MIT**. **DCTF PGD extinta** para FG a partir de 2025 | [Notícia RFB](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2024/dezembro/publicada-instrucao-normativa-que-institui-o-modulo-de-inclusao-de-tributos-2013-mit-na-dctfweb-e-substitui-a-dctf) · [IN RFB 2237/2024](http://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=141910) | ✅ (texto literal ⚠️) |
| Manual do MIT | Manual MIT v1.0 publicado pela RFB | [Manual MIT](https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/DCTFWeb/arquivos/manual-mit-1-0-14-02.pdf) | ✅ |

> **Consequência para o Lior:** a DCTFWeb deixou de ser "coisa do DP". Ela hoje mistura, na mesma
> declaração mensal, o **previdenciário vindo do eSocial** e o **IRPJ/CSLL/PIS/COFINS vindos do MIT**.
> O módulo de folha **não pode transmitir a DCTFWeb sozinho** sem alinhamento com o fiscal — se o
> fiscal não lançou o MIT, transmitir a DCTFWeb entrega uma declaração incompleta.

### 3.3 Prazo de entrega — **mudou, e a mudança é contraintuitiva**

| Período | Prazo | Norma | Status |
|---|---|---|---|
| Até FG 12/2023 | Até o **dia 15** do mês seguinte ao da ocorrência dos fatos geradores | IN RFB nº 2.005/2021, art. 19 | ⚠️ |
| A partir de out/2023 | Quando o dia 15 cair em **dia não útil** para fins fiscais, posterga para o **1º dia útil após o dia 15** | **IN RFB nº 2.162/2023** — [notícia RFB](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2023/outubro/postergado-prazo-de-entrega-da-dctfweb) | ✅ |
| **FG a partir de 01/2025 — regra vigente hoje** | **Último dia útil do mês seguinte** ao da ocorrência dos fatos geradores | **IN RFB nº 2.248, de 5 de fevereiro de 2025** — [notícia RFB](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/fevereiro/contribuintes-ganham-mais-tempo-para-entregar-a-dctfweb) · [IN RFB 2248/2025](http://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=142687) | ✅ (texto literal ⚠️) |
| Exceção FG 01/2025 | Prorrogado excepcionalmente para o **último dia útil de março/2025** | [notícia RFB](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/fevereiro/contribuintes-ganham-mais-tempo-para-entregar-a-dctfweb) | ✅ |
| **DCTFWeb Anual (13º salário)** | Transmitida **uma vez por ano, até 20 de dezembro**, com base no eSocial | [Manual DCTFWeb jan/2025](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/manuais/manual-dctfweb/manual-dctfweb-atualizacao-janeiro2025_versao_final.pdf) | ⚠️ |

> **Armadilha nº 2 (a mais cara do módulo):** o **prazo de ENTREGA** da DCTFWeb (último dia útil do
> mês seguinte) é **posterior** ao **prazo de PAGAMENTO** da contribuição previdenciária (dia 20).
> Como o DARF só sai depois de transmitir a declaração, o **prazo operacional real do DP continua
> sendo o dia 20** — não o último dia útil. O Lior deve exibir **duas datas distintas** e alertar
> pelo dia 20. Quem "aproveitar" o prazo maior paga multa e juros de mora previdenciária.

### 3.4 DARF numerado

- Desde o período de apuração **agosto/2018**, as empresas obrigadas a eSocial/EFD-Reinf/DCTFWeb
  recolhem as contribuições previdenciárias e as devidas a **outras entidades e fundos (Terceiros)**
  por meio de **DARF numerado emitido pela própria DCTFWeb** — em substituição à GPS.
  ✅ [DCTFWeb — Receita Federal](https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/DCTFWeb)
- O DARF só é liberado **após a transmissão** da declaração.
  ✅ [DCTFWeb — Receita Federal](https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/DCTFWeb)
- Emissão de DARF **parcial / por débito específico**, DARF de saldo e vinculação de compensações:
  **○ PENDÊNCIA** — descrito no Manual da DCTFWeb, não lido nesta pesquisa.

### 3.5 O que acontece se a folha estiver errada

Fluxo lógico (⚠️ **inteiro por dedução da arquitetura oficial**, não lido em manual):
retificar o evento no **eSocial** → reabrir (S-1298) e **refechar** (S-1299) → a DCTFWeb passa a
**"em andamento/retificadora"** → transmitir a **DCTFWeb retificadora** → recalcular o DARF.
Se o DARF original já foi pago a menor, sobra saldo a recolher **com multa e juros**; se pago a
maior, gera crédito a compensar/restituir.
**○ PENDÊNCIA:** procedimento exato de retificação, tratamento do DARF já pago, prazo de retificação
e efeitos da retificação após início de procedimento de ofício — precisa da leitura do
[Manual da DCTFWeb](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/manuais/manual-dctfweb/manual-dctfweb-atualizacao-janeiro2025_versao_final.pdf) e do
[Perguntas e Respostas set/2025](https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/DCTFWeb/arquivos/perguntas-e-respostas-dctfweb-2025-09-23.pdf).

---

## 4. FGTS Digital

### 4.1 Substituição da GFIP/SEFIP — datas e normas

| Item | Conteúdo | Fonte | Status |
|---|---|---|---|
| Entrada em produção | **01/03/2024** | [FGTS Digital em produção — MTE](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/comunicados/fgts-digital-em-producao) | ✅ |
| Alcance | **Recolhimentos mensais a partir da competência 03/2024** e **rescisórios com desligamento a partir de 01/03/2024** | [FGTS Digital em produção — MTE](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/comunicados/fgts-digital-em-producao) | ✅ |
| Competências **anteriores a 03/2024**, ainda que em atraso | Continuam pelos sistemas da **Caixa (SEFIP / GRRF / Conectividade Social)** | [FGTS Digital em produção — MTE](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/comunicados/fgts-digital-em-producao) | ✅ |
| Norma de implantação | **Portaria MTE nº 3.211, de 18/08/2023** — **revogada**; regulamentação atual pela **Portaria MTE nº 240, de 29/02/2024** | [Legislação FGTS Digital — MTE](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/legislacao) | ⚠️ |
| Órgãos públicos | FGTS Digital obrigatório a partir da competência **janeiro/2025** | [Comunicado MTE](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/comunicados/orgaos-publicos-devem-utilizar-o-fgts-digital-para-recolher-o-fgts-da-competencia-janeiro-2025) | ✅ |

> A GFIP/SEFIP **não foi "extinta" num único ato**: ela morreu em duas etapas — a parte
> **previdenciária** migrou para eSocial + DCTFWeb (a partir de 2018, por grupos) e a parte **FGTS**
> migrou para o FGTS Digital na competência **03/2024**. ⚠️ A norma que formalmente encerrou a GFIP
> para fins de FGTS **não foi lida** nesta pesquisa → ver PENDÊNCIAS.

### 4.2 Prazo de recolhimento — **mudou: era dia 7, hoje é dia 20**

| Item | Conteúdo | Fonte | Status |
|---|---|---|---|
| Prazo mensal vigente | **Até o dia 20 do mês seguinte** ao da competência | [Novo prazo — dia 20 (MTE)](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/videos-e-tutoriais/novo-prazo-para-recolhimento-do-fgts-mensal-dia-20) · [Perguntas frequentes — MTE](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/perguntas-frequentes) | ✅ |
| Base legal | **Lei nº 14.438/2022**, que alterou o prazo do art. 15 da **Lei nº 8.036/1990** (de dia 7 para dia 20), com eficácia amarrada à entrada em operação do FGTS Digital | [Lei 8.036/1990 consolidada](https://www.planalto.gov.br/ccivil_03/leis/l8036consol.htm) | ⚠️ **ler o art. 15 literal** |
| Antecipação/prorrogação quando dia 20 não é útil | **○ PENDÊNCIA — não confirmado** (regra difere da previdenciária; conferir no Manual de Orientação) | — | ○ |

> **Armadilha nº 3:** houve um período em que o MTE publicou comunicado **"o prazo de recolhimento do
> FGTS ainda não mudou"** antes de a alteração produzir efeitos
> ([comunicado](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/comunicados/fgts-2013-novo-prazo-de-recolhimento)).
> Qualquer regra de data no Lior tem de ser **parametrizada por competência**, nunca hard-coded.

### 4.3 Como funciona a geração da guia

| Item | Conteúdo | Fonte | Status |
|---|---|---|---|
| Origem dos débitos | Ao transmitir **qualquer evento periódico ou não periódico no eSocial**, os dados são compartilhados com o FGTS Digital. O retorno **S-5003 — Informações do FGTS por Trabalhador** traz a **base de cálculo e o valor do depósito por trabalhador**, por contrato, estabelecimento e lotação tributária | [Integração eSocial × FGTS Digital](https://www.gov.br/esocial/pt-br/noticias/integracao-com-esocial-todos-os-empregadores-ja-conseguem-visualizar-debitos-no-ambiente-de-testes-do-fgts-digital) | ✅ |
| **Não depende de fechamento** | Não é necessário fechar a folha para gerar guias: conforme as remunerações são enviadas, já se pode emitir guia sobre aquelas bases | [Integração eSocial × FGTS Digital](https://www.gov.br/esocial/pt-br/noticias/integracao-com-esocial-todos-os-empregadores-ja-conseguem-visualizar-debitos-no-ambiente-de-testes-do-fgts-digital) | ✅ |
| **Individualização** | Todo depósito é individualizado, com **bases de cálculo detalhadas por competência e por trabalhador** | [Manual de Orientação FGTS Digital v1.60 (05/05/2026)](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/manual-e-documentacao-tecnica/manual-de-orientacao-do-fgts-digital-versao-1-60-05-05-2026.pdf) | ⚠️ |
| Meio de pagamento | **Pix** — liquidação em tempo real, pagável em qualquer dia e horário, inclusive fins de semana e feriados | [FGTS Digital em produção — MTE](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/comunicados/fgts-digital-em-producao) | ✅ |
| Funcionalidades | Emissão de **guia rápida** e personalizada, consulta de extratos, simulação, pedido de **compensação/restituição**, **parcelamento** | [Perguntas frequentes — MTE](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/perguntas-frequentes) | ✅ |
| Rescisório | Registrar o desligamento no eSocial e gerar guia no FGTS Digital com FGTS do mês, 13º proporcional, aviso indenizado e **multa rescisória (40% / 20%)** | [FGTS Digital em produção — MTE](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/comunicados/fgts-digital-em-producao) | ✅ |
| FGTS de reclamatória trabalhista | Evento **S-2500** estruturado para exigir as bases de FGTS **separadas por competência** do processo/acordo | [Nota Orientativa FD nº 08/2025](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/manual-e-documentacao-tecnica/nota-orientativa-fd-08-2025-recolhimento-de-fgts-em-reclamatoria-trabalhista.pdf) | ✅ |
| Endereço do sistema | `https://fgtsdigital.sistema.gov.br` · portal `https://www.gov.br/fgtsdigital` | [FGTS Digital em produção — MTE](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/comunicados/fgts-digital-em-producao) | ✅ |

### 4.4 O que o Lior precisa enviar/consumir

- **Enviar:** nada diretamente ao FGTS Digital — a base vem do **eSocial**. O que o Lior controla é a
  qualidade dos eventos de remuneração e desligamento.
- **Consumir:** o retorno **S-5003** (base e valor do FGTS por trabalhador) para **conferência
  automática folha × FGTS Digital** antes de o cliente pagar a guia. ✅
- **Existência de API/webservice público do FGTS Digital para emissão de guia e consulta de débitos:
  ○ PENDÊNCIA — não confirmado.** Assumir integração via portal + certificado digital até prova em
  contrário.
- **Crédito do Trabalhador (consignado):** o FGTS Digital passou também a operar a **declaração e o
  recolhimento das prestações de empréstimo consignado (Lei nº 10.820/2003)**, com cobrança ativa do
  MTE sobre quem não declara — impacta o desconto em folha.
  ✅ [Manual do Empregador — Crédito do Trabalhador](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/manual-e-documentacao-tecnica/manual-operacional-do-empregador-programa-credito-do-trabalhador-v2-16-05-25.pdf) ·
  [Comunicado MTE](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/comunicados/mte-inicia-a-cobranca-das-empresas-que-nao-estao-declarando-ou-recolhendo-as-prestacoes-de-emprestimo-consignado)

---

## 5. EFD-Reinf

### 5.1 Escopo

Escrituração das **retenções e outras informações fiscais** — pagamentos a **pessoas jurídicas e
físicas** e as retenções de tributos correspondentes; é a contraparte "não-folha" do eSocial e
também alimenta a DCTFWeb.
✅ [EFD-Reinf — RFB](https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/perguntas-frequentes/sped/efd-reinf/efdr) · [Serviço EFD-Reinf](https://www.gov.br/pt-br/servicos/efd-reinf)

### 5.2 Prazo

| Item | Conteúdo | Fonte | Status |
|---|---|---|---|
| Prazo mensal | Transmissão ao SPED **até o dia 15 do mês seguinte** ao a que se refere a escrituração; se o dia 15 **não for útil** para fins fiscais, **posterga para o 1º dia útil seguinte** | **IN RFB nº 2.043/2021, art. 6º** — [IN RFB 2043/2021](https://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=119859) | ⚠️ **ler o art. 6º literal** |
| Norma vigente | **IN RFB nº 2.043, de 12/08/2021** (substituiu a IN RFB nº 1.701/2017) | [IN RFB 2043/2021](https://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=119859) | ⚠️ |

### 5.3 Séries de eventos

| Série | Conteúdo | Status |
|---|---|---|
| **R-1000** | Informações do contribuinte. **É sempre o primeiro evento a ser enviado** ✅ [FAQ eventos EFD-Reinf](https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/perguntas-frequentes/sped/efd-reinf/efdr/2-eventos-da-efd-reinf) | ✅ |
| **R-2010** | Retenção de contribuição previdenciária — **serviços tomados** (cessão de mão de obra / empreitada) | ⚠️ |
| **R-2020** | Retenção previdenciária — **serviços prestados** | ⚠️ |
| **R-2099** | Fechamento dos eventos periódicos da série R-2000 | ⚠️ |
| **R-4010** | **Retenções na fonte — pessoa física** ✅ [FAQ eventos EFD-Reinf](https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/perguntas-frequentes/sped/efd-reinf/efdr/2-eventos-da-efd-reinf) | ✅ |
| **R-4020** | **Retenções na fonte — pessoa jurídica** ✅ (mesma fonte) | ✅ |
| **R-4080** | **Retenção no recebimento** ✅ (mesma fonte) | ✅ |
| **R-4099** | **Fechamento/reabertura dos eventos da série R-4000** ✅ (mesma fonte) | ✅ |
| Demais (R-2030/2040/2050/2055, R-3010, R-4040, R-9000, R-9005/R-9015) | **○ PENDÊNCIA — lista completa e finalidade de cada um não confirmada item a item.** Conferir no [Manual da EFD-Reinf v2.1.2.1](http://sped.rfb.gov.br/estatico/28/40FAAC1C636CC110D4C12D2790B43C641C6BCA/Manual%20da%20EFD-Reinf%20vers%C3%A3o%202.1.2.1.pdf) | ○ |

**Obrigatoriedade:** condicionada à **existência de informação a prestar**. Sem movimento, **não se
envia evento algum — nem o R-1000**.
✅ [FAQ eventos EFD-Reinf](https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/perguntas-frequentes/sped/efd-reinf/efdr/2-eventos-da-efd-reinf)

**Série R-4000 (retenções de IR, CSLL, PIS/Pasep e Cofins):** obrigatoriedade iniciada em
**21/09/2023**, após prorrogação pela **IN RFB nº 2.133/2023** (que alterou a IN RFB nº 2.043/2021).
✅ [Notícia RFB](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2023/marco/receita-federal-prorroga-o-inicio-de-obrigatoriedade-dos-eventos-da-efd-reinf-referentes-as-retencoes-de-irpf-csll-pis-e-cofins)

### 5.4 Relação com a folha

A EFD-Reinf **não declara a folha de empregados** (isso é eSocial). Ela entra no ciclo do DP em três
pontos: (a) **retenção previdenciária de 11%** sobre serviços com cessão de mão de obra (R-2010/R-2020),
(b) **IRRF de autônomos e prestadores PF** pagos pela empresa (R-4010) e (c) **fechamento (R-2099 /
R-4099)** que, junto com o S-1299, libera a DCTFWeb. Se o DP fecha o eSocial mas o fiscal não fecha a
Reinf, **a DCTFWeb não fecha**.
⚠️ (dedução da arquitetura oficial; a parte "fechamento libera a DCTFWeb" está confirmada em
[DCTFWeb — RFB](https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/DCTFWeb))

---

## 6. O QUE FOI EXTINTO E O QUE AINDA EXISTE

| Obrigação | Situação hoje (30/08/2026) | Norma / marco | Fonte | Status |
|---|---|---|---|---|
| **CAGED** | **Substituído pelo eSocial** para admissões e desligamentos ocorridos a partir de **01/01/2020** (grupos 1, 2 e 3). A base CAGED continua existindo — muda o **meio** de prestar a informação, que passa a ser extraída do eSocial | **Portaria SEPRT/ME nº 1.127, de 14/10/2019** | [eSocial substitui RAIS e CAGED](https://www.gov.br/esocial/pt-br/noticias/esocial-substitui-informacoes-para-rais-e-caged) · [Substituição de obrigações](https://www.gov.br/esocial/pt-br/noticias/substituicao-de-obrigacoes-dados-do-esocial-passaram-a-alimentar-o-caged-e-a-rais-para-obrigados) | ✅ |
| **RAIS** | **Substituída pelo eSocial** a partir do **ano-base 2019** para os grupos obrigados; **a partir do ano-base 2023 a RAIS de TODOS os grupos do eSocial (1, 2, 3 e 4) é extraída diretamente do banco do eSocial**. O **GDRAIS Genérico** subsistiu apenas para anos-base antigos e **encerrou em 14/08/2026** o prazo dos anos-base 1976 a 2022 | Portaria SEPRT nº 1.127/2019; Decreto nº 10.854/2021 | [Portal RAIS](https://www.rais.gov.br/sitio/index.jsf) · [Quem deve declarar RAIS Genérica](https://www.rais.gov.br/sitio/quem_deve_declarar.jsf) | ✅ |
| **GFIP/SEFIP — parte FGTS** | **Substituída pelo FGTS Digital** a partir da competência **03/2024** (rescisórios a partir de 01/03/2024). Competências anteriores, mesmo em atraso, continuam na SEFIP/GRRF | Portaria MTE nº 240/2024 | [FGTS Digital em produção](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/comunicados/fgts-digital-em-producao) | ✅ |
| **GFIP/SEFIP — parte previdenciária** | Substituída por **eSocial + DCTFWeb** (DARF numerado em lugar da GPS, desde o PA 08/2018 para os obrigados) | IN RFB nº 2.005/2021 | [DCTFWeb — RFB](https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/DCTFWeb) | ✅ |
| **DIRF** | **Extinta.** Integralmente substituída por **EFD-Reinf + eSocial** para fatos geradores **a partir de 01/01/2025**. A **DIRF 2025 (ano-calendário 2024) foi a última** | **IN RFB nº 2.096/2022** (previa 2024), prorrogada para 2025 pela **IN RFB nº 2.181/2024** | [Com o fim da DIRF — RFB (jul/2025)](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/julho/a-declaracao-do-imposto-sobre-a-renda-retido-na-fonte-dirf-nao-sera-mais-utilizada) · [Substituição da DIRF PGD — eSocial](https://www.gov.br/esocial/pt-br/noticias/substituicao-da-dirf-pgd-por-eventos-do-esocial-comeca-no-periodo-de-apuracao-01-2025) | ✅ |
| **DCTF PGD** | **Extinta** para fatos geradores a partir de **01/01/2025**; migrou para **DCTFWeb via MIT** | IN RFB nº 2.237/2024 | [Notícia RFB](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2024/dezembro/publicada-instrucao-normativa-que-institui-o-modulo-de-inclusao-de-tributos-2013-mit-na-dctfweb-e-substitui-a-dctf) | ✅ |
| **Livro/Ficha de Registro de Empregados (LRE)** | Registro **eletrônico**; entende-se substituído pelo eSocial na forma da Portaria MTP nº 671/2021 | Portaria MTP nº 671/2021; CLT art. 41 | [Portaria MTP 671/2021 compilada](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3/portaria-no-671-de-8-de-novembro-de-2021-compilada-20-10-2023.pdf) | ○ **PENDÊNCIA — artigo específico não lido** |

### O que **ainda existe** hoje (30/08/2026)

**Vivas e obrigatórias:** eSocial · EFD-Reinf · **DCTFWeb (com MIT)** · **FGTS Digital** ·
registro eletrônico de ponto (quando aplicável) · **comprovante de rendimentos ao empregado**
(base normativa ○ pendente) · CCT/ACT · guias: **DARF numerado** (previdenciário + Terceiros) e
**guia FGTS via Pix**.

**Mortas:** DCTF PGD · DIRF · GFIP/SEFIP (para fatos novos) · GPS para empresas obrigadas · CAGED e
RAIS **como sistemas próprios de digitação** (as bases seguem vivas, alimentadas pelo eSocial).

---

## 7. Comprovante de rendimentos (informe anual ao empregado)

| Item | Situação | Status |
|---|---|---|
| Obrigação existe? | **Sim** — o empregador (fonte pagadora) continua obrigado a entregar ao beneficiário PF o Comprovante de Rendimentos Pagos e de Imposto sobre a Renda Retido na Fonte. A extinção da DIRF **não extinguiu o comprovante** | ⚠️ |
| Quem gera | A **fonte pagadora** (empregador). O sistema de folha deve emitir | ⚠️ |
| Prazo | Historicamente **até o último dia útil de fevereiro** do ano seguinte ao do pagamento | ⚠️ referência histórica: [RFB — prazo Dirf 2021 e comprovante](https://www.gov.br/economia/pt-br/assuntos/noticias/2021/fevereiro/termina-o-prazo-de-entrega-da-dirf-2021-e-do-comprovante-de-rendimentos-pagos-e-de-imposto-retido-na-fonte) |
| **Base normativa vigente em 2026** | **○ PENDÊNCIA — NÃO CONFIRMADO.** A IN que disciplinava o comprovante era referenciada pela IN da DIRF, hoje extinta. Não foi possível confirmar qual norma rege o comprovante para o ano-calendário 2025/2026, nem se o prazo permanece o último dia útil de fevereiro | ○ |
| Apoio oficial ao contribuinte | A RFB disponibiliza no Portal de Serviços o **Demonstrativo Consolidado do IRRF**, montado a partir do eSocial/EFD-Reinf — **é apoio ao empregado, não substitui a obrigação do empregador** | ⚠️ [Demonstrativo Consolidado do IRRF](https://www.gov.br/esocial/pt-br/noticias/receita-federal/demonstrativo-consolidado-do-imposto-de-renda-retido-na-fonte-esta-disponivel-no-portal-de-servicos-da-receita-federal) |

> **Não codificar o prazo do informe de rendimentos no Lior enquanto a PENDÊNCIA acima não for
> fechada.** É exatamente o tipo de "todo mundo sabe que é fevereiro" que a regra anti-invenção
> existe para barrar.

---

## 8. CALENDÁRIO MENSAL COMPLETO DO DEPARTAMENTO PESSOAL

Referência: competência **M**; obrigações no mês **M+1**. Ajuste de data varia por obrigação
(ver coluna "Ajuste") — **não usar uma única função de dia útil**.

### 8.1 Ciclo mensal, em ordem cronológica

| # | Quando | Etapa | Sistema/Guia | Ajuste quando cai em dia não útil | Fonte | Status |
|---|---|---|---|---|---|---|
| 1 | Dia 26–31 de M (parametrizável) | **Fechamento do ponto** — coleta do AFD, tratamento de marcações, horas extras, adicional noturno, faltas, DSR | REP-C/REP-A/REP-P → AFD | Definido em contrato/CCT | Portaria MTP 671/2021 | ⚠️ (não há data legal federal) |
| 2 | Após o ponto | **Lançamentos variáveis**: afastamentos, férias, rescisões, benefícios, pensões, consignados | Lior | — | — | — |
| 3 | Após lançamentos | **Cálculo da folha** — aplicar **piso e regras da CCT vigente** (seção 12) | Lior | — | — | — |
| 4 | Até o **5º dia útil de M+1** | **Pagamento dos salários** | Banco (CNAB 240) | Regra própria do art. 459 §1º da CLT | CLT art. 459, §1º | ○ **não reverificado nesta pesquisa** |
| 5 | Até o **dia 15 de M+1** | **Envio dos eventos periódicos** S-1200/S-1202/S-1207/S-1260/S-1270/S-1280 e **S-1210** (pagamentos) | eSocial | **ANTECIPA** para o dia útil imediatamente anterior | [S-1299 — eSocial](https://www.gov.br/esocial/pt-br/canais_atendimento/formularios/empresas/S-1299-Fechamento-dos-Eventos-Periodicos) | ✅ |
| 6 | Até o **dia 15 de M+1** | **Fechamento S-1299** — trava a competência | eSocial | **ANTECIPA** | mesma fonte | ✅ |
| 7 | Até o **dia 15 de M+1** | **EFD-Reinf**: eventos R-2010/R-2020 e R-4010/R-4020/R-4080 + **fechamento R-2099 / R-4099** | EFD-Reinf | **POSTERGA** para o 1º dia útil seguinte | IN RFB 2043/2021, art. 6º | ⚠️ |
| 8 | Após 6 e 7 | **MIT** — o fiscal inclui IRPJ/CSLL/PIS/COFINS e demais tributos na DCTFWeb | MIT | — | [IN RFB 2237/2024](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2024/dezembro/publicada-instrucao-normativa-que-institui-o-modulo-de-inclusao-de-tributos-2013-mit-na-dctfweb-e-substitui-a-dctf) | ✅ |
| 9 | **Antes do dia 20** (prazo operacional) | **Transmitir a DCTFWeb** e **emitir o DARF numerado** | DCTFWeb | — | [DCTFWeb — RFB](https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/DCTFWeb) | ✅ |
| 10 | Até o **dia 20 de M+1** | **Pagar o DARF** — contribuições previdenciárias + Terceiros | DARF numerado | **ANTECIPA** para o dia útil anterior quando não há expediente bancário | [PGFN — contribuição patronal](https://www.gov.br/pgfn/pt-br/cidadania-tributaria/por-assunto/tributacao-sobre-a-folhas-de-salarios-e-outras/contribuicoes-previdenciarias-1/patronal-ou-dos-empregadores) · [INSS — prazos de recolhimento](https://www.gov.br/inss/pt-br/saiba-mais/seus-direitos-e-deveres/calculo-da-guia-da-previdencia-social-gps/prazos-de-recolhimento) | ✅ |
| 11 | Até o **dia 20 de M+1** | **Pagar o FGTS mensal** (guia FGTS Digital, via **Pix**) | FGTS Digital | ○ regra de ajuste **não confirmada** | [Novo prazo dia 20 — MTE](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/videos-e-tutoriais/novo-prazo-para-recolhimento-do-fgts-mensal-dia-20) | ✅ prazo / ○ ajuste |
| 12 | Até o **dia 20 de M+1** | **IRRF sobre rendimentos do trabalho** — recolhimento | DARF | ○ **PENDÊNCIA — prazo e base legal não confirmados nesta pesquisa** | — | ○ |
| 13 | Até o **último dia útil de M+1** | **Entrega formal da DCTFWeb** (prazo legal) | DCTFWeb | **POSTERGA** (último dia **útil**) | [IN RFB 2248/2025 — notícia RFB](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/fevereiro/contribuintes-ganham-mais-tempo-para-entregar-a-dctfweb) | ✅ |
| 14 | Contínuo no mês | **Eventos não periódicos**: S-2200/S-2190 (**até o dia anterior ao início**), S-2299 (**até o 10º dia** do desligamento), S-2206, S-2230, S-2500 | eSocial | por evento | [MOS S-1.3](https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-07-2026.pdf) | ⚠️ |

### 8.2 Diagrama do mês

```
  M-1 ─────────────────────────── M ──────────────────────────────── M+1 ───────────────────────►
                            [26–31] fecha ponto
                                     │
                                     ├─► cálculo (CCT!) ─► 5º dia útil: PAGA SALÁRIO (CNAB 240)
                                     │
                                     ├─► dia 15 (ANTECIPA): eSocial S-1200/S-1210 + S-1299
                                     ├─► dia 15 (POSTERGA): EFD-Reinf + R-2099/R-4099
                                     │        └─► MIT (fiscal)
                                     ├─► DCTFWeb: transmite → DARF numerado
                                     ├─► dia 20: PAGA DARF prev. + PAGA FGTS (Pix)   ◄── prazo REAL
                                     └─► último dia útil: entrega formal DCTFWeb     ◄── prazo LEGAL
```

### 8.3 Obrigações anuais e sazonais

| Quando | Obrigação | Detalhe | Fonte | Status |
|---|---|---|---|---|
| **Até o último dia útil de fevereiro** | **Comprovante de rendimentos** ao empregado | ○ base normativa e prazo vigentes **não confirmados** — ver seção 7 | — | ○ |
| **De 1º de fevereiro a 30 de novembro** | **1ª parcela do 13º** (adiantamento, metade do salário). Pode ser paga em qualquer mês da janela | [13º salário — MTE](https://www.gov.br/trabalho-e-emprego/pt-br/noticias-e-conteudo/2025/novembro/decimo-terceiro-salario-entenda-o-direito-regras-e-prazos-de-pagamento) · [Lei 4.749/1965](https://www.planalto.gov.br/ccivil_03/leis/l4749.htm) | ✅ prazo / ⚠️ texto literal |
| **Até 30 de novembro** | **Prazo final da 1ª parcela do 13º** | mesma fonte | ✅ |
| **1º a 20 de dezembro** | **Eventos da competência ANUAL no eSocial** (S-1200 e S-1299 do 13º) | [S-1299 — eSocial](https://www.gov.br/esocial/pt-br/canais_atendimento/formularios/empresas/S-1299-Fechamento-dos-Eventos-Periodicos) | ✅ |
| **Até 20 de dezembro** | **DCTFWeb Anual (13º salário)** — transmissão + DARF | [Manual DCTFWeb](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/manuais/manual-dctfweb/manual-dctfweb-atualizacao-janeiro2025_versao_final.pdf) | ⚠️ |
| **Até 20 de dezembro** | **2ª parcela do 13º** ao empregado. Se o dia 20 cair em fim de semana/feriado, **antecipa** | [13º salário — MTE](https://www.gov.br/trabalho-e-emprego/pt-br/noticias-e-conteudo/2025/novembro/decimo-terceiro-salario-entenda-o-direito-regras-e-prazos-de-pagamento) | ✅ |
| **15 dias antes do início** | **Férias coletivas**: comunicar ao órgão local do MTE as datas de início/fim e os setores abrangidos; **no mesmo prazo**, enviar cópia ao **sindicato** da categoria e **afixar aviso** nos locais de trabalho. **Dispensada para ME e EPP** (LC 123/2006, art. 51, V) | CLT art. 139, §2º | [Comunicar Férias Coletivas — gov.br](https://www.gov.br/pt-br/servicos/comunicar-ferias-coletivas) | ✅ |
| **Férias individuais** | Aviso prévio de férias e pagamento antecipado — ○ **prazos não reverificados nesta pesquisa** (CLT arts. 135 e 145) | — | ○ |
| **Data-base do sindicato** | **Reajuste/piso da CCT** — varia por sindicato e base territorial (seção 12) | [Mediador](https://mediador.trabalho.gov.br/sistemas/mediador/ConsultarInstColetivo) | ✅ |

---

## 9. MULTAS E PENALIDADES

| Obrigação | Penalidade | Norma | Fonte | Status |
|---|---|---|---|---|
| **DCTFWeb** — entrega em atraso, com incorreções ou não entregue (**MAED**) | **2% ao mês-calendário ou fração** sobre o total de contribuições informadas — **ainda que já pagas** — **limitada a 20%**. **Mínimo R$ 200,00** (declaração sem movimento) ou **R$ 500,00** nos demais casos. **Redução de 50%** se entregue antes de qualquer procedimento de ofício; **25%** se entregue no prazo da intimação. Emissão **automática** | **Lei nº 8.212/1991, art. 32-A** | [Multas automáticas DCTFWeb — RFB](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2022/junho/multas-por-atraso-da-dctfweb-passarao-a-ser-emitidas-automaticamente) | ○ **NÃO CONFIRMADO** — rebaixado na auditoria de 30/08/2026 (C-03): o art. 32-A não foi lido. Não exibir estes valores ao cliente |
| **eSocial** — informação fora do prazo/forma, ou com inexatidão/omissão | **Mínimo R$ 443,97**, acrescido de **R$ 104,31 por trabalhador** omitido ou declarado incorretamente, com **máximo de R$ 44.396,84**. **Desconto de 40%** para fatos geradores de 01/01/2020 até a véspera da vigência da Portaria | **Portaria MTP nº 667/2021, art. 81**, na redação da **Portaria MTE nº 1.131, de 03/07/2025** | [Portaria MTE 1.131/2025](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/credito-do-trabalhador/legislacao-do-governo-federal/portaria-mte-no-1-131-de-3-de-julho-de-2025-multas.pdf) · [Portaria MTP 667/2021 compilada](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3/PDFPortarian667de8novembrode2021compilada21.03.2024.pdf) | ✅ **CONFIRMADO NA ORIGEM em 30/08/2026.** A Portaria MTE 1.131/2025 foi baixada e lida (`fontes/Portaria-MTE-1131-2025-multas.pdf`): o art. 81 que ela dá à Portaria MTP 667/2021 traz exatamente **mínimo R$ 443,97**, **acrescido de R$ 104,31 por trabalhador** e **máximo R$ 44.396,84**. Estes valores estavam certos desde o início; eu os havia rebaixado a pendência por excesso de cautela, e o rebaixamento foi desfeito |
| **FGTS em atraso** | Atualização do valor + **juros de mora** + **multa progressiva: 5% no mês do vencimento e 10% a partir do mês seguinte**; sujeição às sanções do Decreto-Lei nº 368/1968 | **Lei nº 8.036/1990, art. 22** | [Lei 8.036/1990 consolidada](https://www.planalto.gov.br/ccivil_03/leis/l8036consol.htm) | ⚠️ **percentual de juros divergente entre fontes — ler o art. 22 §§ literal** |
| **FGTS — infrações administrativas** (não recolher, omitir, prestar informação falsa) | Multas apuradas pela **Auditoria-Fiscal do Trabalho** | **Lei nº 8.036/1990, art. 23** | [Lei 8.036/1990 consolidada](https://www.planalto.gov.br/ccivil_03/leis/l8036consol.htm) | ○ **faixa de valores não confirmada** |
| **Empregado sem registro** | Multa por empregado não registrado, acrescida de igual valor em cada reincidência; valor reduzido para **ME/EPP** | **CLT, art. 47 e §1º** | — | ○ **valores conflitantes entre fontes (R$ 3.000 × R$ 6.000) — NÃO CONFIRMADO** |
| **Falta de anotação dos dados do art. 41, parágrafo único, da CLT** | Multa por trabalhador prejudicado | **CLT, art. 47-A** | — | ○ **valor não confirmado** |
| **EFD-Reinf** em atraso | ○ **PENDÊNCIA — não confirmado** (verificar art. da IN RFB 2.043/2021 e a multa do art. 57 da MP 2.158-35/2001) | — | — | ○ |
| **Ponto** — ausência/irregularidade de controle de jornada | Auto de infração da Inspeção do Trabalho; multa de valor variável na forma da Portaria MTP 667/2021 | Portaria MTP nº 667/2021 | [Portaria MTP 667/2021](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3/PDFPortarian667de8novembrode2021compilada21.03.2024.pdf) | ⚠️ **faixa específica não confirmada** |
| **13º fora do prazo** | ○ **PENDÊNCIA — não confirmado** | — | — | ○ |
| Agravamento geral | As multas administrativas trabalhistas podem ser **dobradas em caso de reincidência, embaraço ou resistência à fiscalização** | Portaria MTP nº 667/2021 | [Portaria MTP 667/2021](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3/PDFPortarian667de8novembrode2021compilada21.03.2024.pdf) | ⚠️ |

> **O que mais gera multa na prática (ordem de risco):**
> 1. **DCTFWeb entregue fora do prazo** — MAED é **automática**, incide **mesmo com o tributo pago**, e o piso de R$ 500 se aplica a cada competência.
> 2. **FGTS pago depois do dia 20** — multa progressiva 5%/10% + juros, sem qualquer redução por espontaneidade.
> 3. **eSocial com omissão/inexatidão** — a multa é **por trabalhador**; numa folha de 100 pessoas o erro sistêmico vira multa de cinco dígitos.
> 4. **Admissão comunicada depois do início do trabalho** (S-2200 fora do prazo) — vira "empregado sem registro" na fiscalização.

---

## 10. INTEGRAÇÃO COM BANCOS — CNAB 240 (FEBRABAN)

| Item | Conteúdo | Status |
|---|---|---|
| O layout é público? | **Sim.** O **Layout Padrão FEBRABAN 240 posições** é publicado abertamente pela FEBRABAN em PDF | ✅ |
| Onde está | [Layout padrão CNAB240 V10.11 — 21/08/2023](https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Layout%20padrao%20CNAB240%20V%2010%2011%20-%2021_08_2023.pdf) · versões anteriores: [V10.10 (30/08/2022)](https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Layout%20padrao%20CNAB240%20V%2010%2010%20-%2030_08_2022_2.pdf) · [V10.09 (14/10/2021)](https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Layout%20padrao%20CNAB240%20V%2010%2009%20-%2014_10_21.pdf) | ✅ |
| Escopo | Troca de arquivos **Empresa ↔ Banco** para pagamento de **salários**, fornecedores, dividendos, tributos e títulos — por crédito em conta, cheque, OP, DOC, pagamento autenticado | ✅ |
| Estrutura | Registro de **240 bytes**; hierarquia **Header de Arquivo → Header de Lote → Segmentos de detalhe → Trailer de Lote → Trailer de Arquivo** | ✅ |
| Versão mais recente | **○ PENDÊNCIA** — a V10.11 (2023) é a mais recente encontrada; **não confirmado** se há versão posterior publicada até 08/2026 | ○ |

### O que é preciso para gerar a remessa de salários

⚠️ **Item de engenharia, deduzido do layout e das práticas bancárias — validar contra o manual do banco antes de codar:**

1. **Contrato/convênio de pagamento** com o banco (código do convênio, agência/conta da empresa).
2. **Cadastro completo do empregado**: CPF, banco, agência, conta e dígito, ou **chave Pix**.
3. **Header de Arquivo** (empresa, banco, data/hora de geração, NSA sequencial), **Header de Lote**
   (tipo de serviço = pagamento de salários, forma de lançamento), **Segmentos A e B** por
   favorecido, trailers com totalizações.
4. **Retorno**: consumir o arquivo-retorno e conciliar **ocorrências/rejeições por favorecido** —
   o Lior precisa marcar quem **não** recebeu, porque isso vira reclamatória.
5. Cada banco publica **manual próprio derivado** do padrão FEBRABAN (Sicredi, BB, Caixa etc.) —
   **o layout FEBRABAN é o esqueleto, não a especificação final do banco**.

> **Alerta de escopo:** pagamento em lote via **Pix** e via **API bancária (Open Finance / API de
> pagamentos do banco)** é hoje alternativa concorrente ao CNAB. **○ PENDÊNCIA:** não pesquisado.

---

## 11. PONTO ELETRÔNICO

| Item | Conteúdo | Fonte | Status |
|---|---|---|---|
| Norma | **Portaria MTP nº 671, de 8 de novembro de 2021** — **vigente**, consolidou o marco regulatório trabalhista infralegal e substituiu as Portarias 1.510/2009 e 373/2011. Há **versão compilada** (atualizada em 2023) | [Portaria MTP 671/2021 compilada](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3/portaria-no-671-de-8-de-novembro-de-2021-compilada-20-10-2023.pdf) · [Portarias vigentes — MTE](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3) | ✅ |
| **Obrigatoriedade por porte** | Para estabelecimentos com **mais de 20 trabalhadores** é **obrigatória a anotação da hora de entrada e de saída**, em registro **manual, mecânico ou eletrônico**, permitida a **pré-assinalação do intervalo**. **O REP eletrônico não é obrigatório** — é uma das formas admitidas | **CLT, art. 74, §2º** · [P&R Portaria 671/2021 — MTE](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/fiscalizacao-do-trabalho/Perguntas%20e%20Respostas%20REP) | ✅ |
| **REP-C** | Equipamento de automação **monolítico**, identificado pelo número de fabricação, com **certificado de conformidade** do modelo, de uso exclusivo para registro de jornada. Modelo herdado da Portaria 1.510/2009 | [P&R Portaria 671/2021](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/fiscalizacao-do-trabalho/Perguntas%20e%20Respostas%20REP) | ✅ |
| **REP-A** | Conjunto de equipamentos e programas cuja utilização é **autorizada por convenção ou acordo coletivo** de trabalho | mesma fonte | ✅ |
| **REP-P** | **Programa (software)** executado em servidor dedicado ou **em nuvem**, de uso exclusivo para registro de jornada — é o que viabiliza ponto por app/mobile | mesma fonte | ✅ |
| **Ponto por exceção** | Permitido mediante **acordo individual escrito**, convenção ou acordo coletivo. **Não é um tipo de REP** — é forma de consignação, aplicável a qualquer meio admitido pelo caput do art. 74 | mesma fonte | ✅ |
| **Certificado técnico e Termo de Responsabilidade** | Exigidos do fabricante/desenvolvedor do equipamento ou programa | mesma fonte | ✅ |
| **Arquivos que o REP gera** | **AFD — Arquivo Fonte de Dados** (obrigatório em todos os tipos de REP); o **programa de tratamento** processa o AFD e gera o **Espelho de Ponto Eletrônico** e o **AEJ — Arquivo Eletrônico de Jornada** | mesma fonte | ✅ |
| Layout exato do AFD/AEJ | **○ PENDÊNCIA** — especificações estão nos anexos da Portaria 671/2021, não lidos | — | ○ |

### O que a folha precisa consumir do ponto

⚠️ Consolidado do que a Portaria descreve + regra de cálculo:

- **AFD** (marcações brutas) → tratamento → **horas normais, extras por faixa (50%/100% ou o que a
  CCT definir), adicional noturno + hora noturna reduzida, intervalos, DSR sobre variáveis, faltas,
  atrasos, banco de horas, sobreaviso**.
- **Espelho de Ponto** assinado pelo empregado = prova documental — o Lior deve **guardar e versionar**.
- **AEJ** = arquivo entregue à fiscalização — precisa ser **reproduzível** a partir dos dados do
  sistema, não só exibido em tela.
- **Percentuais de hora extra, intervalo e banco de horas vêm da CCT** (seção 12), **não** de default
  do sistema.

---

## 12. CONVENÇÕES E ACORDOS COLETIVOS (CCT/ACT) — o "dado vivo" que o sistema NÃO pode inventar

| Item | Conteúdo | Fonte | Status |
|---|---|---|---|
| Onde ficam oficialmente | **Sistema Mediador** do MTE — sistema de negociação coletiva implantado em 2007; **registro eletrônico obrigatório** dos instrumentos coletivos | [Consultar Instrumentos Coletivos — Mediador](https://mediador.trabalho.gov.br/sistemas/mediador/ConsultarInstColetivo) · [Registro de convenções e ACT — MTE](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/mediacao/registro-de-convencoes-e-acordo-coletivo-de-trabalho) | ✅ |
| Tipos | **CCT** (sindicato patronal × sindicato laboral) · **ACT** (empresa × sindicato laboral) · **Termo Aditivo** (altera/complementa instrumento já registrado) | [Registro de convenções e ACT — MTE](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/mediacao/registro-de-convencoes-e-acordo-coletivo-de-trabalho) | ✅ |
| Consulta pública | **Sim, aberta a qualquer pessoa**, por filtros, inclusive instrumentos com vigência **já expirada** | [Consultar Instrumento Coletivo — gov.br](https://www.gov.br/pt-br/servicos/consultar-instrumento-coletivo-de-trabalho) | ✅ |
| **Existe API pública?** | **○ PENDÊNCIA — NÃO CONFIRMADO.** Nenhuma API, endpoint de dados abertos ou download estruturado do Mediador foi localizado. A consulta oficial é **por formulário web, resultado em PDF** | — | ○ |
| Manual do sistema | [Manual do Sistema Mediador](https://www.gov.br/trabalho-e-emprego/pt-br/pdfs/manual-do-sistema-mediador-srt-digital.pdf) | ✅ |

### Por que isso é dado vivo e por que o Lior não pode chutar

O instrumento coletivo é **norma privada com força de lei entre as partes** e varia por **sindicato,
categoria, base territorial e vigência**. Dependem dele, entre outros:

- **Piso salarial da categoria** (frequentemente acima do salário mínimo nacional);
- **Data-base e percentual de reajuste** — retroativos geram folha complementar;
- **Adicionais**: horas extras acima do mínimo legal, adicional noturno, insalubridade/periculosidade
  por acordo, quebra de caixa, tempo de deslocamento;
- **Benefícios obrigatórios**: vale-refeição/alimentação, cesta, vale-transporte diferenciado,
  plano de saúde, seguro de vida, auxílio-creche;
- **Descontos**: contribuição assistencial/negocial, mensalidade sindical — com **regras próprias de
  autorização e oposição**;
- **Regras de jornada**: banco de horas, compensação, ponto por exceção, escalas;
- **Estabilidades e obrigações de rescisão** (homologação, aviso, multas convencionais).

**Duas empresas do mesmo CNAE em municípios vizinhos podem ter pisos diferentes** porque a base
territorial do sindicato muda. Por isso, no modelo do Lior:

> **CCT/ACT entra como TABELA DE DADOS por cliente/estabelecimento, com vigência, número de registro
> no Mediador, URL do instrumento e data de verificação — nunca como constante no código.**
> Instrumento vencido ou não cadastrado ⇒ **cálculo marcado como PROVISÓRIO + pendência visível +
> tarefa no Kanban**, exatamente como a regra tributária não confirmada no motor fiscal.

**Rotina recomendada (espelho da re-pesquisa mensal de UFs do motor fiscal):** verificação periódica
da vigência do instrumento por sindicato/base; divergência detectada **abre tarefa para aprovação
humana ANTES de sobrescrever** piso, reajuste ou benefício.

---

## 13. PENDÊNCIAS (nada disso pode virar código antes de fechar)

### Bloqueadores de alta prioridade

| # | Pendência | Por que trava | Onde confirmar |
|---|---|---|---|
| P-01 | **Comprovante de rendimentos** — norma vigente e prazo em 2026, após a extinção da DIRF | Obrigação anual do módulo, sem base normativa confirmada | Normas RFB — IN sobre comprovante de rendimentos; [P&R IRPF 2026](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/dirpf/p-r-irpf-2026-v1-00-2026-04-23.pdf) |
| P-02 | **Prazo e base legal do recolhimento do IRRF** sobre rendimentos do trabalho | É guia mensal do ciclo; sem isso o calendário fica incompleto | Legislação do IRRF / Manual do IRRF da RFB |
| P-03 | **Texto literal do art. 19 da IN RFB 2.005/2021** consolidado pós-IN 2.248/2025 — incluindo o prazo da **DCTFWeb Anual (13º)** e a regra de dia não útil | O prazo é o coração do calendário | [IN RFB 2005/2021](http://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=115675) · [IN RFB 2248/2025](http://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=142687) |
| P-04 | **Art. 22 da Lei 8.036/1990** — percentual de **juros de mora** do FGTS em atraso (fontes divergem: 0,5% × 1% ao mês) e índice de atualização | Cálculo de FGTS em atraso sai errado | [Lei 8.036/1990](https://www.planalto.gov.br/ccivil_03/leis/l8036consol.htm) |
| P-05 | **Regra de ajuste do prazo do FGTS** quando o dia 20 não é dia útil (antecipa? posterga? Pix em fim de semana muda algo?) | Erro aqui = multa de 10% | [Manual FGTS Digital v1.60](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/manual-e-documentacao-tecnica/manual-de-orientacao-do-fgts-digital-versao-1-60-05-05-2026.pdf) |
| P-06 | **Valores atualizados das multas do art. 47 e 47-A da CLT** (fontes divergem: R$ 3.000 × R$ 6.000; redução para ME/EPP) | Não exibir valor de multa errado ao cliente | [Portaria MTP 667/2021 compilada](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3/PDFPortarian667de8novembrode2021compilada21.03.2024.pdf) · CLT |
| P-07 | **Procedimento de retificação DCTFWeb** após erro de folha, com DARF já pago | É o caso de uso mais frequente do suporte | [Manual DCTFWeb](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/manuais/manual-dctfweb/manual-dctfweb-atualizacao-janeiro2025_versao_final.pdf) · [P&R DCTFWeb set/2025](https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/DCTFWeb/arquivos/perguntas-e-respostas-dctfweb-2025-09-23.pdf) |

### Demais pendências

| # | Pendência | Onde confirmar |
|---|---|---|
| P-08 | Lista completa e finalidade de **cada evento da EFD-Reinf** (R-2030/2040/2050/2055, R-3010, R-4040, R-9000, R-9005/R-9015) | [Manual EFD-Reinf v2.1.2.1](http://sped.rfb.gov.br/estatico/28/40FAAC1C636CC110D4C12D2790B43C641C6BCA/Manual%20da%20EFD-Reinf%20vers%C3%A3o%202.1.2.1.pdf) |
| P-09 | **Multa por atraso da EFD-Reinf** — norma e valor | IN RFB 2.043/2021; MP 2.158-35/2001, art. 57 |
| P-10 | **Norma que encerrou formalmente a GFIP** para fins de FGTS e a data exata | [Legislação FGTS Digital](https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/legislacao) |
| P-11 | Confirmar se a **Portaria MTE 240/2024** é de fato a norma vigente do FGTS Digital e se a **Portaria MTE 3.211/2023** está revogada | mesma fonte |
| P-12 | **Data de publicação da IN RFB 2.248/2025** (fontes citam 05/02 e 07/02/2025) | DOU / Normas RFB |
| P-13 | **Artigo da Portaria MTP 671/2021** que dispensa o Livro/Ficha de Registro de Empregados em papel | [Portaria 671/2021 compilada](https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3/portaria-no-671-de-8-de-novembro-de-2021-compilada-20-10-2023.pdf) |
| P-14 | **Layout do AFD e do AEJ** (anexos da Portaria 671/2021) | mesma fonte |
| P-15 | **Prazos de férias individuais** (aviso e pagamento antecipado — CLT arts. 135 e 145) | CLT |
| P-16 | **Prazo de pagamento de salário** — art. 459, §1º da CLT (5º dia útil) e regra de contagem | CLT |
| P-17 | **Prazos exatos dos eventos não periódicos do eSocial** (S-2200, S-2299, S-2206, S-2230, S-2500) no MOS S-1.3 | [MOS S-1.3](https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-07-2026.pdf) |
| P-18 | Existência de **API/webservice do FGTS Digital** e de **transmissão programática da DCTFWeb** | Manuais FGTS Digital / DCTFWeb |
| P-19 | Existência de **API ou dados abertos do Sistema Mediador** para CCT/ACT | MTE — `mediador.srt@trabalho.gov.br` |
| P-20 | **Versão mais recente do layout CNAB 240** (posterior à V10.11 de 21/08/2023) e viabilidade de **pagamento em lote via Pix/API bancária** | [FEBRABAN](https://cmsarquivos.febraban.org.br/) |
| P-21 | **Prazos e obrigações específicas do eSocial Doméstico** (DAE) — fora do escopo desta pesquisa | [eSocial Doméstico](https://www.gov.br/esocial/pt-br/canais_atendimento/formularios/domestico/pagamento1) |
| P-22 | Particularidades de **Simples Nacional, MEI e órgãos públicos** em cada obrigação | — |
| P-23 | **Multa por 13º pago fora do prazo** | — |
| P-24 | Impactos da **Reforma Tributária (LC 214/2025)** sobre folha — em princípio nenhum sobre encargos trabalhistas, mas **não verificado** | LC 214/2025 |

---

## 14. FONTES (todas acessadas em 30/08/2026)

### eSocial
- S-1299 — Fechamento dos Eventos Periódicos — https://www.gov.br/esocial/pt-br/canais_atendimento/formularios/empresas/S-1299-Fechamento-dos-Eventos-Periodicos
- Comitê Gestor confirma mudança no prazo de envio do fechamento de folha — https://www.gov.br/esocial/pt-br/noticias/comite-gestor-confirma-que-havera-mudanca-no-prazo-de-envio-do-fechamento-de-folha
- MOS S-1.3 consolidado até a NO S-1.3 07/2026 — https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-07-2026.pdf
- Leiautes S-1.3 (NT 06/2026, rev. 09/04/2026) — https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026-rev-09-04-2026/index.html
- S-2230 — Afastamento Temporário — https://www.gov.br/esocial/pt-br/canais_atendimento/formularios/empresas/s-2230-afastamento-temporario
- Como pagar a primeira parcela do 13º salário — https://www.gov.br/esocial/pt-br/noticias/como-pagar-a-primeira-parcela-do-13o-salario
- Integração eSocial × FGTS Digital (evento S-5003) — https://www.gov.br/esocial/pt-br/noticias/integracao-com-esocial-todos-os-empregadores-ja-conseguem-visualizar-debitos-no-ambiente-de-testes-do-fgts-digital
- Substituição da DIRF PGD por eventos do eSocial (PA 01/2025) — https://www.gov.br/esocial/pt-br/noticias/substituicao-da-dirf-pgd-por-eventos-do-esocial-comeca-no-periodo-de-apuracao-01-2025
- eSocial substitui informações para RAIS e CAGED — https://www.gov.br/esocial/pt-br/noticias/esocial-substitui-informacoes-para-rais-e-caged
- Substituição de obrigações: eSocial alimenta CAGED e RAIS — https://www.gov.br/esocial/pt-br/noticias/substituicao-de-obrigacoes-dados-do-esocial-passaram-a-alimentar-o-caged-e-a-rais-para-obrigados
- Demonstrativo Consolidado do IRRF no Portal de Serviços — https://www.gov.br/esocial/pt-br/noticias/receita-federal/demonstrativo-consolidado-do-imposto-de-renda-retido-na-fonte-esta-disponivel-no-portal-de-servicos-da-receita-federal

### DCTFWeb / MIT
- DCTFWeb — página oficial RFB — https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/DCTFWeb
- Manual da DCTFWeb (atualização janeiro/2025) — https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/manuais/manual-dctfweb/manual-dctfweb-atualizacao-janeiro2025_versao_final.pdf
- Perguntas e Respostas da DCTFWeb — setembro/2025 — https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/DCTFWeb/arquivos/perguntas-e-respostas-dctfweb-2025-09-23.pdf
- Manual do MIT v1.0 — https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/DCTFWeb/arquivos/manual-mit-1-0-14-02.pdf
- Guia rápido da DCTFWeb — https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/passo-a-passo/dctfweb-guia-rapido.pdf
- IN RFB nº 2.005/2021 — http://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=115675
- IN RFB nº 2.237/2024 (MIT / fim da DCTF PGD) — http://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=141910
- IN RFB nº 2.248/2025 (prazo último dia útil) — http://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=142687
- RFB — "Contribuintes ganham mais tempo para entregar a DCTFWeb" (fev/2025) — https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/fevereiro/contribuintes-ganham-mais-tempo-para-entregar-a-dctfweb
- RFB — "Publicada IN que institui o MIT na DCTFWeb e substitui a DCTF" (dez/2024) — https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2024/dezembro/publicada-instrucao-normativa-que-institui-o-modulo-de-inclusao-de-tributos-2013-mit-na-dctfweb-e-substitui-a-dctf
- RFB — "Postergado prazo de entrega da DCTFWeb" (out/2023, IN 2.162/2023) — https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2023/outubro/postergado-prazo-de-entrega-da-dctfweb
- RFB — "Multas por atraso da DCTFWeb passarão a ser emitidas automaticamente" — https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2022/junho/multas-por-atraso-da-dctfweb-passarao-a-ser-emitidas-automaticamente
- Serviço gov.br — Declarar débitos e créditos tributários federais — https://www.gov.br/pt-br/servicos/declarar-debitos-e-creditos-tributarios-federais

### EFD-Reinf
- EFD-Reinf — Perguntas Frequentes RFB — https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/perguntas-frequentes/sped/efd-reinf/efdr
- 2 — Eventos da EFD-Reinf — https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/perguntas-frequentes/sped/efd-reinf/efdr/2-eventos-da-efd-reinf
- IN RFB nº 2.043/2021 — https://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=119859
- Manual da EFD-Reinf v2.1.2.1 — http://sped.rfb.gov.br/estatico/28/40FAAC1C636CC110D4C12D2790B43C641C6BCA/Manual%20da%20EFD-Reinf%20vers%C3%A3o%202.1.2.1.pdf
- RFB — prorrogação da obrigatoriedade da série R-4000 (IN 2.133/2023) — https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2023/marco/receita-federal-prorroga-o-inicio-de-obrigatoriedade-dos-eventos-da-efd-reinf-referentes-as-retencoes-de-irpf-csll-pis-e-cofins
- Serviço gov.br — Entregar EFD-Reinf — https://www.gov.br/pt-br/servicos/efd-reinf

### FGTS Digital
- Portal FGTS Digital — https://www.gov.br/fgtsdigital · sistema: https://fgtsdigital.sistema.gov.br
- FGTS Digital em produção (MTE) — https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/comunicados/fgts-digital-em-producao
- Novo prazo para recolhimento do FGTS mensal — dia 20 — https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/videos-e-tutoriais/novo-prazo-para-recolhimento-do-fgts-mensal-dia-20
- "ATENÇÃO: o prazo de recolhimento do FGTS ainda não mudou" — https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/comunicados/fgts-2013-novo-prazo-de-recolhimento
- Legislação do FGTS Digital — https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/legislacao
- Perguntas Frequentes — FGTS Digital (MTE) — https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/perguntas-frequentes
- Manual de Orientação do FGTS Digital v1.60 (05/05/2026) — https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/manual-e-documentacao-tecnica/manual-de-orientacao-do-fgts-digital-versao-1-60-05-05-2026.pdf
- Nota Orientativa FD nº 08/2025 — FGTS em reclamatória trabalhista — https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/manual-e-documentacao-tecnica/nota-orientativa-fd-08-2025-recolhimento-de-fgts-em-reclamatoria-trabalhista.pdf
- Órgãos públicos no FGTS Digital a partir de 01/2025 — https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/comunicados/orgaos-publicos-devem-utilizar-o-fgts-digital-para-recolher-o-fgts-da-competencia-janeiro-2025
- Manual Operacional do Empregador — Crédito do Trabalhador — https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/fgtsdigital/manual-e-documentacao-tecnica/manual-operacional-do-empregador-programa-credito-do-trabalhador-v2-16-05-25.pdf
- Lei nº 8.036/1990 consolidada — https://www.planalto.gov.br/ccivil_03/leis/l8036consol.htm

### RAIS / CAGED / DIRF
- Portal RAIS — https://www.rais.gov.br/sitio/index.jsf
- Quem deve declarar a RAIS Genérica — https://www.rais.gov.br/sitio/quem_deve_declarar.jsf
- Serviço gov.br — Entregar a RAIS — https://www.gov.br/pt-br/servicos/entregar-a-relacao-anual-de-informacoes-sociais
- RFB — "Com o fim da DIRF, empregadores devem estar atentos ao eSocial e à EFD-Reinf" (jul/2025) — https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/julho/a-declaracao-do-imposto-sobre-a-renda-retido-na-fonte-dirf-nao-sera-mais-utilizada
- RFB — prorrogação para 2025 da extinção da DIRF (IN 2.181/2024) — https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2024/marco/comunicado-receita-federal-prorroga-para-2025-a-extincao-da-declaracao-do-imposto-sobre-a-renda-retido-na-fonte
- IN RFB nº 2.096/2022 — http://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=125062
- Decreto nº 10.854/2021 — https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/decreto/d10854.htm

### Prazos de recolhimento / 13º / férias
- PGFN — Contribuição previdenciária patronal — https://www.gov.br/pgfn/pt-br/cidadania-tributaria/por-assunto/tributacao-sobre-a-folhas-de-salarios-e-outras/contribuicoes-previdenciarias-1/patronal-ou-dos-empregadores
- INSS — Prazos de recolhimento — https://www.gov.br/inss/pt-br/saiba-mais/seus-direitos-e-deveres/calculo-da-guia-da-previdencia-social-gps/prazos-de-recolhimento
- PGFN — Contribuições devidas a Terceiros (Sistema S e fundos) — https://www.gov.br/pgfn/pt-br/cidadania-tributaria/por-assunto/tributacao-sobre-a-folhas-de-salarios-e-outras/contribuicoes-devidas-a-terceiros
- MTE — 13º salário: direito, regras e prazos — https://www.gov.br/trabalho-e-emprego/pt-br/noticias-e-conteudo/2025/novembro/decimo-terceiro-salario-entenda-o-direito-regras-e-prazos-de-pagamento
- Lei nº 4.749/1965 — https://www.planalto.gov.br/ccivil_03/leis/l4749.htm
- Serviço gov.br — Comunicar Férias Coletivas — https://www.gov.br/pt-br/servicos/comunicar-ferias-coletivas
- CLT (Decreto-Lei nº 5.452/1943) compilada — http://www.planalto.gov.br/ccivil_03/decreto-lei/del5452compilado.htm

### Multas / fiscalização
- Portaria MTE nº 1.131, de 03/07/2025 (multas) — https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/credito-do-trabalhador/legislacao-do-governo-federal/portaria-mte-no-1-131-de-3-de-julho-de-2025-multas.pdf
- Portaria MTP nº 667/2021 compilada (21/03/2024) — https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3/PDFPortarian667de8novembrode2021compilada21.03.2024.pdf

### Ponto eletrônico
- Portaria MTP nº 671/2021 compilada (20/10/2023) — https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3/portaria-no-671-de-8-de-novembro-de-2021-compilada-20-10-2023.pdf
- Perguntas e Respostas — Portaria nº 671/2021 (REP) — https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/fiscalizacao-do-trabalho/Perguntas%20e%20Respostas%20REP
- Registro Eletrônico de Ponto (REP) — MTE — https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/fiscalizacao-do-trabalho/rep
- Portarias vigentes — MTE — https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3

### CCT / ACT
- Sistema Mediador — Consultar Instrumentos Coletivos Registrados — https://mediador.trabalho.gov.br/sistemas/mediador/ConsultarInstColetivo
- Serviço gov.br — Consultar Instrumento Coletivo de Trabalho — https://www.gov.br/pt-br/servicos/consultar-instrumento-coletivo-de-trabalho
- MTE — Registro de convenções e acordo coletivo de trabalho — https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/mediacao/registro-de-convencoes-e-acordo-coletivo-de-trabalho
- Manual do Sistema Mediador — https://www.gov.br/trabalho-e-emprego/pt-br/pdfs/manual-do-sistema-mediador-srt-digital.pdf
- Serviço gov.br — Registrar Instrumentos Coletivos de Trabalho — https://www.gov.br/pt-br/servicos/registrar-instrumentos-coletivos-de-trabalho

### Bancos
- FEBRABAN — Layout padrão CNAB 240, V10.11 (21/08/2023) — https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Layout%20padrao%20CNAB240%20V%2010%2011%20-%2021_08_2023.pdf
- FEBRABAN — V10.10 (30/08/2022) — https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Layout%20padrao%20CNAB240%20V%2010%2010%20-%2030_08_2022_2.pdf
- FEBRABAN — V10.09 (14/10/2021) — https://cmsarquivos.febraban.org.br/Arquivos/documentos/PDF/Layout%20padrao%20CNAB240%20V%2010%2009%20-%2014_10_21.pdf

---

## 15. IMPLICAÇÕES DIRETAS PARA O MÓDULO LIOR

1. **Calendário como dado, não como código.** Cada obrigação vira registro em tabela com:
   `obrigacao`, `competencia_ref`, `dia_base`, `regra_ajuste_dia_nao_util` (**ANTECIPA / POSTERGA /
   NÃO CONFIRMADO**), `norma`, `url_fonte`, `data_verificacao`, `vigencia_inicio`, `vigencia_fim`.
   Regra de ajuste `NÃO CONFIRMADO` ⇒ alerta, nunca palpite.
2. **Duas datas por obrigação**: **prazo legal** e **prazo operacional**. Na DCTFWeb elas divergem em
   até 10 dias e a divergência é a maior fonte de multa do ciclo.
3. **CCT como tabela viva por cliente/estabelecimento**, com número de registro no Mediador, vigência
   e URL. Instrumento vencido ⇒ folha **PROVISÓRIA** + pendência + tarefa no Kanban.
4. **Conciliação automática** folha × **S-5003** (FGTS) e folha × DCTFWeb antes do dia 20.
5. **Retenções de terceiros (EFD-Reinf) fora do escopo do DP, dentro do escopo do fechamento.** O
   painel do mês deve mostrar o **status do fechamento fiscal (R-2099/R-4099 e MIT)**, senão o DP é
   cobrado por um atraso que não é dele.
6. **Nenhuma multa exibida ao cliente sem norma e URL** — as faixas marcadas ○ na seção 9 não podem
   aparecer na UI enquanto forem pendência.

---

*G41 Inteligência Contábil — Insights Impulsionam*
