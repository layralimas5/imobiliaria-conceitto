import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildSearchParams, type SearchQuery } from '@/domain/search';

interface PaginationProps {
  query: SearchQuery;
  basePath: string;
  page: number;
  totalPages: number;
}

/** Server-rendered so pagination works without JS and stays crawlable. */
export function Pagination({ query, basePath, page, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => {
    const params = buildSearchParams({ ...query, page: target });
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  const pages = pageWindow(page, totalPages);

  return (
    <nav aria-label="Paginação" className="mt-12 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          rel="prev"
          aria-label="Página anterior"
          className="inline-flex size-10 items-center justify-center rounded-lg border border-line bg-surface transition-colors hover:border-line-strong"
        >
          <ChevronLeft className="size-4" />
        </Link>
      ) : null}

      {pages.map((entry, index) =>
        entry === null ? (
          <span key={`gap-${index}`} className="px-1.5 text-ink-faint">
            …
          </span>
        ) : (
          <Link
            key={entry}
            href={hrefFor(entry)}
            aria-current={entry === page ? 'page' : undefined}
            className={`inline-flex size-10 items-center justify-center rounded-lg border text-sm transition-colors ${
              entry === page
                ? 'border-forest-700 bg-forest-700 text-white'
                : 'border-line bg-surface hover:border-line-strong'
            }`}
          >
            {entry}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={hrefFor(page + 1)}
          rel="next"
          aria-label="Próxima página"
          className="inline-flex size-10 items-center justify-center rounded-lg border border-line bg-surface transition-colors hover:border-line-strong"
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : null}
    </nav>
  );
}

/** Shows first, last, and a window around the current page. */
function pageWindow(page: number, totalPages: number): (number | null)[] {
  const window = new Set<number>([1, totalPages, page]);
  for (let offset = 1; offset <= 1; offset += 1) {
    if (page - offset > 0) window.add(page - offset);
    if (page + offset <= totalPages) window.add(page + offset);
  }
  const sorted = [...window].sort((a, b) => a - b);

  const result: (number | null)[] = [];
  let previous = 0;
  for (const value of sorted) {
    if (previous && value - previous > 1) result.push(null);
    result.push(value);
    previous = value;
  }
  return result;
}
