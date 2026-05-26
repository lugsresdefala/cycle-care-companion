export default function Pricing() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg font-body text-ink">
      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between">
        <span className="text-[1.3vw] tracking-[0.3em] uppercase text-muted font-semibold">
          07 · Modelo de receita
        </span>
        <span className="text-[1.3vw] tracking-[0.2em] uppercase text-muted">IDALIA</span>
      </div>

      <div className="absolute left-[6vw] top-[15vh] max-w-[70vw]">
        <h2 className="font-serif text-[4.6vw] leading-[1] tracking-tight text-primary text-balance">
          Assinatura mensal,
          <span className="italic text-accent"> três planos.</span>
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[34vh] grid grid-cols-3 gap-[2vw]">
        {/* Pessoal */}
        <div className="bg-white border border-line p-[3vh_2vw] flex flex-col h-[52vh]">
          <div className="text-[1.2vw] uppercase tracking-[0.25em] text-muted font-semibold">Pessoal</div>
          <div className="mt-[2vh] flex items-baseline gap-[0.4vw]">
            <span className="font-serif text-[5vw] leading-none text-primary">R$ 19,90</span>
          </div>
          <div className="text-[1.3vw] text-muted mt-[0.5vh]">por mês · uso individual</div>
          <div className="mt-[3vh] flex flex-col gap-[1.5vh] text-[1.5vw] text-ink/85 leading-snug">
            <span>Todas as calculadoras essenciais</span>
            <span>Histórico local e exportação</span>
            <span>Suporte por e-mail</span>
          </div>
          <div className="mt-auto text-[1.2vw] text-muted">Para residentes e médicos solo</div>
        </div>

        {/* Clínico */}
        <div className="bg-primary text-white p-[3vh_2vw] flex flex-col h-[52vh] relative">
          <div className="absolute top-[2vh] right-[1.5vw] text-[1vw] tracking-[0.25em] uppercase bg-accent text-white px-[0.8vw] py-[0.4vh] font-semibold">Mais escolhido</div>
          <div className="text-[1.2vw] uppercase tracking-[0.25em] text-white/70 font-semibold">Clínico</div>
          <div className="mt-[2vh] flex items-baseline gap-[0.4vw]">
            <span className="font-serif text-[5vw] leading-none text-white">R$ 49,90</span>
          </div>
          <div className="text-[1.3vw] text-white/70 mt-[0.5vh]">por mês · por médico</div>
          <div className="mt-[3vh] flex flex-col gap-[1.5vh] text-[1.5vw] text-white/90 leading-snug">
            <span>Tudo do Pessoal</span>
            <span>Gestão de pacientes e laudos</span>
            <span>Rastreamento de trissomias e PE</span>
            <span>Sincronização entre dispositivos</span>
          </div>
          <div className="mt-auto text-[1.2vw] text-white/60">Para consultório obstétrico</div>
        </div>

        {/* Clínico Premium */}
        <div className="bg-white border border-line p-[3vh_2vw] flex flex-col h-[52vh] border-t-[4px] border-t-accent">
          <div className="text-[1.2vw] uppercase tracking-[0.25em] text-accent font-semibold">Clínico Premium</div>
          <div className="mt-[2vh] flex items-baseline gap-[0.4vw]">
            <span className="font-serif text-[5vw] leading-none text-primary">R$ 99,90</span>
          </div>
          <div className="text-[1.3vw] text-muted mt-[0.5vh]">por mês · por médico</div>
          <div className="mt-[3vh] flex flex-col gap-[1.5vh] text-[1.5vw] text-ink/85 leading-snug">
            <span>Tudo do Clínico</span>
            <span>Multiusuário e perfis da clínica</span>
            <span>Logo no laudo e marca da clínica</span>
            <span>Suporte prioritário e onboarding</span>
          </div>
          <div className="mt-auto text-[1.2vw] text-muted">Para clínicas de medicina fetal</div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] left-[6vw] right-[6vw] text-[1.3vw] text-muted">
        Cobrança via Stripe · BRL hoje · EUR no rollout Portugal.
      </div>
    </div>
  );
}
