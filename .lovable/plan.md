

# Make NotificationBell Interactive + Demo-Aware

## Problem

Clicking a notification navigates to the route but doesn't dismiss the notification from the list. The bell also doesn't show demo-mode notifications when demo mode is active.

## Changes

### File: `src/components/dashboard/NotificationBell.tsx`

1. **Dismiss on click**: When a notification is clicked, remove it from the `notifications` state array before navigating. Track dismissed IDs in a `Set` so they persist for the session.

2. **Demo mode support**: Import `useDemoMode` and show hardcoded Pinnacle Software notifications when `isDemoMode` is true (e.g., "2 overdue follow-ups", "New coaching insights available", "Lisa Park needs attention"). These are also dismissible.

3. **"Clear all" button**: Add a small "Clear all" link in the header that empties the notification list.

### Implementation Detail

```text
Click notification
  -> Add id to dismissedIds Set
  -> Filter notifications to exclude dismissed
  -> Close popover
  -> Navigate to route

Demo mode ON
  -> Skip Supabase queries
  -> Show 3 static Pinnacle Software notifications
  -> Still dismissible via same mechanism
```

Only one file is modified: `src/components/dashboard/NotificationBell.tsx`.
