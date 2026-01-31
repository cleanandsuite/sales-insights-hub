

# Migrate Twilio Server to Telnyx for Phone Transcription

## Overview

This plan modifies the existing `twilio-server/` to support **Telnyx** as the telephony provider instead of Twilio, while keeping AssemblyAI for transcription.

## Key Differences: Twilio vs Telnyx

| Aspect | Twilio | Telnyx |
|--------|--------|--------|
| Voice Response Format | TwiML | TeXML (similar syntax) |
| Media Stream Events | `connected`, `start`, `media`, `stop` | `start`, `media`, `stop` |
| Audio Encoding | PCMU (μ-law) @ 8kHz | PCMU (μ-law) @ 8kHz |
| Call Identifier | `callSid` | `call_control_id` |
| Stream Identifier | `streamSid` | `stream_id` |

The good news: The audio format is identical, so AssemblyAI integration remains unchanged.

## Architecture

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Phone Call    │────▶│     Telnyx      │────▶│   Your Server   │
│   (Caller)      │     │  Media Streams  │     │  (Node.js)      │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         │ WebSocket
                                                         ▼
                                                ┌─────────────────┐
                                                │   AssemblyAI    │
                                                │   Real-time     │
                                                └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │   Transcripts   │
                                                │   (Console)     │
                                                └─────────────────┘
```

---

## Implementation Changes

### 1. Update `/voice` Endpoint to Return TeXML

**Current (Twilio TwiML):**
```xml
<Response>
  <Say>Connected to transcription service...</Say>
  <Connect>
    <Stream url="wss://host/media" />
  </Connect>
</Response>
```

**New (Telnyx TeXML):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="female">Connected to transcription service. Your call is being transcribed.</Say>
  <Stream url="wss://host/media" bidirectionalMode="rtp" />
</Response>
```

### 2. Update WebSocket Handler for Telnyx Event Structure

Telnyx media stream events use slightly different field names:

**Start Event:**
```json
{
  "event": "start",
  "sequence_number": "1",
  "start": {
    "call_control_id": "v2:xxxxx",
    "call_session_id": "ff55a038-...",
    "from": "+13122010094",
    "to": "+13122123456",
    "media_format": {
      "encoding": "PCMU",
      "sample_rate": 8000,
      "channels": 1
    }
  },
  "stream_id": "32DE0DEA-..."
}
```

**Media Event:**
```json
{
  "event": "media",
  "sequence_number": "42",
  "media": {
    "track": "inbound",
    "payload": "base64-encoded-audio"
  },
  "stream_id": "32DE0DEA-..."
}
```

**Stop Event:**
```json
{
  "event": "stop",
  "sequence_number": "100",
  "stream_id": "32DE0DEA-..."
}
```

### 3. Files to Modify

| File | Changes |
|------|---------|
| `twilio-server/index.js` | Rename to handle both, update event parsing, update TeXML response |
| `twilio-server/README.md` | Update Telnyx configuration instructions |
| `twilio-server/.env.example` | Add Telnyx-specific notes |

---

## Technical Details

### Updated index.js Changes

1. **Health endpoint**: Update service name to "Telnyx-AssemblyAI Transcription Server"

2. **POST /voice handler**:
   - Return TeXML instead of TwiML
   - Use Telnyx Stream element syntax
   - Log caller info from Telnyx webhook fields

3. **WebSocket /media handler**:
   - Extract `call_control_id` instead of `callSid`
   - Extract `stream_id` instead of `streamSid`  
   - Parse media from `msg.media.payload` (same format)
   - Handle Telnyx-specific `sequence_number` for ordering

4. **Console logging**:
   - Update log prefixes from `[TWILIO]` to `[TELNYX]`

### Audio Flow (Unchanged)

Since Telnyx uses the same PCMU encoding at 8000Hz:
- No changes needed to AssemblyAI connection
- No changes to audio buffering logic
- No changes to silence detection

---

## Deployment Steps

After implementation:

1. Deploy updated server to Railway/Render
2. Configure Telnyx:
   - Go to Telnyx Mission Control Portal
   - Create or select a TeXML Application
   - Set Voice URL to: `https://your-server.com/voice`
   - Assign a phone number to this application
3. Test by calling the Telnyx number

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `twilio-server/index.js` | Modify | Update for Telnyx TeXML and event structure |
| `twilio-server/README.md` | Modify | Update with Telnyx setup instructions |
| `twilio-server/.env.example` | Minor update | Keep same vars, update comments |
| `twilio-server/package.json` | Modify | Update name/description |

