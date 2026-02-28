import { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Clock, 
  Share2, 
  MessageSquare, 
  CheckSquare,
  Download,
  FileText,
  Send,
  User,
  Link2,
  CalendarCheck
} from 'lucide-react';
import { WaveformPlayer } from '@/components/playback/WaveformPlayer';
import { TranscriptSync } from '@/components/playback/TranscriptSync';
import { AIInsightsSidebar } from '@/components/playback/AIInsightsSidebar';
import { SalesforceRecordingView } from '@/components/recording/SalesforceRecordingView';
import { DealCoachPanel } from '@/components/coaching/DealCoachPanel';
import { PainDetectorPanel } from '@/components/analysis/PainDetectorPanel';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Marker {
  id: string;
  type: 'buying_signal' | 'objection' | 'key_moment' | 'question' | 'positive' | 'negative' | 'ai_suggestion';
  content: string;
  timestampSeconds: number | null;
  color: string;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  timestamp_seconds: number | null;
  created_at: string;
  profile?: {
    full_name: string | null;
  };
}

interface CallScore {
  overall_score: number;
  rapport_score: number | null;
  discovery_score: number | null;
  presentation_score: number | null;
  objection_handling_score: number | null;
  closing_score: number | null;
  talk_ratio: number | null;
  filler_words_count: number | null;
  questions_asked: number | null;
}

interface RecordingData {
  id: string;
  file_name: string;
  created_at: string;
  duration_seconds: number | null;
  live_transcription: string | null;
  audio_url: string | null;
  timestamped_transcript: any[] | null;
  ai_markers: Marker[] | null;
  ai_suggestions: {
    coaching?: {
      strengths: string[];
      improvements: string[];
      tips: string[];
    };
    dealIntelligence?: {
      sentiment: 'positive' | 'neutral' | 'negative';
      winProbability: number;
      suggestedStage: string;
      riskFactors: string[];
      nextSteps: string[];
      budgetMentioned: number | null;
      decisionTimeline: string | null;
    };
    summary?: string;
  } | null;
  call_score_id: string | null;
  summary: string | null;
  salesforce_lead_id?: string | null;
  salesforce_contact_id?: string | null;
  salesforce_opportunity_id?: string | null;
  salesforce_account_id?: string | null;
  crm_sync_status?: string | null;
}

