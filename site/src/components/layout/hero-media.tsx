'use client';

import { useEffect, useRef, useState } from 'react';

interface HeroMediaProps {
  readonly videoSrc: string;
  /** Shown as the poster, and as the whole hero when motion is not wanted. */
  readonly posterSrc: string | null;
}

/**
 * Full-bleed hero video.
 *
 * The file is served straight from `public/` at its original quality — no
 * Next image pipeline, no transcode. What it does adapt is whether it *plays*:
 * a visitor who asked their system for reduced motion gets the poster frame and
 * the file is never fetched. That decision has to happen on the client, so the
 * element starts as a plain poster and upgrades once the preference is known.
 */
export function HeroMedia({ videoSrc, posterSrc }: HeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [motionAllowed, setMotionAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMotionAllowed(!query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  // Autoplay is refused often enough (low power mode, browser policy) that it
  // has to be asked for again once the source is attached, not assumed.
  useEffect(() => {
    if (!motionAllowed) return;
    videoRef.current?.play().catch(() => {
      /* Poster stays up; nothing to recover. */
    });
  }, [motionAllowed]);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 size-full object-cover"
      poster={posterSrc ?? undefined}
      src={motionAllowed ? videoSrc : undefined}
      preload={motionAllowed ? 'auto' : 'none'}
      autoPlay={motionAllowed === true}
      muted
      loop
      playsInline
      aria-hidden
      tabIndex={-1}
    />
  );
}
