import { useState } from "react";
import { useTokenGate } from "@/hooks/useTokenGate";
import { TokenGateAlert } from "@/components/TokenGateAlert";
import { PageMeta } from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Info, Activity, AlertCircle, Heart, Brain, ArrowRightLeft, Waves } from "lucide-react";
import { formatIndex } from "@/lib/units";
import { motion, AnimatePresence } from "framer-motion";
import ScientificFooter from "@/components/ScientificFooter";
import { MetricResult } from "@/components/MetricResult";
import { PercentileRefBar } from "@/components/PercentileRefBar";
import { CalculatorHeader } from "@/components/CalculatorHeader";
import { CitationChip } from "@/components/CitationChip";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { DopplerResult, CPRResult } from "@/lib/doppler";

function ResultCard({ label, result, note }: { label: string; result: DopplerResult; note?: string }) {
  return (
    <MetricResult
      title={label}
      value={formatIndex(result.value)}
      percentile={result.percentile}
      severity={result.severity}
      interpretation={result.interpretation}
      note={note}
    />
  );
}

interface FieldLabelProps {
  children: React.ReactNode;
  hint?: string;
}
function FieldLabel({ children, hint }: FieldLabelProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">{children}</Label>
      {hint ? (
        <Tooltip>
          <TooltipTrigger>
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>{hint}</TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
}

interface TabProps {
  disabled: boolean;
  onSuccess: () => void;
}

function PanelHeader({ title, description, citation }: { title: string; description: string; citation: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h3 className="font-display text-lg font-semibold text-primary">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-lg">{description}</p>
      </div>
      <CitationChip>{citation}</CitationChip>
    </div>
  );
}

function UmbilicalArteryTab({ disabled, onSuccess }: TabProps) {
  const [pi, setPi] = useState("");
  const [ri, setRi] = useState("");
  const [sd, setSd] = useState("");
  const [ga, setGa] = useState("");
  const [error, setError] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState<{ piResult?: DopplerResult; riResult?: DopplerResult; sdResult?: DopplerResult; refs: { p5: number; p50: number; p95: number } } | null>(null);

  const handleCalc = async () => {
    const gaVal = parseInt(ga);
    if (isNaN(gaVal) || gaVal < 20 || gaVal > 42) { setError("Informe a IG entre 20 e 42 semanas."); return; }
    const piVal = pi ? parseFloat(pi) : NaN;
    const riVal = ri ? parseFloat(ri) : NaN;
    const sdVal = sd ? parseFloat(sd) : NaN;
    if (isNaN(piVal) && isNaN(riVal) && isNaN(sdVal)) { setError("Informe ao menos um índice: IP, IR ou S/D."); return; }
    setCalculating(true);
    setError("");
    try {
      const result = await apiFetch<{ piResult?: DopplerResult; riResult?: DopplerResult; sdResult?: DopplerResult; refs: { p5: number; p50: number; p95: number } }>(
        "/calculate/doppler/ua",
        { method: "POST", body: JSON.stringify({ ga: gaVal, pi: isNaN(piVal) ? undefined : piVal, ri: isNaN(riVal) ? undefined : riVal, sd: isNaN(sdVal) ? undefined : sdVal }) },
      );
      setResults(result);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        toast({ title: "Tokens esgotados", description: "Assine um plano para continuar usando as calculadoras.", variant: "destructive" });
      } else {
        toast({ title: "Erro ao calcular", description: "Tente novamente.", variant: "destructive" });
      }
    } finally {
      setCalculating(false);
    }
  };

  const handleReset = () => {
    setGa("");
    setPi("");
    setRi("");
    setSd("");
    setResults(null);
    setError("");
  };

  return (
    <div className="space-y-5">
      <div className="glass-card-static p-5 md:p-6 space-y-5 mesh-navy">
        <PanelHeader
          title="Artéria Umbilical"
          description="Avaliação da resistência placentária pelos índices de pulsatilidade (IP), resistência (IR) e relação S/D."
          citation="Acharya et al., 2005"
        />
        <div className="grid grid-cols-2 gap-3">
          {[{ label: "IG (sem)", value: ga, set: setGa, desc: "Idade gestacional", range: "20–42" }, { label: "IP", value: pi, set: setPi, desc: "Índice de Pulsatilidade", range: "0.3–2.5" }, { label: "IR", value: ri, set: setRi, desc: "Índice de Resistência", range: "0.0–1.0" }, { label: "S/D", value: sd, set: setSd, desc: "Relação Sístole/Diástole", range: "1.0–10.0" }].map((f) => (
            <div key={f.label} className="space-y-1.5">
              <FieldLabel hint={`${f.desc} (${f.range})`}>{f.label}</FieldLabel>
              <Input type="number" step={0.01} value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.label} className="input-glass num" />
              <p className="num text-[10px] text-muted-foreground">{f.range}</p>
            </div>
          ))}
        </div>
        {error && <div className="flex items-center gap-2 text-destructive text-sm" role="alert"><AlertCircle className="w-4 h-4" /> {error}</div>}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button onClick={handleCalc} disabled={disabled || calculating} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-50 flex-1 sm:flex-none">
            <Activity className="w-4 h-4 mr-2" /> {calculating ? "Calculando..." : "Avaliar"}
          </Button>
          <Button onClick={handleReset} disabled={calculating} variant="outline" className="flex-1 sm:flex-none" aria-label="Limpar cálculo">
            Limpar cálculo
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {results && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-3">
            {results.piResult && (<><ResultCard label="Índice de Pulsatilidade (IP)" result={results.piResult} note="Percentil estimado por Acharya et al. (2005). Requer ângulo de insonação adequado e ausência de movimento fetal." /><div className="glass-card-static p-4"><PercentileRefBar value={results.piResult.value} refs={results.refs} label="IP — Artéria Umbilical" format={formatIndex} /></div></>)}
            {results.riResult && <ResultCard label="Índice de Resistência (IR)" result={results.riResult} />}
            {results.sdResult && <ResultCard label="Relação S/D" result={results.sdResult} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MCATab({ disabled, onSuccess }: TabProps) {
  const [pi, setPi] = useState("");
  const [ga, setGa] = useState("");
  const [error, setError] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<{ res: DopplerResult; refs: { p5: number; p50: number; p95: number } } | null>(null);

  const handleCalc = async () => {
    const gaVal = parseInt(ga);
    const piVal = parseFloat(pi);
    if (isNaN(gaVal) || gaVal < 20 || gaVal > 42) { setError("IG entre 20 e 42 semanas."); return; }
    if (isNaN(piVal) || piVal <= 0) { setError("Informe o IP da ACM."); return; }
    setCalculating(true);
    setError("");
    try {
      const r = await apiFetch<{ res: DopplerResult; refs: { p5: number; p50: number; p95: number } }>(
        "/calculate/doppler/mca",
        { method: "POST", body: JSON.stringify({ ga: gaVal, pi: piVal }) },
      );
      setResult(r);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        toast({ title: "Tokens esgotados", description: "Assine um plano para continuar usando as calculadoras.", variant: "destructive" });
      } else {
        toast({ title: "Erro ao calcular", description: "Tente novamente.", variant: "destructive" });
      }
    } finally {
      setCalculating(false);
    }
  };

  const handleReset = () => {
    setGa("");
    setPi("");
    setResult(null);
    setError("");
  };

  return (
    <div className="space-y-5">
      <div className="glass-card-static p-5 md:p-6 space-y-5 mesh-navy">
        <PanelHeader
          title="Artéria Cerebral Média (ACM)"
          description="Avaliação da vasodilatação cerebral compensatória (brain-sparing effect)."
          citation="Ebbing et al., 2007"
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <FieldLabel hint="Idade gestacional (20–42)">IG (sem)</FieldLabel>
            <Input type="number" value={ga} onChange={(e) => setGa(e.target.value)} placeholder="IG" className="input-glass num" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel hint="Índice de Pulsatilidade">IP da ACM</FieldLabel>
            <Input type="number" step={0.01} value={pi} onChange={(e) => setPi(e.target.value)} placeholder="IP" className="input-glass num" />
          </div>
        </div>
        {error && <div className="flex items-center gap-2 text-destructive text-sm" role="alert"><AlertCircle className="w-4 h-4" /> {error}</div>}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button onClick={handleCalc} disabled={disabled || calculating} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-50 flex-1 sm:flex-none">
            <Brain className="w-4 h-4 mr-2" /> {calculating ? "Calculando..." : "Avaliar ACM"}
          </Button>
          <Button onClick={handleReset} disabled={calculating} variant="outline" className="flex-1 sm:flex-none" aria-label="Limpar cálculo">
            Limpar cálculo
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <ResultCard label="IP — Artéria Cerebral Média" result={result.res} note="Redução do IP da ACM sugere centralização hemodinâmica; correlacionar com a umbilical e a RCP." />
            <div className="glass-card-static p-4"><PercentileRefBar value={result.res.value} refs={result.refs} label="IP — ACM" format={formatIndex} /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UterineArteryTab({ disabled, onSuccess }: TabProps) {
  const [pi, setPi] = useState("");
  const [ga, setGa] = useState("");
  const [notch, setNotch] = useState(false);
  const [error, setError] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<{ res: DopplerResult; refs: { p5: number; p50: number; p95: number } } | null>(null);

  const handleCalc = async () => {
    const gaVal = parseInt(ga);
    const piVal = parseFloat(pi);
    if (isNaN(gaVal) || gaVal < 11 || gaVal > 42) { setError("IG entre 11 e 42 semanas."); return; }
    if (isNaN(piVal) || piVal <= 0) { setError("Informe o IP da artéria uterina."); return; }
    setCalculating(true);
    setError("");
    try {
      const r = await apiFetch<{ res: DopplerResult; refs: { p5: number; p50: number; p95: number } }>(
        "/calculate/doppler/uta",
        { method: "POST", body: JSON.stringify({ ga: gaVal, pi: piVal, notch }) },
      );
      setResult(r);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        toast({ title: "Tokens esgotados", description: "Assine um plano para continuar usando as calculadoras.", variant: "destructive" });
      } else {
        toast({ title: "Erro ao calcular", description: "Tente novamente.", variant: "destructive" });
      }
    } finally {
      setCalculating(false);
    }
  };

  const handleReset = () => {
    setGa("");
    setPi("");
    setNotch(false);
    setResult(null);
    setError("");
  };

  return (
    <div className="space-y-5">
      <div className="glass-card-static p-5 md:p-6 space-y-5 mesh-navy">
        <PanelHeader
          title="Artéria Uterina"
          description="Avaliação da resistência vascular uterina e rastreio de pré-eclâmpsia."
          citation="Gómez et al., 2008"
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <FieldLabel hint="Idade gestacional (11–42)">IG (sem)</FieldLabel>
            <Input type="number" value={ga} onChange={(e) => setGa(e.target.value)} placeholder="IG" className="input-glass num" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel hint="Média dos IPs das artérias uterinas D e E">IP médio</FieldLabel>
            <Input type="number" step={0.01} value={pi} onChange={(e) => setPi(e.target.value)} placeholder="IP" className="input-glass num" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={notch} onCheckedChange={setNotch} />
          <Label className="text-sm text-foreground">Incisura protodiastólica bilateral</Label>
        </div>
        {error && <div className="flex items-center gap-2 text-destructive text-sm" role="alert"><AlertCircle className="w-4 h-4" /> {error}</div>}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button onClick={handleCalc} disabled={disabled || calculating} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-50 flex-1 sm:flex-none">
            <Heart className="w-4 h-4 mr-2" /> {calculating ? "Calculando..." : "Avaliar Uterina"}
          </Button>
          <Button onClick={handleReset} disabled={calculating} variant="outline" className="flex-1 sm:flex-none" aria-label="Limpar cálculo">
            Limpar cálculo
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <ResultCard label="IP Médio — Artérias Uterinas" result={result.res} note="IP uterino elevado e/ou incisura bilateral aumentam o risco de pré-eclâmpsia e RCF; considerar no contexto do rastreio." />
            <div className="glass-card-static p-4"><PercentileRefBar value={result.res.value} refs={result.refs} label="IP Médio — Uterinas" format={formatIndex} /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CPRTab({ disabled, onSuccess }: TabProps) {
  const [uaPi, setUaPi] = useState("");
  const [mcaPi, setMcaPi] = useState("");
  const [ga, setGa] = useState("");
  const [error, setError] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<{ res: CPRResult; refs: { p5: number; p50: number; p95: number } } | null>(null);

  const handleCalc = async () => {
    const gaVal = parseInt(ga);
    const uaPiVal = parseFloat(uaPi);
    const mcaPiVal = parseFloat(mcaPi);
    if (isNaN(gaVal) || gaVal < 20 || gaVal > 42) { setError("IG entre 20 e 42 semanas."); return; }
    if (isNaN(uaPiVal) || uaPiVal <= 0) { setError("Informe o IP da umbilical."); return; }
    if (isNaN(mcaPiVal) || mcaPiVal <= 0) { setError("Informe o IP da cerebral."); return; }
    setCalculating(true);
    setError("");
    try {
      const r = await apiFetch<{ res: CPRResult; refs: { p5: number; p50: number; p95: number } }>(
        "/calculate/doppler/cpr",
        { method: "POST", body: JSON.stringify({ ga: gaVal, uaPi: uaPiVal, mcaPi: mcaPiVal }) },
      );
      setResult(r);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        toast({ title: "Tokens esgotados", description: "Assine um plano para continuar usando as calculadoras.", variant: "destructive" });
      } else {
        toast({ title: "Erro ao calcular", description: "Tente novamente.", variant: "destructive" });
      }
    } finally {
      setCalculating(false);
    }
  };

  const handleReset = () => {
    setGa("");
    setUaPi("");
    setMcaPi("");
    setResult(null);
    setError("");
  };

  return (
    <div className="space-y-5">
      <div className="glass-card-static p-5 md:p-6 space-y-5 mesh-navy">
        <PanelHeader
          title="Relação Cérebro-Placentária (RCP)"
          description="Proporção entre a resistência da ACM e da Artéria Umbilical (IP ACM / IP umbilical)."
          citation="Ebbing et al., 2007"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1.5"><FieldLabel hint="Idade gestacional (20–42)">IG (sem)</FieldLabel><Input type="number" value={ga} onChange={(e) => setGa(e.target.value)} placeholder="IG" className="input-glass num" /></div>
          <div className="space-y-1.5"><FieldLabel hint="Índice de Pulsatilidade da umbilical">IP Umbilical</FieldLabel><Input type="number" step={0.01} value={uaPi} onChange={(e) => setUaPi(e.target.value)} placeholder="IP UA" className="input-glass num" /></div>
          <div className="space-y-1.5"><FieldLabel hint="Índice de Pulsatilidade da cerebral média">IP Cerebral (ACM)</FieldLabel><Input type="number" step={0.01} value={mcaPi} onChange={(e) => setMcaPi(e.target.value)} placeholder="IP ACM" className="input-glass num" /></div>
        </div>
        {error && <div className="flex items-center gap-2 text-destructive text-sm" role="alert"><AlertCircle className="w-4 h-4" /> {error}</div>}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button onClick={handleCalc} disabled={disabled || calculating} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-50 flex-1 sm:flex-none">
            <ArrowRightLeft className="w-4 h-4 mr-2" /> {calculating ? "Calculando..." : "Avaliar RCP"}
          </Button>
          <Button onClick={handleReset} disabled={calculating} variant="outline" className="flex-1 sm:flex-none" aria-label="Limpar cálculo">
            Limpar cálculo
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <ResultCard label="Relação Cérebro-Placentária (RCP)" result={{ value: result.res.cpr, percentile: result.res.percentile, interpretation: result.res.interpretation, severity: result.res.severity }} note="RCP abaixo do percentil 5 indica redistribuição hemodinâmica, mesmo com índices isolados normais." />
            <div className="glass-card-static p-4"><PercentileRefBar value={result.res.cpr} refs={result.refs} label="RCP" format={formatIndex} /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DVTab({ disabled, onSuccess }: TabProps) {
  const [pi, setPi] = useState("");
  const [ga, setGa] = useState("");
  const [waveA, setWaveA] = useState<"positive" | "zero" | "reversed">("positive");
  const [error, setError] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<{ pivResult?: DopplerResult; waveAResult: DopplerResult; refs?: { p5: number; p50: number; p95: number } } | null>(null);

  const handleCalc = async () => {
    const gaVal = parseInt(ga);
    const piVal = parseFloat(pi);
    if (isNaN(gaVal) || gaVal < 20 || gaVal > 42) { setError("IG entre 20 e 42 semanas."); return; }
    if (isNaN(piVal) || piVal <= 0) { setError("Informe o IP do ducto venoso."); return; }
    setCalculating(true);
    setError("");
    try {
      const r = await apiFetch<{ pivResult?: DopplerResult; waveAResult: DopplerResult; refs?: { p5: number; p50: number; p95: number } }>(
        "/calculate/doppler/dv",
        { method: "POST", body: JSON.stringify({ ga: gaVal, piv: piVal, waveA }) },
      );
      setResult(r);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        toast({ title: "Tokens esgotados", description: "Assine um plano para continuar usando as calculadoras.", variant: "destructive" });
      } else {
        toast({ title: "Erro ao calcular", description: "Tente novamente.", variant: "destructive" });
      }
    } finally {
      setCalculating(false);
    }
  };

  const handleReset = () => {
    setGa("");
    setPi("");
    setWaveA("positive");
    setResult(null);
    setError("");
  };

  return (
    <div className="space-y-5">
      <div className="glass-card-static p-5 md:p-6 space-y-5 mesh-navy">
        <PanelHeader
          title="Ducto Venoso"
          description="Avaliação hemodinâmica fetal avançada e função cardíaca."
          citation="Kessler et al., 2006"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><FieldLabel hint="Idade gestacional (20–42)">IG (sem)</FieldLabel><Input type="number" value={ga} onChange={(e) => setGa(e.target.value)} placeholder="IG" className="input-glass num" /></div>
          <div className="space-y-1.5"><FieldLabel hint="Índice de Pulsatilidade do ducto venoso">IP do Ducto Venoso</FieldLabel><Input type="number" step={0.01} value={pi} onChange={(e) => setPi(e.target.value)} placeholder="IP DV" className="input-glass num" /></div>
          <div className="md:col-span-2 space-y-2">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">Onda A</Label>
            <div className="flex gap-2">
              {[ { v: "positive", l: "Positiva" }, { v: "zero", l: "Ausente" }, { v: "reversed", l: "Reversa" }].map((opt) => (
                <Button key={opt.v} variant={waveA === opt.v ? "default" : "outline"} size="sm" onClick={() => setWaveA(opt.v as any)} className="flex-1">{opt.l}</Button>
              ))}
            </div>
          </div>
        </div>
        {error && <div className="flex items-center gap-2 text-destructive text-sm" role="alert"><AlertCircle className="w-4 h-4" /> {error}</div>}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button onClick={handleCalc} disabled={disabled || calculating} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-50 flex-1 sm:flex-none">
            <Waves className="w-4 h-4 mr-2" /> {calculating ? "Calculando..." : "Avaliar Ducto"}
          </Button>
          <Button onClick={handleReset} disabled={calculating} variant="outline" className="flex-1 sm:flex-none" aria-label="Limpar cálculo">
            Limpar cálculo
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {result.pivResult && (
              <ResultCard label="IP — Ducto Venoso" result={result.pivResult} note="Onda A ausente ou reversa indica deterioração hemodinâmica avançada; avaliar conduta e momento do parto." />
            )}
            {result.pivResult && result.refs && (
              <div className="glass-card-static p-4"><PercentileRefBar value={result.pivResult.value} refs={result.refs} label="IP — Ducto Venoso" format={formatIndex} /></div>
            )}
            <ResultCard label="Onda A" result={result.waveAResult} note="A onda 'a' anterógrada é o padrão normal. Ausência e reversão são achados anormais; interpretar com o contexto clínico e os demais parâmetros de vitalidade fetal (ISUOG, 2020; doi:10.1002/uog.22134)." />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DopplerCalculator() {
  const { blocked, needsLogin, subscription, refetch } = useTokenGate("doppler");
  const disabled = blocked || needsLogin;

  return (
    <div className="min-h-screen pb-20">
      <PageMeta title="Calculadora de Doppler Fetal | Idália" description="Avaliação de Doppler da Artéria Umbilical, Cerebral Média, Uterinas, Ducto Venoso e RCP com percentis." path="/doppler" />
      <div className="container max-w-2xl mx-auto px-4 pt-8 md:pt-12">
        <CalculatorHeader icon={Activity} title="Doppler Fetal" subtitle="Avaliação hemodinâmica fetal e placentária" />

        <TokenGateAlert needsLogin={needsLogin} blocked={blocked} tokensRemaining={subscription?.tokens_remaining} />

        <Tabs defaultValue="ua" className="space-y-6">
          <div className="overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
            <TabsList className="bg-muted/50 p-1 h-11 w-max min-w-full">
              <TabsTrigger value="ua" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm px-4">Umbilical</TabsTrigger>
              <TabsTrigger value="mca" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm px-4">ACM</TabsTrigger>
              <TabsTrigger value="uta" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm px-4">Uterinas</TabsTrigger>
              <TabsTrigger value="cpr" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm px-4">RCP</TabsTrigger>
              <TabsTrigger value="dv" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm px-4">Ducto Venoso</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ua" className="focus-visible:outline-none"><UmbilicalArteryTab disabled={disabled} onSuccess={() => void refetch()} /></TabsContent>
          <TabsContent value="mca" className="focus-visible:outline-none"><MCATab disabled={disabled} onSuccess={() => void refetch()} /></TabsContent>
          <TabsContent value="uta" className="focus-visible:outline-none"><UterineArteryTab disabled={disabled} onSuccess={() => void refetch()} /></TabsContent>
          <TabsContent value="cpr" className="focus-visible:outline-none"><CPRTab disabled={disabled} onSuccess={() => void refetch()} /></TabsContent>
          <TabsContent value="dv" className="focus-visible:outline-none"><DVTab disabled={disabled} onSuccess={() => void refetch()} /></TabsContent>
        </Tabs>
      </div>
      <ScientificFooter
        references={[
          { authors: "Acharya G, Wilsgaard T, Berntsen GK, Maltau JM, Kiserud T", title: "Reference ranges for serial measurements of umbilical artery Doppler indices in the second half of pregnancy", journal: "Am J Obstet Gynecol", year: 2005, doi: "10.1016/j.ajog.2004.10.598", pubmedId: "15846216" },
          { authors: "Ciobanu A, Wright A, Syngelaki A, Wright D, Akolekar R, Nicolaides KH", title: "Fetal Medicine Foundation reference ranges for umbilical artery and middle cerebral artery pulsatility index and cerebroplacental ratio", journal: "Ultrasound Obstet Gynecol", year: 2019, doi: "10.1002/uog.20157", pubmedId: "30207011" },
          { authors: "Gómez O, Figueras F, Fernández S, et al.", title: "Reference ranges for uterine artery mean pulsatility index at 11–41 weeks of gestation", journal: "Ultrasound Obstet Gynecol", year: 2008, doi: "10.1002/uog.5315", pubmedId: "18816490" },
          { authors: "Kessler J, Rasmussen S, Hanson M, Kiserud T", title: "Longitudinal reference ranges for ductus venosus flow velocities and waveform indices", journal: "Ultrasound Obstet Gynecol", year: 2006, doi: "10.1002/uog.3819", pubmedId: "17029301" },
        ]}
        units={[
          { param: "IP / IR", unit: "adimensional", description: "Índice de pulsatilidade e índice de resistência (Doppler)" },
          { param: "RCP", unit: "adimensional", description: "Relação cerebroplacentária (IP ACM ÷ IP umbilical)" },
          { param: "Idade gestacional", unit: "semanas", description: "Semanas completas para seleção do percentil" },
        ]}
        extraDisclaimer="Os percentis de Doppler dependem de técnica de insonação adequada (ângulo, ciclos cardíacos e ausência de movimento fetal/respiração). Interprete sempre no contexto clínico."
      />
    </div>
  );
}
