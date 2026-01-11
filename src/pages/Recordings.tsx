import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CallSummaryCard } from '@/components/leads/CallSummaryCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Phone, Play, Pause, Clock, Calendar, TrendingUp, Mic, Download, Search, FileText, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { createPlayableObjectUrl } from '@/lib/audioPlayback';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';

interface CallRecording {
  id: string;
  file_name: string;
  name: string | null;
  status: string;
  sentiment_score: number | null;
  duration_seconds: number | null;
  created_at: string;
  audio_url: string | null;
  key_topics: string[] | null;
  live_transcription: string | null;
  summary: string | null;
  deleted_at: string | null;
}

interface CallSummary {
  id: string;
  recording_id: string;
  quick_skim: any;
  key_points: string[] | null;
  last_exchanges: any[];
  watch_out_for: string[] | null;
  agreed_next_steps: string[] | null;
  emotional_tone: string | null;
  talk_ratio_them: number | null;
  talk_ratio_you: number | null;
  question_count_them: number | null;
  question_count_you: number | null;
  positive_signals: number | null;
  concern_signals: number | null;
  engagement_score: number | null;
  strengths: string[] | null;
  improvements: string[] | null;
  suggestions_next_call: string[] | null;
  review_before_calling: string[] | null;
  questions_to_ask: string[] | null;
  materials_needed: string[] | null;
  conversation_starters: string[] | null;
  created_at: string;
}

