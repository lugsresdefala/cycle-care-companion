/**
 * INTERGROWTH-21st Fetal Growth Standards
 * Reference: Papageorghiou AT et al., Lancet 2014; 384:869–79 (PMID 25209488)
 * Stirnemann J et al., Ultrasound Obstet Gynecol 2017 (EFW)
 *
 * Percentile data (P3, P10, P50, P90, P97) for EFW (g), HC (mm), AC (mm), FL (mm), BPD (mm)
 * GA range: 14–40 weeks
 */

export type GrowthParameter = "efw" | "hc" | "ac" | "fl" | "bpd";

export interface PercentileRow {
  ga: number; // weeks
  p3: number;
  p10: number;
  p50: number;
  p90: number;
  p97: number;
}

export interface GrowthParameterMeta {
  key: GrowthParameter;
  label: string;
  fullName: string;
  unit: string;
  minGA: number;
  maxGA: number;
}

export const GROWTH_PARAMS: GrowthParameterMeta[] = [
  { key: "efw", label: "PFE", fullName: "Peso Fetal Estimado", unit: "g", minGA: 14, maxGA: 40 },
  { key: "hc", label: "CC", fullName: "Circunferência Cefálica", unit: "mm", minGA: 14, maxGA: 40 },
  { key: "ac", label: "CA", fullName: "Circunferência Abdominal", unit: "mm", minGA: 14, maxGA: 40 },
  { key: "fl", label: "CF", fullName: "Comprimento do Fêmur", unit: "mm", minGA: 14, maxGA: 40 },
  { key: "bpd", label: "DBP", fullName: "Diâmetro Biparietal", unit: "mm", minGA: 14, maxGA: 40 },
];

// ── EFW (grams) — INTERGROWTH-21st / Stirnemann 2017 ──
const EFW_DATA: PercentileRow[] = [
  { ga: 14, p3: 57, p10: 65, p50: 81, p90: 100, p97: 113 },
  { ga: 15, p3: 75, p10: 86, p50: 108, p90: 134, p97: 152 },
  { ga: 16, p3: 99, p10: 113, p50: 141, p90: 176, p97: 199 },
  { ga: 17, p3: 128, p10: 147, p50: 183, p90: 228, p97: 258 },
  { ga: 18, p3: 164, p10: 188, p50: 235, p90: 293, p97: 332 },
  { ga: 19, p3: 208, p10: 239, p50: 299, p90: 373, p97: 422 },
  { ga: 20, p3: 261, p10: 300, p50: 376, p90: 469, p97: 531 },
  { ga: 21, p3: 325, p10: 374, p50: 469, p90: 585, p97: 662 },
  { ga: 22, p3: 401, p10: 462, p50: 580, p90: 724, p97: 819 },
  { ga: 23, p3: 492, p10: 567, p50: 712, p90: 889, p97: 1005 },
  { ga: 24, p3: 598, p10: 690, p50: 868, p90: 1084, p97: 1226 },
  { ga: 25, p3: 722, p10: 833, p50: 1049, p90: 1311, p97: 1483 },
  { ga: 26, p3: 863, p10: 997, p50: 1258, p90: 1573, p97: 1781 },
  { ga: 27, p3: 1023, p10: 1183, p50: 1496, p90: 1873, p97: 2121 },
  { ga: 28, p3: 1199, p10: 1389, p50: 1761, p90: 2209, p97: 2503 },
  { ga: 29, p3: 1389, p10: 1612, p50: 2049, p90: 2577, p97: 2924 },
  { ga: 30, p3: 1588, p10: 1846, p50: 2354, p90: 2972, p97: 3378 },
  { ga: 31, p3: 1790, p10: 2085, p50: 2668, p90: 3379, p97: 3849 },
  { ga: 32, p3: 1990, p10: 2322, p50: 2982, p90: 3789, p97: 4327 },
  { ga: 33, p3: 2180, p10: 2549, p50: 3286, p90: 4191, p97: 4795 },
  { ga: 34, p3: 2354, p10: 2760, p50: 3572, p90: 4572, p97: 5241 },
  { ga: 35, p3: 2508, p10: 2947, p50: 3833, p90: 4922, p97: 5652 },
  { ga: 36, p3: 2636, p10: 3105, p50: 4060, p90: 5230, p97: 6017 },
  { ga: 37, p3: 2735, p10: 3228, p50: 4247, p90: 5492, p97: 6328 },
  { ga: 38, p3: 2804, p10: 3314, p50: 4389, p90: 5697, p97: 6580 },
  { ga: 39, p3: 2843, p10: 3362, p50: 4481, p90: 5843, p97: 6770 },
  { ga: 40, p3: 2853, p10: 3373, p50: 4524, p90: 5930, p97: 6896 },
];

