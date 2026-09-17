// Matra Keyboard — Settings Manager
// Orchestrates Shortcuts, Auto-Startup, Sound Profiles, Backup/Restore, and App Information.

import {
  isSoundEnabled,
  setSoundEnabled,
  getSoundProfile,
  setSoundProfile,
  getSoundVolume,
  setSoundVolume,
  testSound
} from './soundManager.js';
import { setAppLogo } from './logoManager.js';
import { selectThemePreset, setCustomAccent, updateOpacity, updateBlur } from './theme.js';
import { setDockVariant } from './dockManager.js';

export function initSettingsManager() {
  setupAutoStartup();
  setupShortcutSelector();
  setupSoundControls();
  setupBackupRestore();
  setupAppInfo();

  // Listen for imported settings broadcast from main process
  if (window.matraAPI && window.matraAPI.onSettingsImported) {
    window.matraAPI.onSettingsImported((newSettings) => {
      applyImportedSettings(newSettings);
    });
  }
}

async function setupAutoStartup() {
  const checkbox = document.getElementById('setting-auto-startup');
  if (!checkbox) return;

  if (window.matraAPI && window.matraAPI.getAutoStartup) {
    try {
      const isEnabled = await window.matraAPI.getAutoStartup();
      checkbox.checked = Boolean(isEnabled);
    } catch (_err) {
      checkbox.checked = false;
    }
  }

  checkbox.addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    if (window.matraAPI && window.matraAPI.setAutoStartup) {
      await window.matraAPI.setAutoStartup(enabled);
    }
    showSettingsToast(enabled ? 'স্বয়ংক্রিয় স্টার্টআপ সক্রিয় করা হয়েছে' : 'স্বয়ংক্রিয় স্টার্টআপ নিষ্ক্রিয় করা হয়েছে', 'success');
  });
}

