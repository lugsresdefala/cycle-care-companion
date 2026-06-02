import { useEffect, useState } from "react";
import { Baby, Activity, Ruler, Scale, Calendar, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Stethoscope } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

interface GestationalVisualizationProps {
  currentWeek?: number;
  dueDate?: Date;
}

const fetalDevelopment: Record<number, { size: string; weight: string; length: string; milestone: string }> = {
  4:  { size: "Semente de papoula", weight: "< 1g",  length: "2mm",    milestone: "Formação do tubo neural" },
  8:  { size: "Framboesa",          weight: "1g",    length: "1.6cm",  milestone: "Batimentos cardíacos detectáveis" },
  12: { size: "Limão",              weight: "14g",   length: "5.4cm",  milestone: "Reflexos começam a se desenvolver" },
  16: { size: "Abacate",            weight: "100g",  length: "11.6cm", milestone: "Pode ouvir sua voz" },
  20: { size: "Banana",             weight: "300g",  length: "16.4cm", milestone: "Ultrassom morfológico" },
  24: { size: "Espiga de milho",    weight: "600g",  length: "30cm",   milestone: "Viabilidade fetal" },
  28: { size: "Berinjela",          weight: "1kg",   length: "37.6cm", milestone: "Abre e fecha os olhos" },
  32: { size: "Abóbora",            weight: "1.7kg", length: "42.4cm", milestone: "Ossos endurecendo" },
  36: { size: "Melão",              weight: "2.6kg", length: "47.4cm", milestone: "Pré-termo tardio" },
  37: { size: "Alface romana",      weight: "2.9kg", length: "48.6cm", milestone: "Considerado a termo (≥ 37 semanas)" },
  40: { size: "Melancia",           weight: "3.5kg", length: "51.2cm", milestone: "Nascimento esperado" },
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

const getTrimester = (week: number) => {
  if (week <= 13) return { number: 1, color: "hsl(var(--primary))", bg: "bg-primary/15", border: "border-primary/30", label: "1º Trimestre" };
  if (week <= 27) return { number: 2, color: "hsl(var(--accent))", bg: "bg-accent/15", border: "border-accent/30", label: "2º Trimestre" };
  return { number: 3, color: "hsl(var(--secondary))", bg: "bg-secondary/15", border: "border-secondary/30", label: "3º Trimestre" };
};

const getClosestWeek = (week: number): number => {
  const keys = Object.keys(fetalDevelopment).map(Number).sort((a, b) => a - b);
  return keys.reduce((p, c) => Math.abs(c - week) < Math.abs(p - week) ? c : p);
};

const getWeekData = (week: number) => fetalDevelopment[getClosestWeek(week)];

const getExams = (week: number) => {
  const exams = [];
  if (week >= 11 && week <= 14) exams.push({ name: "Translucência Nucal", urgent: true });
  if (week >= 20 && week <= 24) exams.push({ name: "Ultrassom Morfológico", urgent: true });
  if (week >= 24 && week <= 28) exams.push({ name: "Teste de Tolerância à Glicose", urgent: true });
  if (week >= 35 && week <= 37) exams.push({ name: "Cultura para Estreptococo B", urgent: false });
  return exams;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-static border border-primary/20 rounded-lg p-3 text-xs">
      <p className="font-semibold text-primary mb-1">Semana {label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}{p.name === "Peso" ? "g" : "cm"}</p>
      ))}
    </div>
  );
};

