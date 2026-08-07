import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ImageIcon, MessageCircle } from 'lucide-react';
import { developmentPath, type Development } from '@/domain/development';
import { developmentWhatsapp } from '@/lib/site-config';

interface DevelopmentFeatureProps {
  development: Development;
  /** Photography leads on odd rows and follows on even ones. */
  reversed?: boolean;
  priority?: boolean;
}

/**
 * A launch presented at full width instead of as a card.
 *
 * A card can carry a name and a neighbourhood; a launch has to sell a way of
 * living, so the photograph gets real size and the copy gets room for the
 * handful of facts that actually decide a visit. Rows alternate sides so a page
 * of them reads as a sequence rather than a list.
 */
export function DevelopmentFeature({
  development,
  reversed = false,
  priority = false,
}: DevelopmentFeatureProps) {
  const cover = development.photos[0] ?? null;
  const href = developmentPath(development);

  return (
    <article className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={reversed ? 'lg:order-2' : undefined}>
        <h2 className="text-display text-4xl md:text-5xl">{development.tagline}</h2>

        <Link
          href={href}
          aria-label={`Ver o empreendimento ${development.name}`}
          className="group relative mt-8 block aspect-[4/3] overflow-hidden rounded-card bg-surface-muted"
        >
          {cover ? (
            <>
              <Image
                src={cover.url}
                alt={cover.alt}
                fill
                priority={priority}
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-105"
              />
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/70 to-transparent"
              />
              <span className="absolute bottom-5 left-5 text-xs font-medium uppercase tracking-[0.16em] text-white">
                {development.location.neighborhood}, {development.location.city}
              </span>
            </>
          ) : (
            /*
             * No photography on file yet. A dark plate reads as a broken image,
             * so the frame says what it is instead — the launch material for
             * these arrives from the builder, and the folder fills in later.
             */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 border border-dashed border-line-strong bg-surface-muted px-6 text-center">
              <ImageIcon className="size-7 text-ink-faint" aria-hidden strokeWidth={1.5} />
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-ink-faint">
                {development.location.neighborhood}, {development.location.city}
              </span>
              <span className="text-sm text-ink-faint">Fotos em breve</span>
            </div>
          )}
        </Link>
      </div>

      <div className={reversed ? 'lg:order-1' : undefined}>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-bronze-600">
          {development.name}
        </p>
        <span aria-hidden className="mt-2 block h-px w-12 bg-bronze-400" />

        <p className="mt-6 text-base leading-relaxed text-ink-soft">
          {development.summary}
        </p>

        {development.highlights.length > 0 ? (
          <ul className="mt-8">
            {development.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-start gap-3.5 border-b border-line py-3 last:border-b-0"
              >
                <ArrowRight
                  className="mt-0.5 size-4 shrink-0 text-brand-700"
                  aria-hidden
                  strokeWidth={2}
                />
                <span className="text-sm text-ink-soft">{highlight}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <a
          href={developmentWhatsapp(development)}
          target="_blank"
          rel="noreferrer noopener"
          className="pulse-on-hover-tight mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-brand-700 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-600"
        >
          <MessageCircle className="size-4" aria-hidden />
          Fale com nossos corretores
        </a>
      </div>
    </article>
  );
}

