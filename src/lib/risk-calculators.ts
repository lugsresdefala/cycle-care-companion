/**
 * Risk Calculators for Obstetric Screening
 *
 * 1. Trisomy Risk (1st trimester combined screening) — FMF-based approach
 * 2. Pre-eclampsia Risk — FMF competing-risks model (simplified)
 *
 * DISCLAIMER: These are simplified implementations for educational/clinical
 * decision-support purposes. They approximate published algorithms but do NOT
 * replace certified software (e.g., Astraia, ViewPoint).
 */

/* ═══════════════════════════════════════════════════════════════════════════
   1. TRISOMY RISK CALCULATOR
   ═══════════════════════════════════════════════════════════════════════════ */

/** Maternal-age-specific background risk for trisomies at 12 weeks GA */
const AGE_RISK_T21: Record<number, number> = {
  20: 1068, 21: 1068, 22: 1068, 23: 1068, 24: 1068,
  25: 1054, 26: 1040, 27: 1026, 28: 990, 29: 950,
  30: 895, 31: 776, 32: 659, 33: 547, 34: 446,
  35: 356, 36: 280, 37: 218, 38: 167, 39: 128,
  40: 97, 41: 73, 42: 55, 43: 41, 44: 30, 45: 23,
  46: 17, 47: 13, 48: 10, 49: 8, 50: 6,
};

const AGE_RISK_T18: Record<number, number> = {
  20: 2484, 21: 2484, 22: 2484, 23: 2484, 24: 2484,
  25: 2200, 26: 2000, 27: 1800, 28: 1600, 29: 1400,
  30: 1200, 31: 1050, 32: 900, 33: 750, 34: 600,
  35: 500, 36: 400, 37: 310, 38: 240, 39: 185,
  40: 142, 41: 109, 42: 84, 43: 64, 44: 49,
  45: 38, 46: 29, 47: 22, 48: 17, 49: 13, 50: 10,
};

const AGE_RISK_T13: Record<number, number> = {
  20: 7826, 21: 7826, 22: 7826, 23: 7826, 24: 7826,
  25: 7000, 26: 6500, 27: 6000, 28: 5500, 29: 5000,
  30: 4500, 31: 3800, 32: 3200, 33: 2700, 34: 2200,
  35: 1800, 36: 1400, 37: 1100, 38: 850, 39: 650,
  40: 500, 41: 385, 42: 296, 43: 227, 44: 175,
  45: 134, 46: 103, 47: 79, 48: 61, 49: 47, 50: 36,
};

function getAgeRisk(age: number, table: Record<number, number>): number {
  const clampedAge = Math.max(20, Math.min(50, Math.round(age)));
  return table[clampedAge] ?? 1000;
}

/**
 * NT expected median and SD for a given CRL (mm), based on FMF data.
 * Median NT (mm) ≈ −0.3599 + 0.0127 × CRL (simplified linear fit for 45–84 mm CRL range)
 */
function ntExpectedMedian(crl: number): number {
  return Math.max(0.5, -0.3599 + 0.0127 * crl);
}

/** NT MoM */
function ntToMoM(ntMm: number, crl: number): number {
  const median = ntExpectedMedian(crl);
  return ntMm / median;
}

/**
 * Likelihood ratio for NT delta (NT - expected median).
 * Uses log-Gaussian distributions for affected vs unaffected.
 * Simplified from FMF published parameters.
 */
