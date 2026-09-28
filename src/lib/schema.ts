import { z } from 'zod';

/**
 * Every content file is parsed through these schemas during the build.
 * A malformed price, a missing image or a category slug that does not exist
 * fails the build rather than shipping a broken page.
 */

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be a lowercase kebab-case slug');

const imagePath = z
  .string()
  .min(1)
  .regex(/^\/images\//, 'must be a path under /images/');

const href = z.string().min(1);

export const linkSchema = z.object({
  label: z.string().min(1),
  href,
});

export const themeSchema = z.object({
  name: z.string(),
  colors: z.record(z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'must be a 6-digit hex colour')),
  fonts: z.object({
    display: z.object({
      family: z.string(),
      fallback: z.string(),
      googleFontsQuery: z.string(),
    }),
    body: z.object({
      family: z.string(),
      fallback: z.string(),
      googleFontsQuery: z.string(),
    }),
  }),
  radii: z.record(z.string()),
  hero: z.object({
    slideSeconds: z.number().min(2).max(30),
    fadeMs: z.number().min(0).max(5000),
    kenBurns: z.boolean(),
    kenBurnsScale: z.number().min(1).max(1.5),
  }),
});

export const settingsSchema = z.object({
  brand: z.object({
    name: z.string().min(1),
    shortName: z.string().min(1),
    wordmark: z.string().min(1),
    tagline: z.string().min(1),
    logoMark: imagePath,
    logoFull: imagePath,
  }),
  location: z.object({
    city: z.string().min(1),
    region: z.string().min(1),
    country: z.string().length(2),
    addressLine: z.string(),
    postalCode: z.string(),
  }),
  contact: z.object({
    phone: z.string().min(1),
    phoneAlt: z.string().optional(),
    email: z.string().email(),
    // Digits only, with country code — drives the prefilled wa.me deep links.
    whatsappNumber: z.string().regex(/^\d{10,15}$/, 'digits only, including country code'),
    whatsappBusinessUrl: z.string().url().optional().or(z.literal('')),
  }),
  social: z.object({
    instagram: z.string().url().or(z.literal('')),
    youtube: z.string().url().or(z.literal('')),
    googleBusiness: z.string().url().or(z.literal('')),
  }),
  proof: z.object({
    yearsTrading: z.string(),
    setupsCompleted: z.string(),
    foundedYear: z.string(),
  }),
  booking: z.object({
    mode: z.enum(['whatsapp']),
    messageTemplate: z.string().min(1),
    genericTemplate: z.string().min(1),
    slots: z.array(z.string().min(1)).min(1),
  }),
  filters: z.object({
    venues: z.array(z.object({ slug, label: z.string().min(1) })).min(1),
    palettes: z
      .array(
        z.object({
          slug,
          label: z.string().min(1),
          swatch: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        }),
      )
      .min(1),
    budgetMin: z.number().int().positive(),
    budgetMax: z.number().int().positive(),
  }),
  currency: z.object({
    code: z.string().min(1),
    symbol: z.string().min(1),
    locale: z.string().min(1),
  }),
  seo: z.object({
    titleTemplate: z.string().includes('%s'),
    defaultTitle: z.string().min(1),
    defaultDescription: z.string().min(1),
    siteUrl: z.string().url(),
    ogImage: z.string().min(1),
  }),
});

export const navigationSchema = z.object({
  header: z.array(linkSchema).min(1),
  headerCta: z.object({ label: z.string().min(1), icon: z.string().min(1) }),
  footer: z
    .array(z.object({ heading: z.string().min(1), links: z.array(linkSchema).min(1) }))
    .min(1),
  legal: z.array(linkSchema),
});

export const categorySchema = z.object({
  slug,
  name: z.string().min(1),
  blurb: z.string().min(1),
  image: imagePath,
  imageAlt: z.string().min(1),
  order: z.number().int().nonnegative(),
  published: z.boolean(),
});

export const categoriesSchema = z.object({ categories: z.array(categorySchema).min(1) });

