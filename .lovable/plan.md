

# Pre-Launch Audit: Issues You Will Hit Going Live

## CRITICAL (Will break things or cost you money)

### 1. Security: Privilege Escalation Vulnerability
Users can promote themselves to "manager" role by updating their own `profiles.user_role` column. The UPDATE policy on `profiles` has no column restrictions. Once promoted, they can read all team members' profiles including Stripe billing IDs. **This is exploitable day one.**

### 2. Security: Users Can Overwrite Their Own Subscription
The `user_subscriptions` UPDATE RLS policy lets any user set their `status` to `'active'` or modify `stripe_subscription_id` / `stripe_customer_id`. Someone can give themselves a free subscription by running a single update.

### 3. Security: Missing RLS on Sensitive Tables
- `team_leads_secure` — contains emails, phones, contact names with zero RLS policies
- `manager_team_stats` — exposes team performance data to any authenticated user

### 4. Edge Functions: `getClaims()` Does Not Exist
Five edge functions (`telnyx-auth`, `telnyx-voicemail-drop`, `telnyx-provision-number`, `telnyx-search-numbers`, `send-outbound-email`) call `supabase.auth.getClaims(token)` which is **not a real Supabase JS method**. These will throw runtime errors. Should be `supabase.auth.getUser(token)`.

### 5. Edge Functions: All JWT Verification Disabled
Every single edge function in `config.toml` has `verify_jwt = false`. While some (like `stripe-webhook`) need this, functions like `transcribe-audio`, `analyze-recording`, `deal-coach`, `winwords-generate`, `live-coach`, `live-summary`, and `send-outbound-email` should validate JWTs. Anyone can call them directly without authentication, burning your DeepSeek/AssemblyAI API credits.

---

## HIGH (Will cause user-facing problems)

### 6. Pricing Inconsistency
- `useSubscription.ts` shows Starter at $29 and Enterprise at $99
- Landing page (`CinematicPricing`) shows Starter at $79 and Pro at $250
- `create-trial-checkout` uses different price IDs than `useSubscription`
- Memory says Starter is $79 promo / $129 original — none of these match the code

### 7. Password Reset Redirect Hardcoded
`ForgotPasswordModal.tsx` hardcodes `redirectTo: 'https://sellsig.com/reset-password'`. If you deploy on `lovable.app` or any other domain first, password resets will redirect to the wrong URL.

### 8. Chrome Extension Targets Wrong Domains
`manifest.json` and `ExtensionInstallBanner.tsx` target `*.lovable.app` and `localhost` — not `sellsig.com`. The extension won't work on your production domain.

### 9. No `get-checkout-session` or `create-trial-checkout` in config.toml
These edge functions exist but aren't listed in `config.toml`, meaning they may not deploy or may have unexpected JWT behavior.

---

## MEDIUM (Will cause confusion or ops headaches)

### 10. `test-db` Edge Function Exposed
A debug/test function is deployed with `verify_jwt = false` — anyone can call it.

### 11. Experiment Assignments Leak User IDs
The `experiment_assignments` table has an anon policy with `USING (true)`, exposing authenticated user IDs to the public.

### 12. No Error Boundary
If any lazy-loaded page crashes, users see a white screen. No global `ErrorBoundary` component wraps the routes.

### 13. `robots.txt` Blocks Social Preview Bots
You block `FacebookBot`, `TwitterBot`, `LinkedInBot`, `Discordbot` — meaning link previews (OG images, titles) won't render when you share your URL on any social platform.

---

## Recommended Fix Order

1. **Lock down RLS** — fix privilege escalation, subscription self-update, missing policies
2. **Fix `getClaims` → `getUser`** in all 5 edge functions
3. **Re-enable JWT verification** on sensitive edge functions
4. **Align pricing** across landing page, hooks, and Stripe
5. **Add missing functions to config.toml** (`get-checkout-session`, `create-trial-checkout`, `enterprise-checkout`)
6. **Fix hardcoded domains** (password reset, extension manifest)
7. **Unblock social bots** in robots.txt
8. **Remove `test-db`** function
9. **Add ErrorBoundary** wrapper

