import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Phone, Play, Pause, Clock, Calendar, TrendingUp, Mic } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { createPlayableObjectUrl } from '@/lib/audioPlayback';

interface CallRecording {
  id: string;
  file_name: string;
  status: string;
  sentiment_score: number | null;
  duration_seconds: number | null;
  created_at: string;
  audio_url: string | null;
  key_topics: string[] | null;
  live_transcription: string | null;
}

export default function Recordings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function fetchRecordings() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('call_recordings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRecordings(data);
      }
      setLoading(false);
    }

    fetchRecordings();
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
      // Pause current
      audioRef.current?.pause();
      if (audioRef.current?.src?.startsWith('blob:')) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      setPlayingId(null);
      return;
    }

    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.src?.startsWith('blob:')) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    }

    // Get public URL for the recording (bucket is now public)
    const { data: urlData } = supabase.storage
      .from('call-recordings')
      .getPublicUrl(recording.audio_url);

    if (urlData?.publicUrl) {
      const primaryAudio = new Audio(urlData.publicUrl);

      primaryAudio.onended = () => {
        if (primaryAudio.src.startsWith('blob:')) {
          URL.revokeObjectURL(primaryAudio.src);
        }
        setPlayingId(null);
      };

      primaryAudio.onerror = async () => {
        // If the file was recorded as mp4/ogg but stored as webm, browsers may refuse to play.
        // In that case, we fetch and re-wrap the bytes with the correct MIME type.
        try {
          const { objectUrl, mime } = await createPlayableObjectUrl(urlData.publicUrl);
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

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Recordings</h1>
            <p className="text-muted-foreground mt-1">All your saved call recordings</p>
          </div>
          <Button onClick={() => navigate('/dashboard')} size="lg" className="gap-2">
            <Mic className="h-5 w-5" />
            New Recording
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : recordings.length === 0 ? (
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
          <div className="grid gap-4">
            {recordings.map((recording) => (
              <div
                key={recording.id}
                className="card-gradient rounded-xl border border-border/50 p-5 hover:border-primary/30 transition-all"
              >
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
                        onClick={() => navigate(`/recording/${recording.id}`)}
                      >
                        {recording.file_name}
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
