# eSocial — Integração técnica para o módulo de Folha do Lior

> Pesquisa executada em **30/08/2026**. Alvo: especificar **como se envia dado ao eSocial**
> a partir de um servidor Node.js/TypeScript (TanStack Start + Nitro + Supabase), reaproveitando
> o cofre de certificados A1 e o mTLS já existentes (NFeDistribuiçãoDFe).
>
> **Regra do projeto (anti-invenção):** nenhuma URL, limite, versão ou comportamento aparece
> aqui sem fonte. O que não foi confirmado está marcado `PENDÊNCIA — não confirmado` e
> **não deve ser codado** até verificação.

---

## VERIFICADO EM FONTE PRIMÁRIA — 30/08/2026

O Manual de Orientação do Desenvolvedor v1.15 foi **baixado e lido** (hash em
`fontes/VERIFICACAO.md`). Resultado para este documento:

| O que este documento dizia | Veredito |
|---|---|
| Não existe canal REST oficial (P-01) | **CONFIRMADO.** Zero menções a `REST`, `JSON` ou `Bearer` nas 125 páginas |
| Lote de 1 a 50 eventos | **CONFIRMADO.** Rejeição 607 se exceder |
| Canonicalização **inclusiva** (`REC-xml-c14n-20010315`) | **CONFIRMADO** |
| O eSocial é **SOAP 1.1** com `SOAPAction` | **ERRADO.** O envelope é `2003/05/soap-envelope`, ou seja **SOAP 1.2**, e `SOAPAction` não aparece no manual |

Novo, que não estava aqui: **tamanho máximo da mensagem SOAP é 5 MB** (rejeição 11), e a
consulta devolve **só os 50 primeiros** eventos, paginando por `dhUltimoEvtRetornado`.

Endpoints confirmados: envio em `webservices.envio.esocial.gov.br/servicos/empregador/`,
consulta em `webservices.consulta.esocial.gov.br/servicos/empregador/`, download em
`webservices.download.esocial.gov.br/`, restrita em
`webservices.producaorestrita.esocial.gov.br/servicos/empregador/`.

Os selos abaixo são anteriores a esta verificação. Onde houver conflito, **vale esta seção**.

---

## 0. Método, e uma limitação honesta desta pesquisa

O ambiente de execução desta pesquisa tem **egress bloqueado para `*.gov.br`**
(`CONNECT tunnel failed, response 403` em `www.gov.br`, `portal.esocial.gov.br`,
`webservices.producaorestrita.esocial.gov.br`, `sped.rfb.gov.br`). Não foi possível abrir
diretamente os PDFs oficiais nem baixar um WSDL/XSD da origem. Foi possível:

- consultar o **conteúdo das páginas e PDFs oficiais via mecanismo de busca** (o buscador lê o PDF
  do gov.br e devolve o trecho);
- ler **código-fonte e arquivos LICENSE** em `raw.githubusercontent.com` (acessível);
- ler o **registry do npm** (acessível) — fonte primária de licença/versão de pacote.

Por isso cada afirmação leva um selo de confiança:

| Selo | Significado |
|---|---|
| **[O]** | Conteúdo **oficial** (página/PDF gov.br), obtido via extrato do buscador. URL oficial citada. |
| **[C]** | **Corroborado em código** open-source que fala com o endpoint real (implementação de terceiro). |
| **[N]** | **npm registry / LICENSE no repositório** — fonte primária, verificada nesta sessão. |
| **[V]** | Fonte **secundária** (fabricante de software, portal contábil). Tratar como indício. |
| **PENDÊNCIA** | Não confirmado. Não implementar sem verificar. |

**Ação obrigatória antes de codar:** baixar da origem, em máquina com acesso a `gov.br`,
o **MOS S-1.3 consolidado mais recente**, o **Manual de Orientação do Desenvolvedor**, os
**esquemas XSD** e o **Mensagens do Sistema**, e reconferir tudo que abaixo está marcado [C] ou [V].

---

## 1. Sumário executivo (o veredito)

1. **Canal recomendado e, até onde se confirmou, único canal oficial de integração: web service SOAP 1.1 de envio em LOTE de eventos**, com mTLS por certificado ICP-Brasil e cada evento assinado em XMLDSig. **[O]**
2. **Não existe API REST oficial do eSocial.** Toda "API REST de eSocial" que aparece no mercado (TecnoSpeed, Verne, e o próprio `tst-labs/esocial`) é um **wrapper de terceiro** sobre o mesmo SOAP. → ver PENDÊNCIA P-01.
3. **Nada indica descontinuação do SOAP.** Não foi localizado anúncio oficial de sunset. → PENDÊNCIA P-02.
4. **Não existe biblioteca de eSocial em TypeScript/JavaScript.** O npm tem **3** pacotes com o termo "esocial", **nenhum** de integração **[N]**; o GitHub tem 28 repos TS e 35 JS com esse nome, **todos com 0 estrelas** e sem tração. **A construção em TS é do zero.**
5. As bibliotecas maduras estão em **PHP** (`nfephp-org/sped-esocial`, tri-licença que inclui MIT), **Python** (`qualitaocupacional/libesocial`, Apache-2.0) e **Java** (`tst-labs/esocial`, BSD-3-Clause) — todas **licenças permissivas, usáveis como referência sem contaminar produto fechado**.
6. **Esforço realista de construir em TS do zero:** ~**4 a 7 semanas** para o núcleo de transporte (assinatura, SOAP, lote, protocolo, recibo, reconciliação) e ~**4 a 6 meses** de um dev sênior dedicado para cobertura confiável do conjunto mínimo de eventos de folha CLT — **sem contar o cálculo da folha em si**. Detalhe na seção 12.

---

## 2. Documentação oficial vigente (ago/2026)

| Documento | URL | Observação |
|---|---|---|
| Página de Documentação Técnica (índice) | `https://www.gov.br/esocial/pt-br/documentacao-tecnica` | Ponto de entrada canônico **[O]** |
| Versões anteriores | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/versoes-anteriores-da-documentacao-tecnica` | **[O]** |
| **MOS** S-1.3 consolidado até a NO S-1.3 nº **11/2026** (retificada) | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-11-2026-retificada.pdf` | Mais recente localizada **[O]** |
| MOS S-1.3 consolidado até a NO nº 10/2026 | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-10-2026.pdf` | **[O]** |
| MOS S-1.3 consolidado até a NO nº 07/2026 | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-07-2026.pdf` | **[O]** |
| **Manual de Orientação do Desenvolvedor (MOD) v1.15**, abril/2025 | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/manualorientacaodesenvolvedoresocialv1-15.pdf` | **Este é o manual do web service.** Versão mais recente localizada **[O]** — ver PENDÊNCIA P-03 |
| Leiautes S-1.3 (NT 06/2026 rev. 09/04/2026) | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026-rev-09-04-2026/index.html` | **[O]** |
| NT S-1.3 nº 06/2026 (revisada) | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/nota-tecnica-s-1-3-06-2026-rev.pdf` | **[O]** |
| **Mensagens do Sistema — Produção v2.5**, abril/2026 | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/998566-mensagensdosistema-v2-5.pdf` | **Catálogo de ocorrências/erros.** Insumo obrigatório do módulo **[O]** |
| Mensagens do Sistema — Produção v2.4, outubro/2025 | `https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/958823-mensagensdosistema-v2-4.pdf` | **[O]** |
| Produção Restrita | `https://www.gov.br/esocial/pt-br/acesso-ao-sistema/ambiente-de-producao-restrita` | **[O]** |
| Procuração Eletrônica e Assinatura Digital | `https://www.gov.br/esocial/pt-br/acesso-ao-sistema/orientacoes-assinatura-digital-e-procuracao-eletronica` | **[O]** |
| eSocial BX — Baixador de Arquivos | `https://www.gov.br/esocial/pt-br/empresas/orientacoes/esocial-bx-baixador-de-arquivos` | **[O]** |

