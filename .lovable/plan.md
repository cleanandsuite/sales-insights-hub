

# Switch All LLM Calls from MiniMax M2.5 to DeepSeek V3

## Overview

Replace all 13 edge functions currently using MiniMax M2.5 with DeepSeek V3 via its OpenAI-compatible API. DeepSeek V3 is a high-performance model with 128K context and strong reasoning capabilities.

## Prerequisites

The `DEEPSEEK_V3_API_KEY` secret is already configured -- no new secrets needed.

## Technical Changes

Same mechanical migration as before -- DeepSeek uses the standard OpenAI-compatible format.

Each edge function changes:

```text
// FROM (MiniMax)
const MINIMAX_API_KEY = Deno.env.get('MINIMAX_API_KEY');
fetch('https://api.minimaxi.com/v1/chat/completions', {
  headers: { 'Authorization': `Bearer ${MINIMAX_API_KEY}` },
  body: JSON.stringify({ model: 'MiniMax-M2.5', ... })
})

// TO (DeepSeek V3)
const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_V3_API_KEY');
fetch('https://api.deepseek.com/chat/completions', {
  headers: { 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
  body: JSON.stringify({ model: 'deepseek-chat', ... })
})
```

## Important Notes

- DeepSeek's API supports `response_format: { type: "json_object" }`, but since we already removed it during the MiniMax migration and use regex-based JSON extraction, we'll keep that approach for consistency.
- DeepSeek supports `temperature` in range [0, 2], so no adjustments needed.
- The `support-chat` function uses streaming -- DeepSeek supports SSE streaming identically.
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
- All JSON parsing logic (regex extraction) stays as-is

## Summary

- 0 new secrets (DEEPSEEK_V3_API_KEY already exists)
- 13 edge functions updated (mechanical find-and-replace)
- 0 new files, 0 database changes

