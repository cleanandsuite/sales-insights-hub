import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CallSummaryCard } from '@/components/leads/CallSummaryCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Search, Filter, Download, Phone, Clock, TrendingUp, Play, FileText, Calendar } from 'lucide-react';

interface CallRecording {
  id: string;
  file_name: string;
  status: string;
  duration_seconds: number | null;
  sentiment_score: number | null;
  created_at: string;
  summary: string | null;
  key_topics: string[] | null;
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

export default function CallHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [summaries, setSummaries] = useState<Record<string, CallSummary>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const [recordingsResult, summariesResult] = await Promise.all([
      supabase
        .from('call_recordings')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('call_summaries')
        .select('*')
    ]);

    if (recordingsResult.error) {
      console.error('Error fetching recordings:', recordingsResult.error);
    } else {
      setRecordings(recordingsResult.data || []);
    }

    if (summariesResult.data) {
      const summaryMap: Record<string, CallSummary> = {};
      summariesResult.data.forEach((s: any) => {
        summaryMap[s.recording_id] = s;
      });
      setSummaries(summaryMap);
    }

    setLoading(false);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    const matchesSearch = r.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = filterByDate(r);
    return matchesSearch && matchesDate;
  });

  // Calculate stats
  const totalCalls = recordings.length;
  const avgDuration = recordings.reduce((acc, r) => acc + (r.duration_seconds || 0), 0) / (totalCalls || 1);
  const analyzedCalls = recordings.filter(r => r.status === 'analyzed').length;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Call History</h1>
            <p className="text-muted-foreground mt-1">Review call recordings and AI-generated summaries</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export All
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
              placeholder="Search conversations..."
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

        {/* Call List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : filteredRecordings.length === 0 ? (
          <div className="card-gradient rounded-xl border border-border/50 p-12 text-center">
            <Phone className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No calls yet</h3>
            <p className="text-muted-foreground mb-4">
              Start recording calls to see them here with AI summaries
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Start Recording
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Compact List View */}
            <div className="card-gradient rounded-xl border border-border/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Time</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Contact</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Score</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Duration</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Summary</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredRecordings.map((recording) => (
                      <tr 
                        key={recording.id} 
                        className="hover:bg-secondary/20 transition-colors cursor-pointer"
                        onClick={() => setExpandedId(expandedId === recording.id ? null : recording.id)}
                      >
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-foreground">
                            {new Date(recording.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(recording.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-foreground">{recording.file_name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-bold ${getSentimentColor(recording.sentiment_score)}`}>
                            {recording.sentiment_score ? `${Math.round(recording.sentiment_score * 100)}%` : 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-foreground">{formatDuration(recording.duration_seconds)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {recording.summary || (recording.key_topics?.join(', ') || 'No summary')}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/recording/${recording.id}`);
                              }}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/recording/${recording.id}`);
                              }}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expanded Summary View */}
            {expandedId && summaries[expandedId] && (
              <CallSummaryCard
                summary={summaries[expandedId]}
                contactName={recordings.find(r => r.id === expandedId)?.file_name || 'Unknown'}
                duration={recordings.find(r => r.id === expandedId)?.duration_seconds || undefined}
                onPlayRecording={() => navigate(`/recording/${expandedId}`)}
                onViewTranscript={() => navigate(`/recording/${expandedId}`)}
                onAddNote={() => toast.info('Adding note...')}
              />
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
