import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, RefreshCw, Link, Unlink, AlertCircle } from 'lucide-react';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { format } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CalendarSyncPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    isLoading,
    connection,
    getConnectionStatus,
    connectGoogle,
    handleOAuthCallback,
    syncEvents,
    disconnectCalendar,
  } = useCalendarSync();
  
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);

  useEffect(() => {
    getConnectionStatus();
  }, [getConnectionStatus]);

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (code && !isProcessingCallback) {
      setIsProcessingCallback(true);
      
      // Determine provider from state or default to google
      const provider = state === 'outlook' ? 'outlook' : 'google';
      
      handleOAuthCallback(code, provider).then(() => {
        // Clear the URL params after handling
        setSearchParams({});
        setIsProcessingCallback(false);
      });
    }
  }, [searchParams, handleOAuthCallback, setSearchParams, isProcessingCallback]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Calendar Sync
        </CardTitle>
        <CardDescription>
          Connect your calendars to see conflicts and auto-suggest meeting times
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google Calendar */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <div>
              <p className="font-medium">Google Calendar</p>
              {connection?.google_connected ? (
                <p className="text-sm text-muted-foreground">
                  Last synced: {connection.last_google_sync 
                    ? format(new Date(connection.last_google_sync), 'MMM d, h:mm a')
                    : 'Never'}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Not connected</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {connection?.google_connected ? (
              <>
                <Badge variant="secondary" className="bg-success/20 text-success">
                  Connected
                </Badge>
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={syncEvents}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Sync
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => disconnectCalendar('google')}
                  disabled={isLoading}
                >
                  <Unlink className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={connectGoogle}
                disabled={isLoading}
              >
                <Link className="h-4 w-4 mr-1" />
                Connect
              </Button>
            )}
          </div>
        </div>

        {/* Outlook Calendar */}
        <div className="flex items-center justify-between p-3 border rounded-lg opacity-60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path fill="#0078D4" d="M24 7.387v10.478c0 .23-.08.424-.238.576-.158.152-.355.228-.59.228h-8.547v-6.959l1.594 1.18c.124.095.27.143.439.143.168 0 .315-.048.439-.143l6.664-4.932v-.571h-.016l-6.918 5.122-2.202-1.63V7.387h9.375c.235 0 .432.076.59.228.158.152.238.346.238.576zM14.625 18.64H0V5.32l7.313 5.42 7.312-5.42v13.32zm6.691-13.32H14.07l-6.758 5.009-6.757-5.009H.56c-.235 0-.432.076-.59.228-.158.152-.238.346-.238.576v11.508c0 .23.08.424.238.576.158.152.355.228.59.228h13.81V8.418l2.185 1.618 2.185-1.618v10.222h5.625V7.387c0-.23-.08-.424-.238-.576-.158-.152-.355-.228-.59-.228z"/>
              </svg>
            </div>
            <div>
              <p className="font-medium">Outlook Calendar</p>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </div>
          <Badge variant="outline">Coming Soon</Badge>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Setup Required:</strong> To enable Google Calendar sync, add <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> to your backend secrets.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
