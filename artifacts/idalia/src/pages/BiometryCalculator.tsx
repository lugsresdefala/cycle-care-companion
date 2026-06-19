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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Info, Ruler, Baby, Calendar, Activity, AlertCircle } from "lucide-react";
import { isValidCRL, isValidBPD } from "@/lib/biometry";
import { apiFetch, ApiError } from "@/lib/api";
import { formatDateLongBR, formatGAShort } from "@/lib/units";
import { motion, AnimatePresence } from "framer-motion";
import ScientificFooter from "@/components/ScientificFooter";
import { CRL_REFERENCE, BPD_REFERENCE } from "@/lib/biometry-references";

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

  const [crl, setCrl] = useState("");
  const [bpdSingle, setBpdSingle] = useState("");
  const [bpd, setBpd] = useState("");
  const [hc, setHc] = useState("");
  const [ac, setAc] = useState("");
  const [fl, setFl] = useState("");

  const [error, setError] = useState("");
  const [results, setResults] = useState<GAResult | null>(null);
  const [calculating, setCalculating] = useState(false);

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

  const wrapCalc = async (fn: () => Promise<void>) => {
    setError("");
    setCalculating(true);
    try {
      await fn();
      refetch();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        setError("Tokens esgotados. Assine um plano para continuar.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Faça login para usar esta calculadora.");
      } else {
        setError((err as any)?.message || "Erro no cálculo. Tente novamente.");
      }
      refetch();
    } finally {
      setCalculating(false);
    }
  };

  const handleCRL = () => wrapCalc(async () => {
    const value = parseFloat(crl);
    if (isNaN(value)) { setError("Insira um valor numérico válido."); return; }
    if (!isValidCRL(value)) { setError("O CCN deve estar entre 2 e 84 mm (≈6–14 semanas)."); return; }
    const ga = await apiFetch<{ weeks: number; days: number; totalDays: number; dueDate: string }>(
      "/calculate/biometry/crl", { method: "POST", body: JSON.stringify({ crl: value }) }
    );
    setResults({ ...ga, dueDate: new Date(ga.dueDate) });
    save("crl", { crl: value }, ga);
  });

  const handleBPD = () => wrapCalc(async () => {
    const value = parseFloat(bpdSingle);
    if (isNaN(value)) { setError("Insira um valor numérico válido."); return; }
    if (!isValidBPD(value)) { setError("O DBP deve estar entre 14 e 100 mm."); return; }
    const ga = await apiFetch<{ weeks: number; days: number; totalDays: number; dueDate: string }>(
      "/calculate/biometry/bpd", { method: "POST", body: JSON.stringify({ bpd: value }) }
    );
    setResults({ ...ga, dueDate: new Date(ga.dueDate) });
    save("bpd", { bpd: value }, ga);
  });

  const handleComposite = () => wrapCalc(async () => {
    const params = {
      bpd: bpd ? parseFloat(bpd) : undefined,
      hc: hc ? parseFloat(hc) : undefined,
      ac: ac ? parseFloat(ac) : undefined,
      fl: fl ? parseFloat(fl) : undefined,
    };
    if (!params.bpd && !params.hc && !params.ac && !params.fl) {
      setError("Insira ao menos uma medida biométrica."); return;
    }
    const ga = await apiFetch<{ weeks: number; days: number; totalDays: number; dueDate: string; estimates: { label: string; weeks: number; days: number }[] }>(
      "/calculate/biometry/composite", { method: "POST", body: JSON.stringify(params) }
    );
    setResults({ ...ga, dueDate: new Date(ga.dueDate) });
    save("biometry", { bpd: params.bpd, hc: params.hc, ac: params.ac, fl: params.fl }, ga);
  });

  const compositeFields = [
    { label: "DBP", desc: "Diâmetro Biparietal", value: bpd, set: setBpd, range: "14–100 mm" },
    { label: "CC", desc: "Circunferência Cefálica", value: hc, set: setHc, range: "50–380 mm" },
    { label: "CA", desc: "Circunferência Abdominal", value: ac, set: setAc, range: "40–400 mm" },
    { label: "CF", desc: "Comprimento do Fêmur", value: fl, set: setFl, range: "10–85 mm" },
  ];

  return (
    <div className="space-y-6">
      <PageMeta
        title="Calculadora de Biometria Fetal"
        description="Avalie DBP, CA, CC e CF para estimar a idade gestacional e o peso fetal. Biometria fetal baseada nas referências INTERGROWTH-21st — IDALIA Calc."
        path="/biometry"
      />
      <TokenGateAlert needsLogin={needsLogin} blocked={blocked} tokensRemaining={subscription?.tokens_remaining} />
      <PatientSelector value={selectedPatientId} onChange={setSelectedPatientId} />

      <div className="glass-card-static p-6 md:p-8 space-y-6 mesh-navy">
        <div>
          <h1 className="font-display text-xl text-foreground">Biometria Fetal</h1>
          <p className="text-sm text-muted-foreground mt-1">Estimativa da idade gestacional por medida individual ou biometria composta.</p>
        </div>

        <Tabs value={mode} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="crl" className="text-xs sm:text-sm">
              <Ruler className="w-3.5 h-3.5 mr-1.5 hidden sm:inline-block" />CCN (1º Tri)
            </TabsTrigger>
            <TabsTrigger value="bpd" className="text-xs sm:text-sm">
              <Ruler className="w-3.5 h-3.5 mr-1.5 hidden sm:inline-block" />DBP
            </TabsTrigger>
            <TabsTrigger value="composite" className="text-xs sm:text-sm">
              <Activity className="w-3.5 h-3.5 mr-1.5 hidden sm:inline-block" />Composta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crl" className="space-y-4 mt-4">
            <Badge variant="outline" className="text-xs border-accent/30 text-accent">Robinson & Fleming, 1975</Badge>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm text-foreground">CCN (mm)</Label>
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>Comprimento crânio-caudal medido no US de 1º trimestre (2–84 mm)</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-3">
                <Input type="number" min={2} max={84} step={0.1} value={crl} onChange={(e) => setCrl(e.target.value)} placeholder="Ex: 45" className="input-glass w-32 tabular-nums" />
                <span className="text-sm text-muted-foreground">mm</span>
              </div>
            </div>
            <Button onClick={handleCRL} disabled={blocked || needsLogin || calculating} className="bg-accent text-accent-foreground hover:bg-accent/90 glow-accent disabled:opacity-50">
              <Ruler className="w-4 h-4 mr-1" /> Calcular IG
            </Button>
          </TabsContent>

          <TabsContent value="bpd" className="space-y-4 mt-4">
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">Hadlock, 1982</Badge>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm text-foreground">DBP (mm)</Label>
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>Diâmetro biparietal medido de borda externa a borda interna (14–100 mm)</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-3">
                <Input type="number" min={14} max={100} step={0.1} value={bpdSingle} onChange={(e) => setBpdSingle(e.target.value)} placeholder="Ex: 55" className="input-glass w-32 tabular-nums" />
                <span className="text-sm text-muted-foreground">mm</span>
              </div>
            </div>
            <Button onClick={handleBPD} disabled={blocked || needsLogin || calculating} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-50">
              <Ruler className="w-4 h-4 mr-1" /> Calcular IG
            </Button>
          </TabsContent>

          <TabsContent value="composite" className="space-y-4 mt-4">
            <Badge variant="outline" className="text-xs border-accent/30 text-accent">Hadlock, 1984</Badge>
            <div className="grid grid-cols-2 gap-4">
              {compositeFields.map((f) => (
                <div key={f.label} className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-sm text-foreground">{f.label} (mm)</Label>
                    <Tooltip>
                      <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent>{f.desc} — {f.range}</TooltipContent>
                    </Tooltip>
                  </div>
                  <Input type="number" step={0.1} value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.label} className="input-glass tabular-nums" />
                </div>
              ))}
            </div>
            <Button onClick={handleComposite} disabled={blocked || needsLogin || calculating} className="bg-accent text-accent-foreground hover:bg-accent/90 glow-accent disabled:opacity-50">
              <Ruler className="w-4 h-4 mr-1" /> Calcular IG Composta
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
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {results.estimates ? "IG Média Composta" : "Idade Gestacional Estimada"}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="tabular-nums text-4xl font-display text-foreground">{results.weeks}</span>
                <span className="text-sm text-muted-foreground">sem</span>
                <span className="tabular-nums text-2xl font-display text-foreground ml-2">{results.days}</span>
                <span className="text-sm text-muted-foreground">dias</span>
              </div>
              {results.estimates && (
                <p className="text-xs text-muted-foreground mt-2">Média de {results.estimates.length} medida{results.estimates.length > 1 ? "s" : ""}</p>
              )}
            </div>

            {results.estimates && results.estimates.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {results.estimates.map((est) => (
                  <div key={est.label} className="glass-card-static p-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">{est.label}</span>
                    </div>
                    <p className="tabular-nums text-lg font-display text-foreground">{formatGAShort(est.weeks, est.days)}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="glass-card-static p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">Data Provável do Parto</span>
              </div>
              <p className="tabular-nums text-lg font-display text-foreground">{formatDateLongBR(results.dueDate)}</p>
              <p className="text-xs text-muted-foreground">
                {mode === "crl" ? "DPP estimada (±5 dias no 1º trimestre)" : "DPP estimada (±7–14 dias no 2º/3º trimestre)"}
              </p>
            </div>

            {mode === "crl" && (
              <div className="glass-card-static p-5 space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-primary" /> Tabela de Referência — CCN × IG
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
            )}

            {mode === "bpd" && (
              <div className="glass-card-static p-5 space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-primary" /> Tabela de Referência — DBP × IG
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border"><th className="text-left py-2 text-muted-foreground font-medium">DBP (mm)</th><th className="text-left py-2 text-muted-foreground font-medium">IG (sem+dias)</th></tr></thead>
                    <tbody>
                      {BPD_REFERENCE.map((ref) => (
                        <tr key={ref.bpd} className={`border-b border-border/50 ${Math.abs(parseFloat(bpdSingle) - ref.bpd) < 5 ? "bg-primary/10" : ""}`}>
                          <td className="py-1.5 tabular-nums text-foreground">{ref.bpd}</td>
                          <td className="py-1.5 tabular-nums text-foreground">{ref.ga}</td>
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
