import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  provider: 'google' | 'outlook';
  external_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  attendees?: unknown;
  is_all_day: boolean;
  status: string;
}

interface CalendarConnection {
  google_connected: boolean;
  outlook_connected: boolean;
  last_google_sync?: string;
  last_outlook_sync?: string;
}

export function useCalendarSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [connection, setConnection] = useState<CalendarConnection | null>(null);

  const getConnectionStatus = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('calendar-sync', {
        body: { action: 'get-status' },
      });

      if (error) throw error;
      setConnection(data.connection);
      return data.connection;
    } catch (error: any) {
      console.error('Failed to get calendar status:', error);
      return null;
    }
  }, []);

  const connectGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const redirectUri = `${window.location.origin}/schedule`;
      
      const { data, error } = await supabase.functions.invoke('calendar-sync', {
        body: { 
          action: 'get-auth-url', 
          provider: 'google',
          redirectUri 
        },
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Redirect to Google OAuth
      window.location.href = data.authUrl;
    } catch (error: any) {
      toast.error('Failed to connect Google Calendar');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOAuthCallback = useCallback(async (code: string, provider: 'google' | 'outlook') => {
    setIsLoading(true);
    try {
      const redirectUri = `${window.location.origin}/schedule`;
      
      const { data, error } = await supabase.functions.invoke('calendar-sync', {
        body: { 
          action: 'exchange-code', 
          provider,
          code,
          redirectUri 
        },
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return false;
      }

      toast.success('Calendar connected successfully!');
      await getConnectionStatus();
      await syncEvents();
      return true;
    } catch (error: any) {
      toast.error('Failed to complete calendar connection');
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getConnectionStatus]);

  const syncEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('calendar-sync', {
        body: { action: 'sync-events' },
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success(`Synced ${data.eventsSynced} events from calendar`);
      await fetchEvents();
    } catch (error: any) {
      toast.error('Failed to sync calendar events');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchEvents = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch from local database
      let query = supabase
        .from('calendar_events')
        .select('*')
        .order('start_time', { ascending: true });

      if (startDate) {
        query = query.gte('start_time', startDate);
      }
      if (endDate) {
        query = query.lte('end_time', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents((data || []).map((e: Record<string, unknown>) => ({
        id: e.id as string,
        provider: e.provider as 'google' | 'outlook',
        external_id: e.external_id as string,
        title: e.title as string,
        description: e.description as string | undefined,
        start_time: e.start_time as string,
        end_time: e.end_time as string,
        location: e.location as string | undefined,
        attendees: e.attendees,
        is_all_day: e.is_all_day as boolean,
        status: e.status as string,
      })));
    } catch (error: unknown) {
      console.error('Failed to fetch calendar events:', error);
    }
  }, []);

  const disconnectCalendar = useCallback(async (provider: 'google' | 'outlook') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('calendar-sync', {
        body: { action: 'disconnect', provider },
      });

      if (error) throw error;
      
      toast.success(`${provider === 'google' ? 'Google' : 'Outlook'} Calendar disconnected`);
      await getConnectionStatus();
      setEvents(events.filter(e => e.provider !== provider));
    } catch (error: any) {
      toast.error('Failed to disconnect calendar');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [events, getConnectionStatus]);

  const checkForConflicts = useCallback((startTime: string, endTime: string, excludeEventId?: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    return events.filter(event => {
      if (excludeEventId && event.id === excludeEventId) return false;
      
      const eventStart = new Date(event.start_time);
      const eventEnd = new Date(event.end_time);

      // Check for overlap
      return start < eventEnd && end > eventStart;
    });
  }, [events]);

  return {
    isLoading,
    events,
    connection,
    getConnectionStatus,
    connectGoogle,
    handleOAuthCallback,
    syncEvents,
    fetchEvents,
    disconnectCalendar,
    checkForConflicts,
  };
}
