'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import type { PropertyMedia } from '@/domain/property';
import { useModalFocus } from '@/hooks/use-modal-focus';

interface PropertyGalleryProps {
  photos: readonly PropertyMedia[];
  title: string;
}

/** Cover plus four more, the way a product page shows a shoe. */
const THUMB_COUNT = 5;

export function PropertyGallery({ photos, title }: PropertyGalleryProps) {
  const [activeSlot, setActiveSlot] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const isOpen = lightboxIndex !== null;
  const lightboxRef = useModalFocus<HTMLDivElement>(isOpen);

  const close = useCallback(() => setLightboxIndex(null), []);

  const wrap = useCallback(
    (index: number) => (index + photos.length) % photos.length,
    [photos.length],
  );

  const step = useCallback(
    (delta: number) => {
      setLightboxIndex((current) => (current === null ? current : wrap(current + delta)));
    },
    [wrap],
  );

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    }
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, close, step]);

  // No photography on file: render nothing rather than reserve a screen-high
  // empty frame. The page then opens on the address and the numbers, which is
  // the information the visitor came for anyway.
  if (photos.length === 0) return null;

  /*
   * Each slot in the picker points at a photo. Normally that is one-to-one,
   * but a listing with a single photo on file still gets the full five-slot
   * strip pointing back at it — the product-page shape holds while the client
   * is handing over one image per imóvel, and it fills in on its own the day a
   * folder of real photos lands under `public/imagens/imoveis/<código>/`.
   */
  const slots: readonly number[] =
    photos.length === 1
      ? Array.from({ length: THUMB_COUNT }, () => 0)
      : photos.slice(0, THUMB_COUNT).map((_, index) => index);

  const activeIndex = slots[activeSlot] ?? 0;
  const active = photos[activeIndex];
  const hiddenCount = photos.length - slots.length;

  // Closing the lightbox leaves the stage on whatever photo the visitor
  // navigated to, so the two views never disagree about "where am I".
  function closeAndSync(index: number) {
    const slot = slots.indexOf(index);
    if (slot !== -1) setActiveSlot(slot);
    close();
  }

  function stepStage(delta: number) {
    setActiveSlot((current) => (current + delta + slots.length) % slots.length);
  }

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-card bg-surface-muted sm:aspect-[3/2]">
          <button
            type="button"
            onClick={() => setLightboxIndex(activeIndex)}
            className="absolute inset-0 size-full cursor-zoom-in"
            aria-label={`Ampliar foto ${activeIndex + 1} de ${photos.length}`}
          >
            <Image
              // Keyed so a switch swaps the element instead of mutating one in
              // place, which is what lets the fade actually play.
              key={active.url}
              src={active.url}
              alt={active.alt}
              fill
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="animate-[fade-in_0.35s_var(--ease-out-soft)] object-cover"
            />
          </button>

          <span className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/55 px-3.5 py-2 text-sm text-white backdrop-blur-sm">
            <Expand className="size-4" aria-hidden />
            {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
          </span>

          {photos.length > 1 ? (
            <>
              <ArrowButton side="left" label="Foto anterior" onClick={() => stepStage(-1)} />
              <ArrowButton side="right" label="Próxima foto" onClick={() => stepStage(1)} />
            </>
          ) : null}
        </div>

        {slots.length > 1 ? (
          <ul
            role="list"
            className="grid gap-2.5"
            style={{ gridTemplateColumns: `repeat(${slots.length}, minmax(0, 1fr))` }}
          >
            {slots.map((photoIndex, slot) => {
              const photo = photos[photoIndex];
              const isActive = slot === activeSlot;
              // The last slot doubles as the way into the rest of the set when
              // there is more on file than the strip can show.
              const isOverflow = slot === slots.length - 1 && hiddenCount > 0;
              return (
                <li key={slot}>
                  <button
                    type="button"
                    onClick={() =>
                      isOverflow ? setLightboxIndex(photoIndex) : setActiveSlot(slot)
                    }
                    aria-pressed={isOverflow ? undefined : isActive}
                    aria-label={
                      isOverflow
                        ? `Ver as outras ${hiddenCount + 1} fotos`
                        : `Ver foto ${photoIndex + 1}`
                    }
                    className={`relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface-muted transition-[opacity,box-shadow] ${
                      isActive
                        ? 'opacity-100 shadow-[inset_0_0_0_2px_var(--color-brand-700)]'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 1024px) 12vw, 20vw"
                      className="object-cover"
                    />
                    {isOverflow ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-ink/60 text-sm font-medium text-white">
                        +{hiddenCount + 1}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      {isOpen ? (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-50 flex flex-col bg-ink/95"
          role="dialog"
          aria-modal="true"
          aria-label={`Fotos de ${title}`}
        >
          <div className="flex items-center justify-between px-5 py-4 text-white">
            <p className="text-sm">
              {lightboxIndex + 1} / {photos.length}
            </p>
            <button
              type="button"
              onClick={() => closeAndSync(lightboxIndex)}
              aria-label="Fechar galeria"
              className="inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>

          <div className="relative flex-1">
            <Image
              key={photos[lightboxIndex].url}
              src={photos[lightboxIndex].url}
              alt={photos[lightboxIndex].alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {photos.length > 1 ? (
            <>
              <ArrowButton side="left" label="Foto anterior" onClick={() => step(-1)} large />
              <ArrowButton side="right" label="Próxima foto" onClick={() => step(1)} large />
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function ArrowButton({
  side,
  label,
  onClick,
  large = false,
}: {
  side: 'left' | 'right';
  label: string;
  onClick: () => void;
  large?: boolean;
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  // Two skins, written out in full: conflicting Tailwind utilities resolve by
  // their order in the stylesheet, not in the class attribute, so a shared base
  // plus an override would not reliably win.
  const skin = large
    ? 'size-12 bg-white/10 text-white hover:bg-white/20'
    : 'size-10 bg-white/85 text-ink shadow-sm hover:bg-white';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
        side === 'left' ? 'left-3' : 'right-3'
      } ${skin}`}
    >
      <Icon className={large ? 'size-6' : 'size-5'} aria-hidden />
    </button>
  );
}
