import type { Metadata } from 'next';
import { getSettings, getTheme } from '@/lib/content';
import { ThemeVars } from '@/components/ThemeVars';
import { HeaderMount } from '@/components/layout/HeaderMount';
import './globals.css';

export function generateMetadata(): Metadata {
  const { seo, brand, location } = getSettings();

  return {
    metadataBase: new URL(seo.siteUrl),
    title: { default: seo.defaultTitle, template: seo.titleTemplate },
    description: seo.defaultDescription,
    openGraph: {
      type: 'website',
      siteName: brand.name,
      locale: 'en_IN',
      title: seo.defaultTitle,
      description: seo.defaultDescription,
    },
    twitter: { card: 'summary_large_image' },
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
