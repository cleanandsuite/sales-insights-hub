

## Problem

The CTA buttons work correctly — the edge function returns a valid Stripe checkout URL (confirmed by network logs showing a 200 response). However, **the redirect to Stripe doesn't visually work** because `window.location.href` inside the Lovable preview iframe may be blocked or sandboxed, causing a blank result.

This should work fine on the published/production site. But to also handle the preview environment gracefully, we should use `window.open()` as a fallback.

## Plan

### 1. Update redirect logic in `src/pages/Landing.tsx`
- Change `window.location.href = data.url` to use `window.open(data.url, '_blank')` with a fallback to `window.location.href`
- This ensures the Stripe checkout opens in a new tab (works in iframe sandboxes) while falling back to same-tab redirect on production
- Reset `checkoutLoading` after opening the new tab

### 2. Update redirect logic in `src/pages/CostOfLunch.tsx`
- Apply the same `window.open` pattern for the `/lunch` campaign page checkout flow

### Technical detail
```typescript
// Instead of: window.location.href = data.url
const newWindow = window.open(data.url, '_blank');
if (!newWindow) {
  window.location.href = data.url; // fallback if popup blocked
}
setCheckoutLoading(false);
```

This is a minimal 2-file change that ensures checkout works in both the preview and production environments.

