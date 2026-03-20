import { useState, useMemo } from "react";
import { useTokenGate } from "@/hooks/useTokenGate";
import { TokenGateAlert } from "@/components/TokenGateAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, TrendingUp, AlertCircle, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScientificFooter from "@/components/ScientificFooter";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Area, ReferenceDot, Legend,
} from "recharts";
import {
  GrowthParameter, GROWTH_PARAMS, getGrowthData, assessGrowth,
  type GrowthAssessment, type PercentileRow,
} from "@/lib/intergrowth";

interface Measurement {
  id: string;
  ga: string;
  value: string;
}

const PERCENTILE_COLORS = {
  p3: "hsl(var(--destructive))",
  p10: "hsl(var(--accent))",
  p50: "hsl(var(--primary))",
  p90: "hsl(var(--accent))",
  p97: "hsl(var(--destructive))",
};

const GrowthCurveCalculator = () => {
  const { blocked, needsLogin, consuming, subscription, consumeToken } = useTokenGate();
  const [selectedParam, setSelectedParam] = useState<GrowthParameter>("efw");
  const [measurements, setMeasurements] = useState<Measurement[]>([
    { id: crypto.randomUUID(), ga: "", value: "" },
  ]);
  const [assessments, setAssessments] = useState<GrowthAssessment[]>([]);
  const [error, setError] = useState("");

  const paramMeta = GROWTH_PARAMS.find((p) => p.key === selectedParam)!;
  const curveData = useMemo(() => getGrowthData(selectedParam), [selectedParam]);

  const addMeasurement = () => {
    setMeasurements((prev) => [...prev, { id: crypto.randomUUID(), ga: "", value: "" }]);
  };

  const removeMeasurement = (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMeasurement = (id: string, field: "ga" | "value", val: string) => {
    setMeasurements((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: val } : m)));
  };

  const handleCalculate = async () => {
    const valid: { ga: number; value: number }[] = [];
    for (const m of measurements) {
      const ga = parseFloat(m.ga);
      const value = parseFloat(m.value);
      if (isNaN(ga) || isNaN(value)) continue;
      if (ga < paramMeta.minGA || ga > paramMeta.maxGA) {
        setError(`IG deve estar entre ${paramMeta.minGA} e ${paramMeta.maxGA} semanas.`);
        return;
      }
      valid.push({ ga, value });
    }
    if (valid.length === 0) {
      setError("Insira pelo menos uma medida válida.");
      return;
    }
    const ok = await consumeToken();
    if (!ok) return;
    setError("");
    setAssessments(valid.map((v) => assessGrowth(selectedParam, v.ga, v.value)));
  };

  // Build chart data merging percentile curves + measurements
  const chartData = useMemo(() => {
    const base = curveData.map((row) => ({
      ga: row.ga,
      p3: row.p3,
      p10: row.p10,
      p50: row.p50,
      p90: row.p90,
      p97: row.p97,
      measured: undefined as number | undefined,
    }));
    // Overlay measurements
    for (const a of assessments) {
      const existing = base.find((r) => r.ga === Math.round(a.ga));
      if (existing) {
        existing.measured = a.value;
      } else {
        base.push({
          ga: Math.round(a.ga),
          p3: a.closestRow.p3,
          p10: a.closestRow.p10,
          p50: a.closestRow.p50,
          p90: a.closestRow.p90,
          p97: a.closestRow.p97,
          measured: a.value,
        });
        base.sort((a, b) => a.ga - b.ga);
      }
    }
    return base;
  }, [curveData, assessments]);

  const severityClass = (s: string) =>
    s === "critical"
      ? "border-destructive/40 bg-destructive/5"
      : s === "warning"
        ? "border-accent/40 bg-accent/5"
        : "border-primary/40 bg-primary/5";

  const severityDot = (s: string) =>
    s === "critical" ? "bg-destructive" : s === "warning" ? "bg-accent" : "bg-primary";

  return (
    <div className="space-y-6">
      <TokenGateAlert needsLogin={needsLogin} blocked={blocked} tokensRemaining={subscription?.tokens_remaining} />
      {/* ── Parameter selector ── */}
      <div className="glass-card-static p-6 md:p-8 space-y-6 mesh-blue">
        <div>
          <h2 className="font-display text-xl text-foreground">Curva de Crescimento Fetal</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Percentis INTERGROWTH-21st — padrão internacional de crescimento fetal.
          </p>
          <Badge variant="outline" className="mt-2 text-xs border-primary/30 text-primary">
            INTERGROWTH-21st, 2014
          </Badge>
        </div>

        {/* Parameter tabs */}
        <div className="flex flex-wrap gap-2">
          {GROWTH_PARAMS.map((p) => (
            <button
              key={p.key}
              onClick={() => {
                setSelectedParam(p.key);
                setAssessments([]);
                setError("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedParam === p.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              {p.label}
              <span className="hidden sm:inline ml-1 opacity-70">({p.unit})</span>
            </button>
          ))}
        </div>

        {/* Measurement inputs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">
              Medidas — {paramMeta.fullName} ({paramMeta.unit})
            </Label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>Adicione múltiplas medidas para plotar a trajetória de crescimento</TooltipContent>
            </Tooltip>
          </div>

          {measurements.map((m, i) => (
            <div key={m.id} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-5 shrink-0 tabular-nums">{i + 1}.</span>
              <Input
                type="number"
                step="0.1"
                placeholder="IG (sem)"
                value={m.ga}
                onChange={(e) => updateMeasurement(m.id, "ga", e.target.value)}
                className="input-glass tabular-nums w-24"
              />
              <Input
                type="number"
                step="0.1"
                placeholder={`${paramMeta.label} (${paramMeta.unit})`}
                value={m.value}
                onChange={(e) => updateMeasurement(m.id, "value", e.target.value)}
                className="input-glass tabular-nums flex-1"
              />
              {measurements.length > 1 && (
                <button
                  onClick={() => removeMeasurement(m.id)}
                  className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addMeasurement}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar medida
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <Button onClick={handleCalculate} className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary">
          <TrendingUp className="w-4 h-4 mr-1" /> Plotar na Curva
        </Button>
      </div>

      {/* ── Chart ── */}
      <AnimatePresence>
        {assessments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="glass-card-static p-4 md:p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                {paramMeta.fullName} — Curva INTERGROWTH-21st
              </h3>
              <div className="w-full" style={{ height: 340 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis
                      dataKey="ga"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      label={{ value: "IG (semanas)", position: "insideBottomRight", offset: -5, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      label={{ value: paramMeta.unit, angle: -90, position: "insideLeft", offset: 10, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(value: number, name: string) => {
                        const labels: Record<string, string> = {
                          p3: "P3", p10: "P10", p50: "P50", p90: "P90", p97: "P97", measured: "Medido",
                        };
                        return [value != null ? `${value} ${paramMeta.unit}` : "—", labels[name] || name];
                      }}
                      labelFormatter={(ga) => `${ga} semanas`}
                    />

                    {/* Shaded band P10–P90 */}
                    <Area
                      dataKey="p90"
                      stroke="none"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.06}
                      type="monotone"
                      isAnimationActive={false}
                    />

                    {/* Percentile lines */}
                    <Line dataKey="p3" stroke={PERCENTILE_COLORS.p3} strokeWidth={1} strokeDasharray="4 4" dot={false} type="monotone" name="p3" />
                    <Line dataKey="p10" stroke={PERCENTILE_COLORS.p10} strokeWidth={1.5} strokeDasharray="3 3" dot={false} type="monotone" name="p10" />
                    <Line dataKey="p50" stroke={PERCENTILE_COLORS.p50} strokeWidth={2.5} dot={false} type="monotone" name="p50" />
                    <Line dataKey="p90" stroke={PERCENTILE_COLORS.p90} strokeWidth={1.5} strokeDasharray="3 3" dot={false} type="monotone" name="p90" />
                    <Line dataKey="p97" stroke={PERCENTILE_COLORS.p97} strokeWidth={1} strokeDasharray="4 4" dot={false} type="monotone" name="p97" />

                    {/* Measured points */}
                    <Line
                      dataKey="measured"
                      stroke="hsl(var(--foreground))"
                      strokeWidth={2}
                      dot={{ r: 5, fill: "hsl(var(--foreground))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                      connectNulls
                      type="monotone"
                      name="measured"
                    />

                    <Legend
                      formatter={(value: string) => {
                        const labels: Record<string, string> = {
                          p3: "P3", p10: "P10", p50: "P50 (mediana)", p90: "P90", p97: "P97", measured: "Medido",
                        };
                        return <span className="text-xs">{labels[value] || value}</span>;
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Assessment cards ── */}
            <div className="space-y-3">
              {assessments.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`glass-card-static p-4 border ${severityClass(a.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${severityDot(a.severity)}`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">
                          IG {a.ga} sem — {a.value} {paramMeta.unit}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            a.severity === "critical"
                              ? "border-destructive/40 text-destructive"
                              : a.severity === "warning"
                                ? "border-accent/40 text-accent"
                                : "border-primary/40 text-primary"
                          }`}
                        >
                          {a.percentileLabel}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{a.interpretation}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1 tabular-nums">
                        <span>P10: {a.closestRow.p10}</span>
                        <span>P50: {a.closestRow.p50}</span>
                        <span>P90: {a.closestRow.p90}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ScientificFooter
        references={[
          {
            authors: "Papageorghiou AT, Ohuma EO, Altman DG, et al.",
            title: "International standards for fetal growth based on serial ultrasound measurements: the Fetal Growth Longitudinal Study of the INTERGROWTH-21st Project",
            journal: "Lancet",
            year: 2014,
            doi: "10.1016/S0140-6736(14)61490-2",
            pubmedId: "25209488",
          },
          {
            authors: "Stirnemann J, Villar J, Salomon LJ, et al.",
            title: "International estimated fetal weight standards of the INTERGROWTH-21st Project",
            journal: "Ultrasound Obstet Gynecol",
            year: 2017,
            doi: "10.1002/uog.17347",
            pubmedId: "27804212",
          },
          {
            authors: "Villar J, Giuliani F, Fenton TR, et al.",
            title: "INTERGROWTH-21st very preterm size at birth reference charts",
            journal: "Lancet",
            year: 2016,
            doi: "10.1016/S0140-6736(16)00384-6",
            pubmedId: "26794078",
          },
        ]}
        units={[
          { param: "PFE", unit: "g", description: "Peso fetal estimado em gramas" },
          { param: "CC", unit: "mm", description: "Circunferência cefálica" },
          { param: "CA", unit: "mm", description: "Circunferência abdominal" },
          { param: "CF", unit: "mm", description: "Comprimento do fêmur" },
          { param: "DBP", unit: "mm", description: "Diâmetro biparietal" },
          { param: "IG", unit: "semanas", description: "Idade gestacional em semanas completas" },
        ]}
        extraDisclaimer="Curvas baseadas no estudo INTERGROWTH-21st com populações saudáveis multiétnicas. Os percentis apresentados são aproximações dos valores publicados. A avaliação clínica deve considerar a trajetória de crescimento e o contexto individual."
      />
    </div>
  );
};

export default GrowthCurveCalculator;
