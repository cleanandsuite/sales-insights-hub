

# Ultimate Cold Caller AI Brain

## Overview

Add a new "Ultimate Cold Caller" AI brain that integrates into two places: (1) the WinWords cold call script generation system prompt, and (2) the live coaching engine as a new coach style selectable in Settings > AI. The brain encodes a complete cold-call training methodology (Micah's tips, DOS opener, Hormozi trust gap, Andy Elliot's 3 Yeses, Sudbury gatekeeper scripts, high-sensory language, etc.).

This plan focuses on integrating the brain into the existing architecture rather than building an entirely separate app, since the platform already has live coaching, script generation, call simulation, analytics, and gamification infrastructure.

---

## 1. New Coach Style: "Ultimate Cold Caller"

**Edge function (`live-coach/index.ts`)**: Add a new entry `ultimate_cold_caller` to the `COACH_PROMPTS` map with the full cold-call training archive as the system prompt. This brain covers:

- Micah's 6 tips (novel language, low/slow tonality, clear enunciation, upfront contracts, strategic pauses, transition statements, pullback booking)
- DOS opener methodology
- High-sensory language library (wheelhouse, salt mines, bags of money, bananas)
- Hormozi's trust gap + give-away-the-farm value stacking
- Andy Elliot's 3 Yeses framework
- Sudbury's gatekeeper bypass scripts
- Frame control and belief transfer techniques
- Phase detection (Opener / Pitch / Objection / Close) with probability scoring
- Tonality cues (low & slow, pause here, slight smile voice)
- Natural filler injection (ums/ahs for authenticity)

The prompt will instruct the AI to return suggestions with:
- Exact next line with natural flow markers
- Tonality cue
- Current call phase + progress
- Probability of continuing the call (green 70%+)
- High-sensory language options when appropriate

**Coach style selector (`CoachStyleSelector.tsx`)**: Add "Ultimate Cold Caller" as a new style option with id `ultimate_cold_caller`, lion emoji, and traits like "Full Archive", "Phase Detection", "Tonality Cues".

**Hook (`useLiveCoaching.ts`)**: Add `ultimate_cold_caller` to the `CoachStyle` type union.

---

## 2. WinWords Cold Call Script Enhancement

**Edge function (`winwords-generate/index.ts`)**: When `scenario === 'cold_call'`, inject the Ultimate Cold Caller methodology into the system prompt (similar to how `appointment_setter` already has a dedicated methodology injection). This includes:

- DOS opener variations
- 3 Yeses flow integration
- Gatekeeper bypass scripts
- Voicemail competitor drop scripts
- High-sensory language requirements
- Tonality/delivery coaching per section
- Phase scoring (like appointment setter's `section_scores`)
- Success probability estimate per section

---

## 3. Settings > AI Section

**Settings page (`Settings.tsx`)**: Add a new card in the AI tab below the Live AI Coaching section titled "AI Brains" that shows the Ultimate Cold Caller brain as a selectable preset. When selected, it sets the coach style to `ultimate_cold_caller` and enables live coaching automatically.

The card will show:
- Brain name: "Ultimate Cold Caller"
- Description: Complete cold-call training archive with real-time phase detection, tonality cues, and probability scoring
- Base booking rate: 30-45%
- Methodologies included (listed as badges)
- "Activate" button that sets coach style + enables coaching

---

## Technical Details

### Modified Files

1. **`supabase/functions/live-coach/index.ts`** -- Add `ultimate_cold_caller` system prompt (~2000 chars) to `COACH_PROMPTS` map
2. **`supabase/functions/winwords-generate/index.ts`** -- Add cold call methodology injection block (similar to `appointmentSetterContext`) for `scenario === 'cold_call'`
3. **`src/hooks/useLiveCoaching.ts`** -- Add `'ultimate_cold_caller'` to `CoachStyle` type
4. **`src/components/settings/CoachStyleSelector.tsx`** -- Add Ultimate Cold Caller to `COACH_STYLES` array
5. **`src/pages/Settings.tsx`** -- Add "AI Brains" card in the AI tab

### No Database Changes Required

The existing `ai_lead_settings.live_coach_style` column is a text field and already supports any string value -- no migration needed.

### Coach Style Entry

```text
id: "ultimate_cold_caller"
name: "Ultimate Cold Caller"
icon: lion emoji
description: "Complete cold-call training archive. Real-time phase detection, tonality cues, high-sensory language, and probability scoring. 30-45% booking rate methodology."
traits: ["Full Archive", "Phase Detection", "Tonality Cues", "30-45% Book Rate"]
color: border-red-500 bg-red-500/10
```

### Live Coach System Prompt (Summary)

The `ultimate_cold_caller` prompt will encode:
- Phase detection (Opener -> Value Prop -> Discovery -> Objection -> Close)
- Per-phase scoring and probability
- Exact-line suggestions with natural fillers
- Tonality cues per suggestion
- High-sensory language options
- Methodology tags (DOS, 3 Yeses, Hormozi, Sudbury, etc.)
- Response format adds `phase`, `probability`, `tonality_cue`, and `sensory_options` fields

### WinWords Cold Call Injection

Similar to the existing `appointmentSetterContext` block, a `coldCallContext` variable will inject the methodology when `scenario === 'cold_call'`, adding:
- DOS opener variations requirement
- 3 Yeses framework integration
- Gatekeeper bypass section
- Voicemail drop script section
- High-sensory language requirements
- Delivery/tonality coaching per section
- Section-level success probability scores