function ntLikelihoodRatio(ntMm: number, crl: number, trisomy: "T21" | "T18" | "T13"): number {
  const delta = ntMm - ntExpectedMedian(crl);

  // Unaffected: mean delta ~0, SD ~0.55
  const unaffectedMean = 0;
  const unaffectedSD = 0.55;

  // Affected distributions (simplified)
  const affectedParams: Record<string, { mean: number; sd: number }> = {
    T21: { mean: 1.2, sd: 0.85 },
    T18: { mean: 1.8, sd: 1.1 },
    T13: { mean: 1.6, sd: 1.0 },
  };

  const { mean: affMean, sd: affSD } = affectedParams[trisomy];

  const pdfUnaffected = Math.exp(-0.5 * ((delta - unaffectedMean) / unaffectedSD) ** 2) / unaffectedSD;
  const pdfAffected = Math.exp(-0.5 * ((delta - affMean) / affSD) ** 2) / affSD;

  const lr = pdfAffected / pdfUnaffected;
  return Math.max(0.01, Math.min(100, lr));
}

/**
 * Likelihood ratio for biochemical markers (PAPP-A MoM, free β-hCG MoM).
 * Uses log10-Gaussian bivariate (simplified to independent univariate here).
 */
function biochemLR(pappaMoM: number | null, bhcgMoM: number | null, trisomy: "T21" | "T18" | "T13"): number {
  let lr = 1;

  if (pappaMoM !== null && pappaMoM > 0) {
    const logPappa = Math.log10(pappaMoM);
    // Unaffected: mean 0, SD 0.23
    const uPdf = Math.exp(-0.5 * (logPappa / 0.23) ** 2);
    // Affected
    const affParams: Record<string, { mean: number; sd: number }> = {
      T21: { mean: -0.12, sd: 0.27 },
      T18: { mean: -0.35, sd: 0.30 },
      T13: { mean: -0.20, sd: 0.28 },
    };
    const { mean, sd } = affParams[trisomy];
    const aPdf = Math.exp(-0.5 * ((logPappa - mean) / sd) ** 2) * (0.23 / sd);
    lr *= Math.max(0.05, Math.min(20, aPdf / uPdf));
  }

  if (bhcgMoM !== null && bhcgMoM > 0) {
    const logBhcg = Math.log10(bhcgMoM);
    const uPdf = Math.exp(-0.5 * (logBhcg / 0.24) ** 2);
    const affParams: Record<string, { mean: number; sd: number }> = {
      T21: { mean: 0.10, sd: 0.28 },
      T18: { mean: -0.25, sd: 0.30 },
      T13: { mean: -0.10, sd: 0.27 },
    };
    const { mean, sd } = affParams[trisomy];
    const aPdf = Math.exp(-0.5 * ((logBhcg - mean) / sd) ** 2) * (0.24 / sd);
    lr *= Math.max(0.05, Math.min(20, aPdf / uPdf));
  }

  return lr;
}

/** Likelihood ratios for additional ultrasound markers */
function additionalMarkerLR(
  nasalBone: "present" | "absent" | null,
  ductusPIAbnormal: boolean | null,
  tricuspidRegurg: boolean | null,
  trisomy: "T21" | "T18" | "T13"
): number {
  let lr = 1;

  if (nasalBone !== null) {
    // Absent nasal bone LRs
    const absentLR: Record<string, number> = { T21: 6.58, T18: 2.5, T13: 2.5 };
    const presentLR: Record<string, number> = { T21: 0.46, T18: 0.8, T13: 0.8 };
    lr *= nasalBone === "absent" ? absentLR[trisomy] : presentLR[trisomy];
  }

  if (ductusPIAbnormal !== null) {
    const abnormalLR: Record<string, number> = { T21: 3.80, T18: 2.5, T13: 2.5 };
    const normalLR: Record<string, number> = { T21: 0.72, T18: 0.85, T13: 0.85 };
    lr *= ductusPIAbnormal ? abnormalLR[trisomy] : normalLR[trisomy];
  }

  if (tricuspidRegurg !== null) {
    const regurgLR: Record<string, number> = { T21: 3.94, T18: 2.0, T13: 2.0 };
    const normalLR: Record<string, number> = { T21: 0.60, T18: 0.85, T13: 0.85 };
    lr *= tricuspidRegurg ? regurgLR[trisomy] : normalLR[trisomy];
  }

  return lr;
}

