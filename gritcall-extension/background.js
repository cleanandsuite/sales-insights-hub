// GritCall Extension - Background Service Worker

let isRecording = false;
let offscreenDocumentCreated = false;

// Create offscreen document for audio capture
async function ensureOffscreenDocument() {
  if (offscreenDocumentCreated) return;
  
  try {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA', 'AUDIO_PLAYBACK'],
      justification: 'Recording tab audio and microphone for call transcription'
    });
    offscreenDocumentCreated = true;
    console.log('Offscreen document created');
  } catch (error) {
    if (error.message?.includes('already exists')) {
      offscreenDocumentCreated = true;
    } else {
      console.error('Failed to create offscreen document:', error);
      throw error;
    }
  }
}

// Close offscreen document
async function closeOffscreenDocument() {
  if (!offscreenDocumentCreated) return;
  
  try {
    await chrome.offscreen.closeDocument();
    offscreenDocumentCreated = false;
    console.log('Offscreen document closed');
  } catch (error) {
    console.error('Failed to close offscreen document:', error);
  }
}

// Get tab capture stream ID
async function getTabCaptureStreamId(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabCapture.getMediaStreamId({ targetTabId: tabId }, (streamId) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(streamId);
      }
    });
  });
}

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message.type);
  
  if (message.type === 'START_RECORDING') {
    handleStartRecording(sender.tab?.id || message.tabId)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'STOP_RECORDING') {
    handleStopRecording()
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (message.type === 'GET_STATUS') {
    sendResponse({ isRecording, extensionInstalled: true });
    return false;
  }
  
  if (message.type === 'AUDIO_CHUNK') {
    // Forward audio chunk to content script
    forwardToContentScript(message);
    return false;
  }
  
  if (message.type === 'PING') {
    sendResponse({ pong: true, extensionInstalled: true });
    return false;
  }
});

async function handleStartRecording(tabId) {
  if (isRecording) {
    return { success: false, error: 'Already recording' };
  }
  
  try {
    // Ensure offscreen document exists
    await ensureOffscreenDocument();
    
    // Get the tab capture stream ID
    const streamId = await getTabCaptureStreamId(tabId);
    console.log('Got stream ID for tab:', tabId);
    
    // Send to offscreen document to start recording
    const response = await chrome.runtime.sendMessage({
      type: 'OFFSCREEN_START_RECORDING',
      streamId: streamId,
      tabId: tabId
    });
    
    if (response?.success) {
      isRecording = true;
      // Notify all tabs that recording has started
      broadcastToTabs({ type: 'RECORDING_STARTED' });
    }
    
    return response || { success: false, error: 'No response from offscreen' };
  } catch (error) {
    console.error('Failed to start recording:', error);
    return { success: false, error: error.message };
  }
}

async function handleStopRecording() {
  if (!isRecording) {
    return { success: false, error: 'Not recording' };
  }
  
  try {
    // Tell offscreen document to stop
    const response = await chrome.runtime.sendMessage({
      type: 'OFFSCREEN_STOP_RECORDING'
    });
    
    isRecording = false;
    
    // Notify all tabs that recording has stopped
    broadcastToTabs({ type: 'RECORDING_STOPPED' });
    
    // Close offscreen document after a delay
    setTimeout(() => closeOffscreenDocument(), 1000);
    
    return response || { success: true };
  } catch (error) {
    console.error('Failed to stop recording:', error);
    isRecording = false;
    return { success: false, error: error.message };
  }
}

// Forward messages to content scripts in GritCall tabs
async function forwardToContentScript(message) {
  try {
    const tabs = await chrome.tabs.query({
      url: ['https://*.lovable.app/*', 'http://localhost:*/*']
    });
    
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, message);
      } catch (e) {
        // Tab might not have content script loaded
      }
    }
  } catch (error) {
    console.error('Failed to forward to content script:', error);
  }
}

// Broadcast message to all matching tabs
async function broadcastToTabs(message) {
  await forwardToContentScript(message);
}

// Handle extension icon click (alternative to popup)
chrome.action.onClicked.addListener(async (tab) => {
  // If popup is defined, this won't fire
  // This is a fallback if we remove the popup
});

console.log('GritCall extension background script loaded');
