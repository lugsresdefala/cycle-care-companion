export default function Team() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg font-body text-ink">
      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="text-[1.3vw] tracking-[0.3em] uppercase text-muted font-semibold">
          09 · Equipe
        </span>
        <span className="text-[1.3vw] tracking-[0.2em] uppercase text-muted">IDALIA</span>
      </div>

      <div className="absolute left-[6vw] top-[16vh] max-w-[60vw]">
        <h2 className="font-serif text-[4.8vw] leading-[1] tracking-tight text-primary text-balance">
          Medicina fetal e engenharia,
          <span className="italic text-accent"> na mesma mesa.</span>
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[10vh] grid grid-cols-3 gap-[3vw]">
        <div className="border-t-2 border-primary pt-[2.5vh]">
          <div className="text-[1.2vw] uppercase tracking-[0.25em] text-primary font-semibold mb-[1vh]">Direção clínica</div>
          <div className="font-serif text-[2.6vw] leading-tight text-ink">[Nome do médico fundador]</div>
          <p className="text-[1.5vw] leading-snug text-muted mt-[1vh] text-pretty">
            Ginecologista-obstetra, especialista em medicina fetal. Garante a
            fidelidade clínica de cada fórmula.
          </p>
        </div>
        <div className="border-t-2 border-accent pt-[2.5vh]">
          <div className="text-[1.2vw] uppercase tracking-[0.25em] text-accent font-semibold mb-[1vh]">Produto e engenharia</div>
          <div className="font-serif text-[2.6vw] leading-tight text-ink">[Nome do cofundador técnico]</div>
          <p className="text-[1.5vw] leading-snug text-muted mt-[1vh] text-pretty">
            Lidera produto, design e arquitetura da plataforma — web, mobile e
            integrações.
          </p>
        </div>
        <div className="border-t-2 border-secondary pt-[2.5vh]">
          <div className="text-[1.2vw] uppercase tracking-[0.25em] text-secondary font-semibold mb-[1vh]">Conselho consultivo</div>
          <div className="font-serif text-[2.6vw] leading-tight text-ink">[Nomes a confirmar]</div>
          <p className="text-[1.5vw] leading-snug text-muted mt-[1vh] text-pretty">
            Médicos e pesquisadores brasileiros e portugueses em obstetrícia de
            alto risco.
          </p>
        </div>
      </div>

      <div className="absolute bottom-[4vh] left-[6vw] right-[6vw] text-[1.3vw] text-muted">
        Equipe a personalizar antes de cada apresentação — campos entre colchetes
        sinalizam itens a preencher.
      </div>
    </div>
  );
}
