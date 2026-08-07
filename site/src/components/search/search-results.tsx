import Link from 'next/link';
import { propertyRepository } from '@/data/catalog-repository';
import type { Operation } from '@/domain/property';
import {
  OPERATION_LABELS,
  countActiveFilters,
  parseSearchQuery,
  type SearchQuery,
} from '@/domain/search';
import { PropertyCard } from '@/components/property/property-card';
import { FilterPanel } from '@/components/search/filter-panel';
import { SortSelect } from '@/components/search/sort-select';
import { Pagination } from '@/components/search/pagination';
import { ResultsView } from '@/components/search/results-view';
import { toMapMarkers } from '@/components/map/map-marker';

interface SearchResultsProps {
  /**
   * Pins the catalog to one operation, the way `/comprar` and `/alugar` do.
   * Leave it out and the operation comes from the URL instead, which is what
   * turns `/imoveis` into a single page with a buy/rent filter.
   */
  operation?: Operation;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
  heading: string;
  subheading?: string;
}

export async function SearchResults({
  operation,
  basePath,
  searchParams,
  heading,
  subheading,
}: SearchResultsProps) {
  const parsed = parseSearchQuery(searchParams);
  const operationInUrl = operation === undefined;
  const activeOperation = operation ?? parsed.operation;
  const query: SearchQuery = { ...parsed, operation: activeOperation };
  const [results, facets] = await Promise.all([
    propertyRepository.search(query),
    propertyRepository.facets(activeOperation),
  ]);

  const activeCount = countActiveFilters(query);
  const markers = toMapMarkers(results.items, activeOperation);

  return (
    <div className="container-page py-10 md:py-14">
      <header className="mb-8 max-w-3xl">
        <p className="text-eyebrow">{OPERATION_LABELS[activeOperation]}</p>
        <h1 className="text-display mt-3 text-4xl md:text-5xl">{heading}</h1>
        {subheading ? (
          <p className="mt-4 text-base leading-relaxed text-ink-soft">{subheading}</p>
        ) : null}
      </header>

      <div className="grid gap-10 lg:grid-cols-[19rem_1fr]">
        <FilterPanel
          facets={facets}
          query={query}
          basePath={basePath}
          resultCount={results.total}
          operationInUrl={operationInUrl}
        />

        {/* min-w-0: a grid item defaults to min-width:auto, and the map would
            otherwise push the column past the page container. */}
        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-ink-soft">
              <strong className="font-medium text-ink">{results.total}</strong>{' '}
              {results.total === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
              {results.totalPages > 1 ? (
                <span className="text-ink-faint">
                  {' '}
                  · página {results.page} de {results.totalPages}
                </span>
              ) : null}
            </p>
            <SortSelect
              query={query}
              basePath={basePath}
              operationInUrl={operationInUrl}
            />
          </div>

          {results.items.length === 0 ? (
            <EmptyState
              clearHref={
                operationInUrl ? `${basePath}?operacao=${activeOperation}` : basePath
              }
              hasFilters={activeCount > 0}
            />
          ) : (
            <>
              <ResultsView
                markers={markers}
                plottedOf={{ plotted: markers.length, total: results.items.length }}
                list={
                  <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {results.items.map((property, index) => (
                      <li key={property.code} className="flex">
                        <PropertyCard
                          property={property}
                          operation={activeOperation}
                          priority={index < 3}
                          className="w-full"
                        />
                      </li>
                    ))}
                  </ul>
                }
              />
              <Pagination
                query={query}
                basePath={basePath}
                page={results.page}
                totalPages={results.totalPages}
                operationInUrl={operationInUrl}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  clearHref,
  hasFilters,
}: {
  clearHref: string;
  hasFilters: boolean;
}) {
  return (
    <div className="rounded-card border border-dashed border-line-strong bg-surface p-12 text-center">
      <h2 className="text-display text-2xl">Nenhum imóvel com esses filtros</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
        {hasFilters
          ? 'Tente ampliar a faixa de preço, incluir mais bairros ou remover algum filtro.'
          : 'Ainda não há imóveis publicados nessa categoria.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {hasFilters ? (
          <Link
            href={clearHref}
            className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
          >
            Limpar filtros
          </Link>
        ) : null}
        <Link
          href="/contato"
          className="rounded-full border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-line-strong"
        >
          Falar com um corretor
        </Link>
      </div>
    </div>
  );
}
