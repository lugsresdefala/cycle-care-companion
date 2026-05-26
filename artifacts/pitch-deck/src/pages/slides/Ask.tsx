const base = import.meta.env.BASE_URL;

export default function Ask() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-primary font-body text-white">
      <div className="absolute -top-[30vh] -right-[20vw] w-[70vw] h-[70vw] rounded-full bg-accent/15" />
      <div className="absolute -bottom-[30vh] -left-[20vw] w-[60vw] h-[60vw] rounded-full bg-white/5" />

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="text-[1.3vw] tracking-[0.3em] uppercase text-white/60 font-semibold">
          10 · Convite
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
          O que estamos procurando
        </div>
        <h2 className="font-serif text-[6.4vw] leading-[0.95] tracking-tight text-white text-balance">
          Parceiros para escalar
          <span className="italic text-accent"> a obstetrícia de precisão.</span>
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[10vh] grid grid-cols-3 gap-[3vw]">
        <div className="border-t border-white/30 pt-[2.5vh]">
          <div className="text-[1.2vw] uppercase tracking-[0.25em] text-accent font-semibold mb-[1vh]">Clínicas-piloto</div>
          <p className="text-[1.6vw] leading-snug text-white/85 text-pretty">
            5 clínicas dispostas a testar o IDALIA Clínico Premium por três
            meses, sem custo.
          </p>
        </div>
        <div className="border-t border-white/30 pt-[2.5vh]">
          <div className="text-[1.2vw] uppercase tracking-[0.25em] text-accent font-semibold mb-[1vh]">Capital semente</div>
          <p className="text-[1.6vw] leading-snug text-white/85 text-pretty">
            Rodada para mobile nativo, expansão comercial em PT-BR e integração
            com prontuários.
          </p>
        </div>
        <div className="border-t border-white/30 pt-[2.5vh]">
          <div className="text-[1.2vw] uppercase tracking-[0.25em] text-accent font-semibold mb-[1vh]">Conselho clínico</div>
          <p className="text-[1.6vw] leading-snug text-white/85 text-pretty">
            Especialistas em medicina fetal para validar novos módulos e
            curadoria científica.
          </p>
        </div>
      </div>

      <div className="absolute bottom-[4vh] left-[6vw] right-[6vw] flex items-center justify-between text-[1.4vw] text-white/70">
        <span>contato@idaliacalc.com</span>
        <span>idaliacalc.com</span>
      </div>
    </div>
  );
}
