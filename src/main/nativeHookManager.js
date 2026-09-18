// Matra Keyboard — Native Win32 Low-Level Keyboard Hook & Input Injection Manager
// Intercepts system-wide keystrokes using WH_KEYBOARD_LL and injects Unicode via SendInputW.
// Uses offline phonetic engine for zero-latency, network-independent typing with 100% privacy.

import electron from 'electron';
const { app, clipboard } = electron;
import koffi from 'koffi';
import { exec } from 'node:child_process';
import { transliterateOffline, transliteratePhoneticRaw } from '../engine/OfflinePhoneticEngine.js';
import { LayoutManager } from '../engine/LayoutManager.js';
import { logger } from './logger.js';

// Custom injection signature so hook can identify and ignore its own simulated events
const MATRA_EXTRA_INFO = 0x4D415452; // 'MATR'

// Win32 Constants
const WH_KEYBOARD_LL = 13;
const WM_KEYDOWN = 0x0100;
const WM_KEYUP = 0x0101;
const WM_SYSKEYDOWN = 0x0104;
const WM_SYSKEYUP = 0x0105;

const INPUT_KEYBOARD = 1;
const KEYEVENTF_KEYUP = 0x0002;
const KEYEVENTF_UNICODE = 0x0004;

const VK_BACK = 0x08;
const VK_TAB = 0x09;
const VK_RETURN = 0x0D;
const VK_SHIFT = 0x10;
const VK_CONTROL = 0x11;
const VK_MENU = 0x12; // Alt
const VK_ESCAPE = 0x1B;
const VK_SPACE = 0x20;
const VK_CAPITAL = 0x14; // CapsLock
const VK_LWIN = 0x5B;
const VK_RWIN = 0x5C;
const VK_OEM_PERIOD = 0xBE;

// State
let hookHandle = null;
let hookCallbackPtr = null;
let mainWindowRef = null;

let activeMode = 'bn'; // 'bn' | 'en'
let activeLayout = 'avro'; // 'avro' | 'bijoy' | 'probhat'
let injectionMethod = 'sendinput'; // 'sendinput' | 'clipboard'

let activeWordBuffer = '';
let injectedLength = 0; // Number of UTF-16 code units currently injected for active word

let conflictingImesFound = [];

// Win32 Structs & Functions via Koffi
let user32 = null;
let SetWindowsHookExW = null;
let UnhookWindowsHookEx = null;
let CallNextHookEx = null;
let GetForegroundWindow = null;
let GetAsyncKeyState = null;
let GetKeyState = null;
let SendInput = null;

export function initNativeHook(mainWindow) {
  mainWindowRef = mainWindow;

  try {
    user32 = koffi.load('user32.dll');

    const KBDLLHOOKSTRUCT = koffi.struct('KBDLLHOOKSTRUCT', {
      vkCode: 'uint32',
      scanCode: 'uint32',
      flags: 'uint32',
      time: 'uint32',
      dwExtraInfo: 'uintptr_t'
    });

    const HOOKPROC = koffi.proto('intptr_t __stdcall HOOKPROC(int nCode, uintptr_t wParam, KBDLLHOOKSTRUCT *lParam)');

    SetWindowsHookExW = user32.func('SetWindowsHookExW', 'void*', ['int', koffi.pointer(HOOKPROC), 'void*', 'uint32']);
    UnhookWindowsHookEx = user32.func('UnhookWindowsHookEx', 'bool', ['void*']);
    CallNextHookEx = user32.func('CallNextHookEx', 'intptr_t', ['void*', 'int', 'uintptr_t', 'KBDLLHOOKSTRUCT*']);
    GetForegroundWindow = user32.func('GetForegroundWindow', 'void*', []);
    GetAsyncKeyState = user32.func('GetAsyncKeyState', 'int16', ['int']);
    GetKeyState = user32.func('GetKeyState', 'int16', ['int']);
    SendInput = user32.func('SendInput', 'uint32', ['uint32', 'void*', 'int']);

    hookCallbackPtr = koffi.register(lowLevelKeyboardProc, koffi.pointer(HOOKPROC));
    hookHandle = SetWindowsHookExW(WH_KEYBOARD_LL, hookCallbackPtr, null, 0);

    if (hookHandle) {
      logger.info('[NativeHookManager] Win32 WH_KEYBOARD_LL hook installed successfully.');
    } else {
      logger.error('[NativeHookManager] Failed to install SetWindowsHookExW.');
    }

    // Check for other IME processes (Avro / Bijoy coexistence)
    checkOtherImeProcesses();

  } catch (err) {
    logger.error('[NativeHookManager] Failed to initialize native hook via Koffi:', err);
  }
}

