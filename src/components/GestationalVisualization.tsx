import { motion } from "framer-motion";

interface GestationalVisualizationProps {
  weeks: number;
  days: number;
  currentTrimester: number;
  progressPercent: number;
}

const TRIMESTERS = [
  { label: "1º Trim", weeks: "1–13", color: "bg-folicular" },
  { label: "2º Trim", weeks: "14–27", color: "bg-accent" },
  { label: "3º Trim", weeks: "28–40", color: "bg-primary" },
];

const GestationalVisualization = ({
  weeks,
  days,
  currentTrimester,
  progressPercent,
}: GestationalVisualizationProps) => {
  return (
    <div className="glass-card-static p-6 space-y-4">
      <h3 className="font-display text-lg text-foreground">Progresso Gestacional</h3>

      {/* Progress bar */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="h-full bg-gradient-to-r from-folicular via-accent to-primary rounded-full glow-primary"
        />
      </div>

      {/* Trimester markers */}
      <div className="flex gap-2">
        {TRIMESTERS.map((t, i) => (
          <div
            key={t.label}
            className={`flex-1 rounded-lg p-3 text-center transition-all ${
              currentTrimester === i + 1
                ? "glass-card-static border-primary/30"
                : "bg-muted/30"
            }`}
          >
            <div className={`text-xs font-medium ${currentTrimester === i + 1 ? "text-primary" : "text-muted-foreground"}`}>
              {t.label}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{t.weeks} sem</div>
          </div>
        ))}
      </div>

      {/* Week indicator */}
      <div className="text-center pt-2">
        <span className="tabular-nums text-3xl font-display text-primary">{weeks}</span>
        <span className="text-muted-foreground text-sm ml-1">semanas</span>
        <span className="tabular-nums text-xl font-display text-foreground ml-3">{days}</span>
        <span className="text-muted-foreground text-sm ml-1">dias</span>
      </div>
    </div>
  );
};

export default GestationalVisualization;
