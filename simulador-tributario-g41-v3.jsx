import { useState, useMemo, useEffect, useRef } from "react";

/* ============================================================
   G41 — Simulador Tributário de Produto · v3
   v3: IA como motor de cadastro (sem botões de validação)
   · Cadastrar UF = informar a sigla → a IA PESQUISA a legislação
     vigente (web search) e preenche a tabela automaticamente
   · REGRA DE OURO: nada é inventado — campo não confirmado pela
     pesquisa volta como null, vira pendência visível e o simulador
     trata a UF como provisória
   · Validação do produto é AUTOMÁTICA (debounce ao preencher NCM)
   · Cada UF guarda: base legal, fontes (URLs) e data da pesquisa,
     com ação de re-pesquisa (legislação muda)
   Identidade: navy #0B1740 · âmbar #E9A74A · branco · zero vermelho
   ============================================================ */

const NAVY = "#0B1740";
const AMBER = "#E9A74A";
const NAVY05 = "#F4F5F9";
const NAVY15 = "#DDE1EC";
const NAVY40 = "#9AA2BC";
const AMBER10 = "#FCF3E3";
const AMBER25 = "#F6E3C4";
const MONO = "'IBM Plex Mono', monospace";
const CFG_KEY = "g41-tax-config-v3";

const CONFIG_PADRAO = {
  versao: 3,
  estados: [
    {
      sigla: "SP",
      nome: "São Paulo",
      regiao: "sul_sudeste",
      aliqInterna: 18,
      equalizacaoSimples: true,
      antecipacaoST: true,
      baseLegal:
        "RICMS/SP art. 426-A (antecipação); art. 2º, XVI (equalização Simples); Portaria SRE 94/2025 (fim da ST de perfumaria/higiene desde 01/04/2026).",
      fontes: [],
      pendencias: [],
      pesquisadoEm: "2026-07-16",
      origemDados: "curadoria G41",
      ativo: true,
    },
  ],
  camposExtras: [],
};

const brl = (v) =>
  (isFinite(v) ? v : 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
const pct = (v) =>
  (v * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + "%";
const num = (s) => {
  if (typeof s === "number") return s;
  const n = parseFloat(String(s).replace(/\./g, "").replace(",", "."));
  return isNaN(n) ? 0 : n;
};
const hoje = () => new Date().toISOString().slice(0, 10);
const dataBR = (iso) => (iso ? iso.split("-").reverse().join("/") : "—");

/* ---------- chamada única à IA (produção: webhook n8n) ---------- */
async function chamarIA(prompt) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
      tools: [{ type: "web_search_20250305", name: "web_search" }],
    }),
  });
  const data = await resp.json();
  const texto = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  const limpo = texto.replace(/```json|```/g, "").trim();
  const ini = limpo.indexOf("{");
  const fim = limpo.lastIndexOf("}");
  return JSON.parse(limpo.slice(ini, fim + 1));
}

/* prompt de pesquisa de legislação por UF — anti-invenção */
function promptPesquisaUF(sigla) {
  return `Você é o pesquisador de legislação tributária da G41 Inteligência Contábil (Brasil). Pesquise NA WEB a legislação de ICMS VIGENTE HOJE do estado brasileiro de sigla "${sigla}" e responda APENAS com JSON válido, sem markdown.

REGRAS INEGOCIÁVEIS:
1. NUNCA invente ou estime. Cada campo só pode ser preenchido se uma fonte confiável encontrada na busca o confirmar (site da SEFAZ do estado, RICMS, portais tributários especializados).
2. Se a busca NÃO confirmar um campo, retorne null nesse campo e explique em "pendencias".
3. Para cada campo confirmado, inclua a URL da fonte em "fontes".
4. Priorize normas de 2025-2026 — regimes de ST e alíquotas mudaram recentemente em vários estados.

O que pesquisar:
- "aliq_interna_padrao": alíquota modal/padrão interna de ICMS do estado (número, em %). Atenção: vários estados majoraram a alíquota padrão em 2023-2025.
- "regiao": "n_ne_co_es" se o estado for do Norte, Nordeste, Centro-Oeste ou o Espírito Santo (recebe 7% nas entradas interestaduais); senão "sul_sudeste" (recebe 12%).
- "equalizacao_simples": true/false — o estado exige recolhimento de diferencial/equalização de alíquota na ENTRADA interestadual de mercadoria para REVENDA quando o adquirente é do Simples Nacional?
- "antecipacao_st": true/false — o estado exige recolhimento antecipado (tipo art. 426-A do RICMS/SP) na entrada de mercadoria sujeita a ST vinda sem retenção de estado sem convênio/protocolo?
- "base_legal": citação curta dos dispositivos (RICMS, artigos, decretos) que fundamentam cada resposta.

FORMATO EXATO:
{"sigla":"${sigla}","nome":"nome do estado","regiao":"sul_sudeste"|"n_ne_co_es","aliq_interna_padrao":numero|null,"equalizacao_simples":true|false|null,"antecipacao_st":true|false|null,"base_legal":"...","fontes":[{"campo":"...","url":"..."}],"pendencias":["campo X não confirmado porque ..."]}`;
}

/* prompt de validação automática do produto */
function promptValidacaoProduto(payload) {
  return `Você é o validador fiscal automático da G41 Inteligência Contábil (Brasil). Analise o cadastro de produto abaixo e, SE NECESSÁRIO, pesquise na web a legislação vigente (NCM, ST na UF de destino, PIS/COFINS monofásico Lei 10.147/2000, alíquota zero cesta básica, alíquota interna).

DADOS: ${JSON.stringify(payload)}

REGRA INEGOCIÁVEL: nunca afirme nada que a busca não confirme. Na dúvida, classifique como "pendente" e explique.

Verifique: (1) o NCM existe e é plausível para a descrição; (2) o enquadramento de PIS/COFINS marcado é compatível com o NCM; (3) sujeição a ST na UF de destino vs. o que foi marcado; (4) alíquota interna plausível para o NCM nessa UF; (5) campos ausentes/contraditórios.

RESPONDA APENAS com JSON válido, sem markdown:
{"status":"aprovado"|"aprovado_com_ressalvas"|"pendente","resumo":"1 frase","achados":[{"campo":"...","nivel":"info"|"atencao","mensagem":"pt-BR, para empresário leigo"}]}`;
}

