# HANDOFF — sessão de 30/08/2026

> **Leia este arquivo inteiro antes de qualquer ação.** Ele substitui o histórico de uma
> sessão longa que cobriu: pesquisa do módulo de folha, portal do empregado, o Domínio como
> sistema incumbente, e o estado real da consolidação Masor → Lior.
>
> Cópia idêntica em `g41-kanban-quest/docs/HANDOFF-sessao-2026-08-30.md`. É um retrato
> congelado da data, não documento vivo — os documentos vivos estão listados na seção 6.

---

## 1. O essencial, em dez linhas

- O objetivo do Fernando é **construir o módulo de folha de pagamento e o portal do
  empregado dentro do Lior**, e **substituir o sistema Domínio por completo, com o tempo**.
- O Lior é o sistema próprio da G41 (`lior.g41one.com.br`), repositório
  **`g41-kanban-quest`** — o nome é legado. É maior do que parece: 290 migrações, CRM,
  financeiro, documentos, comunicação, ponto, fiscal e contábil.
- O Masor é o motor fiscal (`masor.g41one.com.br`), repositório **`masor`**. **Já roda no
  mesmo banco do Lior**, com tabelas `masor_*`.
- **Branch dos dois repositórios: `claude/lior-payroll-module-vvr531`.** Tudo commitado e
  enviado.
- PRs abertos: **masor#1** e **g41-kanban-quest#2**, ambos em rascunho.
- Foram produzidos **14 documentos de pesquisa** em `masor/docs/folha/`, mais duas migrações
  aplicáveis no Lior e correções de segurança no Masor.
- **Uma sessão local, no PC do Fernando, começou a conferir a pesquisa contra as fontes
  oficiais** e já corrigiu erros — inclusive erros do trabalho desta sessão. Ver seção 10.
- **A pesquisa toda foi feita sem acesso ao `gov.br`** (bloqueio de rede). Por isso ela é
  mapa, não especificação, até a checklist de fontes ser executada.
- O Fernando prefere ser desafiado a ser validado, quer respostas concisas, tudo em
  português, e **zero vermelho** em qualquer material.
- **Nunca afirmar legislação sem verificar.** É a premissa central do projeto.

---

## 2. Os dois repositórios

| | Masor | Lior |
|---|---|---|
| Repositório | `luizfernandopereiralfp-creator/masor` | `luizfernandopereiralfp-creator/g41-kanban-quest` |
| Produção | `masor.g41one.com.br` | `lior.g41one.com.br` |
| O que é | Motor fiscal por produto: NCM, CEST, ICMS-ST, DIFAL, formação de preço mínimo | Sistema integrado do escritório |
| Gerenciador | **npm** (`npm ci` falha — lockfile dessincronizado; use `npm install`) | **bun** (`bun.lock`, `bunfig.toml`) |
| Banco | **O mesmo do Lior** (`igzhwzgtxjgeaommatls`), tabelas `masor_*` | idem |
| Migrações | `supabase/migrations/lior/` (0006+). A pasta `supabase/migrations/` (0001–0005) é fase morta | `supabase/migrations/`, 290 arquivos, padrão `YYYYMMDDHHMMSS_slug.sql` |
| Cliente | **Um: a Svetofor** (supermercado, operação em russo) | O escritório inteiro |

**Atenção no Lior:** `.claude/settings.json` tem um hook `Stop` que roda `npm run verificar`
(conferência de migração + typecheck + testes fiscais, até 3 min) ao fim de cada resposta.
**Sem `bun install`, ele falha todo turno.**

**Migração nova no Lior:** use `npm run migration:nova <slug>` — ele aloca a versão de forma
atômica via Management API, porque em 26/08 houve cinco versões duplicadas num dia e o
`db push` **pula em silêncio** versão já no histórico. Sem o token, ele cai para alocação
por diretório e **avisa que não protege contra corrida**. Rode `npm run migration:conferir`
antes do push.

---

## 3. A limitação de rede — leia antes de confiar em qualquer número

Durante toda a pesquisa, o proxy deste ambiente **bloqueou com 403**: `*.gov.br`,
`planalto.gov.br`, `in.gov.br`, `sped.rfb.gov.br`, `cfc.org.br`,
`dominiosistemas.com.br`, `developerportal.thomsonreuters.com`. **Só GitHub, npm e o índice
de busca responderam.**

