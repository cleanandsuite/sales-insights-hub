import { useState, useEffect, useCallback, useRef } from 'react';

interface ExtensionStatus {
  isInstalled: boolean;
  isRecording: boolean;
  isPaused: boolean;
  hasTabAudio: boolean;
  hasMicAudio: boolean;
}

interface AudioChunk {
  data: string; // base64
  mimeType: string;
  timestamp: number;
}

interface UseExtensionAudioReturn {
  extensionInstalled: boolean;
  isRecording: boolean;
  isPaused: boolean;
  hasTabAudio: boolean;
  hasMicAudio: boolean;
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<boolean>;
  pauseRecording: () => Promise<boolean>;
  resumeRecording: () => Promise<boolean>;
  onAudioChunk: (callback: (chunk: AudioChunk) => void) => void;
  error: string | null;
}

export function useExtensionAudio(): UseExtensionAudioReturn {
  const [status, setStatus] = useState<ExtensionStatus>({
    isInstalled: false,
    isRecording: false,
    isPaused: false,
    hasTabAudio: false,
    hasMicAudio: false,
  });
  const [error, setError] = useState<string | null>(null);
  const audioChunkCallbackRef = useRef<((chunk: AudioChunk) => void) | null>(null);
  const extensionCheckTimeoutRef = useRef<number | null>(null);

  // Listen for messages from the extension
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from the same origin
      if (event.source !== window) return;
      
      const message = event.data;
      
      switch (message.type) {
        case 'SELLSIG_EXTENSION_READY':
        case 'SELLSIG_PONG':
          setStatus(prev => ({ ...prev, isInstalled: true }));
          break;
          
        case 'SELLSIG_RECORDING_STARTED':
          if (message.success) {
            setStatus(prev => ({
              ...prev,
              isRecording: true,
              isPaused: false,
              hasTabAudio: message.hasTabAudio ?? false,
              hasMicAudio: message.hasMicAudio ?? false,
            }));
            setError(null);
          } else {
            setError(message.error || 'Failed to start recording');
          }
          break;
          
        case 'SELLSIG_RECORDING_STOPPED':
          setStatus(prev => ({
            ...prev,
            isRecording: false,
            isPaused: false,
            hasTabAudio: false,
            hasMicAudio: false,
          }));
          if (!message.success) {
            setError(message.error || 'Failed to stop recording');
          }
          break;
          
        case 'SELLSIG_RECORDING_PAUSED':
          if (message.success) {
            setStatus(prev => ({ ...prev, isPaused: true }));
          } else {
            setError(message.error || 'Failed to pause recording');
          }
          break;
          
        case 'SELLSIG_RECORDING_RESUMED':
          if (message.success) {
            setStatus(prev => ({ ...prev, isPaused: false }));
          } else {
            setError(message.error || 'Failed to resume recording');
          }
          break;
          
        case 'SELLSIG_EXTENSION_RECORDING_STARTED':
          setStatus(prev => ({ 
            ...prev, 
            isRecording: true,
            isPaused: false,
            hasTabAudio: message.hasTabAudio ?? prev.hasTabAudio,
            hasMicAudio: message.hasMicAudio ?? prev.hasMicAudio,
          }));
          break;
          
        case 'SELLSIG_EXTENSION_RECORDING_STOPPED':
          setStatus(prev => ({
            ...prev,
            isRecording: false,
            isPaused: false,
            hasTabAudio: false,
            hasMicAudio: false,
          }));
          break;
          
        case 'SELLSIG_EXTENSION_RECORDING_PAUSED':
          setStatus(prev => ({ ...prev, isPaused: true }));
          break;
          
        case 'SELLSIG_EXTENSION_RECORDING_RESUMED':
          setStatus(prev => ({ ...prev, isPaused: false }));
          break;
          
        case 'SELLSIG_AUDIO_CHUNK':
          if (audioChunkCallbackRef.current) {
            audioChunkCallbackRef.current({
              data: message.data,
              mimeType: message.mimeType,
              timestamp: message.timestamp,
            });
          }
          break;
          
        case 'SELLSIG_RECORDING_ERROR':
          setError(message.error || 'Recording error');
          setStatus(prev => ({
            ...prev,
            isRecording: false,
            isPaused: false,
            hasTabAudio: false,
            hasMicAudio: false,
          }));
          break;
          
        case 'SELLSIG_STATUS':
          setStatus(prev => ({
            ...prev,
            isInstalled: message.extensionInstalled ?? prev.isInstalled,
            isRecording: message.isRecording ?? prev.isRecording,
            isPaused: message.isPaused ?? prev.isPaused,
          }));
          break;
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Ping for extension on mount
    const checkExtension = () => {
      window.postMessage({ type: 'SELLSIG_PING' }, '*');
    };
    
    // Check immediately
    checkExtension();
    
    // Check again after a delay
    extensionCheckTimeoutRef.current = window.setTimeout(checkExtension, 1000);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      if (extensionCheckTimeoutRef.current) {
        clearTimeout(extensionCheckTimeoutRef.current);
      }
    };
  }, []);

  const startRecording = useCallback(async (): Promise<boolean> => {
    if (!status.isInstalled) {
      setError('Extension not installed');
      return false;
    }
    
    return new Promise((resolve) => {
      const handleResponse = (event: MessageEvent) => {
        if (event.source !== window) return;
        
        if (event.data.type === 'SELLSIG_RECORDING_STARTED') {
          window.removeEventListener('message', handleResponse);
          resolve(event.data.success ?? false);
        }
      };
      
      window.addEventListener('message', handleResponse);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        resolve(false);
      }, 10000);
      
      window.postMessage({ type: 'SELLSIG_START_RECORDING' }, '*');
    });
  }, [status.isInstalled]);

  const stopRecording = useCallback(async (): Promise<boolean> => {
    if (!status.isInstalled) {
      return false;
    }
    
    return new Promise((resolve) => {
      const handleResponse = (event: MessageEvent) => {
        if (event.source !== window) return;
        
        if (event.data.type === 'SELLSIG_RECORDING_STOPPED') {
          window.removeEventListener('message', handleResponse);
          resolve(event.data.success ?? false);
        }
      };
      
      window.addEventListener('message', handleResponse);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        resolve(false);
      }, 5000);
      
      window.postMessage({ type: 'SELLSIG_STOP_RECORDING' }, '*');
    });
  }, [status.isInstalled]);

  const pauseRecording = useCallback(async (): Promise<boolean> => {
    if (!status.isInstalled || !status.isRecording) {
      return false;
    }
    
    return new Promise((resolve) => {
      const handleResponse = (event: MessageEvent) => {
        if (event.source !== window) return;
        
        if (event.data.type === 'SELLSIG_RECORDING_PAUSED') {
          window.removeEventListener('message', handleResponse);
          resolve(event.data.success ?? false);
        }
      };
      
      window.addEventListener('message', handleResponse);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        resolve(false);
      }, 5000);
      
      window.postMessage({ type: 'SELLSIG_PAUSE_RECORDING' }, '*');
    });
  }, [status.isInstalled, status.isRecording]);

  const resumeRecording = useCallback(async (): Promise<boolean> => {
    if (!status.isInstalled || !status.isPaused) {
      return false;
    }
    
    return new Promise((resolve) => {
      const handleResponse = (event: MessageEvent) => {
        if (event.source !== window) return;
        
        if (event.data.type === 'SELLSIG_RECORDING_RESUMED') {
          window.removeEventListener('message', handleResponse);
          resolve(event.data.success ?? false);
        }
      };
      
      window.addEventListener('message', handleResponse);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        resolve(false);
      }, 5000);
      
      window.postMessage({ type: 'SELLSIG_RESUME_RECORDING' }, '*');
    });
  }, [status.isInstalled, status.isPaused]);

  const onAudioChunk = useCallback((callback: (chunk: AudioChunk) => void) => {
    audioChunkCallbackRef.current = callback;
  }, []);

  return {
    extensionInstalled: status.isInstalled,
    isRecording: status.isRecording,
    isPaused: status.isPaused,
    hasTabAudio: status.hasTabAudio,
    hasMicAudio: status.hasMicAudio,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    onAudioChunk,
    error,
  };
}
