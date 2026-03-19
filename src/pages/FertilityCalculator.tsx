import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Info, Droplets, Thermometer, ChevronDown, ChevronUp,
  Calendar as CalendarIcon, Activity, Heart, Clock, Sparkles,
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
import { DatePicker } from "@/components/DatePicker";

const PHASE_CONFIG: Record<string, { color: string; label: string; description: string; bgColor: string }> = {
  menstrual:    { color: "text-menstrual",   bgColor: "bg-menstrual/15 border-menstrual/25",   label: "Menstrual",   description: "Descamação endometrial" },
  folicular:    { color: "text-folicular",   bgColor: "bg-folicular/15 border-folicular/25",   label: "Folicular",   description: "Desenvolvimento folicular" },
  "fértil":     { color: "text-fertility",   bgColor: "bg-fertility/15 border-fertility/25",   label: "Fértil",      description: "Período de maior probabilidade concepcional" },
  "ovulatória": { color: "text-ovulatory",   bgColor: "bg-ovulatory/15 border-ovulatory/25",   label: "Ovulatória",  description: "Liberação oocitária" },
  "lútea":      { color: "text-luteal",      bgColor: "bg-luteal/15 border-luteal/25",         label: "Lútea",       description: "Predominância de progesterona" },
};

const CYCLE_PHASES = [
  { key: "menstrual", label: "Menstrual", color: "bg-menstrual",  pct: 18 },
  { key: "folicular", label: "Folicular", color: "bg-folicular",  pct: 32 },
  { key: "fértil",    label: "Fértil",    color: "bg-fertility",  pct: 21 },
  { key: "lútea",     label: "Lútea",     color: "bg-luteal",     pct: 29 },
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
  const [lastPeriodStart, setLastPeriodStart] = useState<Date | undefined>();
  const [lastPeriodEnd, setLastPeriodEnd] = useState<Date | undefined>();
  const [cycleLength, setCycleLength] = useState(28);
  const [cycleHistory] = useState<CycleHistory[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>("bodyChanges");
  const [results, setResults] = useState<CalcResults | null>(null);

  const handleCalculate = () => {
    if (!lastPeriodStart || !lastPeriodEnd) return;

    const avgCycleLength = cycleHistory.length > 1
      ? Math.round(cycleHistory.reduce((acc, c) => acc + c.cycleLength, 0) / cycleHistory.length)
      : cycleLength;

    const result = calculateFertilePeriod(lastPeriodStart, lastPeriodEnd, avgCycleLength, cycleHistory);

    const today = new Date();
    let currentCyclePhase = "folicular";
    let daysUntilNextPhase = 0;
    let nextPhase = "";

    if (today >= lastPeriodStart && today <= lastPeriodEnd) {
      currentCyclePhase = "menstrual";
      nextPhase = "folicular";
      daysUntilNextPhase = differenceInDays(lastPeriodEnd, today) + 1;
    } else if (today > lastPeriodEnd && today < result.fertileStart) {
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
    const monthEnd   = endOfMonth(results.nextPeriodStart);
    const startDow   = getDay(monthStart);
    const today      = new Date();
    const days: JSX.Element[] = [];

    for (let i = 0; i < startDow; i++) {
      days.push(<div key={`e-${i}`} />);
    }

    let cur = monthStart;
    while (cur <= monthEnd) {
      const isToday     = isSameDay(cur, today);
      const isPeriod    = isWithinInterval(cur, { start: results.nextPeriodStart, end: results.nextPeriodEnd })
        || (lastPeriodStart && lastPeriodEnd && isWithinInterval(cur, { start: lastPeriodStart, end: lastPeriodEnd }));
      const isFertile   = isWithinInterval(cur, { start: results.fertileStart, end: results.fertileEnd });
      const isOvulation = isSameDay(cur, results.ovulationDay);

      let cls = "flex items-center justify-center rounded-xl text-xs font-medium h-9 w-full transition-all duration-200 ";
      if (isOvulation)      cls += "bg-primary text-primary-foreground ring-2 ring-primary/60 shadow-sm";
      else if (isFertile)   cls += "bg-fertility/20 text-fertility ring-1 ring-fertility/35";
      else if (isPeriod)    cls += "bg-menstrual/20 text-menstrual ring-1 ring-menstrual/35";
      else if (isToday)     cls += "ring-2 ring-folicular text-folicular bg-folicular/12";
      else                  cls += "text-muted-foreground hover:bg-muted/40";

      days.push(
        <div key={cur.toISOString()} className={cls}>
          {format(cur, "d")}
        </div>,
      );
      cur = addDays(cur, 1);
    }
    return days;
  };

  const toggleSection = (s: string) => setExpandedSection(expandedSection === s ? null : s);
  const phaseConfig = results ? (PHASE_CONFIG[results.currentCyclePhase] ?? PHASE_CONFIG["folicular"]) : null;

  const renderBiomarkers = () => {
    if (!results) return null;
    const { mucus, bbt, hormones } = getCyclePhaseDetail(results.currentCyclePhase);
    return (
      <div className="space-y-2.5">
        {[
          { icon: <Droplets className="w-4 h-4 text-fertility" />,  title: "Muco Cervical",     text: mucus },
          { icon: <Thermometer className="w-4 h-4 text-menstrual" />, title: "Temperatura Basal", text: bbt },
          { icon: <Activity className="w-4 h-4 text-ovulatory" />,  title: "Hormônios",          text: hormones },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card-static p-4 space-y-1.5"
          >
            <div className="flex items-center gap-2">
              {item.icon}
              <span className="font-semibold text-sm text-foreground">{item.title}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
          </motion.div>
        ))}
      </div>
    );
  };

  const canCalculate = !!lastPeriodStart && !!lastPeriodEnd;

  return (
    <div className="space-y-5">

      {/* ─── Input Section ─────────────────────────────── */}
      <div className="glass-card-static p-5 sm:p-6 space-y-5 mesh-cyan">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-accent" />
            <h2 className="font-display text-lg text-foreground">Calculadora de Ciclo Menstrual</h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Estimativa de período fértil, data de ovulação e fase do ciclo com base em parâmetros do ciclo menstrual.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs font-semibold text-foreground">Início da Última Menstruação</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center">
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Primeiro dia do último ciclo menstrual</TooltipContent>
              </Tooltip>
            </div>
            <DatePicker
              date={lastPeriodStart}
              onSelect={setLastPeriodStart}
              placeholder="Selecionar data"
              disabled={(date) => date > new Date()}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs font-semibold text-foreground">Fim da Última Menstruação</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center">
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Último dia de sangramento</TooltipContent>
              </Tooltip>
            </div>
            <DatePicker
              date={lastPeriodEnd}
              onSelect={setLastPeriodEnd}
              placeholder="Selecionar data"
              disabled={(date) => date > new Date() || (lastPeriodStart ? date < lastPeriodStart : false)}
            />
          </div>
        </div>

        <div className="flex items-end gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label className="text-xs font-semibold text-foreground">Duração do Ciclo</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center">
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
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
              <span className="text-xs text-muted-foreground whitespace-nowrap">dias</span>
            </div>
          </div>

          <Button
            onClick={handleCalculate}
            disabled={!canCalculate}
            className={`flex-1 sm:flex-none flex items-center gap-2 font-semibold transition-all duration-300 ${
              canCalculate ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-primary" : "opacity-50 cursor-not-allowed"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Calcular Ciclo
          </Button>
        </div>
      </div>

      {/* ─── Results ───────────────────────────────────── */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* Hero Phase Banner */}
            <div className={`glass-card-static p-5 sm:p-6 mesh-cyan border ${phaseConfig?.bgColor}`}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Fase Atual</span>
                  </div>
                  <h2 className={`font-display text-2xl sm:text-3xl capitalize ${phaseConfig?.color}`}>
                    {results.currentCyclePhase}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{phaseConfig?.description}</p>
                </div>
                <div className="flex gap-5 sm:gap-6">
                  {results.daysUntilNextPhase > 0 && (
                    <div className="text-center">
                      <p className="tabular-nums text-2xl font-display text-foreground">{results.daysUntilNextPhase}</p>
                      <p className="text-[10px] text-muted-foreground">dias para</p>
                      <p className="text-xs text-primary capitalize font-medium">{results.nextPhase}</p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="tabular-nums text-2xl font-display text-foreground">{cycleLength}</p>
                    <p className="text-[10px] text-muted-foreground">dias</p>
                    <p className="text-[10px] text-muted-foreground">do ciclo</p>
                  </div>
                </div>
              </div>

              {/* Phase progress bar */}
              <div className="mt-5 space-y-2">
                <div className="flex rounded-full overflow-hidden h-2 gap-px">
                  {CYCLE_PHASES.map((p) => (
                    <div
                      key={p.key}
                      className={`${p.color} transition-opacity duration-300 ${
                        results.currentCyclePhase === p.key ? "opacity-100" : "opacity-22"
                      }`}
                      style={{ width: `${p.pct}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  {CYCLE_PHASES.map((p) => (
                    <span key={p.key} className={results.currentCyclePhase === p.key ? "text-primary font-medium" : ""}>
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Date Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Fertile Window */}
              <div className="glass-card-static p-4 space-y-3 border border-fertility/20">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-fertility/20 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-fertility" />
                  </div>
                  <span className="font-semibold text-sm text-foreground">Janela Fértil</span>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Início</p>
                    <p className="text-base font-display text-foreground tabular-nums">
                      {format(results.fertileStart, "dd MMM", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex-1 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex-1 h-0.5 rounded-full bg-fertility/40" />
                    ))}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Fim</p>
                    <p className="text-base font-display text-foreground tabular-nums">
                      {format(results.fertileEnd, "dd MMM", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Intervalo estimado de maior probabilidade de concepção
                </p>
              </div>

              {/* Ovulation */}
              <div className="glass-card-static p-4 space-y-3 border border-ovulatory/20">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-ovulatory/20 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-ovulatory" />
                  </div>
                  <span className="font-semibold text-sm text-foreground">Dia da Ovulação</span>
                  <Badge variant="outline" className="text-[10px] border-ovulatory/30 text-ovulatory ml-auto">
                    Estimado
                  </Badge>
                </div>
                <p className="text-xl font-display text-foreground tabular-nums">
                  {format(results.ovulationDay, "dd 'de' MMMM", { locale: ptBR })}
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Viabilidade oocitária estimada em aproximadamente 24 horas
                </p>
              </div>
            </div>

            {/* Next Period */}
            <CollapsibleSection
              title="Próxima Menstruação"
              icon={<Clock className="w-4 h-4 text-menstrual" />}
              isOpen={expandedSection === "nextPeriod"}
              onToggle={() => toggleSection("nextPeriod")}
            >
              <div className="p-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Início</p>
                    <p className="text-sm font-semibold text-foreground tabular-nums">
                      {format(results.nextPeriodStart, "dd/MM/yyyy")}
                    </p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {format(results.nextPeriodStart, "EEEE", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex-1 h-px bg-menstrual/30" />
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Fim</p>
                    <p className="text-sm font-semibold text-foreground tabular-nums">
                      {format(results.nextPeriodEnd, "dd/MM/yyyy")}
                    </p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {format(results.nextPeriodEnd, "EEEE", { locale: ptBR })}
                    </p>
                  </div>
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
            <CycleVisualization
              cycleLength={cycleLength}
              currentDay={Math.max(1, differenceInDays(new Date(), lastPeriodStart!) + 1)}
              periodLength={lastPeriodEnd && lastPeriodStart ? differenceInDays(lastPeriodEnd, lastPeriodStart) + 1 : 5}
              ovulationDay={differenceInDays(results.ovulationDay, lastPeriodStart!) + 1}
            />

            {/* Calendar */}
            <CollapsibleSection
              title="Calendário Analítico"
              icon={<CalendarIcon className="w-4 h-4 text-primary" />}
              isOpen={expandedSection === "calendar"}
              onToggle={() => toggleSection("calendar")}
            >
              <div className="p-4 space-y-4">
                <p className="text-sm font-semibold text-foreground text-center">
                  {format(results.nextPeriodStart, "MMMM yyyy", { locale: ptBR }).toUpperCase()}
                </p>
                <div className="grid grid-cols-7 gap-1">
                  {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                    <div key={i} className="text-center text-[10px] text-muted-foreground font-semibold py-1">
                      {d}
                    </div>
                  ))}
                  {renderCalendar()}
                </div>
                <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-md bg-menstrual/40" />Menstruação
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-md bg-fertility/40" />Fértil
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-md bg-primary" />Ovulação
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-md ring-2 ring-folicular bg-transparent" />Hoje
                  </span>
                </div>
              </div>
            </CollapsibleSection>

            {/* Technical Disclaimer */}
            <div className="glass-card-static p-4 border-muted/30">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground/70">Nota técnica:</strong> Os valores apresentados são estimativas baseadas em modelos de cálculo padrão.
                A duração e regularidade do ciclo podem ser influenciadas por estresse, medicamentos e condições clínicas.
                Estes resultados não substituem avaliação médica individualizada.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Collapsible Section ──────────────────────────────────────────────────────

const CollapsibleSection = ({
  title, icon, isOpen, onToggle, children,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <div className="glass-card-static overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 tech-gradient hover:bg-muted/20 transition-colors"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </motion.div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default FertilityCalculator;
