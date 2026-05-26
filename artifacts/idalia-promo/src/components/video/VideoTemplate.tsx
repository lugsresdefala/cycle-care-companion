import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { Scene6 } from './video_scenes/Scene6';

export const SCENE_DURATIONS = {
  hook: 8000,
  dating: 12000,
  biometry: 12000,
  records: 12000,
  pricing: 10000,
  outro: 6000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  hook: Scene1,
  dating: Scene2,
  biometry: Scene3,
  records: Scene4,
  pricing: Scene5,
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

const backgroundPositions = [
  { scale: 1, x: '0%', y: '0%', opacity: 1 },
  { scale: 1.5, x: '-10%', y: '20%', opacity: 0.8 },
  { scale: 1.2, x: '10%', y: '-10%', opacity: 0.9 },
  { scale: 1.1, x: '5%', y: '5%', opacity: 1 },
  { scale: 1.3, x: '-5%', y: '-15%', opacity: 0.8 },
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

  const MUSIC_VOLUME_NORMAL = 0.45;
  const MUSIC_VOLUME_DUCKED = 0.15;
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
    voice.addEventListener('playing', duck);
    voice.addEventListener('ended', unduck);
    voice.addEventListener('pause', unduck);
    voice.play().catch(() => {});
    return () => {
      voice.removeEventListener('playing', duck);
      voice.removeEventListener('ended', unduck);
      voice.removeEventListener('pause', unduck);
      voice.pause();
      unduck();
    };
  }, [currentSceneKey, baseSceneKey]);

  const bgPos = backgroundPositions[sceneIndex] ?? backgroundPositions[0];

  return (
    <div className="w-full h-screen overflow-hidden relative" style={{ backgroundColor: 'var(--color-bg-light)' }}>
      <motion.div
        className="absolute inset-0 mesh-bg origin-center"
        animate={bgPos}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="absolute inset-0 pointer-events-none opacity-40">
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full blur-[100px] -top-40 -left-40"
          style={{ background: 'var(--color-primary)' }}
          animate={{
            x: sceneIndex % 2 === 0 ? '10%' : '-10%',
            y: sceneIndex % 2 === 0 ? '5%' : '-5%',
            scale: sceneIndex % 2 === 0 ? 1 : 1.1,
          }}
          transition={{ duration: 4, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[80px] bottom-[-20%] right-[-10%]"
          style={{ background: 'var(--color-accent)' }}
          animate={{
            x: sceneIndex % 2 === 0 ? '-5%' : '5%',
            y: sceneIndex % 2 === 0 ? '-10%' : '10%',
            opacity: sceneIndex === 1 ? 0.6 : 0.3,
          }}
          transition={{ duration: 5, ease: 'easeInOut' }}
        />
      </div>

      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>

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
