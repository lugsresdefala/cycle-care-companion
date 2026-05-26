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

      <div className="absolute left-[6vw] top-[17vh] max-w-[55vw]">
        <h2 className="font-serif text-[5vw] leading-[1] tracking-tight text-white text-balance">
          Clínicas de obstetrícia no
          <span className="italic text-accent"> Brasil e em Portugal.</span>
        </h2>
        <p className="mt-[3vh] text-[1.7vw] leading-snug text-white/75 max-w-[48vw] text-pretty">
          Um mercado fragmentado, em português, com forte adoção de software
          clínico e demanda por ferramentas de apoio à decisão.
        </p>
      </div>

      {/* Stats column */}
      <div className="absolute right-[6vw] top-[18vh] w-[34vw] flex flex-col gap-[2.8vh]">
        <div className="border-l-2 border-accent pl-[1.5vw]">
          <div className="font-serif text-[5.6vw] leading-none text-white">~30k</div>
          <div className="mt-[1vh] text-[1.4vw] text-white/70 leading-snug">
            ginecologistas-obstetras com registro ativo no Brasil
            <sup className="text-accent ml-[0.3vw]">¹</sup>
          </div>
        </div>
        <div className="border-l-2 border-accent pl-[1.5vw]">
          <div className="font-serif text-[5.6vw] leading-none text-white">~2,8k</div>
          <div className="mt-[1vh] text-[1.4vw] text-white/70 leading-snug">
            ginecologistas-obstetras inscritos em Portugal
            <sup className="text-accent ml-[0.3vw]">²</sup>
          </div>
        </div>
        <div className="border-l-2 border-accent pl-[1.5vw]">
          <div className="font-serif text-[5.6vw] leading-none text-white">~2,5M</div>
          <div className="mt-[1vh] text-[1.4vw] text-white/70 leading-snug">
            nascimentos/ano nos dois países combinados
            <sup className="text-accent ml-[0.3vw]">³</sup>
          </div>
        </div>
      </div>

      {/* TAM/SAM band */}
      <div className="absolute left-[6vw] bottom-[12vh] right-[6vw] grid grid-cols-3 gap-[2vw]">
        <div>
          <div className="text-[1vw] uppercase tracking-[0.25em] text-accent font-semibold">TAM</div>
          <div className="font-serif text-[2.2vw] leading-tight text-white mt-[0.5vh]">
            ~33k médicos GO
          </div>
          <div className="text-[1.1vw] text-white/60 mt-[0.3vh]">
            Brasil + Portugal <span className="text-white/40">(soma de ¹ e ²)</span>
          </div>
        </div>
        <div>
          <div className="text-[1vw] uppercase tracking-[0.25em] text-accent font-semibold">SAM</div>
          <div className="font-serif text-[2.2vw] leading-tight text-white mt-[0.5vh]">
            ~8k em medicina fetal
          </div>
          <div className="text-[1.1vw] text-white/60 mt-[0.3vh]">
            ~25% atua em ultrassom obstétrico
            <sup className="text-accent ml-[0.3vw]">⁴</sup>
          </div>
        </div>
        <div>
          <div className="text-[1vw] uppercase tracking-[0.25em] text-accent font-semibold">SOM 36m</div>
          <div className="font-serif text-[2.2vw] leading-tight text-white mt-[0.5vh]">
            500–1.000 assinantes
          </div>
          <div className="text-[1.1vw] text-white/60 mt-[0.3vh]">
            6–12% do SAM em clínicas privadas BR/PT
          </div>
        </div>
      </div>

      <div className="absolute bottom-[4vh] left-[6vw] right-[6vw] text-[0.9vw] text-white/45 leading-snug">
        ¹ Conselho Federal de Medicina (CFM) — Demografia Médica no Brasil, 2023.
        &nbsp;² Ordem dos Médicos (OM) — Estatística do Colégio de Ginecologia/Obstetrícia, 2023.
        &nbsp;³ IBGE (Brasil) e INE (Portugal), 2023.
        &nbsp;⁴ Estimativa interna a partir de SBUS/FMF; SOM derivado por penetração-alvo em clínicas privadas.
      </div>
    </div>
  );
}