export interface TrisomyInput {
  maternalAge: number;
  crl: number; // mm (45–84)
  nt: number; // mm
  pappaMoM: number | null;
  bhcgMoM: number | null;
  nasalBone: "present" | "absent" | null;
  ductusPIAbnormal: boolean | null;
  tricuspidRegurg: boolean | null;
}

export interface TrisomyResult {
  backgroundRiskT21: number;
  backgroundRiskT18: number;
  backgroundRiskT13: number;
  adjustedRiskT21: number;
  adjustedRiskT18: number;
  adjustedRiskT13: number;
  ntMoM: number;
  riskCategory: "baixo" | "intermediário" | "alto";
  screenPositiveT21: boolean;
  screenPositiveT18T13: boolean;
  method: string;
}

export function calculateTrisomyRisk(input: TrisomyInput): TrisomyResult {
  const bgT21 = getAgeRisk(input.maternalAge, AGE_RISK_T21);
  const bgT18 = getAgeRisk(input.maternalAge, AGE_RISK_T18);
  const bgT13 = getAgeRisk(input.maternalAge, AGE_RISK_T13);

  const ntMoM = ntToMoM(input.nt, input.crl);

  // Calculate combined LRs
  const trisomies = ["T21", "T18", "T13"] as const;
  const bgRisks = [bgT21, bgT18, bgT13];
  const adjustedRisks: number[] = [];

  for (let i = 0; i < trisomies.length; i++) {
    const tri = trisomies[i];
    let combinedLR = ntLikelihoodRatio(input.nt, input.crl, tri);
    combinedLR *= biochemLR(input.pappaMoM, input.bhcgMoM, tri);
    combinedLR *= additionalMarkerLR(
      input.nasalBone,
      input.ductusPIAbnormal,
      input.tricuspidRegurg,
      tri
    );

    // posterior odds = prior odds × LR → risk = 1 / (1 + 1/(prior_odds × LR))
    const priorOdds = 1 / bgRisks[i];
    const posteriorOdds = priorOdds * combinedLR;
    const adjustedRisk = Math.round(1 / posteriorOdds);
    adjustedRisks.push(Math.max(2, adjustedRisk));
  }

  const [adjT21, adjT18, adjT13] = adjustedRisks;

  // Determine method
  const hasBiochem = input.pappaMoM !== null || input.bhcgMoM !== null;
  const hasAdditional = input.nasalBone !== null || input.ductusPIAbnormal !== null || input.tricuspidRegurg !== null;
  let method = "Risco basal (idade materna) + TN";
  if (hasBiochem && hasAdditional) method = "Rastreamento combinado do 1º trimestre + marcadores adicionais";
  else if (hasBiochem) method = "Rastreamento combinado do 1º trimestre (TN + bioquímica)";
  else if (hasAdditional) method = "TN + marcadores ultrassonográficos adicionais";

  // Screen-positive cutoffs (FMF standard)
  const screenPositiveT21 = adjT21 <= 100;
  const screenPositiveT18T13 = adjT18 <= 150 || adjT13 <= 150;

  let riskCategory: "baixo" | "intermediário" | "alto" = "baixo";
  if (adjT21 <= 100 || adjT18 <= 150 || adjT13 <= 150) riskCategory = "alto";
  else if (adjT21 <= 1000 || adjT18 <= 1000 || adjT13 <= 1000) riskCategory = "intermediário";

  return {
    backgroundRiskT21: bgT21,
    backgroundRiskT18: bgT18,
    backgroundRiskT13: bgT13,
    adjustedRiskT21: adjT21,
    adjustedRiskT18: adjT18,
    adjustedRiskT13: adjT13,
    ntMoM,
    riskCategory,
    screenPositiveT21,
    screenPositiveT18T13,
    method,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. PRE-ECLAMPSIA RISK CALCULATOR
   ═══════════════════════════════════════════════════════════════════════════ */

export interface PreeclampsiaInput {
  maternalAge: number;
  weight: number; // kg
  height: number; // cm
  ethnicityAfroCaribbean: boolean;
  nulliparous: boolean;
  conceptionIVF: boolean;

  // Medical history
  chronicHypertension: boolean;
  diabetesType1or2: boolean;
  lupusSLEorAPS: boolean;
  previousPE: boolean;
  familyHistoryPE: boolean;

  // Measurements (optional)
  meanArterialPressure: number | null; // mmHg
  uterineArteryMeanPI: number | null;

  // Biochemistry (optional)
  pappaMoM: number | null;
  plgfMoM: number | null;
}

export interface PreeclampsiaResult {
  riskPreterm: number; // % risk of PE < 37 weeks
  riskEarly: number; // % risk of PE < 34 weeks
  riskAnyPE: number; // % risk of PE at any GA
  cutoffPreterm: boolean; // > 1:100 for preterm PE
  cutoffEarly: boolean;
  recommendation: string;
  method: string;
  riskCategory: "baixo" | "intermediário" | "alto";
}

/**
 * Simplified competing-risks model for pre-eclampsia screening.
 *
 * Based on the FMF algorithm (O'Gorman et al., 2017; Wright et al., 2019)
 * using maternal factors, MAP, UtA-PI, and biomarkers.
 *
 * This is a simplified logistic-regression approximation of the
 * published Gaussian survival model for educational purposes.
 */
export function calculatePreeclampsiaRisk(input: PreeclampsiaInput): PreeclampsiaResult {
  if (input.height <= 0) {
    throw new Error("Altura deve ser maior que zero.");
  }
  const bmi = input.weight / ((input.height / 100) ** 2);

  // Base log-odds for preterm PE (< 37 weeks) — intercept
  let logOddsPreterm = -6.35;
  let logOddsEarly = -7.50;
  let logOddsAny = -4.50;

  // Maternal age (risk increases > 35)
  const ageFactor = (input.maternalAge - 30) * 0.03;
  logOddsPreterm += ageFactor;
  logOddsEarly += ageFactor;
  logOddsAny += ageFactor * 0.8;

  // BMI
  const bmiFactor = (bmi - 24) * 0.04;
  logOddsPreterm += bmiFactor;
  logOddsEarly += bmiFactor * 1.2;
  logOddsAny += bmiFactor * 0.7;

  // Ethnicity
  if (input.ethnicityAfroCaribbean) {
    logOddsPreterm += 0.60;
    logOddsEarly += 0.75;
    logOddsAny += 0.45;
  }

  // Nulliparity
  if (input.nulliparous) {
    logOddsPreterm += 0.70;
    logOddsEarly += 0.65;
    logOddsAny += 0.60;
  }

  // IVF
  if (input.conceptionIVF) {
    logOddsPreterm += 0.45;
    logOddsEarly += 0.55;
    logOddsAny += 0.30;
  }

  // Medical history — high-impact factors
  if (input.chronicHypertension) {
    logOddsPreterm += 1.80;
    logOddsEarly += 2.10;
    logOddsAny += 1.40;
  }
  if (input.diabetesType1or2) {
    logOddsPreterm += 0.85;
    logOddsEarly += 0.95;
    logOddsAny += 0.55;
  }
  if (input.lupusSLEorAPS) {
    logOddsPreterm += 1.20;
    logOddsEarly += 1.50;
    logOddsAny += 0.90;
  }
  if (input.previousPE) {
    logOddsPreterm += 1.65;
    logOddsEarly += 1.85;
    logOddsAny += 1.20;
  }
  if (input.familyHistoryPE) {
    logOddsPreterm += 0.40;
    logOddsEarly += 0.45;
    logOddsAny += 0.35;
  }

  // MAP (expected median ~85 mmHg at 11–13 weeks)
  if (input.meanArterialPressure !== null) {
    const mapMoM = input.meanArterialPressure / 85;
    const mapLogMoM = Math.log(mapMoM);
    logOddsPreterm += mapLogMoM * 4.5;
    logOddsEarly += mapLogMoM * 5.5;
    logOddsAny += mapLogMoM * 3.0;
  }

  // Uterine artery mean PI (expected median ~1.65 at 11–13 weeks)
  if (input.uterineArteryMeanPI !== null) {
    const piMoM = input.uterineArteryMeanPI / 1.65;
    const piLogMoM = Math.log(piMoM);
    logOddsPreterm += piLogMoM * 2.8;
    logOddsEarly += piLogMoM * 3.5;
    logOddsAny += piLogMoM * 1.5;
  }

  // PAPP-A MoM (low PAPP-A → higher risk)
  if (input.pappaMoM !== null && input.pappaMoM > 0) {
    const logPappa = Math.log(input.pappaMoM);
    logOddsPreterm -= logPappa * 0.8;
    logOddsEarly -= logPappa * 1.0;
    logOddsAny -= logPappa * 0.5;
  }

  // PlGF MoM (low PlGF → higher risk)
  if (input.plgfMoM !== null && input.plgfMoM > 0) {
    const logPlgf = Math.log(input.plgfMoM);
    logOddsPreterm -= logPlgf * 1.5;
    logOddsEarly -= logPlgf * 2.0;
    logOddsAny -= logPlgf * 0.8;
  }

  // Convert log-odds to probabilities
  const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
  const riskPreterm = sigmoid(logOddsPreterm) * 100;
  const riskEarly = sigmoid(logOddsEarly) * 100;
  const riskAnyRaw = sigmoid(logOddsAny) * 100;
  // Ensure riskAny >= riskPreterm >= riskEarly
  const riskAny = Math.max(riskAnyRaw, riskPreterm);

  // Cutoffs (FMF: 1:100 for preterm PE as indication for aspirin)
  const cutoffPreterm = riskPreterm >= 1;
  const cutoffEarly = riskEarly >= 1;

  let riskCategory: "baixo" | "intermediário" | "alto" = "baixo";
  if (riskPreterm >= 1) riskCategory = "alto";
  else if (riskPreterm >= 0.5) riskCategory = "intermediário";

  let recommendation = "";
  if (cutoffPreterm) {
    recommendation =
      "Risco elevado (≥ 1:100) para pré-eclâmpsia pré-termo. " +
      "Considerar AAS 150 mg/dia ao deitar a partir de 12 semanas até 36 semanas, " +
      "conforme protocolo FMF/ASPRE. Seguimento com Doppler de artérias uterinas " +
      "e monitoramento de PA no 2º e 3º trimestres.";
  } else if (riskPreterm >= 0.5) {
    recommendation =
      "Risco intermediário para pré-eclâmpsia. Considerar avaliação individualizada. " +
      "Monitoramento pressórico regular e avaliação clínica no 2º trimestre.";
  } else {
    recommendation =
      "Risco baixo para pré-eclâmpsia pré-termo. " +
      "Acompanhamento pré-natal de rotina com monitoramento pressórico.";
  }

  // Method description
  const parts: string[] = ["Fatores maternos"];
  if (input.meanArterialPressure !== null) parts.push("PAM");
  if (input.uterineArteryMeanPI !== null) parts.push("IP art. uterinas");
  if (input.pappaMoM !== null) parts.push("PAPP-A");
  if (input.plgfMoM !== null) parts.push("PlGF");
  const method = parts.join(" + ");

  return {
    riskPreterm: Math.round(riskPreterm * 100) / 100,
    riskEarly: Math.round(riskEarly * 100) / 100,
    riskAnyPE: Math.round(riskAny * 100) / 100,
    cutoffPreterm,
    cutoffEarly,
    recommendation,
    method,
    riskCategory,
  };
}
