import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Info, Activity, AlertCircle, Heart, Brain, ArrowRightLeft, Waves } from "lucide-react";
import {
  evaluateUmbilicalArteryPI,
  evaluateUmbilicalArteryRI,
  evaluateUmbilicalArterySDRatio,
  evaluateMCAPI,
  evaluateUterineArteryPI,
  calculateCPR,
  evaluateDuctusVenosusPIV,
  evaluateDuctusVenosusWaveA,
  getUAPiRefs,
  getMCAPiRefs,
  getUtAPiRefs,
  getCPRRefs,
  getDVPivRefs,
  type DopplerResult,
  type CPRResult,
} from "@/lib/doppler";
import { motion, AnimatePresence } from "framer-motion";
import ScientificFooter from "@/components/ScientificFooter";

const SEVERITY_STYLES = {
  normal: "border-accent/30 bg-accent/5",
  warning: "border-ovulatory/30 bg-ovulatory/5",
  critical: "border-destructive/30 bg-destructive/5",
};

const SEVERITY_ICON_COLOR = {
  normal: "text-accent",
  warning: "text-ovulatory",
  critical: "text-destructive",
};

const SEVERITY_LABELS = {
  normal: "Normal",
  warning: "Atenção",
  critical: "Alterado",
};

function ResultCard({ label, result }: { label: string; result: DopplerResult }) {
  return (
    <div className={`glass-card-static p-4 space-y-2 ${SEVERITY_STYLES[result.severity]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Badge
          variant="outline"
          className={`text-[10px] ${SEVERITY_ICON_COLOR[result.severity]} border-current/30`}
        >
          {SEVERITY_LABELS[result.severity]}
        </Badge>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="tabular-nums text-2xl font-display text-foreground">
          {result.value.toFixed(2)}
        </span>
        <span className="text-xs text-muted-foreground">{result.percentile}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{result.interpretation}</p>
    </div>
  );
}

function RefBar({
  value,
  refs,
  label,
}: {
  value: number;
  refs: { p5: number; p50: number; p95: number };
  label: string;
}) {
  const min = refs.p5 * 0.7;
  const max = refs.p95 * 1.3;
  const range = max - min;
  const pos = (v: number) => Math.max(0, Math.min(100, ((v - min) / range) * 100));

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">{value.toFixed(2)}</span>
      </div>
      <div className="h-3 bg-muted rounded-full relative overflow-hidden">
        {/* Normal range band */}
        <div
          className="absolute h-full bg-accent/20 rounded-full"
          style={{ left: `${pos(refs.p5)}%`, width: `${pos(refs.p95) - pos(refs.p5)}%` }}
        />
        {/* p50 line */}
        <div
          className="absolute h-full w-px bg-accent/50"
          style={{ left: `${pos(refs.p50)}%` }}
        />
        {/* Value marker */}
        <div
          className="absolute top-0 h-full w-1 rounded-full bg-foreground"
          style={{ left: `${pos(value)}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground/60">
        <span>p5: {refs.p5}</span>
        <span>p50: {refs.p50}</span>
        <span>p95: {refs.p95}</span>
      </div>
    </div>
  );
}

// ── Umbilical Artery Tab ──
function UmbilicalArteryTab() {
  const [pi, setPi] = useState("");
  const [ri, setRi] = useState("");
  const [sd, setSd] = useState("");
  const [ga, setGa] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState<{
    piResult?: DopplerResult;
    riResult?: DopplerResult;
    sdResult?: DopplerResult;
    refs: { p5: number; p50: number; p95: number };
  } | null>(null);

  const handleCalc = () => {
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
    setResults({
      piResult: !isNaN(piVal) ? evaluateUmbilicalArteryPI(piVal, gaVal) : undefined,
      riResult: !isNaN(riVal) ? evaluateUmbilicalArteryRI(riVal) : undefined,
      sdResult: !isNaN(sdVal) ? evaluateUmbilicalArterySDRatio(sdVal, gaVal) : undefined,
      refs: getUAPiRefs(gaVal),
    });
  };

  return (
    <div className="space-y-5">
      <div className="glass-card-static p-5 md:p-6 space-y-5 mesh-navy">
        <div>
          <h3 className="font-display text-lg text-foreground">Artéria Umbilical</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Avaliação da resistência placentária pelos índices de pulsatilidade (IP), resistência (IR) e relação S/D.
          </p>
          <Badge variant="outline" className="mt-2 text-xs border-primary/30 text-primary">
            Acharya et al., 2005
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "IG (sem)", value: ga, set: setGa, desc: "Idade gestacional", range: "20–42" },
            { label: "IP", value: pi, set: setPi, desc: "Índice de Pulsatilidade", range: "0.3–2.5" },
            { label: "IR", value: ri, set: setRi, desc: "Índice de Resistência", range: "0.0–1.0" },
            { label: "S/D", value: sd, set: setSd, desc: "Relação Sístole/Diástole", range: "1.0–10.0" },
          ].map((f) => (
            <div key={f.label} className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm text-foreground">{f.label}</Label>
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>{f.desc} ({f.range})</TooltipContent>
                </Tooltip>
              </div>
              <Input
                type="number"
                step={0.01}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.label}
                className="input-glass tabular-nums"
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <Button onClick={handleCalc} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
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
                <div className="glass-card-static p-4">
                  <RefBar value={results.piResult.value} refs={results.refs} label="IP — Artéria Umbilical" />
                </div>
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
function MCATab() {
  const [pi, setPi] = useState("");
  const [ga, setGa] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ res: DopplerResult; refs: { p5: number; p50: number; p95: number } } | null>(null);

  const handleCalc = () => {
    const gaVal = parseInt(ga);
    const piVal = parseFloat(pi);
    if (isNaN(gaVal) || gaVal < 20 || gaVal > 42) { setError("IG entre 20 e 42 semanas."); return; }
    if (isNaN(piVal) || piVal <= 0) { setError("Informe o IP da ACM."); return; }
    setError("");
    setResult({ res: evaluateMCAPI(piVal, gaVal), refs: getMCAPiRefs(gaVal) });
  };

  return (
    <div className="space-y-5">
      <div className="glass-card-static p-5 md:p-6 space-y-5 mesh-purple">
        <div>
          <h3 className="font-display text-lg text-foreground">Artéria Cerebral Média (ACM)</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Avaliação da vasodilatação cerebral compensatória (brain-sparing effect).
          </p>
          <Badge variant="outline" className="mt-2 text-xs border-secondary/30 text-secondary">
            Ebbing et al., 2007
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm text-foreground">IG (sem)</Label>
              <Tooltip>
                <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                <TooltipContent>Idade gestacional (20–42)</TooltipContent>
              </Tooltip>
            </div>
            <Input type="number" value={ga} onChange={(e) => setGa(e.target.value)} placeholder="IG" className="input-glass tabular-nums" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm text-foreground">IP da ACM</Label>
              <Tooltip>
                <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                <TooltipContent>Índice de Pulsatilidade</TooltipContent>
              </Tooltip>
            </div>
            <Input type="number" step={0.01} value={pi} onChange={(e) => setPi(e.target.value)} placeholder="IP" className="input-glass tabular-nums" />
          </div>
        </div>

        {error && <div className="flex items-center gap-2 text-destructive text-sm"><AlertCircle className="w-4 h-4" /> {error}</div>}

        <Button onClick={handleCalc} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 glow-secondary">
          <Brain className="w-4 h-4 mr-1" /> Avaliar ACM
        </Button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <ResultCard label="IP — Artéria Cerebral Média" result={result.res} />
            <div className="glass-card-static p-4">
              <RefBar value={result.res.value} refs={result.refs} label="IP — ACM" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Uterine Artery Tab ──
function UterineArteryTab() {
  const [pi, setPi] = useState("");
  const [ga, setGa] = useState("");
  const [notch, setNotch] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ res: DopplerResult; refs: { p5: number; p50: number; p95: number } } | null>(null);

  const handleCalc = () => {
    const gaVal = parseInt(ga);
    const piVal = parseFloat(pi);
    if (isNaN(gaVal) || gaVal < 11 || gaVal > 42) { setError("IG entre 11 e 42 semanas."); return; }
    if (isNaN(piVal) || piVal <= 0) { setError("Informe o IP da artéria uterina."); return; }
    setError("");
    setResult({ res: evaluateUterineArteryPI(piVal, gaVal, notch), refs: getUtAPiRefs(gaVal) });
  };

  return (
    <div className="space-y-5">
      <div className="glass-card-static p-5 md:p-6 space-y-5 mesh-coral">
        <div>
          <h3 className="font-display text-lg text-foreground">Artéria Uterina</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Avaliação da resistência vascular uterina e rastreio de pré-eclâmpsia.
          </p>
          <Badge variant="outline" className="mt-2 text-xs border-accent/30 text-accent">
            Gómez et al., 2008
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm text-foreground">IG (sem)</Label>
              <Tooltip>
                <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                <TooltipContent>Idade gestacional (11–42)</TooltipContent>
              </Tooltip>
            </div>
            <Input type="number" value={ga} onChange={(e) => setGa(e.target.value)} placeholder="IG" className="input-glass tabular-nums" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm text-foreground">IP médio</Label>
              <Tooltip>
                <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                <TooltipContent>Média dos IPs das artérias uterinas D e E</TooltipContent>
              </Tooltip>
            </div>
            <Input type="number" step={0.01} value={pi} onChange={(e) => setPi(e.target.value)} placeholder="IP" className="input-glass tabular-nums" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={notch} onCheckedChange={setNotch} />
          <Label className="text-sm text-foreground">Incisura protodiastólica bilateral</Label>
        </div>

        {error && <div className="flex items-center gap-2 text-destructive text-sm"><AlertCircle className="w-4 h-4" /> {error}</div>}

        <Button onClick={handleCalc} className="bg-accent text-accent-foreground hover:bg-accent/90 glow-accent">
          <Heart className="w-4 h-4 mr-1" /> Avaliar Uterina
        </Button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <ResultCard label="IP — Artéria Uterina" result={result.res} />
            <div className="glass-card-static p-4">
              <RefBar value={result.res.value} refs={result.refs} label="IP — Art. Uterina" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── CPR Tab ──
function CPRTab() {
  const [mcaPi, setMcaPi] = useState("");
  const [uaPi, setUaPi] = useState("");
  const [ga, setGa] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ res: CPRResult; refs: { p5: number; p50: number; p95: number } } | null>(null);

  const handleCalc = () => {
    const gaVal = parseInt(ga);
    const mcaVal = parseFloat(mcaPi);
    const uaVal = parseFloat(uaPi);
    if (isNaN(gaVal) || gaVal < 20 || gaVal > 42) { setError("IG entre 20 e 42 semanas."); return; }
    if (isNaN(mcaVal) || mcaVal <= 0) { setError("Informe o IP da ACM."); return; }
    if (isNaN(uaVal) || uaVal <= 0) { setError("Informe o IP da AU."); return; }
    setError("");
    const res = calculateCPR(mcaVal, uaVal, gaVal);
    setResult({ res, refs: getCPRRefs(gaVal) });
  };

  return (
    <div className="space-y-5">
      <div className="glass-card-static p-5 md:p-6 space-y-5 mesh-warm">
        <div>
          <h3 className="font-display text-lg text-foreground">Razão Cerebroplacentária (RCP)</h3>
          <p className="text-xs text-muted-foreground mt-1">
            RCP = IP ACM / IP AU — indicador de redistribuição hemodinâmica fetal.
          </p>
          <Badge variant="outline" className="mt-2 text-xs border-primary/30 text-primary">
            Baschat & Gembruch, 2003
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm text-foreground">IG (sem)</Label>
            <Input type="number" value={ga} onChange={(e) => setGa(e.target.value)} placeholder="IG" className="input-glass tabular-nums" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-foreground">IP ACM</Label>
            <Input type="number" step={0.01} value={mcaPi} onChange={(e) => setMcaPi(e.target.value)} placeholder="ACM" className="input-glass tabular-nums" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm text-foreground">IP AU</Label>
            <Input type="number" step={0.01} value={uaPi} onChange={(e) => setUaPi(e.target.value)} placeholder="AU" className="input-glass tabular-nums" />
          </div>
        </div>

        {error && <div className="flex items-center gap-2 text-destructive text-sm"><AlertCircle className="w-4 h-4" /> {error}</div>}

        <Button onClick={handleCalc} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
          <ArrowRightLeft className="w-4 h-4 mr-1" /> Calcular RCP
        </Button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className={`glass-card-static p-5 space-y-3 ${SEVERITY_STYLES[result.res.severity]}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Razão Cerebroplacentária</span>
                <Badge variant="outline" className={`text-[10px] ${SEVERITY_ICON_COLOR[result.res.severity]} border-current/30`}>
                  {SEVERITY_LABELS[result.res.severity]}
                </Badge>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="tabular-nums text-3xl font-display text-foreground">{result.res.cpr}</span>
                <span className="text-xs text-muted-foreground">{result.res.percentile}</span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>IP ACM: <strong className="text-foreground">{result.res.mcaPI}</strong></span>
                <span>IP AU: <strong className="text-foreground">{result.res.uaPI}</strong></span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{result.res.interpretation}</p>
            </div>
            <div className="glass-card-static p-4">
              <RefBar value={result.res.cpr} refs={result.refs} label="RCP (ACM/AU)" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ──
const DopplerCalculator = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Waves className="w-5 h-5 text-primary" />
          <h2 className="font-display text-xl text-foreground">Doppler Obstétrico</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Avaliação dos índices de velocimetria Doppler nas artérias umbilical, cerebral média, uterina e razão cerebroplacentária.
        </p>
      </div>

      <Tabs defaultValue="ua" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="ua" className="text-xs py-2 px-1">
            <Activity className="w-3 h-3 mr-1 hidden sm:inline" />
            AU
          </TabsTrigger>
          <TabsTrigger value="mca" className="text-xs py-2 px-1">
            <Brain className="w-3 h-3 mr-1 hidden sm:inline" />
            ACM
          </TabsTrigger>
          <TabsTrigger value="uta" className="text-xs py-2 px-1">
            <Heart className="w-3 h-3 mr-1 hidden sm:inline" />
            Uterina
          </TabsTrigger>
          <TabsTrigger value="cpr" className="text-xs py-2 px-1">
            <ArrowRightLeft className="w-3 h-3 mr-1 hidden sm:inline" />
            RCP
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ua"><UmbilicalArteryTab /></TabsContent>
        <TabsContent value="mca"><MCATab /></TabsContent>
        <TabsContent value="uta"><UterineArteryTab /></TabsContent>
        <TabsContent value="cpr"><CPRTab /></TabsContent>
      </Tabs>

      <ScientificFooter
        references={[
          {
            authors: "Acharya G, Wilsgaard T, Berntsen GKR, Maltau JM, Kiserud T",
            title: "Reference ranges for serial measurements of umbilical artery Doppler indices in the second half of pregnancy",
            journal: "Am J Obstet Gynecol",
            year: 2005,
            doi: "10.1016/j.ajog.2004.09.024",
            pubmedId: "15846187",
          },
          {
            authors: "Ebbing C, Rasmussen S, Kiserud T",
            title: "Middle cerebral artery blood flow velocities and pulsatility index and the cerebroplacental pulsatility ratio",
            journal: "Ultrasound Obstet Gynecol",
            year: 2007,
            doi: "10.1002/uog.4090",
            pubmedId: "17721916",
          },
          {
            authors: "Gómez O, Figueras F, Fernández S, et al.",
            title: "Reference ranges for uterine artery mean pulsatility index at 11–41 weeks of gestation",
            journal: "Ultrasound Obstet Gynecol",
            year: 2008,
            doi: "10.1002/uog.5315",
            pubmedId: "18307196",
          },
          {
            authors: "Baschat AA, Gembruch U",
            title: "The cerebroplacental Doppler ratio revisited",
            journal: "Ultrasound Obstet Gynecol",
            year: 2003,
            doi: "10.1002/uog.108",
            pubmedId: "12858311",
          },
        ]}
        units={[
          { param: "IP (PI)", unit: "adimensional", description: "Índice de Pulsatilidade — (S-D)/Média" },
          { param: "IR (RI)", unit: "adimensional", description: "Índice de Resistência — (S-D)/S" },
          { param: "S/D", unit: "razão", description: "Relação entre pico sistólico e diastólico" },
          { param: "RCP (CPR)", unit: "razão", description: "IP ACM / IP AU" },
          { param: "IG", unit: "semanas", description: "Semanas completas de gestação" },
        ]}
        extraDisclaimer="Os valores de referência são aproximações baseadas nas publicações citadas. Para avaliação precisa, consulte as tabelas originais e correlacione com o contexto clínico."
      />
    </div>
  );
};

export default DopplerCalculator;
