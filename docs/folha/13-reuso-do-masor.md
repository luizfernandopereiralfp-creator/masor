# O que o Masor já tem pronto e vai para o módulo de Folha

> Inventário feito lendo o código, arquivo por arquivo, em 30/08/2026.
> Diferente dos outros documentos desta pasta, **este não depende de fonte externa**:
> o objeto de estudo é o próprio repositório. O que está marcado como PORTA foi lido e
> conferido; o que está marcado como pendência é decisão de produto, não falta de fonte.

`src/lib` tem **4.426 linhas**. A conclusão curta: **a infraestrutura sensível já existe e
serve à folha sem reescrita** — cofre de certificado, mTLS, identidade, RLS, exportação,
contrato anti-invenção. O que não existe é a peça específica do eSocial: **assinatura
XMLDSig**.

## 1. Porta direto, sem adaptação

| Arquivo | O que faz | Por que serve à folha |
|---|---|---|
| `src/lib/fiscal/cofre-lior.ts` | Decifra o A1 do cliente (AES-256-GCM, iv + auth tag) só em memória | O eSocial usa **o mesmo e-CNPJ**, do mesmo cofre. Zero trabalho novo |
| `src/lib/fiscal/cert.ts` | Abre o `.pfx`, valida a senha, extrai titular, CNPJ e validade | Mesma necessidade: validar o certificado antes de transmitir |
| `src/lib/certificado-validade.ts` | Aviso de vencimento do certificado | Certificado vencido derruba a transmissão do eSocial igual à da SEFAZ |
| `src/lib/auth.tsx` · `src/lib/cliente-ativo.ts` | Identidade unificada com o Lior, papel sintetizado por RPC, cliente ativo | A folha é multiempresa pelo mesmo eixo `cliente_id` |
| `src/lib/i18n.tsx` | Bilíngue | Holerite e portal do empregado herdam de graça |
| `src/lib/error-capture.ts` · `src/lib/error-page.ts` | Captura e página de erro | Transversal |
| `src/components/AppShell.tsx` · `padrao.tsx` · `SeletorEmpresa.tsx` | Shell do padrão Lior: rail navy, seletor de empresa global, componentes canônicos | A folha entra como mais um módulo do mesmo shell, sem redesenho |
| `src/components/Ajuda.tsx` | Ajuda contextual por campo | Folha tem muito mais jargão que fiscal. Vale mais aqui do que lá |

## 2. Porta com adaptação pontual

| Arquivo | Adaptação | Situação |
|---|---|---|
| `src/lib/fiscal/mtls.ts` | ~~O fiscal fixa SOAP 1.2; o eSocial é SOAP 1.1 com `SOAPAction`~~ — **premissa errada, corrigida em 30/08/2026 contra o MOD v1.15: os dois são SOAP 1.2, e o manual não menciona `SOAPAction` em nenhuma das 125 páginas** | **FEITO, mas por um motivo que não se sustenta.** O transporte virou `src/lib/transporte/mtls.ts`, parametrizado; `fiscal/mtls.ts` segue como porta do fiscal, comportamento inalterado. Na prática o `soapPost` original já serviria ao eSocial sem alteração |
| `src/lib/export/pdf-analise.ts` · `relatorio.ts` · `planilha.ts` | Trocar o conteúdo, manter a mecânica e a marca | Holerite em PDF, informe de rendimentos, relatórios de folha em XLSX com cabeçalho pintado |
| `src/lib/planilha/parse-xlsx.ts` | Trocar o mapeamento de colunas | Importação de variáveis do mês e de bases na migração |
| `src/lib/ia/contrato.ts` | Trocar o domínio, manter o **princípio** | Ver seção 4 — é a peça mais valiosa do repositório para a folha |
| `src/lib/portal.ts` · `src/routes/api/portal-acesso.ts` | Portal do **cliente** → portal do **empregado** | Ver seção 3 — exige um papel novo |
| `src/lib/fiscal/guard.ts` | Acrescentar o papel `empregado` | Ver seção 3 |

## 3. O buraco que só apareceu lendo o código: não existe o papel `empregado`

`guard.ts` reconhece exatamente três papéis — `admin`, `staff` e `cliente` — e a regra é
clara: cliente fica travado no próprio `cliente_id` e nunca aceita outro pela requisição.

O portal do empregado precisa de um **quarto papel**, e ele é diferente de todos os
existentes num ponto que importa: **o empregado não pode ver os dados dos colegas da mesma
empresa.** Todos os papéis atuais isolam por `cliente_id`; o empregado precisa isolar por
**pessoa dentro do cliente**. É um eixo de RLS novo, não uma variação dos que existem.

