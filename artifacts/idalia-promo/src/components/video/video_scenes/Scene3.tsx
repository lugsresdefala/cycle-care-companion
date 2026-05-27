import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const MEASUREMENTS = [
  { id: 'dbp', label: 'DBP', name: 'Diâmetro biparietal', value: '45,2', unit: 'mm', delay: 0.6, x1: 0.45, y1: 0.30, x2: 0.65, y2: 0.30, labelX: 0.74, labelY: 0.30 },
  { id: 'cc',  label: 'CC',  name: 'Circunferência cefálica', value: '168', unit: 'mm', delay: 1.6, x1: 0.55, y1: 0.32, x2: 0.78, y2: 0.20, labelX: 0.82, labelY: 0.18 },
  { id: 'ca',  label: 'CA',  name: 'Circunferência abdominal', value: '142', unit: 'mm', delay: 2.6, x1: 0.55, y1: 0.55, x2: 0.78, y2: 0.62, labelX: 0.82, labelY: 0.62 },
  { id: 'cf',  label: 'CF',  name: 'Comprimento do fêmur', value: '30,8', unit: 'mm', delay: 3.6, x1: 0.50, y1: 0.78, x2: 0.74, y2: 0.86, labelX: 0.78, labelY: 0.86 },
];

export function Scene3() {
  const [showPfe, setShowPfe] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowPfe(true), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      key="scene-biometry"
      className="absolute inset-0 z-10 flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-[42%] flex flex-col justify-center pl-[6vw] pr-[1vw]">
        <motion.div
          className="text-[1.1vw] uppercase tracking-[0.4em] mb-[1.8vh] font-semibold"
          style={{ color: '#ED7A2A', fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          03 · Biometria fetal
        </motion.div>
        <motion.h2
          className="text-[4vw] leading-[1.05] font-bold mb-[2.4vh]"
          style={{ color: '#0E2350', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Quatro medidas.<br />Um peso estimado.
        </motion.h2>
        <motion.p
          className="text-[1.25vw]"
          style={{ color: '#3A4865', fontFamily: 'var(--font-body)', lineHeight: 1.5, maxWidth: '28vw' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          DBP, CC, CA e CF. Peso fetal estimado pela fórmula de Hadlock IV.
        </motion.p>

        <motion.div
          className="mt-[3.5vh] rounded-2xl border px-[2vw] py-[2.2vh]"
          style={{
            borderColor: '#E1E6F1',
            background: 'linear-gradient(135deg, #133069 0%, #6336AB 100%)',
            boxShadow: '0 24px 60px rgba(14,35,80,0.25)',
          }}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={showPfe ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="text-[0.9vw] uppercase tracking-[0.3em] mb-[0.5vh]" style={{ color: '#FFD6A8', fontFamily: 'var(--font-display)' }}>
            Peso fetal estimado · Hadlock IV
          </div>
          <div className="flex items-baseline gap-[0.8vw]">
            <span className="text-[5.2vw] font-bold leading-none" style={{ color: '#FFFFFF', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
              312
            </span>
            <span className="text-[1.8vw]" style={{ color: '#FFFFFF', opacity: 0.85, fontFamily: 'var(--font-display)' }}>g</span>
            <span className="text-[1vw] ml-[0.6vw]" style={{ color: '#FFD6A8' }}>± 14%</span>
          </div>
          <div className="mt-[0.6vh] text-[0.95vw]" style={{ color: '#C9D2EC' }}>
            Percentil 52 · INTERGROWTH-21st
          </div>
        </motion.div>
      </div>

      <div className="w-[58%] relative flex items-center justify-center">
        <svg viewBox="0 0 800 720" className="w-[48vw] h-[80vh]" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="aura" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#ED7A2A" stopOpacity="0.18" />
              <stop offset="70%" stopColor="#ED7A2A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <motion.circle
            cx="380"
            cy="360"
            r="280"
            fill="url(#aura)"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />

          <motion.g
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <path
              d="M 380 130
                 C 470 130, 540 180, 555 270
                 C 565 330, 540 380, 500 410
                 C 510 460, 530 510, 560 555
                 C 580 590, 580 630, 555 660
                 C 525 695, 470 700, 430 680
                 C 400 665, 360 660, 320 670
                 C 270 685, 220 670, 200 630
                 C 180 590, 195 540, 230 510
                 C 270 475, 285 430, 280 380
                 C 260 350, 250 310, 260 260
                 C 280 180, 320 130, 380 130 Z"
              fill="none"
              stroke="#133069"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <circle cx="445" cy="225" r="6" fill="#0E2350" />
            <path d="M 460 250 C 480 260, 480 290, 460 305" fill="none" stroke="#0E2350" strokeWidth="2" strokeLinecap="round" />
            <path d="M 410 320 C 430 340, 460 340, 480 320" fill="none" stroke="#0E2350" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M 320 660 C 280 690, 250 720, 240 760" fill="none" stroke="#133069" strokeWidth="2.2" strokeLinecap="round" />
          </motion.g>

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
                <motion.line
                  x1={x1} y1={y1} x2={x1} y2={y2}
                  stroke="#ED7A2A" strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: m.delay }}
                />
                <motion.line
                  x1={x1} y1={y2} x2={x2} y2={y2}
                  stroke="#ED7A2A" strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: m.delay + 0.3 }}
                />
                <circle cx={x2} cy={y2} r="5" fill="#ED7A2A" />
                <motion.g
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: m.delay + 0.5 }}
                >
                  <rect x={lx - 4} y={ly - 28} width="170" height="56" rx="10" fill="#FFFFFF" stroke="#E1E6F1" />
                  <text x={lx + 12} y={ly - 6} fontSize="22" fontWeight="700" fill="#0E2350" fontFamily="var(--font-display)">
                    {m.label}
                  </text>
                  <text x={lx + 12} y={ly + 18} fontSize="18" fontWeight="600" fill="#ED7A2A" fontFamily="var(--font-display)">
                    {m.value} <tspan fontSize="14" fill="#6B7384">{m.unit}</tspan>
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
