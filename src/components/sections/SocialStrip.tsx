import { getSettings, getVideos } from '@/lib/content';
import { BrandIcon } from '@/components/ui/BrandIcon';
import { Icon } from '@/components/ui/Icon';

export type SocialStripProps = {
  eyebrow?: string;
  heading: string;
  body?: string;
};

/**
 * Quick access to the Instagram and YouTube profiles.
 *
 * The video cards are thumbnails linking out, not embedded players: an
 * iframe per card would pull in several hundred KB of YouTube script before
 * anyone presses play, and most of this traffic is mobile on cellular.
 * Thumbnails come from YouTube's own CDN, so they stay current without an
 * API key or a token to refresh.
 */
export function SocialStrip({ eyebrow, heading, body }: SocialStripProps) {
  const { social, brand } = getSettings();
  const { videos } = getVideos();

  const hasInstagram = Boolean(social.instagram);
  const hasYoutube = Boolean(social.youtube);
  if (!hasInstagram && !hasYoutube && !videos.length) return null;

  return (
    <section id="watch" className="mx-auto max-w-shell px-5 pt-14 md:px-14 md:pt-16">
      <div className="rounded-xl bg-ink px-6 py-10 md:px-12 md:py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-2 text-[26px] tracking-tight text-onInk md:text-[34px]">
              {heading}
            </h2>
            {body ? (
              <p className="mt-3 text-[15px] leading-relaxed text-onInkMuted">{body}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            {hasInstagram ? (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2.5 rounded-pill bg-canvas px-5 text-sm font-semibold text-ink transition-colors hover:bg-white"
              >
                <BrandIcon name="instagram" size={18} />
                Reels on Instagram
              </a>
            ) : null}
            {hasYoutube ? (
              <a
                href={social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2.5 rounded-pill border-[1.5px] border-onInkMuted/50 px-5 text-sm font-semibold text-onInk transition-colors hover:border-gold hover:text-gold"
              >
                <BrandIcon name="youtube" size={18} />
                Watch on YouTube
              </a>
            ) : null}
          </div>
        </div>

        {videos.length ? (
          <ul className="mt-8 grid grid-cols-2 gap-3 md:mt-9 md:grid-cols-4 md:gap-4">
            {videos.map((video) => (
              <li key={video.id}>
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="relative aspect-video overflow-hidden rounded-md bg-inkSoft">
                    {/* YouTube's own CDN, so the thumbnail follows the video. */}
                    <img
                      src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      width={480}
                      height={360}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-pill bg-ink/70 text-onInk backdrop-blur-sm transition-colors group-hover:bg-accent">
                        <Icon name="play" size={18} />
                      </span>
                    </span>
                  </div>
                  <p className="mt-2.5 text-[13.5px] font-medium text-onInkMuted transition-colors group-hover:text-gold">
                    {video.label}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-7 text-[12.5px] text-subtle">
          Videos open on YouTube. Follow {brand.name} for new setups each week.
        </p>
      </div>
    </section>
  );
}
