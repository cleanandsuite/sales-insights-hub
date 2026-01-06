import { useState, useRef, useCallback, useEffect } from 'react';

interface UseMp3RecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  audioLevel: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  getAudioChunk: () => Promise<Blob | null>;
  recordingMethod: 'mp3-direct' | 'native-transcode';
}

export function useMp3Recorder(): UseMp3RecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingMethod, setRecordingMethod] = useState<'mp3-direct' | 'native-transcode'>('native-transcode');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mp3RecorderRef = useRef<any>(null);
  const workerRef = useRef<Worker | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mp3ChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const resolveStopRef = useRef<((blob: Blob | null) => void) | null>(null);

  // Initialize worker on mount
  useEffect(() => {
    try {
      // Create worker from the worker file
      workerRef.current = new Worker(
        new URL('../workers/mp3RecorderWorker.ts', import.meta.url),
        { type: 'module' }
      );
      console.log('MP3 Worker initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize MP3 worker, will use fallback:', error);
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(average / 255);
    
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1,
        } 
      });
      
      streamRef.current = stream;
      
      // Log microphone details
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        console.log('MICROPHONE DEBUG:', {
          label: audioTrack.label,
          enabled: audioTrack.enabled,
          muted: audioTrack.muted,
          readyState: audioTrack.readyState,
          settings: audioTrack.getSettings()
        });
      }
      
      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Try to use Mp3MediaRecorder if worker is available
      let useMp3Direct = false;
      
      if (workerRef.current) {
        try {
          // Dynamic import of Mp3MediaRecorder
          const { Mp3MediaRecorder } = await import('mp3-mediarecorder');
          
          const mp3Recorder = new Mp3MediaRecorder(stream, {
            worker: workerRef.current
          });
          
          mp3RecorderRef.current = mp3Recorder;
          mp3ChunksRef.current = [];
          
          mp3Recorder.ondataavailable = (event: BlobEvent) => {
            if (event.data.size > 0) {
              mp3ChunksRef.current.push(event.data);
              console.log('MP3 chunk received:', event.data.size, 'bytes');
            }
          };
          
          mp3Recorder.onstop = () => {
            console.log('MP3 recorder stopped, chunks:', mp3ChunksRef.current.length);
            const blob = new Blob(mp3ChunksRef.current, { type: 'audio/mpeg' });
            console.log('Final MP3 blob:', blob.size, 'bytes, type:', blob.type);
            
            if (resolveStopRef.current) {
              resolveStopRef.current(blob);
              resolveStopRef.current = null;
            }
          };
          
          mp3Recorder.onerror = (error: Event) => {
            console.error('MP3 recorder error:', error);
          };
          
          mp3Recorder.start();
          useMp3Direct = true;
          setRecordingMethod('mp3-direct');
          console.log('Using MP3 direct recording');
        } catch (mp3Error) {
          console.warn('Mp3MediaRecorder failed, falling back to native:', mp3Error);
        }
      }

      // Also start native recorder for live transcription chunks
      const nativeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus'
      ];
      
      let mimeType = 'audio/webm';
      for (const type of nativeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType,
        audioBitsPerSecond: 128000
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // If not using MP3 direct, set up onstop for native recorder
      if (!useMp3Direct) {
        setRecordingMethod('native-transcode');
        console.log('Using native recording with transcode fallback');
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          if (resolveStopRef.current) {
            resolveStopRef.current(blob);
            resolveStopRef.current = null;
          }
        };
      }
      
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
      resolveStopRef.current = resolve;
      
      // Stop native recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      // Stop MP3 recorder if active
      if (mp3RecorderRef.current && recordingMethod === 'mp3-direct') {
        try {
          mp3RecorderRef.current.stop();
        } catch (e) {
          console.error('Error stopping MP3 recorder:', e);
          // Fallback to native
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          resolve(blob);
        }
      }
      
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      setIsRecording(false);
      setIsPaused(false);
      setAudioLevel(0);
      
      // Timeout fallback
      setTimeout(() => {
        if (resolveStopRef.current) {
          console.warn('Stop timeout, returning native blob');
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          resolveStopRef.current(blob);
          resolveStopRef.current = null;
        }
      }, 3000);
    });
  }, [recordingMethod]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
    if (mp3RecorderRef.current) {
      try {
        mp3RecorderRef.current.pause();
      } catch (e) {
        // Mp3MediaRecorder may not support pause
      }
    }
    setIsPaused(true);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
    }
    if (mp3RecorderRef.current) {
      try {
        mp3RecorderRef.current.resume();
      } catch (e) {
        // Mp3MediaRecorder may not support resume
      }
    }
    setIsPaused(false);
    updateAudioLevel();
  }, [updateAudioLevel]);

  const getAudioChunk = useCallback(async (): Promise<Blob | null> => {
    if (chunksRef.current.length === 0) return null;
    return new Blob([...chunksRef.current], { type: 'audio/webm' });
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
    recordingMethod
  };
}
