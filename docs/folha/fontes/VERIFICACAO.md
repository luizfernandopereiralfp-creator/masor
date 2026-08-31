# Fontes primárias — registro de download

> Baixadas em **30/08/2026**, de máquina com acesso aberto, depois que o ambiente anterior
> tinha o egresso para `*.gov.br` bloqueado por política de rede. Este arquivo é o lastro:
> nome, tamanho e SHA-256 de cada arquivo, e o que cada um resolveu.

## Arquivos

| Arquivo | Bytes | SHA-256 |
|---|---:|---|
| `Decreto-12797-2025-salario-minimo.html` | 10.327 | `07750ecb547dfa58dd0a30a2387c553760273fbf59f41aa087b0af1116b6d68c` |
| `IN-RFB-2299-2025.html` | 2.640 | `f6a0f3dadca1d47ead9a4a25e1bc2e298f9fe804bd44891a4cb786ef26384204` |
| `Lei-15270-2025.html` | 74.348 | `2ec45edfc7abac45db2118feb219c94d2310600fb43b8a1054cfd2278ece16b9` |
| `MOD-v1.15.pdf` | 1.427.873 | `02ff1f782ec8e316204909f3175199e6344a1407bfacc31618720154e97cbc10` |
| `MOS-S-1.3-NO-11-2026-retificada.pdf` | 3.556.967 | `86286efa156fc293e32cbba9653d4750bb570b01705485695bd4648db3caccfd` |
| `NT-S-1.3-06-2026-rev.pdf` | 262.107 | `5e155584dda8eed29e65ae0a6c89e5ce179f384849b6fe0f6bb8654465f17498` |
| `Portaria-MTE-1131-2025-multas.pdf` | 126.395 | `4bad482db9d495a78c4086e6a438f37af30228a1421e0aede8f344ede1cb1d7f` |
| `Portaria-MTP-667-2021-compilada.pdf` | 1.086.243 | `e706f444b32c5fe3e729feb88078c2aaf964af28ff5174a25e1363d75eef32c1` |
| `esquemas-xsd-2026-07-01.zip` | 237.080 | `32535dba33d0470cf44afce410840af450028fd32d3ddf9123f601c45cf9af8e` |

Origens: portal do eSocial, seção Documentação Técnica
(`https://www.gov.br/esocial/pt-br/documentacao-tecnica`); e Planalto
(`https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/L15270.htm`).

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

### B1 — a variável do redutor do IRRF: **rendimento tributável do mês**

A **Lei 15.270/2025** foi baixada e lida. O art. 3º-A que ela insere na Lei 9.250/1995 não usa
o termo "RBM": a variável é **"rendimentos tributáveis sujeitos à incidência mensal"** —
portanto o tributável do mês, **antes** das deduções de INSS e dependentes, e não a base de
cálculo.

A aritmética confirma. Com R$ 5.000 de rendimento tributável, o imposto pela simplificada é
`(5.000 − 607,20) × 22,5% − 675,49 = 312,89` e o redutor é
`978,62 − 0,133145 × 5.000 = 312,895`, limitado ao imposto pelo §1º. Resultado: **IRRF zero**,
exatamente a promessa da tabela. Se a variável fosse a base após o INSS, a isenção de
R$ 5.000 recairia sobre outra faixa e a conta não fecharia no centavo.

**Consequência: a massa de teste do documento 08 não muda.** Ela usou o bruto, que é a leitura
correta. Era a pendência de maior risco do projeto e ela se resolve sem retrabalho.

Também confirmados: a redução é limitada ao imposto (§1º), zera acima de R$ 7.350,00 (§2º) e
**se aplica ao 13º** (§3º). E a lei institui, no art. 11-A, a redução **anual** a partir do
ano-calendário 2026, que não estava mapeada em documento nenhum.

**Não obtida:** a IN RFB 2.299/2025 — o portal de normas da Receita é aplicação de página
única e a leitura pelo servidor devolve só o esqueleto. Não é impeditivo: a lei é fonte
primária e hierarquicamente superior.

### C2 — valores das multas do eSocial: **confirmados, e eu tinha errado ao rebaixá-los**

A **Portaria MTE 1.131/2025** foi baixada e lida. O art. 81 que ela dá à Portaria MTP
667/2021 traz, literalmente:

> "ficará sujeito à multa no valor **mínimo de R$ 443,97** (…), acrescida de **R$ 104,31**
> (…) **por trabalhador** cuja (…) § 1º O valor **máximo** das multas previstas neste artigo
> é de **R$ 44.396,84**"

São exatamente os valores que o documento `04` publicava. **Eu os havia rebaixado a
pendência por excesso de cautela** — a auditoria interna apontou o conflito com o documento
`01`, que proibia reproduzir número de multa sem abrir a portaria, e eu resolvi o conflito
para o lado errado. Restaurados como confirmados.

A mesma portaria também fecha pendências que estavam abertas no documento `04`:

| Infração | Valor | Base |
|---|---|---|
| **13º salário fora do prazo** | R$ 176,03 por trabalhador, dobrado na reincidência | Lei 4.090/1962 c/c Lei 4.749/1965 |
| Atraso no pagamento de salário | R$ 176,03 por trabalhador prejudicado | CLT art. 459, §1º |
| Verbas rescisórias fora do prazo | R$ 176,03 por empregado prejudicado | CLT art. 477, §§ 6º e 8º |
| Trabalho do menor e do aprendiz | R$ 416,18 por menor, teto R$ 2.080,90 | CLT arts. 402 a 441 |
| Contrato individual de trabalho | R$ 416,18, dobrado na reincidência | CLT arts. 442 a 508 |

A multa do **13º fora do prazo** era a pendência P-23 do documento `04`, sem resposta até
aqui. As multas dos arts. 47 e 47-A da CLT (empregado sem registro) **não** aparecem nesta
portaria — os valores divergentes entre os documentos `04` e `06` continuam por confirmar.

### D1 — salário mínimo: **e a auditoria interna errou**

O **Decreto 12.797/2025** foi baixado e lido. O art. 1º fixa **R$ 1.621,00** a partir de
1º/01/2026, e o parágrafo único fixa **expressamente** o valor **diário em R$ 54,04** e o
**horário em R$ 7,37**.

Isso corrige um apontamento da auditoria interna, que classificou o R$ 54,04 do documento
`03` como erro de arredondamento, porque 1.621,00 ÷ 30 = 54,0333 e a regra half-up daria
54,03. **O valor não é derivado: é decretado.** O documento `03` estava certo; a auditoria
estava errada nesse item.

Fica a lição para o motor: **valor-dia e valor-hora do salário mínimo são parâmetros
próprios, lidos do decreto — não podem ser calculados a partir do mensal.**

## O que ainda falta baixar

`sped.rfb.gov.br` não conectou nesta rodada. Os itens dos blocos B, C, D e E da
`FONTES-A-BAIXAR.md` seguem pendentes.
