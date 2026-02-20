import { useState, useEffect, useRef, useCallback } from 'react';
import { TelnyxRTC } from '@telnyx/webrtc';
import { supabase } from '@/integrations/supabase/client';
import { useCallRecorder } from './useCallRecorder';

export type CallStatus = 'idle' | 'connecting' | 'ringing' | 'connected' | 'ended' | 'error';

interface UseTelnyxCallReturn {
  // State
  callStatus: CallStatus;
  isReady: boolean;
  error: string | null;
  isMuted: boolean;
  isOnHold: boolean;
  
  // Call controls
  startCall: (phoneNumber: string) => Promise<void>;
  endCall: () => void;
  muteAudio: (muted: boolean) => void;
  holdCall: () => void;
  unholdCall: () => void;
  sendDTMF: (digit: string) => void;
  
  // Transcription (from useCallRecorder)
  transcripts: { text: string; speaker: 'user' | 'remote'; timestamp: number; isFinal: boolean }[];
  isTranscribing: boolean;
  
  // Call info
  duration: number;
  callId: string | null;
  remoteStream: MediaStream | null;
  
  // Volume control
  volume: number;
  setVolume: (volume: number) => void;
  
  // Recording
  recordingBlob: Blob | null;

  // Saving status
  isSaving: boolean;
  saveError: string | null;
  savedRecordingId: string | null;
}

