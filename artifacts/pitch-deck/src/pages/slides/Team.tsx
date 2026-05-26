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
        <p className="mt-[2.5vh] text-[1.5vw] leading-snug text-muted max-w-[50vw] text-pretty">
          Time enxuto, com responsabilidade clínica e técnica claramente
          divididas desde o primeiro dia.
        </p>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[12vh] grid grid-cols-3 gap-[3vw]">
        {/* Clinical */}
        <div className="border-t-2 border-primary pt-[2.5vh]">
          <div className="flex items-center gap-[1vw] mb-[1.5vh]">
            <div className="w-[5vw] h-[5vw] rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-serif text-[2.2vw] text-primary">
              MD
            </div>
            <div>
              <div className="text-[1vw] uppercase tracking-[0.25em] text-primary font-semibold">
                Direção clínica
              </div>
              <div className="text-[1.1vw] text-muted/70 italic">cofundador · CMO</div>
            </div>
          </div>
          <div className="font-serif text-[2.2vw] leading-tight text-ink">
            Médico fundador
          </div>
          <p className="text-[1.3vw] leading-snug text-muted mt-[1vh] text-pretty">
            Ginecologista-obstetra com prática em medicina fetal. Define as
            referências, valida cada fórmula e responde pela conformidade
            clínica do produto.
          </p>
        </div>

        {/* Product / Eng */}
        <div className="border-t-2 border-accent pt-[2.5vh]">
          <div className="flex items-center gap-[1vw] mb-[1.5vh]">
            <div className="w-[5vw] h-[5vw] rounded-full bg-accent/15 border border-accent/40 flex items-center justify-center font-serif text-[2.2vw] text-accent">
              CTO
            </div>
            <div>
              <div className="text-[1vw] uppercase tracking-[0.25em] text-accent font-semibold">
                Produto e engenharia
              </div>
              <div className="text-[1.1vw] text-muted/70 italic">cofundador · CTO</div>
            </div>
          </div>
          <div className="font-serif text-[2.2vw] leading-tight text-ink">
            Cofundador técnico
          </div>
          <p className="text-[1.3vw] leading-snug text-muted mt-[1vh] text-pretty">
            Lidera produto, design e arquitetura da plataforma — web, mobile,
            pagamentos e integrações com EMR.
          </p>
        </div>

        {/* Advisors */}
        <div className="border-t-2 border-secondary pt-[2.5vh]">
          <div className="flex items-center gap-[1vw] mb-[1.5vh]">
            <div className="w-[5vw] h-[5vw] rounded-full bg-secondary/15 border border-secondary/40 flex items-center justify-center font-serif text-[1.6vw] text-secondary">
              ADV
            </div>
            <div>
              <div className="text-[1vw] uppercase tracking-[0.25em] text-secondary font-semibold">
                Conselho consultivo
              </div>
              <div className="text-[1.1vw] text-muted/70 italic">2–3 membros</div>
            </div>
          </div>
          <div className="font-serif text-[2.2vw] leading-tight text-ink">
            Medicina fetal BR/PT
          </div>
          <p className="text-[1.3vw] leading-snug text-muted mt-[1vh] text-pretty">
            Médicos e pesquisadores em obstetrícia de alto risco no Brasil e em
            Portugal, com vínculos a residências médicas e sociedades de
            especialidade.
          </p>
        </div>
      </div>

      <div className="absolute bottom-[4vh] left-[6vw] right-[6vw] text-[1vw] text-muted/60 italic">
        Nomes, fotos e bios completas inseridos por apresentação a partir do
        kit interno — manter a estrutura de três pilares.
      </div>
    </div>
  );
}
