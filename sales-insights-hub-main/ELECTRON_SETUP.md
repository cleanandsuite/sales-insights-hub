# GritCall Desktop (Electron) Setup Guide

This guide explains how to build and run GritCall as a desktop application with **system audio capture** (records both sides of a call).

## Quick Copy: package.json Changes

After exporting to GitHub, add these to your `package.json`:

```json
{
  "main": "electron/main.cjs",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:8080 && electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:mac": "npm run build && electron-builder --mac",
    "electron:build:win": "npm run build && electron-builder --win",
    "electron:build:linux": "npm run build && electron-builder --linux"
  }
}
```

Then install dev dependencies:
```bash
npm install --save-dev electron electron-builder concurrently wait-on
```

---

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
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:8080 && electron .\"",
    "electron:build": "npm run build && electron-builder",
    "electron:build:mac": "npm run build && electron-builder --mac",
    "electron:build:win": "npm run build && electron-builder --win",
    "electron:build:linux": "npm run build && electron-builder --linux"
  },
  "main": "electron/main.cjs"
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

## Troubleshooting

### "ReferenceError: require is not defined"

This error occurs when `package.json` has `"type": "module"` but Electron files use CommonJS `require()` syntax.

**Solution**: The Electron files use `.cjs` extension to force CommonJS mode:
- `electron/main.cjs` (not `.js`)
- `electron/preload.cjs` (not `.js`)

Make sure your `package.json` has:
```json
"main": "electron/main.cjs"
```

### Electron doesn't open after Vite starts

**Check the port**: The `wait-on` command must match Vite's port. Check your terminal output:
- If Vite shows `http://localhost:8080/` → use port `8080` in scripts
- If Vite shows `http://localhost:5173/` → use port `5173` in scripts

Update both:
1. `package.json` → `electron:dev` script's `wait-on` URL
2. `electron/main.cjs` → `mainWindow.loadURL()` in development mode

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

## File Structure

```
├── electron/
│   ├── main.cjs          # Electron main process
│   └── preload.cjs       # Preload script (IPC bridge)
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
