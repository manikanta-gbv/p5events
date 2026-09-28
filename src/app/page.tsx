import { getHomePage } from '@/lib/content';
import { renderSections } from '@/components/sections/registry';
import { Footer } from '@/components/layout/Footer';
import { LocalBusinessJsonLd } from '@/components/Seo';

export default function HomePage() {
  const page = getHomePage();

  return (
    <>
      <LocalBusinessJsonLd />
      <main>{renderSections(page.sections)}</main>
      <Footer />
    </>
  );
}
