
# Email Integration for Schedule Tab

## Overview

Add three email capabilities to the Schedule tab: AI-generated email drafts for scheduled calls, "Open in Email Client" buttons (mailto: links), and automated email reminders before calls.

## Changes

### 1. Add Email Actions to Call Cards

On each scheduled call card in the right sidebar, add two new buttons:
- **"Email" button** -- Opens a dialog to generate an AI follow-up/prep email for that specific call using the existing `schedule-assistant` edge function's `generate-email` action
- **"Open in Gmail/Outlook" button** -- Constructs a `mailto:` link pre-filled with the contact email, AI-generated subject/body, and opens the user's default email client

### 2. New Component: `ScheduleEmailDialog`

A dialog that:
- Accepts a `ScheduledCall` object
- Calls the `schedule-assistant` edge function to generate an AI email draft based on the call's context (contact name, title, prep notes, and optionally a linked recording)
- Displays the generated subject and body in editable fields
- Provides a "Copy to Clipboard" button
- Provides an "Open in Email Client" button that constructs a `mailto:` link with the draft content
- Allows custom prompt input for tone/content adjustments and regeneration

### 3. New Edge Function Action: `generate-call-email`

Add a new action to the existing `schedule-assistant` edge function that generates emails for scheduled calls (not just recordings). This action:
- Accepts `{ action: "generate-call-email", callId: string, customPrompt?: string }`
- Fetches the scheduled call details (title, contact, date, prep notes)
- Optionally fetches associated recording transcript if one exists
- Generates a professional email draft using AI
- Returns `{ subject, body, tone }`

### 4. Email Reminder System

**Database:**
- Add `reminder_sent` boolean column to `scheduled_calls` table (default false)
- Add `reminder_minutes_before` integer column (default 30)

**New Edge Function: `send-schedule-reminders`**
- Queries `scheduled_calls` where `status = 'scheduled'`, `reminder_sent = false`, and `scheduled_at` is within the next N minutes
- For each match, generates a brief AI prep email with call context
- Uses Resend (already configured with `RESEND_API_KEY` secret) to send the reminder to the user's email
- Marks `reminder_sent = true`

**Cron Job:**
- Set up a `pg_cron` schedule to invoke `send-schedule-reminders` every 5 minutes

**UI:**
- Add a reminder toggle and time selector to the "Schedule a Call" dialog and to call cards

### 5. Schedule Page UI Updates

- Add a "Send Email" icon button to each call card alongside existing "Start Recording" and notes buttons
- When a call has `contact_email`, show a quick "mailto:" icon for one-click email
- Add reminder status indicator (bell icon) on call cards showing if reminder is set

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/schedule/ScheduleEmailDialog.tsx` | New -- AI email draft dialog |
| `src/pages/Schedule.tsx` | Modify -- add email buttons to call cards, reminder toggle |
| `supabase/functions/schedule-assistant/index.ts` | Modify -- add `generate-call-email` action |
| `supabase/functions/send-schedule-reminders/index.ts` | New -- cron-triggered reminder sender |
| `supabase/migrations/` (new) | Add `reminder_sent` and `reminder_minutes_before` columns to `scheduled_calls` |
| `src/hooks/useScheduleAssistant.ts` | Modify -- add `generateCallEmail` method |

## Technical Details

### mailto: Link Construction
```text
mailto:{contact_email}?subject={encodeURIComponent(subject)}&body={encodeURIComponent(body)}
```

### Reminder Edge Function
- Uses existing `RESEND_API_KEY` secret for email delivery
- Queries upcoming calls within configurable window
- Includes call title, contact info, prep notes, and time in the reminder
- Rate-limited to prevent duplicate sends via the `reminder_sent` flag

### AI Email Generation for Calls
The new `generate-call-email` action differs from the existing `generate-email` (which requires a recording). This one works from scheduled call metadata alone, making it useful for pre-call outreach emails, meeting confirmations, and agenda sharing.
