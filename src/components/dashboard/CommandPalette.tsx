import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Phone, BarChart3, Users, Mic, Calendar, Brain, FileText, Settings,
  Zap, Home, BookOpen, Trophy, Layout,
} from 'lucide-react';

const NAVIGATION_ITEMS = [
  { label: 'Dashboard', icon: Home, path: '/dashboard', keywords: 'home overview' },
  { label: 'Leads', icon: Users, path: '/leads', keywords: 'contacts crm prospects' },
  { label: 'Recordings', icon: FileText, path: '/recordings', keywords: 'calls audio playback' },
  { label: 'Schedule', icon: Calendar, path: '/schedule', keywords: 'calendar planner meetings' },
  { label: 'Analytics & Coaching', icon: BarChart3, path: '/analytics', keywords: 'stats performance scores' },
  { label: 'WinWords', icon: Zap, path: '/winwords', keywords: 'scripts generator ai' },
  { label: 'Leaderboard', icon: Trophy, path: '/leaderboard', keywords: 'rankings competition' },
  { label: 'Settings', icon: Settings, path: '/settings', keywords: 'profile account billing' },
];

interface CommandPaletteProps {
  onStartCall?: () => void;
}

export function CommandPalette({ onStartCall }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runAction = useCallback((action: () => void) => {
    setOpen(false);
    action();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runAction(() => onStartCall?.())}>
            <Phone className="mr-2 h-4 w-4" />
            Start a Call
          </CommandItem>
          <CommandItem onSelect={() => runAction(() => navigate('/recordings'))}>
            <Mic className="mr-2 h-4 w-4" />
            New Recording
          </CommandItem>
          <CommandItem onSelect={() => runAction(() => navigate('/winwords'))}>
            <Zap className="mr-2 h-4 w-4" />
            Generate Script (WinWords)
          </CommandItem>
          <CommandItem onSelect={() => runAction(() => navigate('/leads', { state: { openAddLead: true } }))}>
            <Users className="mr-2 h-4 w-4" />
            Add a Lead
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigate">
          {NAVIGATION_ITEMS.map(item => (
            <CommandItem
              key={item.path}
              onSelect={() => runAction(() => navigate(item.path))}
              keywords={[item.keywords]}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
