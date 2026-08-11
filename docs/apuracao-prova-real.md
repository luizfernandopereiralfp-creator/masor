# Apuração / Prova Real — Masor (blueprint)

> Módulo que, a partir das **NF-e de entrada** (créditos) + **cupons de saída**
> (NFC-e mod. 65 / SAT CF-e mod. 59), calcula o **imposto correto a recolher por
> competência** e concilia contra o sistema contábil/SPED. Derivado de pesquisa em
> 11/08/2026. Itens "(não confirmado)" precisam de checagem. Alinha com o
> anti-invenção: nada entra sem base legal; conciliar item a item, nunca por total.

## Princípio transversal
Apuração é **mensal, por CNPJ/estabelecimento**, e depende de 4 chaves fiscais **por item** (entrada E saída): **CST/CSOSN de ICMS, CST de PIS, CST de COFINS, CFOP + origem + NCM**. Sem persistir isso item a item não há como segregar ST/monofásico — e o cálculo sai errado.

## 1. ICMS — conta gráfica (não-cumulatividade)
`débitos das saídas − créditos das entradas = saldo` (devedor recolhe / credor transporta). Base: CF art. 155 §2º; LC 87/1996 (Kandir) arts. 19–25.
- Crédito de entrada = `vICMS` do item quando a entrada foi tributada (revenda).
- **Vedado creditar**: entrada com **ST retida** (CST 60 / CSOSN 500), entrada sem imposto (isenção/alíq. zero), saída que será isenta/não tributada.
- **ST fica FORA da conta gráfica**: CST com ST (`10/30/60/70`, CSOSN `500`) → sem débito na saída e sem crédito na entrada. Só entram CST `00`/`20` e assemelhados.
- **FCP** apura-se **em separado** (varia por UF — *não confirmado* nacional).
- SPED Fiscal (EFD ICMS/IPI): itens em **C100/C170/C190**; apuração em **E100/E110** (próprio) e **E200/E210** (ST); ajustes **E111**. Guia: http://sped.rfb.gov.br/pasta/show/1573
- **Prova real ICMS = reproduzir o E110.**

