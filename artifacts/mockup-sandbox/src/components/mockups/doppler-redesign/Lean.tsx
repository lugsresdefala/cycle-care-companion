import { Activity, Info } from "lucide-react";

const INK = "#1a2230";
const SLATE = "#475569";
const MUTE = "#8a97a8";
const HAIR = "#e5e8ee";
const FOG = "#f7f8fa";
const BLUE = "#13335f";
const BLUE_BRIGHT = "#1d4ed8";
const TEAL = "#0f766e";

const TABS = ["Umbilical", "ACM", "Uterinas", "RCP", "Ducto Venoso"];

const FIELDS = [
  { label: "IG (sem)", value: "28", range: "20–42", hint: "Idade gestacional" },
  { label: "IP", value: "1.05", range: "0.3–2.5", hint: "Índice de Pulsatilidade" },
  { label: "IR", value: "0.62", range: "0.0–1.0", hint: "Índice de Resistência" },
  { label: "S/D", value: "2.8", range: "1.0–10.0", hint: "Relação Sístole/Diástole" },
];

const ROWS = [
  {
    param: "Índice de Pulsatilidade",
    abbr: "IP",
    value: "1.05",
    pct: "p50",
    interp: "Resistência placentária dentro da faixa de normalidade para a idade gestacional.",
    sev: "Normal",
    note: 1,
  },
  {
    param: "Índice de Resistência",
    abbr: "IR",
    value: "0.62",
    pct: "p45",
    interp: "Dentro da faixa de referência para a idade gestacional.",
    sev: "Normal",
    note: null,
  },
  {
    param: "Relação S/D",
    abbr: "S/D",
    value: "2.8",
    pct: "p50",
    interp: "Relação sístole/diástole compatível com normalidade.",
    sev: "Normal",
    note: null,
  },
];

const REFERENCES = [
  "Acharya G, Wilsgaard T, Berntsen GKR, Maltau JM, Kiserud T. Reference ranges for serial measurements of umbilical artery Doppler indices in the second half of pregnancy. Am J Obstet Gynecol. 2005;192(3):937–944.",
  "Ciobanu A, Wright A, Syngelaki A, Wright D, Akolekar R, Nicolaides KH. Fetal Medicine Foundation reference ranges for umbilical artery and middle cerebral artery pulsatility index and cerebroplacental ratio. Ultrasound Obstet Gynecol. 2019;53(4):465–472.",
  "Gómez O, Figueras F, Fernández S, et al. Reference ranges for uterine artery mean pulsatility index at 11–41 weeks of gestation. Ultrasound Obstet Gynecol. 2008;32(2):128–132.",
  "Kessler J, Rasmussen S, Hanson M, Kiserud T. Longitudinal reference ranges for ductus venosus flow velocities and waveform indices. Ultrasound Obstet Gynecol. 2006;28(7):890–898.",
];

function sevColor(sev: string) {
  if (sev === "Normal") return TEAL;
  if (sev === "Atenção") return "#b45309";
  return "#b91c1c";
}

function SeverityTag({ sev }: { sev: string }) {
  const c = sevColor(sev);
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide"
      style={{ color: c }}
    >
      <span
        className="inline-block h-[6px] w-[6px] rounded-full"
        style={{ backgroundColor: c }}
      />
      {sev}
    </span>
  );
}

