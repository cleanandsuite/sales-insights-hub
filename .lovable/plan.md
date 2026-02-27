

# Modern Dashboard Redesign: Command Center + Feed + Focus Mode

## Overview

Replace the current tabbed card-grid dashboard with a modern, single-view "Command Center" layout that combines a smart action bar, activity feed, dynamic bento widgets, and a focus-mode spotlight -- all on one page without tabs.

## Design Concept

The new dashboard has four distinct zones arranged vertically:

```text
+--------------------------------------------------------------+
| COMMAND BAR (greeting + quick actions + AI status inline)     |
+--------------------------------------------------------------+
| SPOTLIGHT: Focus card -- one rotating priority (next call,    |
|   hottest deal, coaching tip) with prev/next navigation       |
+----------------------------+---------------------------------+
| LIVE FEED (60%)            | BENTO WIDGETS (40%)             |
| Chronological activity     | - KPI sparkline cards           |
|   stream with inline       | - Revenue mini-chart            |
|   actions (call, email,    | - Win rate ring                 |
|   view recording)          | - AI coaching tip               |
+----------------------------+---------------------------------+
```

## Detailed Changes

### 1. Command Bar (replaces DashboardHeader + AIStatusBar + Quote)

A single, compact top strip that merges the greeting, AI status indicator, key metrics, and the Start Call CTA into one row. The daily quote becomes a subtle tooltip on a small icon rather than a full-width block.

- Left: Greeting text (smaller, single line)
- Center: Inline AI status dot + 3 compact KPI pills (Calls Today, Avg Score, Week Total)
- Right: Start Call button (same red CTA)

### 2. Spotlight / Focus Mode (new component)

A large, full-width card that cycles through the user's top priorities:
- **Next scheduled call** (with countdown timer + one-click start)
- **Hottest deal at risk** (with health indicator + suggested action)
- **AI coaching insight** (today's top improvement suggestion)

Users click left/right arrows or dots to cycle. Auto-advances every 15 seconds. Shows a subtle progress bar indicating time until next rotation.

### 3. Activity Feed (replaces Recordings Table)

A vertical timeline/feed on the left (60% width on desktop, full-width on mobile) showing recent events in chronological order:
- Call recordings (with inline play button, score badge, duration)
- Deal stage changes
- AI analysis completions
- Scheduled call reminders

Each feed item is a compact card with:
- Icon + timestamp (relative)
- Title + one-line summary
- Inline action buttons (View Analysis, Start Call, Open Deal)
- Score/status badge

The feed replaces the table format -- each row becomes a card in the stream.

### 4. Bento Widget Grid (replaces MetricCards + Revenue tab)

The right side (40% width, stacks below feed on mobile) shows a 2x3 grid of small, dense widget cards:

| Widget | Content |
|--------|---------|
| Calls Today | Number + sparkline of last 7 days |
| Avg Score | Number + colored ring indicator |
| Revenue | Mini bar chart (last 4 months) |
| Win Rate | Donut/ring with percentage |
| Pipeline | Value + deal count |
| AI Tip | One-line coaching suggestion |

Each widget is clickable, navigating to the relevant detail page.

### 5. Remove Tabs

The current Calls/Revenue tab split goes away. Everything is visible at once in the single-view layout. Revenue data is consolidated into the bento widgets and the spotlight rotation.

## Technical Plan

### New Components

| Component | Purpose |
|-----------|---------|
| `src/components/dashboard/CommandBar.tsx` | Merged header + AI status + KPIs in one row |
| `src/components/dashboard/SpotlightCard.tsx` | Rotating focus card with priorities |
| `src/components/dashboard/ActivityFeed.tsx` | Timeline feed of recent calls/events |
| `src/components/dashboard/ActivityFeedItem.tsx` | Individual feed item card |
| `src/components/dashboard/BentoWidget.tsx` | Small metric widget with optional sparkline |
| `src/components/dashboard/BentoGrid.tsx` | 2-column grid of BentoWidgets |

### Modified Files

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Complete rewrite of the layout using new components; remove Tabs, keep data fetching logic (useRealKPIs, recordings query) |
| `src/components/dashboard/index.ts` | Export new components |

### Removed/Deprecated (code stays, just unused)

- `DashboardOverview.tsx` (already unused)
- The tabs structure in Dashboard.tsx

### Data Flow

- **CommandBar**: Receives `userName`, `kpis`, `onStartCall` -- same data as today
- **SpotlightCard**: Fetches scheduled calls (from `scheduled_calls`), at-risk deals (from `mockDeals`), and generates a coaching tip from recent scores
- **ActivityFeed**: Queries `call_recordings` (same as RecordingsTable today) but renders as feed cards instead of a table
- **BentoGrid**: Receives `kpis` + static revenue/pipeline data (same mock data currently in Revenue tab)

### Responsive Behavior

- **Desktop (lg+)**: Command bar full-width, spotlight full-width, feed + bento side-by-side (60/40)
- **Tablet (md)**: Same layout but bento drops to 2-column below feed
- **Mobile (sm)**: Everything stacks vertically: Command bar, spotlight, bento (2-col grid), feed

### Animations

- Spotlight card transitions with a subtle slide + fade
- Feed items animate in with staggered `fadeIn` (using existing keyframes)
- Bento widgets use the existing `hover:-translate-y-0.5` lift effect
- Numbers use the existing `animate-count-up` class

### No Database Changes

This is a pure frontend redesign. All data sources remain the same (Supabase queries for recordings/scores, mock data for revenue/deals).

