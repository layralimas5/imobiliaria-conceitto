import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { Bath, BedDouble, Car, Maximize, Ruler, Sofa } from 'lucide-react';
import { propertyRepository } from '@/data/catalog-repository';
import {
  displayArea,
  priceFor,
  propertyPath,
  toSummary,
  type Operation,
  type Property,
} from '@/domain/property';
import { TYPE_LABELS } from '@/domain/search';
import {
  formatArea,
  formatListingTitle,
  formatMonthlyCost,
  formatPrice,
} from '@/lib/format';
import { PropertyGallery } from '@/components/property/property-gallery';
import { PropertyCard } from '@/components/property/property-card';
import { ContactCard } from '@/components/property/contact-card';
import { PropertyMap } from '@/components/map/property-map';
import { toMapMarker } from '@/components/map/map-marker';
import { SITE } from '@/lib/site-config';

interface Params {
  slug: string[];
}

/** The listing code is always the last segment, whatever the slug drift. */
function codeFromSlug(slug: string[]): string | null {
  const last = slug.at(-1);
  return last && /^\d+$/.test(last) ? last : null;
}

async function loadProperty(slug: string[]): Promise<Property | null> {
  const code = codeFromSlug(slug);
  return code ? propertyRepository.findByCode(code) : null;
}

export async function generateStaticParams(): Promise<Params[]> {
  const summaries = await propertyRepository.allSummaries();
  return summaries.map((summary) => ({
    slug: propertyPath(summary).replace('/imovel/', '').split('/'),
  }));
}

export async function generateMetadata(
  props: PageProps<'/imovel/[...slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params;
  const property = await loadProperty(slug);
  if (!property) return { title: 'Imóvel não encontrado' };

  const operation: Operation = property.operations[0] ?? 'venda';
  const price = priceFor(property.pricing, operation);
  const area = formatArea(displayArea(property.areas));
  const canonical = propertyPath(toSummary(property));

  const description = [
    TYPE_LABELS[property.type],
    property.address.neighborhood,
    property.address.city,
    area,
    property.rooms.bedrooms ? `${property.rooms.bedrooms} dormitórios` : null,
    price ? formatPrice(price) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const title = formatListingTitle(property.title);

  return {
    title: title || `Imóvel ${property.code}`,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: property.photos.slice(0, 1).map((photo) => ({ url: photo.url })),
    },
  };
}