/* ---------- UI base (idêntica à v2) ---------- */
function Bloco({ n, titulo, sub, children, acao }) {
  return (
    <section className="rounded-lg bg-white" style={{ border: `1px solid ${NAVY15}` }}>
      <header className="flex items-center justify-between gap-3 px-5 py-3" style={{ borderBottom: `1px solid ${NAVY15}` }}>
        <div className="flex items-baseline gap-3">
          <span className="text-xs font-bold tracking-widest" style={{ color: AMBER, fontFamily: MONO }}>{n}</span>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: NAVY }}>{titulo}</h2>
            {sub && <p className="text-xs mt-0.5" style={{ color: NAVY40 }}>{sub}</p>}
          </div>
        </div>
        {acao}
      </header>
      <div className="px-5 py-4 grid gap-4">{children}</div>
    </section>
  );
}
function Campo({ label, hint, children }) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: NAVY }}>{label}</span>
      {children}
      {hint && <span className="text-[11px] leading-snug" style={{ color: NAVY40 }}>{hint}</span>}
    </label>
  );
}
const inputCss = { border: `1px solid ${NAVY15}`, color: NAVY, outline: "none" };
function Texto({ value, onChange, placeholder, mono }) {
  return (
    <input type="text" inputMode="decimal" value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md px-3 py-2 text-sm w-full"
      style={{ ...inputCss, fontFamily: mono ? MONO : undefined }}
      onFocus={(e) => (e.target.style.borderColor = AMBER)}
      onBlur={(e) => (e.target.style.borderColor = NAVY15)} />
  );
}
function Sel({ value, onChange, opts }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="rounded-md px-3 py-2 text-sm w-full bg-white" style={inputCss}>
      {opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
    </select>
  );
}
function Alternar({ value, onChange, opts }) {
  return (
    <div className="inline-flex rounded-md overflow-hidden" style={{ border: `1px solid ${NAVY15}` }}>
      {opts.map(([v, t]) => (
        <button key={v} type="button" onClick={() => onChange(v)}
          className="px-3 py-1.5 text-xs font-semibold transition-colors"
          style={value === v ? { background: NAVY, color: "#fff" } : { background: "#fff", color: NAVY }}>
          {t}
        </button>
      ))}
    </div>
  );
}
function Alerta({ nivel, children }) {
  const forte = nivel === "atencao";
  return (
    <div className="rounded-md px-3 py-2 text-xs leading-relaxed flex gap-2"
      style={{ background: forte ? AMBER25 : AMBER10, border: `1px solid ${forte ? AMBER : AMBER25}`, color: NAVY }}>
      <span className="font-bold" style={{ color: forte ? NAVY : AMBER }}>{forte ? "⚠" : "ℹ"}</span>
      <span>{children}</span>
    </div>
  );
}
function LinhaNota({ label, valor, negativo, forte }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-0.5">
      <span className="text-[10px] uppercase tracking-widest" style={{ color: forte ? NAVY : NAVY40 }}>{label}</span>
      <span className={forte ? "text-base font-bold" : "text-sm"} style={{ color: NAVY, fontFamily: MONO, whiteSpace: "nowrap" }}>
        {negativo ? "−" : ""}{valor}
      </span>
    </div>
  );
}
const Tracejado = () => <div className="my-2" style={{ borderTop: `1px dashed ${NAVY40}`, opacity: 0.6 }} />;
const Picote = () => <div className="h-2" style={{ background: `repeating-linear-gradient(90deg, ${NAVY15} 0 8px, transparent 8px 16px)` }} />;

/* célula de regra: mostra valor confirmado ou pendência */
function Regra({ v, tipo }) {
  if (v === null || v === undefined)
    return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: AMBER25, color: NAVY }}>⚠ confirmar</span>;
  if (tipo === "pct") return <span style={{ fontFamily: MONO }}>{v}%</span>;
  if (tipo === "bool") return <span>{v ? "Sim" : "Não"}</span>;
  return <span>{v}</span>;
}

