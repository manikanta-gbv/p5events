import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Builds the social share card (1200x630) from a real setup photo and the
 * logo. This is what appears when someone pastes the link into WhatsApp,
 * which for this business is most of how it will travel.
 *
 * No text is drawn: SVG text in sharp renders with whatever fonts the build
 * machine happens to have, and Fraunces is loaded from Google Fonts at
 * runtime rather than installed. The logo already carries the name.
 *
 * Run with `npm run og`.
 */

const ROOT = process.cwd();
const W = 1200;
const H = 630;

const theme = JSON.parse(await readFile(path.join(ROOT, 'content', 'theme.json'), 'utf8'));
const home = JSON.parse(await readFile(path.join(ROOT, 'content', 'pages', 'home.json'), 'utf8'));

const hero = home.sections.find((s) => s.type === 'hero');
const firstSlide = hero?.props?.slides?.[0]?.image;
if (!firstSlide) throw new Error('No hero slide found in content/pages/home.json');

const photo = path.join(ROOT, 'public', firstSlide.replace(/^\//, ''));
const logo = path.join(ROOT, 'public', 'images', 'brand', 'p5-logo-full.png');

const ink = theme.colors.ink;

// Same scrim as the hero, so the card and the page look like one thing.
const scrim = Buffer.from(
  `<svg width="${W}" height="${H}">
     <defs>
       <linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0%" stop-color="${ink}" stop-opacity="0.86"/>
         <stop offset="45%" stop-color="${ink}" stop-opacity="0.72"/>
         <stop offset="100%" stop-color="${ink}" stop-opacity="0.90"/>
       </linearGradient>
     </defs>
     <rect width="${W}" height="${H}" fill="url(#s)"/>
   </svg>`,
);

const logoWidth = 420;
const logoBuf = await sharp(logo).resize({ width: logoWidth }).png().toBuffer();
const logoMeta = await sharp(logoBuf).metadata();

const card = await sharp(photo)
  .resize(W, H, { fit: 'cover', position: 'attention' })
  .composite([
    { input: scrim, top: 0, left: 0 },
    {
      input: logoBuf,
      top: Math.round((H - (logoMeta.height ?? 0)) / 2),
      left: Math.round((W - logoWidth) / 2),
    },
  ])
  .jpeg({ quality: 86, progressive: true })
  .toBuffer();

const out = path.join(ROOT, 'public', 'images', 'brand', 'og-default.jpg');
await writeFile(out, card);

console.log(`og: ${W}x${H} from ${firstSlide} — ${Math.round(card.length / 1024)} KB`);
