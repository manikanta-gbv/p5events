import type { ReactNode } from 'react';
import type { z } from 'zod';
import { Hero } from './Hero';
import { SocialStrip } from './SocialStrip';
import {
  Areas,
  CategoryGrid,
  CtaBand,
  GalleryStrip,
  PackageGrid,
  Steps,
  TrustStrip,
} from './Blocks';
import {
  areasPropsSchema,
  categoryGridPropsSchema,
  ctaBandPropsSchema,
  galleryStripPropsSchema,
  heroPropsSchema,
  packageGridPropsSchema,
  socialStripPropsSchema,
  stepsPropsSchema,
  trustStripPropsSchema,
  type PageSection,
} from '@/lib/schema';

type Renderer = (props: unknown, key: string) => ReactNode;

/**
 * Binds a section component to the schema its props must satisfy. The props
 * come from JSON, so they are validated here rather than cast — a typo in
 * pages/home.json fails the build instead of rendering an empty section.
 */
function section<S extends z.ZodTypeAny>(
  schema: S,
  Component: (props: z.infer<S>) => ReactNode,
  type: string,
): Renderer {
  return (raw, key) => {
    const parsed = schema.safeParse(raw ?? {});
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((issue) => `  · ${issue.path.join('.') || '(root)'}: ${issue.message}`)
        .join('\n');
      throw new Error(`Section "${type}" in content/pages has invalid props:\n${issues}`);
    }
    return <Component key={key} {...parsed.data} />;
  };
}

/**
 * Maps a section `type` from content/pages/*.json to a component.
 * Reordering and hiding sections is configuration; adding a new kind of
 * section is a code change — that is the boundary.
 */
const REGISTRY: Record<string, Renderer> = {
  hero: section(heroPropsSchema, Hero, 'hero'),
  trustStrip: section(trustStripPropsSchema, TrustStrip, 'trustStrip'),
  categoryGrid: section(categoryGridPropsSchema, CategoryGrid, 'categoryGrid'),
  packageGrid: section(packageGridPropsSchema, PackageGrid, 'packageGrid'),
  steps: section(stepsPropsSchema, Steps, 'steps'),
  galleryStrip: section(galleryStripPropsSchema, GalleryStrip, 'galleryStrip'),
  socialStrip: section(socialStripPropsSchema, SocialStrip, 'socialStrip'),
  areas: section(areasPropsSchema, Areas, 'areas'),
  ctaBand: section(ctaBandPropsSchema, CtaBand, 'ctaBand'),
};

export function renderSections(sections: PageSection[]): ReactNode[] {
  return sections.map((entry, index) => {
    const render = REGISTRY[entry.type];

    // An unrecognised type renders nothing rather than crashing the page,
    // so a stale config can never take the site down.
    if (!render) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Unknown section type "${entry.type}" — skipped.`);
      }
      return null;
    }

    return render(entry.props, `${entry.type}-${index}`);
  });
}

export const knownSectionTypes = Object.keys(REGISTRY);
