import {
  Activity,
  Info,
  CheckCircle2,
  FlaskConical,
  BookOpen,
} from "lucide-react";

const NAVY = "hsl(218 72% 27%)";
const ACCENT = "hsl(25 88% 56%)";
const SECONDARY = "hsl(262 52% 44%)";
const BG = "hsl(220 18% 97%)";
const FG = "hsl(218 50% 10%)";
const MUTED_FG = "hsl(218 16% 48%)";
const BORDER = "hsl(218 22% 89%)";

const DISPLAY = "'Instrument Sans', 'Space Grotesk', system-ui, sans-serif";
const BODY = "'Inter', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

type Severity = "normal" | "warning" | "critical";

const SEVERITY: Record<
  Severity,
  { label: string; color: string; soft: string; ring: string }
> = {
  normal: {
    label: "Normal",
    color: "hsl(25 78% 44%)",
    soft: "hsla(25 88% 56% / 0.10)",
    ring: "hsla(25 88% 56% / 0.30)",
  },
  warning: {
    label: "Atenção",
    color: "hsl(35 82% 52%)",
    soft: "hsla(35 82% 52% / 0.12)",
    ring: "hsla(35 82% 52% / 0.30)",
  },
  critical: {
    label: "Alterado",
    color: "hsl(0 62% 50%)",
    soft: "hsla(0 62% 50% / 0.10)",
    ring: "hsla(0 62% 50% / 0.30)",
  },
};

const glassCard: React.CSSProperties = {
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.82) 60%, rgba(248,250,255,0.88) 100%)",
  backdropFilter: "blur(24px) saturate(1.6)",
  WebkitBackdropFilter: "blur(24px) saturate(1.6)",
  border: "1px solid hsla(218 50% 40% / 0.09)",
  boxShadow:
    "0 1px 0 0 rgba(255,255,255,0.8) inset, 0 8px 28px -8px rgba(15,30,70,0.12), 0 2px 8px -2px rgba(15,30,70,0.06)",
  borderRadius: "1rem",
};

function FieldInput({
  label,
  hint,
  range,
  value,
}: {
  label: string;
  hint: string;
  range: string;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <label
          className="text-[13px] font-medium"
          style={{ color: FG, fontFamily: BODY }}
        >
          {label}
        </label>
        <span className="group relative inline-flex">
          <Info className="w-3.5 h-3.5" style={{ color: MUTED_FG }} />
          <span
            className="pointer-events-none absolute left-1/2 bottom-full mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[10px] opacity-0 transition-opacity group-hover:opacity-100"
            style={{
              background: FG,
              color: "white",
              fontFamily: MONO,
            }}
          >
            {hint}
          </span>
        </span>
      </div>
      <div className="relative">
        <input
          readOnly
          value={value}
          className="w-full rounded-xl px-3.5 py-2.5 text-[15px] tabular-nums outline-none transition-shadow"
          style={{
            fontFamily: MONO,
            color: FG,
            background: "hsla(218 16% 94% / 0.6)",
            border: `1px solid ${BORDER}`,
            boxShadow: "0 0 0 3px hsla(218 72% 27% / 0)",
          }}
        />
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tabular-nums"
          style={{ color: MUTED_FG, fontFamily: MONO }}
        >
          {range}
        </span>
      </div>
    </div>
  );
}

function PercentileBar({
  p5,
  p50,
  p95,
  value,
}: {
  p5: number;
  p50: number;
  p95: number;
  value: number;
}) {
  const min = p5 * 0.7;
  const max = p95 * 1.3;
  const range = max - min;
  const pos = (v: number) =>
    Math.max(2, Math.min(98, ((v - min) / range) * 100));

  const fmt = (n: number) => n.toFixed(2);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: MUTED_FG, fontFamily: BODY, letterSpacing: "0.08em" }}
        >
          IP — Artéria Umbilical · faixa de referência
        </span>
        <span
          className="tabular-nums text-[13px] font-semibold"
          style={{ color: NAVY, fontFamily: MONO }}
        >
          {fmt(value)}
        </span>
      </div>

      <div className="relative pt-5 pb-1">
        <span
          className="absolute -top-0 -translate-x-1/2 flex flex-col items-center"
          style={{ left: `${pos(value)}%` }}
        >
          <span
            className="rounded-md px-1.5 py-0.5 text-[9px] font-semibold tabular-nums"
            style={{
              background: NAVY,
              color: "white",
              fontFamily: MONO,
            }}
          >
            paciente
          </span>
        </span>

        <div
          className="relative h-3 rounded-full overflow-visible"
          style={{ background: "hsl(218 18% 92%)" }}
        >
          <div
            className="absolute h-full rounded-full"
            style={{
              left: `${pos(p5)}%`,
              width: `${pos(p95) - pos(p5)}%`,
              background: "hsla(25 88% 56% / 0.22)",
            }}
          />
          <div
            className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2"
            style={{ left: `${pos(p50)}%`, background: "hsla(25 88% 56% / 0.7)" }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full"
            style={{
              left: `${pos(value)}%`,
              background: NAVY,
              border: "2.5px solid white",
              boxShadow: "0 2px 8px hsla(218 72% 27% / 0.35)",
            }}
          />
        </div>
      </div>

      <div
        className="flex justify-between text-[10px] tabular-nums"
        style={{ color: MUTED_FG, fontFamily: MONO }}
      >
        <span>p5 · {fmt(p5)}</span>
        <span>p50 · {fmt(p50)}</span>
        <span>p95 · {fmt(p95)}</span>
      </div>
    </div>
  );
}

