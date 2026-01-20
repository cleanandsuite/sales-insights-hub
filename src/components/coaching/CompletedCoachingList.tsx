import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  CheckCircle2, Target, TrendingUp, AlertTriangle, Zap, Clock, Award
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface CompletedAssignment {
  id: string;
  coaching_type: string;
  priority: string;
  reason: string;
  notes: string | null;
  completed_at: string;
  created_at: string;
}

export function CompletedCoachingList() {
  const { user } = useAuth();
  const [completedItems, setCompletedItems] = useState<CompletedAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchCompleted();
  }, [user]);

  const fetchCompleted = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('coaching_assignments')
        .select('id, coaching_type, priority, reason, notes, completed_at, created_at')
        .eq('assigned_to', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setCompletedItems(data || []);
    } catch (error) {
      console.error('Error fetching completed coaching:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCoachingIcon = (type: string) => {
    switch (type) {
      case 'high_stakes_closer': return <Target className="h-4 w-4 text-success" />;
      case 'discovery_booker': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'objection_handling': return <AlertTriangle className="h-4 w-4 text-success" />;
      case 'activity_boost': return <Zap className="h-4 w-4 text-success" />;
      default: return <CheckCircle2 className="h-4 w-4 text-success" />;
    }
  };

  const getCoachingLabel = (type: string) => {
    switch (type) {
      case 'high_stakes_closer': return 'High Stakes Closer';
      case 'discovery_booker': return 'Discovery Booker';
      case 'objection_handling': return 'Objection Handling';
      case 'activity_boost': return 'Activity Review';
      default: return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  };

  if (loading) {
    return (
      <Card className="card-gradient">
        <CardContent className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  if (completedItems.length === 0) {
    return (
      <Card className="card-gradient">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <CardTitle className="text-foreground text-base">Completed Coaching</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No completed coaching yet. Complete assignments to see them here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-gradient">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <CardTitle className="text-foreground text-base">Completed Coaching</CardTitle>
        </div>
        <CardDescription>Your recent achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {completedItems.map((item) => (
            <div 
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getCoachingIcon(item.coaching_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {getCoachingLabel(item.coaching_type)}
                  </span>
                  <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                    Completed
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{item.reason}</p>
                {item.completed_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {format(new Date(item.completed_at), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