// ── HC (mm) ──
const HC_DATA: PercentileRow[] = [
  { ga: 14, p3: 85, p10: 89, p50: 98, p90: 107, p97: 111 },
  { ga: 15, p3: 99, p10: 104, p50: 113, p90: 123, p97: 128 },
  { ga: 16, p3: 113, p10: 118, p50: 129, p90: 140, p97: 145 },
  { ga: 17, p3: 127, p10: 133, p50: 145, p90: 157, p97: 163 },
  { ga: 18, p3: 141, p10: 148, p50: 161, p90: 174, p97: 181 },
  { ga: 19, p3: 155, p10: 162, p50: 177, p90: 192, p97: 199 },
  { ga: 20, p3: 169, p10: 177, p50: 193, p90: 209, p97: 217 },
  { ga: 21, p3: 183, p10: 191, p50: 209, p90: 227, p97: 235 },
  { ga: 22, p3: 197, p10: 206, p50: 225, p90: 244, p97: 253 },
  { ga: 23, p3: 210, p10: 220, p50: 240, p90: 261, p97: 271 },
  { ga: 24, p3: 224, p10: 234, p50: 256, p90: 278, p97: 288 },
  { ga: 25, p3: 237, p10: 248, p50: 271, p90: 294, p97: 305 },
  { ga: 26, p3: 250, p10: 261, p50: 286, p90: 310, p97: 322 },
  { ga: 27, p3: 262, p10: 274, p50: 300, p90: 326, p97: 338 },
  { ga: 28, p3: 274, p10: 287, p50: 314, p90: 341, p97: 354 },
  { ga: 29, p3: 286, p10: 299, p50: 327, p90: 356, p97: 369 },
  { ga: 30, p3: 297, p10: 310, p50: 340, p90: 370, p97: 383 },
  { ga: 31, p3: 307, p10: 321, p50: 352, p90: 383, p97: 397 },
  { ga: 32, p3: 316, p10: 331, p50: 363, p90: 395, p97: 410 },
  { ga: 33, p3: 325, p10: 340, p50: 374, p90: 407, p97: 422 },
  { ga: 34, p3: 333, p10: 349, p50: 383, p90: 417, p97: 433 },
  { ga: 35, p3: 340, p10: 356, p50: 392, p90: 427, p97: 443 },
  { ga: 36, p3: 346, p10: 363, p50: 399, p90: 435, p97: 452 },
  { ga: 37, p3: 351, p10: 368, p50: 405, p90: 443, p97: 460 },
  { ga: 38, p3: 355, p10: 373, p50: 411, p90: 449, p97: 467 },
  { ga: 39, p3: 358, p10: 376, p50: 415, p90: 454, p97: 472 },
  { ga: 40, p3: 360, p10: 378, p50: 418, p90: 458, p97: 476 },
];

