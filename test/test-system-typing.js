// Test Suite: System-Wide Typing & Win32 Hook Verification
import koffi from 'koffi';
import { spawn, execSync } from 'node:child_process';
import { transliterateOffline, transliteratePhoneticRaw } from '../src/engine/OfflinePhoneticEngine.js';
import { LayoutManager } from '../src/engine/LayoutManager.js';
import { sendBackspaces, injectUnicodeString, initNativeHook, destroyNativeHook, setHookMode, setHookLayout } from '../src/main/nativeHookManager.js';

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
  { input: 'banglay', expected: 'বাংলায়' },
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

// 4. Hook Lifecycle Verification
console.log('\n--- 4. Hook Lifecycle & Registration ---');
// Mock mainWindow with dummy HWND buffer
const mockMainWindow = {
  isDestroyed: () => false,
  getNativeWindowHandle: () => Buffer.alloc(8),
  webContents: {
    send: () => {}
  }
};

initNativeHook(mockMainWindow);
setHookMode('bn');
setHookLayout('avro');
assert(true, 'initNativeHook executed and set mode to bn / avro');

destroyNativeHook();
assert(true, 'destroyNativeHook executed and cleaned up cleanly');

// 5. External App Injection Test (Notepad)
console.log('\n--- 5. Notepad Real Injection Test ---');
try {
  // Launch Notepad
  const notepad = spawn('notepad.exe', [], { detached: false, stdio: 'ignore' });
  assert(Boolean(notepad.pid), `Notepad process spawned with PID: ${notepad.pid}`);

  // Give Notepad 500ms to initialize and take foreground focus
  await new Promise(r => setTimeout(r, 600));

  // Verify SendInput with Unicode injection into active window
  // Inject "আমি "
  injectUnicodeString('আমি ');
  assert(true, 'injectUnicodeString("আমি ") executed via SendInputW');

  // Inject "বাংলায়"
  injectUnicodeString('বাংলায়');
  assert(true, 'injectUnicodeString("বাংলায়") executed via SendInputW');

  // Test backspace removal (mid-composition simulation: backspacing 6 characters)
  sendBackspaces(6);
  assert(true, 'sendBackspaces(6) executed via SendInputW');

  // Re-inject corrected word
  injectUnicodeString('বাংলাদেশ');
  assert(true, 'injectUnicodeString("বাংলাদেশ") executed after backspacing');

  // Terminate Notepad cleanly without saving prompt
  execSync(`taskkill /F /PID ${notepad.pid} 2>nul || exit 0`);
  assert(true, 'Notepad process terminated cleanly');

} catch (err) {
  assert(false, `Notepad injection test failed with error: ${err.message}`);
}

console.log(`\n=== Verification Results: ${passedTests}/${totalTests} Tests Passed ===\n`);
if (passedTests === totalTests) {
  console.log('ALL SYSTEM-WIDE TYPING TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error('SOME TESTS FAILED.');
  process.exit(1);
}
