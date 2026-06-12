import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const MEASUREMENTS = [
  { id: 'dbp', label: 'DBP', name: 'Diâmetro biparietal', value: '45,2', unit: 'mm', delay: 0.6, x1: 0.45, y1: 0.30, x2: 0.65, y2: 0.30, labelX: 0.72, labelY: 0.30 },
  { id: 'cc',  label: 'CC',  name: 'Circunferência cefálica', value: '168', unit: 'mm', delay: 1.2, x1: 0.55, y1: 0.32, x2: 0.78, y2: 0.20, labelX: 0.82, labelY: 0.18 },
  { id: 'ca',  label: 'CA',  name: 'Circunferência abdominal', value: '142', unit: 'mm', delay: 1.8, x1: 0.55, y1: 0.55, x2: 0.78, y2: 0.62, labelX: 0.82, labelY: 0.62 },
  { id: 'cf',  label: 'CF',  name: 'Comprimento do fêmur', value: '30,8', unit: 'mm', delay: 2.4, x1: 0.50, y1: 0.78, x2: 0.74, y2: 0.86, labelX: 0.76, labelY: 0.86 },
];

export function Scene3() {
  const [showPfe, setShowPfe] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowPfe(true), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      key="scene-biometry"
      className="absolute inset-0 z-10 flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-[45%] flex flex-col justify-center pl-[8vw] pr-[2vw]">
        <motion.div
          className="text-[1.1vw] uppercase tracking-[0.3em] mb-[2vh] font-semibold"
          style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          03 · Biometria fetal
        </motion.div>
        
        <motion.h2
          className="text-[4.5vw] leading-[1.05] mb-[3vh]"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Quatro medidas.<br />
          <span className="italic text-[var(--color-accent)]">Um peso estimado.</span>
        </motion.h2>
        
        <motion.p
          className="text-[1.4vw]"
          style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.5, maxWidth: '28vw' }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          DBP, CC, CA e CF. Peso fetal estimado pela fórmula de Hadlock IV.
        </motion.p>

        <motion.div
          className="mt-[5vh] rounded-[2vh] px-[2.5vw] py-[3vh] relative overflow-hidden"
          style={{
            background: 'var(--color-primary)',
            boxShadow: '0 24px 60px rgba(19, 48, 105, 0.25)',
          }}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={showPfe ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute top-0 right-0 w-[15vw] h-[15vw] bg-[var(--color-accent)] opacity-10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/4" />
          
          <div className="relative z-10">
            <div className="text-[0.9vw] uppercase tracking-[0.2em] mb-[1vh]" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-display)' }}>
              Peso estimado · Hadlock IV
            </div>
            <div className="flex items-baseline gap-[1vw]">
              <span className="text-[5.5vw] leading-none" style={{ color: '#FFFFFF', fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em' }}>
                312
              </span>
              <span className="text-[2vw] italic" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-serif)' }}>g</span>
              <span className="text-[1.1vw] ml-[0.5vw]" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-display)' }}>± 14%</span>
            </div>
            <div className="mt-[1.5vh] pt-[1.5vh] border-t border-white/10 flex justify-between items-center">
              <span className="text-[1vw]" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-body)' }}>
                INTERGROWTH-21st
              </span>
              <span className="text-[1.1vw] font-bold text-[var(--color-accent)]">
                Percentil 52
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="w-[55%] relative flex items-center justify-center">
        {/* Animated Background Blob behind fetus */}
        <motion.div 
          className="absolute w-[40vw] h-[40vw] rounded-full blur-[80px] bg-[var(--color-primary)] opacity-10"
          animate={{ scale: [1, 1.1, 0.9, 1], rotate: [0, 45, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />

        <svg viewBox="0 0 800 720" className="w-[45vw] h-[75vh] relative z-10" preserveAspectRatio="xMidYMid meet">
          {/* Fetus Outline */}
          <motion.g
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Smooth abstract fetus representation */}
            <path
              d="M 380 160
                 C 470 160, 540 210, 550 300
                 C 560 360, 530 400, 490 430
                 C 510 480, 530 520, 560 565
                 C 580 600, 570 640, 545 660
                 C 515 690, 460 690, 420 670
                 C 390 655, 350 650, 310 660
                 C 260 675, 210 660, 190 620
                 C 170 580, 185 530, 220 500
                 C 260 465, 280 420, 275 370
                 C 255 340, 245 300, 255 250
                 C 275 170, 320 160, 380 160 Z"
              fill="rgba(255,255,255,0.8)"
              stroke="var(--color-primary)"
              strokeWidth="2"
              strokeLinejoin="round"
              filter="drop-shadow(0 20px 30px rgba(19,48,105,0.1))"
            />
            {/* Eye / Face hint */}
            <circle cx="430" cy="250" r="5" fill="var(--color-primary)" />
            <path d="M 445 270 C 465 280, 465 310, 445 325" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Spine hint */}
            <path d="M 270 280 C 260 350, 290 480, 230 580" fill="none" stroke="var(--color-line)" strokeWidth="2" strokeDasharray="6 6" />
          </motion.g>

          {/* Measurement Callouts */}
          {MEASUREMENTS.map((m) => {
            const x1 = m.x1 * 800;
            const y1 = m.y1 * 720;
            const x2 = m.x2 * 800;
            const y2 = m.y2 * 720;
            const lx = m.labelX * 800;
            const ly = m.labelY * 720;
            return (
              <motion.g
                key={m.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: m.delay }}
              >
                {/* Connecting Line */}
                <motion.path
                  d={`M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}`}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: m.delay, ease: "easeOut" }}
                />
                
                {/* Dot at end */}
                <motion.circle 
                  cx={x2} cy={y2} r="4" 
                  fill="var(--color-accent)" 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: m.delay + 0.5, type: "spring" }}
                />
                
                {/* Label Box */}
                <motion.g
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: m.delay + 0.6 }}
                >
                  <rect x={lx - 10} y={ly - 32} width="160" height="64" rx="8" fill="rgba(255,255,255,0.9)" stroke="var(--color-line)" style={{ backdropFilter: "blur(8px)" }} />
                  <text x={lx + 10} y={ly - 8} fontSize="18" fontWeight="600" fill="var(--color-primary)" fontFamily="var(--font-display)">
                    {m.label}
                  </text>
                  <text x={lx + 10} y={ly + 16} fontSize="20" fill="var(--color-accent)" fontFamily="var(--font-serif)">
                    {m.value} <tspan fontSize="12" fill="var(--color-text-muted)" fontFamily="var(--font-body)">{m.unit}</tspan>
                  </text>
                </motion.g>
              </motion.g>
            );
          })}
        </svg>
      </div>
    </motion.div>
  );
}