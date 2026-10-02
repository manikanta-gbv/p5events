import type { MetadataRoute } from 'next';
import { getSettings, getTheme } from '@/lib/content';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  const { brand, location, seo } = getSettings();
  const theme = getTheme();

  return {
    name: `${brand.name} — ${brand.tagline} in ${location.city}`,
    short_name: brand.name,
    description: seo.defaultDescription,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'en-IN',
    dir: 'ltr',
    categories: ['lifestyle', 'shopping'],

    // The first screen is the dark hero, so matching it here avoids a flash
    // of cream between the splash and the page.
    background_color: theme.colors.ink,
    theme_color: theme.colors.ink,

    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // Android crops to its own shape; this one is full-bleed with the mark
      // inside the central safe zone so nothing important gets clipped.
      {
        src: '/icons/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
