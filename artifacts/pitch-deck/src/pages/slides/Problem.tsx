export default function Problem() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg font-body text-ink">
      {/* Section label */}
      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="text-[1.3vw] tracking-[0.3em] uppercase text-muted font-semibold">
          01 · Problema
        </span>
        <span className="text-[1.3vw] tracking-[0.2em] uppercase text-muted">IDALIA</span>
      </div>

      {/* Headline */}
      <div className="absolute left-[6vw] top-[16vh] max-w-[60vw]">
        <h2 className="font-serif text-[5.2vw] leading-[1] tracking-tight text-primary text-balance">
          A biometria fetal ainda é feita
          <span className="italic text-accent"> à mão.</span>
        </h2>
        <p className="mt-[3vh] text-[1.9vw] leading-snug text-muted max-w-[52vw] text-pretty">
          O obstetra alterna entre o ultrassom, tabelas impressas, calculadoras
          dispersas e o prontuário. Cada exame perde minutos preciosos e abre
          espaço para erro.
        </p>
      </div>

      {/* Three problem points */}
      <div className="absolute left-[6vw] right-[6vw] bottom-[8vh] grid grid-cols-3 gap-[3vw]">
        <div className="border-t-2 border-primary/80 pt-[2.5vh]">
          <div className="text-[1.3vw] tracking-[0.25em] uppercase text-primary font-semibold mb-[1.5vh]">
            Tempo
          </div>
          <p className="text-[1.7vw] leading-snug text-ink/85 text-pretty">
            5 a 8 minutos por gestante somente em datação, biometria e
            percentis.
          </p>
        </div>
        <div className="border-t-2 border-accent pt-[2.5vh]">
          <div className="text-[1.3vw] tracking-[0.25em] uppercase text-accent font-semibold mb-[1.5vh]">
            Variabilidade
          </div>
          <p className="text-[1.7vw] leading-snug text-ink/85 text-pretty">
            Fórmulas e curvas diferentes entre colegas geram laudos
            inconsistentes na mesma clínica.
          </p>
        </div>
        <div className="border-t-2 border-secondary pt-[2.5vh]">
          <div className="text-[1.3vw] tracking-[0.25em] uppercase text-secondary font-semibold mb-[1.5vh]">
            Risco
          </div>
          <p className="text-[1.7vw] leading-snug text-ink/85 text-pretty">
            Cálculos manuais de risco de trissomias e pré-eclâmpsia continuam
            sujeitos a falha humana.
          </p>
        </div>
      </div>
    </div>
  );
}
