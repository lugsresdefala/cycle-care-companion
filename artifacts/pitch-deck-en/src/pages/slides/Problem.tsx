export default function Problem() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg font-body text-ink">
      {/* Section label */}
      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="text-[1.3vw] tracking-[0.3em] uppercase text-muted font-semibold">
          01 · Problem
        </span>
        <span className="text-[1.3vw] tracking-[0.2em] uppercase text-muted">IDALIA</span>
      </div>

      {/* Headline */}
      <div className="absolute left-[6vw] top-[16vh] max-w-[60vw]">
        <h2 className="font-serif text-[5.2vw] leading-[1] tracking-tight text-primary text-balance">
          Fetal biometry is still done
          <span className="italic text-accent"> by hand.</span>
        </h2>
        <p className="mt-[3vh] text-[1.9vw] leading-snug text-muted max-w-[52vw] text-pretty">
          The obstetrician moves between the ultrasound, printed tables,
          scattered calculators and the patient record. Every exam loses
          precious minutes and opens room for error.
        </p>
      </div>

      {/* Three problem points */}
      <div className="absolute left-[6vw] right-[6vw] bottom-[8vh] grid grid-cols-3 gap-[3vw]">
        <div className="border-t-2 border-primary/80 pt-[2.5vh]">
          <div className="text-[1.3vw] tracking-[0.25em] uppercase text-primary font-semibold mb-[1.5vh]">
            Time
          </div>
          <p className="text-[1.7vw] leading-snug text-ink/85 text-pretty">
            5 to 8 minutes per patient just on dating, biometry and percentile
            curves.
          </p>
        </div>
        <div className="border-t-2 border-accent pt-[2.5vh]">
          <div className="text-[1.3vw] tracking-[0.25em] uppercase text-accent font-semibold mb-[1.5vh]">
            Variability
          </div>
          <p className="text-[1.7vw] leading-snug text-ink/85 text-pretty">
            Different formulas and growth charts across colleagues produce
            inconsistent reports inside the same clinic.
          </p>
        </div>
        <div className="border-t-2 border-secondary pt-[2.5vh]">
          <div className="text-[1.3vw] tracking-[0.25em] uppercase text-secondary font-semibold mb-[1.5vh]">
            Risk
          </div>
          <p className="text-[1.7vw] leading-snug text-ink/85 text-pretty">
            Manual risk calculations for trisomies and pre-eclampsia remain
            exposed to human error.
          </p>
        </div>
      </div>
    </div>
  );
}
