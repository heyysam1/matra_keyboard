// Matra Keyboard Brand Logo System
import logoOrange from '../assets/logos/logo-orange.png';
import logoDark from '../assets/logos/logo-dark.png';
import logoWhite from '../assets/logos/logo-white.png';

export const logos = {
  orange: logoOrange,
  dark: logoDark,
  white: logoWhite
};

let activeLogoKey = localStorage.getItem('matra_active_logo') || 'orange';

export function initLogoManager() {
  setAppLogo(activeLogoKey, false);
}

export function setAppLogo(key, persist = true) {
  if (!logos[key]) return;
  activeLogoKey = key;
  const src = logos[key];

  const headerLogo = document.getElementById('header-app-logo');
  const trayLogo = document.getElementById('tray-app-logo');
  if (headerLogo) headerLogo.src = src;
  if (trayLogo) trayLogo.src = src;

  // Update active state on tiles
  ['orange', 'dark', 'white'].forEach((k) => {
    const tile = document.getElementById(`icon-tile-${k}`);
    if (tile) {
      if (k === key) {
        tile.classList.add('active');
      } else {
        tile.classList.remove('active');
      }
    }
  });

  if (persist) {
    localStorage.setItem('matra_active_logo', key);
    if (window.matraAPI && window.matraAPI.setAppLogo) {
      window.matraAPI.setAppLogo(key);
    }
  }
}

export function getActiveLogo() {
  return activeLogoKey;
}
