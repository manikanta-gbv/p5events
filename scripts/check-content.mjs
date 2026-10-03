import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Catches the content mistakes the Zod schemas cannot see, before the build
 * wastes two minutes failing further in.
 *
 *   1. Image paths that point at a file which is not there. The schema only
 *      checks the string looks like a path.
 *   2. Invisible characters. The loader strips these so they cannot break a
 *      build, but they still want reporting — an image uploaded with a word
 *      joiner in its filename only resolves while the reference carries the
 *      same invisible character, which is a trap waiting to spring.
 *   3. Package slugs that disagree with their filename, which produces a URL
 *      nobody expects.
 */

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content');
const PUBLIC = path.join(ROOT, 'public');

const INVISIBLE = {
  0x200b: 'ZERO WIDTH SPACE',
  0x200c: 'ZERO WIDTH NON-JOINER',
  0x200d: 'ZERO WIDTH JOINER',
  0x200e: 'LEFT-TO-RIGHT MARK',
  0x200f: 'RIGHT-TO-LEFT MARK',
  0x2060: 'WORD JOINER',
  0xfeff: 'ZERO WIDTH NO-BREAK SPACE',
  0x00ad: 'SOFT HYPHEN',
};

const errors = [];
const warnings = [];

async function jsonFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await jsonFiles(full)));
    else if (entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}

function walkStrings(value, visit, trail = []) {
  if (typeof value === 'string') return visit(value, trail.join('.'));
  if (Array.isArray(value)) {
    value.forEach((v, i) => walkStrings(v, visit, [...trail, String(i)]));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) walkStrings(v, visit, [...trail, k]);
  }
}

const files = await jsonFiles(CONTENT);

for (const file of files) {
  const rel = path.relative(ROOT, file);
  const raw = await readFile(file, 'utf8');

  // Invisible characters, reported against the raw text so the position is real
  for (let i = 0; i < raw.length; i += 1) {
    const name = INVISIBLE[raw.codePointAt(i)];
    if (name) {
      const near = raw.slice(Math.max(0, i - 30), i + 30).replace(/\s+/g, ' ');
      warnings.push(`${rel}: ${name} (U+${raw.codePointAt(i).toString(16).toUpperCase()}) near "…${near}…"`);
    }
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    errors.push(`${rel}: not valid JSON — ${e.message}`);
    continue;
  }

  // Every /images/... reference must resolve to a real file
  walkStrings(data, (value, where) => {
    if (!value.startsWith('/images/')) return;
    if (!existsSync(path.join(PUBLIC, value))) {
      errors.push(`${rel} → ${where}: image not found at public${value}`);
    }
  });

  // The filename drives the URL, so a stale slug field is misleading rather
  // than broken — worth saying, not worth blocking a deploy over. Compared
  // with invisible characters removed, since those are stripped on read.
  if (rel.includes(`packages${path.sep}`) && data.slug) {
    const expected = path.basename(file, '.json');
    const clean = String(data.slug).replace(/[\u200B-\u200F\u2060\uFEFF\u00AD]/g, '');
    if (clean !== expected) {
      warnings.push(
        `${rel}: slug field is "${clean}" but the filename is "${expected}". ` +
          `The page is served at /packages/${expected}/ — the field is ignored.`,
      );
    }
  }
}

if (warnings.length) {
  console.warn(`\ncontent: ${warnings.length} thing(s) worth a look —`);
  warnings.forEach((w) => console.warn(`  · ${w}`));
  console.warn('  None of these stop the build. Invisible characters are removed');
  console.warn('  when content is read; a stale slug field is simply ignored.\n');
}

if (errors.length) {
  console.error(`\ncontent: ${errors.length} problem(s) —`);
  errors.forEach((e) => console.error(`  · ${e}`));
  console.error('');
  process.exit(1);
}

console.log(`content: ${files.length} files checked, no problems`);
