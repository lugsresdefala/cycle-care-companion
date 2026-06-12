import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1400),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div
      key="scene-hook"
      className="absolute inset-0 z-10 flex flex-col justify-center px-[8vw]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative z-10 max-w-[70vw]">
        <motion.div
          className="text-[1.4vw] uppercase tracking-[0.3em] font-semibold mb-[3vh]"
          style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          IdaliaCalc · Medicina Fetal
        </motion.div>

        <h1
          className="text-[8vw] leading-[0.95] tracking-tight"
          style={{
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-serif)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, rotateX: 20 }}
            animate={phase >= 1 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 40, rotateX: 20 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Precisão clínica,
          </motion.div>
          <motion.div
            className="italic"
            style={{ color: 'var(--color-accent)' }}
            initial={{ opacity: 0, y: 40, rotateX: 20 }}
            animate={phase >= 2 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 40, rotateX: 20 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            em segundos.
          </motion.div>
        </h1>

        <motion.p
          className="mt-[4vh] text-[2vw] max-w-[55vw] leading-snug"
          style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={phase >= 3 ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          Cálculos clínicos para medicina fetal e saúde reprodutiva.
        </motion.p>
      </div>

      {/* Decorative Brand Elements */}
      <motion.div
        className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] rounded-full"
        style={{ border: '1px solid var(--color-line)' }}
        initial={{ scale: 0.8, opacity: 0, rotate: -30 }}
        animate={{ scale: 1, opacity: 0.6, rotate: 0 }}
        transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute inset-[10%] rounded-full border border-dashed border-[#ED7A2A]/40" />
        <div className="absolute inset-[20%] rounded-full border border-[#133069]/10" />
      </motion.div>
    </motion.div>
  );
}