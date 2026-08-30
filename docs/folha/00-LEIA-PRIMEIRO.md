# Módulo de Folha de Pagamento do Lior — sumário executivo

> Pesquisa de **30/08/2026**, seis frentes em paralelo, 4.741 linhas de levantamento.
> Objetivo: entender o processo por inteiro e sustentar a decisão de **construir x contratar**.
> Leia este arquivo primeiro; ele diz o que decidir e onde está cada coisa.

## Índice

| Arquivo | Conteúdo |
|---|---|
| `01-esocial-eventos-e-obrigatoriedade.md` | Leiaute vigente, 50 eventos conferidos contra XSD, MVP da folha, prazos e multas |
| `02-esocial-integracao-tecnica.md` | Canal de transmissão, assinatura, certificado, bibliotecas e esforço em TypeScript |
| `03-motor-calculo-folha.md` | Tabelas 2026, fórmulas com fundamento legal, três holerites e treze testes-âncora |
| `04-obrigacoes-acessorias-e-calendario.md` | DCTFWeb, FGTS Digital, EFD-Reinf, ponto, calendário mensal e anual |
| `05-construir-x-comprar-e-fornecedores.md` | Cinco categorias de fornecedor, due diligence e a comparação de caminhos |
| `06-riscos-lgpd-e-dados-vivos.md` | Dados sensíveis, papéis, controles de dia 1 e o catálogo de dados vivos |
| `AUDITORIA-anti-invencao.md` | **Auditoria cruzada dos seis** — contradições, selos inflacionados, erros de aritmética e veredito por documento |
| `FONTES-A-BAIXAR.md` | **A checklist que fecha o loop** — o que baixar para converter pesquisa em especificação |

Agentes de revisão do domínio, em `.claude/agents/`: `especialista-folha-dp`,
`auditor-esocial`, `auditor-anti-invencao`, `analista-dp-operacional`.

---

## 1. A limitação que precisa ser dita antes de tudo

O ambiente desta pesquisa estava com **egress bloqueado por política de rede para
`*.gov.br`, `planalto.gov.br` e `in.gov.br`**. Nenhum PDF oficial, WSDL ou XSD pôde ser
baixado da origem. Cada frente adotou selo de confiança por afirmação e registrou a
limitação na abertura do seu documento.

Traduzindo para a régua deste projeto: **o processo está entendido; a informação ainda não
está lastreada.** Restam cerca de 85 pendências numeradas. `FONTES-A-BAIXAR.md` lista os
~35 documentos que as fecham.

Uma auditoria cruzada rodou depois, sobre os seis documentos (`AUDITORIA-anti-invencao.md`).
Ela encontrou o padrão de falha que importa: como cada frente inventou o seu próprio selo de
confiança, **o mesmo fato aparece confirmado num documento e proibido de reproduzir em
outro** — valores de multa, por exemplo. A invenção não entraria por afirmação nova; entraria
por **promoção de selo entre documentos**, bastando o desenvolvedor abrir um arquivo em vez
do outro. As correções verificáveis já foram aplicadas; as contradições que dependem de
fonte primária estão marcadas nos dois lados e viraram o bloco F da checklist.

**Nada aqui deve virar código antes dessa checklist.** Uma tabela de INSS errada não gera
erro de sistema — gera folha errada para todos os empregados de todos os clientes, e o
eSocial só reclama depois.

## 2. A premissa original não se sustenta

A intenção era **contratar um white label para enviar as informações ao eSocial**. A
pesquisa desmonta isso por três lados:

**Primeiro — o escopo está mal formulado.** O evento `S-1200` *é* a folha em XML. Quem
transmite já calculou. O transporte é 10–15% do problema e **0% do risco**. Comprar só o
canudo é comprar a peça mais barata e trocável, e ficar com a mais cara e arriscada.

**Segundo — o produto imaginado não está à venda.** Não foi confirmado, em fonte pública,
**nenhum** fornecedor de folha white label para escritório contábil, nem **nenhum** motor de
folha como serviço no Brasil. Isso não é lacuna de pesquisa; é sinal de mercado: ninguém
quer assumir passivo trabalhista de terceiro.

**Terceiro — contratar não transfere o risco.** Na LGPD, o operador responde por falha de
segurança. Perante o cliente, quem assina a folha é a G41. O white label transfere a marca
e deixa você como suporte de primeiro nível de um software que não controla.

## 3. O que existe de verdade

| Categoria | Existe? | Observação |
|---|---|---|
| Transmissão ao eSocial (o "canudo") | Sim | Commodity, com white label declarado. É a parte fácil |
| Motor de folha como serviço/biblioteca | **Não** | Nenhum confirmado no Brasil |
| Folha white label / OEM para contabilidade | **Não confirmado** | Existe white label de ERP, não de folha |
| Sistema de folha tradicional | Sim | Diferenciam-se pela API, não pela tela |
| BPO de folha para escritórios | Sim | Caminho mais rápido para receita |

