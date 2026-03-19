import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Info, Ruler, Baby, Calendar, Activity, AlertCircle, ArrowRight } from "lucide-react";
import { gestationalAgeFromMultipleBiometry, dueDateFromGA } from "@/lib/biometry";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import ScientificFooter from "@/components/ScientificFooter";

const FIELD_COLORS: Record<string, string> = {
  DBP: "text-secondary",
  CC:  "text-primary",
  CA:  "text-accent",
  CF:  "text-ovulatory",
};

const FIELD_BG_COLORS: Record<string, string> = {
  DBP: "bg-secondary/20",
  CC:  "bg-primary/20",
  CA:  "bg-accent/20",
  CF:  "bg-ovulatory/20",
};

const BiometryCalculator = () => {
  const [bpd, setBpd] = useState("");
  const [hc, setHc] = useState("");
  const [ac, setAc] = useState("");
  const [fl, setFl] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState<{
    weeks: number; days: number; dueDate: Date; totalDays: number;
    estimates: { label: string; weeks: number; days: number }[];
  } | null>(null);

  const handleCalculate = () => {
    const params = {
      bpd: bpd ? parseFloat(bpd) : undefined,
      hc:  hc  ? parseFloat(hc)  : undefined,
      ac:  ac  ? parseFloat(ac)  : undefined,
      fl:  fl  ? parseFloat(fl)  : undefined,
    };

    if (!params.bpd && !params.hc && !params.ac && !params.fl) {
      setError("Insira ao menos uma medida biométrica.");
      return;
    }
    setError("");

    const ga = gestationalAgeFromMultipleBiometry(params);
    if (ga.estimates.length === 0) {
      setError("Valores fora do intervalo aceitável.");
      return;
    }

    setResults({ ...ga, dueDate: dueDateFromGA(ga.totalDays) });
  };

  const fields = [
    { key: "DBP", label: "DBP", desc: "Diâmetro Biparietal",      value: bpd, set: setBpd, range: "14–100 mm",  unit: "mm" },
    { key: "CC",  label: "CC",  desc: "Circunferência Cefálica",   value: hc,  set: setHc,  range: "50–380 mm",  unit: "mm" },
    { key: "CA",  label: "CA",  desc: "Circunferência Abdominal",  value: ac,  set: setAc,  range: "40–400 mm",  unit: "mm" },
    { key: "CF",  label: "CF",  desc: "Comprimento do Fêmur",      value: fl,  set: setFl,  range: "10–85 mm",   unit: "mm" },
  ];

  const filledCount = [bpd, hc, ac, fl].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="glass-card-static p-5 sm:p-6 space-y-5 mesh-teal">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg text-foreground leading-tight">Biometria Fetal Composta</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Múltiplas Medidas · Maior Acurácia</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Estimativa da idade gestacional por múltiplas medidas biométricas — Hadlock, 1984.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">Hadlock, 1984</Badge>
            {filledCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 border border-primary/25"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] text-primary font-semibold">{filledCount} medida{filledCount > 1 ? "s" : ""}</span>
              </motion.div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {fields.map((f) => (
            <div key={f.label} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-md ${FIELD_BG_COLORS[f.key]} flex items-center justify-center`}>
                    <span className={`text-[9px] font-bold ${FIELD_COLORS[f.key]}`}>{f.label}</span>
                  </div>
                  <Label className="text-sm text-foreground font-semibold">{f.label}</Label>
                  <Tooltip>
                    <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent>{f.desc} — {f.range}</TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="input-with-unit">
                <Input
                  type="number"
                  step={0.1}
                  value={f.value}
                  onChange={(e) => { f.set(e.target.value); setError(""); }}
                  placeholder={f.label}
                  className="input-glass tabular-nums pr-12"
                />
                <span className="input-unit-label">{f.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <Button
          onClick={handleCalculate}
          disabled={filledCount === 0}
          className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary flex items-center gap-2 w-full sm:w-auto"
        >
          <Activity className="w-4 h-4" />
          Calcular IG Composta
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* Result hero */}
            <div className="result-hero p-5 sm:p-6 mesh-teal">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-primary/25 flex items-center justify-center">
                      <Baby className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">IG Média Composta</span>
                  </div>
                  <div className="flex items-baseline gap-2 animate-count-up">
                    <span className="number-display text-5xl font-display text-foreground">{results.weeks}</span>
                    <span className="text-base text-muted-foreground">semanas</span>
                    <span className="number-display text-3xl font-display text-foreground ml-1">{results.days}</span>
                    <span className="text-base text-muted-foreground">dias</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Média de {results.estimates.length} medida{results.estimates.length > 1 ? "s" : ""} biométrica{results.estimates.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="stat-card text-center min-w-[60px]">
                  <Activity className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="number-display text-lg font-display text-foreground">{results.estimates.length}</p>
                  <p className="text-[10px] text-muted-foreground">medidas</p>
                </div>
              </div>
            </div>

            {/* Individual estimates with comparison bars */}
            <div className="glass-card-static p-5 space-y-4">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Estimativas Individuais
              </h4>
              <div className="space-y-3">
                {results.estimates.map((est, i) => {
                  const totalDays = est.weeks * 7 + est.days;
                  const avgDays = results.weeks * 7 + results.days;
                  const diffDays = totalDays - avgDays;
                  const color = FIELD_COLORS[est.label] || "text-primary";
                  const bgColor = FIELD_BG_COLORS[est.label] || "bg-primary/20";
                  return (
                    <motion.div
                      key={est.label}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-8 h-8 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-xs font-bold ${color}`}>{est.label}</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold tabular-nums ${color}`}>
                            {est.weeks}s {est.days}d
                          </span>
                          {diffDays !== 0 && (
                            <span className={`text-[10px] tabular-nums ${Math.abs(diffDays) <= 3 ? "text-muted-foreground" : "text-destructive"}`}>
                              {diffDays > 0 ? "+" : ""}{diffDays}d vs. média
                            </span>
                          )}
                        </div>
                        <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (totalDays / 280) * 100)}%` }}
                            transition={{ delay: i * 0.08 + 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className={`h-full rounded-full`}
                            style={{ background: `hsl(var(--${est.label === "DBP" ? "secondary" : est.label === "CC" ? "primary" : est.label === "CA" ? "accent" : "ovulatory"}))`, opacity: 0.7 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* DPP */}
            <div className="stat-card border border-primary/20 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Data Provável do Parto</span>
              </div>
              <p className="tabular-nums text-xl font-display text-foreground capitalize">
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
