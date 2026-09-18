// Matra Keyboard — System-Wide Suggestion Popover Overlay Manager
// Manages the non-focusable, frameless Electron overlay window positioned near the external caret.
// Handles overlay lifecycle, obsidian glassmorphism UI, WH_MOUSE_LL click-outside dismissal,
// and EVENT_SYSTEM_FOREGROUND window focus switch dismissal.

import electron from 'electron';
const { BrowserWindow, screen } = electron;
import koffi from 'koffi';
import { logger } from './logger.js';

let popoverWindow = null;
let isReady = false;
let isVisible = false;
let onDismissCallback = null;

// Win32 Extended Window Styles & Hooks via Koffi
let user32 = null;
let SetWindowLongW = null;
let GetWindowLongW = null;
let SetWindowsHookExW = null;
let UnhookWindowsHookEx = null;
let CallNextHookEx = null;
let SetWinEventHook = null;
let UnhookWinEvent = null;

const GWL_EXSTYLE = -20;
const WS_EX_NOACTIVATE = 0x08000000;
const WS_EX_TOPMOST = 0x00000008;
const WS_EX_TOOLWINDOW = 0x00000080;

const WH_MOUSE_LL = 14;
const WM_LBUTTONDOWN = 0x0201;
const WM_RBUTTONDOWN = 0x0204;
const WM_NCLBUTTONDOWN = 0x00A1;

const EVENT_SYSTEM_FOREGROUND = 0x0003;
const WINEVENT_OUTOFCONTEXT = 0x0000;

let mouseHookHandle = null;
let mouseHookCb = null;
let winEventHookHandle = null;
let winEventCb = null;

// HTML/CSS Template for the Suggestion Popover (Self-Contained & Instant-Loading)
const POPOVER_HTML = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Matra Popover</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
      -webkit-user-select: none;
    }
    body {
      background: transparent;
      overflow: hidden;
      font-family: system-ui, -apple-system, 'Hind Siliguri', 'Segoe UI', sans-serif;
      padding: 4px;
    }
    .popover-container {
      background: rgba(13, 15, 20, 0.94);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 255, 255, 0.25), 0 0 12px rgba(255, 107, 43, 0.15);
      padding: 6px 8px;
      color: #f1f5f9;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10.5px;
      color: #94a3b8;
      padding: 0 4px 4px 4px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }
    .header-token {
      color: #ff6b2b;
      font-weight: 600;
      font-family: monospace;
    }
    .candidates-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .candidate-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 3.5px 6px;
      border-radius: 6px;
      font-size: 13.5px;
      color: #cbd5e1;
      border: 1px solid transparent;
      transition: all 0.08s ease;
    }
    .candidate-row.active {
      background: linear-gradient(90deg, rgba(255, 107, 43, 0.22), rgba(255, 107, 43, 0.08));
      border: 1px solid rgba(255, 107, 43, 0.55);
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 0 8px rgba(255, 107, 43, 0.2);
    }
    .badge {
      font-size: 10px;
      font-weight: 700;
      padding: 1px 4.5px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      line-height: 1.2;
    }
    .candidate-row.active .badge {
      background: rgba(255, 107, 43, 0.85);
      color: #ffffff;
    }
    .text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div class="popover-container">
    <div class="header">
      <span>মিত্র অভ্র</span>
      <span class="header-token" id="token-label"></span>
    </div>
    <div class="candidates-list" id="candidates-list"></div>
  </div>

  <script>
    const tokenLabel = document.getElementById('token-label');
    const listEl = document.getElementById('candidates-list');

    window.updatePopover = function(data) {
      tokenLabel.textContent = data.word ? ('"' + data.word + '"') : '';
      listEl.innerHTML = '';

      if (!data.candidates || data.candidates.length === 0) return;

      data.candidates.forEach((cand, idx) => {
        const row = document.createElement('div');
        row.className = 'candidate-row' + (idx === data.selectedIndex ? ' active' : '');

        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = (idx + 1);

        const text = document.createElement('span');
        text.className = 'text';
        text.textContent = cand;

        row.appendChild(badge);
        row.appendChild(text);
        listEl.appendChild(row);
      });
    };

    window.setSelection = function(index) {
      const rows = listEl.querySelectorAll('.candidate-row');
      rows.forEach((row, idx) => {
        if (idx === index) {
          row.classList.add('active');
        } else {
          row.classList.remove('active');
        }
      });
    };
  </script>
