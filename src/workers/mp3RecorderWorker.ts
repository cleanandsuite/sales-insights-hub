// MP3 Recorder Web Worker
// This worker handles MP3 encoding using the mp3-mediarecorder library

import { initMp3MediaEncoder } from 'mp3-mediarecorder/worker';

// Use a stable URL that serves the correct application/wasm mime type
initMp3MediaEncoder({
  vmsgWasmUrl: 'https://app.unpkg.com/vmsg@0.4.0/files/vmsg.wasm',
});
