// Matra Keyboard — Script Converter Controller
// Manages Bijoy (ANSI) <-> Unicode bidirectional conversion, direction swapping, copy, and sample texts.

import { bijoyToUnicode, unicodeToBijoy } from '../../engine/BijoyUnicodeConverter.js';
import { showSettingsToast } from './settingsManager.js';

let currentDirection = 'bijoy-to-unicode'; // 'bijoy-to-unicode' | 'unicode-to-bijoy'

const SAMPLE_TEXTS = {
  'bijoy-to-unicode': 'Avwg evsjvq Mvb MvB, Avwg evsjvi Mvb MvB; Avwg Avgvi Avwg‡K wPiw`b GB evsjvq Lyu‡R cvB| hy³v¶i I cÖK…wZ|',
  'unicode-to-bijoy': 'আমি বাংলায় গান গাই, আমি বাংলার গান গাই; আমি আমার আমিকে চিরদিন এই বাংলায় খুঁজে পাই। যুক্তাক্ষর ও প্রকৃতি।'
};

export function initConverterManager() {
  setupConverterUI();
}

function setupConverterUI() {
  const srcArea = document.getElementById('converter-source-input');
  const targetArea = document.getElementById('converter-target-output');
  const swapBtn = document.getElementById('btn-swap-converter');
  const copyBtn = document.getElementById('btn-copy-converted');
  const clearBtn = document.getElementById('btn-clear-converted');
  const sampleBtn = document.getElementById('btn-sample-converted');

  if (srcArea) {
    srcArea.addEventListener('input', () => {
      performConversion();
    });
  }

  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      toggleDirection();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      handleCopy();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (srcArea) srcArea.value = '';
      if (targetArea) targetArea.value = '';
      updateStats();
      showSettingsToast('টেক্সট বক্স মুছে ফেলা হয়েছে', 'info');
    });
  }

  if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
      if (srcArea) {
        srcArea.value = SAMPLE_TEXTS[currentDirection];
        performConversion();
        showSettingsToast('নমুনা টেক্সট লোড করা হয়েছে', 'success');
      }
    });
  }
}

export function toggleDirection() {
  currentDirection = currentDirection === 'bijoy-to-unicode' ? 'unicode-to-bijoy' : 'bijoy-to-unicode';

  const srcArea = document.getElementById('converter-source-input');
  const targetArea = document.getElementById('converter-target-output');
  const dirBadge = document.getElementById('converter-direction-badge');
  const srcLabel = document.getElementById('converter-source-label');
  const targetLabel = document.getElementById('converter-target-label');

  // Swap text contents
  if (srcArea && targetArea) {
    const oldTarget = targetArea.value;
    srcArea.value = oldTarget;
    targetArea.value = '';
  }

  if (currentDirection === 'bijoy-to-unicode') {
    if (dirBadge) dirBadge.textContent = 'বিজয় (ANSI) ➔ ইউনিকোড';
    if (srcLabel) srcLabel.textContent = 'বিজয় / ANSI সোর্স টেক্সট:';
    if (targetLabel) targetLabel.textContent = 'ইউনিকোড বাংলা ফলাফল:';
    if (srcArea) srcArea.placeholder = 'এখানে বিজয় বা অ্যানসি টেক্সট পেস্ট করুন...';
    if (targetArea) targetArea.placeholder = 'ইউনিকোড ফলাফল এখানে আসবে...';
  } else {
    if (dirBadge) dirBadge.textContent = 'ইউনিকোড ➔ বিজয় (ANSI)';
    if (srcLabel) srcLabel.textContent = 'ইউনিকোড বাংলা সোর্স টেক্সট:';
    if (targetLabel) targetLabel.textContent = 'বিজয় / ANSI ফলাফল:';
    if (srcArea) srcArea.placeholder = 'এখানে সাধারণ ইউনিকোড বাংলা পেস্ট করুন...';
    if (targetArea) targetArea.placeholder = 'বিজয় (SutonnyMJ) ফলাফল এখানে আসবে...';
  }

  performConversion();
  showSettingsToast(`কনভার্টার রূপান্তর দিক পরিবর্তন করা হয়েছে`, 'info');
}

export function performConversion() {
  const srcArea = document.getElementById('converter-source-input');
  const targetArea = document.getElementById('converter-target-output');
  if (!srcArea || !targetArea) return;

  const raw = srcArea.value || '';
  if (!raw) {
    targetArea.value = '';
    updateStats();
    return;
  }

  let converted = '';
  if (currentDirection === 'bijoy-to-unicode') {
    converted = bijoyToUnicode(raw);
  } else {
    converted = unicodeToBijoy(raw);
  }

  targetArea.value = converted;
  updateStats();
}

function updateStats() {
  const srcArea = document.getElementById('converter-source-input');
  const targetArea = document.getElementById('converter-target-output');
  const srcStats = document.getElementById('converter-src-stats');
  const targetStats = document.getElementById('converter-target-stats');

  const srcText = srcArea ? srcArea.value : '';
  const targetText = targetArea ? targetArea.value : '';

  if (srcStats) {
    const chars = srcText.length;
    const words = srcText.trim() ? srcText.trim().split(/\s+/).length : 0;
    srcStats.textContent = `${chars} বর্ণ • ${words} শব্দ`;
  }

  if (targetStats) {
    const chars = targetText.length;
    const words = targetText.trim() ? targetText.trim().split(/\s+/).length : 0;
    targetStats.textContent = `${chars} বর্ণ • ${words} শব্দ`;
  }
}

async function handleCopy() {
  const targetArea = document.getElementById('converter-target-output');
  if (!targetArea || !targetArea.value) {
    showSettingsToast('কপি করার জন্য কোনো ফলাফল নেই', 'error');
    return;
  }

  try {
    await navigator.clipboard.writeText(targetArea.value);
    showSettingsToast('ফলাফল সফলভাবে ক্লিপবোর্ডে কপি করা হয়েছে', 'success');
  } catch (_e) {
    targetArea.select();
    document.execCommand('copy');
    showSettingsToast('ফলাফল ক্লিপবোর্ডে কপি করা হয়েছে', 'success');
  }
}
