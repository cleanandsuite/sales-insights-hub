import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, code, redirectUri, provider } = await req.json();

    switch (action) {
      case 'get-auth-url': {
        if (provider === 'google') {
          if (!GOOGLE_CLIENT_ID) {
            return new Response(JSON.stringify({ 
              error: 'Google Calendar not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET secrets.' 
            }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          const scopes = [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/calendar.events.readonly'
          ].join(' ');
          
          const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${GOOGLE_CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent(scopes)}&` +
            `access_type=offline&` +
            `prompt=consent`;
          
          return new Response(JSON.stringify({ authUrl }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else if (provider === 'outlook') {
          return new Response(JSON.stringify({ 
            error: 'Microsoft/Outlook OAuth is not yet supported in Lovable Cloud. Coming soon!' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        break;
      }

      case 'exchange-code': {
        if (provider === 'google') {
          const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: GOOGLE_CLIENT_ID!,
              client_secret: GOOGLE_CLIENT_SECRET!,
              code,
              redirect_uri: redirectUri,
              grant_type: 'authorization_code',
            }),
          });

          const tokens = await tokenResponse.json();
          
          if (tokens.error) {
            return new Response(JSON.stringify({ error: tokens.error_description || tokens.error }), {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Store tokens (encrypted in production)
          const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
          
          await supabase.from('calendar_connections').upsert({
            user_id: user.id,
            google_connected: true,
            google_access_token_encrypted: tokens.access_token,
            google_refresh_token_encrypted: tokens.refresh_token,
            google_token_expires_at: expiresAt,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        break;
      }

      case 'sync-events': {
        const { data: connection } = await supabase
          .from('calendar_connections')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!connection) {
          return new Response(JSON.stringify({ error: 'No calendar connected' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const events: any[] = [];

        // Sync Google Calendar
        if (connection.google_connected && connection.google_access_token_encrypted) {
          let accessToken = connection.google_access_token_encrypted;
          
          // Check if token expired and refresh
          if (new Date(connection.google_token_expires_at) < new Date()) {
            const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                client_id: GOOGLE_CLIENT_ID!,
                client_secret: GOOGLE_CLIENT_SECRET!,
                refresh_token: connection.google_refresh_token_encrypted,
                grant_type: 'refresh_token',
              }),
            });

            const newTokens = await refreshResponse.json();
            if (!newTokens.error) {
              accessToken = newTokens.access_token;
              await supabase.from('calendar_connections').update({
                google_access_token_encrypted: newTokens.access_token,
                google_token_expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
              }).eq('user_id', user.id);
            }
          }

          // Fetch events from Google Calendar
          const now = new Date();
          const oneMonthAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          
          const calendarResponse = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
            `timeMin=${now.toISOString()}&` +
            `timeMax=${oneMonthAhead.toISOString()}&` +
            `singleEvents=true&` +
            `orderBy=startTime`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          const calendarData = await calendarResponse.json();
          
          if (calendarData.items) {
            for (const item of calendarData.items) {
              const event = {
                user_id: user.id,
                provider: 'google',
                external_id: item.id,
                title: item.summary || 'Untitled',
                description: item.description,
                start_time: item.start?.dateTime || item.start?.date,
                end_time: item.end?.dateTime || item.end?.date,
                location: item.location,
                attendees: item.attendees?.map((a: any) => ({ email: a.email, name: a.displayName })),
                is_all_day: !!item.start?.date,
                status: item.status,
                last_synced_at: new Date().toISOString(),
              };
              events.push(event);
            }
          }

          // Upsert events
          if (events.length > 0) {
            await supabase.from('calendar_events').upsert(events, {
              onConflict: 'user_id,provider,external_id',
            });
          }

          // Update last sync time
          await supabase.from('calendar_connections').update({
            last_google_sync: new Date().toISOString(),
          }).eq('user_id', user.id);
        }

        return new Response(JSON.stringify({ 
          success: true, 
          eventsSynced: events.length 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-events': {
        const { startDate, endDate } = await req.json();
        
        let query = supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', { ascending: true });

        if (startDate) {
          query = query.gte('start_time', startDate);
        }
        if (endDate) {
          query = query.lte('end_time', endDate);
        }

        const { data: events, error } = await query;

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ events }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'disconnect': {
        if (provider === 'google') {
          await supabase.from('calendar_connections').update({
            google_connected: false,
            google_access_token_encrypted: null,
            google_refresh_token_encrypted: null,
            google_token_expires_at: null,
          }).eq('user_id', user.id);

          await supabase.from('calendar_events')
            .delete()
            .eq('user_id', user.id)
            .eq('provider', 'google');
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-status': {
        const { data: connection } = await supabase
          .from('calendar_connections')
          .select('google_connected, outlook_connected, last_google_sync, last_outlook_sync')
          .eq('user_id', user.id)
          .single();

        return new Response(JSON.stringify({ 
          connection: connection || { google_connected: false, outlook_connected: false }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Calendar sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
