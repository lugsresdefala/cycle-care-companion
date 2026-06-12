import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { Scene6 } from './video_scenes/Scene6';
import { Scene7 } from './video_scenes/Scene7';
import { SCENE_CAPTIONS } from './captions';

export const SCENE_DURATIONS = {
  hook: 6500,
  suite: 13000,
  dating: 10500,
  biometry: 12000,
  result: 7000,
  records: 7500,
  outro: 5000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  hook: Scene1,
  suite: Scene7,
  dating: Scene2,
  biometry: Scene3,
  result: Scene4,
  records: Scene5,
  outro: Scene6,
};

const SCENE_START_SEC: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let cumulativeMs = 0;
  for (const [key, ms] of Object.entries(SCENE_DURATIONS)) {
    out[key] = cumulativeMs / 1000;
    cumulativeMs += ms;
  }
  return out;
})();

const AUDIO_SEEK_EPSILON_SEC = 0.18;

// Continuous background motion states
const backgroundPositions = [
  { scale: 1, x: '0%', y: '0%', opacity: 1 },
  { scale: 1.2, x: '-5%', y: '10%', opacity: 0.9 },
  { scale: 1.1, x: '8%', y: '-8%', opacity: 1 },
  { scale: 1.15, x: '3%', y: '5%', opacity: 0.85 },
  { scale: 1.25, x: '-8%', y: '-10%', opacity: 0.8 },
  { scale: 1.1, x: '5%', y: '0%', opacity: 0.95 },
  { scale: 1, x: '0%', y: '0%', opacity: 1 },
];

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '') as keyof typeof SCENE_DURATIONS;
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceRef = useRef<HTMLAudioElement | null>(null);
  const [captionText, setCaptionText] = useState<string>('');

  const MUSIC_VOLUME_NORMAL = 0.28;
  const MUSIC_VOLUME_DUCKED = 0.09;
  const VOICE_VOLUME = 1.0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = MUSIC_VOLUME_NORMAL;
    const targetTime = SCENE_START_SEC[baseSceneKey] ?? 0;
    if (Math.abs(audio.currentTime - targetTime) > AUDIO_SEEK_EPSILON_SEC) {
      audio.currentTime = targetTime;
    }
    audio.play().catch(() => {});
  }, [currentSceneKey, baseSceneKey, muted]);

  useEffect(() => {
    const voice = voiceRef.current;
    const music = audioRef.current;
    if (!voice) return;
    voice.volume = VOICE_VOLUME;
    voice.src = `${import.meta.env.BASE_URL}audio/vo/${baseSceneKey}.mp3`;
    voice.currentTime = 0;
    const duck = () => {
      if (music) music.volume = MUSIC_VOLUME_DUCKED;
    };
    const unduck = () => {
      if (music) music.volume = MUSIC_VOLUME_NORMAL;
    };
    const cues = SCENE_CAPTIONS[baseSceneKey] ?? [];
    setCaptionText('');
    const updateCaption = () => {
      const t = voice.currentTime;
      const active = cues.find(c => t >= c.start && t < c.end);
      setCaptionText(active ? active.text : '');
    };
    voice.addEventListener('playing', duck);
    voice.addEventListener('ended', unduck);
    voice.addEventListener('pause', unduck);
    voice.addEventListener('timeupdate', updateCaption);
    voice.addEventListener('ended', updateCaption);
    voice.play().catch(() => {});
    return () => {
      voice.removeEventListener('playing', duck);
      voice.removeEventListener('ended', unduck);
      voice.removeEventListener('pause', unduck);
      voice.removeEventListener('timeupdate', updateCaption);
      voice.removeEventListener('ended', updateCaption);
      voice.pause();
      unduck();
      setCaptionText('');
    };
  }, [currentSceneKey, baseSceneKey]);

  const bgPos = backgroundPositions[sceneIndex] ?? backgroundPositions[0];

  return (
    <div className="w-full h-screen overflow-hidden relative bg-[var(--color-bg-light)]">
      {/* Persistent Background Layer */}
      <motion.div
        className="absolute inset-0 mesh-bg origin-center"
        animate={bgPos}
        transition={{ duration: 4, ease: [0.25, 1, 0.5, 1] }}
      />
      
      {/* Abstract Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)',
          backgroundSize: '4vw 4vw'
        }}
      />

      <div className="absolute inset-0 pointer-events-none opacity-50 mix-blend-multiply">
        <motion.div
          className="absolute w-[900px] h-[900px] rounded-full blur-[120px] -top-20 -left-20"
          style={{ background: 'var(--color-primary)' }}
          animate={{
            x: sceneIndex % 2 === 0 ? '15%' : '-15%',
            y: sceneIndex % 2 === 0 ? '10%' : '-10%',
            scale: sceneIndex % 2 === 0 ? 1 : 1.15,
            opacity: sceneIndex === 0 ? 0.3 : 0.15
          }}
          transition={{ duration: 6, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full blur-[100px] bottom-[-20%] right-[-10%]"
          style={{ background: 'var(--color-accent)' }}
          animate={{
            x: sceneIndex % 2 === 0 ? '-10%' : '10%',
            y: sceneIndex % 2 === 0 ? '-15%' : '15%',
            opacity: sceneIndex === 1 ? 0.25 : 0.1
          }}
          transition={{ duration: 8, ease: 'easeInOut' }}
        />
      </div>

      <AnimatePresence mode="sync">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>

      {/* Persistent Brand Watermark */}
      <div className="absolute top-[5vh] right-[5vw] z-40 opacity-40">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="IDALIA" className="h-[3vh] w-auto grayscale contrast-200" />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-none flex justify-center pb-[5vh] px-[8vw]">
        <AnimatePresence mode="wait">
          {captionText && (
            <motion.div
              key={captionText}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[75%] rounded-xl px-7 py-3 text-center glass-panel"
              style={{
                borderTop: '2px solid var(--color-primary)',
              }}
            >
              <p
                className="text-[1.6vw] leading-snug font-medium text-slate-900"
                style={{
                  fontFamily: 'var(--font-display)',
                }}
              >
                {captionText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/bg_music.mp3`}
        preload="auto"
        autoPlay
        muted={muted}
      />

      <audio
        ref={voiceRef}
        preload="auto"
        muted={muted}
      />
    </div>
  );
}