import { useState } from "react";
import { useTokenGate } from "@/hooks/useTokenGate";
import { TokenGateAlert } from "@/components/TokenGateAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Info, Calendar, Baby, Stethoscope, Syringe, HeartPulse,
  Salad, Ruler, ChevronDown, ChevronUp, AlertCircle
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
  const { blocked, needsLogin, consuming, subscription, consumeToken, isFreeCalculator } = useTokenGate("gestational");
  const [calculationType, setCalculationType] = useState<CalculationType>("lmp");
  const [lmpDate, setLmpDate] = useState<Date | undefined>();
  const [ultrasoundDate, setUltrasoundDate] = useState<Date | undefined>();
  const [ultrasoundWeeks, setUltrasoundWeeks] = useState(0);
  const [ultrasoundDays, setUltrasoundDays] = useState(0);
  const [transferDate, setTransferDate] = useState<Date | undefined>();
  const [embryoDays, setEmbryoDays] = useState("5");
  const [expandedSection, setExpandedSection] = useState<string | null>("development");
  const [results, setResults] = useState<CalcResults | null>(null);

  const handleCalculate = async () => {
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
    const ok = await consumeToken();
    if (!ok) return;
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
      <TokenGateAlert needsLogin={needsLogin} blocked={blocked} tokensRemaining={subscription?.tokens_remaining} />
      {/* Input */}
      <div className="glass-card-static p-6 md:p-8 space-y-6 mesh-navy">
        <div>
          <h2 className="font-display text-xl text-foreground">Calculadora de Idade Gestacional</h2>
          <p className="text-sm text-muted-foreground mt-1">
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

        <Button onClick={handleCalculate} disabled={blocked || needsLogin || consuming} className="bg-accent text-accent-foreground hover:bg-accent/90 glow-accent disabled:opacity-50">
          Calcular
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
            <div className="glass-card-static p-6 md:p-8 mesh-navy min-h-[200px] flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Baby className="w-4 h-4 text-accent" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">{trimCfg?.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="tabular-nums text-4xl font-display text-foreground">{results.weeks}</span>
                    <span className="text-sm text-muted-foreground">sem</span>
                    <span className="tabular-nums text-2xl font-display text-foreground ml-2">{results.days}</span>
                    <span className="text-sm text-muted-foreground">dias</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{trimCfg?.description} · {trimCfg?.range}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Progresso</p>
                  <p className="tabular-nums text-3xl font-display text-accent">{results.progressPercent}%</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6 space-y-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${results.progressPercent}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-gradient-to-r from-folicular via-accent to-primary rounded-full glow-accent"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1º Trim</span><span>2º Trim</span><span>3º Trim</span><span>40sem</span>
                </div>
              </div>
            </div>

            {/* Key Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card-static p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">Data Provável do Parto</span>
                </div>
                <p className="tabular-nums text-lg font-display text-foreground">{results.dueDate}</p>
                <p className="text-xs text-muted-foreground">DPP estimada (margem de ±2 semanas)</p>
              </div>
              <div className="glass-card-static p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Biometria Comparativa</span>
                </div>
                <p className="text-sm text-foreground">{results.developmentInfo.size}</p>
                <p className="text-xs text-muted-foreground">Referência aproximada para a idade gestacional</p>
              </div>
              <div className="glass-card-static p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Baby className="w-4 h-4 text-ovulatory" />
                  <span className="text-sm font-medium text-foreground">Marco do Desenvolvimento</span>
                </div>
                <p className="text-sm text-foreground">{results.developmentInfo.milestone}</p>
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

export default GestationalCalculator;
