import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Heart,
  Droplets,
  Thermometer,
  CircleDot,
  Activity,
  TrendingUp,
  Zap,
} from "lucide-react";

interface CycleVisualizationProps {
  cycleLength?: number;
  currentDay?: number;
  periodLength?: number;
  ovulationDay?: number;
}

const PHASE_CONFIG: Record<string, {
  fill: string;
  stroke: string;
  glow: string;
  label: string;
  gradient: [string, string];
}> = {
  menstrual:  {
    fill: "#e11d48",
    stroke: "#fb7185",
    glow: "rgba(225, 29, 72, 0.6)",
    label: "Menstrual",
    gradient: ["#e11d48", "#be123c"],
  },
  follicular: {
    fill: "#3b82f6",
    stroke: "#93c5fd",
    glow: "rgba(59, 130, 246, 0.6)",
    label: "Folicular",
    gradient: ["#3b82f6", "#1d4ed8"],
  },
  ovulatory:  {
    fill: "#f59e0b",
    stroke: "#fde68a",
    glow: "rgba(245, 158, 11, 0.7)",
    label: "Ovulatória",
    gradient: ["#f59e0b", "#d97706"],
  },
  luteal:     {
    fill: "#14b8a6",
    stroke: "#5eead4",
    glow: "rgba(20, 184, 166, 0.6)",
    label: "Lútea",
    gradient: ["#14b8a6", "#0f766e"],
  },
};

