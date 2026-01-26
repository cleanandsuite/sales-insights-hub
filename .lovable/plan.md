
# Plan: Create Standalone Enterprise Management Dashboard

## Overview
Create a completely new, dedicated Enterprise Management Dashboard page (`/enterprise`) that is separate from the individual rep's Sales Dashboard. This will be a **management-focused command center** for Enterprise Membership administration, seat management, and organization oversight.

## Current Problem
The seat management component was incorrectly embedded into the existing `/dashboard` route, which is designed for individual sales reps. You need a **separate page** specifically for enterprise management tasks.

## Architecture

### New Route
- **Path**: `/enterprise`
- **Purpose**: Enterprise Membership management dashboard
- **Access**: Protected route, requires Enterprise subscription + Admin/Manager role

### New Page File
**`src/pages/Enterprise.tsx`** - A standalone page containing:

1. **Header Section**
   - "Enterprise Management" title with Crown/Building icon
   - Organization name and contract details
   - Enterprise tier badge

2. **Seat Overview Panel** (from EnterpriseSeatManagement)
   - Contracted Seats: 50 / Used: 45 / Remaining: 5
   - Custom vs. default pricing ($79 vs $99/seat)
   - Contract dates and renewal alerts
   - Progress bar for seat utilization

3. **Manage Seats & Users Section**
   - "Invite User" button/form
   - Users table (Name, Email, Role, Join Date, Status)
   - Actions: Remove user, Edit role
   - Seat capacity alerts (<10% warning, over-limit block)

4. **Organization Settings** (future expansion)
   - Billing overview
   - Contract details
   - SSO/SAML configuration placeholder

5. **Activity & Audit Log**
   - Recent user additions/removals
   - Role changes
   - Invitation history

## Technical Changes

### 1. Create New Page
**File: `src/pages/Enterprise.tsx`**
- Standalone enterprise management page
- Uses `DashboardLayout` for consistent navigation
- Imports `EnterpriseSeatManagement` component
- Adds access control (Enterprise subscription check)
- Clean, management-focused UI (no sales metrics)

### 2. Update Routing
**File: `src/App.tsx`**
- Add lazy import for Enterprise page
- Add protected route: `/enterprise`
- Optionally add Enterprise-specific route guard

### 3. Update Sidebar Navigation
**File: `src/components/layout/Sidebar.tsx`**
- Add "Enterprise" menu item for enterprise users
- Icon: Building2 or Crown
- Only visible to Enterprise tier users

### 4. Clean Up Dashboard.tsx
- Remove `EnterpriseSeatManagement` from the Executive Dashboard view
- Keep the Executive Dashboard focused on revenue/performance (Pipeline, Staff, Goals)
- The Enterprise Management page handles administrative tasks

## UI/UX Design

### Visual Style
- Dark mode consistent with rest of app
- Enterprise/premium feel (subtle gradients, gold/primary accents)
- Cards with top-border accents for section organization
- Clear visual hierarchy for seat metrics

### Layout
```text
┌─────────────────────────────────────────────────────────────┐
│  🏢 Enterprise Management              [Org: Acme Corp]     │
│  Manage your organization's seats and team members          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Contracted│ │  Used    │ │Remaining │ │ Per Seat │       │
│  │   50     │ │   45     │ │    5     │ │   $79    │       │
│  │Enterprise│ │  /50     │ │Available │ │  ~~$99~~ │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
│  ⚠️ Low Seats Warning: Only 5 seats remaining (10%)        │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 👑 Manage Seats & Users           [+ Invite User]       ││
│  ├─────────────────────────────────────────────────────────┤│
│  │ [Search: ____________]                                  ││
│  │                                                         ││
│  │ Name          │ Email              │ Role   │ Status    ││
│  │ John Smith    │ john@acme.com      │ Admin  │ Active    ││
│  │ Sarah Johnson │ sarah@acme.com     │ Manager│ Active    ││
│  │ Mike Chen     │ mike@acme.com      │ Member │ Active    ││
│  │ ...           │ ...                │ ...    │ ...       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📋 Recent Activity                                      ││
│  │ • Emily Davis invited (pending) - 2 hours ago          ││
│  │ • Mike Chen role changed to Member - 1 day ago         ││
│  │ • Contract renewed until Dec 2026 - 5 days ago         ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/Enterprise.tsx` | Create | New standalone enterprise management page |
| `src/App.tsx` | Modify | Add route for `/enterprise` |
| `src/components/layout/Sidebar.tsx` | Modify | Add Enterprise nav item |
| `src/pages/Dashboard.tsx` | Modify | Remove EnterpriseSeatManagement import |

## Access Control Logic
```typescript
// Only show Enterprise page to users with:
// 1. Active Enterprise subscription (isEnterprise = true)
// 2. Admin or Manager role within their organization
```

## Mock Data (Initial Implementation)
Same as currently in EnterpriseSeatManagement:
- Organization: max_seats: 50, used: 45, price: $79
- Members: 5 mock users with various roles/statuses
- DB integration notes included for production queries

## Summary
This plan creates a **completely separate Enterprise Management Dashboard** at `/enterprise` that is:
- Dedicated to organization administration (not sales metrics)
- Focused on seat management and user control
- Accessible via sidebar navigation for enterprise users
- Properly separated from the individual rep's Sales Dashboard
