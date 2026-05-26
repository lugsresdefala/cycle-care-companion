import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 3000),
      setTimeout(() => setPhase(4), 4500),
      setTimeout(() => setPhase(5), 11000), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const patients = [
    { name: 'Ana Silva', date: 'Hoje', status: 'Ativo' },
    { name: 'Maria Costa', date: 'Ontem', status: 'Em Análise' },
    { name: 'Juliana Santos', date: '2 dias', status: 'Concluído' },
  ];

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center px-20"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex w-full items-center justify-between gap-16">
        <div className="max-w-lg z-10">
          <motion.div
            className="text-[var(--color-primary)] font-bold tracking-widest uppercase text-sm mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          >
            Gestão de Pacientes
          </motion.div>
          
          <motion.h2 
            className="text-[3.5vw] font-bold text-[var(--color-text-primary)] leading-tight mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <motion.span 
              className="block"
              initial={{ opacity: 0, y: 20 }}
              animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            >
              Seu prontuário,
            </motion.span>
            <motion.span 
              className="block text-[var(--color-primary)]"
              initial={{ opacity: 0, y: 20 }}
              animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            >
              sempre organizado.
            </motion.span>
          </motion.h2>

          <motion.p
            className="text-[1.5vw] text-[var(--color-text-secondary)] font-medium"
            initial={{ opacity: 0 }}
            animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          >
            Acompanhe o histórico de consultas, exames e curvas de crescimento de forma unificada.
          </motion.p>
        </div>

        {/* UI Mockup - Patient List */}
        <motion.div 
          className="flex-1 max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ type: 'spring', bounce: 0.3, delay: 0.2 }}
        >
          {/* Mockup Header */}
          <div className="bg-[var(--color-bg-muted)] p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="font-bold text-lg text-[var(--color-text-primary)]">Pacientes Recentes</div>
            <div className="bg-white px-3 py-1 rounded-full text-sm text-[var(--color-primary)] font-medium shadow-sm">
              + Novo
            </div>
          </div>
          
          {/* List */}
          <div className="p-4 space-y-4">
            {patients.map((p, i) => (
              <motion.div 
                key={i}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors"
                initial={{ opacity: 0, x: 20 }}
                animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ delay: 0.4 + (i * 0.15), type: 'spring' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold text-lg">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-[var(--color-text-primary)]">{p.name}</div>
                    <div className="text-sm text-gray-400">{p.date}</div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {p.status}
                </div>
              </motion.div>
            ))}
            
            {/* Skeleton rows */}
            <motion.div 
              className="flex items-center gap-4 p-4 opacity-50"
              initial={{ opacity: 0 }}
              animate={phase >= 4 ? { opacity: 0.5 } : { opacity: 0 }}
            >
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}