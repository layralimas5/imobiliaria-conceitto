import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, BedDouble, Car, Check, MapPin, Maximize } from 'lucide-react';
import { developmentRepository } from '@/data/development-catalog';
import {
  developmentPath,
  STAGE_LABELS,
  unitAreaRange,
  USE_LABELS,
  type Development,
} from '@/domain/development';
import { formatAreaRange, formatPrice } from '@/lib/format';
import { developmentWhatsapp, SITE } from '@/lib/site-config';
import { PropertyGallery } from '@/components/property/property-gallery';
import { DevelopmentContact } from '@/components/development/development-contact';
import { SectionNav, type SectionLink } from '@/components/development/section-nav';

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const developments = await developmentRepository.all();
  return developments.map((development) => ({ slug: development.slug }));
}

export async function generateMetadata(
  props: PageProps<'/lancamentos/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params;
  const development = await developmentRepository.findBySlug(slug);
  if (!development) return { title: 'Lançamento não encontrado' };

  const canonical = developmentPath(development);
  const title = `${development.name} — ${development.location.city}`;

  return {
    title,
    description: development.summary,
    alternates: { canonical },
    openGraph: {
      title,
      description: development.summary,
      url: canonical,
      images: development.photos.slice(0, 1).map((photo) => ({ url: photo.url })),
    },
  };
}

