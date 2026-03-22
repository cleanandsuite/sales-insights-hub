

# Cost of Lunch Campaign — $10.99 First Month

## What We're Building

A promotional campaign where new users get the full Starter plan for $10.99 for their first month (instead of $79), then auto-renews at $79/mo. This is a "for the price of lunch, test our service" outreach play.

## Technical Approach

### 1. Create a Stripe Coupon
- **Amount off**: $68.01 (so $79.00 - $68.01 = $10.99)
- **Duration**: `once` (first month only)
- **Name**: "Cost of Lunch — $10.99 First Month"

### 2. Update the `create-trial-checkout` Edge Function
- Accept a new optional `coupon` parameter in the request body
- When `coupon` is provided, attach it to the Stripe checkout session via `discounts: [{ coupon: couponId }]`
- Remove the 14-day trial for promo checkouts (the $10.99 price IS the trial — no free period needed)
- Keep the existing non-promo flow unchanged

### 3. Create a Campaign Landing Page (`/lunch`)
A focused, single-purpose page with:
- **Headline**: "For the price of lunch, test your next sales weapon."
- **Price callout**: "$10.99 for your first month" with strikethrough of $79
- **Full Starter features list** (same as pricing section)
- **Single CTA**: "Try It for $10.99" button that calls `create-trial-checkout` with `plan: 'single_user'` and `coupon: <coupon_id>`
- **Fine print**: "Then $79/mo. Cancel anytime. No contracts."
- Matches the existing cinematic dark theme

### 4. Add Route in App.tsx
- Public route: `/lunch` → new `CostOfLunch` page (no auth guard)

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/create-trial-checkout/index.ts` | Accept `coupon` param, conditionally apply discount and skip trial |
| `src/pages/CostOfLunch.tsx` | New campaign landing page |
| `src/App.tsx` | Add `/lunch` route |

## Flow

```text
User clicks campaign link → /lunch page
  → Clicks "Try It for $10.99"
  → Edge function creates Stripe Checkout with coupon applied
  → User pays $10.99 (card captured)
  → Redirects to /payment-complete
  → Creates account → /setup-phone → /dashboard
  → Month 2+: auto-billed at $79/mo
```

