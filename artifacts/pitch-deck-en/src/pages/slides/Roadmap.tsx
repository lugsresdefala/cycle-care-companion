export default function Roadmap() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg font-body text-ink">
      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="text-[1.3vw] tracking-[0.3em] uppercase text-muted font-semibold">
          08 · Traction and roadmap
        </span>
        <span className="text-[1.3vw] tracking-[0.2em] uppercase text-muted">IDALIA</span>
      </div>

      <div className="absolute left-[6vw] top-[16vh] max-w-[60vw]">
        <h2 className="font-serif text-[4.6vw] leading-[1] tracking-tight text-primary text-balance">
          Where we are,
          <span className="italic text-accent"> where we are going.</span>
        </h2>
        <p className="mt-[2.5vh] text-[1.6vw] leading-snug text-muted max-w-[50vw] text-pretty">
          Current numbers to be confirmed by the team before each presentation.
        </p>
      </div>

      {/* Timeline */}
      <div className="absolute left-[6vw] right-[6vw] top-[42vh]">
        <div className="relative h-[1px] bg-line w-full">
          <span className="absolute -top-[1vh] left-0 w-[2vh] h-[2vh] rounded-full bg-primary" />
          <span className="absolute -top-[1vh] left-[33%] w-[2vh] h-[2vh] rounded-full bg-accent" />
          <span className="absolute -top-[1vh] left-[66%] w-[2vh] h-[2vh] rounded-full bg-secondary" />
          <span className="absolute -top-[1vh] right-0 w-[2vh] h-[2vh] rounded-full border-2 border-primary bg-bg" />
        </div>

        <div className="grid grid-cols-4 gap-[2vw] mt-[4vh]">
          <div>
            <div className="text-[1.3vw] uppercase tracking-[0.25em] text-primary font-semibold">Today</div>
            <div className="font-serif text-[2.6vw] leading-tight text-ink mt-[0.5vh]">Product live</div>
            <p className="text-[1.4vw] leading-snug text-muted mt-[1vh] text-pretty">
              8 calculators, mobile PWA, Stripe live, first paying clinicians
              <span className="text-muted/60"> [to be filled in]</span>.
            </p>
          </div>
          <div>
            <div className="text-[1.3vw] uppercase tracking-[0.25em] text-accent font-semibold">Q1 2026</div>
            <div className="font-serif text-[2.6vw] leading-tight text-ink mt-[0.5vh]">Native mobile</div>
            <p className="text-[1.4vw] leading-snug text-muted mt-[1vh] text-pretty">
              iOS and Android apps, offline mode and report shortcut at the
              point of care.
            </p>
          </div>
          <div>
            <div className="text-[1.3vw] uppercase tracking-[0.25em] text-secondary font-semibold">Q2–Q3 2026</div>
            <div className="font-serif text-[2.6vw] leading-tight text-ink mt-[0.5vh]">Clinic pilots</div>
            <p className="text-[1.4vw] leading-snug text-muted mt-[1vh] text-pretty">
              5 anchor clinics in Portugal and 3 across the EU, with assisted
              onboarding.
            </p>
          </div>
          <div>
            <div className="text-[1.3vw] uppercase tracking-[0.25em] text-primary font-semibold">Q4 2026</div>
            <div className="font-serif text-[2.6vw] leading-tight text-ink mt-[0.5vh]">Integration</div>
            <p className="text-[1.4vw] leading-snug text-muted mt-[1vh] text-pretty">
              API for electronic health records and ultrasound OEM partners.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
