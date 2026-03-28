import { useState } from "react";
import { useTokenGate } from "@/hooks/useTokenGate";
import { useExamSave } from "@/hooks/useExamSave";
import { PatientSelector } from "@/components/PatientSelector";
import { TokenGateAlert } from "@/components/TokenGateAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Info, Ruler, Baby, Calendar, AlertCircle } from "lucide-react";
import { gestationalAgeFromBPD, isValidBPD, dueDateFromGA } from "@/lib/biometry";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import ScientificFooter from "@/components/ScientificFooter";

const BPD_REFERENCE = [
  { bpd: 20, ga: "12+4" }, { bpd: 26, ga: "14+0" }, { bpd: 35, ga: "16+5" },
  { bpd: 43, ga: "19+0" }, { bpd: 50, ga: "21+0" }, { bpd: 58, ga: "23+3" },
  { bpd: 65, ga: "25+5" }, { bpd: 73, ga: "28+2" }, { bpd: 80, ga: "31+0" },
  { bpd: 86, ga: "33+4" }, { bpd: 91, ga: "36+0" }, { bpd: 95, ga: "38+2" },
];

const BPDCalculator = () => {
  const { blocked, needsLogin, consuming, subscription, consumeToken } = useTokenGate();
  const { saveExam, canSave } = useExamSave();
  const [bpd, setBpd] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();
  const [results, setResults] = useState<{
    weeks: number; days: number; dueDate: Date; totalDays: number;
  } | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    const value = parseFloat(bpd);
    if (isNaN(value)) { setError("Insira um valor numérico válido."); return; }
    if (!isValidBPD(value)) { setError("O DBP deve estar entre 14 e 100 mm."); return; }
    const ok = await consumeToken();
    if (!ok) return;
    setError("");
    const ga = gestationalAgeFromBPD(value);
    const res = { ...ga, dueDate: dueDateFromGA(ga.totalDays) };
    setResults(res);
    if (canSave) {
      saveExam({
        calcType: "bpd",
        inputData: { bpd: value },
        resultData: { weeks: ga.weeks, days: ga.days, totalDays: ga.totalDays },
        gestationalAgeWeeks: ga.weeks,
        gestationalAgeDays: ga.days,
      });
    }
  };

  return (
    <div className="space-y-6">
      <TokenGateAlert needsLogin={needsLogin} blocked={blocked} tokensRemaining={subscription?.tokens_remaining} />
      <div className="glass-card-static p-6 md:p-8 space-y-6 mesh-purple">
        <div>
          <h2 className="font-display text-xl text-foreground">Calculadora DBP</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Estimativa da idade gestacional pelo Diâmetro Biparietal (DBP) — 2º e 3º trimestres.
          </p>
          <Badge variant="outline" className="mt-2 text-xs border-primary/30 text-primary">Hadlock, 1982</Badge>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm text-foreground">DBP (mm)</Label>
              <Tooltip>
                <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                <TooltipContent>Diâmetro biparietal medido de borda externa a borda interna (14–100 mm)</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={14} max={100} step={0.1}
                value={bpd}
                onChange={(e) => setBpd(e.target.value)}
                placeholder="Ex: 55"
                className="input-glass w-32 tabular-nums"
              />
              <span className="text-sm text-muted-foreground">mm</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <Button onClick={handleCalculate} disabled={blocked || needsLogin || consuming} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-50">
            <Ruler className="w-4 h-4 mr-1" /> Calcular IG
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="glass-card-static p-6 md:p-8 mesh-coral">
              <div className="flex items-center gap-2 mb-2">
                <Baby className="w-4 h-4 text-primary" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Idade Gestacional Estimada</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="tabular-nums text-4xl font-display text-foreground">{results.weeks}</span>
                <span className="text-sm text-muted-foreground">semanas</span>
                <span className="tabular-nums text-2xl font-display text-foreground ml-2">{results.days}</span>
                <span className="text-sm text-muted-foreground">dias</span>
              </div>
            </div>

            <div className="glass-card-static p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Data Provável do Parto</span>
              </div>
              <p className="tabular-nums text-lg font-display text-foreground">
                {format(results.dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              <p className="text-xs text-muted-foreground">DPP estimada (±7–14 dias no 2º/3º trimestre)</p>
            </div>

            <div className="glass-card-static p-5 space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Ruler className="w-4 h-4 text-primary" />
                Tabela de Referência — DBP × IG
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">DBP (mm)</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">IG (sem+dias)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BPD_REFERENCE.map((ref) => (
                      <tr key={ref.bpd} className={`border-b border-border/50 ${Math.abs(parseFloat(bpd) - ref.bpd) < 5 ? "bg-primary/10" : ""}`}>
                        <td className="py-1.5 tabular-nums text-foreground">{ref.bpd}</td>
                        <td className="py-1.5 tabular-nums text-foreground">{ref.ga}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ScientificFooter
        references={[
          {
            authors: "Hadlock FP, Deter RL, Harrist RB, Park SK",
            title: "Estimating fetal age: computer-assisted analysis of multiple fetal growth parameters",
            journal: "Radiology",
            year: 1984,
            doi: "10.1148/radiology.152.2.6739822",
            pubmedId: "6739822",
          },
          {
            authors: "Hadlock FP, Deter RL, Harrist RB, Park SK",
            title: "Fetal biparietal diameter: a critical re-evaluation of the relation to menstrual age by means of real-time ultrasound",
            journal: "J Ultrasound Med",
            year: 1982,
            doi: "10.7863/jum.1982.1.3.97",
            pubmedId: "6152941",
          },
        ]}
        units={[
          { param: "DBP", unit: "mm", description: "Diâmetro biparietal — borda externa a borda interna" },
          { param: "Idade gestacional", unit: "sem + dias", description: "Semanas completas + dias" },
        ]}
        extraDisclaimer="O DBP isolado tem acurácia reduzida em dolicocefalia e braquicefalia. Recomenda-se biometria composta (CC, CA, CF) para maior precisão."
      />
    </div>
  );
};

export default BPDCalculator;
