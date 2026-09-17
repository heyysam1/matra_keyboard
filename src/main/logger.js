// Matra Keyboard — Minimal Diagnostic Support Logger (Section 24A & Section 24 Privacy)
// Local file logging for support and troubleshooting. Strictly NO keystrokes or user typing content.

import electron from 'electron';
const { app } = electron;
import fs from 'node:fs';
import path from 'node:path';

let logFilePath = null;

function getLogPath() {
  if (!logFilePath) {
    try {
      const userData = app.getPath('userData');
      logFilePath = path.join(userData, 'matra.log');
    } catch (_e) {
      logFilePath = path.join(process.cwd(), 'matra.log');
    }
  }
  return logFilePath;
}

function writeEntry(level, message, meta = null) {
  try {
    const timestamp = new Date().toISOString();
    let line = `[${timestamp}] [${level}] ${message}`;
    if (meta && typeof meta === 'object') {
      try {
        line += ` ${JSON.stringify(meta)}`;
      } catch (_e) {}
    }
    line += '\n';

    const filePath = getLogPath();
    fs.appendFileSync(filePath, line, 'utf8');
  } catch (err) {
    console.error('[Logger Error]', err);
  }
}

export const logger = {
  info: (msg, meta) => {
    console.log(`[Matra] ${msg}`);
    writeEntry('INFO', msg, meta);
  },
  warn: (msg, meta) => {
    console.warn(`[Matra WARN] ${msg}`);
    writeEntry('WARN', msg, meta);
  },
  error: (msg, meta) => {
    console.error(`[Matra ERROR] ${msg}`);
    writeEntry('ERROR', msg, meta);
  },
  getLogPath
};
