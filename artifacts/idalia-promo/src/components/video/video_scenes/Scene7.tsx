import { motion } from 'framer-motion';

const CALCULATORS = [
  { id: 'ig', label: 'Idade gestacional', detail: 'DUM · USG · FIV' },
  { id: 'ccn', label: 'Datação por CCN', detail: 'Robinson 1975' },
  { id: 'dbp', label: 'Datação por DBP', detail: '2º trimestre' },
  { id: 'bio', label: 'Biometria fetal', detail: 'DBP · CC · CA · CF' },
  { id: 'pfe', label: 'Peso fetal estimado', detail: 'Hadlock IV' },
  { id: 'cg',  label: 'Curva de crescimento', detail: 'INTERGROWTH-21st' },
  { id: 'dop', label: 'Doppler', detail: 'Umbilical · cerebral' },
  { id: 'pe',  label: 'Risco pré-eclâmpsia', detail: 'FMF 1º trimestre' },
  { id: 'tri', label: 'Risco trissomias', detail: 'NT · marcadores' },
  { id: 'fer', label: 'Fertilidade', detail: 'Ciclo · Transferência FIV' },
];

export function Scene7() {
  return (
    <motion.div
      key="scene-suite"
      className="absolute inset-0 z-10 flex flex-col items-center justify-center px-[8vw]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="text-[1.1vw] uppercase tracking-[0.3em] font-semibold mb-[2vh]"
        style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        01 · Suite clínica
      </motion.div>

      <motion.h2
        className="text-[5vw] leading-[1] text-center mb-[6vh]"
        style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        Dez calculadoras<span style={{ color: 'var(--color-accent)' }}>.</span><br />
        <span className="italic">Um só fluxo.</span>
      </motion.h2>

      <div className="grid grid-cols-5 gap-[1.2vw] w-full max-w-[80vw] relative z-20">
        {CALCULATORS.map((c, i) => {
          // Add some visual variation to the cards
          const isPrimary = i % 3 === 0;
          const isAccent = i === 4;
          
          return (
            <motion.div
              key={c.id}
              className="rounded-[2vh] p-[1.5vw] flex flex-col justify-between"
              style={{
                background: isAccent ? 'var(--color-accent)' : isPrimary ? 'white' : 'var(--color-bg-light)',
                border: isPrimary || !isAccent ? '1px solid var(--color-line)' : 'none',
                boxShadow: isPrimary ? '0 12px 30px rgba(13, 22, 38, 0.05)' : 'none',
                height: '14vh',
              }}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.6 + i * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div
                className="text-[0.8vw] uppercase tracking-[0.2em] font-semibold"
                style={{ color: isAccent ? 'rgba(255,255,255,0.8)' : isPrimary ? 'var(--color-accent)' : 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <div
                  className="text-[1.1vw] font-semibold leading-tight mb-[0.5vh]"
                  style={{ color: isAccent ? 'white' : 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
                >
                  {c.label}
                </div>
                <div
                  className="text-[0.85vw]"
                  style={{ color: isAccent ? 'rgba(255,255,255,0.9)' : 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
                >
                  {c.detail}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="mt-[5vh] inline-flex items-center gap-[1vw] px-[1.5vw] py-[1vh] rounded-full border bg-white/50 backdrop-blur-md"
        style={{ borderColor: 'var(--color-line)' }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.6 }}
      >
        <span className="w-[0.8vw] h-[0.8vw] rounded-full" style={{ background: 'var(--color-secondary)' }} />
        <span className="text-[1vw]" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
          Referenciais validados · <strong style={{ color: 'var(--color-text-primary)' }}>INTERGROWTH-21st · Hadlock · FMF</strong>
        </span>
      </motion.div>
    </motion.div>
  );
}