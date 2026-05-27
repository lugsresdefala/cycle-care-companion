import { motion } from 'framer-motion';

const CALCULATORS = [
  { id: 'ig', label: 'Idade gestacional', detail: 'DUM · USG · FIV' },
  { id: 'ccn', label: 'Datação por CCN', detail: 'Robinson 1975' },
  { id: 'dbp', label: 'Datação por DBP', detail: '2º trimestre' },
  { id: 'bio', label: 'Biometria fetal', detail: 'DBP · CC · CA · CF' },
  { id: 'pfe', label: 'Peso fetal estimado', detail: 'Hadlock IV' },
  { id: 'cg',  label: 'Curva de crescimento', detail: 'INTERGROWTH-21st' },
  { id: 'dop', label: 'Doppler', detail: 'Umbilical · cerebral' },
  { id: 'pe',  label: 'Risco de pré-eclâmpsia', detail: 'FMF 1º trimestre' },
  { id: 'tri', label: 'Risco de trissomias', detail: 'NT · marcadores' },
  { id: 'fer', label: 'Fertilidade · FIV', detail: 'Transferência' },
];

export function Scene7() {
  return (
    <motion.div
      key="scene-suite"
      className="absolute inset-0 z-10 flex flex-col items-center justify-center px-[6vw]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-[1.1vw] uppercase tracking-[0.4em] font-semibold mb-[1.4vh]"
        style={{ color: '#ED7A2A', fontFamily: 'var(--font-display)' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        01 · Suite clínica
      </motion.div>

      <motion.h2
        className="text-[4.4vw] leading-[1] font-bold text-center mb-[4.5vh]"
        style={{ color: '#0E2350', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        Dez calculadoras<span style={{ color: '#ED7A2A' }}>.</span> Um só prontuário.
      </motion.h2>

      <div className="grid grid-cols-5 gap-[1vw] w-full max-w-[78vw]">
        {CALCULATORS.map((c, i) => (
          <motion.div
            key={c.id}
            className="rounded-2xl bg-white px-[1vw] py-[1.6vh] flex flex-col"
            style={{
              border: '1px solid #E1E6F1',
              boxShadow: '0 8px 24px rgba(14,35,80,0.06)',
              minHeight: '12vh',
            }}
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.55,
              delay: 0.7 + i * 0.09,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div
              className="text-[0.7vw] uppercase tracking-[0.3em] mb-[0.6vh] font-bold"
              style={{ color: '#ED7A2A', fontFamily: 'var(--font-mono)' }}
            >
              {String(i + 1).padStart(2, '0')}
            </div>
            <div
              className="text-[0.95vw] font-bold leading-tight mb-[0.4vh]"
              style={{ color: '#0E2350', fontFamily: 'var(--font-display)' }}
            >
              {c.label}
            </div>
            <div
              className="text-[0.75vw] mt-auto"
              style={{ color: '#6B7384', fontFamily: 'var(--font-body)' }}
            >
              {c.detail}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-[3vh] flex items-center gap-[0.8vw]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.9 }}
      >
        <span className="w-[0.6vw] h-[0.6vw] rounded-full" style={{ background: '#ED7A2A' }} />
        <span className="text-[1vw] font-medium" style={{ color: '#3A4865', fontFamily: 'var(--font-body)' }}>
          Referenciais validados · INTERGROWTH-21st · Hadlock · FMF
        </span>
      </motion.div>
    </motion.div>
  );
}
