

# Fix One-Way Audio: Enable Remote Audio Playback

## Problem

You can't hear the other party because the remote audio stream from Telnyx WebRTC is being captured for transcription but **never attached to an audio element for playback**.

The current flow:
```text
Remote Audio Stream ──▶ AudioContext (for transcription) ──▶ AssemblyAI
                       (no playback!)
```

What we need:
```text
Remote Audio Stream ──┬──▶ AudioContext (for transcription) ──▶ AssemblyAI
                      │
                      └──▶ HTMLAudioElement (for playback) ──▶ Speakers
```

## Solution

Add an `<audio>` element and attach the remote stream to it when the call connects.

## Changes Required

### 1. Update `useTelnyxCall.ts`

Add a ref for the audio element and expose the remote stream:

```typescript
// Add new ref
const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

// Add new state to expose remote stream
const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

// In startBidirectionalTranscription, after getting remoteStream:
setRemoteStream(call.remoteStream);

// Return remoteStream from hook
return {
  // ... existing returns
  remoteStream,
};
```

### 2. Update `CallInterface.tsx`

Add a hidden audio element and attach the remote stream:

```typescript
// Add ref for audio element
const remoteAudioRef = useRef<HTMLAudioElement>(null);

// Get remoteStream from hook
const { remoteStream, /* ...other */ } = useTelnyxCall();

// Effect to attach stream to audio element
useEffect(() => {
  if (remoteAudioRef.current && remoteStream) {
    remoteAudioRef.current.srcObject = remoteStream;
    remoteAudioRef.current.play().catch(console.error);
  }
}, [remoteStream]);

// In JSX, add hidden audio element
<audio ref={remoteAudioRef} autoPlay playsInline />
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useTelnyxCall.ts` | Add `remoteStream` state, expose it from hook |
| `src/components/calling/CallInterface.tsx` | Add `<audio>` element, attach stream for playback |

## Technical Notes

- The `<audio>` element with `autoPlay` will play the remote audio through your speakers
- `playsInline` ensures compatibility on mobile browsers
- The `.play()` call handles browsers that require user interaction before audio playback
- The AudioContext continues to work separately for transcription

