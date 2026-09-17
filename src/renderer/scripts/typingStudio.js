// Matra Keyboard — Typing Studio & Popover UI Controller

import { TypingSession } from '../../engine/TypingSession.js';
import { playKeyClick } from './soundManager.js';
import { setViewerLayout } from './layoutViewer.js';

let session = null;

export function initTypingStudio() {
  const previewBox = document.getElementById('typing-preview-box');
  const hiddenInput = document.getElementById('typing-hidden-input');
  const popover = document.getElementById('suggestion-popover');
  const popoverList = document.getElementById('popover-candidate-list');
  const candidateBar = document.getElementById('candidate-hotkey-bar');

  if (!previewBox || !popover) return;

  // Restore saved mode and layout preferences
  const savedMode = localStorage.getItem('matra_active_mode') || 'bn';
  const savedLayout = localStorage.getItem('matra_active_layout') || 'avro';

  // Check if this is the user's first run or subsequent runs
  const isFirstRun = !localStorage.getItem('matra_onboarding_done');

  if (isFirstRun) {
    // Initial onboarding showcase text state
    session = new TypingSession('আমি বাংলায় গান গাই, আমি বাংলার গান গাই; আমি আমার ');
    session.activeToken = 'bhalobashi';
    session.candidates = ['ভালোবাসি', 'ভালোবাসী', 'ভালবাসি', 'ভালবাসা', 'ভালো বাসি'];
    session.selectedIndex = 0;
    session.isPopoverOpen = true;
  } else {
    // Normal subsequent run: clean empty typing canvas
    session = new TypingSession('');
    session.activeToken = '';
    session.candidates = [];
    session.selectedIndex = 0;
    session.isPopoverOpen = false;
  }
  session.mode = savedMode;
  session.layout = savedLayout;

  // Focus management: clicking on the preview box focuses the input unless text is selected
  previewBox.addEventListener('click', () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return; // Do not disrupt active text selection
    }
    if (hiddenInput) hiddenInput.focus();
  });

  if (hiddenInput) {
    hiddenInput.addEventListener('keydown', async (e) => {
      // Allow standard Ctrl+C (copy), Ctrl+X (cut) to work natively
      if (e.ctrlKey && ['c', 'C', 'x', 'X'].includes(e.key)) {
        return;
      }
      if (e.ctrlKey && (e.key === 'a' || e.key === 'A')) {
        // Select all text in previewBox
        e.preventDefault();
        const range = document.createRange();
        range.selectNodeContents(previewBox);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }

      // Play tactile key click feedback
      if (!e.ctrlKey && !e.altKey && !e.metaKey && !['Shift', 'Control', 'Alt', 'CapsLock'].includes(e.key)) {
        playKeyClick();
      }

      const consumed = await session.handleKey(e);
      if (consumed) {
        e.preventDefault();
      }
    });

    // Automatically focus the input when Typing Studio is active
    hiddenInput.focus();
  }

  // Subscribe to session state updates
  session.subscribe((state) => {
    renderPreview(state, previewBox);
    renderPopover(state, popover, popoverList);
    renderHotkeyBar(state, candidateBar);
    updateControlsState(state);
  });

  // Clicking outside closes the popover
  document.addEventListener('click', (e) => {
    if (popover && !popover.contains(e.target) && !previewBox.contains(e.target) && (!candidateBar || !candidateBar.contains(e.target))) {
      session.closePopover();
    }
  });

  // Initial render & sync
  session.emitChange();
  syncStateToTray(session.getState());
}

export function setAppMode(mode) {
  if (!session) return;
  const targetMode = mode === 'en' ? 'en' : 'bn';
  session.setMode(targetMode);
  localStorage.setItem('matra_active_mode', targetMode);
  syncStateToTray(session.getState());
}

export function toggleAppMode() {
  if (!session) return;
  const nextMode = session.mode === 'bn' ? 'en' : 'bn';
  setAppMode(nextMode);
}

export function setAppLayout(layout) {
  if (!session) return;
  session.setLayout(layout);
  localStorage.setItem('matra_active_layout', layout);
  setViewerLayout(layout);
  syncStateToTray(session.getState());
}

