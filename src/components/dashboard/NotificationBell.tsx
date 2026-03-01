import { useState, useEffect } from 'react';
import { Bell, Phone, AlertTriangle, Brain } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  icon: typeof Bell;
  iconClass: string;
  title: string;
  description: string;
  route: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function fetchNotifications() {
      const items: Notification[] = [];

      // Overdue follow-ups
      const { count: overdueCount } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .lt('next_action_due', new Date().toISOString())
        .is('outcome', null);

      if (overdueCount && overdueCount > 0) {
        items.push({
          id: 'overdue',
          icon: AlertTriangle,
          iconClass: 'text-destructive',
          title: `${overdueCount} overdue follow-up${overdueCount > 1 ? 's' : ''}`,
          description: 'These leads need your attention.',
          route: '/leads',
        });
      }

      // Unreviewed coaching sessions
      const { count: coachingCount } = await supabase
        .from('coaching_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const { count: callCount } = await supabase
        .from('call_recordings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .is('deleted_at', null)
        .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString());

      if ((callCount || 0) > 0 && (coachingCount || 0) > 0) {
        items.push({
          id: 'coaching',
          icon: Brain,
          iconClass: 'text-accent',
          title: 'New coaching insights available',
          description: 'Review AI feedback from your recent calls.',
          route: '/analytics',
        });
      }

      // No calls today nudge
      const { count: todayCount } = await supabase
        .from('call_recordings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .is('deleted_at', null)
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

      if ((todayCount || 0) === 0) {
        items.push({
          id: 'nocalls',
          icon: Phone,
          iconClass: 'text-primary',
          title: 'No calls yet today',
          description: 'Start dialing to build momentum.',
          route: '/dashboard',
        });
      }

      setNotifications(items);
    }

    fetchNotifications();
  }, [user]);

  const count = notifications.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
              {count}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 py-3 border-b border-border">
          <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
        </div>
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            You're all caught up 🎉
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {notifications.map(n => (
              <button
                key={n.id}
                onClick={() => { setOpen(false); navigate(n.route); }}
                className="flex items-start gap-3 w-full px-4 py-3 hover:bg-muted/50 transition-colors text-left"
              >
                <n.icon className={cn('h-4 w-4 mt-0.5 shrink-0', n.iconClass)} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
