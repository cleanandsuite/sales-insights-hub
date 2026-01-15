// Electron Audio Capture Utilities
// Uses desktopCapturer to capture system audio (both sides of a call)

export interface DesktopSource {
  id: string;
  name: string;
  thumbnail: string;
}

export interface ElectronAPI {
  isElectron: () => Promise<boolean>;
  getDesktopSources: () => Promise<DesktopSource[]>;
  getSystemInfo: () => Promise<{
    platform: string;
    arch: string;
    version: string;
  }>;
  platform: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    isElectron?: boolean;
  }
}

/**
 * Check if running in Electron environment
 */
export function isElectron(): boolean {
  return typeof window !== 'undefined' && window.isElectron === true;
}

/**
 * Get the Electron API if available
 */
export function getElectronAPI(): ElectronAPI | null {
  if (isElectron() && window.electronAPI) {
    return window.electronAPI;
  }
  return null;
}

/**
 * Get available desktop sources for audio capture
 */
export async function getDesktopSources(): Promise<DesktopSource[]> {
  const api = getElectronAPI();
  if (!api) {
    console.warn('Not running in Electron, cannot get desktop sources');
    return [];
  }
  
  try {
    return await api.getDesktopSources();
  } catch (error) {
    console.error('Error getting desktop sources:', error);
    return [];
  }
}

/**
 * Capture system audio using desktopCapturer
 * This captures both microphone AND system audio (e.g., call audio from the other party)
 */
export async function captureSystemAudio(sourceId?: string): Promise<MediaStream | null> {
  if (!isElectron()) {
    console.warn('System audio capture only available in Electron');
    return null;
  }

  try {
    // Get the source ID - use first screen if not provided
    let targetSourceId = sourceId;
    if (!targetSourceId) {
      const sources = await getDesktopSources();
      const screenSource = sources.find(s => s.id.startsWith('screen:'));
      if (screenSource) {
        targetSourceId = screenSource.id;
      }
    }

    if (!targetSourceId) {
      throw new Error('No screen source available for audio capture');
    }

    // Capture system audio using getUserMedia with chromeMediaSourceId
    // This captures the system audio output (what you hear)
    const systemAudioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        // @ts-ignore - Electron-specific constraint
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: targetSourceId,
        },
      },
      video: false,
    });

    return systemAudioStream;
  } catch (error) {
    console.error('Error capturing system audio:', error);
    return null;
  }
}

/**
 * Capture both microphone and system audio, mixing them together
 * This is ideal for recording both sides of a call
 */
export async function captureBothAudioSources(sourceId?: string): Promise<{
  combinedStream: MediaStream;
  micStream: MediaStream;
  systemStream: MediaStream;
} | null> {
  if (!isElectron()) {
    console.warn('Combined audio capture only available in Electron');
    return null;
  }

  try {
    // Get microphone audio
    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: true,
        channelCount: 1,
        sampleRate: 16000,
      },
    });

    // Get system audio
    const systemStream = await captureSystemAudio(sourceId);
    
    if (!systemStream) {
      // Fallback to mic only if system audio not available
      console.warn('System audio not available, using microphone only');
      return {
        combinedStream: micStream,
        micStream,
        systemStream: micStream, // Use mic as fallback
      };
    }

    // Create AudioContext to mix both streams
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const destination = audioContext.createMediaStreamDestination();

    // Connect microphone
    const micSource = audioContext.createMediaStreamSource(micStream);
    micSource.connect(destination);

    // Connect system audio
    const systemSource = audioContext.createMediaStreamSource(systemStream);
    systemSource.connect(destination);

    return {
      combinedStream: destination.stream,
      micStream,
      systemStream,
    };
  } catch (error) {
    console.error('Error capturing both audio sources:', error);
    return null;
  }
}

/**
 * Get system information from Electron
 */
export async function getSystemInfo(): Promise<{
  platform: string;
  arch: string;
  version: string;
} | null> {
  const api = getElectronAPI();
  if (!api) {
    return null;
  }
  
  try {
    return await api.getSystemInfo();
  } catch (error) {
    console.error('Error getting system info:', error);
    return null;
  }
}
