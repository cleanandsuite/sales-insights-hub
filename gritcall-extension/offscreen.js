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
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (message.type === 'OFFSCREEN_STOP_RECORDING') {
    stopRecording()
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function startRecording(streamId, tabId) {
  try {
    recordingTabId = tabId;
    
    // Create audio context for mixing
    audioContext = new AudioContext({ sampleRate: 16000 });
    destination = audioContext.createMediaStreamDestination();
    
    // Capture tab audio using the stream ID
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
      tabSource.connect(destination);
      console.log('Tab audio connected');
    } catch (tabError) {
      console.warn('Failed to capture tab audio:', tabError);
      // Continue without tab audio
    }
    
    // Capture microphone
    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });
      
      micSource = audioContext.createMediaStreamSource(micStream);
      micSource.connect(destination);
      console.log('Microphone connected');
    } catch (micError) {
      console.warn('Failed to capture microphone:', micError);
      // Continue without mic if we have tab audio
      if (!tabStream) {
        throw new Error('No audio sources available');
      }
    }
    
    // Get mixed stream
    mixedStream = destination.stream;
    
    // Determine MIME type
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';
    
    // Create MediaRecorder
    mediaRecorder = new MediaRecorder(mixedStream, {
      mimeType: mimeType,
      audioBitsPerSecond: 64000
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
        error: error.message || 'Recording error'
      });
    };
    
    // Start recording with 1-second chunks for real-time processing
    mediaRecorder.start(1000);
    
    console.log('Recording started with sources:', {
      hasTabAudio: !!tabStream,
      hasMicAudio: !!micStream,
      mimeType: mimeType
    });
    
    return {
      success: true,
      hasTabAudio: !!tabStream,
      hasMicAudio: !!micStream
    };
  } catch (error) {
    console.error('Failed to start recording:', error);
    cleanup();
    return { success: false, error: error.message };
  }
}

async function stopRecording() {
  try {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    
    cleanup();
    
    console.log('Recording stopped');
    return { success: true };
  } catch (error) {
    console.error('Failed to stop recording:', error);
    cleanup();
    return { success: false, error: error.message };
  }
}

function cleanup() {
  // Stop all tracks
  if (tabStream) {
    tabStream.getTracks().forEach(track => track.stop());
    tabStream = null;
  }
  
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
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
    audioContext.close();
    audioContext = null;
  }
  
  destination = null;
  mixedStream = null;
  mediaRecorder = null;
  recordingTabId = null;
}

console.log('GritCall offscreen document loaded');
