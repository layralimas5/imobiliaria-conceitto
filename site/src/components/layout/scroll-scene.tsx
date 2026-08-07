'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ScenePhoto {
  readonly url: string;
  readonly alt: string;
  /** Art dropped into the scene folder stands on its own and links nowhere. */
  readonly href?: string;
  readonly caption?: string;
}

interface ScrollSceneProps {
  /** The still the scene opens on. */
  readonly posterSrc: string;
  /** Takes over once the visitor scrolls into the scene. */
  readonly videoSrc: string | null;
  /** Fills the stage once the film has had its turn. */
  readonly photos: readonly ScenePhoto[];
  readonly eyebrow: string;
  readonly title: string;
  readonly text: string;
}

/** Where each act begins, as a fraction of the section's scroll. */
const VIDEO_AT = 0.2;
const PHOTOS_AT = 0.55;

/**
 * A still that becomes a film, then a gallery, as you scroll past it.
 *
 * The section is four screens tall and the stage inside it is sticky, so
 * scrolling advances the scene instead of moving it. Scroll position drives the
 * hand-offs rather than a timer, which is what makes a mouse wheel and a thumb
 * behave the same. The last act is a carousel: it fills the stage and the
 * visitor steps through it sideways, at their own pace, while the page waits.
 *
 * With `prefers-reduced-motion` the video is never fetched and the still holds
 * its turn instead — the acts and the copy are otherwise identical.
 */
export function ScrollScene({
  posterSrc,
  videoSrc,
  photos,
  eyebrow,
  title,
  text,
}: ScrollSceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setMotionAllowed(!query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      // 0 when the section's top reaches the viewport top, 1 when its bottom
      // does. `travel` is the scrollable height behind the sticky stage.
      const travel = rect.height - window.innerHeight;
      if (travel <= 0) {
        setProgress(0);
        return;
      }
      setProgress(Math.min(1, Math.max(0, -rect.top / travel)));
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const hasPhotos = photos.length > 0;
  const showsPhotos = hasPhotos && progress >= PHOTOS_AT;
  const showsVideo =
    motionAllowed && videoSrc !== null && progress > VIDEO_AT && !showsPhotos;

  // The film runs only while it is the thing on screen. Autoplay is refused
  // often enough (low power mode, browser policy) that it has to be asked for
  // rather than assumed, and a rejected promise here is not an error.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (showsVideo) video.play().catch(() => {});
    else video.pause();
  }, [showsVideo]);

  const step = (delta: number) =>
    setIndex((current) => (current + delta + photos.length) % photos.length);

  const active = photos[index];

  return (
    <section ref={sectionRef} className="relative h-[300vh]">
      {/*
       * A banner: edge to edge, and shorter than the window. Boxing it to the
       * art's own 16:9 left letterbox bars above and below, and running it the
       * full height of a tall screen upscaled a 1670×940 file into mush. This
       * height keeps the source larger than the frame, so it stays sharp.
       */}
      <div className="sticky top-0 flex h-[85vh] items-end overflow-hidden bg-ink">
        {/*
         * The still is the floor of the scene and never fades out. The layers
         * above cover it as they arrive, which means a video that has not
         * buffered a frame yet shows the banner rather than a black rectangle.
         */}
        <Image
          src={posterSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {motionAllowed && videoSrc ? (
          <video
            ref={videoRef}
            className="absolute inset-0 size-full object-cover transition-opacity duration-700"
            src={videoSrc}
            poster={posterSrc}
            preload="auto"
            muted
            loop
            playsInline
            aria-hidden
            tabIndex={-1}
            style={{ opacity: showsVideo ? 1 : 0 }}
          />
        ) : null}

        {/*
         * `invisible` rather than `hidden`: it still fades, and it takes the
         * arrows out of the tab order and the accessibility tree while the
         * gallery is not the act on screen.
         */}
        {hasPhotos && active ? (
          <div
            className={`absolute inset-0 transition-[opacity,visibility] duration-700 ${
              showsPhotos ? 'visible opacity-100' : 'invisible opacity-0'
            }`}
          >
            <Image
              key={active.url}
              src={active.url}
              alt={active.alt}
              fill
              sizes="100vw"
              className="animate-[fade-in_0.5s_var(--ease-out-soft)] object-cover"
            />
          </div>
        ) : null}

        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/45"
        />

        {/* Opening copy: steps aside once the photographs take the stage. */}
        <div
          className={`container-page relative w-full pb-20 transition-opacity duration-500 md:pb-28 ${
            showsPhotos ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <div className="max-w-xl [text-shadow:0_1px_16px_rgb(20_21_15_/_0.45)]">
            <p className="text-eyebrow text-white/70">{eyebrow}</p>
            <h2 className="text-display mt-4 text-4xl text-white md:text-5xl">{title}</h2>
            <p className="mt-5 text-base leading-relaxed text-white/90">{text}</p>
          </div>

          {/* How far through the scene we are — the only affordance that says
              "keep scrolling, this is going somewhere". */}
          <div
            aria-hidden
            className="mt-10 h-px w-full max-w-xs overflow-hidden bg-white/25"
          >
            <div
              className="h-full bg-white transition-[width] duration-150 ease-out"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>

        {hasPhotos && active ? (
          <div
            className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
              showsPhotos ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="container-page absolute inset-x-0 bottom-0 pb-20 md:pb-28">
              <div className="pointer-events-auto max-w-xl [text-shadow:0_1px_16px_rgb(20_21_15_/_0.45)]">
                <p className="text-eyebrow text-white/70">
                  {index + 1} de {photos.length}
                </p>
                {active.caption ? (
                  active.href ? (
                    <Link
                      href={active.href}
                      tabIndex={showsPhotos ? undefined : -1}
                      className="text-display mt-3 inline-block text-3xl text-white underline-offset-8 hover:underline md:text-4xl"
                    >
                      {active.caption}
                    </Link>
                  ) : (
                    <p className="text-display mt-3 text-3xl text-white md:text-4xl">
                      {active.caption}
                    </p>
                  )
                ) : null}
              </div>

              <div
                aria-hidden
                className="mt-8 flex gap-1.5"
              >
                {photos.map((photo, dot) => (
                  <span
                    key={photo.url}
                    className={`h-px w-8 transition-colors ${
                      dot === index ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {photos.length > 1 ? (
              <div
                className="pointer-events-auto"
                role="group"
                aria-label="Fotos de apartamentos"
              >
                <SceneArrow
                  side="left"
                  label="Foto anterior"
                  onClick={() => step(-1)}
                  enabled={showsPhotos}
                />
                <SceneArrow
                  side="right"
                  label="Próxima foto"
                  onClick={() => step(1)}
                  enabled={showsPhotos}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SceneArrow({
  side,
  label,
  onClick,
  enabled,
}: {
  side: 'left' | 'right';
  label: string;
  onClick: () => void;
  enabled: boolean;
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      tabIndex={enabled ? undefined : -1}
      className={`absolute top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/30 md:size-14 ${
        side === 'left' ? 'left-4 md:left-8' : 'right-4 md:right-8'
      }`}
    >
      <Icon className="size-6" aria-hidden />
    </button>
  );
}
