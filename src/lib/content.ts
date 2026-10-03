import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import {
  addonsSchema,
  areasSchema,
  categoriesSchema,
  faqsSchema,
  gallerySchema,
  navigationSchema,
  packageSchema,
  pageSchema,
  settingsSchema,
  themeSchema,
  videosSchema,
  type Category,
  type Package,
} from './schema';

const CONTENT_DIR = path.join(process.cwd(), 'content');

/**
 * Zero-width and invisible formatting characters. These ride along invisibly
 * when text is pasted from WhatsApp, Word or a web page, and they are never
 * intentional in content. Left in place they break slugs and image paths
 * while the value still looks perfect on screen — a word joiner in a slug
 * once failed a deploy with "must be a lowercase kebab-case slug" against a
 * slug that read exactly right.
 */
const INVISIBLE = /[\u200B-\u200F\u2060\uFEFF\u00AD]/g;

function deepClean(value: unknown): unknown {
  if (typeof value === 'string') return value.replace(INVISIBLE, '');
  if (Array.isArray(value)) return value.map(deepClean);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, deepClean(v)]),
    );
  }
  return value;
}

function readJson(relativePath: string): unknown {
  const full = path.join(CONTENT_DIR, relativePath);
  try {
    return deepClean(JSON.parse(fs.readFileSync(full, 'utf8')));
  } catch (error) {
    throw new Error(
      `Could not read content/${relativePath}: ${(error as Error).message}`,
    );
  }
}

function parse<T extends z.ZodTypeAny>(
  schema: T,
  relativePath: string,
): z.infer<T> {
  const result = schema.safeParse(readJson(relativePath));
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  · ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`content/${relativePath} is not valid:\n${issues}`);
  }
  return result.data;
}

/**
 * Memoise so a page that reads settings five times reads the file once.
 *
 * Skipped in development: the cache lives for the life of the process, so
 * without this an edit to content/ does not show up until the dev server is
 * restarted, which is a confusing way to lose ten minutes.
 */
function once<T>(fn: () => T): () => T {
  let cached: { value: T } | null = null;
  return () => {
    if (process.env.NODE_ENV === 'development') return fn();
    if (!cached) cached = { value: fn() };
    return cached.value;
  };
}

export const getTheme = once(() => parse(themeSchema, 'theme.json'));
export const getSettings = once(() => parse(settingsSchema, 'settings.json'));
export const getNavigation = once(() => parse(navigationSchema, 'navigation.json'));
export const getAddons = once(() => parse(addonsSchema, 'addons.json').addons);
export const getAreas = once(() => parse(areasSchema, 'areas.json').areas);
export const getFaqs = once(() => parse(faqsSchema, 'faqs.json').faqs);
export const getGallery = once(() => parse(gallerySchema, 'gallery.json').items);
export const getVideos = once(() => parse(videosSchema, 'videos.json'));

export const getCategories = once((): Category[] =>
  parse(categoriesSchema, 'categories.json')
    .categories.filter((c) => c.published)
    .sort((a, b) => a.order - b.order),
);

export const getPackages = once((): Package[] => {
  const dir = path.join(CONTENT_DIR, 'packages');
  const files = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
    : [];

  const packages = files.map((file) => {
    const parsed = packageSchema.safeParse(readJson(path.join('packages', file)));
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((issue) => `  · ${issue.path.join('.') || '(root)'}: ${issue.message}`)
        .join('\n');
      throw new Error(`content/packages/${file} is not valid:\n${issues}`);
    }
    // The filename is authoritative. A slug field edited in the CMS used to
    // diverge from it silently, producing a URL nobody expected — or a build
    // failure days later.
    return { ...parsed.data, slug: path.basename(file, '.json') };
  });

  // Referential integrity: a package pointing at a category that does not
  // exist would render into a listing nobody can reach.
  const categorySlugs = new Set(getCategories().map((c) => c.slug));
  const settings = getSettings();
  const venueSlugs = new Set(settings.filters.venues.map((v) => v.slug));
  const paletteSlugs = new Set(settings.filters.palettes.map((p) => p.slug));

  for (const pkg of packages) {
    if (!categorySlugs.has(pkg.category)) {
      throw new Error(
        `content/packages/${pkg.slug}.json references unknown category "${pkg.category}"`,
      );
    }
    for (const venue of pkg.venues) {
      if (!venueSlugs.has(venue)) {
        throw new Error(
          `content/packages/${pkg.slug}.json references unknown venue "${venue}"`,
        );
      }
    }
    for (const palette of pkg.palette) {
      if (!paletteSlugs.has(palette)) {
        throw new Error(
          `content/packages/${pkg.slug}.json references unknown palette "${palette}"`,
        );
      }
    }
  }

  const duplicates = packages
    .map((p) => p.slug)
    .filter((slug, i, all) => all.indexOf(slug) !== i);
  if (duplicates.length) {
    throw new Error(`Duplicate package slugs: ${duplicates.join(', ')}`);
  }

  return packages.filter((p) => p.published).sort((a, b) => a.price - b.price);
});

export const getHomePage = once(() => parse(pageSchema, 'pages/home.json'));
export const getGalleryPage = once(() => parse(pageSchema, 'pages/gallery.json'));

/**
 * The site's absolute URL — canonicals, the sitemap, robots and JSON-LD all
 * build on it.
 *
 * Prefers SITE_URL from the build environment, falling back to
 * seo.siteUrl in settings.json. Moving to a custom domain is then one
 * environment variable in the host's build settings: no code change, no
 * content edit, and preview deployments can point at themselves.
 */
export const getSiteUrl = once((): string => {
  const raw = (process.env.SITE_URL || '').trim() || getSettings().seo.siteUrl;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(
      `Site URL is not a valid absolute URL: "${raw}".\n` +
        '  Set SITE_URL in the build environment, or fix seo.siteUrl in content/settings.json.',
    );
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(`Site URL must be http or https, got "${url.protocol}" in "${raw}".`);
  }

  // Origin only — every caller appends its own path.
  return url.origin;
});

export function getPackage(slug: string): Package | undefined {
  return getPackages().find((p) => p.slug === slug);
}

export function getCategory(slug: string): Category | undefined {
  return getCategories().find((c) => c.slug === slug);
}

export function getPackagesByCategory(categorySlug: string): Package[] {
  return getPackages().filter((p) => p.category === categorySlug);
}

/** Lowest price in a category, for the "from ₹x" label on category tiles. */
export function getCategoryFromPrice(categorySlug: string): number | null {
  const prices = getPackagesByCategory(categorySlug).map((p) => p.price);
  return prices.length ? Math.min(...prices) : null;
}
