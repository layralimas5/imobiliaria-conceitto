/**
 * Geocoding — fills `address.latitude` / `address.longitude` in the synced
 * catalog so listings can be plotted on a map.
 *
 * MSYS does not expose coordinates, and the site deliberately never publishes a
 * listing's exact address (see `PropertyAddress`). So this geocodes at
 * **neighbourhood** level: one lookup per city + neighbourhood pair (149 for the
 * full catalog, against 1498 listings), then spreads the listings of a
 * neighbourhood over a small deterministic offset so pins do not stack into one.
 * The pin means "this listing is in this neighbourhood", which is exactly what
 * the site is willing to state.
 *
 * Results are cached in `geocode.json`, which is committed. A re-run costs
 * nothing for pairs already resolved, so this is safe to chain after every sync.
 *
 * Source is Nominatim (OpenStreetMap): no API key, no billing, and its usage
 * policy is respected here — one request per second, real user agent, cached.
 *
 * Usage:
 *   node scripts/geocode-catalog.mjs           # resolve what is missing, patch the catalog
 *   node scripts/geocode-catalog.mjs --refresh # ignore the cache and look everything up again
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG = path.join(ROOT, 'src', 'data', 'catalog', 'catalog.json');
const CACHE = path.join(ROOT, 'src', 'data', 'catalog', 'geocode.json');

const ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT =
  'ConceittoSiteMigration/1.0 (+geocoding for imobiliariaconceitto.com.br)';
/** Nominatim's usage policy caps anonymous use at one request per second. */
const RATE_LIMIT_MS = 1100;

/** Rio Grande do Sul, generously. Anything outside is a bad match, not a location. */
const RS_BOUNDS = { minLat: -34.0, maxLat: -26.9, minLng: -58.0, maxLng: -49.0 };

/**
 * Radius, in degrees, of the deterministic scatter applied to listings sharing a
 * neighbourhood. ~0.004° is roughly 400 m — inside the neighbourhood, and far
 * enough that two pins never land on the same pixel.
 */
const SCATTER = 0.004;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function withinRS(lat, lng) {
  return (
    lat >= RS_BOUNDS.minLat &&
    lat <= RS_BOUNDS.maxLat &&
    lng >= RS_BOUNDS.minLng &&
    lng <= RS_BOUNDS.maxLng
  );
}

async function query(text) {
  const url = new URL(ENDPOINT);
  url.searchParams.set('q', text);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('countrycodes', 'br');
  url.searchParams.set('limit', '1');

  const response = await fetch(url, {
    headers: { 'user-agent': USER_AGENT, accept: 'application/json' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const results = await response.json();
  const hit = Array.isArray(results) ? results[0] : null;
  if (!hit) return null;

  const lat = Number.parseFloat(hit.lat);
  const lng = Number.parseFloat(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !withinRS(lat, lng)) return null;

  return { latitude: lat, longitude: lng };
}

/**
 * Neighbourhood first, city as fallback. A pin on the city centre is a worse
 * answer than a pin on the neighbourhood, but a far better one than no pin.
 */
async function resolve(city, neighborhood) {
  if (neighborhood) {
    const hit = await query(`${neighborhood}, ${city}, RS, Brasil`);
    if (hit) return { ...hit, precision: 'neighborhood' };
    await sleep(RATE_LIMIT_MS);
  }
  const cityHit = await query(`${city}, RS, Brasil`);
  return cityHit ? { ...cityHit, precision: 'city' } : null;
}

/**
 * Stable pseudo-random offset derived from the listing code. Deterministic on
 * purpose: the same listing must land on the same spot across builds, or pins
 * would jump every deploy.
 */
function scatterFor(code) {
  let hash = 2166136261;
  for (const char of String(code)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  const angle = ((hash >>> 0) % 3600) / 3600 * Math.PI * 2;
  const radius = (((hash >>> 12) % 1000) / 1000) ** 0.5 * SCATTER;
  return { lat: Math.sin(angle) * radius, lng: Math.cos(angle) * radius };
}

async function main() {
  const refresh = process.argv.includes('--refresh');

  const catalog = await readJson(CATALOG, null);
  if (!Array.isArray(catalog)) {
    throw new Error(`Catálogo ausente ou inválido em ${path.relative(ROOT, CATALOG)}`);
  }

  const cache = refresh ? {} : await readJson(CACHE, {});

  const pairs = new Map();
  for (const property of catalog) {
    const { citySlug, neighborhoodSlug, city, neighborhood } = property.address;
    const key = `${citySlug}|${neighborhoodSlug}`;
    if (!pairs.has(key)) pairs.set(key, { city, neighborhood });
  }

  const missing = [...pairs.entries()].filter(([key]) => !cache[key]);
  console.log(`${pairs.size} bairros no catálogo, ${missing.length} sem coordenada.`);

  let resolved = 0;
  let failed = 0;
  for (const [index, [key, { city, neighborhood }]] of missing.entries()) {
    try {
      const hit = await resolve(city, neighborhood);
      if (hit) {
        cache[key] = hit;
        resolved += 1;
      } else {
        failed += 1;
        console.warn(`  sem resultado: ${neighborhood}, ${city}`);
      }
    } catch (error) {
      failed += 1;
      console.warn(`  falhou ${neighborhood}, ${city}: ${error.message}`);
    }

    if ((index + 1) % 20 === 0) console.log(`  ${index + 1}/${missing.length}`);
    // Persist as we go: a run interrupted halfway keeps what it already paid for.
    if ((index + 1) % 20 === 0) await writeCache(cache);
    await sleep(RATE_LIMIT_MS);
  }

  await writeCache(cache);

  let plotted = 0;
  for (const property of catalog) {
    const { citySlug, neighborhoodSlug } = property.address;
    const hit = cache[`${citySlug}|${neighborhoodSlug}`];
    if (!hit) {
      property.address.latitude = null;
      property.address.longitude = null;
      property.address.locationPrecision = null;
      continue;
    }
    const offset = scatterFor(property.code);
    property.address.latitude = Number((hit.latitude + offset.lat).toFixed(6));
    property.address.longitude = Number((hit.longitude + offset.lng).toFixed(6));
    property.address.locationPrecision = hit.precision;
    plotted += 1;
  }

  await fs.writeFile(CATALOG, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');

  console.log(`\n${resolved} bairros novos resolvidos, ${failed} sem resultado.`);
  console.log(`${plotted}/${catalog.length} imóveis com coordenada no mapa.`);
}

async function writeCache(cache) {
  const ordered = Object.fromEntries(
    Object.entries(cache).sort(([a], [b]) => a.localeCompare(b)),
  );
  await fs.writeFile(CACHE, `${JSON.stringify(ordered, null, 2)}\n`, 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
