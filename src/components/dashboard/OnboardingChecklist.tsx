import { useState, useEffect } from 'react';
import { Check, X, User, Phone, Calendar, Sparkles, Brain, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface ChecklistItem {
  id: string;
  label: string;
  icon: typeof User;
  done: boolean;
  route: string;
}

const DISMISSED_KEY = 'sellsig_onboarding_dismissed';

export function OnboardingChecklist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === 'true');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || dismissed) return;

    async function check() {
      const hasName = !!user!.user_metadata?.full_name;

      const [callsRes, calRes, settingsRes] = await Promise.all([
        supabase.from('call_recordings').select('id', { count: 'exact', head: true }).eq('user_id', user!.id).is('deleted_at', null),
        supabase.from('calendar_connections').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
        supabase.from('ai_lead_settings').select('id', { count: 'exact', head: true }).eq('user_id', user!.id),
      ]);

      const checklist: ChecklistItem[] = [
        { id: 'profile', label: 'Complete your profile', icon: User, done: hasName, route: '/settings' },
        { id: 'call', label: 'Make your first call', icon: Phone, done: (callsRes.count || 0) > 0, route: '/dashboard' },
        { id: 'calendar', label: 'Connect your calendar', icon: Calendar, done: (calRes.count || 0) > 0, route: '/schedule' },
        { id: 'script', label: 'Generate a script', icon: Sparkles, done: false, route: '/winwords' },
        { id: 'coach', label: 'Set your coaching style', icon: Brain, done: (settingsRes.count || 0) > 0, route: '/settings' },
      ];

      setItems(checklist);
      setLoading(false);
    }

    check();
  }, [user, dismissed]);

  if (dismissed || loading || !user) return null;

  const doneCount = items.filter(i => i.done).length;
  if (doneCount === items.length) return null;

  const pct = Math.round((doneCount / items.length) * 100);

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Progress ring */}
          <div className="relative h-10 w-10">
            <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" className="stroke-muted" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15" fill="none"
                className="stroke-primary"
                strokeWidth="3"
                strokeDasharray={`${pct * 0.942} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
              {doneCount}/{items.length}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Get started with SellSig</h3>
            <p className="text-xs text-muted-foreground">{pct}% complete</p>
          </div>
        </div>
        <button
          onClick={() => { localStorage.setItem(DISMISSED_KEY, 'true'); setDismissed(true); }}
          className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-1">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => !item.done && navigate(item.route)}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors',
              item.done
                ? 'text-muted-foreground'
                : 'text-foreground hover:bg-muted/50 cursor-pointer'
            )}
          >
            <div className={cn(
              'flex items-center justify-center h-5 w-5 rounded-full shrink-0',
              item.done ? 'bg-success text-success-foreground' : 'border-2 border-border'
            )}>
              {item.done && <Check className="h-3 w-3" />}
            </div>
            <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className={cn(item.done && 'line-through')}>{item.label}</span>
            {!item.done && <ChevronRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />}
          </button>
        ))}
      </div>
    </div>
  );
}
