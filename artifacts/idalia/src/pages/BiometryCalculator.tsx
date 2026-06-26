import { useState } from "react";
import { useTokenGate } from "@/hooks/useTokenGate";
import { useExamSave } from "@/hooks/useExamSave";
import { PatientSelector } from "@/components/PatientSelector";
import { TokenGateAlert } from "@/components/TokenGateAlert";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/PageMeta";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Info, Ruler, Baby, Calendar, Activity, AlertCircle } from "lucide-react";
import { dueDateFromGA } from "@/lib/biometry";
import { formatDateLongBR, formatGAShort } from "@/lib/units";
import { motion, AnimatePresence } from "framer-motion";
import ScientificFooter from "@/components/ScientificFooter";
import { CRL_REFERENCE, BPD_REFERENCE } from "@/lib/biometry-references";
import { CalculatorHeader } from "@/components/CalculatorHeader";
import { CitationChip } from "@/components/CitationChip";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

type CalcMode = "crl" | "bpd" | "composite";

interface GAResult {
  weeks: number;
  days: number;
  totalDays: number;
  dueDate: Date;
  estimates?: { label: string; weeks: number; days: number }[];
}

const BiometryCalculator = () => {
  const { blocked, needsLogin, subscription, refetch } = useTokenGate();
  const { saveExam, canSave } = useExamSave();
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();
  const [mode, setMode] = useState<CalcMode>("crl");
  const [calculating, setCalculating] = useState(false);

  const [crl, setCrl] = useState("");
  const [bpdSingle, setBpdSingle] = useState("");
  const [bpd, setBpd] = useState("");
  const [hc, setHc] = useState("");
  const [ac, setAc] = useState("");
  const [fl, setFl] = useState("");

  const [error, setError] = useState("");
  const [results, setResults] = useState<GAResult | null>(null);

  const clearResults = () => { setError(""); setResults(null); };

  const handleTabChange = (v: string) => {
    setMode(v as CalcMode);
    clearResults();
  };

  const save = (calcType: "crl" | "bpd" | "biometry", inputData: Record<string, unknown>, ga: { weeks: number; days: number; totalDays: number }) => {
    if (canSave) {
      void saveExam({
        calcType,
        inputData,
        resultData: { weeks: ga.weeks, days: ga.days, totalDays: ga.totalDays },
        gestationalAgeWeeks: ga.weeks,
        gestationalAgeDays: ga.days,
        patientId: selectedPatientId,
      });
    }
  };

  const handleCRL = async () => {
    const value = parseFloat(crl);
    if (isNaN(value)) { setError("Insira um valor numérico válido."); return; }
    setCalculating(true);
    setError("");
    try {
      const ga = await apiFetch<{ weeks: number; days: number; totalDays: number }>(
        "/calculate/biometry/crl",
        { method: "POST", body: JSON.stringify({ crl: value }) },
      );
      setResults({ ...ga, dueDate: dueDateFromGA(ga.totalDays) });
      save("crl", { crl: value }, ga);
      void refetch();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        toast({ title: "Tokens esgotados", description: "Assine um plano para continuar usando as calculadoras.", variant: "destructive" });
      } else if (err instanceof ApiError && err.status === 400) {
        setError(err.body?.error ?? "Valor fora do intervalo aceito.");
      } else {
        toast({ title: "Erro ao calcular", description: "Tente novamente.", variant: "destructive" });
      }
    } finally {
      setCalculating(false);
    }
  };

  const handleBPD = async () => {
    const value = parseFloat(bpdSingle);
    if (isNaN(value)) { setError("Insira um valor numérico válido."); return; }
    setCalculating(true);
    setError("");
    try {
      const ga = await apiFetch<{ weeks: number; days: number; totalDays: number }>(
        "/calculate/biometry/bpd",
        { method: "POST", body: JSON.stringify({ bpd: value }) },
      );
      setResults({ ...ga, dueDate: dueDateFromGA(ga.totalDays) });
      save("bpd", { bpd: value }, ga);
      void refetch();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        toast({ title: "Tokens esgotados", description: "Assine um plano para continuar usando as calculadoras.", variant: "destructive" });
      } else if (err instanceof ApiError && err.status === 400) {
        setError(err.body?.error ?? "Valor fora do intervalo aceito.");
      } else {
        toast({ title: "Erro ao calcular", description: "Tente novamente.", variant: "destructive" });
      }
    } finally {
      setCalculating(false);
    }
  };

  const handleComposite = async () => {
    const params = {
      bpd: bpd ? parseFloat(bpd) : undefined,
      hc: hc ? parseFloat(hc) : undefined,
      ac: ac ? parseFloat(ac) : undefined,
      fl: fl ? parseFloat(fl) : undefined,
    };
    if (!params.bpd && !params.hc && !params.ac && !params.fl) {
      setError("Insira ao menos uma medida biométrica."); return;
    }
    setCalculating(true);
    setError("");
    try {
      const ga = await apiFetch<{ weeks: number; days: number; totalDays: number; estimates: { label: string; weeks: number; days: number }[] }>(
        "/calculate/biometry/composite",
        { method: "POST", body: JSON.stringify(params) },
      );
      setResults({ ...ga, dueDate: dueDateFromGA(ga.totalDays), estimates: ga.estimates });
      save("biometry", { bpd: params.bpd, hc: params.hc, ac: params.ac, fl: params.fl }, ga);
      void refetch();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        toast({ title: "Tokens esgotados", description: "Assine um plano para continuar usando as calculadoras.", variant: "destructive" });
      } else if (err instanceof ApiError && err.status === 400) {
        setError(err.body?.error ?? "Valores fora do intervalo aceitável.");
      } else {
        toast({ title: "Erro ao calcular", description: "Tente novamente.", variant: "destructive" });
      }
    } finally {
      setCalculating(false);
    }
  };

  const compositeFields = [
    { label: "DBP", desc: "Diâmetro Biparietal", value: bpd, set: setBpd, range: "14–100 mm" },
    { label: "CC", desc: "Circunferência Cefálica", value: hc, set: setHc, range: "50–380 mm" },
    { label: "CA", desc: "Circunferência Abdominal", value: ac, set: setAc, range: "40–400 mm" },
    { label: "CF", desc: "Comprimento do Fêmur", value: fl, set: setFl, range: "10–85 mm" },
  ];

  const isDisabled = blocked || needsLogin || calculating;

  return (
    <div className="space-y-6">
      <PageMeta
        title="Calculadora de Biometria Fetal"
        description="Avalie DBP, CA, CC e CF para estimar a idade gestacional e o peso fetal. Biometria fetal baseada nas referências INTERGROWTH-21st — IDALIA Calc."
        path="/biometry"
      />
      <CalculatorHeader
        icon={Activity}
        title="Biometria Fetal"
        subtitle="Estimativa da idade gestacional por medida individual ou biometria composta"
      />

      <TokenGateAlert needsLogin={needsLogin} blocked={blocked} tokensRemaining={subscription?.tokens_remaining} />
      <PatientSelector value={selectedPatientId} onChange={setSelectedPatientId} />

      <div className="glass-card-static p-5 md:p-6 space-y-5 mesh-navy">
        <Tabs value={mode} onValueChange={handleTabChange} className="w-full space-y-5">
          <div className="overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            <TabsList className="bg-muted/50 p-1 h-11 grid w-full grid-cols-3">
              <TabsTrigger value="crl" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                <Ruler className="w-3.5 h-3.5 mr-1.5 hidden sm:inline-block" />CCN (1º Tri)
              </TabsTrigger>
              <TabsTrigger value="bpd" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                <Ruler className="w-3.5 h-3.5 mr-1.5 hidden sm:inline-block" />DBP
              </TabsTrigger>
              <TabsTrigger value="composite" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                <Activity className="w-3.5 h-3.5 mr-1.5 hidden sm:inline-block" />Composta
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="crl" className="space-y-4 focus-visible:outline-none">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold text-primary">CCN — 1º Trimestre</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-lg">Datação pelo comprimento crânio-caudal (6–14 semanas).</p>
              </div>
              <CitationChip>Robinson &amp; Fleming, 1975</CitationChip>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">CCN (mm)</Label>
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>Comprimento crânio-caudal medido no US de 1º trimestre (2–84 mm)</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-3">
                <Input type="number" min={2} max={84} step={0.1} value={crl} onChange={(e) => setCrl(e.target.value)} placeholder="Ex: 45" className="input-glass num w-32" />
                <span className="num text-sm text-muted-foreground">mm</span>
              </div>
              <p className="num text-[10px] text-muted-foreground">2–84 mm</p>
            </div>
            <Button onClick={handleCRL} disabled={isDisabled} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-50">
              <Ruler className="w-4 h-4 mr-1" /> {calculating ? "Calculando..." : "Calcular IG"}
            </Button>
          </TabsContent>

          <TabsContent value="bpd" className="space-y-4 focus-visible:outline-none">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold text-primary">DBP — Diâmetro Biparietal</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-lg">Datação pelo diâmetro biparietal (mais acurado entre 12 e 28 semanas).</p>
              </div>
              <CitationChip>Hadlock, 1982</CitationChip>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">DBP (mm)</Label>
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>Diâmetro biparietal medido de borda externa a borda interna (14–100 mm)</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-3">
                <Input type="number" min={14} max={100} step={0.1} value={bpdSingle} onChange={(e) => setBpdSingle(e.target.value)} placeholder="Ex: 55" className="input-glass num w-32" />
                <span className="num text-sm text-muted-foreground">mm</span>
              </div>
              <p className="num text-[10px] text-muted-foreground">14–100 mm</p>
            </div>
            <Button onClick={handleBPD} disabled={isDisabled} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-50">
              <Ruler className="w-4 h-4 mr-1" /> {calculating ? "Calculando..." : "Calcular IG"}
            </Button>
          </TabsContent>

          <TabsContent value="composite" className="space-y-4 focus-visible:outline-none">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold text-primary">Biometria Composta</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-lg">Estimativa pela média ponderada de múltiplos parâmetros biométricos.</p>
              </div>
              <CitationChip>Hadlock, 1984</CitationChip>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {compositeFields.map((f) => (
                <div key={f.label} className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">{f.label} (mm)</Label>
                    <Tooltip>
                      <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent>{f.desc} — {f.range}</TooltipContent>
                    </Tooltip>
                  </div>
                  <Input type="number" step={0.1} value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.label} className="input-glass num" />
                  <p className="num text-[10px] text-muted-foreground">{f.range}</p>
                </div>
              ))}
            </div>
            <Button onClick={handleComposite} disabled={isDisabled} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-50">
              <Ruler className="w-4 h-4 mr-1" /> {calculating ? "Calculando..." : "Calcular IG Composta"}
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {results && (
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="glass-card-static p-6 md:p-8 mesh-navy">
              <div className="flex items-center gap-2 mb-2">
                <Baby className="w-4 h-4 text-accent" />
                <span className="section-label text-[11px]">
                  {results.estimates ? "IG Média Composta" : "Idade Gestacional Estimada"}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="num text-4xl font-semibold text-primary">{results.weeks}</span>
                <span className="text-sm text-muted-foreground">sem</span>
                <span className="num text-2xl font-semibold text-primary ml-2">{results.days}</span>
                <span className="text-sm text-muted-foreground">dias</span>
              </div>
              {results.estimates && (
                <p className="text-xs text-muted-foreground mt-2">Média de <span className="num">{results.estimates.length}</span> medida{results.estimates.length > 1 ? "s" : ""}</p>
              )}
            </div>

            {results.estimates && results.estimates.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {results.estimates.map((est) => (
                  <div key={est.label} className="glass-card-static p-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-accent" />
                      <span className="section-label text-[10px]">{est.label}</span>
                    </div>
                    <p className="num text-lg font-semibold text-primary">{formatGAShort(est.weeks, est.days)}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="glass-card-static p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">Data Provável do Parto</span>
              </div>
              <p className="num text-lg font-semibold text-primary">{formatDateLongBR(results.dueDate)}</p>
              <p className="methodological-note text-[11px]">
                {mode === "crl" ? "DPP estimada (±5 dias no 1º trimestre)." : "DPP estimada (±7–14 dias no 2º/3º trimestre)."}
              </p>
            </div>

            {mode === "crl" && (
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
            )}

            {mode === "bpd" && (
              <div className="glass-card-static p-5 space-y-3">
                <h4 className="font-display text-sm font-semibold text-primary flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-accent" /> Tabela de Referência — DBP × IG
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border"><th className="text-left py-2 section-label text-[10px]">DBP (mm)</th><th className="text-left py-2 section-label text-[10px]">IG (sem+dias)</th></tr></thead>
                    <tbody>
                      {BPD_REFERENCE.map((ref) => (
                        <tr key={ref.bpd} className={`border-b border-border/50 ${Math.abs(parseFloat(bpdSingle) - ref.bpd) < 5 ? "bg-accent/10" : ""}`}>
                          <td className="py-1.5 num text-foreground">{ref.bpd}</td>
                          <td className="py-1.5 num text-foreground">{ref.ga}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ScientificFooter
        references={[
          { authors: "Robinson HP, Fleming JEE", title: "A critical evaluation of sonar crown-rump length measurements", journal: "Br J Obstet Gynaecol", year: 1975, doi: "10.1111/j.1471-0528.1975.tb00710.x", pubmedId: "1191154" },
          { authors: "Hadlock FP, Deter RL, Harrist RB, Park SK", title: "Fetal biparietal diameter: a critical re-evaluation of the relation to menstrual age", journal: "J Ultrasound Med", year: 1982, doi: "10.7863/jum.1982.1.3.97", pubmedId: "6152941" },
          { authors: "Hadlock FP, Deter RL, Harrist RB, Park SK", title: "Estimating fetal age: computer-assisted analysis of multiple fetal growth parameters", journal: "Radiology", year: 1984, doi: "10.1148/radiology.152.2.6739822", pubmedId: "6739822" },
          { authors: "Hadlock FP, Harrist RB, Martinez-Poyer J", title: "In utero analysis of fetal growth: a sonographic weight standard", journal: "Radiology", year: 1991, doi: "10.1148/radiology.181.1.1887021", pubmedId: "1887021" },
        ]}
        units={[
          { param: "CCN", unit: "mm", description: "Comprimento crânio-caudal medido no plano sagital médio" },
          { param: "DBP", unit: "mm", description: "Diâmetro biparietal — borda externa a borda interna" },
          { param: "Idade gestacional", unit: "sem + dias", description: "Semanas completas + dias" },
        ]}
        extraDisclaimer="A medida do CCN é mais acurada entre 7 e 10 semanas. Acima de 14 semanas, recomenda-se biometria composta. Discordância >2 semanas entre parâmetros pode indicar CIUR assimétrico."
      />
    </div>
  );
};

export default BiometryCalculator;
