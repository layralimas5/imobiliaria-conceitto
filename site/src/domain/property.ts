/**
 * Domain model for a real estate listing.
 *
 * Shaped after the data the Conceitto team actually maintains inside MSYS Imob,
 * so the XML adapter can map onto it without the UI ever changing.
 */

export const OPERATIONS = ['venda', 'locacao'] as const;
export type Operation = (typeof OPERATIONS)[number];

/**
 * URL segment for the operation. A listing offered for both sale and rent gets
 * its own segment, mirroring the paths already indexed on the current site.
 */
export type OperationSegment = Operation | 'venda-e-locacao';

export const PROPERTY_TYPES = [
  'casa',
  'apartamento',
  'terreno',
  'comercial',
  'rural',
  'industrial',
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

/**
 * Sub-classification as used by MSYS (e.g. "Alto Padrão", "Sobrado", "Lote").
 * Open-ended on purpose: the client adds subcategories without warning.
 */
export type PropertySubtype = string;

/**
 * The catalog spans 20+ municipalities (Serra Gaúcha plus coastal listings), so
 * cities are data, not a fixed union. The available set is derived from the
 * catalog at build time.
 */
export type CitySlug = string;

export interface PropertyAddress {
  readonly street: string | null;
  readonly number: string | null;
  readonly neighborhood: string;
  readonly neighborhoodSlug: string;
  readonly city: string;
  readonly citySlug: CitySlug;
  readonly state: 'RS';
  readonly zipCode: string | null;
  /** Approximate coordinates. Exact address is withheld until the lead converts. */
  readonly latitude: number | null;
  readonly longitude: number | null;
  /**
   * How far the plotted point can be trusted. `neighborhood` is the norm and
   * the most the site is willing to state; `city` means the neighbourhood could
   * not be resolved and the pin sits on the city centre. The UI has to say which.
   */
  readonly locationPrecision: LocationPrecision | null;
}

export type LocationPrecision = 'neighborhood' | 'city';

/** A listing that can actually be drawn: coordinates present and trusted. */
export interface PlottablePoint {
  readonly latitude: number;
  readonly longitude: number;
  readonly precision: LocationPrecision;
}

export function pointOf(address: PropertyAddress): PlottablePoint | null {
  const { latitude, longitude, locationPrecision } = address;
  if (latitude === null || longitude === null || locationPrecision === null) return null;
  return { latitude, longitude, precision: locationPrecision };
}

export interface PropertyAreas {
  /** Built/usable area in m². The number shown on cards. */
  readonly built: number | null;
  /** Total private area in m². */
  readonly total: number | null;
  /** Land area in m². */
  readonly land: number | null;
}

export interface PropertyRooms {
  readonly bedrooms: number | null;
  readonly suites: number | null;
  readonly bathrooms: number | null;
  readonly parkingSpaces: number | null;
}

export interface PropertyPricing {
  /** Asking price in BRL. Null when the listing is rent-only or price on request. */
  readonly salePrice: number | null;
  /** Monthly rent in BRL. Null when the listing is sale-only. */
  readonly rentPrice: number | null;
  readonly condoFee: number | null;
  /** Yearly IPTU in BRL. */
  readonly propertyTax: number | null;
}

/** The price that matters for the operation the visitor is browsing. */
export function priceFor(
  pricing: PropertyPricing,
  operation: Operation,
): number | null {
  return operation === 'venda' ? pricing.salePrice : pricing.rentPrice;
}

export interface PropertyMedia {
  readonly url: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

export interface PropertyAgent {
  readonly name: string;
  readonly creci: string;
  readonly phone: string | null;
  readonly photoUrl: string | null;
}

export interface Property {
  /** MSYS listing code. Stable, public, and what clients quote on the phone. */
  readonly code: string;
  readonly title: string;
  readonly description: string;
  /** A listing can be offered for sale, for rent, or both. */
  readonly operations: readonly Operation[];
  readonly type: PropertyType;
  readonly subtype: PropertySubtype;
  readonly address: PropertyAddress;
  readonly areas: PropertyAreas;
  readonly rooms: PropertyRooms;
  readonly pricing: PropertyPricing;
  readonly features: readonly string[];
  readonly photos: readonly PropertyMedia[];
  readonly videoUrl: string | null;
  readonly tourUrl: string | null;
  readonly floorPlanUrl: string | null;
  readonly agent: PropertyAgent | null;
  readonly isExclusive: boolean;
  readonly isFeatured: boolean;
  readonly publishedAt: string;
  readonly updatedAt: string;
}

/** Card-sized projection. Listings never need the full record. */
export type PropertySummary = Pick<
  Property,
  | 'code'
  | 'title'
  | 'operations'
  | 'type'
  | 'subtype'
  | 'address'
  | 'areas'
  | 'rooms'
  | 'pricing'
  | 'isExclusive'
> & { readonly coverPhoto: PropertyMedia | null; readonly photoCount: number };

export function toSummary(property: Property): PropertySummary {
  return {
    code: property.code,
    title: property.title,
    operations: property.operations,
    type: property.type,
    subtype: property.subtype,
    address: property.address,
    areas: property.areas,
    rooms: property.rooms,
    pricing: property.pricing,
    isExclusive: property.isExclusive,
    coverPhoto: property.photos[0] ?? null,
    photoCount: property.photos.length,
  };
}

export function operationSegment(
  operations: readonly Operation[],
): OperationSegment {
  const sale = operations.includes('venda');
  const rent = operations.includes('locacao');
  if (sale && rent) return 'venda-e-locacao';
  return rent ? 'locacao' : 'venda';
}

/**
 * Canonical path for a listing. Mirrors the URL pattern already indexed by
 * Google on the current site so the migration is a straight 1:1 redirect.
 *
 * @example /imovel/venda/casa/bento-goncalves/santo-antao/33845
 */
export function propertyPath(
  property: Pick<PropertySummary, 'operations' | 'type' | 'address' | 'code'>,
): string {
  const { operations, type, address, code } = property;
  const segment = operationSegment(operations);
  return `/imovel/${segment}/${type}/${address.citySlug}/${address.neighborhoodSlug}/${code}`;
}

/** The headline number for a card: built area, falling back to land. */
export function displayArea(areas: PropertyAreas): number | null {
  return areas.built ?? areas.total ?? areas.land;
}
