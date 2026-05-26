export default function Market() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-primary font-body text-white">
      {/* Subtle radial */}
      <div className="absolute -top-[30vh] -left-[20vw] w-[70vw] h-[70vw] rounded-full bg-white/5" />
      <div className="absolute -bottom-[20vh] -right-[10vw] w-[50vw] h-[50vw] rounded-full bg-accent/15" />

      {/* Header */}
      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="text-[1.3vw] tracking-[0.3em] uppercase text-white/60 font-semibold">
          02 · Market
        </span>
        <span className="text-[1.3vw] tracking-[0.2em] uppercase text-white/60">IDALIA</span>
      </div>

      <div className="absolute left-[6vw] top-[18vh] max-w-[55vw]">
        <h2 className="font-serif text-[5vw] leading-[1] tracking-tight text-white text-balance">
          OB-GYN clinicians
          <span className="italic text-accent"> everywhere they practise.</span>
        </h2>
        <p className="mt-[3vh] text-[1.8vw] leading-snug text-white/75 max-w-[48vw] text-pretty">
          A fragmented market with strong clinical-software adoption and rising
          demand for decision-support tools — bilingual from day one, ready for
          EU, UK and Portuguese-speaking clinicians.
        </p>
      </div>

      {/* Stats column */}
      <div className="absolute right-[6vw] top-[22vh] w-[32vw] flex flex-col gap-[3vh]">
        <div className="border-l-2 border-accent pl-[1.5vw]">
          <div className="font-serif text-[5vw] leading-none text-white">EN · PT</div>
          <div className="mt-[1vh] text-[1.5vw] text-white/70 leading-snug">
            interface, references and support in two languages from day one.
          </div>
        </div>
        <div className="border-l-2 border-accent pl-[1.5vw]">
          <div className="font-serif text-[5vw] leading-none text-white">8</div>
          <div className="mt-[1vh] text-[1.5vw] text-white/70 leading-snug">
            calculators live today, covering the core of routine fetal
            ultrasound reporting.
          </div>
        </div>
        <div className="border-l-2 border-accent pl-[1.5vw]">
          <div className="font-serif text-[5vw] leading-none text-white">Web · Mobile</div>
          <div className="mt-[1vh] text-[1.5vw] text-white/70 leading-snug">
            same calculations on the desktop in the clinic and on the phone at
            the bedside.
          </div>
        </div>
      </div>

      <div className="absolute bottom-[5vh] left-[6vw] right-[6vw] text-[1.3vw] text-white/50">
        Beachhead: individual OB-GYN clinicians · expansion into multi-clinician
        practices and OB-GYN training programmes.
      </div>
    </div>
  );
}
