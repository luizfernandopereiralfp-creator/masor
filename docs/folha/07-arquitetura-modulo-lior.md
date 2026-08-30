# Arquitetura do módulo de Folha no Lior — proposta

> Derivado das seis frentes de pesquisa e da auditoria interna (30/08/2026).
> **Esta é a proposta de desenho, não uma autorização de codificar.** O portão está em
> `FONTES-A-BAIXAR.md`: enquanto os documentos oficiais não forem lidos, nenhuma regra
> daqui vira constante.

## 0. Decisão que precede o desenho: onde este módulo mora

O Masor e o Lior compartilham o **mesmo Supabase**, mas são aplicações diferentes. Folha é
um domínio próprio, e a escolha muda o custo de manutenção:

| Opção | A favor | Contra |
|---|---|---|
| **Dentro do Lior** (recomendado) | Folha é cadastro de pessoas e obrigação do escritório, colada ao cliente e ao certificado, não ao produto fiscal. Reusa identidade, papéis e cofre | Cresce a superfície do Lior |
| Aplicação separada, mesmo banco | Isolamento de deploy; falha na folha não derruba o resto | Terceira aplicação a manter, terceiro shell, terceira sessão |
| Dentro do Masor | Nenhuma razão de domínio | Masor é motor fiscal de produto; folha não tem parentesco com NCM/ICMS |

**Esta branch vive no repositório do Masor apenas porque é onde a pesquisa foi feita.** A
documentação deve migrar junto com a implementação. É decisão do Fernando.

## 1. Princípio estruturante

Uma única regra organiza o schema inteiro:

> **Todo parâmetro de cálculo é um registro versionado com vigência e selo de verificação —
> nunca uma constante no código.**

É a mesma escolha que sustenta o motor fiscal (`masor_tax_states`, `masor_ncm_rules`), e na
folha ela é mais crítica: tabela de INSS, IRRF, salário-família e salário mínimo mudam todo
ano, o FAP muda por empresa, e o piso muda por sindicato e base territorial.

## 2. Modelo de dados (prefixo `folha_`, no Supabase do Lior)

### 2.1 Parâmetros vivos

| Tabela | Papel |
|---|---|
| `folha_parametro` | Toda tabela oficial em linha versionada: `tipo` (inss_faixa, irrf_faixa, salario_familia, salario_minimo, fgts, rat, terceiros_fpas, redutor_irrf), `vigencia_inicio`, `vigencia_fim`, `valores` jsonb, `norma`, `fonte_url`, **`fonte_verificada` boolean**, `hash_fonte`, `pesquisado_em` |
| `folha_cct` | Convenção por **estabelecimento**: sindicato, base territorial, data-base, piso, adicional de hora extra, benefícios obrigatórios, vigência, fonte, `fonte_verificada` |
| `folha_parametro_empresa` | O que é por CNPJ e não por norma geral: FAP do ano, código FPAS/Terceiros, RAT do CNAE preponderante, regime, base de insalubridade escolhida, divisor do salário-hora |

**Regra de ouro:** `fonte_verificada = false` em qualquer parâmetro que o cálculo tocar ⇒
o resultado nasce **PROVISÓRIO**, a pendência aparece na tela e abre tarefa no Kanban.
Nunca há valor padrão silencioso — nem para insalubridade, nem para divisor, nem para
adicional de hora extra.

### 2.2 Cadastro e movimento

| Tabela | Papel |
|---|---|
| `folha_trabalhador` | Pessoa: CPF, dados pessoais, dependentes (com marca `titular_menor`) |
| `folha_vinculo` | Contrato: matrícula, categoria, admissão, cargo, salário, jornada, lotação, CCT aplicável, desligamento |
| `folha_rubrica` | **A tabela mais crítica do módulo** — ver seção 3 |
| `folha_competencia` | Período por cliente: status (aberta, calculada, fechada, reaberta), datas do ciclo |
| `folha_lancamento` | Variável do mês: verba, referência, valor, origem (ponto, manual, importação) |
| `folha_calculo` | Resultado por vínculo e competência, com **memória de cálculo** em jsonb: cada verba, a base que usou, a fórmula, e **o `folha_parametro.id` que a alimentou** |

A memória de cálculo apontando para o parâmetro exato é o que torna a folha auditável e o
que permite responder "por que o líquido caiu?" sem recalcular na mão. Mesmo padrão da
trilha de auditoria do `tributos-br` já adotada no motor fiscal.

### 2.3 eSocial

| Tabela | Papel |
|---|---|
| `folha_esocial_evento` | Um por evento: tipo, `id_evento` (36 caracteres), xml assinado, hash, status, `protocolo`, `recibo`, ocorrências, `indRetif`, `nr_recibo_anterior` |
| `folha_esocial_lote` | Lote enviado: protocolo, momento, eventos, retorno bruto |
| `folha_pendencia` | Toda pendência do módulo, ligada à origem (parâmetro, vínculo, competência, evento) e à tarefa criada no Kanban |