/* ============================================================ */
export default function SimuladorTributarioG41v3() {
  const [aba, setAba] = useState("simulador");
  const [cfg, setCfg] = useState(CONFIG_PADRAO);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(CFG_KEY);
        if (r && r.value) setCfg(JSON.parse(r.value));
      } catch {/* primeira execução */}
    })();
  }, []);

  const salvarCfg = async (nova) => {
    setCfg(nova);
    try { await window.storage.set(CFG_KEY, JSON.stringify(nova)); } catch (e) { console.error("storage:", e); }
  };

  /* ---- pesquisa automática de UF pela IA ---- */
  const [ufEmPesquisa, setUfEmPesquisa] = useState(null); // sigla sendo pesquisada

  const pesquisarESalvarUF = async (sigla, cfgAtual) => {
    setUfEmPesquisa(sigla);
    let registro;
    try {
      const r = await chamarIA(promptPesquisaUF(sigla));
      registro = {
        sigla,
        nome: r.nome || sigla,
        regiao: r.regiao === "n_ne_co_es" ? "n_ne_co_es" : r.regiao === "sul_sudeste" ? "sul_sudeste" : null,
        aliqInterna: typeof r.aliq_interna_padrao === "number" ? r.aliq_interna_padrao : null,
        equalizacaoSimples: typeof r.equalizacao_simples === "boolean" ? r.equalizacao_simples : null,
        antecipacaoST: typeof r.antecipacao_st === "boolean" ? r.antecipacao_st : null,
        baseLegal: r.base_legal || "",
        fontes: Array.isArray(r.fontes) ? r.fontes : [],
        pendencias: Array.isArray(r.pendencias) ? r.pendencias : [],
        pesquisadoEm: hoje(),
        origemDados: "pesquisa IA",
        ativo: true,
      };
    } catch (e) {
      console.error("Pesquisa de UF falhou:", e);
      registro = {
        sigla, nome: sigla, regiao: null, aliqInterna: null,
        equalizacaoSimples: null, antecipacaoST: null,
        baseLegal: "", fontes: [],
        pendencias: ["A pesquisa automática falhou — repetir ou preencher com validação da equipe G41."],
        pesquisadoEm: hoje(), origemDados: "pesquisa IA (falhou)", ativo: true,
      };
    }
    const semAntiga = (cfgAtual || cfg).estados.filter((e) => e.sigla !== sigla);
    await salvarCfg({ ...(cfgAtual || cfg), estados: [...semAntiga, registro] });
    setUfEmPesquisa(null);
  };

  /* ---- simulador ---- */
  const estadosAtivos = cfg.estados.filter((e) => e.ativo);
  const [ufDestino, setUfDestino] = useState("SP");
  const estado = estadosAtivos.find((e) => e.sigla === ufDestino) || estadosAtivos[0];

  const [regimeEmpresa, setRegimeEmpresa] = useState("lucro_real");
  const [finalidade, setFinalidade] = useState("revenda");
  const [origem, setOrigem] = useState("sul_sudeste");
  const [aliqInterna, setAliqInterna] = useState("18");
  useEffect(() => {
    if (estado && estado.aliqInterna !== null)
      setAliqInterna(String(estado.aliqInterna).replace(".", ","));
  }, [ufDestino]);

  const [regimeForn, setRegimeForn] = useState("normal");
  const [credSimples, setCredSimples] = useState("0");
  const [nomeProduto, setNomeProduto] = useState("");
  const [ncm, setNcm] = useState("");
  const [precoNF, setPrecoNF] = useState("");
  const [ipi, setIpi] = useState("0");
  const [frete, setFrete] = useState("0");
  const [stRetida, setStRetida] = useState("N");
  const [naListaST, setNaListaST] = useState("N");
  const [mvaEstim, setMvaEstim] = useState("");
  const [pisCofins, setPisCofins] = useState("normal");
  const [margem, setMargem] = useState("20");
  const [tipoMargem, setTipoMargem] = useState("venda");
  const [dasEfetivo, setDasEfetivo] = useState("4");
  const [extras, setExtras] = useState({});

  /* ---- validação AUTOMÁTICA do produto (debounce, sem botão) ---- */
  const [iaStatus, setIaStatus] = useState("aguardando"); // aguardando | analisando | ok | erro
  const [parecer, setParecer] = useState(null);
  const reqId = useRef(0);
  useEffect(() => {
    const ncmDigits = ncm.replace(/\D/g, "");
    if (!(num(precoNF) > 0) || ncmDigits.length < 8 || !estado) {
      setIaStatus("aguardando"); setParecer(null); return;
    }
    setIaStatus("analisando");
    const id = ++reqId.current;
    const t = setTimeout(async () => {
      try {
        const payload = {
          produto: nomeProduto, ncm, uf_destino: estado.sigla,
          aliquota_interna_informada: num(aliqInterna), origem,
          regime_empresa: regimeEmpresa, regime_fornecedor: regimeForn,
          finalidade, st_retida: stRetida, consta_lista_st: naListaST,
          pis_cofins: pisCofins, preco_nf: num(precoNF), campos_adicionais: extras,
        };
        const p = await chamarIA(promptValidacaoProduto(payload));
        if (id === reqId.current) { setParecer(p); setIaStatus("ok"); }
      } catch (e) {
        console.error("Validação automática falhou:", e);
        if (id === reqId.current) setIaStatus("erro");
      }
    }, 1800); // debounce: espera o cliente parar de digitar
    return () => clearTimeout(t);
  }, [ncm, nomeProduto, ufDestino, pisCofins, stRetida, naListaST, precoNF, regimeEmpresa, regimeForn, finalidade]);

  /* ---- motor de cálculo (parametrizado; regra não confirmada = provisório) ---- */
  const calc = useMemo(() => {
    if (!estado) return null;
    const preco = num(precoNF), vIpi = num(ipi), vFrete = num(frete);
    const interna = num(aliqInterna) / 100;
    const mSimples = num(credSimples) / 100;
    const alvo = num(margem) / 100, das = num(dasEfetivo) / 100, mva = num(mvaEstim) / 100;

    const taxaDestaque =
      origem === "interna" ? interna
      : origem === "importado" ? 0.04
      : estado.regiao === "n_ne_co_es" ? 0.07
      : 0.12; // regiao null → assume 12% e sinaliza pendência abaixo

    const interestadual = origem !== "interna";
    const temST = stRetida === "S";
    const empresaSimples = regimeEmpresa === "simples";
    const lucroReal = regimeEmpresa === "lucro_real";

    let credICMS = 0, credICMSnota = "";
    if (empresaSimples) credICMSnota = "Empresa no Simples não aproveita crédito de ICMS.";
    else if (temST) credICMSnota = "ST retida: o ICMS embutido é custo (não gera crédito).";
    else if (regimeForn === "simples") {
      credICMS = preco * mSimples;
      credICMSnota = mSimples > 0
        ? `Fornecedor Simples: crédito limitado a ${pct(mSimples)} informado na NF.`
        : "Fornecedor Simples sem % informado na NF: crédito ZERO.";
    } else {
      credICMS = preco * taxaDestaque;
      credICMSnota = `ICMS destacado de ${pct(taxaDestaque)} recuperado como crédito.`;
    }

    let credPC = 0;
    if (lucroReal && pisCofins === "normal")
      credPC = 0.0925 * Math.max(preco - (temST ? 0 : preco * taxaDestaque), 0);

    let difal = 0, difalLabel = "";
    const gap = Math.max(interna - taxaDestaque, 0);
    if (interestadual && finalidade === "uso_consumo" && gap > 0) {
      difal = preco * gap; difalLabel = `DIFAL (uso/consumo): ${pct(gap)}`;
    } else if (interestadual && empresaSimples && finalidade === "revenda" && !temST && gap > 0 && estado.equalizacaoSimples === true) {
      difal = preco * gap; difalLabel = `Equalização — Simples (regra de ${estado.sigla}): ${pct(gap)}`;
    }

    const precisaAntecip = interestadual && finalidade === "revenda" && naListaST === "S" && !temST && estado.antecipacaoST === true;
    let antecip = 0;
    if (precisaAntecip && mva > 0) {
      const baseST = (preco + vIpi + vFrete) * (1 + mva);
      antecip = Math.max(baseST * interna - preco * taxaDestaque, 0);
    }

    const custo = preco + vIpi + vFrete + difal + antecip - credICMS - credPC;
    const stQuitada = temST || (precisaAntecip && antecip > 0);
    const icmsSaida = stQuitada ? 0 : interna;
    let pcSaida = 0;
    if (!empresaSimples && pisCofins === "normal") pcSaida = lucroReal ? 0.0925 : 0.0365;
    let tribSaida = empresaSimples ? das : icmsSaida + pcSaida;
    if (empresaSimples && stQuitada) tribSaida = Math.max(das - 0.0134, 0);

    const pvVenda = 1 - tribSaida - alvo > 0 ? custo / (1 - tribSaida - alvo) : NaN;
    const pvMarkup = 1 - tribSaida > 0 ? (custo * (1 + alvo)) / (1 - tribSaida) : NaN;
    const pv = tipoMargem === "venda" ? pvVenda : pvMarkup;
    const margemRealMarkup = isFinite(pvMarkup) && pvMarkup > 0 ? (pvMarkup * (1 - tribSaida) - custo) / pvMarkup : 0;

    const alertas = [];
    const regrasPendentes = [
      estado.regiao === null && "região (alíquota interestadual)",
      estado.aliqInterna === null && "alíquota interna",
      estado.equalizacaoSimples === null && empresaSimples && "equalização do Simples",
      estado.antecipacaoST === null && naListaST === "S" && "antecipação de ST",
    ].filter(Boolean);
    if (regrasPendentes.length)
      alertas.push(["atencao", `Regras de ${estado.sigla} ainda não confirmadas pela pesquisa: ${regrasPendentes.join(", ")}. Resultado PROVISÓRIO — a equipe G41 confirmará (nada foi presumido nesses pontos).`]);
    if (!ncm.trim())
      alertas.push(["atencao", "Informe o NCM (8 dígitos, na própria NF): a análise automática só roda com ele, e o resultado é provisório sem ele."]);
    if (precisaAntecip && !(mva > 0))
      alertas.push(["atencao", `Produto na lista de ST de ${estado.sigla} sem retenção: há recolhimento ANTECIPADO na entrada. Informe a MVA estimada ou envie o XML.`]);
    if (regimeForn === "simples" && mSimples === 0 && !empresaSimples && !temST)
      alertas.push(["atencao", "Fornecedor do Simples sem % de crédito na nota: crédito ZERO. Peça o destaque do percentual (LC 123, art. 23)."]);
    if (pisCofins === "monofasico")
      alertas.push(["info", "Monofásico: sem crédito na compra, alíquota zero na venda. Confira o CST de PIS/COFINS do cadastro."]);
    if (temST)
      alertas.push(["info", "ST retida: imposto da cadeia já pago. Não some diferenças ao custo; sem ICMS na revenda."]);
    if (interestadual && finalidade === "revenda" && !empresaSimples && !temST && gap > 0)
      alertas.push(["info", `A diferença ${pct(taxaDestaque)} → ${pct(interna)} NÃO é custo: entrada gera crédito, saída incide sobre o preço de venda.`]);
    alertas.push(["info", "Reforma Tributária: 2026 é ano-teste (IBS 0,1% + CBS 0,9% informativos, LC 214/2025 art. 348) — sem impacto no custo. Critérios serão revisados em 2027 e 2029–2032."]);

    return { preco, vIpi, vFrete, credICMS, credICMSnota, credPC, difal, difalLabel, antecip, custo,
      icmsSaida, pcSaida, tribSaida, pv, pvVenda, pvMarkup, margemRealMarkup, alvo, alertas, empresaSimples };
  }, [estado, ufDestino, regimeEmpresa, finalidade, origem, aliqInterna, regimeForn, credSimples,
      ncm, precoNF, ipi, frete, stRetida, naListaST, mvaEstim, pisCofins, margem, tipoMargem, dasEfetivo]);

  const pronto = num(precoNF) > 0 && !!estado;

  return (
    <div className="min-h-screen" style={{ background: NAVY05, color: NAVY, fontFamily: "Archivo, system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;900&family=IBM+Plex+Mono:wght@400;600&display=swap');
        @media (prefers-reduced-motion: reduce){ *{transition:none!important} }
        @keyframes pulso { 0%,100%{opacity:1} 50%{opacity:.45} }
      `}</style>

      <header className="px-6 py-4 flex items-center justify-between flex-wrap gap-3" style={{ background: NAVY }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded flex items-center justify-center font-black text-lg" style={{ background: AMBER, color: NAVY }}>G41</div>
          <div>
            <h1 className="text-white font-bold text-sm tracking-wide">Simulador Tributário de Produto</h1>
            <p className="text-[11px]" style={{ color: AMBER }}>Insights Impulsionam · Área do Cliente · Integração Conta Azul</p>
          </div>
        </div>
        <nav className="flex gap-2">
          {[["simulador", "Simulador"], ["config", "Configurações"]].map(([v, t]) => (
            <button key={v} onClick={() => setAba(v)} className="px-3 py-1.5 rounded-md text-xs font-bold"
              style={aba === v ? { background: AMBER, color: NAVY } : { background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,.3)" }}>
              {t}
            </button>
          ))}
        </nav>
      </header>

      {aba === "config" ? (
        <TelaConfig cfg={cfg} salvarCfg={salvarCfg} pesquisar={pesquisarESalvarUF} ufEmPesquisa={ufEmPesquisa} />
      ) : (
        <main className="max-w-6xl mx-auto p-4 md:p-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="grid gap-4">
            <Bloco n="01" titulo="Sua empresa e a operação">
              <div className="grid sm:grid-cols-2 gap-4">
                <Campo label="Regime tributário da sua empresa">
                  <Sel value={regimeEmpresa} onChange={setRegimeEmpresa}
                    opts={[["lucro_real", "Lucro Real"], ["presumido", "Lucro Presumido"], ["simples", "Simples Nacional"]]} />
                </Campo>
                <Campo label="UF de destino"
                  hint={estado ? `Legislação de ${estado.nome} pesquisada em ${dataBR(estado.pesquisadoEm)} (${estado.origemDados}).` : "Cadastre uma UF em Configurações."}>
                  <Sel value={ufDestino} onChange={setUfDestino}
                    opts={estadosAtivos.map((e) => [e.sigla, `${e.sigla} — ${e.nome}${e.pendencias && e.pendencias.length ? " (regras pendentes)" : ""}`])} />
                </Campo>
                <Campo label="Finalidade da compra" hint="DIFAL só existe em uso/consumo ou ativo.">
                  <Alternar value={finalidade} onChange={setFinalidade}
                    opts={[["revenda", "Revenda"], ["uso_consumo", "Uso / consumo / ativo"]]} />
                </Campo>
                <Campo label="Origem da mercadoria">
                  <Sel value={origem} onChange={setOrigem}
                    opts={[["interna", "Mesmo estado (operação interna)"], ["sul_sudeste", "Sul / Sudeste (exceto ES)"], ["n_ne_co_es", "Norte / NE / CO / ES"], ["importado", "Importado (Res. 13/2012) · 4%"]]} />
                </Campo>
                <Campo label={`Alíquota interna em ${estado ? estado.sigla : "—"} (%)`}
                  hint={estado && estado.aliqInterna === null ? "⚠ Não confirmada pela pesquisa — informe manualmente; a G41 validará." : "Pré-preenchida pela pesquisa de legislação; ajuste conforme o NCM."}>
                  <Texto value={aliqInterna} onChange={setAliqInterna} mono />
                </Campo>
              </div>
            </Bloco>

            <Bloco n="02" titulo="Fornecedor">
              <div className="grid sm:grid-cols-2 gap-4">
                <Campo label="Regime do fornecedor">
                  <Alternar value={regimeForn} onChange={setRegimeForn} opts={[["normal", "Regime normal"], ["simples", "Simples Nacional"]]} />
                </Campo>
                {regimeForn === "simples" && (
                  <Campo label="% de ICMS creditável informado na NF" hint="Dados adicionais da nota (LC 123, art. 23). Sem informação = 0.">
                    <Texto value={credSimples} onChange={setCredSimples} mono placeholder="ex.: 2,8" />
                  </Campo>
                )}
              </div>
            </Bloco>

            <Bloco n="03" titulo="Produto e ICMS"
              sub="A análise automática por IA inicia sozinha assim que preço e NCM estiverem preenchidos.">
              <div className="grid sm:grid-cols-2 gap-4">
                <Campo label="Descrição do produto"><Texto value={nomeProduto} onChange={setNomeProduto} placeholder="ex.: Shampoo 1 L" /></Campo>
                <Campo label="NCM (8 dígitos)"><Texto value={ncm} onChange={setNcm} mono placeholder="ex.: 3305.10.00" /></Campo>
                <Campo label="Preço na NF (R$)"><Texto value={precoNF} onChange={setPrecoNF} mono placeholder="ex.: 5,39" /></Campo>
                <div className="grid grid-cols-2 gap-3">
                  <Campo label="IPI (R$)"><Texto value={ipi} onChange={setIpi} mono /></Campo>
                  <Campo label="Frete não recup. (R$)"><Texto value={frete} onChange={setFrete} mono /></Campo>
                </div>
                <Campo label="ST retida na nota?"><Alternar value={stRetida} onChange={setStRetida} opts={[["N", "Não"], ["S", "Sim"]]} /></Campo>
                <Campo label={`Produto na lista de ST de ${estado ? estado.sigla : "—"}?`} hint="Se não souber, deixe 'não sei' — a análise automática verifica.">
                  <Alternar value={naListaST} onChange={setNaListaST} opts={[["N", "Não / não sei"], ["S", "Sim"]]} />
                </Campo>
                {naListaST === "S" && stRetida === "N" && estado && estado.antecipacaoST === true && (
                  <Campo label="MVA / IVA-ST estimado (%) — opcional">
                    <Texto value={mvaEstim} onChange={setMvaEstim} mono placeholder="ex.: 40" />
                  </Campo>
                )}
              </div>
            </Bloco>

            <Bloco n="04" titulo="PIS e COFINS do produto" sub="A análise automática confere este enquadramento contra o NCM.">
              <Alternar value={pisCofins} onChange={setPisCofins}
                opts={[["normal", "Tributação normal"], ["monofasico", "Monofásico"], ["zero", "Alíquota zero"]]} />
            </Bloco>

            {cfg.camposExtras.length > 0 && (
              <Bloco n="05" titulo="Dados adicionais" sub="Campos definidos pela G41 em Configurações.">
                <div className="grid sm:grid-cols-2 gap-4">
                  {cfg.camposExtras.map((c) => (
                    <Campo key={c.id} label={c.label + (c.obrigatorio ? " *" : "")}>
                      {c.tipo === "sim_nao" ? (
                        <Alternar value={extras[c.id] || "N"} onChange={(v) => setExtras({ ...extras, [c.id]: v })} opts={[["N", "Não"], ["S", "Sim"]]} />
                      ) : (
                        <Texto value={extras[c.id] || ""} mono={c.tipo === "numero"} onChange={(v) => setExtras({ ...extras, [c.id]: v })} />
                      )}
                    </Campo>
                  ))}
                </div>
              </Bloco>
            )}

            <Bloco n={cfg.camposExtras.length > 0 ? "06" : "05"} titulo="Margem desejada">
              <div className="grid sm:grid-cols-3 gap-4">
                <Campo label="Margem alvo (%)"><Texto value={margem} onChange={setMargem} mono /></Campo>
                <Campo label="Como aplicar">
                  <Alternar value={tipoMargem} onChange={setTipoMargem} opts={[["venda", "Sobre a venda"], ["markup", "Markup s/ custo"]]} />
                </Campo>
                {calc && calc.empresaSimples && (
                  <Campo label="Alíquota efetiva do DAS (%)"><Texto value={dasEfetivo} onChange={setDasEfetivo} mono /></Campo>
                )}
              </div>
            </Bloco>
          </div>

          <aside className="lg:sticky lg:top-6 self-start grid gap-4">
            {/* status da análise automática */}
            <div className="rounded-lg bg-white px-4 py-3 flex items-center gap-3" style={{ border: `1px solid ${iaStatus === "ok" ? AMBER : NAVY15}` }}>
              <span className="w-2.5 h-2.5 rounded-full"
                style={{ background: iaStatus === "analisando" ? AMBER : iaStatus === "ok" ? NAVY : NAVY40,
                  animation: iaStatus === "analisando" ? "pulso 1.2s infinite" : "none" }} />
              <div className="text-xs" style={{ color: NAVY }}>
                <b>Análise automática por IA:</b>{" "}
                {iaStatus === "aguardando" && "aguardando preço + NCM para iniciar."}
                {iaStatus === "analisando" && "pesquisando legislação e conferindo os dados…"}
                {iaStatus === "ok" && parecer && (parecer.status === "aprovado" ? "concluída — informações consistentes." : "concluída — há pontos a revisar abaixo.")}
                {iaStatus === "erro" && "indisponível agora — a simulação continua; a equipe G41 valida na sequência."}
              </div>
            </div>

            {parecer && iaStatus === "ok" && (
              <div className="rounded-lg bg-white p-4 grid gap-2" style={{ border: `1px solid ${AMBER}` }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: NAVY }}>Parecer da IA</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                    style={{ background: parecer.status === "aprovado" ? NAVY : AMBER, color: parecer.status === "aprovado" ? "#fff" : NAVY }}>
                    {parecer.status === "aprovado" ? "APROVADO" : parecer.status === "aprovado_com_ressalvas" ? "COM RESSALVAS" : "PENDENTE"}
                  </span>
                </div>
                <p className="text-xs" style={{ color: NAVY }}>{parecer.resumo}</p>
                {(parecer.achados || []).map((a, i) => (
                  <Alerta key={i} nivel={a.nivel === "atencao" ? "atencao" : "info"}><b>{a.campo}:</b> {a.mensagem}</Alerta>
                ))}
              </div>
            )}

            <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${NAVY15}`, background: "#fff" }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ background: NAVY }}>
                <span className="text-white text-xs font-bold uppercase tracking-widest">Resultado da simulação</span>
                <span className="text-[10px]" style={{ color: AMBER, fontFamily: MONO }}>{nomeProduto || "—"}</span>
              </div>
              <Picote />
              <div className="px-4 py-3">
                {!pronto || !calc ? (
                  <p className="text-xs py-6 text-center" style={{ color: NAVY40 }}>
                    Informe o preço da NF para calcular.<br />Os resultados aparecem aqui em tempo real.
                  </p>
                ) : (
                  <>
                    <LinhaNota label="Preço NF" valor={brl(calc.preco)} />
                    {calc.vIpi > 0 && <LinhaNota label="IPI" valor={brl(calc.vIpi)} />}
                    {calc.vFrete > 0 && <LinhaNota label="Frete não recup." valor={brl(calc.vFrete)} />}
                    {calc.difal > 0 && <LinhaNota label={calc.difalLabel} valor={brl(calc.difal)} />}
                    {calc.antecip > 0 && <LinhaNota label="Antecipação ST (estim.)" valor={brl(calc.antecip)} />}
                    {calc.credICMS > 0 && <LinhaNota label="Crédito ICMS" valor={brl(calc.credICMS)} negativo />}
                    {calc.credPC > 0 && <LinhaNota label="Crédito PIS/COFINS" valor={brl(calc.credPC)} negativo />}
                    <Tracejado />
                    <LinhaNota label="Custo de cadastro" valor={brl(calc.custo)} forte />
                    <p className="text-[10px] mt-1 leading-snug" style={{ color: NAVY40 }}>{calc.credICMSnota}</p>
                    <Tracejado />
                    <LinhaNota label="ICMS na venda" valor={calc.empresaSimples ? "dentro do DAS" : pct(calc.icmsSaida)} />
                    <LinhaNota label="PIS/COFINS na venda" valor={calc.empresaSimples ? "dentro do DAS" : pct(calc.pcSaida)} />
                    <LinhaNota label="Carga total de saída" valor={pct(calc.tribSaida)} />
                    <Tracejado />
                    <div className="rounded-md p-3 mt-1" style={{ background: AMBER10, border: `1px solid ${AMBER25}` }}>
                      <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: NAVY }}>
                        Preço mínimo de venda · {tipoMargem === "venda" ? `margem ${pct(calc.alvo)} sobre a venda` : `markup ${pct(calc.alvo)} sobre o custo`}
                      </p>
                      <p className="text-2xl font-bold" style={{ color: NAVY, fontFamily: MONO }}>{isFinite(calc.pv) ? brl(calc.pv) : "—"}</p>
                      {tipoMargem === "markup" && isFinite(calc.pvMarkup) && (
                        <p className="text-[11px] mt-1" style={{ color: NAVY }}>
                          Margem líquida real: <b>{pct(calc.margemRealMarkup)}</b>. Para {pct(calc.alvo)} líquidos:{" "}
                          <b style={{ fontFamily: MONO }}>{brl(calc.pvVenda)}</b>.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
              <Picote />
              <p className="px-4 py-2 text-[10px]" style={{ color: NAVY40 }}>
                Simulação orientativa — pendências abrem tarefa automática para a equipe G41.
              </p>
            </div>

            {pronto && calc && (
              <div className="grid gap-2">
                {calc.alertas.map(([nivel, txt], i) => <Alerta key={i} nivel={nivel}>{txt}</Alerta>)}
              </div>
            )}
          </aside>
        </main>
      )}

      <footer className="max-w-6xl mx-auto px-6 pb-8">
        <p className="text-[10px] leading-relaxed" style={{ color: NAVY40 }}>
          Política de dados: nenhuma regra é presumida. Regras de UF são preenchidas por pesquisa de legislação
          (com fontes e data) e campos não confirmados ficam como pendência visível até validação da equipe G41.
          Em produção: pesquisa e validação rodam via workflows n8n; regras vivem em tabelas Supabase editáveis
          sem deploy. Reforma Tributária: 2026 é ano-teste (LC 214/2025).
        </p>
      </footer>
    </div>
  );
}