// ── AC (mm) ──
const AC_DATA: PercentileRow[] = [
  { ga: 14, p3: 67, p10: 72, p50: 81, p90: 91, p97: 96 },
  { ga: 15, p3: 80, p10: 85, p50: 96, p90: 107, p97: 113 },
  { ga: 16, p3: 93, p10: 99, p50: 112, p90: 124, p97: 131 },
  { ga: 17, p3: 107, p10: 114, p50: 128, p90: 142, p97: 150 },
  { ga: 18, p3: 122, p10: 129, p50: 145, p90: 161, p97: 169 },
  { ga: 19, p3: 137, p10: 145, p50: 163, p90: 180, p97: 190 },
  { ga: 20, p3: 152, p10: 161, p50: 181, p90: 200, p97: 211 },
  { ga: 21, p3: 168, p10: 178, p50: 199, p90: 221, p97: 232 },
  { ga: 22, p3: 184, p10: 195, p50: 218, p90: 242, p97: 254 },
  { ga: 23, p3: 200, p10: 212, p50: 237, p90: 263, p97: 277 },
  { ga: 24, p3: 217, p10: 229, p50: 257, p90: 285, p97: 300 },
  { ga: 25, p3: 233, p10: 247, p50: 277, p90: 307, p97: 323 },
  { ga: 26, p3: 250, p10: 265, p50: 297, p90: 329, p97: 346 },
  { ga: 27, p3: 266, p10: 282, p50: 317, p90: 351, p97: 369 },
  { ga: 28, p3: 282, p10: 299, p50: 336, p90: 373, p97: 392 },
  { ga: 29, p3: 298, p10: 316, p50: 355, p90: 395, p97: 415 },
  { ga: 30, p3: 313, p10: 332, p50: 374, p90: 416, p97: 437 },
  { ga: 31, p3: 328, p10: 348, p50: 392, p90: 436, p97: 458 },
  { ga: 32, p3: 341, p10: 362, p50: 409, p90: 455, p97: 478 },
  { ga: 33, p3: 354, p10: 375, p50: 424, p90: 473, p97: 497 },
  { ga: 34, p3: 365, p10: 388, p50: 438, p90: 489, p97: 514 },
  { ga: 35, p3: 375, p10: 398, p50: 451, p90: 504, p97: 530 },
  { ga: 36, p3: 383, p10: 407, p50: 462, p90: 517, p97: 543 },
  { ga: 37, p3: 389, p10: 414, p50: 471, p90: 528, p97: 555 },
  { ga: 38, p3: 394, p10: 420, p50: 479, p90: 537, p97: 564 },
  { ga: 39, p3: 397, p10: 423, p50: 484, p90: 544, p97: 572 },
  { ga: 40, p3: 398, p10: 425, p50: 487, p90: 549, p97: 578 },
];

// ── FL (mm) ──
const FL_DATA: PercentileRow[] = [
  { ga: 14, p3: 11, p10: 12, p50: 15, p90: 18, p97: 19 },
  { ga: 15, p3: 14, p10: 16, p50: 19, p90: 22, p97: 24 },
  { ga: 16, p3: 18, p10: 19, p50: 23, p90: 27, p97: 28 },
  { ga: 17, p3: 21, p10: 23, p50: 27, p90: 31, p97: 33 },
  { ga: 18, p3: 25, p10: 27, p50: 31, p90: 36, p97: 38 },
  { ga: 19, p3: 28, p10: 30, p50: 35, p90: 40, p97: 42 },
  { ga: 20, p3: 31, p10: 34, p50: 39, p90: 45, p97: 47 },
  { ga: 21, p3: 35, p10: 37, p50: 43, p90: 49, p97: 51 },
  { ga: 22, p3: 38, p10: 40, p50: 47, p90: 53, p97: 55 },
  { ga: 23, p3: 41, p10: 43, p50: 50, p90: 57, p97: 59 },
  { ga: 24, p3: 44, p10: 46, p50: 53, p90: 61, p97: 63 },
  { ga: 25, p3: 47, p10: 49, p50: 57, p90: 64, p97: 67 },
  { ga: 26, p3: 49, p10: 52, p50: 60, p90: 67, p97: 70 },
  { ga: 27, p3: 52, p10: 54, p50: 63, p90: 71, p97: 73 },
  { ga: 28, p3: 54, p10: 57, p50: 65, p90: 74, p97: 76 },
  { ga: 29, p3: 56, p10: 59, p50: 68, p90: 76, p97: 79 },
  { ga: 30, p3: 58, p10: 61, p50: 70, p90: 79, p97: 82 },
  { ga: 31, p3: 60, p10: 63, p50: 72, p90: 81, p97: 84 },
  { ga: 32, p3: 62, p10: 65, p50: 74, p90: 83, p97: 86 },
  { ga: 33, p3: 63, p10: 66, p50: 76, p90: 85, p97: 88 },
  { ga: 34, p3: 65, p10: 68, p50: 77, p90: 87, p97: 90 },
  { ga: 35, p3: 66, p10: 69, p50: 79, p90: 88, p97: 91 },
  { ga: 36, p3: 67, p10: 70, p50: 80, p90: 90, p97: 93 },
  { ga: 37, p3: 68, p10: 71, p50: 81, p90: 91, p97: 94 },
  { ga: 38, p3: 68, p10: 72, p50: 82, p90: 92, p97: 95 },
  { ga: 39, p3: 69, p10: 72, p50: 83, p90: 93, p97: 96 },
  { ga: 40, p3: 69, p10: 73, p50: 83, p90: 93, p97: 97 },
];

