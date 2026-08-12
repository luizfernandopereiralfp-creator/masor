/* ============================================================
   Masor — preferências de APRESENTAÇÃO do relatório.
   A caixa de IA (e os chips) mudam COMO o parecer é mostrado,
   sem tocar nos números. A IA devolve uma "diretriz de view"
   (JSON) que é aplicada sobre estas preferências no cliente.
   ============================================================ */

export type Densidade = "enxuto" | "completo";

export const SECOES = [
  "parametros",
  "memoria",
  "reforma",
  "cenarios",
  "beneficios",
  "ncms",
  "riscos",
  "fundamentacao",
  "fontes",
  "dados_adicionais",
] as const;
export type SecaoId = (typeof SECOES)[number];

export const ROTULO_SECAO: Record<SecaoId, string> = {
  parametros: "Parâmetros aplicados (com fonte)",
  memoria: "Memória de cálculo",
  reforma: "Impactos da Reforma",
  cenarios: "Cenários (atual × transição × futuro)",
  beneficios: "Benefícios, créditos e regimes",
  ncms: "NCMs / enquadramentos",
  riscos: "Riscos e pontos de atenção",
  fundamentacao: "Fundamentação legal",
  fontes: "Fontes oficiais",
  dados_adicionais: "Dados adicionais úteis",
};

export type ViewPrefs = {
  densidade: Densidade;
  leigo: boolean; // linguagem simples, para não-técnico
  abertas: SecaoId[]; // seções de detalhe expandidas
};

export const VIEW_PADRAO: ViewPrefs = {
  densidade: "enxuto",
  leigo: true,
  abertas: [],
};

/** Diretriz que a IA (ou um chip) devolve para mudar a apresentação. */
export type DiretrizView = Partial<{
  densidade: Densidade;
  leigo: boolean;
  abrir: SecaoId[] | "todas";
  fechar: SecaoId[] | "todas";
}>;

const ehSecao = (s: string): s is SecaoId => (SECOES as readonly string[]).includes(s);

export function aplicarDiretriz(prefs: ViewPrefs, d: DiretrizView | null | undefined): ViewPrefs {
  if (!d) return prefs;
  let abertas = [...prefs.abertas];
  const densidade = d.densidade ?? prefs.densidade;

  if (d.abrir === "todas") abertas = [...SECOES];
  else if (Array.isArray(d.abrir)) abertas = Array.from(new Set([...abertas, ...d.abrir.filter(ehSecao)]));

  if (d.fechar === "todas") abertas = [];
  else if (Array.isArray(d.fechar)) abertas = abertas.filter((s) => !d.fechar!.includes(s));

  // "completo" abre tudo por padrão; "enxuto" respeita o que estiver aberto.
  if (densidade === "completo" && d.abrir == null && d.fechar == null) abertas = [...SECOES];

  return { densidade, leigo: d.leigo ?? prefs.leigo, abertas };
}

/** Chips prontos (funcionam sem a IA — aplicam diretriz localmente). */
export const CHIPS: { rotulo: string; diretriz: DiretrizView }[] = [
  { rotulo: "Mais enxuto", diretriz: { densidade: "enxuto", leigo: true, fechar: "todas" } },
  { rotulo: "Ver tudo", diretriz: { densidade: "completo", abrir: "todas" } },
  { rotulo: "Explicar simples", diretriz: { leigo: true } },
  { rotulo: "Modo técnico", diretriz: { leigo: false } },
  { rotulo: "Mostrar base legal", diretriz: { abrir: ["fundamentacao", "fontes"] } },
  { rotulo: "Mostrar memória", diretriz: { abrir: ["memoria"] } },
  { rotulo: "Mostrar Reforma", diretriz: { abrir: ["reforma", "cenarios"] } },
];
