import type { ReactNode } from "react";

export type Severity = "normal" | "warning" | "critical";

const SEV: Record<
  Severity,
  { label: string; stripe: string; badge: string; dot: string }
> = {
  normal: {
    label: "Normal",
    stripe: "bg-accent",
    badge: "bg-accent/10 text-accent ring-1 ring-inset ring-accent/30",
    dot: "bg-accent",
  },
  warning: {
    label: "Atenção",
    stripe: "bg-ovulatory",
    badge: "bg-ovulatory/10 text-ovulatory ring-1 ring-inset ring-ovulatory/30",
    dot: "bg-ovulatory",
  },
  critical: {
    label: "Alterado",
    stripe: "bg-destructive",
    badge: "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/30",
    dot: "bg-destructive",
  },
};

interface MetricResultProps {
  /** Technical title, e.g. "Índice de Pulsatilidade (IP)" */
  title: string;
  /** Primary value — already formatted for display */
  value: ReactNode;
  /** Optional unit shown next to the value */
  unit?: string;
  /** Optional percentile chip, e.g. "p50" */
  percentile?: string;
  severity: Severity;
  /** Clinical interpretation paragraph */
  interpretation?: ReactNode;
  /** Optional methodological note (rendered in serif italic) */
  note?: ReactNode;
  /** Optional custom severity label override */
  statusLabel?: string;
}

/**
 * Premium Biomédico result block:
 * Título técnico → Valor (mono) → Interpretação → Nota metodológica.
 * Severity drives the left stripe and the status badge.
 */
export function MetricResult({
  title,
  value,
  unit,
  percentile,
  severity,
  interpretation,
  note,
  statusLabel,
}: MetricResultProps) {
  const sev = SEV[severity];
  return (
    <article className="relative overflow-hidden glass-card-static p-5 pl-6">
      <span className={`absolute left-0 top-0 h-full w-1.5 ${sev.stripe}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="section-label text-[11px]">{title}</div>
          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            <span className="num text-3xl font-semibold leading-none text-primary">
              {value}
            </span>
            {unit ? (
              <span className="num text-sm text-muted-foreground">{unit}</span>
            ) : null}
            {percentile ? (
              <span className="rounded-md bg-muted px-1.5 py-0.5 num text-[11px] font-semibold text-accent">
                {percentile}
              </span>
            ) : null}
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${sev.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />
          {statusLabel ?? sev.label}
        </span>
      </div>
      {interpretation ? (
        <p className="mt-3 text-xs leading-relaxed text-foreground/80">
          {interpretation}
        </p>
      ) : null}
      {note ? (
        <p className="mt-2 methodological-note text-[11px]">
          Nota metodológica — {note}
        </p>
      ) : null}
    </article>
  );
}

export default MetricResult;
