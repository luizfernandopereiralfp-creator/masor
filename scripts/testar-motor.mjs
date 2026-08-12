import { calcularFiscal } from "../.test-build/ia/motor-fiscal.js";

/* ============================================================
   Regressão do motor determinístico.
   CASO-ÂNCORA (travado): shampoo, fornecedor Sul -> supermercado SP,
   Lucro Real, monofásico, sem ST, margem 20% s/ venda
   => custo líquido 4,74 e preço mínimo 7,65.
   Se este teste falhar, a aritmética fiscal regrediu.
   ============================================================ */

let falhas = 0;
const ok = (nome, cond, extra = "") => {
  console.log(`${cond ? "✅" : "❌"} ${nome}${extra ? " — " + extra : ""}`);
  if (!cond) falhas++;
};
const perto = (a, b, tol = 0.005) => a != null && Math.abs(a - b) <= tol;

const base = {
  custo_nf: 5.39,
  ipi: 0,
  frete: 0,
  descontos: 0,
  origem: "sul_sudeste",
  finalidade: "revenda",
  regime_empresa: "lucro_real",
  regime_fornecedor: "normal",
  credito_simples_pct: 0,
  st_retida: false,
  consta_lista_st: false,
  pis_cofins: "monofasico",
  markup_pct: 20,
  tipo_margem: "venda",
  das_efetivo_pct: 4,
  params: {
    aliq_interna_destino: 18,
    regiao_destino: "sul_sudeste",
    sujeito_st: false,
    monofasico: true,
    aliquota_zero_pc: false,
    reducao_base_icms_pct: null,
    antecipacao_st: null,
    mva_pct: null,
    equalizacao_simples: null,
  },
};

// ---------- caso-âncora ----------
const a = calcularFiscal(base);
ok("âncora: preço mínimo 7,65", perto(a.preco_venda_sugerido, 7.65), "PV=" + a.preco_venda_sugerido?.toFixed(2));
ok("âncora: custo líquido 4,74", perto(a.custo_tributario_liquido, 4.74), "custo=" + a.custo_tributario_liquido?.toFixed(2));
ok("âncora: crédito 12% = 0,65", perto(a.creditos_tributarios, 0.6468, 0.01), "cred=" + a.creditos_tributarios?.toFixed(2));

// ---------- Res. Senado 22/1989: alíquota por PAR origem→destino ----------
const cred = (e) => calcularFiscal(e).creditos_tributarios;
const comOrigem = (origem, destino) => ({ ...base, origem, params: { ...base.params, regiao_destino: destino } });

ok("Sul/Sudeste → N/NE/CO/ES = 7%", perto(cred(comOrigem("sul_sudeste", "n_ne_co_es")), 5.39 * 0.07, 0.01));
ok("Sul/Sudeste → Sul/Sudeste = 12%", perto(cred(comOrigem("sul_sudeste", "sul_sudeste")), 5.39 * 0.12, 0.01));
ok(
  "N/NE → N/NE = 12% (bug antigo dava 7%)",
  perto(cred(comOrigem("n_ne_co_es", "n_ne_co_es")), 5.39 * 0.12, 0.01),
  "cred=" + cred(comOrigem("n_ne_co_es", "n_ne_co_es")).toFixed(3),
);
ok("importado = 4% (Res. 13/2012)", perto(cred({ ...base, origem: "importado" }), 5.39 * 0.04, 0.01));
ok("interna usa a alíquota interna (18%)", perto(cred({ ...base, origem: "interna" }), 5.39 * 0.18, 0.01));

// ---------- postura conservadora quando a região não é confirmada ----------
const semRegiao = calcularFiscal(comOrigem("sul_sudeste", null));
ok("região não confirmada → 7% (conservador)", perto(semRegiao.creditos_tributarios, 5.39 * 0.07, 0.01));
ok(
  "região não confirmada gera pendência",
  semRegiao.pendencias.some((p) => /região/i.test(p.campo)),
);

// ---------- anti-invenção: alíquota interna nula vira pendência ----------
const semInterna = calcularFiscal({ ...base, params: { ...base.params, aliq_interna_destino: null } });
ok(
  "alíquota interna nula gera pendência",
  semInterna.pendencias.some((p) => /interna/i.test(p.campo)),
);
ok("motor marca provisório sem parâmetro confirmado", semInterna.provisorio === true);

// ---------- monofásico não gera crédito de PIS/COFINS ----------
const normal = calcularFiscal({ ...base, pis_cofins: "normal", params: { ...base.params, monofasico: false } });
ok("PIS/COFINS normal credita mais que monofásico", normal.creditos_tributarios > a.creditos_tributarios);

console.log(falhas === 0 ? "\n🟢 MOTOR OK" : `\n🔴 ${falhas} FALHA(S) NO MOTOR`);
process.exit(falhas ? 1 : 0);
