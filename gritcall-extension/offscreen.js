// GritCall Extension - Offscreen Document for Audio Capture

let mediaRecorder = null;
let audioContext = null;
let tabStream = null;
let micStream = null;
let mixedStream = null;
let recordingTabId = null;

// Audio processing nodes
let tabSource = null;
let micSource = null;
let destination = null;

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Offscreen received message:', message.type);
  
  if (message.type === 'OFFSCREEN_START_RECORDING') {
    startRecording(message.streamId, message.tabId)
      .then((result) => {
        // Send result back to background via message
        chrome.runtime.sendMessage({
          type: 'OFFSCREEN_RECORDING_STARTED',
          ...result
        });
      })
      .catch((error) => {
        chrome.runtime.sendMessage({
          type: 'OFFSCREEN_RECORDING_STARTED',
          success: false,
          error: error.message
        });
      });
    return true;
  }
  
  if (message.type === 'OFFSCREEN_STOP_RECORDING') {
    stopRecording()
      .then((result) => {
        chrome.runtime.sendMessage({
          type: 'OFFSCREEN_RECORDING_STOPPED',
          ...result
        });
      })
      .catch((error) => {
        chrome.runtime.sendMessage({
          type: 'OFFSCREEN_RECORDING_STOPPED',
          success: false,
          error: error.message
        });
      });
    return true;
  }
});

async function startRecording(streamId, tabId) {
  try {
    console.log('Starting recording with streamId:', streamId ? 'present' : 'null', 'tabId:', tabId);
    recordingTabId = tabId;
    
    // Create audio context for mixing
    audioContext = new AudioContext({ sampleRate: 48000 });
    destination = audioContext.createMediaStreamDestination();
    
    let hasTabAudio = false;
    let hasMicAudio = false;
    
    // Capture tab audio using the stream ID (if available)
    if (streamId) {
      try {
        tabStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            mandatory: {
              chromeMediaSource: 'tab',
              chromeMediaSourceId: streamId
            }
          },
          video: false
        });
        
        tabSource = audioContext.createMediaStreamSource(tabStream);
        // Add gain to boost tab audio
        const tabGain = audioContext.createGain();
        tabGain.gain.value = 1.0;
        tabSource.connect(tabGain);
        tabGain.connect(destination);
        hasTabAudio = true;
        console.log('Tab audio connected successfully');
      } catch (tabError) {
        console.warn('Failed to capture tab audio:', tabError.message);
        // Continue without tab audio
      }
    } else {
      console.log('No stream ID provided, skipping tab audio capture');
    }
    
    // Capture microphone
    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });
      
      micSource = audioContext.createMediaStreamSource(micStream);
      // Add gain for microphone
      const micGain = audioContext.createGain();
      micGain.gain.value = 1.0;
      micSource.connect(micGain);
      micGain.connect(destination);
      hasMicAudio = true;
      console.log('Microphone connected successfully');
    } catch (micError) {
      console.warn('Failed to capture microphone:', micError.message);
      // Continue without mic if we have tab audio
      if (!hasTabAudio) {
        throw new Error('No audio sources available - microphone access denied');
      }
    }
    
    // Get mixed stream
    mixedStream = destination.stream;
    
    if (mixedStream.getAudioTracks().length === 0) {
      throw new Error('No audio tracks in mixed stream');
    }
    
    // Determine MIME type
    let mimeType = 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
      mimeType = 'audio/webm';
    }
    
    console.log('Using MIME type:', mimeType);
    
    // Create MediaRecorder
    mediaRecorder = new MediaRecorder(mixedStream, {
      mimeType: mimeType,
      audioBitsPerSecond: 128000
    });
    
    // Send audio chunks to background script
    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        // Convert blob to base64 for message passing
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result.split(',')[1];
          chrome.runtime.sendMessage({
            type: 'AUDIO_CHUNK',
            data: base64data,
            mimeType: mimeType,
            timestamp: Date.now()
          });
        };
        reader.readAsDataURL(event.data);
      }
    };
    
    mediaRecorder.onerror = (error) => {
      console.error('MediaRecorder error:', error);
      chrome.runtime.sendMessage({
        type: 'RECORDING_ERROR',
        error: error.message || 'Recording error occurred'
      });
    };
    
    mediaRecorder.onstop = () => {
      console.log('MediaRecorder stopped');
    };
    
    // Start recording with 1-second chunks for real-time processing
    mediaRecorder.start(1000);
    
    console.log('Recording started with sources:', {
      hasTabAudio,
      hasMicAudio,
      mimeType,
      tracks: mixedStream.getAudioTracks().length
    });
    
    return {
      success: true,
      hasTabAudio,
      hasMicAudio
    };
  } catch (error) {
    console.error('Failed to start recording:', error);
    cleanup();
    return { success: false, error: error.message };
  }
}

async function stopRecording() {
  console.log('Stopping recording...');
  
  try {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    
    // Small delay to ensure last chunks are processed
    await new Promise(resolve => setTimeout(resolve, 500));
    
    cleanup();
    
    console.log('Recording stopped successfully');
    return { success: true };
  } catch (error) {
    console.error('Failed to stop recording:', error);
    cleanup();
    return { success: false, error: error.message };
  }
}

function cleanup() {
  console.log('Cleaning up audio resources...');
  
  // Stop all tracks
  if (tabStream) {
    tabStream.getTracks().forEach(track => {
      track.stop();
      console.log('Tab track stopped');
    });
    tabStream = null;
  }
  
  if (micStream) {
    micStream.getTracks().forEach(track => {
      track.stop();
      console.log('Mic track stopped');
    });
    micStream = null;
  }
  
  // Disconnect audio nodes
  if (tabSource) {
    try { tabSource.disconnect(); } catch (e) {}
    tabSource = null;
  }
  
  if (micSource) {
    try { micSource.disconnect(); } catch (e) {}
    micSource = null;
  }
  
  // Close audio context
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close().catch(e => console.warn('Error closing audio context:', e));
    audioContext = null;
  }
  
  destination = null;
  mixedStream = null;
  mediaRecorder = null;
  recordingTabId = null;
  
  console.log('Cleanup complete');
}

console.log('GritCall offscreen document loaded');
