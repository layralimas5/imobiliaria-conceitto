'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import L from 'leaflet';
import { MapContainer, Circle, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { PRECISION_NOTE, type MapMarker } from './map-marker';

/**
 * Tiles come from OpenStreetMap by default: no key, no billing, good enough for
 * staging and for the traffic this site sees today. `NEXT_PUBLIC_MAP_TILE_URL`
 * swaps in a keyed provider (MapTiler, Carto) the day volume justifies it,
 * without touching this component.
 */
const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ??
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ??
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/** Radius, in metres, of the uncertainty circle drawn around a single listing. */
const NEIGHBORHOOD_RADIUS_M = 600;
const CITY_RADIUS_M = 2500;

interface ListingsMapProps {
  readonly markers: readonly MapMarker[];
  /** Drawn around the point when a single listing is shown, to state the imprecision. */
  readonly showUncertainty?: boolean;
  readonly className?: string;
  readonly ariaLabel: string;
}

export default function ListingsMap({
  markers,
  showUncertainty = false,
  className = '',
  ariaLabel,
}: ListingsMapProps) {
  const bounds = useMemo(() => boundsOf(markers), [markers]);
  if (!bounds) return null;

  const single = markers.length === 1 ? markers[0] : null;

  return (
    <div className={className}>
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [40, 40], maxZoom: single ? 15 : 16 }}
        scrollWheelZoom={false}
        className="size-full rounded-card"
        // The map is a supplement to the address text above it, never the only
        // way to get the information.
        aria-label={ariaLabel}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={19} />
        <FitToMarkers markers={markers} />

        {single && showUncertainty ? (
          <Circle
            center={[single.latitude, single.longitude]}
            radius={
              single.precision === 'city' ? CITY_RADIUS_M : NEIGHBORHOOD_RADIUS_M
            }
            // Literal hex, not a token: Leaflet writes these as SVG presentation
            // attributes, which do not resolve CSS custom properties.
            pathOptions={{
              color: '#2c5446',
              fillColor: '#2c5446',
              fillOpacity: 0.08,
              weight: 1,
            }}
          />
        ) : null}

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            icon={pinFor(marker.label)}
            keyboard
            title={`${marker.title} — ${marker.label}`}
            alt={`${marker.title} em ${marker.subtitle}`}
          >
            <Popup>
              <Link
                href={marker.href}
                className="block max-w-[15rem] no-underline"
                prefetch={false}
              >
                <span className="block text-sm font-medium text-ink">{marker.title}</span>
                <span className="mt-0.5 block text-xs text-ink-soft">
                  {marker.subtitle}
                </span>
                <span className="mt-1.5 block text-sm font-semibold text-forest-700">
                  {marker.label}
                </span>
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <p className="mt-2 text-xs text-ink-faint">
        {PRECISION_NOTE[worstPrecision(markers)]} O endereço completo é informado pelo
        corretor.
      </p>
    </div>
  );
}

/**
 * Refits when the marker set changes — the search map is reused across pages and
 * filters, and Leaflet does not react to a new `bounds` prop on its own.
 */
function FitToMarkers({ markers }: { readonly markers: readonly MapMarker[] }) {
  const map = useMap();
  const key = markers.map((marker) => marker.id).join(',');

  useEffect(() => {
    const bounds = boundsOf(markers);
    if (!bounds) return;
    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: markers.length === 1 ? 15 : 16,
      // Respect the same motion preference the rest of the site honours.
      animate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
    // `key` is the stable identity of the marker set; `markers` is a new array
    // on every render and would refit forever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);

  return null;
}

function boundsOf(markers: readonly MapMarker[]): L.LatLngBoundsExpression | null {
  if (markers.length === 0) return null;
  return L.latLngBounds(
    markers.map((marker) => [marker.latitude, marker.longitude] as [number, number]),
  ).pad(markers.length === 1 ? 0.4 : 0.08);
}

function worstPrecision(markers: readonly MapMarker[]) {
  return markers.some((marker) => marker.precision === 'city')
    ? ('city' as const)
    : ('neighborhood' as const);
}

/**
 * A price label instead of Leaflet's default sprite: it reads at a glance, and
 * it sidesteps the bundler-broken default icon paths entirely.
 */
function pinFor(label: string): L.DivIcon {
  const text = label.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return L.divIcon({
    className: 'conceitto-pin',
    html: `<span>${text}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}
