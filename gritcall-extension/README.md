# GritCall Audio Capture Extension

A Chrome extension that captures both microphone and tab audio for call recording in GritCall.

## Features

- **Dual Audio Capture**: Records both your microphone (your voice) and the current tab's audio (the other person's voice)
- **No Screen Share Picker**: Uses Chrome's tabCapture API for seamless audio capture
- **Real-time Streaming**: Sends audio chunks to GritCall for live transcription
- **Simple Controls**: Start/stop recording from the extension popup or directly from GritCall

## Installation

### Development Mode

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `gritcall-extension` folder
5. The extension icon should appear in your toolbar

### Converting Icons

Before loading, convert the SVG icons to PNG:

```bash
# Using ImageMagick or similar tool
convert icons/icon16.svg icons/icon16.png
convert icons/icon48.svg icons/icon48.png
convert icons/icon128.svg icons/icon128.png
```

Or use any online SVG to PNG converter.

## Usage

### From the Extension Popup

1. Click the GritCall extension icon in your toolbar
2. Click "Start Recording"
3. The extension will capture audio from the current tab and your microphone
4. Click "Stop Recording" when done

### From GritCall Web App

1. Navigate to GritCall (https://sales-muse-44.lovable.app or localhost)
2. The app will automatically detect the extension
3. Use the in-app recording controls - the extension handles audio capture

## How It Works

1. **Tab Capture**: Uses `chrome.tabCapture` API to get the current tab's audio stream
2. **Microphone**: Uses standard `getUserMedia` to capture your microphone
3. **Audio Mixing**: Combines both streams using Web Audio API
4. **Streaming**: Sends audio chunks to the GritCall web app via content script messaging

## Permissions

- `tabCapture`: Required to capture audio from the current tab
- `offscreen`: Required to maintain audio recording in background
- `activeTab`: Required to access the current tab for capture
- `scripting`: Required to inject content script for web app communication

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Popup.js      │────▶│  Background.js   │────▶│  Offscreen.js   │
│  (User clicks)  │     │ (Service Worker) │     │ (Audio Capture) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │   Content.js     │────▶│  GritCall App   │
                        │    (Bridge)      │     │   (Web App)     │
                        └──────────────────┘     └─────────────────┘
```

## Troubleshooting

### No Tab Audio
- Make sure the tab is playing audio when you start recording
- Some sites may block audio capture

### No Microphone
- Grant microphone permission when prompted
- Check Chrome's site settings for microphone access

### Extension Not Detected
- Refresh the GritCall page
- Make sure the extension is enabled in Chrome
