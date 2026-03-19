import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Info, Calendar, Baby, Stethoscope, Syringe, HeartPulse,
  Salad, Ruler, ChevronDown, AlertCircle
} from "lucide-react";
import {
  calculateGestationalAgeFromLMP,
  calculateGestationalAgeFromUltrasound,
  calculateGestationalAgeFromTransfer,
} from "@/lib/calculators";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import GestationalVisualization from "@/components/GestationalVisualization";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "@/components/DatePicker";

type CalculationType = "lmp" | "ultrasound" | "transfer";

const TRIMESTER_CONFIG = [
  { label: "1º Trimestre", range: "Semanas 1–13", description: "Organogênese" },
  { label: "2º Trimestre", range: "Semanas 14–27", description: "Crescimento e diferenciação" },
  { label: "3º Trimestre", range: "Semanas 28–40", description: "Maturação funcional" },
];

interface CalcResults {
  gestationalAge: string;
  weeks: number;
  days: number;
  dueDate: string;
  dueDateRaw: Date;
  firstTrimester: string;
  secondTrimester: string;
  currentTrimester: number;
  progressPercent: number;
  developmentInfo: { title: string; development: string; size: string; milestone: string };
  prenatalCare: { nutrition: string; lifestyle: string; warning_signs: string; examinations: string; vaccines: string; special_care: string };
}

