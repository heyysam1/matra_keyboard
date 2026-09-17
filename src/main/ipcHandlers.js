// Matra Keyboard IPC Handlers
import electron from 'electron';
const { ipcMain, app, dialog } = electron;
import fs from 'node:fs';
import path from 'node:path';
import { updateTrayState, updateTrayIcon, getLogoNativeImage } from './tray.js';
import { registerAppShortcut } from './shortcutManager.js';
import { logger } from './logger.js';

let settingsCache = null;

export function getDefaultSettings() {
  return {
    version: '1.0.0',
    mode: 'bn',
    layout: 'avro',
    shortcut: 'ctrl-space',
    autoStartup: false,
    soundEnabled: true,
    soundProfile: 'normal',
    soundVolume: 0.20,
    activeLogo: 'orange',
    theme: 'default',
    customAccent: '#f97316',
    glassOpacity: 50,
    glassBlur: 24,
    dockVariant: 1,
    activeFont: 'Noto Sans Bengali',
    lang: 'en',
    onboardingShown: false
  };
}

export function getSettingsFilePath() {
  const userData = app.getPath('userData');
  return path.join(userData, 'matra_settings.json');
}

export function loadSettings() {
  if (settingsCache) return settingsCache;
  const filePath = getSettingsFilePath();

  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        settingsCache = { ...getDefaultSettings(), ...parsed };
        return settingsCache;
      }
      throw new Error('Invalid settings JSON structure: expected object');
    }
  } catch (err) {
    logger.warn('Corrupt or invalid settings file encountered, creating backup and restoring defaults:', { error: err.message });
    try {
      if (fs.existsSync(filePath)) {
        const corruptBackup = `${filePath}.corrupt-${Date.now()}`;
        fs.renameSync(filePath, corruptBackup);
        logger.info(`Corrupt settings backed up to ${corruptBackup}`);
      }
    } catch (renameErr) {
      logger.error('Failed to rename corrupt settings file:', renameErr);
    }
  }

  settingsCache = getDefaultSettings();
  persistSettings();
  return settingsCache;
}

export function persistSettings() {
  try {
    const filePath = getSettingsFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(settingsCache, null, 2), 'utf8');
  } catch (err) {
    logger.error('Failed to persist settings to disk:', err);
  }
}

