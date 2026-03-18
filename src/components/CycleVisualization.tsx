import { useState } from "react";
import {
  Calendar,
  Heart,
  Droplets,
  Thermometer,
  CircleDot,
  Activity,
  TrendingUp
} from "lucide-react";

interface CycleVisualizationProps {
  cycleLength?: number;
  currentDay?: number;
  periodLength?: number;
  ovulationDay?: number;
}

const PHASE_COLORS: Record<string, { fill: string; stroke: string; label: string }> = {
  menstrual:  { fill: "#ef4444", stroke: "#fca5a5", label: "Menstrual" },
  follicular: { fill: "#3b82f6", stroke: "#93c5fd", label: "Folicular" },
  ovulatory:  { fill: "#eab308", stroke: "#fde047", label: "Ovulatória" },
  luteal:     { fill: "#14b8a6", stroke: "#5eead4", label: "Lútea" },
};

const CycleVisualization = ({
  cycleLength = 28,
  currentDay = 14,
  periodLength = 5,
  ovulationDay = 14
}: CycleVisualizationProps) => {
  const [selectedDay, setSelectedDay] = useState(currentDay);

  const phases = {
    menstrual:  { start: 1, end: periodLength },
    follicular: { start: periodLength + 1, end: ovulationDay - 2 },
    ovulatory:  { start: ovulationDay - 1, end: ovulationDay + 1 },
    luteal:     { start: ovulationDay + 2, end: cycleLength },
  };

  const getCurrentPhase = (day: number): keyof typeof phases => {
    if (day <= phases.menstrual.end) return "menstrual";
    if (day <= phases.follicular.end) return "follicular";
    if (day <= phases.ovulatory.end) return "ovulatory";
    return "luteal";
  };

  const currentPhaseKey = getCurrentPhase(selectedDay);
  const currentPhaseConfig = PHASE_COLORS[currentPhaseKey];

  const getFertilityLevel = (day: number) => {
    const dist = Math.abs(day - ovulationDay);
    if (dist === 0) return { level: 100, label: "Pico de Fertilidade", color: "#10b981" };
    if (dist <= 1)  return { level: 90,  label: "Muito Alta",          color: "#34d399" };
    if (dist <= 3)  return { level: 70,  label: "Alta",                color: "#fbbf24" };
    if (dist <= 5)  return { level: 40,  label: "Moderada",            color: "#f97316" };
    return { level: 10, label: "Baixa", color: "#6b7280" };
  };

  const getDayCharacteristics = (day: number) => {
    const phase = getCurrentPhase(day);
    const map: Record<string, { mucus: string; temperature: string; hormones: string; mucusColor: string; tempColor: string; hormonColor: string }> = {
      menstrual:  { mucus: "Ausente",        temperature: "Baixa",       hormones: "Estrogênio baixo",      mucusColor: "text-gray-400",    tempColor: "text-blue-400",   hormonColor: "text-red-400" },
      follicular: { mucus: "Cremoso",        temperature: "Estável",     hormones: "Estrogênio crescente",  mucusColor: "text-blue-300",    tempColor: "text-blue-400",   hormonColor: "text-blue-400" },
      ovulatory:  { mucus: "Clara de ovo",   temperature: "Pico baixo",  hormones: "Pico de LH",            mucusColor: "text-cyan-400",    tempColor: "text-yellow-400", hormonColor: "text-yellow-400" },
      luteal:     { mucus: "Espesso",        temperature: "Elevada",     hormones: "Progesterona alta",     mucusColor: "text-teal-300",    tempColor: "text-red-400",    hormonColor: "text-teal-400" },
    };
    return map[phase];
  };

  const fertility = getFertilityLevel(selectedDay);
  const characteristics = getDayCharacteristics(selectedDay);
  const cycleDays = Array.from({ length: cycleLength }, (_, i) => i + 1);

  const CX = 150, CY = 150, R = 112;

  const getArcPath = (startDay: number, endDay: number) => {
    const startAngle = ((startDay - 1) / cycleLength) * 360 - 90;
    const endAngle   = (endDay / cycleLength) * 360 - 90;
    const large = (endAngle - startAngle) > 180 ? 1 : 0;
    const sx = CX + R * Math.cos((startAngle * Math.PI) / 180);
    const sy = CY + R * Math.sin((startAngle * Math.PI) / 180);
    const ex = CX + R * Math.cos((endAngle * Math.PI) / 180);
    const ey = CY + R * Math.sin((endAngle * Math.PI) / 180);
    return `M ${sx} ${sy} A ${R} ${R} 0 ${large} 1 ${ex} ${ey}`;
  };

  return (
    <div className="space-y-5">
      {/* Circular Diagram + Info */}
      <div className="glass-card p-5 border-cyan-500/20 rounded-2xl">
        <h3 className="text-base font-semibold text-cyan-300 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Visualização do Ciclo Menstrual
        </h3>

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* SVG Circle */}
          <div className="relative flex-shrink-0" style={{ width: 260, height: 260 }}>
            <svg width="260" height="260" viewBox="0 0 300 300">
              {/* Track ring */}
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={28} />

              {/* Phase arcs */}
              {(Object.entries(phases) as [string, { start: number; end: number }][]).map(([key, phase]) => (
                <path
                  key={key}
                  d={getArcPath(phase.start, phase.end)}
                  fill="none"
                  stroke={PHASE_COLORS[key].fill}
                  strokeWidth={26}
                  strokeLinecap="round"
                  opacity={currentPhaseKey === key ? 0.9 : 0.3}
                  style={{ transition: "opacity 0.4s ease" }}
                />
              ))}

              {/* Day dots */}
              {cycleDays.map((day) => {
                const angle = ((day - 1) / cycleLength) * 360 - 90;
                const x = CX + R * Math.cos((angle * Math.PI) / 180);
                const y = CY + R * Math.sin((angle * Math.PI) / 180);
                const isSelected = day === selectedDay;
                const isCurrent = day === currentDay;
                const isOvulation = day === ovulationDay;

                return (
                  <g key={day} onClick={() => setSelectedDay(day)} style={{ cursor: "pointer" }}>
                    <circle
                      cx={x} cy={y}
                      r={isSelected ? 9 : isOvulation ? 7 : 5}
                      fill={isOvulation ? "#fbbf24" : isCurrent ? "#0ea5e9" : isSelected ? "#f59e0b" : "rgba(255,255,255,0.15)"}
                      stroke={isSelected ? "#fbbf24" : isOvulation ? "#f59e0b" : "none"}
                      strokeWidth={isSelected ? 2 : 0}
                    />
                    {(day === 1 || day % 7 === 0 || day === ovulationDay) && (
                      <text x={x} y={y - 13} textAnchor="middle" fontSize="9" fill="rgba(147,197,253,0.8)" fontWeight="600">
                        {day}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Center Info */}
              <circle cx={CX} cy={CY} r={56} fill="rgba(2,8,20,0.75)" />
              <text x={CX} y={CY - 14} textAnchor="middle" fontSize="26" fontWeight="700" fill="white">
                {selectedDay}
              </text>
              <text x={CX} y={CY + 8} textAnchor="middle" fontSize="10" fill={currentPhaseConfig.stroke} fontWeight="600">
                {currentPhaseConfig.label}
              </text>
              <text x={CX} y={CY + 22} textAnchor="middle" fontSize="9" fill="rgba(147,197,253,0.6)">
                de {cycleLength} dias
              </text>
            </svg>
          </div>

          {/* Phase Legend + Fertility */}
          <div className="flex-1 space-y-4 w-full">
            {/* Phase Legend */}
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(PHASE_COLORS) as [string, typeof PHASE_COLORS[string]][]).map(([key, cfg]) => (
                <div
                  key={key}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${currentPhaseKey === key ? "bg-white/10 ring-1 ring-white/20" : "opacity-50 hover:opacity-80"}`}
                  onClick={() => {
                    const phase = phases[key as keyof typeof phases];
                    if (phase) setSelectedDay(Math.round((phase.start + phase.end) / 2));
                  }}
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.fill }} />
                  <span className="text-xs text-blue-200">{cfg.label}</span>
                </div>
              ))}
            </div>

            {/* Fertility Meter */}
            <div className="glass-panel rounded-xl p-4 border border-green-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-green-300" />
                  <span className="text-sm font-medium text-green-300">Fertilidade — Dia {selectedDay}</span>
                </div>
                <span className="text-base font-bold text-white">{fertility.level}%</span>
              </div>
              <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                  style={{ width: `${fertility.level}%`, backgroundColor: fertility.color }}
                />
              </div>
              <div className="mt-1.5 text-xs font-medium" style={{ color: fertility.color }}>{fertility.label}</div>
            </div>

            {/* Biological Characteristics */}
            <div className="glass-panel rounded-xl p-4 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-3">
                <CircleDot className="h-4 w-4 text-blue-300" />
                <span className="text-sm font-medium text-blue-200">Biomarcadores</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className={`h-3.5 w-3.5 ${characteristics.mucusColor}`} />
                    <span className="text-xs text-gray-400">Muco</span>
                  </div>
                  <span className="text-xs font-medium text-white">{characteristics.mucus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className={`h-3.5 w-3.5 ${characteristics.tempColor}`} />
                    <span className="text-xs text-gray-400">Temperatura</span>
                  </div>
                  <span className="text-xs font-medium text-white">{characteristics.temperature}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className={`h-3.5 w-3.5 ${characteristics.hormonColor}`} />
                    <span className="text-xs text-gray-400">Hormônios</span>
                  </div>
                  <span className="text-xs font-medium text-white">{characteristics.hormones}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Linear Timeline */}
      <div className="glass-card p-4 border-blue-500/20 rounded-2xl">
        <h4 className="text-sm font-medium text-blue-300 mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Timeline do Ciclo — clique para selecionar
        </h4>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1 min-w-max">
            {cycleDays.map((day) => {
              const phaseKey = getCurrentPhase(day);
              const cfg = PHASE_COLORS[phaseKey];
              const isSelected = day === selectedDay;
              const isCurrent = day === currentDay;
              const isOvulation = day === ovulationDay;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-shrink-0 w-7 h-16 rounded-lg cursor-pointer transition-all duration-150 relative
                    ${isSelected ? "scale-110 ring-2 ring-yellow-400 z-10" : "hover:scale-105"}
                    ${isCurrent ? "ring-2 ring-cyan-400" : ""}
                  `}
                  style={{ backgroundColor: cfg.fill, opacity: isSelected ? 1 : 0.45 }}
                >
                  {isOvulation && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  )}
                  <div className="w-full h-full rounded-lg flex items-end justify-center pb-1">
                    <span className="text-xs font-semibold text-white/90">{day}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex gap-4 mt-3 flex-wrap">
          {(Object.entries(PHASE_COLORS) as [string, typeof PHASE_COLORS[string]][]).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.fill }} />
              <span className="text-xs text-blue-400/70">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CycleVisualization;
