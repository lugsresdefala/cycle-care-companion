const base = import.meta.env.BASE_URL;

export default function Ask() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-primary font-body text-white">
      <div className="absolute -top-[30vh] -right-[20vw] w-[70vw] h-[70vw] rounded-full bg-accent/15" />
      <div className="absolute -bottom-[30vh] -left-[20vw] w-[60vw] h-[60vw] rounded-full bg-white/5" />

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="text-[1.3vw] tracking-[0.3em] uppercase text-white/60 font-semibold">
          10 · The ask
        </span>
        <img
          src={`${base}idalia-logo.png`}
          crossOrigin="anonymous"
          alt="IDALIA"
          className="h-[4vh] w-auto brightness-0 invert opacity-90"
        />
      </div>

      <div className="absolute left-[6vw] top-[28vh] max-w-[72vw]">
        <div className="text-[1.5vw] tracking-[0.3em] uppercase text-accent font-semibold mb-[3vh]">
          What we are looking for
        </div>
        <h2 className="font-serif text-[6.4vw] leading-[0.95] tracking-tight text-white text-balance">
          Partners to scale
          <span className="italic text-accent"> precision obstetrics.</span>
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[10vh] grid grid-cols-3 gap-[3vw]">
        <div className="border-t border-white/30 pt-[2.5vh]">
          <div className="text-[1.2vw] uppercase tracking-[0.25em] text-accent font-semibold mb-[1vh]">Pilot clinics</div>
          <p className="text-[1.6vw] leading-snug text-white/85 text-pretty">
            5 clinics across the EU willing to trial IDALIA Clinical Premium
            for three months at no cost.
          </p>
        </div>
        <div className="border-t border-white/30 pt-[2.5vh]">
          <div className="text-[1.2vw] uppercase tracking-[0.25em] text-accent font-semibold mb-[1vh]">Seed capital</div>
          <p className="text-[1.6vw] leading-snug text-white/85 text-pretty">
            Round to fund native mobile, EU commercial expansion and EHR /
            ultrasound integrations.
          </p>
        </div>
        <div className="border-t border-white/30 pt-[2.5vh]">
          <div className="text-[1.2vw] uppercase tracking-[0.25em] text-accent font-semibold mb-[1vh]">Clinical advisors</div>
          <p className="text-[1.6vw] leading-snug text-white/85 text-pretty">
            Fetal medicine specialists to validate new modules and curate the
            evidence base.
          </p>
        </div>
      </div>

      <div className="absolute bottom-[4vh] left-[6vw] right-[6vw] flex items-center justify-between text-[1.4vw] text-white/70">
        <span>contact@idaliacalc.com</span>
        <span>idaliacalc.com</span>
      </div>
    </div>
  );
}
