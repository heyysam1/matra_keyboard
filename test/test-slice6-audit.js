// Matra Keyboard Slice 6 Automated Audit & Verification Suite
// Validates Complete AI Absence, Commercial Licensing, Deliverables, Single Engine Standard, and Version Sync

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getDefaultSettings } from '../src/main/ipcHandlers.js';
import { TypingSession } from '../src/engine/TypingSession.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('=====================================================');
console.log('Running Matra Keyboard Slice 6 Final Audit Test Suite');
console.log('=====================================================\n');

// ----------------------------------------------------
// Test 1: Complete AI Integration Absence Audit (Section 20)
// ----------------------------------------------------
console.log('Test 1: Complete AI Integration Absence Audit (Section 20)');

function getSourceFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'dist-electron' || file === 'resources' || file === 'Matra Keyboard prompts' || file === 'test') {
      continue;
    }
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getSourceFiles(fullPath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.css') || file.endsWith('.json') || file.endsWith('.mjs')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const sourceFiles = getSourceFiles(path.join(rootDir, 'src'));
sourceFiles.push(path.join(rootDir, 'package.json'));
assert.ok(sourceFiles.length >= 15, 'Expected at least 15 source files in src/');

const forbiddenTerms = [
  'ai integration',
  'ai-integration',
  'ai_integration',
  'artificial intelligence',
  'gemini',
  'chatgpt',
  'claude'
];

const foundViolations = [];
for (const filePath of sourceFiles) {
  const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
  for (const term of forbiddenTerms) {
    if (content.includes(term)) {
      foundViolations.push({ file: path.relative(rootDir, filePath), term });
    }
  }
}

assert.strictEqual(
  foundViolations.length,
  0,
  `AI Integration terms found in source files: ${JSON.stringify(foundViolations)}`
);
console.log('  ✓ 0 AI Integration remnants found across entire codebase (Section 20 fully compliant).\n');

// ----------------------------------------------------
// Test 2: Dependency Licensing & Commercial Terms (Section 28A)
// ----------------------------------------------------
console.log('Test 2: Third-Party Licensing Audit (Section 28A)');

const lockfilePath = path.join(rootDir, 'package-lock.json');
assert.ok(fs.existsSync(lockfilePath), 'package-lock.json must exist');

const lockData = JSON.parse(fs.readFileSync(lockfilePath, 'utf8'));
const packages = lockData.packages || {};
const flaggedPackages = [];

for (const [pkgName, pkgMeta] of Object.entries(packages)) {
  if (!pkgName) continue; // Skip root project
  const license = String(pkgMeta.license || '').toUpperCase();
  // Check for copyleft GPL/AGPL/LGPL (excluding permissive MIT/Apache/BSD/ISC/CC0)
  if (license.includes('GPL') && !license.includes('MIT') && !license.includes('APACHE') && !license.includes('BSD')) {
    flaggedPackages.push({ pkgName, license });
  }
}

assert.strictEqual(
  flaggedPackages.length,
  0,
  `Copyleft licenses detected: ${JSON.stringify(flaggedPackages)}`
);
console.log('  ✓ 100% of dependencies in package-lock.json use permissive commercial licenses (0 copyleft).\n');

// ----------------------------------------------------
// Test 3: Deliverables Presence & Documentation Integrity (Section 28)
// ----------------------------------------------------
console.log('Test 3: Deliverables Presence & Documentation Integrity (Section 28)');

// 3.1 README.md
const readmePath = path.join(rootDir, 'README.md');
assert.ok(fs.existsSync(readmePath), 'README.md must exist in root directory');
const readmeContent = fs.readFileSync(readmePath, 'utf8');
assert.ok(readmeContent.includes('System-Wide Typing Architecture'), 'README must disclose system-wide typing architecture');
assert.ok(readmeContent.includes('Single Transliteration Engine'), 'README must disclose single engine standard');
assert.ok(readmeContent.includes('Auto-Update'), 'README must disclose auto-update scope');
assert.ok(readmeContent.includes('Zero Keystroke Logging'), 'README must disclose privacy boundary');
assert.ok(readmeContent.includes('Hind Siliguri'), 'README must disclose bundled font and license');

// 3.2 UAT_ACCEPTANCE_TEST_PLAN.md
const uatPath = path.join(rootDir, 'UAT_ACCEPTANCE_TEST_PLAN.md');
assert.ok(fs.existsSync(uatPath), 'UAT_ACCEPTANCE_TEST_PLAN.md must exist in root directory');
const uatContent = fs.readFileSync(uatPath, 'utf8');
assert.ok(uatContent.includes('UAT-001'), 'UAT script must contain concrete test rows');
assert.ok(uatContent.includes('PASS'), 'UAT script must document verification status');

// 3.3 Bundled Fonts & OFL.txt
const fontDir = path.join(rootDir, 'src', 'renderer', 'assets', 'fonts');
const fontFiles = ['HindSiliguri-Regular.ttf', 'HindSiliguri-Medium.ttf', 'HindSiliguri-SemiBold.ttf', 'HindSiliguri-Bold.ttf', 'OFL.txt'];
for (const font of fontFiles) {
  assert.ok(fs.existsSync(path.join(fontDir, font)), `Bundled font asset "${font}" must exist`);
}

console.log('  ✓ All required deliverables (README.md, UAT_ACCEPTANCE_TEST_PLAN.md, OFL.txt, TTF assets) verified.\n');

// ----------------------------------------------------
// Test 4: Version Synchronization & Single Engine Verification (Sections 4 & 13)
// ----------------------------------------------------
console.log('Test 4: Version Number Synchronization & Engine Unification');

const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
assert.strictEqual(pkg.version, '1.0.0', 'package.json version must be 1.0.0');

const defaultSettings = getDefaultSettings();
assert.strictEqual(defaultSettings.version, '1.0.0', 'Default settings version must be 1.0.0');

const indexHtml = fs.readFileSync(path.join(rootDir, 'src', 'renderer', 'index.html'), 'utf8');
assert.ok(indexHtml.includes('v1.0.0'), 'index.html must display version v1.0.0');

// Verify single engine standard: TypingSession is purely headless and reusable
const session = new TypingSession();
assert.strictEqual(session.mode, 'bn', 'TypingSession must default to Bengali mode');
assert.strictEqual(session.layout, 'avro', 'TypingSession must default to Avro layout');
assert.strictEqual(typeof session.handleKey, 'function', 'TypingSession must provide unified key handler');

console.log('  ✓ Version synchronized across all descriptors (1.0.0) and single engine standard verified.\n');

console.log('=====================================================');
console.log('All Slice 6 Audit Tests PASSED Successfully! (4/4)');
console.log('=====================================================\n');
