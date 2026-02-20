/**
 * Cross-tab Session Refresh Coordinator
 * 
 * Prevents multiple tabs from refreshing the session simultaneously,
 * which causes token rotation conflicts and 429 rate limit errors.
 */

const LOCK_KEY = 'sellsig_session_refresh_lock';
const LOCK_TTL_MS = 10000; // 10 seconds max lock hold time
const REFRESH_BUFFER_MS = 60000; // Refresh when 1 minute before expiry

interface LockState {
  holder: string;
  acquired: number;
}

// Unique ID for this tab
const tabId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * Attempt to acquire a cross-tab lock using localStorage
 * Falls back gracefully if localStorage is unavailable
 */
function acquireLock(): boolean {
  try {
    const now = Date.now();
    const existing = localStorage.getItem(LOCK_KEY);
    
    if (existing) {
      const lock: LockState = JSON.parse(existing);
      // Check if lock is still valid (not expired)
      if (now - lock.acquired < LOCK_TTL_MS) {
        // Lock is held by another tab
        return lock.holder === tabId;
      }
      // Lock expired, we can take it
    }
    
    // Acquire the lock
    const newLock: LockState = { holder: tabId, acquired: now };
    localStorage.setItem(LOCK_KEY, JSON.stringify(newLock));
    
    // Double-check we got it (race condition mitigation)
    const verify = localStorage.getItem(LOCK_KEY);
    if (verify) {
      const verifyLock: LockState = JSON.parse(verify);
      return verifyLock.holder === tabId;
    }
    return false;
  } catch {
    // localStorage unavailable, allow refresh (single-tab mode)
    return true;
  }
}

/**
 * Release the cross-tab lock
 */
function releaseLock(): void {
  try {
    const existing = localStorage.getItem(LOCK_KEY);
    if (existing) {
      const lock: LockState = JSON.parse(existing);
      if (lock.holder === tabId) {
        localStorage.removeItem(LOCK_KEY);
      }
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Check if the session needs refresh based on expiry time
 */
export function shouldRefreshSession(expiresAt: number | undefined): boolean {
  if (!expiresAt) return false;
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = expiresAt - now;
  // Refresh when less than 1 minute until expiry
  return timeUntilExpiry > 0 && timeUntilExpiry < (REFRESH_BUFFER_MS / 1000);
}

/**
 * Coordinated session refresh that prevents multi-tab storms
 * Returns true if refresh was attempted, false if another tab is handling it
 */
export async function coordinatedRefresh(
  refreshFn: () => Promise<{ error: Error | null }>
): Promise<{ attempted: boolean; error: Error | null }> {
  // Try to acquire lock
  if (!acquireLock()) {
    // Another tab is refreshing
    return { attempted: false, error: null };
  }
  
  try {
    const result = await refreshFn();
    return { attempted: true, error: result.error };
  } finally {
    releaseLock();
  }
}

/**
 * Listen for storage events to detect when another tab refreshes
 * This allows passive tabs to pick up the new session
 */
export function onCrossTabSessionChange(callback: () => void): () => void {
  const handler = (event: StorageEvent) => {
    // Supabase stores session in localStorage with this key pattern
    if (event.key?.includes('supabase.auth.token') || 
        event.key?.includes('sb-') && event.key?.includes('-auth-token')) {
      callback();
    }
  };
  
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

/**
 * Clean up stale locks on page load
 */
export function cleanupStaleLocks(): void {
  try {
    const existing = localStorage.getItem(LOCK_KEY);
    if (existing) {
      const lock: LockState = JSON.parse(existing);
      const now = Date.now();
      if (now - lock.acquired > LOCK_TTL_MS) {
        localStorage.removeItem(LOCK_KEY);
      }
    }
  } catch {
    // Ignore errors
  }
}
