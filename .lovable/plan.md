

# Unified Demo Mode: Admin-Only Global Toggle in Settings > Profile

## Overview

Create a single global demo mode toggle, visible only to admins, in Settings > Profile. This toggle controls demo data across ALL pages simultaneously. Before enabling demo mode, we'll also need to clear any existing test data so you see clean, consistent "Pinnacle Software" mock data throughout.

## Architecture

### 1. Database: Add `demo_mode_enabled` to profiles table

Add a `demo_mode_enabled` boolean column (default `false`) to the `profiles` table. This persists the toggle state across sessions and devices.

### 2. New Hook: `src/hooks/useDemoMode.ts`

A centralized hook that:
- Reads `demo_mode_enabled` from the user's profile
- Checks admin role via `useAdminRole()`
- Returns `{ isDemoMode, isAdmin, toggleDemoMode, loading }`
- `toggleDemoMode()` updates the database column
- Non-admins always get `isDemoMode = false`

### 3. Centralized Demo Data: `src/data/demoData.ts`

Single file containing all mock data themed around "Pinnacle Software" (mid-market B2B SaaS):
- `demoLeads` -- 6 leads at various stages
- `demoScheduledCalls` -- 5 scheduled calls (reuse existing DEMO_SCHEDULED_CALLS pattern)
- `demoRecordings` -- 8 call recordings with scores, summaries, topics
- `demoKPIs` -- dashboard metrics
- `demoDeals` -- pipeline deals (refactored from existing mockDeals)
- `demoCallActivities` -- activity feed entries
- `demoCoachingData` -- skills, recommendations
- `demoTeamPulse` -- enterprise rep activity

### 4. Demo Toggle in ProfileTab (Admin-Only)

**File: `src/components/settings/ProfileTab.tsx`**

Add a new card at the TOP of the profile page (before the profile incomplete banner), gated behind `isAdmin`:
- Title: "Demo Mode (Admin Only)"
- Description: "Load sample data across all tools for testing and demos"
- A single Switch toggle
- Warning text: "This replaces all data views with Pinnacle Software sample data"

### 5. Remove Per-Page Demo Toggles

**File: `src/pages/Leads.tsx`**
- Remove the local `demoMode` state and `handleToggleDemo`
- Remove the demo toggle Switch from the header
- Remove the "Demo Mode Active" banner
- Import `useDemoMode()` and use `isDemoMode` to conditionally show demo data

**File: `src/pages/Schedule.tsx`**
- Remove local `demoMode` state
- Remove the demo toggle from the UI
- Import `useDemoMode()` and use `isDemoMode`

### 6. Wire Demo Mode Into All Pages

Each page imports `useDemoMode()` and conditionally renders demo data:

| Page | Real Data Source | Demo Data Source |
|------|-----------------|-----------------|
| Dashboard | Supabase queries | `demoKPIs` |
| Leads | `leads` table | `demoLeads` |
| Schedule | `scheduled_calls` table | `demoScheduledCalls` |
| Recordings | `call_recordings` table | `demoRecordings` |
| Analytics | `useAnalyticsV2` | `demoAnalyticsData` |
| Coaching | Supabase queries | `demoCoachingData` |
| Enterprise | `mockDeals` (current) | `demoDeals` from unified source |
| Activity Feed | `call_recordings` | `demoCallActivities` |

### 7. Data Cleanup

Before filling in demo data, we'll clear existing test records from your account. This is a one-time operation using the backend -- deleting rows from `call_recordings`, `leads`, `scheduled_calls`, `coaching_sessions`, etc. for your user. This ensures you see only the clean Pinnacle Software data when demo mode is on, and a fresh empty state when it's off.

---

## Technical Summary

| Action | File |
|--------|------|
| **Migrate** | Add `demo_mode_enabled` boolean to `profiles` table |
| **Create** | `src/hooks/useDemoMode.ts` |
| **Create** | `src/data/demoData.ts` |
| **Modify** | `src/components/settings/ProfileTab.tsx` -- add admin-only toggle card |
| **Modify** | `src/pages/Leads.tsx` -- remove local toggle, use global hook |
| **Modify** | `src/pages/Schedule.tsx` -- remove local toggle, use global hook |
| **Modify** | `src/pages/Dashboard.tsx` -- inject demo KPIs when active |
| **Modify** | `src/pages/Recordings.tsx` -- show demo recordings when active |
| **Modify** | `src/pages/Analytics.tsx` -- feed demo chart data when active |
| **Modify** | `src/pages/Coaching.tsx` -- use demo coaching data when active |
| **Modify** | `src/pages/Enterprise.tsx` -- unify mock data source |
| **Modify** | `src/components/dashboard/ActivityFeed.tsx` -- demo feed |
| **Modify** | `src/components/dashboard/SpotlightCard.tsx` -- demo nudges |
| **Modify** | `src/components/dashboard/OnboardingChecklist.tsx` -- hide in demo |
| **Clean** | Delete existing test data from your account via backend query |

No new tables needed -- just one column addition to `profiles`.
