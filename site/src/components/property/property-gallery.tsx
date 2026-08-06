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

export function PropertyGallery({ photos, title }: PropertyGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const isOpen = lightboxIndex !== null;
  const lightboxRef = useModalFocus<HTMLDivElement>(isOpen);

  const close = useCallback(() => setLightboxIndex(null), []);

  const step = useCallback(
    (delta: number) => {
      setLightboxIndex((current) => {
        if (current === null) return current;
        return (current + delta + photos.length) % photos.length;
      });
    },
    [photos.length],
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

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-card bg-surface-muted text-sm text-ink-faint">
        Sem fotos disponíveis
      </div>
    );
  }

  const [cover, ...rest] = photos;
  const sideThumbs = rest.slice(0, 4);

  return (
    <>
      <div className="grid gap-2 overflow-hidden rounded-card md:grid-cols-[2fr_1fr] md:gap-2">
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="group relative aspect-[4/3] w-full overflow-hidden bg-surface-muted md:aspect-auto md:h-[30rem]"
          aria-label="Abrir galeria de fotos"
        >
          <Image
            src={cover.url}
            alt={cover.alt}
            fill
            priority
            sizes="(min-width: 768px) 66vw, 100vw"
            className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.02]"
          />
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/55 px-3.5 py-2 text-sm text-white backdrop-blur-sm">
            <Expand className="size-4" aria-hidden />
            {photos.length} fotos
          </span>
        </button>

        {sideThumbs.length > 0 ? (
          <div className="hidden grid-cols-2 gap-2 md:grid md:h-[30rem] md:grid-rows-2">
            {sideThumbs.map((photo, index) => {
              const photoIndex = index + 1;
              const isLast = index === sideThumbs.length - 1;
              const hiddenCount = photos.length - sideThumbs.length - 1;
              return (
                <button
                  key={photo.url}
                  type="button"
                  onClick={() => setLightboxIndex(photoIndex)}
                  className="group relative overflow-hidden bg-surface-muted"
                  aria-label={`Ver foto ${photoIndex + 1}`}
                >
                  <Image
                    src={photo.url}
                    alt={photo.alt}
                    fill
                    sizes="25vw"
                    className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
                  />
                  {isLast && hiddenCount > 0 ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-ink/55 text-lg font-medium text-white">
                      +{hiddenCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
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
              onClick={close}
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
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Foto anterior"
                className="absolute left-3 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="size-6" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Próxima foto"
                className="absolute right-3 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <ChevronRight className="size-6" aria-hidden />
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