function PercentileFigure() {
  const W = 720;
  const H = 300;
  const padL = 52;
  const padR = 24;
  const padT = 24;
  const padB = 44;
  const gaMin = 20;
  const gaMax = 42;
  const ipMin = 0.4;
  const ipMax = 1.6;

  const x = (ga: number) => padL + ((ga - gaMin) / (gaMax - gaMin)) * (W - padL - padR);
  const y = (ip: number) => padT + (1 - (ip - ipMin) / (ipMax - ipMin)) * (H - padT - padB);

  const weeks = Array.from({ length: gaMax - gaMin + 1 }, (_, i) => gaMin + i);

  const p95 = (ga: number) => 1.85 - 0.0195 * (ga - gaMin);
  const p50 = (ga: number) => 1.42 - 0.0182 * (ga - gaMin);
  const p5 = (ga: number) => 1.06 - 0.0145 * (ga - gaMin);

  const lineFor = (fn: (ga: number) => number) =>
    weeks.map((w) => `${x(w)},${y(fn(w))}`).join(" ");

  const bandPath =
    "M " +
    weeks.map((w) => `${x(w)},${y(p95(w))}`).join(" L ") +
    " L " +
    weeks
      .slice()
      .reverse()
      .map((w) => `${x(w)},${y(p5(w))}`)
      .join(" L ") +
    " Z";

  const px = x(28);
  const py = y(1.05);

  const yTicks = [0.6, 0.8, 1.0, 1.2, 1.4];
  const xTicks = [20, 24, 28, 32, 36, 40];

  return (
    <figure className="mt-7">
      <div
        className="rounded-sm border bg-white px-3 pt-3 pb-1"
        style={{ borderColor: HAIR }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label="Curva de percentis do IP da artéria umbilical"
        >
          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line
                x1={padL}
                x2={W - padR}
                y1={y(t)}
                y2={y(t)}
                stroke={HAIR}
                strokeWidth={1}
              />
              <text
                x={padL - 10}
                y={y(t) + 3.5}
                textAnchor="end"
                fontSize="11"
                fontFamily="'IBM Plex Mono', monospace"
                fill={MUTE}
              >
                {t.toFixed(1)}
              </text>
            </g>
          ))}

          {xTicks.map((t) => (
            <text
              key={`x${t}`}
              x={x(t)}
              y={H - padB + 18}
              textAnchor="middle"
              fontSize="11"
              fontFamily="'IBM Plex Mono', monospace"
              fill={MUTE}
            >
              {t}
            </text>
          ))}

          <line
            x1={padL}
            x2={W - padR}
            y1={H - padB}
            y2={H - padB}
            stroke={INK}
            strokeWidth={1.25}
          />
          <line
            x1={padL}
            x2={padL}
            y1={padT}
            y2={H - padB}
            stroke={INK}
            strokeWidth={1.25}
          />

          <path d={bandPath} fill={BLUE} fillOpacity={0.06} />

          <polyline
            points={lineFor(p95)}
            fill="none"
            stroke={MUTE}
            strokeWidth={1}
          />
          <polyline
            points={lineFor(p5)}
            fill="none"
            stroke={MUTE}
            strokeWidth={1}
          />
          <polyline
            points={lineFor(p50)}
            fill="none"
            stroke={BLUE}
            strokeWidth={1.4}
            strokeDasharray="5 4"
          />

          <text
            x={x(42) - 2}
            y={y(p95(42)) - 5}
            textAnchor="end"
            fontSize="10.5"
            fontFamily="'IBM Plex Mono', monospace"
            fill={MUTE}
          >
            p95
          </text>
          <text
            x={x(42) - 2}
            y={y(p50(42)) - 5}
            textAnchor="end"
            fontSize="10.5"
            fontFamily="'IBM Plex Mono', monospace"
            fill={BLUE}
          >
            p50
          </text>
          <text
            x={x(42) - 2}
            y={y(p5(42)) + 13}
            textAnchor="end"
            fontSize="10.5"
            fontFamily="'IBM Plex Mono', monospace"
            fill={MUTE}
          >
            p5
          </text>

          <line
            x1={px}
            x2={px}
            y1={py}
            y2={H - padB}
            stroke={BLUE_BRIGHT}
            strokeWidth={0.75}
            strokeDasharray="2 3"
            opacity={0.6}
          />
          <circle cx={px} cy={py} r={4.5} fill={BLUE_BRIGHT} />
          <circle cx={px} cy={py} r={8} fill="none" stroke={BLUE_BRIGHT} strokeWidth={1} opacity={0.4} />
          <g>
            <rect
              x={px + 10}
              y={py - 22}
              width={104}
              height={18}
              fill="white"
              stroke={HAIR}
              strokeWidth={1}
              rx={2}
            />
            <text
              x={px + 16}
              y={py - 9}
              fontSize="10.5"
              fontFamily="'IBM Plex Mono', monospace"
              fill={INK}
            >
              IP 1.05 · 28s
            </text>
          </g>

          <text
            x={(padL + W - padR) / 2}
            y={H - 6}
            textAnchor="middle"
            fontSize="10.5"
            fontFamily="'Inter', sans-serif"
            fill={SLATE}
          >
            Idade gestacional (semanas)
          </text>
          <text
            transform={`rotate(-90 14 ${(padT + H - padB) / 2})`}
            x={14}
            y={(padT + H - padB) / 2}
            textAnchor="middle"
            fontSize="10.5"
            fontFamily="'Inter', sans-serif"
            fill={SLATE}
          >
            IP umbilical
          </text>
        </svg>
      </div>
      <figcaption
        className="mt-2 text-[12px] leading-relaxed font-['Source_Serif_4']"
        style={{ color: SLATE }}
      >
        <span className="font-semibold" style={{ color: INK }}>
          Figura 1.
        </span>{" "}
        IP da artéria umbilical <span className="italic">vs.</span> idade
        gestacional. Faixa sombreada p5–p95; mediana (p50) tracejada. O ponto em
        azul representa o paciente (IP 1.05 às 28 semanas), situado logo acima da
        mediana.
      </figcaption>
    </figure>
  );
}

