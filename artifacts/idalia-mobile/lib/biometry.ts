/**
 * Fetal Biometry Calculators
 * Refs: Hadlock 1982/1984/1985, Robinson & Fleming 1975.
 */

export interface GAEstimate {
  weeks: number;
  days: number;
  totalDays: number;
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

export interface BiometryAverage extends GAEstimate {
  estimates: { label: string; weeks: number; days: number }[];
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
    const gaWeeks = 8.96 + 0.054 * params.hc + 0.000003 * params.hc * params.hc;
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

export interface EFWResult {
  weightG: number;
  weightKg: string;
  classification: string;
  formula: string;
}

export function estimatedFetalWeight(params: { hc: number; ac: number; fl: number }): EFWResult {
  const hcCm = params.hc / 10;
  const acCm = params.ac / 10;
  const flCm = params.fl / 10;
  const log10EFW =
    1.326 - 0.00326 * acCm * flCm + 0.0107 * hcCm + 0.0438 * acCm + 0.158 * flCm;
  const weightG = Math.round(Math.pow(10, log10EFW));
  const weightKg = (weightG / 1000).toFixed(2);
  let classification = "Adequado para a idade gestacional (AIG)";
  if (weightG < 500) classification = "Peso muito baixo — avaliar CIUR";
  else if (weightG > 4500) classification = "Macrossomia fetal";
  return { weightG, weightKg, classification, formula: "Hadlock (CC, CA, CF)" };
}

export function dueDateFromGA(totalDays: number): Date {
  const remaining = 280 - totalDays;
  const d = new Date();
  d.setDate(d.getDate() + remaining);
  return d;
}