function ResultCard({
  title,
  value,
  percentile,
  severity,
  interpretation,
  method,
  children,
}: {
  title: string;
  value: string;
  percentile: string;
  severity: Severity;
  interpretation: string;
  method: string;
  children?: React.ReactNode;
}) {
  const s = SEVERITY[severity];
  return (
    <div
      style={{
        ...glassCard,
        borderColor: s.ring,
        background: `linear-gradient(145deg, ${s.soft} 0%, rgba(255,255,255,0.86) 55%)`,
      }}
      className="p-5 space-y-3.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider"
            style={{
              color: MUTED_FG,
              fontFamily: BODY,
              letterSpacing: "0.1em",
            }}
          >
            Índice
          </span>
          <h4
            className="text-[15px] font-semibold leading-tight"
            style={{ color: FG, fontFamily: DISPLAY }}
          >
            {title}
          </h4>
        </div>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{
            color: s.color,
            background: s.soft,
            border: `1px solid ${s.ring}`,
            fontFamily: BODY,
          }}
        >
          <CheckCircle2 className="w-3 h-3" />
          {s.label}
        </span>
      </div>

      <div className="flex items-baseline gap-2.5">
        <span
          className="tabular-nums text-4xl font-semibold leading-none"
          style={{ color: FG, fontFamily: MONO }}
        >
          {value}
        </span>
        <span
          className="tabular-nums text-[13px] font-semibold"
          style={{ color: s.color, fontFamily: MONO }}
        >
          {percentile}
        </span>
      </div>

      <p
        className="text-[13px] leading-relaxed"
        style={{ color: FG, fontFamily: BODY }}
      >
        {interpretation}
      </p>

      <div
        className="flex items-start gap-2 rounded-lg px-3 py-2"
        style={{ background: "hsla(218 18% 92% / 0.5)" }}
      >
        <FlaskConical
          className="w-3.5 h-3.5 mt-0.5 shrink-0"
          style={{ color: MUTED_FG }}
        />
        <p
          className="text-[11px] leading-relaxed"
          style={{ color: MUTED_FG, fontFamily: BODY }}
        >
          <span className="font-semibold">Nota metodológica · </span>
          {method}
        </p>
      </div>

      {children}
    </div>
  );
}

const TABS = ["Umbilical", "ACM", "Uterinas", "RCP", "Ducto Venoso"];

