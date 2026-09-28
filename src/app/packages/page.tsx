import type { Metadata } from 'next';
import { getCategories, getPackages, getSettings } from '@/lib/content';
import { toPackageCard } from '@/lib/view';
import { whatsappLink } from '@/lib/whatsapp';
import { PageShell } from '@/components/layout/PageShell';
import { CatalogFilters } from '@/components/CatalogFilters';

export function generateMetadata(): Metadata {
  const { location, brand } = getSettings();
  return {
    title: `Packages & prices in ${location.city}`,
    description: `Every ${brand.name} package with a fixed price. Balloon décor, backdrops and full stage setups across ${location.city}.`,
    alternates: { canonical: '/packages/' },
  };
}

export default function PackagesPage() {
  const packages = getPackages();
  const categories = getCategories();
  const settings = getSettings();

  return (
    <PageShell
      crumbs={[
        { name: 'Home', href: '/' },
        { name: 'Packages', href: '/packages' },
      ]}
    >
      <div className="mx-auto max-w-shell px-5 pt-3 md:px-14">
        <h1 className="text-[30px] tracking-tight md:text-[40px]">
          Packages &amp; prices in {settings.location.city}
        </h1>
        <p className="mt-2 text-[15px] text-body">
          {packages.length} packages · set up at your home, hall or terrace
        </p>
      </div>

      <CatalogFilters
        packages={packages.map(toPackageCard)}
        categories={categories.map((c) => ({ slug: c.slug, label: c.name }))}
        venues={settings.filters.venues}
        palettes={settings.filters.palettes}
        budgetMin={settings.filters.budgetMin}
        budgetMax={settings.filters.budgetMax}
        whatsappHref={whatsappLink()}
      />
    </PageShell>
  );
}
