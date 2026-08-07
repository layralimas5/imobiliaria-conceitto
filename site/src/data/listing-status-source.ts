import {
  isListingStatus,
  type ListingStatus,
} from '@/domain/listing-status';
import { readStore } from '@/lib/system-store';

/**
 * Where a listing's commercial status comes from.
 *
 * Three sources, in order: what the panel explicitly set for that code, what the
 * listing was cadastrado as, and a demo default. Resolved in one place so the
 * public catalog and the panel can never disagree about whether an imóvel is
 * still for sale.
 */

/**
 * Demo defaults for listings that came down the MSYS feed.
 *
 * Deliberately only ever published states. A synced listing is never *born*
 * vendido here — that would silently shrink the catalog the client is being
 * shown, and it would be a number nobody chose. Closing a deal is something the
 * panel does, on purpose, and then the site follows.
 */
const DEMO_DEFAULTS: readonly ListingStatus[] = ['disponivel', 'disponivel', 'disponivel', 'reservado', 'em-negociacao'];

function demoDefaultFor(code: string): ListingStatus {
  let hash = 0;
  for (let index = 0; index < code.length; index++) {
    hash = (hash * 31 + code.charCodeAt(index)) % 100_000;
  }
  return DEMO_DEFAULTS[hash % DEMO_DEFAULTS.length];
}

/** Every status the panel knows about, keyed by listing code. */
export function listingStatusMap(): ReadonlyMap<string, ListingStatus> {
  const store = readStore();
  const map = new Map<string, ListingStatus>();

  for (const listing of store.listings) {
    if (isListingStatus(listing.status)) map.set(listing.code, listing.status);
  }
  // Overrides win: they are the more recent, deliberate act.
  for (const [code, status] of Object.entries(store.listingStatuses)) {
    if (isListingStatus(status)) map.set(code, status);
  }

  return map;
}

export function statusOf(code: string, map?: ReadonlyMap<string, ListingStatus>): ListingStatus {
  return (map ?? listingStatusMap()).get(code) ?? demoDefaultFor(code);
}
