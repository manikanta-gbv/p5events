import fs from 'node:fs';
import path from 'node:path';
import type { Config } from 'tailwindcss';

/**
 * The palette, type and radii come from content/theme.json, so a colour
 * exists in exactly one place in the repository. Rebranding is one edit.
 */
const theme = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'content', 'theme.json'), 'utf8'),
) as {
  colors: Record<string, string>;
  fonts: { display: { family: string; fallback: string }; body: { family: string; fallback: string } };
  radii: Record<string, string>;
};

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: theme.colors,
      borderRadius: theme.radii,
      fontFamily: {
        display: [`'${theme.fonts.display.family}'`, ...theme.fonts.display.fallback.split(', ')],
        body: [`'${theme.fonts.body.family}'`, ...theme.fonts.body.fallback.split(', ')],
      },
      maxWidth: {
        shell: '1280px',
      },
    },
  },
  plugins: [],
};

export default config;
