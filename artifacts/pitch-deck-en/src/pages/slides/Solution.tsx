const base = import.meta.env.BASE_URL;

export default function Solution() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg font-body text-ink">
      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="text-[1.3vw] tracking-[0.3em] uppercase text-muted font-semibold">
          03 · Solution
        </span>
        <img
          src={`${base}idalia-logo.png`}
          crossOrigin="anonymous"
          alt="IDALIA"
          className="h-[4vh] w-auto opacity-90"
        />
      </div>

      <div className="absolute left-[6vw] top-[18vh] max-w-[88vw]">
        <div className="text-[1.5vw] tracking-[0.3em] uppercase text-accent font-semibold mb-[2.5vh]">
          IDALIA Calc
        </div>
        <h2 className="font-serif text-[5.4vw] leading-[1] tracking-tight text-primary text-balance max-w-[70vw]">
          One platform for every calculation
          <span className="italic text-accent"> in modern obstetrics.</span>
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[9vh] grid grid-cols-3 gap-[3vw]">
        <div>
          <div className="font-serif text-[4vw] leading-none text-primary mb-[1.5vh]">01</div>
          <div className="text-[1.7vw] font-semibold text-ink mb-[1vh]">Dating and biometry</div>
          <p className="text-[1.5vw] leading-snug text-muted text-pretty">
            Gestational age by LMP, ultrasound, CRL, BPD and composite biometry
            on a single screen.
          </p>
        </div>
        <div>
          <div className="font-serif text-[4vw] leading-none text-accent mb-[1.5vh]">02</div>
          <div className="text-[1.7vw] font-semibold text-ink mb-[1vh]">Growth and Doppler</div>
          <p className="text-[1.5vw] leading-snug text-muted text-pretty">
            Estimated fetal weight, INTERGROWTH-21st curves and umbilical,
            middle-cerebral and uterine Doppler.
          </p>
        </div>
        <div>
          <div className="font-serif text-[4vw] leading-none text-secondary mb-[1.5vh]">03</div>
          <div className="text-[1.7vw] font-semibold text-ink mb-[1vh]">Risk screening</div>
          <p className="text-[1.5vw] leading-snug text-muted text-pretty">
            First-trimester trisomies and pre-eclampsia using the FMF / ASPRE
            combined model.
          </p>
        </div>
      </div>
    </div>
  );
}
