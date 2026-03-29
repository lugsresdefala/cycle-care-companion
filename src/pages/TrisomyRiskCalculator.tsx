import { useState } from "react";
import { useTokenGate } from "@/hooks/useTokenGate";
import { useExamSave } from "@/hooks/useExamSave";
import { PatientSelector } from "@/components/PatientSelector";
import { TokenGateAlert } from "@/components/TokenGateAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Info, AlertCircle, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";
import { calculateTrisomyRisk, TrisomyInput, TrisomyResult } from "@/lib/risk-calculators";
import { motion, AnimatePresence } from "framer-motion";
import ScientificFooter from "@/components/ScientificFooter";

const TrisomyRiskCalculator = () => {
  const { blocked, needsLogin, consuming, subscription, consumeToken } = useTokenGate("trisomy_risk");
  const { saveExam, canSave } = useExamSave();
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();

  // Required inputs
  const [maternalAge, setMaternalAge] = useState("");
  const [crl, setCrl] = useState("");
  const [nt, setNt] = useState("");

  // Optional biochemistry
  const [showBiochem, setShowBiochem] = useState(false);
  const [pappaMoM, setPappaMoM] = useState("");
  const [bhcgMoM, setBhcgMoM] = useState("");

  // Optional additional markers
  const [showAdditional, setShowAdditional] = useState(false);
  const [nasalBone, setNasalBone] = useState<"present" | "absent" | "none">("none");
  const [ductusPIAbnormal, setDuctusPIAbnormal] = useState(false);
  const [useDuctus, setUseDuctus] = useState(false);
  const [tricuspidRegurg, setTricuspidRegurg] = useState(false);
  const [useTricuspid, setUseTricuspid] = useState(false);

  const [error, setError] = useState("");
  const [results, setResults] = useState<TrisomyResult | null>(null);

  const handleCalculate = async () => {
    const ageVal = parseFloat(maternalAge);
    const crlVal = parseFloat(crl);
    const ntVal = parseFloat(nt);

    if (isNaN(ageVal) || isNaN(crlVal) || isNaN(ntVal)) {
      setError("Preencha idade materna, CCN e TN para o cálculo.");
      return;
    }
    if (ageVal < 15 || ageVal > 55) {
      setError("Idade materna deve estar entre 15 e 55 anos.");
      return;
    }
    if (crlVal < 45 || crlVal > 84) {
      setError("CCN deve estar entre 45 e 84 mm (11–13⁺⁶ semanas).");
      return;
    }
    if (ntVal < 0.5 || ntVal > 10) {
      setError("TN deve estar entre 0,5 e 10 mm.");
      return;
    }

    const ok = await consumeToken();
    if (!ok) return;
    setError("");

    const input: TrisomyInput = {
      maternalAge: ageVal,
      crl: crlVal,
      nt: ntVal,
      pappaMoM: showBiochem && pappaMoM ? parseFloat(pappaMoM) : null,
      bhcgMoM: showBiochem && bhcgMoM ? parseFloat(bhcgMoM) : null,
      nasalBone: showAdditional && nasalBone !== "none" ? nasalBone : null,
      ductusPIAbnormal: showAdditional && useDuctus ? ductusPIAbnormal : null,
      tricuspidRegurg: showAdditional && useTricuspid ? tricuspidRegurg : null,
    };

    const result = calculateTrisomyRisk(input);
    setResults(result);

    if (canSave) {
      saveExam({
        calcType: "trisomy_risk",
        inputData: input as unknown as Record<string, unknown>,
        resultData: result as unknown as Record<string, unknown>,
        patientId: selectedPatientId,
      });
    }
  };

  const formatRisk = (risk: number) => `1 : ${risk.toLocaleString("pt-BR")}`;

  const riskColor = (risk: number, cutoff: number) =>
    risk <= cutoff ? "text-destructive" : risk <= 1000 ? "text-yellow-600 dark:text-yellow-400" : "text-emerald-600 dark:text-emerald-400";

  const riskBg = (risk: number, cutoff: number) =>
    risk <= cutoff ? "border-destructive/30 bg-destructive/5" : risk <= 1000 ? "border-yellow-500/30 bg-yellow-500/5" : "border-emerald-500/30 bg-emerald-500/5";

  return (
    <div className="space-y-6">
      <TokenGateAlert needsLogin={needsLogin} blocked={blocked} tokensRemaining={subscription?.tokens_remaining} />
      <PatientSelector value={selectedPatientId} onChange={setSelectedPatientId} />

      {/* ── Input Form ── */}
      <div className="glass-card-static p-6 md:p-8 space-y-6 mesh-coral">
        <div>
          <h2 className="font-display text-xl text-foreground">Risco de Trissomias — 1º Trimestre</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Cálculo de risco para T21, T18 e T13 baseado no rastreamento combinado do primeiro trimestre.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">FMF, 2004–2023</Badge>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">11–13⁺⁶ semanas</Badge>
          </div>
        </div>

        {/* Required fields */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Idade (anos)", desc: "Idade materna na DPP", value: maternalAge, set: setMaternalAge, range: "15–55", step: "1" },
            { label: "CCN (mm)", desc: "Comprimento cabeça-nádega", value: crl, set: setCrl, range: "45–84", step: "0.1" },
            { label: "TN (mm)", desc: "Translucência nucal", value: nt, set: setNt, range: "0,5–10", step: "0.1" },
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
                step={f.step}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.label.split(" ")[0]}
                className="input-glass tabular-nums"
              />
            </div>
          ))}
        </div>

        {/* Optional: Biochemistry */}
        <button
          onClick={() => setShowBiochem(!showBiochem)}
          className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors"
        >
          <span className="text-sm font-medium text-foreground">Bioquímica Sérica (opcional)</span>
          {showBiochem ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {showBiochem && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm text-foreground">PAPP-A (MoM)</Label>
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>Proteína plasmática A associada à gravidez — valor em MoM corrigido</TooltipContent>
                </Tooltip>
              </div>
              <Input type="number" step={0.01} value={pappaMoM} onChange={(e) => setPappaMoM(e.target.value)} placeholder="Ex: 1.0" className="input-glass tabular-nums" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm text-foreground">β-hCG livre (MoM)</Label>
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>Fração livre do β-hCG — valor em MoM corrigido</TooltipContent>
                </Tooltip>
              </div>
              <Input type="number" step={0.01} value={bhcgMoM} onChange={(e) => setBhcgMoM(e.target.value)} placeholder="Ex: 1.0" className="input-glass tabular-nums" />
            </div>
          </motion.div>
        )}

        {/* Optional: Additional USG Markers */}
        <button
          onClick={() => setShowAdditional(!showAdditional)}
          className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors"
        >
          <span className="text-sm font-medium text-foreground">Marcadores USG Adicionais (opcional)</span>
          {showAdditional ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {showAdditional && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4"
          >
            {/* Nasal Bone */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm text-foreground">Osso Nasal</Label>
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>Presença ou ausência do osso nasal fetal</TooltipContent>
                </Tooltip>
              </div>
              <Select value={nasalBone} onValueChange={(v) => setNasalBone(v as "present" | "absent" | "none")}>
                <SelectTrigger className="input-glass">
                  <SelectValue placeholder="Não avaliado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não avaliado</SelectItem>
                  <SelectItem value="present">Presente</SelectItem>
                  <SelectItem value="absent">Ausente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ductus Venosus */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-sm text-foreground">Ducto Venoso</Label>
                <p className="text-xs text-muted-foreground">IP anormal (onda A reversa ou ausente)</p>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={useDuctus} onCheckedChange={setUseDuctus} />
                {useDuctus && (
                  <Select value={ductusPIAbnormal ? "abnormal" : "normal"} onValueChange={(v) => setDuctusPIAbnormal(v === "abnormal")}>
                    <SelectTrigger className="input-glass w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="abnormal">Anormal</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Tricuspid Regurgitation */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-sm text-foreground">Regurgitação Tricúspide</Label>
                <p className="text-xs text-muted-foreground">Presença de insuficiência tricúspide</p>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={useTricuspid} onCheckedChange={setUseTricuspid} />
                {useTricuspid && (
                  <Select value={tricuspidRegurg ? "present" : "absent"} onValueChange={(v) => setTricuspidRegurg(v === "present")}>
                    <SelectTrigger className="input-glass w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="absent">Ausente</SelectItem>
                      <SelectItem value="present">Presente</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <Button onClick={handleCalculate} disabled={blocked || needsLogin || consuming} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-50">
          <ShieldAlert className="w-4 h-4 mr-1" /> Calcular Risco
        </Button>
      </div>

      {/* ── Results ── */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* Risk Category Banner */}
            <div className={`glass-card-static p-5 ${
              results.riskCategory === "alto" ? "border-destructive/40 bg-destructive/5" :
              results.riskCategory === "intermediário" ? "border-yellow-500/40 bg-yellow-500/5" :
              "border-emerald-500/40 bg-emerald-500/5"
            }`}>
              <div className="flex items-center gap-3">
                <ShieldAlert className={`w-6 h-6 ${
                  results.riskCategory === "alto" ? "text-destructive" :
                  results.riskCategory === "intermediário" ? "text-yellow-600 dark:text-yellow-400" :
                  "text-emerald-600 dark:text-emerald-400"
                }`} />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Risco {results.riskCategory.toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{results.method}</p>
                </div>
              </div>
            </div>

            {/* Individual Trisomy Risks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Trissomia 21", subtitle: "Síndrome de Down", bg: results.backgroundRiskT21, adj: results.adjustedRiskT21, cutoff: 100, positive: results.screenPositiveT21 },
                { label: "Trissomia 18", subtitle: "Síndrome de Edwards", bg: results.backgroundRiskT18, adj: results.adjustedRiskT18, cutoff: 150, positive: results.screenPositiveT18T13 },
                { label: "Trissomia 13", subtitle: "Síndrome de Patau", bg: results.backgroundRiskT13, adj: results.adjustedRiskT13, cutoff: 150, positive: results.screenPositiveT18T13 },
              ].map((t) => (
                <div key={t.label} className={`glass-card-static p-5 space-y-3 ${riskBg(t.adj, t.cutoff)}`}>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.subtitle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Risco basal (idade)</p>
                    <p className="tabular-nums text-sm text-foreground">{formatRisk(t.bg)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Risco ajustado</p>
                    <p className={`tabular-nums text-2xl font-display ${riskColor(t.adj, t.cutoff)}`}>
                      {formatRisk(t.adj)}
                    </p>
                  </div>
                  {t.positive && (
                    <Badge variant="destructive" className="text-xs">
                      Rastreamento positivo (corte 1:{t.cutoff})
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {/* NT MoM */}
            <div className="glass-card-static p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">TN MoM</p>
                  <p className="text-xs text-muted-foreground">Múltiplo da mediana para o CCN informado</p>
                </div>
                <span className={`tabular-nums text-xl font-display ${
                  results.ntMoM > 2.0 ? "text-destructive" : results.ntMoM > 1.5 ? "text-yellow-600 dark:text-yellow-400" : "text-foreground"
                }`}>
                  {results.ntMoM.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Recommendations */}
            {results.riskCategory !== "baixo" && (
              <div className="glass-card-static p-5 border-primary/20 space-y-2">
                <p className="text-sm font-medium text-foreground">Conduta sugerida</p>
                {results.screenPositiveT21 && (
                  <p className="text-xs text-muted-foreground">
                    T21 ≥ 1:100 — Oferecer teste diagnóstico invasivo (BVC ou amniocentese) ou DNA fetal livre (cfDNA/NIPT).
                  </p>
                )}
                {results.adjustedRiskT21 > 100 && results.adjustedRiskT21 <= 1000 && (
                  <p className="text-xs text-muted-foreground">
                    T21 entre 1:101 e 1:1000 — Considerar DNA fetal livre (cfDNA/NIPT) como rastreamento contingente.
                  </p>
                )}
                {results.screenPositiveT18T13 && (
                  <p className="text-xs text-muted-foreground">
                    T18/T13 ≥ 1:150 — Oferecer teste diagnóstico invasivo. Avaliar morfologia fetal detalhada.
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ScientificFooter
        references={[
          {
            authors: "Nicolaides KH",
            title: "Screening for fetal aneuploidies at 11 to 13 weeks",
            journal: "Prenat Diagn",
            year: 2011,
            doi: "10.1002/pd.2637",
            pubmedId: "21210481",
          },
          {
            authors: "Kagan KO, Wright D, Baker A, Sahota D, Nicolaides KH",
            title: "Screening for trisomy 21 by maternal age, fetal nuchal translucency thickness, free beta-hCG and PAPP-A",
            journal: "Ultrasound Obstet Gynecol",
            year: 2008,
            doi: "10.1002/uog.5331",
            pubmedId: "18634131",
          },
          {
            authors: "Cicero S, Avgidou K, Rembouskos G, Kagan KO, Nicolaides KH",
            title: "Nasal bone in first-trimester screening for trisomy 21",
            journal: "Am J Obstet Gynecol",
            year: 2006,
            doi: "10.1016/j.ajog.2005.08.005",
            pubmedId: "16389035",
          },
          {
            authors: "Maiz N, Valencia C, Kagan KO, Wright D, Nicolaides KH",
            title: "Ductus venosus Doppler in screening for trisomies 21, 18 and 13 and Turner syndrome at 11–13 weeks",
            journal: "Ultrasound Obstet Gynecol",
            year: 2009,
            doi: "10.1002/uog.6264",
            pubmedId: "19253340",
          },
        ]}
        units={[
          { param: "CCN", unit: "mm", description: "Comprimento cabeça-nádega (45–84 mm = 11–13⁺⁶ sem)" },
          { param: "TN", unit: "mm", description: "Translucência nucal (medida máxima)" },
          { param: "PAPP-A / β-hCG", unit: "MoM", description: "Múltiplos da mediana corrigidos" },
          { param: "Risco", unit: "1:N", description: "1 em N gestações afetadas" },
        ]}
        extraDisclaimer="Este cálculo é uma aproximação simplificada do modelo FMF. Para rastreamento clínico oficial, utilize software certificado (Astraia, ViewPoint) com auditoria de qualidade. Os pontos de corte de 1:100 (T21) e 1:150 (T18/T13) seguem recomendações da Fetal Medicine Foundation."
      />
    </div>
  );
};

export default TrisomyRiskCalculator;
