import { Activity, Info, ChevronRight } from "lucide-react";

const NAVY = "#0b1f3a";
const NAVY_2 = "#0f2a4d";
const TEAL = "#0e7490";
const TEAL_2 = "#0f766e";
const GRAPHITE = "#1f2937";
const SLATE = "#334155";
const PAPER = "#f8fafc";
const PAPER_2 = "#eef2f7";

type Severity = "normal" | "warning" | "critical";

const SEV = {
  normal: { label: "Normal", color: "#0f766e", soft: "rgba(15,118,110,0.10)", ring: "rgba(15,118,110,0.30)" },
  warning: { label: "Atenção", color: "#b45309", soft: "rgba(180,83,9,0.10)", ring: "rgba(180,83,9,0.30)" },
  critical: { label: "Alterado", color: "#b91c1c", soft: "rgba(185,28,28,0.10)", ring: "rgba(185,28,28,0.30)" },
} as const;

const TABS = ["Umbilical", "ACM", "Uterinas", "RCP", "Ducto Venoso"];

const FIELDS = [
  { label: "IG", unit: "sem", value: "28", range: "20–42", desc: "Idade gestacional" },
  { label: "IP", unit: "", value: "1.05", range: "0.3–2.5", desc: "Índice de pulsatilidade" },
  { label: "IR", unit: "", value: "0.62", range: "0.0–1.0", desc: "Índice de resistência" },
  { label: "S/D", unit: "", value: "2.8", range: "1.0–10.0", desc: "Relação sístole/diástole" },
];

const RESULTS: {
  title: string;
  value: string;
  percentile: string;
  severity: Severity;
  interpretation: string;
  note?: string;
}[] = [
  {
    title: "Índice de Pulsatilidade (IP)",
    value: "1.05",
    percentile: "p50",
    severity: "normal",
    interpretation:
      "Resistência placentária dentro da faixa de normalidade para a idade gestacional.",
    note: "Percentil estimado por Acharya et al. (2005). Requer ângulo de insonação adequado.",
  },
  {
    title: "Índice de Resistência (IR)",
    value: "0.62",
    percentile: "p45",
    severity: "normal",
    interpretation:
      "Índice de resistência compatível com perfusão placentária preservada.",
  },
  {
    title: "Relação S/D",
    value: "2.8",
    percentile: "p50",
    severity: "normal",
    interpretation:
      "Relação sístole/diástole dentro do intervalo de referência esperado.",
  },
];

const WEEKS = [20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42];
const P95 = [1.5, 1.44, 1.38, 1.34, 1.3, 1.24, 1.18, 1.12, 1.06, 1.0, 0.95, 0.9];
const P50 = [1.2, 1.15, 1.1, 1.06, 1.02, 0.97, 0.92, 0.87, 0.82, 0.78, 0.74, 0.7];
const P5 = [0.95, 0.91, 0.87, 0.83, 0.78, 0.74, 0.7, 0.66, 0.62, 0.58, 0.55, 0.52];

const PATIENT = { ga: 28, ip: 1.05 };

const REFERENCES = [
  "Acharya G, et al. Reference ranges for umbilical artery Doppler. Am J Obstet Gynecol, 2005.",
  "Ciobanu A, et al. Fetal Doppler reference ranges. Ultrasound Obstet Gynecol, 2019.",
  "Gómez O, et al. Uterine artery Doppler reference values. 2008.",
  "Kessler J, et al. Ductus venosus reference ranges. 2006.",
];

