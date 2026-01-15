import { useState } from 'react';
import { X, Chrome, Headphones, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import JSZip from 'jszip';
import { toast } from 'sonner';

interface ExtensionInstallBannerProps {
  onDismiss?: () => void;
  variant?: 'compact' | 'full';
}

// Extension file contents embedded for download
const extensionFiles = {
  'manifest.json': `{
  "manifest_version": 3,
  "name": "GritCall Audio Capture",
  "version": "1.0.0",
  "description": "Capture both microphone and tab audio for GritCall call recording",
  "permissions": ["tabCapture", "offscreen", "activeTab", "scripting"],
  "host_permissions": ["https://sales-muse-44.lovable.app/*", "http://localhost:*/*"],
  "background": { "service_worker": "background.js" },
  "action": { "default_popup": "popup.html", "default_title": "GritCall Audio Capture" },
  "icons": { "16": "icons/icon16.png", "48": "icons/icon48.png", "128": "icons/icon128.png" }
}`,
  'background.js': `let isRecording = false;
let offscreenDocumentCreated = false;

async function ensureOffscreenDocument() {
  if (offscreenDocumentCreated) return;
  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Recording audio from tab and microphone'
    });
    offscreenDocumentCreated = true;
  } catch (e) {
    if (!e.message.includes('already exists')) throw e;
    offscreenDocumentCreated = true;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_RECORDING') {
    handleStartRecording(message.tabId).then(sendResponse);
    return true;
  } else if (message.type === 'STOP_RECORDING') {
    handleStopRecording().then(sendResponse);
    return true;
  } else if (message.type === 'GET_STATUS') {
    sendResponse({ isRecording });
    return false;
  } else if (message.type === 'AUDIO_DATA') {
    forwardAudioToContentScript(message.data, message.tabId);
  } else if (message.type === 'RECORDING_COMPLETE') {
    forwardRecordingComplete(message.audioBlob, message.tabId);
  }
});

async function handleStartRecording(tabId) {
  try {
    await ensureOffscreenDocument();
    const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tabId });
    chrome.runtime.sendMessage({ type: 'START_CAPTURE', streamId, tabId });
    isRecording = true;
    await injectContentScript(tabId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleStopRecording() {
  chrome.runtime.sendMessage({ type: 'STOP_CAPTURE' });
  isRecording = false;
  return { success: true };
}

async function injectContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
  } catch (e) { console.log('Content script may already be injected'); }
}

function forwardAudioToContentScript(audioData, tabId) {
  chrome.tabs.sendMessage(tabId, { type: 'GRITCALL_AUDIO_CHUNK', data: audioData });
}

function forwardRecordingComplete(audioBlob, tabId) {
  chrome.tabs.sendMessage(tabId, { type: 'GRITCALL_RECORDING_COMPLETE', audioBlob });
}`,
  'offscreen.html': `<!DOCTYPE html><html><head><title>GritCall Audio Capture</title></head><body><script src="offscreen.js"></script></body></html>`,
  'offscreen.js': `let mediaRecorder = null;
let audioContext = null;
let mixedStream = null;
let recordedChunks = [];
let currentTabId = null;

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'START_CAPTURE') {
    startCapture(message.streamId, message.tabId);
  } else if (message.type === 'STOP_CAPTURE') {
    stopCapture();
  }
});

async function startCapture(streamId, tabId) {
  currentTabId = tabId;
  recordedChunks = [];
  try {
    const tabStream = await navigator.mediaDevices.getUserMedia({
      audio: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: streamId } }
    });
    const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new AudioContext();
    const tabSource = audioContext.createMediaStreamSource(tabStream);
    const micSource = audioContext.createMediaStreamSource(micStream);
    const destination = audioContext.createMediaStreamDestination();
    tabSource.connect(destination);
    micSource.connect(destination);
    mixedStream = destination.stream;
    mediaRecorder = new MediaRecorder(mixedStream, { mimeType: 'audio/webm;codecs=opus' });
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
        const reader = new FileReader();
        reader.onloadend = () => {
          chrome.runtime.sendMessage({ type: 'AUDIO_DATA', data: reader.result, tabId: currentTabId });
        };
        reader.readAsDataURL(event.data);
      }
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        chrome.runtime.sendMessage({ type: 'RECORDING_COMPLETE', audioBlob: reader.result, tabId: currentTabId });
      };
      reader.readAsDataURL(blob);
    };
    mediaRecorder.start(1000);
  } catch (error) {
    console.error('Capture error:', error);
  }
}

function stopCapture() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  if (mixedStream) mixedStream.getTracks().forEach(track => track.stop());
  if (audioContext) audioContext.close();
  mediaRecorder = null;
  audioContext = null;
  mixedStream = null;
}`,
  'content.js': `window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data.type === 'GRITCALL_START_RECORDING') {
    chrome.runtime.sendMessage({ type: 'START_RECORDING', tabId: event.data.tabId }, (response) => {
      window.postMessage({ type: 'GRITCALL_RECORDING_STARTED', success: response?.success }, '*');
    });
  } else if (event.data.type === 'GRITCALL_STOP_RECORDING') {
    chrome.runtime.sendMessage({ type: 'STOP_RECORDING' }, (response) => {
      window.postMessage({ type: 'GRITCALL_RECORDING_STOPPED', success: response?.success }, '*');
    });
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'GRITCALL_AUDIO_CHUNK') {
    window.postMessage({ type: 'GRITCALL_AUDIO_CHUNK', data: message.data }, '*');
  } else if (message.type === 'GRITCALL_RECORDING_COMPLETE') {
    window.postMessage({ type: 'GRITCALL_RECORDING_COMPLETE', audioBlob: message.audioBlob }, '*');
  }
});

window.postMessage({ type: 'GRITCALL_EXTENSION_READY' }, '*');`,
  'popup.html': `<!DOCTYPE html>
<html><head>
  <style>
    body { width: 280px; padding: 16px; font-family: system-ui, sans-serif; background: #1a1a2e; color: #fff; }
    .header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    .logo { width: 32px; height: 32px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    h1 { font-size: 16px; margin: 0; }
    .status { padding: 12px; border-radius: 8px; margin-bottom: 16px; text-align: center; }
    .status.idle { background: rgba(99, 102, 241, 0.2); }
    .status.recording { background: rgba(239, 68, 68, 0.2); }
    button { width: 100%; padding: 12px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .start-btn { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; }
    .stop-btn { background: #ef4444; color: white; }
    .info { font-size: 11px; color: #888; margin-top: 12px; text-align: center; }
  </style>
</head>
<body>
  <div class="header"><div class="logo">🎙️</div><h1>GritCall</h1></div>
  <div id="status" class="status idle">Ready to record</div>
  <button id="actionBtn" class="start-btn">Start Recording</button>
  <p class="info">Records tab audio + microphone</p>
  <script src="popup.js"></script>
</body></html>`,
  'popup.js': `let isRecording = false;
const statusEl = document.getElementById('status');
const actionBtn = document.getElementById('actionBtn');

chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
  if (response?.isRecording) {
    isRecording = true;
    updateUI();
  }
});

actionBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!isRecording) {
    chrome.runtime.sendMessage({ type: 'START_RECORDING', tabId: tab.id }, (response) => {
      if (response?.success) {
        isRecording = true;
        updateUI();
      }
    });
  } else {
    chrome.runtime.sendMessage({ type: 'STOP_RECORDING' }, (response) => {
      if (response?.success) {
        isRecording = false;
        updateUI();
      }
    });
  }
});

function updateUI() {
  if (isRecording) {
    statusEl.textContent = '🔴 Recording...';
    statusEl.className = 'status recording';
    actionBtn.textContent = 'Stop Recording';
    actionBtn.className = 'stop-btn';
  } else {
    statusEl.textContent = 'Ready to record';
    statusEl.className = 'status idle';
    actionBtn.textContent = 'Start Recording';
    actionBtn.className = 'start-btn';
  }
}`
};

async function generateIconPng(size: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#6366f1');
  gradient.addColorStop(1, '#8b5cf6');
  
  // Rounded rectangle
  const radius = size * 0.2;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Microphone icon (simple circle + stem)
  ctx.fillStyle = 'white';
  const circleRadius = size * 0.16;
  ctx.beginPath();
  ctx.arc(size / 2, size * 0.38, circleRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Stem
  ctx.strokeStyle = 'white';
  ctx.lineWidth = size * 0.06;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(size / 2, size * 0.55);
  ctx.lineTo(size / 2, size * 0.72);
  ctx.stroke();
  
  // Base
  ctx.beginPath();
  ctx.moveTo(size * 0.35, size * 0.72);
  ctx.lineTo(size * 0.65, size * 0.72);
  ctx.stroke();
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

async function downloadExtension() {
  const zip = new JSZip();
  
  // Add main files
  Object.entries(extensionFiles).forEach(([name, content]) => {
    zip.file(name, content);
  });
  
  // Generate actual PNG icons
  const iconFolder = zip.folder('icons');
  const sizes = [16, 48, 128];
  
  for (const size of sizes) {
    const pngBlob = await generateIconPng(size);
    iconFolder?.file(`icon${size}.png`, pngBlob);
  }
  
  // Add README
  zip.file('README.txt', `GritCall Chrome Extension
========================

Installation:
1. Open Chrome and go to chrome://extensions/
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select this extracted folder

After installation, click the extension icon to start recording!`);
  
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gritcall-extension.zip';
  a.click();
  URL.revokeObjectURL(url);
  toast.success('Extension downloaded! Extract and load in Chrome.');
}

export function ExtensionInstallBanner({ onDismiss, variant = 'compact' }: ExtensionInstallBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadExtension();
    } finally {
      setDownloading(false);
    }
  };

  const InstallInstructions = () => (
    <div className="space-y-4 text-sm">
      <Button onClick={handleDownload} disabled={downloading} className="w-full gap-2">
        <Download className="h-4 w-4" />
        {downloading ? 'Preparing download...' : 'Download Extension'}
      </Button>
      <div className="space-y-2">
        <h4 className="font-semibold text-foreground">After downloading:</h4>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>Extract the zip file</li>
          <li>Open Chrome → <code className="px-1.5 py-0.5 rounded bg-muted text-foreground">chrome://extensions/</code></li>
          <li>Enable "Developer mode" (top right)</li>
          <li>Click "Load unpacked" and select the extracted folder</li>
        </ol>
      </div>
    </div>
  );

  if (variant === 'full') {
    return (
      <div className="relative p-4 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
            <Headphones className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground">
              Record both sides of your calls automatically
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 mb-3">
              Install our Chrome extension for one-click audio capture — no screen sharing needed
            </p>
            <InstallInstructions />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
      <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
        <Headphones className="h-5 w-5 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground">
          Record both sides of your calls automatically
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Install our Chrome extension for one-click audio capture
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Chrome className="h-4 w-4" />
              <span className="hidden sm:inline">Get Extension</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Chrome className="h-5 w-5 text-primary" />
                GritCall Chrome Extension
              </DialogTitle>
              <DialogDescription>
                Capture both your microphone and tab audio for complete call recording.
              </DialogDescription>
            </DialogHeader>
            <InstallInstructions />
          </DialogContent>
        </Dialog>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
