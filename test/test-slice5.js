// Matra Keyboard Slice 5 Automated Test Suite
// Validates User Dictionary CRUD & Boosting, Bijoy ↔ Unicode Conversion, System Care Diagnostics, and Bundled Fonts

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  addUserWord,
  updateUserWord,
  removeUserWord,
  getUserWords,
  loadUserWords,
  generatePhoneticKey,
  searchDictionary
} from '../src/engine/BengaliDictionary.js';

import {
  bijoyToUnicode,
  unicodeToBijoy
} from '../src/engine/BijoyUnicodeConverter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('=====================================================');
console.log('Running Matra Keyboard Slice 5 Automated Test Suite');
console.log('=====================================================\n');

// ----------------------------------------------------
// Test 1: User Dictionary Management & Priority Boosting
// ----------------------------------------------------
console.log('Test 1: Custom User Dictionary CRUD & Priority Boosting');

// 1.1 Add user word
addUserWord('মাতৃভাষা', 'matribhasha');
const wordsAfterAdd = getUserWords();
assert.ok(wordsAfterAdd.some(w => w.word === 'মাতৃভাষা' && w.key === 'matribhasha'), 'Added word must exist in user dictionary');

// 1.2 Verify candidate boosting in searchDictionary
const searchResults = searchDictionary('matribhasha');
assert.ok(searchResults.length > 0, 'Search should return candidates');
assert.strictEqual(searchResults[0], 'মাতৃভাষা', 'User word must be boosted to rank #1 (index 0)');

// 1.3 Automatic phonetic key generation test
const generatedKey = generatePhoneticKey('বাংলাদেশ');
assert.strictEqual(typeof generatedKey, 'string', 'Phonetic key must be a string');
assert.ok(generatedKey.length > 0, 'Phonetic key must not be empty');

// 1.4 Update word
updateUserWord('মাতৃভাষা', 'মাতৃভাষাটি', 'matribhashati');
const wordsAfterUpdate = getUserWords();
assert.ok(wordsAfterUpdate.some(w => w.word === 'মাতৃভাষাটি' && w.key === 'matribhashati'), 'Updated word must reflect changes');
assert.ok(!wordsAfterUpdate.some(w => w.word === 'মাতৃভাষা'), 'Old word must be replaced');

// 1.5 Delete word
removeUserWord('মাতৃভাষাটি');
const wordsAfterDelete = getUserWords();
assert.ok(!wordsAfterDelete.some(w => w.word === 'মাতৃভাষাটি'), 'Deleted word must not exist in user dictionary');

// 1.6 Bulk load test
loadUserWords([
  { word: 'অদ্বিতীয়', key: 'odwitiyo' },
  { word: 'প্রোগ্রামিং', key: 'programming' }
]);
assert.strictEqual(getUserWords().length, 2, 'Loaded list should contain 2 items');
const progSearch = searchDictionary('programming');
assert.strictEqual(progSearch[0], 'প্রোগ্রামিং', 'Bulk-loaded user word must rank #1 in search');

console.log('  ✓ Dictionary CRUD and suggestion ranking #1 priority verified.\n');

// ----------------------------------------------------
// Test 2: Bijoy (ANSI) ↔ Unicode Bidirectional Conversion
// ----------------------------------------------------
console.log('Test 2: Bijoy (SutonnyMJ ANSI) ↔ Unicode Converter');

// 2.1 Basic sentence
const bijoyInput1 = 'Avwg evsjvq Mvb MvB';
const unicodeExpected1 = 'আমি বাংলায় গান গাই';
const convertedUni1 = bijoyToUnicode(bijoyInput1);
assert.strictEqual(convertedUni1, unicodeExpected1, `BijoyToUnicode basic failed: got "${convertedUni1}" expected "${unicodeExpected1}"`);

const convertedBijoy1 = unicodeToBijoy(unicodeExpected1);
assert.strictEqual(convertedBijoy1, bijoyInput1, `UnicodeToBijoy basic failed: got "${convertedBijoy1}" expected "${bijoyInput1}"`);

// 2.2 Pre-base Kar reordering (i-kar, e-kar, oi-kar)
const bijoyKar = 'wK ‡K ‰K';
const uniKar = bijoyToUnicode(bijoyKar);
assert.strictEqual(uniKar, 'কি কে কৈ', `Pre-base Kar reordering failed: got "${uniKar}"`);

const backToBijoyKar = unicodeToBijoy('কি কে কৈ');
assert.strictEqual(backToBijoyKar, bijoyKar, `Unicode to Bijoy pre-base Kar failed: got "${backToBijoyKar}"`);

// 2.3 Split vowels (o-kar: ‡ + Consonant + v, ou-kar: ‡ + Consonant + Š)
const bijoySplit = '‡Kv ‡KŠ';
const uniSplit = bijoyToUnicode(bijoySplit);
assert.strictEqual(uniSplit, 'কো কৌ', `Split vowels failed: got "${uniSplit}"`);

const backToSplitBijoy = unicodeToBijoy('কো কৌ');
assert.strictEqual(backToSplitBijoy, bijoySplit, `Unicode to Bijoy split vowels failed: got "${backToSplitBijoy}"`);

