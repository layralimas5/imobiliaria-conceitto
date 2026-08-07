import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Camera,
  KeyRound,
  Megaphone,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { propertyRepository } from '@/data/catalog-repository';
import { developmentRepository } from '@/data/development-catalog';
import { TYPE_LABELS_PLURAL } from '@/domain/search';
import { propertyPath } from '@/domain/property';
import { PropertyCard } from '@/components/property/property-card';
import { DevelopmentFeature } from '@/components/development/development-feature';
import { SearchBar } from '@/components/search/search-bar';
import { SITE, whatsappLink } from '@/lib/site-config';
import { LeadForm } from '@/components/property/lead-form';
import { heroImage, heroVideo, scrollSceneMedia } from '@/lib/local-media';
import { HeroMedia } from '@/components/layout/hero-media';
import { ScrollScene, type ScenePhoto } from '@/components/layout/scroll-scene';

/**
 * The launch the home page leads with. Every launch stays published on
 * `/lancamentos`; this is only about how much of the front page they take, now
 * that each one is a full-width block rather than a card.
 */
const HOME_LAUNCH_SLUGS: readonly string[] = ['alba'];

export default async function HomePage() {
  const [ranked, saleFacets, catalogSize, allDevelopments, summaries] =
    await Promise.all([
      propertyRepository.featured(12),
      propertyRepository.facets('venda'),
      propertyRepository.count(),
      developmentRepository.all(),
      propertyRepository.allSummaries(),
    ]);

  // Six, laid out three and three. `featured` already sorts photography first,
  // so the ones with pictures are the ones that make it.
  const featured = ranked.slice(0, 6);

  const developments = allDevelopments.filter((development) =>
    HOME_LAUNCH_SLUGS.includes(development.slug),
  );

  /*
   * The scene runs entirely on the art in `public/imagens/seção-scroll`: its
   * banner, then its film, then its stills. Falls back to listing photography
   * only while that folder is empty, so the section never renders hollow.
   */
  const scene = scrollSceneMedia();
  const scenePhotos: readonly ScenePhoto[] =
    scene.photos.length > 0
      ? scene.photos.map((url) => ({ url, alt: '' }))
      : summaries
          .flatMap((summary) =>
            summary.type === 'apartamento' && summary.coverPhoto
              ? [
                  {
                    url: summary.coverPhoto.url,
                    alt: summary.coverPhoto.alt,
                    href: propertyPath(summary),
                    caption: `${summary.address.neighborhood}, ${summary.address.city}`,
                  },
                ]
              : [],
          )
          .slice(0, 6);

  const scenePoster = scene.poster ?? heroImage() ?? null;
  const sceneVideo = scene.video ?? heroVideo();
  // A still from the same set, reused as the owner block's backdrop.
  const sceneBackdrop = scene.photos[1] ?? scene.photos[0] ?? scenePoster;

  // A file in public/imagens/banner wins; otherwise the hero borrows the first
  // featured listing's photography, as it did before.
  const heroPhoto = featured.find((property) => property.coverPhoto)?.coverPhoto ?? null;
  const heroSrc = heroImage() ?? heroPhoto?.url ?? null;
  const heroClip = heroVideo();
  const topCities = saleFacets.cities.slice(0, 8);

  return (
    <>
      {/* Hero */}
      <section className="relative -mt-16 flex min-h-[44rem] items-end overflow-hidden md:-mt-20 md:min-h-[46rem]">
        {heroClip ? (
          <HeroMedia videoSrc={heroClip} posterSrc={heroSrc} />
        ) : heroSrc ? (
          <Image
            src={heroSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-ink to-brand-900" />
        )}

        {/*
         * Two scrims, not one. A moving picture changes brightness frame to
         * frame, so the copy cannot rely on the footage staying dark: the
         * horizontal pass anchors the text column, the vertical one keeps the
         * bottom edge readable where the search panel overlaps.
         */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/55 to-ink/20"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-ink/45"
        />

        <div className="container-page relative w-full pb-28 pt-32 md:pb-32 md:pt-40">
          <div className="max-w-2xl [text-shadow:0_1px_16px_rgb(20_21_15_/_0.45)]">
            <p className="text-eyebrow text-white/80">
              {SITE.region} · desde {SITE.foundedYear}
            </p>
            <h1 className="text-display mt-4 text-5xl text-white sm:text-6xl lg:text-7xl">
              O imóvel certo
              <br />
              na serra certa.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/90">
              {catalogSize} imóveis em Farroupilha, Bento Gonçalves e região, com
              corretor de verdade do outro lado.
            </p>
          </div>
        </div>
      </section>

      {/* Search, straddling the seam between the hero and the page */}
      <div className="container-page relative z-20 -mt-16 md:-mt-20">
        <div className="mx-auto w-full max-w-4xl">
          <SearchBar cities={saleFacets.cities} types={saleFacets.types} variant="hero" />
        </div>
      </div>

      {/* Featured */}
      <section className="container-page py-20 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-eyebrow">Seleção da casa</p>
            <h2 className="text-display mt-3 text-4xl md:text-5xl">Destaques da semana</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              Imóveis que a equipe escolheu a dedo, entre exclusivos e recém-captados.
            </p>
          </div>
          <Link
            href="/imoveis"
            className="group inline-flex items-center gap-2 text-sm font-medium"
          >
            Ver todos os imóveis
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((property, index) => (
            <li key={property.code} className="flex">
              <PropertyCard
                property={property}
                operation={property.operations[0] ?? 'venda'}
                priority={index < 3}
                className="w-full"
              />
            </li>
          ))}
        </ul>
      </section>

      {/* Launches */}
      {developments.length > 0 ? (
        <section className="container-page border-t border-line pb-10 pt-16 md:pb-12 md:pt-20">
          {/* Same editorial treatment as /lancamentos: a launch sells a way of
              living, which a card cannot carry. */}
          <div className="space-y-24 md:space-y-32">
            {developments.map((development, index) => (
              <DevelopmentFeature
                key={development.slug}
                development={development}
                reversed={index % 2 === 1}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Cities and types */}
      <section className="relative overflow-hidden py-20 md:py-24">
        {/*
         * The hero still, blurred out of legibility and washed red. It reads as
         * a field of colour rather than a photograph, which is why the copy on
         * top flips to white — dark ink over a photo, however soft, does not
         * hold up frame to frame.
         */}
        {heroSrc ? (
          <Image
            src={heroSrc}
            alt=""
            fill
            sizes="100vw"
            // Overscaled: a blur samples past the edges and would otherwise
            // feather into transparency at the section's borders.
            className="scale-110 object-cover blur-2xl"
          />
        ) : null}
        <div aria-hidden className="absolute inset-0 bg-brand-900/85" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-brand-700/40 via-transparent to-brand-900/60"
        />

        <div className="container-page relative">
          <div className="max-w-xl">
            <p className="text-eyebrow text-white/65">Onde a gente atua</p>
            <h2 className="text-display mt-3 text-4xl text-white md:text-5xl">
              Da serra ao litoral
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/80">
              Duas lojas físicas, uma equipe só, e imóveis em mais de vinte municípios.
            </p>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topCities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/imoveis?operacao=venda&city=${city.slug}`}
                  className="group flex items-center justify-between rounded-card border border-white/20 bg-white/10 px-5 py-4 text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/20"
                >
                  <span className="font-medium">{city.name}</span>
                  <span className="text-sm text-white/70">
                    {city.count}
                    <ArrowRight className="ml-2 inline size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <ul className="mt-8 flex flex-wrap gap-2.5">
            {saleFacets.types.map((facet) => (
              <li key={facet.type}>
                <Link
                  href={`/imoveis?operacao=venda&tipos=${facet.type}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/20"
                >
                  {TYPE_LABELS_PLURAL[facet.type]}
                  <span className="text-xs text-white/65">{facet.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Differentials */}
      <section className="container-page py-20 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="text-eyebrow">Por que a Conceitto</p>
            <h2 className="text-display mt-3 text-4xl md:text-5xl">
              Imobiliária de bairro,
              <br />
              padrão de cidade grande.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-ink-soft">
              Desde {SITE.foundedYear} na Serra Gaúcha. Conhecemos rua por rua, sabemos o
              que cada bairro vale e acompanhamos a negociação do primeiro contato à
              entrega da chave.
            </p>
            <Link
              href="/sobre"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-medium"
            >
              Conhecer a imobiliária
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <ul className="grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: Camera,
                title: 'Fotografia profissional',
                text: 'Fotógrafo próprio em cada captação. Imóvel bem fotografado vende mais rápido e por mais.',
              },
              {
                icon: ShieldCheck,
                title: 'Administração segura',
                text: 'Contrato, garantia, vistoria e repasse pontual. O proprietário só precisa conferir o extrato.',
              },
              {
                icon: KeyRound,
                title: 'Avaliação de mercado',
                text: 'Preço definido por comparativo de bairro, não por chute. Anúncio no valor certo desde o primeiro dia.',
              },
              {
                icon: Megaphone,
                title: 'Divulgação ampla',
                text: 'Seu imóvel no site, nos portais e nas redes, com material feito pela nossa equipe de marketing.',
              },
            ].map((item) => (
              <li
                key={item.title}
                className="pulse-on-hover rounded-card border border-line bg-surface p-6 shadow-card"
              >
                <item.icon className="size-5 text-brand-600" aria-hidden />
                <h3 className="mt-4 font-medium">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Scroll scene: still, then film, then the stills again */}
      {scenePoster ? (
        <ScrollScene
          posterSrc={scenePoster}
          videoSrc={sceneVideo}
          photos={scenePhotos}
          eyebrow="A serra, de perto"
          title="Um lugar para morar, não só um endereço"
          text="Farroupilha, Bento Gonçalves e a serra inteira ao redor. Role para ver."
        />
      ) : null}

      {/* Owner CTA */}
      <section className="relative overflow-hidden bg-brand-900 py-20 text-white md:py-24">
        {/*
         * One of the scene stills, lightly blurred behind a thin brand wash.
         * The photograph is meant to read as a photograph here — the red is a
         * tint over it, not a lid on it — so the scrim that keeps the white
         * copy legible is a bottom-weighted gradient rather than a flat fill.
         */}
        {sceneBackdrop ? (
          <Image
            src={sceneBackdrop}
            alt=""
            fill
            sizes="100vw"
            // Overscaled: a blur samples past the edges and would otherwise
            // feather into transparency at the section's borders.
            className="scale-110 object-cover blur-md"
          />
        ) : null}
        <div aria-hidden className="absolute inset-0 bg-brand-900/55" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-ink/25"
        />

        <div className="container-page relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-eyebrow text-white/60">Para proprietários</p>
            <h2 className="text-display mt-3 text-4xl md:text-5xl">
              Tem um imóvel parado?
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75">
              A gente avalia sem compromisso, fotografa, anuncia e cuida da papelada.
              Você acompanha tudo e decide.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              href="/anuncie"
              className="pulse-on-hover-tight inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-brand-900 hover:bg-bronze-100"
            >
              Quero anunciar meu imóvel
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/contato"
              className="pulse-on-hover-tight inline-flex items-center rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
            >
              Falar com a equipe
            </Link>
          </div>
        </div>
      </section>

      {/* Atendimento Conceitto — the page closes on a way to be called back,
          for the visitor who read this far and would rather not start the
          conversation themselves. */}
      <section className="container-page grid gap-12 py-20 md:py-24 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-bronze-600">
            Atendimento Conceitto
          </p>
          <span aria-hidden className="mt-2 block h-px w-12 bg-bronze-400" />

          <h2 className="text-display mt-6 text-4xl md:text-5xl">
            Conheça todos os detalhes
            <br />
            com quem <span className="text-brand-700">conhece a região</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
            Preencha seus dados e um corretor da casa liga no horário que você escolher,
            para entender o que você procura e separar o que faz sentido.
          </p>

          <a
            href={whatsappLink({ operation: 'venda' })}
            target="_blank"
            rel="noreferrer noopener"
            className="pulse-on-hover-tight mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-brand-700 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-600"
          >
            <MessageCircle className="size-4" aria-hidden />
            Fale com nossos corretores
          </a>
        </div>

        <LeadForm defaultIntent="informacoes" variant="launch" />
      </section>
    </>
  );
}
