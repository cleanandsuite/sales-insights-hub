import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export function useCallReminders() {
  const { user } = useAuth();
  const notifiedIds = useRef<Set<string>>(new Set());

  const checkUpcoming = useCallback(async () => {
    if (!user) return;

    const now = new Date();
    const windowEnd = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour ahead

    try {
      const { data } = await supabase
        .from('scheduled_calls')
        .select('id, title, contact_name, scheduled_at, reminder_minutes_before')
        .eq('user_id', user.id)
        .eq('status', 'scheduled')
        .gte('scheduled_at', now.toISOString())
        .lte('scheduled_at', windowEnd.toISOString()) as any;

      if (!data) return;

      for (const call of data) {
        if (notifiedIds.current.has(call.id)) continue;

        const callTime = new Date(call.scheduled_at);
        const reminderMin = call.reminder_minutes_before || 30;
        const reminderTime = new Date(callTime.getTime() - reminderMin * 60 * 1000);

        if (now >= reminderTime && now < callTime) {
          notifiedIds.current.add(call.id);
          const minutesLeft = Math.round((callTime.getTime() - now.getTime()) / 60000);
          const label = call.contact_name || call.title;

          toast({
            title: `📞 Call in ${minutesLeft} min`,
            description: label,
          });

          // Browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Call in ${minutesLeft} min`, { body: label, icon: '/favicon.png' });
          }
        }
      }
    } catch (err) {
      // Silently fail — don't disrupt UX
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Request notification permission once
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    checkUpcoming();
    const interval = setInterval(checkUpcoming, 60_000);
    return () => clearInterval(interval);
  }, [user, checkUpcoming]);
}
