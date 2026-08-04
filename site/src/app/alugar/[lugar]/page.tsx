import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { propertyRepository } from '@/data/catalog-repository';
import { placeSlugFor, resolvePlaceSlug } from '@/lib/place-slug';
import { SearchResults } from '@/components/search/search-results';

export async function generateStaticParams(): Promise<{ lugar: string }[]> {
  const facets = await propertyRepository.facets('locacao');
  const cityParams = facets.cities.map((city) => ({ lugar: placeSlugFor(city.slug) }));
  const neighborhoodParams = facets.neighborhoods
    .filter((facet) => facet.count >= 2)
    .map((facet) => ({ lugar: placeSlugFor(facet.citySlug, facet.slug) }));
  return [...cityParams, ...neighborhoodParams];
}

export async function generateMetadata(
  props: PageProps<'/alugar/[lugar]'>,
): Promise<Metadata> {
  const { lugar } = await props.params;
  const facets = await propertyRepository.facets('locacao');
  const place = resolvePlaceSlug(lugar, facets);
  if (!place) return { title: 'Imóveis para alugar' };

  const where = place.neighborhoodName
    ? `${place.neighborhoodName}, ${place.cityName}`
    : place.cityName;

  return {
    title: `Imóveis para alugar em ${where}, RS`,
    description: `Casas, apartamentos e salas comerciais para alugar em ${where}. Fotos, valores e contato direto com a Imobiliária Conceitto.`,
    alternates: { canonical: `/alugar/${lugar}` },
  };
}

export default async function AlugarPlacePage(props: PageProps<'/alugar/[lugar]'>) {
  const [{ lugar }, searchParams] = await Promise.all([props.params, props.searchParams]);
  const facets = await propertyRepository.facets('locacao');
  const place = resolvePlaceSlug(lugar, facets);
  if (!place) notFound();

  const where = place.neighborhoodName
    ? `${place.neighborhoodName}, ${place.cityName}`
    : place.cityName;

  return (
    <SearchResults
      operation="locacao"
      basePath={`/alugar/${lugar}`}
      searchParams={{
        ...searchParams,
        city: place.citySlug,
        ...(place.neighborhoodSlug ? { bairros: place.neighborhoodSlug } : {}),
      }}
      heading={`Imóveis para alugar em ${where}`}
    />
  );
}
