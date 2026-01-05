import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Clock, Lightbulb, AlertTriangle, TrendingUp, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RecordingData {
  id: string;
  file_name: string;
  created_at: string;
  duration_seconds: number | null;
  live_transcription: string | null;
  ai_suggestions: {
    suggestions: Array<{
      type: 'tip' | 'warning' | 'opportunity';
      message: string;
      priority: string;
    }>;
    sentiment: string;
    keyTopics: string[];
  } | null;
  sentiment_score: number | null;
  key_topics: string[] | null;
}

export default function RecordingAnalysis() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recording, setRecording] = useState<RecordingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecording() {
      if (!id || !user) return;

      const { data, error } = await supabase
        .from('call_recordings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching recording:', error);
      } else if (data) {
        setRecording(data as unknown as RecordingData);
      }
      setLoading(false);
    }

    fetchRecording();
  }, [id, user]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'tip': return Lightbulb;
      case 'warning': return AlertTriangle;
      case 'opportunity': return TrendingUp;
      default: return Lightbulb;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'tip': return 'bg-primary/10 border-primary/30 text-primary';
      case 'warning': return 'bg-warning/10 border-warning/30 text-warning';
      case 'opportunity': return 'bg-success/10 border-success/30 text-success';
      default: return 'bg-primary/10 border-primary/30 text-primary';
    }
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
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const aiData = recording.ai_suggestions;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{recording.file_name}</h1>
            <p className="text-muted-foreground text-sm">
              {new Date(recording.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-gradient rounded-xl border border-border/50 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-xl font-semibold text-foreground">
                  {formatDuration(recording.duration_seconds)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card-gradient rounded-xl border border-border/50 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sentiment</p>
                <p className="text-xl font-semibold text-foreground capitalize">
                  {aiData?.sentiment || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="card-gradient rounded-xl border border-border/50 p-4 md:col-span-2">
            <p className="text-sm text-muted-foreground mb-2">Key Topics</p>
            <div className="flex flex-wrap gap-2">
              {(aiData?.keyTopics || recording.key_topics || []).map((topic, i) => (
                <span 
                  key={i}
                  className="px-3 py-1 rounded-full bg-secondary text-sm text-foreground"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transcription */}
          <div className="card-gradient rounded-xl border border-border/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-border/50">
              <h2 className="text-lg font-semibold text-foreground">Transcription</h2>
            </div>
            <ScrollArea className="h-[400px] p-6">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {recording.live_transcription || 'No transcription available'}
              </p>
            </ScrollArea>
          </div>

          {/* AI Insights */}
          <div className="card-gradient rounded-xl border border-border/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-border/50">
              <h2 className="text-lg font-semibold text-foreground">AI Coaching Insights</h2>
            </div>
            <ScrollArea className="h-[400px] p-6">
              <div className="space-y-4">
                {aiData?.suggestions?.map((suggestion, index) => {
                  const Icon = getIcon(suggestion.type);
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getColors(suggestion.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-medium uppercase opacity-70">
                            {suggestion.type}
                          </span>
                          <p className="text-foreground mt-1">{suggestion.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                }) || (
                  <p className="text-muted-foreground text-center py-8">
                    No AI insights available
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
