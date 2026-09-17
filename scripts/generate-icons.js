import electron from 'electron';
const { app, nativeImage } = electron;
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resourcesDir = path.resolve(__dirname, '../resources');

const LOGOS = [
  { name: 'icon', file: 'Matra Keyboard logo.png' },
  { name: 'icon-dark', file: 'Matra Keyboard logo black.png' },
  { name: 'icon-white', file: 'Matra Keyboard logo White.png' }
];

const SIZES = [16, 24, 32, 48, 64, 128, 256];

function createIco(images) {
  // images: array of { width, height, buffer }
  const count = images.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + (count * dirEntrySize);

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(count, 4); // Number of images

  const dirEntries = [];
  const buffers = [];

  for (const img of images) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.width === 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height === 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // Image size
    entry.writeUInt32LE(offset, 12); // Image data offset

    dirEntries.push(entry);
    buffers.push(img.buffer);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...buffers]);
}

app.whenReady().then(() => {
  try {
    for (const logo of LOGOS) {
      const srcPath = path.join(resourcesDir, logo.file);
      if (!fs.existsSync(srcPath)) {
        console.error(`Missing logo file: ${srcPath}`);
        continue;
      }

      console.log(`Processing ${logo.name} from ${logo.file}...`);
      const img = nativeImage.createFromPath(srcPath);
      const icoImages = [];

      for (const size of SIZES) {
        const resized = img.resize({ width: size, height: size, quality: 'best' });
        const pngBuf = resized.toPNG();
        icoImages.push({ width: size, height: size, buffer: pngBuf });

        // Also save primary logo individual PNGs for direct use in tray/taskbar
        if (logo.name === 'icon') {
          const pngPath = path.join(resourcesDir, `icon-${size}.png`);
          fs.writeFileSync(pngPath, pngBuf);
        }
      }

      const icoBuf = createIco(icoImages);
      const icoPath = path.join(resourcesDir, `${logo.name}.ico`);
      fs.writeFileSync(icoPath, icoBuf);
      console.log(`  ✓ Generated ${icoPath} (${icoBuf.length} bytes, ${icoImages.length} sizes)`);
    }

    console.log('All multi-resolution icons successfully created.');
  } catch (err) {
    console.error('Error generating icons:', err);
  } finally {
    app.quit();
  }
});
