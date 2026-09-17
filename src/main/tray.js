// Matra Keyboard Windows System Tray Integration
import electron from 'electron';
const { Tray, Menu, nativeImage, app } = electron;
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let tray = null;

let currentTrayState = {
  mode: 'bn', // 'bn' | 'en'
  layout: 'avro', // 'avro' | 'bijoy' | 'probhat'
  soundEnabled: true
};

function buildContextMenu(mainWindow) {
  const isBn = currentTrayState.mode === 'bn';

  return Menu.buildFromTemplate([
    {
      label: 'কিবোর্ড ইন্টারফেস খুলুন (Open Window)',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: 'ভার্চুয়াল লেআউট ভিউয়ার (Layout Viewer)',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('tray:action', { type: 'open-viewer' });
        }
      },
    },
    { type: 'separator' },
    {
      label: 'বাংলা মোড (Bengali Mode)',
      type: 'radio',
      checked: isBn,
      click: () => {
        currentTrayState.mode = 'bn';
        updateTrayMenu(mainWindow);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('tray:action', { type: 'mode', value: 'bn' });
        }
      },
    },
    {
      label: 'English Mode',
      type: 'radio',
      checked: !isBn,
      click: () => {
        currentTrayState.mode = 'en';
        updateTrayMenu(mainWindow);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('tray:action', { type: 'mode', value: 'en' });
        }
      },
    },
    { type: 'separator' },
    {
      label: 'সক্রিয় লেআউট (Active Layout)',
      submenu: [
        {
          label: 'Avro Phonetic (অভ্র ফোনেটিক)',
          type: 'radio',
          checked: currentTrayState.layout === 'avro',
          click: () => {
            currentTrayState.layout = 'avro';
            updateTrayMenu(mainWindow);
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('tray:action', { type: 'layout', value: 'avro' });
            }
          },
        },
        {
          label: 'Bijoy Classic (জাতীয় / বিজয় ক্লাসিক)',
          type: 'radio',
          checked: currentTrayState.layout === 'bijoy',
          click: () => {
            currentTrayState.layout = 'bijoy';
            updateTrayMenu(mainWindow);
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('tray:action', { type: 'layout', value: 'bijoy' });
            }
          },
        },
        {
          label: 'Probhat (প্রভাত)',
          type: 'radio',
          checked: currentTrayState.layout === 'probhat',
          click: () => {
            currentTrayState.layout = 'probhat';
            updateTrayMenu(mainWindow);
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('tray:action', { type: 'layout', value: 'probhat' });
            }
          },
        },
      ],
    },
    { type: 'separator' },
    {
      label: 'টাইপিং সাউন্ড (Sound Effects)',
      type: 'checkbox',
      checked: currentTrayState.soundEnabled,
      click: (menuItem) => {
        currentTrayState.soundEnabled = menuItem.checked;
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('tray:action', { type: 'sound', value: menuItem.checked });
        }
      },
    },
    {
      label: 'কাস্টম ডিকশনারি (Dictionary)',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('tray:action', { type: 'tab', value: 'dict' });
        }
      },
    },
    {
      label: 'সেটিংস (Settings)',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('tray:action', { type: 'tab', value: 'settings' });
        }
      },
    },
    { type: 'separator' },
    {
      label: 'অ্যাপ বন্ধ করুন (Quit)',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);
}

function updateTrayMenu(mainWindow) {
  if (!tray || tray.isDestroyed()) return;
  const menu = buildContextMenu(mainWindow);
  tray.setContextMenu(menu);

  const modeText = currentTrayState.mode === 'bn' ? 'বাংলা' : 'English';
  const layoutText = currentTrayState.layout === 'avro' ? 'Avro' : currentTrayState.layout === 'bijoy' ? 'Bijoy' : 'Probhat';
  tray.setToolTip(`Matra Keyboard — ${modeText} (${layoutText})`);
}

const LOGO_FILES = {
  orange: 'Matra Keyboard logo.png',
  dark: 'Matra Keyboard logo black.png',
  white: 'Matra Keyboard logo White.png'
};

const LOGO_ICO_FILES = {
  orange: 'icon.ico',
  dark: 'icon-dark.ico',
  white: 'icon-white.ico'
};

export function getLogoIconPath(logoKey = 'orange') {
  const file = LOGO_FILES[logoKey] || LOGO_FILES.orange;
  return path.resolve(__dirname, '../../resources', file);
}

export function getLogoIcoPath(logoKey = 'orange') {
  const file = LOGO_ICO_FILES[logoKey] || LOGO_ICO_FILES.orange;
  return path.resolve(__dirname, '../../resources', file);
}

export function getLogoNativeImage(logoKey = 'orange', size = null) {
  const icoPath = getLogoIcoPath(logoKey);
  let img = nativeImage.createEmpty();
  if (fs.existsSync(icoPath)) {
    img = nativeImage.createFromPath(icoPath);
  }
  if (img.isEmpty()) {
    const iconPath = getLogoIconPath(logoKey);
    img = nativeImage.createFromPath(iconPath);
  }
  if (!img.isEmpty() && size) {
    img = img.resize(size);
  }
  return img;
}

export function updateTrayIcon(logoKey) {
  if (!tray || tray.isDestroyed()) return;
  // System tray icon explicitly sized to 16x16 / 32x32 for Windows taskbar notification area
  const icon = getLogoNativeImage(logoKey, { width: 16, height: 16 });
  tray.setImage(icon);
}

export function setupTray(mainWindow, initialLogo = 'orange') {
  if (tray) return tray;

  const icon = getLogoNativeImage(initialLogo, { width: 16, height: 16 });
  tray = new Tray(icon);
  updateTrayMenu(mainWindow);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  return tray;
}

export function updateTrayState(mainWindow, partialState) {
  if (!partialState) return;
  if (partialState.mode !== undefined) currentTrayState.mode = partialState.mode;
  if (partialState.layout !== undefined) currentTrayState.layout = partialState.layout;
  if (partialState.soundEnabled !== undefined) currentTrayState.soundEnabled = partialState.soundEnabled;
  updateTrayMenu(mainWindow);
}

export function destroyTray() {
  if (tray && !tray.isDestroyed()) {
    tray.destroy();
    tray = null;
  }
}
