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
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-2 w-full h-full">
        <div className="flex items-center justify-center relative">
          <motion.svg
            viewBox="0 0 400 400"
            className="w-[34vw] h-[34vw]"
            initial={{ rotate: -8, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#133069" />
                <stop offset="100%" stopColor="#6336AB" />
              </linearGradient>
            </defs>
            <circle cx="200" cy="200" r="170" fill="white" stroke="#E5E9F2" strokeWidth="2" />
            {Array.from({ length: 40 }).map((_, i) => {
              const a = (i / 40) * Math.PI * 2 - Math.PI / 2;
              const isMajor = i % 5 === 0;
              return (
                <line
                  key={i}
                  x1={200 + Math.cos(a) * 168}
                  y1={200 + Math.sin(a) * 168}
                  x2={200 + Math.cos(a) * (isMajor ? 148 : 156)}
                  y2={200 + Math.sin(a) * (isMajor ? 148 : 156)}
                  stroke={isMajor ? '#133069' : '#9CA8C2'}
                  strokeWidth={isMajor ? 2 : 1}
                />
              );
            })}
            {[10, 20, 30, 40].map((w) => {
              const a = (w / 40) * Math.PI * 2 - Math.PI / 2;
              return (
                <text
                  key={w}
                  x={200 + Math.cos(a) * 132}
                  y={200 + Math.sin(a) * 132 + 6}
                  textAnchor="middle"
                  fontSize="18"
                  fill="#133069"
                  fontFamily="var(--font-display)"
                  fontWeight="600"
                >
                  {w}
                </text>
              );
            })}
            <motion.circle
              cx="200"
              cy="200"
              r="170"
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(dialAngle / 360) * 2 * Math.PI * 170} 9999`}
              transform="rotate(-90 200 200)"
              initial={false}
              animate={{ strokeDasharray: `${(dialAngle / 360) * 2 * Math.PI * 170} 9999` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
            <text x="200" y="195" textAnchor="middle" fontSize="14" fill="#6B7384" fontFamily="var(--font-body)" letterSpacing="3">
              IDADE GESTACIONAL
            </text>
            <text
              x="200"
              y="245"
              textAnchor="middle"
              fontSize="60"
              fill="#0E2350"
              fontFamily="var(--font-display)"
              fontWeight="700"
            >
              {weeks}s {days}d
            </text>
            <text x="200" y="278" textAnchor="middle" fontSize="13" fill="#ED7A2A" fontFamily="var(--font-display)" fontWeight="600" letterSpacing="2">
              DPP: 30 / 11 / 2026
            </text>
          </motion.svg>
        </div>

        <div className="flex flex-col justify-center pr-[6vw] pl-[2vw]">
          <motion.div
            className="text-[1.1vw] uppercase tracking-[0.4em] mb-[1.8vh] font-semibold"
            style={{ color: '#ED7A2A', fontFamily: 'var(--font-display)' }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            01 · Datação
          </motion.div>
          <motion.h2
            className="text-[4.2vw] leading-[1.05] font-bold mb-[3vh]"
            style={{ color: '#0E2350', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Idade gestacional<br />em três caminhos.
          </motion.h2>

          <div className="flex flex-col gap-[1.2vh]">
            {METHODS.map((m, i) => {
              const isActive = i === activeMethod;
              return (
                <motion.div
                  key={m.id}
                  className="flex items-center gap-[1.2vw] rounded-2xl px-[1.8vw] py-[1.4vh]"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    backgroundColor: isActive ? '#0E2350' : '#FFFFFF',
                    borderColor: isActive ? '#0E2350' : '#E1E6F1',
                    color: isActive ? '#FFFFFF' : '#3A4865',
                    boxShadow: isActive
                      ? '0 10px 30px rgba(14,35,80,0.18)'
                      : '0 2px 6px rgba(14,35,80,0.04)',
                  }}
                  transition={{
                    duration: 0.5,
                    delay: i === 0 ? 0.8 + i * 0.18 : 0,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{ border: '1px solid' }}
                >
                  <span
                    className="inline-flex items-center justify-center w-[2.8vw] h-[2.8vw] rounded-full text-[1vw] font-bold"
                    style={{
                      background: isActive ? '#ED7A2A' : '#F5F6F9',
                      color: isActive ? '#FFFFFF' : '#133069',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <span className="block text-[1.6vw] font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                      {m.label}
                    </span>
                    <span className="block text-[0.95vw] opacity-80" style={{ fontFamily: 'var(--font-body)' }}>
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
