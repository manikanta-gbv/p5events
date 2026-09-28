'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

export type Slide = { image: string; alt: string };

type Props = {
  slides: Slide[];
  slideSeconds: number;
  fadeMs: number;
  kenBurns: boolean;
  kenBurnsScale: number;
};

/**
 * Cross-fading slideshow with a slow alternating zoom on each frame — the
 * "natural movement" from the design. Honours prefers-reduced-motion by
 * rendering a still first frame and never starting the timer.
 */
export function HeroSlideshow({
  slides,
  slideSeconds,
  fadeMs,
  kenBurns,
  kenBurnsScale,
}: Props) {
  const [index, setIndex] = useState(0);
  const [still, setStill] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    timer.current = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      Math.round(slideSeconds * 1000),
    );
  }, [slideSeconds, slides.length, stop]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (query.matches) {
      setStill(true);
      return;
    }
    start();
    return stop;
  }, [start, stop]);

  const animate = kenBurns && !still;
  const fade = still ? 0 : fadeMs;
  const drift = Math.round(slideSeconds * 1000 + fadeMs);

  return (
    <>
      {slides.map((slide, n) => {
        const active = n === index;
        const zoomIn = n % 2 === 0;
        const scale = animate
          ? active
            ? zoomIn
              ? kenBurnsScale
              : 1
            : zoomIn
              ? 1
              : kenBurnsScale
          : 1;

        return (
          <div
            key={slide.image}
            className="absolute inset-0"
            style={{ opacity: active ? 1 : 0, transition: `opacity ${fade}ms ease-in-out` }}
            aria-hidden={!active}
          >
            <Image
              src={slide.image}
              alt={active ? slide.alt : ''}
              fill
              priority={n === 0}
              loading={n === 0 ? 'eager' : 'lazy'}
              sizes="100vw"
              className="object-cover"
              style={{
                transform: `scale(${scale})`,
                transition: `transform ${animate ? drift : 0}ms linear`,
              }}
            />
          </div>
        );
      })}

      <div className="absolute inset-x-0 bottom-5 z-20 flex justify-center gap-1.5">
        {slides.map((slide, n) => (
          <button
            key={slide.image}
            type="button"
            onClick={() => {
              setIndex(n);
              if (!still) start();
            }}
            aria-label={`Show hero photo ${n + 1}`}
            aria-current={n === index}
            className="flex h-11 w-10 items-center justify-center"
          >
            <span
              className="block h-[5px] rounded-pill transition-all duration-300"
              style={{
                width: n === index ? 30 : 8,
                background: n === index ? 'var(--gold)' : 'rgba(251,247,243,0.45)',
              }}
            />
          </button>
        ))}
      </div>
    </>
  );
}
