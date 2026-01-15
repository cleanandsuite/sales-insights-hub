# GritCall Desktop (Electron) Setup Guide

This guide explains how to build and run GritCall as a desktop application with **system audio capture** (records both sides of a call).

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Platform-specific:
- **macOS**: Xcode Command Line Tools
- **Windows**: Visual Studio Build Tools
- **Linux**: `libgtk-3-dev`, `libnss3`

## Quick Start

### 1. Clone and Install

```bash
# Clone from GitHub (after exporting from Lovable)
git clone <your-repo-url>
cd <project-folder>

# Install dependencies
npm install

# Install Electron dependencies
npm install --save-dev electron electron-builder concurrently wait-on
```

### 2. Add Scripts to package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:mac": "npm run build && electron-builder --mac",
    "electron:build:win": "npm run build && electron-builder --win",
    "electron:build:linux": "npm run build && electron-builder --linux"
  },
  "main": "electron/main.js"
}
```

### 3. Run in Development

```bash
npm run electron:dev
```

This starts the Vite dev server and opens Electron with hot reload.

### 4. Build for Production

```bash
# Build for current platform
npm run electron:build

# Or build for specific platform
npm run electron:build:mac
npm run electron:build:win
npm run electron:build:linux
```

Built apps will be in the `release/` folder.

## System Audio Capture

### How It Works

The app uses Electron's `desktopCapturer` API to capture system audio:

1. **Microphone**: Your voice (like the web version)
2. **System Audio**: Audio output from your computer (other party's voice)
3. **Combined**: Both mixed together for complete call recording

### macOS Permissions

On macOS, you need to grant permissions:

1. **Microphone**: Prompted automatically on first use
2. **Screen Recording**: Required for system audio
   - Go to System Preferences → Security & Privacy → Privacy → Screen Recording
   - Enable GritCall

### Windows Notes

Windows captures system audio automatically through the loopback device. No special permissions needed.

### Linux Notes

System audio capture on Linux requires PulseAudio or PipeWire with monitor sources enabled.

## Usage in Code

The app automatically uses system audio capture when running in Electron:

```typescript
import { useElectronRecorder } from '@/hooks/useElectronRecorder';

function RecordingComponent() {
  const {
    isRecording,
    startRecording,
    stopRecording,
    isElectronEnvironment,
    captureMode, // 'system' or 'mic-only'
    availableSources,
  } = useElectronRecorder();

  // Recording now captures both sides of the call!
  const handleStart = () => startRecording();
}
```

The `captureMode` tells you what's being captured:
- `'system'`: Both microphone and system audio (full call)
- `'mic-only'`: Microphone only (fallback if system audio unavailable)

## Selecting Audio Source

You can let users select which window/screen to capture audio from:

```typescript
const { availableSources, refreshSources, startRecording } = useElectronRecorder();

// Refresh available sources
await refreshSources();

// Start recording from specific source
await startRecording(availableSources[0].id);
```

## Troubleshooting

### No System Audio on macOS
- Ensure Screen Recording permission is granted
- Restart the app after granting permission

### Audio Quality Issues
- The app records at 16kHz mono (optimized for speech)
- System audio quality depends on the source application

### Build Errors
- Ensure all platform-specific dependencies are installed
- On macOS, you may need to run: `xcode-select --install`

## File Structure

```
├── electron/
│   ├── main.js          # Electron main process
│   └── preload.js       # Preload script (IPC bridge)
├── src/
│   ├── lib/
│   │   └── electronAudio.ts    # Electron audio utilities
│   └── hooks/
│       └── useElectronRecorder.ts  # Recording hook
├── build/
│   └── entitlements.mac.plist  # macOS permissions
├── electron-builder.json       # Build configuration
└── electron.vite.config.ts     # Vite config for Electron
```

## Support

For issues with the Electron build, check:
1. [Electron Documentation](https://www.electronjs.org/docs)
2. [electron-builder Documentation](https://www.electron.build)
