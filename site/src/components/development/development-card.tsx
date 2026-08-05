import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Maximize } from 'lucide-react';
import {
  bedroomRangeLabel,
  developmentPath,
  STAGE_LABELS,
  unitAreaRange,
  type Development,
} from '@/domain/development';
import { formatAreaRange, formatPriceCompact } from '@/lib/format';

interface DevelopmentCardProps {
  development: Development;
  /** Card index in the grid — the first few load eagerly for a better LCP. */
  priority?: boolean;
  className?: string;
}

export function DevelopmentCard({
  development,
  priority = false,
  className = '',
}: DevelopmentCardProps) {
  const cover = development.photos[0] ?? null;
  const areas = unitAreaRange(development.unitTypes);
  const bedrooms = bedroomRangeLabel(development.unitTypes);

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card-hover ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-forest-900">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt}
            fill
            sizes="(min-width: 1280px) 400px, (min-width: 768px) 45vw, 92vw"
            priority={priority}
            className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center px-6 text-center">
            <p className="text-display text-3xl text-white/90">{development.name}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/50">
              Material em breve
            </p>
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-bronze-600/95 px-2.5 py-1 text-[0.6875rem] font-medium uppercase tracking-wider text-white">
          {STAGE_LABELS[development.stage]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-display text-2xl">
          <Link href={developmentPath(development)} className="after:absolute after:inset-0">
            {development.name}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">
          {development.tagline}
        </p>

        <p className="mt-4 flex items-center gap-1.5 text-sm text-ink-soft">
          <MapPin className="size-4 shrink-0 text-ink-faint" aria-hidden />
          {development.location.neighborhood}, {development.location.city}
        </p>

        {areas || bedrooms ? (
          <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-soft">
            {areas ? (
              <li className="flex items-center gap-1.5">
                <Maximize className="size-4 text-ink-faint" aria-hidden />
                {formatAreaRange(areas.min, areas.max)}
              </li>
            ) : null}
            {bedrooms ? <li>{bedrooms}</li> : null}
          </ul>
        ) : null}

        <div className="mt-auto pt-5">
          {development.priceFrom !== null ? (
            <p className="text-lg font-medium tracking-tight">
              <span className="text-sm font-normal text-ink-faint">a partir de </span>
              {formatPriceCompact(development.priceFrom)}
            </p>
          ) : (
            <p className="text-lg font-medium tracking-tight">Valores sob consulta</p>
          )}
        </div>
      </div>
    </article>
  );
}
