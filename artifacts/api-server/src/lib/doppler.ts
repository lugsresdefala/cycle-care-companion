/**
 * Server-side Doppler velocimetry calculation logic.
 * References: Acharya 2005, Ebbing 2007, Gómez 2008, Baschat 2003, Kessler 2006.
 * Kept server-side so premium clinical evaluations cannot be executed from
 * client bundles without authentication and token deduction.
 */

export interface DopplerResult {
  value: number;
  percentile: string;
  interpretation: string;
  severity: "normal" | "warning" | "critical";
  refs?: { p5: number; p50: number; p95: number };
}

export interface CPRResult {
  cpr: number;
  mcaPI: number;
  uaPI: number;
  percentile: string;
  interpretation: string;
  severity: "normal" | "warning" | "critical";
  refs?: { p5: number; p50: number; p95: number };
}

export interface UmbilicalArteryResult {
  piResult?: DopplerResult;
  riResult?: DopplerResult;
  sdResult?: DopplerResult;
}

export interface DuctusVenosusResult {
  pivResult?: DopplerResult;
  waveAResult: DopplerResult;
}

const UA_PI_REFS: Record<number, { p5: number; p50: number; p95: number }> = {
  20: { p5: 0.96, p50: 1.25, p95: 1.54 },
  22: { p5: 0.91, p50: 1.20, p95: 1.49 },
  24: { p5: 0.86, p50: 1.15, p95: 1.44 },
  26: { p5: 0.81, p50: 1.10, p95: 1.39 },
  28: { p5: 0.76, p50: 1.05, p95: 1.34 },
  30: { p5: 0.71, p50: 0.99, p95: 1.27 },
  32: { p5: 0.66, p50: 0.93, p95: 1.20 },
  34: { p5: 0.61, p50: 0.87, p95: 1.13 },
  36: { p5: 0.56, p50: 0.81, p95: 1.06 },
  38: { p5: 0.52, p50: 0.75, p95: 0.98 },
  40: { p5: 0.48, p50: 0.71, p95: 0.94 },
};

const MCA_PI_REFS: Record<number, { p5: number; p50: number; p95: number }> = {
  20: { p5: 1.20, p50: 1.65, p95: 2.10 },
  22: { p5: 1.25, p50: 1.70, p95: 2.15 },
  24: { p5: 1.35, p50: 1.80, p95: 2.25 },
  26: { p5: 1.40, p50: 1.86, p95: 2.32 },
  28: { p5: 1.44, p50: 1.90, p95: 2.36 },
  30: { p5: 1.40, p50: 1.84, p95: 2.28 },
  32: { p5: 1.30, p50: 1.75, p95: 2.20 },
  34: { p5: 1.20, p50: 1.65, p95: 2.10 },
  36: { p5: 1.10, p50: 1.55, p95: 2.00 },
  38: { p5: 1.00, p50: 1.45, p95: 1.90 },
  40: { p5: 0.95, p50: 1.40, p95: 1.85 },
};

const UTA_PI_REFS: Record<number, { p5: number; p50: number; p95: number }> = {
  11: { p5: 1.04, p50: 1.79, p95: 2.70 },
  12: { p5: 0.98, p50: 1.68, p95: 2.53 },
  14: { p5: 0.88, p50: 1.47, p95: 2.24 },
  16: { p5: 0.78, p50: 1.30, p95: 2.00 },
  18: { p5: 0.69, p50: 1.15, p95: 1.79 },
  20: { p5: 0.62, p50: 1.04, p95: 1.61 },
  22: { p5: 0.56, p50: 0.95, p95: 1.47 },
  24: { p5: 0.52, p50: 0.88, p95: 1.36 },
  26: { p5: 0.48, p50: 0.82, p95: 1.27 },
  28: { p5: 0.45, p50: 0.78, p95: 1.20 },
  30: { p5: 0.43, p50: 0.74, p95: 1.14 },
  32: { p5: 0.41, p50: 0.71, p95: 1.09 },
  34: { p5: 0.39, p50: 0.68, p95: 1.05 },
  36: { p5: 0.38, p50: 0.66, p95: 1.02 },
  38: { p5: 0.37, p50: 0.65, p95: 1.00 },
  40: { p5: 0.36, p50: 0.64, p95: 0.99 },
};

const CPR_REFS: Record<number, { p5: number; p50: number; p95: number }> = {
  20: { p5: 1.05, p50: 1.35, p95: 1.80 },
  22: { p5: 1.10, p50: 1.42, p95: 1.88 },
  24: { p5: 1.20, p50: 1.55, p95: 2.00 },
  26: { p5: 1.30, p50: 1.68, p95: 2.10 },
  28: { p5: 1.40, p50: 1.80, p95: 2.20 },
  30: { p5: 1.50, p50: 1.88, p95: 2.28 },
  32: { p5: 1.52, p50: 1.90, p95: 2.32 },
  34: { p5: 1.50, p50: 1.88, p95: 2.28 },
  36: { p5: 1.40, p50: 1.78, p95: 2.20 },
  38: { p5: 1.30, p50: 1.70, p95: 2.10 },
  40: { p5: 1.20, p50: 1.60, p95: 2.00 },
};

