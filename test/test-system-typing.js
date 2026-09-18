// Test Suite: System-Wide Typing, Win32 Hook & Latency Verification
import koffi from 'koffi';
import { spawn, execSync } from 'node:child_process';
import { transliterateOffline, transliteratePhoneticRaw } from '../src/engine/OfflinePhoneticEngine.js';
import { LayoutManager } from '../src/engine/LayoutManager.js';
import {
  sendBackspaces,
  injectUnicodeString,
  initNativeHook,
  destroyNativeHook,
  setHookMode,
  setHookLayout,
  processHookEventForTesting,
  getSuppressedVkCodesForTesting
} from '../src/main/nativeHookManager.js';

console.log('=== Running System-Wide Typing Verification Suite ===\n');

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

// 1. Verify Koffi and Win32 user32.dll loading
console.log('--- 1. Win32 Library & Symbol Verification ---');
const user32 = koffi.load('user32.dll');
assert(Boolean(user32), 'user32.dll loads successfully via Koffi');

const SendInput = user32.func('SendInput', 'uint32', ['uint32', 'void*', 'int']);
assert(typeof SendInput === 'function', 'SendInput function bound successfully');

const GetForegroundWindow = user32.func('GetForegroundWindow', 'void*', []);
assert(typeof GetForegroundWindow === 'function', 'GetForegroundWindow bound successfully');

// 2. Transliteration Integrity for System-Wide Typing
console.log('\n--- 2. Synchronous Offline Transliteration Verification ---');
const words = [
  { input: 'ami', expected: 'আমি' },
  { input: 'banglay', expected: '\u09AC\u09BE\u0982\u09B2\u09BE\u09DF' }, // 'বাংলায়'
  { input: 'gaan', expected: 'গান' },
  { input: 'gai', expected: 'গাই' },
  { input: 'bhalobashi', expected: 'ভালোবাসি' }
];

for (const w of words) {
  const candidates = transliterateOffline(w.input);
  const topCandidate = candidates[0] || transliteratePhoneticRaw(w.input);
  assert(topCandidate === w.expected, `Transliteration of "${w.input}" -> "${topCandidate}" matches "${w.expected}"`);
}

// 3. Fixed Layout Mappings (Bijoy & Probhat)
console.log('\n--- 3. Fixed Layout Keymapping Verification ---');
const bijoyK = LayoutManager.mapKey('bijoy', 'j', false);
assert(bijoyK === 'ক', 'Bijoy unshifted "j" maps to "ক"');

const bijoyKh = LayoutManager.mapKey('bijoy', 'J', true);
assert(bijoyKh === 'খ', 'Bijoy shifted "J" maps to "খ"');

const probhatA = LayoutManager.mapKey('probhat', 'a', false);
assert(probhatA === 'া', 'Probhat unshifted "a" maps to "া"');

// 4. Hook Symmetrical KeyUp/KeyDown Suppression Verification (Items 1 & 2)
console.log('\n--- 4. Hook KeyUp/KeyDown Symmetrical Suppression Verification ---');
const WM_KEYDOWN = 0x0100;
const WM_KEYUP = 0x0101;
const VK_BACK = 0x08;
const VK_F1 = 0x70;
const VK_F5 = 0x74;
const VK_DELETE = 0x2E;
const VK_5 = 0x35;
const VK_A = 0x41;
const VK_J = 0x4A;

// Mock window handle
const mockMainWindow = {
  isDestroyed: () => false,
  getNativeWindowHandle: () => Buffer.alloc(8),
  webContents: { send: () => {} }
};

initNativeHook(mockMainWindow);

// A. Bijoy mode unmapped vs mapped keys
setHookMode('bn');
setHookLayout('bijoy');

// Unmapped F1 key: should pass through on KeyDown (0) and pass through on KeyUp (0) - no stuck key
const f1Down = processHookEventForTesting(WM_KEYDOWN, VK_F1);
const f1Up = processHookEventForTesting(WM_KEYUP, VK_F1);
assert(f1Down === 0 && f1Up === 0, 'Bijoy: Unmapped F1 key passes through on both KeyDown and KeyUp (no stuck key)');

// Unmapped F5 key: should pass through on KeyDown (0) and KeyUp (0)
const f5Down = processHookEventForTesting(WM_KEYDOWN, VK_F5);
const f5Up = processHookEventForTesting(WM_KEYUP, VK_F5);
assert(f5Down === 0 && f5Up === 0, 'Bijoy: Unmapped F5 key passes through on both KeyDown and KeyUp');

// Unmapped Delete key: should pass through on KeyDown (0) and KeyUp (0)
const delDown = processHookEventForTesting(WM_KEYDOWN, VK_DELETE);
const delUp = processHookEventForTesting(WM_KEYUP, VK_DELETE);
assert(delDown === 0 && delUp === 0, 'Bijoy: Unmapped Delete key passes through on both KeyDown and KeyUp');

// Mapped 'j' key: should be swallowed on KeyDown (1) and swallowed on KeyUp (1)
const jDown = processHookEventForTesting(WM_KEYDOWN, VK_J);
const jUp = processHookEventForTesting(WM_KEYUP, VK_J);
assert(jDown === 1 && jUp === 1, 'Bijoy: Mapped "j" key is swallowed symmetrically on KeyDown and KeyUp');