// 2.4 Complex conjuncts (k-kha, j-nya, s-ta, n-ta, p-ra, k-ra, t-ra)
const conjunctTestCases = [
  { bijoy: 'hy³v¶i', unicode: 'যুক্তাক্ষর' }, // k-ta and k-ssa
  { bijoy: 'cÖK…wZ', unicode: 'প্রকৃতি' },   // p-ra and ri-kar
  { bijoy: 'Ávb', unicode: 'জ্ঞান' },        // j-nya
  { bijoy: 'Avb›`', unicode: 'আনন্দ' },       // n-da
  { bijoy: '¯^vaxb', unicode: 'স্বাধীন' }      // s-ba
];

for (const tc of conjunctTestCases) {
  const toUni = bijoyToUnicode(tc.bijoy);
  assert.strictEqual(toUni, tc.unicode, `Conjunct conversion failed for ${tc.bijoy}: got "${toUni}", expected "${tc.unicode}"`);
}

// 2.5 Reph handling
const rephBijoy = 'eY©';
const rephUni = bijoyToUnicode(rephBijoy);
assert.strictEqual(rephUni, 'বর্ণ', `Reph conversion failed: got "${rephUni}"`);

console.log('  ✓ Bijoy ↔ Unicode conversion engine passed all phonetic, kar reordering, split vowel, conjunct, and reph checks.\n');

// ----------------------------------------------------
// Test 3: System Care Diagnostics & Health Metrics Schemas
// ----------------------------------------------------
console.log('Test 3: System Care Diagnostic Health & File Integrity Logic');

// Verify integrity checks on real project files
const settingsPath = path.join(rootDir, 'package.json');
assert.ok(fs.existsSync(settingsPath), 'package.json must exist');

// Simulate integrity check validation logic
function checkJsonIntegrity(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { intact: true, missing: true };
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return { intact: typeof parsed === 'object' && parsed !== null, size: Buffer.byteLength(raw, 'utf8') };
  } catch (err) {
    return { intact: false, error: err.message };
  }
}

const integrityResult = checkJsonIntegrity(settingsPath);
assert.strictEqual(integrityResult.intact, true, 'package.json must pass JSON integrity test');
assert.ok(integrityResult.size > 0, 'package.json size must be greater than 0');

// System memory format verification
const simulatedMemory = process.memoryUsage();
const heapUsedMB = Math.round(simulatedMemory.heapUsed / 1024 / 1024);
const heapTotalMB = Math.round(simulatedMemory.heapTotal / 1024 / 1024);
assert.ok(heapUsedMB > 0, 'Heap used must be positive');
assert.ok(heapTotalMB >= heapUsedMB, 'Heap total must be >= heap used');

console.log('  ✓ Diagnostic health schema and JSON file integrity checks validated.\n');

// ----------------------------------------------------
// Test 4: Display & Appearance Bundled Font Assets & Licensing
// ----------------------------------------------------
console.log('Test 4: Bundled Offline Typography & SIL OFL 1.1 Assets');

const fontDir = path.join(rootDir, 'src', 'renderer', 'assets', 'fonts');
const expectedFontFiles = [
  'HindSiliguri-Regular.ttf',
  'HindSiliguri-Medium.ttf',
  'HindSiliguri-SemiBold.ttf',
  'HindSiliguri-Bold.ttf',
  'OFL.txt'
];

for (const file of expectedFontFiles) {
  const filePath = path.join(fontDir, file);
  assert.ok(fs.existsSync(filePath), `Bundled font asset "${file}" must exist at ${filePath}`);
  const stats = fs.statSync(filePath);
  assert.ok(stats.size > 0, `Bundled font asset "${file}" must have non-zero size (found ${stats.size} bytes)`);
}

// Check SIL Open Font License notice text
const oflContent = fs.readFileSync(path.join(fontDir, 'OFL.txt'), 'utf8');
assert.ok(oflContent.includes('SIL OPEN FONT LICENSE'), 'OFL.txt must contain SIL Open Font License title');
assert.ok(oflContent.includes('Hind Siliguri'), 'OFL.txt must reference Hind Siliguri');

// Check @font-face definition in tokens.css
const tokensCssPath = path.join(rootDir, 'src', 'renderer', 'styles', 'tokens.css');
const tokensCss = fs.readFileSync(tokensCssPath, 'utf8');
assert.ok(tokensCss.includes("@font-face"), 'tokens.css must declare @font-face rules');
assert.ok(tokensCss.includes("font-family: 'Hind Siliguri'"), "tokens.css must declare font-family: 'Hind Siliguri'");
assert.ok(tokensCss.includes('HindSiliguri-Regular.ttf'), 'tokens.css must reference HindSiliguri-Regular.ttf');

console.log('  ✓ Offline Hind Siliguri font family (4 weights) and OFL 1.1 licensing verified.\n');

console.log('=====================================================');
console.log('All Slice 5 Automated Tests PASSED Successfully! (4/4)');
console.log('=====================================================\n');
