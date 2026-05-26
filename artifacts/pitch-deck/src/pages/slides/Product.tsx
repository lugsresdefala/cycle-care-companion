export default function Product() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg font-body text-ink">
      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="text-[1.3vw] tracking-[0.3em] uppercase text-muted font-semibold">
          04 · Produto
        </span>
        <span className="text-[1.3vw] tracking-[0.2em] uppercase text-muted">IDALIA</span>
      </div>

      <div className="absolute left-[6vw] top-[15vh] max-w-[60vw]">
        <h2 className="font-serif text-[4.4vw] leading-[1] tracking-tight text-primary text-balance">
          Oito módulos clínicos,
          <span className="italic text-accent"> um único fluxo.</span>
        </h2>
      </div>

      {/* Module grid */}
      <div className="absolute left-[6vw] right-[6vw] top-[37vh] grid grid-cols-4 grid-rows-2 gap-[1.5vw]">
        <div className="bg-white border-t-[3px] border-accent p-[2vh_1.5vw]">
          <div className="text-[1.2vw] uppercase tracking-[0.2em] text-accent font-semibold mb-[1vh]">Fertilidade</div>
          <div className="text-[1.7vw] font-semibold leading-tight text-ink">Ciclo menstrual e período fértil</div>
        </div>
        <div className="bg-white border-t-[3px] border-secondary p-[2vh_1.5vw]">
          <div className="text-[1.2vw] uppercase tracking-[0.2em] text-secondary font-semibold mb-[1vh]">Gestação</div>
          <div className="text-[1.7vw] font-semibold leading-tight text-ink">Idade gestacional e DPP</div>
        </div>
        <div className="bg-white border-t-[3px] border-primary p-[2vh_1.5vw]">
          <div className="text-[1.2vw] uppercase tracking-[0.2em] text-primary font-semibold mb-[1vh]">Biometria</div>
          <div className="text-[1.7vw] font-semibold leading-tight text-ink">CRL, DBP e biometria composta</div>
        </div>
        <div className="bg-white border-t-[3px] border-accent p-[2vh_1.5vw]">
          <div className="text-[1.2vw] uppercase tracking-[0.2em] text-accent font-semibold mb-[1vh]">Crescimento</div>
          <div className="text-[1.7vw] font-semibold leading-tight text-ink">Peso fetal estimado (PFE)</div>
        </div>
        <div className="bg-white border-t-[3px] border-primary p-[2vh_1.5vw]">
          <div className="text-[1.2vw] uppercase tracking-[0.2em] text-primary font-semibold mb-[1vh]">Hemodinâmica</div>
          <div className="text-[1.7vw] font-semibold leading-tight text-ink">Doppler obstétrico (Umb · ACM · Ut)</div>
        </div>
        <div className="bg-white border-t-[3px] border-secondary p-[2vh_1.5vw]">
          <div className="text-[1.2vw] uppercase tracking-[0.2em] text-secondary font-semibold mb-[1vh]">INTERGROWTH</div>
          <div className="text-[1.7vw] font-semibold leading-tight text-ink">Curva de crescimento longitudinal</div>
        </div>
        <div className="bg-white border-t-[3px] border-accent p-[2vh_1.5vw]">
          <div className="text-[1.2vw] uppercase tracking-[0.2em] text-accent font-semibold mb-[1vh]">Rastreamento</div>
          <div className="text-[1.7vw] font-semibold leading-tight text-ink">Risco de trissomias (T21 · T18 · T13)</div>
        </div>
        <div className="bg-white border-t-[3px] border-primary p-[2vh_1.5vw]">
          <div className="text-[1.2vw] uppercase tracking-[0.2em] text-primary font-semibold mb-[1vh]">FMF / ASPRE</div>
          <div className="text-[1.7vw] font-semibold leading-tight text-ink">Risco de pré-eclâmpsia</div>
        </div>
      </div>

      <div className="absolute bottom-[4vh] left-[6vw] right-[6vw] text-[1.4vw] text-muted">
        Web, iOS e Android · funciona offline · dados da paciente nunca saem da
        clínica sem consentimento.
      </div>
    </div>
  );
}
