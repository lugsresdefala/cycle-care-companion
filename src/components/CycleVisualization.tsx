import { motion } from "framer-motion";

interface CycleVisualizationProps {
  currentPhase: string;
  cycleLength: number;
}

const PHASES = [
  { key: "menstrual", label: "Menstrual", color: "bg-menstrual", days: 5 },
  { key: "folicular", label: "Folicular", color: "bg-folicular", days: 9 },
  { key: "fértil", label: "Fértil", color: "bg-fertility", days: 6 },
  { key: "lútea", label: "Lútea", color: "bg-luteal", days: 8 },
];

const CycleVisualization = ({ currentPhase, cycleLength }: CycleVisualizationProps) => {
  const total = PHASES.reduce((s, p) => s + p.days, 0);

  return (
    <div className="glass-card-static p-6 space-y-4">
      <h3 className="font-display text-lg text-foreground">Ciclo Visual</h3>
      <div className="flex rounded-full overflow-hidden h-3 gap-0.5">
        {PHASES.map((phase, i) => (
          <motion.div
            key={phase.key}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`${phase.color} origin-left ${
              currentPhase === phase.key ? "opacity-100 glow-primary" : "opacity-40"
            }`}
            style={{ width: `${(phase.days / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        {PHASES.map((phase) => (
          <span
            key={phase.key}
            className={currentPhase === phase.key ? "text-primary font-medium" : ""}
          >
            {phase.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CycleVisualization;