E o ponto que decide o custo de construir: **no fiscal, o open source alavancou o Masor;
na folha não existe nada.** Três pacotes no npm com "esocial", nenhum de integração;
63 repositórios TS/JS no GitHub, **todos com zero estrelas**. As referências vivas são PHP,
Java e Python — servem de modelo, nenhuma serve de dependência, e duas estão fora por
licença contaminante.

## 4. Custo real de construir

Duas frentes estimaram por caminhos diferentes. A auditoria interna pegou a divergência de
unidade (item F8) — os escopos se sobrepõem parcialmente, então vale registrar as duas, e
**usar a conservadora na decisão**:

| Peça | Estimativa otimista | Estimativa conservadora |
|---|---|---|
| Camada de transmissão ao eSocial | 4–7 **semanas** (só o núcleo: assinatura, SOAP, lote, recibo) | 4–7 **pessoa-mês** (incluindo geração do XML dos eventos, fila, retentativa, tradução de erro) |
| Motor de cálculo de folha | — | **25–50 pessoa-mês**. "É aqui que mora o passivo, e não termina nunca" |
| Cadastros, telas, conferência, holerite, CNAB, contábil | — | 10–20 pessoa-mês |
| **Total até o primeiro cliente sem vergonha** | — | **~40–75 pessoa-mês** — 3 a 5 anos de um dev, ou 1,5 a 2 anos de um time de três |
| Manutenção normativa | Perpétua — cerca de uma nota de orientação de leiaute por mês em 2026 | idem |

O maior custo escondido não é o SOAP, que são duas operações: é **mapear os eventos à mão**,
porque não existe gerador de tipos utilizável a partir dos XSD.

**Number a segurar com as duas mãos:** 40–75 pessoa-mês é a ordem de grandeza de construir
folha por inteiro. É isso que precisa ser comparado com a mensalidade de um fornecedor.

## 5. Recomendação

Um caminho em fases, do mais rápido ao mais estratégico. Cada fase só começa quando a
anterior estiver paga.

**Fase 0 — receita em semanas, sem código.** BPO de folha ou revenda de sistema tradicional.
Atende ao "o mais rápido possível" de verdade, e compra o que nenhum documento dá: a
vivência do processo real, com clientes reais, antes de modelar software. Margem de serviço,
não de software — e é o preço de entrar rápido.

**Fase 1 — a camada que é sua.** Contratar sistema de folha tradicional escolhido **pela
API, não pela tela**, e construir no Lior o que diferencia: admissão digital, portal do
empregado, painel de prazos, conferência mês a mês, integração com o resto do ecossistema.
Motor e transmissão são commodity; **experiência e dados são o ativo**.

**Fase 2 — internalizar o transporte** quando houver demanda paga que o justifique.

**Fase 3 — motor próprio** só com volume que pague a manutenção normativa perpétua.

## 6. Três coisas que eu questionaria antes de aprovar

**Sequenciamento.** O Masor ainda não fechou o próprio ciclo. Abrir uma segunda frente do
tamanho de folha — que é, sozinha, um produto — divide foco em duas frentes inacabadas.
Se folha entra agora, alguma coisa do fiscal precisa sair da fila explicitamente.

**Ordem de construção.** A ordem natural parece ser transporte → cálculo. É o inverso:
cálculo validado → XML validado offline → produção restrita → piloto. Começar pelo
transporte produz um canal sem o que transmitir.

**Custódia de certificado.** O Lior já guarda os A1 dos clientes. Transmitir eSocial por
procuração amplia muito o alcance dessa procuração digital. Isso é decisão de risco do
escritório, não detalhe técnico.

## 7. Riscos que não estavam na conversa

1. Erro de folha não vira retificação — vira **reclamatória**.
2. O eSocial não multa na hora: o bug dorme e **estoura na carteira inteira de uma vez**.
3. **CCT desatualizada é o pior risco operacional** — erra em silêncio e acumula passivo
   retroativo. Precisa ser tabela viva por estabelecimento, no mesmo padrão da re-pesquisa
   mensal de UFs do motor fiscal.
4. Vazamento de folha aciona quase todos os gatilhos de risco relevante da ANPD ao mesmo
   tempo, e multi-tenant multiplica por N clientes.
5. Troca de sistema de folha só é segura na virada do ano — e o fornecedor sabe disso na
   hora de reajustar. Exigir teto em contrato.
6. Mudança de padrão de certificado do eSocial derruba a integração por TLS, sem aviso.

## 8. Próximo passo concreto

Executar `FONTES-A-BAIXAR.md` numa máquina com acesso aberto, arquivar em
`docs/folha/fontes/` com data e hash, e reprocessar os seis documentos elevando o selo das
afirmações que o texto original confirmar. **Sem isso, este material é mapa — não é
especificação.**
