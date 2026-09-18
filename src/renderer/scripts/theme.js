// Matra Keyboard Theme & Aesthetics Manager
import { getSetting, setSetting, subscribeSetting } from './settingsStore.js';

export const themePresets = {
  default: { accent: '#f97316', opacity: 50, blur: 24, id: 'theme-tile-default' },
  oled: { accent: '#ffffff', opacity: 90, blur: 10, id: 'theme-tile-oled' },
  nordic: { accent: '#38bdf8', opacity: 40, blur: 30, id: 'theme-tile-nordic' },
  ivory: { accent: '#d97706', opacity: 45, blur: 20, id: 'theme-tile-ivory' },
  sunset: { accent: '#ea580c', opacity: 60, blur: 26, id: 'theme-tile-sunset' },
  emerald: { accent: '#10b981', opacity: 50, blur: 24, id: 'theme-tile-emerald' }
};

const accentCycleList = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#38bdf8'];
let currentAccentIdx = 0;

export function initTheme() {
  const savedTheme = getSetting('theme', 'default');
  const savedAccent = getSetting('customAccent', '#f97316');
  const savedOpacity = parseInt(getSetting('glassOpacity', 50), 10);
  const savedBlur = parseInt(getSetting('glassBlur', 24), 10);
  const preset = themePresets[savedTheme] || themePresets.default;

  selectThemePreset(savedTheme, false);
  setCustomAccent(savedAccent, false);
  updateOpacity(savedOpacity, false);
  updateBlur(savedBlur, false);
  highlightThemeTile(preset.id);

  const sliderOpacity = document.getElementById('slider-opacity');
  const sliderBlur = document.getElementById('slider-blur');
  const accentPicker = document.getElementById('accent-color-picker');

  if (sliderOpacity) sliderOpacity.value = savedOpacity;
  if (sliderBlur) sliderBlur.value = savedBlur;
  if (accentPicker) accentPicker.value = savedAccent;

  // Re-apply if settings imported
  subscribeSetting('*', (settings) => {
    if (settings.theme && themePresets[settings.theme]) {
      selectThemePreset(settings.theme, false);
    }
    if (settings.customAccent) {
      setCustomAccent(settings.customAccent, false);
      if (accentPicker) accentPicker.value = settings.customAccent;
    }
    if (settings.glassOpacity !== undefined) {
      updateOpacity(settings.glassOpacity, false);
      if (sliderOpacity) sliderOpacity.value = settings.glassOpacity;
    }
    if (settings.glassBlur !== undefined) {
      updateBlur(settings.glassBlur, false);
      if (sliderBlur) sliderBlur.value = settings.glassBlur;
    }
  });
}

export function updateOpacity(val, persist = true) {
  const decimal = (val / 100).toFixed(2);
  document.documentElement.style.setProperty('--glass-opacity', decimal);
  const label = document.getElementById('opacity-val-label');
  if (label) label.textContent = `${val}%`;
  if (persist) setSetting('glassOpacity', val);
}

export function updateBlur(val, persist = true) {
  document.documentElement.style.setProperty('--glass-blur', `${val}px`);
  const label = document.getElementById('blur-val-label');
  if (label) label.textContent = `${val}px`;
  if (persist) setSetting('glassBlur', val);
}

export function setCustomAccent(color, persist = true) {
  document.documentElement.style.setProperty('--brand-accent', color);
  document.documentElement.style.setProperty('--brand-accent-glow', `${color}40`);

  // Update elements that use direct inline background or color
  document.querySelectorAll('.theme-accent-bg').forEach((el) => {
    el.style.backgroundColor = color;
  });
  document.querySelectorAll('.theme-accent-color').forEach((el) => {
    el.style.color = color;
  });

  const accentPicker = document.getElementById('accent-color-picker');
  if (accentPicker) accentPicker.value = color;

  if (persist) setSetting('customAccent', color);
}

export function cycleAccentColor() {
  currentAccentIdx = (currentAccentIdx + 1) % accentCycleList.length;
  const nextColor = accentCycleList[currentAccentIdx];
  setCustomAccent(nextColor);
}

export function selectThemePreset(key, persist = true) {
  const preset = themePresets[key];
  if (!preset) return;

  document.documentElement.setAttribute('data-theme', key);

  setCustomAccent(preset.accent, persist);
  updateOpacity(preset.opacity, persist);
  updateBlur(preset.blur, persist);

  const sliderOpacity = document.getElementById('slider-opacity');
  const sliderBlur = document.getElementById('slider-blur');
  if (sliderOpacity) sliderOpacity.value = preset.opacity;
  if (sliderBlur) sliderBlur.value = preset.blur;

  highlightThemeTile(preset.id);
  if (persist) {
    setSetting('theme', key);
  }
}

function highlightThemeTile(tileId) {
  document.querySelectorAll('.theme-tile').forEach((tile) => {
    if (tile.id === tileId) {
      tile.classList.add('active');
    } else {
      tile.classList.remove('active');
    }
  });
}