</body>
</html>`;

export function initPopoverOverlay(onDismiss) {
  onDismissCallback = onDismiss;

  try {
    user32 = koffi.load('user32.dll');

    SetWindowLongW = user32.func('SetWindowLongW', 'int32', ['void*', 'int', 'int32']);
    GetWindowLongW = user32.func('GetWindowLongW', 'int32', ['void*', 'int']);

    // Mouse Hook (WH_MOUSE_LL = 14) for detecting click outside
    const MSLLHOOKSTRUCT = koffi.struct('MSLLHOOKSTRUCT_POPOVER', {
      pt_x: 'int32',
      pt_y: 'int32',
      mouseData: 'uint32',
      flags: 'uint32',
      time: 'uint32',
      dwExtraInfo: 'uintptr_t'
    });
    const HOOKPROC_MOUSE = koffi.proto('intptr_t __stdcall HOOKPROC_MOUSE_POPOVER(int nCode, uintptr_t wParam, MSLLHOOKSTRUCT_POPOVER *lParam)');
    SetWindowsHookExW = user32.func('SetWindowsHookExW', 'void*', ['int', koffi.pointer(HOOKPROC_MOUSE), 'void*', 'uint32']);
    UnhookWindowsHookEx = user32.func('UnhookWindowsHookEx', 'bool', ['void*']);
    CallNextHookEx = user32.func('CallNextHookEx', 'intptr_t', ['void*', 'int', 'uintptr_t', 'void*']);

    mouseHookCb = koffi.register(mouseProc, koffi.pointer(HOOKPROC_MOUSE));
    mouseHookHandle = SetWindowsHookExW(WH_MOUSE_LL, mouseHookCb, null, 0);

    // WinEvent Hook (EVENT_SYSTEM_FOREGROUND = 0x0003) for detecting window focus changes
    const WINEVENTPROC = koffi.proto('void __stdcall WINEVENTPROC_POPOVER(void* hWinEventHook, uint32 event, void* hwnd, int32 idObject, int32 idChild, uint32 idEventThread, uint32 dwmsEventTime)');
    SetWinEventHook = user32.func('SetWinEventHook', 'void*', ['uint32', 'uint32', 'void*', koffi.pointer(WINEVENTPROC), 'uint32', 'uint32', 'uint32']);
    UnhookWinEvent = user32.func('UnhookWinEvent', 'bool', ['void*']);

    winEventCb = koffi.register(winEventProc, koffi.pointer(WINEVENTPROC));
    winEventHookHandle = SetWinEventHook(EVENT_SYSTEM_FOREGROUND, EVENT_SYSTEM_FOREGROUND, null, winEventCb, 0, 0, WINEVENT_OUTOFCONTEXT);

    logger.info('[PopoverOverlay] Mouse and WinEvent hooks registered successfully.');
  } catch (err) {
    logger.warn('[PopoverOverlay] Failed to register Win32 hooks:', err.message);
  }

  createPopoverWindow();
}

function createPopoverWindow() {
  if (typeof BrowserWindow !== 'function') return;
  if (popoverWindow && !popoverWindow.isDestroyed()) return;

  popoverWindow = new BrowserWindow({
    width: 230,
    height: 165,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false, // Critical: never steal keyboard focus
    hasShadow: false,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false
    }
  });

  // Apply Win32 WS_EX_NOACTIVATE | WS_EX_TOPMOST | WS_EX_TOOLWINDOW
  if (SetWindowLongW && GetWindowLongW) {
    try {
      const hwndBuf = popoverWindow.getNativeWindowHandle();
      const hwndAddr = Number(hwndBuf.readBigUInt64LE(0));
      const hwndPtr = koffi.as(hwndAddr, 'void*');

      const exStyle = GetWindowLongW(hwndPtr, GWL_EXSTYLE);
      const newExStyle = exStyle | WS_EX_NOACTIVATE | WS_EX_TOPMOST | WS_EX_TOOLWINDOW;
      SetWindowLongW(hwndPtr, GWL_EXSTYLE, newExStyle);
    } catch (styleErr) {
      logger.warn('[PopoverOverlay] Error applying WS_EX_NOACTIVATE style:', styleErr.message);
    }
  }

  popoverWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(POPOVER_HTML)}`);

  popoverWindow.webContents.on('did-finish-load', () => {
    isReady = true;
  });

  popoverWindow.on('closed', () => {
    popoverWindow = null;
    isReady = false;
    isVisible = false;
  });
}

