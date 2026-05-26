import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3500),
      setTimeout(() => setPhase(4), 5000),
      setTimeout(() => setPhase(5), 11000), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-between px-32"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-xl z-10">
        <motion.div
          className="text-[var(--color-secondary)] font-bold tracking-widest uppercase text-sm mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        >
          Datação Gestacional
        </motion.div>
        
        <motion.h2 
          className="text-[3.5vw] font-bold text-[var(--color-text-primary)] leading-tight mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <motion.span 
            className="block"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
          >
            A roda gestacional,
          </motion.span>
          <motion.span 
            className="block text-[var(--color-primary)]"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
          >
            reinventada.
          </motion.span>
        </motion.h2>

        <motion.p
          className="text-[1.5vw] text-[var(--color-text-secondary)] font-medium"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
        >
          Cálculos precisos baseados na DUM ou na primeira ultrassonografia.
        </motion.p>
      </div>

      {/* Visual Hero: Animated Gestational Wheel */}
      <motion.div 
        className="relative w-[500px] h-[500px] flex-shrink-0"
        initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
        animate={phase >= 1 ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.8, rotate: -30 }}
        transition={{ duration: 1.5, type: 'spring', bounce: 0.3 }}
      >
        {/* Outer Ring */}
        <motion.div 
          className="absolute inset-0 rounded-full border-4 border-[var(--color-primary)] opacity-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />
        {/* Ticks */}
        <div className="absolute inset-0 wheel-pattern opacity-30 rounded-full mask-radial" />
        
        {/* Middle Ring */}
        <motion.div 
          className="absolute inset-8 rounded-full border-[12px] border-[var(--color-accent)] opacity-40"
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Inner Dial */}
        <motion.div 
          className="absolute inset-16 rounded-full bg-white shadow-2xl flex items-center justify-center border border-gray-100"
          animate={{ rotate: phase >= 4 ? 120 : 0 }}
          transition={{ duration: 3, type: 'spring', bounce: 0.2 }}
        >
          <div className="text-center">
            <motion.div 
              className="text-[var(--color-text-secondary)] text-sm font-semibold mb-2"
              animate={{ opacity: phase >= 4 ? 0 : 1 }}
            >
              Idade Gestacional
            </motion.div>
            <motion.div 
              className="text-6xl font-bold text-[var(--color-primary)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {phase >= 4 ? "12" : "0"}
              <span className="text-2xl text-[var(--color-text-secondary)]">s</span>
              {phase >= 4 ? "4" : "0"}
              <span className="text-2xl text-[var(--color-text-secondary)]">d</span>
            </motion.div>
            <motion.div 
              className="mt-4 text-[var(--color-secondary)] font-medium text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 4 ? 1 : 0 }}
            >
              DPP: 14 Out 2024
            </motion.div>
          </div>
          
          {/* Indicator Line */}
          <div className="absolute top-0 left-1/2 w-1 h-8 bg-[var(--color-primary)] -translate-x-1/2 -translate-y-4 rounded-full" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}