export const packageSchema = z
  .object({
    slug,
    title: z.string().min(1),
    category: slug,
    price: z.number().int().positive(),
    strikePrice: z.number().int().positive().optional(),
    summary: z.string().min(1),
    images: z.array(imagePath).min(1),
    imageAlt: z.string().min(1),
    inclusions: z.array(z.string().min(1)).min(1),
    venues: z.array(slug).min(1),
    palette: z.array(slug).min(1),
    setupHours: z.number().positive(),
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
  })
  .refine((p) => p.strikePrice === undefined || p.strikePrice > p.price, {
    message: 'strikePrice must be greater than price',
    path: ['strikePrice'],
  });

export const addonsSchema = z.object({
  addons: z
    .array(z.object({ slug, title: z.string().min(1), price: z.number().int().positive() }))
    .min(1),
});

export const areasSchema = z.object({
  note: z.string().optional(),
  areas: z.array(z.object({ slug, name: z.string().min(1) })).min(1),
});

export const faqsSchema = z.object({
  faqs: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).min(1),
});

export const gallerySchema = z.object({
  items: z
    .array(z.object({ image: imagePath, alt: z.string().min(1), category: slug }))
    .min(1),
});

export const videosSchema = z.object({
  note: z.string().optional(),
  channelId: z.string().optional(),
  videos: z
    .array(
      z.object({
        id: z.string().regex(/^[A-Za-z0-9_-]{11}$/, 'must be an 11-character YouTube video id'),
        label: z.string().min(1),
      }),
    )
    .default([]),
});

export const pageSchema = z.object({
  sections: z
    .array(
      z.object({
        type: z.string().min(1),
        props: z.record(z.unknown()).optional(),
      }),
    )
    .min(1),
});

export type Theme = z.infer<typeof themeSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type Navigation = z.infer<typeof navigationSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Package = z.infer<typeof packageSchema>;
export type Addon = z.infer<typeof addonsSchema>['addons'][number];
export type Area = z.infer<typeof areasSchema>['areas'][number];
export type Faq = z.infer<typeof faqsSchema>['faqs'][number];
export type GalleryItem = z.infer<typeof gallerySchema>['items'][number];
export type PageSection = z.infer<typeof pageSchema>['sections'][number];
export type Link = z.infer<typeof linkSchema>;
export type Video = z.infer<typeof videosSchema>['videos'][number];

/* -------------------------------------------------------------------
 * Section props. Each section type in content/pages/*.json is validated
 * against its own schema, so a typo there fails the build rather than
 * rendering a section with missing text.
 * ----------------------------------------------------------------- */

const ctaSchema = z.object({ label: z.string().min(1), href });

export const heroPropsSchema = z.object({
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  sub: z.string().min(1),
  primaryCta: ctaSchema,
  secondaryCta: ctaSchema,
  slides: z.array(z.object({ image: imagePath, alt: z.string().min(1) })).min(1),
});

export const trustStripPropsSchema = z.object({
  items: z
    .array(
      z.object({
        icon: z.string().min(1),
        title: z.string().min(1),
        sub: z.string().min(1),
      }),
    )
    .min(1),
});

export const categoryGridPropsSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().min(1),
  linkLabel: z.string().optional(),
  linkHref: z.string().optional(),
});

export const packageGridPropsSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().min(1),
  filter: z.enum(['featured', 'all']).optional(),
  limit: z.number().int().positive().optional(),
});

export const stepsPropsSchema = z.object({
  heading: z.string().min(1),
  steps: z
    .array(z.object({ title: z.string().min(1), body: z.string().min(1) }))
    .min(1),
});

export const galleryStripPropsSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().min(1),
  linkLabel: z.string().optional(),
  linkHref: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const areasPropsSchema = z.object({ heading: z.string().min(1) });

export const socialStripPropsSchema = z.object({
  eyebrow: z.string().optional(),
  heading: z.string().min(1),
  body: z.string().optional(),
});

export const ctaBandPropsSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
  image: imagePath,
  imageAlt: z.string().min(1),
});
