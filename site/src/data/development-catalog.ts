import { propertyRepository } from '@/data/catalog-repository';
import { DEVELOPMENT_SEEDS } from '@/data/developments';
import { compareDevelopments, type Development, type DevelopmentSeed } from '@/domain/development';
import type { DevelopmentRepository } from './development-repository';

/**
 * Hydrates a curated record with what MSYS already holds about the linked
 * listing, so photography, broker and price live in a single place.
 */
async function hydrate(seed: DevelopmentSeed): Promise<Development> {
  const listing = seed.listingCode
    ? await propertyRepository.findByCode(seed.listingCode)
    : null;

  // Only an omitted field falls back. An explicit null is a decision — a launch
  // that quotes prices in person must not inherit one unit's asking price.
  return {
    ...seed,
    photos: seed.photos === undefined ? (listing?.photos ?? []) : seed.photos,
    agent: seed.agent === undefined ? (listing?.agent ?? null) : seed.agent,
    priceFrom:
      seed.priceFrom === undefined ? (listing?.pricing.salePrice ?? null) : seed.priceFrom,
  };
}

class DevelopmentCatalog implements DevelopmentRepository {
  /** Hydration hits the catalog once per build, not once per render. */
  private cache: Promise<readonly Development[]> | null = null;

  private load(): Promise<readonly Development[]> {
    this.cache ??= Promise.all(DEVELOPMENT_SEEDS.map(hydrate)).then((developments) =>
      developments.sort(compareDevelopments),
    );
    return this.cache;
  }

  async all(): Promise<readonly Development[]> {
    return this.load();
  }

  async findBySlug(slug: string): Promise<Development | null> {
    const developments = await this.load();
    return developments.find((development) => development.slug === slug) ?? null;
  }

  async featured(limit: number): Promise<readonly Development[]> {
    const developments = await this.load();
    // A card without a cover photo reads as broken on the home page.
    return developments.filter((development) => development.photos.length > 0).slice(0, limit);
  }
}

export const developmentRepository: DevelopmentRepository = new DevelopmentCatalog();
