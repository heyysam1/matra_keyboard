// Matra Keyboard — DOM-Independent Typing Session Manager
// Manages text buffers, active phonetic tokens, word boundaries, and popover state.

import { transliterationService } from './TransliterationService.js';
import { LayoutManager } from './LayoutManager.js';

export class TypingSession {
  constructor(initialText = '') {
    this.committedText = initialText;
    this.activeToken = '';
    this.candidates = [];
    this.selectedIndex = 0;
    this.isPopoverOpen = false;
    this.mode = 'bn'; // 'bn' | 'en'
    this.layout = 'avro'; // 'avro' | 'bijoy' | 'probhat'
    this.listeners = new Set();
    this.queryCounter = 0;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    this.emitChange();
    return () => this.listeners.delete(listener);
  }

  emitChange() {
    const state = this.getState();
    for (const listener of this.listeners) {
      try {
        listener(state);
      } catch (err) {
        console.error('[TypingSession] Listener error:', err);
      }
    }
  }

  getState() {
    return {
      committedText: this.committedText,
      activeToken: this.activeToken,
      candidates: [...this.candidates],
      selectedIndex: this.selectedIndex,
      isPopoverOpen: this.isPopoverOpen,
      fullText: this.committedText + (this.activeToken ? this.activeToken : ''),
      mode: this.mode,
      layout: this.layout
    };
  }

  setMode(mode) {
    const newMode = mode === 'en' ? 'en' : 'bn';
    if (this.mode === newMode) return;
    this.mode = newMode;
    if (this.mode === 'en') {
      if (this.activeToken) {
        this.committedText += this.activeToken;
        this.activeToken = '';
        this.candidates = [];
        this.isPopoverOpen = false;
      }
    }
    this.emitChange();
  }

  setLayout(layout) {
    if (this.layout === layout) return;
    this.layout = layout;
    if (this.activeToken) {
      const chosen = this.candidates[this.selectedIndex] || this.activeToken;
      this.committedText += chosen;
      this.activeToken = '';
      this.candidates = [];
      this.isPopoverOpen = false;
    }
    this.emitChange();
  }

  setText(text) {
    this.committedText = text || '';
    this.activeToken = '';
    this.candidates = [];
    this.isPopoverOpen = false;
    this.emitChange();
  }

  static deletePreviousWord(text) {
    let i = text.length;
    while (i > 0 && /\s/.test(text[i - 1])) {
      i--;
    }
    while (i > 0 && !/\s/.test(text[i - 1])) {
      i--;
    }
    return text.slice(0, i);
  }

