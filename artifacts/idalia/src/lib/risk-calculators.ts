/**
 * Risk Calculator type definitions — shared between client UI and API responses.
 *
 * The calculation implementations live server-side only
 * (artifacts/api-server/src/lib/risk-calculators.ts) so that premium formula
 * logic is never shipped in the client bundle.
 */

export interface TrisomyInput {
  maternalAge: number;
  crl: number;
  nt: number;
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

export interface PreeclampsiaInput {
  maternalAge: number;
  weight: number;
  height: number;
  ethnicityAfroCaribbean: boolean;
  nulliparous: boolean;
  conceptionIVF: boolean;
  chronicHypertension: boolean;
  diabetesType1or2: boolean;
  lupusSLEorAPS: boolean;
  previousPE: boolean;
  familyHistoryPE: boolean;
  meanArterialPressure: number | null;
  uterineArteryMeanPI: number | null;
  pappaMoM: number | null;
  plgfMoM: number | null;
}

export interface PreeclampsiaResult {
  riskPreterm: number;
  riskEarly: number;
  riskAnyPE: number;
  cutoffPreterm: boolean;
  cutoffEarly: boolean;
  recommendation: string;
  method: string;
  riskCategory: "baixo" | "intermediário" | "alto";
}