/* ============================================================
   Configurações — a IA pesquisa e preenche; o admin só informa a UF
   ============================================================ */
function TelaConfig({ cfg, salvarCfg, pesquisar, ufEmPesquisa }) {
  const [siglaNova, setSiglaNova] = useState("");
  const [novoCampo, setNovoCampo] = useState({ label: "", tipo: "texto", obrigatorio: "N" });
  const [detalhe, setDetalhe] = useState(null); // sigla expandida (fontes/base legal)

  const addUF = () => {
    const sigla = siglaNova.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(sigla) || cfg.estados.some((e) => e.sigla === sigla) || ufEmPesquisa) return;
    setSiglaNova("");
    pesquisar(sigla, cfg); // pesquisa automática → grava na tabela
  };

  const toggleUF = (sigla) =>
    salvarCfg({ ...cfg, estados: cfg.estados.map((e) => (e.sigla === sigla ? { ...e, ativo: !e.ativo } : e)) });
  const removerUF = (sigla) => {
    if (cfg.estados.length <= 1) return;
    salvarCfg({ ...cfg, estados: cfg.estados.filter((e) => e.sigla !== sigla) });
  };
  const editarAliq = (sigla, v) =>
    salvarCfg({
      ...cfg,
      estados: cfg.estados.map((e) =>
        e.sigla === sigla ? { ...e, aliqInterna: v === "" ? null : num(v), origemDados: e.origemDados + " + ajuste manual" } : e
      ),
    });

  const addCampo = () => {
    if (!novoCampo.label.trim()) return;
    salvarCfg({
      ...cfg,
      camposExtras: [...cfg.camposExtras, { id: "c_" + Date.now(), label: novoCampo.label.trim(), tipo: novoCampo.tipo, obrigatorio: novoCampo.obrigatorio === "S" }],
    });
    setNovoCampo({ label: "", tipo: "texto", obrigatorio: "N" });
  };
  const removerCampo = (id) => salvarCfg({ ...cfg, camposExtras: cfg.camposExtras.filter((c) => c.id !== id) });

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-6 grid gap-4">
      <Bloco n="A" titulo="UFs de destino — preenchidas por pesquisa de legislação"
        sub="Informe apenas a sigla: a IA pesquisa a legislação vigente e grava as regras com fonte e data. Nada é presumido — campo não confirmado fica como pendência.">
        <div className="flex gap-3 items-end flex-wrap">
          <Campo label="Sigla da nova UF">
            <Texto value={siglaNova} onChange={setSiglaNova} mono placeholder="ex.: MG" />
          </Campo>
          <button onClick={addUF} disabled={!!ufEmPesquisa}
            className="text-xs font-bold px-4 py-2 rounded-md h-fit"
            style={{ background: ufEmPesquisa ? NAVY15 : AMBER, color: NAVY }}>
            {ufEmPesquisa ? `Pesquisando legislação de ${ufEmPesquisa}…` : "+ Cadastrar UF (pesquisa automática)"}
          </button>
        </div>
        {ufEmPesquisa && (
          <Alerta nivel="info">
            Pesquisando a legislação vigente de <b>{ufEmPesquisa}</b> (alíquota interna, regras de entrada
            interestadual, ST). Isso leva alguns segundos — os resultados entram na tabela com as fontes.
          </Alerta>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ color: NAVY }}>
            <thead>
              <tr className="text-left" style={{ borderBottom: `2px solid ${NAVY15}` }}>
                {["UF", "Nome", "Região", "Alíq. interna", "Equaliz. Simples", "Antecip. ST", "Pesquisa", "Status", ""].map((h) => (
                  <th key={h} className="py-2 pr-3 font-bold uppercase tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cfg.estados.map((e) => (
                <FragmentoUF key={e.sigla} e={e} detalhe={detalhe} setDetalhe={setDetalhe}
                  toggleUF={toggleUF} removerUF={removerUF} editarAliq={editarAliq}
                  podeRemover={cfg.estados.length > 1} repesquisar={() => pesquisar(e.sigla, cfg)}
                  pesquisando={ufEmPesquisa === e.sigla} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px]" style={{ color: NAVY40 }}>
          A alíquota interna aceita ajuste manual (fica registrado como "ajuste manual"). "Atualizar" refaz a
          pesquisa — recomendado periodicamente e após mudanças legislativas, como as portarias de ST de 2025/2026.
        </p>
      </Bloco>

      <Bloco n="B" titulo="Campos adicionais do formulário"
        sub="Novos campos aparecem no simulador e entram automaticamente na análise por IA.">
        {cfg.camposExtras.length === 0 ? (
          <p className="text-xs" style={{ color: NAVY40 }}>Nenhum campo adicional cadastrado.</p>
        ) : (
          <ul className="grid gap-1">
            {cfg.camposExtras.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-xs py-1" style={{ borderBottom: `1px solid ${NAVY15}` }}>
                <span><b>{c.label}</b> · {c.tipo}{c.obrigatorio ? " · obrigatório" : ""}</span>
                <button onClick={() => removerCampo(c.id)} className="text-[10px] underline" style={{ color: NAVY40 }}>remover</button>
              </li>
            ))}
          </ul>
        )}
        <div className="rounded-md p-4 grid sm:grid-cols-4 gap-3 items-end" style={{ background: NAVY05, border: `1px dashed ${NAVY40}` }}>
          <Campo label="Nome do campo"><Texto value={novoCampo.label} onChange={(v) => setNovoCampo({ ...novoCampo, label: v })} placeholder="ex.: CEST" /></Campo>
          <Campo label="Tipo">
            <Sel value={novoCampo.tipo} onChange={(v) => setNovoCampo({ ...novoCampo, tipo: v })}
              opts={[["texto", "Texto"], ["numero", "Número"], ["sim_nao", "Sim / Não"]]} />
          </Campo>
          <Campo label="Obrigatório?">
            <Alternar value={novoCampo.obrigatorio} onChange={(v) => setNovoCampo({ ...novoCampo, obrigatorio: v })} opts={[["N", "Não"], ["S", "Sim"]]} />
          </Campo>
          <button onClick={addCampo} className="text-xs font-bold px-4 py-2 rounded-md h-fit" style={{ background: AMBER, color: NAVY }}>+ Adicionar campo</button>
        </div>
      </Bloco>

      <Alerta nivel="info">
        Em produção: o cadastro de UF dispara o workflow n8n "Pesquisa de Legislação UF" (Claude + web search),
        que grava em <b>tax_states</b> no Supabase com fontes e data; um agendamento mensal re-pesquisa todas as
        UFs ativas e abre tarefa no Kanban quando detecta mudança de regra. Pendências nunca são preenchidas
        automaticamente — sempre viram tarefa para a equipe fiscal.
      </Alerta>
    </main>
  );
}