const DV_PIV_REFS: Record<number, { p5: number; p50: number; p95: number }> = {
  20: { p5: 0.34, p50: 0.54, p95: 0.84 },
  22: { p5: 0.32, p50: 0.51, p95: 0.80 },
  24: { p5: 0.30, p50: 0.48, p95: 0.76 },
  26: { p5: 0.28, p50: 0.46, p95: 0.73 },
  28: { p5: 0.26, p50: 0.44, p95: 0.70 },
  30: { p5: 0.25, p50: 0.42, p95: 0.67 },
  32: { p5: 0.24, p50: 0.40, p95: 0.64 },
  34: { p5: 0.23, p50: 0.39, p95: 0.62 },
  36: { p5: 0.22, p50: 0.38, p95: 0.60 },
  38: { p5: 0.21, p50: 0.37, p95: 0.58 },
  40: { p5: 0.20, p50: 0.36, p95: 0.56 },
};

function getClosestGA(table: Record<number, Record<string, number>>, ga: number): number {
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  let closest = keys[0];
  for (const k of keys) {
    if (Math.abs(k - ga) < Math.abs(closest - ga)) closest = k;
  }
  return closest;
}

function classifyPI(
  value: number,
  refs: { p5: number; p50: number; p95: number },
  highIsAbnormal: boolean,
): { percentile: string; severity: "normal" | "warning" | "critical" } {
  if (highIsAbnormal) {
    if (value > refs.p95) return { percentile: "> p95", severity: "critical" };
    if (value > refs.p50 + (refs.p95 - refs.p50) * 0.6) return { percentile: "p75–p95", severity: "warning" };
    if (value < refs.p5) return { percentile: "< p5", severity: "warning" };
    return { percentile: "p5–p95 (normal)", severity: "normal" };
  } else {
    if (value < refs.p5) return { percentile: "< p5", severity: "critical" };
    if (value < refs.p50 - (refs.p50 - refs.p5) * 0.6) return { percentile: "p5–p25", severity: "warning" };
    if (value > refs.p95) return { percentile: "> p95", severity: "warning" };
    return { percentile: "p5–p95 (normal)", severity: "normal" };
  }
}

export function evaluateUmbilicalArtery(params: {
  ga: number;
  pi?: number;
  ri?: number;
  sd?: number;
}): UmbilicalArteryResult {
  const ga = getClosestGA(UA_PI_REFS, params.ga);
  const refs = UA_PI_REFS[ga];
  let piResult: DopplerResult | undefined;
  let riResult: DopplerResult | undefined;
  let sdResult: DopplerResult | undefined;

  if (params.pi !== undefined && !isNaN(params.pi)) {
    const { percentile, severity } = classifyPI(params.pi, refs, true);
    let interpretation = "Índice de pulsatilidade dentro dos limites normais.";
    if (severity === "warning") interpretation = "IP discretamente elevado — acompanhamento recomendado.";
    if (severity === "critical") interpretation = "IP significativamente elevado — avaliar insuficiência placentária. Considerar monitorização com cardiotocografia e perfil biofísico fetal.";
    piResult = { value: params.pi, percentile, interpretation, severity, refs };
  }

  if (params.ri !== undefined && !isNaN(params.ri)) {
    let severity: "normal" | "warning" | "critical" = "normal";
    let interpretation = "IR dentro dos limites normais (< 0,70).";
    let percentile = "Normal";
    if (params.ri >= 0.70 && params.ri < 0.80) {
      severity = "warning"; percentile = "Limítrofe";
      interpretation = "IR elevado — sugere aumento da resistência placentária.";
    } else if (params.ri >= 0.80) {
      severity = "critical"; percentile = "Elevado";
      interpretation = "IR significativamente elevado — avaliar comprometimento da circulação placentária.";
    }
    riResult = { value: params.ri, percentile, interpretation, severity };
  }

  if (params.sd !== undefined && !isNaN(params.sd)) {
    let severity: "normal" | "warning" | "critical" = "normal";
    let interpretation = "Relação S/D dentro dos limites normais.";
    let percentile = "Normal";
    const threshold = params.ga >= 30 ? 3.0 : 4.0;
    if (params.sd >= threshold && params.sd < threshold + 1) {
      severity = "warning"; percentile = "Limítrofe";
      interpretation = `Relação S/D discretamente elevada para ${params.ga} semanas.`;
    } else if (params.sd >= threshold + 1) {
      severity = "critical"; percentile = "Elevado";
      interpretation = "Relação S/D significativamente elevada — avaliar insuficiência placentária.";
    }
    sdResult = { value: params.sd, percentile, interpretation, severity };
  }

  return { piResult, riResult, sdResult };
}

