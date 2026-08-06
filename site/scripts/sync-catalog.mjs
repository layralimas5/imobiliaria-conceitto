/**
 * Catalog sync — reads the listings the Conceitto already publishes and writes
 * them to `src/data/catalog/catalog.json` in the shape the site's domain expects.
 *
 * Source of record is MSYS Imob. Until the client provides the official portal
 * XML feed, this reads the same data from the pages MSYS already renders: every
 * listing page embeds the raw MSYS record inside `__NEXT_DATA__`.
 *
 * When the XML feed arrives, only `fetchRawRecords` needs replacing — the
 * mapping below stays identical, because both surfaces expose the same fields.
 *
 * Usage:
 *   node scripts/sync-catalog.mjs            # sample run (120 listings)
 *   node scripts/sync-catalog.mjs --all      # full catalog
 *   node scripts/sync-catalog.mjs --limit=40
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'src', 'data', 'catalog', 'catalog.json');
const ORIGIN = 'https://imobiliariaconceitto.com.br';
const SITEMAP = `${ORIGIN}/sitemaps/propertys.xml`;
const USER_AGENT = 'ConceittoSiteMigration/1.0 (+catalog sync for the site owner)';

const CONCURRENCY = 5;
const RETRIES = 2;
const DELAY_MS = 120;

/** MSYS category id -> domain type. */
const CATEGORY_TO_TYPE = {
  1: 'apartamento',
  2: 'casa',
  3: 'comercial',
  4: 'rural',
  5: 'terreno',
  6: 'industrial',
};

/**
 * Characteristic ids that carry measurements rather than amenities. They are
 * read into structured fields, so they must not leak into the feature list.
 */
const METRIC_CHARACTERISTIC_IDS = new Set([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16, 24, 25, 28, 29, 30, 159, 160,
  176, 179,
]);

const CITY_SLUGS = {
  Farroupilha: 'farroupilha',
  'Bento Gonçalves': 'bento-goncalves',
};

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url, attempt = 0) {
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xml' },
      signal: AbortSignal.timeout(45_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } catch (error) {
    if (attempt < RETRIES) {
      await sleep(500 * (attempt + 1));
      return fetchText(url, attempt + 1);
    }
    throw new Error(`Falha ao buscar ${url}: ${error.message}`);
  }
}

function extractNextData(html) {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!match) throw new Error('__NEXT_DATA__ ausente');
  return JSON.parse(match[1]);
}