export function useTelnyxCall(): UseTelnyxCallReturn {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [duration, setDuration] = useState(0);
  const [callId, setCallId] = useState<string | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [volume, setVolumeState] = useState(100);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedRecordingId, setSavedRecordingId] = useState<string | null>(null);

  // Audio device settings from user preferences
  const [audioSettings, setAudioSettings] = useState<{
    default_mic_device_id: string | null;
    default_speaker_device_id: string | null;
  }>({
    default_mic_device_id: null,
    default_speaker_device_id: null,
  });

  const clientRef = useRef<TelnyxRTC | null>(null);
  const callRef = useRef<any>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Keep latest values available to the Telnyx event handler (which is registered once)
  const durationRef = useRef<number>(0);
  const transcriptsRef = useRef<UseTelnyxCallReturn['transcripts']>([]);
  const connectedAtRef = useRef<number | null>(null);
  const finalizePromiseRef = useRef<Promise<void> | null>(null);

  // Use the new call recorder hook
  const { 
    isRecording, 
    transcripts, 
    isTranscribing, 
    startRecording, 
    stopRecording 
  } = useCallRecorder();

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    transcriptsRef.current = transcripts;
  }, [transcripts]);

  // Fetch audio device settings from user preferences
  useEffect(() => {
    const fetchAudioSettings = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('user_settings')
          .select('default_mic_device_id, default_speaker_device_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('[TELNYX] Error fetching audio settings:', error);
          return;
        }

        if (data) {
          console.log('[TELNYX] Loaded audio settings:', data);
          setAudioSettings({
            default_mic_device_id: data.default_mic_device_id,
            default_speaker_device_id: data.default_speaker_device_id,
          });
        }
      } catch (err) {
        console.error('[TELNYX] Error fetching audio settings:', err);
      }
    };

    fetchAudioSettings();
  }, []);

  const getFinalTranscriptText = useCallback((segments: UseTelnyxCallReturn['transcripts']) => {
    return segments
      .filter(s => s.isFinal)
      .map(s => s.text)
      .join(' ')
      .trim();
  }, []);

  const finalizeAndSaveRecording = useCallback(async () => {
    if (finalizePromiseRef.current) return finalizePromiseRef.current;

    finalizePromiseRef.current = (async () => {
      setIsSaving(true);
      setSaveError(null);

      try {
        const blob = await stopRecording();
        if (!blob || blob.size === 0) {
          throw new Error('No audio captured');
        }

        setRecordingBlob(blob);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Please log in to save recordings');
        }

        const fileName = `call_${Date.now()}.webm`;
        const filePath = `${session.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('call-recordings')
          .upload(filePath, blob, {
            contentType: 'audio/webm',
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        const durationSeconds = connectedAtRef.current
          ? Math.max(0, Math.round((Date.now() - connectedAtRef.current) / 1000))
          : durationRef.current;

        const liveTranscription = getFinalTranscriptText(transcriptsRef.current);

        const { data: inserted, error: dbError } = await supabase
          .from('call_recordings')
          .insert({
            user_id: session.user.id,
            file_name: fileName,
            // Store the storage path for private playback via signed URLs
            audio_url: filePath,
            file_url: null,
            duration_seconds: durationSeconds,
            file_size: blob.size,
            status: 'pending',
            live_transcription: liveTranscription || null,
          })
          .select('id')
          .single();

        if (dbError) {
          throw dbError;
        }

        if (inserted?.id) {
          setSavedRecordingId(inserted.id);
        }

        console.log('[TELNYX] Recording saved to database');
      } catch (err: any) {
        console.error('[TELNYX] Save error:', err);
        setSaveError(err?.message || 'Failed to save recording');
      } finally {
        setIsSaving(false);
      }
    })();

    return finalizePromiseRef.current;
  }, [getFinalTranscriptText, stopRecording]);

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
          connectedAtRef.current = Date.now();
          startDurationTimer();
          
          // Start recording and transcription when call connects
          const localStream = call.localStream;
          const remoteStreamFromCall = call.remoteStream;
          
          if (localStream) {
            localStreamRef.current = localStream;
          }
          
          if (remoteStreamFromCall) {
            setRemoteStream(remoteStreamFromCall);
            
            // Start recording both streams
            if (localStream && remoteStreamFromCall) {
              startRecording(localStream, remoteStreamFromCall);
            }
          }
        } else if (state === 'hangup' || state === 'destroy') {
          setCallStatus('ended');
          stopDurationTimer();
          void finalizeAndSaveRecording();
        }
        break;
    }
  }, [finalizeAndSaveRecording, startDurationTimer, stopDurationTimer, startRecording]);

  const startCall = useCallback(async (phoneNumber: string) => {
    if (!clientRef.current || !isReady) {
      setError('Client not ready. Please wait...');
      return;
    }

    try {
      setError(null);
      setCallStatus('connecting');
      setDuration(0);
      setRecordingBlob(null);

      // Format phone number
      const formattedNumber = phoneNumber.replace(/[^\d+]/g, '');

      // Get caller ID from edge function
      const { data: { session } } = await supabase.auth.getSession();
      const callerIdResponse = await supabase.functions.invoke('telnyx-auth', {
        body: { action: 'get_caller_id' },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      const callerId = callerIdResponse.data?.caller_id;

      // Build call options with user's audio device preferences
      const callOptions: any = {
        destinationNumber: formattedNumber,
        callerNumber: callerId,
        audio: true,
        video: false,
      };

      // Apply user's preferred microphone if set
      if (audioSettings.default_mic_device_id) {
        callOptions.micId = audioSettings.default_mic_device_id;
        console.log('[TELNYX] Using preferred microphone:', audioSettings.default_mic_device_id);
      }

      // Apply user's preferred speaker if set
      if (audioSettings.default_speaker_device_id) {
        callOptions.speakerId = audioSettings.default_speaker_device_id;
        console.log('[TELNYX] Using preferred speaker:', audioSettings.default_speaker_device_id);
      }

      const call = clientRef.current.newCall(callOptions);

      callRef.current = call;
    } catch (err: any) {
      console.error('[TELNYX] Call error:', err);
      setError(err.message || 'Failed to start call');
      setCallStatus('error');
    }
  }, [isReady, audioSettings]);

  const endCall = useCallback(async () => {
    if (callRef.current) {
      callRef.current.hangup();
      callRef.current = null;
    }

    stopDurationTimer();
    setCallStatus('ended');
    await finalizeAndSaveRecording();
  }, [finalizeAndSaveRecording, stopDurationTimer]);

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

  const holdCall = useCallback(() => {
    if (callRef.current) {
      callRef.current.hold();
      setIsOnHold(true);
    }
  }, []);

  const unholdCall = useCallback(() => {
    if (callRef.current) {
      callRef.current.unhold();
      setIsOnHold(false);
    }
  }, []);

  const sendDTMF = useCallback((digit: string) => {
    if (callRef.current) {
      callRef.current.dtmf(digit);
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    // If we have a remote audio element, we could control it here
    // For now we'll handle this in the component
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

      // Avoid double-stopping while we're finalizing/saving.
      if (!finalizePromiseRef.current) {
        stopRecording();
      }

      stopDurationTimer();
    };
  }, [initializeClient, stopRecording, stopDurationTimer]);

  return {
    callStatus,
    isReady,
    error,
    isMuted,
    isOnHold,
    startCall,
    endCall,
    muteAudio,
    holdCall,
    unholdCall,
    sendDTMF,
    transcripts,
    isTranscribing,
    duration,
    callId,
    remoteStream,
    volume,
    setVolume,
    recordingBlob,
    isSaving,
    saveError,
    savedRecordingId,
  };
}
