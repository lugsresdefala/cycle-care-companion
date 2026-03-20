import { useState } from "react";
import { useTokenGate } from "@/hooks/useTokenGate";
import { TokenGateAlert } from "@/components/TokenGateAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Info, Ruler, Baby, Calendar, AlertCircle } from "lucide-react";
import { gestationalAgeFromCRL, isValidCRL, dueDateFromGA } from "@/lib/biometry";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import ScientificFooter from "@/components/ScientificFooter";

const CRL_REFERENCE = [
  { crl: 3, ga: "6+0" }, { crl: 8, ga: "7+0" }, { crl: 16, ga: "8+0" },
  { crl: 23, ga: "9+0" }, { crl: 31, ga: "10+0" }, { crl: 41, ga: "11+0" },
  { crl: 53, ga: "12+0" }, { crl: 67, ga: "13+0" }, { crl: 80, ga: "14+0" },
];

const CRLCalculator = () => {
  const [crl, setCrl] = useState("");
  const [results, setResults] = useState<{
    weeks: number; days: number; dueDate: Date; totalDays: number;
  } | null>(null);
  const [error, setError] = useState("");

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
      <div className="glass-card-static p-6 md:p-8 space-y-6 mesh-navy">
        <div>
          <h2 className="font-display text-xl text-foreground">Calculadora CRL</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Estimativa da idade gestacional pelo Comprimento Crânio-Caudal (CCN) — 1º trimestre.
          </p>
          <Badge variant="outline" className="mt-2 text-xs border-accent/30 text-accent">Robinson & Fleming, 1975</Badge>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm text-foreground">CCN (mm)</Label>
              <Tooltip>
                <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                <TooltipContent>Comprimento crânio-caudal medido no US de 1º trimestre (2–84 mm)</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={2} max={84} step={0.1}
                value={crl}
                onChange={(e) => setCrl(e.target.value)}
                placeholder="Ex: 45"
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

          <Button onClick={handleCalculate} className="bg-accent text-accent-foreground hover:bg-accent/90 glow-accent">
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
            <div className="glass-card-static p-6 md:p-8 mesh-navy">
              <div className="flex items-center gap-2 mb-2">
                <Baby className="w-4 h-4 text-accent" />
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
                <Calendar className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">Data Provável do Parto</span>
              </div>
              <p className="tabular-nums text-lg font-display text-foreground">
                {format(results.dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              <p className="text-xs text-muted-foreground">DPP estimada (±5 dias no 1º trimestre)</p>
            </div>

            {/* Reference Table */}
            <div className="glass-card-static p-5 space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Ruler className="w-4 h-4 text-primary" />
                Tabela de Referência — CCN × IG
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">CCN (mm)</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">IG (sem+dias)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CRL_REFERENCE.map((ref) => (
                      <tr key={ref.crl} className={`border-b border-border/50 ${Math.abs(parseFloat(crl) - ref.crl) < 5 ? "bg-accent/10" : ""}`}>
                        <td className="py-1.5 tabular-nums text-foreground">{ref.crl}</td>
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
