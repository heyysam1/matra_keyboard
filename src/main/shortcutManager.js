// Matra Keyboard — Global Shortcut Manager
import electron from 'electron';
const { globalShortcut } = electron;
import { logger } from './logger.js';

export const SHORTCUT_ACCELERATORS = {
  'ctrl-space': 'CommandOrControl+Space',
  'f12': 'F12',
  'shift-space': 'Shift+Space'
};

let currentRegisteredKey = null;
let currentRegisteredAccelerator = null;

export function registerAppShortcut(mainWindow, shortcutKey = 'ctrl-space') {
  let accelerator = null;
  const isPreset = Boolean(SHORTCUT_ACCELERATORS[shortcutKey]);

  if (isPreset) {
    accelerator = SHORTCUT_ACCELERATORS[shortcutKey];
  } else if (shortcutKey && (shortcutKey.startsWith('custom:') || shortcutKey.includes('+'))) {
    // Custom shortcut
    const raw = shortcutKey.startsWith('custom:') ? shortcutKey.slice(7) : shortcutKey;
    const parts = raw.split('+').map(s => s.trim()).filter(Boolean);

    // Section I: Require at least one modifier key (Ctrl, Alt, or Shift)
    const hasModifier = parts.some(p => /^(ctrl|control|commandorcontrol|alt|shift|meta)$/i.test(p));
    if (!hasModifier) {
      return {
        success: false,
        error: 'missing_modifier',
        shortcutKey,
        message: 'Custom shortcuts must include at least one modifier key (Ctrl, Alt, or Shift).'
      };
    }

    // Format parts into Electron accelerator format
    const formattedParts = parts.map(p => {
      const lower = p.toLowerCase();
      if (lower === 'ctrl' || lower === 'control') return 'CommandOrControl';
      if (lower === 'alt') return 'Alt';
      if (lower === 'shift') return 'Shift';
      if (lower === 'meta' || lower === 'win') return 'Super';
      if (p.length === 1) return p.toUpperCase();
      return p;
    });

    accelerator = formattedParts.join('+');
  } else {
    return { success: false, error: 'unknown_shortcut', shortcutKey };
  }

  try {
    // Unregister previously active shortcut if registered
    if (currentRegisteredAccelerator) {
      globalShortcut.unregister(currentRegisteredAccelerator);
      currentRegisteredAccelerator = null;
    }

    // Attempt registration
    const registered = globalShortcut.register(accelerator, () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('shortcut:toggle-mode');
      }
    });

    if (!registered) {
      logger.warn(`Shortcut collision detected: ${accelerator} could not be registered.`);
      return {
        success: false,
        error: 'conflict',
        shortcutKey,
        accelerator,
        message: `Shortcut '${accelerator}' is already in use by Windows or another application.`
      };
    }

    currentRegisteredKey = shortcutKey;
    currentRegisteredAccelerator = accelerator;
    logger.info(`Successfully registered global shortcut: ${accelerator}`);
    return { success: true, shortcutKey, accelerator };
  } catch (err) {
    logger.error(`Error registering shortcut ${accelerator}:`, err);
    return { success: false, error: err.message, shortcutKey, accelerator };
  }
}

export function unregisterAllShortcuts() {
  globalShortcut.unregisterAll();
  currentRegisteredKey = null;
}

export function getCurrentShortcut() {
  return currentRegisteredKey;
}
