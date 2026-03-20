

# Full Journey Audit: Landing → Stripe → Account → Phone → Dashboard

## Critical Disconnects Found

### 1. Stripe Payment Links vs Checkout Sessions Mismatch
The landing page CTAs use **Stripe Payment Links** (`https://buy.stripe.com/...`) which open in a new tab. But the `PaymentComplete` page expects a **Checkout Session ID** (`?session_id=...`) to look up the buyer's email via the `get-checkout-session` edge function.

**Problem:** Stripe Payment Links have their success URL configured **in the Stripe Dashboard**, not in code. Unless you've manually configured them to redirect to `https://sellsig.com/payment-complete?session_id={CHECKOUT_SESSION_ID}`, the user will never reach the `/payment-complete` page — or will arrive without a `session_id`, so the email lookup fails and the magic link is never sent.

**Fix:** Replace Stripe Payment Links with the existing `create-trial-checkout` edge function. This function creates a proper Checkout Session with the correct `success_url` pointing to `/payment-complete?session_id={CHECKOUT_SESSION_ID}`. The landing page should call this function (unauthenticated) instead of opening payment links.

### 2. `create-trial-checkout` Is Never Used
The edge function exists and correctly redirects to `/payment-complete`, but **nothing in the frontend calls it**. The `Landing.tsx` handler just opens a Payment Link URL.

**Fix:** Wire up the landing page CTAs to invoke `create-trial-checkout` and redirect to the returned URL (same tab, not `_blank`).

### 3. Signup on PaymentComplete Skips Email Verification
After payment, the user creates an account via `supabase.auth.signUp()`. Since auto-confirm is disabled, the user must verify their email before they can authenticate. But the code immediately navigates to `/dashboard` on success — which is behind `ProtectedRoute` and will bounce the unverified user to `/auth`.

**Fix:** After `signUp`, show a "Check your email to verify" message instead of navigating. The magic link / OTP flow already handles this correctly — the password signup path needs the same treatment.

### 4. Magic Link Redirects to Dashboard, Skips Phone Setup
The magic link's `emailRedirectTo` is set to `/dashboard?subscription=success` — it should go to `/setup-phone` so users complete phone provisioning first.

**Fix:** Change `emailRedirectTo` to `${origin}/setup-phone`.

### 5. Pricing Says "No credit card required" but Card Is Required
`create-trial-checkout` sets `payment_method_collection: 'always'`, and the Stripe Payment Links also require payment info. The pricing section text "14-day free trial on all plans. No credit card required." is misleading.

**Fix:** Change copy to "14-day free trial. Cancel anytime." or remove the "no credit card" claim.

### 6. Payment Link Opens in New Tab — Broken UX
`window.open(..., '_blank')` opens Stripe in a new tab. After payment, the success redirect happens in that tab. The original landing page tab stays open, creating confusion.

**Fix:** Use `window.location.href` (same tab) for the checkout redirect.

---

## Implementation Plan

### Step 1: Replace Payment Links with `create-trial-checkout` calls
- In `Landing.tsx`, change `handleStartTrialClick` to call `supabase.functions.invoke('create-trial-checkout', { body: { plan: 'single_user' } })` and redirect via `window.location.href = data.url`
- In `CinematicPricing.tsx`, replace `window.open(PAYMENT_LINKS.starter/pro, '_blank')` with calls to `create-trial-checkout` with the appropriate plan parameter
- Remove the `PAYMENT_LINKS` constant

### Step 2: Fix post-signup redirect on PaymentComplete
- After `supabase.auth.signUp()` succeeds, show "Check your email to verify your account" instead of navigating to `/dashboard`
- Change all `emailRedirectTo` URLs from `/dashboard?...` to `/setup-phone`

### Step 3: Fix misleading pricing copy
- Change "No credit card required" to "Cancel anytime" in `CinematicPricing.tsx`

### Step 4: Fix redirect to same tab
- Already handled by Step 1 (using `window.location.href` instead of `window.open`)

---

## Files to Edit

| File | Change |
|------|--------|
| `src/pages/Landing.tsx` | Replace `window.open` with `create-trial-checkout` edge function call |
| `src/components/landing/CinematicPricing.tsx` | Replace Payment Links with edge function calls; fix "no credit card" copy |
| `src/components/landing/CinematicNavbar.tsx` | Update `onStartTrialClick` callback pattern |
| `src/components/landing/CinematicHero.tsx` | Same pattern update |
| `src/components/landing/CinematicFinalCTA.tsx` | Same pattern update |
| `src/pages/PaymentComplete.tsx` | Fix post-signup to show email verification message; change `emailRedirectTo` to `/setup-phone` |

