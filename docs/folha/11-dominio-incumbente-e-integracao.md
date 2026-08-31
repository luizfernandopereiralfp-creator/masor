# O Domínio como sistema incumbente — mapa, caminhos de integração e cenários

> Pesquisa de **30/08/2026**, para a G41 Inteligência Contábil (Curitiba).
> Contexto que reformula a decisão: o escritório **já roda o Domínio (Thomson Reuters) em
> folha, fiscal e contábil**, e o Lior **já tem controle de ponto em produção**.
> Este documento substitui a pergunta antiga ("construir folha x contratar white label")
> pela pergunta real: **o que fazer em relação a um incumbente que já roda o escritório
> inteiro.**

---

## 0. Método e a limitação que precisa vir antes de qualquer afirmação

**Leia isto antes de usar qualquer linha deste documento em negociação ou em código.**

O ambiente desta pesquisa tem **egress bloqueado por política de rede para praticamente todo
destino externo**, e não apenas para `*.gov.br` como se supunha. Foi verificado nesta sessão:

| Destino | Resultado |
|---|---|
| `www.dominiosistemas.com.br` | `CONNECT tunnel failed, response 403` — bloqueado |
| `developerportal.thomsonreuters.com` | 403 — bloqueado |
| `suporte.dominioatendimento.com` | 403 — bloqueado |
| `ajuda.contaazul.com`, `ajuda.alterdata.com.br`, `portalsst.com.br` | bloqueados |
| Busca na web (índice) | **funciona** |

Ou seja: **nenhuma página do fornecedor foi aberta e lida diretamente.** O que existe são
resumos produzidos pelo índice de busca sobre páginas oficiais cujas URLs estão citadas.

Isso é mais fraco que leitura de fonte primária, e a régua anti-invenção deste projeto exige
que a diferença apareça. Por isso **todo fato recebe selo**:

| Selo | Significado |
|---|---|
| **[F1]** | Página **oficial** do fornecedor (dominiosistemas.com.br, suporte.dominioatendimento.com, thomsonreuters.com.br, developerportal) apareceu no índice e o resumo veio atribuído a ela. **URL registrada. Página não aberta.** |
| **[F2]** | Documentação de terceiro verificável (parceiro homologado, integrador, base de conhecimento de concorrente que documenta o layout do Domínio) |
| **[F3]** | Relato de fórum ou anedota. **Não é lastro.** Serve só para formular pergunta ao fornecedor |
| **PENDÊNCIA** | Não confirmado. Exige contato com o fornecedor ou leitura direta da página |

**Regra de uso:** nada com selo [F1] deve virar cláusula de contrato ou constante de código
sem que alguém **abra a URL citada** de uma rede sem bloqueio e confirme. [F3] não sustenta
nem conversa. O bloco de pendências (§8) é o que fecha o loop.

---

## 1. Mapa do Domínio — o que é a linha de produtos hoje

### 1.1 As três camadas que costumam ser confundidas

O erro comum é tratar "Domínio", "Domínio Web" e "Onvio" como três produtos concorrentes.
Pelo que foi possível confirmar, são **camadas distintas do mesmo produto**:

| Camada | O que é | Selo |
|---|---|---|
| **Sistema Domínio** (desktop) | A aplicação cliente instalada, com **banco de dados local no servidor do escritório**. É onde o cálculo acontece — folha, fiscal, contábil | [F1] [F2] |
| **Domínio Web** | **Não é uma reescrita web.** É descrito como um **emulador**: o contador baixa um plugin e acessa o mesmo sistema, com o banco hospedado em servidor Amazon. Acesso por `dominioweb.com.br` com a mesma senha do Domínio Atendimento / Onvio | [F1] |
| **Onvio** | A **plataforma em nuvem** da Thomson Reuters que expõe módulos do Domínio para fora do escritório: Portal do Cliente, Portal do Empregado, Documentos, Messenger. Lançada em 2018 como o primeiro passo da migração da suíte para nuvem | [F1] |

**A leitura que importa para a decisão:** o Domínio é, na sua essência, **desktop com banco
local**; o "nuvem" comercializado é majoritariamente **hospedagem e emulação do mesmo
desktop**, mais uma **camada de portais** (Onvio) por cima. Isso tem duas consequências
diretas:

1. Não existe um "backend em nuvem multi-tenant do Domínio" para conversar via API. A
   ausência de API de folha (§2.1) **não é desleixo — é consequência da arquitetura.**
2. O dado do escritório está **fisicamente no banco do escritório** (ou no servidor Amazon
   contratado). Isso é uma alavanca real de negociação e de integração, e ao mesmo tempo o
   ponto onde o contrato pesa mais (§2.3).

### 1.2 Planos e módulos

Nomenclatura vigente confirmada em páginas oficiais [F1]:

| Plano | Posicionamento declarado | Módulos citados |
|---|---|---|
| **Domínio One** | Escritórios em fase inicial / estruturação | Contabilidade, Escrita Fiscal, Folha de Pagamento, **Portal do Cliente e Portal do Empregado** |
| **Domínio Pro** | Escritórios consolidados em expansão | Contabilidade, Fiscal, Folha, **Honorários, Patrimônio** integrados |
| **Domínio Max** | Escritórios grandes | **Acesso ilimitado a todos os módulos existentes e futuros** — Contabilidade, Fiscal, Folha, Honorários, Processos, Contabilidade Digital |

Módulos e produtos periféricos confirmados [F1]:

| Produto | O que faz |
|---|---|
| **Domínio Processos** | Gerenciador de tarefas e obrigações: calendário de entregas, controle de prazos, tempo de produção por tarefa, dashboards, notificação ao cliente pedindo documento |
| **Gestta Processos** | Produto de gestão de processos que aparece no portfólio das Soluções Domínio |
| **Domínio Messenger** | **WhatsApp integrado ao Domínio, com IA**, que automatiza "mais de 25 tarefas sem intervenção manual". **Módulo separado** |
| **Onvio Portal do Cliente** | Solicitações de serviço do cliente ao escritório e troca de documentos |
| **Onvio Portal do Empregado** | Publicação de holerite, férias, informe de rendimentos, VT/VA — **web e app iOS/Android** |
| **Onvio Documentos** | Gestor de documentos web, com publicação manual ou integrada ao Domínio |
| **Backup em Nuvem** | Produto de proteção de dados |
| **Domínio Empresarial** | Software para a **empresa cliente**, não para o escritório |

Notas de plano antigo: séries "Contábil Start / Plus / Premium / Empresarial" ainda aparecem
em material de 2018 e em descrições de terceiros [F2]. **A nomenclatura mudou para
One/Pro/Max** [F1]. Ao negociar, confirme em qual linha o contrato da G41 está hoje.

### 1.3 Arquitetura técnica

| Item | O que foi confirmado | Selo |
|---|---|---|
| Banco de dados | **Sybase / SAP SQL Anywhere.** Existe manual oficial de instalação do Servidor Sybase 9 em Linux hospedado em `download.dominiosistemas.com.br`, e **manual oficial de migração do gerenciador para Sybase/SQL Anywhere 17** hospedado em `sgd.dominiosistemas.com.br` | [F1] |
| Topologia | Desktop instalado, banco no servidor do escritório ou em nuvem privada/Amazon via Domínio Web | [F1] [F2] |
| Transmissão eSocial | Feita **pelo módulo Folha**, via webservice, com **certificado digital A1** (da empresa ou do contador) e **procuração eletrônica** quando usa o certificado do contador. Existe um **Painel de Pendências** dentro do módulo Folha para acompanhar envio, processamento e validação | [F1] |

