

# Implement Cold Call Center Fixes

## Overview

Implement the 5 remaining features from the approved plan: auto-disposition, pre-call context banner, power dialer mode, voicemail drop, and local presence dialing.

---

## 1. Auto-Disposition

**Database migration**: Add `call_disposition` (text) and `disposition_confidence` (integer) columns to `call_recordings`.

**Edge function (`generate-call-summary/index.ts`)**: Add `call_disposition` and `disposition_confidence` to the AI prompt. After analysis, update `call_recordings` with the disposition. Dispositions: `connected_interested`, `connected_not_interested`, `voicemail`, `no_answer`, `gatekeeper`, `callback_requested`, `meeting_booked`, `wrong_number`.

**New component (`AutoDispositionBadge.tsx`)**: Shows the AI-classified disposition with confidence percentage after a call ends. Includes a dropdown to override the disposition with one click (updates `call_recordings` directly).

**CallInterface integration**: After call ends and `savedRecordingId` is available, show the `AutoDispositionBadge` in the post-call header area. When calling from imported leads, auto-update the lead's `lead_type` based on disposition (e.g., `meeting_booked` -> hot).

---

## 2. Pre-Call Context Banner

**New component (`PreCallBriefBanner.tsx`)**: A compact, collapsible banner showing lead context at the top of `CallInterface`: contact name, company, location, lead type badge, pain point, previous rep, notes. Auto-collapses when `callStatus === 'connected'`, expandable via click.

**Integration**: Add optional `leadContext` prop to `CallInterface`. Pass the full imported lead data from `Leads.tsx` when starting a call from the imported leads list.

---

## 3. Power Dialer Mode

**New component (`PowerDialerControls.tsx`)**: A control bar shown after a call ends when `onCallNextLead` is available. Features:
- Toggle to enable/disable auto-dial (saved to localStorage)
- Configurable delay: 3s, 5s, 10s, 15s
- Visual countdown timer
- Cancel button to stop the auto-dial
- Auto-triggers `onCallNextLead()` when countdown reaches 0

**CallInterface integration**: Render `PowerDialerControls` in the post-call area when `onCallNextLead` is available. Cancel countdown if user clicks any other button (View Analysis, Back to Dashboard, manual Call Next Lead).

---

## 4. Voicemail Drop

**New edge function (`telnyx-voicemail-drop/index.ts`)**: Authenticated function that accepts `call_control_id` and optionally `audio_url`. Uses the Telnyx Call Control API to play audio and then hang up. Falls back to a system default message if no custom audio is provided.

**Hook change (`useTelnyxCall.ts`)**: Add `dropVoicemail()` method that invokes the edge function with the current call's control ID, then hangs up locally.

**UI (`CallControls.tsx`)**: Add a "Drop VM" button (Voicemail icon) to the call controls. On click, shows a confirmation tooltip/popover: "Leave voicemail and hang up?" On confirm, calls `dropVoicemail()`.

**Config**: Add `[functions.telnyx-voicemail-drop] verify_jwt = false` to `supabase/config.toml`.

---

## 5. Local Presence Dialing

**Edge function (`telnyx-auth/index.ts`)**: When `action === 'get_caller_id'` and a `destination_number` is provided in the body, query `user_phone_lines` for all active lines for the user. If any line's area code matches the destination's area code, return that number as `caller_id`. Otherwise fall back to default.

**Hook change (`useTelnyxCall.ts`)**: Pass the destination phone number in the `get_caller_id` request body so the edge function can do area code matching.

---

## Technical Details

### Database Migration

```sql
ALTER TABLE call_recordings 
  ADD COLUMN IF NOT EXISTS call_disposition text,
  ADD COLUMN IF NOT EXISTS disposition_confidence integer;
```

### New Files
1. `src/components/calling/AutoDispositionBadge.tsx`
2. `src/components/calling/PreCallBriefBanner.tsx`
3. `src/components/calling/PowerDialerControls.tsx`
4. `supabase/functions/telnyx-voicemail-drop/index.ts`

### Modified Files
1. `supabase/functions/generate-call-summary/index.ts` -- add disposition fields to prompt and save to `call_recordings`
2. `src/components/calling/CallInterface.tsx` -- add `leadContext` prop, mount PreCallBriefBanner, AutoDispositionBadge, PowerDialerControls
3. `src/components/calling/CallControls.tsx` -- add "Drop VM" button
4. `src/hooks/useTelnyxCall.ts` -- add `dropVoicemail()`, pass destination to `get_caller_id`
5. `src/pages/Leads.tsx` -- pass full lead context to CallInterface
6. `supabase/functions/telnyx-auth/index.ts` -- local presence area code matching logic

