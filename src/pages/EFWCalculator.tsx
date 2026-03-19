import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Info, Scale, Baby, AlertCircle, TrendingUp, ArrowRight } from "lucide-react";
import { estimatedFetalWeight, getEFWPercentiles } from "@/lib/biometry";
import { motion, AnimatePresence } from "framer-motion";
import ScientificFooter from "@/components/ScientificFooter";

const getClassificationStyle = (range: string) => {
  if (range.includes("CIUR"))        return { border: "border-destructive/40", bg: "bg-destructive/8", color: "text-destructive", label: "⚠ Abaixo P10" };
  if (range.includes("macrossomia")) return { border: "border-ovulatory/40",   bg: "bg-ovulatory/8",   color: "text-ovulatory",   label: "↑ Acima P90" };
  return                               { border: "border-accent/40",           bg: "bg-accent/8",       color: "text-accent",       label: "✓ AIG (P10–P90)" };
};

const EFWCalculator = () => {
  const [hc, setHc]         = useState("");
  const [ac, setAc]         = useState("");
  const [fl, setFl]         = useState("");
  const [gaWeeks, setGaWeeks] = useState("");
  const [error, setError]   = useState("");
  const [results, setResults] = useState<{
    weightG: number; weightKg: string; percentileRange: string; formula: string;
    percentiles: { p10: number; p50: number; p90: number } | null;
  } | null>(null);

  const handleCalculate = () => {
    const hcVal = parseFloat(hc);
    const acVal = parseFloat(ac);
    const flVal = parseFloat(fl);

    if (isNaN(hcVal) || isNaN(acVal) || isNaN(flVal)) {
      setError("Preencha CC, CA e CF para o cálculo do peso fetal."); return;
    }
    if (hcVal < 50 || hcVal > 380) { setError("CC deve estar entre 50 e 380 mm."); return; }
    if (acVal < 40 || acVal > 400) { setError("CA deve estar entre 40 e 400 mm."); return; }
    if (flVal < 10 || flVal > 85)  { setError("CF deve estar entre 10 e 85 mm.");  return; }

    setError("");
    const efw = estimatedFetalWeight({ hc: hcVal, ac: acVal, fl: flVal });
    const gaW = gaWeeks ? parseInt(gaWeeks) : null;
    const percentiles = gaW ? getEFWPercentiles(gaW) : null;

    let percentileRange = efw.percentileRange;
    if (percentiles) {
      if (efw.weightG < percentiles.p10)       percentileRange = "Abaixo do percentil 10 — avaliar CIUR";
      else if (efw.weightG > percentiles.p90)  percentileRange = "Acima do percentil 90 — avaliar macrossomia";
      else                                     percentileRange = "Entre percentis 10 e 90 — Adequado para IG (AIG)";
    }

    setResults({ ...efw, percentileRange, percentiles });
  };

  const filledCount = [hc, ac, fl].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="glass-card-static p-5 sm:p-6 space-y-5 mesh-cyan">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center">
              <Scale className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h2 className="font-display text-lg text-foreground leading-tight">Peso Fetal Estimado (PFE)</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Fórmula de Hadlock · CC + CA + CF</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Cálculo do peso fetal estimado pela fórmula de Hadlock com CC, CA e CF.
          </p>
          <Badge variant="outline" className="mt-2 text-[10px] border-accent/30 text-accent">Hadlock, 1985</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "CC", desc: "Circunferência Cefálica",   value: hc,      set: setHc,      range: "50–380", required: true  },
            { label: "CA", desc: "Circunferência Abdominal",  value: ac,      set: setAc,      range: "40–400", required: true  },
            { label: "CF", desc: "Comprimento do Fêmur",      value: fl,      set: setFl,      range: "10–85",  required: true  },
            { label: "IG", desc: "Idade gestacional (semanas) para classificação por percentil", value: gaWeeks, set: setGaWeeks, range: "20–40",  required: false },
          ].map((f) => (
            <div key={f.label} className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm text-foreground font-semibold">{f.label} <span className="text-muted-foreground font-normal text-xs">(mm{f.label === "IG" ? "" : ""})</span></Label>
                {f.required && <span className="text-[10px] text-accent">*</span>}
                <Tooltip>
                  <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>{f.desc} ({f.range})</TooltipContent>
                </Tooltip>
              </div>
              <div className="input-with-unit">
                <Input
                  type="number"
                  step={0.1}
                  value={f.value}
                  onChange={(e) => { f.set(e.target.value); setError(""); }}
                  placeholder={f.label}
                  className="input-glass tabular-nums pr-14"
                />
                <span className="input-unit-label">{f.label === "IG" ? "sem" : "mm"}</span>
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
          disabled={filledCount < 3}
          className="bg-accent text-accent-foreground hover:bg-accent/90 glow-accent flex items-center gap-2 w-full sm:w-auto"
        >
          <Scale className="w-4 h-4" />
          Calcular PFE
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
            {/* Weight hero */}
            <div className="result-hero p-5 sm:p-6 mesh-cyan">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-accent/25 flex items-center justify-center">
                      <Scale className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Peso Fetal Estimado</span>
                  </div>
                  <div className="flex items-baseline gap-2 animate-count-up">
                    <span className="number-display text-5xl font-display text-foreground">{results.weightG}</span>
                    <span className="text-xl text-muted-foreground">g</span>
                    <span className="text-sm text-muted-foreground ml-1">({results.weightKg} kg)</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">Fórmula: {results.formula} · Margem ±15%</p>
                </div>
                <div className="stat-card text-center min-w-[64px]">
                  <Baby className="w-4 h-4 text-accent mx-auto mb-1" />
                  <p className="number-display text-sm font-display text-foreground">{results.weightKg}</p>
                  <p className="text-[10px] text-muted-foreground">kg</p>
                </div>
              </div>
            </div>

            {/* Classification */}
            {(() => {
              const style = getClassificationStyle(results.percentileRange);
              return (
                <div className={`stat-card border ${style.border} space-y-2`}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-muted/40 flex items-center justify-center">
                      <TrendingUp className={`w-3.5 h-3.5 ${style.color}`} />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Classificação por Percentil</span>
                    <Badge variant="outline" className={`text-[10px] ml-auto border-current ${style.color}`}>
                      {style.label}
                    </Badge>
                  </div>
                  <p className={`text-sm font-medium ${style.color}`}>{results.percentileRange}</p>
                </div>
              );
            })()}

            {/* Percentile chart with EFW marker */}
            {results.percentiles && (
              <div className="glass-card-static p-5 space-y-4">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Baby className="w-4 h-4 text-primary" />
                  Curva de Percentis — IG {gaWeeks} semanas
                </h4>

                {/* Visual chart */}
                <div className="relative">
                  {/* Zone labels */}
                  <div className="flex text-[10px] text-muted-foreground mb-1.5">
                    <span style={{ width: `${(results.percentiles.p10 / results.percentiles.p90) * 75}%` }}>Baixo</span>
                    <span className="flex-1 text-center">Adequado</span>
                    <span>Alto</span>
                  </div>

                  {/* Bar */}
                  <div className="h-8 bg-muted/30 rounded-xl overflow-hidden relative border border-border/30">
                    {/* P10 zone (below) */}
                    <div
                      className="absolute left-0 top-0 h-full bg-destructive/20 border-r border-destructive/40"
                      style={{ width: `${(results.percentiles.p10 / results.percentiles.p90) * 75}%` }}
                    />
                    {/* P10–P90 zone (normal) */}
                    <div
                      className="absolute top-0 h-full bg-accent/15 border-r border-accent/30"
                      style={{
                        left: `${(results.percentiles.p10 / results.percentiles.p90) * 75}%`,
                        width: `${((results.percentiles.p90 - results.percentiles.p10) / results.percentiles.p90) * 75}%`,
                      }}
                    />
                    {/* Above P90 zone */}
                    <div
                      className="absolute top-0 h-full bg-ovulatory/20"
                      style={{ left: "75%", right: 0 }}
                    />

                    {/* EFW marker */}
                    <motion.div
                      initial={{ left: 0 }}
                      animate={{ left: `${Math.min(95, (results.weightG / results.percentiles.p90) * 75)}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-0 h-full flex items-center"
                      style={{ transform: "translateX(-50%)" }}
                    >
                      <div className="w-3 h-full bg-foreground/80 rounded-full shadow-lg" />
                    </motion.div>
                  </div>

                  {/* Percentile value labels */}
                  <div className="flex items-center mt-1.5 text-[10px] text-muted-foreground relative">
                    <span>0g</span>
                    <span
                      className="absolute text-destructive font-semibold"
                      style={{ left: `${(results.percentiles.p10 / results.percentiles.p90) * 75}%`, transform: "translateX(-50%)" }}
                    >
                      P10<br />{results.percentiles.p10}g
                    </span>
                    <span
                      className="absolute text-accent font-semibold"
                      style={{ left: `${(results.percentiles.p50 / results.percentiles.p90) * 75}%`, transform: "translateX(-50%)" }}
                    >
                      P50<br />{results.percentiles.p50}g
                    </span>
                    <span className="ml-auto text-ovulatory font-semibold">P90<br />{results.percentiles.p90}g</span>
                  </div>
                </div>

                {/* PFE legend */}
                <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                  <div className="w-3 h-3 rounded-sm bg-foreground/80" />
                  <span className="text-xs text-muted-foreground">
                    PFE atual: <strong className="text-foreground tabular-nums">{results.weightG}g</strong>
                  </span>
                  {gaWeeks && (
                    <span className="text-xs text-muted-foreground ml-2">
                      · IG: <strong className="text-foreground">{gaWeeks} semanas</strong>
                    </span>
                  )}
                </div>

                {/* Percentile grid */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "P10", value: results.percentiles.p10, color: "text-destructive", border: "border-destructive/25", bg: "bg-destructive/8" },
                    { label: "P50", value: results.percentiles.p50, color: "text-accent",      border: "border-accent/25",      bg: "bg-accent/8"      },
                    { label: "P90", value: results.percentiles.p90, color: "text-ovulatory",   border: "border-ovulatory/25",   bg: "bg-ovulatory/8"   },
                  ].map((p) => (
                    <div key={p.label} className={`rounded-xl border p-2.5 text-center ${p.border} ${p.bg}`}>
                      <p className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${p.color}`}>{p.label}</p>
                      <p className={`tabular-nums text-base font-display ${p.color}`}>{p.value}g</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ScientificFooter
        references={[
          {
            authors: "Hadlock FP, Harrist RB, Sharman RS, Deter RL, Park SK",
            title: "Estimation of fetal weight with the use of head, body, and femur measurements — a prospective study",
            journal: "Am J Obstet Gynecol",
            year: 1985,
            doi: "10.1016/0002-9378(85)90298-4",
            pubmedId: "3881966",
          },
          {
            authors: "Shepard MJ, Richards VA, Berkowitz RL, Warsof SL, Hobbins JC",
            title: "An evaluation of two equations for predicting fetal weight by ultrasound",
            journal: "Am J Obstet Gynecol",
            year: 1982,
            doi: "10.1016/0002-9378(82)90272-0",
            pubmedId: "7058805",
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
        units={[
          { param: "CC / CA", unit: "mm", description: "Circunferências em milímetros" },
          { param: "CF", unit: "mm", description: "Comprimento do fêmur em milímetros" },
          { param: "Peso fetal", unit: "g / kg", description: "Gramas (primário) e quilogramas" },
          { param: "IG (para percentil)", unit: "semanas", description: "Semanas completas para classificação" },
        ]}
        extraDisclaimer="O PFE tem margem de erro de ±15%. A classificação por percentil é aproximada. Para avaliação precisa, utilize curvas customizadas (INTERGROWTH-21st)."
      />
    </div>
  );
};

export default EFWCalculator;
