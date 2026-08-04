import type { Metadata } from 'next';
import { SearchResults } from '@/components/search/search-results';

export const metadata: Metadata = {
  title: 'Imóveis para alugar na Serra Gaúcha',
  description:
    'Casas, apartamentos e salas comerciais para alugar em Farroupilha, Bento Gonçalves e região. Filtre por bairro, valor, área e dormitórios.',
  alternates: { canonical: '/alugar' },
};

export default async function AlugarPage(props: PageProps<'/alugar'>) {
  const searchParams = await props.searchParams;

  return (
    <SearchResults
      operation="locacao"
      basePath="/alugar"
      searchParams={searchParams}
      heading="Imóveis para alugar"
      subheading="Locação residencial e comercial com administração completa: contrato, garantia, vistoria e repasse."
    />
  );
}
