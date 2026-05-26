/**
 * Fetal Biometry Calculators
 * References: Hadlock et al. (1984, 1985), Robinson & Fleming (1975), Shepard (1982)
 */

// ---- CRL → Gestational Age (Robinson & Fleming 1975) ----
// GA (days) = 8.052 × √(CRL) + 23.73  (CRL in mm)
export function gestationalAgeFromCRL(crlMm: number): { weeks: number; days: number; totalDays: number } {
  const totalDays = Math.round(8.052 * Math.sqrt(crlMm) + 23.73);
  return { weeks: Math.floor(totalDays / 7), days: totalDays % 7, totalDays };
}

// Valid CRL range: 2–84 mm (approx 5+5 to 14+0 weeks)
export function isValidCRL(crlMm: number): boolean {
  return crlMm >= 2 && crlMm <= 84;
}

// ---- BPD → Gestational Age (Hadlock 1982) ----
// GA (weeks) = 9.54 + 1.482 × BPD + 0.1676 × BPD²  (BPD in cm)
export function gestationalAgeFromBPD(bpdMm: number): { weeks: number; days: number; totalDays: number } {
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
  hc?: number;  // mm
  ac?: number;  // mm
  fl?: number;  // mm
}): { weeks: number; days: number; totalDays: number; estimates: { label: string; weeks: number; days: number }[] } {
  const estimates: { label: string; weeks: number; days: number; totalDays: number }[] = [];

  if (params.bpd && isValidBPD(params.bpd)) {
    const r = gestationalAgeFromBPD(params.bpd);
    estimates.push({ label: "DBP", ...r });
  }

  if (params.hc && params.hc >= 50 && params.hc <= 380) {
    // HC: GA = 8.96 + 0.540 × HC + 0.0003 × HC² (HC in mm, Hadlock 1984)
    const gaWeeks = 8.96 + 0.0540 * params.hc + 0.000003 * params.hc * params.hc;
    const totalDays = Math.round(gaWeeks * 7);
    estimates.push({ label: "CC", weeks: Math.floor(totalDays / 7), days: totalDays % 7, totalDays });
  }

  if (params.ac && params.ac >= 40 && params.ac <= 400) {
    // AC: GA = 8.14 + 0.753 × AC + 0.0036 × AC² (AC in mm/10=cm) → convert
    const acCm = params.ac / 10;
    const gaWeeks = 8.14 + 0.753 * acCm + 0.0036 * acCm * acCm;
    const totalDays = Math.round(gaWeeks * 7);
    estimates.push({ label: "CA", weeks: Math.floor(totalDays / 7), days: totalDays % 7, totalDays });
  }

  if (params.fl && params.fl >= 10 && params.fl <= 85) {
    // FL: GA = 10.35 + 2.460 × FL + 0.170 × FL² (FL in cm)
    const flCm = params.fl / 10;
    const gaWeeks = 10.35 + 2.460 * flCm + 0.170 * flCm * flCm;
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
    estimates: estimates.map(e => ({ label: e.label, weeks: e.weeks, days: e.days })),
  };
}

// ---- Estimated Fetal Weight (Hadlock 1985) ----
// log10(EFW) = 1.326 - 0.00326 × AC × FL + 0.0107 × HC + 0.0438 × AC + 0.158 × FL
// All measurements in cm; EFW in grams
export function estimatedFetalWeight(params: {
  hc: number;  // mm
  ac: number;  // mm
  fl: number;  // mm
  bpd?: number; // mm (optional, for Shepard formula)
}): { weightG: number; weightKg: string; percentileRange: string; formula: string } {
  const hcCm = params.hc / 10;
  const acCm = params.ac / 10;
  const flCm = params.fl / 10;

  // Hadlock 3-parameter (HC, AC, FL)
  const log10EFW = 1.326 - 0.00326 * acCm * flCm + 0.0107 * hcCm + 0.0438 * acCm + 0.158 * flCm;
  const efw = Math.pow(10, log10EFW);
  const weightG = Math.round(efw);

  const weightKg = (weightG / 1000).toFixed(2);

  // Approximate percentile classification
  let percentileRange = "Adequado para a idade gestacional (AIG)";
  // These are rough estimates - proper percentile requires GA-specific curves
  if (weightG < 500) percentileRange = "Peso muito baixo — avaliar CIUR";
  else if (weightG > 4500) percentileRange = "Macrossomia fetal";

  return { weightG, weightKg, percentileRange, formula: "Hadlock (HC, AC, FL)" };
}

// ---- EFW Percentile by GA (simplified Hadlock curves) ----
export function getEFWPercentiles(gaWeeks: number): { p10: number; p50: number; p90: number } | null {
  const table: Record<number, { p10: number; p50: number; p90: number }> = {
    20: { p10: 249, p50: 331, p90: 414 },
    22: { p10: 375, p50: 478, p90: 594 },
    24: { p10: 524, p50: 660, p90: 823 },
    26: { p10: 700, p50: 887, p90: 1100 },
    28: { p10: 908, p50: 1146, p90: 1420 },
    30: { p10: 1153, p50: 1450, p90: 1790 },
    32: { p10: 1429, p50: 1800, p90: 2230 },
    34: { p10: 1735, p50: 2200, p90: 2730 },
    36: { p10: 2064, p50: 2622, p90: 3270 },
    38: { p10: 2395, p50: 3030, p90: 3790 },
    40: { p10: 2680, p50: 3400, p90: 4200 },
  };

  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  let closest = keys[0];
  for (const k of keys) {
    if (Math.abs(k - gaWeeks) < Math.abs(closest - gaWeeks)) closest = k;
  }
  return table[closest] || null;
}

// ---- Due date from GA ----
export function dueDateFromGA(totalDays: number): Date {
  const remaining = 280 - totalDays;
  const today = new Date();
  today.setDate(today.getDate() + remaining);
  return today;
}