export function destroyNativeHook() {
  try {
    if (hookHandle && UnhookWindowsHookEx) {
      UnhookWindowsHookEx(hookHandle);
      hookHandle = null;
      logger.info('[NativeHookManager] Win32 WH_KEYBOARD_LL hook unhooked cleanly.');
    }
    if (hookCallbackPtr && koffi.unregister) {
      koffi.unregister(hookCallbackPtr);
      hookCallbackPtr = null;
    }
  } catch (err) {
    logger.error('[NativeHookManager] Error destroying hook:', err);
  }
}

export function setHookMode(mode) {
  activeMode = mode === 'en' ? 'en' : 'bn';
  activeWordBuffer = '';
  injectedLength = 0;
  logger.info(`[NativeHookManager] Active mode updated to: ${activeMode}`);
}

export function setHookLayout(layout) {
  activeLayout = layout || 'avro';
  activeWordBuffer = '';
  injectedLength = 0;
  logger.info(`[NativeHookManager] Active layout updated to: ${activeLayout}`);
}

export function setInjectionMethod(method) {
  injectionMethod = method === 'clipboard' ? 'clipboard' : 'sendinput';
  logger.info(`[NativeHookManager] Injection method updated to: ${injectionMethod}`);
}

export function getConflictingImes() {
  return [...conflictingImesFound];
}

