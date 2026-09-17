// Matra Keyboard — Canonical Keyboard Layout Manager
// Provides layout metadata, visualizer dual-glyph keycap matrices, and fixed-layout typing transformations.

export const LAYOUTS = {
  avro: {
    id: 'avro',
    name: 'Avro Phonetic',
    nameBn: 'অভ্র ফোনেটিক',
    type: 'phonetic'
  },
  bijoy: {
    id: 'bijoy',
    name: 'Bijoy Classic',
    nameBn: 'জাতীয় / বিজয় ক্লাসিক',
    type: 'fixed'
  },
  probhat: {
    id: 'probhat',
    name: 'Probhat',
    nameBn: 'প্রভাত',
    type: 'fixed'
  }
};

// Keyboard Matrix Definitions for Visualizer and Mapping
// Standard US QWERTY physical key matrix arranged in 4 main rows + space row
const KEY_MATRIX = [
  // Row 1: Numbers & symbols
  [
    { code: 'Backquote', key: '`', shiftKey: '~', label: '`' },
    { code: 'Digit1', key: '1', shiftKey: '!', label: '1' },
    { code: 'Digit2', key: '2', shiftKey: '@', label: '2' },
    { code: 'Digit3', key: '3', shiftKey: '#', label: '3' },
    { code: 'Digit4', key: '4', shiftKey: '$', label: '4' },
    { code: 'Digit5', key: '5', shiftKey: '%', label: '5' },
    { code: 'Digit6', key: '6', shiftKey: '^', label: '6' },
    { code: 'Digit7', key: '7', shiftKey: '&', label: '7' },
    { code: 'Digit8', key: '8', shiftKey: '*', label: '8' },
    { code: 'Digit9', key: '9', shiftKey: '(', label: '9' },
    { code: 'Digit0', key: '0', shiftKey: ')', label: '0' },
    { code: 'Minus', key: '-', shiftKey: '_', label: '-' },
    { code: 'Equal', key: '=', shiftKey: '+', label: '=' },
    { code: 'Backspace', key: 'Backspace', label: '⌫', width: 1.5, isSpecial: true }
  ],
  // Row 2: QWERTY top row
  [
    { code: 'Tab', key: 'Tab', label: 'Tab', width: 1.3, isSpecial: true },
    { code: 'KeyQ', key: 'q', shiftKey: 'Q', label: 'Q' },
    { code: 'KeyW', key: 'w', shiftKey: 'W', label: 'W' },
    { code: 'KeyE', key: 'e', shiftKey: 'E', label: 'E' },
    { code: 'KeyR', key: 'r', shiftKey: 'R', label: 'R' },
    { code: 'KeyT', key: 't', shiftKey: 'T', label: 'T' },
    { code: 'KeyY', key: 'y', shiftKey: 'Y', label: 'Y' },
    { code: 'KeyU', key: 'u', shiftKey: 'U', label: 'U' },
    { code: 'KeyI', key: 'i', shiftKey: 'I', label: 'I' },
    { code: 'KeyO', key: 'o', shiftKey: 'O', label: 'O' },
    { code: 'KeyP', key: 'p', shiftKey: 'P', label: 'P' },
    { code: 'BracketLeft', key: '[', shiftKey: '{', label: '[' },
    { code: 'BracketRight', key: ']', shiftKey: '}', label: ']' },
    { code: 'Backslash', key: '\\', shiftKey: '|', label: '\\', width: 1.1 }
  ],
  // Row 3: Home row
  [
    { code: 'CapsLock', key: 'CapsLock', label: 'Caps', width: 1.6, isSpecial: true },
    { code: 'KeyA', key: 'a', shiftKey: 'A', label: 'A' },
    { code: 'KeyS', key: 's', shiftKey: 'S', label: 'S' },
    { code: 'KeyD', key: 'd', shiftKey: 'D', label: 'D' },
    { code: 'KeyF', key: 'f', shiftKey: 'F', label: 'F' },
    { code: 'KeyG', key: 'g', shiftKey: 'G', label: 'G' },
    { code: 'KeyH', key: 'h', shiftKey: 'H', label: 'H' },
    { code: 'KeyJ', key: 'j', shiftKey: 'J', label: 'J' },
    { code: 'KeyK', key: 'k', shiftKey: 'K', label: 'K' },
    { code: 'KeyL', key: 'l', shiftKey: 'L', label: 'L' },
    { code: 'Semicolon', key: ';', shiftKey: ':', label: ';' },
    { code: 'Quote', key: "'", shiftKey: '"', label: "'" },
    { code: 'Enter', key: 'Enter', label: '⏎ Enter', width: 1.75, isSpecial: true }
  ],
  // Row 4: Bottom row
  [
    { code: 'ShiftLeft', key: 'Shift', label: '⇧ Shift', width: 2.1, isSpecial: true },
    { code: 'KeyZ', key: 'z', shiftKey: 'Z', label: 'Z' },
    { code: 'KeyX', key: 'x', shiftKey: 'X', label: 'X' },
    { code: 'KeyC', key: 'c', shiftKey: 'C', label: 'C' },
    { code: 'KeyV', key: 'v', shiftKey: 'V', label: 'V' },
    { code: 'KeyB', key: 'b', shiftKey: 'B', label: 'B' },
    { code: 'KeyN', key: 'n', shiftKey: 'N', label: 'N' },
    { code: 'KeyM', key: 'm', shiftKey: 'M', label: 'M' },
    { code: 'Comma', key: ',', shiftKey: '<', label: ',' },
    { code: 'Period', key: '.', shiftKey: '>', label: '.' },
    { code: 'Slash', key: '/', shiftKey: '?', label: '/' },
    { code: 'ShiftRight', key: 'Shift', label: '⇧ Shift', width: 2.1, isSpecial: true }
  ],
  // Row 5: Modifiers and Space
  [
    { code: 'ControlLeft', key: 'Control', label: 'Ctrl', width: 1.4, isSpecial: true },
    { code: 'AltLeft', key: 'Alt', label: 'Alt', width: 1.2, isSpecial: true },
    { code: 'Space', key: ' ', label: 'Spacebar (স্পেস)', width: 6.2, isSpecial: true },
    { code: 'AltRight', key: 'Alt', label: 'Alt', width: 1.2, isSpecial: true },
    { code: 'ControlRight', key: 'Control', label: 'Ctrl', width: 1.4, isSpecial: true }
  ]
];

