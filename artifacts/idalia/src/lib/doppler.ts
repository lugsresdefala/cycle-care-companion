/**
 * Client-side Doppler types only.
 * All evaluation functions (evaluateUmbilicalArteryPI, evaluateMCAPI, etc.)
 * and reference tables have been moved server-side.
 */

export interface DopplerResult {
  value: number;
  percentile: string;
  interpretation: string;
  severity: "normal" | "warning" | "critical";
}

export interface CPRResult {
  cpr: number;
  mcaPI: number;
  uaPI: number;
  percentile: string;
  interpretation: string;
  severity: "normal" | "warning" | "critical";
}
