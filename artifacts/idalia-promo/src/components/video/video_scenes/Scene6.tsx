import { motion } from 'framer-motion';

export function Scene6() {
  return (
    <motion.div
      key="scene-outro"
      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--color-bg-light)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Cinematic Background effect */}
      <motion.div 
        className="absolute w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-10 mix-blend-multiply"
        style={{ background: 'var(--color-primary)' }}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1.2 }}
        transition={{ duration: 4, ease: 'easeOut' }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          className="flex items-center gap-[1.5vw]"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Logo Mark */}
          <motion.div
            className="relative w-[5vw] h-[5vw] flex items-center justify-center"
          >
            <motion.svg
              viewBox="0 0 64 64" 
              className="w-full h-full"
              initial={{ rotate: -90 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <circle cx="32" cy="32" r="28" fill="none" stroke="var(--color-primary)" strokeWidth="3" />
              <circle cx="32" cy="32" r="18" fill="none" stroke="var(--color-accent)" strokeWidth="3" />
              <circle cx="32" cy="32" r="6" fill="var(--color-primary)" />
            </motion.svg>
          </motion.div>

          {/* Logo Text */}
          <span
            className="text-[6.5vw] leading-none"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.04em', fontWeight: 600 }}
          >
            Idalia<span style={{ color: 'var(--color-accent)' }}>Calc</span>
          </span>
        </motion.div>

        <motion.div
          className="mt-[4vh] h-[1px] w-[12vw]"
          style={{ background: 'linear-gradient(90deg, transparent, var(--color-line), transparent)' }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />

        <motion.p
          className="mt-[3.5vh] text-[2vw] italic"
          style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-serif)' }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Sua plataforma de medicina fetal.
        </motion.p>
        
        <motion.div
          className="mt-[6vh] px-[2vw] py-[1vh] rounded-full border text-[1vw]"
          style={{ borderColor: 'var(--color-line)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
        >
          idaliacalc.com
        </motion.div>
      </div>
    </motion.div>
  );
}