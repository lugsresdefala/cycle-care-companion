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
import { Switch } from "@/components/ui/switch";
import { Info, AlertCircle, HeartPulse, ChevronDown, ChevronUp, Pill, Stethoscope } from "lucide-react";
import { calculatePreeclampsiaRisk, PreeclampsiaInput, PreeclampsiaResult } from "@/lib/risk-calculators";
import { motion, AnimatePresence } from "framer-motion";
import ScientificFooter from "@/components/ScientificFooter";

const PreeclampsiaRiskCalculator = () => {
  const { blocked, needsLogin, consuming, loading, subscription, consumeToken } = useTokenGate("preeclampsia_risk");
  const { saveExam, canSave } = useExamSave();
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>();

  // Maternal characteristics
  const [maternalAge, setMaternalAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [ethnicityAfro, setEthnicityAfro] = useState(false);
  const [nulliparous, setNulliparous] = useState(false);
  const [conceptionIVF, setConceptionIVF] = useState(false);

  // Medical history
  const [chronicHypertension, setChronicHypertension] = useState(false);
  const [diabetesType, setDiabetesType] = useState(false);
  const [lupusSLE, setLupusSLE] = useState(false);
  const [previousPE, setPreviousPE] = useState(false);
  const [familyHistoryPE, setFamilyHistoryPE] = useState(false);

  // Measurements
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [map, setMap] = useState("");
  const [uterinePI, setUterinePI] = useState("");

  // Biochemistry
  const [showBiochem, setShowBiochem] = useState(false);
  const [pappaMoM, setPappaMoM] = useState("");
  const [plgfMoM, setPlgfMoM] = useState("");

  const [error, setError] = useState("");
  const [results, setResults] = useState<PreeclampsiaResult | null>(null);

  const handleCalculate = async () => {
    const ageVal = parseFloat(maternalAge);
    const weightVal = parseFloat(weight);
    const heightVal = parseFloat(height);

    if (isNaN(ageVal) || isNaN(weightVal) || isNaN(heightVal)) {
      setError("Preencha idade, peso e altura para o cálculo.");
      return;
    }
    if (ageVal < 15 || ageVal > 55) { setError("Idade deve estar entre 15 e 55 anos."); return; }
    if (weightVal < 35 || weightVal > 200) { setError("Peso deve estar entre 35 e 200 kg."); return; }
    if (heightVal < 130 || heightVal > 210) { setError("Altura deve estar entre 130 e 210 cm."); return; }

    if (showMeasurements && map) {
      const mapVal = parseFloat(map);
      if (mapVal < 50 || mapVal > 140) { setError("PAM deve estar entre 50 e 140 mmHg."); return; }
    }
    if (showMeasurements && uterinePI) {
      const piVal = parseFloat(uterinePI);
      if (piVal < 0.3 || piVal > 5.0) { setError("IP art. uterinas deve estar entre 0,3 e 5,0."); return; }
    }

    if (loading || blocked || needsLogin) return;
    setError("");

    const granted = await consumeToken();
    if (!granted) return;

    const input: PreeclampsiaInput = {
      maternalAge: ageVal,
      weight: weightVal,
      height: heightVal,
      ethnicityAfroCaribbean: ethnicityAfro,
      nulliparous,
      conceptionIVF,
      chronicHypertension,
      diabetesType1or2: diabetesType,
      lupusSLEorAPS: lupusSLE,
      previousPE,
      familyHistoryPE,
      meanArterialPressure: showMeasurements && map ? parseFloat(map) : null,
      uterineArteryMeanPI: showMeasurements && uterinePI ? parseFloat(uterinePI) : null,
      pappaMoM: showBiochem && pappaMoM !== "" ? parseFloat(pappaMoM) : null,
      plgfMoM: showBiochem && plgfMoM !== "" ? parseFloat(plgfMoM) : null,
    };

    const result = calculatePreeclampsiaRisk(input);
    setResults(result);

    if (canSave) {
      saveExam({
        calcType: "preeclampsia_risk",
        inputData: input as unknown as Record<string, unknown>,
        resultData: result as unknown as Record<string, unknown>,
        patientId: selectedPatientId,
      });
    }
  };

  const riskBarWidth = (pct: number) => `${Math.min(100, Math.max(2, pct * 10))}%`;

  return (
    <div className="space-y-6">
      <TokenGateAlert needsLogin={needsLogin} blocked={blocked} tokensRemaining={subscription?.tokens_remaining} />
      <PatientSelector value={selectedPatientId} onChange={setSelectedPatientId} />

      {/* ── Input Form ── */}
      <div className="glass-card-static p-6 md:p-8 space-y-6 mesh-coral">
        <div>
          <h2 className="font-display text-xl text-foreground">Risco de Pré-Eclâmpsia — 1º Trimestre</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Rastreamento baseado no modelo de riscos competitivos da FMF, com fatores maternos, medidas biofísicas e marcadores bioquímicos opcionais.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">FMF / ASPRE Trial</Badge>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">11–13⁺⁶ semanas</Badge>
          </div>
        </div>

        {/* Maternal characteristics */}
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Dados Maternos</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Idade (anos)", desc: "Idade materna", value: maternalAge, set: setMaternalAge, step: "1" },
              { label: "Peso (kg)", desc: "Peso no 1º trimestre", value: weight, set: setWeight, step: "0.1" },
              { label: "Altura (cm)", desc: "Altura materna", value: height, set: setHeight, step: "1" },
            ].map((f) => (
              <div key={f.label} className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label className="text-sm text-foreground">{f.label}</Label>
                  <Tooltip>
                    <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                    <TooltipContent>{f.desc}</TooltipContent>
                  </Tooltip>
                </div>
                <Input type="number" step={f.step} value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.label.split(" ")[0]} className="input-glass tabular-nums" />
              </div>
            ))}
          </div>
        </div>

        {/* Switches for characteristics */}
        <div className="space-y-3">
          {[
            { label: "Etnia afro-caribenha", desc: "Origem afrodescendente ou caribenha", checked: ethnicityAfro, set: setEthnicityAfro },
            { label: "Nulípara", desc: "Primeira gestação com possibilidade de parto", checked: nulliparous, set: setNulliparous },
            { label: "Concepção por FIV", desc: "Fertilização in vitro", checked: conceptionIVF, set: setConceptionIVF },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-sm text-foreground">{s.label}</Label>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <Switch checked={s.checked} onCheckedChange={s.set} />
            </div>
          ))}
        </div>

        {/* Medical history */}
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Histórico Médico</p>
          <div className="space-y-3">
            {[
              { label: "Hipertensão crônica", checked: chronicHypertension, set: setChronicHypertension },
              { label: "Diabetes mellitus tipo 1 ou 2", checked: diabetesType, set: setDiabetesType },
              { label: "LES / Síndrome antifosfolípide", checked: lupusSLE, set: setLupusSLE },
              { label: "Pré-eclâmpsia em gestação anterior", checked: previousPE, set: setPreviousPE },
              { label: "História familiar de pré-eclâmpsia (mãe)", checked: familyHistoryPE, set: setFamilyHistoryPE },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between p-3 border rounded-lg">
                <Label className="text-sm text-foreground">{s.label}</Label>
                <Switch checked={s.checked} onCheckedChange={s.set} />
              </div>
            ))}
          </div>
        </div>

        {/* Optional: Biophysical Measurements */}
        <button
          onClick={() => setShowMeasurements(!showMeasurements)}
          className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors"
        >
          <span className="text-sm font-medium text-foreground">Medidas Biofísicas (opcional)</span>
          {showMeasurements ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {showMeasurements && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm text-foreground">PAM (mmHg)</Label>
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>Pressão arterial média = (PAS + 2×PAD) / 3</TooltipContent>
                </Tooltip>
              </div>
              <Input type="number" step={0.1} value={map} onChange={(e) => setMap(e.target.value)} placeholder="Ex: 85" className="input-glass tabular-nums" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm text-foreground">IP Art. Uterinas (média)</Label>
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>Média do índice de pulsatilidade das artérias uterinas direita e esquerda</TooltipContent>
                </Tooltip>
              </div>
              <Input type="number" step={0.01} value={uterinePI} onChange={(e) => setUterinePI(e.target.value)} placeholder="Ex: 1.5" className="input-glass tabular-nums" />
            </div>
          </motion.div>
        )}

        {/* Optional: Biochemistry */}
        <button
          onClick={() => setShowBiochem(!showBiochem)}
          className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors"
        >
          <span className="text-sm font-medium text-foreground">Marcadores Bioquímicos (opcional)</span>
          {showBiochem ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {showBiochem && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm text-foreground">PAPP-A (MoM)</Label>
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>Proteína plasmática A associada à gravidez — MoM corrigido</TooltipContent>
                </Tooltip>
              </div>
              <Input type="number" step={0.01} value={pappaMoM} onChange={(e) => setPappaMoM(e.target.value)} placeholder="Ex: 1.0" className="input-glass tabular-nums" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm text-foreground">PlGF (MoM)</Label>
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>Fator de crescimento placentário — MoM corrigido</TooltipContent>
                </Tooltip>
              </div>
              <Input type="number" step={0.01} value={plgfMoM} onChange={(e) => setPlgfMoM(e.target.value)} placeholder="Ex: 1.0" className="input-glass tabular-nums" />
            </div>
          </motion.div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <Button onClick={handleCalculate} disabled={loading || blocked || needsLogin || consuming} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary disabled:opacity-50">
          <HeartPulse className="w-4 h-4 mr-1" /> Calcular Risco de PE
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
            {/* Category Banner */}
            <div className={`glass-card-static p-5 ${
              results.riskCategory === "alto" ? "border-destructive/40 bg-destructive/5" :
              results.riskCategory === "intermediário" ? "border-yellow-500/40 bg-yellow-500/5" :
              "border-emerald-500/40 bg-emerald-500/5"
            }`}>
              <div className="flex items-center gap-3">
                <HeartPulse className={`w-6 h-6 ${
                  results.riskCategory === "alto" ? "text-destructive" :
                  results.riskCategory === "intermediário" ? "text-yellow-600 dark:text-yellow-400" :
                  "text-emerald-600 dark:text-emerald-400"
                }`} />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Risco {results.riskCategory.toUpperCase()} para pré-eclâmpsia
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Método: {results.method}</p>
                </div>
              </div>
            </div>

            {/* Risk Bars */}
            <div className="glass-card-static p-6 space-y-5">
              {[
                { label: "PE precoce (< 34 sem)", value: results.riskEarly, cutoff: results.cutoffEarly },
                { label: "PE pré-termo (< 37 sem)", value: results.riskPreterm, cutoff: results.cutoffPreterm },
                { label: "PE a qualquer IG", value: results.riskAnyPE, cutoff: false },
              ].map((r) => (
                <div key={r.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">{r.label}</span>
                      {r.cutoff && (
                        <Badge variant="destructive" className="text-[10px]">
                          Positivo (≥ 1%)
                        </Badge>
                      )}
                    </div>
                    <span className={`tabular-nums text-lg font-display ${
                      r.value >= 1 ? "text-destructive" : r.value >= 0.5 ? "text-yellow-600 dark:text-yellow-400" : "text-emerald-600 dark:text-emerald-400"
                    }`}>
                      {r.value.toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        r.value >= 1 ? "bg-destructive/70" : r.value >= 0.5 ? "bg-yellow-500/70" : "bg-emerald-500/70"
                      }`}
                      style={{ width: riskBarWidth(r.value) }}
                    />
                    {/* 1% cutoff marker */}
                    <div className="absolute top-0 h-full w-0.5 bg-destructive/50" style={{ left: "10%" }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>0%</span>
                    <span className="text-destructive/70">corte 1%</span>
                    <span>≥10%</span>
                  </div>
                </div>
              ))}

              <p className="text-xs text-muted-foreground">
                Equivalente: PE pré-termo ≈ 1 : {results.riskPreterm > 0 ? Math.round(100 / results.riskPreterm).toLocaleString("pt-BR") : "N/A"}
              </p>
            </div>

            {/* Recommendation */}
            <div className={`glass-card-static p-5 space-y-3 ${
              results.cutoffPreterm ? "border-primary/30" : ""
            }`}>
              <div className="flex items-center gap-2">
                {results.cutoffPreterm ? (
                  <Pill className="w-5 h-5 text-primary" />
                ) : (
                  <Stethoscope className="w-5 h-5 text-primary" />
                )}
                <p className="text-sm font-medium text-foreground">Recomendação</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{results.recommendation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ScientificFooter
        references={[
          {
            authors: "O'Gorman N, Wright D, Syngelaki A, et al.",
            title: "Competing risks model in screening for preeclampsia by maternal factors and biomarkers at 11–13 weeks gestation",
            journal: "Am J Obstet Gynecol",
            year: 2016,
            doi: "10.1016/j.ajog.2015.08.034",
            pubmedId: "26297382",
          },
          {
            authors: "Rolnik DL, Wright D, Poon LC, et al.",
            title: "Aspirin versus placebo in pregnancies at high risk for preterm preeclampsia (ASPRE trial)",
            journal: "N Engl J Med",
            year: 2017,
            doi: "10.1056/NEJMoa1704559",
            pubmedId: "28657417",
          },
          {
            authors: "Wright D, Syngelaki A, Akolekar R, Poon LC, Nicolaides KH",
            title: "Competing risks model in screening for preeclampsia by maternal characteristics and medical history",
            journal: "Am J Obstet Gynecol",
            year: 2015,
            doi: "10.1016/j.ajog.2014.10.033",
            pubmedId: "25446694",
          },
          {
            authors: "Poon LC, Shennan A, Hyett JA, et al.",
            title: "The International Federation of Gynecology and Obstetrics (FIGO) initiative on pre-eclampsia: a pragmatic guide",
            journal: "Int J Gynecol Obstet",
            year: 2019,
            doi: "10.1002/ijgo.12802",
            pubmedId: "30810264",
          },
        ]}
        units={[
          { param: "PAM", unit: "mmHg", description: "Pressão arterial média = (PAS + 2×PAD)/3" },
          { param: "IP Art. Uterinas", unit: "adimensional", description: "Média do IP das artérias uterinas D e E" },
          { param: "PAPP-A / PlGF", unit: "MoM", description: "Múltiplos da mediana corrigidos" },
          { param: "Risco", unit: "%", description: "Probabilidade de pré-eclâmpsia" },
        ]}
        extraDisclaimer="Este cálculo é uma aproximação simplificada do modelo FMF de riscos competitivos. Para rastreamento clínico oficial, utilize software certificado. O ponto de corte de 1:100 (1%) para PE pré-termo segue o protocolo ASPRE/FIGO para indicação de AAS profilático."
      />
    </div>
  );
};

export default PreeclampsiaRiskCalculator;
