#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdir, rm, stat, writeFile, readFile } from 'node:fs/promises';
import { createServer as createHttpServer } from 'node:http';
import puppeteer from 'puppeteer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ARTIFACT_DIR, 'dist', 'public');
const EXPORT_DIR = path.join(ARTIFACT_DIR, 'exports');
const FRAMES_DIR = path.join(EXPORT_DIR, '_frames');
const OUTPUT_PATH = path.join(EXPORT_DIR, 'idalia_promo.mp4');
const TMP_VIDEO_PATH = path.join(EXPORT_DIR, '_silent.mp4');
const CONCAT_FILE = path.join(EXPORT_DIR, '_concat.txt');
const AUDIO_PATH = path.join(ARTIFACT_DIR, 'public', 'audio', 'bg_music.mp3');

const PORT = 21999;
const BASE_PATH = '/idalia-promo/';
const WIDTH = 1280;
const HEIGHT = 720;
const SCREENCAST_EVERY_NTH = 2;
const OUTPUT_FPS = 30;
const MAX_DURATION_MS = 90_000;

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
  '.ico': 'image/x-icon', '.txt': 'text/plain', '.webp': 'image/webp',
};

async function startStaticServer() {
  const server = createHttpServer(async (req, res) => {
    try {
      let url = req.url.split('?')[0];
      if (url.startsWith(BASE_PATH)) url = url.slice(BASE_PATH.length - 1);
      if (url === '/' || url === '') url = '/index.html';
      let filePath = path.join(DIST_DIR, url);
      try {
        const s = await stat(filePath);
        if (s.isDirectory()) filePath = path.join(filePath, 'index.html');
      } catch {
        filePath = path.join(DIST_DIR, 'index.html');
      }
      const data = await readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(data);
    } catch (e) {
      res.writeHead(500); res.end('err: ' + e.message);
    }
  });
  await new Promise((r, j) => server.listen(PORT, '127.0.0.1', r).once('error', j));
  return server;
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit' });
    p.on('error', reject);
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function main() {
  await rm(EXPORT_DIR, { recursive: true, force: true });
  await mkdir(FRAMES_DIR, { recursive: true });

  console.log('Starting static server...');
  const server = await startStaticServer();

  console.log('Launching Chromium...');
  const browser = await puppeteer.launch({
    headless: 'shell',
    executablePath: process.env.CHROMIUM_PATH || '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium',
    defaultViewport: { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 },
    args: [
      '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
      '--autoplay-policy=no-user-gesture-required', '--mute-audio',
      `--window-size=${WIDTH},${HEIGHT}`, '--hide-scrollbars', '--disable-extensions',
      '--disable-background-networking', '--disable-features=TranslateUI,site-per-process',
      '--disable-sync', '--no-first-run', '--no-default-browser-check',
    ],
    dumpio: true,
  });
  browser.on('disconnected', () => console.error('[browser] disconnected'));

  const frames = [];
  let stopResolve;
  const stopped = new Promise((r) => (stopResolve = r));
  let recording = false;

  try {
    const page = await browser.newPage();
    page.on('pageerror', (err) => console.error('[pageerror]', err.message));
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

    await page.exposeFunction('__exportStartRecording', () => { console.log('start recording'); recording = true; });
    await page.exposeFunction('__exportStopRecording', () => { console.log('stop recording'); recording = false; stopResolve(); });
    await page.evaluateOnNewDocument(() => {
      window.startRecording = async () => { await window.__exportStartRecording(); };
      window.stopRecording = () => { window.__exportStopRecording(); };
    });

    const client = await page.target().createCDPSession();
    let writing = Promise.resolve();
    const heartbeat = setInterval(() => { console.log(`[hb] captured=${frames.length} recording=${recording}`); }, 5000);

    client.on('Page.screencastFrame', async ({ data, sessionId, metadata }) => {
      try { await client.send('Page.screencastFrameAck', { sessionId }); } catch {}
      if (!recording) return;
      const idx = frames.length;
      const filePath = path.join(FRAMES_DIR, `f${String(idx).padStart(6, '0')}.jpg`);
      frames.push({ idx, timestamp: metadata.timestamp, path: filePath });
      const buf = Buffer.from(data, 'base64');
      writing = writing.then(() => writeFile(filePath, buf)).catch((e) => console.error('writeFile err', e?.message));
    });

    const url = `http://127.0.0.1:${PORT}${BASE_PATH}`;
    console.log(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await new Promise((r) => setTimeout(r, 1500));

    await client.send('Page.startScreencast', {
      format: 'jpeg', quality: 85,
      maxWidth: WIDTH, maxHeight: HEIGHT,
      everyNthFrame: SCREENCAST_EVERY_NTH,
    });

    console.log('Recording...');
    await Promise.race([
      stopped,
      new Promise((_, rej) => setTimeout(() => rej(new Error('record timeout')), MAX_DURATION_MS)),
    ]);

    await client.send('Page.stopScreencast').catch(() => {});
    await new Promise((r) => setTimeout(r, 300));
    await writing;
    clearInterval(heartbeat);
  } finally {
    await browser.close().catch(() => {});
    server.close();
  }

  if (frames.length < 2) throw new Error(`Not enough frames captured: ${frames.length}`);

  const realDuration = frames[frames.length - 1].timestamp - frames[0].timestamp;
  console.log(`Captured ${frames.length} frames over ${realDuration.toFixed(2)}s real time`);

  let concat = 'ffconcat version 1.0\n';
  for (let i = 0; i < frames.length; i++) {
    const cur = frames[i];
    const next = frames[i + 1];
    const dur = next ? (next.timestamp - cur.timestamp) : (1 / OUTPUT_FPS);
    concat += `file '${cur.path}'\nduration ${dur.toFixed(6)}\n`;
  }
  concat += `file '${frames[frames.length - 1].path}'\n`;
  await writeFile(CONCAT_FILE, concat);

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
  await writeFile(path.join(EXPORT_DIR, '.success'), 'ok');
}

process.on('unhandledRejection', (e) => { console.error('unhandledRejection', e?.stack || e); });
process.on('uncaughtException', (e) => { console.error('uncaughtException', e?.stack || e); });
process.on('SIGTERM', () => { console.error('got SIGTERM'); });
process.on('SIGHUP', () => { console.error('got SIGHUP'); });
process.on('exit', (c) => { console.error('exiting with code', c); });

main().catch((e) => { console.error('main error', e?.stack || e); process.exit(1); });
