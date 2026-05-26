const base = import.meta.env.BASE_URL;

export default function Cover() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg font-body text-ink">
      {/* Background arc accent */}
      <div className="absolute -top-[30vh] -right-[20vw] w-[70vw] h-[70vw] rounded-full bg-primary/5" />
      <div className="absolute -bottom-[35vh] -left-[15vw] w-[55vw] h-[55vw] rounded-full bg-accent/8" />

      {/* Top bar */}
      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <img
          src={`${base}idalia-logo.png`}
          crossOrigin="anonymous"
          alt="IDALIA"
          className="h-[5vh] w-auto"
        />
        <span className="text-[1.4vw] tracking-[0.3em] uppercase text-muted">
          Pitch Deck · 2026
        </span>
      </div>

      {/* Hero */}
      <div className="absolute left-[6vw] top-[34vh] max-w-[62vw]">
        <div className="text-[1.5vw] tracking-[0.3em] uppercase text-accent font-semibold mb-[3vh]">
          Saúde Materno-Fetal · Software Clínico
        </div>
        <h1 className="font-serif text-[7vw] leading-[0.95] tracking-tight text-primary text-balance">
          Precisão obstétrica,<br className="hidden" />
          <span className="italic text-accent"> em segundos.</span>
        </h1>
        <p className="mt-[4vh] text-[2.1vw] leading-snug text-muted max-w-[55vw] text-pretty">
          Calculadoras baseadas em evidências para clínicas de ginecologia e
          obstetrícia no Brasil e em Portugal.
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-[5vh] left-[6vw] right-[6vw] flex items-end justify-between text-[1.4vw] text-muted">
        <span>idaliacalc.com</span>
        <span className="tracking-wide">Confidencial · Para investidores e parceiros clínicos</span>
      </div>
    </div>
  );
}
