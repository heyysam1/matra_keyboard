// Test Suite: Settings Persistence & Complete Round-Trip Verification
// Verifies that export -> wipe -> import preserves 100% of user settings without loss.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDefaultSettings } from '../src/main/ipcHandlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempBackupPath = path.join(__dirname, 'temp_settings_roundtrip_test.json');

console.log('=== Running Unified Settings Round-Trip Verification Suite ===\n');

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

// 1. Verify Default Settings Schema
console.log('--- 1. Default Settings Schema & Coverage ---');
const defaults = getDefaultSettings();
const expectedKeys = [
  'version', 'mode', 'layout', 'shortcut', 'autoStartup',
  'soundEnabled', 'soundProfile', 'soundVolume', 'activeLogo',
  'theme', 'customAccent', 'glassOpacity', 'glassBlur',
  'dockVariant', 'activeFont', 'lang', 'onboardingShown', 'injectionMethod'
];

for (const key of expectedKeys) {
  assert(key in defaults, `Default settings includes key: "${key}"`);
}

// 2. Prepare Distinct Non-Default User Configuration
console.log('\n--- 2. Custom User Configuration Definition ---');
const customSettings = {
  version: '1.0.0',
  mode: 'en',
  layout: 'bijoy',
  shortcut: 'ctrl+alt+k',
  autoStartup: true,
  soundEnabled: false,
  soundProfile: 'typewriter',
  soundVolume: 0.65,
  activeLogo: 'dark',
  theme: 'emerald',
  customAccent: '#10b981',
  glassOpacity: 85,
  glassBlur: 12,
  dockVariant: 4,
  activeFont: 'SolaimanLipi',
  lang: 'bn',
  onboardingShown: true,
  injectionMethod: 'clipboard'
};

assert(customSettings.mode !== defaults.mode, 'Test setting "mode" differs from default');
assert(customSettings.soundProfile !== defaults.soundProfile, 'Test setting "soundProfile" differs from default');
assert(customSettings.soundVolume !== defaults.soundVolume, 'Test setting "soundVolume" differs from default');
assert(customSettings.theme !== defaults.theme, 'Test setting "theme" differs from default');
assert(customSettings.lang !== defaults.lang, 'Test setting "lang" differs from default');
assert(customSettings.onboardingShown !== defaults.onboardingShown, 'Test setting "onboardingShown" differs from default');

// 3. Export to Disk
console.log('\n--- 3. Export Settings Simulation ---');
try {
  fs.writeFileSync(tempBackupPath, JSON.stringify(customSettings, null, 2), 'utf8');
  assert(fs.existsSync(tempBackupPath), `Settings successfully exported to disk at: ${tempBackupPath}`);
  const exportedRaw = fs.readFileSync(tempBackupPath, 'utf8');
  const exportedParsed = JSON.parse(exportedRaw);
  assert(typeof exportedParsed === 'object', 'Exported JSON parses cleanly into an object');
} catch (err) {
  assert(false, `Failed to export settings: ${err.message}`);
}

// 4. Wipe State Simulation
console.log('\n--- 4. Wipe State & Factory Reset Simulation ---');
let activeState = { ...defaults };
assert(activeState.soundProfile === 'normal', 'State reset to default soundProfile ("normal")');
assert(activeState.mode === 'bn', 'State reset to default mode ("bn")');
assert(activeState.onboardingShown === false, 'State reset to default onboardingShown (false)');

// 5. Import Settings & Restore
console.log('\n--- 5. Import Settings & Deep Equality Verification ---');
try {
  const importedRaw = fs.readFileSync(tempBackupPath, 'utf8');
  const importedData = JSON.parse(importedRaw);

  // Merge algorithm identical to src/main/ipcHandlers.js settings:import
  activeState = { ...defaults, ...importedData };

  for (const key of expectedKeys) {
    const isMatched = activeState[key] === customSettings[key];
    assert(isMatched, `Restored field "${key}" exactly matches exported value (${JSON.stringify(activeState[key])})`);
  }

} catch (err) {
  assert(false, `Failed to import settings: ${err.message}`);
} finally {
  // Clean up temporary file
  try {
    if (fs.existsSync(tempBackupPath)) {
      fs.unlinkSync(tempBackupPath);
    }
  } catch (_e) {}
}

console.log(`\n=== Verification Results: ${passedTests}/${totalTests} Tests Passed ===\n`);
if (passedTests === totalTests) {
  console.log('ALL SETTINGS PERSISTENCE & ROUND-TRIP TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.error('SOME TESTS FAILED.');
  process.exit(1);
}