export default async function DevelopmentPage(props: PageProps<'/lancamentos/[slug]'>) {
  const { slug } = await props.params;
  const development = await developmentRepository.findBySlug(slug);
  if (!development) notFound();

  const cover = development.photos[0] ?? null;
  const areas = unitAreaRange(development.unitTypes);
  const hasPlans = development.unitTypes.length > 0;
  const hasAmenities = development.amenities.length > 0 || development.specs.length > 0;
  const hasGallery = development.photos.length > 1;

  const sections: SectionLink[] = [
    { id: 'empreendimento', label: 'O empreendimento' },
    ...(hasPlans ? [{ id: 'plantas', label: 'Plantas' }] : []),
    ...(hasAmenities ? [{ id: 'lazer', label: 'Lazer e estrutura' }] : []),
    ...(hasGallery ? [{ id: 'fotos', label: 'Fotos' }] : []),
    { id: 'localizacao', label: 'Localização' },
    { id: 'contato', label: 'Contato' },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(development)) }}
      />

      {/* Hero */}
      <section className="relative -mt-16 flex min-h-[38rem] items-end overflow-hidden md:-mt-20 md:min-h-[44rem]">
        {cover ? (
          <Image
            src={cover.url}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-brand-900" />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/88 via-ink/45 to-ink/55"
        />

        <div className="container-page relative w-full pb-14 pt-32 md:pb-20 md:pt-40">
          <nav aria-label="Trilha de navegação" className="mb-6 text-sm text-white/60">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-white">
                  Início
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link href="/lancamentos" className="hover:text-white">
                  Lançamentos
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-white/80">{development.name}</li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-bronze-600 px-3 py-1 text-[0.6875rem] font-medium uppercase tracking-wider text-white">
              {STAGE_LABELS[development.stage]}
            </span>
            <span className="rounded-full bg-white/12 px-3 py-1 text-[0.6875rem] font-medium uppercase tracking-wider text-white ring-1 ring-white/25">
              {USE_LABELS[development.use]}
            </span>
          </div>

          <h1 className="text-display mt-5 max-w-3xl text-5xl text-white sm:text-6xl lg:text-7xl">
            {development.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">{development.tagline}</p>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/80">
            <p className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden />
              {development.location.neighborhood}, {development.location.city} —{' '}
              {development.location.state}
            </p>
            {areas ? (
              <p className="flex items-center gap-2">
                <Maximize className="size-4" aria-hidden />
                {formatAreaRange(areas.min, areas.max)}
              </p>
            ) : null}
            {development.priceFrom !== null ? (
              <p>
                <span className="text-white/60">a partir de </span>
                {formatPrice(development.priceFrom)}
              </p>
            ) : null}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href={developmentWhatsapp(development)}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-brand-900 transition-colors hover:bg-bronze-100"
            >
              Quero conhecer
              <ArrowRight className="size-4" aria-hidden />
            </a>
            <a
              href="#contato"
              className="inline-flex items-center rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Receber plantas e tabela
            </a>
          </div>
        </div>
      </section>

      <SectionNav sections={sections} />

      {development.mediaStatus === 'pending' ? (
        <p className="border-b border-line bg-surface-muted py-3 text-center text-sm text-ink-soft">
          Material fotográfico deste empreendimento em produção. Fale com a equipe para
          receber plantas e imagens.
        </p>
      ) : null}

      <div className="container-page grid gap-14 py-14 md:py-20 lg:grid-cols-[1fr_23rem] lg:gap-16">
        <div className="min-w-0 space-y-16 md:space-y-20">
          {/* Concept */}
          <section id="empreendimento" className="scroll-mt-36">
            <p className="text-eyebrow">O empreendimento</p>
            <h2 className="text-display mt-3 text-4xl md:text-5xl">{development.summary}</h2>
            <div className="mt-7 space-y-5 text-base leading-relaxed text-ink-soft">
              {development.story.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>

            {development.facts.length > 0 ? (
              <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-9 sm:grid-cols-4">
                {development.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-xs uppercase tracking-wider text-ink-faint">
                      {fact.label}
                    </dt>
                    <dd className="text-display mt-1.5 text-3xl">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </section>

          {/* Floor plans */}
          {hasPlans ? (
            <section id="plantas" className="scroll-mt-36">
              <p className="text-eyebrow">Plantas</p>
              <h2 className="text-display mt-3 text-3xl md:text-4xl">
                Tipologias disponíveis
              </h2>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {development.unitTypes.map((unit) => {
                  const area =
                    unit.areaFrom !== null
                      ? formatAreaRange(unit.areaFrom, unit.areaTo ?? unit.areaFrom)
                      : null;
                  return (
                    <li
                      key={unit.name}
                      className="rounded-card border border-line bg-surface p-6 shadow-card"
                    >
                      <h3 className="font-medium">{unit.name}</h3>
                      <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
                        {area ? (
                          <li className="flex items-center gap-2.5">
                            <Maximize className="size-4 text-ink-faint" aria-hidden />
                            {area} privativos
                          </li>
                        ) : null}
                        {unit.suites ? (
                          <li className="flex items-center gap-2.5">
                            <BedDouble className="size-4 text-ink-faint" aria-hidden />
                            {unit.suites === 1 ? '1 suíte' : `até ${unit.suites} suítes`}
                          </li>
                        ) : null}
                        {unit.parkingSpaces ? (
                          <li className="flex items-center gap-2.5">
                            <Car className="size-4 text-ink-faint" aria-hidden />
                            {unit.parkingSpaces === 1
                              ? '1 vaga'
                              : `${unit.parkingSpaces} vagas`}
                          </li>
                        ) : null}
                      </ul>
                      <p className="mt-5 border-t border-line pt-4 text-sm">
                        {unit.priceFrom !== null ? (
                          <>
                            <span className="text-ink-faint">a partir de </span>
                            <span className="font-medium">{formatPrice(unit.priceFrom)}</span>
                          </>
                        ) : (
                          <span className="text-ink-soft">Valores sob consulta</span>
                        )}
                      </p>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-5 text-sm text-ink-faint">
                Áreas e valores informados pela incorporadora e sujeitos a confirmação.
              </p>
            </section>
          ) : null}

          {/* Amenities and specs */}
          {hasAmenities ? (
            <section id="lazer" className="scroll-mt-36">
              <p className="text-eyebrow">
                {development.amenities.length > 0 ? 'Lazer e estrutura' : 'Acabamento'}
              </p>
              <h2 className="text-display mt-3 text-3xl md:text-4xl">
                {development.amenities.length > 0
                  ? `O que vem junto com ${development.use === 'comercial' ? 'a sala' : 'o apartamento'}`
                  : 'Padrão construtivo'}
              </h2>

              {development.amenities.length > 0 ? (
                <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {development.amenities.map((amenity) => (
                    <li key={amenity} className="flex items-start gap-3 text-sm text-ink-soft">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />
                      {amenity}
                    </li>
                  ))}
                </ul>
              ) : null}

              {development.specs.length > 0 ? (
                <SpecList
                  specs={development.specs}
                  // Standalone when there are no amenities above it, so the section
                  // does not open with a heading followed by a second heading.
                  boxed={development.amenities.length > 0}
                />
              ) : null}
            </section>
          ) : null}

          {/* Gallery */}
          {hasGallery ? (
            <section id="fotos" className="scroll-mt-36">
              <p className="text-eyebrow">Fotos</p>
              <h2 className="text-display mt-3 text-3xl md:text-4xl">
                {development.name} por dentro
              </h2>
              <div className="mt-8">
                <PropertyGallery photos={development.photos} title={development.name} />
              </div>
            </section>
          ) : null}

          {/* Location */}
          <section id="localizacao" className="scroll-mt-36">
            <p className="text-eyebrow">Localização</p>
            <h2 className="text-display mt-3 text-3xl md:text-4xl">
              {development.location.neighborhood}, {development.location.city}
            </h2>
            {development.location.surroundings ? (
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft">
                {development.location.surroundings}
              </p>
            ) : null}
            <address className="mt-6 not-italic text-base text-ink-soft">
              {development.location.addressLine ? (
                <>
                  {development.location.addressLine}
                  <br />
                </>
              ) : null}
              {development.location.neighborhood}, {development.location.city} —{' '}
              {development.location.state}
            </address>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                development.location.mapsQuery,
              )}`}
              target="_blank"
              rel="noreferrer noopener"
              className="group mt-6 inline-flex items-center gap-2 text-sm font-medium"
            >
              Ver no mapa
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </section>

          {/* Contact, in-flow anchor for mobile where the aside sits at the end */}
          <section id="contato" className="scroll-mt-36 lg:hidden">
            <p className="text-eyebrow">Contato</p>
            <h2 className="text-display mt-3 text-3xl">Fale com quem vende</h2>
            <div className="mt-7">
              <DevelopmentContact development={development} />
            </div>
          </section>
        </div>

        <aside className="hidden lg:block" aria-label={`Contato sobre o ${development.name}`}>
          <DevelopmentContact development={development} />
        </aside>
      </div>

      <OtherDevelopments currentSlug={development.slug} />
    </>
  );
}

function SpecList({ specs, boxed }: { specs: readonly string[]; boxed: boolean }) {
  const list = (
    <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
      {specs.map((spec) => (
        <li key={spec} className="flex items-start gap-3 text-sm text-ink-soft">
          <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-bronze-400" />
          {spec}
        </li>
      ))}
    </ul>
  );

  if (!boxed) return <div className="mt-8">{list}</div>;

  return (
    <div className="mt-10 rounded-card border border-line bg-surface p-7 shadow-card">
      <h3 className="text-display text-2xl">Padrão construtivo</h3>
      <div className="mt-5">{list}</div>
    </div>
  );
}

async function OtherDevelopments({ currentSlug }: { currentSlug: string }) {
  const developments = await developmentRepository.all();
  const others = developments.filter((item) => item.slug !== currentSlug).slice(0, 3);
  if (others.length === 0) return null;

  return (
    <section className="border-t border-line bg-surface-muted py-16 md:py-20">
      <div className="container-page">
        <h2 className="text-display text-3xl">Outros lançamentos</h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((item) => (
            <li key={item.slug}>
              <Link
                href={developmentPath(item)}
                className="group flex h-full flex-col rounded-card border border-line bg-surface p-6 transition-colors hover:border-line-strong"
              >
                <p className="text-eyebrow">{STAGE_LABELS[item.stage]}</p>
                <h3 className="text-display mt-2 text-2xl">{item.name}</h3>
                <p className="mt-2 text-sm text-ink-soft">
                  {item.location.neighborhood}, {item.location.city}
                </p>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium">
                  Ver empreendimento
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function buildJsonLd(development: Development) {
  const areas = unitAreaRange(development.unitTypes);
  const url = `${SITE.url}${developmentPath(development)}`;

  return {
    '@context': 'https://schema.org',
    '@type': development.use === 'residencial' ? 'ApartmentComplex' : 'LocalBusiness',
    name: development.name,
    description: development.summary,
    url,
    image: development.photos.slice(0, 8).map((photo) => photo.url),
    address: {
      '@type': 'PostalAddress',
      ...(development.location.addressLine
        ? { streetAddress: development.location.addressLine }
        : {}),
      addressSubLocality: development.location.neighborhood,
      addressLocality: development.location.city,
      addressRegion: development.location.state,
      addressCountry: 'BR',
    },
    ...(areas
      ? {
          floorSize: {
            '@type': 'QuantitativeValue',
            minValue: areas.min,
            maxValue: areas.max,
            unitCode: 'MTK',
          },
        }
      : {}),
    ...(development.priceFrom !== null
      ? {
          offers: {
            '@type': 'Offer',
            price: development.priceFrom,
            priceCurrency: 'BRL',
            availability: 'https://schema.org/InStock',
            url,
          },
        }
      : {}),
  };
}
