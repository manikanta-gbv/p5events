import type { Metadata, Viewport } from 'next';
import { getSettings, getSiteUrl, getTheme } from '@/lib/content';
import { ThemeVars } from '@/components/ThemeVars';
import { HeaderMount } from '@/components/layout/HeaderMount';
import './globals.css';

/** Colours the browser chrome on Android and the iOS status bar. */
export function generateViewport(): Viewport {
  return { themeColor: getTheme().colors.ink };
}

export function generateMetadata(): Metadata {
  const { seo, brand, location } = getSettings();

  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: seo.defaultTitle, template: seo.titleTemplate },
    description: seo.defaultDescription,
    openGraph: {
      type: 'website',
      siteName: brand.name,
      locale: 'en_IN',
      url: getSiteUrl(),
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      // Without this, a link pasted into WhatsApp shows no picture at all.
      images: [
        { url: seo.ogImage, width: 1200, height: 630, alt: seo.defaultTitle },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      images: [seo.ogImage],
    },
    alternates: { canonical: '/' },
    other: { 'geo.placename': location.city },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = getTheme();
  const fontQuery = [theme.fonts.display.googleFontsQuery, theme.fonts.body.googleFontsQuery]
    .map((q) => `family=${q}`)
    .join('&');

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?${fontQuery}&display=swap`}
        />
        <ThemeVars />
      </head>
      <body>
        <HeaderMount />
        {children}
      </body>
    </html>
  );
}
