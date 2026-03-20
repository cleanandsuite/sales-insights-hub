

# Usability Upgrades to Stand Out Commercially

After auditing the app's UX across all major pages, here are the high-impact usability improvements that would make SellSig feel more polished and competitive against Gong, Salesloft, and Outreach.

---

## 1. Empty States That Guide Action (Currently Missing)

**Problem:** When a new user lands on Dashboard, Leads, Recordings, Schedule, or Analytics with zero data, they see blank white space. Competitors show rich, branded empty states with clear CTAs.

**Fix:** Add illustrated empty states with contextual CTAs to every major page:
- **Dashboard:** "Make your first call to see your stats" → CTA opens dialer
- **Recordings:** "No recordings yet" → CTA to start a call or upload
- **Leads:** "Add your first lead" → CTA opens Add Lead dialog
- **Schedule:** "Nothing scheduled" → CTA to schedule a call
- **Analytics:** "Complete 3+ calls to unlock insights" → progress indicator

---

## 2. Keyboard Shortcuts & Command Palette

**Problem:** Power users (sales reps making 50+ calls/day) need speed. No keyboard shortcuts exist. The GlobalSearch is text-only.

**Fix:** Add a command palette (Cmd+K / Ctrl+K) that combines:
- Quick navigation to any page
- Start a call (type a number or lead name)
- Search recordings/transcripts
- Create a lead
- Open WinWords

This is a signature feature of tools like Linear, Raycast, and Superhuman — it signals "built for power users."

---

## 3. Toast/Notification System Upgrade

**Problem:** Notifications are a simple popover with hardcoded demo data. No real notification persistence, no "mark as read," no notification preferences.

**Fix:** 
- Store notifications in a `notifications` table
- Show unread count badge on bell icon
- Support notification types: overdue follow-ups, coaching available, deal stage changes, missed calls
- Add "mark all read" and click-to-navigate
- Optional: browser push notifications for urgent items

---

## 4. Contextual Tooltips & Feature Discovery

**Problem:** Many powerful features (AI coaching styles, WinWords, live coaching) are hidden behind navigation. New users don't discover them.

**Fix:** Add progressive disclosure tooltips:
- First-time feature highlights (pulse dot on new features)
- Contextual tips in empty states ("Did you know you can generate scripts with AI?")
- "What's new" changelog modal accessible from sidebar

---

## 5. Bulk Actions on Leads & Recordings

**Problem:** No way to select multiple leads to call, delete, export, or reassign. No bulk delete/export for recordings. Competitors all support multi-select.

**Fix:**
- Add checkbox selection to lead cards and recording rows
- Floating action bar appears when items selected: "Call Selected (Power Dial)", "Export", "Delete", "Assign to Rep"
- This directly enables power-dialer workflows

---

## 6. Breadcrumb Navigation + Page Titles

**Problem:** Once inside the app, there's no breadcrumb trail. Navigating from a recording detail back to recordings list requires the sidebar. No page-level context.

**Fix:** Add a consistent page header component with:
- Page title + description
- Breadcrumbs for nested views (Recording → Analysis)
- Page-level actions (export, filter toggle)

---

## 7. Loading & Skeleton States

**Problem:** Pages show a spinner while loading. Competitors show skeleton shimmer states that feel faster and more polished.

**Fix:** Replace `<Loader2 className="animate-spin" />` with skeleton card layouts on:
- Dashboard (KPI cards, activity feed)
- Leads (lead cards)
- Recordings (recording rows)
- Analytics (chart placeholders)

---

## 8. Dark/Light Theme Toggle (Partially Broken)

**Problem:** Settings imports `useTheme` from `next-themes` but the app uses Vite, not Next.js. Theme toggling likely doesn't work.

**Fix:** Either implement a proper Vite-compatible theme provider or remove the toggle and commit to the dark theme (which matches the brand better).

---

## Implementation Priority

| # | Feature | Effort | Impact |
|---|---------|--------|--------|
| 1 | Empty states with CTAs | Small | High — first impression for every new user |
| 2 | Command palette (Cmd+K) | Medium | High — power user differentiator |
| 3 | Skeleton loading states | Small | Medium — perceived performance |
| 4 | Bulk actions on Leads | Medium | High — core workflow enabler |
| 5 | Real notification system | Medium | Medium — retention driver |
| 6 | Breadcrumbs + page headers | Small | Medium — navigation clarity |
| 7 | Feature discovery tooltips | Small | Medium — activation improvement |
| 8 | Fix theme toggle | Small | Low — polish |

---

## Recommended Build Order

1. **Empty states** — instant UX uplift, small effort
2. **Command palette** — signature "power tool" feel
3. **Skeleton states** — makes everything feel faster
4. **Bulk lead actions** — enables real sales workflows
5. **Notification system** — drives re-engagement

### Files to Create/Edit

| File | Change |
|------|--------|
| `src/components/ui/EmptyState.tsx` | New — reusable empty state component |
| `src/components/dashboard/CommandPalette.tsx` | New — Cmd+K command palette |
| `src/components/ui/SkeletonCard.tsx` | New — skeleton loading variants |
| `src/pages/Dashboard.tsx` | Add empty state, skeleton loading |
| `src/pages/Leads.tsx` | Add empty state, bulk selection |
| `src/pages/Recordings.tsx` | Add empty state, skeleton loading |
| `src/pages/Schedule.tsx` | Add empty state |
| `src/pages/Analytics.tsx` | Add empty state with call threshold |
| `src/components/layout/DashboardLayout.tsx` | Mount CommandPalette globally |
| `src/components/dashboard/NotificationBell.tsx` | Wire to real notifications table |

