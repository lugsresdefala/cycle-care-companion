interface Refs {
  p5: number;
  p50: number;
  p95: number;
}

interface PercentileRefBarProps {
  value: number;
  refs: Refs;
  label: string;
  /** Optional unit appended to the value readout */
  unit?: string;
  /** Optional formatter for displayed numbers (default: as-is) */
  format?: (n: number) => string;
}

/**
 * Refined reference bar showing a patient value against p5–p95 band.
 * Sober Premium Biomédico styling, monospace numerals.
 */
export function PercentileRefBar({
  value,
  refs,
  label,
  unit,
  format = (n) => `${n}`,
}: PercentileRefBarProps) {
  const min = refs.p5 * 0.7;
  const max = refs.p95 * 1.3;
  const range = max - min || 1;
  const pos = (v: number) => Math.max(0, Math.min(100, ((v - min) / range) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="section-label text-[10px]">{label}</span>
        <span className="num text-xs font-semibold text-primary">
          {format(value)}
          {unit ? <span className="text-muted-foreground"> {unit}</span> : null}
        </span>
      </div>
      <div className="relative h-3 rounded-full bg-muted ring-1 ring-inset ring-foreground/10">
        <div
          className="absolute h-full rounded-full bg-accent/20"
          style={{ left: `${pos(refs.p5)}%`, width: `${pos(refs.p95) - pos(refs.p5)}%` }}
        />
        <div
          className="absolute top-0 h-full w-px bg-accent/60"
          style={{ left: `${pos(refs.p50)}%` }}
        />
        <div
          className="absolute -top-0.5 h-4 w-1.5 rounded-full bg-primary ring-2 ring-white shadow"
          style={{ left: `calc(${pos(value)}% - 3px)` }}
        />
      </div>
      <div className="flex justify-between num text-[10px] text-muted-foreground">
        <span>p5 · {format(refs.p5)}</span>
        <span>p50 · {format(refs.p50)}</span>
        <span>p95 · {format(refs.p95)}</span>
      </div>
    </div>
  );
}

export default PercentileRefBar;