const GestationalCalculator = () => {
  const [calculationType, setCalculationType] = useState<CalculationType>("lmp");
  const [lmpDate, setLmpDate] = useState<Date | undefined>();
  const [ultrasoundDate, setUltrasoundDate] = useState<Date | undefined>();
  const [ultrasoundWeeks, setUltrasoundWeeks] = useState(0);
  const [ultrasoundDays, setUltrasoundDays] = useState(0);
  const [transferDate, setTransferDate] = useState<Date | undefined>();
  const [embryoDays, setEmbryoDays] = useState("5");
  const [expandedSection, setExpandedSection] = useState<string | null>("development");
  const [results, setResults] = useState<CalcResults | null>(null);

  const handleCalculate = () => {
    let result;
    if (calculationType === "lmp") {
      if (!lmpDate) return;
      result = calculateGestationalAgeFromLMP(lmpDate);
    } else if (calculationType === "ultrasound") {
      if (!ultrasoundDate) return;
      result = calculateGestationalAgeFromUltrasound(ultrasoundDate, ultrasoundWeeks, ultrasoundDays);
    } else {
      if (!transferDate) return;
      result = calculateGestationalAgeFromTransfer(transferDate, parseInt(embryoDays));
    }

    if (!result) return;
    const progressPercent = Math.min(100, Math.round((result.weeks / 40) * 100));

    setResults({
      gestationalAge: `${result.weeks} semanas e ${result.days} dias`,
      weeks: result.weeks,
      days: result.days,
      dueDate: format(result.dueDate, "dd/MM/yyyy", { locale: ptBR }),
      dueDateRaw: result.dueDate,
      firstTrimester: format(result.firstTrimesterEnd, "dd/MM/yyyy", { locale: ptBR }),
      secondTrimester: format(result.secondTrimesterEnd, "dd/MM/yyyy", { locale: ptBR }),
      currentTrimester: result.currentTrimester,
      progressPercent,
      developmentInfo: result.developmentInfo,
      prenatalCare: result.prenatalCare,
    });
  };

  const toggleSection = (s: string) => setExpandedSection(expandedSection === s ? null : s);
  const trimCfg = results ? TRIMESTER_CONFIG[results.currentTrimester - 1] : null;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="glass-card-static p-5 sm:p-6 space-y-5 mesh-teal">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-secondary/15 flex items-center justify-center">
              <Baby className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <h2 className="font-display text-lg text-foreground leading-tight">Calculadora de Idade Gestacional</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">DPP & Desenvolvimento Fetal</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Cálculo de idade gestacional, data provável do parto e referências de desenvolvimento fetal por semana gestacional.
          </p>
        </div>

        {/* Method Selection */}
        <div className="space-y-3">
          <Label className="text-sm text-foreground">Método de Cálculo</Label>
          <RadioGroup
            value={calculationType}
            onValueChange={(v) => setCalculationType(v as CalculationType)}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {[
              { value: "lmp", label: "Última Menstruação", desc: "Método padrão" },
              { value: "ultrasound", label: "Ultrassom", desc: "Via imagem" },
              { value: "transfer", label: "Transferência (FIV)", desc: "Embrionária" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                  calculationType === opt.value
                    ? "border-accent/50 bg-accent/10"
                    : "border-border bg-muted/20 hover:bg-muted/30"
                }`}
              >
                <RadioGroupItem value={opt.value} className="mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* Dynamic Inputs */}
        {calculationType === "lmp" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm text-foreground">Data da Última Menstruação</Label>
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>Primeiro dia do último ciclo menstrual</TooltipContent>
                </Tooltip>
              </div>
              <DatePicker
                date={lmpDate}
                onSelect={setLmpDate}
                placeholder="Selecionar data"
                disabled={(date) => date > new Date()}
              />
            </div>
          </div>
        )}

        {calculationType === "ultrasound" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Data do Ultrassom</Label>
              <DatePicker
                date={ultrasoundDate}
                onSelect={setUltrasoundDate}
                placeholder="Selecionar data"
                disabled={(date) => date > new Date()}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Idade Gestacional no Ultrassom</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Semanas</Label>
                  <Input type="number" min={0} max={42} value={ultrasoundWeeks} onChange={(e) => setUltrasoundWeeks(parseInt(e.target.value) || 0)} className="input-glass tabular-nums" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Dias</Label>
                  <Input type="number" min={0} max={6} value={ultrasoundDays} onChange={(e) => setUltrasoundDays(parseInt(e.target.value) || 0)} className="input-glass tabular-nums" />
                </div>
              </div>
            </div>
          </div>
        )}

        {calculationType === "transfer" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Data da Transferência</Label>
              <DatePicker
                date={transferDate}
                onSelect={setTransferDate}
                placeholder="Selecionar data"
                disabled={(date) => date > new Date()}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Dias do Embrião</Label>
              <Select value={embryoDays} onValueChange={setEmbryoDays}>
                <SelectTrigger className="input-glass"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 dias</SelectItem>
                  <SelectItem value="5">5 dias (blastocisto)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <Button onClick={handleCalculate} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 glow-secondary flex items-center gap-2">
          <Baby className="w-4 h-4" />
          Calcular Idade Gestacional
        </Button>
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
            {/* Hero Banner */}
            <div className="glass-card-static p-5 sm:p-6 mesh-teal relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none">
                <div className="absolute inset-0 bg-secondary/5 rounded-bl-[3rem]" />
              </div>

              <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-secondary/25 flex items-center justify-center">
                      <Baby className="w-3.5 h-3.5 text-secondary" />
                    </div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{trimCfg?.label} · {trimCfg?.range}</span>
                  </div>
                  <div className="flex items-baseline gap-2 animate-count-up">
                    <span className="number-display text-5xl font-display text-foreground">{results.weeks}</span>
                    <span className="text-base text-muted-foreground">sem</span>
                    <span className="number-display text-3xl font-display text-foreground ml-1">{results.days}</span>
                    <span className="text-base text-muted-foreground">dias</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{trimCfg?.description}</p>
                </div>

                <div className="flex gap-4">
                  <div className="stat-card text-center min-w-[72px]">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Progresso</p>
                    <p className="number-display text-2xl font-display text-secondary">{results.progressPercent}%</p>
                    <p className="text-[10px] text-muted-foreground">da gravidez</p>
                  </div>
                  <div className="stat-card text-center min-w-[72px]">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">DPP</p>
                    <p className="number-display text-sm font-display text-foreground leading-snug">{results.dueDate}</p>
                    <p className="text-[10px] text-muted-foreground">estimada</p>
                  </div>
                </div>
              </div>

              {/* Progress bar with trimester segments */}
              <div className="relative mt-5 space-y-2">
                <div className="h-3 bg-muted/60 rounded-full overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${results.progressPercent}%` }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full relative overflow-hidden"
                    style={{
                      background: "linear-gradient(90deg, hsl(220,50%,55%) 0%, hsl(280,35%,50%) 45%, hsl(200,70%,58%) 100%)"
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" />
                  </motion.div>
                  {/* Trimester dividers */}
                  <div className="absolute top-0 h-full w-px bg-background/40" style={{ left: "32.5%" }} />
                  <div className="absolute top-0 h-full w-px bg-background/40" style={{ left: "67.5%" }} />
                </div>
                <div className="flex text-[10px] text-muted-foreground">
                  <span className={`flex-1 ${results.currentTrimester === 1 ? "text-foreground font-semibold" : ""}`}>1º Trim.</span>
                  <span className={`flex-1 text-center ${results.currentTrimester === 2 ? "text-foreground font-semibold" : ""}`}>2º Trim.</span>
                  <span className={`flex-1 text-center ${results.currentTrimester === 3 ? "text-foreground font-semibold" : ""}`}>3º Trim.</span>
                  <span className="text-right">40sem</span>
                </div>
              </div>
            </div>

            {/* Key Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="stat-card space-y-2 border border-secondary/20">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5 text-secondary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">DPP</span>
                </div>
                <p className="tabular-nums text-lg font-display text-foreground">{results.dueDate}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">Data provável do parto (±2 semanas)</p>
              </div>
              <div className="stat-card space-y-2 border border-primary/20">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Ruler className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tamanho</span>
                </div>
                <p className="text-sm text-foreground leading-snug">{results.developmentInfo.size}</p>
                <p className="text-[10px] text-muted-foreground">Referência comparativa</p>
              </div>
              <div className="stat-card space-y-2 border border-accent/20">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Baby className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Marco</span>
                </div>
                <p className="text-sm text-foreground leading-snug">{results.developmentInfo.milestone}</p>
              </div>
            </div>

            {/* Trimester Dates */}
            <div className="glass-card-static p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Limites dos Trimestres</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {[
                  { label: "1º Trimestre", date: results.firstTrimester, sub: "até semana 13" },
                  { label: "2º Trimestre", date: results.secondTrimester, sub: "até semana 27" },
                  { label: "3º Trimestre", date: results.dueDate, sub: "até semana 40" },
                ].map((t, i) => (
                  <div key={t.label} className={`flex-1 p-3 rounded-xl ${results.currentTrimester === i + 1 ? "bg-accent/10 border border-accent/30" : "bg-muted/20"}`}>
                    <p className="text-xs text-muted-foreground">{t.label}</p>
                    <p className="text-sm font-medium text-foreground tabular-nums">{t.date}</p>
                    <p className="text-xs text-muted-foreground">{t.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fetal Development */}
            <CollapsibleSection
              title={`Desenvolvimento Fetal — Semana ${results.weeks}`}
              icon={<Baby className="w-4 h-4 text-accent" />}
              isOpen={expandedSection === "development"}
              onToggle={() => toggleSection("development")}
            >
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-foreground">{results.developmentInfo.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{results.developmentInfo.development}</p>
                </div>
              </div>
            </CollapsibleSection>

            {/* Prenatal Care */}
            <CollapsibleSection
              title="Cuidados Pré-Natais"
              icon={<HeartPulse className="w-4 h-4 text-accent" />}
              isOpen={expandedSection === "prenatal"}
              onToggle={() => toggleSection("prenatal")}
            >
              <div className="p-4 space-y-3">
                {[
                  { icon: <Stethoscope className="w-4 h-4 text-folicular" />, title: "Exames", text: results.prenatalCare.examinations },
                  { icon: <Syringe className="w-4 h-4 text-accent" />, title: "Vacinas", text: results.prenatalCare.vaccines },
                  { icon: <Salad className="w-4 h-4 text-luteal" />, title: "Alimentação", text: results.prenatalCare.nutrition },
                  { icon: <HeartPulse className="w-4 h-4 text-primary" />, title: "Cuidados Especiais", text: results.prenatalCare.special_care },
                ].map((item, i) => (
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

                {/* Warning Signs */}
                <div className="glass-card-static p-4 border-destructive/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <span className="font-medium text-sm text-foreground">Sinais de Alerta</span>
                    <Badge variant="destructive" className="text-xs">Urgente</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{results.prenatalCare.warning_signs}</p>
                </div>
              </div>
            </CollapsibleSection>

            {/* Visualization */}
            <GestationalVisualization
              currentWeek={results.weeks}
              dueDate={results.dueDateRaw}
            />

            {/* Disclaimer */}
            <div className="glass-card-static p-4 border-accent/20">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Nota técnica:</strong> Os valores apresentados são estimativas baseadas em métodos de cálculo padronizados.
                As referências seguem diretrizes do Ministério da Saúde, FEBRASGO e ACOG.
                Estes resultados não substituem avaliação, diagnóstico ou conduta de profissional de saúde habilitado.
              </p>
            </div>
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
      className="collapsible-header"
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${isOpen ? "bg-secondary/20" : "bg-muted/40"}`}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
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
          <div className="border-t border-border/30" />
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default GestationalCalculator;
