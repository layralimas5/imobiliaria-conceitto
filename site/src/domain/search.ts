import { z } from 'zod';
import {
  OPERATIONS,
  PROPERTY_TYPES,
  priceFor,
  type Operation,
  type Property,
  type PropertyType,
} from './property';

export const SORT_OPTIONS = [
  'relevancia',
  'menor-preco',
  'maior-preco',
  'maior-area',
  'mais-recente',
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const SORT_LABELS: Record<SortOption, string> = {
  relevancia: 'Relevância',
  'menor-preco': 'Menor preço',
  'maior-preco': 'Maior preço',
  'maior-area': 'Maior área',
  'mais-recente': 'Mais recentes',
};

/**
 * Search state lives in the URL. Every filter combination is shareable,
 * bookmarkable and indexable — which is the whole SEO play for a 1490-listing
 * catalog.
 */
export const searchQuerySchema = z.object({
  operation: z.enum(OPERATIONS).default('venda'),
  city: z.string().trim().min(1).max(60).optional(),
  neighborhoods: z.array(z.string()).default([]),
  types: z.array(z.enum(PROPERTY_TYPES)).default([]),
  minPrice: z.number().int().nonnegative().optional(),
  maxPrice: z.number().int().nonnegative().optional(),
  minArea: z.number().int().nonnegative().optional(),
  maxArea: z.number().int().nonnegative().optional(),
  bedrooms: z.number().int().min(1).max(5).optional(),
  bathrooms: z.number().int().min(1).max(5).optional(),
  parkingSpaces: z.number().int().min(1).max(5).optional(),
  features: z.array(z.string()).default([]),
  exclusiveOnly: z.boolean().default(false),
  /** Free text over code, title and neighborhood. */
  term: z.string().trim().max(120).optional(),
  sort: z.enum(SORT_OPTIONS).default('relevancia'),
  page: z.number().int().min(1).default(1),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

export interface SearchResult<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

export const DEFAULT_PAGE_SIZE = 24;

/** Parses `URLSearchParams`-shaped input, discarding anything malformed. */
export function parseSearchQuery(
  params: Record<string, string | string[] | undefined>,
): SearchQuery {
  const list = (value: string | string[] | undefined): string[] => {
    if (Array.isArray(value)) return value.flatMap((v) => v.split(','));
    if (typeof value === 'string' && value.length > 0) return value.split(',');
    return [];
  };
  const int = (value: string | string[] | undefined): number | undefined => {
    const raw = Array.isArray(value) ? value[0] : value;
    if (raw === undefined || raw === '') return undefined;
    const parsed = Number.parseInt(raw, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  };
  const single = (value: string | string[] | undefined): string | undefined =>
    Array.isArray(value) ? value[0] : value;

  const result = searchQuerySchema.safeParse({
    operation: single(params.operation),
    city: single(params.city),
    neighborhoods: list(params.bairros),
    types: list(params.tipos),
    minPrice: int(params.preco_min),
    maxPrice: int(params.preco_max),
    minArea: int(params.area_min),
    maxArea: int(params.area_max),
    bedrooms: int(params.quartos),
    bathrooms: int(params.banheiros),
    parkingSpaces: int(params.vagas),
    features: list(params.caracteristicas),
    exclusiveOnly: single(params.exclusivos) === '1',
    term: single(params.q),
    sort: single(params.ordem),
    page: int(params.pagina),
  });

  return result.success ? result.data : searchQuerySchema.parse({});
}

/** Rebuilds the querystring, omitting defaults so URLs stay clean. */
export function buildSearchParams(query: SearchQuery): URLSearchParams {
  const params = new URLSearchParams();
  const setList = (key: string, values: readonly string[]): void => {
    if (values.length > 0) params.set(key, values.join(','));
  };
  const setInt = (key: string, value: number | undefined): void => {
    if (value !== undefined) params.set(key, String(value));
  };

  if (query.city) params.set('city', query.city);
  setList('bairros', query.neighborhoods);
  setList('tipos', query.types);
  setInt('preco_min', query.minPrice);
  setInt('preco_max', query.maxPrice);
  setInt('area_min', query.minArea);
  setInt('area_max', query.maxArea);
  setInt('quartos', query.bedrooms);
  setInt('banheiros', query.bathrooms);
  setInt('vagas', query.parkingSpaces);
  setList('caracteristicas', query.features);
  if (query.exclusiveOnly) params.set('exclusivos', '1');
  if (query.term) params.set('q', query.term);
  if (query.sort !== 'relevancia') params.set('ordem', query.sort);
  if (query.page > 1) params.set('pagina', String(query.page));

  return params;
}

/** Number of filters the user actively applied, for the "limpar filtros" badge. */
export function countActiveFilters(query: SearchQuery): number {
  let count = 0;
  if (query.city) count += 1;
  count += query.neighborhoods.length;
  count += query.types.length;
  if (query.minPrice !== undefined || query.maxPrice !== undefined) count += 1;
  if (query.minArea !== undefined || query.maxArea !== undefined) count += 1;
  if (query.bedrooms !== undefined) count += 1;
  if (query.bathrooms !== undefined) count += 1;
  if (query.parkingSpaces !== undefined) count += 1;
  count += query.features.length;
  if (query.exclusiveOnly) count += 1;
  if (query.term) count += 1;
  return count;
}

export const OPERATION_LABELS: Record<Operation, string> = {
  venda: 'Comprar',
  locacao: 'Alugar',
};

export const TYPE_LABELS: Record<PropertyType, string> = {
  casa: 'Casa',
  apartamento: 'Apartamento',
  terreno: 'Terreno',
  comercial: 'Comercial',
  rural: 'Rural',
  industrial: 'Industrial',
};

export const TYPE_LABELS_PLURAL: Record<PropertyType, string> = {
  casa: 'Casas',
  apartamento: 'Apartamentos',
  terreno: 'Terrenos',
  comercial: 'Imóveis comerciais',
  rural: 'Imóveis rurais',
  industrial: 'Imóveis industriais',
};

/**
 * In-memory filtering. Runs against the mock adapter today and stays useful
 * later as the reference implementation the MSYS adapter must match.
 */
export function matchesQuery(property: Property, query: SearchQuery): boolean {
  const { address, areas, rooms, pricing } = property;

  if (!property.operations.includes(query.operation)) return false;
  if (query.city && address.citySlug !== query.city) return false;
  if (
    query.neighborhoods.length > 0 &&
    !query.neighborhoods.includes(address.neighborhoodSlug)
  ) {
    return false;
  }
  if (query.types.length > 0 && !query.types.includes(property.type)) return false;

  const price = priceFor(pricing, query.operation);
  if (query.minPrice !== undefined && (price === null || price < query.minPrice)) {
    return false;
  }
  if (query.maxPrice !== undefined && (price === null || price > query.maxPrice)) {
    return false;
  }

  const area = areas.built ?? areas.total ?? areas.land;
  if (query.minArea !== undefined && (area === null || area < query.minArea)) return false;
  if (query.maxArea !== undefined && (area === null || area > query.maxArea)) return false;

  if (query.bedrooms !== undefined && (rooms.bedrooms ?? 0) < query.bedrooms) return false;
  if (query.bathrooms !== undefined && (rooms.bathrooms ?? 0) < query.bathrooms) {
    return false;
  }
  if (
    query.parkingSpaces !== undefined &&
    (rooms.parkingSpaces ?? 0) < query.parkingSpaces
  ) {
    return false;
  }

  if (query.features.length > 0) {
    const owned = new Set(property.features.map((f) => f.toLowerCase()));
    if (!query.features.every((f) => owned.has(f.toLowerCase()))) return false;
  }

  if (query.exclusiveOnly && !property.isExclusive) return false;

  if (query.term) {
    const haystack = [
      property.code,
      property.title,
      property.description,
      address.neighborhood,
      address.city,
    ]
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(query.term.toLowerCase())) return false;
  }

  return true;
}

export function compareBySort(sort: SortOption, operation: Operation) {
  return (a: Property, b: Property): number => {
    const priceA = priceFor(a.pricing, operation);
    const priceB = priceFor(b.pricing, operation);
    switch (sort) {
      case 'menor-preco':
        return (priceA ?? Infinity) - (priceB ?? Infinity);
      case 'maior-preco':
        return (priceB ?? -Infinity) - (priceA ?? -Infinity);
      case 'maior-area':
        return (
          (b.areas.built ?? b.areas.land ?? 0) - (a.areas.built ?? a.areas.land ?? 0)
        );
      case 'mais-recente':
        return b.publishedAt.localeCompare(a.publishedAt);
      case 'relevancia':
      default:
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        if (a.isExclusive !== b.isExclusive) return a.isExclusive ? -1 : 1;
        return b.publishedAt.localeCompare(a.publishedAt);
    }
  };
}
