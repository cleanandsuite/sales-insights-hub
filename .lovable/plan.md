

# Schedule CRM Enhancement Plan

## Overview

Four interconnected features that turn the Schedule tab into a complete call workflow: reminders that notify you before calls, outcome tracking after calls, recurring scheduling for regular check-ins, and automatic lead pipeline updates.

## Feature 1: In-App Call Reminders with Browser Notifications

**What it does:** Shows a toast notification and optional browser push alert when a scheduled call is approaching.

**How it works:**
- A new `useCallReminders` hook polls upcoming calls every 60 seconds
- When a call is within the configured reminder window (e.g. 15/30/60 min), it fires a toast and requests browser notification permission
- Tracks which calls have already been notified locally to avoid duplicates
- Mounted inside `Schedule.tsx` (and optionally `DashboardLayout.tsx` for app-wide alerts)

**Changes:**
- New file: `src/hooks/useCallReminders.ts`
- Modified: `src/pages/Schedule.tsx` -- mount the hook
- Modified: `src/components/layout/DashboardLayout.tsx` -- mount hook for app-wide reminders

## Feature 2: Call Outcome Tracking

**What it does:** After a scheduled call's time passes, prompts the user to log the outcome (Connected, Voicemail, No Show, Rescheduled, Cancelled). Based on the outcome, suggests a follow-up action.

**How it works:**
- Add `outcome` and `outcome_notes` columns to `scheduled_calls` table
- New `CallOutcomeDialog` component shows after selecting a past call with status still "scheduled"
- Selecting an outcome updates the call status and suggests next action (e.g., "Voicemail" suggests scheduling a retry in 2 days)
- The ScheduleDetailPanel shows outcome info for past calls

**Changes:**
- Database migration: add `outcome` (text, nullable) and `outcome_notes` (text, nullable) to `scheduled_calls`
- New file: `src/components/schedule/CallOutcomeDialog.tsx`
- Modified: `src/components/schedule/ScheduleDetailPanel.tsx` -- show outcome badge, prompt for outcome on past unresolved calls
- Modified: `src/pages/Schedule.tsx` -- trigger outcome dialog when selecting a past call without outcome

## Feature 3: Recurring Call Scheduling

**What it does:** When creating a call, users can set it to repeat (weekly, biweekly, monthly). The system creates the next occurrence automatically when the current one is completed.

**How it works:**
- Add `recurrence_rule` (text, nullable -- values: `weekly`, `biweekly`, `monthly`) and `recurrence_parent_id` (uuid, nullable) to `scheduled_calls`
- When a recurring call gets an outcome logged, auto-create the next occurrence with the same details shifted forward
- Show a small "Repeats weekly" badge on recurring calls in the list

**Changes:**
- Database migration: add `recurrence_rule` and `recurrence_parent_id` to `scheduled_calls`
- Modified: `src/pages/Schedule.tsx` -- add recurrence selector to the create dialog, auto-create next occurrence on outcome
- Modified: call list items -- show recurrence badge

## Feature 4: Pipeline Stage Sync with Leads

**What it does:** After logging a call outcome, offer to update the linked lead's pipeline stage. For example, "Connected" on a discovery call could move the lead from "new" to "contacted".

**How it works:**
- When a call outcome is logged and the call has a matching lead (by `contact_name`), show a suggestion to update the lead's `lead_status`
- Outcome-to-stage mapping: Connected -> "contacted", Proposal Discussed -> "proposal", No Show (3x) -> "lost"
- Single button in the outcome dialog: "Update lead to [stage]?" with accept/skip

**Changes:**
- Modified: `src/components/schedule/CallOutcomeDialog.tsx` -- add lead status suggestion after outcome selection
- Uses existing `leads` table `lead_status` column (no schema change needed)

---

## Technical Details

### Database Migration (single migration)

```sql
ALTER TABLE scheduled_calls
  ADD COLUMN IF NOT EXISTS outcome text,
  ADD COLUMN IF NOT EXISTS outcome_notes text,
  ADD COLUMN IF NOT EXISTS recurrence_rule text,
  ADD COLUMN IF NOT EXISTS recurrence_parent_id uuid REFERENCES scheduled_calls(id);
```

### New Files
1. `src/hooks/useCallReminders.ts` -- polling hook for upcoming call alerts
2. `src/components/schedule/CallOutcomeDialog.tsx` -- outcome logging + lead stage suggestion

### Modified Files
1. `src/pages/Schedule.tsx` -- recurrence in create dialog, outcome dialog trigger, reminder hook
2. `src/components/schedule/ScheduleDetailPanel.tsx` -- outcome display, past-call prompt
3. `src/components/layout/DashboardLayout.tsx` -- app-wide reminder hook mount

### Demo Mode
All four features will work with demo data -- mock outcomes, recurrence badges, and simulated reminder toasts for demo calls approaching within the hour.