// Layout Glyph Mappings for Visualizer and Fixed Typing
// Format per layout: [key]: [normalGlyph, shiftGlyph]
const LAYOUT_MAPPINGS = {
  // 1. Avro Phonetic: Visualizer reference glyphs for phonetic hints
  avro: {
    '`': ['~', '`'],
    '1': ['১', '!'],
    '2': ['২', '@'],
    '3': ['৩', '#'],
    '4': ['৪', '$'],
    '5': ['৫', '%'],
    '6': ['৬', '^'],
    '7': ['৭', '&'],
    '8': ['৮', '*'],
    '9': ['৯', '('],
    '0': ['০', ')'],
    '-': ['-', '_'],
    '=': ['=', '+'],

    'q': ['ক', 'খ'],
    'w': ['ও', 'ঔ'],
    'e': ['ে', 'এ'],
    'r': ['র', 'ড়'],
    't': ['ট', 'থ'],
    'y': ['য়', 'য'],
    'u': ['ু', 'উ'],
    'i': ['ি', 'ই'],
    'o': ['ো', 'ও'],
    'p': ['প', 'ফ'],
    '[': ['[', '{'],
    ']': [']', '}'],
    '\\': ['\\', '|'],

    'a': ['া', 'অ'],
    's': ['স', 'শ'],
    'd': ['ড', 'ধ'],
    'f': ['ফ', 'ভ'],
    'g': ['গ', 'ঘ'],
    'h': ['হ', 'ঃ'],
    'j': ['জ', 'ঝ'],
    'k': ['ক', 'খ'],
    'l': ['ল', 'ঌ'],
    ';': [';', ':'],
    "'": ["'", '"'],

    'z': ['য', 'ঝ'],
    'x': ['ক্স', 'ক্ষ'],
    'c': ['চ', 'ছ'],
    'v': ['ভ', 'ভ'],
    'b': ['ব', 'ভ'],
    'n': ['ন', 'ণ'],
    'm': ['ম', 'ং'],
    ',': [',', '<'],
    '.': ['.', '।'],
    '/': ['/', '?']
  },

  // 2. Bijoy Classic / National Standard Keyboard Mapping
  bijoy: {
    '`': ['`', '~'],
    '1': ['১', '!'],
    '2': ['২', '@'],
    '3': ['৩', '#'],
    '4': ['৪', '$'],
    '5': ['৫', '%'],
    '6': ['৬', '^'],
    '7': ['৭', '&'],
    '8': ['৮', '*'],
    '9': ['৯', '('],
    '0': ['০', ')'],
    '-': ['-', '_'],
    '=': ['=', '+'],

    'q': ['ঙ', 'ং'],
    'w': ['য', 'য়'],
    'e': ['ড', 'ঢ'],
    'r': ['প', 'ফ'],
    't': ['ট', 'ঠ'],
    'y': ['চ', 'ছ'],
    'u': ['জ', 'ঝ'],
    'i': ['হ', 'ঞ'],
    'o': ['গ', 'ঘ'],
    'p': ['ড়', 'ঢ়'],
    '[': ['ো', 'ৌ'],
    ']': ['ৎ', 'ঃ'],
    '\\': ['\\', '|'],

    'a': ['ৃ', 'র্'],
    's': ['ু', 'ূ'],
    'd': ['ি', 'ী'],
    'f': ['া', 'অ'],
    'g': ['্', 'গ'],
    'h': ['ব', 'ভ'],
    'j': ['ক', 'খ'],
    'k': ['ত', 'থ'],
    'l': ['দ', 'ধ'],
    ';': ['স', 'শ'],
    "'": ['য়', '্য'],

    'z': ['্র', '্য'],
    'x': ['ও', 'ৌ'],
    'c': ['এ', 'ঐ'],
    'v': ['র', 'ল'],
    'b': ['ন', 'ণ'],
    'n': ['স', 'ষ'],
    'm': ['ম', 'শ'],
    ',': [',', '<'],
    '.': ['.', '।'],
    '/': ['/', '?']
  },

  // 3. Probhat Keyboard Layout Mapping
  probhat: {
    '`': ['`', '~'],
    '1': ['১', '!'],
    '2': ['২', '@'],
    '3': ['৩', '#'],
    '4': ['৪', '$'],
    '5': ['৫', '%'],
    '6': ['৬', '^'],
    '7': ['৭', '&'],
    '8': ['৮', '*'],
    '9': ['৯', '('],
    '0': ['০', ')'],
    '-': ['-', '_'],
    '=': ['=', '+'],

    'q': ['দ', 'ধ'],
    'w': ['ূ', 'ঊ'],
    'e': ['ী', 'ঈ'],
    'r': ['র', 'ড়'],
    't': ['ট', 'ঠ'],
    'y': ['এ', 'ঐ'],
    'u': ['ু', 'উ'],
    'i': ['ি', 'ই'],
    'o': ['ও', 'ঔ'],
    'p': ['প', 'ফ'],
    '[': ['[', '{'],
    ']': [']', '}'],
    '\\': ['\\', '|'],

    'a': ['া', 'অ'],
    's': ['স', 'ষ'],
    'd': ['ড', 'ঢ'],
    'f': ['ত', 'থ'],
    'g': ['গ', 'ঘ'],
    'h': ['হ', 'ঃ'],
    'j': ['জ', 'ঝ'],
    'k': ['ক', 'খ'],
    'l': ['ল', 'ঢ়'],
    ';': [';', ':'],
    "'": ["'", '"'],

    'z': ['য', 'য়'],
    'x': ['ো', 'ৌ'],
    'c': ['চ', 'ছ'],
    'v': ['ভ', 'ভ'],
    'b': ['ব', 'ব'],
    'n': ['ন', 'ণ'],
    'm': ['ম', 'ং'],
    ',': [',', '<'],
    '.': ['.', '।'],
    '/': ['/', '?']
  }
};