---

## 2. Caminhos de integração — a pergunta central

Esta é a seção que decide tudo. A classificação abaixo é o resultado líquido da pesquisa.

### 2.0 Quadro-resumo

| Caminho | Existe? | Cobre folha? | Selo | Veredito |
|---|---|---|---|---|
| **API Domínio** (Central do Desenvolvedor) | **Sim** | **Não** | [F1] | Só documentos fiscais e parcelas financeiras |
| **API Onvio BR Accounting** | **Sim** | **Não** | [F1] | Três recursos, todos de documento fiscal |
| **Importação por arquivo para a Folha** | **Sim** | **Sim** | [F1] [F2] | **É o caminho real. Documentado, usado em massa** |
| **Exportação de arquivo da Folha** | **Sim** | **Sim** (integração contábil) | [F1] | Confirmado |
| **Importação de cadastro a partir do eSocial** | **Sim** | **Sim** | [F1] | Ótimo para carga inicial |
| **Acesso direto ao banco Sybase** | Tecnicamente possível | Sim | [F3] | **Não sustentável. Ver §2.3** |
| **API de folha (qualquer)** | **Não confirmada** | — | PENDÊNCIA | Nada público sugere que exista |

### 2.1 API — existe, mas não para folha

Existem **duas** ofertas de API distintas, e nenhuma delas toca folha de pagamento.

**(a) API Domínio — "Central do Desenvolvedor"** [F1]

Há uma landing page oficial `dominiosistemas.com.br/lp-centraldodesenvolvedor-api/`, e
artigos na central de suporte: *"Documentação Integração API para ERPs"* (`codigo=8476`),
*"Como gerar chave API para integração com ERP homologado"* (`codigo=8536`) e *"Quais ERPs
estão integradas com API Domínio?"* (`codigo=12917`).

| Aspecto | O confirmado |
|---|---|
| Propósito | O escritório recebe documentos fiscais direto do ERP do cliente, sem importação manual de XML/TXT |
| Escopo de documentos | **NF-e, NFC-e, NFS-e, CF-e, CT-e** e **Pagamento/Recebimento de Parcelas** |
| Folha | **Ausente do escopo** |
| Acesso | E-mail para **`api.dominio@tr.com`** com nome e e-mail do sistema; chaves liberadas em ~1 dia útil [F2] |
| Custo | Declarado **sem custo adicional, disponível a todos os clientes independentemente do pacote** [F2] |
| Gate | Chave gerada para **"ERP homologado"** — há um processo de homologação [F1] |
| Prova de que funciona | Omie publica *"Configurando a Integração com a Domínio via API"*; Fiscal.io anuncia homologação como parceiro Thomson Reuters | [F2] |

**(b) Onvio BR Accounting API — Developer Portal da Thomson Reuters** [F1]

| Aspecto | O confirmado |
|---|---|
| Autenticação | **OAuth 2.0** |
| Obtenção de credenciais | E-mail ao time Onvio BR API com nome da empresa, contato, telefone, e-mail e **callback URL**; recebe `client_id` e `client_secret` |
| Recursos documentados | Exatamente três: **`ClientInfoResource`** (lista clientes que o usuário pode integrar), **`IntegrationResource`** (checa conectividade da aplicação), **`InvoiceIntegrationResource`** (cria lote de arquivos a processar) |
| Tipos de arquivo | NF-e e NFC-e (XML 4.0), CT-e (XML 3.0), CF-e (XML 0.07/0.08) |
| Folha | **Nenhum endpoint** |
| Existência de cliente terceiro | Projeto público `WillHubner/IntegraOnvio` no GitHub — classe de integração da API Onvio para XMLs do Domínio | [F2] |

**Conclusão da §2.1, e ela é dura:** as duas APIs do Domínio são, na prática, **canos de
entrada de XML fiscal**. Uma delas nem sequer lê dados — `IntegrationResource` é um health
check. **Não existe caminho de API para folha, nem para ler, nem para gravar.** Qualquer
proposta que pressuponha "a gente integra o Lior à folha do Domínio via API" está,
até prova em contrário, **inventando**.

> `PENDÊNCIA — não confirmado, exige contato com o fornecedor:` se há roadmap de API de
> folha, e se existe algum programa de parceria (ISV) que exponha endpoints além dos três.

### 2.2 Importação e exportação por arquivo — este é o caminho que existe de verdade

Aqui a pesquisa é farta, e é a boa notícia do documento.

#### 2.2.1 Entrada: importar lançamentos e ponto para a Folha do Domínio

| Item | O confirmado | Selo |
|---|---|---|
| Rota de menu | **Utilitários > Importação > de Arquivo Texto > de Lançamentos** (artigo oficial `codigo=3373`, *"Como importar lançamentos de Arquivo Texto - TXT?"*) | [F1] |
| Uso declarado | "Importação de arquivos de outros sistemas, como sistema de registro de ponto eletrônico, rubricas de horas extras, comissões etc." | [F1] |
| Opção **Lançamento de horas** | `Horas decimais` ou `Horas minutos` | [F1] |
| Opção **Lançamentos existentes** | `Não importar` ou `Sobrescrever` | [F1] |
| Layout | Definido por **posição inicial e tamanho de campo** — leiaute configurável | [F2] |
| Layout alternativo com separador | **"Leiaute Domínio Sistemas com Separador"**, separador **pipe `\|`**, via **Utilitários > Importação > Importação Padrão**. Artigos oficiais `codigo=672` e `codigo=11916` | [F1] [F2] |
| Outras rotas de entrada | *"Como importar Médias em arquivo texto?"* (`codigo=8844`), *"Como importar para folha lançamentos em Excel?"* (`codigo=6887`), *"Leiaute: Importação Arquivo Texto"* (`codigo=8814`) | [F1] |
| Exemplos de conteúdo | Rubrica 200 = HE 100%, quantidade 20,00 em horas decimais; rubrica 150 = HE 50%, 15,00; rubrica 37 = comissões, R$ 500,00 | [F2] |
| Códigos de tipo de folha | 11 mensal · 41 adiantamento · 42 complementar · 51 adiantamento 13º · 52 13º salário · 70 PLR | [F2] — **confirmar** |
| Chave de casamento | O cadastro do empregado (**PIS, CPF ou matrícula**) precisa ser **idêntico** nos dois sistemas; divergência faz a folha **rejeitar aquele empregado** | [F2] |

**Prova de que o caminho é real e maduro:** sistemas de ponto de terceiros **já trazem o
layout Domínio pronto de fábrica**.

| Sistema de ponto | O confirmado | Selo |
|---|---|---|
| **Secullum Ponto 4 / Web** | Gera lançamentos de folha em `.txt` **no layout Domínio**. Layouts pré-configurados para TOTVS, Senior, Alterdata, **Domínio**, Fortes e outros. Novo layout é importado em *Manutenção > Exportação de Dados > Layouts de Exportação de Cálculos* | [F2] |
| **Pontomais / VR** | Exportação para folha com criação e configuração de layout próprio | [F2] |
| **Tangerino (Sólides Ponto)** | Exportação direta para sistemas de folha | [F2] |
| **Ahgora** | Exportação e integração com folha | [F2] |
| **Contmatic, Calima, IOB, Athenas** | Publicam manuais de "importação de arquivo TXT do ponto para a folha" — o padrão é setorial | [F2] |

