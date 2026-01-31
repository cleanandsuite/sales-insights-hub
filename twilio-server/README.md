# Telnyx-to-AssemblyAI Phone Transcription Server

Real-time phone call transcription using Telnyx Media Streams and AssemblyAI's Real-time API.

## Architecture

```
Phone Call → Telnyx → This Server (/media WebSocket) → AssemblyAI → Console Transcripts
```

## Quick Start

### 1. Install Dependencies

```bash
cd twilio-server
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your AssemblyAI API key:

```
ASSEMBLYAI_API_KEY=your_key_here
PORT=3459
```

### 3. Run Locally (for testing with ngrok)

```bash
npm run dev
```

In another terminal, expose with ngrok:

```bash
ngrok http 3459
```

### 4. Configure Telnyx

1. Go to [Telnyx Mission Control Portal](https://portal.telnyx.com/)
2. Navigate to **Voice** → **TeXML Applications**
3. Create a new TeXML Application or edit an existing one
4. Set the **Voice URL** to: `https://your-ngrok-url.ngrok.io/voice`
5. Method: `POST`
6. Save the application
7. Go to **Numbers** and assign a phone number to this TeXML Application

### 5. Test

Call your Telnyx number and speak. Transcripts will appear in the console.

---

## Deployment

### Railway (Recommended)

1. Push this folder to a GitHub repo
2. Connect to [Railway](https://railway.app/)
3. Add environment variable: `ASSEMBLYAI_API_KEY`
4. Deploy - Railway auto-detects Node.js
5. Use the Railway URL for Telnyx webhook

### Render

1. Create new Web Service on [Render](https://render.com/)
2. Connect your repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variable: `ASSEMBLYAI_API_KEY`

### Heroku

```bash
heroku create your-app-name
heroku config:set ASSEMBLYAI_API_KEY=your_key_here
git push heroku main
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/voice` | POST | Telnyx voice webhook (returns TeXML) |
| `/media` | WebSocket | Telnyx Media Stream connection |

---

## How It Works

1. **Incoming Call**: Telnyx hits `/voice` webhook
2. **TeXML Response**: Server returns XML that starts a Media Stream
3. **Audio Streaming**: Telnyx sends μ-law audio over WebSocket to `/media`
4. **Transcription**: Server forwards audio to AssemblyAI Real-time API
5. **Output**: Transcripts printed to console in real-time

### Audio Format

- Encoding: μ-law (mulaw/PCMU)
- Sample Rate: 8000 Hz
- Bit Depth: 8-bit
- Channels: Mono

### Telnyx vs Twilio Differences

| Aspect | Telnyx | Twilio |
|--------|--------|--------|
| Voice Response | TeXML | TwiML |
| Call Identifier | `call_control_id` | `callSid` |
| Stream Identifier | `stream_id` | `streamSid` |
| Audio Format | PCMU @ 8kHz | PCMU @ 8kHz |

---

## Console Output Example

```
========================================
  Telnyx-AssemblyAI Transcription Server
========================================
Server running on port 3459

[CALL] Incoming call from +1234567890
[TELNYX] Media stream connected
[TELNYX] Stream started - CallControlId: v2:abc123...
[TELNYX] StreamId: 32DE0DEA-...
[TELNYX] From: +1234567890 To: +0987654321
[AAI] Connected to AssemblyAI Real-time API
[AAI] Session started: abc123...
[PARTIAL] Hello how are
[FINAL] Hello, how are you doing today?
[PARTIAL] I'm calling about
[FINAL] I'm calling about my account.
[TELNYX] Stream stopped
[CALL] Call completed: 45 seconds
```

---

## Troubleshooting

### No transcripts appearing

- Verify `ASSEMBLYAI_API_KEY` is set correctly
- Check AssemblyAI dashboard for API usage
- Ensure Telnyx webhook URL is correct and accessible

### WebSocket connection fails

- Confirm your deployment supports WebSockets
- Check firewall/proxy settings
- Verify HTTPS is enabled (required for Telnyx)

### Audio not streaming

- Check Telnyx portal for Media Stream errors
- Verify the `/voice` endpoint returns valid TeXML
- Test with a simple TeXML first (just `<Say>` element)

### Telnyx-specific issues

- Ensure your TeXML Application is properly configured
- Check that your phone number is assigned to the correct application
- Verify the Voice URL method is set to POST

---

## Future Enhancements

- [ ] Save transcripts to database
- [ ] Webhook callback with final transcript
- [ ] Speaker diarization
- [ ] Integration with CRM
- [ ] Call recording storage
- [ ] Outbound call support via Telnyx Call Control API

---

## License

MIT
