/**
 * Fetal Biometry Calculators
 * References: Hadlock et al. (1984, 1985), Robinson & Fleming (1975), Shepard (1982)
 */

import { getGrowthData } from "./intergrowth";

// ---- CRL → Gestational Age (Robinson & Fleming 1975) ----
// GA (days) = 8.052 × √(CRL) + 23.73  (CRL in mm)
export function gestationalAgeFromCRL(crlMm: number): {
  weeks: number;
  days: number;
  totalDays: number;
} {
  const totalDays = Math.round(8.052 * Math.sqrt(crlMm) + 23.73);
  return { weeks: Math.floor(totalDays / 7), days: totalDays % 7, totalDays };
}

// Valid CRL range: 2–84 mm (approx 5+5 to 14+0 weeks)
export function isValidCRL(crlMm: number): boolean {
  return crlMm >= 2 && crlMm <= 84;
}

// ---- BPD → Gestational Age (Hadlock 1982) ----
// GA (weeks) = 9.54 + 1.482 × BPD + 0.1676 × BPD²  (BPD in cm)
export function gestationalAgeFromBPD(bpdMm: number): {
  weeks: number;
  days: number;
  totalDays: number;
} {
  const bpdCm = bpdMm / 10;
  const gaWeeks = 9.54 + 1.482 * bpdCm + 0.1676 * bpdCm * bpdCm;
  const totalDays = Math.round(gaWeeks * 7);
  return { weeks: Math.floor(totalDays / 7), days: totalDays % 7, totalDays };
}

// Valid BPD range: 14–100 mm (approx 12–40 weeks)
export function isValidBPD(bpdMm: number): boolean {
  return bpdMm >= 14 && bpdMm <= 100;
}

// ---- Multiple Biometry → GA (Hadlock 1984 composite) ----
// Uses average of individual estimates
export function gestationalAgeFromMultipleBiometry(params: {
  bpd?: number; // mm
  hc?: number; // mm
  ac?: number; // mm
  fl?: number; // mm
}): {
  weeks: number;
  days: number;
  totalDays: number;
  estimates: { label: string; weeks: number; days: number }[];
} {
  const estimates: {
    label: string;
    weeks: number;
    days: number;
    totalDays: number;
  }[] = [];

  if (params.bpd && isValidBPD(params.bpd)) {
    const r = gestationalAgeFromBPD(params.bpd);
    estimates.push({ label: "DBP", ...r });
  }

  if (params.hc && params.hc >= 50 && params.hc <= 380) {
    // HC → GA (Hadlock 1984): MA = 8.96 + 0.540 × HC + 0.0003 × HC³ (HC in cm)
    const hcCm = params.hc / 10;
    const gaWeeks = 8.96 + 0.54 * hcCm + 0.0003 * hcCm * hcCm * hcCm;
    const totalDays = Math.round(gaWeeks * 7);
    estimates.push({
      label: "CC",
      weeks: Math.floor(totalDays / 7),
      days: totalDays % 7,
      totalDays,
    });
  }

  if (params.ac && params.ac >= 40 && params.ac <= 400) {
    // AC: GA = 8.14 + 0.753 × AC + 0.0036 × AC² (AC in mm/10=cm) → convert
    const acCm = params.ac / 10;
    const gaWeeks = 8.14 + 0.753 * acCm + 0.0036 * acCm * acCm;
    const totalDays = Math.round(gaWeeks * 7);
    estimates.push({
      label: "CA",
      weeks: Math.floor(totalDays / 7),
      days: totalDays % 7,
      totalDays,
    });
  }

  if (params.fl && params.fl >= 10 && params.fl <= 85) {
    // FL: GA = 10.35 + 2.460 × FL + 0.170 × FL² (FL in cm)
    const flCm = params.fl / 10;
    const gaWeeks = 10.35 + 2.46 * flCm + 0.17 * flCm * flCm;
    const totalDays = Math.round(gaWeeks * 7);
    estimates.push({
      label: "CF",
      weeks: Math.floor(totalDays / 7),
      days: totalDays % 7,
      totalDays,
    });
  }

  if (estimates.length === 0) {
    return { weeks: 0, days: 0, totalDays: 0, estimates: [] };
  }

  const avgDays = Math.round(
    estimates.reduce((s, e) => s + e.totalDays, 0) / estimates.length,
  );
  return {
    weeks: Math.floor(avgDays / 7),
    days: avgDays % 7,
    totalDays: avgDays,
    estimates: estimates.map((e) => ({
      label: e.label,
      weeks: e.weeks,
      days: e.days,
    })),
  };
}

// ---- Estimated Fetal Weight (Hadlock 1985) ----
// log10(EFW) = 1.326 - 0.00326 × AC × FL + 0.0107 × HC + 0.0438 × AC + 0.158 × FL
// All measurements in cm; EFW in grams
export function estimatedFetalWeight(params: {
  hc: number; // mm
  ac: number; // mm
  fl: number; // mm
  bpd?: number; // mm (optional, for Shepard formula)
}): {
  weightG: number;
  weightKg: string;
  percentileRange: string;
  formula: string;
} {
  const hcCm = params.hc / 10;
  const acCm = params.ac / 10;
  const flCm = params.fl / 10;

  // Hadlock 3-parameter (HC, AC, FL)
  const log10EFW =
    1.326 -
    0.00326 * acCm * flCm +
    0.0107 * hcCm +
    0.0438 * acCm +
    0.158 * flCm;
  const efw = Math.pow(10, log10EFW);
  const weightG = Math.round(efw);

  const weightKg = (weightG / 1000).toFixed(2);

  // Approximate percentile classification
  let percentileRange = "Adequado para a idade gestacional (AIG)";
  // These are rough estimates - proper percentile requires GA-specific curves
  if (weightG < 500) percentileRange = "Peso muito baixo — avaliar CIUR";
  else if (weightG > 4500) percentileRange = "Macrossomia fetal";

  return {
    weightG,
    weightKg,
    percentileRange,
    formula: "Hadlock (HC, AC, FL)",
  };
}

// ---- EFW Percentile by GA — INTERGROWTH-21st official table (single source) ----
// Defined for GA 22–40 weeks (the INTERGROWTH-21st EFW standard is not defined < 22 weeks).
export function getEFWPercentiles(
  gaWeeks: number,
): { p10: number; p50: number; p90: number } | null {
  const data = getGrowthData("efw");
  const ga = Math.round(gaWeeks);
  const row = data.find((r) => r.ga === ga);
  if (!row) return null;
  return { p10: row.p10, p50: row.p50, p90: row.p90 };
}

// ---- Due date from GA ----
export function dueDateFromGA(totalDays: number): Date {
  const remaining = 280 - totalDays;
  const today = new Date();
  today.setDate(today.getDate() + remaining);
  return today;
}
