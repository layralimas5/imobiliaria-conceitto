import type { CitySlug, Property, PropertyType } from '@/domain/property';
import { slugify } from '@/lib/format';
import { listingPhotos } from '@/lib/local-media';
import { readStore, type StoredListing } from '@/lib/system-store';

/**
 * Listings created in the panel, shaped into the same `Property` the rest of
 * the site consumes.
 *
 * They join the synced MSYS catalog rather than living beside it, so a listing
 * registered by the team is indistinguishable from one that came down the feed
 * — which is the whole point of being able to register one.
 */
export function manualListings(): readonly Property[] {
  return readStore().listings.map(toProperty);
}

function toProperty(listing: StoredListing): Property {
  const stamp = new Date(listing.createdAt).toISOString();

  return {
    code: listing.code,
    title: listing.title,
    description: listing.description,
    operations: [listing.operation],
    type: listing.type as PropertyType,
    subtype: 'padrao',
    address: {
      street: null,
      number: null,
      neighborhood: listing.neighborhood,
      neighborhoodSlug: slugify(listing.neighborhood),
      city: listing.city,
      citySlug: slugify(listing.city) as CitySlug,
      state: 'RS',
      zipCode: null,
      // No geocoding step in the panel, so the map stays off for these rather
      // than dropping a pin somewhere plausible and wrong.
      latitude: null,
      longitude: null,
      locationPrecision: 'neighborhood',
    },
    areas: { built: listing.area, total: listing.area, land: null },
    rooms: {
      bedrooms: listing.bedrooms,
      suites: listing.suites,
      bathrooms: listing.bathrooms,
      parkingSpaces: listing.parkingSpaces,
    },
    pricing: {
      salePrice: listing.operation === 'venda' ? listing.price : null,
      rentPrice: listing.operation === 'locacao' ? listing.price : null,
      condoFee: null,
      propertyTax: null,
    },
    features: listing.features,
    // Same folder convention as every other listing: `imagens/imoveis/<código>`.
    photos: listingPhotos(listing.code).map((photo) => ({
      ...photo,
      alt: photo.alt || `${listing.title} — ${listing.neighborhood}`,
    })),
    videoUrl: null,
    tourUrl: null,
    floorPlanUrl: null,
    agent: null,
    isExclusive: listing.isExclusive,
    isFeatured: false,
    publishedAt: stamp,
    updatedAt: stamp,
  };
}
