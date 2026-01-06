// Audio transcoding utility - converts webm/audio to MP3 for better browser compatibility
import lamejs from 'lamejs';

interface TranscodeResult {
  blob: Blob;
  duration: number;
}

/**
 * Transcode audio blob to MP3 format using lamejs
 * This ensures maximum browser compatibility for playback
 */
export async function transcodeToMp3(audioBlob: Blob): Promise<TranscodeResult> {
  console.log('Transcoding audio to MP3, input size:', audioBlob.size, 'type:', audioBlob.type);
  
  // Create audio context to decode the audio
  const audioContext = new AudioContext();
  
  try {
    // Convert blob to ArrayBuffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    
    // Decode the audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    console.log('Audio decoded:', {
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels
    });
    
    // Get audio data (convert to mono if stereo)
    const channels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const samples = audioBuffer.length;
    
    // Get channel data
    const leftChannel = audioBuffer.getChannelData(0);
    const rightChannel = channels > 1 ? audioBuffer.getChannelData(1) : leftChannel;
    
    // Convert to 16-bit PCM
    const leftSamples = convertFloat32ToInt16(leftChannel);
    const rightSamples = convertFloat32ToInt16(rightChannel);
    
    // Initialize MP3 encoder
    // Use 128kbps for good quality/size balance
    const mp3Encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);
    
    const mp3Data: Int8Array[] = [];
    const blockSize = 1152; // MP3 frame size
    
    // Encode in blocks
    for (let i = 0; i < samples; i += blockSize) {
      const leftChunk = leftSamples.subarray(i, Math.min(i + blockSize, samples));
      const rightChunk = rightSamples.subarray(i, Math.min(i + blockSize, samples));
      
      let mp3buf: Int8Array;
      if (channels === 1) {
        mp3buf = mp3Encoder.encodeBuffer(leftChunk);
      } else {
        mp3buf = mp3Encoder.encodeBuffer(leftChunk, rightChunk);
      }
      
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }
    
    // Flush remaining data
    const mp3End = mp3Encoder.flush();
    if (mp3End.length > 0) {
      mp3Data.push(mp3End);
    }
    
    // Combine all MP3 data
    const totalLength = mp3Data.reduce((acc, buf) => acc + buf.length, 0);
    const mp3Array = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of mp3Data) {
      mp3Array.set(new Uint8Array(buf.buffer, buf.byteOffset, buf.length), offset);
      offset += buf.length;
    }
    
    const mp3Blob = new Blob([mp3Array], { type: 'audio/mpeg' });
    
    console.log('MP3 transcoding complete:', {
      inputSize: audioBlob.size,
      outputSize: mp3Blob.size,
      duration: audioBuffer.duration
    });
    
    return {
      blob: mp3Blob,
      duration: audioBuffer.duration
    };
  } finally {
    await audioContext.close();
  }
}

/**
 * Convert Float32Array audio samples to Int16Array for MP3 encoding
 */
function convertFloat32ToInt16(float32Array: Float32Array): Int16Array {
  const int16Array = new Int16Array(float32Array.length);
  
  for (let i = 0; i < float32Array.length; i++) {
    // Clamp the value between -1 and 1
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    // Convert to 16-bit signed integer
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  return int16Array;
}
