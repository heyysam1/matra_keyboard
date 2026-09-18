// Test Suite: System-Wide Suggestion Popover & Caret Fallback Chain
import { spawn, execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import koffi from 'koffi';
import { transliterateOffline } from '../src/engine/OfflinePhoneticEngine.js';
import { detectCaretPosition } from '../src/main/caretPositionManager.js';
import {
  initNativeHook,
  destroyNativeHook,
  setHookMode,
  setHookLayout,
  processHookEventForTesting,
  getActiveCandidatesForTesting,
  getSelectedCandidateIndexForTesting,
  getActiveWordBufferForTesting
} from '../src/main/nativeHookManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('=== Running System-Wide Suggestion Popover Test Suite ===\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// -------------------------------------------------------------
// 1. Native CaretDetector Binary & Fallback Chain Verification
// -------------------------------------------------------------
console.log('--- 1. Native CaretDetector & Fallback Chain Verification ---');
const detectorExePath = path.resolve(__dirname, '../resources/bin/CaretDetector.exe');
assert(fs.existsSync(detectorExePath), `CaretDetector.exe exists at: ${detectorExePath}`);

// Test with zero HWND
try {
  const zeroOutput = execSync(`"${detectorExePath}" 0`, { encoding: 'utf8' }).trim();
  const zeroJson = JSON.parse(zeroOutput);
  assert(zeroJson.success === false, `Graceful rejection for invalid/zero HWND: ${zeroOutput}`);
} catch (err) {
  assert(false, `CaretDetector execution failed: ${err.message}`);
}

// Test with real Notepad window
let notepad = null;
let notepadHwnd = 0;
let detectedMethod = 'unknown';

try {
  notepad = spawn('notepad.exe', [], { detached: false, stdio: 'ignore' });
  assert(Boolean(notepad.pid), `Notepad spawned with PID: ${notepad.pid}`);

  // Give Notepad 1200ms to open and take focus
  await new Promise(r => setTimeout(r, 1200));

  // Resolve Notepad window handle using PowerShell
  const psHwnd = execSync(`powershell -NoProfile -Command "(Get-Process -Id ${notepad.pid}).MainWindowHandle"`, { encoding: 'utf8' }).trim();
  notepadHwnd = parseInt(psHwnd, 10) || 0;

  if (notepadHwnd === 0) {
    // Fallback search
    const psFind = execSync('powershell -NoProfile -Command "(Get-Process notepad | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1).MainWindowHandle"', { encoding: 'utf8' }).trim();
    notepadHwnd = parseInt(psFind, 10) || 0;
  }

  console.log(`  Target Notepad HWND: ${notepadHwnd}`);
  assert(notepadHwnd > 0, `Successfully resolved active Notepad HWND (${notepadHwnd})`);

  // Run CaretDetector.exe on Notepad HWND
  const npOutput = execSync(`"${detectorExePath}" ${notepadHwnd}`, { encoding: 'utf8' }).trim();
  const npJson = JSON.parse(npOutput);
  console.log(`  CaretDetector Output for Notepad: ${npOutput}`);

  assert(npJson.success === true, 'CaretDetector successfully detected position on Notepad');
  assert(typeof npJson.x === 'number' && typeof npJson.y === 'number', `Valid coordinates returned: X=${npJson.x}, Y=${npJson.y}`);
  assert(['uia', 'gui', 'fallback'].includes(npJson.method), `Detection method identified as: ${npJson.method.toUpperCase()}`);
  detectedMethod = npJson.method;

  // Test caretPositionManager asynchronous wrapper
  const pos = await detectCaretPosition(notepadHwnd);
  assert(pos && typeof pos.x === 'number' && typeof pos.y === 'number', `detectCaretPosition() returned clamped coordinates: X=${pos.x}, Y=${pos.y}`);

} catch (err) {
  assert(false, `Notepad caret detection failed: ${err.message}`);
}

// -------------------------------------------------------------
// 2. Hook Synchronous Latency (Preserving Sub-Millisecond Speed)
// -------------------------------------------------------------
console.log('\n--- 2. Hook Keystroke Latency & Async Popover Dispatch ---');
const mockMainWindow = {
  isDestroyed: () => false,
  getNativeWindowHandle: () => Buffer.alloc(8),
  webContents: { send: () => {} }
};

initNativeHook(mockMainWindow);
setHookMode('bn');
setHookLayout('avro');

const WM_KEYDOWN = 0x0100;
const WM_KEYUP = 0x0101;
const VK_A = 0x41; // 'a'
const VK_M = 0x4D; // 'm'
const VK_I = 0x49; // 'i'
const VK_1 = 0x31; // '1'
const VK_2 = 0x32; // '2'
const VK_UP = 0x26;
const VK_DOWN = 0x28;
const VK_SPACE = 0x20;
const VK_BACK = 0x08;
const VK_ESCAPE = 0x1B;

// Measure latency of letter keystrokes with asynchronous popover queueing
const tStart = performance.now();
const downResultA = processHookEventForTesting(WM_KEYDOWN, VK_A);
const tElapsedA = performance.now() - tStart;
processHookEventForTesting(WM_KEYUP, VK_A);

assert(downResultA === 1, 'Key "a" swallowed by hook for phonetic composition');
assert(tElapsedA < 1.0, `Hook execution time (${tElapsedA.toFixed(3)} ms) remained sub-millisecond (async dispatch verified)`);

const candidates = getActiveCandidatesForTesting();
assert(candidates.length > 0 && candidates.length <= 5, `Generated ${candidates.length} popover candidates (top candidate: "${candidates[0]}")`);
assert(getSelectedCandidateIndexForTesting() === 0, 'Initial highlighted candidate is index 0');

// -------------------------------------------------------------
// 3. Popover Interactive Key Controls (Numbers, Arrows, Space, Esc)
// -------------------------------------------------------------
console.log('\n--- 3. Popover Interactive Key Controls ---');

// A. Arrow Navigation
// Add 'm' -> buffer 'am'
processHookEventForTesting(WM_KEYDOWN, VK_M);
processHookEventForTesting(WM_KEYUP, VK_M);

// Press Arrow Down (VK_DOWN = 0x28)
const downArrow = processHookEventForTesting(WM_KEYDOWN, VK_DOWN);
processHookEventForTesting(WM_KEYUP, VK_DOWN);
assert(downArrow === 1, 'Arrow Down swallowed by hook (visual highlight navigation)');
assert(getSelectedCandidateIndexForTesting() === 1, 'Selected candidate index advanced to 1');

// Press Arrow Up (VK_UP = 0x26)
const upArrow = processHookEventForTesting(WM_KEYDOWN, VK_UP);
processHookEventForTesting(WM_KEYUP, VK_UP);
assert(upArrow === 1, 'Arrow Up swallowed by hook');
assert(getSelectedCandidateIndexForTesting() === 0, 'Selected candidate index returned to 0');

// B. Candidate Selection via Number Key 1
const candList = getActiveCandidatesForTesting();
const expectedWord = candList[0];
const numKeyResult = processHookEventForTesting(WM_KEYDOWN, VK_1);
processHookEventForTesting(WM_KEYUP, VK_1);

assert(numKeyResult === 1, 'Number key "1" swallowed by hook to commit candidate #1');
assert(getActiveWordBufferForTesting() === '', 'Active composition buffer committed and flushed after number selection');
assert(getActiveCandidatesForTesting().length === 0, 'Popover candidates cleared after commit');

// C. Escape Dismissal
// Start new token 'i'
processHookEventForTesting(WM_KEYDOWN, VK_I);
processHookEventForTesting(WM_KEYUP, VK_I);
assert(getActiveWordBufferForTesting() === 'i', 'New composition buffer active: "i"');

// Press Escape
const escResult = processHookEventForTesting(WM_KEYDOWN, VK_ESCAPE);
processHookEventForTesting(WM_KEYUP, VK_ESCAPE);
assert(escResult === 1, 'Escape key swallowed by hook to dismiss popover');
assert(getActiveWordBufferForTesting() === '', 'Composition buffer cleared upon Escape dismissal without changing injected text');

// D. Space Key Commit
processHookEventForTesting(WM_KEYDOWN, VK_A);
processHookEventForTesting(WM_KEYUP, VK_A);
const spaceResult = processHookEventForTesting(WM_KEYDOWN, VK_SPACE);
processHookEventForTesting(WM_KEYUP, VK_SPACE);
assert(spaceResult === 0, 'Space key passed through natively to target app to produce word boundary');
assert(getActiveWordBufferForTesting() === '', 'Active buffer committed upon Space press');

// E. Mid-word Backspacing and Buffer Depletion
processHookEventForTesting(WM_KEYDOWN, VK_A);
processHookEventForTesting(WM_KEYUP, VK_A);
processHookEventForTesting(WM_KEYDOWN, VK_M);
processHookEventForTesting(WM_KEYUP, VK_M);
assert(getActiveWordBufferForTesting() === 'am', 'Composition buffer active: "am"');

// Backspace once -> should remain 'a'
processHookEventForTesting(WM_KEYDOWN, VK_BACK);
processHookEventForTesting(WM_KEYUP, VK_BACK);
assert(getActiveWordBufferForTesting() === 'a', 'Backspace sliced composition buffer to "a"');
assert(getActiveCandidatesForTesting().length > 0, 'Candidates updated for new buffer state');

// Backspace again -> buffer empty
processHookEventForTesting(WM_KEYDOWN, VK_BACK);
processHookEventForTesting(WM_KEYUP, VK_BACK);
assert(getActiveWordBufferForTesting() === '', 'Backspace emptied composition buffer');
assert(getActiveCandidatesForTesting().length === 0, 'Popover candidates hidden when buffer is empty');

// Backspace when empty -> passes through natively
const emptyBack = processHookEventForTesting(WM_KEYDOWN, VK_BACK);
processHookEventForTesting(WM_KEYUP, VK_BACK);
assert(emptyBack === 0, 'Backspace with empty buffer passes through natively to target app');

// Clean up Notepad and Hook
if (notepad) {
  try {
    execSync(`taskkill /F /PID ${notepad.pid} 2>nul || exit 0`);
  } catch (_e) {}
}

destroyNativeHook();
assert(true, 'destroyNativeHook executed and cleaned up cleanly');

console.log(`\n=== Popover Verification Results: ${passedTests}/${totalTests} Tests Passed ===`);
console.log(`  Named App Matrix (Notepad): Verified Caret Method = ${detectedMethod.toUpperCase()}`);

if (passedTests === totalTests) {
  console.log('ALL SYSTEM-WIDE POPOVER TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error('SOME POPOVER TESTS FAILED.');
  process.exit(1);
}
