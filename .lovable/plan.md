
## Goal
Stop the “log in → briefly works → kicked back to /auth” loop in a way that doesn’t require repeated trial-and-error (credits), and make the app resilient even when multiple tabs are open.

---

## What I now believe is happening (based on evidence)
### Key evidence
- You confirmed the issue happens on **both** the preview and published sites, and you’re testing with **multiple tabs** open.
- The auth logs show repeated **refresh_token** calls and **429 rate limit** events, plus **token_revoked** events.
- The latest network snapshot shows a mix of:
  - Requests made with an **authenticated JWT** (e.g. `check-enterprise-subscription`),
  - And other requests made with the **anon/publishable key as the Authorization header** (meaning the client considered itself **signed out** at that moment).

### Likely root cause
**Multi-tab refresh-token “storms” + refresh token rotation conflicts.**
When multiple tabs are open, each tab’s auto-refresh timer can try to refresh the session around the same time. Because refresh tokens rotate, one refresh can invalidate the other tab’s refresh token, causing the session to be dropped → `user` becomes null → `ProtectedRoute` immediately sends you to `/auth`.

This is consistent with:
- the 429s and token revocations,
- you testing with multiple tabs,
- and the “already logged in but still gets redirected” symptom.

Enterprise changes likely **amplified** the problem because they add more early requests after login (more chances to collide), but the underlying issue is the refresh behavior.

---

## “Don’t waste credits” immediate resolution (no code changes)
This is the fastest way to confirm the hypothesis before we change anything:

1) **Close every SellSig tab/window** (preview + published).
2) **Wait 60–90 seconds** (lets backend rate limits cool down).
3) Open **only one tab** (pick Preview *or* Published) and log in.
4) If it stays logged in reliably with one tab, we’ve confirmed multi-tab refresh collisions as the cause.

If you want the cleanest test: use an incognito window (single tab).

---

## Permanent fix (code changes) — make auth stable across multiple tabs
### A) Implement a cross-tab session refresh coordinator (core fix)
In the AuthProvider (and/or a small auth utility), we will:
1) **Stop built-in auto refresh** (`supabase.auth.stopAutoRefresh()`), so every tab doesn’t run its own refresh timer.
2) Replace it with **our own refresh scheduler** that:
   - refreshes only when the session is near expiry, and
   - uses a **cross-tab lock** so only one tab is allowed to refresh at a time.
3) Cross-tab locking approach (robust):
   - Prefer `navigator.locks` when available (best for multi-tab coordination).
   - Fallback to a `localStorage`-based mutex with short TTL when locks aren’t available.

Result: multiple tabs can stay open without “refresh token rotation conflicts” knocking you out.

### B) Remove/guard manual refreshSession calls that can trigger collisions
We found at least one explicit refresh:
- `src/pages/Dashboard.tsx` calls `supabase.auth.refreshSession()` after checkout success.

We’ll change that to either:
- use the new coordinator’s “safe refresh” (locked), or
- avoid refreshSession entirely unless strictly needed.

### C) Reduce extra auth-adjacent requests right after login (secondary stabilization)
Even if the refresh coordinator fixes the core issue, we should reduce pressure:
- Update `useSubscription` to:
  - wait for auth to be stable (use `authLoading`),
  - add an `isCheckingRef` concurrency guard (like other hooks),
  - and stop manually passing `Authorization` headers (let the client attach the current token).
- Consider increasing subscription polling from 60s to something gentler (e.g., 5 minutes) or making it event-driven.

---

## Verification plan (single test pass, minimal iteration)
After implementing the permanent fix:

1) Hard refresh the app once.
2) Open **two tabs** to the same site (preview) and verify:
   - login stays stable for 2–3 minutes,
   - no bounce to `/auth`.
3) Then open **multiple tabs** and verify it remains stable.
4) Optional: verify both preview and published behave normally.

Success criteria:
- No repeated forced redirects to `/auth`
- No “refresh storm” behavior (dramatically fewer /token refresh calls)

---

## If it still fails after this (fallback, still low-credit)
If the above doesn’t fully resolve it, the next best low-iteration step is to add a temporary “Auth Debug Panel” (dev-only) that shows:
- last auth event (SIGNED_IN / TOKEN_REFRESHED / SIGNED_OUT),
- session expiry time,
- whether the refresh lock is held,
- last refresh attempt result.

That makes the next fix highly targeted instead of guessing.

---

## Files we’ll likely touch
- `src/hooks/useAuth.tsx` (add refresh coordinator + stop auto refresh)
- `src/pages/Dashboard.tsx` (remove/lock the manual refreshSession call)
- `src/hooks/useSubscription.ts` (authLoading guard, concurrency guard, reduce manual token handling)

---

## Why this is the “best way” right now
- Your own answer (“multiple tabs”) + logs strongly point to refresh token rotation collisions.
- This approach fixes the underlying class of issues rather than whack-a-mole in individual hooks.
- It avoids further credit burn by:
  - doing a single confirmatory test (single-tab),
  - then implementing one high-confidence change set,
  - then validating with a clear success criteria.