// Low-Level Keyboard Hook Callback
function lowLevelKeyboardProc(nCode, wParam, lParam) {
  if (nCode < 0) {
    return CallNextHookEx(hookHandle, nCode, wParam, lParam);
  }

  // 1. Bypass self-injected keystrokes immediately to prevent infinite loops
  const extraInfo = Number(lParam.dwExtraInfo);
  if (extraInfo === MATRA_EXTRA_INFO) {
    return CallNextHookEx(hookHandle, nCode, wParam, lParam);
  }

  // 2. Bypass if Matra Keyboard itself is in the foreground
  if (mainWindowRef && !mainWindowRef.isDestroyed()) {
    try {
      const fgHwnd = GetForegroundWindow();
      const mainHwndBuf = mainWindowRef.getNativeWindowHandle();
      const mainHwndAddr = Number(mainHwndBuf.readBigUInt64LE(0));
      const fgHwndAddr = Number(koffi.address(fgHwnd));
      if (fgHwndAddr === mainHwndAddr) {
        // Matra app has focus; let in-app typing studio handle input natively
        return CallNextHookEx(hookHandle, nCode, wParam, lParam);
      }
    } catch (_e) {
      // Fallback: proceed
    }
  }

  // 3. Bypass if Matra is in English mode
  if (activeMode === 'en') {
    activeWordBuffer = '';
    injectedLength = 0;
    return CallNextHookEx(hookHandle, nCode, wParam, lParam);
  }

  // 4. Modifier Key Sweeps (Ctrl, Alt, Win)
  const isCtrl = (GetAsyncKeyState(VK_CONTROL) & 0x8000) !== 0;
  const isAlt = (GetAsyncKeyState(VK_MENU) & 0x8000) !== 0;
  const isWin = ((GetAsyncKeyState(VK_LWIN) & 0x8000) !== 0) || ((GetAsyncKeyState(VK_RWIN) & 0x8000) !== 0);

  // If any standard modifier is held (e.g. Ctrl+C, Alt+Tab, Win+R), flush buffer and pass through
  if (isCtrl || isAlt || isWin) {
    activeWordBuffer = '';
    injectedLength = 0;
    return CallNextHookEx(hookHandle, nCode, wParam, lParam);
  }

  const isShift = (GetAsyncKeyState(VK_SHIFT) & 0x8000) !== 0;
  const isCaps = (GetKeyState(VK_CAPITAL) & 0x0001) !== 0;
  const vk = lParam.vkCode;

  const isKeyDown = (wParam === WM_KEYDOWN || wParam === WM_SYSKEYDOWN);
  const isKeyUp = (wParam === WM_KEYUP || wParam === WM_SYSKEYUP);

  // On KeyUp: swallow if it's a key we manage
  if (isKeyUp) {
    if (activeLayout === 'avro' && ((vk >= 0x41 && vk <= 0x5A) || vk === VK_BACK || vk === VK_OEM_PERIOD)) {
      return 1;
    }
    if ((activeLayout === 'bijoy' || activeLayout === 'probhat') && (vk >= 0x20 && vk <= 0xDE)) {
      return 1;
    }
    return CallNextHookEx(hookHandle, nCode, wParam, lParam);
  }

  if (!isKeyDown) {
    return CallNextHookEx(hookHandle, nCode, wParam, lParam);
  }

  // -------------------------------------------------------------
  // A. AVRO PHONETIC MODE
  // -------------------------------------------------------------
  if (activeLayout === 'avro') {
    // 1. Letters A-Z (Phonetic token building)
    if (vk >= 0x41 && vk <= 0x5A) {
      let char = String.fromCharCode(vk);
      if (!(isShift ^ isCaps)) {
        char = char.toLowerCase();
      }

      activeWordBuffer += char;
      const candidates = transliterateOffline(activeWordBuffer);
      const newWord = candidates[0] || transliteratePhoneticRaw(activeWordBuffer);

      // Erase previous injected characters
      if (injectedLength > 0) {
        sendBackspaces(injectedLength);
      }

      // Inject new transliteration
      injectUnicodeString(newWord);
      injectedLength = newWord.length;

      return 1; // Suppress original key from reaching target app
    }

    // 2. Backspace during active composition
    if (vk === VK_BACK) {
      if (activeWordBuffer.length > 0) {
        activeWordBuffer = activeWordBuffer.slice(0, -1);

        if (injectedLength > 0) {
          sendBackspaces(injectedLength);
        }

        if (activeWordBuffer.length > 0) {
          const candidates = transliterateOffline(activeWordBuffer);
          const newWord = candidates[0] || transliteratePhoneticRaw(activeWordBuffer);
          injectUnicodeString(newWord);
          injectedLength = newWord.length;
        } else {
          injectedLength = 0;
        }

        return 1; // Suppress original Backspace
      }

      // Buffer already empty; let Backspace pass through natively to delete foreign text
      injectedLength = 0;
      return CallNextHookEx(hookHandle, nCode, wParam, lParam);
    }

    // 3. Space (Commit active word + space)
    if (vk === VK_SPACE) {
      if (activeWordBuffer.length > 0) {
        activeWordBuffer = '';
        injectedLength = 0;
        // Let space pass through to create word boundary in target app
        return CallNextHookEx(hookHandle, nCode, wParam, lParam);
      }
      return CallNextHookEx(hookHandle, nCode, wParam, lParam);
    }

    // 4. Enter / Tab / Escape / Navigation Keys (Word delimiters)
    if (vk === VK_RETURN || vk === VK_TAB || vk === VK_ESCAPE || (vk >= 0x21 && vk <= 0x28)) {
      activeWordBuffer = '';
      injectedLength = 0;
      return CallNextHookEx(hookHandle, nCode, wParam, lParam);
    }

    // 5. Period (Full stop -> Dari '।' conversion)
    if (vk === VK_OEM_PERIOD) {
      if (activeWordBuffer.length > 0) {
        activeWordBuffer = '';
        injectedLength = 0;
      }
      injectUnicodeString('।');
      return 1; // Suppress '.' and inject Dari
    }

    // Any other key: commit active buffer and pass through
    activeWordBuffer = '';
    injectedLength = 0;
    return CallNextHookEx(hookHandle, nCode, wParam, lParam);
  }

  // -------------------------------------------------------------
  // B. FIXED LAYOUT MODES (Bijoy / Probhat)
  // -------------------------------------------------------------
  if (activeLayout === 'bijoy' || activeLayout === 'probhat') {
    const keyChar = vkToChar(vk, isShift, isCaps);
    if (keyChar) {
      const mapped = LayoutManager.mapKey(activeLayout, keyChar, isShift);
      if (mapped) {
        injectUnicodeString(mapped);
        return 1; // Suppress original key and inject mapped glyph
      }
    }
    return CallNextHookEx(hookHandle, nCode, wParam, lParam);
  }

  return CallNextHookEx(hookHandle, nCode, wParam, lParam);
}

// Translate Virtual Key Code to printable ASCII character
function vkToChar(vk, isShift, isCaps) {
  if (vk >= 0x41 && vk <= 0x5A) {
    let char = String.fromCharCode(vk);
    return (isShift ^ isCaps) ? char.toUpperCase() : char.toLowerCase();
  }
  if (vk >= 0x30 && vk <= 0x39) {
    const unshifted = String.fromCharCode(vk);
    const shiftedMap = { '1':'!', '2':'@', '3':'#', '4':'$', '5':'%', '6':'^', '7':'&', '8':'*', '9':'(', '0':')' };
    return isShift ? (shiftedMap[unshifted] || unshifted) : unshifted;
  }
  const symbolMap = {
    0xBA: isShift ? ':' : ';',
    0xBB: isShift ? '+' : '=',
    0xBC: isShift ? '<' : ',',
    0xBD: isShift ? '_' : '-',
    0xBE: isShift ? '>' : '.',
    0xBF: isShift ? '?' : '/',
    0xC0: isShift ? '~' : '`',
    0xDB: isShift ? '{' : '[',
    0xDC: isShift ? '|' : '\\',
    0xDD: isShift ? '}' : ']',
    0xDE: isShift ? '"' : "'"
  };
  return symbolMap[vk] || null;
}

