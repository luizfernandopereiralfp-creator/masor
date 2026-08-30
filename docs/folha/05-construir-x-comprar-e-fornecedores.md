# Folha de pagamento e eSocial — Construir x Comprar e mapa de fornecedores

> **Para:** Fernando / G41 Inteligência Contábil (Curitiba)
> **Contexto da decisão:** premissa inicial = contratar um sistema *white label* para enviar as informações ao eSocial; alternativa = fazer tudo internamente (dentro do Lior).
> **Data da pesquisa:** 30/08/2026. Todas as URLs foram acessadas em 30/08/2026.
> **Regra aplicada:** nada afirmado sem fonte. Preço não publicado = `PENDÊNCIA`. Estimativa aparece rotulada como estimativa, com a base declarada.

---

## 0. Nota de método e limite de verificação (leia antes de usar este documento)

A pesquisa foi feita em ambiente com **proxy de saída restritivo**. Consegui **abrir e ler diretamente** apenas páginas de `github.com`. Os domínios `tecnospeed.com.br`, `resocial.com.br`, `docs-api.oobj.com.br`, `dev.senior.com.br` e `gov.br` **foram bloqueados para leitura direta** neste ambiente.

Consequência prática, e ela importa:

| Nível de confiança | O que significa | Como aparece aqui |
|---|---|---|
| **A — verificado** | Página oficial lida integralmente por mim | repositórios GitHub (licença, linguagem, atividade) |
| **B — indexado** | O buscador retornou a página no domínio oficial do fornecedor e o trecho descritivo veio dela | maioria dos fornecedores abaixo |
| **C — terceiro** | Informação veio de blog, marketplace ou agregador, não do fornecedor | sempre marcado `[C]` |
| **PENDÊNCIA** | Não confirmado | seção 10 |

**Nenhum número comercial deste documento deve ir para uma proposta sem reconfirmação em nível A.** Antes de negociar, abra você mesmo as URLs da seção 11.

---

## 1. Resumo executivo — e o desafio à premissa

**A premissa está mal formulada, e isso é o achado mais importante desta pesquisa.**

"Contratar um white label para enviar as informações ao eSocial" trata o eSocial como se fosse um canudo de transmissão, tipo gateway de pagamento. Não é. **O evento S-1200 (remuneração) *é* a folha de pagamento em XML.** Ele carrega cada rubrica, com o código da tabela 3 do eSocial e as incidências de INSS, FGTS e IRRF já classificadas. O S-1299 (fechamento) só é aceito se o conjunto fechar. O FGTS Digital e a DCTFWeb são alimentados automaticamente pelo que você transmitiu.

Ou seja: **não existe "só enviar ao eSocial".** Quem envia já calculou. O canudo é ~10–15% do problema; o motor de cálculo e o passivo trabalhista são os outros 85–90%. Comprar só o transporte não resolve o que dá processo.

As três perguntas certas, em ordem:

1. **Quem é o dono do cálculo** (e, portanto, do risco de passivo)?
2. **O que a G41 vende que o cliente escolhe** — o cálculo (commodity) ou a experiência/prazo/clareza (diferenciação)?
3. **O que trava a saída** se o fornecedor sumir ou dobrar o preço?

Minha recomendação, detalhada na seção 7, em uma linha: **não construa motor de folha; não compre "white label de folha" (o mercado disso é fino e não confirmado); use um sistema tradicional de folha para escritório contábil como motor de registro e construa no Lior a camada de experiência — que é onde está a diferenciação e onde um bug não gera multa trabalhista.**

---

## 2. As cinco categorias — o que você está comprando de fato

Elas não são substituíveis entre si. Misturar é o erro clássico de negociação.

| # | Categoria | O que entrega | O que **continua sendo seu** | Quem responde pelo erro de cálculo |
|---|---|---|---|---|
| **(a)** | **API/gateway de transmissão ao eSocial** | Monta XML a partir do seu JSON, assina com certificado, transmite, trata retorno/recibo, acompanha leiaute | **A folha inteira**: rubricas, incidências, bases, cálculo, fechamento | **Você** |
| **(b)** | **Motor de cálculo de folha como serviço/biblioteca** | Recebe eventos (admissão, verbas, afastamento) e devolve a folha calculada | Cadastro, interface, conferência, relacionamento | Contratualmente o fornecedor, na prática **você** perante o cliente |
| **(c)** | **Folha completa white label / OEM** | Sistema inteiro com sua marca, seu domínio, sua precificação | Marca, preço, suporte de 1º nível, relacionamento | Fornecedor no contrato; **sua marca** na percepção do cliente |
| **(d)** | **Folha tradicional para escritório contábil** | Sistema multiempresa maduro, marca do fornecedor | Operação e relacionamento | Fornecedor (limitado ao contrato) |
| **(e)** | **BPO de folha** | Pessoas processando a folha, não software | Carteira e relacionamento (se for BPO "invisível") | Prestador do serviço |

**Ponto que o mercado esconde:** a transmissão ao eSocial **não é uma trilha paga**. A Receita/MTE publicam a especificação livremente e qualquer software com certificado ICP-Brasil A1 ou A3 transmite direto, de graça. Inclusive existe hoje **API REST oficial**, assíncrona, JSON com Bearer token, lote de até 50 eventos ([especificação gov.br](https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/4915736_especificacao_recepcaolote_empresas.pdf)). O que você paga em (a) é: manutenção de leiaute, assinatura XMLDSig, fila/retentativa/recibo, tradução de erro e alguém para ligar às 23h do dia 15. É valor real — mas é uma camada fina, e é a mais fácil de trocar de fornecedor.

---

## 3. Fornecedores confirmados, por categoria

### 3.a — API/gateway de transmissão ao eSocial

