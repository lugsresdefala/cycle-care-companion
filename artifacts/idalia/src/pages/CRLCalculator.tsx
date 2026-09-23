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
import { Info, Ruler, Baby, Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import ScientificFooter from "@/components/ScientificFooter";
import { CRL_REFERENCE } from "@/lib/biometry-references";
import { CalculatorHeader } from "@/components/CalculatorHeader";
import { CitationChip } from "@/components/CitationChip";
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

  const handleReset = () => {
    setCrl("");
    setSelectedPatientId(undefined);
    setResults(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      <PageMeta
        title="Calculadora de CCN — Comprimento Cabeça-Nádega"
        description="Calcule a idade gestacional pelo Comprimento Cabeça-Nádega (CCN/CRL) no primeiro trimestre. Referência de Robinson & Fleming — IDALIA Calc."
        path="/crl"
      />
      <CalculatorHeader
        icon={Ruler}
        title="CCN — Comprimento Cabeça-Nádega"
        subtitle="Datação gestacional no 1º trimestre (6–14 semanas)"
      />

      <TokenGateAlert needsLogin={needsLogin} blocked={blocked} tokensRemaining={subscription?.tokens_remaining} />
      <PatientSelector value={selectedPatientId} onChange={setSelectedPatientId} />

      <div className="glass-card-static p-5 md:p-6 space-y-5 mesh-navy">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold text-primary">Medida do CCN</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-lg">
              Estimativa da idade gestacional pelo comprimento crânio-caudal — o método mais acurado de datação no início da gravidez.
            </p>
          </div>
          <CitationChip>Robinson &amp; Fleming, 1975</CitationChip>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">CCN (mm)</Label>
            <Tooltip>
              <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
              <TooltipContent>Comprimento crânio-caudal medido no plano sagital médio (2–84 mm)</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="number" min={2} max={84} step={0.1}
              value={crl} onChange={(e) => setCrl(e.target.value)}
              placeholder="Ex: 45" className="input-glass num w-32"
            />
            <span className="num text-sm text-muted-foreground">mm</span>
          </div>
          <p className="num text-[10px] text-muted-foreground">2–84 mm</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm" role="alert">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button onClick={handleCalculate} disabled={isDisabled} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-50 flex-1 sm:flex-none">
            <Ruler className="w-4 h-4 mr-2" /> {calculating ? "Calculando..." : "Calcular IG"}
          </Button>
          <Button onClick={handleReset} disabled={calculating} variant="outline" className="flex-1 sm:flex-none" aria-label="Limpar cálculo">
            Limpar cálculo
          </Button>
        </div>
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
                <span className="section-label text-[11px]">Idade Gestacional Estimada</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="num text-4xl font-semibold text-primary">{results.weeks}</span>
                <span className="text-sm text-muted-foreground">sem</span>
                <span className="num text-2xl font-semibold text-primary ml-2">{results.days}</span>
                <span className="text-sm text-muted-foreground">dias</span>
              </div>
            </div>

            <div className="glass-card-static p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">Data Provável do Parto</span>
              </div>
              <p className="num text-lg font-semibold text-primary">
                {format(results.dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              <p className="methodological-note text-[11px]">DPP estimada (±5 dias no 1º trimestre).</p>
            </div>

            <div className="glass-card-static p-5 space-y-3">
              <h4 className="font-display text-sm font-semibold text-primary flex items-center gap-2">
                <Ruler className="w-4 h-4 text-accent" /> Tabela de Referência — CCN × IG
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-border"><th className="text-left py-2 section-label text-[10px]">CCN (mm)</th><th className="text-left py-2 section-label text-[10px]">IG (sem+dias)</th></tr></thead>
                  <tbody>
                    {CRL_REFERENCE.map((ref) => (
                      <tr key={ref.crl} className={`border-b border-border/50 ${Math.abs(parseFloat(crl) - ref.crl) < 5 ? "bg-accent/10" : ""}`}>
                        <td className="py-1.5 num text-foreground">{ref.crl}</td>
                        <td className="py-1.5 num text-foreground">{ref.ga}</td>
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
