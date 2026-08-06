import { formatPriceCompact } from '@/lib/format';
import {
  displayArea,
  pointOf,
  priceFor,
  propertyPath,
  type LocationPrecision,
  type Operation,
  type PropertySummary,
} from '@/domain/property';

/**
 * A listing reduced to what a pin needs. Built on the server so the map bundle
 * never receives the full catalog record.
 */
export interface MapMarker {
  readonly id: string;
  readonly latitude: number;
  readonly longitude: number;
  /** Shown inside the pin. Compact on purpose — it has to fit. */
  readonly label: string;
  readonly title: string;
  readonly subtitle: string;
  readonly href: string;
  readonly precision: LocationPrecision;
}

export function toMapMarker(
  property: PropertySummary,
  operation: Operation,
): MapMarker | null {
  const point = pointOf(property.address);
  if (!point) return null;

  const area = displayArea(property.areas);
  const bedrooms = property.rooms.bedrooms;
  const details = [
    area === null ? null : `${area} m²`,
    bedrooms === null ? null : `${bedrooms} dorm.`,
  ].filter((part): part is string => part !== null);

  return {
    id: property.code,
    latitude: point.latitude,
    longitude: point.longitude,
    precision: point.precision,
    label: formatPriceCompact(priceFor(property.pricing, operation)),
    title: property.title,
    subtitle: [property.address.neighborhood, ...details].join(' · '),
    href: propertyPath(property),
  };
}

export function toMapMarkers(
  properties: readonly PropertySummary[],
  operation: Operation,
): readonly MapMarker[] {
  return properties
    .map((property) => toMapMarker(property, operation))
    .filter((marker): marker is MapMarker => marker !== null);
}

/**
 * The site never claims more precision than it has. Neighbourhood-level is the
 * norm; a city-level pin has to say so, or a visitor will read it as the address.
 */
export const PRECISION_NOTE: Record<LocationPrecision, string> = {
  neighborhood: 'Localização aproximada, no nível do bairro.',
  city: 'Localização aproximada, no nível da cidade.',
};
