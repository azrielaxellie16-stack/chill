console.log('🐾 Starting...');

import { Worker } from 'worker_threads';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { watchFile, unwatchFile } from 'fs';
import readline from 'readline';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

const __dirname = dirname(fileURLToPath(import.meta.url));

/* =========================
   GLOBAL FFmpeg SETUP
========================= */
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

console.log('✅ FFmpeg:', ffmpegInstaller.path);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let worker = null;
let restartTimer = null;

function start(file) {
  const full = join(__dirname, file);

  if (worker) worker.terminate();

  worker = new Worker(full);

  // clean old timer
  if (restartTimer) {
    clearTimeout(restartTimer);
    restartTimer = null;
  }

  worker.on('message', (msg) => {
    console.log('[MESSAGE]', msg);

    if (msg === 'restart' || msg === 'reset') {
      restart();
    }
  });

  worker.on('exit', (code) => {
    console.log('❗ Worker exited with code', code);

    // auto restart (lebih cepat & aman)
    restartTimer = setTimeout(() => {
      console.log('♻️ Auto restart worker...');
      start(file);
    }, 5000);
  });

  // CLI listener hanya 1x
  if (!rl.listenerCount('line')) {
    rl.on('line', (line) => {
      const cmd = line.trim().toLowerCase();

      if (!cmd) return;

      if (cmd === 'exit') {
        console.log('⛔ Exiting...');
        worker?.terminate();
        process.exit(0);
      }

      if (cmd === 'restart' || cmd === 'reset') {
        console.log('🍃 Restart...');
        restart();
      }

      worker?.postMessage(cmd);
    });
  }

  // FILE WATCH FIX (jangan spam watcher)
  watchFile(full, () => {
    console.log('♻️ File changed → restart');
    unwatchFile(full);
    restart();
  });
}

function restart() {
  if (worker) {
    try {
      worker.terminate();
    } catch {}
  }

  worker = null;

  if (restartTimer) {
    clearTimeout(restartTimer);
    restartTimer = null;
  }

  start('main.js');
}
