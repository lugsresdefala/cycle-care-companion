export default function Evidence() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg font-body text-ink">
      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="text-[1.3vw] tracking-[0.3em] uppercase text-muted font-semibold">
          06 · Evidence
        </span>
        <span className="text-[1.3vw] tracking-[0.2em] uppercase text-muted">IDALIA</span>
      </div>

      <div className="absolute left-[6vw] top-[16vh] max-w-[60vw]">
        <h2 className="font-serif text-[5vw] leading-[1] tracking-tight text-primary text-balance">
          Every calculation, a
          <span className="italic text-accent"> published reference.</span>
        </h2>
        <p className="mt-[3vh] text-[1.8vw] leading-snug text-muted max-w-[50vw] text-pretty">
          Every formula in IDALIA links to its primary source — the clinician
          sees the literature behind the number.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[8vh] grid grid-cols-2 gap-x-[3vw] gap-y-[2.5vh]">
        <div className="flex items-baseline gap-[1.5vw] border-b border-line pb-[1.5vh]">
          <span className="text-[1.3vw] uppercase tracking-[0.2em] text-accent font-semibold w-[7vw] shrink-0">CRL</span>
          <span className="text-[1.6vw] leading-snug text-ink text-pretty">Robinson HP, Fleming JEE — Br J Obstet Gynaecol, 1975</span>
        </div>
        <div className="flex items-baseline gap-[1.5vw] border-b border-line pb-[1.5vh]">
          <span className="text-[1.3vw] uppercase tracking-[0.2em] text-accent font-semibold w-[7vw] shrink-0">Biometry</span>
          <span className="text-[1.6vw] leading-snug text-ink text-pretty">Hadlock FP et al. — Radiology, 1984</span>
        </div>
        <div className="flex items-baseline gap-[1.5vw] border-b border-line pb-[1.5vh]">
          <span className="text-[1.3vw] uppercase tracking-[0.2em] text-accent font-semibold w-[7vw] shrink-0">Growth</span>
          <span className="text-[1.6vw] leading-snug text-ink text-pretty">INTERGROWTH-21st — The Lancet, 2014</span>
        </div>
        <div className="flex items-baseline gap-[1.5vw] border-b border-line pb-[1.5vh]">
          <span className="text-[1.3vw] uppercase tracking-[0.2em] text-accent font-semibold w-[7vw] shrink-0">Doppler</span>
          <span className="text-[1.6vw] leading-snug text-ink text-pretty">Baschat AA — Ultrasound Obstet Gynecol</span>
        </div>
        <div className="flex items-baseline gap-[1.5vw] border-b border-line pb-[1.5vh]">
          <span className="text-[1.3vw] uppercase tracking-[0.2em] text-accent font-semibold w-[7vw] shrink-0">T21</span>
          <span className="text-[1.6vw] leading-snug text-ink text-pretty">Fetal Medicine Foundation — first-trimester screening</span>
        </div>
        <div className="flex items-baseline gap-[1.5vw] border-b border-line pb-[1.5vh]">
          <span className="text-[1.3vw] uppercase tracking-[0.2em] text-accent font-semibold w-[7vw] shrink-0">PE</span>
          <span className="text-[1.6vw] leading-snug text-ink text-pretty">ASPRE / FMF — combined pre-eclampsia model</span>
        </div>
      </div>
    </div>
  );
}
