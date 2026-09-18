// Matra Keyboard — Font Selection & Custom Font Loader Manager
// Handles standard font switching, global typography updates, and dynamic custom font installation via FontFace API.

import { showSettingsToast } from './settingsManager.js';
import { getSetting, setSetting, subscribeSetting } from './settingsStore.js';

export const BUNDLED_FONTS = [
  { id: 'font-card-noto', name: 'Noto Sans Bengali', bengaliName: 'নোটো সান্স বাংলা (Noto Sans Bengali)', type: 'Default (Unicode)', sample: 'আমার সোনার বাংলা, আমি তোমায় ভালোবাসি।' },
  { id: 'font-card-hind', name: 'Hind Siliguri', bengaliName: 'হিন্দ শিলিগুড়ি (Hind Siliguri)', type: 'Clean Sans', sample: 'মোদের গরব, মোদের আশা, আ মরি বাংলা ভাষা!' },
  { id: 'font-card-solaiman', name: 'SolaimanLipi', bengaliName: 'সোলায়মানলিপি (SolaimanLipi)', type: 'Classic', sample: 'বাংলা বর্ণমালার ঐতিহ্য ও আধুনিক প্রযুক্তির মেলবন্ধন।' },
  { id: 'font-card-siyam', name: 'Siyam Rupali', bengaliName: 'সিয়াম রূপালী (Siyam Rupali)', type: 'Web Safe', sample: 'মুক্ত ও স্বাধীন চিন্তার প্রকাশ হোক মাতৃভাষায়।' }
];

let activeFont = 'Noto Sans Bengali';

export function initFontManager() {
  const savedFont = getSetting('activeFont', 'Noto Sans Bengali');
  applyFont(savedFont, false);
  setupFontUI();

  // Re-apply if settings imported
  subscribeSetting('*', (settings) => {
    if (settings.activeFont) {
      applyFont(settings.activeFont, false);
    }
  });
}

function setupFontUI() {
  const container = document.getElementById('fonts-container');
  if (container) {
    container.querySelectorAll('.font-card').forEach((card) => {
      card.addEventListener('click', () => {
        const fontName = card.getAttribute('data-font-name');
        if (fontName) {
          applyFont(fontName);
          showSettingsToast(`টাইপোগ্রাফি ফন্ট '${fontName}'-এ পরিবর্তিত হয়েছে`, 'success');
        }
      });
    });
  }

  // Setup Custom Font Drag-and-Drop & Browse
  const dropzone = document.getElementById('font-dropzone-box');
  const fileInput = document.getElementById('font-file-input');
  const installBtn = document.getElementById('btn-install-custom-font');

  if (installBtn && fileInput) {
    installBtn.addEventListener('click', () => {
      fileInput.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleFontFile(file);
    });
  }

  if (dropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-over');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-over');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const file = dt && dt.files && dt.files[0];
      if (file) handleFontFile(file);
    });

    dropzone.addEventListener('click', () => {
      if (fileInput) fileInput.click();
    });
  }
}

export function applyFont(fontName, persist = true) {
  activeFont = fontName;
  // Scope font changes strictly to typed Bengali text, keeping UI typography intact
  document.documentElement.style.setProperty('--font-typing-bengali', `"${fontName}", 'Noto Sans Bengali', sans-serif`);

  // Update card active states
  const cards = document.querySelectorAll('.font-card');
  cards.forEach((card) => {
    const name = card.getAttribute('data-font-name');
    const badge = card.querySelector('.font-active-badge');
    if (name === fontName) {
      card.classList.add('active');
      if (badge) {
        badge.textContent = 'Active';
        badge.style.display = 'inline-block';
        badge.style.background = 'rgba(249, 115, 22, 0.2)';
        badge.style.color = 'var(--brand-accent)';
      }
    } else {
      card.classList.remove('active');
      if (badge) {
        badge.textContent = badge.getAttribute('data-original-type') || 'Select';
        badge.style.background = 'transparent';
        badge.style.color = '#71717a';
      }
    }
  });

  if (persist) {
    setSetting('activeFont', fontName);
  }
}

async function handleFontFile(file) {
  if (!file) return;

  const validExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
  const fileName = file.name;
  const isExtensionValid = validExtensions.some(ext => fileName.toLowerCase().endsWith(ext));

  if (!isExtensionValid) {
    showSettingsToast('অনুগ্রহ করে একটি বৈধ TTF, OTF, অথবা WOFF2 ফন্ট ফাইল নির্বাচন করুন', 'error');
    return;
  }

  // Extract clean font family name from filename
  const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  try {
    const arrayBuffer = await file.arrayBuffer();
    const fontFace = new FontFace(cleanName, arrayBuffer);
    const loadedFace = await fontFace.load();
    document.fonts.add(loadedFace);

    // Add to font selection UI
    addCustomFontCard(cleanName);
    applyFont(cleanName);

    showSettingsToast(`কাস্টম ফন্ট '${cleanName}' সফলভাবে ইনস্টল ও প্রয়োগ করা হয়েছে!`, 'success');
  } catch (err) {
    console.error('[FontManager] Failed to load custom font:', err);
    showSettingsToast(`ফন্ট লোড করতে সমস্যা হয়েছে: ${err.message}`, 'error');
  }
}

function addCustomFontCard(fontName) {
  const container = document.getElementById('fonts-container');
  if (!container) return;

  // Check if card already exists
  const existing = container.querySelector(`[data-font-name="${fontName}"]`);
  if (existing) return;

  const card = document.createElement('div');
  card.className = 'glass-pill font-card active';
  card.setAttribute('data-font-name', fontName);
  card.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="font-bengali" style="font-size: 0.875rem; font-weight: 700; color: #ffffff;">${fontName} (কাস্টম)</div>
      <span class="font-mono font-active-badge" data-original-type="Custom" style="font-size: 0.625rem; text-transform: uppercase; background: rgba(249, 115, 22, 0.2); color: var(--brand-accent); padding: 0.15rem 0.5rem; border-radius: 4px;">Active</span>
    </div>
    <div class="font-bengali" style="font-size: 0.75rem; color: #d4d4d8; margin-top: 0.5rem; font-family: '${fontName}', sans-serif;">আমার সোনার বাংলা, আমি তোমায় ভালোবাসি।</div>
  `;

  card.addEventListener('click', () => {
    applyFont(fontName);
    showSettingsToast(`টাইপোগ্রাফি ফন্ট '${fontName}'-এ পরিবর্তিত হয়েছে`, 'success');
  });

  container.appendChild(card);
}