**Versão de leiaute vigente: S-1.3.** Não existe S-1.4 publicada até a data desta pesquisa **[O]**.
Os esquemas XSD são publicados em pacote versionado — a publicação localizada mais recente é
"Esquemas XSD eSocial — Leiautes v. S-1.3 (até a NT 06/2026)" **[O]**.

> **Alerta de cadência:** só em 2026 as consolidações do MOS referenciam as Notas de Orientação
> S-1.3 **nº 06, 07, 10 e 11** — ou seja, **cerca de uma nota por mês**. Isso não é um projeto de
> "integrar e esquecer": exige rotina de vigilância de NT/NO igual à que o Masor já tem para NF-e.

> **Alerta CNPJ alfanumérico:** a NT S-1.3 nº 06/2026 tem produção prevista para **01/07/2026 para
> CNPJ alfanumérico** **[O]**. Todo campo `nrInsc` no Lior precisa ser **string**, nunca numérico.

---

## 3. Canais de integração existentes hoje

### 3.1 Web service SOAP de **envio em lote** — RECOMENDADO (e o único oficial confirmado)

- Troca de mensagens **SOAP versão 1.1**, XML no padrão **Style/Encoding: Document/Literal** **[O]**.
- Duas operações no ciclo principal: `EnviarLoteEventos` e `ConsultarLoteEventos` **[O][C]**.
- Modelo **assíncrono**: envia lote → recebe **protocolo** → consulta o protocolo → recebe
  **recibo por evento** ou **ocorrências** **[O]**.

### 3.2 Web service SOAP de **download** — eSocial **BX** ("download cirúrgico")

Permite ao empregador **recuperar eventos e recibos já transmitidos** via web service, para
sincronizar a base local com o Ambiente Nacional **[O]**. Duas operações: consultar identificadores
e solicitar download **[C]**. Uso previsto: **reconciliação**, não reconstrução de base **[O]**.

### 3.3 Módulos Web (eSocial Web Geral, Doméstico, Simplificado/MEI)

Interface humana no navegador. **Não é canal de integração** — não há API pública documentada
por trás dele. Serve como plano B operacional e para conferência.

### 3.4 "Envio por evento" / REST

**Não foi localizado nenhum canal REST oficial do eSocial**, nem endpoint, nem manual, nem
anúncio. As ofertas REST do mercado são wrappers de terceiros sobre o SOAP.
→ **PENDÊNCIA P-01** (ausência de evidência ≠ evidência de ausência).

> Observação de contraste, **fora do escopo confirmado desta pesquisa**: a EFD-Reinf tem trilha
> própria de manual de desenvolvedor (`sped.rfb.gov.br`) e é frequentemente citada como tendo
> API REST — **não verificado nesta sessão** → PENDÊNCIA P-12.

---

## 4. Endpoints

Todos com sufixo `?wsdl` para obter o contrato. **A obtenção do WSDL também exige mTLS** — não é
um GET anônimo.

### 4.1 Envio e consulta de lote

| Ambiente | Serviço | URL |
|---|---|---|
| **Produção** | Envio de lote | `https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc` |
| **Produção** | Consulta do resultado | `https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc` |
| **Produção Restrita** | Envio de lote | `https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc` |
| **Produção Restrita** | Consulta do resultado | `https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc` |

Fonte: notícia oficial "Divulgadas novas URL para transmissão dos dados de produção do eSocial"
(`https://www.gov.br/esocial/pt-br/noticias/divulgadas-novas-url-para-transmissao-dos-dados-de-producao-do-esocial`)
e página de Produção Restrita **[O]**; corroborado literalmente em
`qualitaocupacional/libesocial` → `esocial/__init__.py`, dicionário `_WS_URL` **[C]**.

### 4.2 eSocial BX (download cirúrgico)

| Ambiente | Serviço | URL |
|---|---|---|
| **Produção** | Consultar identificadores de eventos | `https://webservices.download.esocial.gov.br/servicos/empregador/dwlcirurgico/WsConsultarIdentificadoresEventos.svc` |
| **Produção** | Solicitar download de eventos | `https://webservices.download.esocial.gov.br/servicos/empregador/dwlcirurgico/WsSolicitarDownloadEventos.svc` |
| **Produção Restrita** | Consultar identificadores | `https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/dwlcirurgico/WsConsultarIdentificadoresEventos.svc` |
| **Produção Restrita** | Solicitar download | `https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/dwlcirurgico/WsSolicitarDownloadEventos.svc` |

Fonte: `_WS_URL_DOWN` em `libesocial` **[C]**; host `webservices.download.esocial.gov.br`
corroborado em extrato oficial **[O]**.

> **PENDÊNCIA P-04:** reconferir as 8 URLs acima no MOD vigente antes de gravar em código.
> A `libesocial` está parada desde **22/08/2024** **[N]** e os endpoints do eSocial **já mudaram
> uma vez** (a notícia acima é justamente sobre troca de URL).

### 4.3 XSD / namespaces do pacote de comunicação

Namespaces observados em implementação **[C]**:

| Uso | Namespace |
|---|---|
| Envio de lote | `http://www.esocial.gov.br/schema/lote/eventos/envio/v{versao}` |
| Consulta de lote | `http://www.esocial.gov.br/schema/lote/eventos/envio/consulta/retornoProcessamento/v{versao}` |
| Consulta de identificadores (empregador) | `http://www.esocial.gov.br/schema/consulta/identificadores-eventos/empregador/v{versao}` |

Arquivos XSD do pacote de comunicação (nomes conforme implementação **[C]**):
`EnvioLoteEventos-v{v}.xsd`, `ConsultaLoteEventos-v{v}.xsd`, `RetornoEnvioLoteEventos-v{v}.xsd`,
`RetornoEvento-v{v}.xsd`, `RetornoProcessamentoLote-v{v}.xsd`,
`ConsultaIdentificadoresEventosEmpregador-v{v}.xsd`, `ConsultaIdentificadoresEventosTabela-v{v}.xsd`,
`ConsultaIdentificadoresEventosTrabalhador-v{v}.xsd`, `RetornoConsultaIdentificadoresEventos-v{v}.xsd`,
`SolicitacaoDownloadEventosPorId-v{v}.xsd`, `SolicitacaoDownloadEventosPorNrRecibo-v{v}.xsd`,
`RetornoSolicitacaoDownloadEventos-v{v}.xsd`.

> **PENDÊNCIA P-05:** as **versões** de cada XSD do pacote de comunicação vigentes em ago/2026
> não foram confirmadas. As versões vistas em código (`EnvioLoteEventos-v1.1.1`,
> `RetornoProcessamentoLote-v1.3.0` etc.) são de 2024 **[C]** e **muito provavelmente estão
> desatualizadas**. Baixar o pacote XSD atual e ler os `targetNamespace`.

