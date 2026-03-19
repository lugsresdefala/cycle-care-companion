import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Info, Ruler, Baby, Calendar, AlertCircle, ArrowRight } from "lucide-react";
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

const BPD_MIN = 14;
const BPD_MAX = 100;

const BPDCalculator = () => {
  const [bpd, setBpd] = useState("");
  const [results, setResults] = useState<{
    weeks: number; days: number; dueDate: Date; totalDays: number;
  } | null>(null);
  const [error, setError] = useState("");

  const bpdValue = parseFloat(bpd);
  const pct = isNaN(bpdValue) ? 0 : Math.min(100, Math.max(0, ((bpdValue - BPD_MIN) / (BPD_MAX - BPD_MIN)) * 100));

  const handleCalculate = () => {
    const value = parseFloat(bpd);
    if (isNaN(value)) { setError("Insira um valor numérico válido."); return; }
    if (!isValidBPD(value)) { setError("O DBP deve estar entre 14 e 100 mm."); return; }
    setError("");
    const ga = gestationalAgeFromBPD(value);
    setResults({ ...ga, dueDate: dueDateFromGA(ga.totalDays) });
  };

  return (
    <div className="space-y-6">
      <div className="glass-card-static p-5 sm:p-6 space-y-5 mesh-cyan">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-secondary/15 flex items-center justify-center">
              <Ruler className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <h2 className="font-display text-lg text-foreground leading-tight">Calculadora DBP</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Diâmetro Biparietal · 2º e 3º Trimestres</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Estimativa da idade gestacional pelo Diâmetro Biparietal (DBP) — 2º e 3º trimestres.
          </p>
          <Badge variant="outline" className="mt-2 text-[10px] border-secondary/30 text-secondary">Hadlock, 1982</Badge>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm text-foreground font-semibold">DBP</Label>
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>Diâmetro biparietal medido de borda externa a borda interna (14–100 mm)</TooltipContent>
                </Tooltip>
              </div>
              <span className="text-xs text-muted-foreground">Faixa: {BPD_MIN}–{BPD_MAX} mm</span>
            </div>

            {/* Input row */}
            <div className="flex items-center gap-3">
              <div className="input-with-unit flex-1 max-w-[140px]">
                <Input
                  type="number"
                  min={BPD_MIN} max={BPD_MAX} step={0.1}
                  value={bpd}
                  onChange={(e) => { setBpd(e.target.value); setError(""); }}
                  placeholder="Ex: 55"
                  className="input-glass tabular-nums pr-12"
                />
                <span className="input-unit-label">mm</span>
              </div>

              {!isNaN(bpdValue) && bpdValue >= BPD_MIN && bpdValue <= BPD_MAX && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/15 border border-secondary/25"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span className="text-xs font-semibold text-secondary tabular-nums">{bpdValue.toFixed(1)} mm</span>
                </motion.div>
              )}
            </div>

            {/* Visual range bar */}
            <div className="space-y-1.5">
              <input
                type="range"
                min={BPD_MIN}
                max={BPD_MAX}
                step={0.5}
                value={isNaN(bpdValue) ? BPD_MIN : Math.min(BPD_MAX, Math.max(BPD_MIN, bpdValue))}
                onChange={(e) => { setBpd(e.target.value); setError(""); }}
                className="w-full"
                style={{
                  background: `linear-gradient(to right, hsl(280,35%,50%) 0%, hsl(280,35%,50%) ${pct}%, hsla(240,20%,18%,1) ${pct}%, hsla(240,20%,18%,1) 100%)`
                }}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>14 mm · ≈12sem</span>
                <span>57 mm · ≈23sem</span>
                <span>100 mm · ≈40sem</span>
              </div>
            </div>
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
            disabled={!bpd}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 glow-secondary flex items-center gap-2"
          >
            <Ruler className="w-4 h-4" />
            Calcular IG
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
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
            <div className="result-hero p-5 sm:p-6 mesh-cyan">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-secondary/25 flex items-center justify-center">
                      <Baby className="w-3.5 h-3.5 text-secondary" />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Idade Gestacional Estimada</span>
                  </div>
                  <div className="flex items-baseline gap-2 animate-count-up">
                    <span className="number-display text-5xl font-display text-foreground">{results.weeks}</span>
                    <span className="text-base text-muted-foreground">semanas</span>
                    <span className="number-display text-3xl font-display text-foreground ml-1">{results.days}</span>
                    <span className="text-base text-muted-foreground">dias</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">DBP: {bpd} mm · Acurácia ±7–14 dias (2º/3º trim.)</p>
                </div>
                <div className="stat-card text-center min-w-[60px]">
                  <Ruler className="w-4 h-4 text-secondary mx-auto mb-1" />
                  <p className="number-display text-sm font-display text-foreground">{bpd}</p>
                  <p className="text-[10px] text-muted-foreground">mm</p>
                </div>
              </div>
            </div>

            {/* DPP */}
            <div className="stat-card border border-secondary/20 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-secondary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Data Provável do Parto</span>
              </div>
              <p className="tabular-nums text-xl font-display text-foreground capitalize">
                {format(results.dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              <p className="text-[10px] text-muted-foreground">DPP estimada — margem de ±7–14 dias no 2º/3º trimestre</p>
            </div>

            {/* Reference Table */}
            <div className="glass-card-static p-5 space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Ruler className="w-4 h-4 text-secondary" />
                Tabela de Referência — DBP × IG
              </h4>
              <div className="overflow-x-auto rounded-xl border border-border/30 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">DBP (mm)</th>
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">IG (sem+dias)</th>
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Posição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BPD_REFERENCE.map((ref, i) => {
                      const isActive = !isNaN(bpdValue) && Math.abs(bpdValue - ref.bpd) < 5;
                      return (
                        <tr
                          key={ref.bpd}
                          className={`border-t border-border/30 transition-colors ${isActive ? "ref-row-active" : i % 2 === 0 ? "bg-muted/10" : ""}`}
                        >
                          <td className="px-4 py-2 tabular-nums font-medium">{ref.bpd}</td>
                          <td className="px-4 py-2 tabular-nums font-semibold">{ref.ga}</td>
                          <td className="px-4 py-2">
                            <div className="w-20 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-secondary/60 rounded-full"
                                style={{ width: `${(ref.bpd / BPD_MAX) * 100}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
