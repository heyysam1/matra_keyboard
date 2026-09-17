// Matra Keyboard Electron Main Process
import electron from 'electron';
const { app, BrowserWindow } = electron;
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerIpcHandlers, loadSettings } from './ipcHandlers.js';
import { setupTray, destroyTray, getLogoNativeImage } from './tray.js';
import { registerAppShortcut, unregisterAllShortcuts } from './shortcutManager.js';
import { logger } from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Section 3 Non-Negotiable: Enforce single running instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  logger.warn('Another instance of Matra Keyboard is already running. Exiting secondary instance.');
  app.quit();
}

let mainWindow = null;

function createWindow() {
  const settings = loadSettings();
  const initialLogo = settings.activeLogo || 'orange';
  const icon = getLogoNativeImage(initialLogo);

  const isHiddenStart = process.argv.includes('--hidden');
  logger.info(`Initializing application window (hiddenStart=${isHiddenStart}, logo=${initialLogo})`);

  mainWindow = new BrowserWindow({
    width: 1148,
    height: 756,
    useContentSize: true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    show: !isHiddenStart,
    backgroundColor: '#07080b',
    backgroundMaterial: 'mica',
    icon: icon.isEmpty() ? undefined : icon,
    title: 'Matra Keyboard — মাত্রা কীবোর্ড',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  registerIpcHandlers(mainWindow);
  setupTray(mainWindow, initialLogo);

  // Close to tray behavior unless app is quitting
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      logger.info('Window minimized to tray.');
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.resolve(__dirname, '../../dist/index.html'));
  }
}

// Focus existing instance if secondary instance launches
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
    logger.info('Secondary instance detected, brought primary window to front.');
  }
});

app.whenReady().then(() => {
  logger.info(`Matra Keyboard starting up (v${app.getVersion()}, platform=${process.platform})`);
  createWindow();

  // Register saved shortcut
  const settings = loadSettings();
  const shortcutKey = settings.shortcut || 'ctrl-space';
  const regResult = registerAppShortcut(mainWindow, shortcutKey);
  if (!regResult.success) {
    logger.warn(`Default shortcut ${shortcutKey} registration failed: ${regResult.error}`);
  }

  if (process.env.MATRA_TEST_EXIT) {
    logger.info('Automated test exit requested, terminating cleanly.');
    setTimeout(() => {
      app.isQuitting = true;
      app.quit();
    }, 1000);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

// Clean shutdown handlers
app.on('before-quit', () => {
  logger.info('Initiating clean application shutdown.');
  app.isQuitting = true;
  unregisterAllShortcuts();
  destroyTray();
});

app.on('window-all-closed', () => {
  // On Windows, keep running in tray unless explicit quit
  if (process.platform !== 'win32' || app.isQuitting) {
    app.quit();
  }
});

// Process exception guards to guarantee clean state
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});
