import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import {
  LayoutDashboard, Target, Sparkles, Calendar, BarChart3, Medal,
  Building2, Settings, Search, FileText, Mic
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const pages = [
  { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
  { label: 'Leads', icon: Target, route: '/leads' },
  { label: 'WinWords', icon: Sparkles, route: '/winwords' },
  { label: 'Schedule', icon: Calendar, route: '/schedule' },
  { label: 'Analytics & Coaching', icon: BarChart3, route: '/analytics' },
  { label: 'Leaderboard', icon: Medal, route: '/leaderboard' },
  { label: 'Enterprise', icon: Building2, route: '/enterprise' },
  { label: 'Settings', icon: Settings, route: '/settings' },
];

interface TranscriptResult {
  id: string;
  name: string | null;
  file_name: string;
  snippet: string;
  created_at: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [transcriptResults, setTranscriptResults] = useState<TranscriptResult[]>([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Debounced transcript search
  useEffect(() => {
    if (query.length < 3) {
      setTranscriptResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        // Use full-text search with the GIN index
        const tsQuery = query.trim().split(/\s+/).join(' & ');
        const { data, error } = await supabase
          .from('call_recordings')
          .select('id, name, file_name, live_transcription, created_at')
          .not('live_transcription', 'is', null)
          .textSearch('live_transcription', tsQuery, { type: 'plain' })
          .limit(8);

        if (error) {
          // Fallback to ILIKE if FTS fails
          const { data: fallbackData } = await supabase
            .from('call_recordings')
            .select('id, name, file_name, live_transcription, created_at')
            .not('live_transcription', 'is', null)
            .ilike('live_transcription', `%${query}%`)
            .limit(8);

          if (fallbackData) {
            setTranscriptResults(fallbackData.map(r => ({
              id: r.id,
              name: r.name,
              file_name: r.file_name,
              snippet: extractSnippet(r.live_transcription || '', query),
              created_at: r.created_at,
            })));
          }
        } else if (data) {
          setTranscriptResults(data.map(r => ({
            id: r.id,
            name: r.name,
            file_name: r.file_name,
            snippet: extractSnippet(r.live_transcription || '', query),
            created_at: r.created_at,
          })));
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        <Search className="h-3 w-3" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery(''); }}>
        <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
          <Command className="rounded-lg border-0" shouldFilter={false}>
            <CommandInput
              placeholder="Search pages, transcripts, keywords..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>
                {searching ? 'Searching transcripts...' : query.length < 3 ? 'Type 3+ characters to search transcripts' : 'No results found.'}
              </CommandEmpty>

              {/* Pages */}
              {(!query || pages.some(p => p.label.toLowerCase().includes(query.toLowerCase()))) && (
                <CommandGroup heading="Pages">
                  {pages
                    .filter(p => !query || p.label.toLowerCase().includes(query.toLowerCase()))
                    .map(p => (
                      <CommandItem
                        key={p.route}
                        onSelect={() => { navigate(p.route); setOpen(false); setQuery(''); }}
                        className="gap-3"
                      >
                        <p.icon className="h-4 w-4 text-muted-foreground" />
                        {p.label}
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}

              {/* Transcript Results */}
              {transcriptResults.length > 0 && (
                <CommandGroup heading="Call Transcripts">
                  {transcriptResults.map(r => (
                    <CommandItem
                      key={r.id}
                      onSelect={() => { navigate(`/recording/${r.id}`); setOpen(false); setQuery(''); }}
                      className="gap-3 flex-col items-start"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Mic className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium text-sm truncate">{r.name || r.file_name}</span>
                        <span className="text-xs text-muted-foreground ml-auto shrink-0">
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 pl-6" dangerouslySetInnerHTML={{
                        __html: highlightMatch(r.snippet, query)
                      }} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}

function extractSnippet(text: string, query: string): string {
  const lower = text.toLowerCase();
  const qLower = query.toLowerCase();
  const idx = lower.indexOf(qLower);
  if (idx === -1) return text.slice(0, 150);
  const start = Math.max(0, idx - 60);
  const end = Math.min(text.length, idx + query.length + 60);
  return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
}

function highlightMatch(text: string, query: string): string {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="bg-primary/30 text-foreground rounded px-0.5">$1</mark>');
}
