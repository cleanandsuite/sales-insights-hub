// MP3 Recorder Web Worker
// This worker handles MP3 encoding using the mp3-mediarecorder library

import { initMp3MediaEncoder } from 'mp3-mediarecorder/worker';

// Initialize the MP3 encoder with the WASM file from CDN
initMp3MediaEncoder({
  vmsgWasmUrl: 'https://unpkg.com/vmsg@0.4.0/vmsg.wasm'
});
