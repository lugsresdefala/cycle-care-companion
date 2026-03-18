import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Info, Scale, Baby, AlertCircle, TrendingUp } from "lucide-react";
import { estimatedFetalWeight, getEFWPercentiles } from "@/lib/biometry";
import { motion, AnimatePresence } from "framer-motion";

const EFWCalculator = () => {
  const [hc, setHc] = useState("");
  const [ac, setAc] = useState("");
  const [fl, setFl] = useState("");
  const [gaWeeks, setGaWeeks] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState<{
    weightG: number; weightKg: string; percentileRange: string; formula: string;
    percentiles: { p10: number; p50: number; p90: number } | null;
  } | null>(null);

  const handleCalculate = () => {
    const hcVal = parseFloat(hc);
    const acVal = parseFloat(ac);
    const flVal = parseFloat(fl);

    if (isNaN(hcVal) || isNaN(acVal) || isNaN(flVal)) {
      setError("Preencha CC, CA e CF para o cálculo do peso fetal.");
      return;
    }
    if (hcVal < 50 || hcVal > 380) { setError("CC deve estar entre 50 e 380 mm."); return; }
    if (acVal < 40 || acVal > 400) { setError("CA deve estar entre 40 e 400 mm."); return; }
    if (flVal < 10 || flVal > 85) { setError("CF deve estar entre 10 e 85 mm."); return; }

    setError("");
    const efw = estimatedFetalWeight({ hc: hcVal, ac: acVal, fl: flVal });
    const gaW = gaWeeks ? parseInt(gaWeeks) : null;
    const percentiles = gaW ? getEFWPercentiles(gaW) : null;

    let percentileRange = efw.percentileRange;
    if (percentiles) {
      if (efw.weightG < percentiles.p10) percentileRange = "Abaixo do percentil 10 — avaliar CIUR";
      else if (efw.weightG > percentiles.p90) percentileRange = "Acima do percentil 90 — avaliar macrossomia";
      else percentileRange = "Entre percentis 10 e 90 — Adequado para IG (AIG)";
    }

    setResults({ ...efw, percentileRange, percentiles });
  };

  return (
    <div className="space-y-6">
      <div className="glass-card-static p-6 md:p-8 space-y-6 mesh-cyan">
        <div>
          <h2 className="font-display text-xl text-foreground">Peso Fetal Estimado (PFE)</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Cálculo do peso fetal estimado pela fórmula de Hadlock com CC, CA e CF.
          </p>
          <Badge variant="outline" className="mt-2 text-xs border-primary/30 text-primary">Hadlock, 1985</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "CC (mm)", desc: "Circunferência Cefálica", value: hc, set: setHc, range: "50–380" },
            { label: "CA (mm)", desc: "Circunferência Abdominal", value: ac, set: setAc, range: "40–400" },
            { label: "CF (mm)", desc: "Comprimento do Fêmur", value: fl, set: setFl, range: "10–85" },
            { label: "IG (sem)", desc: "Idade gestacional para percentil", value: gaWeeks, set: setGaWeeks, range: "20–40" },
          ].map((f) => (
            <div key={f.label} className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm text-foreground">{f.label}</Label>
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>{f.desc} ({f.range})</TooltipContent>
                </Tooltip>
              </div>
              <Input
                type="number"
                step={0.1}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.label.split(" ")[0]}
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

        <Button onClick={handleCalculate} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
          <Scale className="w-4 h-4 mr-1" /> Calcular PFE
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
            {/* Weight result */}
            <div className="glass-card-static p-6 md:p-8 mesh-cyan">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="w-5 h-5 text-primary" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Peso Fetal Estimado</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="tabular-nums text-4xl font-display text-foreground">{results.weightG}</span>
                <span className="text-lg text-muted-foreground">g</span>
                <span className="text-sm text-muted-foreground ml-2">({results.weightKg} kg)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Fórmula: {results.formula}</p>
            </div>

            {/* Percentile classification */}
            <div className={`glass-card-static p-5 space-y-2 ${
              results.percentileRange.includes("CIUR") ? "border-destructive/30" :
              results.percentileRange.includes("macrossomia") ? "border-ovulatory/30" :
              "border-accent/30"
            }`}>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">Classificação</span>
              </div>
              <p className="text-sm text-foreground">{results.percentileRange}</p>
            </div>

            {/* Percentile chart if GA provided */}
            {results.percentiles && (
              <div className="glass-card-static p-5 space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Baby className="w-4 h-4 text-primary" />
                  Curva de Percentis (IG {gaWeeks} semanas)
                </h4>
                <div className="space-y-2">
                  {[
                    { label: "P10", value: results.percentiles.p10, color: "bg-destructive/60" },
                    { label: "P50", value: results.percentiles.p50, color: "bg-accent/60" },
                    { label: "P90", value: results.percentiles.p90, color: "bg-primary/60" },
                  ].map((p) => (
                    <div key={p.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{p.label}</span>
                        <span className="tabular-nums text-foreground">{p.value}g</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden relative">
                        <div className={`h-full rounded-full ${p.color}`} style={{ width: `${(p.value / results.percentiles!.p90) * 80}%` }} />
                        {/* EFW marker */}
                        <div
                          className="absolute top-0 h-full w-0.5 bg-foreground"
                          style={{ left: `${Math.min(100, (results.weightG / results.percentiles!.p90) * 80)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <div className="w-3 h-0.5 bg-foreground" />
                    <span>PFE atual ({results.weightG}g)</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card-static p-4 border-primary/20">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Nota:</strong> O PFE tem margem de erro de ±15%. A classificação de percentil é aproximada. Para avaliação precisa, utilizar curvas de crescimento customizadas (INTERGROWTH-21st ou Fenton).
        </p>
      </div>
    </div>
  );
};

export default EFWCalculator;
