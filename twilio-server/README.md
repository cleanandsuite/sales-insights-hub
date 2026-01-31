# Twilio-to-AssemblyAI Phone Transcription Server

Real-time phone call transcription using Twilio Media Streams and AssemblyAI's Real-time API.

## Architecture

```
Phone Call → Twilio → This Server (/media WebSocket) → AssemblyAI → Console Transcripts
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

### 4. Configure Twilio

1. Go to [Twilio Console](https://console.twilio.com/) → Phone Numbers
2. Select your phone number
3. Under "Voice Configuration":
   - Set "A call comes in" webhook to: `https://your-ngrok-url.ngrok.io/voice`
   - Method: `POST`
4. Save

### 5. Test

Call your Twilio number and speak. Transcripts will appear in the console.

---

## Deployment

### Railway (Recommended)

1. Push this folder to a GitHub repo
2. Connect to [Railway](https://railway.app/)
3. Add environment variable: `ASSEMBLYAI_API_KEY`
4. Deploy - Railway auto-detects Node.js
5. Use the Railway URL for Twilio webhook

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
| `/voice` | POST | Twilio voice webhook (returns TwiML) |
| `/media` | WebSocket | Twilio Media Stream connection |

---

## How It Works

1. **Incoming Call**: Twilio hits `/voice` webhook
2. **TwiML Response**: Server returns XML that starts a Media Stream
3. **Audio Streaming**: Twilio sends μ-law audio over WebSocket to `/media`
4. **Transcription**: Server forwards audio to AssemblyAI Real-time API
5. **Output**: Transcripts printed to console in real-time

### Audio Format

- Encoding: μ-law (mulaw/PCMU)
- Sample Rate: 8000 Hz
- Bit Depth: 8-bit
- Channels: Mono

---

## Console Output Example

```
========================================
  Twilio-AssemblyAI Transcription Server
========================================
Server running on port 3459

[CALL] Incoming call from +1234567890
[TWILIO] Media stream connected
[TWILIO] Stream started - CallSid: CA123...
[AAI] Connected to AssemblyAI Real-time API
[AAI] Session started: abc123...
[PARTIAL] Hello how are
[FINAL] Hello, how are you doing today?
[PARTIAL] I'm calling about
[FINAL] I'm calling about my account.
[TWILIO] Stream stopped
[CALL] Call completed: 45 seconds
```

---

## Troubleshooting

### No transcripts appearing

- Verify `ASSEMBLYAI_API_KEY` is set correctly
- Check AssemblyAI dashboard for API usage
- Ensure Twilio webhook URL is correct and accessible

### WebSocket connection fails

- Confirm your deployment supports WebSockets
- Check firewall/proxy settings
- Verify HTTPS is enabled (required for Twilio)

### Audio not streaming

- Check Twilio console for Media Stream errors
- Verify the `/voice` endpoint returns valid TwiML
- Test with a simple TwiML first (just `<Say>` element)

---

## Future Enhancements

- [ ] Save transcripts to database
- [ ] Webhook callback with final transcript
- [ ] Speaker diarization
- [ ] Integration with CRM
- [ ] Call recording storage

---

## License

MIT
