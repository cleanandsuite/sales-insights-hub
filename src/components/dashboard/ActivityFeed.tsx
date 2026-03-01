import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ActivityFeedItem } from './ActivityFeedItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Mic, ChevronLeft, ChevronRight, ArrowRight, Phone, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  className?: string;
}

export function ActivityFeed({ className }: ActivityFeedProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const fetchRecordings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('call_recordings')
      .select('id, name, file_name, status, sentiment_score, duration_seconds, created_at, summary, key_topics')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(200);
    setRecordings(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchRecordings(); }, [fetchRecordings]);

  const filtered = recordings.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = (r.name || r.file_name || '').toLowerCase();
    const summary = (r.summary || '').toLowerCase();
    return name.includes(q) || summary.includes(q);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Mic className="h-4 w-4 text-primary" />
          Activity Feed
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground h-7"
          onClick={() => navigate('/recordings')}
        >
          All Recordings <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search calls..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Feed items */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <h4 className="text-sm font-semibold text-foreground mb-1">
            {recordings.length === 0 ? 'No calls yet' : 'No matches found'}
          </h4>
          <p className="text-xs text-muted-foreground max-w-[240px] mx-auto mb-4">
            {recordings.length === 0
              ? 'Record your first call to unlock AI-powered scoring, coaching insights, and performance tracking.'
              : 'Try a different search term.'}
          </p>
          {recordings.length === 0 && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-accent font-medium">
              <Sparkles className="h-3 w-3" />
              AI coaching activates after your first call
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {paginated.map((rec, i) => (
            <ActivityFeedItem
              key={rec.id}
              id={rec.id}
              name={rec.name || rec.file_name}
              summary={rec.summary}
              score={rec.sentiment_score ? Math.round(rec.sentiment_score * 100) : null}
              duration={rec.duration_seconds}
              status={rec.status}
              timestamp={rec.created_at}
              onView={() => navigate('/recordings')}
              style={{ animationDelay: `${i * 50}ms` }}
              className="animate-fade-in opacity-0 [animation-fill-mode:forwards]"
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            {page + 1}/{totalPages} · {filtered.length} calls
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
