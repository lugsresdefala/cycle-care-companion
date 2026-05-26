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
          Built by a clinician
          <span className="italic text-accent"> who uses it every day.</span>
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[10vh] grid grid-cols-2 gap-[3vw] max-w-[80vw]">
        <div className="border-t-2 border-primary pt-[2.5vh]">
          <div className="text-[1.2vw] uppercase tracking-[0.25em] text-primary font-semibold mb-[1vh]">Founder</div>
          <div className="font-serif text-[2.6vw] leading-tight text-ink">Tiago José de Oliveira Gomes</div>
          <p className="text-[1.5vw] leading-snug text-muted mt-[1vh] text-pretty">
            Specialist in Obstetrics and Gynaecology. Designs and validates
            every calculator against the formulas used in daily practice.
          </p>
        </div>
        <div className="border-t-2 border-accent pt-[2.5vh]">
          <div className="text-[1.2vw] uppercase tracking-[0.25em] text-accent font-semibold mb-[1vh]">Product and engineering</div>
          <div className="font-serif text-[2.6vw] leading-tight text-ink">Founder-led</div>
          <p className="text-[1.5vw] leading-snug text-muted mt-[1vh] text-pretty">
            Product, design and platform — web, mobile and integrations — shipped
            end to end by the founder, with external collaborators as needed.
          </p>
        </div>
      </div>
    </div>
  );
}