## 2. PIS/COFINS
- **Lucro Real (não-cumulativo)** — PIS 1,65% + COFINS 7,6% (Leis 10.637/2002 e 10.833/2003). Crédito sobre revenda **tributada**, energia, aluguel PJ, frete de venda. **Vedado crédito** sobre revenda **monofásica/ST/alíquota zero** (art. 3º, I, "b") — erro clássico do varejo.
- **Monofásico** (Lei 10.147/2000 + bebidas Lei 13.097/2015, combustíveis, autopeças): varejo revende com **alíquota zero na saída** (sem débito) e **sem crédito na entrada**. CST saída = **04**.
- **Cesta básica / alíquota zero** (Lei 10.925/2004): saída sem débito, CST **06**.
- **Lucro Presumido (cumulativo)** — PIS 0,65% + COFINS 3% sobre receita, sem crédito; ainda exige segregar monofásico/ST/zero.
- CST de PIS/COFINS (Tabelas 4.3.3/4.3.4): 01/02 tributado; 04 monofásico revenda; 05 ST; 06 alíq. zero; 07 isenta; 08 sem incidência; 09 suspensão; 50–66 créditos. Monofásico por NCM: **Tabela 4.3.10/4.3.11** (http://sped.rfb.gov.br/arquivo/show/1638).
- EFD-Contribuições: itens no **Bloco C** (C170/C175/C400/C405 cupons); apuração **M100/M200** (PIS), **M500/M600** (COFINS). Guia: http://sped.rfb.gov.br/pagina/show/3026
- **Prova real PIS/COFINS = reproduzir M200/M600.**

## 3. Simples Nacional
Sem conta gráfica: DAS sobre receita bruta (Anexo I comércio), PGDAS-D. LC 123/2006 + **Res. CGSN 140/2018 art. 25**: **segregar receitas** e **abater** a parcela de ICMS (ST) e de PIS+COFINS (monofásico/zero) da alíquota efetiva — senão paga em dobro. Precisa da **mesma classificação por item**.

## 4. Documentos de SAÍDA (parsear)
- **NFC-e (mod. 65)**: mesmo schema da NF-e (`nfeProc>NFe>infNFe>det>{prod,imposto}`). Reusa o `parse-nfe.ts`. Portal NF-e (MOC/schemas).
- **SAT CF-e (mod. 59, SP)**: `CFe>infCFe>det>{prod,imposto}` (Portaria CAT 147/2012 / ER-SAT — *versão vigente não confirmada*). Precisa de parser próprio (raiz `CFe`, tag `Orig`/`CST` com capitalização distinta).
- Campos por item p/ apuração: `CST/CSOSN` ICMS, `CST` PIS, `CST` COFINS, `orig`, `CFOP`, `NCM`, `vProd`, `vBC`, `vICMS`, `vPIS`, `vCOFINS`, `vFCP`.

## 5. Prova real / conciliação
Por competência, com **quebra por CST e CFOP** (não só totais): débito ICMS (saídas) vs E110 vs contábil; crédito ICMS (entradas) vs E110; saldo vs guia (GARE/DARE); PIS/COFINS débito/crédito vs M200/M600; receita total vs contábil vs declarada. Ideal: importar o **TXT do SPED gerado** e comparar E110/M200/M600 linha a linha.

**Alertas que o módulo deve emitir (riscos do varejo alimentar):**
- crédito indevido de ICMS-ST (creditar CST 60/CSOSN 500);
- crédito indevido de PIS/COFINS sobre revenda monofásica/alíquota zero;
- **receita monofásica não segregada** → PIS/COFINS pago em dobro;
- CFOP incorreto (5.405 ST vs 5.102 tributada);
- NCM desatualizado vs Tabela 4.3.10.

## 6. Reforma (horizonte, rodar EM PARALELO 2026–2032)
IBS/CBS: não-cumulatividade **ampla** (crédito financeiro), débito/crédito, **split payment** (crédito do adquirente materializa quando o débito é extinto). LC 214/2025. 2026 ano-teste (CBS 0,9%+IBS 0,1% informativos); 2027 fim de PIS/COFINS e do monofásico; 2033 fim de ICMS/ST. Cesta Básica Nacional alíquota zero. **Modelo precisa suportar dois regimes simultâneos.**

## 7. Modelo de dados (Supabase — Fase 4)
- `empresa_estabelecimento` (CNPJ, UF, regime) · `periodo_apuracao` (empresa, ano, mês, status).
- `documento_fiscal` (tipo entrada/saída, modelo 55/65/59, chave, datas, totais, FK período).
- `documento_item` (**ncm, cfop, orig, cst_csosn_icms, cst_pis, cst_cofins**, qtd, vProd, vBC/vICMS/vFCP, vBC/vPIS, vBC/vCOFINS) — grão que sustenta tudo.
- `classificacao_tributaria_sku` (derivada/cacheada: tem_st, monofasico, cesta_basica, aliquota_icms) — fonte dos alertas.
- `apuracao_icms` / `apuracao_pis` / `apuracao_cofins` (débitos, créditos, ajustes, saldo) espelhando E110/M200/M600 · `apuracao_simples` (receita segregada, RBT12, DAS).
- `conciliacao` (valor_calculado, valor_sped, valor_contabil, valor_guia, divergência, status) — a "prova real".
- `alerta_fiscal` (item/doc/período, tipo_risco, severidade).
Arquitetura: `tem_st`/`monofasico` como **coluna de 1ª classe** (não recalcular no fechamento); **snapshot versionado** das tabelas oficiais (4.3.3/4.3.4/4.3.10/cesta) por vigência; **motor de apuração plugável por regime** + motor IBS/CBS paralelo.

## Não confirmado
- Alíquota cheia CBS 2027 (~8,8%) e IBS de referência — estimativas.
- FCP: % e produtos variam por UF (lei estadual).
- Versão vigente do ER-SAT/Portaria CAT do SAT CF-e.
