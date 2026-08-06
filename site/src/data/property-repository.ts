import type { Property, PropertySummary, PropertyType } from '@/domain/property';
import type { SearchQuery, SearchResult } from '@/domain/search';

export interface CityFacet {
  readonly slug: string;
  readonly name: string;
  readonly count: number;
}

export interface NeighborhoodFacet {
  readonly slug: string;
  readonly name: string;
  readonly citySlug: string;
  readonly count: number;
}

export interface TypeFacet {
  readonly type: PropertyType;
  readonly count: number;
}

export interface CatalogFacets {
  readonly cities: readonly CityFacet[];
  readonly neighborhoods: readonly NeighborhoodFacet[];
  readonly types: readonly TypeFacet[];
  readonly features: readonly string[];
  readonly priceRange: { readonly min: number; readonly max: number };
  readonly total: number;
}

/**
 * The single seam between the site and MSYS Imob. Today it is backed by a
 * synced JSON catalog; swapping in the official XML feed or a live API means
 * implementing this interface and nothing else.
 */
export interface PropertyRepository {
  search(query: SearchQuery): Promise<SearchResult<PropertySummary>>;
  findByCode(code: string): Promise<Property | null>;
  findSimilar(property: Property, limit: number): Promise<readonly PropertySummary[]>;
  featured(limit: number): Promise<readonly PropertySummary[]>;
  facets(operation: SearchQuery['operation']): Promise<CatalogFacets>;
  /**
   * Distinct listings in the catalog. Not the sum of the per-operation facets:
   * a listing offered for both sale and rent appears in each of them.
   */
  count(): Promise<number>;
  /** Every listing, for sitemap and static param generation. */
  allSummaries(): Promise<readonly PropertySummary[]>;
}
