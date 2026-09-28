import { readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * A static export does not get a hosted image optimiser, so responsive
 * variants are produced here at build time instead. Source images are
 * already WebP (the CMS converts on upload); this adds narrower widths for
 * phones, which is where almost all of the traffic is.
 */

const ROOT = process.cwd();
const IMAGES = path.join(ROOT, 'public', 'images');
const WIDTHS = [640, 1024];
const SKIP_DIRS = new Set(['brand']);
const MAX_SOURCE_BYTES = 400 * 1024;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      files.push(...(await walk(full)));
    } else if (/\.(webp|jpe?g|png)$/i.test(entry.name) && !/-\d+w\.webp$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  if (!existsSync(IMAGES)) {
    console.log('images: no public/images directory, nothing to do');
    return;
  }

  let sharp;
  try {
    ({ default: sharp } = await import('sharp'));
  } catch {
    console.warn('images: sharp is not installed, skipping variant generation');
    return;
  }

  const files = await walk(IMAGES);
  let written = 0;
  const oversized = [];

  for (const file of files) {
    const info = await stat(file);
    if (info.size > MAX_SOURCE_BYTES) {
      oversized.push(`${path.relative(ROOT, file)} (${Math.round(info.size / 1024)} KB)`);
    }

    const image = sharp(file);
    const meta = await image.metadata();
    const base = file.replace(/\.(webp|jpe?g|png)$/i, '');

    for (const width of WIDTHS) {
      if (!meta.width || meta.width <= width) continue;
      const out = `${base}-${width}w.webp`;
      if (existsSync(out)) continue;
      await sharp(file).resize({ width }).webp({ quality: 78 }).toFile(out);
      written += 1;
    }
  }

  console.log(`images: ${files.length} source images, ${written} variants written`);

  // The size gate from the architecture: catches a large phone upload that
  // slipped past the CMS transform, before it is permanent in git history.
  if (oversized.length) {
    console.error(
      `\nimages: ${oversized.length} file(s) exceed ${MAX_SOURCE_BYTES / 1024} KB:\n` +
        oversized.map((f) => `  · ${f}`).join('\n') +
        '\nCompress these before committing.\n',
    );
    if (process.env.CI) process.exit(1);
  }
}

main().catch((error) => {
  console.error('images: failed —', error.message);
  process.exit(1);
});
