import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TranscriptSegment {
  text: string;
  speaker: 'user' | 'remote';
  timestamp: number;
  isFinal: boolean;
}

interface UseCallRecorderReturn {
  isRecording: boolean;
  transcripts: TranscriptSegment[];
  isTranscribing: boolean;
  startRecording: (localStream: MediaStream, remoteStream: MediaStream) => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  error: string | null;
}

export function useCallRecorder(): UseCallRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const silentGainRef = useRef<GainNode | null>(null);

  const pickScriptProcessorBufferSize = (sampleRate: number) => {
    // AssemblyAI recommends ~50ms per message.
    const targetSamples = Math.round(sampleRate * 0.05);
    const sizes = [256, 512, 1024, 2048, 4096, 8192] as const;
    return sizes.reduce((best, size) => {
      return Math.abs(size - targetSamples) < Math.abs(best - targetSamples) ? size : best;
    }, 2048);
  };

  const startRecording = useCallback(async (localStream: MediaStream, remoteStream: MediaStream) => {
    try {
      setError(null);
      setTranscripts([]);
      chunksRef.current = [];

      console.log('[CALL_RECORDER] Starting recording...');
      console.log('[CALL_RECORDER] Local tracks:', localStream.getAudioTracks().length);
      console.log('[CALL_RECORDER] Remote tracks:', remoteStream.getAudioTracks().length);

      // Create audio context for mixing streams.
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      console.log('[CALL_RECORDER] AudioContext sampleRate:', audioContext.sampleRate);

      // Create sources for both streams
      const localSource = audioContext.createMediaStreamSource(localStream);
      const remoteSource = audioContext.createMediaStreamSource(remoteStream);

      // Create a merger to combine both streams (stereo: local=left, remote=right)
      const merger = audioContext.createChannelMerger(2);
      localSource.connect(merger, 0, 0);
      remoteSource.connect(merger, 0, 1);

      // Create a destination for the mixed audio
      const destination = audioContext.createMediaStreamDestination();
      merger.connect(destination);

      // Set up MediaRecorder for the mixed stream (for saving the recording)
      const mixedStream = destination.stream;
      const mediaRecorder = new MediaRecorder(mixedStream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Start recording with 1-second chunks
      mediaRecorder.start(1000);
      setIsRecording(true);
      console.log('[CALL_RECORDER] MediaRecorder started');

      // Set up real-time transcription via AssemblyAI
      // Pass the merger so we can tap into the mixed audio
      await setupTranscription(audioContext, merger);

    } catch (err: any) {
      console.error('[CALL_RECORDER] Start error:', err);
      setError(err.message || 'Failed to start recording');
    }
  }, []);

  const setupTranscription = useCallback(async (audioContext: AudioContext, sourceNode: AudioNode) => {
    try {
      // Get AssemblyAI credentials
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('[CALL_RECORDER] No session for transcription');
        return;
      }

      const response = await supabase.functions.invoke('transcribe-audio', {
        body: { action: 'get_realtime_token' },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      console.log('[CALL_RECORDER] Token response:', JSON.stringify(response.data), 'Error:', response.error);

      if (response.error || !response.data?.token) {
        console.error('[CALL_RECORDER] Failed to get transcription credentials:', response.error, response.data);
        return;
      }

      console.log('[CALL_RECORDER] Got temp token, expires:', response.data.expiresAt);

      // Connect to AssemblyAI Universal Streaming v3
      // CRITICAL: Must use 16000 sample_rate - AssemblyAI expects 16kHz PCM
      const wsUrl = new URL(response.data.wsUrl || 'wss://streaming.assemblyai.com/v3/ws');
      wsUrl.searchParams.set('token', response.data.token);
      wsUrl.searchParams.set('sample_rate', '16000'); // Must be 16kHz
      wsUrl.searchParams.set('encoding', 'pcm_s16le');
      wsUrl.searchParams.set('format_turns', 'true');
      // Tune end-of-turn detection for phone calls with overlapping speakers
      wsUrl.searchParams.set('end_of_turn_confidence_threshold', '0.5');
      wsUrl.searchParams.set('min_end_of_turn_silence_when_confident', '480');
      wsUrl.searchParams.set('max_turn_silence', '1500');

      console.log('[CALL_RECORDER] Connecting to:', wsUrl.toString().replace(/token=[^&]+/, 'token=REDACTED'));
      
      const ws = new WebSocket(wsUrl.toString());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[CALL_RECORDER] AssemblyAI v3 WebSocket connected');
        setIsTranscribing(true);

        // Create ScriptProcessor for streaming audio data
        const bufferSize = pickScriptProcessorBufferSize(audioContext.sampleRate);
        console.log('[CALL_RECORDER] Using buffer size:', bufferSize);
        const processor = audioContext.createScriptProcessor(bufferSize, 2, 1);
        processorRef.current = processor;

        sourceNode.connect(processor);

        // ScriptProcessor must be connected to an output to fire onaudioprocess in some browsers.
        // Route through a silent gain to avoid audible output.
        const silentGain = audioContext.createGain();
        silentGain.gain.value = 0;
        silentGainRef.current = silentGain;
        processor.connect(silentGain);
        silentGain.connect(audioContext.destination);

        let audioChunksSent = 0;
        // Store native sample rate for resampling
        const nativeSampleRate = audioContext.sampleRate;
        const targetSampleRate = 16000;
        
        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;

          // Backpressure guard to avoid runaway buffering
          if (ws.bufferedAmount > 2_000_000) return;

          // Get both channels and mix to mono
          const leftChannel = e.inputBuffer.getChannelData(0);
          const rightChannel = e.inputBuffer.getChannelData(1);
          const monoData = new Float32Array(leftChannel.length);

          for (let i = 0; i < leftChannel.length; i++) {
            monoData[i] = (leftChannel[i] + rightChannel[i]) / 2;
          }

          // Resample to 16kHz if needed (AssemblyAI requires 16kHz)
          let resampledData: Float32Array;
          if (nativeSampleRate !== targetSampleRate) {
            const ratio = targetSampleRate / nativeSampleRate;
            const newLength = Math.round(monoData.length * ratio);
            resampledData = new Float32Array(newLength);
            for (let i = 0; i < newLength; i++) {
              const srcIndex = i / ratio;
              const srcIndexFloor = Math.floor(srcIndex);
              const srcIndexCeil = Math.min(srcIndexFloor + 1, monoData.length - 1);
              const t = srcIndex - srcIndexFloor;
              resampledData[i] = monoData[srcIndexFloor] * (1 - t) + monoData[srcIndexCeil] * t;
            }
          } else {
            resampledData = monoData;
          }

          // Convert to 16-bit PCM (little-endian signed integers)
          const pcmData = new Int16Array(resampledData.length);
          for (let i = 0; i < resampledData.length; i++) {
            const s = Math.max(-1, Math.min(1, resampledData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }

          // AssemblyAI v3 expects raw binary PCM frames (not JSON/base64)
          ws.send(pcmData.buffer);
          audioChunksSent++;
          
          // Log every 100 chunks to confirm audio is flowing
          if (audioChunksSent % 100 === 0) {
            console.log('[CALL_RECORDER] Audio chunks sent:', audioChunksSent, 'resampled:', nativeSampleRate !== targetSampleRate);
          }
        };
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[CALL_RECORDER] WS message:', data.type, data);

          if (data.type === 'Begin') {
            console.log('[CALL_RECORDER] Transcription session started:', data.id);
            return;
          }

          // Handle Turn messages (contains transcript)
          if (data.type === 'Turn' && data.transcript) {
            console.log('[CALL_RECORDER] Got transcript:', data.transcript);
            const segment: TranscriptSegment = {
              text: data.transcript,
              speaker: 'remote', // We could try to differentiate based on channel analysis
              timestamp: Date.now(),
              isFinal: data.end_of_turn === true
            };

            setTranscripts(prev => {
              // Replace partial with final, or add new
              if (segment.isFinal) {
                return [...prev.filter(t => t.isFinal), segment];
              }
              return [...prev.filter(t => t.isFinal), segment];
            });
          }

          if (data.type === 'Termination') {
            console.log('[CALL_RECORDER] Session terminated:', data.reason);
          }

          if (data.type === 'Error') {
            console.error('[CALL_RECORDER] AssemblyAI error:', data.error);
          }
        } catch (err) {
          console.error('[CALL_RECORDER] Failed to parse message:', err, event.data);
        }
      };

      ws.onerror = (err) => {
        console.error('[CALL_RECORDER] WebSocket error:', err);
      };

      ws.onclose = (event) => {
        console.log('[CALL_RECORDER] WebSocket closed:', event.code, event.reason);
        setIsTranscribing(false);
      };

    } catch (err) {
      console.error('[CALL_RECORDER] Transcription setup error:', err);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      // Stop the processor
      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }

      if (silentGainRef.current) {
        silentGainRef.current.disconnect();
        silentGainRef.current = null;
      }

      // Close WebSocket
      if (wsRef.current) {
        // Send end of stream signal (AssemblyAI v3)
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'Terminate' }));
        }

        // Give the server a moment to emit any final Turn/Termination messages
        setTimeout(() => {
          try {
            wsRef.current?.close();
          } catch {
            // ignore
          }
        }, 250);
        wsRef.current = null;
      }

      // Stop and collect recording
      const mediaRecorder = mediaRecorderRef.current;
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          setIsRecording(false);
          setIsTranscribing(false);

          // Close audio context after MediaRecorder is done
          if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
          }

          resolve(blob);
        };
        mediaRecorder.stop();
      } else {
        setIsRecording(false);
        setIsTranscribing(false);

        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }

        resolve(chunksRef.current.length > 0 
          ? new Blob(chunksRef.current, { type: 'audio/webm' })
          : null
        );
      }
    });
  }, []);

  return {
    isRecording,
    transcripts,
    isTranscribing,
    startRecording,
    stopRecording,
    error
  };
}
