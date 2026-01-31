import { useState, useEffect, useRef, useCallback } from 'react';
import { TelnyxRTC } from '@telnyx/webrtc';
import { supabase } from '@/integrations/supabase/client';

export type CallStatus = 'idle' | 'connecting' | 'ringing' | 'connected' | 'ended' | 'error';

interface TranscriptSegment {
  text: string;
  speaker: 'user' | 'remote';
  timestamp: number;
  isFinal: boolean;
}

interface UseTelnyxCallReturn {
  // State
  callStatus: CallStatus;
  isReady: boolean;
  error: string | null;
  isMuted: boolean;
  
  // Call controls
  startCall: (phoneNumber: string) => Promise<void>;
  endCall: () => void;
  muteAudio: (muted: boolean) => void;
  
  // Transcription
  transcripts: TranscriptSegment[];
  isTranscribing: boolean;
  
  // Call info
  duration: number;
  callId: string | null;
}

export function useTelnyxCall(): UseTelnyxCallReturn {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptSegment[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [callId, setCallId] = useState<string | null>(null);

  const clientRef = useRef<TelnyxRTC | null>(null);
  const callRef = useRef<any>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const assemblyWsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Initialize Telnyx client
  const initializeClient = useCallback(async () => {
    try {
      // Get auth token from edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please log in to make calls');
        return;
      }

      const response = await supabase.functions.invoke('telnyx-auth', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to get Telnyx credentials');
      }

      const { login, password, realm } = response.data;

      const client = new TelnyxRTC({
        login,
        password,
        ringtoneFile: undefined,
        ringbackFile: undefined,
      });

      client.on('telnyx.ready', () => {
        console.log('[TELNYX] Client ready');
        setIsReady(true);
        setError(null);
      });

      client.on('telnyx.error', (err: any) => {
        console.error('[TELNYX] Error:', err);
        setError(err.message || 'Connection error');
        setIsReady(false);
      });

      client.on('telnyx.socket.close', () => {
        console.log('[TELNYX] Socket closed');
        setIsReady(false);
      });

      client.on('telnyx.notification', (notification: any) => {
        console.log('[TELNYX] Notification:', notification);
        handleCallNotification(notification);
      });

      await client.connect();
      clientRef.current = client;
    } catch (err: any) {
      console.error('[TELNYX] Init error:', err);
      setError(err.message || 'Failed to initialize calling');
    }
  }, []);

  const handleCallNotification = useCallback((notification: any) => {
    const call = notification.call;
    if (!call) return;

    callRef.current = call;

    switch (notification.type) {
      case 'callUpdate':
        const state = call.state;
        console.log('[TELNYX] Call state:', state);
        
        if (state === 'trying' || state === 'requesting') {
          setCallStatus('connecting');
        } else if (state === 'ringing' || state === 'early') {
          setCallStatus('ringing');
        } else if (state === 'active') {
          setCallStatus('connected');
          setCallId(call.id);
          startDurationTimer();
          startBidirectionalTranscription(call);
        } else if (state === 'hangup' || state === 'destroy') {
          setCallStatus('ended');
          stopDurationTimer();
          stopTranscription();
        }
        break;
    }
  }, []);

  const startDurationTimer = useCallback(() => {
    setDuration(0);
    durationIntervalRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const stopDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  // Start bidirectional transcription using AssemblyAI
  const startBidirectionalTranscription = useCallback(async (call: any) => {
    try {
      setIsTranscribing(true);
      
      // Get local and remote audio streams
      const localStream = call.localStream;
      const remoteStream = call.remoteStream;

      if (!localStream || !remoteStream) {
        console.warn('[TELNYX] Streams not available yet');
        return;
      }

      // Create audio context for mixing streams
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const audioContext = audioContextRef.current;

      // Create sources for both streams
      const localSource = audioContext.createMediaStreamSource(localStream);
      const remoteSource = audioContext.createMediaStreamSource(remoteStream);

      // Create a merger to combine both streams
      const merger = audioContext.createChannelMerger(2);
      localSource.connect(merger, 0, 0);
      remoteSource.connect(merger, 0, 1);

      // Create a destination to capture the mixed audio
      const destination = audioContext.createMediaStreamDestination();
      merger.connect(destination);
      mediaStreamRef.current = destination.stream;

      // Connect to AssemblyAI real-time API
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get temporary token from AssemblyAI via edge function
      const tokenResponse = await supabase.functions.invoke('transcribe-audio', {
        body: { action: 'get_realtime_token' },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (tokenResponse.error || !tokenResponse.data?.token) {
        console.error('[TELNYX] Failed to get transcription token');
        return;
      }

      const ws = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${tokenResponse.data.token}`);
      assemblyWsRef.current = ws;

      ws.onopen = () => {
        console.log('[ASSEMBLYAI] Connected for real-time transcription');
        startAudioStreaming(destination.stream, ws);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.text) {
          setTranscripts(prev => {
            // Update or add transcript segment
            const newSegment: TranscriptSegment = {
              text: data.text,
              speaker: 'remote', // We'll enhance speaker detection later
              timestamp: Date.now(),
              isFinal: data.message_type === 'FinalTranscript'
            };

            if (data.message_type === 'FinalTranscript') {
              return [...prev.filter(t => t.isFinal), newSegment];
            } else {
              // Replace partial transcript
              return [...prev.filter(t => t.isFinal), newSegment];
            }
          });
        }
      };

      ws.onerror = (err) => {
        console.error('[ASSEMBLYAI] WebSocket error:', err);
      };

      ws.onclose = () => {
        console.log('[ASSEMBLYAI] WebSocket closed');
        setIsTranscribing(false);
      };
    } catch (err) {
      console.error('[TELNYX] Transcription error:', err);
      setIsTranscribing(false);
    }
  }, []);

  const startAudioStreaming = useCallback((stream: MediaStream, ws: WebSocket) => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    source.connect(processor);
    processor.connect(audioContext.destination);

    processor.onaudioprocess = (e) => {
      if (ws.readyState !== WebSocket.OPEN) return;

      const inputData = e.inputBuffer.getChannelData(0);
      const pcmData = new Int16Array(inputData.length);
      
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = Math.max(-32768, Math.min(32767, Math.floor(inputData[i] * 32768)));
      }

      const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
      ws.send(JSON.stringify({ audio_data: base64 }));
    };
  }, []);

  const stopTranscription = useCallback(() => {
    if (assemblyWsRef.current) {
      assemblyWsRef.current.close();
      assemblyWsRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsTranscribing(false);
  }, []);

  const startCall = useCallback(async (phoneNumber: string) => {
    if (!clientRef.current || !isReady) {
      setError('Client not ready. Please wait...');
      return;
    }

    try {
      setError(null);
      setCallStatus('connecting');
      setTranscripts([]);
      setDuration(0);

      // Format phone number
      const formattedNumber = phoneNumber.replace(/[^\d+]/g, '');

      // Get caller ID from edge function
      const { data: { session } } = await supabase.auth.getSession();
      const callerIdResponse = await supabase.functions.invoke('telnyx-auth', {
        body: { action: 'get_caller_id' },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      const callerId = callerIdResponse.data?.caller_id;

      const call = clientRef.current.newCall({
        destinationNumber: formattedNumber,
        callerNumber: callerId,
        audio: true,
        video: false,
      });

      callRef.current = call;
    } catch (err: any) {
      console.error('[TELNYX] Call error:', err);
      setError(err.message || 'Failed to start call');
      setCallStatus('error');
    }
  }, [isReady]);

  const endCall = useCallback(() => {
    if (callRef.current) {
      callRef.current.hangup();
      callRef.current = null;
    }
    stopTranscription();
    stopDurationTimer();
    setCallStatus('ended');
  }, [stopTranscription, stopDurationTimer]);

  const muteAudio = useCallback((muted: boolean) => {
    if (callRef.current) {
      if (muted) {
        callRef.current.muteAudio();
      } else {
        callRef.current.unmuteAudio();
      }
      setIsMuted(muted);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeClient();

    return () => {
      if (callRef.current) {
        callRef.current.hangup();
      }
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
      stopTranscription();
      stopDurationTimer();
    };
  }, [initializeClient, stopTranscription, stopDurationTimer]);

  return {
    callStatus,
    isReady,
    error,
    isMuted,
    startCall,
    endCall,
    muteAudio,
    transcripts,
    isTranscribing,
    duration,
    callId,
  };
}
