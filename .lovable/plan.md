

# Errors and Inconsistencies Found

After auditing the codebase, here are the issues discovered, grouped by severity.

---

## Critical Issues

### 1. Account status polling every 60 seconds — unnecessary network load
The `useAccountStatus` hook polls `profiles` every 60 seconds for every logged-in user. The network logs confirm this — dozens of identical GET requests to `/profiles?select=is_active,subscription_status`. This is wasteful and creates noise. It should either be event-driven or poll far less frequently (e.g. 10 minutes).

### 2. Enterprise pricing inconsistency across surfaces
Three different places show Enterprise plan details with conflicting information:
- **Landing page** (`CinematicPricing.tsx`): Enterprise = "Custom" pricing, "Talk to Sales"
- **Billing tab** (`BillingTab.tsx`): Enterprise = `$250/mo`, "Pro" label, with checkout flow
- **Upgrade page** (`UpgradePlan.tsx`): Enterprise = no price, "Schedule a Call" mailto

The Billing tab still shows a `$250` Pro plan with a checkout button, while the Upgrade page and landing page say "Custom / Schedule a Call." These need to be aligned.

### 3. BillingTab Enterprise card has a no-op `onSelect`
Line 174 of `BillingTab.tsx`: `onSelect={() => {}}` — the Enterprise pricing card does nothing when clicked. If it's not coming soon, it should open the mailto or schedule-a-call flow. If it is coming soon, the `comingSoon` flag isn't set in `PRICING_TIERS`.

---

## Moderate Issues

### 4. `PRICING_TIERS` uses key "enterprise" but subscription plan is "team"
The `useSubscription` hook stores `plan: 'single_user' | 'team'`, but `PRICING_TIERS` uses the key `enterprise`. The `BillingTab` maps between them, but `startCheckout` expects `'single_user' | 'team'` while `BillingTab` passes `'enterprise'` then remaps. This is fragile and confusing.

### 5. Enterprise page uses 100% mock data
`Enterprise.tsx` line 47: `const [deals, setDeals] = useState<Deal[]>(mockDeals)` and line 75-85 has hardcoded organization data ("Acme Corporation"). The entire page is non-functional for real users.

### 6. `next-themes` is installed but may not be properly configured
`next-themes` is designed for Next.js. It's imported in `App.tsx` (ThemeProvider), `Settings.tsx` (useTheme), and `sonner.tsx`. While the package _can_ work in Vite apps, it requires the provider to be correctly configured. Currently `App.tsx` wraps with `<ThemeProvider>` but doesn't pass `attribute`, `defaultTheme`, or `storageKey` props — which means theme toggling may silently fail.

---

## Minor Issues

### 7. Landing page "Enterprise" CTA calls `onStartTrialClick` instead of mailto
In `CinematicPricing.tsx`, the Enterprise tier has `cta: 'Talk to Sales'` but the click handler likely routes to the same trial checkout function. Need to verify it opens a mailto or Calendly link instead.

### 8. `BillingTab` shows "Cancel Membership" button even for unsubscribed users
Line 204-213: The cancel membership button is always visible, even when `subscribed` is false. It should be conditionally rendered.

### 9. Unused imports in several files
Minor cleanup: `Users`, `Download`, `MessageSquare`, `User` etc. are imported but not always used in `CallInterface.tsx`.

---

## Recommended Fix Plan

| # | Fix | File(s) |
|---|-----|---------|
| 1 | Reduce account status polling to 10 min | `useAccountStatus.ts` |
| 2 | Align Enterprise pricing: remove price from BillingTab, point to "Schedule a Call" mailto | `BillingTab.tsx`, `useSubscription.ts` |
| 3 | Wire Enterprise card `onSelect` to mailto | `BillingTab.tsx` |
| 4 | Rename PRICING_TIERS key from "enterprise" to "team" for consistency | `useSubscription.ts`, `BillingTab.tsx` |
| 5 | Add `attribute="class"` and `defaultTheme="dark"` to ThemeProvider | `App.tsx` |
| 6 | Hide "Cancel Membership" when not subscribed | `BillingTab.tsx` |
| 7 | Verify Enterprise CTA on landing page opens mailto, not checkout | `CinematicPricing.tsx` |