Some a isso a regra de autoexclusão que a pesquisa de LGPD já exigia: ninguém da equipe vê
a própria folha pelo perfil administrativo. Hoje isso não existe em lugar nenhum do código.

**Consequência:** o portal do empregado não é "reusar `portal.ts` trocando a query". É o
mesmo desenho de fluxo com um modelo de autorização novo por baixo.

## 4. O contrato anti-invenção é o ativo mais transferível

`src/lib/ia/contrato.ts` é o que faz a premissa do projeto virar código, e o mecanismo é
transferível inteiro:

- **todo número é `nullable`** — `null` significa "a IA não confirmou por fonte oficial";
- cada conclusão carrega `FundamentoLegal` com norma, artigo, órgão, vigência e URL, onde
  `url: null` marca o não confirmado;
- `PassoCalculo` guarda rótulo, fórmula, insumos nomeados e resultado — a memória de cálculo;
- o parser aceita só tipos estritos, e o que não passa vira pendência.

Na folha, `FundamentoLegal` vira o lastro do **parâmetro** (tabela de INSS, piso de
convenção, FAP) e `PassoCalculo` vira a **memória do holerite** — que é exatamente o que
responde "por que o líquido caiu?". A troca é de domínio, não de mecanismo.

## 5. Serve de padrão, não de código

| Origem | Padrão a copiar |
|---|---|
| `src/lib/ia/motor-fiscal.ts` · `fiscal/motor-st.ts` | Motor que **não aplica regra não confirmada** e devolve o resultado marcado como provisório com a lista de pendências |
| `src/lib/apuracao.ts` | Apuração por competência com conciliação contra uma fonte externa — é a forma da reconciliação contra os totalizadores do eSocial |
| `n8n-workflow-validacao-fiscal-g41.json` | Webhook → IA → parser robusto → pendência abre tarefa no Kanban → resposta. O canal de WhatsApp do portal do empregado é a mesma topologia |
| `docs/fontes-oficiais.md` | Catálogo de fonte viva com cadência de reverificação — a folha tem os dela em `06-riscos-lgpd-e-dados-vivos.md` |

## 6. O que não existe e precisa ser construído

| Peça | Por quê |
|---|---|
| **Assinatura XMLDSig do evento** | O `NFeDistribuiçãoDFe` se autentica **só pelo handshake TLS** — não assina o pedido. O comentário no topo do `mtls.ts` original dizia isso. O eSocial exige o evento assinado, e com **canonicalização inclusiva**, diferente da exclusiva da NF-e. É a peça nova de maior risco |
| Geração e validação contra XSD | Não há validador puro-JS consagrado |
| Papel `empregado` + RLS por pessoa | Seção 3 |
| Tabelas da folha | `docs/folha/07-arquitetura-modulo-lior.md` e `09-rubricas-e-reconciliacao.md` |

## 7. O que foi de fato movido nesta rodada

| Arquivo | Estado |
|---|---|
| `src/lib/transporte/mtls.ts` | **Novo.** Transporte SOAP com mTLS, genérico, com `contentType` e `SOAPAction` opcionais. Mantém a trava em `node:https` e o aviso de não trocar por `fetch` |
| `src/lib/fiscal/mtls.ts` | **Reescrito como porta do fiscal.** Reexporta `agentMtls` e fixa SOAP 1.2 em `soapPost`. Assinatura e comportamento idênticos aos de antes — o único caller (`api/dfe.buscar.ts`) não muda |
| `src/lib/esocial/cofre.ts` | **Novo, e deliberadamente sem lógica.** Reexporta cofre, leitura de certificado e transporte. Existe para o módulo de folha ter uma porta com o nome do domínio dele, sem duplicar nada |
| `src/lib/esocial/ambiente.ts` | **Novo.** Endpoints do eSocial **fail-closed**: nenhuma URL embutida, porque o Manual do Desenvolvedor não pôde ser lido. Sem a variável de ambiente configurada, o módulo se recusa a montar a chamada em vez de tentar contra um endereço presumido. Traz também a trava de fonte única da verdade por CNPJ |

**Nota sobre `ambiente.ts`:** o fiscal **pode** fixar as URLs da SEFAZ no código porque elas
foram confirmadas no Portal Nacional da NF-e, e o arquivo cita a fonte. O eSocial não pode,
porque a fonte não foi lida. Mesma regra, resultados diferentes — é a premissa do projeto
funcionando, não inconsistência.
