import type { CatalogFacets } from '@/data/property-repository';

export interface ResolvedPlace {
  readonly citySlug: string;
  readonly cityName: string;
  readonly neighborhoodSlug?: string;
  readonly neighborhoodName?: string;
}

/**
 * Resolves the legacy MSYS place slugs that Google already has indexed:
 *
 *   farroupilha-rs                 → city
 *   centro-bento-goncalves-rs      → neighborhood + city
 *
 * Longest city match wins, so "centro-bento-goncalves-rs" is not mistaken for a
 * neighborhood named "centro-bento".
 */
export function resolvePlaceSlug(
  slug: string,
  facets: CatalogFacets,
): ResolvedPlace | null {
  const normalized = slug.toLowerCase().replace(/-rs$/, '');

  const cityMatches = facets.cities
    .filter((city) => normalized === city.slug || normalized.endsWith(`-${city.slug}`))
    .sort((a, b) => b.slug.length - a.slug.length);

  const city = cityMatches[0];
  if (!city) return null;

  if (normalized === city.slug) {
    return { citySlug: city.slug, cityName: city.name };
  }

  const neighborhoodSlug = normalized.slice(0, -(city.slug.length + 1));
  const neighborhood = facets.neighborhoods.find(
    (facet) => facet.citySlug === city.slug && facet.slug === neighborhoodSlug,
  );
  if (!neighborhood) return null;

  return {
    citySlug: city.slug,
    cityName: city.name,
    neighborhoodSlug: neighborhood.slug,
    neighborhoodName: neighborhood.name,
  };
}

export function placeSlugFor(citySlug: string, neighborhoodSlug?: string): string {
  return neighborhoodSlug
    ? `${neighborhoodSlug}-${citySlug}-rs`
    : `${citySlug}-rs`;
}
