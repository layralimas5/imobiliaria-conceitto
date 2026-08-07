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
 *
 * Status is not filtered here: `catalog-repository` applies it to every listing
 * at once, synced and manual alike, so there is a single place that decides what
 * the site publishes.
 */
export async function manualListings(): Promise<readonly Property[]> {
  return (await readStore()).listings.map(toProperty);
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
      street: listing.street || null,
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
    areas: { built: listing.area, total: listing.area, land: listing.landArea },
    rooms: {
      bedrooms: listing.bedrooms,
      suites: listing.suites,
      bathrooms: listing.bathrooms,
      parkingSpaces: listing.parkingSpaces,
    },
    pricing: {
      salePrice: listing.operation === 'venda' ? listing.price : null,
      rentPrice: listing.operation === 'locacao' ? listing.price : null,
      condoFee: listing.condoFee,
      propertyTax: listing.propertyTax,
    },
    features: listing.features,
    /*
     * Photos uploaded through the panel are served by `/api/foto`, not out of
     * `public/`: on a serverless host nothing can be written into the deployed
     * bundle. Listings registered before that change fall back to the folder
     * convention every synced listing still uses.
     */
    photos: (listing.photos?.length
      ? listing.photos.map((key) => ({
          url: `/api/foto/${key.split('/').map(encodeURIComponent).join('/')}`,
          alt: '',
          width: 1024,
          height: 683,
        }))
      : listingPhotos(listing.code)
    ).map((photo) => ({
      ...photo,
      alt: photo.alt || `${listing.title} — ${listing.neighborhood}`,
    })),
    videoUrl: listing.videoUrl || null,
    tourUrl: null,
    floorPlanUrl: null,
    agent: listing.agent ? { name: listing.agent, creci: '', phone: null, photoUrl: null } : null,
    isExclusive: listing.isExclusive,
    isFeatured: false,
    publishedAt: stamp,
    updatedAt: stamp,
  };
}
