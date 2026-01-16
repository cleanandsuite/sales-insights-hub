// Sellsig Extension - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  const recordBtn = document.getElementById('recordBtn');
  const btnText = document.getElementById('btnText');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const errorDiv = document.getElementById('error');
  
  let isRecording = false;
  let isPaused = false;
  
  // Get current status
  async function updateStatus() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STATUS' });
      isRecording = response?.isRecording ?? false;
      isPaused = response?.isPaused ?? false;
      updateUI();
    } catch (error) {
      console.error('Failed to get status:', error);
    }
  }
  
  // Update UI based on recording state
  function updateUI() {
    if (isRecording) {
      if (isPaused) {
        recordBtn.className = 'btn btn-primary';
        btnText.textContent = 'Resume Recording';
        statusDot.className = 'status-dot paused';
        statusText.className = 'status-text paused';
        statusText.textContent = 'Recording paused';
      } else {
        recordBtn.className = 'btn btn-danger';
        btnText.textContent = 'Stop Recording';
        statusDot.className = 'status-dot recording';
        statusText.className = 'status-text recording';
        statusText.textContent = 'Recording in progress...';
      }
    } else {
      recordBtn.className = 'btn btn-primary';
      btnText.textContent = 'Start Recording';
      statusDot.className = 'status-dot';
      statusText.className = 'status-text';
      statusText.textContent = 'Ready to record';
    }
    errorDiv.style.display = 'none';
  }
  
  // Show error
  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
  
  // Handle record button click
  recordBtn.addEventListener('click', async () => {
    recordBtn.disabled = true;
    
    try {
      if (isRecording) {
        // Stop recording
        const response = await chrome.runtime.sendMessage({ type: 'STOP_RECORDING' });
        
        if (response?.success) {
          isRecording = false;
          isPaused = false;
          updateUI();
        } else {
          showError(response?.error || 'Failed to stop recording');
        }
      } else {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab?.id) {
          showError('No active tab found');
          return;
        }
        
        // Start recording
        const response = await chrome.runtime.sendMessage({
          type: 'START_RECORDING',
          tabId: tab.id
        });
        
        if (response?.success) {
          isRecording = true;
          isPaused = false;
          updateUI();
          
          // Show what sources are being captured
          const sources = [];
          if (response.hasTabAudio) sources.push('tab audio');
          if (response.hasMicAudio) sources.push('microphone');
          
          if (sources.length > 0) {
            statusText.textContent = `Recording: ${sources.join(' + ')}`;
          }
        } else {
          showError(response?.error || 'Failed to start recording');
        }
      }
    } catch (error) {
      showError(error.message);
    } finally {
      recordBtn.disabled = false;
    }
  });
  
  // Initial status check
  await updateStatus();
});
