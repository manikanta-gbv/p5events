import { getCategory } from './content';
import { discountPercent, formatPrice } from './format';
import type { Package } from './schema';

/**
 * A serialisable shape for a package card. Client components (the catalogue
 * filters) cannot read the filesystem, so everything the card needs is
 * resolved on the server and handed over as plain data.
 */
export type PackageCardData = {
  slug: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  price: number;
  priceLabel: string;
  strikeLabel: string | null;
  discount: number | null;
  categorySlug: string;
  categoryName: string;
  venues: string[];
  palette: string[];
};

export function toPackageCard(pkg: Package): PackageCardData {
  const category = getCategory(pkg.category);

  return {
    slug: pkg.slug,
    title: pkg.title,
    summary: pkg.summary,
    image: pkg.images[0],
    imageAlt: pkg.imageAlt,
    price: pkg.price,
    priceLabel: formatPrice(pkg.price),
    strikeLabel: pkg.strikePrice ? formatPrice(pkg.strikePrice) : null,
    discount: discountPercent(pkg.price, pkg.strikePrice),
    categorySlug: pkg.category,
    categoryName: category?.name ?? pkg.category,
    venues: pkg.venues,
    palette: pkg.palette,
  };
}