**Idempotência:** o reenvio do mesmo evento devolve o recibo do original — é o mecanismo
oficial de recuperação quando a resposta se perde. O `id_evento` estável é o que permite
usá-lo; gerá-lo por sorteio a cada tentativa joga fora essa garantia.

**`nrInsc` é texto, não inteiro.** O pacote vigente já é o de CNPJ alfanumérico.

## 3. A peça que decide se o módulo funciona: rubrica → incidência

A auditoria interna apontou isto como **o maior risco sem especificação em lugar nenhum**.

Cada rubrica da empresa precisa de um de-para explícito para os códigos de incidência do
evento de tabela de rubricas do eSocial — previdenciária, imposto de renda e FGTS. Errar o
código não gera erro de sistema: gera **recolhimento a menor**, que aparece meses depois
como divergência entre a folha e o retorno do eSocial.

Consequências de desenho:

1. `folha_rubrica` guarda os três códigos de incidência como **campos de primeira classe**,
   não dentro de um jsonb — eles são consultados, conferidos e auditados.
2. Rubrica sem os três códigos preenchidos **não entra em cálculo**. Não há padrão.
3. Toda rubrica nova nasce com pendência até um humano classificá-la.
4. A conferência contra os totalizadores de retorno do eSocial é o teste de aceite do
   módulo — não os holerites de teste, que só provam aritmética.

## 4. Segurança — o que muda em relação ao padrão atual

O padrão do Masor (`masor_is_staff()`, `cliente_id`, RLS por cliente) é a base, com
acréscimos que folha exige e o fiscal não exigia:

- **RLS com `FORCE`** e teste de fuga de tenant no CI.
- **Autoexclusão**: ninguém enxerga a própria folha pelo perfil administrativo. Sem isso,
  qualquer pessoa do time com acesso de staff vê o próprio salário e o dos colegas.
- **Cifragem em coluna**, com chave fora do banco, para dados bancários, biometria e
  qualquer dado de saúde vindo dos eventos de SST.
- **Auditoria de leitura**, não só de escrita, append-only e sem dado sensível dentro do
  log. Em folha, quem *olhou* importa tanto quanto quem alterou.
- **Whitelist do que pode ir para a IA.** Nome, CPF, salário e CID nunca saem. O que se
  manda para um modelo é rubrica, base e resultado — nunca a pessoa.
- Restaurar produção em homologação fica proibido por processo.

## 5. Faseamento

Na ordem que a pesquisa recomenda — **cálculo antes de transporte**, porque canal sem
conteúdo não entrega nada:

| Fase | Entrega | Portão de saída |
|---|---|---|
| **0** | Baixar e arquivar as fontes de `FONTES-A-BAIXAR.md`; reprocessar os seis documentos elevando o selo | Zero pendência bloqueadora aberta |
| **1** | Parâmetros vivos e cadastros: `folha_parametro`, `folha_cct`, trabalhador, vínculo, rubrica com incidências | Nenhum parâmetro com `fonte_verificada = false` em uso silencioso |
| **2** | Motor de cálculo mensal, com memória de cálculo | Os treze testes-âncora passam, e a rescisão, férias e 13º ganham massa própria — hoje não existe |
| **3** | Geração e validação do XML **offline**, contra o XSD | Todo evento do MVP valida sem rede |
| **4** | Transmissão em produção restrita | Reconciliação com os totalizadores de retorno bate |
| **5** | Piloto com **uma** empresa real e pequena, folha em paralelo com o sistema atual | Dois meses seguidos sem divergência |
| **6** | Obrigações conexas: DCTFWeb, FGTS Digital, guias, CNAB | — |

**Fase 5 não é opcional.** Rodar em paralelo por dois meses é o único jeito honesto de
descobrir divergência de centavo antes que ela vire passivo.

## 6. O que ainda não tem especificação

Levantado pela auditoria, e não coberto por nenhum dos seis documentos:

- Rescisão, férias e 13º **sem exemplo numérico completo** — a massa de teste cobre só a
  folha mensal.
- Carga inicial de bases acumuladas na migração de outro sistema (13º proporcional, férias
  vencidas, FGTS histórico) — é o que mais dá errado em troca de sistema.
- Proporcionalização de admissão e demissão no meio do mês; faltas, atrasos e perda do DSR.
- Tratamento do arquivo de ponto até as horas apuradas.
- Conteúdo legal obrigatório do holerite.
- Plano de reconciliação da folha contra os totalizadores de retorno.

Nada disso é detalhe: cada item é um lugar onde a folha erra em silêncio.