export default async function PropertyPage(props: PageProps<'/imovel/[...slug]'>) {
  const { slug } = await props.params;
  const property = await loadProperty(slug);
  if (!property) notFound();

  const summary = toSummary(property);
  const canonical = propertyPath(summary);
  const requested = `/imovel/${slug.join('/')}`;
  // Legacy MSYS paths (plural categories, old neighborhood slugs) fold into the
  // canonical URL instead of duplicating the page for Google.
  if (requested !== canonical) permanentRedirect(canonical);

  const operation: Operation = property.operations[0] ?? 'venda';
  const price = priceFor(property.pricing, operation);
  const similar = await propertyRepository.findSimilar(property, 3);

  const monthlyCost = formatMonthlyCost(
    property.pricing.condoFee,
    property.pricing.propertyTax,
  );

  const mapMarker = toMapMarker(summary, operation);
  const displayTitle = formatListingTitle(property.title);

  const specs = [
    { icon: Maximize, label: 'Área construída', value: formatArea(property.areas.built) },
    { icon: Ruler, label: 'Área total', value: formatArea(property.areas.total) },
    { icon: Ruler, label: 'Terreno', value: formatArea(property.areas.land) },
    {
      icon: BedDouble,
      label: 'Dormitórios',
      value: property.rooms.bedrooms ? String(property.rooms.bedrooms) : null,
    },
    {
      icon: Sofa,
      label: 'Suítes',
      value: property.rooms.suites ? String(property.rooms.suites) : null,
    },
    {
      icon: Bath,
      label: 'Banheiros',
      value: property.rooms.bathrooms ? String(property.rooms.bathrooms) : null,
    },
    {
      icon: Car,
      label: 'Vagas',
      value: property.rooms.parkingSpaces ? String(property.rooms.parkingSpaces) : null,
    },
  ].filter((spec) => spec.value !== null);

  return (
    <>
      <script
        type="application/ld+json"
        // Structured data is generated from the same record the page renders.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(property, price)) }}
      />

      <div className="container-page py-8 md:py-10">
        <nav aria-label="Trilha de navegação" className="mb-6 text-sm text-ink-faint">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-ink">
                Início
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link
                href={operation === 'venda' ? '/comprar' : '/alugar'}
                className="hover:text-ink"
              >
                {operation === 'venda' ? 'Comprar' : 'Alugar'}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link
                href={`${operation === 'venda' ? '/comprar' : '/alugar'}?city=${property.address.citySlug}`}
                className="hover:text-ink"
              >
                {property.address.city}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-ink-soft">Cód. {property.code}</li>
          </ol>
        </nav>

        <PropertyGallery photos={property.photos} title={displayTitle} />

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
          <div>
            <header>
              <p className="text-eyebrow">
                {TYPE_LABELS[property.type]}
                {property.subtype && property.subtype !== 'padrao'
                  ? ` · ${property.subtype.replace(/-/g, ' ')}`
                  : ''}
              </p>
              <h1 className="text-display mt-3 text-4xl md:text-5xl">
                {property.address.neighborhood
                  ? `${property.address.neighborhood}, ${property.address.city}`
                  : property.address.city}
              </h1>
              <p className="mt-3 text-lg text-ink-soft">{displayTitle}</p>
            </header>

            {specs.length > 0 ? (
              <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-line py-7 sm:grid-cols-3">
                {specs.map((spec) => (
                  <li key={spec.label} className="flex items-start gap-3">
                    <spec.icon className="mt-0.5 size-5 shrink-0 text-ink-faint" aria-hidden />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-ink-faint">
                        {spec.label}
                      </p>
                      <p className="mt-0.5 font-medium">{spec.value}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}

            {property.description ? (
              <section className="mt-10">
                <h2 className="text-display text-2xl">Sobre o imóvel</h2>
                <div className="mt-4 space-y-4 text-base leading-relaxed text-ink-soft">
                  {property.description
                    .split(/\r?\n\r?\n|\r?\n/)
                    .map((paragraph) => paragraph.trim())
                    .filter(Boolean)
                    .map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                </div>
              </section>
            ) : null}

            {property.features.length > 0 ? (
              <section className="mt-10">
                <h2 className="text-display text-2xl">Características</h2>
                <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {property.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2.5 text-sm text-ink-soft"
                    >
                      <span
                        aria-hidden
                        className="size-1.5 shrink-0 rounded-full bg-brand-500"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {(property.pricing.condoFee ?? property.pricing.propertyTax) !== null ? (
              <section className="mt-10 rounded-card border border-line bg-surface p-6">
                <h2 className="text-sm font-medium">Custos mensais estimados</h2>
                <dl className="mt-4 space-y-2.5 text-sm">
                  {property.pricing.condoFee ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-soft">Condomínio</dt>
                      <dd>{formatPrice(property.pricing.condoFee)}</dd>
                    </div>
                  ) : null}
                  {property.pricing.propertyTax ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-soft">IPTU (ao ano)</dt>
                      <dd>{formatPrice(property.pricing.propertyTax)}</dd>
                    </div>
                  ) : null}
                  {monthlyCost ? (
                    <div className="flex justify-between gap-4 border-t border-line pt-2.5 font-medium">
                      <dt>Total por mês</dt>
                      <dd>{monthlyCost}</dd>
                    </div>
                  ) : null}
                </dl>
                <p className="mt-4 text-xs text-ink-faint">
                  Valores informados pelo proprietário e sujeitos a confirmação.
                </p>
              </section>
            ) : null}

            {mapMarker ? (
              <section className="mt-10">
                <h2 className="text-display text-2xl">Localização</h2>
                <p className="mt-3 text-base text-ink-soft">
                  {property.address.neighborhood
                    ? `${property.address.neighborhood}, ${property.address.city}`
                    : property.address.city}{' '}
                  — {property.address.state}
                </p>
                <PropertyMap
                  markers={[mapMarker]}
                  showUncertainty
                  ariaLabel={`Mapa do bairro ${property.address.neighborhood} em ${property.address.city}`}
                  className="mt-5 h-[22rem] sm:h-[26rem]"
                />
              </section>
            ) : null}
          </div>

          <ContactCard
            code={property.code}
            city={property.address.citySlug}
            operations={property.operations}
            pricing={property.pricing}
            agent={property.agent}
          />
        </div>

        {similar.length > 0 ? (
          <section className="mt-20">
            <h2 className="text-display text-3xl">Imóveis parecidos</h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {similar.map((item) => (
                <li key={item.code} className="flex">
                  <PropertyCard property={item} operation={operation} className="w-full" />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  );
}

function buildJsonLd(property: Property, price: number | null) {
  const summary = toSummary(property);
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: formatListingTitle(property.title),
    description: property.description.slice(0, 500),
    url: `${SITE.url}${propertyPath(summary)}`,
    datePosted: property.publishedAt,
    image: property.photos.slice(0, 8).map((photo) => photo.url),
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.address.city,
      addressRegion: property.address.state,
      addressCountry: 'BR',
      ...(property.address.neighborhood
        ? { addressSubLocality: property.address.neighborhood }
        : {}),
    },
    ...(price !== null
      ? { offers: { '@type': 'Offer', price, priceCurrency: 'BRL', availability: 'https://schema.org/InStock' } }
      : {}),
    ...(property.areas.built || property.areas.total
      ? {
          floorSize: {
            '@type': 'QuantitativeValue',
            value: property.areas.built ?? property.areas.total,
            unitCode: 'MTK',
          },
        }
      : {}),
    ...(property.rooms.bedrooms ? { numberOfRooms: property.rooms.bedrooms } : {}),
  };
}
