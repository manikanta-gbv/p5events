import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getCategories,
  getCategory,
  getPackagesByCategory,
  getSettings,
} from '@/lib/content';
import { toPackageCard } from '@/lib/view';
import { whatsappLink } from '@/lib/whatsapp';
import { PageShell } from '@/components/layout/PageShell';
import { CatalogFilters } from '@/components/CatalogFilters';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  const { location } = getSettings();

  if (!category) return {};

  return {
    title: `${category.name} décor in ${location.city}`,
    description: category.blurb,
    alternates: { canonical: `/occasions/${category.slug}/` },
    openGraph: { images: [category.image] },
  };
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const packages = getPackagesByCategory(category.slug);
  const settings = getSettings();

  return (
    <PageShell
      crumbs={[
        { name: 'Home', href: '/' },
        { name: 'Packages', href: '/packages' },
        { name: category.name, href: `/occasions/${category.slug}` },
      ]}
    >
      <div className="mx-auto max-w-shell px-5 pt-3 md:px-14">
        <h1 className="text-[30px] tracking-tight md:text-[40px]">
          {category.name} décor in {settings.location.city}
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-body">
          {category.blurb}
        </p>
        <p className="mt-1.5 text-[14px] text-muted">
          {packages.length} package{packages.length === 1 ? '' : 's'}
        </p>
      </div>

      <CatalogFilters
        packages={packages.map(toPackageCard)}
        categories={getCategories().map((c) => ({ slug: c.slug, label: c.name }))}
        venues={settings.filters.venues}
        palettes={settings.filters.palettes}
        budgetMin={settings.filters.budgetMin}
        budgetMax={settings.filters.budgetMax}
        whatsappHref={whatsappLink()}
        lockedCategory={category.slug}
      />
    </PageShell>
  );
}
