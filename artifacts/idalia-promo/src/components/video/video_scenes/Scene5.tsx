import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const EXAMS = [
  { id: 1, date: '12 / 03', label: 'USG morfológica 1º T.', meta: 'CCN 58,4 mm · IG 12s 3d', delay: 0.6 },
  { id: 2, date: '08 / 05', label: 'USG morfológica 2º T.', meta: 'PFE 312 g · P52', delay: 1.2 },
  { id: 3, date: '02 / 07', label: 'Biometria fetal', meta: 'PFE 1.480 g · P48', delay: 1.8 },
  { id: 4, date: '14 / 09', label: 'Perfil biofísico', meta: 'PFE 2.610 g · P50', delay: 2.4 },
];

export function Scene5() {
  const [showMobile, setShowMobile] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowMobile(true), 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      key="scene-records"
      className="absolute inset-0 z-10 flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-[45%] flex flex-col justify-center pl-[8vw] pr-[2vw]">
        <motion.div
          className="text-[1.1vw] uppercase tracking-[0.3em] mb-[2vh] font-semibold"
          style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          05 · Prontuário
        </motion.div>
        <motion.h2
          className="text-[4.5vw] leading-[1.05] mb-[3vh]"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)', letterSpacing: '-0.02em' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
        >
          Cada paciente,<br />
          <span className="italic text-[var(--color-accent)]">uma linha do tempo.</span>
        </motion.h2>
        <motion.p
          className="text-[1.4vw]"
          style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.5, maxWidth: '28vw' }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Histórico longitudinal de exames. Web e mobile, no mesmo prontuário com sincronização em tempo real.
        </motion.p>
      </div>

      <div className="w-[55%] relative flex items-center justify-center">
        {/* Desktop View */}
        <motion.div
          className="rounded-[2vh] bg-white relative z-10 overflow-hidden"
          style={{
            width: '38vw',
            boxShadow: '0 30px 70px rgba(19, 48, 105, 0.15)',
            border: '1px solid var(--color-line)',
          }}
          initial={{ opacity: 0, y: 40, x: -20, rotateY: 10 }}
          animate={{ opacity: 1, y: 0, x: showMobile ? '-6vw' : 0, rotateY: showMobile ? -5 : 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header */}
          <div className="px-[2vw] py-[2vh] flex items-center gap-[1.5vw] border-b" style={{ borderColor: 'var(--color-line)' }}>
            <div className="w-[3.5vw] h-[3.5vw] rounded-full flex items-center justify-center text-[1.2vw] font-bold"
              style={{ background: 'var(--color-bg-muted)', color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
              MC
            </div>
            <div className="flex-1">
              <div className="text-[1.4vw] font-semibold leading-none mb-[0.5vh]" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                Mariana Costa <span className="text-[1vw] text-[var(--color-text-muted)] font-normal ml-[0.5vw]">32 anos</span>
              </div>
              <div className="text-[1vw]" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                G2 P1 A0 · DUM 12/02/2026
              </div>
            </div>
            <div className="text-right bg-[var(--color-bg-light)] px-[1.5vw] py-[1vh] rounded-[1vh]">
              <div className="text-[0.8vw] uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
                Idade gestacional
              </div>
              <div className="text-[1.6vw] font-bold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-serif)' }}>
                29s 4d
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="px-[3vw] py-[3vh]">
            <div className="text-[0.9vw] uppercase tracking-[0.2em] mb-[3vh]" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
              Histórico de exames
            </div>
            <div className="relative pl-[2vw]">
              {/* Vertical line */}
              <div className="absolute left-[0.7vw] top-[1vh] bottom-[1vh] w-[2px]" style={{ background: 'var(--color-line)' }} />
              
              {EXAMS.map((e, index) => (
                <motion.div
                  key={e.id}
                  className="relative pb-[4vh] flex items-start gap-[2vw]"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: e.delay, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span
                    className="absolute -left-[1.45vw] top-[0.6vh] w-[1.2vw] h-[1.2vw] rounded-full z-10"
                    style={{ background: index === EXAMS.length - 1 ? 'var(--color-primary)' : 'var(--color-line)', border: '4px solid white' }}
                  />
                  <div className="w-[6vw] text-[1vw] font-medium pt-[0.2vh]" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {e.date}
                  </div>
                  <div className="flex-1 bg-[var(--color-bg-light)] p-[1.5vh] rounded-[1vh] border border-[var(--color-line)]">
                    <div className="text-[1.2vw] font-semibold mb-[0.5vh]" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                      {e.label}
                    </div>
                    <div className="text-[1vw]" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
                      {e.meta}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Mobile View */}
        <motion.div
          className="absolute rounded-[3vh] z-20"
          style={{
            width: '14vw',
            height: '28vw',
            right: '8vw',
            top: '10vh',
            background: 'var(--color-bg-dark)',
            border: '4px solid var(--color-bg-dark)',
            boxShadow: '0 40px 80px rgba(13, 22, 38, 0.4), -20px 0 40px rgba(19, 48, 105, 0.2)',
            overflow: 'hidden',
          }}
          initial={{ opacity: 0, y: 50, rotate: 10, scale: 0.9 }}
          animate={showMobile ? { opacity: 1, y: 0, rotate: 5, scale: 1 } : { opacity: 0, y: 50, rotate: 10, scale: 0.9 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Dynamic Island / Notch */}
          <div className="absolute top-[1vh] left-1/2 -translate-x-1/2 w-[4vw] h-[1.5vh] rounded-full bg-black z-30" />
          
          <div className="absolute inset-0 rounded-[2.5vh] bg-white flex flex-col pt-[3vh]">
            <div className="px-[1vw] pb-[1.5vh] border-b" style={{ borderColor: 'var(--color-line)' }}>
              <div className="text-[0.8vw] font-bold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>Mariana C.</div>
              <div className="flex justify-between items-center mt-[0.5vh]">
                <div className="text-[0.7vw]" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>32 anos</div>
                <div className="text-[0.8vw] font-semibold" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-display)' }}>29s 4d</div>
              </div>
            </div>
            <div className="flex-1 px-[1vw] py-[1.5vh] flex flex-col gap-[1vh] bg-[var(--color-bg-light)]">
              {EXAMS.slice(0, 3).map((e, i) => (
                <motion.div
                  key={e.id}
                  className="rounded-[1vh] px-[1vw] py-[1vh] bg-white border border-[var(--color-line)] shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={showMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.15 }}
                >
                  <div className="text-[0.65vw] font-medium mb-[0.5vh]" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {e.date}
                  </div>
                  <div className="text-[0.85vw] font-semibold leading-tight" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>
                    {e.label}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Tab bar mock */}
            <div className="h-[4vh] bg-white border-t border-[var(--color-line)] flex justify-around items-center px-[2vw] pb-[1vh]">
              <div className="w-[1.5vw] h-[1.5vw] rounded-full bg-[var(--color-primary)] opacity-20" />
              <div className="w-[1.5vw] h-[1.5vw] rounded-full bg-[var(--color-primary)] opacity-100" />
              <div className="w-[1.5vw] h-[1.5vw] rounded-full bg-[var(--color-primary)] opacity-20" />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}