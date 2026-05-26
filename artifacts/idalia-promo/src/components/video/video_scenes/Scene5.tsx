import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 3000),
      setTimeout(() => setPhase(4), 9000), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const tiers = [
    { name: 'Básico', price: 'Grátis', desc: 'Calculadoras essenciais', color: 'var(--color-text-secondary)', delay: 0 },
    { name: 'Pro', price: 'R$ 49', period: '/mês', desc: 'Prontuário completo + Biometria', color: 'var(--color-primary)', isPop: true, delay: 0.2 },
    { name: 'Clínica', price: 'R$ 149', period: '/mês', desc: 'Múltiplos usuários', color: 'var(--color-secondary)', delay: 0.4 },
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center px-20"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="text-center z-10 mb-12"
      >
        <motion.div
          className="text-[var(--color-secondary)] font-bold tracking-widest uppercase text-sm mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        >
          Planos Flexíveis
        </motion.div>
        
        <motion.h2 
          className="text-[3vw] font-bold text-[var(--color-text-primary)] leading-tight"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.1 }}
        >
          Escolha a melhor assinatura para sua prática.
        </motion.h2>
      </motion.div>

      <div className="flex items-end justify-center gap-6 w-full max-w-5xl z-10">
        {tiers.map((tier, i) => (
          <motion.div
            key={i}
            className={`flex-1 rounded-3xl p-8 border ${tier.isPop ? 'bg-[var(--color-primary)] text-white shadow-2xl scale-110 z-20 border-transparent' : 'bg-white text-[var(--color-text-primary)] shadow-lg border-gray-100 z-10'}`}
            initial={{ opacity: 0, y: 50 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ type: 'spring', bounce: 0.4, delay: 0.2 + tier.delay }}
          >
            {tier.isPop && (
              <div className="bg-[var(--color-accent)] text-[var(--color-text-primary)] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-4">
                Mais Popular
              </div>
            )}
            <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>{tier.price}</span>
              {tier.period && <span className={tier.isPop ? 'text-white/80' : 'text-gray-400'}>{tier.period}</span>}
            </div>
            
            <p className={tier.isPop ? 'text-white/90 font-medium' : 'text-gray-600 font-medium'}>
              {tier.desc}
            </p>

            <motion.div 
              className={`mt-8 py-3 rounded-xl text-center font-bold ${tier.isPop ? 'bg-white text-[var(--color-primary)]' : 'bg-[var(--color-bg-muted)] text-[var(--color-text-primary)]'}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={phase >= 3 ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
              transition={{ delay: 0.6 + tier.delay }}
            >
              Assinar
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}