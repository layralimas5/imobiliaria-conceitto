import type { Metadata } from 'next';
import { SearchResults } from '@/components/search/search-results';

export const metadata: Metadata = {
  title: 'Nossos imóveis na Serra Gaúcha',
  description:
    'Todo o portfólio da Conceitto em Farroupilha, Bento Gonçalves e região. Filtre por comprar ou alugar, cidade, bairro, tipo, preço, área e dormitórios.',
  alternates: { canonical: '/imoveis' },
};

/**
 * The unified catalog. Unlike `/comprar` and `/alugar` — which stay published
 * because they are what the old site ranks with — this page leaves the
 * operation out of the route, so buying and renting are two states of the same
 * filter panel instead of two destinations.
 */
export default async function ImoveisPage(props: PageProps<'/imoveis'>) {
  const searchParams = await props.searchParams;

  return (
    <SearchResults
      basePath="/imoveis"
      searchParams={searchParams}
      heading="Nossos imóveis"
      subheading="Casas, apartamentos, terrenos e imóveis comerciais em Farroupilha, Bento Gonçalves e região. Escolha entre comprar ou alugar e refine por bairro, preço, área e dormitórios."
    />
  );
}
