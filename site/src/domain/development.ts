/**
 * Domain model for a development (empreendimento).
 *
 * MSYS Imob has no "development" entity: a launch lives there as one ordinary
 * listing with the whole pitch dumped into the description field. The editorial
 * content below is therefore curated by hand, while imagery, broker and price
 * stay linked to the MSYS listing so the site never holds a second copy of data
 * the team already maintains.
 */

import type { CitySlug, PropertyAgent, PropertyMedia } from '@/domain/property';

export const DEVELOPMENT_STAGES = ['lancamento', 'em-obras', 'pronto'] as const;
export type DevelopmentStage = (typeof DEVELOPMENT_STAGES)[number];

export const STAGE_LABELS: Record<DevelopmentStage, string> = {
  lancamento: 'Lançamento',
  'em-obras': 'Em obras',
  pronto: 'Pronto para morar',
};

/** Sort order for listings: what is selling now comes first. */
const STAGE_ORDER: Record<DevelopmentStage, number> = {
  lancamento: 0,
  'em-obras': 1,
  pronto: 2,
};

export type DevelopmentUse = 'residencial' | 'comercial';

export const USE_LABELS: Record<DevelopmentUse, string> = {
  residencial: 'Residencial',
  comercial: 'Comercial',
};

/** A headline number: "27 pavimentos", "4 apartamentos por andar". */
export interface DevelopmentFact {
  readonly label: string;
  readonly value: string;
}

/**
 * One floor plan on offer. Every measure is nullable because the source
 * material describes some launches by exact area and others by range only.
 */
export interface DevelopmentUnitType {
  readonly name: string;
  readonly bedrooms: number | null;
  readonly suites: number | null;
  readonly parkingSpaces: number | null;
  /** Private area in m². Equals `areaTo` when a single plan is offered. */
  readonly areaFrom: number | null;
  readonly areaTo: number | null;
  readonly priceFrom: number | null;
}

export interface DevelopmentLocation {
  /** Street and number, when the builder discloses it. */
  readonly addressLine: string | null;
  readonly neighborhood: string;
  readonly city: string;
  readonly citySlug: CitySlug;
  readonly state: 'RS';
  /** Free-text query for the Google Maps deep link. */
  readonly mapsQuery: string;
  /** One line on what is around, written for the buyer, not for the map. */
  readonly surroundings: string | null;
}

/**
 * Whether the photography on the page is the definitive material.
 * `pending` renders an explicit notice instead of pretending otherwise.
 */
export type MediaStatus = 'final' | 'pending';

export interface Development {
  readonly slug: string;
  readonly name: string;
  readonly tagline: string;
  readonly stage: DevelopmentStage;
  readonly use: DevelopmentUse;
  /** Construction company, when known. */
  readonly builder: string | null;
  readonly location: DevelopmentLocation;
  /** One paragraph for cards, meta description and the hero. */
  readonly summary: string;
  /** The narrative body, one string per paragraph. */
  readonly story: readonly string[];
  readonly facts: readonly DevelopmentFact[];
  readonly unitTypes: readonly DevelopmentUnitType[];
  /** Shared leisure and convenience areas. */
  readonly amenities: readonly string[];
  /** Construction and finishing specs that justify the price. */
  readonly specs: readonly string[];
  readonly priceFrom: number | null;
  readonly deliveryLabel: string | null;
  readonly photos: readonly PropertyMedia[];
  readonly mediaStatus: MediaStatus;
  /** MSYS listing backing this development, when there is one. */
  readonly listingCode: string | null;
  readonly agent: PropertyAgent | null;
  readonly updatedAt: string;
}

/**
 * Curated shape. An omitted field falls back to the linked MSYS listing; an
 * explicit `null` is a decision, and stays null (a launch that only quotes
 * prices in person, for instance).
 */
export type DevelopmentSeed = Omit<Development, 'photos' | 'agent' | 'priceFrom'> & {
  readonly photos?: readonly PropertyMedia[];
  readonly agent?: PropertyAgent | null;
  readonly priceFrom?: number | null;
};

export function developmentPath(development: Pick<Development, 'slug'>): string {
  return `/lancamentos/${development.slug}`;
}

export function compareDevelopments(a: Development, b: Development): number {
  const byStage = STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage];
  return byStage !== 0 ? byStage : a.name.localeCompare(b.name, 'pt-BR');
}

/** "84 a 130 m²" or "78,51 m²", across every plan on offer. */
export function unitAreaRange(
  unitTypes: readonly DevelopmentUnitType[],
): { readonly min: number; readonly max: number } | null {
  const areas = unitTypes
    .flatMap((unit) => [unit.areaFrom, unit.areaTo])
    .filter((area): area is number => area !== null);
  if (areas.length === 0) return null;
  return { min: Math.min(...areas), max: Math.max(...areas) };
}

/** "2 e 3 dormitórios" for the card line, derived instead of typed twice. */
export function bedroomRangeLabel(
  unitTypes: readonly DevelopmentUnitType[],
): string | null {
  const counts = [
    ...new Set(
      unitTypes
        .map((unit) => unit.bedrooms)
        .filter((bedrooms): bedrooms is number => bedrooms !== null),
    ),
  ].sort((a, b) => a - b);

  if (counts.length === 0) return null;
  if (counts.length === 1) {
    return `${counts[0]} ${counts[0] === 1 ? 'dormitório' : 'dormitórios'}`;
  }
  return `${counts.slice(0, -1).join(', ')} e ${counts.at(-1)} dormitórios`;
}
