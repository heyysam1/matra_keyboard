// Matra Keyboard — Build script for native helper binaries
// Compiles CaretDetector.cs into resources/bin/CaretDetector.exe using standard Windows csc.exe

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const srcPath = path.join(rootDir, 'src', 'main', 'native', 'CaretDetector.cs');
const outDir = path.join(rootDir, 'resources', 'bin');
const outPath = path.join(outDir, 'CaretDetector.exe');

// Check if running on Windows
if (process.platform !== 'win32') {
  console.log('[build-native] Non-Windows platform detected; skipping C# native helper compilation.');
  process.exit(0);
}

if (!fs.existsSync(srcPath)) {
  console.error(`[build-native] Source file not found: ${srcPath}`);
  process.exit(1);
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Locate csc.exe
const cscCandidates = [
  'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe',
  'C:\\Windows\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe'
];

let cscPath = cscCandidates.find((p) => fs.existsSync(p));

if (!cscPath) {
  // Check PATH
  try {
    const which = execFileSync('where', ['csc.exe'], { encoding: 'utf8' }).trim().split('\n')[0].trim();
    if (which && fs.existsSync(which)) {
      cscPath = which;
    }
  } catch (_e) {
    // csc not in PATH
  }
}

if (!cscPath) {
  console.warn('[build-native] Warning: csc.exe not found on system. Ensure .NET Framework 4.x is installed.');
  process.exit(0);
}

const wpfDir = path.join(path.dirname(cscPath), 'WPF');
const wpfArgs = fs.existsSync(wpfDir) ? [`/lib:${wpfDir}`] : [];

console.log(`[build-native] Compiling ${srcPath} using ${cscPath}...`);

try {
  execFileSync(cscPath, [
    '/target:winexe',
    '/optimize+',
    ...wpfArgs,
    '/reference:UIAutomationClient.dll',
    '/reference:UIAutomationTypes.dll',
    '/reference:WindowsBase.dll',
    `/out:${outPath}`,
    srcPath
  ], { stdio: 'inherit' });

  console.log(`[build-native] Successfully compiled: ${outPath} (${fs.statSync(outPath).size} bytes)`);
} catch (err) {
  console.error('[build-native] Compilation failed:', err.message);
  process.exit(1);
}
