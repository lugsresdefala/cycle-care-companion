import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Baby, Activity, Ruler, Scale, Calendar,
  CircleAlert as AlertCircle, CircleCheck as CheckCircle,
  Stethoscope, ChevronLeft, ChevronRight, Star,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

interface GestationalVisualizationProps {
  currentWeek?: number;
  dueDate?: Date;
}

const fetalDevelopment: Record<number, {
  size: string; weight: string; length: string; milestone: string; emoji: string;
}> = {
  4:  { size: "Semente de papoula", weight: "< 1g",  length: "2mm",    milestone: "Formação do tubo neural",             emoji: "🌱" },
  8:  { size: "Framboesa",          weight: "1g",    length: "1.6cm",  milestone: "Batimentos cardíacos detectáveis",     emoji: "🫐" },
  12: { size: "Limão",              weight: "14g",   length: "5.4cm",  milestone: "Reflexos começam a se desenvolver",    emoji: "🍋" },
  16: { size: "Abacate",            weight: "100g",  length: "11.6cm", milestone: "Pode ouvir sua voz",                   emoji: "🥑" },
  20: { size: "Banana",             weight: "300g",  length: "16.4cm", milestone: "Ultrassom morfológico",                emoji: "🍌" },
  24: { size: "Espiga de milho",    weight: "600g",  length: "30cm",   milestone: "Viabilidade fetal alcançada",          emoji: "🌽" },
  28: { size: "Berinjela",          weight: "1kg",   length: "37.6cm", milestone: "Abre e fecha os olhos",                emoji: "🍆" },
  32: { size: "Abóbora",            weight: "1.7kg", length: "42.4cm", milestone: "Ossos endurecendo rapidamente",        emoji: "🎃" },
  36: { size: "Melão",              weight: "2.6kg", length: "47.4cm", milestone: "Considerado pré-termo tardio",         emoji: "🍈" },
  40: { size: "Melancia",           weight: "3.5kg", length: "51.2cm", milestone: "Nascimento esperado",                  emoji: "🍉" },
};

const growthData = [
  { week: 8,  weight: 1,    length: 1.6 },
  { week: 12, weight: 14,   length: 5.4 },
  { week: 16, weight: 100,  length: 11.6 },
  { week: 20, weight: 300,  length: 16.4 },
  { week: 24, weight: 600,  length: 30 },
  { week: 28, weight: 1000, length: 37.6 },
  { week: 32, weight: 1700, length: 42.4 },
  { week: 36, weight: 2600, length: 47.4 },
  { week: 40, weight: 3500, length: 51.2 },
];

interface TrimesterConfig {
  number: number;
  color: string;
  bg: string;
  border: string;
  label: string;
  gradient: [string, string];
  weeks: string;
}

const getTrimester = (week: number): TrimesterConfig => {
  if (week <= 13) return {
    number: 1, weeks: "1–13",
    color: "hsl(var(--primary))", bg: "bg-primary/10", border: "border-primary/25",
    label: "1º Trimestre",
    gradient: ["hsl(var(--primary))", "hsl(200, 70%, 40%)"],
  };
  if (week <= 27) return {
    number: 2, weeks: "14–27",
    color: "hsl(var(--accent))", bg: "bg-accent/10", border: "border-accent/25",
    label: "2º Trimestre",
    gradient: ["hsl(var(--accent))", "hsl(330, 55%, 40%)"],
  };
  return {
    number: 3, weeks: "28–40",
    color: "hsl(var(--secondary))", bg: "bg-secondary/10", border: "border-secondary/25",
    label: "3º Trimestre",
    gradient: ["hsl(var(--secondary))", "hsl(280, 35%, 35%)"],
  };
};

const getWeekData = (week: number) => {
  const keys = Object.keys(fetalDevelopment).map(Number).sort((a, b) => a - b);
  const closest = keys.reduce((p, c) => Math.abs(c - week) < Math.abs(p - week) ? c : p);
  return fetalDevelopment[closest];
};