| Fornecedor | URL | O que entrega | Doc pública | White label / OEM | Cobrança publicada | Maturidade | Confiança |
|---|---|---|---|---|---|---|---|
| **TecnoSpeed (PlugDFe eSocial)** | [tecnospeed.com.br/plugdfe/esocial](https://tecnospeed.com.br/plugdfe/esocial/) | Geração, assinatura, transmissão e consulta dos **48 eventos** do eSocial; **API REST HTTPS** (para SaaS/multitenant) **ou componente DLL/OCX/BPL** (para ERP desktop Delphi/C#/VB6) | **Sim** — Central de Atendimento pública: [Guia Geral API eSocial](https://atendimento.tecnospeed.com.br/hc/pt-br/articles/4404268497175-Guia-Geral-API-eSocial) e [Guia Geral Componente](https://atendimento.tecnospeed.com.br/hc/pt-br/articles/4404184018839-Guia-Geral-Componente-eSocial); repositório de exemplos em [github.com/tecnospeed/Componente_eSocial](https://github.com/tecnospeed/Componente_eSocial) | **Sim, é o modelo de negócio.** Posicionamento público explícito de *não concorrer com o cliente final* ([blog oficial](https://blog.tecnospeed.com.br/o-plugdfe-da-tecnospeed-atua-para-desenvolvedores-e-sem-concorrencia-com-clientes-finais/)); white label documentado em outros produtos da casa (PlugNotas, PlugSign) | **`PENDÊNCIA — preço não publicado`.** Único valor localizado: **R$ 180,00/hora técnica** em atendimento emergencial `[B, reconfirmar]` | Alta. Fornecedor de software houses, atua há anos como *hub* de DF-e; mantém repositório público de exemplos com commit em 18/05/2026 `[A]` | **B** |
| **RESocial** | [resocial.com.br](https://www.resocial.com.br/) | Infraestrutura de API para eSocial: montagem automatizada dos XMLs seguindo as notas técnicas, transmissão **síncrona ou assíncrona via HTTP**, ponte REST para qualquer ERP/legado, tradução de erros técnicos em mensagem legível | **`PENDÊNCIA`** — site institucional indexado; **não localizei portal de documentação técnica pública** | **`PENDÊNCIA`** — posicionamento é "API infrastructure", mas white label não está declarado | **`PENDÊNCIA — preço não publicado`** | **`PENDÊNCIA`** — não localizei razão social, CNPJ, ano de fundação nem base de clientes verificável. **Tratar como fornecedor não qualificado até due diligence societária.** | **B fraco** |

**Investigados e NÃO confirmados nesta categoria:**

- **Oobj** ([oobj.com.br](https://oobj.com.br/)) — empresa real, fundada em março/2008, grupo eSales, hoje ligada à Avalara; oferece SaaS e In House para documentos fiscais e **declara oferta white label** para seus produtos. **Porém: não consegui confirmar produto de eSocial.** A documentação de API ([docs-api.oobj.com.br](https://docs-api.oobj.com.br/docs/documentacao/introducao/)) é de **DF-e** (NF-e, NFS-e, CT-e etc.). `PENDÊNCIA — não foi possível confirmar que a Oobj tem produto de eSocial em fonte pública.`
- **Migrate** — **não foi possível confirmar a existência de fornecedor brasileiro de eSocial com esse nome.** Buscas por "Migrate eSocial/EFD-Reinf" retornaram apenas conteúdo genérico sobre as obrigações. `PENDÊNCIA — fornecedor não confirmado; pedir ao Fernando o site exato ou descartar.`
- **Nuvem Fiscal, Focus NFe, Webmania** — APIs fiscais reais e com documentação pública ([dev.nuvemfiscal.com.br/docs](https://dev.nuvemfiscal.com.br/docs/), [focusnfe.com.br](https://focusnfe.com.br/)), mas **cobrem DF-e, não eSocial**. Não servem.
- **L2MAKER** ([l2maker.com.br/documentacao/api-esocial](https://www.l2maker.com.br/documentacao/api-esocial/)) — publica API de eSocial e Reinf, mas voltada ao ecossistema *Maker* (4GL). Nicho estreito; não avaliei como candidato sério para stack TS/Node. `PENDÊNCIA se houver interesse.`
- **ProSESMT** ([prosesmt.com.br/site/esocial](https://prosesmt.com.br/site/esocial/)) — declara API de integração com eSocial, mas o foco é **SST** (eventos S-2210/2220/2240), não folha. Não resolve o problema principal.
- **RWE Sistemas** — existe *connector* PHP de terceiro para a "API de eSocial da RWE Sistemas" ([github.com/Rwe-Devs/esocial-api-connector](https://github.com/Rwe-Devs/esocial-api-connector)) `[A]`. Fornecedor em si não avaliado. `PENDÊNCIA.`

### 3.b — Motor/engine de cálculo de folha como serviço ou biblioteca

**Conclusão dura: não encontrei, em fonte pública, nenhum fornecedor brasileiro que venda motor de cálculo de folha isolado, como serviço ou biblioteca licenciável, para você embutir no seu produto.**

O que existe e é frequentemente confundido com isso:

| Item | O que realmente é | Fonte |
|---|---|---|
| **Senior — API pública HCM Payroll** | API **do produto Senior HCM**, para integrar dados com o sistema deles. **Não é motor licenciável avulso.** Documentação pública existe: [dev.senior.com.br/api_publica/hcm_payroll](https://dev.senior.com.br/api_publica/hcm_payroll/) | B |
| **Bluesoft — API de importação de cálculo de folha** | API **de importação para o ERP Bluesoft** — recebe folha calculada, não calcula. | C |
| **Questor — API SYN** | Importação/exportação de dados de folha entre o Questor e sistemas parceiros: [docs.questor.com.br … api_syn_importacao_exportacao_dados](https://docs.questor.com.br/pt-br/Produtos/Gest%C3%A3oCont%C3%A1bil/FolhadePagamento/api_syn_importacao_exportacao_dados) | B |

`PENDÊNCIA NOMINAL — não foi possível confirmar, em fonte pública, a existência de "payroll engine as a service" no Brasil (equivalente ao que Check/Gusto Embedded fazem nos EUA). Se existir, é venda consultiva sem página pública. Vale uma rodada de perguntas diretas a TOTVS, Senior e Nasajon: "vocês licenciam o motor de cálculo isolado, por API, sem a interface?"`

**Leia isso como sinal, não como lacuna de pesquisa:** ninguém no Brasil vende o motor separado porque **o motor sozinho não tem valor sem os cadastros, as tabelas e o fechamento** — e porque assumir o cálculo de terceiro é assumir passivo trabalhista de terceiro. Ninguém quer.

### 3.c — Folha completa white label / OEM (marca da G41 por cima)

**Também não confirmado.** Existe mercado consolidado de **ERP white label** para gestão comercial — vhsys ([vhsys.com.br/revenda/white-label](https://www.vhsys.com.br/revenda/white-label/)), OGESTOR, Avante, MY SISTEMA, Safeh One, White ERP — mas são ERPs de PDV/estoque/financeiro/NF-e. **Nenhum deles confirmado com módulo de folha de pagamento white label para escritório contábil.**

`PENDÊNCIA NOMINAL — não foi possível confirmar, em fonte pública, nenhum fornecedor brasileiro que ofereça sistema de folha de pagamento completo em modelo white label/OEM para escritórios contábeis.`

Se algum vendedor afirmar que oferece, **exija por escrito** os itens do checklist da seção 8 — especialmente: marca visível nos PDFs de holerite, no XML transmitido e nos e-mails ao colaborador; e quem aparece no `procEmi`/certificado da transmissão.

### 3.d — Folha tradicional para escritório contábil (sem white label)

Esta é a categoria madura, real, com dezenas de anos de acompanhamento normativo já pago.

| Fornecedor | URL | Entrega | Doc/API pública | Cobrança publicada | Maturidade | Conf. |
|---|---|---|---|---|---|---|
| **Questor** | [questor.com.br](https://www.questor.com.br/) | Questor Cloud 100% web: Folha, Fiscal, Contábil, obrigações; integração nativa eSocial; automação de férias, 13º, pró-labore, DCTFWeb; processamento em lote | **Sim, e é boa** — [docs.questor.com.br](https://docs.questor.com.br/) público, com API Zen, API Empresarial, API Negócio e **API SYN de folha** | `PENDÊNCIA — preço não publicado` | Declara **+2 milhões de folhas/mês** processadas `[B]` | B |
| **Fortes Tecnologia (Fortes Pessoal)** | [fortestecnologia.com.br/…/fortes-pessoal](https://www.fortestecnologia.com.br/sistemas/gestao-de-pessoas/fortes-pessoal/) | Folha para DP de escritório contábil, aderente a eSocial, "34 robôs" de automação, geração de guias e obrigações, integração contábil nativa | Base de conhecimento pública ([ajuda.fortestecnologia.com.br](https://ajuda.fortestecnologia.com.br/)), inclusive [categoria de Notas Técnicas do eSocial](https://ajuda.fortestecnologia.com.br/kb/pt-br/category/esocial-notas-tecnicas). **API pública: `PENDÊNCIA`** | `PENDÊNCIA — preço não publicado` | Declara **+1 milhão de folhas/mês** `[B]` | B |
| **Domínio / Thomson Reuters (+ Onvio)** | [dominiosistemas.com.br](https://www.dominiosistemas.com.br/) | Suíte contábil com módulo Folha; Onvio traz nuvem, admissão de colaborador, envio ao eSocial, Portal do Empregado. Onvio disponível nos planos **Contábil Plus e Premium** | **Sim** — [Onvio BR Accounting API no Developer Portal da Thomson Reuters](https://developerportal.thomsonreuters.com/onvio-br-accounting-api), OAuth 2.0. **Atenção:** acesso exige solicitação por e-mail com callback URL; e a API documentada é **contábil/NF-e**, não folha | `PENDÊNCIA — preço não publicado` | Padrão de mercado no segmento contábil brasileiro; capital de multinacional | B |
| **Alterdata (Pack)** | [alterdata.com.br/pack](https://alterdata.com.br/pack) | Pack com Contábil, Fiscal e DP; integração bancária para pagamento de folha; envio ao eSocial; planos Contábil First / Fit / Plus / Empresarial | Documentação pública de rotinas ([ajuda.alterdata.com.br](https://ajuda.alterdata.com.br/wdp/calculo-da-folha-31295485.html)) | **Parcial e útil:** o **Pack Community é gratuito**, com limites declarados de **3 empresas, 10 empregados no WDP e 60 notas/mês no WFiscal** `[B]` ([community.alterdata.com.br](https://community.alterdata.com.br/comunidade/pack-community-1)). Planos pagos: `PENDÊNCIA` | Fornecedor tradicional do segmento | B |
| **Contmatic Phoenix** | [contmatic.com.br](https://www.contmatic.com.br/) | Contábil Phoenix com módulo Trabalhista: salários, encargos, férias, rescisão, 13º, DIRF, RAIS, CAGED, integração direta com **eSocial e FGTS Digital**; ecossistema com o Simplifique | Base de conhecimento pública ([autoatendimento.contmatic.com.br](https://autoatendimento.contmatic.com.br/)). **API pública aberta: `PENDÊNCIA`** — o material fala em integração dentro do próprio ecossistema | `PENDÊNCIA — preço não publicado` (o próprio material remete a conversa comercial) | Tradicional | B |
| **Calima ERP (Projetus TI)** | [calimaerp.com/folha-de-pagamento](https://www.calimaerp.com/folha-de-pagamento) | 100% web; módulos Contábil, Fiscal, Folha, Patrimonial; plano **Calima Pro** agrega Integra Contador, BOX, Site e **Calima Connect**; adequação ao eSocial | Central de ajuda pública ([ajuda.calimaerp.com](https://ajuda.calimaerp.com/pt/category/folha-de-pagamento-12op4dj/)) | `PENDÊNCIA — preço não publicado` | Projetus TI com **+30 anos** declarados `[B/C]` | B |
| **Nasajon** | [nasajon.com.br](https://nasajon.com.br/) | ERP em nuvem modular para escritórios contábeis: Contábil, Fiscal, Folha, Financeiro; declara **APIs de conexão** para integrar sistemas de terceiros | Base de conhecimento pública com artigos de **API externa** ([atendimento.nasajon.com.br](https://atendimento.nasajon.com.br/nasajon/artigos?atendimentoarea=areaexterna&tags=API-externa)). **Portal de dev público: `PENDÊNCIA`** | `PENDÊNCIA — preço não publicado` | Declara **43 anos** de arquitetura própria `[B]` | B |
| **SCI Sistemas Contábeis** | [visual.sci10.com.br/sistemas/folha-de-pagamento](https://visual.sci10.com.br/sistemas/folha-de-pagamento/) | Folha, Escrita Fiscal, Contábil, Financeiro e Administração para escritórios. Declara ter sido **o primeiro sistema do Brasil a integrar o eSocial no ambiente de testes do Serpro** `[B]` | `PENDÊNCIA` | `PENDÊNCIA — preço não publicado` | Tradicional | B |
| **Prosoft** | [prosoft.com.br](https://www.prosoft.com.br/) | Software contábil **desde 1986**; módulos Folha, Contábil, Fiscal | `PENDÊNCIA` | `PENDÊNCIA — preço não publicado` | 40 anos | B |
| **Sênior Sistemas (HCM)** | [senior.com.br/…/sistema-folha-de-pagamento](https://www.senior.com.br/solucoes/gestao-de-pessoas-hcm-4/sistema-folha-de-pagamento) | Senior HCM: folha, ponto, benefícios. **Foco em empresa final, não em escritório contábil multiempresa** | **Sim** — [dev.senior.com.br/api_publica/hcm_payroll](https://dev.senior.com.br/api_publica/hcm_payroll/) e [documentacao.senior.com.br](https://documentacao.senior.com.br/) (que inclusive publica as notas técnicas do eSocial) | `PENDÊNCIA — preço não publicado` | Alta | B |
| **TOTVS RH (linhas RM / Datasul / Protheus)** | [totvs.com/rh/folha-de-pagamento](https://www.totvs.com/rh/folha-de-pagamento/) | Folha corporativa escalável. Declara que **mais de 25% da folha CLT do Brasil** roda em sistemas TOTVS `[B]` | Central pública ([centraldeatendimento.totvs.com](https://centraldeatendimento.totvs.com/)) e [espacolegislacao.totvs.com/esocial](https://espacolegislacao.totvs.com/esocial/) | `PENDÊNCIA — preço não publicado` | Máxima | B |
| **Metadados** | [metadados.com.br](https://www.metadados.com.br/) | RH/DP: Folha, Ponto, Benefícios, Portal RH, SST; módulo eSocial ([app.metadados.com.br/esocial](https://app.metadados.com.br/esocial)). Matriz em Caxias do Sul/RS | `PENDÊNCIA` (mas é sistema de folha reconhecido pelo mercado: a **Gupy publica integração oficial com a Metadados**) | `PENDÊNCIA — preço não publicado` | Alta no segmento RH | B |
| **Benner** | [benner.com.br/sistema-de-folha-de-pagamento-e-rh](https://benner.com.br/sistema-de-folha-de-pagamento-e-rh) | Folha + RH corporativo, conexão com ERP, contábil e benefícios | `PENDÊNCIA` | `PENDÊNCIA — preço não publicado` | Alta (corporativo) | B |

### 3.e — BPO de folha (terceirizar o processamento, não o software)

| Fornecedor | URL | Entrega | Modelo | Conf. |
|---|---|---|---|---|
| **ContabExpress** | [contabexpress.com.br](https://contabexpress.com.br/) | **BPO operacional white label especificamente para escritórios contábeis**: assume DP, Contábil e Fiscal — folha, eSocial, lançamentos, conciliações, apurações e acessórias. Declara: *"você escolhe o modelo: atendimento direto ao cliente ou operação 100% de bastidor como backoffice invisível (white label)"*, com acompanhamento pela plataforma **Astro**; **+60 especialistas**; **10 anos** atuando como retaguarda | `PENDÊNCIA — preço não publicado` | B |
| **ADP Brasil** | [br.adp.com/…/servicos-terceirizacao](https://br.adp.com/o-que-oferecemos/folha-de-pagamento/servicos-terceirizacao.aspx) | BPO de folha; produtos globais GlobalView (até 42 países) e Celergo (até 140). **+70 anos** globais, **+20 anos** em serviços gerenciados `[B]` | `PENDÊNCIA — preço não publicado` | B |
| **Referência de mercado (marketplace, não fornecedor)** | [ohub.com.br/precos/folha-de-pagamento](https://www.ohub.com.br/precos/folha-de-pagamento) | Faixas publicadas por marketplace: **a partir de ~R$ 207/mês até 5 funcionários**; ~R$ 13.000/mês para 2 CNPJs e 200 colaboradores; cobrança composta por mensalidade por funcionário + eventos extras | `[C]` — **não é preço de fornecedor**, é referência agregada. Use só para calibrar ordem de grandeza | C |

### 3.f — Nomes da lista que **não servem** (verificados)

Vale registrar para não perder tempo de novo:

| Nome | Veredito | Base |
|---|---|---|
| **Sittax** | **Não faz folha.** Plataforma fiscal: Simples Nacional, Lucro Presumido/Real, ICMS-ST e DIFAL, Token, Monitora, recuperação de créditos. Planos Essencial/Controle/Gestão, **sem preço publicado** | [sittax.com.br](https://sittax.com.br/), [/planos](https://sittax.com.br/planos/) |
| **Tactium** | **Nada a ver com folha.** É CRM/omnichannel/contact center. Razão social Softium Informática, Fortaleza, desde 1996 | [tactium.com.br/empresa](https://tactium.com.br/empresa/) |
| **Gupy** | **Não calcula folha.** É recrutamento + admissão digital. Ela **se integra a** folhas de terceiros — publica integrações oficiais com Protheus, RM TOTVS, ADP, LG Nuvem e Metadados | [gupy.io/integracao/folha-pagamento-rm-totvs](https://www.gupy.io/integracao/folha-pagamento-rm-totvs), [developers.gupy.io](https://developers.gupy.io/docs/integra%C3%A7%C3%B5es-com-folha-de-pagamento) |
| **eGestor** | **Não confirmado.** Buscas por "eGestor white label folha" retornam OGESTOR, vhsys e outros ERPs comerciais — nenhum com folha para contabilidade | `PENDÊNCIA` |
| **Xerpa** | **Não confirmado.** Aparece apenas em listagens antigas de startups de RH; **não localizei site oficial ativo com produto de folha**. Tratar como possivelmente descontinuada/adquirida até verificar | `PENDÊNCIA` |
| **Pontomais / Tangerino / Sólides** | **Ponto eletrônico e RH, não folha para escritório contábil.** Tangerino virou **Sólides Ponto**. A Sólides tem "Folha Digital", mas o alvo é a **empresa final**, não a contabilidade multiempresa. Preço `[C]`: "a partir de R$ 99,90/mês", por colaborador/mês, sem mínimo — **snippet, reconfirmar** | [solides.com.br/planos-e-precos-completos](https://solides.com.br/planos-e-precos-completos/) |
| **Convenia** | Faz DP e folha (mensal, adiantamento, complementar, 13º, PLR, guias FGTS/INSS/IRRF, eSocial e DCTFWeb) e também BPO — mas **alvo é a empresa final**. Preço não publicado | [convenia.com.br/departamento-pessoal](https://www.convenia.com.br/departamento-pessoal) |
| **Migrate** | **Existência não confirmada** como fornecedor de eSocial | `PENDÊNCIA` |

---

## 4. Open source — o que realmente reduz o custo de construir

Verificado **em nível A** (li a página do repositório: licença, linguagem, atividade, escopo) em 30/08/2026.

| Projeto | Ling. | Licença **verificada** | O que faz | Atividade | Serve para a G41? |
|---|---|---|---|---|---|
| [nfephp-org/sped-esocial](https://github.com/nfephp-org/sped-esocial) | PHP | **"LGPLv3 ou MIT"** conforme a documentação do repositório — o GitHub classifica como `NOASSERTION`. **Ler o LICENSE antes de qualquer uso** | Constrói XML dos eventos, envia lote, consulta via SOAP com certificado A1. Cobre leiautes **S-1.0, S-1.1, S-1.2 e S-1.3** | 1.012 commits; push em 01/07/2026; **aviso do próprio repo: "Biblioteca em desenvolvimento, TESTE antes de usar"** | **[REF]** — melhor mapa existente das regras de montagem. Não é PHP a stack do Lior |
| [qualitaocupacional/libesocial](https://github.com/qualitaocupacional/libesocial) | Python | **Apache-2.0** ✅ (permissiva, compatível com produto fechado) | Valida XML dos eventos, assina com A1 `.pfx/.p12` (PKCS#12), comunica com o webservice (envio de lote e consulta). Traz cadeia de certificados do SERPRO embutida | 75 commits; **último push 22/08/2024 — ~2 anos parado** | **[REF forte]** — a parte de assinatura e cadeia SERPRO vale ouro como referência. **Não usar em produção sem reauditar leiaute** |
| [tst-labs/esocial](https://github.com/tst-labs/esocial) | Java 8 / Spring Boot | **BSD-3-Clause** ✅ | Projeto do **Tribunal Superior do Trabalho**. Módulos: `esocial-comunicacao` (WSDL), `esocial-esquemas` (XSD), `esocial-jt-dominio`, `esocial-jt-service` (**API REST**). Recebe JSON → gera XML → assina → transmite → busca retorno | 547 commits, push em 03/07/2026 — **o mais ativo**. Declara esquemas **S-1.3 (NT 03/2025)**, comunicação 1.6. Marcado `[PROJETO EM DESENVOLVIMENTO] — API instável` | **[REF]** e **[DEP se aceitar Java]**. É a melhor referência arquitetural pública de "JSON entra, evento assinado sai" |
| [emensageria/emensageria](https://github.com/emensageria/emensageria) | Python 3.12 / Django 4.2 / Postgres 17 / Docker | **AGPL-3.0** ⛔ | Sistema de mensageria do eSocial: envio e consulta periódicos automatizados, persistência de certificados e artefatos | 70 commits; push 11/04/2026; CI + SonarCloud | **EVITAR.** AGPL contamina SaaS: usar em serviço de rede obriga a abrir o código do Lior. Só como [REF] visual |
| [devcosta/Tabelas-do-Governo](https://github.com/devcosta/Tabelas-do-Governo) | JSON | **Sem licença** ⛔ | CNAE, CBO, Natureza Jurídica, CST e **Rubricas do eSocial** em JSON | Push 23/05/2024 | **Não incorporar** (sem licença = todos os direitos reservados). Como as tabelas são dados públicos, **baixe da fonte oficial** |
| [akretion/esociallib](https://github.com/akretion/esociallib) | Python | **Sem licença** ⛔ | Leitura/gestão de documentos eSocial | Push 22/05/2023 | Não incorporar |
| [TadaSoftware/PyeSocial](https://github.com/TadaSoftware/PyeSocial) | Python | GPL-3.0 ⛔ | Comunicação com webservices | Push **2018** — morto | Não usar |
| [DeHor-Labs/mcp-fiscal-brasil](https://github.com/DeHor-Labs/mcp-fiscal-brasil) | Python | **MIT** ✅ | Servidor MCP fiscal com tabelas offline; menciona eSocial entre 44 tools | 276 ★, push 23/08/2026 — ativo | **[DATASET/REF]** já mapeado em `docs/reuso-open-source.md` |

### O achado que muda a conta de "construir"

**Não existe biblioteca de eSocial madura em TypeScript/Node.** Rodei busca no GitHub por `esocial` em TS/JS/Node ordenada por atualização: **os resultados são todos projetos pessoais, TCCs e protótipos, com 0 estrelas.** O único TS relevante é [`esocial-mtls-relay`](https://github.com/diegox300/esocial-mtls-relay), criado em **28/08/2026** — dois dias atrás, sem estrelas.

**E não existe absolutamente nada de motor de cálculo de folha brasileiro open source utilizável.** A busca por `folha de pagamento CLT INSS IRRF` no GitHub, ordenada por estrelas, retorna **o repositório mais estrelado com 1 estrela**. Tudo é exercício de faculdade. Compare com o lado fiscal, onde a G41 encontrou `tributos-br` (MIT, com ICMS/ST/DIFAL/FCP prontos) — **aqui não há equivalente.**

> **Tradução para a decisão:** no fiscal, o open source cortou meses de trabalho do Masor. Na folha, ele corta **quase nada** no cálculo e **pouco** na transmissão (e o que corta está em PHP, Python ou Java — não na stack do Lior). O custo de construir folha é **muito mais alto** que o custo que a G41 já pagou para construir o Masor. Se a intuição do Fernando está calibrada por "o Masor deu certo, folha vai dar também", ela está calibrada errado.

---

## 5. Construir x Comprar — comparação estruturada

> ⚠️ Toda a coluna de esforço é **ESTIMATIVA MINHA**, em pessoa-mês de dev sênior full-stack brasileiro. **Base declarada:** (i) escopo funcional derivado da leitura do MOS S-1.3 e dos repositórios acima; (ii) ausência confirmada de biblioteca em TS; (iii) o fato de os incumbentes terem 20–40 anos de acúmulo normativo. **Não é cotação, não é benchmark de mercado, não tem fonte.** Trate como ordem de grandeza para decidir, não para orçar.

### 5.1 Prazo até o primeiro cliente em produção

| Caminho | Prazo estimado | O que o prazo esconde |
|---|---|---|
| (e) BPO white label | **2–6 semanas** | Depende de contrato e onboarding, não de código |
| (d) Folha tradicional | **1–3 meses** | Migração de bases é o gargalo, não a implantação |
| (c) White label completo | **?** | **Não estimável — fornecedor não confirmado** |
| (a) Comprar transporte + construir o resto | **12–24 meses** | O transporte fica pronto em semanas; o motor é que não |
| Construir tudo | **18–36 meses** | E o primeiro cliente é cobaia de passivo trabalhista |

### 5.2 Custo de construção (estimativa rotulada)

| Peça | Pessoa-mês est. | Por quê |
|---|---|---|
| Camada de transmissão eSocial (a) — geração XML dos ~12–15 eventos de um cliente CLT típico, **XMLDSig** enveloped com canonicalização, envio de lote, consulta assíncrona, fila, retentativa, recibo, tradução de erro, ambiente de produção restrita | **4–7** | Sem lib em TS; portar de PHP/Python. A assinatura XML é o item que mais consome tempo e mais quebra silenciosamente |
| **Motor de cálculo de folha (b)** — mensal, adiantamento, complementar, férias (incl. abono, coletivas, avos), 13º (1ª e 2ª parcelas), **rescisão** com todas as verbas e multa de FGTS, afastamentos, INSS progressivo, IRRF com deduções, FGTS, pró-labore, estagiário, autônomo/RPA, e **parametrização de CCT** | **25–50** | É aqui que mora o passivo. E **não termina nunca** |
| Cadastros, multiempresa, UI, conferência, relatórios, holerite, integração bancária (CNAB), integração contábil | **10–20** | |
| **Total até "primeiro cliente sem vergonha"** | **~40–75 pessoa-mês** | 3–5 anos de 1 dev; 1,5–2 anos de um time de 3 |

### 5.3 Custo recorrente de manutenção normativa — quem paga o acompanhamento?

**Esta linha é a que decide a questão, e é a que quase todo mundo subestima.**

Evidência concreta, de fontes oficiais e de fornecedores, só do período recente:

- Versão vigente: **S-1.3**, com o leiaute publicado sob a **NT nº 06/2026, revisão de 09/04/2026** ([gov.br](https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026-rev-09-04-2026/index.html)).
- Manual (MOS) **consolidado até a Nota Orientativa S-1.3 nº 07/2026** ([PDF gov.br](https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-07-2026.pdf)).
- Notas técnicas sucessivas só do último ciclo: **NT 03/2025, NT 04/2025, NT 04/2025 revisada (26/08/2025), NT 05/2025, NT 06/2026** — cada uma alterando eventos, tabelas, **regras de validação e esquemas XSD** ([Senior](https://documentacao.senior.com.br/exigenciaslegais/noticias/trabalhista-previdenciaria/2026/2026-02-19-nota-tecnica-s-1-3-n6-2026-novos-ajustes-nos-leiautes-esocial/), [TOTVS](https://www.totvs.com/blog/fiscal-clientes/esocial-nota-tecnica-s-1-3-n06-2026-com-ajustes-e-novas-validacoes/), [TecnoSpeed](https://blog.tecnospeed.com.br/esocial-nota-tecnica-s-1-3-06-2026-ajustes-nos-layouts-e-campo-infopatprec/)).
- **Mudança de infraestrutura, não só de leiaute:** o eSocial migrou seu certificado para um novo padrão de segurança, com certificados emitidos pela AC internacional **Sectigo**, implantado primeiro em Produção Restrita e depois em Produção durante 2026 ([notícia oficial gov.br](https://www.gov.br/esocial/pt-br/noticias/atualizacao-de-certificado-do-esocial-para-um-novo-padrao-de-seguranca)). *`PENDÊNCIA — as datas exatas aparecem no snippet em formatos ambíguos (01/12/2026 e 06/24/2026); confirmar na página oficial.`*

Esse último item é o exemplo perfeito do risco: **não foi uma regra tributária, foi a cadeia de confiança TLS.** Quem constrói precisa ter alguém que perceba isso e atualize o *trust store* **antes** da virada, ou todas as transmissões de todos os clientes param de uma vez.

| Caminho | Quem paga o acompanhamento | Custo recorrente estimado |
|---|---|---|
| Comprar (a), (c), (d) | **O fornecedor** — está no preço da mensalidade | Mensalidade |
| Construir | **A G41** | **Estimativa: 1,5–3 pessoa-mês/ano só de manutenção normativa da folha + eSocial**, e é custo com deadline legal — não dá para adiar para o próximo sprint |

E há mais superfície do que só o eSocial: **FGTS Digital** (obrigatório para empregadores do eSocial, alimentado automaticamente pelo que você transmite, e desde maio/2026 também para recolhimentos em processos trabalhistas `[C]`), **DCTFWeb** (consolida eSocial + EFD-Reinf e gera o DARF) e a **EFD-Reinf**. Construir "o eSocial" significa, na prática, construir e manter esse conjunto.

### 5.4 Risco de erro: passivo trabalhista e multa

- **Assimetria brutal.** Um erro fiscal no Masor gera imposto pago a mais ou a menos, corrigível por retificação. Um erro de folha gera **reclamatória trabalhista, com o ônus da prova praticamente invertido e correção monetária + juros por até 5 anos.** Não é o mesmo tipo de risco.
- O eSocial **não aplica multa automática**; a autuação vem depois, por fiscalização/auditoria digital `[C]`. Isso é pior, não melhor: **o erro fica dormindo e acumulando por meses até virar autuação de todos os clientes de uma vez.**
- Valores de multa: `PENDÊNCIA — não confirmei em fonte oficial (Portaria/CLT). As faixas que circulam (ex.: R$ 402,53–805,06 por trabalhador para S-2200 atrasado) vêm de blogs [C] e não devem ser usadas em proposta.`
- **A responsabilidade profissional não é transferível pelo contrato de software.** Nenhum fornecedor de software de folha assume a multa do cliente do cliente. O contador continua respondendo. Ver checklist, item 8.2.

### 5.5 Dependência do fornecedor (lock-in e portabilidade)

Aqui há uma diferença enorme entre as categorias, e é o que mais justifica a estratégia híbrida:

| Categoria | Lock-in | Portabilidade real |
|---|---|---|
| **(a) Transporte** | **Baixo.** A interface é padronizada *pelo governo*, não pelo fornecedor. Trocar de gateway = reescrever um adaptador. Os XMLs e recibos são seus, e a cópia mestre está no eSocial | **Alta** |
| **(b)/(c)/(d) Motor e sistema** | **Muito alto** — e pior que no fiscal | **Baixa** |

Por que a portabilidade de folha é péssima, na prática:

1. **Bases acumuladas no ano** — IRRF, INSS, avos de 13º e de férias proporcionais, médias de variáveis. Migrar em maio significa recarregar histórico e torcer para bater.
2. **Histórico de rubricas** — cada sistema tem código e classificação próprios; o de-para é manual.
3. **Vínculos já transmitidos** — os eventos S-2200/S-2300 já foram enviados com identificadores do sistema antigo; alterações posteriores precisam amarrar nesses identificadores.
4. **Consequência:** troca de folha, na prática, só é segura **na virada do ano**. Isso dá ao fornecedor **uma janela de reajuste por ano em que você não tem alternativa real.** É exatamente esse o poder de precificação que ele tem sobre você.

**Se o fornecedor sumir:** em (a), você reescreve o adaptador em semanas e segue — os dados estão no eSocial. Em (d), você tem no máximo dumps e relatórios; reconstruir 12 meses de bases de cálculo de N clientes é um projeto, não uma exportação. **Exija a cláusula de saída antes de assinar, não depois** (seção 8.7).

### 5.6 Diferenciação competitiva — folha é commodity?

Separe o produto em duas metades, porque elas têm naturezas opostas:

| Metade | Natureza | Verdade desconfortável |
|---|---|---|
| **Cálculo + transmissão** | **Commodity regulada.** O resultado correto é único e definido por lei. Não há como ser "melhor" — só "certo" ou "processado" | **Nenhum cliente escolhe a G41 porque o INSS está certo.** Isso é o piso, não o diferencial. Investir aqui é investir para empatar |
| **Experiência, prazo, clareza, ausência de retrabalho** | **Serviço + software, não regulado** | **É aqui que o cliente decide.** Admissão digital sem papel, portal do colaborador, painel de prazos, conferência antes do fechamento, alerta antes da multa, holerite que o cliente entende |

Esse enquadramento também **inverte o risco técnico a seu favor**: um bug na camada de experiência gera reclamação; um bug no motor gera passivo. Se a G41 vai escrever código em folha, que escreva do lado onde errar é barato.

---

## 6. O caminho híbrido — proposta, defesa e refutação

### 6.1 A proposta original (comprar (a), construir o resto) — **REFUTADA para agora**

A ideia "compro o canudo do eSocial e construo a experiência e o cálculo por cima" **é sedutora e está errada na sequência**, por três motivos:

1. **Falácia de escopo.** Comprar (a) resolve 10–15% do trabalho e deixa 100% do risco com você. Você compraria a peça mais barata, mais padronizada e mais fácil de trocar — e construiria a mais cara, mais arriscada e mais difícil de abandonar. **É o inverso do que a análise de lock-in recomenda.**
2. **Sem lastro de reuso.** No Masor, o open source deu alavanca real. Na folha, ele **não existe** (seção 4). O custo é integralmente seu.
3. **Sequenciamento.** O Masor ainda não terminou de pagar seu próprio ciclo. Abrir uma segunda frente em domínio regulado, com risco maior, antes disso, é diluir o time em duas coisas mal feitas. *Isso vale mesmo que a folha seja uma boa ideia — é uma objeção de ordem, não de mérito.*

### 6.2 A proposta que eu defendo — híbrido invertido, em três fases

**Fase 1 — agora até ~12 meses. Motor comprado, experiência construída.**

- **Compre (d)**, um sistema de folha tradicional para escritório contábil, e escolha pela **qualidade da API**, não pela tela. Pelo que verifiquei, **Questor é o mais bem posicionado**, porque é o único com **documentação de API pública, navegável e específica de folha** (`API SYN` de importação/exportação, além de Zen, Empresarial e Negócio). Domínio/Onvio tem developer portal formal, mas a API documentada é contábil/NF-e, e o acesso exige liberação por e-mail. Fortes, Contmatic, Calima, Nasajon e SCI: **API pública `PENDÊNCIA`** — pergunte antes de decidir.
- **Construa no Lior**, sobre a API dele: admissão digital, coleta de documentos, portal do colaborador, painel de prazos e pendências por cliente, conferência pré-fechamento, alertas, relatórios gerenciais de custo de pessoal com a cara da G41.
- **A marca da G41 fica onde o cliente olha.** O motor fica no porão. Isso captura ~80% do benefício percebido de "white label" com ~5% do custo e do risco.
- **Se a experiência não vender, você descobre gastando pouco** — e essa é a maior virtude desta fase.

**Fase 2 — se e só se a Fase 1 provar demanda paga.** Compre **(a)** — TecnoSpeed ou RESocial — e passe a controlar a transmissão. Isso te dá o dado bruto (evento, recibo, erro) dentro do Lior, e é a preparação para trocar de motor sem trocar de experiência.

**Fase 3 — só com volume que pague.** Aí sim discuta motor próprio, e **por dentro do ano-calendário, cliente a cliente**, nunca em big bang.

**Atalho paralelo, se o objetivo real for "vender folha com a marca G41 já no próximo trimestre":** contrate **(e) BPO white label** (ContabExpress é a única opção que encontrei com o modelo *"backoffice invisível"* declarado explicitamente para escritórios contábeis). Entrega em semanas, sem uma linha de código. **Custo: é margem de serviço, não margem de software — não escala, e você entrega a operação a um terceiro.** É a resposta certa para "preciso de receita agora", e a errada para "quero construir ativo".

### 6.3 Veredito: o que é estratégico e o que é commodity para a G41

| Peça | Classificação | Decisão |
|---|---|---|
| Transmissão ao eSocial | **Infraestrutura commodity** — padronizada pelo governo, trocável | **Comprar** (Fase 2), nunca construir por orgulho |
| Motor de cálculo de folha | **Commodity regulada de alto risco** — caro, sem reuso, passivo trabalhista, lock-in ruim | **Comprar. Não construir.** |
| Experiência do cliente, prazos, clareza, conferência, portal | **ESTRATÉGICO** — é o que faz escolherem a G41, e errar aqui é barato | **Construir no Lior** |
| Dados e histórico dos clientes | **ESTRATÉGICO** — é o ativo que sobrevive à troca de fornecedor | **Manter cópia própria desde o dia 1** (ver 8.5) |

---

## 7. Checklist de due diligence — leve isto para toda negociação

Peça **por escrito, no contrato ou em anexo contratual**. "O comercial falou" não vale.

### 7.1 SLA
- [ ] Disponibilidade contratada (%), janela de medição e **como é medida**.
- [ ] Multa/crédito por descumprimento — **e se o crédito é automático ou depende de eu pedir**.
- [ ] Tempo de resposta e de solução por severidade. **Severidade máxima inclui "não consigo transmitir na véspera do prazo"?**
- [ ] **Suporte em dia de pico**: os prazos de folha se concentram (dia 7, dia 15, D-1 de admissão, 10 dias de rescisão). O SLA vale nesses dias, em horário estendido? Há plantão?
- [ ] Janelas de manutenção programada — podem cair em dia de fechamento?
- [ ] **Contingência**: se a API do fornecedor cair e o eSocial estiver no ar, como transmito? Consigo cair para o módulo web do eSocial com os meus XMLs?

### 7.2 Responsabilidade por multa — **a pergunta mais importante**
- [ ] **"Se a falha for do transmissor e meu cliente for multado, quem paga?"** Faça literalmente essa pergunta e exija resposta escrita.
- [ ] Qual o **limite de responsabilidade**? (O padrão de mercado é limitar ao valor pago nos últimos 12 meses — o que quase nunca cobre uma autuação. Se for esse o caso, **assuma que o risco é seu** e precifique nos honorários.)
- [ ] Há exclusão de danos indiretos/lucros cessantes? (Quase sempre há. Multa trabalhista costuma cair nessa exclusão.)
- [ ] Existe seguro de responsabilidade civil profissional (E&O) do fornecedor? Apólice, cobertura, vigência.

### 7.3 Atualização de leiaute
- [ ] **A atualização de leiaute e de notas técnicas está inclusa na mensalidade ou é cobrada à parte?**
- [ ] Qual o **compromisso de prazo** para publicar a adequação a uma nova NT — em dias antes da vigência?
- [ ] Histórico: peça as datas de entrega das **NT 03/2025, 04/2025, 04/2025-revisada, 05/2025 e 06/2026**. Compare com as datas de publicação e de vigência. **Isso é auditoria de passado, não promessa de futuro — é a melhor pergunta do checklist.**
- [ ] Como fui avisado da troca de certificado do eSocial para a AC Sectigo em 2026? Com quanta antecedência?
- [ ] A adequação a **FGTS Digital, DCTFWeb e EFD-Reinf** está no mesmo contrato ou é módulo separado?

### 7.4 Ambiente de homologação
- [ ] Existe **sandbox permanente** apontando para a **Produção Restrita** do eSocial? É gratuito? Tem limite?
- [ ] Consigo testar **nova NT antes da vigência** no sandbox?
- [ ] Há dados de teste e coleção Postman/OpenAPI?

### 7.5 Exportação e propriedade dos dados
- [ ] **Os dados são meus e dos meus clientes, declarado em cláusula.**
- [ ] Exportação **completa** disponível **a qualquer momento, por autoatendimento, sem custo**: XMLs enviados, recibos, e — em folha — **bases acumuladas de IRRF/INSS, avos de férias e 13º, histórico de rubricas e de-para de vínculos.**
- [ ] Formato aberto e documentado (não PDF, não relatório).
- [ ] **Teste a exportação na POC**, antes de assinar. Não aceite "está no roadmap".

### 7.6 LGPD — operador x controlador
- [ ] Cláusula explícita: **o cliente da G41 é o controlador; a G41 é operadora; o fornecedor é suboperador.** (Não aceite o fornecedor se declarando controlador de dados de folha.)
- [ ] Base legal e finalidade delimitadas; proibição de uso dos dados para treinar modelos, gerar benchmarks ou vender inteligência de mercado — **peça isso explicitamente, é onde os contratos são vagos.**
- [ ] **Dado sensível:** folha carrega afastamento por doença/CID, ASO, dados de saúde (art. 11 LGPD), e biometria se houver ponto. Tratamento e retenção específicos?
- [ ] Onde ficam os dados (país/região)? Transferência internacional? Cláusulas-padrão?
- [ ] Notificação de incidente: em quantas horas? Para quem? **A G41 precisa saber antes do cliente dela.**
- [ ] Prazo e comprovação de **eliminação** ao fim do contrato.

### 7.7 Subprocessadores e cadeia
- [ ] **Lista nominal** de subprocessadores (nuvem, e-mail transacional, assinatura, armazenamento, suporte offshore).
- [ ] Direito de **objeção prévia** à inclusão de novo subprocessador, com aviso mínimo.
- [ ] O fornecedor **repassa contratualmente** as mesmas obrigações aos subprocessadores?
- [ ] **Cuidado especial:** se você contrata (a) e ele por sua vez usa outro para assinar/transmitir, **você tem um subprocessador que seu cliente não conhece e cuja falha aparece com a marca da G41.**

### 7.8 Certificação e certificados digitais
- [ ] **Não existe homologação oficial obrigatória de software de folha pelo eSocial** — `PENDÊNCIA: não localizei norma que exija certificação; confirmar antes de usar em argumento comercial`. Portanto, **selo de fornecedor não é garantia de nada.** Peça referências de clientes reais, do mesmo porte, e ligue para eles.
- [ ] Certificações verificáveis que valem: **ISO 27001, SOC 2**. Peça o relatório, não o logotipo.
- [ ] **Custódia de certificado digital:** quem guarda o A1 dos clientes? Onde? Criptografado com qual chave? Quem, dentro do fornecedor, consegue usá-lo? **Há log de cada uso?** (Um A1 de cliente em posse de terceiro é uma procuração digital ampla — trate como cofre, não como arquivo.)
- [ ] O modelo funciona com **procuração eletrônica no e-CAC** em vez do certificado do cliente? (Preferível: o escritório assina com o próprio certificado, sob procuração.)
- [ ] Suporta **A1 e A3**?

### 7.9 Contrato de saída
- [ ] Prazo de fidelidade, multa rescisória, aviso prévio.
- [ ] **Reajuste:** índice, periodicidade e **teto**. Sem teto, o lock-in da seção 5.5 é uma carta em branco.
- [ ] Reajuste por mudança de faixa (nº de empresas/colaboradores) — **como é medido e quando vira cobrança?**
- [ ] **Cláusula de assistência à saída**: obrigação de fornecer dados, atender chamados de migração e manter o ambiente ativo por N meses após a rescisão, com preço definido **agora**.
- [ ] **Escrow / continuidade**: em caso de falência, aquisição ou descontinuação do produto, o que acontece? Aviso mínimo de descontinuação (12 meses é razoável).
- [ ] **Cessão do contrato:** o fornecedor pode ser vendido e o novo dono pode ser um concorrente da G41 — há direito de rescisão sem multa nesse caso?
- [ ] **Se for white label:** direito de uso da marca, o que acontece com os PDFs e comunicações emitidos sob a marca G41 após a saída, e **cláusula de não concorrência com o cliente final** (a TecnoSpeed declara isso publicamente para o PlugDFe; **exija por escrito de qualquer outro**).

### 7.10 Modelo comercial — como perguntar
Como **nenhum fornecedor publica preço**, você negocia às cegas. Force a estrutura antes do número:
- [ ] A cobrança é **por empresa/CNPJ, por colaborador/mês, por evento transmitido, por lote, ou mista?**
- [ ] Há **mínimo mensal**? Há **setup**? Há cobrança por ambiente de homologação?
- [ ] **Evento rejeitado e retransmitido conta como novo evento cobrado?** (Pergunta que separa proposta honesta de armadilha — folha tem retificação o tempo todo.)
- [ ] Colaborador **afastado ou desligado no meio do mês** conta como colaborador cobrado?
- [ ] O que acontece em **novembro/dezembro**, quando o volume de eventos dobra por conta do 13º?
- [ ] Peça a mesma cotação em **duas estruturas diferentes** e compare — a diferença revela onde eles ganham.

---

## 8. Riscos que o Fernando provavelmente não considerou

1. **"Enviar ao eSocial" não é um serviço separável da folha.** O S-1200 é a folha. Comprar só o transporte não te livra de construir ou comprar o motor. **Este é o ponto que reformula a decisão inteira.**
2. **O open source aqui não te salva como salvou no Masor.** Zero biblioteca madura de eSocial em TypeScript; zero motor de folha brasileiro utilizável em qualquer linguagem. Verificado repositório a repositório (seção 4). Se a intuição vem do sucesso do Masor, ela está mal calibrada.
3. **O erro de folha tem natureza jurídica pior que o erro fiscal.** Fiscal se retifica; trabalhista vira reclamatória, com correção e juros por até 5 anos.
4. **O erro fica dormindo.** O eSocial não multa na hora; a autuação vem por auditoria digital depois. Um bug sistemático se replica em toda a carteira por meses antes de aparecer. **Não existe "cliente-piloto isolado" quando o bug é no motor.**
5. **A manutenção não é só de leiaute — é de infraestrutura.** A troca do certificado do eSocial para a AC Sectigo em 2026 é o exemplo: uma mudança de cadeia TLS que, ignorada, derruba todas as transmissões de todos os clientes ao mesmo tempo, sem aviso no seu código.
6. **CCT é o custo invisível que ninguém orça.** Todo instrumento coletivo registrado no [Sistema Mediador do MTE](https://mediador.trabalho.gov.br/) traz piso, adicionais, regras de hora extra, banco de horas, benefícios e contribuições próprios, com vigências anuais diferentes por categoria e por município. Não é código — é **operação normativa contínua e por cliente**. Comprar o sistema não te livra disso, mas construir o motor te obriga também a modelar a parametrização. `PENDÊNCIA — não obtive número oficial de CCTs registradas por ano; consultar o Mediador para dimensionar.`
7. **O escopo real é maior que "eSocial": FGTS Digital, DCTFWeb e EFD-Reinf** entram no mesmo pacote de manutenção. Quem só pensa no eSocial orça um terço do problema.
8. **A janela de troca é anual.** Migrar folha no meio do ano é temerário (bases acumuladas, avos, vínculos já transmitidos). Isso significa que **o fornecedor pode reajustar sabendo que você não tem saída até dezembro.** Sem cláusula de teto de reajuste, você assinou um cheque em branco.
9. **White label transfere a marca, não o risco — e isso é assimétrico contra você.** Seu cliente vê "G41" no holerite e liga para a G41 às 22h do dia 30. Você vira o suporte de 1º nível de um software que não controla e não consegue corrigir. **Dimensione o custo de atendimento antes de se encantar com a marca na tela.**
10. **Custódia de certificado digital é passivo de segurança, não detalhe de TI.** Guardar A1 de dezenas de clientes é guardar procuração digital ampla. Vazamento ou uso indevido é incidente grave, com dever de notificação à ANPD e ao titular. **Prefira o modelo de procuração eletrônica no e-CAC**, em que o escritório assina com o próprio certificado.
11. **Dado de folha é dado sensível.** Afastamento com CID, ASO, biometria de ponto caem no art. 11 da LGPD. O contrato genérico de SaaS não trata disso. Se a G41 é operadora, o regime é mais rígido do que no fiscal.
12. **Risco de foco.** O Masor ainda não fechou o ciclo. Abrir a folha agora é competir contra você mesmo por atenção de time — em um domínio com risco maior e reuso menor. **Esta é uma objeção de sequenciamento, e ela vale mesmo se a folha for uma boa ideia.**
13. **Você estaria competindo contra 20–40 anos de acúmulo normativo.** Questor declara +2 milhões de folhas/mês; Fortes, +1 milhão; TOTVS, +25% da folha CLT do país. Não é vantagem de código — é vantagem de **casos de borda já encontrados e corrigidos**, e ela não se compra com sprint.
14. **Zero fornecedor publica preço.** Confirmei em toda a lista. Isso significa que a decisão "comprar" não tem número hoje, e que **você negocia sozinho, sem âncora de mercado.** Peça cotação a **no mínimo três** fornecedores da mesma categoria, na mesma estrutura de cobrança, antes de qualquer conclusão de viabilidade.
15. **O risco de sucesso.** Se o Lior de folha der certo, a G41 vira software house de produto regulado — com plantão, versionamento, suporte e responsabilidade normativa. **Esse é um negócio diferente do escritório contábil, com margem, cultura e passivo diferentes.** Decida se é isso que você quer ser antes de decidir a arquitetura.

---

## 9. PENDÊNCIAS (exigem contato comercial ou verificação adicional)

### 9.1 Preço — **nenhum fornecedor deste mercado publica tabela**
`PENDÊNCIA — preço não publicado, exige contato comercial` para: **TecnoSpeed, RESocial, Questor, Fortes, Domínio/Onvio, Alterdata (planos pagos), Contmatic, Calima, Nasajon, SCI, Prosoft, Sênior, TOTVS, Metadados, Benner, Sittax, Convenia, ContabExpress, ADP.**

Únicas informações comerciais localizadas, **todas em nível B/C e todas a reconfirmar**:

| Item | Valor | Ressalva |
|---|---|---|
| TecnoSpeed — hora técnica em atendimento emergencial | R$ 180,00/h | `[B]` snippet de domínio oficial; **não é o preço do produto** |
| Alterdata Pack Community | Gratuito, limitado a 3 empresas / 10 empregados (WDP) / 60 notas por mês (WFiscal) | `[B]`; **finalidade declarada é educacional** |
| Sólides | "a partir de R$ 99,90/mês", por colaborador/mês, sem mínimo | `[C]`; produto para empresa final |
| BPO de folha (referência de marketplace) | ~R$ 207/mês até 5 funcionários; ~R$ 13.000/mês para 200 colaboradores | `[C]` ohub.com.br — **não é preço de fornecedor** |

### 9.2 Fornecedores não confirmados (nominal)
- `Não foi possível confirmar, em fonte pública, a existência de fornecedor brasileiro chamado **"Migrate"** com produto de eSocial.`
- `Não foi possível confirmar que a **Oobj** tenha produto de eSocial — a documentação pública dela cobre DF-e.`
- `Não foi possível confirmar razão social, CNPJ, ano de fundação, base de clientes nem documentação técnica pública da **RESocial**. Fazer due diligence societária antes de considerá-la.`
- `Não foi possível confirmar site oficial ativo nem produto de folha da **Xerpa**.`
- `Não foi possível confirmar oferta white label ou de folha do **eGestor**.`
- `Não foi possível confirmar existência de API pública de folha em: **Fortes, Contmatic, Calima, Nasajon, SCI, Prosoft, Metadados, Benner**.`
- `Não foi possível confirmar programa white label/OEM de folha em NENHUM fornecedor brasileiro (categoria (c) inteira).`
- `Não foi possível confirmar oferta de motor de cálculo de folha licenciável isoladamente (categoria (b) inteira).`

### 9.3 Fatos normativos a reconfirmar na fonte oficial
- `Datas exatas da migração do certificado do eSocial para a AC Sectigo — os snippets trouxeram "01/12/2026" e "06/24/2026", em formatos inconsistentes.`
- `Valores das multas do eSocial em 2026 — só localizei em fontes secundárias [C]. NÃO usar em proposta sem a Portaria.`
- `Inexistência de homologação/certificação oficial obrigatória de software de folha — não localizei norma que a exija, mas também não localizei declaração oficial de que não exista.`
- `Número de CCTs registradas por ano no Mediador/MTE.`
- `Confirmar se a API REST oficial de recepção de lotes do eSocial já substitui o webservice SOAP ou coexiste com ele, e quais eventos aceita.`

### 9.4 Limite de método
`Os domínios tecnospeed.com.br, resocial.com.br, docs-api.oobj.com.br, dev.senior.com.br e gov.br foram bloqueados para leitura direta no ambiente desta pesquisa. Toda informação marcada [B] veio de resultado de busca indexando o domínio oficial, não de leitura integral da página. Reconfirmar em nível A antes de decidir.`

---

## 10. Fontes (URL + data de acesso: 30/08/2026)

**Oficiais (eSocial / gov.br)**
- Documentação técnica do eSocial — https://www.gov.br/esocial/pt-br/documentacao-tecnica
- Leiautes S-1.3, NT 06/2026 rev. 09/04/2026 — https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026-rev-09-04-2026/index.html
- MOS S-1.3 consolidado até a NO S-1.3 07/2026 (PDF) — https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-07-2026.pdf
- Especificação da API de recepção de lotes (PDF) — https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/4915736_especificacao_recepcaolote_empresas.pdf
- Manual de orientação do desenvolvedor — https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/manual-orientacao-desenvolvedore-social-versao1.0
- Atualização de certificado do eSocial (AC Sectigo) — https://www.gov.br/esocial/pt-br/noticias/atualizacao-de-certificado-do-esocial-para-um-novo-padrao-de-seguranca
- EFD-Reinf complementa o eSocial — https://www.gov.br/esocial/pt-br/noticias/receita-federal/edf-reinf-complementa-o-esocial-para-empresas
- Portal SPED / EFD-Reinf — http://sped.rfb.gov.br/pagina/show/1494
- Registro de convenções e acordos coletivos (MTE) — https://www.gov.br/trabalho-e-emprego/pt-br/servicos/empregador/convencoes-e-acordos-coletivos-de-trabalho
- Sistema Mediador (consulta de CCT) — https://mediador.trabalho.gov.br/sistemas/mediador/consultarinstcoletivo

**Categoria (a) — transmissão**
- TecnoSpeed PlugDFe eSocial — https://tecnospeed.com.br/plugdfe/esocial/
- TecnoSpeed — Guia Geral API eSocial — https://atendimento.tecnospeed.com.br/hc/pt-br/articles/4404268497175-Guia-Geral-API-eSocial
- TecnoSpeed — Guia Geral Componente eSocial — https://atendimento.tecnospeed.com.br/hc/pt-br/articles/4404184018839-Guia-Geral-Componente-eSocial
- TecnoSpeed — posicionamento de não concorrência com o cliente final — https://blog.tecnospeed.com.br/o-plugdfe-da-tecnospeed-atua-para-desenvolvedores-e-sem-concorrencia-com-clientes-finais/
- TecnoSpeed — NT S-1.3 06/2026 — https://blog.tecnospeed.com.br/esocial-nota-tecnica-s-1-3-06-2026-ajustes-nos-layouts-e-campo-infopatprec/
- RESocial — https://www.resocial.com.br/
- Oobj — https://oobj.com.br/ · docs — https://docs-api.oobj.com.br/docs/documentacao/introducao/
- L2MAKER API eSocial/Reinf — https://www.l2maker.com.br/documentacao/api-esocial/
- ProSESMT eSocial — https://prosesmt.com.br/site/esocial/

**Categorias (b) e (d) — motor e sistemas**
- Questor — https://www.questor.com.br/ · docs — https://docs.questor.com.br/ · API SYN folha — https://docs.questor.com.br/pt-br/Produtos/Gest%C3%A3oCont%C3%A1bil/FolhadePagamento/api_syn_importacao_exportacao_dados
- Fortes Pessoal — https://www.fortestecnologia.com.br/sistemas/gestao-de-pessoas/fortes-pessoal/ · NTs do eSocial — https://ajuda.fortestecnologia.com.br/kb/pt-br/category/esocial-notas-tecnicas
- Domínio / Thomson Reuters — https://www.dominiosistemas.com.br/ · Onvio BR Accounting API — https://developerportal.thomsonreuters.com/onvio-br-accounting-api
- Alterdata Pack — https://alterdata.com.br/pack · Pack Community — https://community.alterdata.com.br/comunidade/pack-community-1
- Contmatic — https://www.contmatic.com.br/ · autoatendimento — https://autoatendimento.contmatic.com.br/
- Calima ERP folha — https://www.calimaerp.com/folha-de-pagamento · ajuda — https://ajuda.calimaerp.com/pt/category/folha-de-pagamento-12op4dj/
- Nasajon — https://nasajon.com.br/escritorios-contabeis-solucoes/ · artigos de API externa — https://atendimento.nasajon.com.br/nasajon/artigos?atendimentoarea=areaexterna&tags=API-externa
- SCI Visual Practice folha — https://visual.sci10.com.br/sistemas/folha-de-pagamento/
- Prosoft — https://www.prosoft.com.br/
- Senior HCM folha — https://www.senior.com.br/solucoes/gestao-de-pessoas-hcm-4/sistema-folha-de-pagamento · API pública — https://dev.senior.com.br/api_publica/hcm_payroll/ · exigências legais/NTs — https://documentacao.senior.com.br/exigenciaslegais/noticias/trabalhista-previdenciaria/2026/2026-02-19-nota-tecnica-s-1-3-n6-2026-novos-ajustes-nos-leiautes-esocial/
- TOTVS RH folha — https://www.totvs.com/rh/folha-de-pagamento/ · Espaço Legislação eSocial — https://espacolegislacao.totvs.com/esocial/ · NT 06/2026 — https://www.totvs.com/blog/fiscal-clientes/esocial-nota-tecnica-s-1-3-n06-2026-com-ajustes-e-novas-validacoes/
- Metadados — https://www.metadados.com.br/ · eSocial — https://app.metadados.com.br/esocial
- Benner folha e RH — https://benner.com.br/sistema-de-folha-de-pagamento-e-rh

**Categoria (e) — BPO**
- ContabExpress — https://contabexpress.com.br/ · terceirização para contadores — https://contabexpress.com.br/terceirizacao-para-contadores/
- ADP Brasil terceirização — https://br.adp.com/o-que-oferecemos/folha-de-pagamento/servicos-terceirizacao.aspx
- ohub (referência de preços, marketplace) — https://www.ohub.com.br/precos/folha-de-pagamento

**Não servem / fora de escopo (verificados)**
- Sittax — https://sittax.com.br/ · planos — https://sittax.com.br/planos/
- Tactium (CRM/omnichannel) — https://tactium.com.br/empresa/
- Gupy integrações com folha — https://www.gupy.io/integracao/folha-pagamento-rm-totvs · https://developers.gupy.io/docs/integra%C3%A7%C3%B5es-com-folha-de-pagamento
- Sólides planos — https://solides.com.br/planos-e-precos-completos/
- Convenia DP — https://www.convenia.com.br/departamento-pessoal
- vhsys ERP white label — https://www.vhsys.com.br/revenda/white-label/

**Open source (verificados em nível A no GitHub)**
- https://github.com/nfephp-org/sped-esocial
- https://github.com/qualitaocupacional/libesocial
- https://github.com/tst-labs/esocial
- https://github.com/emensageria/emensageria
- https://github.com/akretion/esociallib
- https://github.com/TadaSoftware/PyeSocial
- https://github.com/devcosta/Tabelas-do-Governo
- https://github.com/DeHor-Labs/mcp-fiscal-brasil
- https://github.com/tecnospeed/Componente_eSocial
- https://github.com/Rwe-Devs/esocial-api-connector
- https://github.com/diegox300/esocial-mtls-relay

---

*G41 Inteligência Contábil — Insights Impulsionam*
