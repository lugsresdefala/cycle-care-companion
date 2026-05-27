import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const CURVES = [
  { id: 'p97', label: 'P97', color: '#C7D0E5', yScale: 0.35 },
  { id: 'p90', label: 'P90', color: '#9BAACC', yScale: 0.45 },
  { id: 'p50', label: 'P50', color: '#133069', yScale: 0.58, bold: true },
  { id: 'p10', label: 'P10', color: '#9BAACC', yScale: 0.71 },
  { id: 'p3',  label: 'P3',  color: '#C7D0E5', yScale: 0.81 },
];

const W = 1000;
const H = 560;
const PADX = 90;
const PADY = 60;

function curvePath(yScale: number) {
  const points: [number, number][] = [];
  for (let i = 0; i <= 32; i++) {
    const x = PADX + (i / 32) * (W - PADX * 2);
    const t = i / 32;
    const y = PADY + (yScale * 0.62 + (1 - yScale) * 0.18 + 0.16 * (1 - t)) * (H - PADY * 2);
    points.push([x, H - y + PADY]);
  }
  return 'M ' + points.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ');
}

export function Scene4() {
  const [point, setPoint] = useState({ visible: false });
  useEffect(() => {
    const t = setTimeout(() => setPoint({ visible: true }), 3200);
    return () => clearTimeout(t);
  }, []);

  const ptX = PADX + 0.72 * (W - PADX * 2);
  const ptY = H - (PADY + (0.58 * 0.62 + 0.42 * 0.18 + 0.16 * (1 - 0.72)) * (H - PADY * 2)) + PADY;

  return (
    <motion.div
      key="scene-growth"
      className="absolute inset-0 z-10 flex items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-12 w-full h-full items-center">
        <div className="col-span-4 pl-[6vw] pr-[2vw]">
          <motion.div
            className="text-[1.1vw] uppercase tracking-[0.4em] mb-[1.8vh] font-semibold"
            style={{ color: '#ED7A2A', fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            03 · Crescimento
          </motion.div>
          <motion.h2
            className="text-[3.8vw] leading-[1.05] font-bold mb-[2.4vh]"
            style={{ color: '#0E2350', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
          >
            Percentil em<br />tempo real.
          </motion.h2>
          <motion.p
            className="text-[1.15vw]"
            style={{ color: '#3A4865', fontFamily: 'var(--font-body)', lineHeight: 1.5, maxWidth: '22vw' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Curvas de crescimento INTERGROWTH-21st aplicadas a cada exame.
          </motion.p>

          <motion.div
            className="mt-[3vh] inline-flex items-center gap-[0.8vw] rounded-full px-[1.4vw] py-[1vh]"
            style={{ background: '#0E2350', color: '#FFFFFF' }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={point.visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="w-[0.7vw] h-[0.7vw] rounded-full" style={{ background: '#ED7A2A' }} />
            <span className="text-[1.1vw] font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              Percentil 52
            </span>
            <span className="text-[0.9vw] opacity-75" style={{ fontFamily: 'var(--font-body)' }}>
              · adequado para IG
            </span>
          </motion.div>
        </div>

        <div className="col-span-8 flex items-center justify-center pr-[4vw]">
          <motion.div
            className="rounded-3xl bg-white p-[2vw]"
            style={{ boxShadow: '0 24px 60px rgba(14,35,80,0.12)', border: '1px solid #E1E6F1' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-[1vh]">
              <div className="text-[1vw] font-semibold" style={{ color: '#0E2350', fontFamily: 'var(--font-display)' }}>
                Peso fetal estimado · INTERGROWTH-21st
              </div>
              <div className="text-[0.85vw]" style={{ color: '#6B7384', fontFamily: 'var(--font-mono)' }}>
                14–40 semanas
              </div>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-[48vw] h-[56vh]">
              {Array.from({ length: 7 }).map((_, i) => {
                const y = PADY + (i / 6) * (H - PADY * 2);
                return <line key={i} x1={PADX} y1={y} x2={W - PADX} y2={y} stroke="#EEF1F8" strokeWidth="1" />;
              })}
              {[14, 20, 26, 32, 38].map((w) => {
                const x = PADX + ((w - 14) / 26) * (W - PADX * 2);
                return (
                  <g key={w}>
                    <line x1={x} y1={PADY} x2={x} y2={H - PADY} stroke="#EEF1F8" strokeWidth="1" />
                    <text x={x} y={H - 24} textAnchor="middle" fontSize="14" fill="#6B7384" fontFamily="var(--font-mono)">
                      {w}s
                    </text>
                  </g>
                );
              })}

              {CURVES.map((c, i) => (
                <motion.path
                  key={c.id}
                  d={curvePath(c.yScale)}
                  fill="none"
                  stroke={c.color}
                  strokeWidth={c.bold ? 3 : 1.6}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.6, delay: 0.5 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}

              {CURVES.map((c) => {
                const y = H - (PADY + (c.yScale * 0.62 + (1 - c.yScale) * 0.18 + 0.16 * 0) * (H - PADY * 2)) + PADY;
                return (
                  <text
                    key={`l-${c.id}`}
                    x={W - PADX + 8}
                    y={y + 4}
                    fontSize="13"
                    fill={c.color}
                    fontWeight={c.bold ? 700 : 500}
                    fontFamily="var(--font-display)"
                  >
                    {c.label}
                  </text>
                );
              })}

              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={point.visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: `${ptX}px ${ptY}px` }}
              >
                <circle cx={ptX} cy={ptY} r="14" fill="#ED7A2A" opacity="0.25" />
                <circle cx={ptX} cy={ptY} r="7" fill="#ED7A2A" stroke="#FFFFFF" strokeWidth="3" />
                <rect x={ptX - 56} y={ptY - 52} width="112" height="32" rx="8" fill="#0E2350" />
                <text x={ptX} y={ptY - 31} textAnchor="middle" fontSize="14" fontWeight="600" fill="#FFFFFF" fontFamily="var(--font-display)">
                  29s 4d · P52
                </text>
              </motion.g>
            </svg>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
