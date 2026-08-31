# Fontes primárias — registro de download

> Baixadas em **30/08/2026**, de máquina com acesso aberto, depois que o ambiente anterior
> tinha o egresso para `*.gov.br` bloqueado por política de rede. Este arquivo é o lastro:
> nome, tamanho e SHA-256 de cada arquivo, e o que cada um resolveu.

## Arquivos

| Arquivo | Bytes | SHA-256 |
|---|---:|---|
| `MOD-v1.15.pdf` | 1.427.873 | `02ff1f782ec8e316204909f3175199e6344a1407bfacc31618720154e97cbc10` |
| `MOS-S-1.3-NO-11-2026-retificada.pdf` | 3.556.967 | `86286efa156fc293e32cbba9653d4750bb570b01705485695bd4648db3caccfd` |
| `NT-S-1.3-06-2026-rev.pdf` | 262.107 | `5e155584dda8eed29e65ae0a6c89e5ce179f384849b6fe0f6bb8654465f17498` |
| `esquemas-xsd-2026-07-01.zip` | 237.080 | `32535dba33d0470cf44afce410840af450028fd32d3ddf9123f601c45cf9af8e` |

Origem: portal do eSocial, seção Documentação Técnica
(`https://www.gov.br/esocial/pt-br/documentacao-tecnica`).

## O que ficou resolvido

### F1 — existe API REST oficial do eSocial? **NÃO.**

O **Manual de Orientação do Desenvolvedor v1.15**, 125 páginas, não contém **uma única
menção** a `REST`, `JSON` ou `Bearer`. Todos os endpoints são web services SOAP.

Isso encerra a contradição entre `02-esocial-integracao-tecnica.md` (que dizia não existir)
e `05-construir-x-comprar-e-fornecedores.md` (que dizia existir). **O documento 02 estava
certo; o 05 estava errado.**

### Versão do SOAP — **1.2**, e o documento 02 errou

O envelope do MOD declara `xmlns:soap="http://www.w3.org/2003/05/soap-envelope"`, que é
**SOAP 1.2**. E não há `SOAPAction` em parte alguma do manual — coerente, porque
`SOAPAction` é cabeçalho de SOAP 1.1.

O documento 02 afirmava SOAP 1.1 com `SOAPAction`. Consequência prática: o
`soapPost` que já existia no módulo fiscal do Masor **serviria ao eSocial sem alteração**.
A extração para `src/lib/transporte/mtls.ts` continua válida como organização de código,
mas a justificativa registrada no commit e no documento 13 estava errada e foi corrigida.

### Limites do lote — confirmados

| Limite | Valor | Onde |
|---|---|---|
| Eventos por lote | **50** | campo `evento` repetível até 50 vezes; rejeição **607** se exceder |
| Tamanho da mensagem SOAP | **5 MB** | rejeição **11** com a observação do limite |
| Retorno de consulta | **50 primeiros** eventos, paginando por `dhUltimoEvtRetornado` | seção de consulta |

Fecha as pendências de tamanho de lote do documento 02 e a contradição C-08.

### Endpoints — confirmados

| Serviço | URL |
|---|---|
| Envio | `https://webservices.envio.esocial.gov.br/servicos/empregador/` |
| Consulta | `https://webservices.consulta.esocial.gov.br/servicos/empregador/` |
| Download | `https://webservices.download.esocial.gov.br/` |
| Produção restrita | `https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/` |

### Assinatura — o documento 02 estava certo

Canonicalização **inclusiva** (`http://www.w3.org/TR/2001/REC-xml-c14n-20010315`), assinatura
**enveloped**, SHA-256, cadeia ICP-Brasil. É a diferença em relação à NF-e que o documento 02
já apontava, e ela se confirma.

### Versões vigentes — três documentos estavam desatualizados

| Item | Vigente (confirmado na listagem oficial) | Quem errava |
|---|---|---|
| MOS | consolidado até a **NO S-1.3 11/2026 retificada** | 04, 05 e 06 diziam NO 07/2026 |
| Leiaute | **S-1.3, NT 06/2026 rev. 09/04/2026** | 03 dizia NT 04/2025 |
| Pacote de XSD | **01/07/2026** | o documento 09 usou um snapshot de 13/02/2026 |

O pacote de XSD de julho é mais novo que o usado para montar o catálogo de rubricas — a
pendência bloqueadora P09-1 continua aberta até o catálogo ser reconferido contra ele.

## O que ainda falta baixar

`sped.rfb.gov.br` não conectou nesta rodada. Os itens dos blocos B, C, D e E da
`FONTES-A-BAIXAR.md` seguem pendentes.
