import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import {
  LayoutDashboard, Target, Sparkles, Calendar, BarChart3, Medal,
  Building2, Settings, Search
} from 'lucide-react';

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

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
          <Command className="rounded-lg border-0">
            <CommandInput placeholder="Search pages, leads, recordings..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Pages">
                {pages.map(p => (
                  <CommandItem
                    key={p.route}
                    onSelect={() => { navigate(p.route); setOpen(false); }}
                    className="gap-3"
                  >
                    <p.icon className="h-4 w-4 text-muted-foreground" />
                    {p.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
