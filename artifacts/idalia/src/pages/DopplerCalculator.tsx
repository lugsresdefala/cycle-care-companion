import { useState } from "react";
import { useTokenGate } from "@/hooks/useTokenGate";
import { TokenGateAlert } from "@/components/TokenGateAlert";
import { PageMeta } from "@/components/PageMeta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Info, Activity, AlertCircle, Heart, Brain, ArrowRightLeft, Waves } from "lucide-react";
import { formatIndex } from "@/lib/units";
import { motion, AnimatePresence } from "framer-motion";
import ScientificFooter from "@/components/ScientificFooter";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { DopplerResult, CPRResult } from "@/lib/doppler";

const SEVERITY_STYLES = {
  normal: "border-accent/30 bg-accent/5",
  warning: "border-ovulatory/30 bg-ovulatory/5",
  critical: "border-destructive/30 bg-destructive/5",
};
const SEVERITY_ICON_COLOR = { normal: "text-accent", warning: "text-ovulatory", critical: "text-destructive" };
const SEVERITY_LABELS = { normal: "Normal", warning: "Atenção", critical: "Alterado" };

function ResultCard({ label, result }: { label: string; result: DopplerResult }) {
  return (
    <div className={`glass-card-static p-4 space-y-2 ${SEVERITY_STYLES[result.severity]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Badge variant="outline" className={`text-[10px] ${SEVERITY_ICON_COLOR[result.severity]} border-current/30`}>
          {SEVERITY_LABELS[result.severity]}
        </Badge>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="tabular-nums text-2xl font-display text-foreground">{formatIndex(result.value)}</span>
        <span className="text-xs text-muted-foreground">{result.percentile}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{result.interpretation}</p>
    </div>
  );
}

function RefBar({ value, refs, label }: { value: number; refs: { p5: number; p50: number; p95: number }; label: string }) {
  const min = refs.p5 * 0.7;
  const max = refs.p95 * 1.3;
  const range = max - min;
  const pos = (v: number) => Math.max(0, Math.min(100, ((v - min) / range) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">{formatIndex(value)}</span>
      </div>
      <div className="h-3 bg-muted rounded-full relative overflow-hidden">
        <div className="absolute h-full bg-accent/20 rounded-full" style={{ left: `${pos(refs.p5)}%`, width: `${pos(refs.p95) - pos(refs.p5)}%` }} />
        <div className="absolute h-full w-px bg-accent/50" style={{ left: `${pos(refs.p50)}%` }} />
        <div className="absolute top-0 h-full w-1 rounded-full bg-foreground" style={{ left: `${pos(value)}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground/60">
        <span>p5: {refs.p5}</span><span>p50: {refs.p50}</span><span>p95: {refs.p95}</span>
      </div>
    </div>
  );
}

interface TabProps {
  disabled: boolean;
  onSuccess: () => void;
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

  return (
    <div className="space-y-5">
      <div className="glass-card-static p-5 md:p-6 space-y-5 mesh-navy">
        <div>
          <h3 className="font-display text-lg text-foreground">Artéria Umbilical</h3>
          <p className="text-xs text-muted-foreground mt-1">Avaliação da resistência placentária pelos índices de pulsatilidade (IP), resistência (IR) e relação S/D.</p>
          <Badge variant="outline" className="mt-2 text-xs border-primary/30 text-primary">Acharya et al., 2005</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[{ label: "IG (sem)", value: ga, set: setGa, desc: "Idade gestacional", range: "20–42" }, { label: "IP", value: pi, set: setPi, desc: "Índice de Pulsatilidade", range: "0.3–2.5" }, { label: "IR", value: ri, set: setRi, desc: "Índice de Resistência", range: "0.0–1.0" }, { label: "S/D", value: sd, set: setSd, desc: "Relação Sístole/Diástole", range: "1.0–10.0" }].map((f) => (
            <div key={f.label} className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm text-foreground">{f.label}</Label>
                <Tooltip><TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger><TooltipContent>{f.desc} ({f.range})</TooltipContent></Tooltip>
              </div>
              <Input type="number" step={0.01} value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.label} className="input-glass tabular-nums" />
            </div>
          ))}
        </div>
        {error && <div className="flex items-center gap-2 text-destructive text-sm"><AlertCircle className="w-4 h-4" /> {error}</div>}
        <Button onClick={handleCalc} disabled={disabled || calculating} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-50">
          <Activity className="w-4 h-4 mr-1" /> {calculating ? "Calculando..." : "Avaliar"}
        </Button>
      </div>
      <AnimatePresence>
        {results && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-3">
            {results.piResult && (<><ResultCard label="Índice de Pulsatilidade (IP)" result={results.piResult} /><div className="glass-card-static p-4"><RefBar value={results.piResult.value} refs={results.refs} label="IP — Artéria Umbilical" /></div></>)}
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

  return (
    <div className="space-y-5">
      <div className="glass-card-static p-5 md:p-6 space-y-5 mesh-purple">
        <div>
          <h3 className="font-display text-lg text-foreground">Artéria Cerebral Média (ACM)</h3>
          <p className="text-xs text-muted-foreground mt-1">Avaliação da vasodilatação cerebral compensatória (brain-sparing effect).</p>
          <Badge variant="outline" className="mt-2 text-xs border-secondary/30 text-secondary">Ebbing et al., 2007</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5"><Label className="text-sm text-foreground">IG (sem)</Label><Tooltip><TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger><TooltipContent>Idade gestacional (20–42)</TooltipContent></Tooltip></div>
            <Input type="number" value={ga} onChange={(e) => setGa(e.target.value)} placeholder="IG" className="input-glass tabular-nums" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5"><Label className="text-sm text-foreground">IP da ACM</Label><Tooltip><TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger><TooltipContent>Índice de Pulsatilidade</TooltipContent></Tooltip></div>
            <Input type="number" step={0.01} value={pi} onChange={(e) => setPi(e.target.value)} placeholder="IP" className="input-glass tabular-nums" />
          </div>
        </div>
        {error && <div className="flex items-center gap-2 text-destructive text-sm"><AlertCircle className="w-4 h-4" /> {error}</div>}
        <Button onClick={handleCalc} disabled={disabled || calculating} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 glow-secondary disabled:opacity-50">
          <Brain className="w-4 h-4 mr-1" /> {calculating ? "Calculando..." : "Avaliar ACM"}
        </Button>
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <ResultCard label="IP — Artéria Cerebral Média" result={result.res} />
            <div className="glass-card-static p-4"><RefBar value={result.res.value} refs={result.refs} label="IP — ACM" /></div>
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

  return (
    <div className="space-y-5">
      <div className="glass-card-static p-5 md:p-6 space-y-5 mesh-coral">
        <div>
          <h3 className="font-display text-lg text-foreground">Artéria Uterina</h3>
          <p className="text-xs text-muted-foreground mt-1">Avaliação da resistência vascular uterina e rastreio de pré-eclâmpsia.</p>
          <Badge variant="outline" className="mt-2 text-xs border-accent/30 text-accent">Gómez et al., 2008</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5"><Label className="text-sm text-foreground">IG (sem)</Label><Tooltip><TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger><TooltipContent>Idade gestacional (11–42)</TooltipContent></Tooltip></div>
            <Input type="number" value={ga} onChange={(e) => setGa(e.target.value)} placeholder="IG" className="input-glass tabular-nums" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5"><Label className="text-sm text-foreground">IP médio</Label><Tooltip><TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger><TooltipContent>Média dos IPs das artérias uterinas D e E</TooltipContent></Tooltip></div>
            <Input type="number" step={0.01} value={pi} onChange={(e) => setPi(e.target.value)} placeholder="IP" className="input-glass tabular-nums" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={notch} onCheckedChange={setNotch} />
          <Label className="text-sm text-foreground">Incisura protodiastólica bilateral</Label>
        </div>
        {error && <div className="flex items-center gap-2 text-destructive text-sm"><AlertCircle className="w-4 h-4" /> {error}</div>}
        <Button onClick={handleCalc} disabled={disabled || calculating} className="bg-accent text-accent-foreground hover:bg-accent/90 glow-accent disabled:opacity-50">
          <Heart className="w-4 h-4 mr-1" /> {calculating ? "Calculando..." : "Avaliar Uterina"}
        </Button>
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <ResultCard label="IP Médio — Artérias Uterinas" result={result.res} />
            <div className="glass-card-static p-4"><RefBar value={result.res.value} refs={result.refs} label="IP Médio — Uterinas" /></div>
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

  return (
    <div className="space-y-5">
      <div className="glass-card-static p-5 md:p-6 space-y-5 mesh-teal">
        <div>
          <h3 className="font-display text-lg text-foreground">Relação Cérebro-Placentária (RCP)</h3>
          <p className="text-xs text-muted-foreground mt-1">Proporção entre a resistência da ACM e da Artéria Umbilical (IP ACM / IP umbilical).</p>
          <Badge variant="outline" className="mt-2 text-xs border-accent/30 text-accent">Ebbing et al., 2007</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1.5"><Label className="text-sm text-foreground">IG (sem)</Label><Input type="number" value={ga} onChange={(e) => setGa(e.target.value)} placeholder="IG" className="input-glass tabular-nums" /></div>
          <div className="space-y-1.5"><Label className="text-sm text-foreground">IP Umbilical</Label><Input type="number" step={0.01} value={uaPi} onChange={(e) => setUaPi(e.target.value)} placeholder="IP UA" className="input-glass tabular-nums" /></div>
          <div className="space-y-1.5"><Label className="text-sm text-foreground">IP Cerebral (ACM)</Label><Input type="number" step={0.01} value={mcaPi} onChange={(e) => setMcaPi(e.target.value)} placeholder="IP ACM" className="input-glass tabular-nums" /></div>
        </div>
        {error && <div className="flex items-center gap-2 text-destructive text-sm"><AlertCircle className="w-4 h-4" /> {error}</div>}
        <Button onClick={handleCalc} disabled={disabled || calculating} className="bg-accent text-accent-foreground hover:bg-accent/90 glow-accent disabled:opacity-50">
          <ArrowRightLeft className="w-4 h-4 mr-1" /> {calculating ? "Calculando..." : "Avaliar RCP"}
        </Button>
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <ResultCard label="Relação Cérebro-Placentária (RCP)" result={result.res as any} />
            <div className="glass-card-static p-4"><RefBar value={(result.res as any).value} refs={result.refs} label="RCP" /></div>
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
  const [result, setResult] = useState<{ res: DopplerResult; refs: { p5: number; p50: number; p95: number } } | null>(null);

  const handleCalc = async () => {
    const gaVal = parseInt(ga);
    const piVal = parseFloat(pi);
    if (isNaN(gaVal) || gaVal < 20 || gaVal > 42) { setError("IG entre 20 e 42 semanas."); return; }
    if (isNaN(piVal) || piVal <= 0) { setError("Informe o IP do ducto venoso."); return; }
    setCalculating(true);
    setError("");
    try {
      const r = await apiFetch<{ res: DopplerResult; refs: { p5: number; p50: number; p95: number } }>(
        "/calculate/doppler/dv",
        { method: "POST", body: JSON.stringify({ ga: gaVal, pi: piVal, waveA }) },
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

  return (
    <div className="space-y-5">
      <div className="glass-card-static p-5 md:p-6 space-y-5 mesh-indigo">
        <div>
          <h3 className="font-display text-lg text-foreground">Ducto Venoso</h3>
          <p className="text-xs text-muted-foreground mt-1">Avaliação hemodinâmica fetal avançada e função cardíaca.</p>
          <Badge variant="outline" className="mt-2 text-xs border-primary/30 text-primary">Kessler et al., 2006</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label className="text-sm text-foreground">IG (sem)</Label><Input type="number" value={ga} onChange={(e) => setGa(e.target.value)} placeholder="IG" className="input-glass tabular-nums" /></div>
          <div className="space-y-1.5"><Label className="text-sm text-foreground">IP do Ducto Venoso</Label><Input type="number" step={0.01} value={pi} onChange={(e) => setPi(e.target.value)} placeholder="IP DV" className="input-glass tabular-nums" /></div>
          <div className="md:col-span-2 space-y-2">
            <Label className="text-sm text-foreground">Onda A</Label>
            <div className="flex gap-2">
              {[ { v: "positive", l: "Positiva" }, { v: "zero", l: "Ausente" }, { v: "reversed", l: "Reversa" }].map((opt) => (
                <Button key={opt.v} variant={waveA === opt.v ? "default" : "outline"} size="sm" onClick={() => setWaveA(opt.v as any)} className="flex-1">{opt.l}</Button>
              ))}
            </div>
          </div>
        </div>
        {error && <div className="flex items-center gap-2 text-destructive text-sm"><AlertCircle className="w-4 h-4" /> {error}</div>}
        <Button onClick={handleCalc} disabled={disabled || calculating} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-50">
          <Waves className="w-4 h-4 mr-1" /> {calculating ? "Calculando..." : "Avaliar Ducto"}
        </Button>
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <ResultCard label="IP — Ducto Venoso" result={result.res} />
            <div className="glass-card-static p-4"><RefBar value={result.res.value} refs={result.refs} label="IP — Ducto Venoso" /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DopplerCalculator() {
  const { blocked, needsLogin, subscription, refetch } = useTokenGate();
  const disabled = blocked || needsLogin;

  return (
    <div className="min-h-screen pb-20 mesh-gradient">
      <PageMeta title="Calculadora de Doppler Fetal | Idália" description="Avaliação de Doppler da Artéria Umbilical, Cerebral Média, Uterinas, Ducto Venoso e RCP com percentis." />
      <div className="container max-w-2xl mx-auto px-4 pt-8 md:pt-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary glow-primary"><Activity className="w-6 h-6" /></div>
          <div><h1 className="text-2xl font-display text-foreground leading-none">Doppler Fetal</h1><p className="text-sm text-muted-foreground mt-1">Avaliação hemodinâmica fetal e placentária</p></div>
        </div>

        <TokenGateAlert />

        <Tabs defaultValue="ua" className="space-y-6">
          <div className="overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
            <TabsList className="bg-muted/50 p-1 h-11 w-max min-w-full">
              <TabsTrigger value="ua" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">Umbilical</TabsTrigger>
              <TabsTrigger value="mca" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">ACM</TabsTrigger>
              <TabsTrigger value="uta" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">Uterinas</TabsTrigger>
              <TabsTrigger value="cpr" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">RCP</TabsTrigger>
              <TabsTrigger value="dv" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4">Ducto Venoso</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ua" className="focus-visible:outline-none"><UmbilicalArteryTab disabled={disabled} onSuccess={() => void refetch()} /></TabsContent>
          <TabsContent value="mca" className="focus-visible:outline-none"><MCATab disabled={disabled} onSuccess={() => void refetch()} /></TabsContent>
          <TabsContent value="uta" className="focus-visible:outline-none"><UterineArteryTab disabled={disabled} onSuccess={() => void refetch()} /></TabsContent>
          <TabsContent value="cpr" className="focus-visible:outline-none"><CPRTab disabled={disabled} onSuccess={() => void refetch()} /></TabsContent>
          <TabsContent value="dv" className="focus-visible:outline-none"><DVTab disabled={disabled} onSuccess={() => void refetch()} /></TabsContent>
        </Tabs>
      </div>
      <ScientificFooter />
    </div>
  );
}