  async handleKey(event) {
    const { key, ctrlKey, altKey, metaKey, shiftKey } = event;

    // SECTION K: Ctrl + . produces a plain English period (never Bengali danda)
    if (ctrlKey && key === '.') {
      if (this.activeToken && this.candidates.length > 0) {
        const chosen = this.candidates[this.selectedIndex] || this.candidates[0];
        this.committedText += chosen + '.';
        this.activeToken = '';
        this.candidates = [];
        this.isPopoverOpen = false;
        this.emitChange();
        return true;
      } else {
        this.committedText += '.';
        this.emitChange();
        return true;
      }
    }

    // SECTION J: Ctrl + Backspace deletes one word at a time
    if (ctrlKey && key === 'Backspace') {
      if (this.activeToken.length > 0) {
        this.activeToken = '';
        this.candidates = [];
        this.isPopoverOpen = false;
        this.emitChange();
        return true;
      } else if (this.committedText.length > 0) {
        this.committedText = TypingSession.deletePreviousWord(this.committedText);
        this.emitChange();
        return true;
      }
      return false;
    }

    // Ignore other modifier combinations (allow native Ctrl+C, Ctrl+V, etc.)
    if (ctrlKey || altKey || metaKey) {
      return false;
    }

    // SECTION J: Sweep for modifier/control keys — NEVER insert raw key names into buffer!
    const NON_PRINTABLE = new Set([
      'CapsLock', 'Shift', 'Control', 'Alt', 'Meta', 'Tab', 'Escape',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', 'PageUp', 'PageDown', 'Insert', 'Delete',
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
      'ContextMenu', 'Pause', 'ScrollLock', 'NumLock', 'PrintScreen',
      'AudioVolumeUp', 'AudioVolumeDown', 'AudioVolumeMute', 'MediaTrackNext', 'MediaTrackPrevious'
    ]);

    if (NON_PRINTABLE.has(key)) {
      if (key === 'Escape' && this.isPopoverOpen) {
        this.isPopoverOpen = false;
        this.emitChange();
        return true;
      }
      return false;
    }

    // 1. ENGLISH MODE PASSTHROUGH
    if (this.mode === 'en') {
      if (key === 'Backspace') {
        if (this.committedText.length > 0) {
          this.committedText = this.committedText.slice(0, -1);
          this.emitChange();
          return true;
        }
        return false;
      }
      if (key === 'Enter') {
        this.committedText += '\n';
        this.emitChange();
        return true;
      }
      if (key === ' ') {
        this.committedText += ' ';
        this.emitChange();
        return true;
      }
      if (key.length === 1) {
        this.committedText += key;
        this.emitChange();
        return true;
      }
      return false;
    }

    // 2. FIXED LAYOUT MODE (Bijoy / Probhat)
    if (this.layout === 'bijoy' || this.layout === 'probhat') {
      if (key === 'Backspace') {
        if (this.committedText.length > 0) {
          this.committedText = this.committedText.slice(0, -1);
          this.emitChange();
          return true;
        }
        return false;
      }
      if (key === 'Enter') {
        this.committedText += '\n';
        this.emitChange();
        return true;
      }
      if (key === ' ') {
        this.committedText += ' ';
        this.emitChange();
        return true;
      }
      if (key.length === 1) {
        const mapped = LayoutManager.mapKey(this.layout, key, Boolean(shiftKey));
        this.committedText += (mapped !== null ? mapped : key);
        this.emitChange();
        return true;
      }
      return false;
    }

    // 3. ESCAPE: Close popover, keep or commit raw token
    if (key === 'Escape') {
      if (this.isPopoverOpen) {
        this.isPopoverOpen = false;
        this.emitChange();
        return true;
      }
      return false;
    }

    // 2. ARROW NAVIGATION in popover
    if (this.isPopoverOpen && this.candidates.length > 0) {
      if (key === 'ArrowDown') {
        this.selectedIndex = (this.selectedIndex + 1) % this.candidates.length;
        this.emitChange();
        return true;
      }
      if (key === 'ArrowUp') {
        this.selectedIndex = (this.selectedIndex - 1 + this.candidates.length) % this.candidates.length;
        this.emitChange();
        return true;
      }
    }

    // 3. NUMBER KEYS 1-5 when popover is open
    if (this.isPopoverOpen && this.candidates.length > 0 && /^[1-5]$/.test(key)) {
      const idx = parseInt(key, 10) - 1;
      if (idx < this.candidates.length) {
        this.commitCandidate(idx);
        return true;
      }
    }

    // 4. SPACE: Commit selected candidate + space
    if (key === ' ') {
      if (this.activeToken && this.candidates.length > 0) {
        const chosen = this.candidates[this.selectedIndex] || this.candidates[0];
        this.committedText += chosen + ' ';
        this.activeToken = '';
        this.candidates = [];
        this.isPopoverOpen = false;
        this.emitChange();
        return true;
      } else if (this.activeToken) {
        this.committedText += this.activeToken + ' ';
        this.activeToken = '';
        this.candidates = [];
        this.isPopoverOpen = false;
        this.emitChange();
        return true;
      } else {
        this.committedText += ' ';
        this.emitChange();
        return true;
      }
    }

    // 5. ENTER: Commit selected candidate (no extra space) or newline
    if (key === 'Enter') {
      if (this.activeToken && this.candidates.length > 0) {
        const chosen = this.candidates[this.selectedIndex] || this.candidates[0];
        this.committedText += chosen;
        this.activeToken = '';
        this.candidates = [];
        this.isPopoverOpen = false;
        this.emitChange();
        return true;
      } else {
        this.committedText += '\n';
        this.emitChange();
        return true;
      }
    }

    // 6. BACKSPACE: Delete phonetic char or preceding committed text
    if (key === 'Backspace') {
      if (this.activeToken.length > 0) {
        this.activeToken = this.activeToken.slice(0, -1);
        if (this.activeToken.length === 0) {
          this.candidates = [];
          this.isPopoverOpen = false;
          this.emitChange();
        } else {
          await this.updateSuggestions(this.activeToken);
        }
        return true;
      } else if (this.committedText.length > 0) {
        // Remove last unicode character or cluster
        this.committedText = this.committedText.slice(0, -1);
        this.emitChange();
        return true;
      }
      return false;
    }

    // 7. PUNCTUATION: Commit active candidate + punctuation
    const punctuationMarks = {
      '.': '।',
      '|': '।',
      ',': ',',
      ';': ';',
      ':': ':',
      '?': '?',
      '!': '!'
    };

    if (punctuationMarks[key]) {
      const punct = punctuationMarks[key];
      if (this.activeToken && this.candidates.length > 0) {
        const chosen = this.candidates[this.selectedIndex] || this.candidates[0];
        this.committedText += chosen + punct;
        this.activeToken = '';
        this.candidates = [];
        this.isPopoverOpen = false;
        this.emitChange();
        return true;
      } else {
        this.committedText += punct;
        this.emitChange();
        return true;
      }
    }

    // 8. LETTERS [a-zA-Z]: Accumulate into phonetic buffer
    if (/^[a-zA-Z]$/.test(key)) {
      this.activeToken += key;
      await this.updateSuggestions(this.activeToken);
      return true;
    }

    // 9. OTHER CHARACTERS (Numbers when popover closed, symbols)
    if (key.length !== 1) {
      return false;
    }

    if (this.activeToken && this.candidates.length > 0) {
      // Commit pending token first
      const chosen = this.candidates[this.selectedIndex] || this.candidates[0];
      this.committedText += chosen + key;
      this.activeToken = '';
      this.candidates = [];
      this.isPopoverOpen = false;
      this.emitChange();
      return true;
    } else {
      this.committedText += key;
      this.emitChange();
      return true;
    }
  }

  async updateSuggestions(token) {
    const currentQuery = ++this.queryCounter;
    this.selectedIndex = 0;

    // 1. Instant sync preview from offline rules
    const syncCandidates = transliterationService.getCandidatesSync(token);
    if (this.queryCounter === currentQuery) {
      this.candidates = syncCandidates;
      this.isPopoverOpen = syncCandidates.length > 0;
      this.emitChange();
    }

    // 2. Async online high-precision fetch
    try {
      const asyncCandidates = await transliterationService.getCandidates(token);
      if (this.queryCounter === currentQuery && asyncCandidates && asyncCandidates.length > 0) {
        this.candidates = asyncCandidates;
        this.isPopoverOpen = true;
        this.emitChange();
      }
    } catch (_e) {
      // Keep sync candidates
    }
  }

  commitCandidate(index) {
    if (index >= 0 && index < this.candidates.length) {
      const chosen = this.candidates[index];
      this.committedText += chosen + ' ';
      this.activeToken = '';
      this.candidates = [];
      this.isPopoverOpen = false;
      this.emitChange();
    }
  }

  closePopover() {
    this.isPopoverOpen = false;
    this.emitChange();
  }
}
