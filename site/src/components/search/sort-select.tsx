'use client';

import { useRouter } from 'next/navigation';
import {
  SORT_LABELS,
  SORT_OPTIONS,
  buildSearchParams,
  type SearchQuery,
  type SortOption,
} from '@/domain/search';

interface SortSelectProps {
  query: SearchQuery;
  basePath: string;
  /** See `buildSearchParams`: `/imoveis` keeps the operation in the URL. */
  operationInUrl?: boolean;
}

export function SortSelect({ query, basePath, operationInUrl = false }: SortSelectProps) {
  const router = useRouter();

  function handleChange(sort: SortOption) {
    const params = buildSearchParams(
      { ...query, sort, page: 1 },
      { includeOperation: operationInUrl },
    );
    const queryString = params.toString();
    router.push(queryString ? `${basePath}?${queryString}` : basePath, { scroll: false });
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="ordenacao" className="text-sm text-ink-faint">
        Ordenar
      </label>
      <select
        id="ordenacao"
        value={query.sort}
        onChange={(event) => handleChange(event.target.value as SortOption)}
        className="h-10 rounded-lg border border-line bg-surface px-3 text-sm"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {SORT_LABELS[option]}
          </option>
        ))}
      </select>
    </div>
  );
}
