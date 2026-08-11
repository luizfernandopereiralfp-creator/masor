# Fontes oficiais e estratégia de atualização — Masor

> Catálogo de fontes para a **camada de inteligência tributária** pesquisar e manter as
> regras. Princípio inegociável (ver `CLAUDE.md`): **nada entra em produção sem fonte
> oficial e aprovação humana**. Itens marcados _(não confirmado)_ precisam de checagem
> antes de uso. Derivado de pesquisa em 11/08/2026 — reverificar periodicamente.

## 1. Catálogo de fontes oficiais

### Federal — Receita Federal
| Fonte | URL | Fornece | Formato | Cadência |
|---|---|---|---|---|
| TIPI (IPI + NCM) | https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/legislacao/tipi-tabela-de-incidencia-do-imposto-sobre-produtos-industrializados | NCM vigente, IPI | PDF/decreto | irregular (decretos/ADE) |
| Monofásico PIS/COFINS | Lei 10.147/2000 (higiene/cosmético/medicamento); 10.485/2002 (autopeças); lista operacional na **Tabela 4.3.10 da EFD-Contribuições (SPED)** | NCMs monofásicas | Tabela SPED baixável | trimestral + gatilho legislativo |
| Siscomex / tratamento adm. por NCM | https://www.gov.br/siscomex | classificação/comex | HTML | — |

### Portal Nacional da NF-e (parser + códigos)
- https://www.nfe.fazenda.gov.br/ — **XSD do leiaute 4.00** (dicionário de `infNFe/det/prod/imposto/ICMS/PIS/COFINS`), Notas Técnicas, tabelas **CST/CSOSN/CFOP** e, para a Reforma, **cClassTrib** (pacote XSD da NT 2025.002). Assinar releases de NT — crítico em 2026–2027.

### CONFAZ (ST / CEST)
- https://www.confaz.fazenda.gov.br/ — **Convênio ICMS 142/2018** (regras gerais da ST + CEST×NCM, Anexos II–XXVI): https://www.confaz.fazenda.gov.br/legislacao/convenios/2018/CV142_18 · Regime geral ST: https://www.confaz.fazenda.gov.br/legislacao/substituicao-tributaria/regime-geral-st — HTML, cadência alta.

### SEFAZ por UF (RICMS, alíquota interna, FCP, MVA) — priorizar SP/MG/RJ (mercado Vantajoso)
- SP — https://portal.fazenda.sp.gov.br/ (interna padrão 18%; ST no Anexo XX; Portaria SRE 94/2025 tirou perfumaria/higiene da ST em 01/04/2026)
- Demais UFs têm portal próprio; FCP (0,5–2%) e MVA variam por UF e por produto. Cadência média/alta (decreto estadual); atenção à virada de ano (mudanças de alíquota interna com 90 dias de anterioridade).

### Reforma Tributária (IBS/CBS/IS)
- EC 132/2023 — https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc132.htm
- LC 214/2025 — https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm (**art. 125** cesta básica nacional alíquota zero; **art. 348** ano-teste 2026 IBS 0,1%+CBS 0,9% informativos)
- LC 227/2026 (Comitê Gestor do IBS) — https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp227.htm
- Portal Reforma / Min. Fazenda — https://www.gov.br/fazenda/pt-br/assuntos/reforma-tributaria
- **Calculadora RTC oficial (Receita)** — https://piloto-cbs.tributos.gov.br/servico/calculadora-consumo/calculadora · Portal `consumo.tributos.gov.br`. Oficial, open source, com **componente local expondo API** → **fonte normativa canônica de IBS/CBS/IS**.

### Apoio (não normativo)
- IBPT "De Olho no Imposto" (Lei 12.741/2012, carga aproximada por NCM/UF) — https://deolhonoimposto.ibpt.org.br/Empresa — semestral.
- SUFRAMA (ZFM) — https://www.gov.br/suframa

## 2. Estratégia de atualização do banco