export default function CycleVisualization({
  cycleLength = 28,
  currentDay = 14,
  periodLength = 5,
  ovulationDay = 14,
}: CycleVisualizationProps) {
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const uid = useId().replace(/:/g, "");

  const phases = {
    menstrual:  { start: 1, end: periodLength },
    follicular: { start: periodLength + 1, end: ovulationDay - 2 },
    ovulatory:  { start: ovulationDay - 1, end: ovulationDay + 1 },
    luteal:     { start: ovulationDay + 2, end: cycleLength },
  };

  const getCurrentPhase = (day: number): keyof typeof phases => {
    if (day <= phases.menstrual.end)  return "menstrual";
    if (day <= phases.follicular.end) return "follicular";
    if (day <= phases.ovulatory.end)  return "ovulatory";
    return "luteal";
  };

  const currentPhaseKey = getCurrentPhase(selectedDay);
  const currentPhaseConfig = PHASE_CONFIG[currentPhaseKey];

  const getFertilityLevel = (day: number) => {
    const dist = Math.abs(day - ovulationDay);
    if (dist === 0) return { level: 100, label: "Pico de Fertilidade", color: "#10b981" };
    if (dist <= 1)  return { level: 90,  label: "Muito Alta",          color: "#34d399" };
    if (dist <= 3)  return { level: 70,  label: "Alta",                color: "#fbbf24" };
    if (dist <= 5)  return { level: 40,  label: "Moderada",            color: "#f97316" };
    return           { level: 10,  label: "Baixa",               color: "#6b7280" };
  };

  const getDayCharacteristics = (day: number) => {
    const phase = getCurrentPhase(day);
    const map = {
      menstrual:  { mucus: "Ausente",      temperature: "Baixa",      hormones: "Estrogênio baixo",     mucusColor: "text-gray-400",    tempColor: "text-blue-400",   hormonColor: "text-red-400" },
      follicular: { mucus: "Cremoso",      temperature: "Estável",    hormones: "Estrogênio crescente", mucusColor: "text-blue-300",    tempColor: "text-blue-400",   hormonColor: "text-blue-400" },
      ovulatory:  { mucus: "Clara de ovo", temperature: "Pico baixo", hormones: "Pico de LH",           mucusColor: "text-cyan-400",    tempColor: "text-yellow-400", hormonColor: "text-yellow-400" },
      luteal:     { mucus: "Espesso",      temperature: "Elevada",    hormones: "Progesterona alta",    mucusColor: "text-teal-300",    tempColor: "text-red-400",    hormonColor: "text-teal-400" },
    };
    return map[phase];
  };

  const fertility     = getFertilityLevel(selectedDay);
  const characteristics = getDayCharacteristics(selectedDay);
  const cycleDays    = Array.from({ length: cycleLength }, (_, i) => i + 1);

  // SVG dimensions
  const CX = 140, CY = 140, R = 102, STROKE_W = 22;

  const polarToXY = (day: number, radius = R) => {
    const angle = ((day - 0.5) / cycleLength) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
  };

  const getArcPath = (startDay: number, endDay: number) => {
    const startAngle = ((startDay - 1) / cycleLength) * 360 - 90;
    const endAngle   = (endDay / cycleLength) * 360 - 90;
    const large = endAngle - startAngle > 180 ? 1 : 0;
    const r = R;
    const toRad = (a: number) => (a * Math.PI) / 180;
    const sx = CX + r * Math.cos(toRad(startAngle));
    const sy = CY + r * Math.sin(toRad(startAngle));
    const ex = CX + r * Math.cos(toRad(endAngle));
    const ey = CY + r * Math.sin(toRad(endAngle));
    return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
  };

  const selectedPos = polarToXY(selectedDay);
  const ovulationPos = polarToXY(ovulationDay);

  return (
    <div className="space-y-4">

      {/* ─── Main Circular Visualization ──────────────────── */}
      <div className="glass-card p-5 border-cyan-500/20">
        <h3 className="text-sm font-semibold text-cyan-300 mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Visualização do Ciclo Menstrual
        </h3>

        <div className="flex flex-col md:flex-row items-center gap-6">

          {/* ─── SVG Circle ─────────────────────────────── */}
          <div className="relative flex-shrink-0" style={{ width: 280, height: 280 }}>
            <svg width="280" height="280" viewBox="0 0 280 280" aria-label="Ciclo menstrual circular">
              <defs>
                {/* Phase gradients */}
                {(Object.entries(PHASE_CONFIG) as [string, typeof PHASE_CONFIG[string]][]).map(([key, cfg]) => (
                  <linearGradient key={`grad-${key}-${uid}`} id={`grad-${key}-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={cfg.gradient[0]} />
                    <stop offset="100%" stopColor={cfg.gradient[1]} />
                  </linearGradient>
                ))}

                {/* Glow filter */}
                <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Selected day glow filter */}
                <filter id={`selected-glow-${uid}`} x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Ovulation glow */}
                <filter id={`ovul-glow-${uid}`} x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Center radial gradient */}
                <radialGradient id={`center-bg-${uid}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="hsla(240, 35%, 12%, 0.95)" />
                  <stop offset="100%" stopColor="hsla(240, 30%, 6%, 0.98)" />
                </radialGradient>
              </defs>

              {/* Outer background track */}
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={STROKE_W + 6} />

              {/* Track shadow */}
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={STROKE_W + 2} />

              {/* Phase arcs */}
              {(Object.entries(phases) as [string, { start: number; end: number }][]).map(([key, phase]) => {
                const cfg = PHASE_CONFIG[key];
                const isActive = currentPhaseKey === key;
                return (
                  <g key={key}>
                    {/* Glow layer for active phase */}
                    {isActive && (
                      <path
                        d={getArcPath(phase.start, phase.end)}
                        fill="none"
                        stroke={cfg.glow}
                        strokeWidth={STROKE_W + 8}
                        strokeLinecap="round"
                        opacity={0.35}
                        filter={`url(#glow-${uid})`}
                      />
                    )}
                    {/* Main arc */}
                    <path
                      d={getArcPath(phase.start, phase.end)}
                      fill="none"
                      stroke={`url(#grad-${key}-${uid})`}
                      strokeWidth={STROKE_W}
                      strokeLinecap="round"
                      opacity={isActive ? 1 : 0.22}
                      style={{ transition: "opacity 0.5s ease" }}
                    />
                    {/* Highlight stripe */}
                    {isActive && (
                      <path
                        d={getArcPath(phase.start, phase.end)}
                        fill="none"
                        stroke="rgba(255,255,255,0.12)"
                        strokeWidth={4}
                        strokeLinecap="round"
                        style={{ transition: "opacity 0.5s ease" }}
                      />
                    )}
                  </g>
                );
              })}

              {/* Day tick marks */}
              {cycleDays.filter((d) => d % 7 === 1 || d === ovulationDay).map((day) => {
                const inner = polarToXY(day, R - STROKE_W / 2 - 3);
                const outer = polarToXY(day, R + STROKE_W / 2 + 3);
                return (
                  <line
                    key={`tick-${day}`}
                    x1={inner.x} y1={inner.y}
                    x2={outer.x} y2={outer.y}
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth={1}
                  />
                );
              })}

              {/* Day dots — interactive */}
              {cycleDays.map((day) => {
                const pos = polarToXY(day);
                const isSelected  = day === selectedDay;
                const isOvulation = day === ovulationDay;
                const isCurrent   = day === currentDay;
                const phase       = getCurrentPhase(day);
                const pCfg        = PHASE_CONFIG[phase];

                return (
                  <g key={day} onClick={() => setSelectedDay(day)} style={{ cursor: "pointer" }}>
                    {/* Touch target */}
                    <circle cx={pos.x} cy={pos.y} r={12} fill="transparent" />

                    {isSelected && !isOvulation && (
                      <>
                        {/* Outer ring */}
                        <circle cx={pos.x} cy={pos.y} r={10} fill="none" stroke={pCfg.stroke} strokeWidth={1.5} opacity={0.5} />
                        {/* Glow */}
                        <circle cx={pos.x} cy={pos.y} r={8} fill={pCfg.fill} opacity={0.3} filter={`url(#selected-glow-${uid})`} />
                      </>
                    )}

                    {/* Dot */}
                    <circle
                      cx={pos.x} cy={pos.y}
                      r={isSelected ? 7 : isOvulation ? 6 : isCurrent ? 5 : 3.5}
                      fill={
                        isOvulation
                          ? "#f59e0b"
                          : isSelected
                          ? pCfg.fill
                          : isCurrent
                          ? "#0ea5e9"
                          : "rgba(255,255,255,0.12)"
                      }
                      stroke={isSelected || isOvulation ? "rgba(255,255,255,0.5)" : "none"}
                      strokeWidth={1}
                    />

                    {/* Ovulation special indicator */}
                    {isOvulation && (
                      <>
                        <circle cx={pos.x} cy={pos.y} r={11} fill="none" stroke="#f59e0b" strokeWidth={1.5} opacity={0.4} />
                        <circle cx={pos.x} cy={pos.y} r={6} fill="#f59e0b" filter={`url(#ovul-glow-${uid})`} />
                      </>
                    )}

                    {/* Labels for key days */}
                    {(day === 1 || day === ovulationDay || day % 14 === 0) && (
                      <text
                        x={polarToXY(day, R + STROKE_W / 2 + 14).x}
                        y={polarToXY(day, R + STROKE_W / 2 + 14).y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="8"
                        fill={day === ovulationDay ? "#fde68a" : "rgba(147,197,253,0.7)"}
                        fontWeight="600"
                      >
                        {day === ovulationDay ? "OV" : day}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Center circle with gradient background */}
              <circle cx={CX} cy={CY} r={70} fill={`url(#center-bg-${uid})`} />

              {/* Center ring border */}
              <circle cx={CX} cy={CY} r={70} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />

              {/* Center content */}
              <text x={CX} y={CY - 18} textAnchor="middle" fontSize="28" fontWeight="700" fill="white" fontFamily="'Instrument Sans', sans-serif">
                {selectedDay}
              </text>
              <text x={CX} y={CY + 4} textAnchor="middle" fontSize="9" fill={currentPhaseConfig.stroke} fontWeight="700" letterSpacing="0.08em">
                {currentPhaseConfig.label.toUpperCase()}
              </text>
              <text x={CX} y={CY + 18} textAnchor="middle" fontSize="8" fill="rgba(147,197,253,0.5)">
                de {cycleLength} dias
              </text>

              {/* Current day indicator if different from selected */}
              {currentDay !== selectedDay && (
                <g>
                  <circle
                    cx={polarToXY(currentDay).x}
                    cy={polarToXY(currentDay).y}
                    r={5}
                    fill="#0ea5e9"
                    opacity={0.8}
                  />
                  <circle
                    cx={polarToXY(currentDay).x}
                    cy={polarToXY(currentDay).y}
                    r={9}
                    fill="none"
                    stroke="#0ea5e9"
                    strokeWidth={1}
                    opacity={0.3}
                  />
                </g>
              )}
            </svg>
          </div>

          {/* ─── Side Info Panel ─────────────────────── */}
          <div className="flex-1 space-y-3 w-full min-w-0">

            {/* Phase Legend */}
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(PHASE_CONFIG) as [string, typeof PHASE_CONFIG[string]][]).map(([key, cfg]) => {
                const isActive = currentPhaseKey === key;
                return (
                  <button
                    key={key}
                    className={`flex items-center gap-2 p-2.5 rounded-xl transition-all duration-250 text-left ${
                      isActive
                        ? "ring-1 ring-white/20 bg-white/8"
                        : "opacity-45 hover:opacity-70"
                    }`}
                    style={isActive ? { background: `${cfg.glow.replace("0.6", "0.12")}` } : {}}
                    onClick={() => {
                      const phase = phases[key as keyof typeof phases];
                      if (phase) setSelectedDay(Math.round((phase.start + phase.end) / 2));
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${cfg.gradient[0]}, ${cfg.gradient[1]})` }}
                    />
                    <span className="text-xs text-blue-200 font-medium">{cfg.label}</span>
                    {isActive && (
                      <div
                        className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cfg.fill }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Fertility Meter */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl p-3.5 border border-green-500/20"
                style={{ background: "hsla(160, 60%, 10%, 0.5)" }}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-green-400" />
                    <span className="text-xs font-semibold text-green-300">Fertilidade — Dia {selectedDay}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white tabular-nums">{fertility.level}%</span>
                    {fertility.level >= 70 && <Zap className="w-3 h-3 text-yellow-400" />}
                  </div>
                </div>
                {/* Enhanced progress bar */}
                <div className="relative h-2.5 bg-gray-900/70 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute left-0 top-0 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${fertility.level}%` }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      background: `linear-gradient(90deg, ${fertility.color}99, ${fertility.color})`,
                      boxShadow: `0 0 10px ${fertility.color}80`,
                    }}
                  />
                  {/* Stripe highlight */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, transparent 50%)" }}
                  />
                </div>
                <div className="mt-1.5 text-xs font-semibold" style={{ color: fertility.color }}>
                  {fertility.label}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Biomarkers */}
            <div className="rounded-xl p-3.5 border border-blue-500/20" style={{ background: "hsla(220, 60%, 10%, 0.5)" }}>
              <div className="flex items-center gap-2 mb-2.5">
                <CircleDot className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-semibold text-blue-300">Biomarcadores — Dia {selectedDay}</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { icon: <Droplets className={`h-3.5 w-3.5 ${characteristics.mucusColor}`} />, label: "Muco", value: characteristics.mucus },
                  { icon: <Thermometer className={`h-3.5 w-3.5 ${characteristics.tempColor}`} />, label: "Temperatura", value: characteristics.temperature },
                  { icon: <Activity className={`h-3.5 w-3.5 ${characteristics.hormonColor}`} />, label: "Hormônios", value: characteristics.hormones },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {item.icon}
                      <span className="text-xs text-gray-400">{item.label}</span>
                    </div>
                    <span className="text-xs font-medium text-white text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Linear Timeline ──────────────────────────────── */}
      <div className="glass-card p-4 border-blue-500/15">
        <h4 className="text-xs font-semibold text-blue-300/80 mb-3 flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          Timeline — toque para selecionar dia
        </h4>

        <div className="overflow-x-auto pb-1 -mx-1 px-1">
          <div className="flex gap-0.5 min-w-max">
            {cycleDays.map((day) => {
              const phaseKey  = getCurrentPhase(day);
              const cfg       = PHASE_CONFIG[phaseKey];
              const isSelected  = day === selectedDay;
              const isCurrent   = day === currentDay;
              const isOvulation = day === ovulationDay;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  role="button"
                  aria-label={`Dia ${day}`}
                  className={`flex-shrink-0 rounded-lg cursor-pointer transition-all duration-150 relative flex items-end justify-center pb-1 ${
                    isSelected ? "z-10" : ""
                  }`}
                  style={{
                    width: 22,
                    height: 52,
                    backgroundColor: cfg.fill,
                    opacity: isSelected ? 1 : 0.38,
                    transform: isSelected ? "scaleY(1.15) translateY(-2px)" : undefined,
                    outline: isSelected ? `2px solid ${cfg.stroke}` : isCurrent ? "2px solid #0ea5e9" : "none",
                    outlineOffset: 2,
                    boxShadow: isSelected ? `0 4px 12px ${cfg.glow}` : undefined,
                  }}
                >
                  {isOvulation && (
                    <div
                      className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-yellow-300/50"
                      style={{
                        background: "#f59e0b",
                        boxShadow: "0 0 6px #f59e0b",
                        animation: "glow-pulse 2s ease-in-out infinite",
                      }}
                    />
                  )}
                  <span className="text-[9px] font-bold text-white/90 leading-none">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-3 mt-3 flex-wrap">
          {(Object.entries(PHASE_CONFIG) as [string, typeof PHASE_CONFIG[string]][]).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-sm flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${cfg.gradient[0]}, ${cfg.gradient[1]})` }}
              />
              <span className="text-[10px] text-blue-400/70">{cfg.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-amber-400 flex-shrink-0" style={{ boxShadow: "0 0 4px #f59e0b" }} />
            <span className="text-[10px] text-blue-400/70">Ovulação</span>
          </div>
        </div>
      </div>
    </div>
  );
}
