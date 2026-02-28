

# Embedded Outbound Email System

## Overview

Add a simple, compact outbound email system that lets users send emails directly from SellSig using their own SMTP server credentials (Gmail, Outlook, custom). No external email client needed.

## Architecture

```text
User configures SMTP once in Settings
            |
            v
+---------------------------+
| user_email_settings table |  (encrypted credentials)
+---------------------------+
            |
    When user clicks "Send" 
            |
            v
+---------------------------+
| send-outbound-email       |  (Edge Function)
| - Decrypts SMTP creds     |
| - Connects via SMTP       |
| - Sends email             |
| - Logs to sent_emails     |
+---------------------------+
            |
            v
+---------------------------+
| sent_emails table         |  (audit trail)
+---------------------------+
```

## Changes

### 1. Database: `user_email_settings` table

Stores each user's SMTP configuration (one row per user):
- `id` (uuid, PK)
- `user_id` (uuid, NOT NULL, unique)
- `smtp_host` (text) -- e.g. smtp.gmail.com
- `smtp_port` (integer) -- e.g. 587
- `smtp_username` (text) -- email address
- `smtp_password` (text) -- app password (stored encrypted)
- `from_name` (text) -- display name
- `from_email` (text) -- sender address
- `use_tls` (boolean, default true)
- `created_at`, `updated_at`

RLS: Users can only read/write their own row.

### 2. Database: `sent_emails` table

Audit log of all sent emails:
- `id` (uuid, PK)
- `user_id` (uuid, NOT NULL)
- `to_email` (text, NOT NULL)
- `subject` (text)
- `body_preview` (text) -- first 200 chars
- `status` (text) -- 'sent', 'failed'
- `error_message` (text, nullable)
- `related_type` (text, nullable) -- 'scheduled_call', 'lead', etc.
- `related_id` (text, nullable)
- `created_at`

RLS: Users can only view their own sent emails.

### 3. Edge Function: `send-outbound-email`

- Accepts: `{ to, subject, body, relatedType?, relatedId? }`
- Fetches the user's SMTP settings from `user_email_settings`
- Uses Deno's SMTP client (`denomailer`) to send via the user's SMTP server
- Logs result to `sent_emails`
- Returns success/failure

### 4. New Component: `src/components/settings/EmailSettingsCard.tsx`

Compact card in the Settings page with:
- Preset buttons: Gmail, Outlook, Custom (auto-fills host/port)
- Fields: SMTP Host, Port, Username, Password (app password), From Name, From Email, TLS toggle
- "Test Connection" button that sends a test email to themselves
- "Save" button
- Status indicator showing if email is configured

### 5. New Hook: `src/hooks/useOutboundEmail.ts`

- `sendEmail(to, subject, body, relatedType?, relatedId?)` -- calls the edge function
- `isSending` loading state
- `isConfigured` -- checks if user has SMTP settings saved

### 6. Modified: `src/components/schedule/ScheduleEmailDialog.tsx`

Add a "Send" button alongside existing "Copy" and "Open in Email Client":
- If email is configured: shows blue "Send" button that sends directly
- If not configured: shows tooltip "Set up email in Settings"
- After sending: shows success confirmation inline

### 7. Modified: `src/components/leads/LeadDetailPopup.tsx`

Update the Email action button to open a compact inline email composer (similar to ScheduleEmailDialog) that can send directly.

### 8. Modified: `src/pages/Settings.tsx`

Add the `EmailSettingsCard` to the existing settings layout, under a new "Email" tab or within the existing notifications section.

## UX Design

The email settings card will be minimal:

```text
+------------------------------------------+
| Outbound Email Setup                     |
| [Gmail] [Outlook] [Custom]   <- presets  |
|                                          |
| Host: [smtp.gmail.com    ]  Port: [587]  |
| Username: [you@gmail.com          ]      |
| App Password: [********           ]      |
| From Name: [Your Name             ]      |
| [x] Use TLS                             |
|                                          |
| [Test Connection]          [Save]        |
+------------------------------------------+
```

The send button in email dialogs will be compact -- just a "Send" icon button that replaces the current "Open in Email Client" when SMTP is configured.

## Technical Notes

- SMTP sending uses `denomailer` (Deno-native SMTP library) in the edge function
- Gmail users need an "App Password" (not their regular password) -- we show a help link
- Credentials are stored per-user with RLS protection
- The edge function validates the user owns the SMTP settings before using them
- Email body is sent as plain text (no HTML formatting needed for sales outreach)

