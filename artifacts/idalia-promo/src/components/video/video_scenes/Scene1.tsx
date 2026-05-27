import { motion } from 'framer-motion';

export function Scene1() {
  return (
    <motion.div
      key="scene-hook"
      className="absolute inset-0 z-10 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="grid-hook" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#133069" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#grid-hook)" />
      </svg>

      <motion.div
        className="absolute"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.15 }}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg width="780" height="780" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="92" fill="none" stroke="#133069" strokeWidth="0.4" />
          <circle cx="100" cy="100" r="74" fill="none" stroke="#133069" strokeWidth="0.4" />
          <circle cx="100" cy="100" r="56" fill="none" stroke="#ED7A2A" strokeWidth="0.5" strokeDasharray="2 3" />
          <g stroke="#133069" strokeWidth="0.4">
            {Array.from({ length: 40 }).map((_, i) => {
              const a = (i / 40) * Math.PI * 2;
              return (
                <line
                  key={i}
                  x1={100 + Math.cos(a) * 92}
                  y1={100 + Math.sin(a) * 92}
                  x2={100 + Math.cos(a) * (i % 5 === 0 ? 84 : 88)}
                  y2={100 + Math.sin(a) * (i % 5 === 0 ? 84 : 88)}
                />
              );
            })}
          </g>
        </svg>
      </motion.div>

      <div className="relative z-10 flex flex-col items-center text-center px-[10vw]">
        <motion.div
          className="flex items-center gap-[1.4vw] mb-[2.2vh]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <svg width="64" height="64" viewBox="0 0 64 64" className="w-[4.2vw] h-[4.2vw]">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#133069" strokeWidth="2.5" />
            <circle cx="32" cy="32" r="16" fill="none" stroke="#ED7A2A" strokeWidth="2.5" />
            <circle cx="32" cy="32" r="4" fill="#133069" />
          </svg>
          <span
            className="text-[1.1vw] uppercase tracking-[0.4em] font-semibold"
            style={{ color: '#6B7384', fontFamily: 'var(--font-display)' }}
          >
            IdaliaCalc · Medicina Fetal
          </span>
        </motion.div>

        <motion.h1
          className="text-[8.5vw] leading-[0.95] font-bold"
          style={{
            color: '#0E2350',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.04em',
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          IdaliaCalc<motion.span
            className="inline-block ml-[0.4vw]"
            style={{ color: '#ED7A2A' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.4 }}
          >.</motion.span>
        </motion.h1>

        <motion.p
          className="mt-[2.6vh] text-[1.7vw] max-w-[60vw]"
          style={{ color: '#3A4865', fontFamily: 'var(--font-body)', lineHeight: 1.45 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.9, ease: [0.16, 1, 0.3, 1] }}
        >
          Cálculos clínicos para medicina fetal e saúde reprodutiva.
        </motion.p>
      </div>
    </motion.div>
  );
}
