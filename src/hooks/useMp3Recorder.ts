import { useState, useRef, useCallback } from 'react';
import { isElectron, captureBothAudioSources } from '@/lib/electronAudio';

interface UseMp3RecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  audioLevel: number;
  startRecording: (captureSystemAudio?: boolean) => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  getAudioChunk: () => Promise<Blob | null>;
  recordingMethod: 'webm-opus' | 'native-fallback' | 'electron-system' | 'display-media';
  isSystemAudioCapture: boolean;
}

// Optimal settings for speech: mono 16kHz WebM Opus at 64kbps
// Whisper accepts WebM directly - no transcoding needed
const AUDIO_CONSTRAINTS = {
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: true,
  channelCount: 1,
  sampleRate: 16000,
};

const RECORDER_OPTIONS = {
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: 64000,
};

export function useMp3Recorder(): UseMp3RecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingMethod, setRecordingMethod] = useState<'webm-opus' | 'native-fallback' | 'electron-system' | 'display-media'>('webm-opus');
  const [isSystemAudioCapture, setIsSystemAudioCapture] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mimeTypeRef = useRef<string>('audio/webm;codecs=opus');
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const additionalStreamsRef = useRef<MediaStream[]>([]);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Capture system audio using getDisplayMedia (browser-based approach)
  const captureSystemAudioBrowser = useCallback(async (): Promise<MediaStream | null> => {
    try {
      // Request screen/tab share with audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true, // Required, but we'll ignore it
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        } as MediaTrackConstraints,
      });
      
      displayStreamRef.current = displayStream;
      
      // Check if audio track is available
      const audioTracks = displayStream.getAudioTracks();
      if (audioTracks.length === 0) {
        console.warn('No audio track in display stream - user may not have shared audio');
        // Stop video track since we don't need it
        displayStream.getVideoTracks().forEach(track => track.stop());
        return null;
      }
      
      // Stop video track - we only need audio
      displayStream.getVideoTracks().forEach(track => track.stop());
      
      console.log('System audio captured via getDisplayMedia:', audioTracks[0].label);
      
      // Create audio-only stream
      return new MediaStream(audioTracks);
    } catch (error) {
      console.error('Failed to capture system audio:', error);
      return null;
    }
  }, []);

  // Mix microphone and system audio streams
  const mixAudioStreams = useCallback(async (micStream: MediaStream, systemStream: MediaStream): Promise<MediaStream> => {
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const destination = audioContext.createMediaStreamDestination();
    
    // Connect microphone
    const micSource = audioContext.createMediaStreamSource(micStream);
    micSource.connect(destination);
    
    // Connect system audio
    const systemSource = audioContext.createMediaStreamSource(systemStream);
    systemSource.connect(destination);
    
    console.log('Mixed mic + system audio streams');
    return destination.stream;
  }, []);

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(average / 255);
    
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, []);

  const startRecording = useCallback(async (captureSystemAudio: boolean = true) => {
    try {
      let stream: MediaStream;
      
      // Check if running in Electron - use system audio capture via desktopCapturer
      if (isElectron()) {
        console.log('ELECTRON DETECTED: Attempting system audio capture...');
        const audioCapture = await captureBothAudioSources();
        
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
      } else if (captureSystemAudio) {
        // Browser: Try to capture system audio via getDisplayMedia
        console.log('BROWSER: Attempting system audio capture via screen share...');
        
        // First get microphone
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: AUDIO_CONSTRAINTS
        });
        
        // Then try to get system audio
        const systemStream = await captureSystemAudioBrowser();
        
        if (systemStream) {
          // Mix both streams
          stream = await mixAudioStreams(micStream, systemStream);
          additionalStreamsRef.current = [micStream, systemStream];
          setRecordingMethod('display-media');
          setIsSystemAudioCapture(true);
          console.log('BROWSER AUDIO: Capturing both microphone and system audio');
        } else {
          // Fallback to mic only
          stream = micStream;
          setRecordingMethod('webm-opus');
          setIsSystemAudioCapture(false);
          console.log('BROWSER FALLBACK: Using microphone only (user cancelled or no audio shared)');
        }
      } else {
        // Standard web recording - microphone only
        stream = await navigator.mediaDevices.getUserMedia({
          audio: AUDIO_CONSTRAINTS
        });
        setRecordingMethod('webm-opus');
        setIsSystemAudioCapture(false);
        console.log('BROWSER: Microphone only recording');
      }
      
      streamRef.current = stream;
      
      // Log audio source details
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        const settings = audioTrack.getSettings();
        console.log('AUDIO SOURCE:', {
          label: audioTrack.label,
          enabled: audioTrack.enabled,
          channelCount: settings.channelCount,
          sampleRate: settings.sampleRate,
          isElectron: isElectron(),
          isSystemAudio: isElectron() && additionalStreamsRef.current.length > 0,
        });
      }
      
      // Set up audio analysis with 16kHz context
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
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
      } else {
        setRecordingMethod('webm-opus');
        console.log('Using optimized WebM Opus @ 64kbps mono 16kHz');
      }
      
      mimeTypeRef.current = mimeType;
      
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType,
        audioBitsPerSecond: bitRate
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
      console.error('Error starting recording:', error);
      throw error;
    }
  }, [updateAudioLevel]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const cleanup = () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
        // Clean up display stream
        if (displayStreamRef.current) {
          displayStreamRef.current.getTracks().forEach((track) => track.stop());
          displayStreamRef.current = null;
        }
        // Clean up additional streams from Electron/browser capture
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

      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        cleanup();
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
        console.log('Recording stopped:', {
          format: mimeTypeRef.current,
          size: blob.size,
          chunks: chunksRef.current.length
        });
        cleanup();
        resolve(blob);
      };

      mediaRecorderRef.current.stop();
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
  };
}
