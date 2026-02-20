// Sellsig Extension - Content Script (Bridge between extension and web app)

(function() {
  'use strict';
  
  let extensionReady = false;
  
  // Announce extension presence to the web app
  function announceExtension() {
    extensionReady = true;
    window.postMessage({
      type: 'SELLSIG_EXTENSION_READY',
      version: '1.0.0',
      extensionInstalled: true
    }, '*');
    console.log('Sellsig: Extension announced to web app');
  }
  
  // Listen for messages from the web app
  window.addEventListener('message', async (event) => {
    // Only accept messages from the same origin
    if (event.source !== window) return;
    
    const message = event.data;
    
    if (message.type === 'SELLSIG_PING') {
      // Respond to ping from web app
      console.log('Sellsig: Received PING from web app');
      window.postMessage({
        type: 'SELLSIG_PONG',
        extensionInstalled: true
      }, '*');
      return;
    }
    
    if (message.type === 'SELLSIG_START_RECORDING') {
      console.log('Sellsig: Starting recording...');
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'START_RECORDING'
        });
        
        console.log('Sellsig: Recording start response:', response);
        
        window.postMessage({
          type: 'SELLSIG_RECORDING_STARTED',
          success: response?.success ?? false,
          error: response?.error,
          hasTabAudio: response?.hasTabAudio ?? false,
          hasMicAudio: response?.hasMicAudio ?? false
        }, '*');
      } catch (error) {
        console.error('Sellsig: Error starting recording:', error);
        window.postMessage({
          type: 'SELLSIG_RECORDING_STARTED',
          success: false,
          error: error.message
        }, '*');
      }
      return;
    }
    
    if (message.type === 'SELLSIG_STOP_RECORDING') {
      console.log('Sellsig: Stopping recording...');
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'STOP_RECORDING'
        });
        
        console.log('Sellsig: Recording stop response:', response);
        
        window.postMessage({
          type: 'SELLSIG_RECORDING_STOPPED',
          success: response?.success ?? false,
          error: response?.error
        }, '*');
      } catch (error) {
        console.error('Sellsig: Error stopping recording:', error);
        window.postMessage({
          type: 'SELLSIG_RECORDING_STOPPED',
          success: false,
          error: error.message
        }, '*');
      }
      return;
    }
    
    if (message.type === 'SELLSIG_PAUSE_RECORDING') {
      console.log('Sellsig: Pausing recording...');
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'PAUSE_RECORDING'
        });
        
        console.log('Sellsig: Recording pause response:', response);
        
        window.postMessage({
          type: 'SELLSIG_RECORDING_PAUSED',
          success: response?.success ?? false,
          error: response?.error
        }, '*');
      } catch (error) {
        console.error('Sellsig: Error pausing recording:', error);
        window.postMessage({
          type: 'SELLSIG_RECORDING_PAUSED',
          success: false,
          error: error.message
        }, '*');
      }
      return;
    }
    
    if (message.type === 'SELLSIG_RESUME_RECORDING') {
      console.log('Sellsig: Resuming recording...');
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'RESUME_RECORDING'
        });
        
        console.log('Sellsig: Recording resume response:', response);
        
        window.postMessage({
          type: 'SELLSIG_RECORDING_RESUMED',
          success: response?.success ?? false,
          error: response?.error
        }, '*');
      } catch (error) {
        console.error('Sellsig: Error resuming recording:', error);
        window.postMessage({
          type: 'SELLSIG_RECORDING_RESUMED',
          success: false,
          error: error.message
        }, '*');
      }
      return;
    }
    
    if (message.type === 'SELLSIG_GET_STATUS') {
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'GET_STATUS'
        });
        
        window.postMessage({
          type: 'SELLSIG_STATUS',
          isRecording: response?.isRecording ?? false,
          isPaused: response?.isPaused ?? false,
          extensionInstalled: true
        }, '*');
      } catch (error) {
        window.postMessage({
          type: 'SELLSIG_STATUS',
          isRecording: false,
          isPaused: false,
          extensionInstalled: true,
          error: error.message
        }, '*');
      }
      return;
    }
  });
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Sellsig: Received from background:', message.type);
    
    // Forward audio chunks to web app
    if (message.type === 'AUDIO_CHUNK') {
      window.postMessage({
        type: 'SELLSIG_AUDIO_CHUNK',
        data: message.data,
        mimeType: message.mimeType,
        timestamp: message.timestamp
      }, '*');
      return;
    }
    
    if (message.type === 'RECORDING_STARTED') {
      window.postMessage({
        type: 'SELLSIG_EXTENSION_RECORDING_STARTED',
        hasTabAudio: message.hasTabAudio,
        hasMicAudio: message.hasMicAudio
      }, '*');
      return;
    }
    
    if (message.type === 'RECORDING_STOPPED') {
      window.postMessage({
        type: 'SELLSIG_EXTENSION_RECORDING_STOPPED'
      }, '*');
      return;
    }
    
    if (message.type === 'RECORDING_PAUSED') {
      window.postMessage({
        type: 'SELLSIG_EXTENSION_RECORDING_PAUSED'
      }, '*');
      return;
    }
    
    if (message.type === 'RECORDING_RESUMED') {
      window.postMessage({
        type: 'SELLSIG_EXTENSION_RECORDING_RESUMED'
      }, '*');
      return;
    }
    
    if (message.type === 'RECORDING_ERROR') {
      window.postMessage({
        type: 'SELLSIG_RECORDING_ERROR',
        error: message.error
      }, '*');
      return;
    }
  });
  
  // Announce on load and periodically
  announceExtension();
  
  // Re-announce after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', announceExtension);
  }
  
  // Re-announce periodically in case the web app loads later
  setTimeout(announceExtension, 1000);
  setTimeout(announceExtension, 3000);
  setTimeout(announceExtension, 5000);
  
  console.log('Sellsig content script loaded');
})();