Consequência: **nenhuma afirmação normativa dos documentos foi lida no texto original.** Os
valores vieram de convergência entre fontes e de prova aritmética interna. Cada documento
declara o próprio selo de evidência.

**Como liberar** (o Fernando já sabe, mas registre-se): em `claude.ai/code`, ícone de nuvem
na linha acima da caixa de mensagem → engrenagem no ambiente → **Network access** de
**Trusted** para **Custom** (com `*.gov.br`, `*.planalto.gov.br`, `*.in.gov.br`,
`*.rfb.gov.br`, `*.fazenda.gov.br`, `*.cfc.org.br`, e marcar *"Also include default list of
common package managers"*) ou **Full**. **A mudança só vale para sessões novas.**

---

## 4. O caminho até aqui — decisões e reviravoltas

A conversa mudou de rumo várias vezes, e cada mudança invalidou parte do anterior. Na ordem:

1. **Premissa inicial:** contratar um white label para transmitir ao eSocial.
   → **Desmontada.** O evento de remuneração *é* a folha em XML: quem transmite já calculou.
   Transporte é a peça mais barata e trocável.

2. **Descoberta:** o escritório usa o **Domínio** para folha, fiscal **e** contábil.
   → Muda tudo: não é escolher sistema de folha, é lidar com o incumbente que roda a operação.

3. **Restrição que passa a organizar o roteiro:** só pode existir **uma fonte da verdade do
   eSocial por empregador**. Não dá para dividir um cliente entre dois sistemas. Como a
   contabilização amarra igual, **a unidade de migração é o cliente, não o módulo**.

4. **Decisão do Fernando:** substituir o Domínio por completo, com o tempo; o Lior assume
   também a rotina contábil.

5. **Pesquisa do contábil** (nunca antes estudado): 55–93 pessoa-mês só ele; com a folha,
   piso de **95–168 pessoa-mês** — sem geração fiscal, honorários e patrimônio.
   Frase do levantamento: *"substituir o Domínio por completo não é projeto, é fundar uma
   software house"*. Ordem recomendada, contraintuitiva: **contábil → ECD → ECF → fiscal →
   folha por último**, porque o contábil é o único que roda um ano inteiro em paralelo com
   exposição legal zero.

6. **O Domínio não integra.** O Fernando falou com eles: não aceitam integrar nada.
   → Morre o cenário "camada de experiência por cima" e morre a ponte do ponto.
   **Nota que ficou em aberto:** "não integra" ≠ "não exporta". Ele é licenciado; imprimir
   holerite em PDF é usar o software que ele paga.

7. **Decisão:** portal do empregado no Lior — WhatsApp, app e IA —, com os holerites
   exportados do Domínio, importados no Lior e distribuídos **com comprovação de
   recebimento**. Sai do portal do empregado do Domínio.

8. **Decisão de arquitetura (perguntada e respondida):** o empregado de um cliente entra por
   **uma organização por cliente** — a ponte `organizacoes.cliente_id` já existe no banco.
   Ganho: **o módulo de ponto inteiro passa a servir os clientes sem uma linha de mudança**,
   porque já é escopado por organização.

9. **Última virada:** o Fernando pediu para retomar a consolidação do Masor no Lior, dizendo
   que criar dois sistemas foi um erro. Ver seção 9.

---

## 5. O que o Lior já tem (e que não deve ser reconstruído)

Levantado lendo o repositório. Os cinco ativos de maior valor:

1. **O empregado já faz login.** CPF → e-mail via `resolveLoginEmail`, senha provisória
   `123456` com troca obrigatória (`SenhaProvisoriaGate`), completar cadastro trabalhista
   (`PontoGate` → `CompletarCadastroModal`), aceite de termo versionado (`TermoAceiteGate`,
   `ponto_termos_aceite`). Em produção, com trilha, juridicamente defensável.
   **Hoje o empregado é `member` com acesso ao app inteiro** — é isso que precisa mudar.

2. **A comprovação de recebimento já existe, para outro documento.** O espelho de ponto é
   selado por hash (`ponto_espelho_hash`), assinado com **re-autenticação no ato**
   (`signInWithPassword` + `ponto_assinar_espelho(_reautenticado: true)`), e
   `ponto_espelho_status_mes` **detecta que o documento mudou depois de assinado e exige
   reassinatura**. É exatamente o mecanismo que o holerite precisa.

3. **A distribuição de documentos está pronta.** `cliente_documento` + bucket privado
   `cliente-documentos`, caminho `<org>/<cliente>/<categoria>/`, `visivel_no_portal`
   nascendo `false`, publicação como ato deliberado com autor, fila de envio aprovada por
   humano, nome de arquivo gerado (`08.26_DAS_Meli Contratos.pdf`), **sem DELETE de
   propósito**, trigger de auditoria.

4. **WhatsApp oficial da Meta** com trilho completo: `whatsapp_enfileirar` (porta única,
   recusa template sem `aprovado_em`, exige chave de idempotência, congela custo por
   categoria), edge function `whatsapp-enviar`, módulo `comunicacao.tsx`.
   **O template `codigo_aceite`, categoria autenticação, já está semeado** — é o OTP do
   login do empregado por WhatsApp, esperando aprovação na Meta.
   **Limite honesto: só envia.** Não há webhook de recebimento, não há caixa de entrada, não
   há controle da janela de 24h. O próprio código declara isso.

5. **O motor de espelho de ponto** — `src/lib/ponto-relatorio.ts`, 243 linhas, puro, sem I/O.
   Calcula previsto, trabalhado, saldo, abonado, falta, atraso, saída antecipada,
   esquecimento. Tolerância de 10 min (CLT art. 58 §1º). **É a entrada do cálculo da folha,
   pronta e auditável.** `ponto_marcacoes` é imutável, com NSR sequencial por empregador e
   cadeia de hash encadeada (Portaria MTP 671/2021, REP-P).

Mais: **a folha já está prevista no financeiro e no contábil** — `financeiro_titulo.origem =
'folha'` com índice de idempotência (escrito para evitar "cliente paga a folha duas vezes"),
`financeiro_config.folha_provisionada`, e as contas de FGTS e encargos no plano referencial.

**O que não existe no Lior:** eSocial (nada, em lugar nenhum — só como item de contrato),
tabelas legais versionadas (INSS, IRRF, salário-família), rubricas, competência e cálculo de
folha, férias/13º/rescisão, feriados, banco de horas persistido, escalas além do modelo
semanal fixo, guias. **O certificado digital existe e é robusto** (`clientes_certificados`,
AES-256-GCM, `certificado_acesso_log`).

---

## 6. Os documentos produzidos — todos em `masor/docs/folha/`

| Arquivo | Conteúdo |
|---|---|
| `00-LEIA-PRIMEIRO.md` | Sumário executivo. **A recomendação da seção 5 está marcada como SUPERADA** (propunha comprar) |
| `01-esocial-eventos-e-obrigatoriedade.md` | Leiaute S-1.3, 50 eventos conferidos contra XSD, MVP de 15 envios + 6 retornos, 16 pendências |
| `02-esocial-integracao-tecnica.md` | Canal, assinatura, certificado, bibliotecas com licença verificada, esforço em TS, 26 pendências. **Contém o erro de versão do SOAP — ver seção 10** |
| `03-motor-calculo-folha.md` | Tabelas 2026, fórmulas com fundamento, 3 holerites, 13 testes-âncora, 19 pendências |
| `04-obrigacoes-acessorias-e-calendario.md` | DCTFWeb, FGTS Digital, EFD-Reinf, ponto, calendário, 24 pendências |
| `05-construir-x-comprar-e-fornecedores.md` | Cinco categorias de fornecedor, due diligence, quatro cenários |
| `06-riscos-lgpd-e-dados-vivos.md` | Dados sensíveis, papéis, controles de dia 1, catálogo de dados vivos, manifesto anti-invenção |
| `07-arquitetura-modulo-lior.md` | Onde o módulo mora, schema, segurança, faseamento |
| `08-massa-de-teste-completa.md` | **16 holerites** verba a verba: férias, 13º, 7 rescisões, frequência, complementar. 186 verificações por script |
| `09-rubricas-e-reconciliacao.md` | `folha_rubrica`, 42 rubricas propostas, de-para de incidências, 20 regras de reconciliação |
| `10-migracao-ponto-e-holerite.md` | Carga inicial, ponto até as horas, holerite |
| `11-dominio-incumbente-e-integracao.md` | O Domínio: API não cobre folha, arquivo é o caminho, risco de duplicidade no eSocial |
| `12-modulo-contabil-escopo.md` | ECD, ECF, dimensionamento, ordem de internalização |
| `13-reuso-do-masor.md` | Inventário arquivo a arquivo do que do Masor vai para o Lior |
| `14-entrega-de-holerite-e-comprovacao.md` | Lado jurídico da entrega e da ciência |
| `AUDITORIA-anti-invencao.md` | Auditoria cruzada dos seis primeiros, com veredito por documento |
| `FONTES-A-BAIXAR.md` | **A checklist que fecha o loop** — ~35 documentos, blocos A–H, bloqueadores marcados |

**No Lior:** `docs/consolidacao-masor.md` — o registro vivo do estado da fusão.

**Pendência de organização:** com a folha sendo construída no Lior, esses 14 documentos
deveriam migrar para `g41-kanban-quest/docs/`. Está registrado em aberto no `07`.

---

## 7. Achados de pesquisa que valem lembrar

**Motor de cálculo:**
- **INSS progressivo por fatia** — aplicar a alíquota da faixa sobre o salário inteiro erra
  R$ 111,40 num salário de R$ 3.500.
- **Assimetria de férias: INSS soma ao salário do mês, IRRF calcula em separado.** É o erro
  nº 1 de motores de folha. Custa R$ 574,93 a mais num único mês se errado.
- **Base da hora extra** já vem integrada com insalubridade, periculosidade e noturno
  (Súmula 264 do TST).
- **Multa de 40% do FGTS incide sobre o somatório histórico dos depósitos corrigidos**, não
  sobre o saldo. O motor não pode estimar — exige extrato do FGTS Digital.
- **O redutor do IRRF domina a faixa de R$ 5.000 a R$ 7.350** — marginal de 40,81%; num caso,
  R$ 900 de hora extra sofreram carga marginal de 50,96%.
- **Falta é data, não quantidade** — as mesmas 3 faltas custam de R$ 352 a R$ 616 conforme
  caem no calendário, pelo reflexo no DSR.
- **Folha complementar:** tributar a verba isolada dá imposto zero; recalculada sobre a base
  da competência, R$ 332,68. R$ 391 de retenção a menor por empregado.

**eSocial:**
- Os mapas de eventos que circulam por aí **estão errados** — foram encontrados `S-5002`↔
  `S-5012` e `S-2231`↔`S-2420` trocados. O mapa tem que ser **gerado do XSD**.
- **Férias não têm evento próprio** — é `S-2230` com `codMotAfast=15`.
- **`nrInsc` é texto, não inteiro** — o pacote vigente é o de CNPJ alfanumérico.
- **Reenviar o mesmo lote é seguro e é o mecanismo oficial de recuperação** — a duplicidade
  devolve o recibo do evento original. Resolve "lote enviado, resposta perdida".
- **Não existe base open source em TypeScript.** 3 pacotes no npm com "esocial", nenhum de
  integração; 63 repositórios TS/JS no GitHub, todos com zero estrelas.

**Datas e prazos:**
- **O eSocial antecipa para o dia útil anterior; a EFD-Reinf e a DCTFWeb postergam.** Uma
  função única de "ajustar para dia útil" erra metade dos prazos.
- **DCTFWeb atrasada incide mesmo com o tributo pago.**
- **O FGTS mudou do dia 7 para o dia 20** — parametrizar por competência.

**Riscos:**
- **CCT desatualizada é o pior risco operacional da folha** — erra em silêncio e vira passivo
  retroativo. Precisa ser tabela viva por estabelecimento.
- **Ser "operador" na LGPD não é escudo.** O white label é subprocessador, não para-raios.
- **Consentimento é base legal errada para folha** — a base é obrigação legal.
- **Vazamento de folha aciona quase todos os gatilhos de risco relevante da ANPD ao mesmo
  tempo**, e multi-tenant multiplica por N clientes.

---

## 8. O que foi construído nesta sessão

### No Masor (branch `claude/lior-payroll-module-vvr531`, PR #1)

**Agentes** em `.claude/agents/`: `especialista-folha-dp`, `auditor-esocial`,
`auditor-anti-invencao`, `analista-dp-operacional`.

**Código** — transporte compartilhado e módulo eSocial:
- `src/lib/transporte/mtls.ts` — transporte SOAP com mTLS extraído do fiscal e generalizado.
  **Trava em `node:https` de propósito** — trocar por `fetch` quebra o mTLS em silêncio.
- `src/lib/fiscal/mtls.ts` — vira a porta do fiscal, fixa SOAP 1.2. Comportamento idêntico.
- `src/lib/esocial/cofre.ts` — porta sem lógica, reexporta cofre, certificado e transporte.
- `src/lib/esocial/ambiente.ts` — endpoints **fail-closed** (nenhuma URL embutida) + a trava
  de fonte única da verdade do eSocial por CNPJ.

**Correções de segurança:**
- `supabase/migrations/lior/0006` — a definição de `masor_is_staff()` virou **autocorretiva**.
  Antes era `exists (select 1 from user_roles ...)`, o que fazia cliente contar como staff e
  **escrever regra tributária compartilhada**. Como o `apply-migration.mjs` aplica um arquivo
  por caminho, sem histórico, reaplicá-la revertia a correção do Lior em silêncio. Agora ela
  detecta o mundo e escreve a versão certa. **Testado nos dois mundos.**
- `src/components/Protegido.tsx` + `src/lib/auth.tsx` — trava de produto na porta do app:
  exige `pode_usar_sistema(uid, 'masor')`, fail-closed. Antes, **qualquer sessão do Supabase
  compartilhado entrava**.
- `CLAUDE.md` — passou a contar a verdade sobre onde o sistema roda.

### No Lior (branch `claude/lior-payroll-module-vvr531`, PR #2)

**`20260830160240_portal_empregado_acesso.sql`** — o terceiro tipo de gente que entra no
Lior. **Não cria tabela nova:** usa o discriminador `organizacao_membros.is_staff`, criado em
`20260817130000` exatamente para separar staff da G41 de CLT que só bate ponto.
`is_staff = false` ⇒ empregado, vai para o portal. Helpers `empregado_do_usuario` (que
centraliza o filtro `status = 'ativo'`) e `eh_empregado_portal`, mais gatilho que impede
empregado de receber papel interno.

**`20260830160423_folha_holerite_entrega_e_ciencia.sql`** — estende `cliente_documento` com
grupo `folha`, categorias de documento de pessoal e `employee_id`, com **CHECK que recusa
documento de folha sem dono**. Duas policies adicionais dão ao empregado leitura do que é
dele, na tabela e no storage. E `folha_documento_evento`, trilha append-only que
**congela o `sha256` do arquivo no ato da ciência** — documento trocado depois faz a
divergência aparecer, mesmo mecanismo do espelho de ponto.

**Validação:** rodadas contra PostgreSQL 16 local com esqueleto do schema real. Aplicam
limpo, são idempotentes, **14 asserções de comportamento passam** — entre elas: colega não vê
holerite alheio, empregado não vê documento da empresa, desligado perde acesso, ciência é
idempotente e não pode ser dada em documento de outro.

**`docs/consolidacao-masor.md`** + correção do `CLAUDE.md`, que afirmava que o simulador
tributário era "planned, not-started" e **não citava o Masor uma única vez**.

---

## 9. O estado da consolidação Masor → Lior

**Em uma frase:** o banco já está consolidado e o contrato de integração entre os dois
motores fiscais já foi escrito e aplicado (27/08, `20260827171551_uf_curadoria_e_acoplamento`)
— **mas nenhuma linha de código foi escrita dos dois lados desse contrato**.

**Onde o trabalho parou, e é a retomada natural:** as tabelas-ponte
**`masor_item_enquadramento`** e **`masor_manifestacao_score`** estão prontas, endurecidas e
**vazias**. Nenhum código escreve nelas. A primeira foi desenhada para receber a saída do
motor de ST do Masor sobre os documentos do Lior — e fecha o buraco que
`20260827005842_fiscal_icms_por_item.sql` admite por escrito: **o Lior lê o ICMS-ST do XML,
não o calcula.** O motor que calcula existe: `masor/src/lib/fiscal/motor-st.ts`, 234 linhas,
portável sem acoplamento.

**Sobreposição funcional:** os dois são "fiscal" em eixos diferentes — o Lior apura tributo
por competência da empresa, o Masor calcula carga por produto. Colisão real em 4 pontos:
captação de DFe (o do Lior é superior), legislação e parâmetros (modelos rivais), fila de
aprovação de regra (duas filas), portal do cliente (duas pontes).

**Só no Masor:** NCM/CEST, ICMS-ST calculado, formação de preço, catálogo de produtos,
estoque, parser de cupom (NFC-e e CF-e-SAT), leitura de DANFE em PDF, apuração de crédito
recuperável, relatórios em PDF e XLSX com a marca, **manual bilíngue PT/RU**, e o **contrato
de IA anti-invenção** (`src/lib/ia/contrato.ts`) — o ativo mais transferível dos dois
repositórios, e o Lior não tem equivalente.

**Armadilhas registradas:**
1. A migração `lior/0006` podia reverter a correção de segurança — **corrigido nesta sessão**.
2. Os 4 logins da Svetofor ainda têm `user_roles` (papel de staff interno). Hoje inofensivos,
   mas remover segue pendente desde 26/08.
3. **XML fiscal em claro** — `masor_dfe_documentos.xml` é coluna `text`, sem bucket, sem hash,
   sem log, sem expurgo.
4. **Idioma** — o portal do Lior é monolingue; o único cliente do Masor opera em russo.
5. **O item mais caro:** nenhuma tabela `masor_*` tem `organizacao_id`, e todas as fiscais do
   Lior têm. Backfill de dado + alteração de todas as RLS.

---

## 10. As correções que a sessão local fez contra fonte oficial

**Isto é o mais importante deste arquivo.** Uma sessão local, no PC do Fernando, com acesso à
rede liberado, começou a conferir a pesquisa contra as fontes oficiais. Resultado parcial:
**seis itens conferidos, com três erros de documento e três erros da sessão ou da auditoria.**

Cinco linhas visíveis na tela, transcritas fielmente:

| Item | Veredito |
|---|---|
| **Versão do SOAP** | Documento 02 **errado** — e o erro foi repetido no código |
| **Redutor do IRRF** | Documento 03 **certo**, massa de teste preservada |
| **Multas do eSocial** | Documento 04 **certo** — tinham sido rebaixadas por engano |
| **Salário mínimo diário** | Documento 03 **certo** — a auditoria interna errou |
| **Prazo de dia não útil** | Documento 04 **errado** — e o erro foi amplificado |

> **A sexta linha estava cortada na tela e não foi lida.** Não a invente — confirme na sessão
> local ou refaça a conferência.

**O que isso implica, concretamente:**

1. **`src/lib/transporte/mtls.ts` está errado.** As linhas 7-8 e 20-23 afirmam que o eSocial
   é **SOAP 1.1 com `SOAPAction`**. Veio do documento 02. **Precisa corrigir os comentários e
   o `contentType` do módulo `esocial`.** Provavelmente ligado ao item **F1** da checklist —
   a especificação de recepção de lote, que decide se existe API REST oficial.
2. **As multas do eSocial devem voltar a "confirmado"** no documento 04. O rebaixamento feito
   nesta sessão, com base na auditoria interna, estava errado.
3. **O salário mínimo diário do documento 03 estava certo** — o apontamento aritmético da
   auditoria (54,04 × 54,03) era falso alarme.
4. **O prazo de dia não útil precisa ser refeito** — errado no documento e amplificado depois.

**Fila que a sessão local ainda não tinha executado:** tabela do INSS 2026, Manual do FGTS
Digital (prazo do dia 20 e o ajuste quando não é dia útil) e as multas dos arts. 47 e 47-A da
CLT.

**A lição, e ela é a premissa do projeto se provando:** nenhuma quantidade de revisão cruzada
substituiu a fonte. A auditoria interna, o script de conferência aritmética e a convergência
entre fontes ajudaram — **e ainda assim erraram**, nos dois sentidos.

---

## 11. O que fazer a seguir — em ordem

**Bloqueador de tudo:** executar `FONTES-A-BAIXAR.md`. Arquivar em `docs/folha/fontes/` com
data e hash. Ordem dos bloqueadores:
1. **F1** — especificação de recepção de lote do eSocial (decide a arquitetura do transporte
   e provavelmente explica o erro do SOAP).
2. **B1** — definição de "RBM" do redutor do IRRF. **Se mudar, muda a massa de teste inteira**,
   os 16 holerites.
3. A1–A5 (MOS, leiautes, NT, XSD, MOD), C1–C2 (FGTS Digital, portarias de multa).

**Depois, na ordem de valor:**
1. **Corrigir o SOAP no código** e reprocessar os documentos elevando/corrigindo os selos.
2. **A trava de importação do lote de holerites** — o maior risco do módulo, ainda não
   escrito. Os holerites vêm num PDF em lote que precisa ser dividido por pessoa. **Casar por
   ordem de página é inaceitável** (um holerite de duas páginas desalinha todo mundo dali
   para baixo, em cascata e em silêncio); **casar por nome é frágil** (homônimo, acento, nome
   social, abreviação). A regra: **sem identificação inequívoca por identificador forte
   extraído do texto da página, não distribui — abre pendência.** O Masor já extrai texto de
   PDF com `unpdf` (`src/lib/nfe/parse-pdf-nfe.ts`) — é reuso direto.
3. **Rota `/portal-empregado`** + o terceiro ramo do roteamento em
   `_authenticated/route.tsx` e em `src/lib/route-after-login.ts`.
4. **Portar o motor de ST** e preencher `masor_item_enquadramento`.
5. **Migrar `docs/folha/`** para o repositório do Lior.
6. **A correção do `financeiro`** — ver seção 12.

---

## 12. Pendências abertas e ofertas não respondidas

**O `Supabase Preview` do PR #2 falha, e não é culpa do PR.** Há inversão de dependência no
histórico: `20260826200851_financeiro_migracao_saude.sql` (20:08:51) **usa**
`financeiro_migracao_origem`, que só é criada por `20260826215000_migracao_conta_azul.sql`
(21:50:00) — 1h41 depois. O banco de prévia é criado do zero e reexecuta tudo em ordem, então
**qualquer PR deste repositório falha nesse ponto, desde 26/08**. A validação por branching
está fora do ar.

**Correção proposta, não aplicada** (edita migração já aplicada — precisa de autorização):
envolver a criação da view num `DO` que só executa se `public.financeiro_migracao_origem` já
existir (`to_regclass` resolve). Seguro porque em produção o Supabase controla por versão e o
arquivo não roda de novo; e em banco novo, pular ali não deixa buraco — `20260826230709` e
`20260826231019` **recriam** a view, já com a dependência existindo.

**Outras pendências:**
- O `package-lock.json` do Masor está dessincronizado (`npm ci` falha; `npm install` funciona).
  O Dockerfile usa `npm install`, então o deploy não quebra.
- Remover `user_roles` dos 4 logins da Svetofor.
- O webhook de recebimento do WhatsApp não existe — sem ele, o portal por WhatsApp é
  notificação, não conversa, e o OTP por mensagem recebida não funciona.

---

## 13. Como o Fernando trabalha

- **Prefere ser desafiado a ser validado.** Aponte risco proativamente; não concorde por
  padrão.
- Respostas **concisas e objetivas**. Sem enrolação.
- **Tudo em português brasileiro.**
- **Zero vermelho** em qualquer material — alerta é âmbar `#E9A74A`, navy `#0B1740`.
- **Sequenciamento importa** — questione a ordem de implementação quando houver dependência.
- **Nunca afirmar legislação sem verificar.** É a regra que organiza o projeto inteiro.
- Ele decide onde o trabalho acontece. Nesta sessão houve atrito por eu ter insistido no
  terminal depois que ele já tinha dito que preferia outro lugar. **Não repita: pergunte uma
  vez, aceite a resposta.**