function setupShortcutSelector() {
  const shortcutPills = document.querySelectorAll('.shortcut-pill');
  const warningBox = document.getElementById('shortcut-conflict-warning');
  const customPill = document.getElementById('shortcut-custom-pill');
  const customLabel = document.getElementById('shortcut-custom-label');
  const recorder = document.getElementById('custom-shortcut-recorder');
  const recorderInput = document.getElementById('custom-shortcut-input');
  const saveCustomBtn = document.getElementById('btn-save-custom-shortcut');
  const cancelCustomBtn = document.getElementById('btn-cancel-custom-shortcut');

  let capturedKeys = '';

  // Load saved shortcut
  const savedShortcut = localStorage.getItem('matra_active_shortcut') || 'ctrl-space';
  let matchedPreset = false;

  shortcutPills.forEach((p) => {
    const sc = p.getAttribute('data-shortcut');
    if (sc === savedShortcut) {
      p.classList.add('active');
      matchedPreset = true;
      const indicator = p.querySelector('.shortcut-indicator');
      if (indicator) indicator.style.backgroundColor = 'var(--brand-accent)';
    } else {
      p.classList.remove('active');
      const indicator = p.querySelector('.shortcut-indicator');
      if (indicator) indicator.style.backgroundColor = '#52525b';
    }
  });

  // If saved shortcut is a custom key combination
  if (!matchedPreset && savedShortcut && customPill && customLabel) {
    customPill.classList.add('active');
    customLabel.textContent = savedShortcut;
    const ind = customPill.querySelector('.shortcut-indicator');
    if (ind) ind.style.backgroundColor = 'var(--brand-accent)';
  }

  // Handle Preset Pills
  shortcutPills.forEach((pill) => {
    pill.addEventListener('click', async () => {
      const shortcutKey = pill.getAttribute('data-shortcut');
      if (!shortcutKey) return;

      if (shortcutKey === 'custom') {
        if (recorder) {
          recorder.classList.toggle('hidden');
          if (!recorder.classList.contains('hidden')) {
            recorderInput.value = '';
            capturedKeys = '';
            recorderInput.focus();
          }
        }
        return;
      }

      if (recorder) recorder.classList.add('hidden');

      if (window.matraAPI && window.matraAPI.registerShortcut) {
        const res = await window.matraAPI.registerShortcut(shortcutKey);

        if (res && !res.success) {
          if (warningBox) {
            warningBox.classList.remove('hidden');
            warningBox.textContent = res.message || `⚠️ Shortcut '${res.accelerator}' is in use by another app.`;
          }
          return;
        }
      }

      // Success
      if (warningBox) warningBox.classList.add('hidden');

      shortcutPills.forEach((p) => {
        p.classList.remove('active');
        const ind = p.querySelector('.shortcut-indicator');
        if (ind) ind.style.backgroundColor = '#52525b';
      });
      pill.classList.add('active');
      const curInd = pill.querySelector('.shortcut-indicator');
      if (curInd) curInd.style.backgroundColor = 'var(--brand-accent)';

      localStorage.setItem('matra_active_shortcut', shortcutKey);
      showSettingsToast('শর্টকাট সফলভাবে পরিবর্তন করা হয়েছে', 'success');
    });
  });

  // Custom Shortcut Key Capture Listener
  if (recorderInput) {
    recorderInput.addEventListener('keydown', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const modifiers = [];
      if (e.ctrlKey) modifiers.push('Ctrl');
      if (e.altKey) modifiers.push('Alt');
      if (e.shiftKey) modifiers.push('Shift');

      let mainKey = e.key;
      // Ignore bare modifier key presses
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(mainKey)) {
        recorderInput.value = modifiers.join(' + ') + ' + ...';
        return;
      }

      // Format clean key name
      if (mainKey === ' ') mainKey = 'Space';
      else if (mainKey.length === 1) mainKey = mainKey.toUpperCase();

      if (modifiers.length === 0) {
        if (warningBox) {
          warningBox.classList.remove('hidden');
          warningBox.textContent = '⚠️ কাস্টম শর্টকাটে অন্তত একটি মডিফায়ার কি (Ctrl, Alt, বা Shift) থাকতে হবে।';
        }
        recorderInput.value = mainKey;
        capturedKeys = '';
        return;
      }

      if (warningBox) warningBox.classList.add('hidden');
      const combo = [...modifiers, mainKey].join('+');
      recorderInput.value = combo;
      capturedKeys = combo;
    });
  }

  // Save Custom Shortcut
  if (saveCustomBtn) {
    saveCustomBtn.addEventListener('click', async () => {
      if (!capturedKeys) {
        if (warningBox) {
          warningBox.classList.remove('hidden');
          warningBox.textContent = '⚠️ অনুগ্রহ করে কিবোর্ডে কি চাপুন (যেমন: Ctrl+Alt+K)।';
        }
        return;
      }

      if (window.matraAPI && window.matraAPI.registerShortcut) {
        const res = await window.matraAPI.registerShortcut(capturedKeys);
        if (res && !res.success) {
          if (warningBox) {
            warningBox.classList.remove('hidden');
            warningBox.textContent = res.message || `⚠️ Shortcut '${res.accelerator}' is in use or invalid.`;
          }
          return;
        }
      }

      if (warningBox) warningBox.classList.add('hidden');
      if (recorder) recorder.classList.add('hidden');

      shortcutPills.forEach((p) => {
        p.classList.remove('active');
        const ind = p.querySelector('.shortcut-indicator');
        if (ind) ind.style.backgroundColor = '#52525b';
      });

      if (customPill) {
        customPill.classList.add('active');
        const curInd = customPill.querySelector('.shortcut-indicator');
        if (curInd) curInd.style.backgroundColor = 'var(--brand-accent)';
      }
      if (customLabel) customLabel.textContent = capturedKeys;

      localStorage.setItem('matra_active_shortcut', capturedKeys);
      showSettingsToast(`কাস্টম শর্টকাট '${capturedKeys}' সফলভাবে সক্রিয় করা হয়েছে`, 'success');
    });
  }

  // Cancel Custom Shortcut
  if (cancelCustomBtn) {
    cancelCustomBtn.addEventListener('click', () => {
      if (recorder) recorder.classList.add('hidden');
      if (warningBox) warningBox.classList.add('hidden');
    });
  }
}

function setupSoundControls() {
  const soundToggle = document.getElementById('setting-sound-enabled');
  const profileSelect = document.getElementById('setting-sound-profile');
  const volumeSlider = document.getElementById('setting-sound-volume');
  const volumeLabel = document.getElementById('sound-volume-val-label');
  const testBtn = document.getElementById('btn-test-sound');

  if (soundToggle) {
    soundToggle.checked = isSoundEnabled();
    soundToggle.addEventListener('change', (e) => {
      setSoundEnabled(e.target.checked);
      // Also synchronize tray checkbox if open
      const traySound = document.getElementById('tray-sound-toggle-input');
      if (traySound) traySound.checked = e.target.checked;
    });
  }

  if (profileSelect) {
    profileSelect.value = getSoundProfile();
    profileSelect.addEventListener('change', (e) => {
      setSoundProfile(e.target.value);
      testSound();
    });
  }

  if (volumeSlider) {
    const currentVol = Math.round(getSoundVolume() * 100);
    volumeSlider.value = currentVol;
    if (volumeLabel) volumeLabel.textContent = `${currentVol}%`;

    volumeSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (volumeLabel) volumeLabel.textContent = `${val}%`;
      setSoundVolume(val / 100);
    });

    volumeSlider.addEventListener('change', () => {
      testSound();
    });
  }

  if (testBtn) {
    testBtn.addEventListener('click', () => {
      testSound();
    });
  }
}

