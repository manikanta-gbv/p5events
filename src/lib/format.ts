import { getSettings } from './content';

/**
 * The owner only ever types a number. The symbol, grouping and discount
 * percentage are all derived here so they exist in exactly one place.
 */
export function formatPrice(amount: number): string {
  const { currency } = getSettings();
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function discountPercent(price: number, strikePrice?: number): number | null {
  if (!strikePrice || strikePrice <= price) return null;
  return Math.round(((strikePrice - price) / strikePrice) * 100);
}

export function savingsAmount(price: number, strikePrice?: number): number | null {
  if (!strikePrice || strikePrice <= price) return null;
  return strikePrice - price;
}
