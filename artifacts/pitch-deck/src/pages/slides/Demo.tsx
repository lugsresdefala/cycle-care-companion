export default function Demo() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg font-body text-ink">
      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="text-[1.3vw] tracking-[0.3em] uppercase text-muted font-semibold">
          05 · Demo
        </span>
        <span className="text-[1.3vw] tracking-[0.2em] uppercase text-muted">IDALIA</span>
      </div>

      {/* Left copy column */}
      <div className="absolute left-[6vw] top-[18vh] w-[34vw]">
        <h2 className="font-serif text-[4.6vw] leading-[1] tracking-tight text-primary text-balance">
          Pensado para o
          <span className="italic text-accent"> tempo do consultório.</span>
        </h2>

        <div className="mt-[5vh] flex flex-col gap-[2.5vh]">
          <div className="flex items-start gap-[1.2vw]">
            <span className="font-serif text-[2.6vw] leading-none text-accent mt-[0.3vh]">→</span>
            <div>
              <div className="text-[1.7vw] font-semibold leading-snug">Entrada mínima</div>
              <p className="text-[1.5vw] leading-snug text-muted text-pretty">
                Apenas as medidas do exame. Sem cadastro obrigatório da paciente.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-[1.2vw]">
            <span className="font-serif text-[2.6vw] leading-none text-accent mt-[0.3vh]">→</span>
            <div>
              <div className="text-[1.7vw] font-semibold leading-snug">Percentis ao vivo</div>
              <p className="text-[1.5vw] leading-snug text-muted text-pretty">
                Resultado classificado e plotado na curva à medida que o médico digita.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-[1.2vw]">
            <span className="font-serif text-[2.6vw] leading-none text-accent mt-[0.3vh]">→</span>
            <div>
              <div className="text-[1.7vw] font-semibold leading-snug">Pronto para o laudo</div>
              <p className="text-[1.5vw] leading-snug text-muted text-pretty">
                Bloco de texto pronto para colar no prontuário, com referências.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right product mockup */}
      <div className="absolute right-[6vw] top-[16vh] bottom-[10vh] w-[48vw]">
        <div className="relative h-full w-full rounded-[2vh] bg-white shadow-[0_4vh_8vh_-2vh_rgba(19,48,105,0.18)] border border-line overflow-hidden">
          {/* Browser-ish chrome */}
          <div className="flex items-center gap-[0.6vw] px-[1.5vw] py-[1.5vh] border-b border-line">
            <span className="w-[1.2vh] h-[1.2vh] rounded-full bg-line" />
            <span className="w-[1.2vh] h-[1.2vh] rounded-full bg-line" />
            <span className="w-[1.2vh] h-[1.2vh] rounded-full bg-line" />
            <span className="ml-[1vw] text-[1.1vw] text-muted">idaliacalc.com / biometria</span>
          </div>

          {/* Mock calc UI */}
          <div className="p-[3vh_2.5vw] grid grid-cols-[1.1fr_1fr] gap-[2vw] h-[calc(100%-5vh)]">
            <div>
              <div className="text-[1.1vw] uppercase tracking-[0.2em] text-accent font-semibold">Biometria fetal</div>
              <div className="font-serif text-[2.6vw] leading-tight text-primary mt-[0.5vh]">Biometria composta</div>

              <div className="mt-[3vh] flex flex-col gap-[1.5vh]">
                <div className="flex items-center justify-between border-b border-line pb-[1vh]">
                  <span className="text-[1.4vw] text-muted">DBP</span>
                  <span className="text-[1.6vw] font-semibold">78 mm</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-[1vh]">
                  <span className="text-[1.4vw] text-muted">CC</span>
                  <span className="text-[1.6vw] font-semibold">282 mm</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-[1vh]">
                  <span className="text-[1.4vw] text-muted">CA</span>
                  <span className="text-[1.6vw] font-semibold">271 mm</span>
                </div>
                <div className="flex items-center justify-between border-b border-line pb-[1vh]">
                  <span className="text-[1.4vw] text-muted">CF</span>
                  <span className="text-[1.6vw] font-semibold">59 mm</span>
                </div>
              </div>
            </div>

            <div className="bg-primary text-white rounded-[1.5vh] p-[2vh_1.5vw] flex flex-col">
              <div className="text-[1.1vw] uppercase tracking-[0.2em] text-white/70">Resultado</div>
              <div className="mt-[1.5vh]">
                <div className="text-[1.2vw] text-white/70">Idade gestacional</div>
                <div className="font-serif text-[3.4vw] leading-none mt-[0.5vh]">31s 4d</div>
              </div>
              <div className="mt-[3vh]">
                <div className="text-[1.2vw] text-white/70">PFE (Hadlock)</div>
                <div className="font-serif text-[3.4vw] leading-none mt-[0.5vh]">1 745 g</div>
              </div>
              <div className="mt-auto pt-[2vh] border-t border-white/15">
                <div className="text-[1.2vw] text-white/70">Percentil</div>
                <div className="font-serif text-[2.4vw] text-accent leading-none mt-[0.3vh]">P58</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
