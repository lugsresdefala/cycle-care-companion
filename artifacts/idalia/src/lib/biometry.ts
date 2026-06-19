/**
 * Client-side biometry utilities — validation only.
 * Premium calculation functions (gestationalAgeFromCRL, gestationalAgeFromBPD,
 * estimatedFetalWeight, etc.) have been moved server-side.
 */

export function isValidCRL(crlMm: number): boolean {
  return crlMm >= 2 && crlMm <= 84;
}

export function isValidBPD(bpdMm: number): boolean {
  return bpdMm >= 14 && bpdMm <= 100;
}

/**
 * Estimated due date (EDD) from gestational age in total days.
 * Pure date utility (full-term = 280 days); not a premium formula.
 */
export function dueDateFromGA(totalDays: number): Date {
  const remaining = 280 - totalDays;
  const today = new Date();
  today.setDate(today.getDate() + remaining);
  return today;
}
