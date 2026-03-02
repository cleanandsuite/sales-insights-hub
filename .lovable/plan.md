

# Animated Hero: Living Waveform + AI Coaching Signal Popups

## Overview
Two enhancements to the hero section: (1) animate the static waveform bars into a breathing audio signal, and (2) add floating AI coaching popups that appear at random positions around the waveform area, simulating real-time coaching intelligence.

## What It Will Look Like
The right side of the hero will feel alive -- waveform bars pulsing like a live call is happening, while coaching bubbles pop in at random spots with messages like "Objection detected -- pivot to ROI" or "Buyer showing interest -- ask for the close now." Each bubble fades in, holds for 4-5 seconds, then fades out. The next one appears at a different location. Only 1 bubble visible at a time to keep it clean.

## Changes

### 1. Animate the Waveform Bars (`CinematicHero.tsx`)
- Replace `Math.random()` with deterministic sine-wave heights via `useMemo`
- Apply CSS `cin-waveform` animation to each bar with staggered delay/duration
- Increase to ~80 bars for a denser signal look

### 2. Add CSS Keyframes (`src/index.css`)
- `@keyframes cin-waveform` -- scaleY oscillation (0.3 to 1.0) for bars
- `@keyframes cin-coach-pop` -- scale + fade entrance for coaching bubbles

### 3. Add Floating Coaching Popups (`CinematicHero.tsx`)
A self-contained coaching demo loop built directly into the hero:

**Sample coaching signals (rotating):**
- (red/high) "Objection detected -- use the empathy close"
- (teal/medium) "Buyer mentioned budget timeline -- pivot to ROI"
- (teal/medium) "Positive sentiment shift -- ask for the close now"
- (amber/high) "Losing attention -- pause and re-engage with a question"
- (green/low) "Decision-maker confirmed -- transition to proposal"
- (red/high) "Competitor mentioned -- highlight your differentiator"

**Random positioning logic:**
- Pre-define 6-8 position slots spread across the waveform area (e.g., top-left, center-right, bottom-center, etc.) using percentage-based absolute positioning
- Each popup randomly picks a slot that was NOT used by the previous popup
- Slots defined as `{ top: '15%', right: '10%' }`, `{ top: '55%', right: '35%' }`, etc.

**Animation cycle:**
- Show one popup every ~4.5 seconds
- Each popup fades/scales in (0.4s), holds for 3.5s, fades out (0.5s)
- Cycle through all 6 messages, then loop
- Start after a 2-second delay so the hero text animates in first

**Popup design:**
- Small glass card: `bg-white/[0.06] backdrop-blur-sm border border-white/[0.12] rounded-xl px-4 py-3`
- Sparkles icon + urgency dot (red/amber/teal) + coaching text in white/80 text-xs
- Max width ~260px so it doesn't overwhelm the hero
- Desktop only (`hidden lg:block`) -- same as the waveform

### 4. Technical Implementation

**State management (inside CinematicHero):**
```
const [activePopup, setActivePopup] = useState<{index: number, slot: number} | null>(null)
```

**Interval logic in useEffect:**
- Every 4.5s, pick next message index (cycling 0-5) and a random slot (excluding previous)
- Set activePopup, then after 3.5s set it to null (fade-out via CSS)
- Cleanup interval on unmount

**Position slots array:**
```
const POPUP_SLOTS = [
  { top: '10%', right: '5%' },
  { top: '25%', right: '40%' },
  { top: '45%', right: '15%' },
  { top: '60%', right: '50%' },
  { top: '15%', right: '55%' },
  { top: '50%', right: '30%' },
]
```

### Files to modify
- `src/index.css` -- add 2 keyframe rules (~10 lines)
- `src/components/landing/CinematicHero.tsx` -- refactor waveform SVG + add coaching popup system (~80 lines added)
