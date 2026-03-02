

# Switch All LLM Calls to Groq Llama 3.1 8B Instant

## Overview

Replace every AI model call across all 13 edge functions with Groq's API (`https://api.groq.com/openai/v1/chat/completions`) using the `llama-3.1-8b-instant` model. The `GROQ_API_KEY` secret is already configured.

## Important Note

Llama 3.1 8B Instant is a fast, lightweight model. It will be significantly cheaper and faster than the current Gemini/GPT models, but it has less reasoning capability. Complex analysis (deal coaching, pain detection, recording analysis) may produce lower-quality results. This is a tradeoff worth being aware of.

Also, the two audio transcription calls (Whisper via OpenAI) will remain unchanged since Groq doesn't replace speech-to-text in the same way -- those are transcription endpoints, not chat completions.

## Changes Per File

Every file below gets the same two changes:
1. **URL**: `https://ai.gateway.lovable.dev/v1/chat/completions` or `https://api.openai.com/v1/chat/completions` becomes `https://api.groq.com/openai/v1/chat/completions`
2. **Auth header**: `Bearer ${LOVABLE_API_KEY}` or `Bearer ${openAIKey}` becomes `Bearer ${GROQ_API_KEY}` (read from `Deno.env.get('GROQ_API_KEY')`)
3. **Model**: becomes `llama-3.1-8b-instant`

| # | Edge Function | Current Model | Current Gateway |
|---|---|---|---|
| 1 | `ai-lead-score` | gemini-2.5-flash | Lovable |
| 2 | `analyze-conversation` | gpt-4o-mini | OpenAI direct |
| 3 | `analyze-recording` | gpt-4o-mini | OpenAI direct (chat only, not Whisper) |
| 4 | `company-lookup` | gemini-2.5-flash | Lovable (2 calls) |
| 5 | `deal-coach` | gemini-2.5-flash | Lovable |
| 6 | `generate-call-summary` | gemini-2.5-flash | Lovable |
| 7 | `live-coach` | gemini-2.5-flash | Lovable |
| 8 | `live-summary` | gemini-2.5-flash | Lovable |
| 9 | `pain-detector` | gemini-2.5-flash | Lovable |
| 10 | `schedule-assistant` | gemini-2.5-flash | Lovable (multiple calls) |
| 11 | `send-schedule-reminders` | gemini-2.5-flash-lite | Lovable |
| 12 | `support-chat` | gemini-3-flash-preview | Lovable |
| 13 | `winwords-generate` | gemini-2.5-flash | Lovable |

## What Stays Unchanged

- **`transcribe-audio`** -- uses OpenAI Whisper (`/v1/audio/transcriptions`), not a chat model
- **`analyze-recording`** Whisper call -- same reason; only its chat completion call changes

## Technical Pattern

Each function changes from:

```text
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
  headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}` },
  body: JSON.stringify({ model: 'google/gemini-2.5-flash', ... })
})
```

To:

```text
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
fetch('https://api.groq.com/openai/v1/chat/completions', {
  headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
  body: JSON.stringify({ model: 'llama-3.1-8b-instant', ... })
})
```

For functions that used `response_format: { type: "json_object" }` (OpenAI-style), Groq supports this parameter for Llama 3.1 models, so those will continue to work.

## Summary

- **13 edge functions** modified (same mechanical change in each)
- **0 new files** created
- **0 database changes**
- All functions already deployed automatically after edit

