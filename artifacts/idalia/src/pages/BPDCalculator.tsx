import { useState } from "react";
import { useTokenGate } from "@/hooks/useTokenGate";
import { useExamSave } from "@/hooks/useExamSave";
import { PatientSelector } from "@/components/PatientSelector";
import { TokenGateAlert } from "@/components/TokenGateAlert";
import { PageMeta } from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Info, Ruler, Baby, Calendar, AlertCircle } from "lucide-react";
import { isValidBPD } from "@/lib/biometry";
import { apiFetch, ApiError } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import ScientificFooter from "@/components/ScientificFooter";
import { BPD_REFERENCE } from "@/lib/biometry-references";

const BPDCalculator = () => {
  const { blocked, needsLogin, loading, subscription, refetch } = useTokenGate();
  const { saveExam, canSave } = useExamSave();
  const [bpd, setBpd] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();
  const [results, setResults] = useState<{
    weeks: number; days: number; dueDate: Date; totalDays: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [calculating, setCalculating] = useState(false);

  const handleCalculate = async () => {
    const value = parseFloat(bpd);
    if (isNaN(value)) { setError("Insira um valor numérico válido."); return; }
    if (!isValidBPD(value)) { setError("O DBP deve estar entre 14 e 100 mm."); return; }
    if (blocked || needsLogin || loading) return;
    setError("");
    setCalculating(true);
    try {
      const result = await apiFetch<{ weeks: number; days: number; totalDays: number; dueDate: string }>(
        "/calculate/biometry",
        { method: "POST", body: JSON.stringify({ mode: "bpd", bpd: value }) },
      );
      const dueDate = new Date(result.dueDate);
      setResults({ weeks: result.weeks, days: result.days, totalDays: result.totalDays, dueDate });
      void refetch();
      if (canSave) {
        void saveExam({
          calcType: "bpd",
          inputData: { bpd: value },
          resultData: { weeks: result.weeks, days: result.days, totalDays: result.totalDays },
          gestationalAgeWeeks: result.weeks,
          gestationalAgeDays: result.days,
          patientId: selectedPatientId,
        });
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        setError("Tokens esgotados. Assine um plano para continuar usando as calculadoras.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Faça login para usar as calculadoras premium.");
      } else {
        setError("Erro ao calcular. Tente novamente.");
      }
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageMeta
        title="Calculadora de DBP — Diâmetro Biparietal"
        description="Estime a idade gestacional e a data do parto pelo Diâmetro Biparietal (DBP) fetal. Cálculo baseado em curvas de referência validadas — IDALIA Calc."
        path="/bpd"
      />
      <TokenGateAlert needsLogin={needsLogin} blocked={blocked} tokensRemaining={subscription?.tokens_remaining} />
      <PatientSelector value={selectedPatientId} onChange={setSelectedPatientId} />
      <div className="glass-card-static p-6 md:p-8 space-y-6 mesh-purple">
        <div>
          <h1 className="font-display text-xl text-foreground">Calculadora DBP</h1>
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

          <Button onClick={handleCalculate} disabled={blocked || needsLogin || calculating} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-50">
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
          { authors: "Hadlock FP, Deter RL, Harrist RB, Park SK", title: "Estimating fetal age: computer-assisted analysis of multiple fetal growth parameters", journal: "Radiology", year: 1984, doi: "10.1148/radiology.152.2.6739822", pubmedId: "6739822" },
          { authors: "Hadlock FP, Deter RL, Harrist RB, Park SK", title: "Fetal biparietal diameter: a critical re-evaluation of the relation to menstrual age by means of real-time ultrasound", journal: "J Ultrasound Med", year: 1982, doi: "10.7863/jum.1982.1.3.97", pubmedId: "6152941" },
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
