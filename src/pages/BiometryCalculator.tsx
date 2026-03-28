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
import { Info, Ruler, Baby, Calendar, Activity, AlertCircle } from "lucide-react";
import { gestationalAgeFromMultipleBiometry, dueDateFromGA } from "@/lib/biometry";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import ScientificFooter from "@/components/ScientificFooter";

const BiometryCalculator = () => {
  const { blocked, needsLogin, consuming, subscription, consumeToken } = useTokenGate();
  const { saveExam, canSave } = useExamSave();
  const [bpd, setBpd] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();
  const [hc, setHc] = useState("");
  const [ac, setAc] = useState("");
  const [fl, setFl] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState<{
    weeks: number; days: number; dueDate: Date; totalDays: number;
    estimates: { label: string; weeks: number; days: number }[];
  } | null>(null);

  const handleCalculate = async () => {
    const params = {
      bpd: bpd ? parseFloat(bpd) : undefined,
      hc: hc ? parseFloat(hc) : undefined,
      ac: ac ? parseFloat(ac) : undefined,
      fl: fl ? parseFloat(fl) : undefined,
    };

    if (!params.bpd && !params.hc && !params.ac && !params.fl) {
      setError("Insira ao menos uma medida biométrica.");
      return;
    }

    const ga = gestationalAgeFromMultipleBiometry(params);
    if (ga.estimates.length === 0) {
      setError("Valores fora do intervalo aceitável.");
      return;
    }

    const ok = await consumeToken();
    if (!ok) return;
    setError("");
    setResults({ ...ga, dueDate: dueDateFromGA(ga.totalDays) });
    if (canSave) {
      saveExam({
        calcType: "biometry",
        inputData: { bpd: params.bpd, hc: params.hc, ac: params.ac, fl: params.fl },
        resultData: { weeks: ga.weeks, days: ga.days, totalDays: ga.totalDays },
        gestationalAgeWeeks: ga.weeks,
        gestationalAgeDays: ga.days,
      });
    }
  };

  const fields = [
    { label: "DBP", desc: "Diâmetro Biparietal", value: bpd, set: setBpd, range: "14–100 mm" },
    { label: "CC", desc: "Circunferência Cefálica", value: hc, set: setHc, range: "50–380 mm" },
    { label: "CA", desc: "Circunferência Abdominal", value: ac, set: setAc, range: "40–400 mm" },
    { label: "CF", desc: "Comprimento do Fêmur", value: fl, set: setFl, range: "10–85 mm" },
  ];

  return (
    <div className="space-y-6">
      <TokenGateAlert needsLogin={needsLogin} blocked={blocked} tokensRemaining={subscription?.tokens_remaining} />
      <div className="glass-card-static p-6 md:p-8 space-y-6 mesh-navy">
        <div>
          <h2 className="font-display text-xl text-foreground">Biometria Fetal Composta</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Estimativa da idade gestacional por múltiplas medidas biométricas — maior acurácia.
          </p>
          <Badge variant="outline" className="mt-2 text-xs border-accent/30 text-accent">Hadlock, 1984</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.label} className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm text-foreground">{f.label} (mm)</Label>
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>{f.desc} — {f.range}</TooltipContent>
                </Tooltip>
              </div>
              <Input
                type="number"
                step={0.1}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.label}
                className="input-glass tabular-nums"
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <Button onClick={handleCalculate} disabled={blocked || needsLogin || consuming} className="bg-accent text-accent-foreground hover:bg-accent/90 glow-accent disabled:opacity-50">
          <Ruler className="w-4 h-4 mr-1" /> Calcular IG Composta
        </Button>
      </div>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="glass-card-static p-6 md:p-8 mesh-navy">
              <div className="flex items-center gap-2 mb-2">
                <Baby className="w-4 h-4 text-accent" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">IG Média Composta</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="tabular-nums text-4xl font-display text-foreground">{results.weeks}</span>
                <span className="text-sm text-muted-foreground">semanas</span>
                <span className="tabular-nums text-2xl font-display text-foreground ml-2">{results.days}</span>
                <span className="text-sm text-muted-foreground">dias</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Média de {results.estimates.length} medida{results.estimates.length > 1 ? "s" : ""}
              </p>
            </div>

            {/* Individual estimates */}
            <div className="grid grid-cols-2 gap-3">
              {results.estimates.map((est) => (
                <div key={est.label} className="glass-card-static p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">{est.label}</span>
                  </div>
                  <p className="tabular-nums text-lg font-display text-foreground">
                    {est.weeks}<span className="text-sm text-muted-foreground">s</span> {est.days}<span className="text-sm text-muted-foreground">d</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="glass-card-static p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">Data Provável do Parto</span>
              </div>
              <p className="tabular-nums text-lg font-display text-foreground">
                {format(results.dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
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
            authors: "Hadlock FP, Harrist RB, Martinez-Poyer J",
            title: "In utero analysis of fetal growth: a sonographic weight standard",
            journal: "Radiology",
            year: 1991,
            doi: "10.1148/radiology.181.1.1887021",
            pubmedId: "1887021",
          },
          {
            authors: "Papageorghiou AT, Ohuma EO, Altman DG, et al. (INTERGROWTH-21st)",
            title: "International standards for fetal growth based on serial ultrasound measurements",
            journal: "Lancet",
            year: 2014,
            doi: "10.1016/S0140-6736(14)61490-2",
            pubmedId: "25209488",
          },
        ]}
        extraDisclaimer="A biometria composta é mais acurada que medidas isoladas. Discordância >2 semanas entre parâmetros pode indicar CIUR assimétrico ou anomalias."
      />
    </div>
  );
};

export default BiometryCalculator;