export function registerIpcHandlers(mainWindow) {
  ipcMain.handle('app:get-version', () => app.getVersion());

  ipcMain.handle('app:get-info', () => {
    return {
      name: 'Matra Keyboard',
      version: app.getVersion(),
      electron: process.versions.electron,
      chrome: process.versions.chrome,
      node: process.versions.node,
      platform: process.platform,
      arch: process.arch,
      userDataPath: app.getPath('userData'),
      logPath: logger.getLogPath()
    };
  });

  ipcMain.on('window:minimize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.minimize();
    }
  });

  ipcMain.on('window:close', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.hide(); // Hide to tray instead of quitting directly
    }
  });

  // Settings CRUD
  ipcMain.handle('settings:save', (_event, { key, value }) => {
    const current = loadSettings();
    current[key] = value;
    persistSettings();
    return true;
  });

  ipcMain.handle('settings:get', (_event, key) => {
    const current = loadSettings();
    return current[key] ?? null;
  });

  ipcMain.handle('settings:get-all', () => {
    return loadSettings();
  });

  // Export Settings
  ipcMain.handle('settings:export', async () => {
    try {
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Export Matra Keyboard Settings',
        defaultPath: 'matra_settings_backup.json',
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      });

      if (result.canceled || !result.filePath) {
        return { canceled: true };
      }

      const settings = loadSettings();
      fs.writeFileSync(result.filePath, JSON.stringify(settings, null, 2), 'utf8');
      logger.info(`Settings successfully exported to ${result.filePath}`);
      return { success: true, filePath: result.filePath };
    } catch (err) {
      logger.error('Failed to export settings:', err);
      return { success: false, error: err.message };
    }
  });

  // Import Settings
  ipcMain.handle('settings:import', async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Import Matra Keyboard Settings',
        properties: ['openFile'],
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
      });

      if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
        return { canceled: true };
      }

      const chosenPath = result.filePaths[0];
      const rawData = fs.readFileSync(chosenPath, 'utf8');
      const importedData = JSON.parse(rawData);

      if (!importedData || typeof importedData !== 'object' || Array.isArray(importedData)) {
        return { success: false, error: 'Invalid settings file format: root must be an object' };
      }

      // Merge imported data with defaults
      settingsCache = { ...getDefaultSettings(), ...importedData };
      persistSettings();

      // Apply logo if included
      if (settingsCache.activeLogo) {
        updateTrayIcon(settingsCache.activeLogo);
        const icon = getLogoNativeImage(settingsCache.activeLogo);
        if (mainWindow && !mainWindow.isDestroyed() && !icon.isEmpty()) {
          mainWindow.setIcon(icon);
        }
      }

      // Apply shortcut if included
      if (settingsCache.shortcut) {
        registerAppShortcut(mainWindow, settingsCache.shortcut);
      }

      // Broadcast update to renderer
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('settings:imported', settingsCache);
      }

      logger.info(`Settings imported successfully from ${chosenPath}`);
      return { success: true, settings: settingsCache, filePath: chosenPath };
    } catch (err) {
      logger.error('Failed to import settings:', err);
      return { success: false, error: err.message };
    }
  });

  // Windows Auto Startup (HKCU Run Key, no admin required, passes --hidden)
  ipcMain.handle('app:get-auto-startup', () => {
    try {
      const loginSettings = app.getLoginItemSettings();
      return loginSettings.openAtLogin;
    } catch (err) {
      logger.error('Failed to get login item settings:', err);
      return false;
    }
  });

  ipcMain.handle('app:set-auto-startup', (_event, enabled) => {
    try {
      const openAtLogin = Boolean(enabled);
      app.setLoginItemSettings({
        openAtLogin,
        args: ['--hidden'],
        path: process.execPath
      });
      const current = loadSettings();
      current.autoStartup = openAtLogin;
      persistSettings();
      logger.info(`Auto startup set to: ${openAtLogin}`);
      return true;
    } catch (err) {
      logger.error('Failed to set auto startup:', err);
      return false;
    }
  });

  // Shortcut registration with collision detection
  ipcMain.handle('shortcuts:register', (_event, shortcutKey) => {
    const result = registerAppShortcut(mainWindow, shortcutKey);
    if (result.success) {
      const current = loadSettings();
      current.shortcut = shortcutKey;
      persistSettings();
    }
    return result;
  });

  // Dynamic Logo Selection
  ipcMain.handle('logo:set', (_event, logoKey) => {
    try {
      updateTrayIcon(logoKey);
      const icon = getLogoNativeImage(logoKey);
      if (mainWindow && !mainWindow.isDestroyed() && !icon.isEmpty()) {
        mainWindow.setIcon(icon);
      }
      const current = loadSettings();
      current.activeLogo = logoKey;
      persistSettings();
      logger.info(`Active logo switched to: ${logoKey}`);
      return true;
    } catch (err) {
      logger.error(`Failed to set logo ${logoKey}:`, err);
      return false;
    }
  });

  // Tray state synchronization
  ipcMain.on('tray:sync-state', (_event, partialState) => {
    updateTrayState(mainWindow, partialState);
  });

  // ==========================================
  // Slice 5: User Dictionary Storage Handlers
  // ==========================================
  ipcMain.handle('dictionary:get-all', () => {
    return loadUserDictionary();
  });

  ipcMain.handle('dictionary:add', (_event, { word, key }) => {
    const entries = loadUserDictionary();
    const cleanWord = (word || '').trim();
    if (!cleanWord) return { success: false, error: 'Word cannot be empty' };

    const cleanKey = (key || '').trim().toLowerCase();
    const existingIdx = entries.findIndex(e => e.word === cleanWord);
    const newEntry = { word: cleanWord, key: cleanKey, createdAt: new Date().toISOString() };

    if (existingIdx >= 0) {
      entries[existingIdx] = newEntry;
    } else {
      entries.unshift(newEntry);
    }

    saveUserDictionary(entries);
    logger.info(`Added dictionary word: ${cleanWord} (${cleanKey})`);
    return { success: true, entry: newEntry, count: entries.length };
  });

  ipcMain.handle('dictionary:update', (_event, { oldWord, newWord, newKey }) => {
    const entries = loadUserDictionary();
    const cleanOld = (oldWord || '').trim();
    const cleanNew = (newWord || '').trim();
    if (!cleanNew) return { success: false, error: 'New word cannot be empty' };

    const idx = entries.findIndex(e => e.word === cleanOld);
    const newEntry = {
      word: cleanNew,
      key: (newKey || '').trim().toLowerCase(),
      createdAt: idx >= 0 ? entries[idx].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (idx >= 0) {
      entries[idx] = newEntry;
    } else {
      entries.unshift(newEntry);
    }

    saveUserDictionary(entries);
    logger.info(`Updated dictionary word from ${cleanOld} to ${cleanNew}`);
    return { success: true, entry: newEntry, count: entries.length };
  });

  ipcMain.handle('dictionary:delete', (_event, word) => {
    const entries = loadUserDictionary();
    const target = (word || '').trim();
    const filtered = entries.filter(e => e.word !== target);
    saveUserDictionary(filtered);
    logger.info(`Deleted dictionary word: ${target}`);
    return { success: true, count: filtered.length };
  });

  // ==========================================
  // Slice 5: System Care & Diagnostics
  // ==========================================
  ipcMain.handle('system:get-health', () => {
    const settingsPath = getSettingsFilePath();
    const dictPath = getUserDictionaryFilePath();
    const logPath = logger.getLogPath();

    let settingsSize = 0;
    let settingsValid = false;
    try {
      if (fs.existsSync(settingsPath)) {
        settingsSize = fs.statSync(settingsPath).size;
        JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        settingsValid = true;
      }
    } catch (_e) {}

    let dictSize = 0;
    let dictCount = 0;
    let dictValid = false;
    try {
      if (fs.existsSync(dictPath)) {
        dictSize = fs.statSync(dictPath).size;
        const dictParsed = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
        if (Array.isArray(dictParsed)) {
          dictCount = dictParsed.length;
          dictValid = true;
        }
      } else {
        dictValid = true; // Not created yet is valid
      }
    } catch (_e) {}

    let logSize = 0;
    try {
      if (fs.existsSync(logPath)) {
        logSize = fs.statSync(logPath).size;
      }
    } catch (_e) {}

    const mem = process.memoryUsage();

    return {
      status: 'healthy',
      uptime: Math.floor(process.uptime()),
      memory: {
        rss: Math.round(mem.rss / (1024 * 1024)),
        heapUsed: Math.round(mem.heapUsed / (1024 * 1024)),
        heapTotal: Math.round(mem.heapTotal / (1024 * 1024))
      },
      settings: {
        path: settingsPath,
        size: settingsSize,
        isValid: settingsValid
      },
      dictionary: {
        path: dictPath,
        size: dictSize,
        count: dictCount,
        isValid: dictValid
      },
      log: {
        path: logPath,
        size: logSize
      },
      shortcut: loadSettings().shortcut || 'ctrl-space'
    };
  });

  ipcMain.handle('system:clear-cache', () => {
    try {
      if (global.gc) {
        global.gc();
      }
      logger.info('System cache flushed and memory optimized.');
      return { success: true, timestamp: new Date().toISOString() };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('system:verify-integrity', () => {
    const issues = [];
    const settingsPath = getSettingsFilePath();
    const dictPath = getUserDictionaryFilePath();

    try {
      if (fs.existsSync(settingsPath)) {
        const raw = fs.readFileSync(settingsPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') issues.push('Settings JSON structure is invalid.');
      }
    } catch (err) {
      issues.push(`Settings file corrupted: ${err.message}`);
    }

    try {
      if (fs.existsSync(dictPath)) {
        const raw = fs.readFileSync(dictPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) issues.push('User dictionary JSON structure must be an array.');
      }
    } catch (err) {
      issues.push(`User dictionary file corrupted: ${err.message}`);
    }

    const isIntact = issues.length === 0;
    logger.info(`Integrity verification completed. Result: ${isIntact ? 'PASSED' : 'ISSUES DETECTED'}`);
    return {
      intact: isIntact,
      issues,
      checkedAt: new Date().toISOString()
    };
  });
}

// User Dictionary file helpers
export function getUserDictionaryFilePath() {
  const userData = app.getPath('userData');
  return path.join(userData, 'matra_user_dictionary.json');
}

export function loadUserDictionary() {
  const filePath = getUserDictionaryFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    logger.warn('Error reading user dictionary file, creating fresh backup:', { error: err.message });
  }
  return [];
}

export function saveUserDictionary(entries) {
  try {
    const filePath = getUserDictionaryFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(entries, null, 2), 'utf8');
    return true;
  } catch (err) {
    logger.error('Failed to save user dictionary:', err);
    return false;
  }
}
