import type { MetadataRoute } from 'next';
import { propertyRepository } from '@/data/catalog-repository';
import { developmentRepository } from '@/data/development-catalog';
import { developmentPath } from '@/domain/development';
import { propertyPath } from '@/domain/property';
import { placeSlugFor } from '@/lib/place-slug';
import { SITE } from '@/lib/site-config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [summaries, saleFacets, rentFacets, developments] = await Promise.all([
    propertyRepository.allSummaries(),
    propertyRepository.facets('venda'),
    propertyRepository.facets('locacao'),
    developmentRepository.all(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE.url, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE.url}/comprar`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE.url}/alugar`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE.url}/lancamentos`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE.url}/anuncie`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE.url}/sobre`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE.url}/contato`, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const placeRoutes: MetadataRoute.Sitemap = [
    ...saleFacets.cities.map((city) => ({
      url: `${SITE.url}/comprar/${placeSlugFor(city.slug)}`,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...rentFacets.cities.map((city) => ({
      url: `${SITE.url}/alugar/${placeSlugFor(city.slug)}`,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...saleFacets.neighborhoods
      .filter((facet) => facet.count >= 2)
      .map((facet) => ({
        url: `${SITE.url}/comprar/${placeSlugFor(facet.citySlug, facet.slug)}`,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
    ...rentFacets.neighborhoods
      .filter((facet) => facet.count >= 2)
      .map((facet) => ({
        url: `${SITE.url}/alugar/${placeSlugFor(facet.citySlug, facet.slug)}`,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
  ];

  const developmentRoutes: MetadataRoute.Sitemap = developments.map((development) => ({
    url: `${SITE.url}${developmentPath(development)}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const propertyRoutes: MetadataRoute.Sitemap = summaries.map((summary) => ({
    url: `${SITE.url}${propertyPath(summary)}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...developmentRoutes, ...placeRoutes, ...propertyRoutes];
}
