import { getSettings, getTheme } from '@/lib/content';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { HeroSlideshow, type Slide } from './HeroSlideshow';

export type HeroProps = {
  eyebrow: string;
  headline: string;
  sub: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  slides: Slide[];
};

export function Hero({
  eyebrow,
  headline,
  sub,
  primaryCta,
  secondaryCta,
  slides,
}: HeroProps) {
  const settings = getSettings();
  const theme = getTheme();
  const { proof, location } = settings;

  return (
    <section className="relative isolate min-h-[620px] overflow-hidden bg-ink md:h-[772px]">
      <HeroSlideshow
        slides={slides}
        slideSeconds={theme.hero.slideSeconds}
        fadeMs={theme.hero.fadeMs}
        kenBurns={theme.hero.kenBurns}
        kenBurnsScale={theme.hero.kenBurnsScale}
      />

      {/* Scrim: the photographs are bright, so the text needs a floor. */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(24,19,28,0.90) 0%, rgba(24,19,28,0.62) 38%, rgba(24,19,28,0.82) 100%)',
        }}
      />

      <div className="relative z-20 mx-auto flex min-h-[620px] max-w-shell flex-col items-center justify-center px-5 pb-24 pt-32 text-center md:h-[772px] md:px-20 md:pb-28 md:pt-40">
        <p className="inline-flex items-center gap-2 rounded-pill border border-gold/45 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-goldSoft md:text-xs">
          <Icon name="sparkle" size={13} />
          {eyebrow}
        </p>

        <h1 className="mt-5 max-w-4xl font-display text-[34px] leading-[1.1] tracking-tight text-onInk md:mt-6 md:text-[60px] md:leading-[1.08]">
          {headline}
        </h1>

        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-heroSub md:mt-5 md:text-[17px]">
          {sub}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] text-heroMeta md:text-[13.5px]">
          <span>Since {proof.foundedYear}</span>
          <span className="text-heroDivider">·</span>
          <span>{proof.setupsCompleted} setups</span>
          <span className="text-heroDivider">·</span>
          <span className="hidden sm:inline">Homes, halls &amp; terraces</span>
          <span className="hidden text-heroDivider sm:inline">·</span>
          <span>{location.city}</span>
        </div>


        <div className="mt-7 flex flex-col gap-3 sm:flex-row md:mt-8">
          <Button href={primaryCta.href} variant="accent" size="lg">
            {primaryCta.label}
          </Button>
          <Button href={secondaryCta.href} variant="outlineLight" size="lg">
            {secondaryCta.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
