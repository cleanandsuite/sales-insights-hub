// Small helper utilities to make recorded audio reliably playable across browsers.
// Some browsers (notably Safari) record as audio/mp4, but our stored files may be named/served as .webm.
// When playback fails, we can sniff the container and re-wrap the bytes in a Blob with the correct MIME type.

export type DetectedAudioMime = 'audio/webm' | 'audio/ogg' | 'audio/mp4';

function startsWithAscii(bytes: Uint8Array, ascii: string): boolean {
  for (let i = 0; i < ascii.length; i++) {
    if (bytes[i] !== ascii.charCodeAt(i)) return false;
  }
  return true;
}

export function detectAudioMimeFromBytes(bytes: Uint8Array): DetectedAudioMime | null {
  // OGG: "OggS"
  if (bytes.length >= 4 && startsWithAscii(bytes, 'OggS')) return 'audio/ogg';

  // WebM/Matroska EBML header: 1A 45 DF A3
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return 'audio/webm';
  }

  // MP4: "....ftyp" at offset 4
  if (bytes.length >= 12 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    return 'audio/mp4';
  }

  return null;
}

export async function createPlayableObjectUrl(sourceUrl: string): Promise<{ objectUrl: string; mime: string }> {
  const res = await fetch(sourceUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch audio (${res.status})`);
  }

  const buffer = await res.arrayBuffer();
  const headerBytes = new Uint8Array(buffer.slice(0, 16));

  const detected = detectAudioMimeFromBytes(headerBytes);
  const fallback = res.headers.get('content-type') || '';
  const mime = detected || (fallback.startsWith('audio/') ? fallback : 'audio/webm');

  const blob = new Blob([buffer], { type: mime });
  const objectUrl = URL.createObjectURL(blob);
  return { objectUrl, mime: blob.type };
}
