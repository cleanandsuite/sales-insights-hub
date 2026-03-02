

# Switch All LLM Calls to MiniMax M2.5

## Overview

Replace all 13 edge functions currently using Groq (Llama 3.1 8B) with the MiniMax M2.5 model via MiniMax's OpenAI-compatible API. MiniMax M2.5 is a significantly more capable model with 204K context window and ~60 TPS output speed.

## Prerequisites

1. **Add `MINIMAX_API_KEY` secret** -- you'll need to provide your MiniMax API key so it can be stored securely in the backend.

## Technical Changes

Since MiniMax supports the OpenAI-compatible API format, the migration is mechanical -- same request/response shape, just different URL, key, and model name.

Each edge function changes:

```text
// FROM (Groq)
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
fetch('https://api.groq.com/openai/v1/chat/completions', {
  headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
  body: JSON.stringify({ model: 'llama-3.1-8b-instant', ... })
})

// TO (MiniMax)
const MINIMAX_API_KEY = Deno.env.get('MINIMAX_API_KEY');
fetch('https://api.minimaxi.com/v1/chat/completions', {
  headers: { 'Authorization': `Bearer ${MINIMAX_API_KEY}` },
  body: JSON.stringify({ model: 'MiniMax-M2.5', ... })
})
```

## Important Notes

- MiniMax's OpenAI-compatible endpoint does **not** support `response_format: { type: "json_object" }`. Functions that currently use this parameter will need it removed. Instead, JSON output will be enforced via the system prompt (which most functions already do).
- `temperature` must be in range (0.0, 1.0] -- any value of 0 will need to be adjusted to a small value like 0.1.
- Audio transcription (OpenAI Whisper) remains unchanged.

## Files to Modify (13 edge functions)

| # | Edge Function |
|---|---|
| 1 | `supabase/functions/ai-lead-score/index.ts` |
| 2 | `supabase/functions/analyze-conversation/index.ts` |
| 3 | `supabase/functions/analyze-recording/index.ts` |
| 4 | `supabase/functions/company-lookup/index.ts` |
| 5 | `supabase/functions/deal-coach/index.ts` |
| 6 | `supabase/functions/generate-call-summary/index.ts` |
| 7 | `supabase/functions/live-coach/index.ts` |
| 8 | `supabase/functions/live-summary/index.ts` |
| 9 | `supabase/functions/pain-detector/index.ts` |
| 10 | `supabase/functions/schedule-assistant/index.ts` |
| 11 | `supabase/functions/send-schedule-reminders/index.ts` |
| 12 | `supabase/functions/support-chat/index.ts` |
| 13 | `supabase/functions/winwords-generate/index.ts` |

## What Stays Unchanged

- `transcribe-audio` -- OpenAI Whisper (speech-to-text)
- `analyze-recording` Whisper call -- only the chat completion call changes

## Summary

- 1 new secret to add (`MINIMAX_API_KEY`)
- 13 edge functions updated (same mechanical change)
- 0 new files, 0 database changes
- Significant upgrade in model capability (204K context, reasoning model) vs previous Llama 3.1 8B