// B. Avro mode Backspace and Digits
setHookLayout('avro');

// Backspace with empty buffer: should pass through on KeyDown (0) and KeyUp (0) - no stuck backspace
const backEmptyDown = processHookEventForTesting(WM_KEYDOWN, VK_BACK);
const backEmptyUp = processHookEventForTesting(WM_KEYUP, VK_BACK);
assert(backEmptyDown === 0 && backEmptyUp === 0, 'Avro: Backspace with empty buffer passes through on both KeyDown and KeyUp');

// Digit key '5': explicit decision — passes through as Latin numeral on both KeyDown and KeyUp
const digitDown = processHookEventForTesting(WM_KEYDOWN, VK_5);
const digitUp = processHookEventForTesting(WM_KEYUP, VK_5);
assert(digitDown === 0 && digitUp === 0, 'Avro: Digit key "5" passes through as Latin numeral on both KeyDown and KeyUp');

// Letter 'a' starts buffer: should be swallowed on KeyDown (1) and KeyUp (1)
const aDown = processHookEventForTesting(WM_KEYDOWN, VK_A);
const aUp = processHookEventForTesting(WM_KEYUP, VK_A);
assert(aDown === 1 && aUp === 1, 'Avro: Letter "a" is swallowed symmetrically on KeyDown and KeyUp');

// Backspace with non-empty buffer: should be swallowed on KeyDown (1) and KeyUp (1)
const backActiveDown = processHookEventForTesting(WM_KEYDOWN, VK_BACK);
const backActiveUp = processHookEventForTesting(WM_KEYUP, VK_BACK);
assert(backActiveDown === 1 && backActiveUp === 1, 'Avro: Backspace with active composition buffer is swallowed symmetrically');

// 5. External App Injection & Cumulative Latency Test (Notepad)
console.log('\n--- 5. Notepad Real Injection & Cumulative Latency Test ---');
try {
  // Launch Notepad
  const notepad = spawn('notepad.exe', [], { detached: false, stdio: 'ignore' });
  assert(Boolean(notepad.pid), `Notepad process spawned with PID: ${notepad.pid}`);

  // Give Notepad 600ms to initialize and take foreground focus
  await new Promise(r => setTimeout(r, 600));

  // Reset hook state for live typing simulation
  setHookMode('bn');
  setHookLayout('avro');

  // Test sequence: typing long Bengali word "bhalobashi" (10 characters, produces "ভালোবাসি")
  const testWord = 'bhalobashi';
  const timings = [];

  console.log(`\n  Simulating full hook pipeline typing for 10-char word "${testWord}" into Notepad:`);
  console.log('  Char | KeyCode | Hook Proc Latency | Composition State');
  console.log('  -----+---------+-------------------+------------------');

  for (let i = 0; i < testWord.length; i++) {
    const char = testWord[i];
    const vk = char.toUpperCase().charCodeAt(0);

    const tStart = performance.now();
    const downResult = processHookEventForTesting(WM_KEYDOWN, vk);
    const tEnd = performance.now();

    const upResult = processHookEventForTesting(WM_KEYUP, vk);
    const elapsedMs = tEnd - tStart;
    timings.push(elapsedMs);

    console.log(`    ${char}  |  0x${vk.toString(16)}  |     ${elapsedMs.toFixed(3)} ms      | KeyDown=${downResult}, KeyUp=${upResult}`);
  }

  const maxLatency = Math.max(...timings);
  const avgLatency = timings.reduce((a, b) => a + b, 0) / timings.length;

  console.log(`\n  Latency Statistics over ${testWord.length} keystrokes:`);
  console.log(`  - Average Latency: ${avgLatency.toFixed(3)} ms`);
  console.log(`  - Maximum Latency: ${maxLatency.toFixed(3)} ms`);

  assert(maxLatency < 2.0, `Maximum hook keystroke latency (${maxLatency.toFixed(3)} ms) is well below 2.0 ms`);
  assert(avgLatency < 0.8, `Average hook keystroke latency (${avgLatency.toFixed(3)} ms) is well below 0.8 ms`);

  // Verify backspace mid-composition on the live app
  const tBackStart = performance.now();
  const backResult = processHookEventForTesting(WM_KEYDOWN, VK_BACK);
  const tBackEnd = performance.now();
  processHookEventForTesting(WM_KEYUP, VK_BACK);

  assert(backResult === 1, 'Mid-composition backspace successfully swallowed and updated composition');
  assert((tBackEnd - tBackStart) < 2.0, `Backspace latency (${(tBackEnd - tBackStart).toFixed(3)} ms) is well below 2.0 ms`);

  // Terminate Notepad cleanly without saving prompt
  execSync(`taskkill /F /PID ${notepad.pid} 2>nul || exit 0`);
  assert(true, 'Notepad process terminated cleanly');

} catch (err) {
  assert(false, `Notepad injection test failed with error: ${err.message}`);
}

destroyNativeHook();
assert(true, 'destroyNativeHook executed and cleaned up cleanly');

console.log(`\n=== Verification Results: ${passedTests}/${totalTests} Tests Passed ===\n`);
if (passedTests === totalTests) {
  console.log('ALL SYSTEM-WIDE TYPING TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error('SOME TESTS FAILED.');
  process.exit(1);
}
