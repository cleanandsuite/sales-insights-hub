import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Phone, 
  PhoneOff, 
  Clock, 
  MessageSquare,
  AlertCircle,
  User,
  Users,
  Download,
  FileText,
} from 'lucide-react';
import { useTelnyxCall, CallStatus } from '@/hooks/useTelnyxCall';
import { useCallLimits } from '@/hooks/useCallLimits';
import { useLiveCoaching } from '@/hooks/useLiveCoaching';
import { cn } from '@/lib/utils';
import { CallerIdBadge } from './CallerIdBadge';
import { CallControls } from './CallControls';
import { CallNotes } from './CallNotes';
import { CallLimitIndicator } from './CallLimitIndicator';
import { LiveCoachingSidebar } from '@/components/recording/LiveCoachingSidebar';
import { LiveSummaryPanel } from '@/components/recording/LiveSummaryPanel';

interface CallInterfaceProps {
  phoneNumber: string;
  callName?: string;
  onClose: () => void;
}

export function CallInterface({ phoneNumber, callName, onClose }: CallInterfaceProps) {
  const navigate = useNavigate();
  
  const {
    callStatus,
    isReady,
    error,
    isMuted,
    isOnHold,
    isSaving,
    saveError,
    savedRecordingId,
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
  } = useTelnyxCall();

  const {
    callsToday,
    dailyLimit,
    warmupDay,
    limitEnforced,
    incrementCallCount,
  } = useCallLimits();

  const { coachStyle } = useLiveCoaching();

  // Combine transcripts into a single string for analysis
  const fullTranscript = useMemo(() => {
    return transcripts
      .filter(t => t.isFinal)
      .map(t => `${t.speaker === 'user' ? 'You' : 'Caller'}: ${t.text}`)
      .join('\n');
  }, [transcripts]);

  const [hasStartedCall, setHasStartedCall] = useState(false);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Attach remote stream to audio element for playback
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.volume = volume / 100;
      remoteAudioRef.current.play().catch(console.error);
    }
  }, [remoteStream, volume]);

  // Update audio volume when changed
  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Start the call when component mounts
  useEffect(() => {
    if (isReady && !hasStartedCall && phoneNumber) {
      setHasStartedCall(true);
      startCall(phoneNumber);
      incrementCallCount();
    }
  }, [isReady, hasStartedCall, phoneNumber, startCall, incrementCallCount]);

  // No auto-navigate — user stays on coaching screen after call ends

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: CallStatus) => {
    switch (status) {
      case 'connected':
        return 'bg-success text-success-foreground';
      case 'ringing':
        return 'bg-warning text-warning-foreground';
      case 'connecting':
        return 'bg-secondary text-secondary-foreground';
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: CallStatus) => {
    switch (status) {
      case 'connecting':
        return 'Connecting...';
      case 'ringing':
        return 'Ringing...';
      case 'connected':
        return 'Connected';
      case 'ended':
        return 'Call Ended';
      case 'error':
        return 'Error';
      default:
        return 'Idle';
    }
  };

  const handleToggleHold = () => {
    if (isOnHold) {
      unholdCall();
    } else {
      holdCall();
    }
  };

  const isCallEnded = callStatus === 'ended';

  const handleDownloadTranscript = useCallback(() => {
    const text = transcripts
      .filter(t => t.isFinal)
      .map(t => `[${t.speaker === 'user' ? 'You' : 'Caller'}] ${t.text}`)
      .join('\n\n');
    const blob = new Blob([text || 'No transcription available.'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${callName || phoneNumber}-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transcripts, callName, phoneNumber]);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <div>
              {callName && <h2 className="text-lg font-semibold">{callName}</h2>}
              <p className={cn(callName ? 'text-sm text-muted-foreground' : 'text-lg font-semibold')}>{phoneNumber}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn('text-xs', getStatusColor(callStatus))}>
                  {getStatusText(callStatus)}
                </Badge>
                {callStatus === 'connected' && (
                  <>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(duration)}
                    </span>
                    <CallerIdBadge attestationLevel="A" />
                  </>
                )}
                {isOnHold && (
                  <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                    On Hold
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {callStatus === 'connected' && (
              <CallControls
                isMuted={isMuted}
                isOnHold={isOnHold}
                onToggleMute={() => muteAudio(!isMuted)}
                onToggleHold={handleToggleHold}
                onSendDTMF={sendDTMF}
                volume={volume}
                onVolumeChange={setVolume}
              />
            )}
            {isCallEnded ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadTranscript} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download Transcript
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    onClose();
                    if (savedRecordingId) navigate(`/recording/${savedRecordingId}`);
                    else navigate('/dashboard');
                  }}
                  className="gap-2"
                >
                  {savedRecordingId ? 'View Analysis' : 'Back to Dashboard'}
                </Button>
              </div>
            ) : (
              <Button
                variant="destructive"
                onClick={() => { endCall(); }}
                className="gap-2"
              >
                <PhoneOff className="h-4 w-4" />
                {isSaving ? 'Saving…' : 'End Call'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="max-w-6xl mx-auto h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* AI Coaching Panel */}
          <LiveCoachingSidebar
            transcript={fullTranscript}
            coachStyle={coachStyle}
            isRecording={callStatus === 'connected'}
            isPaused={false}
          />

          {/* Live Summary Panel */}
          <LiveSummaryPanel
            transcript={fullTranscript}
            isRecording={callStatus === 'connected'}
            isPaused={false}
          />
        </div>
      </div>

      {/* Call Notes - collapsible at bottom */}
      {callStatus === 'connected' && callId && (
        <div className="border-t border-border">
          <CallNotes recordingId={callId} />
        </div>
      )}

      {/* Footer with Call Limit */}
      <div className="border-t border-border bg-card p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <CallLimitIndicator
            callsToday={callsToday}
            dailyLimit={dailyLimit}
            warmupDay={warmupDay}
            enforced={limitEnforced}
          />
          {isCallEnded && transcripts.filter(t => t.isFinal).length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              {transcripts.filter(t => t.isFinal).length} transcript segments captured
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {(saveError || error) && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{saveError || error}</span>
        </div>
      )}

      {/* Success hint */}
      {isCallEnded && savedRecordingId && !saveError && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-card text-foreground border border-border px-4 py-2 rounded-lg text-sm">
          Recording saved — coaching insights preserved above.
        </div>
      )}

      {/* Hidden audio element for remote audio playback */}
      <audio ref={remoteAudioRef} autoPlay playsInline />
    </div>
  );
}