function setupBackupRestore() {
  const exportBtn = document.getElementById('btn-export-settings');
  const importBtn = document.getElementById('btn-import-settings');

  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      if (window.matraAPI && window.matraAPI.exportSettings) {
        exportBtn.disabled = true;
        try {
          const res = await window.matraAPI.exportSettings();
          if (res && res.success) {
            showSettingsToast('সেটিংস ব্যাকআপ ফাইল সফলভাবে সংরক্ষিত হয়েছে', 'success');
          } else if (res && res.error) {
            showSettingsToast(`ব্যাকআপ সংরক্ষণে ত্রুটি: ${res.error}`, 'error');
          }
        } finally {
          exportBtn.disabled = false;
        }
      }
    });
  }

  if (importBtn) {
    importBtn.addEventListener('click', async () => {
      if (window.matraAPI && window.matraAPI.importSettings) {
        importBtn.disabled = true;
        try {
          const res = await window.matraAPI.importSettings();
          if (res && res.success) {
            applyImportedSettings(res.settings);
            showSettingsToast('সেটিংস সফলভাবে পুনরুদ্ধার (Restore) করা হয়েছে', 'success');
          } else if (res && res.error) {
            showSettingsToast(`সেটিংস ফাইলে ত্রুটি: ${res.error}`, 'error');
          }
        } finally {
          importBtn.disabled = false;
        }
      }
    });
  }
}

async function setupAppInfo() {
  const versionBadge = document.getElementById('app-info-version');
  const electronBadge = document.getElementById('app-info-electron');
  const platformBadge = document.getElementById('app-info-platform');
  const logPathDisplay = document.getElementById('app-info-logpath');

  if (window.matraAPI && window.matraAPI.getAppInfo) {
    try {
      const info = await window.matraAPI.getAppInfo();
      if (versionBadge && info.version) versionBadge.textContent = `v${info.version}`;
      if (electronBadge && info.electron) electronBadge.textContent = `Electron ${info.electron} • Node ${info.node}`;
      if (platformBadge && info.platform) platformBadge.textContent = `${info.platform.toUpperCase()} (${info.arch})`;
      if (logPathDisplay && info.logPath) {
        logPathDisplay.textContent = info.logPath;
        logPathDisplay.title = info.logPath;
      }
    } catch (_e) {}
  }
}

function applyImportedSettings(settings) {
  if (!settings || typeof settings !== 'object') return;

  if (settings.theme) selectThemePreset(settings.theme);
  if (settings.customAccent) setCustomAccent(settings.customAccent);
  if (settings.glassOpacity !== undefined) updateOpacity(settings.glassOpacity);
  if (settings.glassBlur !== undefined) updateBlur(settings.glassBlur);
  if (settings.dockVariant) setDockVariant(settings.dockVariant);
  if (settings.activeLogo) setAppLogo(settings.activeLogo, false);
  if (settings.soundEnabled !== undefined) {
    setSoundEnabled(settings.soundEnabled);
    const soundToggle = document.getElementById('setting-sound-enabled');
    if (soundToggle) soundToggle.checked = settings.soundEnabled;
  }
  if (settings.soundProfile) {
    setSoundProfile(settings.soundProfile);
    const profileSelect = document.getElementById('setting-sound-profile');
    if (profileSelect) profileSelect.value = settings.soundProfile;
  }
  if (settings.soundVolume !== undefined) {
    setSoundVolume(settings.soundVolume);
    const volumeSlider = document.getElementById('setting-sound-volume');
    const volumeLabel = document.getElementById('sound-volume-val-label');
    const pct = Math.round(settings.soundVolume * 100);
    if (volumeSlider) volumeSlider.value = pct;
    if (volumeLabel) volumeLabel.textContent = `${pct}%`;
  }
  if (settings.shortcut) {
    const shortcutPills = document.querySelectorAll('.shortcut-pill');
    shortcutPills.forEach((p) => {
      if (p.getAttribute('data-shortcut') === settings.shortcut) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
    localStorage.setItem('matra_active_shortcut', settings.shortcut);
  }
}

export function showSettingsToast(message, type = 'info') {
  let toast = document.getElementById('settings-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'settings-toast';
    toast.className = 'glass-pill settings-toast';
    document.body.appendChild(toast);
  }

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = '<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="flex-shrink: 0;"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>';
  } else if (type === 'error') {
    iconSvg = '<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="flex-shrink: 0;"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>';
  } else {
    iconSvg = '<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="flex-shrink: 0;"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>';
  }

  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  toast.setAttribute('data-type', type);
  toast.classList.add('show');

  if (toast._timer) clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
