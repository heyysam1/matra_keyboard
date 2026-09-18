// Matra Keyboard Preload Script
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('matraAPI', {
  platform: process.platform,
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  getAppInfo: () => ipcRenderer.invoke('app:get-info'),
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  saveSetting: (key, value) => ipcRenderer.invoke('settings:save', { key, value }),
  getSetting: (key) => ipcRenderer.invoke('settings:get', key),
  getAllSettings: () => ipcRenderer.invoke('settings:get-all'),
  exportSettings: () => ipcRenderer.invoke('settings:export'),
  importSettings: () => ipcRenderer.invoke('settings:import'),
  getAutoStartup: () => ipcRenderer.invoke('app:get-auto-startup'),
  setAutoStartup: (enabled) => ipcRenderer.invoke('app:set-auto-startup', enabled),
  registerShortcut: (shortcutKey) => ipcRenderer.invoke('shortcuts:register', shortcutKey),
  setAppLogo: (logoKey) => ipcRenderer.invoke('logo:set', logoKey),
  syncTrayState: (state) => ipcRenderer.send('tray:sync-state', state),
  // Slice 5: Dictionary APIs
  getUserDictionary: () => ipcRenderer.invoke('dictionary:get-all'),
  addUserWord: (word, key) => ipcRenderer.invoke('dictionary:add', { word, key }),
  updateUserWord: (oldWord, newWord, newKey) => ipcRenderer.invoke('dictionary:update', { oldWord, newWord, newKey }),
  deleteUserWord: (word) => ipcRenderer.invoke('dictionary:delete', word),
  // Slice 5: System Care APIs
  getSystemHealth: () => ipcRenderer.invoke('system:get-health'),
  clearSystemCache: () => ipcRenderer.invoke('system:clear-cache'),
  verifySystemIntegrity: () => ipcRenderer.invoke('system:verify-integrity'),
  getImeConflicts: () => ipcRenderer.invoke('system:get-ime-conflicts'),
  onTrayAction: (callback) => {
    ipcRenderer.on('tray:action', (_event, action) => callback(action));
  },
  onShortcutToggleMode: (callback) => {
    ipcRenderer.on('shortcut:toggle-mode', () => callback());
  },
  onSettingsImported: (callback) => {
    ipcRenderer.on('settings:imported', (_event, settings) => callback(settings));
  },
  onImeConflict: (callback) => {
    ipcRenderer.on('system:ime-conflict', (_event, imes) => callback(imes));
  }
});
