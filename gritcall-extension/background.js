// GritCall Extension - Background Service Worker

let isRecording = false;
let offscreenDocumentCreated = false;
let recordingTabId = null;

// Create offscreen document for audio capture
async function ensureOffscreenDocument() {
  if (offscreenDocumentCreated) return;
  
  // Check if document already exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL('offscreen.html')]
  });
  
  if (existingContexts.length > 0) {
    offscreenDocumentCreated = true;
    return;
  }
  
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
    offscreenDocumentCreated = false;
  }
}

// Get tab capture stream ID
async function getTabCaptureStreamId(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabCapture.getMediaStreamId({ targetTabId: tabId }, (streamId) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (!streamId) {
        reject(new Error('Failed to get stream ID'));
      } else {
        resolve(streamId);
      }
    });
  });
}

// Handle messages from content script, popup, and offscreen document
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message.type, 'from:', sender.url || 'unknown');
  
  if (message.type === 'START_RECORDING') {
    // Get the tab ID from sender or active tab
    const getTabId = async () => {
      if (sender.tab?.id) {
        return sender.tab.id;
      }
      // Get active tab
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return activeTab?.id;
    };
    
    getTabId()
      .then(tabId => {
        if (!tabId) {
          throw new Error('Could not determine tab ID');
        }
        return handleStartRecording(tabId);
      })
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
  
  // Messages from offscreen document
  if (message.type === 'AUDIO_CHUNK') {
    // Forward audio chunk to content script in the recording tab
    forwardToContentScript(message);
    return false;
  }
  
  if (message.type === 'RECORDING_ERROR') {
    console.error('Recording error from offscreen:', message.error);
    isRecording = false;
    broadcastToTabs({ type: 'RECORDING_ERROR', error: message.error });
    return false;
  }
  
  if (message.type === 'OFFSCREEN_RECORDING_RESULT') {
    // Response from offscreen document about recording start
    console.log('Offscreen recording result:', message);
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
  
  console.log('Starting recording for tab:', tabId);
  recordingTabId = tabId;
  
  try {
    // Ensure offscreen document exists
    await ensureOffscreenDocument();
    
    // Small delay to ensure offscreen document is ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get the tab capture stream ID
    let streamId;
    try {
      streamId = await getTabCaptureStreamId(tabId);
      console.log('Got stream ID for tab:', tabId, streamId ? 'success' : 'failed');
    } catch (streamError) {
      console.error('Failed to get tab capture stream:', streamError);
      // Continue without tab audio - we'll still capture microphone
      streamId = null;
    }
    
    // Send message to offscreen document to start recording
    // Using chrome.runtime.sendMessage since offscreen is part of the extension
    return new Promise((resolve) => {
      const messageHandler = (response, responseSender) => {
        if (response?.type === 'OFFSCREEN_RECORDING_STARTED') {
          chrome.runtime.onMessage.removeListener(messageHandler);
          
          if (response.success) {
            isRecording = true;
            // Notify all tabs that recording has started
            broadcastToTabs({ 
              type: 'RECORDING_STARTED',
              hasTabAudio: response.hasTabAudio,
              hasMicAudio: response.hasMicAudio
            });
          }
          
          resolve({
            success: response.success,
            error: response.error,
            hasTabAudio: response.hasTabAudio,
            hasMicAudio: response.hasMicAudio
          });
        }
      };
      
      chrome.runtime.onMessage.addListener(messageHandler);
      
      // Send to offscreen document
      chrome.runtime.sendMessage({
        type: 'OFFSCREEN_START_RECORDING',
        streamId: streamId,
        tabId: tabId
      });
      
      // Timeout after 15 seconds
      setTimeout(() => {
        chrome.runtime.onMessage.removeListener(messageHandler);
        resolve({ success: false, error: 'Timeout waiting for recording to start' });
      }, 15000);
    });
  } catch (error) {
    console.error('Failed to start recording:', error);
    recordingTabId = null;
    return { success: false, error: error.message };
  }
}

async function handleStopRecording() {
  if (!isRecording) {
    return { success: true }; // Already stopped
  }
  
  console.log('Stopping recording');
  
  try {
    return new Promise((resolve) => {
      const messageHandler = (response) => {
        if (response?.type === 'OFFSCREEN_RECORDING_STOPPED') {
          chrome.runtime.onMessage.removeListener(messageHandler);
          
          isRecording = false;
          recordingTabId = null;
          
          // Notify all tabs that recording has stopped
          broadcastToTabs({ type: 'RECORDING_STOPPED' });
          
          // Close offscreen document after a delay
          setTimeout(() => closeOffscreenDocument(), 1000);
          
          resolve({ success: response.success, error: response.error });
        }
      };
      
      chrome.runtime.onMessage.addListener(messageHandler);
      
      // Tell offscreen document to stop
      chrome.runtime.sendMessage({
        type: 'OFFSCREEN_STOP_RECORDING'
      });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        chrome.runtime.onMessage.removeListener(messageHandler);
        isRecording = false;
        recordingTabId = null;
        resolve({ success: true });
      }, 10000);
    });
  } catch (error) {
    console.error('Failed to stop recording:', error);
    isRecording = false;
    recordingTabId = null;
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
