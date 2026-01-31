require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3459;
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;

// Track active calls
const activeCalls = new Map();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Twilio-AssemblyAI Transcription Server',
    activeCalls: activeCalls.size 
  });
});

// Twilio Voice Webhook - returns TwiML
app.post('/voice', (req, res) => {
  const host = req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  
  console.log(`[CALL] Incoming call from ${req.body.From || 'unknown'}`);
  
  // Return TwiML that starts a Media Stream
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Connected to transcription service. Your call is being transcribed.</Say>
  <Connect>
    <Stream url="wss://${host}/media" />
  </Connect>
</Response>`;

  res.type('text/xml');
  res.send(twiml);
});

// WebSocket handler for Twilio Media Streams
wss.on('connection', (ws, req) => {
  // Only handle /media path
  if (req.url !== '/media') {
    ws.close();
    return;
  }

  console.log('[WS] New Twilio Media Stream connection');
  
  let callSid = null;
  let streamSid = null;
  let callStartTime = null;
  let assemblyAISocket = null;
  let audioBuffer = Buffer.alloc(0);
  const MIN_BUFFER_SIZE = 480; // 60ms at 8kHz

  // Create AssemblyAI WebSocket connection
  const connectToAssemblyAI = () => {
    if (!ASSEMBLYAI_API_KEY) {
      console.error('[ERROR] ASSEMBLYAI_API_KEY not configured');
      return null;
    }

    const wsUrl = `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=8000&encoding=pcm_mulaw`;
    
    const aaiSocket = new WebSocket(wsUrl, {
      headers: {
        'Authorization': ASSEMBLYAI_API_KEY
      }
    });

    aaiSocket.on('open', () => {
      console.log('[AAI] Connected to AssemblyAI Real-time API');
    });

    aaiSocket.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.message_type === 'PartialTranscript' && message.text) {
          process.stdout.write(`\r[PARTIAL] ${message.text}                    `);
        } else if (message.message_type === 'FinalTranscript' && message.text) {
          console.log(`\n[FINAL] ${message.text}`);
        } else if (message.message_type === 'SessionBegins') {
          console.log(`[AAI] Session started: ${message.session_id}`);
        }
      } catch (err) {
        console.error('[AAI] Error parsing message:', err.message);
      }
    });

    aaiSocket.on('error', (err) => {
      console.error('[AAI] WebSocket error:', err.message);
    });

    aaiSocket.on('close', (code, reason) => {
      console.log(`[AAI] Connection closed: ${code} - ${reason || 'No reason'}`);
    });

    return aaiSocket;
  };

  // Handle messages from Twilio
  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message.toString());

      switch (msg.event) {
        case 'connected':
          console.log('[TWILIO] Media stream connected');
          break;

        case 'start':
          callSid = msg.start.callSid;
          streamSid = msg.start.streamSid;
          callStartTime = Date.now();
          
          console.log(`[TWILIO] Stream started - CallSid: ${callSid}`);
          console.log(`[TWILIO] StreamSid: ${streamSid}`);
          console.log(`[TWILIO] Media format: ${JSON.stringify(msg.start.mediaFormat)}`);
          
          // Store call info
          activeCalls.set(callSid, {
            streamSid,
            startTime: callStartTime,
            transcripts: []
          });
          
          // Connect to AssemblyAI
          assemblyAISocket = connectToAssemblyAI();
          break;

        case 'media':
          if (!assemblyAISocket || assemblyAISocket.readyState !== WebSocket.OPEN) {
            return;
          }

          // Decode base64 μ-law audio
          const audioChunk = Buffer.from(msg.media.payload, 'base64');
          
          // Skip silent audio (all 0xFF bytes in μ-law = silence)
          const isSilent = audioChunk.every(byte => byte === 0xFF);
          if (isSilent) return;

          // Add to buffer
          audioBuffer = Buffer.concat([audioBuffer, audioChunk]);

          // Send when buffer reaches minimum size
          if (audioBuffer.length >= MIN_BUFFER_SIZE) {
            // Send as base64 to AssemblyAI
            const audioData = JSON.stringify({
              audio_data: audioBuffer.toString('base64')
            });
            assemblyAISocket.send(audioData);
            audioBuffer = Buffer.alloc(0);
          }
          break;

        case 'stop':
          const duration = callStartTime 
            ? Math.round((Date.now() - callStartTime) / 1000) 
            : 0;
          
          console.log(`\n[TWILIO] Stream stopped - CallSid: ${callSid}`);
          console.log(`[CALL] Call completed: ${duration} seconds`);
          
          // Flush remaining buffer
          if (assemblyAISocket && assemblyAISocket.readyState === WebSocket.OPEN && audioBuffer.length > 0) {
            const audioData = JSON.stringify({
              audio_data: audioBuffer.toString('base64')
            });
            assemblyAISocket.send(audioData);
          }
          
          // Send terminate message to AssemblyAI
          if (assemblyAISocket && assemblyAISocket.readyState === WebSocket.OPEN) {
            assemblyAISocket.send(JSON.stringify({ terminate_session: true }));
            setTimeout(() => {
              if (assemblyAISocket.readyState === WebSocket.OPEN) {
                assemblyAISocket.close();
              }
            }, 1000);
          }
          
          // Remove from active calls
          if (callSid) {
            activeCalls.delete(callSid);
          }
          break;

        default:
          console.log(`[TWILIO] Unknown event: ${msg.event}`);
      }
    } catch (err) {
      console.error('[WS] Error processing message:', err.message);
    }
  });

  ws.on('close', () => {
    console.log('[WS] Twilio connection closed');
    
    // Clean up AssemblyAI connection
    if (assemblyAISocket && assemblyAISocket.readyState === WebSocket.OPEN) {
      assemblyAISocket.close();
    }
    
    // Remove from active calls
    if (callSid) {
      activeCalls.delete(callSid);
    }
  });

  ws.on('error', (err) => {
    console.error('[WS] Twilio WebSocket error:', err.message);
  });
});

// Start server
server.listen(PORT, () => {
  console.log('========================================');
  console.log('  Twilio-AssemblyAI Transcription Server');
  console.log('========================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`Voice webhook: POST /voice`);
  console.log(`Media stream:  WSS /media`);
  console.log('');
  console.log('Configure your Twilio number webhook to:');
  console.log(`  https://your-domain.com/voice`);
  console.log('========================================');
  
  if (!ASSEMBLYAI_API_KEY) {
    console.warn('\n⚠️  WARNING: ASSEMBLYAI_API_KEY not set!');
    console.warn('   Transcription will not work without it.\n');
  }
});
