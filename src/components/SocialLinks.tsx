import { getSettings } from '@/lib/content';
import { BrandIcon, type BrandName } from '@/components/ui/BrandIcon';

type Tone = 'onInk' | 'onCanvas';

const TONES: Record<Tone, string> = {
  onInk: 'border-inkLine text-onInkMuted hover:border-gold hover:text-gold',
  onCanvas: 'border-lineStrong text-body hover:border-accent hover:text-accent',
};

/**
 * Social and messaging profiles. Entries with an empty URL are skipped, so
 * the owner can drop a platform by clearing the field rather than needing
 * a code change.
 */
export function SocialLinks({
  tone = 'onInk',
  size = 18,
}: {
  tone?: Tone;
  size?: number;
}) {
  const { social, contact, brand } = getSettings();

  const links = (
    [
      { name: 'instagram', href: social.instagram, label: `${brand.name} on Instagram` },
      { name: 'youtube', href: social.youtube, label: `${brand.name} on YouTube` },
      {
        name: 'whatsapp',
        href: contact.whatsappBusinessUrl ?? '',
        label: `Message ${brand.name} on WhatsApp`,
      },
      { name: 'google', href: social.googleBusiness, label: `${brand.name} on Google` },
    ] satisfies { name: BrandName; href: string; label: string }[]
  ).filter((link) => link.href.length > 0);

  if (!links.length) return null;

  return (
    <ul className="flex flex-wrap gap-2.5">
      {links.map((link) => (
        <li key={link.name}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            title={link.label}
            className={`flex h-11 w-11 items-center justify-center rounded-pill border transition-colors ${TONES[tone]}`}
          >
            <BrandIcon name={link.name} size={size} />
          </a>
        </li>
      ))}
    </ul>
  );
}