function PercentileChart() {
  const W = 720;
  const H = 340;
  const ml = 52;
  const mr = 24;
  const mt = 20;
  const mb = 40;
  const plotW = W - ml - mr;
  const plotH = H - mt - mb;

  const xMin = 20;
  const xMax = 42;
  const yMin = 0.4;
  const yMax = 1.6;

  const xOf = (g: number) => ml + ((g - xMin) / (xMax - xMin)) * plotW;
  const yOf = (v: number) => mt + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  const line = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? "M" : "L"}${xOf(WEEKS[i]).toFixed(1)},${yOf(v).toFixed(1)}`).join(" ");

  const band = () => {
    const top = P95.map((v, i) => `${i === 0 ? "M" : "L"}${xOf(WEEKS[i]).toFixed(1)},${yOf(v).toFixed(1)}`).join(" ");
    const bottom = [...P5].reverse().map((v, i) => {
      const idx = P5.length - 1 - i;
      return `L${xOf(WEEKS[idx]).toFixed(1)},${yOf(v).toFixed(1)}`;
    }).join(" ");
    return `${top} ${bottom} Z`;
  };

  const yTicks = [0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6];
  const xTicks = [20, 24, 28, 32, 36, 40];

  const px = xOf(PATIENT.ga);
  const py = yOf(PATIENT.ip);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Curva de percentis do IP da artéria umbilical">
      <defs>
        <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={TEAL} stopOpacity="0.16" />
          <stop offset="100%" stopColor={TEAL_2} stopOpacity="0.06" />
        </linearGradient>
        <filter id="ptShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor={NAVY} floodOpacity="0.35" />
        </filter>
      </defs>

      {yTicks.map((t) => (
        <g key={`y${t}`}>
          <line x1={ml} y1={yOf(t)} x2={W - mr} y2={yOf(t)} stroke="#1f2937" strokeOpacity="0.08" strokeWidth="1" />
          <text x={ml - 10} y={yOf(t) + 3.5} textAnchor="end" fontSize="10" fill="#64748b" fontFamily="'IBM Plex Mono', monospace">
            {t.toFixed(1)}
          </text>
        </g>
      ))}

      {xTicks.map((t) => (
        <g key={`x${t}`}>
          <line x1={xOf(t)} y1={mt} x2={xOf(t)} y2={H - mb} stroke="#1f2937" strokeOpacity="0.05" strokeWidth="1" />
          <text x={xOf(t)} y={H - mb + 18} textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="'IBM Plex Mono', monospace">
            {t}
          </text>
        </g>
      ))}

      <text x={ml - 38} y={mt + plotH / 2} textAnchor="middle" fontSize="9.5" fill="#94a3b8" transform={`rotate(-90 ${ml - 38} ${mt + plotH / 2})`} fontFamily="'IBM Plex Sans', sans-serif" letterSpacing="0.12em">
        IP
      </text>
      <text x={ml + plotW / 2} y={H - 6} textAnchor="middle" fontSize="9.5" fill="#94a3b8" fontFamily="'IBM Plex Sans', sans-serif" letterSpacing="0.12em">
        IDADE GESTACIONAL (SEMANAS)
      </text>

      <path d={band()} fill="url(#bandGrad)" stroke="none" />
      <path d={line(P95)} fill="none" stroke={TEAL} strokeOpacity="0.45" strokeWidth="1.25" strokeDasharray="4 3" />
      <path d={line(P5)} fill="none" stroke={TEAL} strokeOpacity="0.45" strokeWidth="1.25" strokeDasharray="4 3" />
      <path d={line(P50)} fill="none" stroke={TEAL_2} strokeWidth="2" />

      <line x1={px} y1={mt} x2={px} y2={H - mb} stroke={NAVY} strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 3" />
      <circle cx={px} cy={py} r="6" fill={NAVY} filter="url(#ptShadow)" />
      <circle cx={px} cy={py} r="6" fill="none" stroke="#ffffff" strokeWidth="1.5" />

      <g transform={`translate(${px + 12}, ${py - 26})`}>
        <rect x="0" y="0" rx="5" ry="5" width="92" height="22" fill={NAVY} />
        <text x="10" y="15" fontSize="11" fill="#ffffff" fontFamily="'IBM Plex Mono', monospace" fontWeight="600">
          1.05 (p50)
        </text>
      </g>

      <g transform={`translate(${W - mr - 116}, ${mt + 6})`}>
        <rect x="0" y="0" width="116" height="52" rx="6" fill="#ffffff" fillOpacity="0.7" stroke="#1f2937" strokeOpacity="0.10" />
        <line x1="10" y1="14" x2="26" y2="14" stroke={TEAL_2} strokeWidth="2" />
        <text x="32" y="17" fontSize="9.5" fill="#475569" fontFamily="'IBM Plex Sans', sans-serif">Mediana (p50)</text>
        <line x1="10" y1="29" x2="26" y2="29" stroke={TEAL} strokeOpacity="0.6" strokeWidth="1.25" strokeDasharray="4 3" />
        <text x="32" y="32" fontSize="9.5" fill="#475569" fontFamily="'IBM Plex Sans', sans-serif">Faixa p5–p95</text>
        <circle cx="18" cy="44" r="4" fill={NAVY} />
        <text x="32" y="47" fontSize="9.5" fill="#475569" fontFamily="'IBM Plex Sans', sans-serif">Paciente</text>
      </g>
    </svg>
  );
}

function RefBar() {
  const p5 = 0.78;
  const p50 = 1.02;
  const p95 = 1.3;
  const patient = 1.05;
  const min = p5 - 0.18;
  const max = p95 + 0.18;
  const pos = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-['IBM_Plex_Sans'] font-semibold uppercase tracking-[0.14em] text-[#64748b]">
          Referência · IP Umbilical
        </span>
        <span className="font-['IBM_Plex_Mono'] tabular-nums text-xs font-semibold text-[#0b1f3a]">
          1.05 <span className="text-[#0f766e]">p50</span>
        </span>
      </div>
      <div className="relative h-3 rounded-full bg-[#eef2f7] ring-1 ring-inset ring-[#1f2937]/10">
        <div
          className="absolute h-full rounded-full"
          style={{ left: `${pos(p5)}%`, width: `${pos(p95) - pos(p5)}%`, background: "rgba(14,116,144,0.18)" }}
        />
        <div className="absolute top-0 h-full w-px bg-[#0f766e]/60" style={{ left: `${pos(p50)}%` }} />
        <div
          className="absolute -top-0.5 h-4 w-1.5 rounded-full bg-[#0b1f3a] ring-2 ring-white shadow"
          style={{ left: `calc(${pos(patient)}% - 3px)` }}
        />
      </div>
      <div className="flex justify-between font-['IBM_Plex_Mono'] tabular-nums text-[10px] text-[#94a3b8]">
        <span>p5 · 0.78</span>
        <span>p50 · 1.02</span>
        <span>p95 · 1.30</span>
      </div>
    </div>
  );
}

export function Premium() {
  const gridBg =
    "linear-gradient(to right, rgba(31,41,55,0.045) 1px, transparent 1px)," +
    "linear-gradient(to bottom, rgba(31,41,55,0.045) 1px, transparent 1px)";

  return (
    <div
      className="min-h-screen w-full font-['Inter'] text-[#1f2937] py-10 px-4"
      style={{
        background: `radial-gradient(1200px 600px at 80% -10%, rgba(14,116,144,0.06), transparent 60%), linear-gradient(160deg, ${PAPER} 0%, ${PAPER_2} 100%)`,
      }}
    >
      <div className="mx-auto max-w-3xl" style={{ backgroundImage: gridBg, backgroundSize: "26px 26px", borderRadius: "20px" }}>
        <div className="rounded-[20px] p-6 sm:p-8">
          {/* Header */}
          <header className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm"
              style={{ background: `linear-gradient(145deg, ${NAVY} 0%, ${NAVY_2} 60%, ${TEAL} 140%)` }}
            >
              <Activity className="h-6 w-6 text-white" strokeWidth={2.2} />
            </div>
            <div className="flex-1">
              <h1 className="font-['Space_Grotesk'] text-2xl font-semibold tracking-tight text-[#0b1f3a]">
                Doppler Fetal
              </h1>
              <p className="mt-0.5 text-sm text-[#475569]">Avaliação hemodinâmica fetal e placentária</p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#1f2937]/10 bg-white/70 px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0f766e]" />
              <span className="font-['IBM_Plex_Sans'] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#475569]">
                Online
              </span>
            </div>
          </header>

          {/* Tabs */}
          <nav className="mt-6 flex flex-wrap gap-1.5 border-b border-[#1f2937]/10 pb-3">
            {TABS.map((t) => {
              const active = t === "Umbilical";
              return (
                <span
                  key={t}
                  className={
                    "rounded-lg px-3 py-1.5 text-xs font-medium font-['IBM_Plex_Sans'] transition-colors " +
                    (active
                      ? "text-white shadow-sm"
                      : "text-[#475569] hover:text-[#0b1f3a] border border-transparent")
                  }
                  style={active ? { background: NAVY } : { background: "rgba(255,255,255,0.6)", border: "1px solid rgba(31,41,55,0.08)" }}
                >
                  {t}
                </span>
              );
            })}
          </nav>

          {/* Active tab panel */}
          <section className="mt-6 rounded-2xl border border-[#1f2937]/10 bg-white/80 p-5 sm:p-6 shadow-[0_4px_20px_-8px_rgba(11,31,58,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-['Space_Grotesk'] text-lg font-semibold text-[#0b1f3a]">Artéria Umbilical</h2>
                <p className="mt-1 max-w-lg text-xs leading-relaxed text-[#475569]">
                  Avaliação da resistência placentária pelos índices de pulsatilidade (IP), resistência (IR) e relação S/D.
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-[#0e7490]/30 bg-[#0e7490]/8 px-2.5 py-1 text-[10px] font-semibold font-['IBM_Plex_Sans'] tracking-wide text-[#0e7490]">
                Acharya et al., 2005
              </span>
            </div>

            {/* Inputs */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {FIELDS.map((f) => (
                <div key={f.label} className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    <label className="text-[11px] font-semibold font-['IBM_Plex_Sans'] uppercase tracking-[0.1em] text-[#334155]">
                      {f.label}
                      {f.unit ? <span className="ml-1 lowercase tracking-normal text-[#94a3b8]">({f.unit})</span> : null}
                    </label>
                    <span title={`${f.desc} (${f.range})`}>
                      <Info className="h-3 w-3 text-[#94a3b8]" />
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      readOnly
                      value={f.value}
                      className="w-full rounded-lg border border-[#1f2937]/12 bg-[#f8fafc] px-3 py-2 font-['IBM_Plex_Mono'] tabular-nums text-sm font-semibold text-[#0b1f3a] outline-none focus:border-[#0e7490]/50"
                    />
                  </div>
                  <p className="font-['IBM_Plex_Mono'] tabular-nums text-[10px] text-[#94a3b8]">{f.range}</p>
                </div>
              ))}
            </div>

            <button
              className="mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform active:scale-[0.99]"
              style={{ background: `linear-gradient(145deg, ${NAVY} 0%, ${NAVY_2} 100%)` }}
            >
              <Activity className="h-4 w-4" strokeWidth={2.2} />
              Avaliar
              <ChevronRight className="h-4 w-4 opacity-70" />
            </button>
          </section>

          {/* Hero chart */}
          <section className="mt-6 rounded-2xl border border-[#1f2937]/10 bg-white/80 p-5 sm:p-6 shadow-[0_4px_20px_-8px_rgba(11,31,58,0.18)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-['IBM_Plex_Sans'] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
                  Curva de Percentis · IP Umbilical
                </h3>
                <p className="mt-0.5 text-xs text-[#475569]">Posição do paciente em relação à faixa de normalidade (p5–p95).</p>
              </div>
              <span className="rounded-md bg-[#0f766e]/10 px-2 py-1 font-['IBM_Plex_Mono'] text-[10px] font-semibold text-[#0f766e]">
                Acharya 2005
              </span>
            </div>
            <PercentileChart />
            <div className="mt-4 border-t border-[#1f2937]/8 pt-4">
              <RefBar />
            </div>
          </section>

          {/* Results */}
          <section className="mt-6 space-y-3">
            <h3 className="font-['IBM_Plex_Sans'] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
              Resultados da Avaliação
            </h3>
            {RESULTS.map((r) => {
              const sev = SEV[r.severity];
              return (
                <article
                  key={r.title}
                  className="relative overflow-hidden rounded-2xl border border-[#1f2937]/10 bg-white/85 p-5 pl-6 shadow-[0_4px_18px_-10px_rgba(11,31,58,0.20)]"
                >
                  <span className="absolute left-0 top-0 h-full w-1.5" style={{ background: sev.color }} />
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-['IBM_Plex_Sans'] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#475569]">
                        {r.title}
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="font-['IBM_Plex_Mono'] tabular-nums text-3xl font-semibold leading-none text-[#0b1f3a]">
                          {r.value}
                        </span>
                        <span className="rounded-md bg-[#eef2f7] px-1.5 py-0.5 font-['IBM_Plex_Mono'] text-[11px] font-semibold text-[#0e7490]">
                          {r.percentile}
                        </span>
                      </div>
                    </div>
                    <span
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold font-['IBM_Plex_Sans']"
                      style={{ background: sev.soft, color: sev.color, boxShadow: `inset 0 0 0 1px ${sev.ring}` }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: sev.color }} />
                      {sev.label}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[#334155]">{r.interpretation}</p>
                  {r.note ? (
                    <p className="mt-2 border-l-2 border-[#1f2937]/12 pl-3 font-['Source_Serif_4'] text-[11px] italic leading-relaxed text-[#64748b]">
                      Nota metodológica — {r.note}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </section>

          {/* Scientific footer */}
          <footer className="mt-8 rounded-2xl border border-[#1f2937]/10 bg-white/60 p-5">
            <h4 className="font-['IBM_Plex_Sans'] text-[10px] font-semibold uppercase tracking-[0.16em] text-[#64748b]">
              Referências Científicas
            </h4>
            <ul className="mt-3 space-y-1.5">
              {REFERENCES.map((ref, i) => (
                <li key={i} className="flex gap-2 font-['Source_Serif_4'] text-[11px] leading-relaxed text-[#475569]">
                  <span className="font-['IBM_Plex_Mono'] tabular-nums text-[10px] text-[#94a3b8]">{i + 1}.</span>
                  <span>{ref}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-[#1f2937]/8 pt-3 font-['Source_Serif_4'] text-[11px] italic leading-relaxed text-[#64748b]">
              Os percentis de Doppler dependem de técnica de insonação adequada. Interprete sempre no contexto clínico.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default Premium;
