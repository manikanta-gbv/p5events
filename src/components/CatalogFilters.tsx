'use client';

import { useMemo, useState } from 'react';
import { PackageCard } from '@/components/ui/PackageCard';
import type { PackageCardData } from '@/lib/view';

type Option = { slug: string; label: string };
type Palette = Option & { swatch: string };

type Props = {
  packages: PackageCardData[];
  categories: Option[];
  venues: Option[];
  palettes: Palette[];
  budgetMin: number;
  budgetMax: number;
  whatsappHref: string;
  /** Fixed when the page is already scoped to one occasion. */
  lockedCategory?: string;
};

type Sort = 'popular' | 'price-asc' | 'price-desc';

function toggle(set: string[], value: string): string[] {
  return set.includes(value) ? set.filter((v) => v !== value) : [...set, value];
}

export function CatalogFilters({
  packages,
  categories,
  venues,
  palettes,
  budgetMin,
  budgetMax,
  whatsappHref,
  lockedCategory,
}: Props) {
  const [budget, setBudget] = useState(budgetMax);
  const [pickedCategories, setPickedCategories] = useState<string[]>([]);
  const [pickedVenues, setPickedVenues] = useState<string[]>([]);
  const [pickedPalettes, setPickedPalettes] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>('popular');
  const [open, setOpen] = useState(false);

  const visible = useMemo(() => {
    const filtered = packages.filter((pkg) => {
      if (lockedCategory && pkg.categorySlug !== lockedCategory) return false;
      if (pkg.price > budget) return false;
      if (pickedCategories.length && !pickedCategories.includes(pkg.categorySlug)) return false;
      if (pickedVenues.length && !pkg.venues.some((v) => pickedVenues.includes(v))) return false;
      if (pickedPalettes.length && !pkg.palette.some((p) => pickedPalettes.includes(p)))
        return false;
      return true;
    });

    if (sort === 'price-asc') return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [packages, budget, pickedCategories, pickedVenues, pickedPalettes, sort, lockedCategory]);

  const anyFilter =
    pickedCategories.length || pickedVenues.length || pickedPalettes.length || budget < budgetMax;

  function clear() {
    setPickedCategories([]);
    setPickedVenues([]);
    setPickedPalettes([]);
    setBudget(budgetMax);
  }

  const checkbox =
    'flex min-h-8 cursor-pointer items-center gap-2.5 text-sm text-inkSoft';

  return (
    <div className="mx-auto max-w-shell px-5 pb-16 pt-6 md:px-14">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex h-11 items-center gap-2 rounded-sm border border-lineStrong px-4 text-sm font-semibold lg:hidden"
        >
          Filters{anyFilter ? ` (${visible.length})` : ''}
        </button>

        <div className="ml-auto flex items-center gap-2.5">
          <label htmlFor="sort" className="text-[13.5px] text-muted">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-11 rounded-sm border border-lineStrong bg-surface px-3 text-sm"
          >
            <option value="popular">Most booked</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-7 lg:flex-row lg:gap-8">
        <aside className={`${open ? 'block' : 'hidden'} w-full lg:block lg:w-60 lg:shrink-0`}>
          <div className="rounded-lg border border-line bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold">Filters</span>
              {anyFilter ? (
                <button
                  type="button"
                  onClick={clear}
                  className="text-[13px] font-semibold text-accent"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Budget
            </p>
            <div className="mt-3 flex items-center justify-between text-[13.5px] text-inkSoft">
              <span>₹{budgetMin.toLocaleString('en-IN')}</span>
              <span>₹{budget.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min={budgetMin}
              max={budgetMax}
              step={500}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              aria-label="Maximum budget"
              className="mt-2 w-full accent-accent"
            />

            {!lockedCategory ? (
              <>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  Occasion
                </p>
                <div className="mt-2.5 flex flex-col gap-0.5">
                  {categories.map((category) => (
                    <label key={category.slug} className={checkbox}>
                      <input
                        type="checkbox"
                        checked={pickedCategories.includes(category.slug)}
                        onChange={() =>
                          setPickedCategories((s) => toggle(s, category.slug))
                        }
                        className="h-[17px] w-[17px] accent-accent"
                      />
                      {category.label}
                    </label>
                  ))}
                </div>
              </>
            ) : null}

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Venue
            </p>
            <div className="mt-2.5 flex flex-col gap-0.5">
              {venues.map((venue) => (
                <label key={venue.slug} className={checkbox}>
                  <input
                    type="checkbox"
                    checked={pickedVenues.includes(venue.slug)}
                    onChange={() => setPickedVenues((s) => toggle(s, venue.slug))}
                    className="h-[17px] w-[17px] accent-accent"
                  />
                  {venue.label}
                </label>
              ))}
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              Palette
            </p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {palettes.map((palette) => {
                const on = pickedPalettes.includes(palette.slug);
                return (
                  <button
                    key={palette.slug}
                    type="button"
                    aria-label={palette.label}
                    aria-pressed={on}
                    onClick={() => setPickedPalettes((s) => toggle(s, palette.slug))}
                    style={{ background: palette.swatch }}
                    className={`h-[30px] w-[30px] rounded-pill border transition-all ${
                      on ? 'ring-2 ring-accent ring-offset-2' : 'border-lineStrong'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-ink p-5">
            <p className="text-[15px] font-semibold leading-snug text-onInk">
              Have a picture in mind?
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-onInkMuted">
              Send it across and we will match it to your space and budget.
            </p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3.5 flex h-11 items-center justify-center rounded-pill bg-canvas text-[13.5px] font-semibold text-ink"
            >
              Send on WhatsApp
            </a>
          </div>
        </aside>

        <div className="flex-1">
          {visible.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((pkg) => (
                <PackageCard key={pkg.slug} data={pkg} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-line bg-surface p-10 text-center">
              <p className="font-display text-xl">Nothing matches those filters</p>
              <p className="mt-2 text-sm text-body">
                Try widening the budget, or send us what you have in mind.
              </p>
              <button
                type="button"
                onClick={clear}
                className="mt-5 h-11 rounded-pill bg-accent px-6 text-sm font-semibold text-white"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
