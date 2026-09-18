// Matra Keyboard First-Run Onboarding Controller
import { getSetting, setSetting } from './settingsStore.js';

export function initOnboarding() {
  const isDone = getSetting('onboardingShown', false);
  const overlay = document.getElementById('onboarding-modal');

  if (!isDone && overlay) {
    overlay.classList.remove('hidden');
  }

  const dismissBtn = document.getElementById('btn-dismiss-onboarding');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', dismissOnboarding);
  }
}

export function dismissOnboarding() {
  const overlay = document.getElementById('onboarding-modal');
  if (overlay) {
    overlay.classList.add('hidden');
  }
  setSetting('onboardingShown', true);
}

export function showOnboarding() {
  const overlay = document.getElementById('onboarding-modal');
  if (overlay) {
    overlay.classList.remove('hidden');
  }
}

// Expose dismissOnboarding to global scope for onclick handler in index.html
if (typeof window !== 'undefined') {
  window.dismissOnboarding = dismissOnboarding;
}
