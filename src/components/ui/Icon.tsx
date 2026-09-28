type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
};

export type IconName =
  | 'whatsapp'
  | 'phone'
  | 'check'
  | 'clock'
  | 'broom'
  | 'sparkle'
  | 'arrowRight'
  | 'star'
  | 'menu'
  | 'close'
  | 'chevronDown'
  | 'play';

const PATHS: Record<IconName, string> = {
  whatsapp: 'M3 21l1.7-5A9 9 0 1 1 8 19.3z',
  phone:
    'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z',
  check: 'M20 6L9 17l-5-5',
  clock: 'M12 6v6l4 2',
  broom: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14',
  sparkle: 'M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.8-4.9-3.6-4.9 3.6 1.9-5.8L4 8.8h6.1z',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  star: 'M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  chevronDown: 'M6 9l6 6 6-6',
  play: 'M8 5.5v13l11-6.5z',
};

/** Star and play are solid glyphs; everything else is a stroke icon. */
export function Icon({ name, size = 16, className, strokeWidth = 2 }: IconProps) {
  const solid = name === 'star' || name === 'play';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={solid ? 'currentColor' : 'none'}
      stroke={solid ? undefined : 'currentColor'}
      strokeWidth={solid ? undefined : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {name === 'clock' ? <circle cx="12" cy="12" r="9" /> : null}
      <path d={PATHS[name]} />
    </svg>
  );
}