---

## 5. Fluxo completo de envio

### 5.1 Montagem do lote

Estrutura do XML de envio, conforme implementação de referência **[C]**:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/v{versao}">
  <envioLoteEventos grupo="1">
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>12345678</nrInsc>
    </ideEmpregador>
    <ideTransmissor>
      <tpInsc>1</tpInsc>
      <nrInsc>43210987654321</nrInsc>
    </ideTransmissor>
    <eventos>
      <evento Id="ID1123456780000002026083012000100001">
        <!-- XML do evento, JÁ ASSINADO individualmente -->
      </evento>
      <!-- ... até 50 eventos ... -->
    </eventos>
  </envioLoteEventos>
</eSocial>
```

Regras da montagem:

| Item | Regra | Selo |
|---|---|---|
| Eventos por lote | **1 a 50** | **[O]** + `max_batch_size = 50` em código **[C]** |
| `grupo` | Atributo obrigatório de `envioLoteEventos`; o sistema verifica se o evento pertence ao grupo informado e **rejeita** se divergir | atributo confirmado em código **[C]**; semântica `1`=iniciais/tabelas, `2`=não periódicos, `3`=periódicos **[V]** → PENDÊNCIA P-06 |
| `ideEmpregador/nrInsc` com `tpInsc=1` | Enviar apenas a **raiz do CNPJ (8 primeiros dígitos)**; com `tpInsc=2` (CPF), o número completo | **[C]** → PENDÊNCIA P-07 |
| `ideTransmissor/nrInsc` | Deve ser **igual ao CNPJ/CPF do certificado** usado para enviar o lote | **[V]** (base de conhecimento de fabricante) → PENDÊNCIA P-08 |
| `evento/@Id` | Identificador único do evento, replicado do atributo `Id` do próprio evento | **[C]** |
| Tamanho máximo em bytes | O MOD menciona um limite de tamanho da mensagem SOAP, mas **o valor não foi obtido** | **PENDÊNCIA P-09** |

Formato do `Id` do evento observado em implementação **[C]**:
`ID` + `tpInsc` (1 dígito) + `nrInsc` preenchido à direita com zeros até 14 + `AAAAMMDDHHMMSS` +
sequencial de 5 dígitos → **36 caracteres**.
→ **PENDÊNCIA P-10:** confirmar a regra formal do `Id` no MOS/MOD (é regra de validação, gera rejeição).

### 5.2 Assinatura → ver seção 6

### 5.3 Envio

Operação SOAP `EnviarLoteEventos`, com o `<eSocial>` do lote como conteúdo do parâmetro
`loteEventos` **[C]**. Retorno imediato (`RetornoEnvioLoteEventos`) contendo:

- `cdResposta` / `descResposta`;
- `protocoloEnvio` quando aceito;
- `ocorrencias` quando `cdResposta ≠ 201` **[O]**.

**Códigos de resposta confirmados** **[O]**:

| `cdResposta` | Significado |
|---|---|
| `101` | Lote aguardando processamento |
| `201` | Lote recebido/processado com sucesso |
| `202` | Lote recebido/processado com advertências |
| `301` | Erro do servidor do eSocial |
| `401` | Lote incorreto — erro de preenchimento |
| `402` | Lote incorreto — schema inválido |

> Faltam os demais códigos da tabela completa → **PENDÊNCIA P-11**. O catálogo completo de
> mensagens está no *Mensagens do Sistema — Produção v2.5* (seção 2).

### 5.4 Consulta assíncrona do resultado

Operação `ConsultarLoteEventos`, com o envelope **[C]**:

```xml
<eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/consulta/retornoProcessamento/v{versao}">
  <consultaLoteEventos>
    <protocoloEnvio>1.1.202608.0000000000011111111</protocoloEnvio>
  </consultaLoteEventos>
</eSocial>
```

Enquanto o processamento não termina, o retorno vem com `cdResposta = 101` (aguardando
processamento) **[O]** — logo, **polling**. O retorno final (`RetornoProcessamentoLote`) traz, por
evento, o **`nrRecibo`** quando aceito, ou as **ocorrências** quando rejeitado, além de
`dhProcessamento` e `versaoAppProcessamento` **[C]**.

> **PENDÊNCIA P-13:** intervalo mínimo/recomendado entre consultas do mesmo protocolo e política
> de *throttling* (nº de requisições por minuto/hora em envio e consulta) **não confirmados**.
> Implementar backoff exponencial conservador (ex.: 5s → 10s → 30s → 60s) até haver número oficial.

### 5.5 Estrutura de ocorrências

Cada ocorrência traz, no mínimo, **código**, **descrição**, **tipo** (erro/advertência) e a
**localização** do problema **[O]**. Os códigos são o vínculo com o *Mensagens do Sistema*.

> **PENDÊNCIA P-14:** nomes exatos das tags de `ocorrencias` (`codigo`, `descricao`, `tipo`,
> `localizacao`) não confirmados literalmente no XSD. Ler `RetornoProcessamentoLote-v{v}.xsd`.

### 5.6 Recibo

O **`nrRecibo`** por evento é o comprovante e a **chave para retificação** posterior (o evento
retificador referencia o recibo do evento retificado) e para o download via BX. **Persistir o
recibo é obrigatório** — sem ele, retificação e reconciliação ficam caras.

---

## 6. Assinatura digital

### 6.1 Padrão

| Item | Valor | Selo |
|---|---|---|
| Padrão | **XMLDSig — enveloped** | **[O][C]** |
| Transformações | `http://www.w3.org/2000/09/xmldsig#enveloped-signature` **e** `http://www.w3.org/TR/2001/REC-xml-c14n-20010315` | **[O]** |
| Canonicalização | **C14N inclusiva** `http://www.w3.org/TR/2001/REC-xml-c14n-20010315` — **NÃO é a exclusiva** (`xml-exc-c14n#`) | **[O][C]** |
| Digest | **SHA-256** | **[O][C]** |
| Assinatura | **RSA-SHA256** | **[O][C]** |
| `KeyInfo` | Deve conter `X509Data` → `X509Certificate` (certificado do assinante embutido no XML) | **[O][C]** |

> **Armadilha nº 1 para quem vem da NF-e:** a NF-e usa **C14N exclusiva**; o eSocial usa
> **C14N inclusiva**. Bibliotecas de assinatura (inclusive `xml-crypto`) costumam ter a exclusiva
> como padrão. Errar aqui produz assinatura sintaticamente válida e **rejeitada** pelo eSocial.

### 6.2 O que é assinado

- **Cada evento é assinado individualmente**, antes de ser inserido no lote **[C]**.
- **O envelope do lote não é assinado** na implementação de referência **[C]**.
- Os **envelopes de consulta do eSocial BX são assinados** **[C]**.
→ **PENDÊNCIA P-15:** confirmar literalmente no MOD (é o ponto onde mais se erra).

### 6.3 Validação feita pelo eSocial

O eSocial, ao receber, executa: extração da chave pública do certificado, verificação do
**período de validade**, validação da **cadeia de confiança** e da **LCR (CRL) de cada certificado
da cadeia**, e validação do **uso da chave** para assinatura digital **[O]**.