function updateControlsState(state) {
  // Studio mode badge
  const modeBadge = document.getElementById('studio-mode-badge');
  const modeText = document.getElementById('studio-mode-text');
  if (modeBadge && modeText) {
    if (state.mode === 'en') {
      modeBadge.classList.add('mode-en');
      modeText.textContent = 'English Mode';
    } else {
      modeBadge.classList.remove('mode-en');
      modeText.textContent = 'বাংলা মোড';
    }
  }

  // Studio layout dropdown
  const layoutSelect = document.getElementById('studio-layout-select');
  if (layoutSelect && layoutSelect.value !== state.layout) {
    layoutSelect.value = state.layout;
  }

  // Tray popover mode buttons
  const trayBtnBn = document.getElementById('tray-btn-mode-bn');
  const trayBtnEn = document.getElementById('tray-btn-mode-en');
  if (trayBtnBn && trayBtnEn) {
    if (state.mode === 'bn') {
      trayBtnBn.classList.add('btn-primary');
      trayBtnBn.style.color = '#ffffff';
      trayBtnEn.classList.remove('btn-primary');
      trayBtnEn.style.color = '#a1a1aa';
    } else {
      trayBtnEn.classList.add('btn-primary');
      trayBtnEn.style.color = '#ffffff';
      trayBtnBn.classList.remove('btn-primary');
      trayBtnBn.style.color = '#a1a1aa';
    }
  }

  // Tray popover layout buttons
  const layouts = ['avro', 'bijoy', 'probhat'];
  layouts.forEach((id) => {
    const btn = document.getElementById(`tray-btn-layout-${id}`);
    if (btn) {
      if (id === state.layout) {
        btn.classList.add('active');
        btn.style.color = 'var(--brand-accent)';
        btn.style.borderColor = 'rgba(249, 115, 22, 0.3)';
        btn.style.background = 'rgba(249, 115, 22, 0.12)';
      } else {
        btn.classList.remove('active');
        btn.style.color = '#d4d4d8';
        btn.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        btn.style.background = 'rgba(255, 255, 255, 0.05)';
      }
    }
  });
}

function syncStateToTray(state) {
  if (window.matraAPI && window.matraAPI.syncTrayState) {
    window.matraAPI.syncTrayState({
      mode: state.mode,
      layout: state.layout
    });
  }
}

function renderPreview(state, container) {
  if (!container) return;

  const committedSpan = `<span class="committed-text">${escapeHtml(state.committedText)}</span>`;
  const tokenSpan = state.activeToken 
    ? `<span class="phonetic-token">${escapeHtml(state.activeToken)}</span>` 
    : '';
  const caretSpan = `<span class="caret-bar caret-pulse"></span>`;

  container.innerHTML = `${committedSpan}${tokenSpan}${caretSpan}`;
}

function renderPopover(state, popover, listContainer) {
  if (!popover || !listContainer) return;

  if (!state.isPopoverOpen || state.candidates.length === 0) {
    popover.style.display = 'none';
    return;
  }

  popover.style.display = 'block';

  let html = '';
  state.candidates.slice(0, 5).forEach((cand, idx) => {
    const isActive = idx === state.selectedIndex;
    const badgeText = idx === 0 ? 'Space / 1' : `${idx + 1}`;
    const activeClass = isActive ? 'active' : '';

    html += `
      <div class="popover-item ${activeClass}" data-cand-idx="${idx}">
        <span class="font-bengali">${escapeHtml(cand)}</span>
        <span class="popover-badge">${badgeText}</span>
      </div>
    `;
  });

  listContainer.innerHTML = html;

  // Add click events to candidate rows
  listContainer.querySelectorAll('.popover-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(item.getAttribute('data-cand-idx'), 10);
      session.commitCandidate(idx);
      const hiddenInput = document.getElementById('typing-hidden-input');
      if (hiddenInput) hiddenInput.focus();
    });
  });
}

function renderHotkeyBar(state, barContainer) {
  if (!barContainer) return;

  const defaultWords = ['ভালোবাসি', 'ভালোবাসী', 'ভালবাসি', 'ভালবাসা', 'ভালো বাসি'];
  const wordsToShow = state.candidates.length > 0 ? state.candidates.slice(0, 5) : defaultWords;

  let html = '';
  for (let i = 0; i < 5; i++) {
    const word = wordsToShow[i] || '';
    const isActive = state.isPopoverOpen && i === state.selectedIndex;
    const activeClass = isActive ? 'active' : '';

    html += `
      <div class="glass-pill candidate-chip ${activeClass}" data-chip-idx="${i}">
        <span class="candidate-word font-bengali">${escapeHtml(word)}</span>
        <span class="candidate-hotkey">[${i + 1}]</span>
      </div>
    `;
  }

  barContainer.innerHTML = html;

  barContainer.querySelectorAll('.candidate-chip').forEach((chip) => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(chip.getAttribute('data-chip-idx'), 10);
      if (state.candidates.length > idx) {
        session.commitCandidate(idx);
      }
      const hiddenInput = document.getElementById('typing-hidden-input');
      if (hiddenInput) hiddenInput.focus();
    });
  });
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getTypingSession() {
  return session;
}
