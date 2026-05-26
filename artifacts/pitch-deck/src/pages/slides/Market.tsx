export default function Market() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-primary font-body text-white">
      {/* Subtle radial */}
      <div className="absolute -top-[30vh] -left-[20vw] w-[70vw] h-[70vw] rounded-full bg-white/5" />
      <div className="absolute -bottom-[20vh] -right-[10vw] w-[50vw] h-[50vw] rounded-full bg-accent/15" />

      {/* Header */}
      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="text-[1.3vw] tracking-[0.3em] uppercase text-white/60 font-semibold">
          02 · Mercado
        </span>
        <span className="text-[1.3vw] tracking-[0.2em] uppercase text-white/60">IDALIA</span>
      </div>

      <div className="absolute left-[6vw] top-[18vh] max-w-[55vw]">
        <h2 className="font-serif text-[5vw] leading-[1] tracking-tight text-white text-balance">
          Clínicas de obstetrícia no
          <span className="italic text-accent"> Brasil e em Portugal.</span>
        </h2>
        <p className="mt-[3vh] text-[1.8vw] leading-snug text-white/75 max-w-[48vw] text-pretty">
          Um mercado fragmentado, em português, com forte adoção de software
          clínico e demanda por ferramentas de apoio à decisão.
        </p>
      </div>

      {/* Stats column */}
      <div className="absolute right-[6vw] top-[20vh] w-[32vw] flex flex-col gap-[3vh]">
        <div className="border-l-2 border-accent pl-[1.5vw]">
          <div className="font-serif text-[6vw] leading-none text-white">~30k</div>
          <div className="mt-[1vh] text-[1.5vw] text-white/70 leading-snug">
            ginecologistas-obstetras em atuação no Brasil <span className="text-white/40">[unverified]</span>
          </div>
        </div>
        <div className="border-l-2 border-accent pl-[1.5vw]">
          <div className="font-serif text-[6vw] leading-none text-white">~3k</div>
          <div className="mt-[1vh] text-[1.5vw] text-white/70 leading-snug">
            ginecologistas-obstetras em Portugal <span className="text-white/40">[unverified]</span>
          </div>
        </div>
        <div className="border-l-2 border-accent pl-[1.5vw]">
          <div className="font-serif text-[5vw] leading-none text-white">PT-BR</div>
          <div className="mt-[1vh] text-[1.5vw] text-white/70 leading-snug">
            interface, referências e suporte em português — um diferencial
            estrutural diante de concorrentes globais.
          </div>
        </div>
      </div>

      <div className="absolute bottom-[5vh] left-[6vw] right-[6vw] text-[1.3vw] text-white/50">
        Beachhead: clínicas privadas de medicina fetal · expansão para hospitais
        e residências médicas.
      </div>
    </div>
  );
}
