import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Info, Ruler, Baby, Calendar, AlertCircle, ArrowRight } from "lucide-react";
import { gestationalAgeFromCRL, isValidCRL, dueDateFromGA } from "@/lib/biometry";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import ScientificFooter from "@/components/ScientificFooter";

const CRL_REFERENCE = [
  { crl: 3,  ga: "6+0" }, { crl: 8,  ga: "7+0" }, { crl: 16, ga: "8+0" },
  { crl: 23, ga: "9+0" }, { crl: 31, ga: "10+0" }, { crl: 41, ga: "11+0" },
  { crl: 53, ga: "12+0" }, { crl: 67, ga: "13+0" }, { crl: 80, ga: "14+0" },
];

const CRL_MIN = 2;
const CRL_MAX = 84;

const CRLCalculator = () => {
  const [crl, setCrl] = useState("");
  const [results, setResults] = useState<{
    weeks: number; days: number; dueDate: Date; totalDays: number;
  } | null>(null);
  const [error, setError] = useState("");

  const crlValue = parseFloat(crl);
  const pct = isNaN(crlValue) ? 0 : Math.min(100, Math.max(0, ((crlValue - CRL_MIN) / (CRL_MAX - CRL_MIN)) * 100));

  const handleCalculate = () => {
    const value = parseFloat(crl);
    if (isNaN(value)) { setError("Insira um valor numérico válido."); return; }
    if (!isValidCRL(value)) { setError("O CCN deve estar entre 2 e 84 mm (≈6–14 semanas)."); return; }
    setError("");
    const ga = gestationalAgeFromCRL(value);
    setResults({ ...ga, dueDate: dueDateFromGA(ga.totalDays) });
  };

  return (
    <div className="space-y-6">
      <div className="glass-card-static p-5 sm:p-6 space-y-5 mesh-pink">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
              <Ruler className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg text-foreground leading-tight">Calculadora CRL</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Comprimento Crânio-Caudal · 1º Trimestre</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Estimativa da idade gestacional pelo CCN no primeiro trimestre.
          </p>
          <Badge variant="outline" className="mt-2 text-[10px] border-primary/30 text-primary">Robinson & Fleming, 1975</Badge>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm text-foreground font-semibold">CCN</Label>
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>Comprimento crânio-caudal medido no plano sagital médio (2–84 mm)</TooltipContent>
                </Tooltip>
              </div>
              <span className="text-xs text-muted-foreground">Faixa: {CRL_MIN}–{CRL_MAX} mm</span>
            </div>

            {/* Input row */}
            <div className="flex items-center gap-3">
              <div className="input-with-unit flex-1 max-w-[140px]">
                <Input
                  type="number"
                  min={CRL_MIN} max={CRL_MAX} step={0.1}
                  value={crl}
                  onChange={(e) => { setCrl(e.target.value); setError(""); }}
                  placeholder="Ex: 45"
                  className="input-glass tabular-nums pr-12"
                />
                <span className="input-unit-label">mm</span>
              </div>

              {/* Visual position indicator */}
              {!isNaN(crlValue) && crlValue >= CRL_MIN && crlValue <= CRL_MAX && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/15 border border-primary/25"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-xs font-semibold text-primary tabular-nums">{crlValue.toFixed(1)} mm</span>
                </motion.div>
              )}
            </div>

            {/* Visual range bar */}
            <div className="space-y-1.5">
              <input
                type="range"
                min={CRL_MIN}
                max={CRL_MAX}
                step={0.5}
                value={isNaN(crlValue) ? CRL_MIN : Math.min(CRL_MAX, Math.max(CRL_MIN, crlValue))}
                onChange={(e) => { setCrl(e.target.value); setError(""); }}
                className="w-full"
                style={{
                  background: `linear-gradient(to right, hsl(200,70%,58%) 0%, hsl(200,70%,58%) ${pct}%, hsla(240,20%,18%,1) ${pct}%, hsla(240,20%,18%,1) 100%)`
                }}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>2 mm · ≈6sem</span>
                <span>42 mm · ≈11sem</span>
                <span>84 mm · ≈14sem</span>
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
            disabled={!crl}
            className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary flex items-center gap-2"
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
            <div className="result-hero p-5 sm:p-6 mesh-pink">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-primary/25 flex items-center justify-center">
                      <Baby className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Idade Gestacional Estimada</span>
                  </div>
                  <div className="flex items-baseline gap-2 animate-count-up">
                    <span className="number-display text-5xl font-display text-foreground">{results.weeks}</span>
                    <span className="text-base text-muted-foreground">semanas</span>
                    <span className="number-display text-3xl font-display text-foreground ml-1">{results.days}</span>
                    <span className="text-base text-muted-foreground">dias</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">CCN: {crl} mm · Acurácia ±3–5 dias (1º trimestre)</p>
                </div>
                <div className="stat-card text-center min-w-[60px]">
                  <Ruler className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="number-display text-sm font-display text-foreground">{crl}</p>
                  <p className="text-[10px] text-muted-foreground">mm</p>
                </div>
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
              <p className="text-[10px] text-muted-foreground">DPP estimada — margem de ±5 dias no 1º trimestre</p>
            </div>

            {/* Reference Table */}
            <div className="glass-card-static p-5 space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Ruler className="w-4 h-4 text-primary" />
                Tabela de Referência — CCN × IG
              </h4>
              <div className="overflow-x-auto rounded-xl border border-border/30 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">CCN (mm)</th>
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">IG (sem+dias)</th>
                      <th className="text-left px-4 py-2.5 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Posição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CRL_REFERENCE.map((ref, i) => {
                      const isActive = !isNaN(crlValue) && Math.abs(crlValue - ref.crl) < 5;
                      return (
                        <tr
                          key={ref.crl}
                          className={`border-t border-border/30 transition-colors ${isActive ? "ref-row-active" : i % 2 === 0 ? "bg-muted/10" : ""}`}
                        >
                          <td className="px-4 py-2 tabular-nums font-medium">{ref.crl}</td>
                          <td className="px-4 py-2 tabular-nums font-semibold">{ref.ga}</td>
                          <td className="px-4 py-2">
                            <div className="w-16 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary/60 rounded-full"
                                style={{ width: `${(ref.crl / CRL_MAX) * 100}%` }}
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
            authors: "Robinson HP, Fleming JEE",
            title: "A critical evaluation of sonar crown-rump length measurements",
            journal: "Br J Obstet Gynaecol",
            year: 1975,
            doi: "10.1111/j.1471-0528.1975.tb00710.x",
            pubmedId: "1191154",
          },
          {
            authors: "Hadlock FP, Shah YP, Kanon DJ, Lindsey JV",
            title: "Fetal crown-rump length: reevaluation of relation to menstrual age (5–18 weeks) with high-resolution real-time US",
            journal: "Radiology",
            year: 1992,
            doi: "10.1148/radiology.182.2.1732960",
            pubmedId: "1732960",
          },
          {
            authors: "ISUOG",
            title: "Practice guidelines: performance of first-trimester fetal ultrasound scan",
            journal: "Ultrasound Obstet Gynecol",
            year: 2013,
            doi: "10.1002/uog.12342",
            pubmedId: "23371446",
          },
        ]}
        units={[
          { param: "CCN", unit: "mm", description: "Comprimento crânio-caudal medido no plano sagital médio" },
          { param: "Idade gestacional", unit: "sem + dias", description: "Semanas completas + dias (ex: 12+3)" },
        ]}
        extraDisclaimer="A medida do CCN é mais acurada entre 7 e 10 semanas (±3–5 dias). Acima de 14 semanas, recomenda-se biometria composta."
      />
    </div>
  );
};

export default CRLCalculator;
