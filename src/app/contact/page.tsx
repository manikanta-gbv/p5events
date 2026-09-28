import type { Metadata } from 'next';
import { getAreas, getFaqs, getSettings } from '@/lib/content';
import { telLink, whatsappLink } from '@/lib/whatsapp';
import { SocialLinks } from '@/components/SocialLinks';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { FaqJsonLd } from '@/components/Seo';

export function generateMetadata(): Metadata {
  const { location, brand } = getSettings();
  return {
    title: `Contact us in ${location.city}`,
    description: `Send ${brand.name} your date, venue and a reference picture on WhatsApp for a fixed quote.`,
    alternates: { canonical: '/contact/' },
  };
}

export default function ContactPage() {
  const settings = getSettings();
  const areas = getAreas();
  const faqs = getFaqs();

  return (
    <PageShell
      crumbs={[
        { name: 'Home', href: '/' },
        { name: 'Contact', href: '/contact' },
      ]}
    >
      <FaqJsonLd />
      <div className="mx-auto max-w-shell px-5 pb-16 pt-3 md:px-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
          <div className="lg:w-[55%]">
            <h1 className="text-[30px] tracking-tight md:text-[40px]">
              Tell us the date. We will take it from there.
            </h1>
            <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-body">
              Send a reference picture, your venue and the date — we will reply with a
              fixed quote, usually within the hour.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href={whatsappLink()} variant="accent" size="lg" icon="whatsapp" external>
                WhatsApp us
              </Button>
              <Button href={telLink()} variant="outlineInk" size="lg" icon="phone" external>
                Call {settings.contact.phone}
              </Button>
            </div>

            <dl className="mt-9 grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Phone
                </dt>
                <dd className="mt-1 flex flex-col gap-1 text-[15px]">
                  <a href={telLink(settings.contact.phone)} className="hover:text-accent">
                    {settings.contact.phone}
                  </a>
                  {settings.contact.phoneAlt ? (
                    <a href={telLink(settings.contact.phoneAlt)} className="hover:text-accent">
                      {settings.contact.phoneAlt}
                    </a>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Email
                </dt>
                <dd className="mt-1 text-[15px]">
                  <a href={`mailto:${settings.contact.email}`} className="break-all hover:text-accent">
                    {settings.contact.email}
                  </a>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Studio
                </dt>
                <dd className="mt-1 text-[15px]">
                  {settings.location.addressLine}, {settings.location.city},{' '}
                  {settings.location.region} {settings.location.postalCode}
                </dd>
              </div>
            </dl>

            <h2 className="mt-10 text-xl">Find us online</h2>
            <div className="mt-3">
              <SocialLinks tone="onCanvas" />
            </div>

            <h2 className="mt-10 text-xl">Areas we set up in</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {areas.map((area) => (
                <li
                  key={area.slug}
                  className="rounded-pill border border-lineStrong px-4 py-2 text-[13.5px] text-body"
                >
                  {area.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:flex-1">
            <h2 className="text-2xl">Before you ask</h2>
            <div className="mt-4 border-t border-line">
              {faqs.map((faq) => (
                <details key={faq.question} className="border-b border-line py-4">
                  <summary className="cursor-pointer list-none text-[15.5px] font-semibold">
                    {faq.question}
                  </summary>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-body">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
