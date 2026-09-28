import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

type Variant = 'accent' | 'ink' | 'outlineInk' | 'outlineLight' | 'light';
type Size = 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  accent: 'bg-accent text-white hover:bg-accentDark',
  ink: 'bg-ink text-onInk hover:bg-inkSoft',
  outlineInk: 'border-[1.5px] border-ink text-ink hover:bg-ink hover:text-onInk',
  outlineLight:
    'border-[1.5px] border-white/75 text-white hover:bg-white hover:text-ink',
  light: 'bg-canvas text-ink hover:bg-white',
};

const SIZES: Record<Size, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-[52px] px-7 text-[15px]',
};

type Props = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  external?: boolean;
  className?: string;
  fullWidth?: boolean;
};

export function Button({
  href,
  children,
  variant = 'accent',
  size = 'md',
  icon,
  external,
  className = '',
  fullWidth,
}: Props) {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-pill font-semibold',
    'transition-colors focus-visible:outline focus-visible:outline-2',
    'focus-visible:outline-offset-2 focus-visible:outline-accent',
    VARIANTS[variant],
    SIZES[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {icon ? <Icon name={icon} size={size === 'lg' ? 18 : 16} /> : null}
      {children}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