// -------------------------------------------------------------
// TEXT INJECTION PIPELINE
// -------------------------------------------------------------

// Construct a 40-byte Win64 INPUT structure for SendInput
function makeKeyboardInput(vk, scan, flags) {
  const buf = Buffer.alloc(40);
  buf.writeUInt32LE(INPUT_KEYBOARD, 0);       // type = INPUT_KEYBOARD (1)
  buf.writeUInt16LE(vk, 8);                   // wVk
  buf.writeUInt16LE(scan, 10);                // wScan
  buf.writeUInt32LE(flags, 12);               // dwFlags
  buf.writeUInt32LE(0, 16);                   // time
  buf.writeBigUInt64LE(BigInt(MATRA_EXTRA_INFO), 24); // dwExtraInfo
  return buf;
}

// Send Backspaces via SendInputW
export function sendBackspaces(count) {
  if (!SendInput || count <= 0) return;

  const inputs = [];
  for (let i = 0; i < count; i++) {
    // Backspace KeyDown
    inputs.push(makeKeyboardInput(VK_BACK, 0, 0));
    // Backspace KeyUp
    inputs.push(makeKeyboardInput(VK_BACK, 0, KEYEVENTF_KEYUP));
  }

  const combined = Buffer.concat(inputs);
  SendInput(inputs.length, combined, 40);
}

// Inject a Unicode String into the active foreground window
export function injectUnicodeString(text) {
  if (!text) return;

  // Option A: Standard SendInput Unicode Injection
  if (injectionMethod === 'sendinput') {
    if (!SendInput) return;

    const inputs = [];
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      // Unicode KeyDown
      inputs.push(makeKeyboardInput(0, code, KEYEVENTF_UNICODE));
      // Unicode KeyUp
      inputs.push(makeKeyboardInput(0, code, KEYEVENTF_UNICODE | KEYEVENTF_KEYUP));
    }

    const combined = Buffer.concat(inputs);
    SendInput(inputs.length, combined, 40);
    return;
  }

  // Option B: Clipboard-Paste Fallback (with buffer preservation & restoration)
  if (injectionMethod === 'clipboard') {
    try {
      const previousClipboard = clipboard.readText();
      clipboard.writeText(text);

      // Simulate Ctrl+V
      const inputs = [
        makeKeyboardInput(VK_CONTROL, 0, 0),                       // Ctrl Down
        makeKeyboardInput(0x56, 0, 0),                             // 'V' Down
        makeKeyboardInput(0x56, 0, KEYEVENTF_KEYUP),               // 'V' Up
        makeKeyboardInput(VK_CONTROL, 0, KEYEVENTF_KEYUP)          // Ctrl Up
      ];
      const combined = Buffer.concat(inputs);
      SendInput(inputs.length, combined, 40);

      // Restore user's prior clipboard after target app has processed the paste
      setTimeout(() => {
        try {
          clipboard.writeText(previousClipboard);
        } catch (_err) {}
      }, 50);
    } catch (err) {
      logger.error('[NativeHookManager] Clipboard paste fallback error:', err);
    }
  }
}

// -------------------------------------------------------------
// BENGALI IME COEXISTENCE DETECTION
// -------------------------------------------------------------
function checkOtherImeProcesses() {
  if (process.platform !== 'win32') return;

  exec('tasklist /FO CSV /NH', { windowsHide: true }, (err, stdout) => {
    if (err || !stdout) return;

    const knownImes = [
      { name: 'Avro Keyboard', process: 'avro keyboard.exe' },
      { name: 'Bijoy 52', process: 'bijoy 52.exe' },
      { name: 'Bijoy Bayanno', process: 'bijoybayanno.exe' },
      { name: 'Bijoy Ekattor', process: 'bijoyekattor.exe' },
      { name: 'OpenBangla Keyboard', process: 'openbangla keyboard.exe' }
    ];

    const lowerOutput = stdout.toLowerCase();
    conflictingImesFound = [];

    for (const ime of knownImes) {
      if (lowerOutput.includes(ime.process)) {
        conflictingImesFound.push(ime.name);
      }
    }

    if (conflictingImesFound.length > 0) {
      const names = conflictingImesFound.join(', ');
      logger.warn(`[NativeHookManager] Other active Bengali IME detected: ${names}. Multiple simultaneous hooks may cause duplicate characters.`);
      if (mainWindowRef && !mainWindowRef.isDestroyed()) {
        mainWindowRef.webContents.send('system:ime-conflict', conflictingImesFound);
      }
    }
  });
}
