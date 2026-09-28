'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { Link as NavLink } from '@/lib/schema';

type Props = {
  items: NavLink[];
  whatsappHref: string;
};

export function MobileMenu({ items, whatsappHref }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-pill text-onInkStrong lg:hidden"
      >
        <Icon name="menu" size={21} />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-ink/98 lg:hidden">
          <div className="flex h-[84px] items-center justify-end px-5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center rounded-pill text-onInkStrong"
            >
              <Icon name="close" size={22} />
            </button>
          </div>

          <nav className="flex flex-col gap-1 px-6 pt-4">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-inkLine py-4 font-display text-2xl text-onInk"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="px-6 pt-8">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-accent font-semibold text-white"
            >
              <Icon name="whatsapp" size={18} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}
