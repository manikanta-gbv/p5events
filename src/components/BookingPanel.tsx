'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@/components/ui/Icon';

type Props = {
  packageTitle: string;
  priceLabel: string;
  strikeLabel: string | null;
  savingsLabel: string | null;
  slots: string[];
  city: string;
  phone: string;
  telHref: string;
  whatsappNumber: string;
  messageTemplate: string;
  brandName: string;
};

function fill(template: string, tokens: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => tokens[key] ?? '');
}

/**
 * Date, slot and area feed straight into the WhatsApp message. Nothing is
 * paid online — this is the whole booking mechanism.
 */
export function BookingPanel({
  packageTitle,
  priceLabel,
  strikeLabel,
  savingsLabel,
  slots,
  city,
  phone,
  telHref,
  whatsappNumber,
  messageTemplate,
  brandName,
}: Props) {
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState(slots[0] ?? '');
  const [area, setArea] = useState('');

  const href = useMemo(() => {
    const message = fill(messageTemplate, {
      brand: brandName,
      package: packageTitle,
      price: ` (${priceLabel})`,
      date: date || '[date]',
      slot,
      area: area ? `${area}, ${city}` : `[area], ${city}`,
    });
    return `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  }, [
    area,
    brandName,
    city,
    date,
    messageTemplate,
    packageTitle,
    priceLabel,
    slot,
    whatsappNumber,
  ]);

  const field =
    'h-11 w-full rounded-sm border border-lineStrong bg-canvas px-3 text-sm text-ink';
  const label = 'mb-1.5 block text-[12.5px] font-semibold text-inkSoft';

  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="flex flex-wrap items-baseline gap-2.5">
        <span className="font-display text-[34px]">{priceLabel}</span>
        {strikeLabel ? (
          <span className="text-sm text-subtle line-through">{strikeLabel}</span>
        ) : null}
        {savingsLabel ? (
          <span className="rounded-pill bg-successTint px-2.5 py-1 text-xs font-semibold text-successDark">
            Save {savingsLabel}
          </span>
        ) : null}
      </div>
      <p className="mt-1.5 text-[12.5px] text-muted">
        All-inclusive. No delivery or setup charge inside city limits.
      </p>

      <div className="mt-5 border-t border-line pt-5">
        <p className="text-[13px] font-semibold">Check your date</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
          Fill these in and the WhatsApp message writes itself.
        </p>
      </div>

      <div className="mt-3.5 flex gap-2.5">
        <div className="flex-1">
          <label htmlFor="event-date" className={label}>
            Event date
          </label>
          <input
            id="event-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={field}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="setup-slot" className={label}>
            Setup slot
          </label>
          <select
            id="setup-slot"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            className={field}
          >
            {slots.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3.5">
        <label htmlFor="venue-area" className={label}>
          Venue area
        </label>
        <input
          id="venue-area"
          type="text"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder={`Which part of ${city}?`}
          className={field}
        />
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 flex h-12 items-center justify-center gap-2 rounded-pill bg-accent text-[15px] font-semibold text-white transition-colors hover:bg-accentDark"
      >
        <Icon name="whatsapp" size={18} />
        Check this date on WhatsApp
      </a>

      <a
        href={telHref}
        className="mt-2.5 flex h-12 items-center justify-center gap-2 rounded-pill border-[1.5px] border-ink text-[14.5px] font-semibold text-ink transition-colors hover:bg-ink hover:text-onInk"
      >
        <Icon name="phone" size={17} />
        Call {phone}
      </a>

      <ul className="mt-5 flex flex-col gap-2.5 text-[13px] text-inkSoft">
        {[
          'Nothing to pay online — settle with the team',
          'Free reschedule up to [N] hours before',
          'Colours and name customised free',
        ].map((line) => (
          <li key={line} className="flex items-start gap-2">
            <Icon
              name="check"
              size={15}
              strokeWidth={2.4}
              className="mt-0.5 shrink-0 text-success"
            />
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
