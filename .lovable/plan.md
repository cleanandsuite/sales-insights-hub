

# Merge Lead Stats into One Unified Header Strip

## Problem

Two separate card rows on the Leads page show overlapping data:
- **AI Lead Status**: Today's Leads, This Week, Conversion Rate, Avg Response + AI status + Pause button
- **Quick Overview Cards**: New Leads (Today) [duplicate], Follow-ups (Pending), Hot Leads (Priority), Recent Calls (Last 24h)

This is confusing and wastes vertical space.

## Solution

Merge everything into a single, compact **AI Lead Status** bar that contains all 6 unique metrics in one row, with the AI status indicator and Pause button inline.

```text
+--------------------------------------------------------------+
| [*] AI Active  |  0 Today  |  0 Week  |  28% Conv  |  1.2h  |
|                |  0 Follow-ups  |  4 Hot  |  8 Calls  | [Pause]|
+--------------------------------------------------------------+
```

### Layout

The redesigned component will be a single card with:
- **Top row**: AI status dot + "ACTIVE" badge + Pause button (right-aligned)
- **Stats grid** (6 columns on desktop, 3x2 on tablet, 2x3 on mobile):
  1. Today's Leads (merged -- single source of truth)
  2. This Week
  3. Conversion Rate
  4. Follow-ups (Pending) -- from QuickOverview
  5. Hot Leads (Priority) -- from QuickOverview
  6. Recent Calls (Last 24h) -- from QuickOverview
- "Avg Response" gets dropped (least actionable metric) to keep 6 clean tiles

Each stat tile keeps the colored icon from QuickOverviewCards for visual distinction.

## Technical Plan

### Modified Files

| File | Change |
|------|--------|
| `src/components/leads/AILeadStatus.tsx` | Rewrite to accept all 6 metrics + render as a single compact card with icon-colored stat tiles |
| `src/pages/Leads.tsx` | Remove `QuickOverviewCards` import and usage; pass `pendingFollowups`, `hotLeads`, `recentCalls` to `AILeadStatus` instead |

### Props Change for AILeadStatus

Add three new props: `pendingFollowups`, `hotLeads`, `recentCalls`. Remove `avgResponseTime` (or keep it as an optional tooltip).

### QuickOverviewCards

The component file stays in the codebase but is no longer imported in `Leads.tsx`.

