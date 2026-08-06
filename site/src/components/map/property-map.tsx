'use client';

import dynamic from 'next/dynamic';
import type { MapMarker } from './map-marker';

/**
 * Client-only boundary for the map.
 *
 * Leaflet reaches for `window` at import time, so it cannot be prerendered — and
 * keeping it out of the server bundle also keeps ~45 kB of map code off every
 * page that never shows one.
 */
const ListingsMap = dynamic(() => import('./listings-map'), {
  ssr: false,
  loading: () => (
    <div
      className="size-full animate-pulse rounded-card bg-surface-muted"
      aria-hidden
    />
  ),
});

interface PropertyMapProps {
  readonly markers: readonly MapMarker[];
  readonly showUncertainty?: boolean;
  readonly className?: string;
  readonly ariaLabel: string;
}

export function PropertyMap({ markers, ...props }: PropertyMapProps) {
  if (markers.length === 0) return null;
  return <ListingsMap markers={markers} {...props} />;
}
