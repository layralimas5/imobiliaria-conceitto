import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { propertyRepository } from '@/data/catalog-repository';
import { placeSlugFor, resolvePlaceSlug } from '@/lib/place-slug';
import { SearchResults } from '@/components/search/search-results';

/**
 * Keeps the place URLs the current site already ranks for
 * (`/comprar/farroupilha-rs`) alive on the new site, instead of redirecting
 * them and throwing the accumulated authority away.
 */
export async function generateStaticParams(): Promise<{ lugar: string }[]> {
  const facets = await propertyRepository.facets('venda');
  const cityParams = facets.cities.map((city) => ({ lugar: placeSlugFor(city.slug) }));
  const neighborhoodParams = facets.neighborhoods
    .filter((facet) => facet.count >= 2)
    .map((facet) => ({ lugar: placeSlugFor(facet.citySlug, facet.slug) }));
  return [...cityParams, ...neighborhoodParams];
}

export async function generateMetadata(
  props: PageProps<'/comprar/[lugar]'>,
): Promise<Metadata> {
  const { lugar } = await props.params;
  const facets = await propertyRepository.facets('venda');
  const place = resolvePlaceSlug(lugar, facets);
  if (!place) return { title: 'Imóveis à venda' };

  const where = place.neighborhoodName
    ? `${place.neighborhoodName}, ${place.cityName}`
    : place.cityName;

  return {
    title: `Imóveis à venda em ${where}, RS`,
    description: `Casas, apartamentos, terrenos e imóveis comerciais à venda em ${where}. Fotos, valores e contato direto com a Imobiliária Conceitto.`,
    alternates: { canonical: `/comprar/${lugar}` },
  };
}

export default async function ComprarPlacePage(props: PageProps<'/comprar/[lugar]'>) {
  const [{ lugar }, searchParams] = await Promise.all([props.params, props.searchParams]);
  const facets = await propertyRepository.facets('venda');
  const place = resolvePlaceSlug(lugar, facets);
  if (!place) notFound();

  const where = place.neighborhoodName
    ? `${place.neighborhoodName}, ${place.cityName}`
    : place.cityName;

  return (
    <SearchResults
      operation="venda"
      basePath={`/comprar/${lugar}`}
      searchParams={{
        ...searchParams,
        city: place.citySlug,
        ...(place.neighborhoodSlug ? { bairros: place.neighborhoodSlug } : {}),
      }}
      heading={`Imóveis à venda em ${where}`}
    />
  );
}
