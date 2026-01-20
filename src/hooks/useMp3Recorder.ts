import { useState, useRef, useCallback, useEffect } from 'react';
import { isElectron, captureBothAudioSources, getDesktopSources, type DesktopSource } from '@/lib/electronAudio';

interface UseMp3RecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  audioLevel: number;
  startRecording: (sourceId?: string) => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  getAudioChunk: () => Promise<Blob | null>;
  recordingMethod: 'webm-opus' | 'native-fallback' | 'electron-system';
  isSystemAudioCapture: boolean;
  // Electron-specific
  isElectronEnvironment: boolean;
  availableSources: DesktopSource[];
  refreshSources: () => Promise<void>;
  // Screen share mode control
  setUseScreenShare: (value: boolean) => void;
}

const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  // Keep constraints broadly compatible across browsers/devices.
  // (sampleRate is not reliably honored and can lead to odd capture behavior.)
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  channelCount: 1,
};

const RECORDER_OPTIONS = {
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: 64000,
};

export function useMp3Recorder(): UseMp3RecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingMethod, setRecordingMethod] = useState<'webm-opus' | 'native-fallback' | 'electron-system'>('webm-opus');
  const [isSystemAudioCapture, setIsSystemAudioCapture] = useState(false);
  const [isElectronEnvironment] = useState(() => isElectron());
  const [availableSources, setAvailableSources] = useState<DesktopSource[]>([]);
  const [useScreenShareMode, setUseScreenShare] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mimeTypeRef = useRef<string>('audio/webm;codecs=opus');
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const additionalStreamsRef = useRef<MediaStream[]>([]);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Refresh available desktop sources (Electron only)
  const refreshSources = useCallback(async () => {
    if (!isElectronEnvironment) return;
    const sources = await getDesktopSources();
    setAvailableSources(sources);
  }, [isElectronEnvironment]);

  // Load sources on mount if in Electron
  useEffect(() => {
    if (isElectronEnvironment) {
      refreshSources();
    }
  }, [isElectronEnvironment, refreshSources]);

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(average / 255);
    
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, []);

  const startRecording = useCallback(async (sourceId?: string) => {
    try {
      let stream: MediaStream;
      
      // Check if running in Electron - use system audio capture via desktopCapturer
      if (isElectronEnvironment) {
        console.log('ELECTRON DETECTED: Attempting system audio capture with sourceId:', sourceId);
        const audioCapture = await captureBothAudioSources(sourceId);
        
        if (audioCapture) {
          stream = audioCapture.combinedStream;
          additionalStreamsRef.current = [audioCapture.micStream, audioCapture.systemStream];
          setRecordingMethod('electron-system');
          setIsSystemAudioCapture(true);
          console.log('ELECTRON AUDIO: Capturing both microphone and system audio (both call sides)');
        } else {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: AUDIO_CONSTRAINTS
          });
          setIsSystemAudioCapture(false);
          console.log('ELECTRON FALLBACK: Using microphone only');
        }
      } else {
        // Browser: Check if screen share mode is enabled (headphone mode)
        if (useScreenShareMode) {
          // Try to capture screen/tab audio + microphone using getDisplayMedia
          console.log('BROWSER: Headphone mode - Attempting screen share for system audio capture');
          try {
            // Request screen share with audio
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
              video: true, // Required for getDisplayMedia
              audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
              }
            });
            
            // Get microphone stream
            const micStream = await navigator.mediaDevices.getUserMedia({
              audio: AUDIO_CONSTRAINTS
            });
            
            // Check if we got audio from the display
            const displayAudioTracks = displayStream.getAudioTracks();

            if (displayAudioTracks.length > 0) {
              // Combine microphone + display audio tracks into a single stream.
              // This avoids relying on an AudioContext mixer which can be suspended
              // by autoplay policies when recording starts without a direct user gesture.
              const combinedStream = new MediaStream([
                ...micStream.getAudioTracks(),
                ...displayAudioTracks,
              ]);

              stream = combinedStream;
              additionalStreamsRef.current = [micStream, displayStream];
              setRecordingMethod('webm-opus');
              setIsSystemAudioCapture(true);
              console.log('BROWSER: Capturing both microphone and tab/screen audio');

              // Stop the video track since we only need audio
              displayStream.getVideoTracks().forEach((track) => track.stop());
            } else {
              // No audio from display, use mic only but keep display stream for cleanup
              console.log('BROWSER: Screen share has no audio, using microphone only');
              stream = micStream;
              displayStream.getTracks().forEach((track) => track.stop());
              setRecordingMethod('webm-opus');
              setIsSystemAudioCapture(false);
            }
          } catch (displayError) {
            // User cancelled screen share or not supported - fall back to mic only
            console.log('BROWSER: Screen share not available or cancelled, using microphone only');
            stream = await navigator.mediaDevices.getUserMedia({
              audio: AUDIO_CONSTRAINTS
            });
            setRecordingMethod('webm-opus');
            setIsSystemAudioCapture(false);
          }
        } else {
          // Microphone only mode (no headphones)
          console.log('BROWSER: Microphone only mode - No screen share');
          stream = await navigator.mediaDevices.getUserMedia({
            audio: AUDIO_CONSTRAINTS
          });
          setRecordingMethod('webm-opus');
          setIsSystemAudioCapture(false);
        }
      }
      
      // Validate we got audio tracks
      const audioTracks = stream.getAudioTracks();
      console.log('RECORDER: Captured stream', {
        audioTracks: audioTracks.length,
        videoTracks: stream.getVideoTracks().length,
        isElectron: isElectronEnvironment,
        useScreenShareMode,
      });

      if (audioTracks.length === 0) {
        throw new Error('No audio tracks available from capture source');
      }

      // Log audio source details (first track)
      const audioTrack = audioTracks[0];
      const settings = audioTrack.getSettings();
      console.log('AUDIO SOURCE:', {
        label: audioTrack.label,
        enabled: audioTrack.enabled,
        channelCount: settings.channelCount,
        sampleRate: settings.sampleRate,
        isElectron: isElectron(),
        isSystemAudio: isElectron() && additionalStreamsRef.current.length > 0,
      });

      // Use the first audio track for analysis (some browsers can misbehave with multi-track streams)
      const analyserStream = new MediaStream([audioTrack]);
      streamRef.current = stream;

      // Set up audio analysis – don't force sampleRate; can break on some devices
      audioContextRef.current = new AudioContext();
      try {
        await audioContextRef.current.resume();
      } catch {
        // ignore – autoplay policy; recording still works
      }
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(analyserStream);
      source.connect(analyserRef.current);

      // Determine best supported format - prefer WebM Opus
      let mimeType = RECORDER_OPTIONS.mimeType;
      let bitRate = RECORDER_OPTIONS.audioBitsPerSecond;

      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Fallback chain
        const fallbacks = ['audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
        for (const type of fallbacks) {
          if (MediaRecorder.isTypeSupported(type)) {
            mimeType = type;
            break;
          }
        }
        setRecordingMethod('native-fallback');
        console.log('Using fallback format:', mimeType);
      } else if (!isElectronEnvironment) {
        setRecordingMethod('webm-opus');
        console.log('Using optimized WebM Opus @ 64kbps mono');
      }

      mimeTypeRef.current = mimeType;

      // Create MediaRecorder – fallback to single-track if multi-track fails
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          audioBitsPerSecond: bitRate,
        });
      } catch (err) {
        console.warn('MediaRecorder init failed; falling back to single-track stream', err);
        const singleTrackStream = new MediaStream([audioTrack]);
        streamRef.current = singleTrackStream;
        mediaRecorder = new MediaRecorder(singleTrackStream, {
          mimeType,
          audioBitsPerSecond: bitRate,
        });
      }

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.onstart = () => {
        console.log('RECORDER: MediaRecorder started', { mimeType, state: mediaRecorder.state });
      };

      mediaRecorder.onerror = (event) => {
        console.error('RECORDER: MediaRecorder error', event);
      };

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setIsPaused(false);
      updateAudioLevel();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, [isElectronEnvironment, updateAudioLevel, useScreenShareMode]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const cleanup = () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        // Clean up additional streams from Electron capture
        additionalStreamsRef.current.forEach(s => {
          s.getTracks().forEach(track => track.stop());
        });
        additionalStreamsRef.current = [];
        
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setIsPaused(false);
        setAudioLevel(0);
        setIsSystemAudioCapture(false);
      };

      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        cleanup();
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
        console.log('Recording stopped:', {
          format: mimeTypeRef.current,
          size: blob.size,
          chunks: chunksRef.current.length,
        });
        cleanup();
        resolve(blob.size > 0 ? blob : null);
      };

      // Try to flush any buffered audio before stopping
      try {
        recorder.requestData();
      } catch {
        // ignore
      }

      recorder.stop();
      setIsRecording(false);
    });
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      updateAudioLevel();
    }
  }, [updateAudioLevel]);

  const getAudioChunk = useCallback(async (): Promise<Blob | null> => {
    if (chunksRef.current.length === 0) return null;
    return new Blob([...chunksRef.current], { type: mimeTypeRef.current });
  }, []);

  return {
    isRecording,
    isPaused,
    audioLevel,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    getAudioChunk,
    recordingMethod,
    isSystemAudioCapture,
    isElectronEnvironment,
    availableSources,
    refreshSources,
    setUseScreenShare,
  };
}
