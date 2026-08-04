import type { Metadata } from 'next';
import { SearchResults } from '@/components/search/search-results';

export const metadata: Metadata = {
  title: 'Imóveis à venda na Serra Gaúcha',
  description:
    'Casas, apartamentos, terrenos e imóveis comerciais à venda em Farroupilha, Bento Gonçalves e região. Filtre por bairro, preço, área e dormitórios.',
  alternates: { canonical: '/comprar' },
};

export default async function ComprarPage(props: PageProps<'/comprar'>) {
  const searchParams = await props.searchParams;

  return (
    <SearchResults
      operation="venda"
      basePath="/comprar"
      searchParams={searchParams}
      heading="Imóveis à venda"
      subheading="Todo o portfólio da Conceitto em Farroupilha, Bento Gonçalves e região, com filtro de bairro, preço, área e dormitórios."
    />
  );
}
