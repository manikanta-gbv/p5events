import { getSettings } from './content';
import { formatPrice } from './format';

export type BookingContext = {
  packageTitle?: string;
  price?: number;
  date?: string;
  slot?: string;
  area?: string;
};

function fill(template: string, tokens: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => tokens[key] ?? '');
}

/**
 * Builds a wa.me deep link with the message pre-written. Nothing is paid
 * online; this is the whole booking mechanism.
 *
 * Note this uses the number form rather than the WhatsApp Business short
 * link: only `wa.me/<number>?text=` reliably carries a prefilled message,
 * and the prefill is the point. The short link is used where a plain
 * "message us" is wanted — see whatsappBusinessLink().
 */
export function whatsappLink(context: BookingContext = {}): string {
  const settings = getSettings();
  const number = settings.contact.whatsappNumber.replace(/\D/g, '');

  const message = context.packageTitle
    ? fill(settings.booking.messageTemplate, {
        brand: settings.brand.name,
        package: context.packageTitle,
        price: context.price ? ` (${formatPrice(context.price)})` : '',
        date: context.date || '[date]',
        slot: context.slot || '[slot]',
        area: context.area || `[area], ${settings.location.city}`,
      })
    : fill(settings.booking.genericTemplate, { brand: settings.brand.name });

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** The WhatsApp Business short link, for a plain "message us" entry point. */
export function whatsappBusinessLink(): string {
  const { contact } = getSettings();
  return contact.whatsappBusinessUrl || whatsappLink();
}

export function telLink(phone?: string): string {
  const { contact } = getSettings();
  const raw = phone ?? contact.phone;
  return `tel:${raw.replace(/[^\d+]/g, '')}`;
}
