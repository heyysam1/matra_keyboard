// Matra Keyboard — Unified Settings Store (Single Source of Truth)
// Centralizes all application preferences into the IPC-backed settings.json.
// Eliminates state fragmentation and prevents settings loss during Export/Import.

let _settings = {
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
  onboardingShown: false,
  injectionMethod: 'sendinput'
};

const _subscribers = new Map(); // key -> Set of callbacks
const _globalSubscribers = new Set(); // Set of callbacks (fires on imported or any change)

export async function initSettingsStore() {
  if (window.matraAPI && window.matraAPI.getAllSettings) {
    try {
      const serverSettings = await window.matraAPI.getAllSettings();
      if (serverSettings && typeof serverSettings === 'object') {
        _settings = { ..._settings, ...serverSettings };
      }
    } catch (err) {
      console.error('[SettingsStore] Failed to load initial settings from IPC:', err);
    }
  }

  // Listen for imported settings broadcast from main process
  if (window.matraAPI && window.matraAPI.onSettingsImported) {
    window.matraAPI.onSettingsImported((importedSettings) => {
      if (importedSettings && typeof importedSettings === 'object') {
        _settings = { ..._settings, ...importedSettings };
        notifySubscribers('*', _settings);
      }
    });
  }

  return _settings;
}

export function getSetting(key, fallback = null) {
  return _settings[key] !== undefined ? _settings[key] : fallback;
}

export function getAllSettings() {
  return { ..._settings };
}

export function setSetting(key, value) {
  _settings[key] = value;

  // Persist to main process settings.json
  if (window.matraAPI && window.matraAPI.saveSetting) {
    window.matraAPI.saveSetting(key, value).catch((err) => {
      console.error(`[SettingsStore] Failed to save setting "${key}":`, err);
    });
  }

  notifySubscribers(key, value);
}

export function subscribeSetting(key, callback) {
  if (key === '*') {
    _globalSubscribers.add(callback);
    return () => _globalSubscribers.delete(callback);
  }

  if (!_subscribers.has(key)) {
    _subscribers.set(key, new Set());
  }
  _subscribers.get(key).add(callback);

  return () => {
    const set = _subscribers.get(key);
    if (set) set.delete(callback);
  };
}

function notifySubscribers(key, value) {
  if (key === '*') {
    for (const cb of _globalSubscribers) {
      try { cb(value); } catch (e) { console.error(e); }
    }
    for (const [subKey, set] of _subscribers.entries()) {
      const subVal = _settings[subKey];
      for (const cb of set) {
        try { cb(subVal); } catch (e) { console.error(e); }
      }
    }
  } else {
    const set = _subscribers.get(key);
    if (set) {
      for (const cb of set) {
        try { cb(value); } catch (e) { console.error(e); }
      }
    }
  }
}
