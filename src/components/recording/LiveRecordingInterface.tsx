import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pause, Play, Square, X, Headphones, Mic } from 'lucide-react';
import { useMp3Recorder } from '@/hooks/useMp3Recorder';
import { AudioWaveform } from './AudioWaveform';
import { RecordingTimer } from './RecordingTimer';
import { TranscriptionPanel } from './TranscriptionPanel';
import { AISuggestionsPanel, AISuggestion } from './AISuggestionsPanel';
import { LiveCoachingSidebar } from './LiveCoachingSidebar';
import { RecordingNameDialog } from './RecordingNameDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLiveCoaching } from '@/hooks/useLiveCoaching';


interface LiveRecordingInterfaceProps {
  onClose: () => void;
}

export function LiveRecordingInterface({ onClose }: LiveRecordingInterfaceProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isEnabled: liveCoachingEnabled, coachStyle } = useLiveCoaching();
  
  const {
    isRecording,
    isPaused,
    audioLevel,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    getAudioChunk,
    recordingMethod,
    isSystemAudioCapture
  } = useMp3Recorder();

  const [transcription, setTranscription] = useState('');
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative'>('neutral');
  const [keyTopics, setKeyTopics] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcriptionStatus, setTranscriptionStatus] = useState<'idle' | 'processing' | 'rate-limited' | 'error'>('idle');
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [pendingRecordingData, setPendingRecordingData] = useState<{
    audioBlob: Blob;
    fileName: string;
    defaultName: string;
  } | null>(null);
  
  const transcriptionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedChunkRef = useRef<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Start recording immediately when component mounts
  useEffect(() => {
    // Pass true to enable system audio capture (will prompt user to share screen/tab)
    startRecording(true).catch(error => {
      console.error('Recording start error:', error);
      toast({
        variant: 'destructive',
        title: 'Recording Access Required',
        description: 'Please allow microphone access and share your screen/tab with audio to record both sides of the call.'
      });
      onClose();
    });

    return () => {
      if (transcriptionIntervalRef.current) {
        clearInterval(transcriptionIntervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Countdown timer for rate limiting
  useEffect(() => {
    if (retryCountdown > 0) {
      const timer = setTimeout(() => {
        setRetryCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (retryCountdown === 0 && transcriptionStatus === 'rate-limited') {
      setTranscriptionStatus('idle');
    }
  }, [retryCountdown, transcriptionStatus]);

  // Process audio chunks for transcription with retry logic
  const processAudioChunk = useCallback(async (retryAttempt = 0) => {
    if (!isRecording || isPaused || transcriptionStatus === 'rate-limited') return;

    try {
      const audioBlob = await getAudioChunk();
      if (!audioBlob || audioBlob.size === lastProcessedChunkRef.current) return;
      
      lastProcessedChunkRef.current = audioBlob.size;
      setIsProcessing(true);
      setTranscriptionStatus('processing');

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];

        try {
          // Send to transcription API
          const { data, error } = await supabase.functions.invoke('transcribe-audio', {
            body: { audio: base64Audio }
          });

          if (error) {
            console.error('Transcription error:', error);
            
            // Check if it's a rate limit error
            if (error.message?.includes('429') || error.message?.includes('rate limit')) {
              setTranscriptionStatus('rate-limited');
              const waitTime = 30; // Default 30 seconds
              setRetryCountdown(waitTime);
              
              toast({
                title: 'Transcription Paused',
                description: `Rate limit reached. Resuming in ${waitTime} seconds...`,
              });
            } else {
              setTranscriptionStatus('error');
            }
            setIsProcessing(false);
            return;
          }

          // Check for rate limit in response data
          if (data?.isRateLimit) {
            setTranscriptionStatus('rate-limited');
            const waitTime = data.retryAfter || 30;
            setRetryCountdown(waitTime);
            
            toast({
              title: 'Transcription Paused',
              description: `Rate limit reached. Resuming in ${waitTime} seconds...`,
            });
            setIsProcessing(false);
            return;
          }

          if (data?.text) {
            setTranscription(data.text);
            setTranscriptionStatus('idle');
            
            // Analyze the conversation
            analyzeConversation(data.text);
          }
        } catch (invokeError) {
          console.error('Invoke error:', invokeError);
          setTranscriptionStatus('error');
        }
        
        setIsProcessing(false);
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      setIsProcessing(false);
      setTranscriptionStatus('error');
    }
  }, [isRecording, isPaused, getAudioChunk, transcriptionStatus, toast]);

  // Set up interval for transcription
  useEffect(() => {
    if (isRecording && !isPaused) {
      transcriptionIntervalRef.current = setInterval(processAudioChunk, 5000);
    } else if (transcriptionIntervalRef.current) {
      clearInterval(transcriptionIntervalRef.current);
    }

    return () => {
      if (transcriptionIntervalRef.current) {
        clearInterval(transcriptionIntervalRef.current);
      }
    };
  }, [isRecording, isPaused, processAudioChunk]);

  // Analyze conversation with AI
  const analyzeConversation = async (text: string) => {
    if (text.length < 50) return; // Wait for more content
    
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-conversation', {
        body: { transcription: text }
      });

      if (error) {
        console.error('Analysis error:', error);
        return;
      }

      if (data) {
        if (data.suggestions) {
          setSuggestions(prev => {
            // Add new suggestions, avoiding duplicates
            const existingMessages = new Set(prev.map(s => s.message));
            const newSuggestions = data.suggestions.filter(
              (s: AISuggestion) => !existingMessages.has(s.message)
            );
            return [...newSuggestions, ...prev].slice(0, 10); // Keep last 10
          });
        }
        if (data.sentiment) setSentiment(data.sentiment);
        if (data.keyTopics) setKeyTopics(data.keyTopics);
      }
    } catch (error) {
      console.error('Error analyzing:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const [processingStatus, setProcessingStatus] = useState('');

  // Handle stop recording - show naming dialog first
  const handleStopRecording = async () => {
    if (isSaving) return;
    
    try {
      // Check if we have an active recording first
      if (!isRecording && !isPaused) {
        toast({
          variant: 'destructive',
          title: 'No Active Recording',
          description: 'Please start a recording first before saving.'
        });
        return;
      }

      const audioBlob = await stopRecording();
      
      if (!audioBlob) {
        toast({
          variant: 'destructive',
          title: 'No Recording Data',
          description: 'The recording contains no audio data. Please try again.'
        });
        return;
      }
      
      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Authentication Required',
          description: 'Please log in to save recordings.'
        });
        return;
      }

      // Determine file extension from MIME type
      const mimeType = audioBlob.type || 'audio/webm';
      let extension = 'webm';
      if (mimeType.includes('mp4') || mimeType.includes('m4a')) {
        extension = 'm4a';
      } else if (mimeType.includes('ogg')) {
        extension = 'ogg';
      } else if (mimeType.includes('mpeg') || mimeType.includes('mp3')) {
        extension = 'mp3';
      }
      
      const baseName = `call_${new Date().toISOString().replace(/[:.]/g, '-')}`;
      const fileName = `${baseName}.${extension}`;
      const defaultName = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      setPendingRecordingData({ audioBlob, fileName, defaultName });
      setShowNameDialog(true);
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to stop recording.'
      });
    }
  };

  // Save recording with custom name
  const saveRecordingWithName = async (customName: string) => {
    if (!pendingRecordingData || !user) return;
    
    setShowNameDialog(false);
    setIsSaving(true);
    setProcessingStatus('Processing audio...');
    
    try {
      const { audioBlob, fileName } = pendingRecordingData;
      const finalBlob = audioBlob;
      const audioDuration = recordingDuration;
      
      console.log('Recording saved as:', fileName, finalBlob.size, 'bytes', 'method:', recordingMethod);

      setProcessingStatus('Saving to database...');
       
      const aiSuggestionsData = suggestions.length > 0
        ? JSON.parse(JSON.stringify({ suggestions, sentiment, keyTopics }))
        : null;

      const { data: recording, error: dbError } = await supabase
        .from('call_recordings')
        .insert([{
          user_id: user.id,
          file_name: fileName,
          name: customName,
          file_size: finalBlob.size,
          status: 'processing',
          duration_seconds: audioDuration || recordingDuration,
          live_transcription: transcription || null,
          ai_suggestions: aiSuggestionsData,
          sentiment_score: sentiment === 'positive' ? 0.8 : sentiment === 'negative' ? 0.3 : 0.5,
          key_topics: keyTopics.length > 0 ? keyTopics : null
        }])
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to save recording metadata');
      }
      setProcessingStatus('Uploading audio file...');
      
      // Upload audio to storage
      const filePath = `${user.id}/${recording.id}/${fileName}`;
      const contentType = finalBlob.type || 'audio/webm';
      
      const { error: uploadError } = await supabase.storage
        .from('call-recordings')
        .upload(filePath, finalBlob, {
          contentType: contentType,
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload audio file');
      }

      // Store the file path - signed URLs will be generated when needed
      console.log('Audio uploaded, file path:', filePath);

      // Update recording with audio URL
      const { error: updateError } = await supabase
        .from('call_recordings')
        .update({
          audio_url: filePath,
          status: 'transcribing'
        })
        .eq('id', recording.id);

      if (updateError) {
        console.error('Update error:', updateError);
      }

      setProcessingStatus('Transcribing with AI...');
      
      // Transcribe the full audio using Whisper API
      try {
        const reader = new FileReader();
        reader.readAsDataURL(finalBlob);
        
        await new Promise<void>((resolve, reject) => {
          reader.onloadend = async () => {
            try {
              const base64Audio = (reader.result as string).split(',')[1];
              
              const { data: transcribeData, error: transcribeError } = await supabase.functions.invoke('transcribe-audio', {
                body: { audio: base64Audio, useAssemblyAI: true }
              });
              
              if (transcribeError) {
                console.error('Transcription error:', transcribeError);
              } else if (transcribeData?.text) {
                console.log('Full transcription received:', transcribeData.text.length, 'characters');
                
                // Update recording with full transcription
                await supabase
                  .from('call_recordings')
                  .update({
                    live_transcription: transcribeData.text,
                    status: 'generating_summary'
                  })
                  .eq('id', recording.id);
                
                setProcessingStatus('Generating call summary...');
                
                // Generate call summary using the transcription
                const { data: summaryData, error: summaryError } = await supabase.functions.invoke('generate-call-summary', {
                  body: { 
                    recordingId: recording.id,
                    transcription: transcribeData.text 
                  }
                });
                
                if (summaryError) {
                  console.error('Summary generation error:', summaryError);
                } else {
                  console.log('Call summary generated:', summaryData);
                }
              }
              resolve();
            } catch (innerError) {
              console.error('Inner transcription error:', innerError);
              resolve(); // Continue even if transcription fails
            }
          };
          reader.onerror = () => {
            console.error('File reader error');
            resolve(); // Continue even if reading fails
          };
        });
      } catch (transcriptionError) {
        console.error('Transcription process error:', transcriptionError);
      }

      // Final update: ensure transcription is persisted and mark as analyzed
      const finalTranscription = transcription || null;
      console.log('Persisting final transcription:', finalTranscription?.length || 0, 'characters');
      
      await supabase
        .from('call_recordings')
        .update({
          status: 'analyzed',
          analyzed_at: new Date().toISOString(),
          live_transcription: finalTranscription
        })
        .eq('id', recording.id);

      toast({
        title: 'Recording Saved',
        description: 'Your call has been recorded, transcribed, and analyzed successfully.'
      });

      // Navigate to analysis page
      navigate(`/recording/${recording.id}`);
      
    } catch (error) {
      console.error('Error saving recording:', error);
      toast({
        variant: 'destructive',
        title: 'Error Saving Recording',
        description: error instanceof Error ? error.message : 'There was a problem saving your recording.'
      });
      setIsSaving(false);
      setProcessingStatus('');
    }
  };

  const handleCancel = async () => {
    await stopRecording();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <h2 className="text-xl font-semibold text-foreground">Live Recording</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
          {/* Timer and waveform */}
          <div className="flex flex-col items-center gap-4">
            <RecordingTimer 
              isRecording={isRecording} 
              isPaused={isPaused}
              onTimeUpdate={setRecordingDuration}
            />
            <div className="w-full max-w-xl">
              <AudioWaveform 
                audioLevel={audioLevel} 
                isRecording={isRecording}
                isPaused={isPaused}
              />
            </div>
            
            {/* Audio capture mode indicator */}
            <div className="flex items-center gap-2 text-sm">
              {isSystemAudioCapture ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full border border-green-500/20">
                  <Headphones className="h-4 w-4" />
                  <span>Recording both sides (mic + system audio)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full border border-yellow-500/20">
                  <Mic className="h-4 w-4" />
                  <span>Microphone only</span>
                </div>
              )}
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-4">
              {isPaused ? (
                <Button
                  onClick={resumeRecording}
                  size="lg"
                  className="gap-2"
                >
                  <Play className="h-5 w-5" />
                  Resume
                </Button>
              ) : (
                <Button
                  onClick={pauseRecording}
                  variant="secondary"
                  size="lg"
                  className="gap-2"
                >
                  <Pause className="h-5 w-5" />
                  Pause
                </Button>
              )}
              <Button
                onClick={handleStopRecording}
                variant="destructive"
                size="lg"
                className="gap-2"
                disabled={isSaving}
              >
                <Square className="h-5 w-5" />
                {isSaving ? processingStatus || 'Processing...' : 'Stop & Save'}
              </Button>
            </div>
          </div>

          {/* Transcription and AI panels */}
          <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
            <TranscriptionPanel 
              transcription={transcription}
              isProcessing={isProcessing}
              status={transcriptionStatus}
              retryCountdown={retryCountdown}
            />
            
            {/* Show Live Coaching sidebar if enabled (premium), otherwise standard suggestions */}
            {liveCoachingEnabled ? (
              <LiveCoachingSidebar
                transcript={transcription}
                coachStyle={coachStyle}
                isRecording={isRecording}
                isPaused={isPaused}
                onSuggestionFeedback={(id, helpful) => {
                  console.log('Feedback:', id, helpful);
                }}
              />
            ) : (
              <AISuggestionsPanel 
                suggestions={suggestions}
                sentiment={sentiment}
                keyTopics={keyTopics}
                isAnalyzing={isAnalyzing}
              />
            )}
          </div>
        </div>
      </div>

      {/* Recording Name Dialog */}
      <RecordingNameDialog
        open={showNameDialog}
        onClose={() => {
          setShowNameDialog(false);
          setPendingRecordingData(null);
        }}
        onSave={saveRecordingWithName}
        defaultName={pendingRecordingData?.defaultName || ''}
        isLoading={isSaving}
      />
    </div>
  );
}