export function Polished() {
  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: BG,
        fontFamily: BODY,
        backgroundImage: [
          "radial-gradient(at 8% 4%, hsla(218 72% 30% / 0.10) 0, transparent 50%)",
          "radial-gradient(at 92% 12%, hsla(25 88% 56% / 0.09) 0, transparent 48%)",
          "radial-gradient(at 50% 96%, hsla(262 52% 44% / 0.07) 0, transparent 52%)",
        ].join(", "),
      }}
    >
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* ── Header ── */}
        <header className="mb-8 flex items-center gap-4">
          <span className="relative inline-flex">
            <span
              className="absolute inset-0 rounded-2xl blur-md"
              style={{ background: "hsla(218 72% 27% / 0.30)" }}
            />
            <span
              className="relative flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{
                background: `linear-gradient(140deg, ${NAVY}, ${SECONDARY})`,
                boxShadow:
                  "0 8px 24px -6px hsla(218 72% 27% / 0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
            >
              <Activity className="h-6 w-6 text-white" strokeWidth={2.2} />
            </span>
          </span>
          <div>
            <h1
              className="text-[26px] font-bold leading-tight"
              style={{ color: FG, fontFamily: DISPLAY, letterSpacing: "-0.02em" }}
            >
              Doppler Fetal
            </h1>
            <p className="text-[13px]" style={{ color: MUTED_FG }}>
              Avaliação hemodinâmica fetal e placentária
            </p>
          </div>
        </header>

        {/* ── Tabs ── */}
        <div
          className="mb-7 flex gap-1 rounded-2xl p-1"
          style={{
            background: "hsla(218 18% 92% / 0.6)",
            border: `1px solid ${BORDER}`,
          }}
        >
          {TABS.map((t) => {
            const active = t === "Umbilical";
            return (
              <button
                key={t}
                className="flex-1 rounded-xl px-2 py-2 text-[12.5px] font-medium transition-all"
                style={{
                  fontFamily: BODY,
                  color: active ? NAVY : MUTED_FG,
                  background: active ? "white" : "transparent",
                  boxShadow: active
                    ? "0 1px 3px rgba(15,30,70,0.10), 0 0 0 1px hsla(218 72% 27% / 0.06)"
                    : "none",
                  fontWeight: active ? 600 : 500,
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* ── Active panel: Umbilical ── */}
        <section
          style={{
            ...glassCard,
            backgroundImage:
              "radial-gradient(at 5% 5%, hsla(218 72% 30% / 0.07) 0, transparent 55%), radial-gradient(at 95% 90%, hsla(262 52% 44% / 0.05) 0, transparent 50%)",
          }}
          className="p-6 md:p-7 space-y-6"
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className="text-[19px] font-semibold"
                style={{ color: FG, fontFamily: DISPLAY }}
              >
                Artéria Umbilical
              </h2>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                style={{
                  color: NAVY,
                  background: "hsla(218 72% 27% / 0.10)",
                  border: "1px solid hsla(218 72% 27% / 0.22)",
                  fontFamily: BODY,
                }}
              >
                <BookOpen className="w-3 h-3" />
                Acharya et al., 2005
              </span>
            </div>
            <p
              className="text-[13px] leading-relaxed"
              style={{ color: MUTED_FG }}
            >
              Avaliação da resistência placentária pelos índices de pulsatilidade
              (IP), resistência (IR) e relação S/D.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldInput label="IG (sem)" hint="20–42" range="20–42" value="28" />
            <FieldInput label="IP" hint="0.3–2.5" range="0.3–2.5" value="1.05" />
            <FieldInput label="IR" hint="0.0–1.0" range="0.0–1.0" value="0.62" />
            <FieldInput label="S/D" hint="1.0–10.0" range="1.0–10.0" value="2.8" />
          </div>

          <button
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-semibold text-white transition-transform"
            style={{
              background: NAVY,
              fontFamily: BODY,
              boxShadow:
                "0 0 12px hsla(218 80% 40% / 0.20), 0 6px 16px -6px hsla(218 72% 27% / 0.5)",
            }}
          >
            <Activity className="w-4 h-4" strokeWidth={2.2} />
            Avaliar
          </button>
        </section>

        {/* ── Results ── */}
        <div className="mt-6 space-y-4">
          <div
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: MUTED_FG, letterSpacing: "0.1em" }}
          >
            <span
              className="h-px flex-1"
              style={{
                background:
                  "linear-gradient(90deg, transparent, " + BORDER + ")",
              }}
            />
            Resultados
            <span
              className="h-px flex-1"
              style={{
                background:
                  "linear-gradient(90deg, " + BORDER + ", transparent)",
              }}
            />
          </div>

          <ResultCard
            title="Índice de Pulsatilidade (IP)"
            value="1.05"
            percentile="p50"
            severity="normal"
            interpretation="Resistência placentária dentro da faixa de normalidade para a idade gestacional."
            method="Percentil estimado por Acharya et al. (2005). Requer ângulo de insonação adequado."
          >
            <div
              className="mt-2 rounded-xl p-4"
              style={{
                background: "rgba(255,255,255,0.55)",
                border: `1px solid ${BORDER}`,
              }}
            >
              <PercentileBar p5={0.78} p50={1.02} p95={1.3} value={1.05} />
            </div>
          </ResultCard>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              title="Índice de Resistência (IR)"
              value="0.62"
              percentile="p45"
              severity="normal"
              interpretation="Resistência vascular placentária preservada para a idade gestacional."
              method="Percentil estimado por Acharya et al. (2005). Requer ângulo de insonação adequado."
            />
            <ResultCard
              title="Relação S/D"
              value="2.8"
              percentile="p50"
              severity="normal"
              interpretation="Relação sístole/diástole dentro da normalidade para a idade gestacional."
              method="Percentil estimado por Acharya et al. (2005). Requer ângulo de insonação adequado."
            />
          </div>
        </div>

        {/* ── Scientific footer ── */}
        <footer
          className="mt-8 p-6 space-y-4"
          style={{ ...glassCard, background: "rgba(255,255,255,0.7)" }}
        >
          <div
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: NAVY, letterSpacing: "0.1em" }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Referências
          </div>
          <ul className="space-y-1.5">
            {[
              "Acharya G, et al. Reference ranges for serial measurements of umbilical artery Doppler indices. Am J Obstet Gynecol, 2005.",
              "Ciobanu A, et al. Fetal Doppler reference ranges. Ultrasound Obstet Gynecol, 2019.",
              "Gómez O, et al. Reference ranges for uterine artery mean pulsatility index. 2008.",
              "Kessler J, et al. Longitudinal reference ranges for ductus venosus Doppler. 2006.",
            ].map((ref) => (
              <li
                key={ref}
                className="flex gap-2 text-[11.5px] leading-relaxed"
                style={{ color: MUTED_FG }}
              >
                <span style={{ color: ACCENT }}>›</span>
                {ref}
              </li>
            ))}
          </ul>
          <div
            className="h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, " +
                BORDER +
                ", transparent)",
            }}
          />
          <p
            className="text-[11.5px] italic leading-relaxed"
            style={{ color: MUTED_FG }}
          >
            Os percentis de Doppler dependem de técnica de insonação adequada.
            Interprete sempre no contexto clínico.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default Polished;
