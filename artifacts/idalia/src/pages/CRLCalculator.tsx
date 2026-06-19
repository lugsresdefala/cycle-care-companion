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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import ScientificFooter from "@/components/ScientificFooter";
import { CRL_REFERENCE } from "@/lib/biometry-references";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const CRLCalculator = () => {
  const { blocked, needsLogin, subscription, refetch } = useTokenGate();
  const { saveExam, canSave } = useExamSave();
  const [crl, setCrl] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();
  const [results, setResults] = useState<{
    weeks: number; days: number; dueDate: Date; totalDays: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [calculating, setCalculating] = useState(false);

  const handleCalculate = async () => {
    const value = parseFloat(crl);
    if (isNaN(value)) { setError("Insira um valor numérico válido."); return; }
    setCalculating(true);
    setError("");
    try {
      const ga = await apiFetch<{ weeks: number; days: number; totalDays: number; dueDate: string }>(
        "/calculate/biometry/crl",
        { method: "POST", body: JSON.stringify({ crl: value }) },
      );
      const res = { ...ga, dueDate: new Date(ga.dueDate) };
      setResults(res);
      if (canSave) {
        saveExam({
          calcType: "crl",
          inputData: { crl: value },
          resultData: { weeks: ga.weeks, days: ga.days, totalDays: ga.totalDays },
          gestationalAgeWeeks: ga.weeks,
          gestationalAgeDays: ga.days,
          patientId: selectedPatientId,
        });
      }
      void refetch();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        toast({ title: "Tokens esgotados", description: "Assine um plano para continuar usando as calculadoras.", variant: "destructive" });
      } else if (err instanceof ApiError && err.status === 400) {
        setError(err.body?.error ?? "O CCN deve estar entre 2 e 84 mm (≈6–14 semanas).");
      } else {
        toast({ title: "Erro ao calcular", description: "Tente novamente.", variant: "destructive" });
      }
    } finally {
      setCalculating(false);
    }
  };

  const isDisabled = blocked || needsLogin || calculating;

  return (
    <div className="space-y-6">
      <PageMeta
        title="Calculadora de CCN — Comprimento Cabeça-Nádega"
        description="Calcule a idade gestacional pelo Comprimento Cabeça-Nádega (CCN/CRL) no primeiro trimestre. Referência de Robinson & Fleming — IDALIA Calc."
        path="/crl"
      />
      <TokenGateAlert needsLogin={needsLogin} blocked={blocked} tokensRemaining={subscription?.tokens_remaining} />
      <PatientSelector value={selectedPatientId} onChange={setSelectedPatientId} />

      <div className="glass-card-static p-6 md:p-8 space-y-6 mesh-navy">
        <div>
          <h1 className="font-display text-xl text-foreground">CCN — Comprimento Cabeça-Nádega</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Estimativa da idade gestacional pelo CCN no 1º trimestre (6–14 semanas).
          </p>
          <Badge variant="outline" className="mt-2 text-xs border-accent/30 text-accent">Robinson & Fleming, 1975</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-sm text-foreground">CCN (mm)</Label>
            <Tooltip>
              <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
              <TooltipContent>Comprimento crânio-caudal medido no plano sagital médio (2–84 mm)</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="number" min={2} max={84} step={0.1}
              value={crl} onChange={(e) => setCrl(e.target.value)}
              placeholder="Ex: 45" className="input-glass w-32 tabular-nums"
            />
            <span className="text-sm text-muted-foreground">mm</span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <Button onClick={handleCalculate} disabled={isDisabled} className="bg-accent text-accent-foreground hover:bg-accent/90 glow-accent disabled:opacity-50">
          <Ruler className="w-4 h-4 mr-1" /> {calculating ? "Calculando..." : "Calcular IG"}
        </Button>
      </div>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
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
                <span className="text-sm text-muted-foreground">sem</span>
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

            <div className="glass-card-static p-5 space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Ruler className="w-4 h-4 text-accent" /> Tabela de Referência — CCN × IG
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border"><th className="text-left py-2 text-muted-foreground font-medium">CCN (mm)</th><th className="text-left py-2 text-muted-foreground font-medium">IG (sem+dias)</th></tr></thead>
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
          { authors: "Robinson HP, Fleming JEE", title: "A critical evaluation of sonar crown-rump length measurements", journal: "Br J Obstet Gynaecol", year: 1975, doi: "10.1111/j.1471-0528.1975.tb00710.x", pubmedId: "1191154" },
        ]}
        units={[
          { param: "CCN", unit: "mm", description: "Comprimento crânio-caudal medido no plano sagital médio" },
          { param: "Idade gestacional", unit: "sem + dias", description: "Semanas completas + dias" },
        ]}
        extraDisclaimer="O CCN é o método mais acurado de datação na gravidez. Deve ser medido entre 45 e 84 mm (≈11–14 semanas) para rastreio do 1º trimestre. Abaixo de 2 mm ou acima de 84 mm, utilize outros parâmetros biométricos."
      />
    </div>
  );
};

export default CRLCalculator;