const GestationalVisualization = ({
  currentWeek = 20,
  dueDate = new Date(Date.now() + 20 * 7 * 24 * 60 * 60 * 1000)
}: GestationalVisualizationProps) => {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  useEffect(() => { setSelectedWeek(currentWeek); }, [currentWeek]);

  const refWeek = getClosestWeek(selectedWeek);
  const currentData = getWeekData(selectedWeek);
  const trimester = getTrimester(selectedWeek);
  const currentExams = getExams(selectedWeek);
  const weeks = Array.from({ length: 40 }, (_, i) => i + 1);
  const progressPercent = Math.round((currentWeek / 40) * 100);
  const isReference = refWeek !== selectedWeek;

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className={`glass-card-static rounded-2xl p-5 border ${trimester.border}`}>
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: trimester.color }}>
          <Baby className="h-5 w-5" />
          Linha do Tempo Gestacional
        </h3>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className={`p-4 rounded-xl border ${trimester.bg} ${trimester.border}`}>
            <div className="text-xs font-semibold mb-1 opacity-70" style={{ color: trimester.color }}>{trimester.label}</div>
            <div className="text-2xl font-bold text-foreground">Semana {selectedWeek}</div>
            <div className="text-xs mt-1 text-muted-foreground">{40 - selectedWeek} semanas restantes</div>
          </div>
          <div className="p-4 rounded-xl bg-accent/10 border border-accent/25">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold text-accent">
                Tamanho {isReference && <span className="opacity-60">(ref. sem {refWeek})</span>}
              </span>
            </div>
            <div className="text-lg font-bold text-foreground">{currentData.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{currentData.size}</div>
          </div>
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/25">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">
                Peso {isReference && <span className="opacity-60">(ref. sem {refWeek})</span>}
              </span>
            </div>
            <div className="text-lg font-bold text-foreground">{currentData.weight}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Aproximado</div>
          </div>
        </div>

        {/* Milestone */}
        <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 mb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <Activity className="h-4 w-4 text-accent" />
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              Marco de referência — Semana {refWeek}
            </span>
          </div>
          <p className="text-sm text-foreground font-medium">{currentData.milestone}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
          <span>Semana 1</span>
          <span className="font-semibold text-accent">{progressPercent}% concluído</span>
          <span>Semana 40</span>
        </div>
        <div className="flex h-2.5 rounded-full overflow-hidden bg-muted/40 gap-px mb-5">
          <div className="bg-primary/80" style={{ width: `${Math.min(32.5, progressPercent)}%` }} />
          <div className="bg-accent/80" style={{ width: `${Math.min(35, Math.max(0, progressPercent - 32.5))}%` }} />
          <div className="bg-secondary/80" style={{ width: `${Math.max(0, progressPercent - 67.5)}%` }} />
          <div className="flex-1 bg-muted/20" />
        </div>

        {/* Week Timeline */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-0.5 min-w-max">
            {weeks.map((week) => {
              const wt = getTrimester(week);
              const isSelected = week === selectedWeek;
              const isCurrent = week === currentWeek;
              const isPast = week < currentWeek;
              return (
                <div
                  key={week}
                  onClick={() => setSelectedWeek(week)}
                  title={`Semana ${week}`}
                  className={`flex-shrink-0 w-6 rounded cursor-pointer transition-all duration-150 relative
                    ${isSelected ? "scale-y-125 ring-2 ring-accent z-10" : "hover:scale-y-110"}
                    ${isCurrent ? "ring-1 ring-primary" : ""}
                  `}
                  style={{
                    height: 52,
                    backgroundColor: wt.color,
                    opacity: isSelected ? 1 : isPast ? 0.5 : 0.35,
                  }}
                >
                  {week % 8 === 0 && (
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">{week}</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="h-5" />
        </div>

        {/* Trimester legend */}
        <div className="flex gap-4 flex-wrap mt-1">
          {[
            { label: "1º Trim", color: "hsl(var(--primary))" },
            { label: "2º Trim", color: "hsl(var(--accent))" },
            { label: "3º Trim", color: "hsl(var(--secondary))" },
          ].map(t => (
            <div key={t.label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
              <span className="text-xs text-muted-foreground">{t.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full ring-1 ring-primary" style={{ backgroundColor: "transparent" }} />
            <span className="text-xs text-muted-foreground">Semana atual</span>
          </div>
        </div>
      </div>

      {/* Growth Curve */}
      <div className="glass-card-static rounded-2xl p-5 border border-accent/20">
        <h4 className="text-base font-semibold text-accent mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Curva de Crescimento Fetal
        </h4>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lengthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} label={{ value: "Semanas", position: "insideBottom", offset: -3, style: { fill: "hsl(var(--muted-foreground))", fontSize: 10 } }} />
              <YAxis yAxisId="weight" stroke="hsl(var(--accent))" tick={{ fontSize: 10 }} label={{ value: "Peso (g)", angle: -90, position: "insideLeft", style: { fill: "hsl(var(--accent))", fontSize: 10 } }} />
              <YAxis yAxisId="length" orientation="right" stroke="hsl(var(--primary))" tick={{ fontSize: 10 }} label={{ value: "Comp (cm)", angle: 90, position: "insideRight", style: { fill: "hsl(var(--primary))", fontSize: 10 } }} />
              <Tooltip content={<CustomTooltip />} />
              {currentWeek > 0 && (
                <ReferenceLine yAxisId="weight" x={currentWeek} stroke="hsl(var(--accent))" strokeDasharray="4 4" strokeOpacity={0.7} label={{ value: "Atual", position: "top", fill: "hsl(var(--accent))", fontSize: 9 }} />
              )}
              <Area yAxisId="weight" type="monotone" dataKey="weight" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#weightGradient)" dot={{ fill: "hsl(var(--accent))", r: 3 }} name="Peso" />
              <Area yAxisId="length" type="monotone" dataKey="length" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#lengthGradient)" dot={{ fill: "hsl(var(--primary))", r: 3 }} name="Comprimento" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-accent rounded" />
            <span className="text-xs text-muted-foreground">Peso (g)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-primary rounded" />
            <span className="text-xs text-muted-foreground">Comprimento (cm)</span>
          </div>
        </div>
      </div>

      {/* Recommended Exams */}
      {currentExams.length > 0 && (
        <div className="glass-card-static rounded-2xl p-5 border border-accent/20">
          <h4 className="text-base font-semibold text-accent mb-4 flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Exames — Semana {selectedWeek}
          </h4>
          <div className="space-y-3">
            {currentExams.map((exam, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl flex items-center gap-3 ${exam.urgent ? "bg-accent/10 border border-accent/25" : "bg-primary/10 border border-primary/20"}`}
              >
                {exam.urgent
                  ? <AlertCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  : <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />}
                <div>
                  <div className="text-sm font-semibold text-foreground">{exam.name}</div>
                  {exam.urgent && <div className="text-xs text-muted-foreground mt-0.5">Importante neste período</div>}
                </div>
                {exam.urgent && (
                  <span className="ml-auto text-xs bg-accent/20 text-accent border border-accent/30 px-2 py-0.5 rounded-full">Urgente</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Due Date */}
      <div className="glass-card-static rounded-2xl p-4 border border-secondary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-secondary/20">
              <Calendar className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-secondary mb-0.5">Data Provável do Parto</div>
              <div className="text-xl font-bold text-foreground">
                {dueDate.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-0.5">Restam</div>
            <div className="text-2xl font-bold text-secondary">{40 - currentWeek}</div>
            <div className="text-xs text-muted-foreground">semanas</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestationalVisualization;
