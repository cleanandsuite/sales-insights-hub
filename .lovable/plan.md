

# Per-User Phone Line Setup Flow

## Overview

After purchase, users are redirected to a branded setup page where they enter their preferred area code (not zip code -- we map zip to area code for simplicity, but area code is what Telnyx needs). The system provisions a dedicated phone number in the background, showing a polished loading experience. Once ready, users see their new SellSig number with a welcome message.

## User Flow

```text
Stripe Checkout --> /payment-complete (existing) --> Account creation
  --> /setup-phone (NEW) --> Enter area code
  --> /setup-phone/provisioning (NEW state) --> Animated loading screen (polling)
  --> Number ready --> Welcome screen with number + CTA to dashboard
```

## Database Changes

### New table: `user_phone_lines`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | default gen_random_uuid() |
| user_id | uuid NOT NULL UNIQUE | references profiles(user_id) |
| phone_number | text | E.164 format |
| area_code | text | 3-digit code |
| telnyx_connection_id | text | internal, never exposed |
| telnyx_phone_id | text | internal, never exposed |
| sip_username | text | internal, never exposed |
| sip_password | text | internal, never exposed |
| status | text NOT NULL DEFAULT 'pending' | pending / provisioning / active / failed |
| error_message | text | if provisioning failed |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

RLS: Users can SELECT their own row (phone_number, area_code, status only). All writes via service role from edge functions.

## New Edge Functions

### 1. `telnyx-search-numbers`
- Authenticated endpoint
- Accepts `{ area_code: "212" }`
- Calls Telnyx API: `GET /v2/available_phone_numbers` filtered by area code
- Returns list of formatted numbers (no mention of Telnyx)
- Uses existing `Telnyx_API` secret

### 2. `telnyx-provision-number`
- Authenticated endpoint
- Accepts `{ area_code: "212", phone_number: "+12125551234" }`
- Steps:
  1. Creates row in `user_phone_lines` with status `provisioning`
  2. Orders the number via Telnyx API
  3. Creates a Credential Connection for the user
  4. Updates the row with SIP credentials, phone ID, status `active`
- On failure: sets status to `failed` with error_message
- Uses service-role Supabase client for DB writes

## New Frontend Pages/Components

### 1. `/setup-phone` page (`src/pages/SetupPhone.tsx`)

Three-phase single page component:

**Phase 1 - Area Code Selection:**
- Clean, branded UI (SellSig logo, dark theme)
- Headline: "Let's Set Up Your SellSig Line"
- Input for 3-digit area code
- "Search Available Numbers" button
- Shows 3-5 available numbers as selectable cards (formatted nicely, e.g., "(212) 555-1234")
- "Claim This Number" button proceeds to Phase 2

**Phase 2 - Provisioning (Loading):**
- Animated loading screen with progress indicators
- Messaging: "Setting up your SellSig line... This takes about 2-3 minutes."
- Empowering micro-copy rotating through tips
- Polls `user_phone_lines` status every 5 seconds
- No mention of any third-party provider

**Phase 3 - Welcome:**
- Big reveal of their new number
- Headline: "Welcome to the Elite"
- Display their SellSig number prominently
- Empowering message about what they can now do
- "Go to Dashboard" CTA

### 2. Route addition in `App.tsx`
- Add `/setup-phone` as a protected route

## Modified Files

### `supabase/functions/telnyx-auth/index.ts`
- Before returning global SIP creds, query `user_phone_lines` for the authenticated user
- If found and status is `active`, return per-user credentials
- Fall back to global credentials only if no per-user line exists

### `src/pages/PaymentComplete.tsx`
- After successful authentication, redirect to `/setup-phone` instead of `/dashboard` (if user has no phone line yet)

### `supabase/config.toml`
- Add `verify_jwt = false` entries for `telnyx-search-numbers` and `telnyx-provision-number`

## Technical Details

### Telnyx API Calls (inside edge functions)

**Search numbers:**
```
GET https://api.telnyx.com/v2/available_phone_numbers
  ?filter[country_code]=US
  &filter[national_destination_code]={area_code}
  &filter[features][]=sip_trunking
  &filter[limit]=5
Authorization: Bearer {Telnyx_API}
```

**Order number:**
```
POST https://api.telnyx.com/v2/number_orders
Body: { phone_numbers: [{ phone_number: "+1..." }] }
```

**Create credential connection:**
```
POST https://api.telnyx.com/v2/credential_connections
Body: { connection_name: "sellsig-{user_id}", user_name: generated, password: generated }
```

### Polling Strategy
- Frontend polls `user_phone_lines` via Supabase client every 5 seconds
- RLS policy allows user to read their own row's `status` and `phone_number`
- When status changes to `active`, transition to Welcome phase

### Security
- SIP credentials are never exposed to the frontend (RLS policy only exposes phone_number, area_code, status)
- All Telnyx API calls happen server-side in edge functions
- No third-party branding or service names appear in UI

## Files Summary

| File | Action |
|------|--------|
| Migration SQL | Create `user_phone_lines` table + RLS |
| `supabase/functions/telnyx-search-numbers/index.ts` | New |
| `supabase/functions/telnyx-provision-number/index.ts` | New |
| `src/pages/SetupPhone.tsx` | New |
| `src/App.tsx` | Add route |
| `supabase/functions/telnyx-auth/index.ts` | Query per-user creds |
| `src/pages/PaymentComplete.tsx` | Redirect to setup-phone |
| `supabase/config.toml` | Add function entries |

