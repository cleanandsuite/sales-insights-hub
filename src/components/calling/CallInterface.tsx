import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Clock, 
  MessageSquare,
  Sparkles,
  AlertCircle,
  User,
  Users
} from 'lucide-react';
import { useTelnyxCall, CallStatus } from '@/hooks/useTelnyxCall';
import { cn } from '@/lib/utils';

interface CallInterfaceProps {
  phoneNumber: string;
  onClose: () => void;
}

export function CallInterface({ phoneNumber, onClose }: CallInterfaceProps) {
  const {
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
    remoteStream,
  } = useTelnyxCall();

  const [hasStartedCall, setHasStartedCall] = useState(false);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Attach remote stream to audio element for playback
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(console.error);
    }
  }, [remoteStream]);

  // Start the call when component mounts
  useEffect(() => {
    if (isReady && !hasStartedCall && phoneNumber) {
      setHasStartedCall(true);
      startCall(phoneNumber);
    }
  }, [isReady, hasStartedCall, phoneNumber, startCall]);

  // Handle close when call ends
  useEffect(() => {
    if (callStatus === 'ended' && hasStartedCall) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [callStatus, hasStartedCall, onClose]);

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
              <h2 className="text-lg font-semibold">{phoneNumber}</h2>
              <div className="flex items-center gap-2">
                <Badge className={cn('text-xs', getStatusColor(callStatus))}>
                  {getStatusText(callStatus)}
                </Badge>
                {callStatus === 'connected' && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(duration)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {callStatus === 'connected' && (
              <Button
                variant={isMuted ? 'destructive' : 'outline'}
                size="icon"
                onClick={() => muteAudio(!isMuted)}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={() => {
                endCall();
                onClose();
              }}
              className="gap-2"
            >
              <PhoneOff className="h-4 w-4" />
              End Call
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="max-w-4xl mx-auto h-full grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Live Transcription */}
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Live Transcription
                {isTranscribing && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse mr-1" />
                    Active
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                {transcripts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">Transcription will appear here...</p>
                    {callStatus !== 'connected' && (
                      <p className="text-xs mt-1">Waiting for call to connect</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transcripts.map((segment, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'p-3 rounded-lg',
                          segment.speaker === 'user'
                            ? 'bg-primary/10 ml-8'
                            : 'bg-muted mr-8'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {segment.speaker === 'user' ? (
                            <User className="h-3 w-3 text-primary" />
                          ) : (
                            <Users className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {segment.speaker === 'user' ? 'You' : 'Caller'}
                          </span>
                          {!segment.isFinal && (
                            <Badge variant="outline" className="text-xs ml-auto">
                              ...
                            </Badge>
                          )}
                        </div>
                        <p className={cn(
                          'text-sm',
                          !segment.isFinal && 'text-muted-foreground italic'
                        )}>
                          {segment.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* AI Insights Panel */}
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-secondary" />
                AI Coaching
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                {callStatus === 'connected' ? (
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-secondary/20 border border-secondary/30">
                      <h4 className="text-sm font-medium mb-1">💡 Suggestion</h4>
                      <p className="text-xs text-muted-foreground">
                        Listen for pain points and buying signals. Ask open-ended questions to understand their needs.
                      </p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-muted">
                      <h4 className="text-sm font-medium mb-1">📊 Call Quality</h4>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Talk ratio: Analyzing...</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <Sparkles className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">AI insights will appear during the call</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Hidden audio element for remote audio playback */}
      <audio ref={remoteAudioRef} autoPlay playsInline />
    </div>
  );
}
