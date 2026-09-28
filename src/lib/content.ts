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

function readJson(relativePath: string): unknown {
  const full = path.join(CONTENT_DIR, relativePath);
  try {
    return JSON.parse(fs.readFileSync(full, 'utf8'));
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

/** Memoise so a page that reads settings five times reads the file once. */
function once<T>(fn: () => T): () => T {
  let cached: { value: T } | null = null;
  return () => {
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
    return parsed.data;
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
