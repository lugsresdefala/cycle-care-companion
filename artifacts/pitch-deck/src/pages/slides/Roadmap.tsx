export default function Roadmap() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg font-body text-ink">
      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="text-[1.3vw] tracking-[0.3em] uppercase text-muted font-semibold">
          08 · Tração e roadmap
        </span>
        <span className="text-[1.3vw] tracking-[0.2em] uppercase text-muted">IDALIA</span>
      </div>

      <div className="absolute left-[6vw] top-[15vh] max-w-[60vw]">
        <h2 className="font-serif text-[4.6vw] leading-[1] tracking-tight text-primary text-balance">
          Onde estamos,
          <span className="italic text-accent"> para onde vamos.</span>
        </h2>
        <p className="mt-[2vh] text-[1.5vw] leading-snug text-muted max-w-[50vw] text-pretty">
          Produto no ar desde 2025, com receita recorrente e ciclo curto de
          conversão entre médicos.
        </p>
      </div>

      {/* Traction KPI row */}
      <div className="absolute left-[6vw] right-[6vw] top-[33vh] grid grid-cols-4 gap-[2vw]">
        <div className="border-l-2 border-primary pl-[1.2vw]">
          <div className="font-serif text-[3.4vw] leading-none text-primary">8</div>
          <div className="mt-[0.8vh] text-[1.1vw] uppercase tracking-[0.2em] text-muted font-semibold">
            calculadoras
          </div>
          <div className="text-[1.2vw] text-muted/80 mt-[0.4vh] leading-snug">
            cobrindo IG, peso fetal, dopplervelocimetria e risco de pré-eclâmpsia
          </div>
        </div>
        <div className="border-l-2 border-accent pl-[1.2vw]">
          <div className="font-serif text-[3.4vw] leading-none text-accent">PWA</div>
          <div className="mt-[0.8vh] text-[1.1vw] uppercase tracking-[0.2em] text-muted font-semibold">
            mobile no ar
          </div>
          <div className="text-[1.2vw] text-muted/80 mt-[0.4vh] leading-snug">
            instalável no celular, sem download em loja de aplicativos
          </div>
        </div>
        <div className="border-l-2 border-secondary pl-[1.2vw]">
          <div className="font-serif text-[3.4vw] leading-none text-secondary">Stripe</div>
          <div className="mt-[0.8vh] text-[1.1vw] uppercase tracking-[0.2em] text-muted font-semibold">
            assinaturas ao vivo
          </div>
          <div className="text-[1.2vw] text-muted/80 mt-[0.4vh] leading-snug">
            cobrança recorrente em BRL e EUR, com gestão de plano pelo médico
          </div>
        </div>
        <div className="border-l-2 border-primary/40 pl-[1.2vw]">
          <div className="font-serif text-[3.4vw] leading-none text-primary/50">__</div>
          <div className="mt-[0.8vh] text-[1.1vw] uppercase tracking-[0.2em] text-muted font-semibold">
            MRR · assinantes · MAU
          </div>
          <div className="text-[1.2vw] text-muted/80 mt-[0.4vh] leading-snug italic">
            atualizar a cada apresentação a partir do painel interno
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="absolute left-[6vw] right-[6vw] top-[64vh]">
        <div className="relative h-[1px] bg-line w-full">
          <span className="absolute -top-[1vh] left-0 w-[2vh] h-[2vh] rounded-full bg-primary" />
          <span className="absolute -top-[1vh] left-[33%] w-[2vh] h-[2vh] rounded-full bg-accent" />
          <span className="absolute -top-[1vh] left-[66%] w-[2vh] h-[2vh] rounded-full bg-secondary" />
          <span className="absolute -top-[1vh] right-0 w-[2vh] h-[2vh] rounded-full border-2 border-primary bg-bg" />
        </div>

        <div className="grid grid-cols-4 gap-[2vw] mt-[3vh]">
          <div>
            <div className="text-[1.1vw] uppercase tracking-[0.25em] text-primary font-semibold">Hoje</div>
            <div className="font-serif text-[2.2vw] leading-tight text-ink mt-[0.4vh]">Produto no ar</div>
          </div>
          <div>
            <div className="text-[1.1vw] uppercase tracking-[0.25em] text-accent font-semibold">T1 2026</div>
            <div className="font-serif text-[2.2vw] leading-tight text-ink mt-[0.4vh]">Mobile nativo</div>
          </div>
          <div>
            <div className="text-[1.1vw] uppercase tracking-[0.25em] text-secondary font-semibold">T2–T3 2026</div>
            <div className="font-serif text-[2.2vw] leading-tight text-ink mt-[0.4vh]">Piloto em clínicas</div>
          </div>
          <div>
            <div className="text-[1.1vw] uppercase tracking-[0.25em] text-primary font-semibold">T4 2026</div>
            <div className="font-serif text-[2.2vw] leading-tight text-ink mt-[0.4vh]">Integração com EMR</div>
          </div>
        </div>
      </div>
    </div>
  );
}