> Isto é decisivo para a G41: **o Lior não precisa inventar nada.** Precisa gerar o mesmo
> arquivo que o Secullum já gera há anos.
>
> `PENDÊNCIA — não confirmado:` o **leiaute campo a campo** (posições, tamanhos, tipos,
> ordem, cabeçalho/rodapé, encoding, tratamento de decimal) não pôde ser lido, porque os
> artigos `codigo=3373`, `672`, `11916` e `8814` estão em domínio bloqueado. **Sem esse
> arquivo aberto, não se escreve o gerador.**

#### 2.2.2 Saída: exportar da Folha do Domínio

| Item | O confirmado | Selo |
|---|---|---|
| Integração contábil | Artigos oficiais *"Exportar integração contábil do módulo folha"* (`codigo=4497`) e *"Como gerar arquivo texto da Integração Contábil?"* (`codigo=3554`) | [F1] |
| Configuração | Módulo Folha > Controle > Parâmetros > aba Contabilidade > `[x] Gera lançamentos contábeis`; depois **Arquivo > Contabilidade > Configurar Integração > aba Arquivo Texto > `[x] Exportar para o Domínio Contabilidade`** | [F2] |
| Regra de consistência | Total de **débito precisa igualar o total de crédito**, senão a exportação é barrada com relatório de inconsistências | [F2] |
| Caso de uso declarado | "Quando o cálculo da folha é feito em um sistema e a contabilidade em outro" — o arquivo pode ser importado no Domínio de outro escritório **ou em outro sistema contábil** | [F2] |
| Layout publicado por terceiro | "Folha: Layout do arquivo de Integração Contábil Formato 19 — Domínio", publicado por integrador | [F2] |

