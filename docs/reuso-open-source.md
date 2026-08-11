# Reuso de código open-source — Masor

> Repos verificados via API do GitHub (licença, linguagem, atividade) em 11/08/2026.
> Uso: **[DEP]** dependência npm · **[DATASET]** importar dados · **[REF]** só referência
> (reescrever). **Não incorporar nada com "licença não confirmada" sem checar o LICENSE.**

## Recomendação de reuso imediato (stack TS/Supabase)
1. **vilsonneto/tributos-br** (TS, **MIT**) — ICMS/ST(5 cenários)/DIFAL(3 modos)/FCP(8 UFs)/IPI/PIS-COFINS + CBS-IBS básico. **NÃO cobre monofásico/isenção/alíq. zero** (o nosso `motor-fiscal.ts` cobre). Complementar ao nosso motor para ampliar ST/DIFAL/FCP. **[DEP]** https://github.com/vilsonneto/tributos-br
2. **lucashpmelo/node-mde** (JS, **MIT**) — consome **NFeDistribuiçãoDFe** + manifestação, com **certificado A1**. Melhor opção p/ a captura da Fase 8. **[DEP]** https://github.com/lucashpmelo/node-mde
3. **djalmaoliveira/djf-nfe** (JS, **MIT**) — parser de XML de NF-e (`det/prod/imposto`). Alternativa/validação do nosso `parse-nfe.ts`. **[DEP/REF]** https://github.com/djalmaoliveira/djf-nfe
4. **luizinhoh2o1/tabelas-ibpt** (TS, **Apache-2.0**) — IBPT por NCM/UF em JSON versionado. **[DATASET]** https://github.com/luizinhoh2o1/tabelas-ibpt
5. **DeHor-Labs/mcp-fiscal-brasil** (Python, **MIT**) — tabelas offline **NCM/TIPI/CFOP/CST/CEST**. **[DATASET/REF]** https://github.com/DeHor-Labs/mcp-fiscal-brasil

## Referências (lógica; portar/checar licença)
- **sacfiscal/FiscalNet** (C#, Apache-2.0) — ICMS/ST/IPI/PIS/COFINS. **[REF]**
- **akretion/nfelib** (Python, MIT) — bindings dos XSD oficiais NF-e 55/65. Abordagem "gerar do schema" vale copiar. **[REF]**
- **base4sistemas/satcfe** (Python, Apache-2.0) — estrutura do **SAT CF-e mod 59**. **[REF]** (não há parser CF-e maduro em TS).
- **nfephp-org/sped-efd** (PHP, licença NOASSERTION) — geração SPED EFD (E110, M200/M600). **[REF]**, checar licença.
- **akretion/sped-extractor** (Python) — modela layouts do SPED. **[REF]**

## Evitar / sinalizado
- **nfewizard-org/nfewizard-io** (TS) — mais completo p/ SEFAZ/DFe, mas **GPL-3.0 (copyleft)** → **incompatível com produto comercial fechado**. Só como [REF] ou se aceitar abrir o código.
- **Licença não confirmada — não usar sem verificar:** `kalmonv/node-sped-nfe`, `facitysistemas/OpenFiscal`, `flaviosoliver/nfe-danfe-pdf`, `nfe/ibpt`, `nfephp-org/*`, `andre-djsystem/CalculadoraRTC`.
- **serpro-brasil/RTC-CALC** — só README, sem código/licença. A Calculadora RTC oficial é **baixada do portal da Receita**, não é npm. Embarcar o componente oficial quando precisar de conformidade IBS/CBS plena.

## Lacunas sem solução open-source pronta (trabalho de dados próprio)
- **Monofásico (SPED 4.3.10/4.3.11)** — extrair de `sped.rfb.gov.br` e versionar (crítico p/ supermercado).
- **Apuração/geração SPED em TS** — não existe lib madura; construir (ver `docs/apuracao-prova-real.md`).
- **Parser SAT CF-e (mod 59) em TS** — construir (ref: base4sistemas/satcfe).
- **GTIN→NCM aberto** — não existe dataset livre; **gerar o próprio a partir dos XMLs capturados** (cada NF-e/NFC-e traz GTIN+NCM no `det/prod`) ou API comercial (Bluesoft Cosmos, GS1).

## Decisões para o Masor
- Manter `motor-fiscal.ts` (cobre monofásico e bate no caso-âncora); avaliar `tributos-br` como **[DEP]** para ampliar ST/DIFAL/FCP.
- Fase 8: usar **node-mde** para a captura A1/DistribuiçãoDFe.
- Construir a **base de monofásico** a partir da Tabela 4.3.10 e gerar **GTIN→NCM** do fluxo de captura.