function parseJsonField(value, fallback) {
  if (typeof value !== 'string' || value.length === 0) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** MSYS keeps the record inside the SSR payload of every listing page. */
async function fetchRawRecord(url) {
  const html = await fetchText(url);
  const data = extractNextData(html);
  const payload = data?.props?.initialProps?.pageProps?.template?.data;
  if (!payload?.property) throw new Error('registro do imóvel ausente');
  const characteristicNames = {};
  const all = data?.props?.initialProps?.pageProps?.template?.requests?.allCharacteristics;
  if (Array.isArray(all)) {
    for (const item of all) characteristicNames[item.idtCharacteristics] = item.desCharacteristics;
  }
  return {
    property: payload.property,
    agents: payload.captivators ?? [],
    characteristicNames,
  };
}

function mapOperations(indType) {
  const raw = String(indType ?? '').toUpperCase();
  const operations = [];
  if (raw.includes('S')) operations.push('venda');
  if (raw.includes('L')) operations.push('locacao');
  return operations.length > 0 ? operations : ['venda'];
}

function mapFeatures(property, characteristicNames) {
  const characteristics = parseJsonField(property.jsonCharacteristics, []);
  const condominium = parseJsonField(property.jsonCondominiumCharacteristics, []);
  const features = new Set();

  for (const entry of [...characteristics, ...condominium]) {
    const id = entry?.characteristics?.idtCharacteristics;
    if (id === undefined || METRIC_CHARACTERISTIC_IDS.has(id)) continue;
    const name = characteristicNames[id];
    if (!name) continue;
    const value = String(entry.desInformation ?? '').trim();
    // "1" is MSYS's boolean true; anything non-numeric is a qualifier worth keeping.
    if (value === '0' || value === '') continue;
    features.add(name);
  }

  return [...features].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function mapPhotos(property) {
  const photos = parseJsonField(property.jsonPhotos, []);
  return photos
    .filter((photo) => photo?.urlPhoto && photo.flgNotShowSite !== 1)
    .map((photo, index) => ({
      url: photo.urlPhoto,
      alt: `${property.desTitleSite ?? 'Imóvel'} — foto ${index + 1}`,
      width: 1024,
      height: 683,
    }));
}

function mapAgent(agents) {
  const agent = agents.find((item) => item?.namPerson) ?? null;
  if (!agent) return null;
  return {
    name: agent.namPerson,
    creci: agent.creci ?? '',
    phone: agent.desPhone ?? null,
    photoUrl: agent.desPhoto ?? null,
  };
}

function mapRecord({ property, agents, characteristicNames }) {
  const city = property.namCity ?? '';
  const citySlug = CITY_SLUGS[city] ?? slugify(city);
  const neighborhood = property.namDistrict ?? '';
  const type = CATEGORY_TO_TYPE[property.idtCategory] ?? 'casa';

  const builtArea = toNumber(property.prop_char_1);
  const totalArea = toNumber(property.prop_char_2);
  const isLand = type === 'terreno' || type === 'rural';

  const hideSale = property.flgHideValSaleSite === 1;
  const hideRent = property.flgHideValLocationSite === 1;

  return {
    code: String(property.idtProperty),
    title: (property.desTitleSite ?? '').trim(),
    description: (property.desInformationSite ?? '').trim(),
    operations: mapOperations(property.indType),
    type,
    subtype: slugify(property.namSubCategory ?? 'padrao'),
    address: {
      street: null,
      number: null,
      neighborhood,
      neighborhoodSlug: slugify(neighborhood),
      city,
      citySlug,
      state: 'RS',
      zipCode: null,
      latitude: null,
      longitude: null,
      // Filled by scripts/geocode-catalog.mjs — run it after every sync.
      locationPrecision: null,
    },
    areas: {
      built: isLand ? null : (builtArea ?? totalArea),
      total: totalArea,
      land: isLand ? totalArea : null,
    },
    rooms: {
      bedrooms: toNumber(property.prop_char_5),
      suites: toNumber(property.prop_char_6),
      bathrooms: toNumber(property.prop_char_176) ?? toNumber(property.prop_char_7),
      parkingSpaces: toNumber(property.totalGarages) ?? toNumber(property.prop_char_12),
    },
    pricing: {
      salePrice: hideSale ? null : toNumber(property.valSales),
      rentPrice: hideRent ? null : toNumber(property.valLocation),
      condoFee: toNumber(property.valCondominium),
      propertyTax: toNumber(property.valIptu) ?? toNumber(property.valIptuCalculated),
    },
    features: mapFeatures(property, characteristicNames),
    photos: mapPhotos(property),
    videoUrl: property.desUrlVideo ?? null,
    tourUrl: property.desUrlTour ?? null,
    floorPlanUrl: null,
    agent: mapAgent(agents),
    isExclusive:
      property.flgExclusiveSale === 1 || property.flgExclusiveLocation === 1,
    isFeatured: property.flgHighlight === 1,
    publishedAt: property.dtaUpdate ?? new Date().toISOString(),
    updatedAt: property.dtaUpdate ?? new Date().toISOString(),
  };
}

async function readSitemapUrls() {
  const xml = await fetchText(SITEMAP);
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}

/**
 * Keeps the sample representative instead of alphabetical: round-robins across
 * city + category + operation so every listing template gets exercised.
 */
function stratify(urls, limit) {
  if (limit >= urls.length) return urls;
  const buckets = new Map();
  for (const url of urls) {
    const segments = new URL(url).pathname.split('/').filter(Boolean);
    const key = `${segments[1]}|${segments[2]}|${segments[3]}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(url);
  }
  const lists = [...buckets.values()];
  const picked = [];
  let index = 0;
  while (picked.length < limit && lists.some((list) => list.length > index)) {
    for (const list of lists) {
      if (picked.length >= limit) break;
      if (list.length > index) picked.push(list[index]);
    }
    index += 1;
  }
  return picked;
}

async function mapWithConcurrency(items, worker, concurrency) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: concurrency }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
      await sleep(DELAY_MS);
    }
  });
  await Promise.all(runners);
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  const limitArg = args.find((arg) => arg.startsWith('--limit='));
  const limit = all
    ? Number.POSITIVE_INFINITY
    : limitArg
      ? Number.parseInt(limitArg.split('=')[1], 10)
      : 120;

  console.log('Lendo sitemap…');
  const urls = await readSitemapUrls();
  console.log(`${urls.length} imóveis publicados.`);

  const selected = stratify(urls, limit);
  console.log(`Sincronizando ${selected.length}…`);

  let done = 0;
  let failed = 0;
  const records = await mapWithConcurrency(
    selected,
    async (url) => {
      try {
        const raw = await fetchRawRecord(url);
        const mapped = mapRecord(raw);
        done += 1;
        if (done % 20 === 0) console.log(`  ${done}/${selected.length}`);
        return mapped;
      } catch (error) {
        failed += 1;
        console.warn(`  falhou ${url}: ${error.message}`);
        return null;
      }
    },
    CONCURRENCY,
  );

  const catalog = records
    .filter((record) => record !== null && record.photos.length > 0)
    .sort((a, b) => Number(b.code) - Number(a.code));

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');

  console.log(`\nGravados ${catalog.length} imóveis em ${path.relative(ROOT, OUTPUT)}`);
  if (failed > 0) console.log(`${failed} falharam e ficaram de fora.`);
  console.log(`Total publicado na origem: ${urls.length}. Sincronizados: ${catalog.length}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