const getExams = (week: number) => {
  const exams: { name: string; urgent: boolean; desc: string }[] = [];
  if (week >= 11 && week <= 14) exams.push({ name: "Translucência Nucal", urgent: true, desc: "Rastreamento cromossômico" });
  if (week >= 20 && week <= 24) exams.push({ name: "Ultrassom Morfológico", urgent: true, desc: "Anatomia fetal detalhada" });
  if (week >= 24 && week <= 28) exams.push({ name: "Teste de Tolerância à Glicose", urgent: true, desc: "Rastreamento de DMG" });
  if (week >= 35 && week <= 37) exams.push({ name: "Estreptococo B (Swab)", urgent: false, desc: "Cultura cérvico-vaginal" });
  return exams;
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: number }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-static border border-primary/20 rounded-xl p-3 text-xs shadow-xl">
      <p className="font-bold text-primary mb-2">Semana {label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-semibold ml-auto pl-3">{p.value}{p.name === "Peso" ? "g" : "cm"}</span>
        </p>
      ))}
    </div>
  );
};

export default function GestationalVisualization({
  currentWeek = 20,
  dueDate = new Date(Date.now() + 20 * 7 * 24 * 60 * 60 * 1000),
}: GestationalVisualizationProps) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const uid = useId().replace(/:/g, "");

  const currentData  = getWeekData(selectedWeek);
  const trimester    = getTrimester(selectedWeek);
  const currentExams = getExams(selectedWeek);
  const weeks        = Array.from({ length: 40 }, (_, i) => i + 1);
  const progressPct  = Math.round((currentWeek / 40) * 100);

  const navigateWeek = (delta: number) => {
    setSelectedWeek((w) => Math.max(1, Math.min(40, w + delta)));
  };

  return (
    <div className="space-y-4">

      {/* ─── Header Card ──────────────────────────────────── */}
      <div className={`glass-card-static rounded-2xl p-5 border ${trimester.border}`}>
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: trimester.color }}>
          <Baby className="h-4 w-4" />
          Desenvolvimento Gestacional
        </h3>

        {/* ─── Info Metrics ─────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {/* Trimester */}
          <div className={`p-3 rounded-xl border ${trimester.bg} ${trimester.border} col-span-1`}>
            <div className="text-[10px] font-bold mb-1 opacity-70 uppercase tracking-wider" style={{ color: trimester.color }}>
              {trimester.label}
            </div>
            <div className="text-xl font-display font-bold text-foreground">{selectedWeek}<span className="text-sm font-normal text-muted-foreground">sem</span></div>
            <div className="text-[10px] mt-0.5 text-muted-foreground">{40 - selectedWeek} restam</div>
          </div>

          {/* Size */}
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-1 mb-1">
              <Ruler className="h-3 w-3 text-accent flex-shrink-0" />
              <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Tamanho</span>
            </div>
            <div className="text-base font-bold text-foreground leading-tight">{currentData.length}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{currentData.size}</div>
          </div>

          {/* Weight */}
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-1 mb-1">
              <Scale className="h-3 w-3 text-primary flex-shrink-0" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Peso</span>
            </div>
            <div className="text-base font-bold text-foreground leading-tight">{currentData.weight}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Aprox.</div>
          </div>
        </div>

        {/* Milestone Card */}
        <div className="p-3.5 rounded-xl bg-muted/30 border border-white/5 mb-4 flex items-start gap-3">
          <div className="text-2xl leading-none flex-shrink-0" aria-hidden="true">{currentData.emoji}</div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Star className="h-3 w-3 text-yellow-400" />
              <span className="text-[10px] font-bold text-yellow-400/90 uppercase tracking-wider">Marco — Semana {selectedWeek}</span>
            </div>
            <p className="text-sm text-foreground font-medium leading-snug">{currentData.milestone}</p>
          </div>
        </div>

        {/* ─── Enhanced Progress Bar ─────────────────────── */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
            <span>Semana 1</span>
            <span className="font-bold" style={{ color: trimester.color }}>{progressPct}% concluído</span>
            <span>Semana 40</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden bg-muted/30 flex gap-0.5">
            {/* T1 segment */}
            <div
              className="h-full rounded-l-full transition-all duration-700"
              style={{
                width: `${Math.min(32.5, progressPct)}%`,
                background: "linear-gradient(90deg, hsl(var(--primary)), hsl(200, 70%, 45%))",
                boxShadow: progressPct <= 32.5 ? "0 0 8px hsl(var(--primary) / 0.7)" : "none",
              }}
            />
            {/* T2 segment */}
            {progressPct > 32.5 && (
              <div
                className="h-full transition-all duration-700"
                style={{
                  width: `${Math.min(35, Math.max(0, progressPct - 32.5))}%`,
                  background: "linear-gradient(90deg, hsl(var(--accent)), hsl(330, 55%, 40%))",
                  boxShadow: progressPct > 32.5 && progressPct <= 67.5 ? "0 0 8px hsl(var(--accent) / 0.7)" : "none",
                }}
              />
            )}
            {/* T3 segment */}
            {progressPct > 67.5 && (
              <div
                className="h-full rounded-r-full transition-all duration-700"
                style={{
                  width: `${Math.max(0, progressPct - 67.5)}%`,
                  background: "linear-gradient(90deg, hsl(var(--secondary)), hsl(280, 35%, 30%))",
                  boxShadow: "0 0 8px hsl(var(--secondary) / 0.7)",
                }}
              />
            )}
            {/* Remaining */}
            <div className="flex-1 h-full" />
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground/50 mt-1 px-px">
            <span>T1</span>
            <span>T2</span>
            <span>T3</span>
          </div>
        </div>

        {/* ─── Week Selector ─────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground font-medium">Semana selecionada</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateWeek(-1)}
                className="w-7 h-7 rounded-lg bg-muted/50 hover:bg-muted transition-colors flex items-center justify-center"
                disabled={selectedWeek <= 1}
              >
                <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <span className="text-sm font-bold text-foreground w-14 text-center tabular-nums">
                Sem. {selectedWeek}
              </span>
              <button
                onClick={() => navigateWeek(1)}
                className="w-7 h-7 rounded-lg bg-muted/50 hover:bg-muted transition-colors flex items-center justify-center"
                disabled={selectedWeek >= 40}
              >
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto pb-3 -mx-1 px-1">
            <div className="flex gap-px min-w-max">
              {weeks.map((week) => {
                const wt        = getTrimester(week);
                const isSelected = week === selectedWeek;
                const isCurrent  = week === currentWeek;
                const isPast     = week < currentWeek;
                return (
                  <div
                    key={week}
                    onClick={() => setSelectedWeek(week)}
                    role="button"
                    aria-label={`Semana ${week}`}
                    title={`Semana ${week}`}
                    className="flex-shrink-0 w-6 rounded cursor-pointer transition-all duration-150 relative flex items-end justify-center pb-0.5"
                    style={{
                      height: 44,
                      backgroundColor: wt.color,
                      opacity: isSelected ? 1 : isPast ? 0.45 : 0.28,
                      transform: isSelected ? "scaleY(1.18) translateY(-2px)" : undefined,
                      outline: isSelected ? `2px solid ${wt.color}` : isCurrent ? "2px solid rgba(255,255,255,0.4)" : "none",
                      outlineOffset: 2,
                      boxShadow: isSelected ? `0 4px 12px ${wt.color}80` : undefined,
                      zIndex: isSelected ? 10 : undefined,
                    }}
                  >
                    {week % 8 === 0 && (
                      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground whitespace-nowrap font-medium">
                        {week}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="h-5" />
          </div>

          {/* Trimester legend */}
          <div className="flex gap-4 flex-wrap">
            {([
              { label: "1º Trim (1–13)", color: "hsl(var(--primary))" },
              { label: "2º Trim (14–27)", color: "hsl(var(--accent))" },
              { label: "3º Trim (28–40)", color: "hsl(var(--secondary))" },
            ] as const).map((t) => (
              <div key={t.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: t.color }} />
                <span className="text-[10px] text-muted-foreground">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Growth Curve Chart ───────────────────────────── */}
      <div className="glass-card-static rounded-2xl p-5 border border-accent/20">
        <h4 className="text-sm font-semibold text-accent mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Curva de Crescimento Fetal
        </h4>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData} margin={{ top: 8, right: 12, left: -8, bottom: 8 }}>
              <defs>
                <linearGradient id={`wGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="hsl(var(--accent))"   stopOpacity={0.5} />
                  <stop offset="95%" stopColor="hsl(var(--accent))"   stopOpacity={0} />
                </linearGradient>
                <linearGradient id={`lGrad-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="hsl(var(--primary))"  stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))"  stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="week"
                stroke="rgba(255,255,255,0.2)"
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                label={{ value: "Semanas", position: "insideBottom", offset: -2, style: { fill: "hsl(var(--muted-foreground))", fontSize: 9 } }}
              />
              <YAxis
                yAxisId="weight"
                stroke="rgba(255,255,255,0.1)"
                tick={{ fontSize: 9, fill: "hsl(var(--accent))" }}
                tickLine={false}
                axisLine={false}
                label={{ value: "g", angle: -90, position: "insideLeft", style: { fill: "hsl(var(--accent))", fontSize: 9 } }}
              />
              <YAxis
                yAxisId="length"
                orientation="right"
                stroke="rgba(255,255,255,0.1)"
                tick={{ fontSize: 9, fill: "hsl(var(--primary))" }}
                tickLine={false}
                axisLine={false}
                label={{ value: "cm", angle: 90, position: "insideRight", style: { fill: "hsl(var(--primary))", fontSize: 9 } }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />
              {currentWeek > 0 && (
                <ReferenceLine
                  yAxisId="weight"
                  x={currentWeek}
                  stroke="hsl(var(--accent))"
                  strokeDasharray="4 3"
                  strokeOpacity={0.6}
                  label={{ value: "↑ Atual", position: "top", fill: "hsl(var(--accent))", fontSize: 8 }}
                />
              )}
              <Area
                yAxisId="weight"
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                fill={`url(#wGrad-${uid})`}
                dot={{ fill: "hsl(var(--accent))", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0, fill: "hsl(var(--accent))" }}
                name="Peso"
              />
              <Area
                yAxisId="length"
                type="monotone"
                dataKey="length"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill={`url(#lGrad-${uid})`}
                dot={{ fill: "hsl(var(--primary))", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0, fill: "hsl(var(--primary))" }}
                name="Comprimento"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 bg-accent rounded" />
            <span className="text-[10px] text-muted-foreground">Peso (g)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5 bg-primary rounded" />
            <span className="text-[10px] text-muted-foreground">Comprimento (cm)</span>
          </div>
        </div>
      </div>

      {/* ─── Recommended Exams ───────────────────────────── */}
      <AnimatePresence>
        {currentExams.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-static rounded-2xl p-5 border border-accent/20"
          >
            <h4 className="text-sm font-semibold text-accent mb-3 flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Exames — Semana {selectedWeek}
            </h4>
            <div className="space-y-2.5">
              {currentExams.map((exam, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`p-3.5 rounded-xl flex items-start gap-3 ${
                    exam.urgent
                      ? "bg-accent/10 border border-accent/25"
                      : "bg-primary/10 border border-primary/20"
                  }`}
                >
                  {exam.urgent
                    ? <AlertCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                    : <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{exam.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{exam.desc}</div>
                  </div>
                  {exam.urgent && (
                    <span className="text-[10px] bg-accent/20 text-accent border border-accent/30 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                      URGENTE
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Due Date Card ───────────────────────────────── */}
      <div className="glass-card-static rounded-2xl p-4 border border-secondary/25">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-secondary/20 flex-shrink-0">
              <Calendar className="h-5 w-5 text-secondary" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-0.5">
                Data Provável do Parto
              </div>
              <div className="text-base sm:text-lg font-bold text-foreground leading-tight">
                {dueDate.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] text-muted-foreground mb-0.5">Restam</div>
            <div className="text-2xl font-display font-bold text-secondary tabular-nums">{Math.max(0, 40 - currentWeek)}</div>
            <div className="text-[10px] text-muted-foreground">semanas</div>
          </div>
        </div>
      </div>
    </div>
  );
}
