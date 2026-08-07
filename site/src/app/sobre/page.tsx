import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { propertyRepository } from '@/data/catalog-repository';
import { BRANCHES, SITE } from '@/lib/site-config';
import { scrollSceneMedia } from '@/lib/local-media';

export const metadata: Metadata = {
  title: 'A Conceitto',
  description:
    'Imobiliária na Serra Gaúcha desde 2013. Compra, venda, locação e administração de imóveis em Farroupilha, Bento Gonçalves e região.',
  alternates: { canonical: '/sobre' },
};

export default async function SobrePage() {
  const [saleFacets, rentFacets] = await Promise.all([
    propertyRepository.facets('venda'),
    propertyRepository.facets('locacao'),
  ]);

  const cityCount = new Set([
    ...saleFacets.cities.map((city) => city.slug),
    ...rentFacets.cities.map((city) => city.slug),
  ]).size;

  const numbers = [
    { value: `${new Date().getFullYear() - SITE.foundedYear}+`, label: 'anos de estrada' },
    { value: String(saleFacets.total + rentFacets.total), label: 'imóveis no portfólio' },
    { value: String(cityCount), label: 'cidades atendidas' },
    { value: '2', label: 'lojas físicas' },
  ];

  // Both from the scene folder: one frame carries the banner, another sits
  // blurred behind the numbers.
  const scene = scrollSceneMedia();
  const banner = scene.photos[0] ?? scene.poster;
  const backdrop = scene.photos[2] ?? scene.photos[0] ?? scene.poster;

  return (
    <>
      {/*
       * The photograph carries the opening, blurred enough that it reads as
       * texture rather than as a picture — which is what lets ink-dark copy sit
       * on top of it and stay legible whatever the frame happens to contain.
       */}
      <section className="relative overflow-hidden py-16 md:py-24">
        {banner ? (
          <Image
            src={banner}
            alt=""
            fill
            priority
            sizes="100vw"
            // Overscaled: a blur samples past the edges and would otherwise
            // feather into transparency at the section's borders.
            className="scale-110 object-cover blur-xl"
          />
        ) : null}
        <div aria-hidden className="absolute inset-0 bg-paper/80" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-paper via-paper/70 to-paper/30"
        />

        <header className="container-page relative max-w-3xl">
          <p className="text-eyebrow">A Conceitto</p>
          <h1 className="text-display mt-4 text-5xl md:text-6xl">
            A gente vende a casa
            <br />
            depois de conhecer a rua.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">
            A Conceitto nasceu em Farroupilha em {SITE.foundedYear} e cresceu do jeito
            que imobiliária de cidade do interior cresce: no boca a boca, entregando o
            que prometeu. Hoje são duas lojas, uma equipe de corretores da região e
            imóveis da serra ao litoral.
          </p>
        </header>
      </section>

      {/*
       * The numbers, on the same blurred-red plate the home page uses for its
       * cities block — figures read better as a stated claim than as four
       * paragraphs of grey text under a rule.
       */}
      <section className="relative overflow-hidden py-10 md:py-12">
        {backdrop ? (
          <Image
            src={backdrop}
            alt=""
            fill
            sizes="100vw"
            // Overscaled: a blur samples past the edges and would otherwise
            // feather into transparency at the section's borders.
            className="scale-110 object-cover blur-lg"
          />
        ) : null}
        <div aria-hidden className="absolute inset-0 bg-brand-900/88" />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-brand-700/35 via-transparent to-brand-900/60"
        />

        <ul className="container-page relative grid grid-cols-2 gap-6 lg:grid-cols-4">
          {numbers.map((item) => (
            <li key={item.label}>
              <p className="text-display text-3xl text-white md:text-4xl">{item.value}</p>
              <p className="mt-1 text-sm text-white/75">{item.label}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="container-page pb-14 md:pb-20">
        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-20">
        <section>
          <h2 className="text-display text-3xl">O que fazemos</h2>
          <dl className="mt-6 space-y-6">
            {[
              {
                term: 'Venda',
                detail:
                  'Avaliação de mercado, fotografia profissional, anúncio no site e nos portais, e acompanhamento até a escritura.',
              },
              {
                term: 'Locação',
                detail:
                  'Cadastro e análise do inquilino, contrato, garantia, vistoria de entrada e saída.',
              },
              {
                term: 'Administração',
                detail:
                  'Cobrança, repasse pontual, manutenção e prestação de contas. O proprietário só confere o extrato.',
              },
              {
                term: 'Lançamentos',
                detail:
                  'Comercialização de empreendimentos na região, da planta à entrega das chaves.',
              },
            ].map((item) => (
              <div key={item.term}>
                <dt className="font-medium">{item.term}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {item.detail}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className="text-display text-3xl">Onde estamos</h2>
          <ul className="mt-6 space-y-5">
            {BRANCHES.map((branch) => (
              <li
                key={branch.id}
                className="pulse-on-hover rounded-card border border-line bg-surface p-6 shadow-card"
              >
                <p className="text-eyebrow">{branch.name}</p>
                <h3 className="mt-1.5 text-lg font-medium">{branch.city}</h3>
                <address className="mt-2 not-italic text-sm leading-relaxed text-ink-soft">
                  {branch.street} — {branch.district}
                </address>
                <a
                  href={`tel:+55${branch.phone.replace(/\D/g, '')}`}
                  className="mt-3 inline-block text-sm font-medium underline-offset-4 hover:underline"
                >
                  {branch.phone}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-ink-faint">
            {SITE.legalName} — CNPJ {SITE.cnpj} — {SITE.creci}
          </p>
        </section>
      </div>

      <div className="mt-16 flex flex-wrap gap-3">
        <Link
          href="/imoveis"
          className="rounded-full bg-brand-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-600"
        >
          Ver nossos imóveis
        </Link>
        <Link
          href="/anuncie"
          className="rounded-full border border-line px-6 py-3 text-sm font-medium transition-colors hover:border-line-strong"
        >
          Anunciar meu imóvel
        </Link>
        </div>
      </div>
    </>
  );
}
