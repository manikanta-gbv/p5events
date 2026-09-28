import type { MetadataRoute } from 'next';
import { getCategories, getPackages, getSettings } from '@/lib/content';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const { seo } = getSettings();
  const base = seo.siteUrl.replace(/\/$/, '');
  const now = new Date();

  const staticRoutes = ['', '/packages', '/occasions', '/gallery', '/about', '/contact'];

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}/`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
    })),
    ...getCategories().map((category) => ({
      url: `${base}/occasions/${category.slug}/`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...getPackages().map((pkg) => ({
      url: `${base}/packages/${pkg.slug}/`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
