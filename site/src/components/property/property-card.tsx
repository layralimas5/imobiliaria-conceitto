import Image from 'next/image';
import Link from 'next/link';
import { Bath, BedDouble, Car, Maximize } from 'lucide-react';
import {
  displayArea,
  priceFor,
  propertyPath,
  type Operation,
  type PropertySummary,
} from '@/domain/property';
import { TYPE_LABELS } from '@/domain/search';
import { formatArea, formatPrice } from '@/lib/format';

interface PropertyCardProps {
  property: PropertySummary;
  operation: Operation;
  /** Card index in the grid — the first few load eagerly for a better LCP. */
  priority?: boolean;
  className?: string;
}

export function PropertyCard({
  property,
  operation,
  priority = false,
  className = '',
}: PropertyCardProps) {
  const { address, rooms, coverPhoto, photoCount } = property;
  const price = priceFor(property.pricing, operation);
  const area = formatArea(displayArea(property.areas));
  const subtypeLabel = property.subtype.replace(/-/g, ' ');

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card-hover ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        {coverPhoto ? (
          <Image
            src={coverPhoto.url}
            alt={coverPhoto.alt}
            fill
            sizes="(min-width: 1280px) 380px, (min-width: 768px) 45vw, 92vw"
            priority={priority}
            className="object-cover transition-transform duration-700 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-ink-faint">
            Sem foto
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-wrap gap-1.5">
            {property.isExclusive ? (
              <span className="rounded-full bg-bronze-600/95 px-2.5 py-1 text-[0.6875rem] font-medium uppercase tracking-wider text-white">
                Exclusivo
              </span>
            ) : null}
            {property.operations.length > 1 ? (
              <span className="rounded-full bg-brand-700/90 px-2.5 py-1 text-[0.6875rem] font-medium uppercase tracking-wider text-white">
                Venda e locação
              </span>
            ) : null}
          </div>
          {photoCount > 1 ? (
            <span className="rounded-full bg-black/55 px-2 py-1 text-[0.6875rem] font-medium text-white backdrop-blur-sm">
              {photoCount} fotos
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-eyebrow">
          {TYPE_LABELS[property.type]}
          {subtypeLabel && subtypeLabel !== 'padrao' ? ` · ${subtypeLabel}` : ''}
        </p>

        <h3 className="mt-2 text-base font-medium leading-snug">
          <Link href={propertyPath(property)} className="after:absolute after:inset-0">
            <span className="line-clamp-2">
              {address.neighborhood ? `${address.neighborhood}, ` : ''}
              {address.city}
            </span>
          </Link>
        </h3>

        <p className="mt-1 line-clamp-1 text-sm text-ink-soft">{property.title}</p>

        {(rooms.bedrooms ?? rooms.bathrooms ?? rooms.parkingSpaces ?? area) !== null ? (
          <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-soft">
            {area ? (
              <li className="flex items-center gap-1.5">
                <Maximize className="size-4 text-ink-faint" aria-hidden />
                <span>{area}</span>
              </li>
            ) : null}
            {rooms.bedrooms ? (
              <li className="flex items-center gap-1.5">
                <BedDouble className="size-4 text-ink-faint" aria-hidden />
                <span>
                  {rooms.bedrooms}
                  <span className="sr-only"> dormitórios</span>
                </span>
              </li>
            ) : null}
            {rooms.bathrooms ? (
              <li className="flex items-center gap-1.5">
                <Bath className="size-4 text-ink-faint" aria-hidden />
                <span>
                  {rooms.bathrooms}
                  <span className="sr-only"> banheiros</span>
                </span>
              </li>
            ) : null}
            {rooms.parkingSpaces ? (
              <li className="flex items-center gap-1.5">
                <Car className="size-4 text-ink-faint" aria-hidden />
                <span>
                  {rooms.parkingSpaces}
                  <span className="sr-only"> vagas</span>
                </span>
              </li>
            ) : null}
          </ul>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className="text-lg font-medium tracking-tight">
            {formatPrice(price)}
            {operation === 'locacao' && price !== null ? (
              <span className="text-sm font-normal text-ink-faint">/mês</span>
            ) : null}
          </p>
          <p className="text-xs text-ink-faint">Cód. {property.code}</p>
        </div>
      </div>
    </article>
  );
}
