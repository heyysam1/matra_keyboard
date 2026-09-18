// Matra Keyboard — Asynchronous Caret Position Manager
// Coordinates the 3-step fallback chain for detecting external text caret positions:
// 1. Primary: UI Automation (TextPattern / GetCaretRange via native CaretDetector)
// 2. Secondary: Win32 GetGUIThreadInfo (rcCaret + ClientToScreen)
// 3. Tertiary: Target Window Client Area Fallback (GetWindowRect anchor)
//
// Dispatched asynchronously outside the WH_KEYBOARD_LL hook to preserve sub-millisecond typing latency.

import electron from 'electron';
const { app, screen } = electron;
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import koffi from 'koffi';
import { logger } from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve native CaretDetector executable path
function getCaretDetectorPath() {
  if (app && app.isPackaged) {
    return path.join(process.resourcesPath, 'bin', 'CaretDetector.exe');
  }
  // Development / Vite layout
  return path.resolve(__dirname, '../../resources/bin/CaretDetector.exe');
}

// In-process Win32 fallback via Koffi
let user32 = null;
let GetGUIThreadInfo = null;
let GetWindowThreadProcessId = null;
let ClientToScreen = null;
let GetWindowRect = null;

try {
  user32 = koffi.load('user32.dll');

  const GUITHREADINFO = koffi.struct('GUITHREADINFO_CARET', {
    cbSize: 'uint32',
    flags: 'uint32',
    hwndActive: 'void*',
    hwndFocus: 'void*',
    hwndCapture: 'void*',
    hwndMenuOwner: 'void*',
    hwndMoveSize: 'void*',
    hwndCaret: 'void*',
    rcCaret_left: 'int32',
    rcCaret_top: 'int32',
    rcCaret_right: 'int32',
    rcCaret_bottom: 'int32'
  });

  GetGUIThreadInfo = user32.func('GetGUIThreadInfo', 'bool', ['uint32', koffi.out(koffi.pointer(GUITHREADINFO))]);
  GetWindowThreadProcessId = user32.func('GetWindowThreadProcessId', 'uint32', ['void*', koffi.out(koffi.pointer('uint32'))]);
  ClientToScreen = user32.func('ClientToScreen', 'bool', ['void*', koffi.inout(koffi.pointer('int32[2]'))]);

  const RECT = koffi.struct('RECT_CARET', {
    left: 'int32',
    top: 'int32',
    right: 'int32',
    bottom: 'int32'
  });
  GetWindowRect = user32.func('GetWindowRect', 'bool', ['void*', koffi.out(koffi.pointer(RECT))]);
} catch (err) {
  logger.warn('[CaretPositionManager] Failed to bind in-process Win32 caret fallbacks:', err.message);
}

// Cache last known good coordinates per HWND to prevent jitter during fast bursts
const positionCache = new Map();

/**
 * Detects the caret position for a given foreground HWND using the 3-step fallback chain.
 * Dispatched asynchronously without blocking the native keyboard hook.
 *
 * @param {number|string|bigint} hwnd - Target window handle
 * @returns {Promise<{ x: number, y: number, height: number, method: string }>}
 */
export async function detectCaretPosition(hwnd) {
  const numericHwnd = typeof hwnd === 'bigint' ? Number(hwnd) : Number(hwnd || 0);

  // 1. Try Native CaretDetector (UIA -> GUI -> Window Rect)
  try {
    const detectorExe = getCaretDetectorPath();
    const result = await runNativeDetector(detectorExe, numericHwnd, 90);

    if (result && result.success && typeof result.x === 'number' && typeof result.y === 'number') {
      const position = clampToDisplay(result.x, result.y + 4, result.h || 18, result.method);
      if (numericHwnd) positionCache.set(numericHwnd, position);
      return position;
    }
  } catch (_e) {
    // Native detector timed out or encountered error; proceed to in-process fallbacks
  }

  // 2. In-Process Win32 GetGUIThreadInfo Fallback
  if (GetGUIThreadInfo && GetWindowThreadProcessId && numericHwnd) {
    try {
      const hwndPtr = koffi.as(numericHwnd, 'void*');
      const pidBuf = [0];
      const tid = GetWindowThreadProcessId(hwndPtr, pidBuf);

      if (tid > 0) {
        const info = { cbSize: 72 };
        const ok = GetGUIThreadInfo(tid, info);

        if (ok && info.hwndCaret) {
          const pt = [info.rcCaret_left, info.rcCaret_bottom];
          ClientToScreen(info.hwndCaret, pt);
          const ch = Math.max(16, info.rcCaret_bottom - info.rcCaret_top);
          const position = clampToDisplay(pt[0], pt[1] + 4, ch, 'gui');
          positionCache.set(numericHwnd, position);
          return position;
        }
      }
    } catch (_guiErr) {
      // Proceed to Window Rect fallback
    }
  }

  // 3. In-Process Window Rect Fallback
  if (GetWindowRect && numericHwnd) {
    try {
      const hwndPtr = koffi.as(numericHwnd, 'void*');
      const wr = {};
      if (GetWindowRect(hwndPtr, wr)) {
        const fallbackX = wr.left + 50;
        const fallbackY = wr.top + 80;
        const position = clampToDisplay(fallbackX, fallbackY, 20, 'fallback');
        return position;
      }
    } catch (_wrErr) {
      // Proceed to cached or primary display fallback
    }
  }

  // 4. Return cached position or default to primary display center-left
  if (numericHwnd && positionCache.has(numericHwnd)) {
    return positionCache.get(numericHwnd);
  }

  const primary = screen ? screen.getPrimaryDisplay() : { workArea: { x: 100, y: 100, width: 1920, height: 1080 } };
  return {
    x: primary.workArea.x + 120,
    y: primary.workArea.y + 160,
    height: 20,
    method: 'default'
  };
}

// Executes CaretDetector.exe with a strict timeout
function runNativeDetector(exePath, hwnd, timeoutMs) {
  return new Promise((resolve) => {
    const args = hwnd ? [String(hwnd)] : [];
    const child = execFile(exePath, args, { timeout: timeoutMs, windowsHide: true }, (err, stdout) => {
      if (err || !stdout) {
        return resolve(null);
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (_jsonErr) {
        resolve(null);
      }
    });

    child.on('error', () => resolve(null));
  });
}

// Multi-Monitor & DPI Clamping
function clampToDisplay(x, y, height, method) {
  if (!screen) {
    return { x, y, height, method };
  }

  const display = screen.getDisplayNearestPoint({ x: Math.round(x), y: Math.round(y) });
  const { workArea } = display;
  const popoverWidth = 230;
  const popoverHeight = 165;

  let clampedX = x;
  let clampedY = y;

  // Clamp horizontally within work area with 8px margin
  if (clampedX + popoverWidth > workArea.x + workArea.width) {
    clampedX = workArea.x + workArea.width - popoverWidth - 8;
  }
  if (clampedX < workArea.x + 8) {
    clampedX = workArea.x + 8;
  }

  // If popover would overflow below screen bottom, flip above caret
  if (clampedY + popoverHeight > workArea.y + workArea.height) {
    clampedY = y - height - popoverHeight - 6;
  }
  if (clampedY < workArea.y + 8) {
    clampedY = workArea.y + 8;
  }

  return {
    x: Math.round(clampedX),
    y: Math.round(clampedY),
    height,
    method
  };
}
