import { useState, useRef, useCallback, useEffect } from 'react';
import { isElectron, captureBothAudioSources, getDesktopSources, type DesktopSource } from '@/lib/electronAudio';

interface UseElectronRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  audioLevel: number;
  startRecording: (sourceId?: string) => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  getAudioChunk: () => Promise<Blob | null>;
  isElectronEnvironment: boolean;
  availableSources: DesktopSource[];
  refreshSources: () => Promise<void>;
  captureMode: 'system' | 'mic-only';
}

const RECORDER_OPTIONS = {
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: 64000,
};

export function useElectronRecorder(): UseElectronRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isElectronEnvironment] = useState(() => isElectron());
  const [availableSources, setAvailableSources] = useState<DesktopSource[]>([]);
  const [captureMode, setCaptureMode] = useState<'system' | 'mic-only'>('system');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamsRef = useRef<{
    combined?: MediaStream;
    mic?: MediaStream;
    system?: MediaStream;
  }>({});
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Refresh available desktop sources
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

      if (isElectronEnvironment) {
        // Try to capture both system and mic audio
        const audioCapture = await captureBothAudioSources(sourceId);
        
        if (audioCapture) {
          stream = audioCapture.combinedStream;
          streamsRef.current = {
            combined: audioCapture.combinedStream,
            mic: audioCapture.micStream,
            system: audioCapture.systemStream,
          };
          setCaptureMode('system');
          console.log('ELECTRON AUDIO: Capturing both system and microphone audio');
        } else {
          // Fallback to microphone only
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: true,
              channelCount: 1,
              sampleRate: 16000,
            },
          });
          streamsRef.current = { combined: stream, mic: stream };
          setCaptureMode('mic-only');
          console.log('ELECTRON AUDIO: Fallback to microphone only');
        }
      } else {
        // Web fallback - microphone only
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 16000,
          },
        });
        streamsRef.current = { combined: stream, mic: stream };
        setCaptureMode('mic-only');
      }

      // Set up audio analysis
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Determine MIME type
      let mimeType = RECORDER_OPTIONS.mimeType;
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        const fallbacks = ['audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
        for (const type of fallbacks) {
          if (MediaRecorder.isTypeSupported(type)) {
            mimeType = type;
            break;
          }
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: RECORDER_OPTIONS.audioBitsPerSecond,
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

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
      console.error('Error starting Electron recording:', error);
      throw error;
    }
  }, [isElectronEnvironment, updateAudioLevel]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const cleanup = () => {
        // Stop all streams
        Object.values(streamsRef.current).forEach(stream => {
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
        });
        streamsRef.current = {};

        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        setIsPaused(false);
        setAudioLevel(0);
      };

      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        cleanup();
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        console.log('Electron recording stopped:', {
          format: mimeType,
          size: blob.size,
          chunks: chunksRef.current.length,
          captureMode,
        });
        cleanup();
        resolve(blob);
      };

      mediaRecorderRef.current.stop();
      setIsRecording(false);
    });
  }, [captureMode]);

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
    const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
    return new Blob([...chunksRef.current], { type: mimeType });
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
    isElectronEnvironment,
    availableSources,
    refreshSources,
    captureMode,
  };
}
