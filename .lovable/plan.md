

# Fix Protocol Section — Visibility and Sales Content

## Problem
The SVG visualizations next to "Pre-Call Intelligence" and "Live Coaching" are set to `opacity-20` and `opacity-20` respectively, making them nearly invisible on the dark `#0A1428` background. The EKG waveform is at `opacity-30` which is also faint.

## Changes

### File: `src/components/landing/CinematicProtocol.tsx`

**1. Increase SVG visibility**
- ConcentricCircles: bump from `opacity-20` to `opacity-60`, increase `strokeWidth` from `0.5` to `1.5`, use brighter teal (`hsl(168,76%,55%)`)
- LaserScan: bump from `opacity-20` to `opacity-60`, increase dot `opacity` from `0.4` to `0.7`, use brighter purple
- EKGWaveform: bump from `opacity-30` to `opacity-60`, increase `strokeWidth` from `1.5` to `2`

**2. Enrich sales content**
Update the step descriptions to be more specific and compelling:

| Step | Current Title | New Description |
|------|--------------|-----------------|
| 01 | Pre-Call Intelligence | "Before you dial, SellSig scans your CRM history, past conversations, and live market signals to build a personalized brief — so you walk into every call prepared to win." |
| 02 | Live Coaching | "While you talk, whisper-mode AI detects sentiment shifts, flags objections in real time, and surfaces the exact rebuttal or question to keep the deal moving forward." |
| 03 | Post-Call Analysis | "Within seconds of hanging up, get automated call scores, deal risk alerts, next-step recommendations, and a coaching plan tailored to what just happened." |

**3. Add subtle glow effect behind each SVG**
Wrap each visualization in a container with a soft radial gradient glow matching its accent color, giving them more visual presence without looking flat.

