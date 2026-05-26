export default function Product() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg font-body text-ink">
      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="text-[1.3vw] tracking-[0.3em] uppercase text-muted font-semibold">
          04 · Product
        </span>
        <span className="text-[1.3vw] tracking-[0.2em] uppercase text-muted">IDALIA</span>
      </div>

      <div className="absolute left-[6vw] top-[15vh] max-w-[60vw]">
        <h2 className="font-serif text-[4.4vw] leading-[1] tracking-tight text-primary text-balance">
          Eight clinical modules,
          <span className="italic text-accent"> one workflow.</span>
        </h2>
      </div>

      {/* Module grid */}
      <div className="absolute left-[6vw] right-[6vw] top-[37vh] grid grid-cols-4 grid-rows-2 gap-[1.5vw]">
        <div className="bg-white border-t-[3px] border-accent p-[2vh_1.5vw]">
          <div className="text-[1.2vw] uppercase tracking-[0.2em] text-accent font-semibold mb-[1vh]">Fertility</div>
          <div className="text-[1.7vw] font-semibold leading-tight text-ink">Menstrual cycle and fertile window</div>
        </div>
        <div className="bg-white border-t-[3px] border-secondary p-[2vh_1.5vw]">
          <div className="text-[1.2vw] uppercase tracking-[0.2em] text-secondary font-semibold mb-[1vh]">Pregnancy</div>
          <div className="text-[1.7vw] font-semibold leading-tight text-ink">Gestational age and due date</div>
        </div>
        <div className="bg-white border-t-[3px] border-primary p-[2vh_1.5vw]">
          <div className="text-[1.2vw] uppercase tracking-[0.2em] text-primary font-semibold mb-[1vh]">Biometry</div>
          <div className="text-[1.7vw] font-semibold leading-tight text-ink">CRL, BPD and composite biometry</div>
        </div>
        <div className="bg-white border-t-[3px] border-accent p-[2vh_1.5vw]">
          <div className="text-[1.2vw] uppercase tracking-[0.2em] text-accent font-semibold mb-[1vh]">Growth</div>
          <div className="text-[1.7vw] font-semibold leading-tight text-ink">Estimated fetal weight (EFW)</div>
        </div>
        <div className="bg-white border-t-[3px] border-primary p-[2vh_1.5vw]">
          <div className="text-[1.2vw] uppercase tracking-[0.2em] text-primary font-semibold mb-[1vh]">Haemodynamics</div>
          <div className="text-[1.7vw] font-semibold leading-tight text-ink">Obstetric Doppler (Umb · MCA · Ut)</div>
        </div>
        <div className="bg-white border-t-[3px] border-secondary p-[2vh_1.5vw]">
          <div className="text-[1.2vw] uppercase tracking-[0.2em] text-secondary font-semibold mb-[1vh]">INTERGROWTH</div>
          <div className="text-[1.7vw] font-semibold leading-tight text-ink">Longitudinal growth curve</div>
        </div>
        <div className="bg-white border-t-[3px] border-accent p-[2vh_1.5vw]">
          <div className="text-[1.2vw] uppercase tracking-[0.2em] text-accent font-semibold mb-[1vh]">Screening</div>
          <div className="text-[1.7vw] font-semibold leading-tight text-ink">Trisomy risk (T21 · T18 · T13)</div>
        </div>
        <div className="bg-white border-t-[3px] border-primary p-[2vh_1.5vw]">
          <div className="text-[1.2vw] uppercase tracking-[0.2em] text-primary font-semibold mb-[1vh]">FMF / ASPRE</div>
          <div className="text-[1.7vw] font-semibold leading-tight text-ink">Pre-eclampsia risk</div>
        </div>
      </div>

      <div className="absolute bottom-[4vh] left-[6vw] right-[6vw] text-[1.4vw] text-muted">
        Web, iOS and Android · works offline · patient data never leaves the
        clinic without consent.
      </div>
    </div>
  );
}
