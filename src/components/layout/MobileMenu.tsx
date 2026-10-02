'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/ui/Icon';
import type { Link as NavLink } from '@/lib/schema';

type Props = {
  items: NavLink[];
  whatsappHref: string;
  brandName: string;
  wordmark: string;
  logoMark: string;
};

export function MobileMenu({ items, whatsappHref, brandName, wordmark, logoMark }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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

  const panel = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ink lg:hidden"
    >
      {/* Mirrors the header pill, which this panel sits on top of. */}
      <div className="flex h-[84px] shrink-0 items-center justify-between px-5">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3"
          aria-label={`${brandName} home`}
        >
          <Image
            src={logoMark}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <span className="h-[22px] w-px bg-gold/40" />
          <span className="text-[11px] uppercase tracking-[0.3em] text-gold">{wordmark}</span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-pill text-onInkStrong"
        >
          <Icon name="close" size={22} />
        </button>
      </div>

      <nav className="flex flex-col px-6 pt-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="border-b border-inkLine py-4 font-display text-2xl text-onInk transition-colors hover:text-gold"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-6 pb-8 pt-8">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-accent font-semibold text-white transition-colors hover:bg-accentDark"
        >
          <Icon name="whatsapp" size={18} />
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );

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

      {/*
        Portalled to <body> rather than rendered in place. The header pill
        uses backdrop-filter, which makes it the containing block for any
        position:fixed descendant — so in place, this panel was pinned to the
        pill's own 366x66 box instead of covering the viewport. Portalling
        escapes that without giving up the glass effect on the pill.

        The panel is also solid, not translucent: it was previously an ink
        background at 98% opacity, which is not a step on Tailwind's scale,
        so that class compiled to nothing and the panel rendered see-through.
      */}
      {open && mounted ? createPortal(panel, document.body) : null}
    </>
  );
}
