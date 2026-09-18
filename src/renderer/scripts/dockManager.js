// Matra Keyboard Top Dock / Bar Variant Manager
import { getSetting, setSetting, subscribeSetting } from './settingsStore.js';

let activeDockVariant = 1;

export function initDockManager() {
  activeDockVariant = parseInt(getSetting('dockVariant', 1), 10);
  setDockVariant(activeDockVariant, false);

  // Re-apply if settings imported
  subscribeSetting('*', (settings) => {
    if (settings.dockVariant !== undefined) {
      setDockVariant(parseInt(settings.dockVariant, 10), false);
    }
  });
}

export function setDockVariant(variantNum, persist = true) {
  activeDockVariant = variantNum;

  for (let i = 1; i <= 5; i++) {
    const preview = document.getElementById(`dock-preview-v${i}`);
    const card = document.getElementById(`dock-card-${i}`);

    if (i === variantNum) {
      if (preview) {
        preview.classList.remove('hidden');
        preview.style.display = 'flex';
      }
      if (card) {
        card.classList.add('active');
      }
    } else {
      if (preview) {
        preview.classList.add('hidden');
        preview.style.display = 'none';
      }
      if (card) {
        card.classList.remove('active');
      }
    }
  }

  if (persist) {
    setSetting('dockVariant', variantNum);
  }
}

export function getActiveDockVariant() {
  return activeDockVariant;
}
