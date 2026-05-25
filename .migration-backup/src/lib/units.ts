/**
 * Normalização e formatação de unidades clínicas.
 * Fonte única de verdade para exibição em todas as calculadoras.
 *
 * Convenções (padrão IDALIA-Calc):
 *  - Biometria fetal: sempre em milímetros (mm), 1 casa decimal.
 *  - Idade gestacional: "Xs Yd" (curto) ou "X semanas e Y dias" (longo).
 *  - Peso fetal: g se < 1000, kg com 2 casas se ≥ 1000.
 *  - Datas: dd/MM/yyyy (curto) ou "dd de mês de yyyy" (longo).
 */

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─────────── Comprimentos ───────────

export function toMm(value: number, unit?: "mm" | "cm", cmThreshold = 0): number {
  if (!isFinite(value)) return NaN;
  if (unit === "cm") return value * 10;
  if (unit === "mm") return value;
  if (cmThreshold > 0 && value < cmThreshold) return value * 10;
  return value;
}

export const mmToCm = (mm: number): number => mm / 10;

export function formatMm(mm: number, decimals = 1): string {
  if (!isFinite(mm)) return "—";
  return `${mm.toFixed(decimals).replace(".", ",")} mm`;
}

export function formatCm(mm: number, decimals = 1): string {
  if (!isFinite(mm)) return "—";
  return `${mmToCm(mm).toFixed(decimals).replace(".", ",")} cm`;
}

export function formatLength(mm: number): string {
  if (!isFinite(mm)) return "—";
  return mm >= 100 ? formatCm(mm) : formatMm(mm);
}

// ─────────── Idade gestacional ───────────

export interface GA { weeks: number; days: number; }

export function normalizeGA(weeks: number, days: number): GA {
  const total = Math.max(0, Math.round(weeks * 7 + days));
  return { weeks: Math.floor(total / 7), days: total % 7 };
}

export function gaFromTotalDays(totalDays: number): GA {
  const t = Math.max(0, Math.round(totalDays));
  return { weeks: Math.floor(t / 7), days: t % 7 };
}

export const gaToTotalDays = (ga: GA): number => ga.weeks * 7 + ga.days;

export function formatGAShort(weeks: number, days: number): string {
  const ga = normalizeGA(weeks, days);
  return `${ga.weeks}s ${ga.days}d`;
}

export function formatGALong(weeks: number, days: number): string {
  const ga = normalizeGA(weeks, days);
  const w = `${ga.weeks} ${ga.weeks === 1 ? "semana" : "semanas"}`;
  const d = `${ga.days} ${ga.days === 1 ? "dia" : "dias"}`;
  return `${w} e ${d}`;
}

export function formatGAObstetric(weeks: number, days: number): string {
  const ga = normalizeGA(weeks, days);
  return `${ga.weeks}+${ga.days}`;
}

// ─────────── Peso fetal ───────────

export function formatWeight(grams: number): string {
  if (!isFinite(grams)) return "—";
  if (grams < 1000) return `${Math.round(grams)} g`;
  return `${(grams / 1000).toFixed(2).replace(".", ",")} kg`;
}

// ─────────── Datas ───────────

export const formatDateBR = (date: Date): string =>
  format(date, "dd/MM/yyyy", { locale: ptBR });

export const formatDateLongBR = (date: Date): string =>
  format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

// ─────────── Índices adimensionais ───────────

export function formatIndex(value: number, decimals = 2): string {
  if (!isFinite(value)) return "—";
  return value.toFixed(decimals).replace(".", ",");
}

// ─────────── Percentil ───────────

export function formatPercentile(p: number): string {
  if (!isFinite(p)) return "—";
  if (p < 1) return "< p1";
  if (p > 99) return "> p99";
  return `p${Math.round(p)}`;
}
