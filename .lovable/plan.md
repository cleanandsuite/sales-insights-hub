

# Making SellSig Feel Commercial-Grade

## The Diagnosis

The app has strong functionality but is missing the **trust signals, polish layers, and guided experience** that separate a prototype from a product customers pay $129+/mo for. Here's what's off:

### 1. No User Presence or Identity

The sidebar has zero indication of who's logged in -- no avatar, no name, no plan badge. Every commercial SaaS (HubSpot, Gong, Salesloft) anchors the user with their identity. Without it, the app feels anonymous and temporary.

### 2. No Onboarding / Setup Checklist

New users land on a dashboard with empty states that say "No calls yet" with a faded icon. Commercial apps show a **setup progress checklist** ("Complete your profile", "Make your first call", "Connect your calendar" -- 2/5 done). This gives direction and makes the product feel intentional.

### 3. Hardcoded Mock Data Leaking Through

The BentoGrid shows **"$2.1M" and "47 open deals"** as static strings. This immediately signals "demo" to any buyer. Real data or honest empty states -- never fake numbers mixed with real ones.

### 4. No Notification Center

No bell icon anywhere. Commercial products surface alerts (missed follow-ups, coaching nudges, deal risks) through a notification dropdown. This is table stakes for a paid tool.

### 5. No Plan/Usage Awareness

Users can't see what plan they're on, how many call minutes they've used, or when their billing cycle resets without digging into Settings. A subtle usage indicator in the sidebar creates urgency and shows value.

### 6. No Global Search / Keyboard Shortcuts

No command palette (Cmd+K). Commercial tools let power users search across leads, recordings, and deals from anywhere. Even just a hint ("Cmd+K") in the command bar signals sophistication.

### 7. No Help/Support Access Point

No persistent "?" button or support widget visible in the app shell. Users have to navigate to a separate Support page. A floating help button is standard for any paid SaaS.

---

## The Plan

### A. Sidebar: User Profile Card + Plan Badge
**File: `src/components/layout/Sidebar.tsx`**

Add a user profile section at the bottom of the sidebar (above Sign Out) showing:
- User avatar (initials fallback)
- Display name (truncated)
- Plan badge ("Pro", "Starter", "Enterprise") pulled from subscription status
- Subtle usage bar (call minutes used / total)

### B. Onboarding Checklist Widget
**New file: `src/components/dashboard/OnboardingChecklist.tsx`**

A dismissible card on the Dashboard that tracks setup progress:
- Profile completed (has full_name)
- First call made (call_recordings count > 0)
- Calendar connected (calendar_connections exists)
- First script generated (winwords_scripts count > 0)
- Coach style selected (ai_lead_settings exists)

Shows as a progress ring + checklist. Disappears once all 5 are done or user dismisses it (stored in localStorage).

**File: `src/pages/Dashboard.tsx`** -- Add the checklist between CommandBar and SpotlightCard.

### C. Remove Hardcoded Mock Data from BentoGrid
**File: `src/components/dashboard/BentoGrid.tsx`**

Replace the fake "$2.1M" pipeline widget with real data from the `deals` or `leads` table, or show a honest empty state ("No deals tracked yet") with a CTA to the deals page.

### D. Notification Bell in Command Bar
**New file: `src/components/dashboard/NotificationBell.tsx`**

A bell icon with unread count badge, dropdown showing:
- Overdue follow-ups (from leads.next_action_due)
- At-risk deals (from mock or real pipeline)
- Coaching nudges (unreviewed coaching sessions)

**File: `src/components/dashboard/CommandBar.tsx`** -- Add the bell between KPI pills and Start Call button.

### E. Global Search Hint
**File: `src/components/dashboard/CommandBar.tsx`**

Add a "Search..." pill with a keyboard shortcut hint (Cmd+K) that opens a command palette dialog for searching leads, recordings, and navigating pages.

**New file: `src/components/dashboard/GlobalSearch.tsx`** -- Command palette using the existing `cmdk` dependency (already installed).

### F. Floating Help Button
**File: `src/components/layout/DashboardLayout.tsx`**

Add a fixed-position "?" circle button (bottom-right) that links to the Support page or opens a quick-help popover with links to docs, support, and keyboard shortcuts.

### G. Plan Badge Component
**New file: `src/components/ui/PlanBadge.tsx`**

A small reusable badge that shows the user's current plan tier with appropriate color coding (Starter = blue, Pro = purple, Enterprise = gold).

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/components/layout/Sidebar.tsx` | Add user profile card with avatar, name, plan badge |
| `src/components/dashboard/CommandBar.tsx` | Add notification bell + global search hint |
| `src/components/dashboard/BentoGrid.tsx` | Replace hardcoded mock data with real queries or empty states |
| `src/components/layout/DashboardLayout.tsx` | Add floating help button |
| `src/pages/Dashboard.tsx` | Add onboarding checklist widget |
| `src/components/dashboard/OnboardingChecklist.tsx` | **New** -- setup progress checklist |
| `src/components/dashboard/NotificationBell.tsx` | **New** -- bell dropdown with alerts |
| `src/components/dashboard/GlobalSearch.tsx` | **New** -- Cmd+K command palette |
| `src/components/ui/PlanBadge.tsx` | **New** -- plan tier badge |

No database changes required -- all data sources already exist.

