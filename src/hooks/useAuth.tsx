import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { 
  coordinatedRefresh, 
  shouldRefreshSession, 
  onCrossTabSessionChange,
  cleanupStaleLocks 
} from '@/lib/sessionRefreshCoordinator';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // Coordinated refresh that prevents multi-tab storms
  const safeRefresh = async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    
    try {
      await coordinatedRefresh(async () => {
        const { error } = await supabase.auth.refreshSession();
        return { error };
      });
    } finally {
      isRefreshingRef.current = false;
    }
  };

  // Schedule next refresh based on session expiry
  const scheduleRefresh = (sess: Session | null) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    
    if (!sess?.expires_at) return;
    
    const expiresAt = sess.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilRefresh = Math.max(0, (expiresAt - now - 60) * 1000); // Refresh 1 min before expiry
    
    if (timeUntilRefresh > 0 && timeUntilRefresh < 3600000) { // Only schedule if within 1 hour
      refreshTimerRef.current = setTimeout(safeRefresh, timeUntilRefresh);
    }
  };

  useEffect(() => {
    // Clean up any stale locks from crashed tabs
    cleanupStaleLocks();
    
    // Stop Supabase's built-in auto-refresh to prevent multi-tab storms
    supabase.auth.stopAutoRefresh();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Schedule our coordinated refresh
        scheduleRefresh(session);

        // Capture calendar tokens when user signs in with Google
        if (event === 'SIGNED_IN' && session?.user) {
          const provider = session.user.app_metadata?.provider;
          if (provider === 'google' && session.provider_token) {
            // Store the tokens for calendar access
            try {
              await supabase.functions.invoke('capture-calendar-tokens', {
                body: {
                  provider_token: session.provider_token,
                  provider_refresh_token: session.provider_refresh_token,
                },
              });
            } catch (error) {
              console.error('Failed to capture calendar tokens:', error);
            }
          }
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      scheduleRefresh(session);
    });
    
    // Listen for cross-tab session changes so we pick up refreshes from other tabs
    const unsubscribeCrossTab = onCrossTabSessionChange(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        scheduleRefresh(session);
      });
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeCrossTab();
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName }
      }
    });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events.readonly',
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    // Clear local state first, then attempt server logout
    setUser(null);
    setSession(null);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Ignore server errors - session may already be invalidated
      console.log('Sign out completed (session may have been expired)');
    }
    // Force redirect to auth page
    window.location.href = '/auth';
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
