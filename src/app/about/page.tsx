import type { Metadata } from 'next';
import Image from 'next/image';
import { getCategories, getGallery, getSettings } from '@/lib/content';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/Button';
import { whatsappLink } from '@/lib/whatsapp';

export function generateMetadata(): Metadata {
  const { location, brand } = getSettings();
  return {
    title: `About ${brand.name}, ${location.city}`,
    description: `Who we are and how we work — a party décor studio in ${location.city}.`,
    alternates: { canonical: '/about/' },
  };
}

export default function AboutPage() {
  const settings = getSettings();
  const shots = getGallery().slice(0, 4);

  return (
    <PageShell
      crumbs={[
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
      ]}
    >
      <div className="mx-auto max-w-shell px-5 pb-16 pt-3 md:px-14">
        <h1 className="max-w-3xl text-[30px] tracking-tight md:text-[40px]">
          A décor studio in {settings.location.city}, run by the people who set up
        </h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-body">
          [Write two or three sentences about how {settings.brand.name} started, who runs
          it, and what you want people to know. Keep it plain — this is the page people
          read before trusting you with a first birthday.]
        </p>

        <dl className="mt-9 grid gap-6 border-y border-line py-7 sm:grid-cols-3">
          <div>
            <dt className="text-[13px] text-muted">Setups completed</dt>
            <dd className="mt-1 font-display text-[30px]">
              {settings.proof.setupsCompleted}
            </dd>
          </div>
          <div>
            <dt className="text-[13px] text-muted">Years in {settings.location.city}</dt>
            <dd className="mt-1 font-display text-[30px]">{settings.proof.yearsTrading}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-muted">Occasions we cover</dt>
            <dd className="mt-1 font-display text-[30px]">{getCategories().length}</dd>
          </div>
        </dl>

        <div className="mt-9 grid grid-cols-2 gap-3 md:grid-cols-4">
          {shots.map((shot) => (
            <div key={shot.image} className="relative h-44 overflow-hidden rounded-lg bg-shade md:h-56">
              <Image
                src={shot.image}
                alt={shot.alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Button href={whatsappLink()} variant="accent" size="lg" icon="whatsapp" external>
            Talk to us on WhatsApp
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
