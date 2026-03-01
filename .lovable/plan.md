

# Skill Breakdown Panel Below Radar Chart

## Overview

Add a new component below the radar chart (in the Skills tab) that explains each radar axis in plain language -- what the score means, where the user is strong/weak, and specific advice drawn from their call data. This replaces the generic SkillTrendChart position with a more actionable layout: trend chart stays but moves down, and a new "Skill Breakdown" panel sits directly under the radar.

## Layout Change

Current Skills tab layout:
```text
[ Radar (2 cols)  |  EnhancedSkillsTab (3 cols) ]
[ SkillTrendChart (full width)                   ]
```

New layout:
```text
[ Radar (2 cols)  |  EnhancedSkillsTab (3 cols) ]
[ SkillBreakdownPanel (full width)               ]
[ SkillTrendChart (full width)                   ]
```

## New Component: `SkillBreakdownPanel`

**File: `src/components/analytics/SkillBreakdownPanel.tsx`**

Takes the same `currentSkills` and `previousSkills` props as the radar chart. For each of the 6 skills (Opening Hook, Objections, Discovery, Pitch Clarity, Closing, Engagement), renders a card row showing:

- **Score + change indicator** (e.g., "72 -> +5" with green/red arrow)
- **Status label** based on score thresholds: "Needs Work" (<50), "Developing" (50-69), "Solid" (70-84), "Elite" (85+)
- **AI explanation** -- a short sentence explaining what this score means in context (e.g., "Your opening hooks are landing well but could be more personalized to the prospect's industry")
- **Actionable tip** -- one concrete thing to try next call

The explanations and tips will be hardcoded per skill and per score band (4 bands x 6 skills = 24 short strings). In demo mode these render with the demo scores. With real data, they dynamically pick the right band based on actual scores.

### Visual Design

- Matches the dark theme of the radar card (`bg-[#0d0d1a]`, indigo borders)
- Each skill row is a horizontal strip with the skill icon/name on the left, score + status badge in the middle, and the explanation + tip on the right
- Color-coded left border per status (red/amber/blue/green)
- Collapsible on mobile (accordion style)

## Changes Summary

| Action | File |
|--------|------|
| **Create** | `src/components/analytics/SkillBreakdownPanel.tsx` |
| **Modify** | `src/pages/Analytics.tsx` -- import and place between radar row and SkillTrendChart |
