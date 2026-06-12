import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const CURVES = [
  { id: 'p97', label: 'P97', color: 'var(--color-line)', yScale: 0.30 },
  { id: 'p90', label: 'P90', color: 'var(--color-text-muted)', yScale: 0.40 },
  { id: 'p50', label: 'P50', color: 'var(--color-primary)', yScale: 0.55, bold: true },
  { id: 'p10', label: 'P10', color: 'var(--color-text-muted)', yScale: 0.70 },
  { id: 'p3',  label: 'P3',  color: 'var(--color-line)', yScale: 0.80 },
];

const W = 1000;
const H = 600;
const PADX = 80;
const PADY = 60;

function curvePath(yScale: number) {
  const points: [number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    const x = PADX + (i / 40) * (W - PADX * 2);
    const t = i / 40;
    // Exponential curve simulation for growth
    const curveValue = Math.pow(t, 1.5); 
    const y = PADY + (yScale * 0.5 + (1 - yScale) * 0.2 + 0.3 * (1 - curveValue)) * (H - PADY * 2);
    points.push([x, H - y + PADY - 40]);
  }
  return 'M ' + points.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ');
}

export function Scene4() {
  const [point, setPoint] = useState({ visible: false });
  useEffect(() => {
    const t = setTimeout(() => setPoint({ visible: true }), 2800);
    return () => clearTimeout(t);
  }, []);

  // Calculate specific point position
  const tPt = 0.65;
  const ptX = PADX + tPt * (W - PADX * 2);
  const p52Scale = 0.53; // Slightly above P50
  const curveValue = Math.pow(tPt, 1.5);
  const ptY = H - (PADY + (p52Scale * 0.5 + (1 - p52Scale) * 0.2 + 0.3 * (1 - curveValue)) * (H - PADY * 2)) + PADY - 40;

  return (
    <motion.div
      key="scene-result"
      className="absolute inset-0 z-10 flex items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="grid grid-cols-12 w-full h-full items-center">
        <div className="col-span-5 pl-[8vw] pr-[2vw]">
          <motion.div
            className="text-[1.1vw] uppercase tracking-[0.3em] mb-[2vh] font-semibold"
            style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            04 · Resultado
          </motion.div>
          <motion.h2
            className="text-[4.5vw] leading-[1] mb-[3vh]"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
          >
            Percentil,<br />
            classificação<br />
            <span className="italic text-[var(--color-accent)]">e orientação.</span>
          </motion.h2>

          <div className="flex flex-col gap-[2vh] mt-[5vh]">
            <motion.div
              className="inline-flex items-center gap-[1vw] rounded-full px-[1.5vw] py-[1vh] border w-fit"
              style={{ background: 'var(--color-bg-light)', borderColor: 'var(--color-line)' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={point.visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="w-[1vw] h-[1vw] rounded-full" style={{ background: 'var(--color-success)' }} />
              <span className="text-[1.2vw] font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
                P52 · AIG
              </span>
              <span className="text-[1vw]" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }}>
                adequado para IG
              </span>
            </motion.div>

            <motion.div
              className="rounded-[2vh] px-[2vw] py-[2.5vh] border"
              style={{
                background: 'white',
                borderColor: 'var(--color-line)',
                maxWidth: '28vw',
                boxShadow: '0 10px 30px rgba(13, 22, 38, 0.05)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={point.visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="text-[0.9vw] uppercase tracking-[0.2em] font-semibold mb-[1.5vh]"
                style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}
              >
                Orientação clínica sugerida
              </div>
              <div
                className="text-[1.2vw] leading-snug"
                style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
              >
                Crescimento fetal dentro da faixa esperada para a idade gestacional. Repetir biometria fetal em 14 dias para acompanhamento longitudinal.
              </div>
            </motion.div>
          </div>
        </div>

        <div className="col-span-7 flex items-center justify-center pr-[6vw] relative">
          {/* Decor background behind chart */}
          <motion.div 
            className="absolute w-[80%] h-[80%] bg-gradient-to-tr from-transparent via-[var(--color-bg-muted)] to-transparent rounded-full blur-[60px] -z-10"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          />

          <motion.div
            className="rounded-[3vh] bg-white p-[3vw] w-full"
            style={{ boxShadow: '0 30px 60px rgba(19, 48, 105, 0.1)', border: '1px solid var(--color-line)' }}
            initial={{ opacity: 0, x: 40, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between mb-[3vh]">
              <div>
                <div className="text-[1.2vw] font-semibold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                  Curva de Crescimento
                </div>
                <div className="text-[1vw] mt-[0.5vh]" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
                  INTERGROWTH-21st
                </div>
              </div>
              <div className="text-[1vw] py-[0.5vh] px-[1vw] rounded-full border" style={{ color: 'var(--color-text-secondary)', borderColor: 'var(--color-line)', fontFamily: 'var(--font-mono)' }}>
                14–40 semanas
              </div>
            </div>
            
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
              {/* Grid Lines */}
              {Array.from({ length: 6 }).map((_, i) => {
                const y = PADY + (i / 5) * (H - PADY * 2);
                return <line key={i} x1={PADX} y1={y} x2={W - PADX} y2={y} stroke="var(--color-bg-muted)" strokeWidth="1" strokeDasharray="4 4" />;
              })}
              
              {/* X Axis labels */}
              {[14, 20, 26, 32, 38].map((w) => {
                const x = PADX + ((w - 14) / 26) * (W - PADX * 2);
                return (
                  <g key={w}>
                    <line x1={x} y1={H - PADY} x2={x} y2={H - PADY + 10} stroke="var(--color-line)" strokeWidth="1" />
                    <text x={x} y={H - PADY + 30} textAnchor="middle" fontSize="16" fill="var(--color-text-secondary)" fontFamily="var(--font-mono)">
                      {w}s
                    </text>
                  </g>
                );
              })}

              {/* Curves */}
              {CURVES.map((c, i) => (
                <motion.path
                  key={c.id}
                  d={curvePath(c.yScale)}
                  fill="none"
                  stroke={c.color}
                  strokeWidth={c.bold ? 3 : 1.5}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: c.bold ? 1 : 0.6 }}
                  transition={{ duration: 1.8, delay: 0.6 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}

              {/* Curve Labels */}
              {CURVES.map((c) => {
                const y = H - (PADY + (c.yScale * 0.5 + (1 - c.yScale) * 0.2 + 0.3 * 0) * (H - PADY * 2)) + PADY - 40;
                return (
                  <text
                    key={`l-${c.id}`}
                    x={W - PADX + 15}
                    y={y + 5}
                    fontSize="16"
                    fill={c.color}
                    fontWeight={c.bold ? 600 : 400}
                    fontFamily="var(--font-display)"
                    opacity={c.bold ? 1 : 0.7}
                  >
                    {c.label}
                  </text>
                );
              })}

              {/* Plotted Point */}
              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={point.visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                style={{ transformOrigin: `${ptX}px ${ptY}px` }}
              >
                {/* Guide lines to axes */}
                <line x1={PADX} y1={ptY} x2={ptX} y2={ptY} stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                <line x1={ptX} y1={H - PADY} x2={ptX} y2={ptY} stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                
                <circle cx={ptX} cy={ptY} r="16" fill="var(--color-accent)" opacity="0.2" />
                <circle cx={ptX} cy={ptY} r="8" fill="var(--color-accent)" stroke="white" strokeWidth="3" />
                
                <rect x={ptX - 60} y={ptY - 60} width="120" height="40" rx="6" fill="var(--color-primary)" />
                <path d={`M ${ptX - 8} ${ptY - 20} L ${ptX} ${ptY - 12} L ${ptX + 8} ${ptY - 20} Z`} fill="var(--color-primary)" />
                <text x={ptX} y={ptY - 35} textAnchor="middle" fontSize="18" fontWeight="500" fill="white" fontFamily="var(--font-display)">
                  29s 4d <tspan fill="var(--color-accent)" fontWeight="600">· P52</tspan>
                </text>
              </motion.g>
            </svg>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}