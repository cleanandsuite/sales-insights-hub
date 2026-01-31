

# Telnyx Click-to-Call with Bidirectional Transcription

## Overview

This plan replaces the "Start Recording" button with a "Start Call" button that initiates outbound phone calls through Telnyx, with real-time bidirectional transcription of both parties (inbound and outbound audio) via AssemblyAI.

## Architecture

```text
┌─────────────────┐                    ┌─────────────────┐
│   Browser App   │───────────────────▶│  Telnyx WebRTC  │
│   (Dashboard)   │◀───────────────────│     Client      │
└────────┬────────┘                    └────────┬────────┘
         │                                      │
         │ Audio Streams                        │ PSTN Call
         ▼                                      ▼
┌─────────────────┐                    ┌─────────────────┐
│   Local Audio   │                    │  Phone Network  │
│   Processing    │                    │   (Recipient)   │
└────────┬────────┘                    └─────────────────┘
         │
         │ Mixed Audio (both directions)
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Edge Function  │────▶│   AssemblyAI    │
│  (transcribe)   │◀────│   Real-time     │
└─────────────────┘     └─────────────────┘
         │
         ▼
    Transcripts
```

## Key Components

### 1. Call Dialog Component (New)

A modal that allows users to:
- Enter a phone number to call
- Or select from recent contacts/leads
- See call status (connecting, connected, ended)
- View live transcription during the call
- End the call

### 2. Telnyx WebRTC Integration (New Hook)

A custom React hook `useTelnyxCall` that:
- Initializes the Telnyx WebRTC SDK
- Handles authentication via a backend function that generates JWT tokens
- Manages call state (idle, connecting, connected, ended)
- Captures bidirectional audio streams
- Streams audio to AssemblyAI for real-time transcription

### 3. Backend Functions (New Edge Functions)

**`telnyx-auth`** - Generates JWT tokens for WebRTC authentication:
- Validates user session
- Creates short-lived JWT for Telnyx WebRTC client
- Returns token to frontend

**`telnyx-transcribe`** (Modify existing server or create edge function approach):
- For the WebRTC approach, audio comes from the browser
- We can reuse the existing `transcribe-audio` function
- Or create a new streaming endpoint

### 4. UI Changes

**DashboardHeader.tsx:**
- Replace "Start Recording" button with "Start Call" button
- Phone icon instead of microphone
- Remove headphone mode toggle (not needed for calls)

**New CallInterface.tsx:**
- Similar to LiveRecordingInterface but for phone calls
- Phone number input field
- Call/hangup controls
- Live transcription panel
- AI coaching during call

## Implementation Details

### Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useTelnyxCall.ts` | Telnyx WebRTC SDK integration hook |
| `src/components/calling/CallInterface.tsx` | Full-screen call interface |
| `src/components/calling/CallDialog.tsx` | Phone number entry dialog |
| `src/components/calling/CallStatus.tsx` | Call status indicator |
| `supabase/functions/telnyx-auth/index.ts` | JWT token generator for WebRTC |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/DashboardHeader.tsx` | Replace recording button with call button |
| `src/pages/Dashboard.tsx` | Integrate CallInterface instead of LiveRecordingInterface |
| `src/pages/Leads.tsx` | Update `handleCall` to use Telnyx instead of `tel:` link |
| `package.json` | Add `@telnyx/webrtc` SDK dependency |

### NPM Dependencies

```json
{
  "@telnyx/webrtc": "^2.19.0"
}
```

### Telnyx Configuration Requirements

Before this works, the user needs:
1. A **Telnyx account** with the API key (already configured as `Telnyx_API`)
2. A **Telnyx SIP Connection** or **Credential Connection** for WebRTC
3. A **Phone Number** assigned to the connection for caller ID
4. **WebRTC enabled** on the connection

---

## Technical Specifications

### Audio Capture Strategy

For bidirectional transcription, we capture:

1. **Outbound audio (user's voice):** Local microphone stream
2. **Inbound audio (recipient's voice):** Remote audio from WebRTC call

These are mixed into a single stream and sent to AssemblyAI:

```text
Local Mic Audio ──┐
                  ├──▶ Mixed Stream ──▶ AssemblyAI
Remote Audio ─────┘
```

### useTelnyxCall Hook Interface

```typescript
interface UseTelnyxCallReturn {
  // State
  callStatus: 'idle' | 'connecting' | 'ringing' | 'connected' | 'ended';
  isReady: boolean;
  error: string | null;
  
  // Call controls
  startCall: (phoneNumber: string) => Promise<void>;
  endCall: () => void;
  muteAudio: (muted: boolean) => void;
  
  // Transcription
  transcription: string;
  isTranscribing: boolean;
  
  // Call info
  duration: number;
  callId: string | null;
}
```

### Edge Function: telnyx-auth

Creates a JWT token for the Telnyx WebRTC client:

```typescript
// Pseudocode
POST /telnyx-auth
{
  // Uses TELNYX_API_KEY from secrets
  // Returns: { token: "jwt...", expires_at: "..." }
}
```

---

## Secrets Required

The following secrets need to be configured:

| Secret | Status | Purpose |
|--------|--------|---------|
| `Telnyx_API` | Already configured | API key for Telnyx |
| `TELNYX_SIP_USERNAME` | Needs to be added | SIP Connection username |
| `TELNYX_SIP_PASSWORD` | Needs to be added | SIP Connection password |
| `TELNYX_CALLER_ID` | Needs to be added | Your Telnyx phone number |

---

## User Flow

1. User clicks "Start Call" button on dashboard
2. Call dialog opens asking for phone number
3. User enters number or selects from leads
4. Click "Call" initiates:
   - Telnyx WebRTC connection established
   - Outbound call placed to phone number
   - Audio capture begins
5. When call connects:
   - Live transcription shows on screen
   - AI coaching suggestions appear
6. When call ends:
   - Recording is saved
   - Full analysis is generated
   - User redirected to analysis page

---

## Alternative Approach: Server-Side Calling

If browser-based WebRTC is too complex, an alternative is:

1. **Use the existing `twilio-server`** (now Telnyx server)
2. Add an endpoint to **initiate outbound calls**
3. The server handles both audio directions
4. Frontend receives transcripts via WebSocket

This approach is simpler but requires the standalone server to be deployed.

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useTelnyxCall.ts` | Create | WebRTC calling hook |
| `src/components/calling/CallInterface.tsx` | Create | Full call UI |
| `src/components/calling/CallDialog.tsx` | Create | Phone entry modal |
| `supabase/functions/telnyx-auth/index.ts` | Create | JWT token generator |
| `src/components/dashboard/DashboardHeader.tsx` | Modify | Change to call button |
| `src/pages/Dashboard.tsx` | Modify | Add call state/interface |
| `src/pages/Leads.tsx` | Modify | Use Telnyx for calls |
| `package.json` | Modify | Add @telnyx/webrtc |