export default function RecordingAnalysis() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [recording, setRecording] = useState<RecordingData | null>(null);
  const [callScore, setCallScore] = useState<CallScore | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);
  const [generateTranscriptError, setGenerateTranscriptError] = useState<string | null>(null);
  const [schedulingIntent, setSchedulingIntent] = useState<any>(null);
  const [schedulingDismissed, setSchedulingDismissed] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptTriggerRef = useRef(false);

  useEffect(() => {
    fetchRecording();
    fetchComments();
    fetchSchedulingIntent();
  }, [id, user]);

  const generateTranscript = useCallback(async () => {
    if (!id) return;

    try {
      setIsGeneratingTranscript(true);
      setGenerateTranscriptError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please log in to generate a transcript');
      }

      const { data, error } = await supabase.functions.invoke('analyze-recording', {
        body: { recordingId: id, transcribeOnly: true },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate transcript');
      }

      if ((data as any)?.success !== true) {
        throw new Error((data as any)?.error || 'Failed to generate transcript');
      }

      await fetchRecording();
    } catch (e: any) {
      console.error('Generate transcript error:', e);
      setGenerateTranscriptError(e?.message || 'Failed to generate transcript');
      toast({ variant: 'destructive', title: 'Failed to generate transcript' });
    } finally {
      setIsGeneratingTranscript(false);
    }
  }, [id, toast]);

  // If a recording has audio but no transcript yet, auto-trigger transcription once.
  useEffect(() => {
    if (!recording || !id) return;
    if (recording.live_transcription) return;
    if (!recording.audio_url) return;
    if (transcriptTriggerRef.current) return;

    transcriptTriggerRef.current = true;
    void generateTranscript();
  }, [recording, id, generateTranscript]);

  const fetchRecording = async () => {
    if (!id || !user) return;

    try {
      const { data, error } = await supabase
        .from('call_recordings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setRecording(data as unknown as RecordingData);

      // Fetch call score if available
      if (data.call_score_id) {
        const { data: scoreData } = await supabase
          .from('call_scores')
          .select('*')
          .eq('id', data.call_score_id)
          .single();
        
        if (scoreData) {
          setCallScore(scoreData as CallScore);
        }
      }

      // Get signed URL for audio (bucket is now private)
      if (data.audio_url) {
        const { data: signedData, error: signedError } = await supabase.storage
          .from('call-recordings')
          .createSignedUrl(data.audio_url, 3600);
        
        if (!signedError && signedData?.signedUrl) {
          setAudioUrl(signedData.signedUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching recording:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load recording'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedulingIntent = async () => {
    if (!id || !user) return;
    try {
      const { data } = await supabase
        .from('call_summaries')
        .select('scheduling_intent')
        .eq('recording_id', id)
        .maybeSingle();
      if (data?.scheduling_intent) {
        setSchedulingIntent(data.scheduling_intent);
      }
    } catch (error) {
      console.error('Error fetching scheduling intent:', error);
    }
  };

  const fetchComments = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('recording_comments')
        .select('*')
        .eq('recording_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles for comments
      if (data) {
        const commentsWithProfiles = await Promise.all(
          data.map(async (comment) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', comment.user_id)
              .maybeSingle();
            return { ...comment, profile };
          })
        );
        setComments(commentsWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!id || !user || !newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('recording_comments')
        .insert({
          recording_id: id,
          user_id: user.id,
          content: newComment,
          timestamp_seconds: Math.round(currentTime)
        });

      if (error) throw error;

      setNewComment('');
      fetchComments();
      toast({ title: 'Comment added!' });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to add comment'
      });
    }
  };

  const handleShare = async () => {
    if (!id || !user || !shareEmail.trim()) return;

    try {
      const { error } = await supabase
        .from('recording_shares')
        .insert({
          recording_id: id,
          shared_by: user.id,
          shared_with_user_id: null, // Would need to look up user by email
          permission: 'view'
        });

      if (error) throw error;

      toast({ title: 'Share invitation sent!' });
      setIsShareOpen(false);
      setShareEmail('');
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to share recording'
      });
    }
  };

  const handleMarkerClick = (marker: Marker) => {
    if (marker.timestampSeconds !== null && audioRef.current) {
      audioRef.current.currentTime = marker.timestampSeconds;
    }
  };

  const handleWordClick = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleExportTranscript = () => {
    if (!recording?.live_transcription) return;

    const blob = new Blob([recording.live_transcription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${recording.file_name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!recording) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Recording not found</p>
          <Button onClick={() => navigate('/recordings')} className="mt-4">
            Back to Recordings
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const markers = recording.ai_markers || [];
  const coaching = recording.ai_suggestions?.coaching;
  const dealIntelligence = recording.ai_suggestions?.dealIntelligence;
  const summary = recording.ai_suggestions?.summary || recording.summary;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="gap-2 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{recording.file_name}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span>{new Date(recording.created_at).toLocaleString()}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(recording.duration_seconds || 0)}
                </span>
                {callScore && (
                  <>
                    <span>•</span>
                    <span className="text-primary font-medium">
                      Score: {Math.round(callScore.overall_score)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Recording</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                  />
                  <Button onClick={handleShare} className="w-full">
                    Send Invitation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={handleExportTranscript} className="gap-2">
              <FileText className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Scheduling Intent Banner */}
        {schedulingIntent && !schedulingDismissed && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5">
            <CalendarCheck className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                AI detected a follow-up: {schedulingIntent.meeting_type || 'Meeting'} 
                {schedulingIntent.date && ` on ${schedulingIntent.date}`}
                {schedulingIntent.time && ` at ${schedulingIntent.time}`}
                {schedulingIntent.contact_name && ` with ${schedulingIntent.contact_name}`}
              </p>
              {schedulingIntent.raw_phrase && (
                <p className="text-xs text-muted-foreground mt-0.5 italic">"{schedulingIntent.raw_phrase}"</p>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => {
                navigate('/schedule', { state: { prefill: schedulingIntent } });
              }}
            >
              Schedule It
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSchedulingDismissed(true)}
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Waveform Player */}
        {audioUrl && (
          <div className="card-gradient rounded-xl border border-border/50 p-6">
            <WaveformPlayer
              audioUrl={audioUrl}
              duration={recording.duration_seconds || 0}
              markers={markers}
              onTimeUpdate={setCurrentTime}
              onMarkerClick={handleMarkerClick}
            />
          </div>
        )}

        {/* Call Score Summary */}
        {callScore && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { label: 'Overall', score: callScore.overall_score },
              { label: 'Rapport', score: callScore.rapport_score },
              { label: 'Discovery', score: callScore.discovery_score },
              { label: 'Presentation', score: callScore.presentation_score },
              { label: 'Objections', score: callScore.objection_handling_score },
              { label: 'Closing', score: callScore.closing_score },
            ].map(({ label, score }) => (
              <div key={label} className="card-gradient rounded-lg border border-border/50 p-3 text-center">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-2xl font-bold ${
                  (score || 0) >= 80 ? 'text-success' : 
                  (score || 0) >= 60 ? 'text-warning' : 'text-destructive'
                }`}>
                  {score !== null ? Math.round(score) : '—'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transcript */}
          <div className="lg:col-span-2 card-gradient rounded-xl border border-border/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <h2 className="text-lg font-semibold text-foreground">Transcription</h2>
                {isGeneratingTranscript && (
                  <span className="text-xs text-muted-foreground">Generating…</span>
                )}
                {generateTranscriptError && !isGeneratingTranscript && (
                  <span className="text-xs text-destructive truncate">{generateTranscriptError}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!recording.live_transcription && !isGeneratingTranscript && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void generateTranscript()}
                    disabled={!recording.audio_url}
                  >
                    {generateTranscriptError ? 'Retry' : 'Generate'}
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  {formatTime(currentTime)}
                </span>
              </div>
            </div>
            <div className="h-[400px]">
              <TranscriptSync
                transcription={
                  recording.live_transcription ||
                  (isGeneratingTranscript
                    ? 'Generating transcript…'
                    : 'No transcription available')
                }
                timestampedWords={recording.timestamped_transcript || undefined}
                currentTime={currentTime}
                onWordClick={handleWordClick}
              />
            </div>
          </div>

          {/* AI Insights */}
          <div className="space-y-6">
            <div className="card-gradient rounded-xl border border-border/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-border/50">
                <h2 className="text-lg font-semibold text-foreground">AI Insights</h2>
              </div>
              <div className="h-[300px]">
                <AIInsightsSidebar
                  markers={markers}
                  coaching={coaching}
                  dealIntelligence={dealIntelligence}
                  summary={summary}
                  onMarkerClick={handleMarkerClick}
                />
              </div>
            </div>

            {/* Salesforce CRM Card */}
            <SalesforceRecordingView 
              recording={recording} 
              onSyncComplete={fetchRecording}
            />
          </div>
        </div>

        {/* AI Deal Coach */}
        {user && recording.live_transcription && (
          <div className="mt-6">
            <DealCoachPanel 
              recordingId={recording.id}
              transcript={recording.live_transcription}
              userId={user.id}
            />
          </div>
        )}

        {/* AI Pain Detector */}
        {user && recording.live_transcription && (
          <div className="mt-6">
            <PainDetectorPanel 
              recordingId={recording.id}
              transcript={recording.live_transcription}
              existingAnalysis={(recording.ai_suggestions as any)?.painAnalysis}
            />
          </div>
        )}

        {/* Comments Section */}
        <div className="card-gradient rounded-xl border border-border/50 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({comments.length})
          </h2>

          <div className="space-y-4 mb-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground">
                      {comment.profile?.full_name || 'Unknown User'}
                    </span>
                    {comment.timestamp_seconds !== null && (
                      <span className="text-xs text-primary font-mono">
                        @{formatTime(comment.timestamp_seconds)}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-4">
                No comments yet. Be the first to add one!
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Textarea
              placeholder={`Add a comment at ${formatTime(currentTime)}...`}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px]"
            />
            <Button onClick={handleAddComment} disabled={!newComment.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}