export default function Pricing() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg font-body text-ink">
      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="text-[1.3vw] tracking-[0.3em] uppercase text-muted font-semibold">
          07 · Revenue model
        </span>
        <span className="text-[1.3vw] tracking-[0.2em] uppercase text-muted">IDALIA</span>
      </div>

      <div className="absolute left-[6vw] top-[15vh] max-w-[70vw]">
        <h2 className="font-serif text-[4.6vw] leading-[1] tracking-tight text-primary text-balance">
          Monthly subscription,
          <span className="italic text-accent"> three tiers.</span>
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[34vh] grid grid-cols-3 gap-[2vw]">
        {/* Personal */}
        <div className="bg-white border border-line p-[3vh_2vw] flex flex-col h-[52vh]">
          <div className="text-[1.2vw] uppercase tracking-[0.25em] text-muted font-semibold">Personal</div>
          <div className="mt-[2vh] flex items-baseline gap-[0.4vw]">
            <span className="font-serif text-[4.2vw] leading-none text-primary">€3.99</span>
          </div>
          <div className="text-[1.2vw] text-muted mt-[0.5vh]">/ month · $4.49 · R$19.90</div>
          <div className="mt-[3vh] flex flex-col gap-[1.5vh] text-[1.5vw] text-ink/85 leading-snug">
            <span>All essential calculators</span>
            <span>Local history and export</span>
            <span>Email support</span>
          </div>
          <div className="mt-auto text-[1.2vw] text-muted">For residents and solo clinicians</div>
        </div>

        {/* Clinical */}
        <div className="bg-primary text-white p-[3vh_2vw] flex flex-col h-[52vh] relative">
          <div className="absolute top-[2vh] right-[1.5vw] text-[1vw] tracking-[0.25em] uppercase bg-accent text-white px-[0.8vw] py-[0.4vh] font-semibold">Most popular</div>
          <div className="text-[1.2vw] uppercase tracking-[0.25em] text-white/70 font-semibold">Clinical</div>
          <div className="mt-[2vh] flex items-baseline gap-[0.4vw]">
            <span className="font-serif text-[4.2vw] leading-none text-white">€8.99</span>
          </div>
          <div className="text-[1.2vw] text-white/70 mt-[0.5vh]">/ month per clinician · $9.99 · R$49.90</div>
          <div className="mt-[3vh] flex flex-col gap-[1.5vh] text-[1.5vw] text-white/90 leading-snug">
            <span>Everything in Personal</span>
            <span>Patient management and reports</span>
            <span>Trisomy and pre-eclampsia screening</span>
            <span>Sync across devices</span>
          </div>
          <div className="mt-auto text-[1.2vw] text-white/60">For OB-GYN practices</div>
        </div>

        {/* Clinical Premium */}
        <div className="bg-white border border-line p-[3vh_2vw] flex flex-col h-[52vh] border-t-[4px] border-t-accent">
          <div className="text-[1.2vw] uppercase tracking-[0.25em] text-accent font-semibold">Clinical Premium</div>
          <div className="mt-[2vh] flex items-baseline gap-[0.4vw]">
            <span className="font-serif text-[4.2vw] leading-none text-primary">€17.99</span>
          </div>
          <div className="text-[1.2vw] text-muted mt-[0.5vh]">/ month per clinician · $19.99 · R$99.90</div>
          <div className="mt-[3vh] flex flex-col gap-[1.5vh] text-[1.5vw] text-ink/85 leading-snug">
            <span>Everything in Clinical</span>
            <span>Multi-user with clinic profiles</span>
            <span>Logo and clinic branding on reports</span>
            <span>Priority support and onboarding</span>
          </div>
          <div className="mt-auto text-[1.2vw] text-muted">For fetal medicine clinics</div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] left-[6vw] right-[6vw] text-[1.3vw] text-muted">
        Billed via Stripe · EUR / USD / BRL · indicative pricing, to be confirmed at launch.
      </div>
    </div>
  );
}