export default function Recordings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [summaries, setSummaries] = useState<Record<string, CallSummary>>({});
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      const [recordingsResult, summariesResult] = await Promise.all([
        supabase
          .from('call_recordings')
          .select('*')
          .is('deleted_at', null)
          .order('created_at', { ascending: false }),
        supabase
          .from('call_summaries')
          .select('*')
      ]);

      if (!recordingsResult.error && recordingsResult.data) {
        setRecordings(recordingsResult.data);
      }

      if (summariesResult.data) {
        const summaryMap: Record<string, CallSummary> = {};
        summariesResult.data.forEach((s: any) => {
          summaryMap[s.recording_id] = s;
        });
        setSummaries(summaryMap);
      }

      setLoading(false);
    }

    fetchData();
  }, [user]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async (recording: CallRecording) => {
    if (!recording.audio_url) return;

    if (playingId === recording.id) {
      audioRef.current?.pause();
      if (audioRef.current?.src?.startsWith('blob:')) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.src?.startsWith('blob:')) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    }

    const { data: signedData, error: signedError } = await supabase.storage
      .from('call-recordings')
      .createSignedUrl(recording.audio_url, 3600);

    if (signedError) {
      console.error('Failed to get signed URL:', signedError);
      toast({
        variant: 'destructive',
        title: 'Failed to play recording',
        description: 'Unable to access audio file'
      });
      return;
    }

    if (signedData?.signedUrl) {
      const primaryAudio = new Audio(signedData.signedUrl);

      primaryAudio.onended = () => {
        if (primaryAudio.src.startsWith('blob:')) {
          URL.revokeObjectURL(primaryAudio.src);
        }
        setPlayingId(null);
      };

      primaryAudio.onerror = async () => {
        try {
          const { objectUrl, mime } = await createPlayableObjectUrl(signedData.signedUrl);
          console.warn('Recovered playable audio as', mime);

          const recoveredAudio = new Audio(objectUrl);
          recoveredAudio.onended = () => {
            URL.revokeObjectURL(objectUrl);
            setPlayingId(null);
          };

          audioRef.current = recoveredAudio;
          await recoveredAudio.play();
          setPlayingId(recording.id);
        } catch (e) {
          console.error('Audio playback error (and recovery failed):', e);
          setPlayingId(null);
        }
      };

      audioRef.current = primaryAudio;

      try {
        await primaryAudio.play();
        setPlayingId(recording.id);
      } catch (playError) {
        console.error('Failed to play audio:', playError);
        setPlayingId(null);
      }
    }
  };

  const getSentimentColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 0.7) return 'text-success';
    if (score >= 0.4) return 'text-warning';
    return 'text-destructive';
  };

  const filterByDate = (recording: CallRecording) => {
    if (dateFilter === 'all') return true;
    const date = new Date(recording.created_at);
    const now = new Date();
    
    switch (dateFilter) {
      case 'today':
        return date.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return date >= monthAgo;
      default:
        return true;
    }
  };

  const filteredRecordings = recordings.filter(r => {
    const displayName = r.name || r.file_name;
    const matchesSearch = displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = filterByDate(r);
    return matchesSearch && matchesDate;
  });

  // Calculate stats
  const totalCalls = recordings.length;
  const avgDuration = recordings.reduce((acc, r) => acc + (r.duration_seconds || 0), 0) / (totalCalls || 1);
  const analyzedCalls = recordings.filter(r => r.status === 'analyzed').length;

  const handleExportAll = () => {
    sonnerToast.info('Export feature coming soon');
  };

  const handleDeleteRecording = async (recordingId: string) => {
    try {
      const { error } = await supabase
        .from('call_recordings')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', recordingId);

      if (error) throw error;

      // Remove from local state
      setRecordings(prev => prev.filter(r => r.id !== recordingId));
      
      toast({
        title: 'Recording deleted',
        description: 'The recording has been removed. Your analytics remain unchanged.'
      });
    } catch (error) {
      console.error('Failed to delete recording:', error);
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: 'Could not delete the recording. Please try again.'
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Recordings</h1>
            <p className="text-muted-foreground mt-1">All your saved call recordings and AI summaries</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2" onClick={handleExportAll}>
              <Download className="h-4 w-4" />
              Export All
            </Button>
            <Button onClick={() => navigate('/dashboard')} size="default" className="gap-2">
              <Mic className="h-4 w-4" />
              New Recording
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-gradient rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{totalCalls}</p>
            <p className="text-sm text-muted-foreground">Total Calls</p>
          </div>
          <div className="card-gradient rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-accent" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatDuration(Math.round(avgDuration))}</p>
            <p className="text-sm text-muted-foreground">Avg Duration</p>
          </div>
          <div className="card-gradient rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{analyzedCalls}</p>
            <p className="text-sm text-muted-foreground">Analyzed</p>
          </div>
          <div className="card-gradient rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-warning" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{Object.keys(summaries).length}</p>
            <p className="text-sm text-muted-foreground">With Summaries</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filteredRecordings.length === 0 ? (
          <div className="card-gradient rounded-xl border border-border/50 p-12 text-center">
            <Phone className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No recordings yet</h3>
            <p className="text-muted-foreground mb-6">Start your first call recording to see it here</p>
            <Button onClick={() => navigate('/dashboard')}>
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4">
              {filteredRecordings.map((recording) => (
                <div
                  key={recording.id}
                  className={`card-gradient rounded-xl border transition-all ${
                    expandedId === recording.id ? 'border-primary/50' : 'border-border/50 hover:border-primary/30'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Play Button */}
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-12 w-12 rounded-full shrink-0"
                          onClick={() => handlePlayPause(recording)}
                          disabled={!recording.audio_url}
                        >
                          {playingId === recording.id ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5 ml-0.5" />
                          )}
                        </Button>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                            onClick={() => setExpandedId(expandedId === recording.id ? null : recording.id)}
                          >
                            {recording.name || recording.file_name}
                          </h3>
                          
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(recording.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatDuration(recording.duration_seconds)}
                            </span>
                            {recording.sentiment_score !== null && (
                              <span className={`flex items-center gap-1 ${getSentimentColor(recording.sentiment_score)}`}>
                                <TrendingUp className="h-3.5 w-3.5" />
                                {Math.round(recording.sentiment_score * 100)}%
                              </span>
                            )}
                          </div>

                          {recording.key_topics && recording.key_topics.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {recording.key_topics.slice(0, 4).map((topic, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            recording.status === 'analyzed'
                              ? 'bg-success/20 text-success'
                              : recording.status === 'processing'
                              ? 'bg-warning/20 text-warning'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {recording.status}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/recording/${recording.id}`)}
                        >
                          View Analysis
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Recording</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the recording from your list. Your analytics and call history statistics will remain unchanged.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteRecording(recording.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Summary */}
                  {expandedId === recording.id && summaries[recording.id] && (
                    <div className="border-t border-border/30 p-5">
                      <CallSummaryCard
                        summary={summaries[recording.id]}
                        contactName={recording.file_name}
                        duration={recording.duration_seconds || undefined}
                        onPlayRecording={() => navigate(`/recording/${recording.id}`)}
                        onViewTranscript={() => navigate(`/recording/${recording.id}`)}
                        onAddNote={() => sonnerToast.info('Adding note...')}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
