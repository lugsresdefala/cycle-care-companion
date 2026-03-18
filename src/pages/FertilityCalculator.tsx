import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Info, Droplets, Thermometer, ChevronDown, ChevronUp,
  Calendar as CalendarIcon, Activity, Heart, Clock
} from "lucide-react";
import {
  calculateFertilePeriod,
  getCyclePhaseDetail,
  type CycleHistory,
} from "@/lib/calculators";
import {
  addDays, format, isSameDay, startOfMonth, endOfMonth,
  getDay, isWithinInterval, differenceInDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import CycleVisualization from "@/components/CycleVisualization";
import { motion, AnimatePresence } from "framer-motion";

const PHASE_CONFIG: Record<string, { color: string; label: string; description: string }> = {
  menstrual:  { color: "text-menstrual",   label: "Menstrual",  description: "Descamação endometrial" },
  folicular:  { color: "text-folicular",   label: "Folicular",  description: "Desenvolvimento folicular" },
  "fértil":   { color: "text-fertility",   label: "Fértil",     description: "Período de maior probabilidade concepcional" },
  "ovulatória": { color: "text-ovulatory", label: "Ovulatória", description: "Liberação oocitária" },
  "lútea":    { color: "text-luteal",      label: "Lútea",      description: "Predominância de progesterona" },
};

const CYCLE_PHASES = [
  { key: "menstrual",  label: "Menstrual",  color: "bg-menstrual",  width: 18 },
  { key: "folicular",  label: "Folicular",  color: "bg-folicular",  width: 32 },
  { key: "fértil",     label: "Fértil",     color: "bg-fertility",  width: 21 },
  { key: "lútea",      label: "Lútea",      color: "bg-luteal",     width: 29 },
];

interface CalcResults {
  ovulationDay: Date;
  fertileStart: Date;
  fertileEnd: Date;
  nextPeriodStart: Date;
  nextPeriodEnd: Date;
  currentCyclePhase: string;
  daysUntilNextPhase: number;
  nextPhase: string;
  cycleVariability?: number;
}

const FertilityCalculator = () => {
  const [lastPeriodStart, setLastPeriodStart] = useState("");
  const [lastPeriodEnd, setLastPeriodEnd] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [cycleHistory] = useState<CycleHistory[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>("bodyChanges");
  const [results, setResults] = useState<CalcResults | null>(null);

  const handleCalculate = () => {
    if (!lastPeriodStart || !lastPeriodEnd) return;

    const avgCycleLength = cycleHistory.length > 1
      ? Math.round(cycleHistory.reduce((acc, c) => acc + c.cycleLength, 0) / cycleHistory.length)
      : cycleLength;

    const result = calculateFertilePeriod(
      new Date(lastPeriodStart), new Date(lastPeriodEnd), avgCycleLength, cycleHistory
    );

    const today = new Date();
    let currentCyclePhase = "folicular";
    let daysUntilNextPhase = 0;
    let nextPhase = "";

    const periodStartDate = new Date(lastPeriodStart);
    const periodEndDate = new Date(lastPeriodEnd);

    if (today >= periodStartDate && today <= periodEndDate) {
      currentCyclePhase = "menstrual";
      nextPhase = "folicular";
      daysUntilNextPhase = differenceInDays(periodEndDate, today) + 1;
    } else if (today > periodEndDate && today < result.fertileStart) {
      currentCyclePhase = "folicular";
      nextPhase = "fértil";
      daysUntilNextPhase = differenceInDays(result.fertileStart, today);
    } else if (today >= result.fertileStart && today <= result.fertileEnd) {
      currentCyclePhase = isSameDay(today, result.ovulationDay) ? "ovulatória" : "fértil";
      nextPhase = "lútea";
      daysUntilNextPhase = differenceInDays(addDays(result.fertileEnd, 1), today);
    } else if (today > result.fertileEnd && today < result.nextPeriodStart) {
      currentCyclePhase = "lútea";
      nextPhase = "menstrual";
      daysUntilNextPhase = differenceInDays(result.nextPeriodStart, today);
    } else {
      currentCyclePhase = "menstrual";
      nextPhase = "folicular";
      daysUntilNextPhase = 0;
    }

    setResults({ ...result, currentCyclePhase, daysUntilNextPhase, nextPhase });
  };

  const renderCalendar = () => {
    if (!results) return null;
    const monthStart = startOfMonth(results.nextPeriodStart);
    const monthEnd = endOfMonth(results.nextPeriodStart);
    const startDow = getDay(monthStart);
    const today = new Date();
    const days: JSX.Element[] = [];

    for (let i = 0; i < startDow; i++) {
      days.push(<div key={`e-${i}`} />);
    }

    let cur = monthStart;
    while (cur <= monthEnd) {
      const isToday = isSameDay(cur, today);
      const isPeriod = isWithinInterval(cur, { start: results.nextPeriodStart, end: results.nextPeriodEnd })
        || isWithinInterval(cur, { start: new Date(lastPeriodStart), end: new Date(lastPeriodEnd) });
      const isFertile = isWithinInterval(cur, { start: results.fertileStart, end: results.fertileEnd });
      const isOvulation = isSameDay(cur, results.ovulationDay);

      let cls = "flex items-center justify-center rounded-lg text-xs font-medium h-8 transition-all duration-200 ";
      if (isOvulation) cls += "bg-primary text-primary-foreground glow-primary ring-2 ring-primary/50";
      else if (isFertile) cls += "bg-fertility/20 text-fertility ring-1 ring-fertility/30";
      else if (isPeriod) cls += "bg-menstrual/20 text-menstrual ring-1 ring-menstrual/30";
      else if (isToday) cls += "ring-2 ring-folicular text-folicular bg-folicular/10";
      else cls += "text-muted-foreground hover:bg-muted/40";

      days.push(
        <div key={cur.toISOString()} className={cls}>
          {format(cur, "d")}
        </div>
      );
      cur = addDays(cur, 1);
    }
    return days;
  };

  const toggleSection = (s: string) => setExpandedSection(expandedSection === s ? null : s);

  const phaseConfig = results ? (PHASE_CONFIG[results.currentCyclePhase] || PHASE_CONFIG["folicular"]) : null;

  const renderBiomarkers = () => {
    if (!results) return null;
    const { mucus, bbt, hormones } = getCyclePhaseDetail(results.currentCyclePhase);
    const items = [
      { icon: <Droplets className="w-4 h-4 text-fertility" />, title: "Muco Cervical", text: mucus },
      { icon: <Thermometer className="w-4 h-4 text-menstrual" />, title: "Temperatura Basal", text: bbt },
      { icon: <Activity className="w-4 h-4 text-ovulatory" />, title: "Hormônios", text: hormones },
    ];

    return (
      <div className="space-y-3">
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card-static p-4 space-y-2"
          >
            <div className="flex items-center gap-2">
              {item.icon}
              <span className="font-medium text-sm text-foreground">{item.title}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="glass-card-static p-6 md:p-8 space-y-6 mesh-cyan">
        <div>
          <h2 className="font-display text-xl text-foreground">Calculadora de Ciclo Menstrual</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Estimativa de período fértil, data de ovulação e fase do ciclo com base em parâmetros do ciclo menstrual.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: "start", label: "Início da Última Menstruação", value: lastPeriodStart, onChange: setLastPeriodStart, tip: "Primeiro dia do seu último ciclo menstrual" },
            { id: "end", label: "Fim da Última Menstruação", value: lastPeriodEnd, onChange: setLastPeriodEnd, tip: "Último dia de sangramento" },
          ].map((f) => (
            <div key={f.id} className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor={f.id} className="text-sm text-foreground">{f.label}</Label>
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>{f.tip}</TooltipContent>
                </Tooltip>
              </div>
              <Input
                id={f.id}
                type="date"
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                className="input-glass"
              />
            </div>
          ))}
        </div>

        <div className="flex items-end gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm text-foreground">Duração do Ciclo</Label>
              <Tooltip>
                <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                <TooltipContent>Geralmente entre 21 e 35 dias</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={21}
                max={45}
                value={cycleLength}
                onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
                className="input-glass w-20 tabular-nums"
              />
              <span className="text-sm text-muted-foreground">dias</span>
            </div>
          </div>
          <Button
            onClick={handleCalculate}
            className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
          >
            Calcular Ciclo
          </Button>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Hero Phase Banner */}
            <div className="glass-card-static p-6 md:p-8 mesh-cyan min-h-[200px] flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-primary" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Fase Atual</span>
                  </div>
                  <h2 className={`font-display text-3xl capitalize ${phaseConfig?.color}`}>
                    {results.currentCyclePhase}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">{phaseConfig?.description}</p>
                </div>
                <div className="flex gap-4 text-center">
                  {results.daysUntilNextPhase > 0 && (
                    <div>
                      <p className="tabular-nums text-2xl font-display text-foreground">{results.daysUntilNextPhase}</p>
                      <p className="text-xs text-muted-foreground">dias para</p>
                      <p className="text-xs text-primary capitalize">{results.nextPhase}</p>
                    </div>
                  )}
                  <div>
                    <p className="tabular-nums text-2xl font-display text-foreground">{cycleLength}</p>
                    <p className="text-xs text-muted-foreground">dias do ciclo</p>
                  </div>
                </div>
              </div>

              {/* Phase bar */}
              <div className="mt-6 space-y-2">
                <div className="flex rounded-full overflow-hidden h-2 gap-px">
                  {CYCLE_PHASES.map((p) => (
                    <div
                      key={p.key}
                      className={`${p.color} ${results.currentCyclePhase === p.key ? "opacity-100" : "opacity-30"}`}
                      style={{ width: `${p.width}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  {CYCLE_PHASES.map((p) => (
                    <span key={p.key} className={results.currentCyclePhase === p.key ? "text-primary" : ""}>
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Date Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-card-static p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-fertility" />
                  <span className="font-medium text-sm text-foreground">Janela Fértil</span>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Início</p>
                    <p className="text-sm font-medium text-foreground tabular-nums">{format(results.fertileStart, "dd MMM", { locale: ptBR })}</p>
                  </div>
                  <div className="h-px flex-1 bg-fertility/30" />
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Fim</p>
                    <p className="text-sm font-medium text-foreground tabular-nums">{format(results.fertileEnd, "dd MMM", { locale: ptBR })}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Intervalo estimado de maior probabilidade de concepção</p>
              </div>

              <div className="glass-card-static p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-ovulatory" />
                  <span className="font-medium text-sm text-foreground">Dia da Ovulação</span>
                  <Badge variant="outline" className="text-xs border-ovulatory/30 text-ovulatory">Estimado</Badge>
                </div>
                <p className="text-lg font-display text-foreground tabular-nums">
                  {format(results.ovulationDay, "dd 'de' MMMM", { locale: ptBR })}
                </p>
                <p className="text-xs text-muted-foreground">Viabilidade oocitária estimada em aproximadamente 24 horas</p>
              </div>
            </div>

            {/* Next Period */}
            <CollapsibleSection
              title="Próxima Menstruação"
              icon={<Clock className="w-4 h-4 text-menstrual" />}
              isOpen={expandedSection === "nextPeriod"}
              onToggle={() => toggleSection("nextPeriod")}
            >
              <div className="flex items-center gap-4 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Início</p>
                  <p className="text-sm font-medium text-foreground tabular-nums">{format(results.nextPeriodStart, "dd/MM/yyyy")}</p>
                  <p className="text-xs text-muted-foreground capitalize">{format(results.nextPeriodStart, "EEEE", { locale: ptBR })}</p>
                </div>
                <div className="h-px flex-1 bg-menstrual/30" />
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Fim</p>
                  <p className="text-sm font-medium text-foreground tabular-nums">{format(results.nextPeriodEnd, "dd/MM/yyyy")}</p>
                  <p className="text-xs text-muted-foreground capitalize">{format(results.nextPeriodEnd, "EEEE", { locale: ptBR })}</p>
                </div>
              </div>
            </CollapsibleSection>

            {/* Biomarkers */}
            <CollapsibleSection
              title={`Biomarcadores — Fase ${results.currentCyclePhase}`}
              icon={<Droplets className="w-4 h-4 text-primary" />}
              isOpen={expandedSection === "bodyChanges"}
              onToggle={() => toggleSection("bodyChanges")}
            >
              <div className="p-4">{renderBiomarkers()}</div>
            </CollapsibleSection>

            {/* Cycle Visualization */}
            <CycleVisualization currentPhase={results.currentCyclePhase} cycleLength={cycleLength} />

            {/* Calendar */}
            <CollapsibleSection
              title="Calendário Analítico"
              icon={<CalendarIcon className="w-4 h-4 text-primary" />}
              isOpen={expandedSection === "calendar"}
              onToggle={() => toggleSection("calendar")}
            >
              <div className="p-4 space-y-4">
                <p className="text-sm font-medium text-foreground text-center">
                  {format(results.nextPeriodStart, "MMMM yyyy", { locale: ptBR }).toUpperCase()}
                </p>
                <div className="grid grid-cols-7 gap-1">
                  {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                    <div key={i} className="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
                  ))}
                  {renderCalendar()}
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-menstrual/40" />Menstruação</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-fertility/40" />Fértil</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary" />Ovulação</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full ring-2 ring-folicular" />Hoje</span>
                </div>
              </div>
            </CollapsibleSection>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground leading-relaxed px-1">
              <strong>Nota técnica:</strong> Os valores apresentados são estimativas baseadas em modelos de cálculo padrão.
              A duração e regularidade do ciclo menstrual podem ser influenciadas por fatores como estresse, uso de medicamentos e condições clínicas subjacentes.
              Estes resultados não substituem avaliação médica individualizada.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Collapsible helper
const CollapsibleSection = ({
  title, icon, isOpen, onToggle, children,
}: {
  title: string; icon: React.ReactNode; isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) => (
  <div className="glass-card-static overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 tech-gradient hover:bg-muted/20 transition-colors"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default FertilityCalculator;
