/**
 * INTERGROWTH-21st metadata types — client-side only.
 * All data tables (EFW_DATA, HC_DATA, etc.) and calculation functions
 * (assessGrowth, getGrowthData) have been moved server-side.
 */

export type GrowthParameter = "efw" | "hc" | "ac" | "fl" | "bpd";

export interface PercentileRow {
  ga: number;
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

export interface GrowthAssessment {
  ga: number;
  value: number;
  percentileLabel: string;
  interpretation: string;
  severity: "normal" | "warning" | "critical";
  closestRow: PercentileRow;
}

export const GROWTH_PARAMS: GrowthParameterMeta[] = [
  { key: "efw", label: "PFE", fullName: "Peso Fetal Estimado", unit: "g", minGA: 22, maxGA: 40 },
  { key: "hc", label: "CC", fullName: "Circunferência Cefálica", unit: "mm", minGA: 14, maxGA: 40 },
  { key: "ac", label: "CA", fullName: "Circunferência Abdominal", unit: "mm", minGA: 14, maxGA: 40 },
  { key: "fl", label: "CF", fullName: "Comprimento do Fêmur", unit: "mm", minGA: 14, maxGA: 40 },
  { key: "bpd", label: "DBP", fullName: "Diâmetro Biparietal", unit: "mm", minGA: 14, maxGA: 40 },
];
