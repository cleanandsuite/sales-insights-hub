

# Competitive Gap Analysis: What You Need to Be Comparable

Based on auditing your full codebase against competitors (Gong, Salesloft, Outreach, Orum, JustCall, Dialpad), here's what's missing or non-functional, grouped by impact.

---

## Tier 1: Table Stakes (Competitors ALL have these — you'll lose deals without them)

### 1. Working CRM Integrations
Your Integrations page is **100% mock data**. HubSpot shows "connected" with fake stats. Salesforce OAuth exists but the sync functions are shells. No competitor ships without at least one real CRM integration.
- **Minimum:** Working HubSpot or Salesforce OAuth + bi-directional contact/deal sync
- **Effort:** Large — requires OAuth flows, webhook listeners, field mapping UI

### 2. Email Sequences / Cadences
You have zero multi-step outreach capability. Every competitor (Salesloft, Outreach, Apollo) lets reps build email + call + LinkedIn sequences with automated follow-ups. Your `send-outbound-email` is a single-shot function.
- **Minimum:** Multi-step sequence builder (email → wait → call → wait → email), template library, open/click tracking
- **Effort:** Large

### 3. Call Search Across All Recordings
Gong's #1 feature: "Show me every call where a competitor was mentioned." You have per-recording transcript view but **no global transcript search**. Your `ActivityFeed` searches by name/filename only.
- **Minimum:** Full-text search across all transcripts with keyword highlighting and jump-to-timestamp
- **Effort:** Medium — requires indexing transcripts in a searchable column or using Postgres full-text search

### 4. SMS / Multi-Channel Outreach
Most dialers (JustCall, Orum, Salesloft) support SMS alongside calls. You're calls-only.
- **Minimum:** SMS send/receive via Telnyx (they support it on the same number)
- **Effort:** Medium

---

## Tier 2: Expected Features (Most competitors have these — noticeable gap)

### 5. Snippet Library / Call Highlights
Managers and reps can't save/share "best moments" from calls. Gong, Chorus, and Clari all have shareable call snippets with timestamp ranges.
- **Minimum:** Clip a 30-second segment from a recording, share via link
- **Effort:** Medium

### 6. Automated Post-Call Emails
After a call ends, auto-draft a follow-up email based on the transcript. You have `generateCallEmail` in the schedule assistant but it's not wired to the post-call flow.
- **Minimum:** After call ends → AI drafts email → rep reviews and sends in one click
- **Effort:** Small — mostly wiring existing functions together

### 7. Contact/Lead Import from CRM
Your "Import Leads" supports CSV only. Competitors pull contacts directly from HubSpot/Salesforce with smart filtering (e.g., "leads not contacted in 30 days").
- **Effort:** Dependent on CRM integration (Tier 1 item)

### 8. Real-Time Notifications (Slack/Email Alerts)
Your Slack integration is mock. Competitors send Slack alerts for: deal stage changes, at-risk deals, missed follow-ups, coaching moments.
- **Minimum:** Slack webhook for key events (deal closed, coaching flag, missed call)
- **Effort:** Small-Medium

---

## Tier 3: Differentiators (Nice-to-have, some competitors have them)

### 9. Mobile App
No mobile experience. Salesloft, Outreach, and JustCall all have mobile apps. Not buildable in Lovable (React web only), but a **responsive mobile web view** for key actions (view schedule, tap-to-call, see coaching) would help.
- **Effort:** Medium — responsive audit of Dashboard, Schedule, Leads pages

### 10. API / Webhook Access for Customers
Power users and enterprise buyers expect an API to pull call data, scores, and analytics into their own tools. You have none.
- **Effort:** Medium — expose key edge functions as documented REST endpoints

### 11. Conversation Library with Playlists
Curated playlists of calls by topic: "Best discovery calls," "Objection handling masterclass." Used for onboarding new reps.
- **Effort:** Medium

---

## What's Actually Broken vs. Mock

| Feature | Status |
|---------|--------|
| VoIP Dialer | ✅ Real (Telnyx) |
| Call Recording & Transcription | ✅ Real (AssemblyAI) |
| AI Scoring | ✅ Real (DeepSeek) |
| Live Coaching | ✅ Real |
| WinWords Script Gen | ✅ Real |
| Leads CRM | ✅ Real (Supabase) |
| Schedule | ✅ Real |
| HubSpot Integration | ❌ Mock |
| Salesforce Integration | ❌ Partial (OAuth only, no sync) |
| Slack Integration | ❌ Mock |
| Zoom Integration | ❌ Mock |
| Leaderboard | ❌ Mock data |
| Enterprise Deals | ❌ Mock data (mockDeals) |
| Enterprise Activity | ❌ Mock data |

---

## Recommended Priority Order

1. **Global transcript search** — small effort, huge value, differentiator
2. **Post-call email drafting** — wire existing AI to post-call flow
3. **SMS via Telnyx** — same API you already use
4. **Real leaderboard** — pull from actual call_recordings + call_scores
5. **HubSpot OAuth integration** — biggest enterprise blocker
6. **Email sequences** — largest effort but biggest competitive gap

