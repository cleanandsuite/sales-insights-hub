
# Reconnect Transcriptions and AI Analysis to Calling Interface

## Problem Summary

The calling feature works, but transcriptions and AI analysis are not functional because:

1. **Real-time transcription fails silently** - The code tries to get an AssemblyAI real-time token via `{ action: 'get_realtime_token' }`, but the edge function doesn't support this action
2. **AI Coaching panel is placeholder only** - Shows static "Listen for pain points..." text instead of using the existing `LiveCoachingSidebar` component
3. **Live Summary not integrated** - The `LiveSummaryPanel` component exists but isn't connected to the call interface

## Solution Overview

### 1. Update Edge Function for Real-time Token

Add a new action handler to `transcribe-audio` that returns a temporary AssemblyAI token for real-time streaming:

```text
┌─────────────────────┐     ┌──────────────────────────┐     ┌─────────────────────┐
│ useTelnyxCall.ts    │────▶│ transcribe-audio         │────▶│ AssemblyAI API      │
│ action: get_token   │     │ Returns temp token       │     │ /v2/realtime/token  │
└─────────────────────┘     └──────────────────────────┘     └─────────────────────┘
                                      │
                                      ▼
                            ┌──────────────────────────┐
                            │ WebSocket Connection     │
                            │ wss://api.assemblyai.com │
                            └──────────────────────────┘
```

### 2. Integrate Live Coaching Component

Replace the placeholder AI Coaching card with the actual `LiveCoachingSidebar` that:
- Receives live transcript data
- Calls `live-coach` edge function for real-time suggestions
- Shows coaching styles and urgency-based alerts

### 3. Add Live Summary Panel

Add the `LiveSummaryPanel` component to show:
- Current call stage (discovery, presentation, negotiation, closing)
- Customer needs and objections detected
- Buying signals
- Suggested next steps

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/transcribe-audio/index.ts` | Add `get_realtime_token` action handler |
| `src/components/calling/CallInterface.tsx` | Replace placeholder with `LiveCoachingSidebar` and `LiveSummaryPanel` |
| `supabase/config.toml` | Add `live-summary` to verified functions |

## Implementation Details

### Step 1: Update transcribe-audio Edge Function

Add handler for real-time token request:

```typescript
// Handle action-based requests
const body = await req.json();

if (body.action === 'get_realtime_token') {
  const assemblyAIKey = Deno.env.get('ASSEMBLYAI_API_KEY');
  if (!assemblyAIKey) {
    throw new Error('ASSEMBLYAI_API_KEY not configured');
  }
  
  // Get temporary token from AssemblyAI
  const tokenResponse = await fetch(
    'https://api.assemblyai.com/v2/realtime/token',
    {
      method: 'POST',
      headers: {
        'Authorization': assemblyAIKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expires_in: 3600 }),
    }
  );
  
  const tokenData = await tokenResponse.json();
  return new Response(
    JSON.stringify({ token: tokenData.token }),
    { headers: corsHeaders }
  );
}
```

### Step 2: Update CallInterface Layout

Replace the current 2-column layout with 3 panels:

```text
┌───────────────────────────────────────────────────────────────────┐
│  HEADER: Phone number, status, duration, caller ID badge         │
├───────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐   │
│  │ Live Transcript  │ │ AI Coach         │ │ Live Summary     │   │
│  │                  │ │                  │ │                  │   │
│  │ (current)        │ │ LiveCoachingSideb│ │ LiveSummaryPanel │   │
│  │                  │ │                  │ │                  │   │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘   │
├───────────────────────────────────────────────────────────────────┤
│  Call Notes | Call Limit Indicator                                │
└───────────────────────────────────────────────────────────────────┘
```

### Step 3: Connect Data Flow

The transcript data flows as:

```text
Audio Stream ──▶ WebSocket ──▶ AssemblyAI ──▶ transcripts state
                                                    │
                    ┌───────────────────────────────┤
                    │                               │
                    ▼                               ▼
            LiveCoachingSidebar            LiveSummaryPanel
            (calls live-coach)             (calls live-summary)
```

### Step 4: Update config.toml

Add the `live-summary` function configuration to ensure it's deployed:

```toml
[functions.live-summary]
verify_jwt = false
```

## Technical Notes

- **AssemblyAI Real-time Tokens**: Temporary tokens expire after 1 hour (configurable)
- **Debouncing**: Both coaching and summary use 2-3 second debounce to avoid excessive API calls
- **Rate Limiting**: Edge functions handle 429 errors gracefully with user feedback
- **Coach Styles**: User's preferred coaching style is fetched via `useLiveCoaching` hook

## Summary

This reconnects the existing transcription and analysis infrastructure to the new Telnyx calling interface by:
1. Adding the missing real-time token endpoint
2. Swapping placeholder UI with functional components
3. Ensuring proper data flow from transcripts to AI analysis

After implementation, the calling interface will show:
- Real-time transcription as the conversation happens
- Live AI coaching suggestions based on the selected style
- Running summary with objections, buying signals, and next steps
