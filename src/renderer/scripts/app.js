// Matra Keyboard Renderer Application Entrypoint

import { applyTranslations, toggleLanguage } from './i18n.js';
import { initTheme, selectThemePreset, setCustomAccent, updateOpacity, updateBlur, cycleAccentColor } from './theme.js';
import { initLogoManager, setAppLogo } from './logoManager.js';
import { initDockManager, setDockVariant } from './dockManager.js';
import { initNavigation, setTab, switchView } from './navigation.js';
import { initOnboarding, dismissOnboarding, showOnboarding } from './onboarding.js';
import { initTypingStudio, setAppMode, toggleAppMode, setAppLayout } from './typingStudio.js';
import { initLayoutViewer, openLayoutViewer, closeLayoutViewer, toggleLayoutViewer, toggleVirtualShift } from './layoutViewer.js';
import { initSoundManager, setSoundEnabled } from './soundManager.js';

import { initSettingsManager } from './settingsManager.js';
import { initFontManager, applyFont } from './fontManager.js';
import { initDictionaryManager, deleteWord, promptEditWord, renderDictionaryList } from './dictionaryManager.js';
import { initConverterManager, toggleDirection, performConversion } from './converterManager.js';
import { initSystemCareManager, refreshSystemHealth, testApiPing, clearCaches, verifyIntegrity, resetEngineState } from './systemCareManager.js';

// Expose functions to window for HTML event handlers
window.toggleLanguage = toggleLanguage;
window.selectThemePreset = selectThemePreset;
window.setCustomAccent = setCustomAccent;
window.updateOpacity = updateOpacity;
window.updateBlur = updateBlur;
window.cycleAccentColor = cycleAccentColor;
window.setAppLogo = setAppLogo;
window.setDockVariant = setDockVariant;
window.setTab = setTab;
window.switchView = switchView;
window.dismissOnboarding = dismissOnboarding;
window.showOnboarding = showOnboarding;

// Slice 3 additions: Modes, Layout, Visualizer, Sound
window.setAppMode = setAppMode;
window.toggleAppMode = toggleAppMode;
window.setAppLayout = setAppLayout;
window.openLayoutViewer = openLayoutViewer;
window.closeLayoutViewer = closeLayoutViewer;
window.toggleLayoutViewer = toggleLayoutViewer;
window.toggleVirtualShift = toggleVirtualShift;
window.setSoundEnabled = setSoundEnabled;

// Slice 5 additions: Font, Dictionary, Converter, System Care
window.applyFont = applyFont;
window.deleteWord = deleteWord;
window.promptEditWord = promptEditWord;
window.renderDictionaryList = renderDictionaryList;
window.toggleDirection = toggleDirection;
window.performConversion = performConversion;
window.refreshSystemHealth = refreshSystemHealth;
window.testApiPing = testApiPing;
window.clearCaches = clearCaches;
window.verifyIntegrity = verifyIntegrity;
window.resetEngineState = resetEngineState;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all subsystems
  applyTranslations();
  initTheme();
  initLogoManager();
  initDockManager();
  initNavigation();
  initOnboarding();
  initSoundManager();
  initSettingsManager();
  initTypingStudio();
  initLayoutViewer();
  initFontManager();
  initDictionaryManager();
  initConverterManager();
  initSystemCareManager();

  // Listen for IPC tray and global shortcut triggers
  setupIpcListeners();
});

function setupIpcListeners() {
  if (!window.matraAPI) return;

  // Handle tray actions from native Windows system tray
  if (window.matraAPI.onTrayAction) {
    window.matraAPI.onTrayAction((action) => {
      if (!action) return;

      if (action.type === 'mode') {
        setAppMode(action.value);
      } else if (action.type === 'layout') {
        setAppLayout(action.value);
      } else if (action.type === 'sound') {
        setSoundEnabled(action.value);
        const soundInput = document.getElementById('tray-sound-toggle-input');
        if (soundInput) soundInput.checked = Boolean(action.value);
      } else if (action.type === 'open-viewer') {
        switchView('app');
        openLayoutViewer();
      } else if (action.type === 'tab') {
        switchView('app');
        setTab(action.value);
      }
    });
  }

  // Handle global keyboard shortcuts (Ctrl+Space, F12)
  if (window.matraAPI.onShortcutToggleMode) {
    window.matraAPI.onShortcutToggleMode(() => {
      toggleAppMode();
    });
  }
}
