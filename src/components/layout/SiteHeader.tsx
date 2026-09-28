'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { MobileMenu } from './MobileMenu';
import type { Link as NavLink } from '@/lib/schema';

type Props = {
  items: NavLink[];
  ctaLabel: string;
  brandName: string;
  wordmark: string;
  logoMark: string;
  whatsappHref: string;
};

/**
 * One header for the whole site. It is fixed and identical on every route —
 * the home page's floating pill, kept over the hero and over the cream pages
 * alike, so nothing shifts when you navigate.
 */
export function SiteHeader({
  items,
  ctaLabel,
  brandName,
  wordmark,
  logoMark,
  whatsappHref,
}: Props) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.includes('#')) return false;
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="fixed inset-x-4 top-4 z-40 md:inset-x-11 md:top-6">
      <div className="mx-auto flex h-[68px] max-w-shell items-center justify-between rounded-pill border border-gold/30 bg-navGlass/[0.92] px-3 pl-5 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3" aria-label={`${brandName} home`}>
          <Image
            src={logoMark}
            alt=""
            width={46}
            height={46}
            priority
            className="h-10 w-10 object-contain md:h-[46px] md:w-[46px]"
          />
          <span className="hidden h-[26px] w-px bg-gold/40 sm:block" />
          <span className="hidden text-[12.5px] uppercase tracking-[0.3em] text-gold sm:block">
            {wordmark}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-[14.5px] lg:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={
                isActive(item.href)
                  ? 'font-semibold text-gold'
                  : 'text-onInkStrong transition-colors hover:text-gold'
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-[46px] items-center gap-2 rounded-pill bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accentDark sm:inline-flex"
          >
            <Icon name="whatsapp" size={16} />
            {ctaLabel}
          </a>
          <MobileMenu items={items} whatsappHref={whatsappHref} />
        </div>
      </div>
    </header>
  );
}
