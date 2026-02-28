

# WinWords Appointment Setter + Script-to-Call + Auto-Scheduling

## Overview

Three interconnected enhancements: (1) replace Objection Handling with the Appointment Setter scenario using the Downsell and Close methodology, (2) let users cherry-pick script lines and transfer them into the live call interface as a reference panel with coaching pop-ups, and (3) automatically detect scheduling intent from call transcripts and prompt users to book follow-ups.

AI Freestyle is **not** a WinWords scenario -- it activates automatically when an inbound call is answered (covered in a separate inbound call plan).

---

## Part 1: Appointment Setter Scenario

### ScenarioSelector.tsx

Remove the `objection_handling` entry. Add `appointment_setter` in its place, positioned directly after `cold_call`:

**New order:**
1. Cold Call
2. Appointment Setter (NEW -- CalendarCheck icon, indigo/cyan color)
3. Discovery
4. Demo
5. Negotiation
6. Renewal

### Edge Function (winwords-generate/index.ts)

**Validation schema:** Change enum from `['cold_call', 'discovery', 'demo', 'negotiation', 'renewal', 'objection_handling']` to `['cold_call', 'appointment_setter', 'discovery', 'demo', 'negotiation', 'renewal']`.

**New scenario template:**
```text
appointment_setter:
  name: "Appointment Setter"
  sections: [intro_double_tap, pattern_interrupt, upfront_contract, 
             headline_pitch, downsell_and_close, schedule_meeting, 
             post_book_qualification]
  focus: "Use the Downsell and Close framework to book meetings at scale"
```

**System prompt injection** (conditional on `scenario === 'appointment_setter'`): The full Downsell and Close methodology as coaching context -- 7-step flow with delivery guidance (late-night FM DJ voice, double-tap name, intentional pauses, low/slow tonality). Each section in the JSON output includes `script_lines` (exact wording), `delivery_notes` (tonality/pacing tips), and `variations`.

### GeneratedScript.tsx

Add rendering for `delivery_notes` and `script_lines` fields. Delivery notes appear as subtle italic text with a microphone icon under each script section, giving the user performance coaching alongside the words.

---

## Part 2: Script Cherry-Pick and Transfer to Call Interface

### How it works

**In GeneratedScript.tsx -- Cherry-picking:**
- Each script variation, key point, and CTA line gets a checkbox next to it
- Users toggle lines on/off. A counter shows "7 lines selected"
- The "Use This Script" button saves selected lines to `localStorage` under key `active_script_lines` as `{ section, text, order }[]`
- Lines are grouped by section for easy reference during the call

**In CallInterface.tsx -- Script Reference Panel:**
- On mount, check `localStorage` for `active_script_lines`
- If present, switch from the current 2-column layout to a **3-column layout**:
  - Left: `ScriptReferencePanel` -- cherry-picked lines as a checklist
  - Center: Coaching pop-ups (top) + main area
  - Right: `LiveSummaryPanel`
- If no script is active, keep the existing 2-column layout unchanged

**ScriptReferencePanel (new component):**
- Scrollable checklist grouped by section name
- Users tap lines to check them off (strikethrough + green check) as they deliver them
- Progress bar at top: "3 of 7 lines delivered"
- "Clear Script" button to dismiss and revert to 2-column layout
- Lines are read-only during the call (no re-ordering)

**CoachingPopup (new component):**
- When a script is active, AI coaching signals render as auto-dismissing slide-down banners at the top of the center column instead of the sidebar
- Each banner auto-dismisses after 5-8 seconds based on urgency
- Max 2 banners visible at once; newest pushes older ones
- Users can pin a suggestion (keeps it visible) or dismiss early
- The coaching analysis logic stays the same (`LiveCoachingSidebar` logic) -- just the rendering changes
- When no script is active, the existing `LiveCoachingSidebar` component is used as-is

---

## Part 3: Auto-Scheduling from Transcription

### How it works

The existing `generate-call-summary` edge function already runs post-call and extracts `next_steps`. We extend it to also detect scheduling intent.

**Edge function change (generate-call-summary/index.ts):**
- Add to the AI prompt: "If a follow-up meeting was discussed, extract `scheduling_intent: { date, time, contact_name, meeting_type, raw_phrase }` from the transcript"
- Store the result in a new `scheduling_intent` JSONB column on `call_summaries`

**Database migration:**
- Add `scheduling_intent` (jsonb, nullable) to `call_summaries`

**Frontend -- post-call prompt:**
- In `RecordingAnalysis.tsx` (which loads `call_summaries`): if `scheduling_intent` is present and non-null, show a toast/banner: "AI detected a follow-up: [date] with [contact]. Schedule it?"
- Clicking the toast opens the `ScheduleConfirmModal` pre-filled with the extracted data
- User confirms or dismisses -- no ghost meetings

**Per-section scoring:**
- Add a `section_scores` field to the WinWords JSON output for appointment setter scripts
- Each section gets a 1-5 score based on how well it follows the methodology
- Displayed as small star ratings or score badges on each section header in GeneratedScript

---

## Technical Details

### Database Migration

```sql
ALTER TABLE call_summaries 
  ADD COLUMN IF NOT EXISTS scheduling_intent jsonb;
```

### New Files
1. `src/components/calling/ScriptReferencePanel.tsx` -- checklist panel for cherry-picked script lines during calls
2. `src/components/calling/CoachingPopup.tsx` -- auto-dismissing coaching banner component for script-active calls

### Modified Files
1. `src/components/winwords/ScenarioSelector.tsx` -- remove Objection Handling, add Appointment Setter, reorder
2. `supabase/functions/winwords-generate/index.ts` -- update enum, add template, inject Downsell and Close methodology prompt, add delivery_notes to output schema
3. `src/components/winwords/GeneratedScript.tsx` -- add checkboxes for cherry-picking lines, render delivery_notes, store selected lines to localStorage
4. `src/pages/WinWords.tsx` -- update scenario type references (objection_handling to appointment_setter)
5. `src/components/calling/CallInterface.tsx` -- detect active script, render 3-column layout with ScriptReferencePanel + CoachingPopup
6. `supabase/functions/generate-call-summary/index.ts` -- add scheduling_intent extraction to AI prompt
7. `src/pages/RecordingAnalysis.tsx` -- show auto-schedule prompt when scheduling_intent detected

### Scenario Grid (Final Order)
1. Cold Call
2. Appointment Setter (Downsell and Close)
3. Discovery
4. Demo
5. Negotiation
6. Renewal

### Call Interface Layout (with active script)

```text
+------------------+-------------------------+------------------+
| Script Reference | Coaching Pop-ups (top)  | Live Summary     |
| (checklist)      | [auto-dismiss banners]  |                  |
|                  |                         |                  |
| [ ] Line 1      | (empty when no popups)  |                  |
| [x] Line 2      |                         |                  |
| [ ] Line 3      |                         |                  |
|                  |                         |                  |
| Progress: 1/3   |                         |                  |
+------------------+-------------------------+------------------+
```

Without active script: existing 2-column layout (LiveCoachingSidebar + LiveSummaryPanel) is unchanged.