Consequências práticas:
- certificado **A1 vencido** derruba tudo — o cofre do Lior precisa alertar com antecedência;
- **revogação** é checada — certificado revogado é rejeitado mesmo dentro da validade.

### 6.4 Certificado aceito

- Emitido por AC credenciada na **ICP-Brasil**, **série A**, tipo **A1** ou **A3** **[O]**.
- Tipo **e-CPF (e-PF)** ou **e-CNPJ (e-PJ)** **[O]**.
- **A1** fica em arquivo (`.pfx`/`.p12`, PKCS#12) na máquina; **A3** em smart card/token **[O]**.

**Para o Lior:** só **A1** é viável em servidor — A3 exige hardware presente e não é
automatizável em backend. O cofre existente (PFX cifrado AES-256-GCM, decifrado em memória)
serve ao eSocial **sem mudança de arquitetura**.

### 6.5 Cadeia ICP-Brasil no lado cliente

Para o **TLS de saída** é preciso confiar na cadeia dos servidores do eSocial. Cadeia citada **[C]**:

| Nível | Arquivo |
|---|---|
| Raiz | `http://acraiz.icpbrasil.gov.br/credenciadas/RAIZ/ICP-Brasilv10.crt` |
| 1º nível | `http://acraiz.icpbrasil.gov.br/credenciadas/RFB/v2/p/AC_Secretaria_da_Receita_Federal_do_Brasil_v3.crt` |
| 2º nível | `http://acraiz.icpbrasil.gov.br/credenciadas/RFB/v2/Autoridade_Certificadora_do_SERPRO_RFB_SSL.crt` |

A `libesocial` documenta que o MOD v1.10 (p. 114) manda instalar a cadeia, que o manual estava
**desatualizado** quanto à raiz, e que os servidores usam a **Raiz v10** **[C]**.
→ **PENDÊNCIA P-16:** confirmar a cadeia vigente em ago/2026. Cadeia trocada = queda total do canal.

### 6.6 Procuração eletrônica — o escritório contábil transmitindo pelo cliente

Cenário da G41: a G41 (ou o Lior operando por ela) transmite eventos de **empregadores clientes**.

- Os eventos podem ser enviados **pelo próprio obrigado ou por terceiro com poderes outorgados** —
  situação descrita como **rotineira em escritórios de contabilidade** **[O]**.
- Quando o certificado do transmissor tem CNPJ **diferente** do empregador, é necessária
  **outorga (procuração eletrônica) registrada no e-CAC da Receita Federal**, com os **serviços do
  eSocial** explicitamente marcados **[O][V]**.
- O caminho no e-CAC: *Procuração Eletrônica → Cadastrar Procuração →* informar CPF/CNPJ do
  procurador → selecionar os poderes/serviços de eSocial → cadastrar **[V]**.
- Rejeição típica quando falta: *"Assinante inválido. Assinante não possui perfil de procuração
  eletrônica para enviar este tipo de evento ou assinante não consta como representante legal da
  empresa."* **[V]**

> **PENDÊNCIA P-17:** a **lista exata dos serviços/perfis de eSocial** outorgáveis no e-CAC (e se
> há perfis distintos por grupo de evento, ex.: SST) **não foi confirmada em fonte oficial**.
> Isso importa: um perfil parcial derruba só uma parte dos eventos, e o Lior precisa diagnosticar isso.
>
> **PENDÊNCIA P-18:** confirmar se o **transmissor pode ser sempre a G41** (um único e-CNPJ com N
> procurações) ou se há caso em que o certificado precisa ser do próprio empregador.
> Do ponto de vista de produto, é a diferença entre **um** cofre e **N** cofres de certificado.

---

## 7. Autenticação/autorização do canal e implicações para Node.js

**Não há token, não há OAuth, não há API key.** A autenticação é **exclusivamente mTLS**: o
certificado ICP-Brasil é apresentado no handshake TLS, e a mesma identidade é usada na assinatura
XMLDSig dos eventos **[O][C]**.

Implicações concretas no stack do Lior (Nitro/Node):

| Necessidade | Como resolver em Node | Custo |
|---|---|---|
| Apresentar o A1 no handshake | `new https.Agent({ pfx, passphrase, ca })` — Node aceita **PKCS#12 nativamente** | **Zero — já existe** (NFeDistribuiçãoDFe) |
| Confiar na cadeia SERPRO/ICP | `ca: [raiz, ac1, ac2]` no Agent, ou `NODE_EXTRA_CA_CERTS` | Baixo |
| Extrair chave+cert do PFX para **assinar** | `node-forge` (`pkcs12`) — o `crypto` do Node **não** lê PKCS#12 | Baixo |
| Manter o PFX só em memória | Já é o padrão do cofre existente | Zero |
| Ambiente serverless/edge | **Incompatível.** mTLS com PFX exige runtime Node completo | Arquitetural |

> **Consequência de arquitetura:** o transmissor eSocial **tem de rodar como worker Node
> persistente** (fila + polling de protocolo), não como handler de request. O modelo é assíncrono
> por natureza: enviar → guardar protocolo → voltar depois. Encaixar isso em request/response de
> UI é a fonte clássica de bug (timeout no meio do envio, lote enviado e protocolo perdido).

---

## 8. Consultas disponíveis para reconciliação

### 8.1 Consulta de resultado de lote
`ConsultarLoteEventos` por `protocoloEnvio` — ver 5.4.

### 8.2 eSocial BX — consulta de identificadores + download

Recupera eventos e recibos já transmitidos, para sincronizar a base local **[O]**. Filtros por
**empregador**, **tabela** e **trabalhador**, com download **por Id** ou **por nº de recibo** **[C]**.

**Limites confirmados do BX** **[O]**:

| Limite | Valor |
|---|---|
| Requisições simultâneas por empregador | **1** (sem paralelismo) |
| Requisições por dia | **máximo 10** |
| Eventos retornados por requisição | **apenas os 50 primeiros** do filtro |
| Intervalo de pesquisa | **no máximo 31 dias** |
| Finalidade declarada | baixar eventos **faltantes**; **não** serve para reconstruir a base inteira |

> **Impacto de produto:** 10 requisições/dia × 50 eventos = **500 eventos/dia por empregador**.
> Para uma carteira de escritório contábil, a reconciliação em massa é **inviável** por esse canal.
> A base local do Lior tem de ser a fonte da verdade, com o BX servindo só para conserto pontual.

### 8.3 Consulta Qualificação Cadastral (CQC)

Valida **nome, data de nascimento, CPF e NIS** contra as bases de CPF e CNIS **[O]** — passo
clássico de higienização antes de admitir trabalhador.

- Consulta **online**: até **10 trabalhadores por vez** **[O]**.
- Consulta **em lote**: **SUSPENSA desde 16/08/2025, sem data de retorno** **[O]**
  (`https://www.gov.br/esocial/pt-br/noticias/suspensao-da-consulta-da-qualificacao-cadastral-em-lote`).
  Alternativa indicada: consulta pública da situação cadastral do CPF em
  `https://servicos.receita.fazenda.gov.br/servicos/cpf/consultasituacao/consultapublica.asp` **[O/V]**.

> **PENDÊNCIA P-19:** confirmar se a CQC em lote voltou a operar até 30/08/2026.
> **Não planejar o onboarding de trabalhador do Lior contando com a CQC em lote.**

---

## 9. Erros, armadilhas e idempotência

### 9.1 Idempotência — a boa notícia

**Reenviar o mesmo evento não duplica.** O eSocial detecta duplicidade por
**tipo de inscrição + número de inscrição + CPF do trabalhador + período de apuração** e devolve
**erro de duplicidade acompanhado do número do recibo do evento original** **[O]**.

Mais: a documentação oficial **recomenda o reenvio do lote como forma de confirmar o recebimento** —
se já havia sido recebido, volta o erro de duplicidade **com o recibo do lote original** **[O]**.

> **Padrão a implementar no Lior:** em qualquer falha de rede/timeout depois do envio,
> **reenviar o mesmo lote** é seguro e é o mecanismo oficial de recuperação. Tratar o erro de
> duplicidade **não como erro**, mas como **"já aceito — capture o recibo daqui"**.
> Isso resolve o pior cenário do transporte (lote enviado, resposta perdida) sem estado distribuído.

### 9.2 Duplicidade real (dois eventos concorrentes)

Quando há de fato dois eventos para o mesmo trabalhador/competência, o procedimento oficial é:
localizar o evento com status **rejeitado**, excluí-lo/dispensá-lo, manter só o aceito, e conferir **[O]**.

### 9.3 Ordem dos eventos — não é opcional

- O **primeiro evento é sempre o S-1000**, seguido dos **eventos de tabelas** **[O]**.
- O S-1000 precede o S-2200 e os S-1200/S-1202/S-1207 **[O]**.
- O S-2200 é enviado **depois** do grupo de eventos de tabelas **[O]**.
- Conceito oficial de **"empilhamento"**: o que foi transmitido nos eventos iniciais é usado nos
  seguintes; alterar dado antigo exige avaliar a repercussão nos posteriores **[O]**.

> **Consequência para o Lior:** a fila de envio **não pode ser um pool paralelo simples**. Precisa
> de **ordenação com dependências por empregador** (grafo de precedência) e de **barreira**:
> nada do grupo 2 sai enquanto o grupo 1 não estiver com recibo. Além disso o atributo `grupo`
> do lote impede misturar grupos no mesmo lote **[C][V]** — o particionador de lote tem de
> agrupar por `(empregador, grupo)` **antes** de fatiar em blocos de 50.

### 9.4 Rejeições mais comuns (as que se confirmou)

| Sintoma | Causa | Selo |
|---|---|---|
| `402` — schema inválido | XML não bate com o XSD vigente (típico após NT) | **[O]** |
| `401` — erro de preenchimento | Regra de negócio do MOS violada | **[O]** |
| Evento em duplicidade | Reenvio de evento já aceito (retorna o recibo original) | **[O]** |
| Evento rejeitado por grupo | Evento não pertence ao `grupo` informado no lote | **[C][V]** |
| "Assinante inválido / sem perfil de procuração" | Falta outorga no e-CAC para o serviço de eSocial | **[V]** |
| `nrInsc` do transmissor ≠ certificado | Divergência entre `ideTransmissor` e o certificado do TLS/assinatura | **[V]** |
| Assinatura inválida | C14N exclusiva em vez de inclusiva; falta `X509Data`; certificado vencido/revogado | derivado de **[O]** |

> **PENDÊNCIA P-20:** a lista completa e priorizada de rejeições precisa vir do
> *Mensagens do Sistema — Produção v2.5* e ser **importada como tabela de dados** no Lior
> (mesmo princípio do projeto: regra vive em dado, não em código).

### 9.5 Retificação e exclusão

- **Retificação:** evento retificador referencia o **recibo** do evento retificado.
- **Exclusão:** evento **S-3000** (e **S-3500** para processo trabalhista) **[O — lista de leiautes]**.
→ **PENDÊNCIA P-21:** mecânica exata (campos `indRetif`, `nrRecibo`) não lida em fonte primária.

---

## 10. Ferramental de teste

### 10.1 Produção Restrita — confirmado **[O]**

| Característica | Valor |
|---|---|
| Necessita cadastro prévio? | **Não.** Aberto a qualquer empresa, não só desenvolvedores |
| Validade jurídica | **Nenhuma.** Nada migra para produção |
| Interface visual (navegador) | **Não existe** — só web service |
| Limite | **1.000 vínculos por empregador** |
| Calendário | **Próprio**, não segue as datas de produção |
| Reversibilidade | É possível **excluir todos os eventos** enviados, **inclusive o S-1000** |

> Isso é excelente para o Lior: dá para **zerar e repetir** o ciclo de testes ponta a ponta,
> inclusive o cadastro inicial. Vale montar um *fixture* de empregador de teste reprodutível.

Ainda é preciso um **certificado A1 válido** para acessar a Produção Restrita — o ambiente é de
teste, o certificado não. → **PENDÊNCIA P-22:** confirmar se aceita certificado de homologação.

### 10.2 Validadores oficiais

- **Não existe validador/PVA offline oficial do eSocial** (diferente de outros projetos SPED) **[O]**.
- A validação sintática é feita **contra os XSD oficiais**, por parser **[O]**.
- Consequência: **o validador é o próprio XSD** — e a validação XSD local vira requisito
  do módulo, não um extra (ver seção 11).

### 10.3 Massa de testes oficial

**Não foi localizada massa de testes oficial publicada** → **PENDÊNCIA P-23**.
Na prática a massa se constrói contra a Produção Restrita.

---

## 11. Bibliotecas open source — avaliação com licença verificada

Licenças lidas **diretamente no arquivo LICENSE do repositório** (raw.githubusercontent.com) e
metadados obtidos da API do GitHub, **em 30/08/2026**. **[N]**

| Repositório | Ling. | Licença (verificada no LICENSE) | Último push | Cobertura | Veredito |
|---|---|---|---|---|---|
| [`nfephp-org/sped-esocial`](https://github.com/nfephp-org/sped-esocial) | PHP | **Tri-licença: MIT · LGPLv3+ · GPLv3+** — o usuário escolhe; **MIT torna compatível com produto fechado** | 2026-07-01 | Layout **S-1.3** completo: S-1000…S-3500, S-5001…S-5503, S-8200/8299. Monta XML, assina, envia lote e consulta com A1 (PKCS#12) | **[REF] — a melhor referência viva.** Ativa e no leiaute certo. PHP, não dá para consumir do Lior. O próprio README avisa "biblioteca em desenvolvimento, TESTE antes de usar" |
| [`tst-labs/esocial`](https://github.com/tst-labs/esocial) (eSocial-JT) | Java | **BSD-3-Clause** (© 2021 TST) | 2026-07-03 | Pacote de esquemas **S-1.3 (NT 03/2025)**; tabela de status por evento, com S-1000/1005/1010/1020/1070, S-1200/1202/1207/1210/1298/1299, S-2200…S-2420, S-3000 marcados "Feito · PROCESSADO COM SUCESSO"; parseia os totalizadores S-5001/5002/5003/5011/5012/5013 | **[REF] forte.** Origem **institucional (TST)**, licença permissiva, arquitetura declarada: recebe JSON → gera evento → assina → transmite → consulta. **É exatamente o desenho que o Lior precisa** — vale copiar a modelagem |
| [`qualitaocupacional/libesocial`](https://github.com/qualitaocupacional/libesocial) | Python | **Apache-2.0** | 2024-08-22 | Envio/consulta de lote + eSocial BX completo; validação por XSD; assinatura A1. Alvo declarado: **S-1.0** (defasado) | **[REF] — a melhor referência de *transporte*.** Foi de onde saíram, verificados em código, os 8 endpoints, o limite de 50, a estrutura do lote e os parâmetros exatos de assinatura. **Não usar como DEP:** parada há 2 anos, leiaute S-1.0 |
| [`Samuel-Oliveira/Java-eSocial`](https://github.com/Samuel-Oliveira/Java-eSocial) | Java | **MIT** | 2019-01-05 | — | **EVITAR** — abandonado há 7 anos |
| [`gwmoura/esocial-schema`](https://github.com/gwmoura/esocial-schema) | — | **Apache-2.0** | 2015-02-25 | XSDs antigos | **EVITAR** — schemas obsoletos |
| [`TadaSoftware/PyeSocial`](https://github.com/TadaSoftware/PyeSocial) | Python | **GPL-3.0** | 2018-01-10 | — | **EVITAR** — copyleft forte **+** abandonado |
| [`emensageria/emensageria`](https://github.com/emensageria/emensageria) | Java/HTML | **AGPL-3.0** | 2026-04-11 | eSocial + Reinf | **EVITAR** — **AGPL contamina até SaaS**. Incompatível com produto fechado. Ativo, mas inutilizável para a G41 |
| [`akretion/esociallib`](https://github.com/akretion/esociallib) | Python | **Sem arquivo LICENSE no repositório** | 2023-05-22 | — | **EVITAR até verificar.** Sem licença = todos os direitos reservados por padrão → **PENDÊNCIA P-24** |
| [`MirrorProjetoACBr/ACBr`](https://github.com/MirrorProjetoACBr/ACBr) / [`frones/ACBr`](https://github.com/frones/ACBr) | Pascal | **Não verificada** (LICENSE não localizado no caminho testado) | 2026-08-29 / 2026-08-19 | Tem componente de eSocial (topic `esocial`) | **[REF] potencial**, mas **PENDÊNCIA P-25** — ACBr é usualmente LGPL com ressalva; **verificar antes de olhar código** |

### 11.1 O buraco: TypeScript/JavaScript

Verificado em 30/08/2026 **[N]**:

- **npm**: busca por `esocial` retorna **3 pacotes** — `@senior-gestao-pessoas/esocial-components`
  (componentes de UI de um ERP), `@br-validators/core` (validação de CPF/CNPJ) e
  `esocial-components` (2018). **Nenhum é biblioteca de integração.**
- **GitHub**: 28 repositórios TypeScript e 35 JavaScript com "esocial" no nome — **todos com
  0 estrelas**, quase todos criados em 2025/2026, sem release, sem tração.

**Conclusão: não existe `sped-esocial` de TypeScript. O Lior constrói ou compra.**

### 11.2 Peças de infraestrutura em TS que existem (licenças do npm, 30/08/2026) **[N]**

| Pacote | Versão / data | Licença | Serve para | Ressalva |
|---|---|---|---|---|
| `xml-crypto` | 6.1.2 · 2025-04-24 | **MIT** | XMLDSig enveloped RSA-SHA256 | **Padrão é C14N exclusiva** — precisa forçar `http://www.w3.org/TR/2001/REC-xml-c14n-20010315`; e emitir `X509Data` exige `getKeyInfoContent` customizado |
| `xmldsigjs` | 2.8.8 · 2026-07-28 | **MIT** | XMLDSig via Web Crypto | Alternativa; mais ativa |
| `node-forge` | 1.4.0 · 2026-03-24 | **BSD-3-Clause OR GPL-2.0** | Ler PKCS#12 (PFX) → chave/cert PEM | Escolher **BSD-3** na dupla licença |
| `@xmldom/xmldom` | 0.9.12 · 2026-08-21 | **MIT** | DOM para assinar | Dependência do `xml-crypto` |
| `xpath` | 0.0.34 · 2023-12-16 | **MIT** | Seleção de nós | Parado, mas estável |
| `xmlbuilder2` | 4.0.3 · 2025-12-01 | **MIT** | Montar o XML dos eventos | — |
| `fast-xml-parser` | 5.11.1 · 2026-08-27 | **MIT** | Ler o retorno | Não faz XSD |
| `xmllint-wasm` | 5.3.0 · 2026-08-05 | **MIT** | **Validação XSD** sem binário nativo | Verificar suporte a `xsd:import`/multi-schema — os XSDs do eSocial se importam |
| `libxml2-wasm` | 0.7.1 · 2026-03-12 | **MIT** | Validação XSD (wasm) | Idem |
| `libxmljs2` | 0.37.0 · 2025-06-01 | **MIT** | Validação XSD (libxml nativo) | **node-gyp** — atrito em Docker/CI |
| `soap` | 1.11.0 · 2026-08-26 | **MIT** | Cliente SOAP | Ver 12.2 — provavelmente **não usar** |
| `strong-soap` | 6.0.2 · 2026-08-17 | **MIT** | Cliente SOAP | Idem |
| `cxsd` | 0.1.1 · **2016** | MIT | XSD → tipos TS | **Morto.** Não usar |
| `xsd2ts` | 0.9.17 · 2021 | **UNLICENSED** | XSD → tipos TS | **Não usar** — licença proibitiva |

---

## 12. Esforço de construir em TypeScript do zero — avaliação honesta

### 12.1 O que **já existe** no Lior e vale ouro

- **Cofre A1** (PFX cifrado AES-256-GCM no Storage, decifrado só em memória) → reaproveitado 100%.
- **mTLS com órgão público** (NFeDistribuiçãoDFe) → o transporte TLS é o mesmo padrão.
- Cultura de **XML fiscal + XSD + Notas Técnicas** já instalada no time.

Isso corta talvez **30–40%** do risco de um projeto eSocial começado do zero.

### 12.2 O que **não existe pronto em TS** e precisa ser construído

| Peça | Situação | Esforço | Risco |
|---|---|---|---|
| **Assinatura XMLDSig no dialeto do eSocial** | `xml-crypto` existe, mas o default é a C14N **errada** e não emite `X509Data` sozinho | **3–5 dias** | **Alto** — falha silenciosa: assina e é rejeitado. Só valida contra o ambiente real |
| **Cliente SOAP 1.1 Document/Literal** | `soap`/`strong-soap` existem, mas dependem de baixar o WSDL — que **exige mTLS** e é frágil. São só **2 operações** no fluxo principal (+4 no BX) | **3–5 dias** montando o envelope à mão | Médio — recomendação: **não** usar cliente WSDL dinâmico; envelope literal + `undici`/`https.Agent` |
| **Validação XSD local** | Sem validador puro-JS consagrado. `xmllint-wasm`/`libxml2-wasm` (MIT) ou `libxmljs2` (nativo) | **3–5 dias** + spike | **Alto** — os XSDs do eSocial usam `import`; suporte a multi-schema em wasm é o ponto a provar. **Sem isso, todo erro de schema só aparece em produção como `402`** |
| **Tipos TS a partir dos XSD** | **Não existe gerador utilizável** (`cxsd` morto, `xsd2ts` UNLICENSED) | **10–20 dias** para escrever o gerador, ou mapear à mão | **Alto** — é o maior custo escondido. O S-1.3 tem **50 eventos** (contagem conferida contra o XSD em `01-esocial-eventos-e-obrigatoriedade.md`, incluindo os 8 de retorno; a cifra de 44 usada antes nesta linha era órfã) e centenas de campos condicionais |
| **Motor de lote + protocolo + recibo** | Nada pronto | **5–8 dias** | Médio — fila, particionamento por `(empregador, grupo)`, blocos de 50, polling com backoff, reenvio idempotente |
| **Grafo de precedência de eventos** | Nada pronto | **4–6 dias** | Médio-alto — regra de "empilhamento" é de negócio, não de schema |
| **Catálogo de ocorrências + UX de correção** | Importar o *Mensagens do Sistema v2.5* como dado | **3–5 dias** | Médio — sem isso o usuário recebe código cru |
| **Reconciliação via BX** | Nada pronto; e o canal é **duramente limitado** (10 req/dia, 50 eventos, 31 dias) | **4–6 dias** | Médio |
| **Vigilância de NT/NO** | ~1 nota por mês na série S-1.3 em 2026 | **contínuo** | **Alto** — custo permanente, não de projeto |

### 12.3 Números

- **Núcleo de transporte** (assinatura + SOAP + lote/protocolo/recibo + XSD + reconciliação):
  **4 a 7 semanas** de um dev sênior, assumindo acesso imediato à Produção Restrita.
- **Cobertura de eventos**: escopo mínimo de folha CLT — S-1000, S-1005, S-1010, S-1020, S-1070,
  S-2190, S-2200, S-2205, S-2206, S-2230, S-2299, S-1200, S-1210, S-1280, S-1298, S-1299, S-3000
  (**17 eventos**) + parse dos totalizadores S-5001/5002/5003/5011/5012/5013 →
  **6 a 10 semanas** a 0,5–2 dias por evento (mapeamento + regras + testes na Restrita).
- **Total até paridade mínima confiável: 4 a 6 meses de 1 dev sênior dedicado**,
  **sem contar o cálculo da folha** (rubricas, INSS, IRRF, FGTS, férias, 13º, rescisão),
  que é um projeto de porte igual ou maior.
- **Manutenção em regime:** ~1 nota por mês para ler, classificar e, quando for o caso, implementar.

### 12.4 Onde eu desafiaria a decisão

1. **O gargalo não é o transporte, é o leiaute.** O transporte tem 2 operações e cabe em uma
   sprint. Os **eventos com regras condicionais** (50 no S-1.3, dos quais 42 de envio) e o **cálculo da folha** é que consomem meses.
   Se a decisão for "construir", construir **transporte próprio** e ser cirúrgico no escopo de eventos.
2. **Considerar seriamente comprar o transporte.** Existem APIs comerciais brasileiras que expõem
   REST sobre o SOAP do eSocial. Isso reduziria semanas a dias no transporte — ao custo de
   dependência e mensalidade. **PENDÊNCIA P-26:** preços e SLA não pesquisados nesta sessão.
   O ponto para o Fernando decidir é: **a G41 quer ser dona da integração ou dona da folha?**
   O diferencial competitivo está no cálculo e na experiência, não em falar SOAP.
3. **Sequenciamento.** Não faz sentido começar pelo eSocial. A ordem defensável é:
   (a) motor de cálculo da folha validado contra massa real →
   (b) geração dos XMLs S-1.3 validados por XSD **offline** →
   (c) transporte contra a **Produção Restrita** →
   (d) produção com um cliente-piloto.
   Inverter isso (transporte primeiro) produz um canal bonito que não tem o que transmitir.
4. **Risco de licença já mitigado.** As três libs de referência (`sped-esocial` MIT,
   `tst-labs` BSD-3, `libesocial` Apache-2.0) são **permissivas** — dá para estudar e portar
   lógica sem contaminar o produto. As copyleft (`PyeSocial` GPL, `emensageria` AGPL) devem ser
   **evitadas inclusive na leitura** por engenheiros que vão escrever o código equivalente.

---

## 13. Arquitetura recomendada para o Lior (proposta)

```
[UI Folha]  →  [Nitro API]  →  [tabela esocial_eventos]  (estado: RASCUNHO)
                                        ↓
                          [gerador XML + validação XSD local]     (falha aqui = nunca vai à rede)
                                        ↓ ASSINADO
                          [assinador XMLDSig] ← cofre A1 (memória)
                                        ↓
             [particionador: agrupa por (empregador, grupo), respeita precedência, fatia em 50]
                                        ↓
                     [worker Node persistente] --mTLS--> WsEnviarLoteEventos
                                        ↓ protocolo
                     [poller com backoff]      --mTLS--> WsConsultarLoteEventos
                                        ↓
        recibo por evento → grava; ocorrência → mapeia no catálogo v2.5 → tarefa no Kanban G41
                                        ↓
                     [reconciliador BX] (uso parcimonioso: 10 req/dia por empregador)
```

Alinhamentos com as regras do projeto (`CLAUDE.md`):
- **Nada inventado:** regra de leiaute sem confirmação no MOS → evento **não é gerado**, vira pendência.
- **Toda pendência abre tarefa no Kanban** com `X-Idempotency-Key` = `protocolo + Id do evento + código da ocorrência`.
- **Regra vive em dado:** catálogo de ocorrências, tabela de rubricas e mapa de precedência em tabela, não em `if`.
- **Idempotência:** o reenvio de lote é o mecanismo **oficial** de recuperação (§9.1) — usar, não temer.

---

## 14. PENDÊNCIAS

| # | Pendência | Impacto |
|---|---|---|
| **P-00** | **`gov.br` bloqueado no ambiente desta pesquisa.** Todo item [O] veio de extrato de buscador sobre a página/PDF oficial, não de download direto. **Reconferir tudo em máquina com acesso** antes de codar | **Crítico** |
| P-01 | Existência de qualquer canal **REST oficial** do eSocial — não localizado | Alto |
| P-02 | Anúncio oficial de **descontinuação do SOAP** — não localizado | Médio |
| P-03 | Existe **MOD posterior à v1.15** (abr/2025)? Não confirmado | Alto |
| P-04 | Reconferir as **8 URLs** de endpoint no MOD vigente | **Crítico** |
| P-05 | **Versões vigentes dos XSD** do pacote de comunicação em ago/2026 | **Crítico** |
| P-06 | Semântica oficial do atributo `grupo` (1/2/3) | Alto |
| P-07 | `ideEmpregador/nrInsc` = raiz do CNPJ (8 dígitos) — confirmar no MOS | Alto |
| P-08 | `ideTransmissor/nrInsc` deve ser igual ao CNPJ/CPF do certificado — confirmar | Alto |
| P-09 | **Tamanho máximo em bytes** do lote / da mensagem SOAP | Alto |
| P-10 | Regra formal de formação do `Id` do evento (36 caracteres) | Alto |
| P-11 | Tabela **completa** de `cdResposta` | Médio |
| P-12 | EFD-Reinf: manual, endpoints e eventual API REST — **não pesquisado** | Médio |
| P-13 | Intervalo mínimo de polling e política de **throttling** de envio/consulta | Alto |
| P-14 | Nomes exatos das tags de `ocorrencias` no XSD de retorno | Médio |
| P-15 | Confirmação literal de que **o lote não é assinado** (só o evento) | **Crítico** |
| P-16 | **Cadeia ICP-Brasil/SERPRO vigente** em ago/2026 | **Crítico** |
| P-17 | Lista exata dos **serviços de eSocial outorgáveis no e-CAC** (há perfil separado para SST?) | Alto |
| P-18 | A G41 pode ser sempre o transmissor (1 certificado + N procurações)? | Alto — define o produto |
| P-19 | CQC **em lote** voltou a operar? (suspensa desde 16/08/2025) | Médio |
| P-20 | Importar o catálogo completo de ocorrências do *Mensagens do Sistema v2.5* | Alto |
| P-21 | Mecânica de **retificação** (`indRetif`, `nrRecibo`) e de exclusão (S-3000/S-3500) | Alto |
| P-22 | Produção Restrita aceita **certificado de homologação** ou exige A1 ICP-Brasil real? | Médio |
| P-23 | Existe **massa de testes oficial** publicada? Não localizada | Baixo |
| P-24 | Licença de `akretion/esociallib` — **sem LICENSE no repositório** | Baixo |
| P-25 | Licença do **Projeto ACBr** — não verificada | Baixo |
| P-26 | Preço/SLA de **APIs comerciais** de eSocial — não pesquisado | Médio — decisão build vs. buy |

---

## 15. Fontes

**Oficiais (gov.br) — acesso 30/08/2026, via extrato de mecanismo de busca (§0)**
1. Documentação Técnica do eSocial — https://www.gov.br/esocial/pt-br/documentacao-tecnica
2. Versões anteriores da documentação técnica — https://www.gov.br/esocial/pt-br/documentacao-tecnica/versoes-anteriores-da-documentacao-tecnica
3. MOS S-1.3 consolidado até NO S-1.3 nº 11/2026 (retificada) — https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-11-2026-retificada.pdf
4. MOS S-1.3 consolidado até NO nº 10/2026 — https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-10-2026.pdf
5. MOS S-1.3 consolidado até NO nº 07/2026 — https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/mos-s-1-3-consolidada-ate-a-no-s-1-3-07-2026.pdf
6. Manual de Orientação do Desenvolvedor v1.15 (abr/2025) — https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/manualorientacaodesenvolvedoresocialv1-15.pdf
7. Manual de Orientação do Desenvolvedor v1.10 — https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/manualorientacaodesenvolvedoresocialv1-10.pdf
8. Leiautes S-1.3 (NT 06/2026 rev. 09/04/2026) — https://www.gov.br/esocial/pt-br/documentacao-tecnica/leiautes-esocial-versao-s-1-3-nt-06-2026-rev-09-04-2026/index.html
9. NT S-1.3 nº 06/2026 (revisada) — https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/nota-tecnica-s-1-3-06-2026-rev.pdf
10. NT S-1.3 nº 04/2025 (revisada) — https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/nota-tecnica-s-1-3-04-2025-rev.pdf
11. Mensagens do Sistema — Produção v2.5 (abr/2026) — https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/998566-mensagensdosistema-v2-5.pdf
12. Mensagens do Sistema — Produção v2.4 (out/2025) — https://www.gov.br/esocial/pt-br/documentacao-tecnica/manuais/958823-mensagensdosistema-v2-4.pdf
13. Divulgadas novas URL para transmissão dos dados de produção — https://www.gov.br/esocial/pt-br/noticias/divulgadas-novas-url-para-transmissao-dos-dados-de-producao-do-esocial
14. Ambiente de Produção Restrita — https://www.gov.br/esocial/pt-br/acesso-ao-sistema/ambiente-de-producao-restrita
15. Perguntas Frequentes — Produção Empresas e Produção Restrita — https://www.gov.br/esocial/pt-br/acesso-ao-sistema/cronograma-de-implantacao/perguntas-frequentes-producao-empresas-e-producao-restrita
16. Produção Empresas e Ambiente de Testes — https://www.gov.br/esocial/pt-br/empresas/perguntas-frequentes/perguntas-frequentes-producao-empresas-e-ambiente-de-testes
17. Orientações — Procuração Eletrônica e Assinatura Digital — https://www.gov.br/esocial/pt-br/acesso-ao-sistema/orientacoes-assinatura-digital-e-procuracao-eletronica
18. eSocial BX — Baixador de Arquivos — https://www.gov.br/esocial/pt-br/empresas/orientacoes/esocial-bx-baixador-de-arquivos
19. Entra em operação o eSocial BX — https://www.gov.br/esocial/pt-br/noticias/entra-em-operacao-o-esocial-bx-um-baixador-de-arquivos-enviados-ao-sistema
20. Qualificação Cadastral — https://www.gov.br/esocial/pt-br/empresas/consulta-qualificacao-cadastral
21. Suspensão da Consulta da Qualificação Cadastral em lote — https://www.gov.br/esocial/pt-br/noticias/suspensao-da-consulta-da-qualificacao-cadastral-em-lote
22. Erro 301. O que fazer? — https://www.gov.br/esocial/pt-br/noticias/erro-301-o-que-fazer

**Código-fonte e licenças (acesso direto, 30/08/2026)**
23. `qualitaocupacional/libesocial` — https://github.com/qualitaocupacional/libesocial · LICENSE (Apache-2.0), `esocial/__init__.py`, `esocial/client.py`, `esocial/xml.py`, `README.md`
24. `nfephp-org/sped-esocial` — https://github.com/nfephp-org/sped-esocial · LICENSE (MIT/LGPLv3+/GPLv3+), `README.md`, `EVENTOS_S_1_3.md`
25. `tst-labs/esocial` — https://github.com/tst-labs/esocial · LICENSE.md (BSD-3-Clause), `README.md`
26. `TadaSoftware/PyeSocial` — https://github.com/TadaSoftware/PyeSocial · LICENSE (GPL-3.0)
27. `emensageria/emensageria` — https://github.com/emensageria/emensageria · LICENSE (AGPL-3.0)
28. `Samuel-Oliveira/Java-eSocial` — https://github.com/Samuel-Oliveira/Java-eSocial · LICENSE (MIT)
29. `gwmoura/esocial-schema` — https://github.com/gwmoura/esocial-schema · LICENSE (Apache-2.0)
30. npm registry — `registry.npmjs.org` para versão/licença de `xml-crypto`, `xmldsigjs`, `node-forge`, `@xmldom/xmldom`, `xpath`, `xmlbuilder2`, `fast-xml-parser`, `xmllint-wasm`, `libxml2-wasm`, `libxmljs2`, `soap`, `strong-soap`, `cxsd`, `xsd2ts`; e busca `?text=esocial`

**Secundárias (indício, marcadas [V] no texto)**
31. Base de conhecimento Senior — regra `ideTransmissor/nrInsc` = CNPJ/CPF do certificado — https://suporte.senior.com.br/hc/pt-br/articles/4408640947348
32. Central de Atendimento TOTVS — rejeição "Assinante inválido / sem perfil de procuração eletrônica" — https://centraldeatendimento.totvs.com/hc/pt-br/articles/11543005515415
33. TecnoSpeed — Procuração Eletrônica e eventos SST — https://blog.tecnospeed.com.br/procuracao-eletronica-esocial/

---

*Insights Impulsionam.*
