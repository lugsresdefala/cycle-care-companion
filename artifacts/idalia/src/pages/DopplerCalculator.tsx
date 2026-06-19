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
import { apiFetch, ApiError } from "@/lib/api";
import { formatIndex } from "@/lib/units";

type DopplerResult = {
  value: number;
  percentile: string;
  interpretation: string;
  severity: "normal" | "warning" | "critical";
  refs?: { p5: number; p50: number; p95: number };
};
type CPRResult = {
  cpr: number;
  mcaPI: number;
  uaPI: number;
  percentile: string;
  interpretation: string;
  severity: "normal" | "warning" | "critical";
  refs?: { p5: number; p50: number; p95: number };
};
import { motion, AnimatePresence } from "framer-motion";
import ScientificFooter from "@/components/ScientificFooter";

interface DopplerRefs { p5: number; p50: number; p95: number; }

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

function RefBar({ value, refs, label }: { value: number; refs: DopplerRefs; label: string }) {
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

// ── Umbilical Artery Tab ──
interface TabProps { parentDisabled: boolean; refetch: () => void; }

function UmbilicalArteryTab({ parentDisabled, refetch }: TabProps) {
  const [pi, setPi] = useState("");
  const [ri, setRi] = useState("");
  const [sd, setSd] = useState("");
  const [ga, setGa] = useState("");
  const [error, setError] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState<{
    piResult?: DopplerResult;
    riResult?: DopplerResult;
    sdResult?: DopplerResult;
  } | null>(null);

  const handleCalc = async () => {
    const gaVal = parseInt(ga);
    if (isNaN(gaVal) || gaVal < 20 || gaVal > 42) {
      setError("Informe a IG entre 20 e 42 semanas.");
      return;
    }
    const piVal = pi ? parseFloat(pi) : NaN;
    const riVal = ri ? parseFloat(ri) : NaN;
    const sdVal = sd ? parseFloat(sd) : NaN;

    if (isNaN(piVal) && isNaN(riVal) && isNaN(sdVal)) {
      setError("Informe ao menos um índice: IP, IR ou S/D.");
      return;
    }
    setError("");
    setCalculating(true);
    try {
      const res = await apiFetch<{ piResult?: DopplerResult; riResult?: DopplerResult; sdResult?: DopplerResult }>(
        "/calculate/doppler/umbilical",
        {
          method: "POST",
          body: JSON.stringify({
            ga: gaVal,
            pi: isNaN(piVal) ? undefined : piVal,
            ri: isNaN(riVal) ? undefined : riVal,
            sd: isNaN(sdVal) ? undefined : sdVal,
          }),
        },
      );
      setResults(res);
      refetch();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) setError("Tokens esgotados. Assine um plano para continuar.");
      else if (err instanceof ApiError && err.status === 401) setError("Faça login para usar esta calculadora.");
      else setError((err as any)?.message || "Erro no cálculo.");
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

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <Button onClick={handleCalc} disabled={parentDisabled || calculating} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-50">
          <Activity className="w-4 h-4 mr-1" /> Avaliar
        </Button>
      </div>
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            {results.piResult && (
              <>
                <ResultCard label="Índice de Pulsatilidade (IP)" result={results.piResult} />
                {results.piResult.refs && (
                  <div className="glass-card-static p-4">
                    <RefBar value={results.piResult.value} refs={results.piResult.refs} label="IP — Artéria Umbilical" />
                  </div>
                )}
              </>
            )}
            {results.riResult && <ResultCard label="Índice de Resistência (IR)" result={results.riResult} />}
            {results.sdResult && <ResultCard label="Relação S/D" result={results.sdResult} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── MCA Tab ──
function MCATab({ parentDisabled, refetch }: TabProps) {
  const [pi, setPi] = useState("");
  const [ga, setGa] = useState("");
  const [error, setError] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<DopplerResult | null>(null);

  const handleCalc = async () => {
    const gaVal = parseInt(ga);
    const piVal = parseFloat(pi);
    if (isNaN(gaVal) || gaVal < 20 || gaVal > 42) {
      setError("IG entre 20 e 42 semanas.");
      return;
    }
    if (isNaN(piVal) || piVal <= 0) {
      setError("Informe o IP da ACM.");
      return;
    }
    setError("");
    setCalculating(true);
    try {
      const res = await apiFetch<DopplerResult>("/calculate/doppler/mca", {
        method: "POST",
        body: JSON.stringify({ ga: gaVal, pi: piVal }),
      });
      setResult(res);
      refetch();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) setError("Tokens esgotados. Assine um plano para continuar.");
      else if (err instanceof ApiError && err.status === 401) setError("Faça login para usar esta calculadora.");
      else setError((err as any)?.message || "Erro no cálculo.");
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
          {[{ label: "IG (sem)", value: ga, set: setGa }, { label: "IP da ACM", value: pi, set: setPi }].map((f) => (
            <div key={f.label} className="space-y-1.5">
              <Label className="text-sm text-foreground">{f.label}</Label>
              <Input type="number" step={0.01} value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.label} className="input-glass tabular-nums" />
            </div>
          ))}
        </div>
        {error && <div className="flex items-center gap-2 text-destructive text-sm"><AlertCircle className="w-4 h-4" /> {error}</div>}

        <Button onClick={handleCalc} disabled={parentDisabled || calculating} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 glow-secondary disabled:opacity-50">
          <Brain className="w-4 h-4 mr-1" /> Avaliar ACM
        </Button>
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <ResultCard label="IP — Artéria Cerebral Média" result={result} />
            {result.refs && (
              <div className="glass-card-static p-4">
                <RefBar value={result.value} refs={result.refs} label="IP — ACM" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Uterine Artery Tab ──
function UterineArteryTab({ parentDisabled, refetch }: TabProps) {
  const [pi, setPi] = useState("");
  const [ga, setGa] = useState("");
  const [notch, setNotch] = useState(false);
  const [error, setError] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<DopplerResult | null>(null);

  const handleCalc = async () => {
    const gaVal = parseInt(ga);
    const piVal = parseFloat(pi);
    if (isNaN(gaVal) || gaVal < 11 || gaVal > 42) {
      setError("IG entre 11 e 42 semanas.");
      return;
    }
    if (isNaN(piVal) || piVal <= 0) {
      setError("Informe o IP da artéria uterina.");
      return;
    }
    setError("");
    setCalculating(true);
    try {
      const res = await apiFetch<DopplerResult>("/calculate/doppler/uterine", {
        method: "POST",
        body: JSON.stringify({ ga: gaVal, pi: piVal, bilateralNotch: notch }),
      });
      setResult(res);
      refetch();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) setError("Tokens esgotados. Assine um plano para continuar.");
      else if (err instanceof ApiError && err.status === 401) setError("Faça login para usar esta calculadora.");
      else setError((err as any)?.message || "Erro no cálculo.");
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
          <div className="space-y-1.5"><Label className="text-sm text-foreground">IG (sem)</Label><Input type="number" value={ga} onChange={(e) => setGa(e.target.value)} placeholder="IG" className="input-glass tabular-nums" /></div>
          <div className="space-y-1.5"><Label className="text-sm text-foreground">IP médio</Label><Input type="number" step={0.01} value={pi} onChange={(e) => setPi(e.target.value)} placeholder="IP" className="input-glass tabular-nums" /></div>
        </div>
        <div className="flex items-center gap-3"><Switch checked={notch} onCheckedChange={setNotch} /><Label className="text-sm text-foreground">Incisura protodiastólica bilateral</Label></div>
        {error && <div className="flex items-center gap-2 text-destructive text-sm"><AlertCircle className="w-4 h-4" /> {error}</div>}

        <Button onClick={handleCalc} disabled={parentDisabled || calculating} className="bg-accent text-accent-foreground hover:bg-accent/90 glow-accent disabled:opacity-50">
          <Heart className="w-4 h-4 mr-1" /> Avaliar Uterina
        </Button>
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <ResultCard label="IP — Artéria Uterina" result={result} />
            {result.refs && (
              <div className="glass-card-static p-4">
                <RefBar value={result.value} refs={result.refs} label="IP — Art. Uterina" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── CPR Tab ──
function CPRTab({ parentDisabled, refetch }: TabProps) {
  const [mcaPi, setMcaPi] = useState("");
  const [uaPi, setUaPi] = useState("");
  const [ga, setGa] = useState("");
  const [error, setError] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<CPRResult | null>(null);

  const handleCalc = async () => {
    const gaVal = parseInt(ga);
    const mcaVal = parseFloat(mcaPi);
    const uaVal = parseFloat(uaPi);
    if (isNaN(gaVal) || gaVal < 20 || gaVal > 42) {
      setError("IG entre 20 e 42 semanas.");
      return;
    }
    if (isNaN(mcaVal) || mcaVal <= 0) {
      setError("Informe o IP da ACM.");
      return;
    }
    if (isNaN(uaVal) || uaVal <= 0) {
      setError("Informe o IP da AU.");
      return;
    }
    setError("");
    setCalculating(true);
    try {
      const res = await apiFetch<CPRResult>("/calculate/doppler/cpr", {
        method: "POST",
        body: JSON.stringify({ ga: gaVal, mcaPI: mcaVal, uaPI: uaVal }),
      });
      setResult(res);
      refetch();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) setError("Tokens esgotados. Assine um plano para continuar.");
      else if (err instanceof ApiError && err.status === 401) setError("Faça login para usar esta calculadora.");
      else setError((err as any)?.message || "Erro no cálculo.");
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="glass-card-static p-5 md:p-6 space-y-5 mesh-warm">
        <div>
          <h3 className="font-display text-lg text-foreground">Razão Cerebroplacentária (RCP)</h3>
          <p className="text-xs text-muted-foreground mt-1">RCP = IP ACM / IP AU — indicador de redistribuição hemodinâmica fetal.</p>
          <Badge variant="outline" className="mt-2 text-xs border-primary/30 text-primary">Baschat & Gembruch, 2003</Badge>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5"><Label className="text-sm text-foreground">IG (sem)</Label><Input type="number" value={ga} onChange={(e) => setGa(e.target.value)} placeholder="IG" className="input-glass tabular-nums" /></div>
          <div className="space-y-1.5"><Label className="text-sm text-foreground">IP ACM</Label><Input type="number" step={0.01} value={mcaPi} onChange={(e) => setMcaPi(e.target.value)} placeholder="ACM" className="input-glass tabular-nums" /></div>
          <div className="space-y-1.5"><Label className="text-sm text-foreground">IP AU</Label><Input type="number" step={0.01} value={uaPi} onChange={(e) => setUaPi(e.target.value)} placeholder="AU" className="input-glass tabular-nums" /></div>
        </div>
        {error && <div className="flex items-center gap-2 text-destructive text-sm"><AlertCircle className="w-4 h-4" /> {error}</div>}
        <Button onClick={handleCalc} disabled={parentDisabled || calculating} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-50">
          <ArrowRightLeft className="w-4 h-4 mr-1" /> Calcular RCP
        </Button>
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className={`glass-card-static p-5 space-y-3 ${SEVERITY_STYLES[result.severity]}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Razão Cerebroplacentária</span>
                <Badge variant="outline" className={`text-[10px] ${SEVERITY_ICON_COLOR[result.severity]} border-current/30`}>
                  {SEVERITY_LABELS[result.severity]}
                </Badge>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="tabular-nums text-3xl font-display text-foreground">{result.cpr}</span>
                <span className="text-xs text-muted-foreground">{result.percentile}</span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>IP ACM: <strong className="text-foreground">{result.mcaPI}</strong></span>
                <span>IP AU: <strong className="text-foreground">{result.uaPI}</strong></span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{result.interpretation}</p>
            </div>
            {result.refs && (
              <div className="glass-card-static p-4">
                <RefBar value={result.cpr} refs={result.refs} label="RCP (ACM/AU)" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Ductus Venosus Tab ──
function DuctusVenosusTab({ parentDisabled, refetch }: TabProps) {
  const [piv, setPiv] = useState("");
  const [ga, setGa] = useState("");
  const [waveAReversed, setWaveAReversed] = useState(false);
  const [error, setError] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<{
    pivResult?: DopplerResult;
    waveAResult: DopplerResult;
  } | null>(null);

  const handleCalc = async () => {
    const gaVal = parseInt(ga);
    if (isNaN(gaVal) || gaVal < 11 || gaVal > 42) {
      setError("Informe a IG entre 11 e 42 semanas.");
      return;
    }
    const pivVal = piv ? parseFloat(piv) : NaN;
    setError("");
    setCalculating(true);
    try {
      const res = await apiFetch<{ pivResult?: DopplerResult; waveAResult: DopplerResult }>(
        "/calculate/doppler/ductus",
        {
          method: "POST",
          body: JSON.stringify({ ga: gaVal, piv: isNaN(pivVal) ? undefined : pivVal, waveAReversed }),
        },
      );
      setResult(res);
      refetch();
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) setError("Tokens esgotados. Assine um plano para continuar.");
      else if (err instanceof ApiError && err.status === 401) setError("Faça login para usar esta calculadora.");
      else setError((err as any)?.message || "Erro no cálculo.");
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="glass-card-static p-5 md:p-6 space-y-5 mesh-navy">
        <div>
          <h3 className="font-display text-lg text-foreground">Ducto Venoso (DV)</h3>
          <p className="text-xs text-muted-foreground mt-1">Avaliação do fluxo venoso fetal — marcador de função cardíaca e descompensação hemodinâmica.</p>
          <Badge variant="outline" className="mt-2 text-xs border-primary/30 text-primary">Kessler et al., 2006 / DeVore, 2021</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5"><Label className="text-sm text-foreground">IG (sem)</Label><Tooltip><TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger><TooltipContent>Idade gestacional (11–42)</TooltipContent></Tooltip></div>
            <Input type="number" value={ga} onChange={(e) => setGa(e.target.value)} placeholder="IG" className="input-glass tabular-nums" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5"><Label className="text-sm text-foreground">PIV</Label><Tooltip><TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger><TooltipContent>Pulsatility Index for Veins (opcional se ≥ 20 sem)</TooltipContent></Tooltip></div>
            <Input type="number" step={0.01} value={piv} onChange={(e) => setPiv(e.target.value)} placeholder="PIV" className="input-glass tabular-nums" />
          </div>
        </div>
        <div className="flex items-center gap-3"><Switch checked={waveAReversed} onCheckedChange={setWaveAReversed} /><Label className="text-sm text-foreground">Onda &apos;a&apos; reversa</Label></div>
        {error && <div className="flex items-center gap-2 text-destructive text-sm"><AlertCircle className="w-4 h-4" /> {error}</div>}

        <Button onClick={handleCalc} disabled={parentDisabled || calculating} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-50">
          <Waves className="w-4 h-4 mr-1" /> Avaliar DV
        </Button>
      </div>
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <ResultCard label="Onda 'a' — Ducto Venoso" result={result.waveAResult} />
            {result.pivResult && (
              <>
                <ResultCard label="PIV — Ducto Venoso" result={result.pivResult} />
                {result.pivResult.refs && (
                  <div className="glass-card-static p-4">
                    <RefBar value={result.pivResult.value} refs={result.pivResult.refs} label="PIV — Ducto Venoso" />
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const DopplerCalculator = () => {
  const { blocked, needsLogin, subscription, refetch } = useTokenGate();
  const disabled = blocked || needsLogin;

  return (
    <div className="space-y-6">
      <PageMeta
        title="Calculadora de Dopplervelocimetria Fetal"
        description="Avalie os índices de Doppler da artéria umbilical, ACM, artéria uterina, razão cerebroplacentária e ducto venoso — IDALIA Calc."
        path="/doppler"
      />
      <TokenGateAlert needsLogin={needsLogin} blocked={blocked} tokensRemaining={subscription?.tokens_remaining} />

      <Tabs defaultValue="umbilical" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-2">
          <TabsTrigger value="umbilical" className="text-[10px] sm:text-xs"><Activity className="w-3 h-3 mr-1 hidden sm:inline-block" />AU</TabsTrigger>
          <TabsTrigger value="mca" className="text-[10px] sm:text-xs"><Brain className="w-3 h-3 mr-1 hidden sm:inline-block" />ACM</TabsTrigger>
          <TabsTrigger value="uterine" className="text-[10px] sm:text-xs"><Heart className="w-3 h-3 mr-1 hidden sm:inline-block" />Uterina</TabsTrigger>
          <TabsTrigger value="cpr" className="text-[10px] sm:text-xs"><ArrowRightLeft className="w-3 h-3 mr-1 hidden sm:inline-block" />RCP</TabsTrigger>
          <TabsTrigger value="ductus" className="text-[10px] sm:text-xs"><Waves className="w-3 h-3 mr-1 hidden sm:inline-block" />DV</TabsTrigger>
        </TabsList>

        <TabsContent value="umbilical"><UmbilicalArteryTab parentDisabled={disabled} refetch={refetch} /></TabsContent>
        <TabsContent value="mca"><MCATab parentDisabled={disabled} refetch={refetch} /></TabsContent>
        <TabsContent value="uterine"><UterineArteryTab parentDisabled={disabled} refetch={refetch} /></TabsContent>
        <TabsContent value="cpr"><CPRTab parentDisabled={disabled} refetch={refetch} /></TabsContent>
        <TabsContent value="ductus"><DuctusVenosusTab parentDisabled={disabled} refetch={refetch} /></TabsContent>
      </Tabs>

      <ScientificFooter
        references={[
          { authors: "Acharya G, Wilsgaard T, Berntsen GKR, Maltau JM, Kiserud T", title: "Reference ranges for serial measurements of umbilical artery Doppler indices in the second half of pregnancy", journal: "Am J Obstet Gynecol", year: 2005, doi: "10.1016/j.ajog.2004.11.067", pubmedId: "15902139" },
          { authors: "Ebbing C, Rasmussen S, Kiserud T", title: "Middle cerebral artery blood flow velocities and pulsatility index and the ductus venosus blood flow velocity in the second half of pregnancy", journal: "Acta Obstet Gynecol Scand", year: 2007, doi: "10.1080/00016340701323998", pubmedId: "17609866" },
          { authors: "Gómez O, Figueras F, Fernández S, et al.", title: "Reference ranges for uterine artery mean pulsatility index at 11-41 weeks of gestation", journal: "Ultrasound Obstet Gynecol", year: 2008, doi: "10.1002/uog.5315", pubmedId: "18481871" },
          { authors: "Baschat AA, Gembruch U", title: "The cerebroplacental Doppler ratio revisited", journal: "Ultrasound Obstet Gynecol", year: 2003, doi: "10.1002/uog.51", pubmedId: "12601836" },
          { authors: "Kessler J, Rasmussen S, Kiserud T", title: "The ductus venosus in the second half of pregnancy: physiological and pathophysiological considerations", journal: "Prenatal Diagnosis", year: 2006, doi: "10.1002/pd.1431", pubmedId: "16688757" },
        ]}
        units={[
          { param: "IP", unit: "adimensional", description: "Índice de pulsatilidade — avalia pulsatilidade do fluxo" },
          { param: "IR", unit: "adimensional", description: "Índice de resistência (0–1)" },
          { param: "S/D", unit: "adimensional", description: "Relação sístole/diástole" },
          { param: "RCP", unit: "adimensional", description: "Razão cerebroplacentária = IP ACM / IP AU" },
          { param: "PIV", unit: "adimensional", description: "Índice de pulsatilidade venosa do ducto venoso" },
        ]}
        extraDisclaimer="Os valores de referência são baseados em estudos populacionais específicos. A interpretação deve considerar o contexto clínico completo e as tendências seriadas."
      />
    </div>
  );
};

export default DopplerCalculator;
