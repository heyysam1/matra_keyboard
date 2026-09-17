// Matra Keyboard — Virtual Layout Visualizer Controller (Section 9 & DESIGN.md)

import { LayoutManager } from '../../engine/LayoutManager.js';
import { getTypingSession } from './typingStudio.js';
import { playKeyClick } from './soundManager.js';

let currentLayout = 'avro';
let isShift = false;
let isViewerOpen = false;

export function initLayoutViewer() {
  const modal = document.getElementById('virtual-keyboard-modal');
  if (!modal) return;

  // Listen for physical Shift key to update visualizer glyphs dynamically
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') {
      isShift = true;
      updateShiftState();
    }

    // Key illumination for visualizer
    if (e.code) {
      const keycap = document.querySelector(`.vk-keycap[data-code="${e.code}"]`);
      if (keycap) {
        keycap.classList.add('vk-pressed');
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') {
      isShift = false;
      updateShiftState();
    }

    if (e.code) {
      const keycap = document.querySelector(`.vk-keycap[data-code="${e.code}"]`);
      if (keycap) {
        keycap.classList.remove('vk-pressed');
      }
    }
  });

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeLayoutViewer();
    }
  });

  // Render initial matrix
  renderKeyboardMatrix();
}

export function openLayoutViewer() {
  const modal = document.getElementById('virtual-keyboard-modal');
  if (!modal) return;

  isViewerOpen = true;
  modal.classList.remove('hidden');

  // Pull current layout from session if available
  const session = getTypingSession();
  if (session && session.layout) {
    currentLayout = session.layout;
  }

  renderKeyboardMatrix();
}

export function closeLayoutViewer() {
  const modal = document.getElementById('virtual-keyboard-modal');
  if (!modal) return;

  isViewerOpen = false;
  modal.classList.add('hidden');
}

export function toggleLayoutViewer() {
  if (isViewerOpen) {
    closeLayoutViewer();
  } else {
    openLayoutViewer();
  }
}

export function setViewerLayout(layoutId) {
  currentLayout = layoutId;
  renderKeyboardMatrix();
}

export function toggleVirtualShift() {
  isShift = !isShift;
  updateShiftState();
}

function updateShiftState() {
  const shiftBtn = document.getElementById('vk-shift-toggle');
  if (shiftBtn) {
    if (isShift) {
      shiftBtn.classList.add('active');
    } else {
      shiftBtn.classList.remove('active');
    }
  }

  // Update Bengali glyphs on visible keycaps
  const matrix = LayoutManager.getLayoutMatrix(currentLayout);
  matrix.forEach((row) => {
    row.forEach((keyDef) => {
      const keyEl = document.querySelector(`.vk-keycap[data-code="${keyDef.code}"] .vk-glyph-bn`);
      if (keyEl) {
        keyEl.textContent = isShift ? keyDef.bnShift : keyDef.bnNormal;
      }
    });
  });
}

function renderKeyboardMatrix() {
  const container = document.getElementById('vk-matrix');
  if (!container) return;

  const matrix = LayoutManager.getLayoutMatrix(currentLayout);
  const layoutInfo = LayoutManager.getLayout(currentLayout);

  // Update layout button styles
  const layouts = ['avro', 'bijoy', 'probhat'];
  layouts.forEach((id) => {
    const btn = document.getElementById(`vk-switch-${id}`);
    if (btn) {
      if (id === currentLayout) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });

  const badge = document.getElementById('vk-active-layout-badge');
  if (badge) {
    badge.textContent = `${layoutInfo.name} (${layoutInfo.nameBn})`;
  }

  let html = '';
  matrix.forEach((row, rowIdx) => {
    html += `<div class="vk-row" data-row="${rowIdx}">`;
    row.forEach((keyDef) => {
      const widthStyle = keyDef.width ? `style="flex: ${keyDef.width}; min-width: ${keyDef.width * 36}px;"` : '';
      const activeGlyph = isShift ? keyDef.bnShift : keyDef.bnNormal;
      const specialClass = keyDef.isSpecial ? 'vk-key-special' : '';

      html += `
        <button class="vk-keycap ${specialClass}" data-code="${keyDef.code}" data-key="${keyDef.key}" ${widthStyle}>
          <span class="vk-glyph-bn font-bengali">${activeGlyph || ''}</span>
          <span class="vk-glyph-en font-mono">${keyDef.label}</span>
        </button>
      `;
    });
    html += `</div>`;
  });

  container.innerHTML = html;

  // Add click handlers on virtual keycaps
  container.querySelectorAll('.vk-keycap').forEach((keycap) => {
    keycap.addEventListener('click', async (e) => {
      e.stopPropagation();
      playKeyClick();

      // Flash button
      keycap.classList.add('vk-pressed');
      setTimeout(() => keycap.classList.remove('vk-pressed'), 120);

      const code = keycap.getAttribute('data-code');
      const keyChar = keycap.getAttribute('data-key');

      if (code === 'ShiftLeft' || code === 'ShiftRight') {
        toggleVirtualShift();
        return;
      }

      if (code === 'Backspace') {
        const session = getTypingSession();
        if (session) await session.handleKey({ key: 'Backspace' });
        refocusInput();
        return;
      }

      if (code === 'Enter') {
        const session = getTypingSession();
        if (session) await session.handleKey({ key: 'Enter' });
        refocusInput();
        return;
      }

      if (code === 'Space') {
        const session = getTypingSession();
        if (session) await session.handleKey({ key: ' ' });
        refocusInput();
        return;
      }

      // Printable key
      if (keyChar && keyChar.length === 1) {
        const charToSend = isShift ? keyChar.toUpperCase() : keyChar.toLowerCase();
        const session = getTypingSession();
        if (session) {
          await session.handleKey({ key: charToSend, shiftKey: isShift });
        }
        refocusInput();
      }
    });
  });
}

function refocusInput() {
  const hiddenInput = document.getElementById('typing-hidden-input');
  if (hiddenInput) {
    hiddenInput.focus();
  }
}
