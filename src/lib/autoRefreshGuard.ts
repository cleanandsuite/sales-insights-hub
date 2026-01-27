import { supabase } from '@/integrations/supabase/client';

/**
 * Supabase JS can re-enable auto-refresh after sign-in when `autoRefreshToken: true`.
 * In some environments (multiple tabs, clock skew, HMR), this can cause rapid
 * refresh_token loops -> rate limits -> forced sign-out.
 *
 * This guard:
 * - stops any running auto-refresh timer
 * - prevents future `startAutoRefresh()` calls from re-enabling it
 * - re-applies stopAutoRefresh on any auth state change
 */

let installed = false;

export function installAutoRefreshGuard() {
  if (installed) return;
  installed = true;

  const stop = () => {
    try {
      supabase.auth.stopAutoRefresh();
    } catch {
      // ignore
    }
  };

  // Stop immediately on boot
  stop();

  // Prevent future re-enables
  const authAny = supabase.auth as any;
  if (typeof authAny.startAutoRefresh === 'function') {
    authAny.startAutoRefresh = () => {
      // no-op by design
    };
  }
  if (typeof authAny._startAutoRefresh === 'function') {
    authAny._startAutoRefresh = () => {
      // no-op by design
    };
  }

  // Re-assert after any auth state change (SIGNED_IN, TOKEN_REFRESHED, etc.)
  supabase.auth.onAuthStateChange(() => {
    stop();
  });
}
