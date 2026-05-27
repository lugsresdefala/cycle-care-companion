#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = path.resolve(__dirname, '..');
const EXPORT_DIR = path.join(ARTIFACT_DIR, 'exports');
const FRAMES_DIR = path.join(EXPORT_DIR, '_frames');
const OUTPUT_PATH = path.join(EXPORT_DIR, 'idalia_promo.mp4');
const TMP_VIDEO_PATH = path.join(EXPORT_DIR, '_silent.mp4');
const CONCAT_FILE = path.join(EXPORT_DIR, '_concat.txt');
const AUDIO_PATH = path.join(ARTIFACT_DIR, 'public', 'audio', 'bg_music.mp3');
const OUTPUT_FPS = 30;

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit' });
    p.on('error', reject);
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function main() {
  console.log('Encoding video...');
  await run('ffmpeg', [
    '-y', '-loglevel', 'warning',
    '-f', 'concat', '-safe', '0', '-i', CONCAT_FILE,
    '-fps_mode', 'cfr', '-r', String(OUTPUT_FPS),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-preset', 'medium', '-crf', '20',
    '-movflags', '+faststart', TMP_VIDEO_PATH,
  ]);

  console.log('Muxing audio...');
  await run('ffmpeg', [
    '-y', '-loglevel', 'warning',
    '-i', TMP_VIDEO_PATH, '-i', AUDIO_PATH,
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
    '-shortest', '-movflags', '+faststart', OUTPUT_PATH,
  ]);

  await rm(TMP_VIDEO_PATH, { force: true });
  await rm(CONCAT_FILE, { force: true });
  await rm(FRAMES_DIR, { recursive: true, force: true });

  const s = await stat(OUTPUT_PATH);
  console.log(`Done: ${OUTPUT_PATH} (${(s.size / 1024 / 1024).toFixed(2)} MB)`);
}

main().catch((e) => { console.error('main error', e?.stack || e); process.exit(1); });