function FragmentoUF({ e, detalhe, setDetalhe, toggleUF, removerUF, editarAliq, podeRemover, repesquisar, pesquisando }) {
  const aberto = detalhe === e.sigla;
  return (
    <>
      <tr style={{ borderBottom: aberto ? "none" : `1px solid ${NAVY15}`, opacity: e.ativo ? 1 : 0.45 }}>
        <td className="py-2 pr-3 font-bold" style={{ fontFamily: MONO }}>{e.sigla}</td>
        <td className="py-2 pr-3">{e.nome}</td>
        <td className="py-2 pr-3"><Regra v={e.regiao === null ? null : e.regiao === "n_ne_co_es" ? "N/NE/CO/ES (7%)" : "Sul/Sudeste (12%)"} /></td>
        <td className="py-2 pr-3">
          <input type="text" inputMode="decimal"
            value={e.aliqInterna === null ? "" : String(e.aliqInterna)}
            onChange={(ev) => editarAliq(e.sigla, ev.target.value)}
            placeholder="confirmar"
            className="w-16 rounded px-1.5 py-0.5 text-xs"
            style={{ border: `1px solid ${e.aliqInterna === null ? AMBER : NAVY15}`, fontFamily: MONO, color: NAVY, background: e.aliqInterna === null ? AMBER10 : "#fff" }} />
          <span className="ml-0.5">%</span>
        </td>
        <td className="py-2 pr-3"><Regra v={e.equalizacaoSimples} tipo="bool" /></td>
        <td className="py-2 pr-3"><Regra v={e.antecipacaoST} tipo="bool" /></td>
        <td className="py-2 pr-3">
          <button onClick={() => setDetalhe(aberto ? null : e.sigla)} className="underline text-[10px]" style={{ color: NAVY }}>
            {dataBR(e.pesquisadoEm)}{e.pendencias && e.pendencias.length ? ` · ${e.pendencias.length} pend.` : ""} {aberto ? "▲" : "▼"}
          </button>
        </td>
        <td className="py-2 pr-3">
          <button onClick={() => toggleUF(e.sigla)} className="px-2 py-0.5 rounded text-[10px] font-bold"
            style={{ background: e.ativo ? NAVY : NAVY15, color: e.ativo ? "#fff" : NAVY }}>
            {e.ativo ? "Ativa" : "Inativa"}
          </button>
        </td>
        <td className="py-2 whitespace-nowrap">
          <button onClick={repesquisar} disabled={pesquisando} className="text-[10px] underline mr-2" style={{ color: NAVY }}>
            {pesquisando ? "atualizando…" : "atualizar"}
          </button>
          {podeRemover && (
            <button onClick={() => removerUF(e.sigla)} className="text-[10px] underline" style={{ color: NAVY40 }}>remover</button>
          )}
        </td>
      </tr>
      {aberto && (
        <tr style={{ borderBottom: `1px solid ${NAVY15}` }}>
          <td colSpan={9} className="pb-3">
            <div className="rounded-md p-3 grid gap-2 text-[11px]" style={{ background: NAVY05, border: `1px solid ${NAVY15}`, color: NAVY }}>
              <p><b>Origem dos dados:</b> {e.origemDados} · <b>Pesquisado em:</b> {dataBR(e.pesquisadoEm)}</p>
              {e.baseLegal && <p><b>Base legal:</b> {e.baseLegal}</p>}
              {e.fontes && e.fontes.length > 0 && (
                <p><b>Fontes:</b>{" "}
                  {e.fontes.map((f, i) => (
                    <a key={i} href={f.url} target="_blank" rel="noreferrer" className="underline mr-2">{f.campo}</a>
                  ))}
                </p>
              )}
              {e.pendencias && e.pendencias.length > 0 && (
                <div className="grid gap-1">
                  {e.pendencias.map((p, i) => <Alerta key={i} nivel="atencao">{p}</Alerta>)}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
