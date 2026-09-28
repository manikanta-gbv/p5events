import Image from 'next/image';
import Link from 'next/link';
import type { PackageCardData } from '@/lib/view';

type Props = {
  data: PackageCardData;
  showCta?: boolean;
  showCategoryBadge?: boolean;
};

/** Pure view — no filesystem access, so it renders on server and client alike. */
export function PackageCard({ data, showCta = false, showCategoryBadge = true }: Props) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface">
      <Link
        href={`/packages/${data.slug}`}
        className="group relative block h-52 bg-shade"
        aria-label={data.title}
      >
        <Image
          src={data.image}
          alt={data.imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {showCategoryBadge ? (
          <span className="absolute left-3 top-3 rounded-pill bg-ink px-2.5 py-1.5 text-[11.5px] font-semibold text-onInk">
            {data.categoryName}
          </span>
        ) : null}
        {data.discount ? (
          <span className="absolute right-3 top-3 rounded-pill bg-success px-2.5 py-1.5 text-[11px] font-semibold text-white">
            {data.discount}% off
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold leading-snug">
          <Link href={`/packages/${data.slug}`} className="hover:text-accent">
            {data.title}
          </Link>
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-body">{data.summary}</p>

        <div className="mt-3.5 flex items-baseline gap-2">
          <span className="font-display text-[22px]">{data.priceLabel}</span>
          {data.strikeLabel ? (
            <span className="text-[13px] text-subtle line-through">{data.strikeLabel}</span>
          ) : null}
        </div>

        {showCta ? (
          <Link
            href={`/packages/${data.slug}`}
            className="mt-3.5 flex h-11 items-center justify-center rounded-pill bg-accent text-sm font-semibold text-white transition-colors hover:bg-accentDark"
          >
            Check dates
          </Link>
        ) : null}
      </div>
    </article>
  );
}