export function Lean() {
  return (
    <div
      className="min-h-screen w-full font-['Inter'] antialiased"
      style={{ backgroundColor: FOG, color: INK }}
    >
      <div className="mx-auto max-w-3xl px-8 py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-start gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border"
              style={{ borderColor: HAIR, backgroundColor: "#ffffff" }}
            >
              <Activity className="h-5 w-5" style={{ color: BLUE }} strokeWidth={1.75} />
            </div>
            <div className="pt-0.5">
              <h1
                className="font-['Source_Serif_4'] text-[30px] font-semibold leading-none tracking-tight"
                style={{ color: INK }}
              >
                Doppler Fetal
              </h1>
              <p className="mt-2 text-[14px]" style={{ color: SLATE }}>
                Avaliação hemodinâmica fetal e placentária
              </p>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <nav
          className="mb-8 flex items-center gap-7 border-b"
          style={{ borderColor: HAIR }}
        >
          {TABS.map((t) => {
            const active = t === "Umbilical";
            return (
              <button
                key={t}
                className="relative -mb-px pb-3 text-[13px] tracking-wide transition-colors"
                style={{
                  color: active ? BLUE : MUTE,
                  fontWeight: active ? 600 : 500,
                }}
              >
                {t}
                {active && (
                  <span
                    className="absolute inset-x-0 -bottom-px h-[2px]"
                    style={{ backgroundColor: BLUE }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Section: input */}
        <section className="rounded-sm border bg-white" style={{ borderColor: HAIR }}>
          <div className="px-7 pt-6 pb-5">
            <div className="flex items-baseline justify-between gap-4">
              <h2
                className="font-['IBM_Plex_Sans'] text-[17px] font-semibold tracking-tight"
                style={{ color: INK }}
              >
                Artéria Umbilical
              </h2>
              <span
                className="shrink-0 rounded-sm border px-2 py-0.5 text-[11px] font-medium tracking-wide"
                style={{ borderColor: HAIR, color: BLUE, backgroundColor: FOG }}
              >
                Acharya et al., 2005
              </span>
            </div>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed" style={{ color: SLATE }}>
              Avaliação da resistência placentária pelos índices de pulsatilidade
              (IP), resistência (IR) e relação S/D.
            </p>
          </div>

          <div className="border-t px-7 py-6" style={{ borderColor: HAIR }}>
            <div className="grid grid-cols-4 gap-4">
              {FIELDS.map((f) => (
                <div key={f.label}>
                  <div className="mb-1.5 flex items-center gap-1">
                    <label
                      className="text-[10.5px] font-semibold uppercase tracking-[0.09em]"
                      style={{ color: SLATE }}
                    >
                      {f.label}
                    </label>
                    <span title={`${f.hint} (${f.range})`}>
                      <Info className="h-3 w-3" style={{ color: MUTE }} strokeWidth={2} />
                    </span>
                  </div>
                  <div
                    className="flex h-10 items-center rounded-sm border bg-white px-3"
                    style={{ borderColor: HAIR }}
                  >
                    <span className="font-['IBM_Plex_Mono'] text-[15px] tabular-nums" style={{ color: INK }}>
                      {f.value}
                    </span>
                  </div>
                  <p
                    className="mt-1 font-['IBM_Plex_Mono'] text-[10px] tabular-nums"
                    style={{ color: MUTE }}
                  >
                    {f.range}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="inline-flex items-center gap-2 rounded-sm px-5 py-2.5 text-[13px] font-medium tracking-wide text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: BLUE }}
              >
                <Activity className="h-4 w-4" strokeWidth={2} />
                Avaliar
              </button>
            </div>
          </div>
        </section>

        {/* Results table */}
        <section className="mt-9">
          <div className="mb-3 flex items-center gap-3">
            <h3
              className="text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: SLATE }}
            >
              Resultados
            </h3>
            <div className="h-px flex-1" style={{ backgroundColor: HAIR }} />
          </div>

          <div className="overflow-hidden rounded-sm border bg-white" style={{ borderColor: HAIR }}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr style={{ backgroundColor: FOG }}>
                  <th
                    className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.1em]"
                    style={{ color: MUTE }}
                  >
                    Parâmetro
                  </th>
                  <th
                    className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em]"
                    style={{ color: MUTE }}
                  >
                    Valor
                  </th>
                  <th
                    className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em]"
                    style={{ color: MUTE }}
                  >
                    Percentil
                  </th>
                  <th
                    className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.1em]"
                    style={{ color: MUTE }}
                  >
                    Interpretação
                  </th>
                  <th
                    className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.1em]"
                    style={{ color: MUTE }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r, i) => (
                  <tr
                    key={r.abbr}
                    style={{
                      borderTop: `1px solid ${HAIR}`,
                    }}
                  >
                    <td className="px-5 py-4 align-top">
                      <div className="text-[13.5px] font-medium" style={{ color: INK }}>
                        {r.param}
                        {r.note && (
                          <sup className="ml-0.5 font-['Source_Serif_4']" style={{ color: BLUE }}>
                            {r.note}
                          </sup>
                        )}
                      </div>
                      <div
                        className="mt-0.5 font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wider"
                        style={{ color: MUTE }}
                      >
                        {r.abbr}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right align-top">
                      <span
                        className="font-['IBM_Plex_Mono'] text-[16px] tabular-nums"
                        style={{ color: INK }}
                      >
                        {r.value}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right align-top">
                      <span
                        className="font-['IBM_Plex_Mono'] text-[13px] tabular-nums"
                        style={{ color: SLATE }}
                      >
                        {r.pct}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span className="text-[12.5px] leading-relaxed" style={{ color: SLATE }}>
                        {r.interp}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right align-top whitespace-nowrap">
                      <SeverityTag sev={r.sev} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footnote */}
            <div className="border-t px-5 py-3" style={{ borderColor: HAIR, backgroundColor: FOG }}>
              <p
                className="font-['Source_Serif_4'] text-[11.5px] leading-relaxed"
                style={{ color: SLATE }}
              >
                <sup style={{ color: BLUE }}>1</sup> Percentil estimado por Acharya
                et al. (2005). Requer ângulo de insonação adequado.
              </p>
            </div>
          </div>

          {/* Figure */}
          <PercentileFigure />
        </section>

        {/* References */}
        <footer className="mt-11">
          <div className="mb-3 flex items-center gap-3">
            <h3
              className="text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: SLATE }}
            >
              Referências
            </h3>
            <div className="h-px flex-1" style={{ backgroundColor: HAIR }} />
          </div>
          <ol className="space-y-2">
            {REFERENCES.map((ref, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className="shrink-0 font-['IBM_Plex_Mono'] text-[11px] tabular-nums"
                  style={{ color: MUTE }}
                >
                  {i + 1}.
                </span>
                <span
                  className="font-['Source_Serif_4'] text-[12px] leading-relaxed"
                  style={{ color: SLATE }}
                >
                  {ref}
                </span>
              </li>
            ))}
          </ol>

          <div
            className="mt-6 border-t pt-4 text-[11.5px] leading-relaxed"
            style={{ borderColor: HAIR, color: MUTE }}
          >
            Os percentis de Doppler dependem de técnica de insonação adequada.
            Interprete sempre no contexto clínico.
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Lean;
