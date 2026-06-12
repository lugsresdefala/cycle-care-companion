import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const METHODS = [
  { id: 'dum', label: 'DUM', detail: 'Última menstruação' },
  { id: 'usg', label: 'USG 1º T.', detail: 'CCN — Robinson' },
  { id: 'fiv', label: 'FIV', detail: 'Data de transferência' },
];

export function Scene2() {
  const [activeMethod, setActiveMethod] = useState(0);
  const [weeks, setWeeks] = useState(12);
  const [days, setDays] = useState(3);

  useEffect(() => {
    const t1 = setTimeout(() => setActiveMethod(1), 3000);
    const t2 = setTimeout(() => setActiveMethod(2), 6500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const presets = [
      { w: 12, d: 3 },
      { w: 18, d: 5 },
      { w: 8, d: 0 },
    ];
    const p = presets[activeMethod];
    setWeeks(p.w);
    setDays(p.d);
  }, [activeMethod]);

  const totalDays = weeks * 7 + days;
  const dialAngle = (totalDays / 280) * 360;

  return (
    <motion.div
      key="scene-dating"
      className="absolute inset-0 z-10 flex items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="grid grid-cols-2 w-full h-full">
        {/* Left Side - Visual Interactive Dial */}
        <div className="flex items-center justify-center relative">
          {/* Subtle background glow */}
          <motion.div 
            className="absolute w-[40vw] h-[40vw] rounded-full bg-white/40 blur-[40px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2 }}
          />

          <motion.svg
            viewBox="0 0 400 400"
            className="w-[36vw] h-[36vw] relative z-10 drop-shadow-2xl"
            initial={{ rotate: -15, opacity: 0, scale: 0.9 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="var(--color-secondary)" />
              </linearGradient>
            </defs>
            <circle cx="200" cy="200" r="180" fill="white" stroke="var(--color-line)" strokeWidth="1" />
            <circle cx="200" cy="200" r="160" fill="transparent" stroke="var(--color-bg-muted)" strokeWidth="1" strokeDasharray="4 4" />
            
            {/* Tick marks */}
            {Array.from({ length: 40 }).map((_, i) => {
              const a = (i / 40) * Math.PI * 2 - Math.PI / 2;
              const isMajor = i % 5 === 0;
              return (
                <line
                  key={i}
                  x1={200 + Math.cos(a) * 176}
                  y1={200 + Math.sin(a) * 176}
                  x2={200 + Math.cos(a) * (isMajor ? 155 : 165)}
                  y2={200 + Math.sin(a) * (isMajor ? 155 : 165)}
                  stroke={isMajor ? 'var(--color-primary)' : 'var(--color-text-muted)'}
                  strokeWidth={isMajor ? 2 : 1}
                  opacity={isMajor ? 1 : 0.5}
                />
              );
            })}
            
            {/* Numbers */}
            {[10, 20, 30, 40].map((w) => {
              const a = (w / 40) * Math.PI * 2 - Math.PI / 2;
              return (
                <text
                  key={w}
                  x={200 + Math.cos(a) * 138}
                  y={200 + Math.sin(a) * 138 + 6}
                  textAnchor="middle"
                  fontSize="16"
                  fill="var(--color-primary)"
                  fontFamily="var(--font-display)"
                  fontWeight="600"
                >
                  {w}
                </text>
              );
            })}
            
            {/* Progress Arc */}
            <motion.circle
              cx="200"
              cy="200"
              r="176"
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(dialAngle / 360) * 2 * Math.PI * 176} 9999`}
              transform="rotate(-90 200 200)"
              initial={false}
              animate={{ strokeDasharray: `${(dialAngle / 360) * 2 * Math.PI * 176} 9999` }}
              transition={{ type: "spring", stiffness: 60, damping: 15 }}
            />
            
            {/* Inner Content */}
            <text x="200" y="185" textAnchor="middle" fontSize="12" fill="var(--color-text-muted)" fontFamily="var(--font-body)" letterSpacing="3">
              IDADE GESTACIONAL
            </text>
            <text
              x="200"
              y="245"
              textAnchor="middle"
              fontSize="68"
              fill="var(--color-text-primary)"
              fontFamily="var(--font-serif)"
              fontWeight="400"
            >
              {weeks}s {days}d
            </text>
            <text x="200" y="275" textAnchor="middle" fontSize="12" fill="var(--color-accent)" fontFamily="var(--font-display)" fontWeight="600" letterSpacing="2">
              DPP: 30 / 11 / 2026
            </text>
          </motion.svg>
        </div>

        {/* Right Side - Typography and Content */}
        <div className="flex flex-col justify-center pr-[8vw] pl-[4vw]">
          <motion.div
            className="text-[1.1vw] uppercase tracking-[0.3em] mb-[2vh] font-semibold"
            style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            02 · Datação
          </motion.div>
          <motion.h2
            className="text-[4.5vw] leading-[1.05] mb-[4vh]"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Idade gestacional<br />
            <span className="italic text-[var(--color-accent)]">em três caminhos.</span>
          </motion.h2>

          <div className="flex flex-col gap-[1.5vh]">
            {METHODS.map((m, i) => {
              const isActive = i === activeMethod;
              return (
                <motion.div
                  key={m.id}
                  className="flex items-center gap-[1.5vw] rounded-2xl px-[2vw] py-[2vh] border"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    backgroundColor: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.6)',
                    borderColor: isActive ? 'var(--color-primary)' : 'var(--color-line)',
                    color: isActive ? '#FFFFFF' : 'var(--color-text-primary)',
                    boxShadow: isActive
                      ? '0 20px 40px rgba(19, 48, 105, 0.15)'
                      : '0 4px 12px rgba(13, 22, 38, 0.02)',
                    scale: isActive ? 1.02 : 1
                  }}
                  transition={{
                    duration: 0.6,
                    delay: i === 0 ? 0.8 : 0,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <span
                    className="inline-flex items-center justify-center w-[3vw] h-[3vw] rounded-full text-[1vw] font-bold"
                    style={{
                      background: isActive ? 'var(--color-accent)' : 'var(--color-bg-light)',
                      color: isActive ? '#FFFFFF' : 'var(--color-primary)',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <span className="block text-[1.4vw] font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                      {m.label}
                    </span>
                    <span className="block text-[1vw] mt-[0.2vh]" style={{ fontFamily: 'var(--font-body)', color: isActive ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' }}>
                      {m.detail}
                    </span>
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}