**Este achado é o que torna o cenário (B) tecnicamente viável**: existe um formato declarado
para **folha calculada fora → contabilização dentro do Domínio**, e ele é o mesmo caminho
que a Omie documenta para lançamentos contábeis (*"Leiaute com Separador"* e *"Leiaute em
Lote"*) [F2].

#### 2.2.3 O atalho de carga inicial que quase ninguém usa

Artigo oficial *"Como fazer importação de dados do eSocial?"* (`codigo=7686`) [F1]: o Domínio
Folha **importa o cadastro de colaboradores direto do Portal do eSocial**, para empresas que
já têm informação no eSocial e ainda não têm cadastro no Domínio.

Leitura estratégica: **a fonte de verdade cadastral já é o eSocial, não o Domínio.** Se o
Lior algum dia precisar de carga inicial, o caminho é o mesmo — e não depende do fornecedor.

Contraponto, também confirmado [F2]: a ferramenta **eSocial Bx**, que baixa eventos
transmitidos, **não permite baixar a base inteira em lote** — cabe ao empregador obter do
fornecedor do software antigo todos os XML enviados. Isso é matéria de due diligence (§7).

### 2.3 Acesso direto ao banco de dados — tecnicamente possível, estrategicamente ruim

| Aspecto | Situação | Selo |
|---|---|---|
| Banco | Sybase / SAP SQL Anywhere, com manual oficial de migração para a versão 17 | [F1] |
| Leitura externa | Relatos de leitura via usuário externo com Microsoft Query + Excel, e de tentativas via Java para relatórios complexos | [F3] |
| Escrita | Relato de que usuários criados pelo sistema **não permitem update**; para isso o suporte fornece um arquivo SQL | [F3] |
| Credencial de controle total | Objeto de pedido recorrente em fórum — sinal claro de que **não é entregue ao cliente** | [F3] |
| Dificuldade estrutural | Fórum técnico de BI relata que as tabelas são organizadas de forma que dificulta entender conteúdo e relacionamentos | [F3] |
| Contrato | Termos da Thomson Reuters proíbem **engenharia reversa, descompilação, desmontagem** e reprodução de código, com obrigação que **sobrevive ao término do contrato**. A redação lida veio dos termos do **OnBalance** e de EULAs Thomson Reuters | [F1] parcial |

**Veredito honesto, e ele contraria a tentação de engenheiro:** ler o Sybase do Domínio é o
caminho mais rápido para um protótipo e o mais caro para um produto.

1. **Não há esquema documentado.** Cada atualização do Domínio pode mudar tabela e coluna
   sem aviso, porque o esquema não é uma interface pública — é órgão interno.
2. **A escrita é praticamente vedada** e, se forçada, corrompe silenciosamente o sistema que
   transmite eSocial. Um `update` errado não gera erro de tela; gera folha errada.
3. **O risco contratual é real e assimétrico.** Mesmo que a leitura não seja engenharia
   reversa, quem interpreta a cláusula primeiro é quem tem advogado dedicado.
4. **É um passivo de manutenção permanente** para economizar semanas de trabalho de arquivo.

> Recomendação: **usar acesso direto ao banco apenas para leitura de diagnóstico pontual e
> não recorrente** (ex.: levantar o de-para de rubricas uma vez, para a migração). **Nunca**
> como interface de produto.
>
> `PENDÊNCIA — não confirmado, exige contato com o fornecedor:` a **cláusula exata do
> contrato Domínio Contábil/Folha da G41** sobre acesso ao banco e sobre integração de
> terceiros. O EULA específico do Domínio Contábil não foi lido; o que foi lido em resumo
> foram termos OnBalance e o EULA geral Thomson Reuters. **Isto tem que sair do contrato
> assinado da G41, não da internet.**

### 2.4 Integrações com terceiros que já existem — a prova de que o caminho é transitável

| Terceiro | Natureza da integração | Selo |
|---|---|---|
| **Conta Azul** | Integração declarada como "inédita e exclusiva" com o Domínio; a Conta Azul mantém FAQ próprio | [F1] [F2] |
| **Omie** | Integração via **API Domínio** e via arquivo (leiaute com separador e em lote), com artigos próprios | [F2] |
| **Fiscal.io Monitor** | Anuncia-se **parceiro homologado Thomson Reuters / Domínio** | [F2] |
| **ERPFlex, Maxiprod, CH ERP, Radinfo** | Publicam manuais de integração com o Domínio | [F2] |
| **Secullum, Pontomais, Tangerino, Ahgora** | Exportação de ponto para folha, com layout Domínio de fábrica no caso do Secullum | [F2] |
| Página oficial de parceiros | `dominiosistemas.com.br/parceiros/` — "todos os parceiros são integrados ao Domínio Pro e Max" | [F1] |

Note o padrão: **todo parceiro homologado que se confirmou é fiscal, financeiro ou de
ponto — nenhum é de folha.** Isso é coerente com a §2.1. O Domínio abre a entrada de dados;
não abre a folha.

---

## 3. Risco operacional crítico — duas folhas transmitindo ao eSocial

Esta seção é a que pode custar mais caro que todo o resto do projeto somado.

### 3.1 A regra que governa o conflito

| Regra | Conteúdo | Selo |
|---|---|---|
| Chave de identificação | Para **S-1200, S-1202, S-1207 e S-1210**, a chave é o **CPF do trabalhador**; **não pode haver dois eventos válidos do mesmo declarante, para o mesmo CPF, no mesmo período de apuração e mesmo `indGuia`** | [F2] |
| Erro de duplicidade | Código **106** — *"Foi localizado no sistema um evento em duplicidade com o evento a ser enviado"*, disparado por mesma combinação de tipo/número de inscrição, CPF e período de apuração | [F2] |
| Substituição | Para substituir um evento, é preciso **excluí-lo** ou enviar o novo **com indicativo de retificação e referência ao recibo do evento anterior** | [F2] |
| Transmissor | O `ideTransmissor/nrInsc` do lote precisa ser **igual ao CNPJ/CPF do certificado** que assina | [F2] |
| Troca de sistema | Para processar por um novo sistema é preciso **encerrar os conceitos anteriores no Ambiente Nacional** referentes ao software antigo, e **migrar todo o histórico de tabelas** (lotação, cargo etc.) mantendo fidelidade ao que foi enviado ao governo | [F2] |

> `PENDÊNCIA — não confirmado:` as regras acima vêm de bases de conhecimento de fornecedores
> (Alterdata, Questor, Senior, TOTVS) e de um espelho não oficial do Anexo II. **O Anexo II
> das Regras de Validação e o MOS S-1.3 não puderam ser lidos na origem** (`gov.br` e
> espelhos bloqueados). Antes de codar, ler na fonte.

### 3.2 O cenário de falha, passo a passo

Suponha que a G41 coloque o empregador **X** para calcular no Lior enquanto o Domínio segue
ativo para o mesmo X.

1. **O recibo é a moeda, e ela só existe de um lado.** Cada evento aceito devolve um número
   de recibo. Retificar exige **referenciar o recibo do evento original**. O Lior não tem o
   recibo dos eventos que o Domínio enviou, e vice-versa. **Já no primeiro mês os dois
   sistemas ficam cegos um para o outro.**
2. **O segundo a enviar é rejeitado** com erro 106 — se der sorte. Rejeição é o cenário
   **bom**: o dado errado não entra.
3. **O cenário ruim é o inverso.** Se o segundo sistema enviar com indicativo de retificação
   apontando para um recibo que ele conhece, ou se o primeiro reenviar depois de uma
   exclusão feita pelo outro, **a versão que prevalece no Ambiente Nacional passa a ser
   decidida por ordem de chegada**, não por correção.
4. **Os totalizadores decidem o que se paga.** O fechamento (**S-1299**) consolida a
   competência e alimenta os retornos totalizadores, que alimentam **DCTFWeb** e **FGTS
   Digital**. Dois sistemas fechando a mesma competência produzem **uma guia que não
   corresponde à folha de nenhum dos dois**.
5. **A limpeza é manual, evento a evento, por CPF e por competência.** Não existe "desfazer
   competência". E o passivo é do empregador — quer dizer, do **cliente da G41**.
6. **A cadeia continua depois.** Rescisão, 13º e férias referenciam períodos anteriores. Uma
   competência inconsistente contamina as seguintes.

E a agravante silenciosa: **o eSocial não sabe que existem dois sistemas.** Não há registro
de software transmissor, não há trava, não há aviso. O Ambiente Nacional vê **um empregador**
mandando eventos contraditórios. **A trava tem que ser organizacional, porque técnica não
existe.**

### 3.3 A única configuração segura

> **Por empregador (CNPJ), em qualquer competência, exatamente um sistema é a fonte da
> verdade do eSocial. Sem exceção, sem período de sobreposição, sem "só esse mês".**

Operacionalmente, isso significa:

| Regra | Consequência prática |
|---|---|
| **A migração é por empregador, não por escritório** | Cada CNPJ vira "Lior" ou "Domínio" numa data de corte, e nunca os dois |
| **O corte é no limite da competência** | Nunca no meio do mês. E, com 13º e rescisões em jogo, o corte natural é **1º de janeiro** |
| **Migrar a competência inteira, incluindo o histórico** | Cadastro, tabelas (cargo, lotação, rubricas), **e os recibos dos eventos já transmitidos** |
| **Desligar de verdade o outro lado** | Não basta parar de usar. É preciso encerrar os conceitos no Ambiente Nacional e garantir que ninguém clique "enviar" no sistema antigo |
| **Trava no produto, não no procedimento** | O Lior deve ter, no cadastro do empregador, uma flag `fonte_esocial` cujo valor é **`lior` ou `externo`**, e o transmissor **recusa** enviar qualquer evento de empregador marcado `externo`. Um checklist não impede um clique; um `if` impede |

**Corolário desconfortável para o cenário (B):** "tirar só a folha do Domínio" **não é uma
migração parcial**. Para cada empregador migrado, é migração total de folha e de eSocial.
O que continua no Domínio é fiscal e contábil — **nunca a folha do mesmo CNPJ pela metade.**

---

## 4. O que o Domínio não faz — e a lista é bem menor do que se supunha

Esta seção era, na hipótese inicial, o argumento a favor de construir. **A pesquisa a
enfraquece consideravelmente**, e isso precisa ser dito antes de qualquer plano.

| Capacidade | Domínio tem? | Evidência | Selo |
|---|---|---|---|
| **Portal do empregado** | **Sim** | Onvio Portal do Empregado: holerite, férias, informe de rendimentos, recibo de VT/VA; **web e app iOS e Android**. Publicação a partir de Módulo Folha > Recibos | [F1] |
| **Autoatendimento do cliente** | **Sim** | Onvio Portal do Cliente: solicitações de **cadastro de empregado, aviso de férias, cálculo de rescisão, afastamento**; e **lançamento de rubricas pelo cliente**, com o escritório configurando quais rubricas são permitidas e processando via "Executar no Sistema" | [F1] [F2] |
| **Admissão digital** | **Parcial** | A primeira versão do Onvio já citava "cadastro de empregado e envio ao eSocial"; e o Portal do Cliente aceita solicitação de cadastro de empregado. **Não confirmado** se há coleta de documentos pelo próprio candidato, validação e geração de contrato | [F1] parcial |
| **Painel de prazos e obrigações** | **Sim** | Domínio Processos: calendário de obrigações, controle de prazos e entregas, tempo de produção por tarefa, dashboards, notificação ao cliente | [F1] |
| **Experiência mobile** | **Sim, para o empregado e para documentos** | Apps Onvio Portal do Empregado, Onvio Portal do Cliente, Onvio Documentos | [F1] |
| **Integração com WhatsApp** | **Sim** | Domínio Messenger — WhatsApp integrado ao Domínio, com IA, "mais de 25 tarefas sem intervenção manual". **Módulo pago à parte** | [F1] |
| **Assinatura eletrônica** | **PENDÊNCIA** | Onvio Documentos publica e distribui documentos; **nada confirmado sobre assinatura eletrônica embutida** | PENDÊNCIA |
| **Dados abertos para BI** | **Não, na prática** | Não há endpoint de leitura. `ClientInfoResource` lista clientes; `IntegrationResource` é health check. Restam relatórios, arquivos exportados e o banco Sybase — cujas tabelas usuários de BI relatam ser difíceis de interpretar | [F1] + [F3] |
| **API de folha (ler/gravar)** | **Não** | Ver §2.1 | [F1] |
| **Motor de folha acessível programaticamente** | **Não** | Consequência da arquitetura desktop | [F1] |

### 4.1 A lacuna real, depois de tirar o que é mito

Sobram **duas**, e as duas são da mesma família:

1. **Dado fechado.** O Domínio recebe bem e devolve mal. Entra documento fiscal por API,
   entra lançamento por arquivo, entra cadastro do eSocial. **Sai** relatório, PDF e um
   arquivo de integração contábil. Não existe leitura programática do que a folha calculou.
   Isso trava BI, produto de dados, conferência automatizada e qualquer camada analítica que
   a G41 queira vender.
2. **A experiência é do Domínio, não da G41.** Portal do Empregado, Portal do Cliente e
   Messenger existem — **com a marca e o desenho da Thomson Reuters**, e vendidos por módulo.
   O cliente da G41 tem hoje relação com uma interface que não é da G41. Isso é um problema
   **de posicionamento e de propriedade do relacionamento**, não de funcionalidade.

**Desafio explícito à premissa do projeto:** se a justificativa para construir folha própria
era "o Domínio não tem portal do empregado / autoatendimento / WhatsApp / painel de prazos",
**essa justificativa não sobrevive à pesquisa.** Ele tem todos os quatro. A justificativa
que sobrevive é outra, e é mais estreita e mais honesta: **a G41 não é dona do dado nem da
interface**. Vale a pena decidir se esse é um problema de R$ 500 mil de engenharia ou de
uma negociação comercial e um projeto de dados bem menor.

---

## 5. Cenários

Premissas de leitura: "tempo até valor" é tempo até o primeiro benefício sentido pelo
escritório ou pelo cliente, não até a conclusão. Custos são de esforço e risco — **preço do
Domínio é PENDÊNCIA** (§8).

### 5.1 (A) Domínio continua sendo o motor; o Lior é a camada de experiência

**Desenho.** A folha continua sendo calculada e transmitida pelo Domínio. O Lior entra por
duas pontas: (i) **antes**, alimentando a folha com arquivo — ponto, variáveis, rubricas; e
(ii) **depois**, oferecendo ao cliente e ao empregado uma experiência de marca G41 sobre o
que a folha produziu.

| | |
|---|---|
| **Ganha** | Elimina digitação de variáveis, que é onde erro e retrabalho moram. Zero risco de eSocial. Sem passivo trabalhista novo. Aproveita o ponto que já roda. Recupera a marca no relacionamento |
| **Custa** | Um gerador de arquivo no leiaute do Domínio; conciliação de chaves (PIS/CPF/matrícula); disciplina de de-para de rubricas. A camada (ii) esbarra no dado fechado — sem API de leitura, ela depende de exportação manual ou de leitura do banco |
| **Risco** | Baixo na ponta (i). **Médio-alto na ponta (ii)**, porque a experiência sobre dado que você não consegue ler é frágil. Risco de mudança de leiaute a cada atualização |
| **Tempo até valor** | **Semanas** para a ponta (i) |

### 5.2 (B) Tirar só a folha; fiscal e contábil ficam no Domínio

**Desenho.** Lior calcula a folha e transmite o eSocial. A contabilização volta ao Domínio
por arquivo.

| | |
|---|---|
| **Ganha** | Controle do motor, do dado e da experiência. Possibilidade de produto |
| **Custa** | **O motor inteiro** — o que os documentos `03`, `08`, `09` e `10` desta pasta descrevem, e cuja lista de fontes ainda não foi fechada (`FONTES-A-BAIXAR.md`). Mais o retorno da contabilização: existe caminho confirmado (§2.2.2), mas exige plano de contas de-para, débito igual a crédito, e reconciliação **mensal por cliente** |
| **Risco** | **O maior de todos, e é o do §3.** Não é gradual: cada empregador migrado é migração total, com corte de competência, migração de histórico e recibos, e desligamento verificável do outro lado. Um clique errado no Domínio de um cliente já migrado gera duplicidade |
| **Tempo até valor** | **Trimestres, no melhor caso.** E o valor só aparece depois de o primeiro empregador fechar uma competência inteira sem incidente |

**A armadilha do nome.** "Tirar só a folha" soa como o menor dos escopos de construção. É o
maior dos escopos de **risco**, porque é o único que coloca a G41 dentro do caminho crítico
de uma obrigação legal de terceiros.

### 5.3 (C) Substituir o Domínio inteiro ao longo do tempo

| | |
|---|---|
| **Ganha** | Independência total, dado próprio, produto próprio, fim da mensalidade |
| **Custa** | Folha + escrita fiscal + contábil + honorários + patrimônio + processos + portais. É construir a Thomson Reuters. Some a isso o SPED, a ECD, a ECF, a EFD-Reinf e a **Reforma Tributária em transição até 2033** |
| **Risco** | Existencial. E a Reforma consome, nos próximos anos, exatamente a capacidade de engenharia que esse projeto exigiria |
| **Tempo até valor** | **Anos** |

**Veredito:** descartar como plano. Manter apenas como **direção** — se (A) e depois (B)
derem certo por anos, (C) deixa de ser decisão e vira consequência.

### 5.4 (D) Não construir folha; manter tudo como está

| | |
|---|---|
| **Ganha** | Zero risco novo. Toda a capacidade de engenharia vai para o Masor (motor fiscal) e para a Reforma Tributária, que é onde há prazo legal e diferenciação vendável |
| **Custa** | Continua sem dado próprio, sem marca na interface, dependente de um fornecedor com poder de precificação. E o ponto que já roda no Lior segue **desconectado**, gerando digitação |
| **Risco** | Estratégico e lento: o escritório continua sendo usuário de uma plataforma, não dono de uma |
| **Tempo até valor** | Imediato, porque não há mudança |

### 5.5 Quadro comparativo

| | (A) Camada de experiência | (B) Só a folha | (C) Substituir tudo | (D) Não fazer |
|---|---|---|---|---|
| Risco de eSocial | **Nenhum** | **Alto** (§3) | Alto | Nenhum |
| Esforço de engenharia | Baixo a médio | Muito alto | Extremo | Nenhum |
| Tempo até valor | **Semanas** | Trimestres | Anos | Imediato |
| Reduz digitação hoje | **Sim** | Sim, depois | Sim, muito depois | Não |
| Dá dado próprio à G41 | Parcial | Sim | Sim | Não |
| Reversível | **Sim** | Difícil | Não | — |
| Depende de fonte não lida | Só o leiaute | **Todo o motor** | Tudo | — |
| Compete com a Reforma Tributária pela mesma equipe | Pouco | **Muito** | Totalmente | Não |

---

## 6. Ponto de alavancagem — o ponto já roda, e é aí que está o retorno

**A integração de maior retorno e menor risco é a ponta (i) do cenário (A): o Lior gerar o
arquivo de lançamentos de folha no leiaute do Domínio, a partir do ponto que ele já apura.**

Por quê, em quatro linhas:

- **O risco é zero no que importa.** O Lior não fala com o eSocial. Quem transmite continua
  sendo o Domínio, e a fonte da verdade não muda. Se o arquivo estiver errado, o Domínio
  rejeita ou o DP vê na conferência — o erro morre dentro do escritório.
- **O trabalho evitado é o mais caro que existe no DP.** Digitação de variáveis mês a mês,
  empregado a empregado, com erro que só aparece no líquido.
- **O caminho é conhecido e provado por terceiros.** O Secullum já entrega esse arquivo. Não
  há inovação técnica envolvida — há disciplina de leiaute.
- **É reversível e barato.** Se não funcionar, joga fora o gerador. Nada mais foi tocado.

### 6.1 O caminho concreto, em ordem

| Passo | O que fazer | Portão |
|---|---|---|
| **0** | **Abrir os artigos `codigo=3373`, `672`, `11916` e `8814` de uma rede sem bloqueio** e salvar o leiaute campo a campo em `docs/folha/`. Se não estiverem acessíveis, pedir ao suporte Domínio | **Portão obrigatório. Sem isso não se escreve linha** |
| **1** | Levantar o **de-para de rubricas** entre o Lior e o Domínio, por cliente. Este é o trabalho real e ele é de DP, não de engenharia. Ver `09-rubricas-e-reconciliacao.md` | Só depois do passo 0 |
| **2** | **Conciliar a chave** de empregado. Definir PIS ou CPF como chave (matrícula diverge com mais facilidade) e rodar um relatório de divergência **antes** de gerar qualquer arquivo | Divergência = rejeição silenciosa |
| **3** | Escrever o gerador. Fixar **horas decimais** como convenção e `Não importar` como opção padrão de lançamentos existentes, para que uma reimportação nunca sobrescreva sem intenção | |
| **4** | **Piloto com um cliente pequeno, por três competências, com dupla conferência.** Gerar o arquivo **e** digitar como sempre; comparar os dois resultados antes de confiar | Só remove a digitação depois de três meses idênticos |
| **5** | Só então avaliar a ponta (ii) — a camada de experiência — sabendo que ela depende de um dado que hoje não sai por API | |

### 6.2 A segunda alavanca, se a primeira funcionar

A **API Domínio de documentos fiscais** (§2.1a): sem custo adicional declarado, chave em
~1 dia útil, e conversa com o motor fiscal que a G41 **já está construindo** (Masor). Aqui a
sinergia é direta — o Masor calcula e o Domínio recebe o documento fiscal pelo canal oficial,
sem arquivo intermediário. **Confirmar se a G41 se qualifica como "ERP homologado"**, que é
o gate declarado.

---

## 7. Due diligence com a Thomson Reuters / Domínio

Perguntas para fazer **por escrito**, exigindo resposta por escrito. A resposta verbal de um
executivo de contas não é lastro; a G41 não escreve regra fiscal de memória e não deve
escrever arquitetura de memória.

### 7.1 API e integração

1. Existe **API de folha de pagamento** — leitura ou escrita — em qualquer produto da linha
   Domínio ou Onvio? Se não existe, **está no roadmap**, e com que horizonte?
2. Os três recursos do Onvio BR Accounting API (`ClientInfoResource`, `IntegrationResource`,
   `InvoiceIntegrationResource`) são **o escopo completo** da API pública? Existe catálogo
   não público?
3. A **API Domínio** (`api.dominio@tr.com`) cobre exatamente NF-e, NFC-e, NFS-e, CF-e, CT-e
   e parcelas? **Confirmar que não há custo adicional** e que vale para o pacote da G41.
4. Quais são os **critérios de homologação como ERP parceiro**? Prazo, custo, exigências
   técnicas, e o que acontece se a G41 for ao mesmo tempo cliente e desenvolvedor.
5. Existe **ambiente de homologação/sandbox**? Existe SLA e política de versionamento e
   descontinuação de endpoint?
6. Há **limite de requisição, de volume ou de empresas** na integração?

### 7.2 Arquivo — o que realmente decide o curto prazo

7. **Enviar o leiaute completo e vigente** da importação de lançamentos da Folha: posições,
   tamanhos, tipos, ordem, encoding, decimal, cabeçalho e rodapé, e os códigos de tipo de
   folha (a confirmar: 11, 41, 42, 51, 52, 70).
8. O leiaute tem **política de versionamento**? A G41 é **avisada antes** de uma mudança que
   quebre o arquivo? Existe compatibilidade retroativa?
9. Qual é a **chave oficial de casamento** do empregado na importação — PIS, CPF ou
   matrícula — e o que acontece com registro divergente: rejeita a linha ou o arquivo?
10. Qual o **leiaute completo do arquivo de integração contábil** gerado pela Folha
    (o "Formato 19" e os demais)? Quais formatos o **Domínio Contabilidade importa**?
11. Existe leiaute de **exportação da folha calculada** — verba a verba, por empregado — para
    além da integração contábil? (Esta é a pergunta que abre ou fecha o BI.)

### 7.3 Banco de dados e contrato

12. O contrato da G41 **permite acesso direto de leitura ao banco Sybase/SQL Anywhere** por
    ferramenta de terceiros? **Pedir a cláusula, por número.**
13. Existe **usuário somente-leitura oficialmente suportado**, com credencial fornecida?
14. Existe **dicionário de dados** ou documentação de esquema disponível a cliente?
15. Acessar o banco por leitura **afeta suporte, garantia ou SLA**? Se sim, qual a redação?
16. Qual a política quando uma atualização muda o esquema e quebra uma integração de leitura
    do cliente?

### 7.4 Saída de dados e reversibilidade

17. Na rescisão contratual, **em que formato os dados são devolvidos**, em quanto tempo, e
    com que completude? (Os termos do OnBalance citam extração em `.csv` durante a janela de
    suspensão, e exclusão irrecuperável depois — **confirmar se essa regra vale para
    Domínio Contábil e Folha**.)
18. A Thomson Reuters entrega **todos os XML de eventos eSocial já transmitidos** por cliente?
    Isto é crítico: o eSocial Bx não baixa a base inteira em lote, e o histórico de recibos
    é o que torna qualquer migração futura possível.
19. Existe **backup restaurável entregue ao cliente**, e o cliente consegue restaurá-lo sem
    o fornecedor?
20. Papéis de LGPD: em qual configuração (desktop local, Domínio Web em Amazon, Onvio) a
    Thomson Reuters é **operadora** e em qual a G41 é **controladora**? Onde ficam os dados,
    e há transferência internacional?

### 7.5 Comercial

21. **Preço por módulo e por empresa**, na composição exata da G41 hoje: quanto é folha,
    quanto é fiscal, quanto é contábil, quanto são os portais, quanto é o Messenger.
22. O que muda no preço se a G41 **remover o módulo Folha** e mantiver fiscal e contábil?
    (Esta é a pergunta que dá o número real do cenário B — e, muitas vezes, a que revela que
    o desconto não compensa o risco.)
23. Prazo de fidelidade, multa rescisória, reajuste e índice.
24. Quanto custa **cada módulo Onvio** separadamente, e o Messenger.
25. Existe **plano com API ou dados** diferenciado nas linhas One / Pro / Max?

---

## 8. Pendências — o que não foi confirmado

Nenhum item abaixo pode ser tratado como fato. A numeração é para referência em tarefa.

| # | Pendência |
|---|---|
| **D-01** | **Nenhuma página oficial foi aberta.** Todo selo [F1] precisa de reverificação abrindo a URL. Esta é a pendência que contamina todas as outras |
| **D-02** | `PENDÊNCIA — não confirmado, exige contato com o fornecedor:` **leiaute campo a campo** da importação de lançamentos da Folha (`codigo=3373`, `672`, `11916`, `8814`). **Bloqueia o item 6.1** |
| **D-03** | Códigos de tipo de folha (11 mensal, 41 adiantamento, 42 complementar, 51 adiant. 13º, 52 13º, 70 PLR) — vieram de fonte agregada [F2] |
| **D-04** | Existência de rota de menu dedicada **"Importação de ponto"** separada de "de Lançamentos" — indício [F2], não confirmado em fonte oficial |
| **D-05** | Leiaute completo da **integração contábil** da Folha e do "Formato 19" |
| **D-06** | Se existe **exportação da folha calculada verba a verba** — não confirmada em nenhuma fonte |
| **D-07** | Se existe ou está previsto **qualquer endpoint de folha** em Domínio ou Onvio |
| **D-08** | **Cláusula contratual exata** sobre acesso ao banco no contrato da G41. O que foi lido em resumo são termos OnBalance e EULA geral Thomson Reuters, **não o EULA do Domínio Contábil/Folha** |
| **D-09** | Versão e edição exata do Sybase/SQL Anywhere na instalação da G41 |
| **D-10** | **Preço.** `PENDÊNCIA — preço não publicado, exige contato comercial.` Valores de fórum (~R$ 1.300/mês para 5 usuários, 2024; ~R$ 240/mês em configuração simples) são **[F3] e não devem ser citados em nenhuma análise** |
| **D-11** | Se o Onvio Documentos tem **assinatura eletrônica** embutida |
| **D-12** | Escopo real de **admissão digital**: se o candidato envia documentos, se há validação e geração de contrato |
| **D-13** | Regras de validação do eSocial sobre duplicidade (§3.1) — **lidas em bases de fornecedores, não no Anexo II oficial**. Confirmar contra o MOS S-1.3 e o Anexo II na origem |
| **D-14** | Política de devolução de dados e de entrega dos XML eSocial na rescisão |
| **D-15** | Se o Domínio Web (emulador com banco em Amazon) **muda alguma coisa** quanto ao acesso ao banco e à localização do dado para fins de LGPD |
| **D-16** | Se a linha atual do contrato da G41 é One, Pro, Max, ou ainda a nomenclatura antiga (Contábil Plus/Premium) |
| **D-17** | Critérios, custo e prazo do processo de **homologação de ERP parceiro** |

---

## 9. Recomendação

**Não construir folha agora. Fazer (A), na ponta do arquivo, e só ela.**

O raciocínio, em quatro pontos:

1. **A justificativa funcional para construir caiu.** Portal do empregado, autoatendimento do
   cliente, painel de prazos, WhatsApp e app mobile — o Domínio tem todos. Quem defender a
   construção com esses argumentos está defendendo com informação vencida.
2. **A justificativa que sobra é dado e marca**, e ela é legítima — mas é uma justificativa
   de **produto de dados e posicionamento**, não de motor de folha. Motor de folha é o
   caminho mais caro e mais arriscado de resolver um problema de propriedade de dado.
3. **O risco do §3 é categoricamente diferente dos outros riscos do projeto.** Um erro no
   Masor gera um número errado numa simulação. Um erro de duplicidade no eSocial gera passivo
   trabalhista e previdenciário **do cliente**, com limpeza manual evento a evento. Esse
   risco não deve ser assumido para capturar uma eficiência que o arquivo já captura.
4. **A capacidade de engenharia tem destino melhor.** A Reforma Tributária está em transição
   e o Masor é o produto que a G41 pode vender por isso. Folha compete com ela pela mesma
   equipe, e perde na comparação de retorno.

**O que fazer nos próximos 30 dias, em ordem:**

1. Abrir as URLs de §9.1 de uma rede sem bloqueio e fechar **D-02**. É o único portão que
   importa agora.
2. Disparar a due diligence do §7 por escrito, priorizando as perguntas **7, 11, 12, 17, 18
   e 22** — são as que mudam a decisão.
3. Rodar o passo 2 do §6.1 (conciliação de chave de empregado). É trabalho de DP, não de
   engenharia, e pode começar hoje.
4. **Reavaliar (B) apenas se** — e só se — a resposta à pergunta 11 for "não existe
   exportação da folha verba a verba" **e** a resposta à 22 mostrar que o módulo Folha custa
   o suficiente para pagar o risco. Nas outras combinações, (A) permanece.

E manter o resto da pesquisa desta pasta onde ela está: **entendimento válido, decisão
adiada.** Nenhuma regra dos documentos `01` a `10` vira código antes de `FONTES-A-BAIXAR.md`.

---

### 9.1 URLs a abrir primeiro (fecham D-02, D-05 e D-07)

```
https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=3373   (importar lançamentos TXT — folha)
https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=672    (leiaute Domínio com separador)
https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=11916  (leiaute Domínio com separador)
https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=8814   (leiaute importação arquivo texto)
https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=4497   (exportar integração contábil da folha)
https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=3554   (gerar arquivo texto da integração contábil)
https://suporte.dominioatendimento.com/central/faces/solucao.html?codigo=7686   (importar cadastro do eSocial)
https://developerportal.thomsonreuters.com/onvio-br-accounting-api              (escopo real da API Onvio)
https://www.dominiosistemas.com.br/lp-centraldodesenvolvedor-api/               (escopo real da API Domínio)
```

---

## 10. Fontes

Todas acessadas em **30/08/2026**, **via índice de busca**. Nenhuma foi aberta diretamente —
ver §0.

### Oficiais — Thomson Reuters / Domínio / Onvio

- Soluções Domínio (home) — https://www.dominiosistemas.com.br/
- Domínio One — https://www.dominiosistemas.com.br/solucoes/dominio-one/ · Módulos One — /solucoes/dominio-one/modulos/
- Domínio Pro — https://www.dominiosistemas.com.br/solucoes/dominio-pro/ · Módulos Pro — /solucoes/dominio-pro/modulos/
- Domínio Max — https://www.dominiosistemas.com.br/solucoes/dominio-max/
- Domínio Web — https://www.dominiosistemas.com.br/solucoes/dominio-web/
- Evolução em Nuvem — https://www.dominiosistemas.com.br/solucoes/evolucao-em-nuvem/
- Portal do Empregado — https://www.dominiosistemas.com.br/solucoes/evolucao-em-nuvem/portal-do-empregado/ · app — /aplicativo/
- Domínio Processos — https://www.dominiosistemas.com.br/solucoes/dominio-processos/
- Gestta Processos — https://www.dominiosistemas.com.br/solucoes/gestta-processos/
- Domínio Messenger — https://www.dominiosistemas.com.br/solucoes/dominio-messenger/
- Domínio Empresarial — https://www.dominiosistemas.com.br/solucoes/dominio-empresarial/
- Backup em Nuvem — https://www.dominiosistemas.com.br/solucoes/backup-em-nuvem/
- Integração com ERP — https://www.dominiosistemas.com.br/solucoes/integracao-com-erp/
- **Central do Desenvolvedor / API** — https://www.dominiosistemas.com.br/lp-centraldodesenvolvedor-api/
- Parceiros — https://www.dominiosistemas.com.br/parceiros/
- Thomson Reuters lança Onvio (release) — https://www.thomsonreuters.com.br/pt/sala-de-imprensa/thomson-reuters-lanca-onvio-a-primeira-plataforma-do-seu-portfolio-para-profissionais-contabeis-disponivel-na-nuvem.html
- TR — serviços financeiros embarcados — https://www.thomsonreuters.com.br/pt/sala-de-imprensa/tr-inaugura-nova-era-da-contabilidade.html
- EULA Portal do Empregado (PDF) — https://www.thomsonreuters.com.br/content/dam/ewp-m/documents/brazil/pt/pdf/other/dominio-portal-do-empregado.pdf
- EULA Onvio Messenger (PDF) — https://www.thomsonreuters.com.br/content/dam/ewp-m/documents/brazil/pt/pdf/other/dominio-onvio-messenger-updated.pdf
- Termos de Uso OnBalance — https://onbalance.thomsonreuters.com.br/ua/smb/br-pt/admin/core/common/terms-of-use.htm
- TR End User License General Terms (PDF) — https://www.thomsonreuters.com/content/dam/ewp-m/documents/thomsonreuters/en/pdf/legal-notices/thomson-reuters-end-user-license-general.pdf

### Oficiais — Developer Portal Onvio

- Onvio BR Accounting API — https://developerportal.thomsonreuters.com/onvio-br-accounting-api
- Documentação API — /documents/documentao-api
- Authenticating with OAuth 2.0 — /documents/authenticating-with-oauth-20
- ClientInfoResource — /swagger_openapi_document/clientinforesource/8556/100
- IntegrationResource — /swagger_openapi_document/integrationresource/8318/100
- InvoiceIntegrationResource — /swagger_openapi_document/invoiceintegrationresource/7807/100
- Onvio API (portal) — https://onvio.com.br/br-api-integration/ · https://onbalance.thomsonreuters.com.br/br-api-integration/

### Oficiais — Suporte Domínio (central de soluções)

- Importar lançamentos de arquivo texto TXT — `?codigo=3373`
- Leiaute Domínio Sistemas com Separador — `?codigo=672` e `?codigo=11916`
- Leiaute: Importação Arquivo Texto — `?codigo=8814`
- Importar Médias em arquivo texto — `?codigo=8844`
- Importar para folha lançamentos em Excel — `?codigo=6887`
- Exportar integração contábil do módulo folha — `?codigo=4497`
- Gerar arquivo texto da Integração Contábil — `?codigo=3554`
- Importação de dados do eSocial — `?codigo=7686`
- Primeiros passos para envio ao eSocial — `?codigo=4534` · Parâmetros do eSocial — `?codigo=4430`
- Documentação Integração API para ERPs — `?codigo=8476` · Chave API para ERP homologado — `?codigo=8536` · Quais ERPs integradas — `?codigo=12917`
- Solicitações de Serviços na Folha (Portal do Cliente) — `?codigo=9872`
- Onvio Portal do Empregado — `?codigo=7587` · Configurar Portal do Empregado — `?codigo=11959`, `?codigo=6762`
- Onvio Documentos — `?codigo=6632` · Publicar documentos Onvio — `solucao-onvio.html?codigo=7638`
- Base: https://suporte.dominioatendimento.com/central/faces/central-solucoes.html
- e-books e manuais: `sgd.dominiosistemas.com.br/ctsfiles/ebook_esocial.pdf`, `ebookportaldoclientec.pdf`, `jornadasyabse173010.pdf` (migração Sybase 17), `suporte.dominioatendimento.com/ctsfiles/ebook_dominio_web.pdf`, `onvio_portal_cliente_escritorio.pdf`, `6trcaprubricascadastroselancamentos.pdf`
- Manuais de banco: https://download.dominiosistemas.com.br/manuais/ — "Instalação e Configuração do Servidor Sybase 9 em Linux", "Backup Sybase 9"

### Terceiros verificáveis

- Conta Azul — FAQ Conta Azul e Domínio — https://ajuda.contaazul.com/hc/pt-br/articles/12190143402381-
- Omie — integração via API — https://ajuda.omie.com.br/pt-BR/articles/12051153-configurando-a-integracao-com-a-dominio-via-api
- Omie — leiaute com separador — /articles/9009287- · leiaute em lote — /articles/9001244-
- Fiscal.io — parceiro homologado TR/Domínio — https://conteudo.fiscal.io/integracao-dominio-thomson-reuters/
- ERPFlex — https://docsnew.erpflex.com.br/integracao-com-sistema-dominio/
- Radinfo — Layout Domínio com Separador — http://www.radinfo.com.br/help/IntegracaoDOMINIOLayoutDOMINIOSi.html
- Maxiprod — https://maxiprod.com.br/ajuda/contabilidade/contabilidade-perguntas-frequentes/como-exportar-planilha-de-lancamentos-contabeis-para-o-sistema-dominio/
- Tecgesco — Domínio: integração API — https://tecgesco.com/blog/dominio-sistema-contabil-integracao-api/
- GitHub `WillHubner/IntegraOnvio` — https://github.com/WillHubner/IntegraOnvio
- Secullum — exportar para folha no Ponto 4 — https://www.secullum.com.br/pt/canal-cliente/perguntas/685 · adicionar layout — /perguntas-frequentes/686
- Pontomais — exportação para folha — https://sos.pontomais.com.br/exportacao-para-folha-de-pagamento/ · integrações — https://pontomais.com.br/integracoes/
- VR / RH Digital — criar layout de exportação — https://materiais.vr.com.br/central-de-ajuda/exportacao-para-folha-de-pagamento/
- Contmatic — importação de informações do ponto eletrônico — https://autoatendimento.contmatic.com.br/hc/pt-br/articles/36695160780691-
- Calima ERP — importar arquivo do ponto — https://ajuda.calimaerp.com/pt/article/como-importar-um-arquivo-do-ponto-eletronico-18r742q/
- IOB Aprendo — importar arquivo txt do ponto para folha — https://aprendo.iob.com.br/ajudaonline/artigo.aspx?artigo=2781
- Athenas — manual importação layout TXT ponto → folha — https://www.athenas.com.br/faq/manual-importacao-layout-arquivo-txt-do-ponto-para-folha/
- Quarta — Folha: Layout Integração Contábil Formato 19 (Domínio) — https://suporte.quarta.com.br/LayOuts/Contabeis/folha_IContab_Layoutf019.htm

### Terceiros — regras de eSocial (§3)

- Alterdata — erro 106, evento em duplicidade no S-1200 — https://ajuda.alterdata.com.br/dpbase/esocial-erro-no-evento-s-1200-106-...-83046596.html
- Alterdata — S-1200 / S-1210 eventos de remuneração — /prosoftsocial/fp75-esocial-s-1200-s-1210-...-149145626.html
- Questor Docs — soluções eventos periódicos S-1200/S-1210/S-1299/S-1298 — https://docs.questor.com.br/pt-br/Produtos/Gest%C3%A3oCont%C3%A1bil/FolhadePagamento/Guia-de-erros-eSocial-por-evento/Solu%C3%A7oes-eventos-periodicos
- Senior — S-1299 fechamento — https://documentacao.senior.com.br/gestao-de-pessoas-hcm/esocial/leiautes/periodicos/s-1299.htm · procuração eletrônica — /documentoseletronicos/5.8.15/html_ajuda/esocial/procuracao-eletronica.htm
- Senior — erro de inscrição do transmissor — https://suporte.senior.com.br/hc/pt-br/articles/4408640947348-
- TOTVS — mesmo erro na linha Datasul — https://centraldeatendimento.totvs.com/hc/pt-br/articles/30224073319191-
- LG lugar de gente — migração eSocial — https://centraldeajudanuvem.lg.com.br/hc/pt-br/articles/17807280130459-Migra%C3%A7%C3%A3o-eSocial
- VRI Consulting — guia do S-1200 — https://vriconsulting.com.br/guias/guiasIndex.php?idGuia=784
- Portal SPED Brasil — transmissor diferente do empregador — https://portalspedbrasil.com.br/forum/esocial-transmissor-diferente-do-empregador/
- Espelho não oficial do Anexo II (Regras de Validação S-1.2) — https://portalsst.com.br/wp-content/uploads/2024/01/Leiautes-do-eSocial-v.-S-1.2-Anexo-II-Regras.pdf

### [F3] — fórum e anedota, não é lastro

- Contábeis — Senha de controle total Domínio Contábil (Sybase Anywhere) — https://www.contabeis.com.br/forum/tecnologia-contabil/302062/
- Contábeis — Importação do Ponto Eletrônico para o Domínio — /250263/ · Layout de importação Domínio Contábil Plus — /251385/
- Contábeis — Preço Sistema Domínio — /400576/ · Mensalidade do Domínio Sistemas — /270379/
- GUJ — acesso ao banco de dados — https://www.guj.com.br/t/acesso-ao-banco-de-dados-resolvido/292991/
- Alura — importar dados Domínio Sistemas no Power BI — https://cursos.alura.com.br/forum/topico-importar-dados-dominio-sistemas-187742
- Anderson Hernandes — Sistema Domínio: como funciona — https://andersonhernandes.com.br/sistema-dominio-como-funciona/

---

*Insights Impulsionam.*
