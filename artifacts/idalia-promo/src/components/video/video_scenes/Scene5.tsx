import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const EXAMS = [
  { id: 1, date: '12 / 03', label: 'USG morfológica 1º T.', meta: 'CCN 58,4 mm · IG 12s 3d', delay: 0.6 },
  { id: 2, date: '08 / 05', label: 'USG morfológica 2º T.', meta: 'PFE 312 g · P52', delay: 1.4 },
  { id: 3, date: '02 / 07', label: 'Biometria fetal', meta: 'PFE 1.480 g · P48', delay: 2.2 },
  { id: 4, date: '14 / 09', label: 'Perfil biofísico', meta: 'PFE 2.610 g · P50', delay: 3.0 },
];

export function Scene5() {
  const [showMobile, setShowMobile] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowMobile(true), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      key="scene-records"
      className="absolute inset-0 z-10 flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-[40%] flex flex-col justify-center pl-[6vw] pr-[2vw]">
        <motion.div
          className="text-[1.1vw] uppercase tracking-[0.4em] mb-[1.8vh] font-semibold"
          style={{ color: '#ED7A2A', fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          05 · Prontuário
        </motion.div>
        <motion.h2
          className="text-[3.8vw] leading-[1.05] font-bold mb-[2.4vh]"
          style={{ color: '#0E2350', fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
        >
          Cada paciente,<br />uma linha do tempo.
        </motion.h2>
        <motion.p
          className="text-[1.15vw]"
          style={{ color: '#3A4865', fontFamily: 'var(--font-body)', lineHeight: 1.5, maxWidth: '24vw' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          Histórico longitudinal de exames. Web e mobile, no mesmo prontuário.
        </motion.p>
      </div>

      <div className="w-[60%] relative flex items-center justify-center">
        <motion.div
          className="rounded-3xl bg-white relative z-10"
          style={{
            width: '36vw',
            boxShadow: '0 30px 70px rgba(14,35,80,0.15)',
            border: '1px solid #E1E6F1',
          }}
          initial={{ opacity: 0, y: 24, x: -20 }}
          animate={{ opacity: 1, y: 0, x: showMobile ? -40 : 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="px-[1.8vw] py-[1.6vh] flex items-center gap-[1vw] border-b" style={{ borderColor: '#EEF1F8' }}>
            <div className="w-[3vw] h-[3vw] rounded-full flex items-center justify-center text-[1.1vw] font-bold"
              style={{ background: 'linear-gradient(135deg,#133069,#6336AB)', color: '#FFFFFF', fontFamily: 'var(--font-display)' }}>
              MC
            </div>
            <div className="flex-1">
              <div className="text-[1.15vw] font-semibold" style={{ color: '#0E2350', fontFamily: 'var(--font-display)' }}>
                Mariana Costa, 32 anos
              </div>
              <div className="text-[0.85vw]" style={{ color: '#6B7384', fontFamily: 'var(--font-mono)' }}>
                G2 P1 A0 · DUM 12 / 02 / 2026
              </div>
            </div>
            <div className="text-right">
              <div className="text-[0.75vw] uppercase tracking-[0.2em]" style={{ color: '#6B7384' }}>
                Idade gestacional
              </div>
              <div className="text-[1.4vw] font-bold" style={{ color: '#0E2350', fontFamily: 'var(--font-display)' }}>
                29s 4d
              </div>
            </div>
          </div>

          <div className="px-[1.8vw] py-[1.8vh]">
            <div className="text-[0.8vw] uppercase tracking-[0.3em] mb-[1vh]" style={{ color: '#6B7384', fontFamily: 'var(--font-display)' }}>
              Histórico de exames
            </div>
            <div className="relative pl-[1.6vw]">
              <div className="absolute left-[0.5vw] top-0 bottom-0 w-[2px]" style={{ background: '#EEF1F8' }} />
              {EXAMS.map((e) => (
                <motion.div
                  key={e.id}
                  className="relative py-[0.9vh] flex items-baseline gap-[1vw]"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: e.delay, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span
                    className="absolute -left-[0.05vw] top-[1.4vh] w-[1.1vw] h-[1.1vw] rounded-full"
                    style={{ background: '#ED7A2A', border: '3px solid #FFFFFF', boxShadow: '0 0 0 1px #E1E6F1' }}
                  />
                  <div className="w-[5vw] text-[0.9vw] font-semibold" style={{ color: '#0E2350', fontFamily: 'var(--font-mono)' }}>
                    {e.date}
                  </div>
                  <div className="flex-1">
                    <div className="text-[1.05vw] font-semibold" style={{ color: '#0E2350', fontFamily: 'var(--font-display)' }}>
                      {e.label}
                    </div>
                    <div className="text-[0.85vw]" style={{ color: '#6B7384', fontFamily: 'var(--font-body)' }}>
                      {e.meta}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="absolute rounded-[2vw] z-20"
          style={{
            width: '12vw',
            height: '24vw',
            right: '6vw',
            top: '12vh',
            background: '#0E2350',
            border: '3px solid #0E2350',
            boxShadow: '0 30px 60px rgba(14,35,80,0.35)',
            overflow: 'hidden',
          }}
          initial={{ opacity: 0, y: 30, rotate: 6 }}
          animate={showMobile ? { opacity: 1, y: 0, rotate: 4 } : { opacity: 0, y: 30, rotate: 6 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[3.5vw] h-[1vh] rounded-b-2xl bg-black" />
          <div className="absolute inset-[0.3vw] rounded-[1.7vw] bg-white flex flex-col">
            <div className="px-[0.8vw] pt-[2vh] pb-[1vh] border-b" style={{ borderColor: '#EEF1F8' }}>
              <div className="text-[0.6vw] uppercase tracking-[0.2em]" style={{ color: '#6B7384' }}>Paciente</div>
              <div className="text-[0.9vw] font-bold" style={{ color: '#0E2350', fontFamily: 'var(--font-display)' }}>Mariana C.</div>
              <div className="text-[0.65vw]" style={{ color: '#ED7A2A', fontFamily: 'var(--font-mono)' }}>29s 4d</div>
            </div>
            <div className="flex-1 px-[0.7vw] py-[1vh] flex flex-col gap-[0.6vh]">
              {EXAMS.slice(0, 3).map((e, i) => (
                <motion.div
                  key={e.id}
                  className="rounded-lg px-[0.6vw] py-[0.5vh]"
                  style={{ background: '#F5F6F9' }}
                  initial={{ opacity: 0, x: 6 }}
                  animate={showMobile ? { opacity: 1, x: 0 } : { opacity: 0, x: 6 }}
                  transition={{ duration: 0.45, delay: 0.4 + i * 0.15 }}
                >
                  <div className="text-[0.55vw] font-semibold" style={{ color: '#6B7384', fontFamily: 'var(--font-mono)' }}>
                    {e.date}
                  </div>
                  <div className="text-[0.7vw] font-semibold leading-tight" style={{ color: '#0E2350', fontFamily: 'var(--font-display)' }}>
                    {e.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
