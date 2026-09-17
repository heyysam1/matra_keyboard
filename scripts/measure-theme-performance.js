import electron from 'electron';
const { app, BrowserWindow, ipcMain } = electron;
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const THEMES = [
  { id: 'default', name: 'Signature Orange', blur: '24px', glow: 'Subtle Orange (rgba 249,115,22, 0.25)' },
  { id: 'oled',    name: 'Pure OLED Dark',   blur: '12px', glow: 'Minimal High-Contrast (rgba 255,255,255, 0.20)' },
  { id: 'nordic',  name: 'Nordic Light Blue', blur: '32px', glow: 'Heavy Frosted Ice (rgba 56,189,248, 0.30)' },
  { id: 'ivory',   name: 'Warm Ivory',       blur: '24px', glow: 'Paper Warmth (rgba 217,119,6, 0.25)' },
  { id: 'sunset',  name: 'Sunset Amber',     blur: '28px', glow: 'Deep Amber Ember (rgba 234,88,12, 0.35)' },
  { id: 'emerald', name: 'Emerald Neon',     blur: '24px', glow: 'Cyberpunk Slate (rgba 16,185,129, 0.30)' }
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.whenReady().then(async () => {
  console.log('================================================================');
  console.log('Matra Keyboard: Real Theme CPU & Memory Performance Measurement');
  console.log('================================================================\n');
  console.log(`OS: Windows (Platform: ${process.platform}, Arch: ${process.arch})`);
  console.log(`Node: ${process.versions.node}, Electron: ${process.versions.electron}, Chrome: ${process.versions.chrome}\n`);

  const win = new BrowserWindow({
    width: 1148,
    height: 756,
    useContentSize: true,
    resizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../src/preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  await win.loadFile(path.resolve(__dirname, '../dist/index.html'));
  win.show();

  // Allow initial startup scripts, fonts, and DOM layout to settle
  await sleep(2500);

  const results = [];

  for (const t of THEMES) {
    // Switch theme in renderer
    await win.webContents.executeJavaScript(`
      document.documentElement.setAttribute('data-theme', '${t.id}');
      localStorage.setItem('matra_theme_preset', '${t.id}');
    `);

    // Allow compositor / GPU rasterizer to settle for 2 seconds
    await sleep(2000);

    // Measure CPU usage over 2 seconds
    const startCpu = process.cpuUsage();
    const startTime = process.hrtime.bigint();
    await sleep(2000);
    const endCpu = process.cpuUsage(startCpu);
    const endTime = process.hrtime.bigint();

    const elapsedMicros = Number(endTime - startTime) / 1000;
    const totalCpuMicros = endCpu.user + endCpu.system;
    // Normalized CPU percentage across elapsed wall-clock time
    const cpuPercent = ((totalCpuMicros / elapsedMicros) * 100).toFixed(2);

    const memInfo = await process.getProcessMemoryInfo();
    const nodeMem = process.memoryUsage();

    const residentWorkingSetMB = (memInfo.residentSet / 1024).toFixed(1);
    const privateBytesMB = (memInfo.private / 1024).toFixed(1);
    const heapUsedMB = (nodeMem.heapUsed / (1024 * 1024)).toFixed(1);
    const heapTotalMB = (nodeMem.heapTotal / (1024 * 1024)).toFixed(1);

    results.push({
      theme: t.name,
      id: t.id,
      blur: t.blur,
      glow: t.glow,
      cpuPercent: `${cpuPercent}%`,
      privateWorkingSetMB: `${privateBytesMB} MB`,
      residentWorkingSetMB: `${residentWorkingSetMB} MB`,
      heapUsedMB: `${heapUsedMB} MB`,
      heapTotalMB: `${heapTotalMB} MB`
    });

    console.log(`[Theme: ${t.name.padEnd(18)}] CPU Idle: ${cpuPercent.padStart(5)}% | Private WS: ${privateBytesMB.padStart(5)} MB | Resident WS: ${residentWorkingSetMB.padStart(5)} MB | Heap: ${heapUsedMB.padStart(4)} MB`);
  }

  console.log('\n------------------------------------------------------------------------------------------------------');
  console.log('| Theme Preset       | Blur | Idle CPU (2s avg) | Private Working Set | Resident Working Set | Node Heap |');
  console.log('------------------------------------------------------------------------------------------------------');
  for (const r of results) {
    console.log(
      `| ${r.theme.padEnd(18)} | ${r.blur.padEnd(4)} | ${r.cpuPercent.padEnd(17)} | ${r.privateWorkingSetMB.padEnd(19)} | ${r.residentWorkingSetMB.padEnd(20)} | ${r.heapUsedMB.padEnd(9)} |`
    );
  }
  console.log('------------------------------------------------------------------------------------------------------\n');

  win.close();
  app.quit();
});
