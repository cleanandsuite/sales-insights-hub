

# Twilio-to-AssemblyAI Phone Transcription Server

## Overview

This plan implements a real-time phone call transcription system that:
1. Receives incoming calls via Twilio
2. Streams audio to AssemblyAI's Universal-Streaming API
3. Outputs live transcripts to the console

## Architecture

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Phone Call    │────▶│     Twilio      │────▶│   Your Server   │
│   (Caller)      │     │  Media Streams  │     │  (Edge Func)    │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         │ WebSocket
                                                         ▼
                                                ┌─────────────────┐
                                                │   AssemblyAI    │
                                                │ Universal Stream│
                                                └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │   Transcripts   │
                                                │   (Console/DB)  │
                                                └─────────────────┘
```

## Important Consideration: Edge Function Limitations

Lovable Cloud uses Supabase Edge Functions (Deno runtime), which have a key limitation:

- **Edge Functions cannot act as persistent WebSocket servers** - They are designed for request/response patterns with a maximum execution time
- Twilio Media Streams require a **persistent WebSocket server** to receive streaming audio

### Solution: Standalone Node.js Server

I'll create a complete Node.js Express server as a **standalone deployable package** in a dedicated `twilio-server/` directory. This can be deployed to:
- **Railway** (recommended - easy WebSocket support)
- **Render**
- **Heroku**
- **Any VPS** (DigitalOcean, AWS EC2, etc.)

---

## Implementation Details

### Files to Create

```text
twilio-server/
├── index.js              # Main server entry point
├── package.json          # Dependencies and scripts
├── .env.example          # Environment variable template
└── README.md             # Deployment instructions
```

### 1. Main Server (`twilio-server/index.js`)

**Endpoints:**
- `POST /voice` - Twilio webhook for incoming calls, returns TwiML
- `WebSocket /media` - Receives Twilio Media Stream audio

**Key Logic:**

```text
1. POST /voice Handler:
   ├── Return TwiML XML response
   ├── Play greeting: "Connected to transcription service..."
   └── Start Media Stream to wss://{host}/media

2. WebSocket /media Handler:
   ├── On 'start' event → Extract callSid, create AssemblyAI connection
   ├── On 'media' event → Decode base64 μ-law → Forward to AssemblyAI
   ├── On 'stop' event → Close connections, log call duration
   └── Buffer audio chunks (min 480 bytes = 60ms @ 8kHz)

3. AssemblyAI Integration:
   ├── Connect to: wss://streaming.assemblyai.com/v3/ws
   ├── Query params: encoding=pcm_mulaw, sample_rate=8000, format_turns=true
   ├── Send raw μ-law audio bytes
   └── Receive Turn objects with immutable transcripts
```

### 2. Package Configuration (`twilio-server/package.json`)

```json
{
  "name": "twilio-assemblyai-transcription",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.14.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 3. Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ASSEMBLYAI_API_KEY` | Your AssemblyAI API key | `abc123...` |
| `PORT` | Server port (default: 3459) | `3459` |

---

## Technical Specifications

### Audio Format
- **Encoding:** μ-law (mulaw/PCMU)
- **Sample Rate:** 8000 Hz
- **Bit Depth:** 8-bit
- **Channels:** Mono

### AssemblyAI Universal-Streaming v3 Response

Each transcript message is a "Turn" object:
```json
{
  "type": "Turn",
  "transcript": "Hello, I would like to...",
  "end_of_turn": true,
  "turn_order": 1,
  "end_of_turn_confidence": 0.95,
  "turn_is_formatted": true,
  "words": [...]
}
```

### Buffering Strategy
- Minimum buffer: 480 bytes (60ms of audio)
- Skip silent audio (all 0xFF bytes) before AssemblyAI connects
- Flush remaining buffer on call end

---

## Deployment Steps

1. **Deploy the server** to Railway/Render/Heroku
2. **Get the public URL** (e.g., `https://your-app.railway.app`)
3. **Configure Twilio:**
   - Go to Twilio Console → Phone Numbers
   - Set Voice Configuration URL to: `https://your-app.railway.app/voice`
   - Method: POST
4. **Test:** Call your Twilio number and watch transcripts appear in logs

---

## Optional Enhancements (Future)

After the core implementation works:

1. **Save transcripts to database** - Store in `call_transcripts` table
2. **Webhook for transcript completion** - POST final transcript to a callback URL
3. **Call recording storage** - Save audio to Lovable Cloud storage
4. **Integration with existing analysis** - Feed transcripts into `analyze-recording` function

---

## Files Summary

| File | Purpose |
|------|---------|
| `twilio-server/index.js` | Express server with WebSocket handling |
| `twilio-server/package.json` | Node.js dependencies |
| `twilio-server/.env.example` | Environment variable template |
| `twilio-server/README.md` | Setup and deployment guide |

