import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import idaliaLogo from '@assets/idalia_logo.png';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 3000),
      setTimeout(() => setPhase(4), 4500),
      setTimeout(() => setPhase(5), 7000), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -50, filter: 'blur(10px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-col items-center z-10">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={phase >= 1 ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="mb-8"
        >
          <img src={idaliaLogo} alt="IDALIA Calc" className="h-24 w-auto object-contain drop-shadow-xl" />
        </motion.div>

        <motion.div className="text-center overflow-hidden h-24">
          <motion.h1 
            className="text-[4vw] font-bold text-[var(--color-text-primary)]"
            initial={{ y: '100%' }}
            animate={phase >= 2 ? { y: 0 } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Precisão clínica.
          </motion.h1>
        </motion.div>

        <motion.div className="text-center overflow-hidden h-24">
          <motion.h1 
            className="text-[4vw] font-bold text-[var(--color-primary)]"
            initial={{ y: '100%' }}
            animate={phase >= 3 ? { y: 0 } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Decisões seguras.
          </motion.h1>
        </motion.div>

        <motion.p
          className="mt-8 text-[1.5vw] text-[var(--color-text-secondary)] font-medium max-w-2xl text-center"
          initial={{ opacity: 0, filter: 'blur(8px)' }}
          animate={phase >= 4 ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.8 }}
        >
          A ferramenta definitiva para obstetras e ginecologistas.
        </motion.p>
      </div>

      {/* Decorative medical crosses */}
      <motion.div 
        className="absolute top-20 right-32 text-[var(--color-secondary)] opacity-20"
        initial={{ rotate: -45, scale: 0 }}
        animate={phase >= 1 ? { rotate: 0, scale: 1 } : { rotate: -45, scale: 0 }}
        transition={{ type: 'spring', delay: 0.8 }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 10.5H13.5V5C13.5 4.17 12.83 3.5 12 3.5C11.17 3.5 10.5 4.17 10.5 5V10.5H5C4.17 10.5 3.5 11.17 3.5 12C3.5 12.83 4.17 13.5 5 13.5H10.5V19C10.5 19.83 11.17 20.5 12 20.5C12.83 20.5 13.5 19.83 13.5 19V13.5H19C19.83 13.5 20.5 12.83 20.5 12C20.5 11.17 19.83 10.5 19 10.5Z"/>
        </svg>
      </motion.div>
    </motion.div>
  );
}