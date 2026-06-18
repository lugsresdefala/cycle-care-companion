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
