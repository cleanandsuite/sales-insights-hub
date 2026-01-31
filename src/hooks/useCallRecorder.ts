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

  const startRecording = useCallback(async (localStream: MediaStream, remoteStream: MediaStream) => {
    try {
      setError(null);
      setTranscripts([]);
      chunksRef.current = [];

      // Create audio context for mixing streams
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

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

      // Set up real-time transcription via AssemblyAI
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

      if (response.error || !response.data?.apiKey) {
        console.error('[CALL_RECORDER] Failed to get transcription credentials:', response.error);
        return;
      }

      // Connect to AssemblyAI Universal Streaming v3
      const wsUrl = new URL(response.data.wsUrl || 'wss://streaming.assemblyai.com/v3/ws');
      wsUrl.searchParams.set('sample_rate', '16000');
      wsUrl.searchParams.set('api_key', response.data.apiKey);

      const ws = new WebSocket(wsUrl.toString());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[CALL_RECORDER] AssemblyAI v3 connected');
        setIsTranscribing(true);

        // Create ScriptProcessor for streaming audio data
        const processor = audioContext.createScriptProcessor(4096, 2, 2);
        processorRef.current = processor;

        sourceNode.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;

          // Get both channels and mix to mono
          const leftChannel = e.inputBuffer.getChannelData(0);
          const rightChannel = e.inputBuffer.getChannelData(1);
          const monoData = new Float32Array(leftChannel.length);

          for (let i = 0; i < leftChannel.length; i++) {
            monoData[i] = (leftChannel[i] + rightChannel[i]) / 2;
          }

          // Convert to 16-bit PCM
          const pcmData = new Int16Array(monoData.length);
          for (let i = 0; i < monoData.length; i++) {
            const s = Math.max(-1, Math.min(1, monoData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }

          // Convert to base64 and send
          const uint8Array = new Uint8Array(pcmData.buffer);
          const base64 = btoa(String.fromCharCode(...uint8Array));
          
          // AssemblyAI v3 expects { audio: base64_string }
          ws.send(JSON.stringify({ audio: base64 }));
        };
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'Begin') {
            console.log('[CALL_RECORDER] Transcription session started:', data.id);
            return;
          }

          // Handle Turn messages (contains transcript)
          if (data.type === 'Turn' && data.transcript) {
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
          console.error('[CALL_RECORDER] Failed to parse message:', err);
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

      // Close WebSocket
      if (wsRef.current) {
        // Send end of stream signal
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ terminate: true }));
        }
        wsRef.current.close();
        wsRef.current = null;
      }

      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      // Stop and collect recording
      const mediaRecorder = mediaRecorderRef.current;
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          setIsRecording(false);
          setIsTranscribing(false);
          resolve(blob);
        };
        mediaRecorder.stop();
      } else {
        setIsRecording(false);
        setIsTranscribing(false);
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
