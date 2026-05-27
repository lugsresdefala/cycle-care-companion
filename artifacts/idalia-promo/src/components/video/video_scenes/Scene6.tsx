import { motion } from 'framer-motion';

export function Scene6() {
  return (
    <motion.div
      key="scene-outro"
      className="absolute inset-0 z-10 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6 }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="grid-outro" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#133069" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#grid-outro)" />
      </svg>

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          className="flex items-center gap-[1.2vw]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.svg
            width="64" height="64" viewBox="0 0 64 64" className="w-[5vw] h-[5vw]"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          >
            <circle cx="32" cy="32" r="28" fill="none" stroke="#133069" strokeWidth="2.5" />
            <circle cx="32" cy="32" r="16" fill="none" stroke="#ED7A2A" strokeWidth="2.5" />
            <circle cx="32" cy="32" r="4" fill="#133069" />
          </motion.svg>
          <span
            className="text-[6vw] font-bold leading-none"
            style={{ color: '#0E2350', fontFamily: 'var(--font-display)', letterSpacing: '-0.04em' }}
          >
            Idalia<span style={{ color: '#ED7A2A' }}>Calc</span>
          </span>
        </motion.div>

        <motion.div
          className="mt-[3vh] h-[2px] w-[8vw]"
          style={{ background: 'linear-gradient(90deg, transparent, #ED7A2A, transparent)' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />

        <motion.p
          className="mt-[3vh] text-[1.8vw]"
          style={{ color: '#3A4865', fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          Sua plataforma de medicina fetal.
        </motion.p>
      </div>
    </motion.div>
  );
}
