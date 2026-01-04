import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/stat-card';
import { Phone, TrendingUp, Clock, ThumbsUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CallRecording {
  id: string;
  file_name: string;
  status: string;
  sentiment_score: number | null;
  duration_seconds: number | null;
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecordings() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('call_recordings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setRecordings(data);
      }
      setLoading(false);
    }

    fetchRecordings();
  }, [user]);

  const totalCalls = recordings.length;
  const analyzedCalls = recordings.filter(r => r.status === 'analyzed').length;
  const avgSentiment = recordings
    .filter(r => r.sentiment_score !== null)
    .reduce((acc, r) => acc + (r.sentiment_score || 0), 0) / (analyzedCalls || 1);
  const totalDuration = recordings.reduce((acc, r) => acc + (r.duration_seconds || 0), 0);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your sales call analytics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Calls"
            value={totalCalls}
            icon={Phone}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Analyzed"
            value={analyzedCalls}
            icon={TrendingUp}
          />
          <StatCard
            title="Total Duration"
            value={formatDuration(totalDuration)}
            icon={Clock}
          />
          <StatCard
            title="Avg Sentiment"
            value={avgSentiment ? `${(avgSentiment * 100).toFixed(0)}%` : 'N/A'}
            icon={ThumbsUp}
          />
        </div>

        {/* Recent Calls */}
        <div className="card-gradient rounded-xl border border-border/50 overflow-hidden">
          <div className="border-b border-border/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Calls</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : recordings.length === 0 ? (
              <div className="text-center py-12">
                <Phone className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No calls recorded yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Upload your first call recording to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recordings.map((recording) => (
                  <div
                    key={recording.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/30 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{recording.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(recording.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {recording.duration_seconds && (
                        <span className="text-sm text-muted-foreground">
                          {formatDuration(recording.duration_seconds)}
                        </span>
                      )}
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
