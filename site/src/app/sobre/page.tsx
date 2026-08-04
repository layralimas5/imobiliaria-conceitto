import type { Metadata } from 'next';
import Link from 'next/link';
import { propertyRepository } from '@/data/catalog-repository';
import { BRANCHES, SITE } from '@/lib/site-config';

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

  return (
    <div className="container-page py-14 md:py-20">
      <header className="max-w-3xl">
        <p className="text-eyebrow">A Conceitto</p>
        <h1 className="text-display mt-4 text-5xl md:text-6xl">
          A gente vende a casa
          <br />
          depois de conhecer a rua.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-ink-soft">
          A Conceitto nasceu em Farroupilha em {SITE.foundedYear} e cresceu do jeito que
          imobiliária de cidade do interior cresce: no boca a boca, entregando o que
          prometeu. Hoje são duas lojas, uma equipe de corretores da região e imóveis da
          serra ao litoral.
        </p>
      </header>

      <ul className="mt-14 grid grid-cols-2 gap-6 border-y border-line py-10 lg:grid-cols-4">
        {numbers.map((item) => (
          <li key={item.label}>
            <p className="text-display text-4xl md:text-5xl">{item.value}</p>
            <p className="mt-2 text-sm text-ink-soft">{item.label}</p>
          </li>
        ))}
      </ul>

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
                className="rounded-card border border-line bg-surface p-6"
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
          href="/comprar"
          className="rounded-full bg-forest-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-forest-600"
        >
          Ver imóveis à venda
        </Link>
        <Link
          href="/anuncie"
          className="rounded-full border border-line px-6 py-3 text-sm font-medium transition-colors hover:border-line-strong"
        >
          Anunciar meu imóvel
        </Link>
      </div>
    </div>
  );
}
