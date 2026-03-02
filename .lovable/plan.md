

# Update Coach Style Access by Subscription Tier

## Overview

Make the Coach Style selector visible to **all** users (Starter, Pro, Enterprise) but only allow selection for Pro and Enterprise plans. Starter users will see all styles but default to "Balanced Coach" with styles locked and a clear upgrade prompt.

## Current Behavior

- The entire `CoachStyleSelector` component is hidden (`return null`) unless the user is an Admin or Enterprise user.
- Non-premium users who somehow see it get a toast saying "Team plan required" when trying to select a non-neutral style.

## New Behavior

- **Starter plan**: Sees all 6 coach styles displayed, but only "Balanced Coach" is selectable. Other styles show a lock icon and "Pro Plan" badge. Clicking a locked style shows upgrade toast. The Live AI Coaching toggle is also locked.
- **Pro plan**: Full access to all coach styles and live coaching toggle.
- **Enterprise plan**: Full access (unchanged).
- **Admin**: Full access (unchanged).

## Technical Changes

### 1. Remove visibility gate in `CoachStyleSelector` (lines 178-183)

Remove the `canAccess` check that returns `null`. The component should always render for authenticated users.

### 2. Update subscription check logic (lines 105-120)

Track the actual plan name (not just a boolean) so we can distinguish Starter vs Pro vs Enterprise:

```text
// Track plan tier instead of just isPremium boolean
const [userPlan, setUserPlan] = useState<string | null>(null);

// In checkSubscription:
setUserPlan(data?.plan || null);  // 'single_user', 'team', or null

// Access logic:
const isPro = userPlan === 'team' || isEnterprise;
const canAccessCoachStyles = isPro || isAdmin || isEnterprise;
```

### 3. Update style locking logic (lines 122-129, 210-240)

Change the lock condition from `!canAccessFeatures && style.id !== "neutral"` to use the new `canAccessCoachStyles` flag. Locked styles show:
- A lock icon
- "Pro Plan" badge (instead of "Team Plan")
- Reduced opacity

### 4. Update toast messages (lines 124-128, 136-139)

Change "Team plan" references to "Pro plan" with updated pricing:
- "Coach styles require Pro plan ($250/mo)"
- "Live AI coaching requires Pro plan ($250/mo)"

### 5. Update premium CTA card (bottom of component)

Change upgrade text from "Enterprise" to "Pro" for Starter users, with correct pricing.

### File Modified

- `src/components/settings/CoachStyleSelector.tsx` -- All changes are in this single file.

