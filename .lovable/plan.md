

# Fix: Authentication Race Condition & Login Redirect Loop

## Problem Analysis

After investigating the codebase and logs, I've identified the root cause of the logout loop:

### What's Happening

1. **Race Condition at Login**: When you log in, multiple hooks fire simultaneously:
   - `useAuth` - sets user state
   - `useAccountStatus` - queries `profiles` table
   - `useEnterpriseSubscription` - calls edge function
   - `useUserRole` - queries `team_members` table
   - `useAdminRole` - queries `user_roles` table

2. **Rate Limiting**: The auth logs show `429: Request rate limit reached` errors. Multiple concurrent token refresh attempts are causing tokens to be revoked.

3. **Token Refresh Storms**: When the edge function `check-enterprise-subscription` is called immediately after login, the session token may not be fully propagated. This triggers token refresh, which races with other requests.

4. **Premature Navigation**: The `ProtectedRoute` checks `useAccountStatus` which may return loading/error states that cause redirect to `/auth` before the session is fully established.

---

## Solution

### 1. Delay Dependent Hook Execution Until Auth is Stable

**File: `src/hooks/useEnterpriseSubscription.ts`**

Add a check to wait for auth loading to complete before making API calls:

```typescript
export function useEnterpriseSubscription() {
  const { user, loading: authLoading } = useAuth();
  // ...
  
  const checkEnterprise = useCallback(async () => {
    // Wait for auth to be ready before making API calls
    if (authLoading) return;
    
    if (!user) {
      setStatus(prev => ({ ...prev, loading: false, isEnterprise: false }));
      return;
    }
    // ... rest of function
  }, [user, authLoading]);
  
  useEffect(() => {
    checkEnterprise();
  }, [checkEnterprise]);
}
```

### 2. Fix useAdminRole to Use maybeSingle()

**File: `src/hooks/useAdminRole.ts`**

Change `.single()` to `.maybeSingle()` to prevent 406 errors when no admin role exists:

```typescript
const { data, error } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .eq('role', 'admin')
  .maybeSingle();  // Changed from .single()

setIsAdmin(!!data);  // Simplified since maybeSingle won't throw on 0 rows
```

### 3. Add Auth Loading Check to useUserRole

**File: `src/hooks/useUserRole.ts`**

Similar pattern - wait for auth to stabilize:

```typescript
export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  // ...
  
  const fetchRole = useCallback(async () => {
    if (authLoading) return;  // Wait for auth
    
    if (!user) {
      setState({ role: 'user', loading: false, teamId: null });
      return;
    }
    // ... rest
  }, [user, authLoading]);
}
```

### 4. Add Debounce Protection to Prevent Concurrent API Calls

**File: `src/hooks/useEnterpriseSubscription.ts`**

Add a flag to prevent concurrent API calls (similar to what we did for `useAccountStatus`):

```typescript
const isCheckingRef = useRef(false);

const checkEnterprise = useCallback(async () => {
  if (isCheckingRef.current || authLoading) return;
  if (!user) {
    setStatus(prev => ({ ...prev, loading: false, isEnterprise: false }));
    return;
  }
  
  isCheckingRef.current = true;
  try {
    // ... API call
  } finally {
    isCheckingRef.current = false;
  }
}, [user, authLoading]);
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useEnterpriseSubscription.ts` | Add `authLoading` check and `isCheckingRef` guard |
| `src/hooks/useAdminRole.ts` | Change `.single()` to `.maybeSingle()`, add `authLoading` check |
| `src/hooks/useUserRole.ts` | Add `authLoading` check to prevent premature queries |

---

## Why This Fixes the Issue

1. **No more premature API calls**: Hooks wait for `authLoading: false` before hitting the database or edge functions
2. **No more 406 errors**: Using `.maybeSingle()` handles missing rows gracefully
3. **No concurrent request storms**: The `isCheckingRef` pattern prevents duplicate API calls
4. **Stable auth state**: The session is fully established before dependent hooks execute

---

## Technical Details

The key insight is that Supabase's `onAuthStateChange` fires **before** the session is fully propagated to all endpoints. By adding the `authLoading` check, we ensure:

1. The initial `getSession()` call has completed
2. The user object is fully populated
3. The access token is valid and can be used for API calls

This prevents the cascade of 401s -> token refreshes -> rate limits -> more 401s that was causing the logout loop.

