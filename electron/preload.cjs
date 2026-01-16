const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Check if running in Electron
  isElectron: () => ipcRenderer.invoke('is-electron'),
  
  // Get available desktop sources for screen/system audio capture
  getDesktopSources: () => ipcRenderer.invoke('get-desktop-sources'),
  
  // Get system information
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Platform detection
  platform: process.platform,
});

// Expose a flag to detect Electron environment
contextBridge.exposeInMainWorld('isElectron', true);
