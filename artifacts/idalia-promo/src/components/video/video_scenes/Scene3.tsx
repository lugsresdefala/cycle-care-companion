import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene3() {
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
      className="absolute inset-0 flex flex-row-reverse items-center justify-between px-32"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, y: 100, filter: 'blur(10px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-xl z-10 pl-16">
        <motion.div
          className="text-[var(--color-accent)] font-bold tracking-widest uppercase text-sm mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        >
          Biometria Fetal
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
            Métricas de
          </motion.span>
          <motion.span 
            className="block text-[var(--color-secondary)]"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
          >
            alto padrão.
          </motion.span>
        </motion.h2>

        <motion.p
          className="text-[1.5vw] text-[var(--color-text-secondary)] font-medium"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
        >
          Análise completa: BPD, HC, AC, FL e Peso Fetal Estimado (EFW).
        </motion.p>
      </div>

      {/* Visual Hero: Biometry Measurements */}
      <div className="relative w-[600px] h-[500px] flex-shrink-0 grid grid-cols-2 gap-6 z-10">
        {[
          { label: 'BPD (DBP)', val: '21 mm', perc: '50th', color: 'var(--color-primary)' },
          { label: 'HC (CC)', val: '74 mm', perc: '55th', color: 'var(--color-secondary)' },
          { label: 'AC (CA)', val: '62 mm', perc: '45th', color: 'var(--color-accent)' },
          { label: 'FL (CF)', val: '9 mm', perc: '60th', color: 'var(--color-success)' }
        ].map((item, i) => (
          <motion.div
            key={i}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 flex flex-col justify-between relative overflow-hidden"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={phase >= 2 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', bounce: 0.4, delay: 0.2 * i }}
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10" style={{ backgroundColor: item.color }} />
            <div className="text-[var(--color-text-secondary)] font-semibold text-lg">{item.label}</div>
            
            <div className="mt-4">
              <motion.div 
                className="text-4xl font-bold"
                style={{ color: item.color, fontFamily: 'var(--font-display)' }}
                initial={{ opacity: 0, x: -20 }}
                animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
              >
                {item.val}
              </motion.div>
              <motion.div 
                className="text-sm font-medium text-gray-400 mt-1"
                initial={{ opacity: 0 }}
                animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
              >
                Percentil: <span className="text-gray-700">{item.perc}</span>
              </motion.div>
            </div>
            
            {/* Animated Graph Line */}
            <motion.div className="mt-4 h-12 relative flex items-end">
              <svg width="100%" height="100%" preserveAspectRatio="none" className="overflow-visible">
                <motion.path 
                  d={`M0,30 Q30,10 60,20 T120,5`}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={phase >= 4 ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 + (i * 0.1) }}
                />
              </svg>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}