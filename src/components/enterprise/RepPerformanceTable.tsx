import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  ArrowUpDown, ChevronDown, ChevronUp, Eye, Phone, TrendingUp, TrendingDown, Minus
} from 'lucide-react';

interface RepStats {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  avg_overall_score: number;
  avg_rapport_score: number;
  avg_discovery_score: number;
  avg_presentation_score: number;
  avg_closing_score: number;
  avg_objection_handling_score: number;
  total_calls: number;
  deals_won: number;
  deals_lost: number;
  win_rate: number;
  avg_deal_velocity: number;
}

interface CallRecord {
  id: string;
  file_name: string;
  created_at: string;
  duration_seconds: number | null;
  sentiment_score: number | null;
  overall_score?: number;
}

interface RepPerformanceTableProps {
  teamId: string;
}

type SortField = 'full_name' | 'total_calls' | 'avg_overall_score' | 'win_rate' | 'avg_closing_score';
type SortDirection = 'asc' | 'desc';

export function RepPerformanceTable({ teamId }: RepPerformanceTableProps) {
  const [reps, setReps] = useState<RepStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRep, setSelectedRep] = useState<RepStats | null>(null);
  const [repCalls, setRepCalls] = useState<CallRecord[]>([]);
  const [callsLoading, setCallsLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>('avg_overall_score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchReps();
  }, [teamId]);

  const fetchReps = async () => {
    try {
      const { data, error } = await supabase
        .from('manager_team_stats')
        .select('*')
        .eq('team_id', teamId);

      if (error) throw error;
      setReps(data || []);
    } catch (error) {
      console.error('Error fetching reps:', error);
      toast.error('Failed to load rep data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRepCalls = async (userId: string) => {
    setCallsLoading(true);
    try {
      const { data: recordings, error } = await supabase
        .from('call_recordings')
        .select(`
          id,
          file_name,
          created_at,
          duration_seconds,
          sentiment_score
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Fetch scores for each recording
      const recordingsWithScores = await Promise.all(
        (recordings || []).map(async (rec) => {
          const { data: score } = await supabase
            .from('call_scores')
            .select('overall_score')
            .eq('recording_id', rec.id)
            .maybeSingle();
          return { ...rec, overall_score: score?.overall_score };
        })
      );

      setRepCalls(recordingsWithScores);
    } catch (error) {
      console.error('Error fetching calls:', error);
    } finally {
      setCallsLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedReps = [...reps].sort((a, b) => {
    const aVal = a[sortField] ?? 0;
    const bVal = b[sortField] ?? 0;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const openRepModal = (rep: RepStats) => {
    setSelectedRep(rep);
    fetchRepCalls(rep.user_id);
  };

  const getTrendIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="h-4 w-4 text-success" />;
    if (score >= 50) return <Minus className="h-4 w-4 text-warning" />;
    return <TrendingDown className="h-4 w-4 text-destructive" />;
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-success/10 text-success">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-primary/10 text-primary">Good</Badge>;
    if (score >= 40) return <Badge className="bg-warning/10 text-warning">Needs Work</Badge>;
    return <Badge className="bg-destructive/10 text-destructive">At Risk</Badge>;
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-1 -ml-3 font-medium"
      onClick={() => handleSort(field)}
    >
      {children}
      {sortField === field ? (
        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
      ) : (
        <ArrowUpDown className="h-4 w-4 opacity-50" />
      )}
    </Button>
  );

  if (loading) {
    return (
      <Card className="card-enterprise">
        <CardContent className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-enterprise">
        <CardHeader>
          <CardTitle className="text-foreground">Rep Performance</CardTitle>
          <CardDescription>Click any row to see detailed call history and scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[200px]">
                    <SortButton field="full_name">Rep Name</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="total_calls">Calls</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="avg_overall_score">Composite Score</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="win_rate">Win Rate</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="avg_closing_score">Closer Score</SortButton>
                  </TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedReps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No team members found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedReps.map((rep) => (
                    <TableRow 
                      key={rep.user_id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => openRepModal(rep)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={rep.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {rep.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{rep.full_name || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{rep.total_calls}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{Math.round(rep.avg_overall_score)}</span>
                          {getTrendIcon(rep.avg_overall_score)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={rep.win_rate >= 50 ? 'text-success' : 'text-destructive'}>
                          {rep.win_rate}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={rep.avg_closing_score} className="w-16 h-2" />
                          <span className="text-sm">{Math.round(rep.avg_closing_score)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {rep.avg_closing_score < 50 && (
                          <Badge variant="outline" className="text-xs border-destructive text-destructive">
                            Low Closer
                          </Badge>
                        )}
                        {rep.total_calls < 3 && (
                          <Badge variant="outline" className="text-xs border-warning text-warning ml-1">
                            Low Activity
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Rep Detail Modal */}
      <Dialog open={!!selectedRep} onOpenChange={() => setSelectedRep(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedRep?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedRep?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                </AvatarFallback>
              </Avatar>
              {selectedRep?.full_name || 'Unknown Rep'}
            </DialogTitle>
          </DialogHeader>

          {selectedRep && (
            <div className="space-y-6">
              {/* Score Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-foreground">{Math.round(selectedRep.avg_overall_score)}</p>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-foreground">{selectedRep.win_rate}%</p>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-foreground">{selectedRep.total_calls}</p>
                  <p className="text-sm text-muted-foreground">Total Calls</p>
                </div>
              </div>

              {/* Skill Breakdown */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Skill Breakdown</h4>
                {[
                  { label: 'Discovery', value: selectedRep.avg_discovery_score },
                  { label: 'Closing', value: selectedRep.avg_closing_score },
                  { label: 'Rapport', value: selectedRep.avg_rapport_score },
                  { label: 'Presentation', value: selectedRep.avg_presentation_score },
                  { label: 'Objection Handling', value: selectedRep.avg_objection_handling_score },
                ].map((skill) => (
                  <div key={skill.label} className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-32">{skill.label}</span>
                    <Progress value={skill.value} className="flex-1 h-2" />
                    <span className="text-sm font-medium w-12">{Math.round(skill.value)}</span>
                  </div>
                ))}
              </div>

              {/* Recent Calls */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Recent Calls</h4>
                {callsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : repCalls.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No calls recorded</p>
                ) : (
                  <div className="space-y-2">
                    {repCalls.map((call) => (
                      <div 
                        key={call.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{call.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(call.created_at).toLocaleDateString()} • 
                            {call.duration_seconds ? ` ${Math.round(call.duration_seconds / 60)} min` : ' N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {call.overall_score !== undefined && getScoreBadge(call.overall_score)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
