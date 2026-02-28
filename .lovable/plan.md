

# Leads Tab Redesign: Import System + Modern UI

## Overview

Redesign the Leads page with a modern feed-style layout inspired by the ZoomInfo Sales Coach reference, adding sub-tabs (All Leads / Imported Leads), a CSV import modal, and an expanded lead detail popup with auto-generated WinWords scripts.

## Visual Design

```text
+--------------------------------------------------------------+
| HEADER: Leads title + Demo toggle + Export + Import buttons   |
+--------------------------------------------------------------+
| TABS: [All Leads] [Imported Leads]                            |
+--------------------------------------------------------------+
|                                                               |
| ALL LEADS TAB:                                                |
| +------------------+-------------------+-------------------+  |
| | AI Status Bar    | Stats Cards Row   | Priority Alerts   |  |
| +------------------+-------------------+-------------------+  |
| | FEED (60%)                   | SIDEBAR (40%)             |  |
| | Search + Filter bar          | Recent Activity Feed      |  |
| | Lead cards (existing)        | Quick actions             |  |
| +------------------------------+---------------------------+  |
|                                                               |
| IMPORTED LEADS TAB:                                           |
| +----------------------------------------------------------+ |
| | Filter bar: Type (hot/warm/cold) + Search                 | |
| | Table: Name | Business | Location | Prev Rep | Date |     | |
| |   Time | Lead Type (color badge)                           | |
| | Rows clickable -> Lead Detail Popup                        | |
| +----------------------------------------------------------+ |
+--------------------------------------------------------------+
```

## Changes

### 1. Database Migration: `imported_leads` table

Create a new `imported_leads` table to store CSV-uploaded leads separately:
- `id` (uuid, PK)
- `user_id` (uuid, NOT NULL)
- `contact_name` (text, NOT NULL)
- `business` (text)
- `location` (text)
- `previous_rep` (text)
- `contact_date` (date)
- `contact_time` (time)
- `lead_type` (text: 'hot', 'warm', 'cold')
- `pain_point` (text) -- auto-filled by AI or manual
- `notes` (text)
- `created_at` (timestamptz, default now())

RLS: Users can only CRUD their own rows. Managers can view team members' rows.

### 2. New Components

| Component | Purpose |
|-----------|---------|
| `src/components/leads/ImportLeadsDialog.tsx` | CSV upload modal with field mapping, drag-drop zone, and manual entry fallback |
| `src/components/leads/ImportedLeadsTable.tsx` | Sortable/filterable table for imported leads with color-coded type badges |
| `src/components/leads/LeadDetailPopup.tsx` | Expanded modal with header, pain point, activity timeline, WinWords script section, and action buttons |

### 3. ImportLeadsDialog

- Drag-and-drop CSV upload zone
- CSV parsing with field detection (Name, Business, Location, Previous Rep, Date, Time, Lead Type)
- Preview table before confirming import
- Manual single-entry form as alternative
- Zod validation on all fields
- Inserts into `imported_leads` table

### 4. ImportedLeadsTable

- Sortable columns (Name, Business, Date)
- Color-coded Lead Type badges: red (hot), orange (warm), blue (cold)
- Type filter dropdown + search bar
- Click row to open `LeadDetailPopup`

### 5. LeadDetailPopup

Sections inside a Dialog:
- **Header**: Name, Business, Location, Lead Type badge, AI Confidence gauge, Re-score button
- **Pain Point**: Auto-filled text area (editable)
- **Recent Activity**: Timeline of previous contacts with date/time/rep
- **WinWords Script** (new): Calls the existing `winwords-generate` edge function with company name and target role to auto-generate a cold call script. Displays the script with sections (Greeting, Value Prop, Competitor Differentiation, CTA). Includes a "Regenerate" and "Copy" button.
- **Actions**: Call, Email, Schedule, Proposal, Note buttons

### 6. Modified: `src/pages/Leads.tsx`

- Add Tabs component with "All Leads" and "Imported Leads" sub-tabs below the header
- Add Import button (blue, Upload icon) next to Export
- "All Leads" tab renders existing content (unchanged)
- "Imported Leads" tab renders `ImportedLeadsTable`
- Modernize the overall layout with cleaner spacing and the SellSig blue/white color scheme

### 7. WinWords Integration

The `LeadDetailPopup` will call the existing `winwords-generate` edge function with:
- `scenario: 'cold_call'`
- `companyResearch: { name: business }` from the imported lead
- `persona: { role: title/role }` if available

This reuses the existing AI script generation without any new backend work.

## Technical Details

- CSV parsing: Use native `FileReader` + simple CSV parser (split by commas/newlines with quote handling)
- No new edge functions needed -- reuses `winwords-generate`
- Database migration adds `imported_leads` table with RLS policies
- All new components use existing UI primitives (Dialog, Table, Badge, Button, Tabs)
- Responsive: Table becomes card-based on mobile

