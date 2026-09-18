// Matra Keyboard — Tactile Mechanical & Normal Typing Audio Synthesizer
// Uses Web Audio API for lightweight, standalone keypress feedback without external audio files.
import { getSetting, setSetting, subscribeSetting } from './settingsStore.js';

let audioCtx = null;
let soundEnabled = true;
let soundProfile = 'normal'; // 'normal' (default) | 'tactile' | 'typewriter' | 'membrane'
let soundVolume = 0.20; // 0.0 to 1.0 (20% default)

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    if (!audioCtx) {
      getAudioContext();
    } else if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  };
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
}

export function initSoundManager() {
  soundEnabled = getSetting('soundEnabled', true);
  soundProfile = getSetting('soundProfile', 'normal');
  soundVolume = getSetting('soundVolume', 0.20);

  // Re-apply if settings imported
  subscribeSetting('*', (settings) => {
    if (settings.soundEnabled !== undefined) soundEnabled = Boolean(settings.soundEnabled);
    if (settings.soundProfile) soundProfile = settings.soundProfile;
    if (settings.soundVolume !== undefined) soundVolume = parseFloat(settings.soundVolume) || 0.20;
  });
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(enabled) {
  soundEnabled = Boolean(enabled);
  setSetting('soundEnabled', soundEnabled);
  if (window.matraAPI && window.matraAPI.syncTrayState) {
    window.matraAPI.syncTrayState({ soundEnabled });
  }
}

export function getSoundProfile() {
  return soundProfile;
}

export function setSoundProfile(profile) {
  if (!['normal', 'tactile', 'typewriter', 'membrane'].includes(profile)) return;
  soundProfile = profile;
  setSetting('soundProfile', profile);
}

export function getSoundVolume() {
  return soundVolume;
}

export function setSoundVolume(volume) {
  const vol = Math.max(0, Math.min(1, parseFloat(volume) || 0));
  soundVolume = vol;
  setSetting('soundVolume', vol);
}

/**
 * Synthesizes a key click based on the chosen profile and volume.
 * @param {string} [profileOverride] Optional override for preview testing
 */
function synthesizeClick(profileOverride = null) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => synthesizeClick(profileOverride)).catch(() => {});
      return;
    }

    const profile = profileOverride || soundProfile;
    const now = ctx.currentTime;
    const vol = soundVolume;
    if (vol <= 0.001) return;

    if (profile === 'normal') {
      // Profile 1: Normal Default (Modern crisp switch with subtle acoustic damping)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1650, now);
      filter.Q.setValueAtTime(2.8, now);

      const freq = 1250 + Math.random() * 200;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.020);

      const peak = 0.18 * vol;
      gain.gain.setValueAtTime(peak, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.020);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.020);

      // Subtle bottom-out tactile body
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(130, now);
      subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.028);

      const subPeak = 0.09 * vol;
      subGain.gain.setValueAtTime(subPeak, now);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);

      subOsc.start(now);
      subOsc.stop(now + 0.028);

    } else if (profile === 'typewriter') {
      // Profile 2: Typewriter (Metal mechanical hammer strike + bottom-out recoil)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(600, now);

      const freq = 1600 + Math.random() * 300;
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);
      osc1.frequency.exponentialRampToValueAtTime(140, now + 0.045);

      const peak1 = 0.14 * vol;
      gain1.gain.setValueAtTime(peak1, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc1.connect(filter);
      filter.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.045);

      // Secondary subtle recoil click
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      const recoilTime = now + 0.015;
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(800, recoilTime);
      osc2.frequency.exponentialRampToValueAtTime(90, recoilTime + 0.03);

      const peak2 = 0.08 * vol;
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(peak2, recoilTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, recoilTime + 0.03);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(recoilTime);
      osc2.stop(recoilTime + 0.03);

    } else if (profile === 'membrane') {
      // Profile 3: Membrane (Soft, cushioned, dampened rubber dome thud)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);

      const freq = 320 + Math.random() * 60;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.022);

      const peak = 0.07 * vol;
      gain.gain.setValueAtTime(peak, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.022);

    } else {
      // Profile 4: Tactile Mechanical (Crisp, snappy mechanical switch leaf)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq = 1000 + Math.random() * 350;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.025);

      const peak = 0.10 * vol;
      gain.gain.setValueAtTime(peak, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    }
  } catch (_e) {
    // Audio synthesis failure should never interrupt typing
  }
}

export function playKeyClick() {
  if (!soundEnabled) return;
  synthesizeClick();
}

export const playTypingSound = playKeyClick;

export function testSound(profile = null) {
  synthesizeClick(profile || soundProfile);
}
