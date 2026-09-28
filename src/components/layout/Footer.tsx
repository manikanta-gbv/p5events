import Image from 'next/image';
import Link from 'next/link';
import { getNavigation, getSettings } from '@/lib/content';
import { telLink } from '@/lib/whatsapp';
import { SocialLinks } from '@/components/SocialLinks';

export function Footer() {
  const nav = getNavigation();
  const { brand, contact, location, seo } = getSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-14 bg-ink md:mt-16">
      <div className="mx-auto max-w-shell px-5 py-12 md:px-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="max-w-xs">
            <Image
              src={brand.logoFull}
              alt={brand.name}
              width={152}
              height={134}
              className="h-auto w-[152px]"
            />
            <p className="mt-4 text-sm leading-relaxed text-onInkMuted">
              {brand.tagline} in {location.city}. {seo.defaultDescription.split('.')[0]}.
            </p>
            <div className="mt-5">
              <SocialLinks tone="onInk" />
            </div>
          </div>

          {nav.footer.map((column) => (
            <div key={column.heading}>
              <p className="mb-3 text-[13px] font-semibold text-onInk">{column.heading}</p>
              <ul className="flex flex-col gap-2 text-[13.5px]">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-onInkMuted transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="mb-3 text-[13px] font-semibold text-onInk">Reach us</p>
            <ul className="flex flex-col gap-2 text-[13.5px] text-onInkMuted">
              <li>
                <a href={telLink(contact.phone)} className="transition-colors hover:text-gold">
                  {contact.phone}
                </a>
              </li>
              {contact.phoneAlt ? (
                <li>
                  <a
                    href={telLink(contact.phoneAlt)}
                    className="transition-colors hover:text-gold"
                  >
                    {contact.phoneAlt}
                  </a>
                </li>
              ) : null}
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="break-all transition-colors hover:text-gold"
                >
                  {contact.email}
                </a>
              </li>
              <li>
                {location.addressLine}, {location.city}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-inkLine pt-5 text-[12.5px] text-subtle">
          <span>
            © {year} {brand.name}. All photographs are of our own setups.
          </span>
          <span className="flex gap-4">
            {nav.legal.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-gold">
                {link.label}
              </Link>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
