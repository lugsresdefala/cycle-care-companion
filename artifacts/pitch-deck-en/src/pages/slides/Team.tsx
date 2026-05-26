export default function Team() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg font-body text-ink">
      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="text-[1.3vw] tracking-[0.3em] uppercase text-muted font-semibold">
          09 · Team
        </span>
        <span className="text-[1.3vw] tracking-[0.2em] uppercase text-muted">IDALIA</span>
      </div>

      <div className="absolute left-[6vw] top-[16vh] max-w-[60vw]">
        <h2 className="font-serif text-[4.8vw] leading-[1] tracking-tight text-primary text-balance">
          Fetal medicine and engineering,
          <span className="italic text-accent"> at the same table.</span>
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[10vh] grid grid-cols-3 gap-[3vw]">
        <div className="border-t-2 border-primary pt-[2.5vh]">
          <div className="text-[1.2vw] uppercase tracking-[0.25em] text-primary font-semibold mb-[1vh]">Clinical lead</div>
          <div className="font-serif text-[2.6vw] leading-tight text-ink">[Founding clinician name]</div>
          <p className="text-[1.5vw] leading-snug text-muted mt-[1vh] text-pretty">
            OB-GYN specialising in fetal medicine. Owns the clinical fidelity
            of every formula.
          </p>
        </div>
        <div className="border-t-2 border-accent pt-[2.5vh]">
          <div className="text-[1.2vw] uppercase tracking-[0.25em] text-accent font-semibold mb-[1vh]">Product and engineering</div>
          <div className="font-serif text-[2.6vw] leading-tight text-ink">[Technical co-founder name]</div>
          <p className="text-[1.5vw] leading-snug text-muted mt-[1vh] text-pretty">
            Leads product, design and platform architecture — web, mobile and
            integrations.
          </p>
        </div>
        <div className="border-t-2 border-secondary pt-[2.5vh]">
          <div className="text-[1.2vw] uppercase tracking-[0.25em] text-secondary font-semibold mb-[1vh]">Advisory board</div>
          <div className="font-serif text-[2.6vw] leading-tight text-ink">[Names to confirm]</div>
          <p className="text-[1.5vw] leading-snug text-muted mt-[1vh] text-pretty">
            Portuguese and European clinicians and researchers in high-risk
            obstetrics.
          </p>
        </div>
      </div>

      <div className="absolute bottom-[4vh] left-[6vw] right-[6vw] text-[1.3vw] text-muted">
        Team to personalise before each meeting — bracketed fields signal
        placeholders.
      </div>
    </div>
  );
}
