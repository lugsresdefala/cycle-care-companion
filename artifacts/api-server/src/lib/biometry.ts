/**
 * Server-side fetal biometry calculation logic.
 * Formulas: Hadlock 1982/1984/1985, Robinson & Fleming 1975.
 * These formulas are kept server-side so premium computation
 * cannot be executed from client bundles without authentication.
 */

export interface GAEstimate {
  weeks: number;
  days: number;
  totalDays: number;
}

export interface BiometryAverage extends GAEstimate {
  estimates: { label: string; weeks: number; days: number }[];
}

export interface EFWResult {
  weightG: number;
  weightKg: string;
  percentileRange: string;
  formula: string;
  percentiles: { p10: number; p50: number; p90: number } | null;
}

export function gestationalAgeFromCRL(crlMm: number): GAEstimate {
  const totalDays = Math.round(8.052 * Math.sqrt(crlMm) + 23.73);
  return { weeks: Math.floor(totalDays / 7), days: totalDays % 7, totalDays };
}

export function isValidCRL(crlMm: number): boolean {
  return crlMm >= 2 && crlMm <= 84;
}

export function gestationalAgeFromBPD(bpdMm: number): GAEstimate {
  const bpdCm = bpdMm / 10;
  const gaWeeks = 9.54 + 1.482 * bpdCm + 0.1676 * bpdCm * bpdCm;
  const totalDays = Math.round(gaWeeks * 7);
  return { weeks: Math.floor(totalDays / 7), days: totalDays % 7, totalDays };
}

export function isValidBPD(bpdMm: number): boolean {
  return bpdMm >= 14 && bpdMm <= 100;
}

export function gestationalAgeFromMultipleBiometry(params: {
  bpd?: number;
  hc?: number;
  ac?: number;
  fl?: number;
}): BiometryAverage {
  const estimates: { label: string; weeks: number; days: number; totalDays: number }[] = [];

  if (params.bpd && isValidBPD(params.bpd)) {
    estimates.push({ label: "DBP", ...gestationalAgeFromBPD(params.bpd) });
  }

  if (params.hc && params.hc >= 50 && params.hc <= 380) {
    const hcCm = params.hc / 10;
    const gaWeeks = 8.96 + 0.54 * hcCm + 0.0003 * hcCm * hcCm * hcCm;
    const totalDays = Math.round(gaWeeks * 7);
    estimates.push({ label: "CC", weeks: Math.floor(totalDays / 7), days: totalDays % 7, totalDays });
  }

  if (params.ac && params.ac >= 40 && params.ac <= 400) {
    const acCm = params.ac / 10;
    const gaWeeks = 8.14 + 0.753 * acCm + 0.0036 * acCm * acCm;
    const totalDays = Math.round(gaWeeks * 7);
    estimates.push({ label: "CA", weeks: Math.floor(totalDays / 7), days: totalDays % 7, totalDays });
  }

  if (params.fl && params.fl >= 10 && params.fl <= 85) {
    const flCm = params.fl / 10;
    const gaWeeks = 10.35 + 2.46 * flCm + 0.17 * flCm * flCm;
    const totalDays = Math.round(gaWeeks * 7);
    estimates.push({ label: "CF", weeks: Math.floor(totalDays / 7), days: totalDays % 7, totalDays });
  }

  if (estimates.length === 0) {
    return { weeks: 0, days: 0, totalDays: 0, estimates: [] };
  }

  const avgDays = Math.round(estimates.reduce((s, e) => s + e.totalDays, 0) / estimates.length);
  return {
    weeks: Math.floor(avgDays / 7),
    days: avgDays % 7,
    totalDays: avgDays,
    estimates: estimates.map((e) => ({ label: e.label, weeks: e.weeks, days: e.days })),
  };
}

const EFW_PERCENTILES: Record<number, { p10: number; p50: number; p90: number }> = {
  22: { p10: 481, p50: 525, p90: 578 },
  23: { p10: 538, p50: 592, p90: 658 },
  24: { p10: 601, p50: 666, p90: 746 },
  25: { p10: 671, p50: 750, p90: 845 },
  26: { p10: 749, p50: 843, p90: 954 },
  27: { p10: 836, p50: 948, p90: 1077 },
  28: { p10: 931, p50: 1062, p90: 1212 },
  29: { p10: 1035, p50: 1185, p90: 1359 },
  30: { p10: 1148, p50: 1319, p90: 1519 },
  31: { p10: 1268, p50: 1461, p90: 1689 },
  32: { p10: 1397, p50: 1613, p90: 1869 },
  33: { p10: 1533, p50: 1773, p90: 2059 },
  34: { p10: 1677, p50: 1941, p90: 2256 },
  35: { p10: 1826, p50: 2113, p90: 2457 },
  36: { p10: 1978, p50: 2287, p90: 2658 },
  37: { p10: 2131, p50: 2463, p90: 2857 },
  38: { p10: 2284, p50: 2636, p90: 3051 },
  39: { p10: 2433, p50: 2803, p90: 3236 },
  40: { p10: 2575, p50: 2961, p90: 3409 },
};

export function estimatedFetalWeight(params: {
  hc: number;
  ac: number;
  fl: number;
}, gaWeeks?: number | null): EFWResult {
  const hcCm = params.hc / 10;
  const acCm = params.ac / 10;
  const flCm = params.fl / 10;

  const log10EFW =
    1.326 - 0.00326 * acCm * flCm + 0.0107 * hcCm + 0.0438 * acCm + 0.158 * flCm;
  const weightG = Math.round(Math.pow(10, log10EFW));
  const weightKg = (weightG / 1000).toFixed(2);

  let percentileRange = "Adequado para a idade gestacional (AIG)";
  if (weightG < 500) percentileRange = "Peso muito baixo — avaliar CIUR";
  else if (weightG > 4500) percentileRange = "Macrossomia fetal";

  const gaW = gaWeeks != null ? Math.round(gaWeeks) : null;
  const percentiles = gaW !== null ? (EFW_PERCENTILES[gaW] ?? null) : null;

  if (percentiles) {
    if (weightG < percentiles.p10) percentileRange = "Abaixo do percentil 10 — avaliar CIUR";
    else if (weightG > percentiles.p90) percentileRange = "Acima do percentil 90 — avaliar macrossomia";
    else percentileRange = "Entre percentis 10 e 90 — Adequado para IG (AIG)";
  } else if (gaW !== null) {
    percentileRange = "Percentil indisponível — padrão INTERGROWTH-21st definido para IG 22–40 semanas";
  }

  return { weightG, weightKg, percentileRange, formula: "Hadlock (HC, AC, FL)", percentiles };
}

export function dueDateFromGA(totalDays: number): Date {
  const remaining = 280 - totalDays;
  const d = new Date();
  d.setDate(d.getDate() + remaining);
  return d;
}
