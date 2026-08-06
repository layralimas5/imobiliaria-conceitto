import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Camera, KeyRound, Megaphone, ShieldCheck } from 'lucide-react';
import { propertyRepository } from '@/data/catalog-repository';
import { developmentRepository } from '@/data/development-catalog';
import { TYPE_LABELS_PLURAL } from '@/domain/search';
import { PropertyCard } from '@/components/property/property-card';
import { DevelopmentCard } from '@/components/development/development-card';
import { SearchBar } from '@/components/search/search-bar';
import { BRANCHES, SITE } from '@/lib/site-config';

export default async function HomePage() {
  const [featured, saleFacets, catalogSize, developments] = await Promise.all([
    propertyRepository.featured(6),
    propertyRepository.facets('venda'),
    propertyRepository.count(),
    developmentRepository.featured(3),
  ]);

  const heroPhoto = featured.find((property) => property.coverPhoto)?.coverPhoto ?? null;
  const topCities = saleFacets.cities.slice(0, 8);

  return (
    <>
      {/* Hero */}
      <section className="relative -mt-16 flex min-h-[46rem] items-end overflow-hidden md:-mt-20 md:min-h-[44rem]">
        {heroPhoto ? (
          <Image
            src={heroPhoto.url}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-forest-900" />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/60"
        />

        <div className="container-page relative w-full pb-12 pt-28 md:pb-16">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-white/70">
              {SITE.region} · desde {SITE.foundedYear}
            </p>
            <h1 className="text-display mt-4 text-5xl text-white sm:text-6xl lg:text-7xl">
              O imóvel certo
              <br />
              na serra certa.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/80">
              {catalogSize} imóveis em Farroupilha, Bento Gonçalves e região, com
              corretor de verdade do outro lado.
            </p>
          </div>

          <div className="mt-10 max-w-4xl">
            <SearchBar cities={saleFacets.cities} types={saleFacets.types} variant="hero" />
          </div>
        </div>
      </section>

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
            href="/comprar"
            className="group inline-flex items-center gap-2 text-sm font-medium"
          >
            Ver todos os imóveis
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
        <section className="container-page border-t border-line pb-4 pt-16 md:pt-20">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-eyebrow">Lançamentos</p>
              <h2 className="text-display mt-3 text-4xl md:text-5xl">Comprar na planta</h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft">
                Empreendimentos com condição de lançamento, personalização de planta e a
                melhor tabela do ciclo de obra.
              </p>
            </div>
            <Link
              href="/lancamentos"
              className="group inline-flex items-center gap-2 text-sm font-medium"
            >
              Ver todos os lançamentos
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <ul className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {developments.map((development) => (
              <li key={development.slug} className="flex">
                <DevelopmentCard development={development} className="w-full" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Cities and types */}
      <section className="border-y border-line bg-surface-muted py-20 md:py-24">
        <div className="container-page">
          <div className="max-w-xl">
            <p className="text-eyebrow">Onde a gente atua</p>
            <h2 className="text-display mt-3 text-4xl md:text-5xl">Da serra ao litoral</h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft">
              Duas lojas físicas, uma equipe só, e imóveis em mais de vinte municípios.
            </p>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topCities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/comprar?city=${city.slug}`}
                  className="group flex items-center justify-between rounded-card border border-line bg-surface px-5 py-4 transition-colors hover:border-line-strong"
                >
                  <span className="font-medium">{city.name}</span>
                  <span className="text-sm text-ink-faint">
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
                  href={`/comprar?tipos=${facet.type}`}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm transition-colors hover:border-line-strong"
                >
                  {TYPE_LABELS_PLURAL[facet.type]}
                  <span className="text-xs text-ink-faint">{facet.count}</span>
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
                className="rounded-card border border-line bg-surface p-6 shadow-card"
              >
                <item.icon className="size-5 text-forest-600" aria-hidden />
                <h3 className="mt-4 font-medium">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Owner CTA */}
      <section className="bg-forest-900 py-20 text-white md:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
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
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-forest-900 transition-colors hover:bg-bronze-100"
            >
              Quero anunciar meu imóvel
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/contato"
              className="inline-flex items-center rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Falar com a equipe
            </Link>
          </div>
        </div>
      </section>

      {/* Branches */}
      <section className="container-page py-20 md:py-24">
        <div className="max-w-xl">
          <p className="text-eyebrow">Onde nos encontrar</p>
          <h2 className="text-display mt-3 text-4xl md:text-5xl">Duas lojas, uma equipe</h2>
        </div>
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {BRANCHES.map((branch) => (
            <li
              key={branch.id}
              className="rounded-card border border-line bg-surface p-8 shadow-card"
            >
              <p className="text-eyebrow">{branch.name}</p>
              <h3 className="text-display mt-2 text-2xl">{branch.city}</h3>
              <address className="mt-4 not-italic text-sm leading-relaxed text-ink-soft">
                {branch.street}
                <br />
                {branch.district}, {branch.city} — RS
              </address>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <a
                  href={`tel:+55${branch.phone.replace(/\D/g, '')}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {branch.phone}
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.mapsQuery)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-ink-soft underline-offset-4 hover:underline"
                >
                  Ver no mapa
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