Fluxo obrigatório: **coleta → detecção de mudança (hash + data) → staging → diff legível →
proposta estruturada por IA (com fonte/trecho) → aprovação humana → publicação versionada**
(regra antiga vira histórico; grava origem + data + hash). Nunca sobrescrever a partir de um
sinal único.

| Regra | Fonte canônica | Estruturado? | Cadência de verificação |
|---|---|---|---|
| IBS/CBS/IS | Calculadora RTC + LC 214/227 | Sim (API/componente versionado) | **semanal** em 2026–2027; gravar a versão do RTC usada em cada cálculo |
| NCM/TIPI (IPI) | Receita — TIPI | Semi (PDF) | mensal + gatilho por ADE/decreto |
| CEST×NCM×MVA (ST) | CONFAZ 142/2018 + protocolos + RICMS/UF | Parte HTML | quinzenal |
| Alíquota interna / FCP por UF | RICMS de cada SEFAZ | HTML/PDF | mensal + gatilho de virada de ano |
| Monofásico PIS/COFINS | Leis 10.147/10.485 + Tabela 4.3.10 SPED | Tabela SPED | trimestral + gatilho legislativo |
| CST/CSOSN/CFOP/cClassTrib | Portal NF-e (NT/XSD) | Sim (XSD/NT) | por release de NT |
| IBPT (carga aproximada) | IBPT | Arquivo | semestral |

**Recomendação:** para IBS/CBS, **delegar o cálculo ao componente RTC oficial** e apenas
versionar o build usado — reduz risco de divergência normativa na transição.

## 3. Referências open-source (aprender estrutura; **não** dependência de produção)
- **vilsonneto/tributos-br** (TS, MIT) — https://github.com/vilsonneto/tributos-br — motor **parametrizado** (alíquotas como argumento, não hard-coded) de ICMS/ST/DIFAL/MVA/PIS-COFINS/CBS-IBS, com **trilha de auditoria** por operação; validado contra 9 NF-e reais. Melhor referência de modelagem e do padrão "memória de cálculo".
- **nfephp-org/sped-nfe** — https://github.com/nfephp-org/sped-nfe — XSD oficiais leiaute 4.00 (parser XML). `sped-da` (DANFE), `sped-efd` (registros SPED/monofásico).
- **akretion/nfelib** (Python) — https://github.com/akretion/nfelib — parse tipado de NF-e 4.0.
- **luizinhoh2o1/tabelas-ibpt** (JSON) — https://github.com/luizinhoh2o1/tabelas-ibpt — IBPT em JSON (bootstrap/histórico; **não** fonte viva).
- **dangelofoliveira/product-ncm-cest-api** — https://github.com/dangelofoliveira/product-ncm-cest-api — modelagem NCM×CEST×MVA por UF _(licença não confirmada)_.
- **Bluesoft Cosmos** — https://cosmos.bluesoft.com.br/ncms — maior base de produtos BR (EAN/GTIN→NCM), APIs de Reforma (NCM→CBS/IBS). Benchmark de UX.

## 4. Padrões de produto a imitar (Econet, Systax, Bluesoft, Thomson Reuters)
1. **Entrada por EAN/GTIN → NCM → CEST → regra** — o operador de supermercado pensa em código de barras, não em NCM.
2. **"Regra pronta"** (alíquota, CST/CSOSN, MVA, monofásico sim/não) + **explicação em linguagem simples** + link para a norma.
3. **Alerta proativo por NCM/segmento** quando a regra muda (data + diff) → tarefa no Kanban.
4. **Memória de cálculo auditável** por operação (padrão do tributos-br e do RTC oficial).

## 5. Pendências / não confirmado (due diligence antes de usar)
- Licenças de `product-ncm-cest-api`, `fiscal-rs` — verificar `LICENSE` no repo.
- URL/nome exatos do repo `CalculadoraRTC` (citado via artigo, não aberto).
- Ofertas/preços de IOB, Fisconet, Taxweb, Sieg, Arquivei — não confirmados.
- `cClassTrib`/`cBenef` e alíquotas de referência IBS/CBS: **fonte viva** em 2026, não fixar.