export class LayoutManager {
  static getLayoutList() {
    return Object.values(LAYOUTS);
  }

  static getLayout(layoutId) {
    return LAYOUTS[layoutId] || LAYOUTS.avro;
  }

  // Returns full key matrix populated with dual-glyphs for the requested layout
  static getLayoutMatrix(layoutId = 'avro') {
    const layoutMap = LAYOUT_MAPPINGS[layoutId] || LAYOUT_MAPPINGS.avro;

    return KEY_MATRIX.map((row) => {
      return row.map((keyDef) => {
        if (keyDef.isSpecial) {
          return {
            ...keyDef,
            bnNormal: '',
            bnShift: ''
          };
        }

        const glyphs = layoutMap[keyDef.key] || [keyDef.key, keyDef.shiftKey || keyDef.key];
        return {
          ...keyDef,
          bnNormal: glyphs[0],
          bnShift: glyphs[1]
        };
      });
    });
  }

  // Maps physical key press to Bengali character for fixed layouts (Bijoy, Probhat)
  static mapKey(layoutId, keyChar, isShift = false) {
    const layoutMap = LAYOUT_MAPPINGS[layoutId];
    if (!layoutMap) return null;

    const lower = keyChar.toLowerCase();
    const mapping = layoutMap[lower] || layoutMap[keyChar];
    if (!mapping) return null;

    return isShift ? mapping[1] : mapping[0];
  }

  // Determines if a character is a Bengali vowel sign (matra) or hasanta
  static isMatraOrHasanta(char) {
    // া, ি, ী, ু, ূ, ৃ, ে, ৈ, ো, ৌ, ্
    return /^[\u09BE-\u09CC\u09CD]$/.test(char);
  }
}