/**
 * Positions and displays the suggestion popover with the given candidates.
 */
export function showPopover(x, y, candidates, selectedIndex = 0, word = '') {
  if (!popoverWindow || popoverWindow.isDestroyed()) {
    createPopoverWindow();
  }

  const heightForCandidates = Math.min(175, 34 + (candidates.length * 28));

  popoverWindow.setBounds({
    x: Math.round(x),
    y: Math.round(y),
    width: 230,
    height: Math.round(heightForCandidates)
  });

  const payload = {
    word,
    candidates: candidates.slice(0, 5),
    selectedIndex: Math.max(0, Math.min(selectedIndex, candidates.length - 1))
  };

  const script = `if (window.updatePopover) { window.updatePopover(${JSON.stringify(payload)}); }`;
  popoverWindow.webContents.executeJavaScript(script).catch(() => {});

  if (!isVisible) {
    popoverWindow.showInactive();
    isVisible = true;
  }
}

/**
 * Updates the highlighted candidate selection without moving or flickering the window.
 */
export function updatePopoverSelection(selectedIndex) {
  if (!popoverWindow || popoverWindow.isDestroyed() || !isVisible) return;
  const script = `if (window.setSelection) { window.setSelection(${selectedIndex}); }`;
  popoverWindow.webContents.executeJavaScript(script).catch(() => {});
}

/**
 * Hides the popover window immediately.
 */
export function hidePopover() {
  if (!popoverWindow || popoverWindow.isDestroyed()) {
    isVisible = false;
    return;
  }
  if (isVisible) {
    popoverWindow.hide();
    isVisible = false;
  }
}

export function isPopoverVisible() {
  return isVisible;
}

export function getPopoverBounds() {
  if (popoverWindow && !popoverWindow.isDestroyed()) {
    return popoverWindow.getBounds();
  }
  return { x: 0, y: 0, width: 0, height: 0 };
}

// Mouse Hook Callback: dismiss popover on click outside
function mouseProc(nCode, wParam, lParam) {
  if (nCode >= 0 && isVisible && popoverWindow && !popoverWindow.isDestroyed()) {
    if (wParam === WM_LBUTTONDOWN || wParam === WM_RBUTTONDOWN || wParam === WM_NCLBUTTONDOWN) {
      const clickX = lParam.pt_x;
      const clickY = lParam.pt_y;
      const bounds = popoverWindow.getBounds();

      const inside = clickX >= bounds.x &&
                     clickX <= (bounds.x + bounds.width) &&
                     clickY >= bounds.y &&
                     clickY <= (bounds.y + bounds.height);

      if (!inside) {
        hidePopover();
        if (onDismissCallback) {
          onDismissCallback('mouse_click_outside');
        }
      }
    }
  }
  return CallNextHookEx ? CallNextHookEx(mouseHookHandle, nCode, wParam, lParam) : 0;
}

// WinEvent Callback: dismiss popover on active window focus change
function winEventProc(hWinEventHook, event, hwnd, idObject, idChild, idEventThread, dwmsEventTime) {
  if (event === EVENT_SYSTEM_FOREGROUND && isVisible) {
    hidePopover();
    if (onDismissCallback) {
      onDismissCallback('foreground_switch');
    }
  }
}

export function destroyPopoverOverlay() {
  hidePopover();

  if (mouseHookHandle && UnhookWindowsHookEx) {
    UnhookWindowsHookEx(mouseHookHandle);
    mouseHookHandle = null;
  }
  if (mouseHookCb && koffi.unregister) {
    koffi.unregister(mouseHookCb);
    mouseHookCb = null;
  }

  if (winEventHookHandle && UnhookWinEvent) {
    UnhookWinEvent(winEventHookHandle);
    winEventHookHandle = null;
  }
  if (winEventCb && koffi.unregister) {
    koffi.unregister(winEventCb);
    winEventCb = null;
  }

  if (popoverWindow && !popoverWindow.isDestroyed()) {
    popoverWindow.destroy();
    popoverWindow = null;
  }
}