// ── BPD (mm) ──
const BPD_DATA: PercentileRow[] = [
  { ga: 14, p3: 24, p10: 25, p50: 28, p90: 31, p97: 33 },
  { ga: 15, p3: 28, p10: 29, p50: 33, p90: 36, p97: 38 },
  { ga: 16, p3: 32, p10: 34, p50: 37, p90: 41, p97: 43 },
  { ga: 17, p3: 36, p10: 38, p50: 42, p90: 46, p97: 48 },
  { ga: 18, p3: 40, p10: 42, p50: 46, p90: 51, p97: 53 },
  { ga: 19, p3: 43, p10: 46, p50: 51, p90: 56, p97: 58 },
  { ga: 20, p3: 47, p10: 50, p50: 55, p90: 60, p97: 63 },
  { ga: 21, p3: 51, p10: 53, p50: 59, p90: 65, p97: 67 },
  { ga: 22, p3: 54, p10: 57, p50: 63, p90: 69, p97: 72 },
  { ga: 23, p3: 57, p10: 60, p50: 67, p90: 73, p97: 76 },
  { ga: 24, p3: 60, p10: 63, p50: 70, p90: 77, p97: 80 },
  { ga: 25, p3: 63, p10: 66, p50: 73, p90: 81, p97: 84 },
  { ga: 26, p3: 66, p10: 69, p50: 77, p90: 84, p97: 87 },
  { ga: 27, p3: 69, p10: 72, p50: 80, p90: 87, p97: 91 },
  { ga: 28, p3: 71, p10: 74, p50: 82, p90: 90, p97: 94 },
  { ga: 29, p3: 73, p10: 77, p50: 85, p90: 93, p97: 97 },
  { ga: 30, p3: 75, p10: 79, p50: 87, p90: 96, p97: 99 },
  { ga: 31, p3: 77, p10: 81, p50: 89, p90: 98, p97: 102 },
  { ga: 32, p3: 79, p10: 82, p50: 91, p90: 100, p97: 104 },
  { ga: 33, p3: 80, p10: 84, p50: 93, p90: 102, p97: 106 },
  { ga: 34, p3: 81, p10: 85, p50: 94, p90: 103, p97: 107 },
  { ga: 35, p3: 82, p10: 86, p50: 95, p90: 105, p97: 109 },
  { ga: 36, p3: 83, p10: 87, p50: 96, p90: 106, p97: 110 },
  { ga: 37, p3: 84, p10: 88, p50: 97, p90: 107, p97: 111 },
  { ga: 38, p3: 84, p10: 88, p50: 98, p90: 108, p97: 112 },
  { ga: 39, p3: 84, p10: 89, p50: 98, p90: 108, p97: 113 },
  { ga: 40, p3: 84, p10: 89, p50: 99, p90: 109, p97: 113 },
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

export interface GrowthAssessment {
  ga: number;
  value: number;
  percentileLabel: string;
  interpretation: string;
  severity: "normal" | "warning" | "critical";
  closestRow: PercentileRow;
}

export function assessGrowth(param: GrowthParameter, ga: number, value: number): GrowthAssessment {
  const data = DATA_MAP[param];
  // Find closest GA
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