export function evaluateMCA(params: { ga: number; pi: number }): DopplerResult {
  const ga = getClosestGA(MCA_PI_REFS, params.ga);
  const refs = MCA_PI_REFS[ga];
  const { percentile, severity } = classifyPI(params.pi, refs, false);
  let interpretation = "IP da ACM dentro dos limites normais — sem sinais de redistribuição hemodinâmica.";
  if (severity === "warning") interpretation = "IP da ACM discretamente reduzido — possível início de vasodilatação cerebral compensatória.";
  if (severity === "critical") interpretation = "IP da ACM significativamente reduzido — brain-sparing effect. Avaliar centralização fetal e programar monitorização intensiva.";
  return { value: params.pi, percentile, interpretation, severity, refs };
}

export function evaluateUterineArtery(params: {
  ga: number;
  pi: number;
  bilateralNotch?: boolean;
}): DopplerResult {
  const ga = getClosestGA(UTA_PI_REFS, params.ga);
  const refs = UTA_PI_REFS[ga];
  const { percentile, severity: baseSeverity } = classifyPI(params.pi, refs, true);
  let severity = baseSeverity;
  let interpretation = "IP da artéria uterina dentro dos limites normais — placentação adequada.";
  if (baseSeverity === "warning") {
    interpretation = "IP discretamente elevado — acompanhamento recomendado.";
    if (params.bilateralNotch) {
      severity = "critical";
      interpretation += " Incisura protodiastólica bilateral presente — risco aumentado de pré-eclâmpsia e CIUR.";
    }
  }
  if (baseSeverity === "critical") {
    interpretation = "IP significativamente elevado — invasão trofoblástica deficiente.";
    if (params.bilateralNotch) {
      interpretation += " Incisura protodiastólica bilateral agrava o prognóstico — rastreio intensivo recomendado.";
    }
  }
  return { value: params.pi, percentile, interpretation, severity, refs };
}

export function evaluateCPR(params: {
  ga: number;
  mcaPI: number;
  uaPI: number;
}): CPRResult {
  if (params.uaPI <= 0) {
    return { cpr: 0, mcaPI: params.mcaPI, uaPI: params.uaPI, percentile: "N/A", interpretation: "IP da artéria umbilical deve ser maior que zero.", severity: "critical" };
  }
  const cpr = parseFloat((params.mcaPI / params.uaPI).toFixed(2));
  const ga = getClosestGA(CPR_REFS, params.ga);
  const refs = CPR_REFS[ga];
  const { percentile, severity } = classifyPI(cpr, refs, false);
  let interpretation = "RCP dentro dos limites normais — sem evidência de redistribuição hemodinâmica.";
  if (severity === "warning") interpretation = "RCP discretamente reduzida — possível início de centralização fetal. Repetir em 7 dias.";
  if (severity === "critical") interpretation = "RCP significativamente reduzida (< p5) — centralização fetal. Avaliar vitalidade fetal e considerar antecipação do parto conforme idade gestacional.";
  return { cpr, mcaPI: params.mcaPI, uaPI: params.uaPI, percentile, interpretation, severity, refs };
}

export function evaluateDuctusVenosus(params: {
  ga: number;
  piv?: number;
  waveAReversed: boolean;
}): DuctusVenosusResult {
  const waveAResult: DopplerResult = params.waveAReversed
    ? {
        value: 0,
        percentile: "Onda A reversa",
        interpretation: params.ga < 14
          ? "Onda 'a' reversa no 1º trimestre — associada a aneuploidias e cardiopatias congênitas. Correlacionar com translucência nucal e cariótipo."
          : "Onda 'a' reversa — indica aumento significativo da pressão atrial direita e possível insuficiência cardíaca fetal. Risco de óbito perinatal aumentado.",
        severity: "critical",
      }
    : {
        value: 1,
        percentile: "Onda A positiva",
        interpretation: "Onda 'a' anterógrada — padrão normal de fluxo no ducto venoso.",
        severity: "normal",
      };

  let pivResult: DopplerResult | undefined;
  if (params.piv !== undefined && !isNaN(params.piv) && params.piv > 0) {
    const ga = getClosestGA(DV_PIV_REFS, params.ga);
    const refs = DV_PIV_REFS[ga];
    const { percentile, severity } = classifyPI(params.piv, refs, true);
    let interpretation = "PIV do ducto venoso dentro dos limites normais — função cardíaca fetal preservada.";
    if (severity === "warning") interpretation = "PIV discretamente elevado — possível aumento da pós-carga cardíaca. Acompanhamento recomendado.";
    if (severity === "critical") interpretation = "PIV significativamente elevado — sugere disfunção cardíaca fetal. Avaliar onda 'a' reversa e considerar monitorização intensiva.";
    pivResult = { value: params.piv, percentile, interpretation, severity, refs: params.ga >= 20 ? refs : undefined };
  }

  return { pivResult, waveAResult };
}
