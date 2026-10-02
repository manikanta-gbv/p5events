import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Builds every icon from the single logo mark.
 *
 * The mark is gold and white on transparent, so it would disappear against a
 * light browser tab. Everything here composites it onto the ink background
 * from theme.json, which makes each icon self-contained.
 *
 * Run with `npm run icons` after changing the logo.
 */

const ROOT = process.cwd();
const APP = path.join(ROOT, 'src', 'app');
const PWA = path.join(ROOT, 'public', 'icons');

const theme = JSON.parse(await readFile(path.join(ROOT, 'content', 'theme.json'), 'utf8'));
const INK = theme.colors.ink;

const markPath = path.join(ROOT, 'public', 'images', 'brand', 'p5-logo-mark.png');
const mark = await readFile(markPath);

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, alpha: 1 };
}

/**
 * @param size   output square size
 * @param inset  fraction of the tile left as padding on each side
 * @param radius corner radius as a fraction of size; 0 = square
 * @param source the artwork to place
 */
async function tile(size, { inset = 0.12, radius = 0.22, source = mark } = {}) {
  const inner = Math.round(size * (1 - inset * 2));
  const art = await sharp(source).resize(inner, inner, { fit: 'contain' }).png().toBuffer();
  const offset = Math.round((size - inner) / 2);

  const layers = [{ input: art, top: offset, left: offset }];

  if (radius > 0) {
    const r = Math.round(size * radius);
    layers.push({
      input: Buffer.from(
        `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#fff"/></svg>`,
      ),
      blend: 'dest-in',
    });
  }

  return sharp({
    create: { width: size, height: size, channels: 4, background: hexToRgb(INK) },
  })
    .composite(layers)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/** Crop to the white "P5" lettering — the wreath is mush below about 40px. */
async function lettering() {
  const { data, info } = await sharp(mark).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width, maxX = 0, minY = info.height, maxY = 0;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const i = (y * info.width + x) * info.channels;
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      const neutral = Math.max(r, g, b) - Math.min(r, g, b) < 28;
      if (a > 120 && Math.min(r, g, b) > 200 && neutral) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const cx = Math.round((minX + maxX) / 2);
  const cy = Math.round((minY + maxY) / 2);
  const half = Math.round((Math.max(maxX - minX, maxY - minY) / 2) * 1.1);
  const left = Math.max(0, cx - half);
  const top = Math.max(0, cy - half);
  const width = Math.min(info.width - left, half * 2);
  const height = Math.min(info.height - top, half * 2);
  return sharp(mark).extract({ left, top, width, height }).png().toBuffer();
}

/**
 * ICO is a header plus PNG blobs. Writing it directly is the only way to put
 * different artwork at different sizes — image libraries resize one source
 * for every entry.
 */
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const dir = [];
  let offset = 6 + 16 * entries.length;
  for (const { size, buffer } of entries) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(buffer.length, 8);
    e.writeUInt32LE(offset, 12);
    dir.push(e);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...dir, ...entries.map((e) => e.buffer)]);
}

await mkdir(PWA, { recursive: true });
const p5 = await lettering();

const ico = buildIco([
  { size: 16, buffer: await tile(16, { source: p5, inset: 0.08 }) },
  { size: 32, buffer: await tile(32, { source: p5, inset: 0.08 }) },
  { size: 48, buffer: await tile(48) },
  { size: 64, buffer: await tile(64) },
]);
await writeFile(path.join(APP, 'favicon.ico'), ico);

await writeFile(path.join(APP, 'icon.png'), await tile(256));
// iOS applies its own mask, so this one stays square.
await writeFile(path.join(APP, 'apple-icon.png'), await tile(180, { inset: 0.1, radius: 0 }));

await writeFile(path.join(PWA, 'icon-192.png'), await tile(192));
await writeFile(path.join(PWA, 'icon-512.png'), await tile(512));
// Maskable: Android crops to its own shape, so the art must sit inside the
// central 80% safe zone and the background must run edge to edge.
await writeFile(path.join(PWA, 'maskable-512.png'), await tile(512, { inset: 0.22, radius: 0 }));

console.log('icons: favicon.ico (16/32/48/64), icon.png, apple-icon.png, 192, 512, maskable-512');
