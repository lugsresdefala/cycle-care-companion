/**
 * Server-side Fetal Biometry & INTERGROWTH-21st Calculators
 * Kept server-side to prevent client-bundle extraction of premium logic.
 * References: Hadlock et al. (1984, 1985), Robinson & Fleming (1975),
 *             Papageorghiou et al. Lancet 2014, Stirnemann et al. UOG 2017
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface GAResult {
  weeks: number;
  days: number;
  totalDays: number;
  dueDate: string; // ISO date string
  estimates?: { label: string; weeks: number; days: number }[];
}

export interface EFWResult {
  weightG: number;
  weightKg: string;
  percentileRange: string;
  formula: string;
  percentiles: { p10: number; p50: number; p90: number } | null;
}

export type GrowthParameter = "efw" | "hc" | "ac" | "fl" | "bpd";

export interface PercentileRow {
  ga: number;
  p3: number;
  p10: number;
  p50: number;
  p90: number;
  p97: number;
}

export interface GrowthAssessment {
  ga: number;
  value: number;
  percentileLabel: string;
  interpretation: string;
  severity: "normal" | "warning" | "critical";
  closestRow: PercentileRow;
}

// ── CRL → Gestational Age (Robinson & Fleming 1975) ───────────────────────

export function gestationalAgeFromCRL(crlMm: number): { weeks: number; days: number; totalDays: number } {
  const totalDays = Math.round(8.052 * Math.sqrt(crlMm) + 23.73);
  return { weeks: Math.floor(totalDays / 7), days: totalDays % 7, totalDays };
}

export function isValidCRL(crlMm: number): boolean {
  return crlMm >= 2 && crlMm <= 84;
}

// ── BPD → Gestational Age (Hadlock 1982) ──────────────────────────────────

export function gestationalAgeFromBPD(bpdMm: number): { weeks: number; days: number; totalDays: number } {
  const bpdCm = bpdMm / 10;
  const gaWeeks = 9.54 + 1.482 * bpdCm + 0.1676 * bpdCm * bpdCm;
  const totalDays = Math.round(gaWeeks * 7);
  return { weeks: Math.floor(totalDays / 7), days: totalDays % 7, totalDays };
}

export function isValidBPD(bpdMm: number): boolean {
  return bpdMm >= 14 && bpdMm <= 100;
}

// ── Multiple Biometry → GA (Hadlock 1984 composite) ───────────────────────

export function gestationalAgeFromMultipleBiometry(params: {
  bpd?: number;
  hc?: number;
  ac?: number;
  fl?: number;
}): { weeks: number; days: number; totalDays: number; estimates: { label: string; weeks: number; days: number }[] } {
  const estimates: { label: string; weeks: number; days: number; totalDays: number }[] = [];

  if (params.bpd && isValidBPD(params.bpd)) {
    const r = gestationalAgeFromBPD(params.bpd);
    estimates.push({ label: "DBP", ...r });
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

// ── Due date from GA ───────────────────────────────────────────────────────

export function dueDateFromGA(totalDays: number): Date {
  const remaining = 280 - totalDays;
  const today = new Date();
  today.setDate(today.getDate() + remaining);
  return today;
}

// ── Estimated Fetal Weight (Hadlock 1985) ─────────────────────────────────

export function estimatedFetalWeight(params: { hc: number; ac: number; fl: number }): {
  weightG: number;
  weightKg: string;
  formula: string;
} {
  const hcCm = params.hc / 10;
  const acCm = params.ac / 10;
  const flCm = params.fl / 10;
  const log10EFW =
    1.326 - 0.00326 * acCm * flCm + 0.0107 * hcCm + 0.0438 * acCm + 0.158 * flCm;
  const weightG = Math.round(Math.pow(10, log10EFW));
  return { weightG, weightKg: (weightG / 1000).toFixed(2), formula: "Hadlock (HC, AC, FL)" };
}

// ── INTERGROWTH-21st EFW Table (Stirnemann 2017, GA 22–40) ────────────────

const EFW_DATA: PercentileRow[] = [
  { ga: 22, p3: 463, p10: 481, p50: 525, p90: 578, p97: 607 },
  { ga: 23, p3: 516, p10: 538, p50: 592, p90: 658, p97: 695 },
  { ga: 24, p3: 575, p10: 602, p50: 669, p90: 751, p97: 796 },
  { ga: 25, p3: 641, p10: 674, p50: 756, p90: 858, p97: 913 },
  { ga: 26, p3: 716, p10: 757, p50: 856, p90: 980, p97: 1048 },
  { ga: 27, p3: 800, p10: 849, p50: 969, p90: 1119, p97: 1202 },
  { ga: 28, p3: 892, p10: 951, p50: 1097, p90: 1276, p97: 1375 },
  { ga: 29, p3: 994, p10: 1065, p50: 1239, p90: 1452, p97: 1569 },
  { ga: 30, p3: 1106, p10: 1190, p50: 1396, p90: 1647, p97: 1783 },
  { ga: 31, p3: 1227, p10: 1326, p50: 1568, p90: 1860, p97: 2016 },
  { ga: 32, p3: 1357, p10: 1473, p50: 1755, p90: 2089, p97: 2266 },
  { ga: 33, p3: 1495, p10: 1630, p50: 1954, p90: 2332, p97: 2529 },
  { ga: 34, p3: 1641, p10: 1795, p50: 2162, p90: 2583, p97: 2800 },
  { ga: 35, p3: 1792, p10: 1967, p50: 2378, p90: 2838, p97: 3071 },
  { ga: 36, p3: 1948, p10: 2144, p50: 2594, p90: 3089, p97: 3335 },
  { ga: 37, p3: 2106, p10: 2321, p50: 2806, p90: 3326, p97: 3582 },
  { ga: 38, p3: 2265, p10: 2495, p50: 3006, p90: 3541, p97: 3799 },
  { ga: 39, p3: 2422, p10: 2663, p50: 3186, p90: 3722, p97: 3976 },
  { ga: 40, p3: 2574, p10: 2818, p50: 3338, p90: 3858, p97: 4101 },
];

const HC_DATA: PercentileRow[] = [
  { ga: 14, p3: 87.4, p10: 90.7, p50: 97.9, p90: 105, p97: 108.4 },
  { ga: 15, p3: 99.2, p10: 102.8, p50: 110.4, p90: 118, p97: 121.5 },
  { ga: 16, p3: 111.1, p10: 114.9, p50: 122.9, p90: 130.9, p97: 134.7 },
  { ga: 17, p3: 123, p10: 127, p50: 135.4, p90: 143.9, p97: 147.8 },
  { ga: 18, p3: 134.9, p10: 139.1, p50: 147.9, p90: 156.7, p97: 160.9 },
  { ga: 19, p3: 146.8, p10: 151.1, p50: 160.3, p90: 169.5, p97: 173.8 },
  { ga: 20, p3: 158.5, p10: 163, p50: 172.5, p90: 182, p97: 186.5 },
  { ga: 21, p3: 170.1, p10: 174.7, p50: 184.5, p90: 194.3, p97: 199 },
  { ga: 22, p3: 181.4, p10: 186.2, p50: 196.3, p90: 206.4, p97: 211.2 },
  { ga: 23, p3: 192.6, p10: 197.5, p50: 207.8, p90: 218.2, p97: 223.1 },
  { ga: 24, p3: 203.5, p10: 208.5, p50: 219.1, p90: 229.7, p97: 234.7 },
  { ga: 25, p3: 214.1, p10: 219.1, p50: 230, p90: 240.8, p97: 245.9 },
  { ga: 26, p3: 224.3, p10: 229.5, p50: 240.5, p90: 251.6, p97: 256.7 },
  { ga: 27, p3: 234.1, p10: 239.4, p50: 250.7, p90: 261.9, p97: 267.2 },
  { ga: 28, p3: 243.6, p10: 248.9, p50: 260.4, p90: 271.8, p97: 277.2 },
  { ga: 29, p3: 252.5, p10: 258, p50: 269.6, p90: 281.3, p97: 286.7 },
  { ga: 30, p3: 261, p10: 266.5, p50: 278.4, p90: 290.2, p97: 295.8 },
  { ga: 31, p3: 268.9, p10: 274.6, p50: 286.6, p90: 298.7, p97: 304.4 },
  { ga: 32, p3: 276.3, p10: 282.1, p50: 294.4, p90: 306.7, p97: 312.5 },
  { ga: 33, p3: 283, p10: 288.9, p50: 301.5, p90: 314.1, p97: 320 },
  { ga: 34, p3: 289.1, p10: 295.2, p50: 308.1, p90: 321, p97: 327.1 },
  { ga: 35, p3: 294.5, p10: 300.8, p50: 314.1, p90: 327.4, p97: 333.6 },
  { ga: 36, p3: 299.2, p10: 305.6, p50: 319.4, p90: 333.2, p97: 339.6 },
  { ga: 37, p3: 303.1, p10: 309.8, p50: 324.1, p90: 338.4, p97: 345.1 },
  { ga: 38, p3: 306.1, p10: 313.1, p50: 328.1, p90: 343, p97: 350 },
  { ga: 39, p3: 308.3, p10: 315.7, p50: 331.4, p90: 347.1, p97: 354.4 },
  { ga: 40, p3: 309.6, p10: 317.4, p50: 333.9, p90: 350.5, p97: 358.3 },
];

const AC_DATA: PercentileRow[] = [
  { ga: 14, p3: 72.9, p10: 75.3, p50: 80.6, p90: 85.9, p97: 88.4 },
  { ga: 15, p3: 82.9, p10: 85.8, p50: 91.9, p90: 98.1, p97: 100.9 },
  { ga: 16, p3: 93, p10: 96.3, p50: 103.2, p90: 110.1, p97: 113.4 },
  { ga: 17, p3: 103.1, p10: 106.7, p50: 114.4, p90: 122.1, p97: 125.7 },
  { ga: 18, p3: 113.2, p10: 117.2, p50: 125.6, p90: 134, p97: 138 },
  { ga: 19, p3: 123.3, p10: 127.6, p50: 136.7, p90: 145.8, p97: 150.1 },
  { ga: 20, p3: 133.4, p10: 138, p50: 147.7, p90: 157.5, p97: 162.1 },
  { ga: 21, p3: 143.4, p10: 148.3, p50: 158.7, p90: 169.1, p97: 174 },
  { ga: 22, p3: 153.5, p10: 158.6, p50: 169.6, p90: 180.6, p97: 185.7 },
  { ga: 23, p3: 163.4, p10: 168.9, p50: 180.4, p90: 192, p97: 197.4 },
  { ga: 24, p3: 173.3, p10: 179, p50: 191.2, p90: 203.3, p97: 209 },
  { ga: 25, p3: 183.2, p10: 189.1, p50: 201.8, p90: 214.5, p97: 220.5 },
  { ga: 26, p3: 192.9, p10: 199.1, p50: 212.4, p90: 225.7, p97: 231.9 },
  { ga: 27, p3: 202.6, p10: 209.1, p50: 222.9, p90: 236.8, p97: 243.2 },
  { ga: 28, p3: 212.1, p10: 218.8, p50: 233.3, p90: 247.8, p97: 254.5 },
  { ga: 29, p3: 221.4, p10: 228.5, p50: 243.6, p90: 258.7, p97: 265.8 },
  { ga: 30, p3: 230.6, p10: 238, p50: 253.8, p90: 269.6, p97: 277 },
  { ga: 31, p3: 239.6, p10: 247.4, p50: 263.9, p90: 280.5, p97: 288.3 },
  { ga: 32, p3: 248.4, p10: 256.5, p50: 273.9, p90: 291.3, p97: 299.5 },
  { ga: 33, p3: 256.9, p10: 265.5, p50: 283.8, p90: 302.2, p97: 310.7 },
  { ga: 34, p3: 265.2, p10: 274.3, p50: 293.6, p90: 313, p97: 322 },
  { ga: 35, p3: 273.2, p10: 282.8, p50: 303.3, p90: 323.8, p97: 333.4 },
  { ga: 36, p3: 280.8, p10: 291, p50: 312.8, p90: 334.6, p97: 344.9 },
  { ga: 37, p3: 288.1, p10: 299, p50: 322.3, p90: 345.5, p97: 356.4 },
  { ga: 38, p3: 295.1, p10: 306.7, p50: 331.6, p90: 356.4, p97: 368.1 },
  { ga: 39, p3: 301.6, p10: 314.1, p50: 340.8, p90: 367.4, p97: 379.9 },
  { ga: 40, p3: 307.7, p10: 321.1, p50: 349.8, p90: 378.5, p97: 392 },
];

const FL_DATA: PercentileRow[] = [
  { ga: 14, p3: 10.3, p10: 11.2, p50: 13.1, p90: 15.1, p97: 16 },
  { ga: 15, p3: 13.4, p10: 14.3, p50: 16.3, p90: 18.3, p97: 19.3 },
  { ga: 16, p3: 16.4, p10: 17.4, p50: 19.5, p90: 21.5, p97: 22.5 },
  { ga: 17, p3: 19.4, p10: 20.4, p50: 22.5, p90: 24.7, p97: 25.7 },
  { ga: 18, p3: 22.3, p10: 23.4, p50: 25.5, p90: 27.7, p97: 28.7 },
  { ga: 19, p3: 25.2, p10: 26.2, p50: 28.5, p90: 30.7, p97: 31.7 },
  { ga: 20, p3: 28, p10: 29, p50: 31.3, p90: 33.6, p97: 34.6 },
  { ga: 21, p3: 30.6, p10: 31.7, p50: 34.1, p90: 36.4, p97: 37.5 },
  { ga: 22, p3: 33.3, p10: 34.4, p50: 36.7, p90: 39.1, p97: 40.2 },
  { ga: 23, p3: 35.8, p10: 36.9, p50: 39.4, p90: 41.8, p97: 42.9 },
  { ga: 24, p3: 38.3, p10: 39.4, p50: 41.9, p90: 44.4, p97: 45.5 },
  { ga: 25, p3: 40.6, p10: 41.8, p50: 44.4, p90: 46.9, p97: 48.1 },
  { ga: 26, p3: 42.9, p10: 44.1, p50: 46.7, p90: 49.3, p97: 50.5 },
  { ga: 27, p3: 45.1, p10: 46.4, p50: 49, p90: 51.7, p97: 52.9 },
  { ga: 28, p3: 47.3, p10: 48.6, p50: 51.3, p90: 54, p97: 55.3 },
  { ga: 29, p3: 49.3, p10: 50.6, p50: 53.4, p90: 56.2, p97: 57.5 },
  { ga: 30, p3: 51.3, p10: 52.6, p50: 55.5, p90: 58.4, p97: 59.7 },
  { ga: 31, p3: 53.2, p10: 54.6, p50: 57.5, p90: 60.5, p97: 61.9 },
  { ga: 32, p3: 55, p10: 56.4, p50: 59.4, p90: 62.5, p97: 63.9 },
  { ga: 33, p3: 56.7, p10: 58.2, p50: 61.3, p90: 64.4, p97: 65.9 },
  { ga: 34, p3: 58.3, p10: 59.8, p50: 63.1, p90: 66.3, p97: 67.8 },
  { ga: 35, p3: 59.8, p10: 61.4, p50: 64.8, p90: 68.1, p97: 69.7 },
  { ga: 36, p3: 61.3, p10: 62.9, p50: 66.4, p90: 69.9, p97: 71.5 },
  { ga: 37, p3: 62.6, p10: 64.3, p50: 67.9, p90: 71.6, p97: 73.3 },
  { ga: 38, p3: 63.9, p10: 65.6, p50: 69.4, p90: 73.2, p97: 75 },
  { ga: 39, p3: 65, p10: 66.9, p50: 70.8, p90: 74.7, p97: 76.6 },
  { ga: 40, p3: 66.1, p10: 68, p50: 72.1, p90: 76.2, p97: 78.2 },
];

const BPD_DATA: PercentileRow[] = [
  { ga: 14, p3: 26.3, p10: 27.4, p50: 29.6, p90: 31.8, p97: 32.9 },
  { ga: 15, p3: 29.1, p10: 30.2, p50: 32.6, p90: 34.9, p97: 36 },
  { ga: 16, p3: 32, p10: 33.2, p50: 35.7, p90: 38.1, p97: 39.3 },
  { ga: 17, p3: 35, p10: 36.2, p50: 38.8, p90: 41.4, p97: 42.6 },
  { ga: 18, p3: 38, p10: 39.3, p50: 42, p90: 44.7, p97: 45.9 },
  { ga: 19, p3: 41.1, p10: 42.4, p50: 45.2, p90: 48, p97: 49.3 },
  { ga: 20, p3: 44.1, p10: 45.5, p50: 48.4, p90: 51.4, p97: 52.8 },
  { ga: 21, p3: 47.2, p10: 48.6, p50: 51.7, p90: 54.8, p97: 56.2 },
  { ga: 22, p3: 50.3, p10: 51.8, p50: 55, p90: 58.1, p97: 59.6 },
  { ga: 23, p3: 53.4, p10: 54.9, p50: 58.2, p90: 61.5, p97: 63 },
  { ga: 24, p3: 56.4, p10: 58, p50: 61.4, p90: 64.8, p97: 66.4 },
  { ga: 25, p3: 59.4, p10: 61, p50: 64.5, p90: 68, p97: 69.7 },
  { ga: 26, p3: 62.3, p10: 64, p50: 67.6, p90: 71.2, p97: 72.9 },
  { ga: 27, p3: 65.2, p10: 66.9, p50: 70.6, p90: 74.3, p97: 76 },
  { ga: 28, p3: 67.9, p10: 69.7, p50: 73.5, p90: 77.3, p97: 79 },
  { ga: 29, p3: 70.6, p10: 72.4, p50: 76.3, p90: 80.1, p97: 81.9 },
  { ga: 30, p3: 73.1, p10: 75, p50: 78.9, p90: 82.8, p97: 84.7 },
  { ga: 31, p3: 75.5, p10: 77.4, p50: 81.4, p90: 85.4, p97: 87.3 },
  { ga: 32, p3: 77.8, p10: 79.7, p50: 83.8, p90: 87.8, p97: 89.8 },
  { ga: 33, p3: 79.8, p10: 81.8, p50: 85.9, p90: 90.1, p97: 92 },
  { ga: 34, p3: 81.7, p10: 83.7, p50: 87.9, p90: 92.2, p97: 94.1 },
  { ga: 35, p3: 83.3, p10: 85.3, p50: 89.7, p90: 94, p97: 96 },
  { ga: 36, p3: 84.7, p10: 86.8, p50: 91.2, p90: 95.7, p97: 97.7 },
  { ga: 37, p3: 85.9, p10: 88, p50: 92.5, p90: 97.1, p97: 99.2 },
  { ga: 38, p3: 86.7, p10: 88.9, p50: 93.6, p90: 98.3, p97: 100.5 },
  { ga: 39, p3: 87.3, p10: 89.6, p50: 94.4, p90: 99.2, p97: 101.5 },
  { ga: 40, p3: 87.5, p10: 89.9, p50: 94.9, p90: 99.9, p97: 102.3 },
];

const DATA_MAP: Record<GrowthParameter, PercentileRow[]> = {
  efw: EFW_DATA,
  hc: HC_DATA,
  ac: AC_DATA,
  fl: FL_DATA,
  bpd: BPD_DATA,
};

export function getGrowthData(param: GrowthParameter): PercentileRow[] {
  return DATA_MAP[param];
}

export function getEFWPercentiles(gaWeeks: number): { p10: number; p50: number; p90: number } | null {
  const ga = Math.round(gaWeeks);
  const row = EFW_DATA.find((r) => r.ga === ga);
  if (!row) return null;
  return { p10: row.p10, p50: row.p50, p90: row.p90 };
}

export function assessGrowth(param: GrowthParameter, ga: number, value: number): GrowthAssessment {
  const data = DATA_MAP[param];
  let closest = data[0];
  for (const row of data) {
    if (Math.abs(row.ga - ga) < Math.abs(closest.ga - ga)) closest = row;
  }

  let percentileLabel: string;
  let interpretation: string;
  let severity: "normal" | "warning" | "critical";

  if (value < closest.p3) {
    percentileLabel = "< P3";
    interpretation = "Muito abaixo do esperado — investigação obrigatória";
    severity = "critical";
  } else if (value < closest.p10) {
    percentileLabel = "P3–P10";
    interpretation = "Abaixo do esperado — acompanhamento rigoroso";
    severity = "warning";
  } else if (value <= closest.p90) {
    percentileLabel = "P10–P90";
    interpretation = "Dentro da faixa de normalidade";
    severity = "normal";
  } else if (value <= closest.p97) {
    percentileLabel = "P90–P97";
    interpretation = "Acima do esperado — monitorizar";
    severity = "warning";
  } else {
    percentileLabel = "> P97";
    interpretation = "Muito acima do esperado — investigação recomendada";
    severity = "warning";
  }

  return { ga, value, percentileLabel, interpretation, severity, closestRow: closest };
}
