// Audio transcoding utility - converts webm/audio to MP3 for better browser compatibility
import lamejs from '@breezystack/lamejs';

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
    
    // Get channel data for analysis
    const leftChannel = audioBuffer.getChannelData(0);
    
    // Calculate input audio statistics for debugging
    let inputMin = Infinity;
    let inputMax = -Infinity;
    let sumSquares = 0;
    for (let i = 0; i < leftChannel.length; i++) {
      const sample = leftChannel[i];
      if (sample < inputMin) inputMin = sample;
      if (sample > inputMax) inputMax = sample;
      sumSquares += sample * sample;
    }
    const inputPeak = Math.max(Math.abs(inputMin), Math.abs(inputMax));
    const inputRms = Math.sqrt(sumSquares / leftChannel.length);
    
    console.log('Audio decoded:', {
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels
    });
    
    console.log('INPUT AUDIO STATS:', {
      inputPeak: inputPeak.toFixed(6),
      inputRms: inputRms.toFixed(6),
      inputMin: inputMin.toFixed(6),
      inputMax: inputMax.toFixed(6),
      sampleCount: leftChannel.length,
      isSilent: inputPeak < 0.001
    });
    
    // Get audio data (convert to mono if stereo)
    const channels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const samples = audioBuffer.length;
    
    // Channel data already obtained above
    const rightChannel = channels > 1 ? audioBuffer.getChannelData(1) : leftChannel;
    
    // Convert to 16-bit PCM
    const leftSamples = convertFloat32ToInt16(leftChannel);
    const rightSamples = convertFloat32ToInt16(rightChannel);
    
    // Log int16 conversion stats
    let int16Peak = 0;
    for (let i = 0; i < leftSamples.length; i++) {
      const abs = Math.abs(leftSamples[i]);
      if (abs > int16Peak) int16Peak = abs;
    }
    console.log('INT16 CONVERSION:', {
      int16Peak,
      int16PeakNormalized: (int16Peak / 32767).toFixed(6),
      expectedPeak: Math.round(inputPeak * 32767)
    });
    
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
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = Math.round(s * 32767);
  }

  return int16Array;
}
