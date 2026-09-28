import type { Metadata } from 'next';
import Image from 'next/image';
import { getCategories, getGallery, getGalleryPage, getSettings } from '@/lib/content';
import { renderSections } from '@/components/sections/registry';
import { PageShell } from '@/components/layout/PageShell';

export function generateMetadata(): Metadata {
  const { location, brand } = getSettings();
  return {
    title: `Our work in ${location.city}`,
    description: `Recent balloon décor, backdrops and stage setups by ${brand.name} across ${location.city}.`,
    alternates: { canonical: '/gallery/' },
  };
}

export default function GalleryPage() {
  const items = getGallery();
  const categories = getCategories();
  const nameFor = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <PageShell
      crumbs={[
        { name: 'Home', href: '/' },
        { name: 'Our work', href: '/gallery' },
      ]}
    >
      <div className="mx-auto max-w-shell px-5 pb-16 pt-3 md:px-14">
        <h1 className="text-[30px] tracking-tight md:text-[40px]">Our work</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-body">
          Every photograph here is a setup we built. Send us one you like and we will
          match it to your space.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <figure key={item.image} className="overflow-hidden rounded-lg bg-shade">
              <div className="relative h-72">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="bg-surface px-4 py-3 text-[13.5px] text-muted">
                {nameFor(item.category)}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {renderSections(getGalleryPage().sections)}
    </PageShell>
  );
}
