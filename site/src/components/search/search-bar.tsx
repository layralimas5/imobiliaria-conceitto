'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { Operation, PropertyType } from '@/domain/property';
import { OPERATION_LABELS, TYPE_LABELS_PLURAL } from '@/domain/search';
import type { CityFacet, TypeFacet } from '@/data/property-repository';

interface SearchBarProps {
  cities: readonly CityFacet[];
  types: readonly TypeFacet[];
  defaultOperation?: Operation;
  /** `hero` sits on top of the cover image; `inline` sits on a page section. */
  variant?: 'hero' | 'inline';
}

export function SearchBar({
  cities,
  types,
  defaultOperation = 'venda',
  variant = 'hero',
}: SearchBarProps) {
  const router = useRouter();
  const [operation, setOperation] = useState<Operation>(defaultOperation);
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [term, setTerm] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({ operacao: operation });
    if (city) params.set('city', city);
    if (type) params.set('tipos', type);
    const trimmed = term.trim();
    if (trimmed) params.set('q', trimmed);
    router.push(`/imoveis?${params.toString()}`);
  }

  const isHero = variant === 'hero';
  const fieldClass =
    'h-12 w-full rounded-lg border border-line bg-surface px-3.5 text-sm text-ink transition-colors focus:border-brand-500 md:h-14';

  return (
    <form onSubmit={handleSubmit} role="search" aria-label="Buscar imóveis">
      {/*
       * Tabs, not a segmented control: the one you are on is the white plate the
       * panel below is attached to, and the ones you are not on are brand red.
       * That reads as "here, and these are the other ways in" at a glance, which
       * a pair of grey pills never did.
       */}
      <div className="flex flex-wrap gap-1.5">
        {(['venda', 'locacao'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setOperation(value)}
            aria-pressed={operation === value}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
              operation === value
                ? 'bg-surface text-ink shadow-sm'
                : 'bg-brand-700 text-white hover:bg-brand-600'
            }`}
          >
            {OPERATION_LABELS[value]}
          </button>
        ))}

        {/* Not a third state of the same choice — it hands over to the full
            filter panel on /imoveis, carrying the operation already picked. */}
        <Link
          href={`/imoveis?operacao=${operation}`}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Mais filtros
        </Link>
      </div>

      {/*
       * Translucent, and leaning on the blur to stay readable. The plate is
       * genuinely see-through — the hero shows through it — so the fields
       * inside keep their solid white fill and carry the contrast themselves.
       * `rounded-tl-none` welds the panel to the tab sitting on top of it.
       */}
      <div
        className={`grid gap-2.5 rounded-2xl rounded-tl-none p-3 md:grid-cols-[1.2fr_1fr_1.4fr_auto] md:p-4 ${
          isHero
            ? 'bg-surface/70 shadow-panel backdrop-blur-xl backdrop-saturate-150'
            : 'border border-line bg-surface/80 shadow-card backdrop-blur-md'
        }`}
      >
        <div>
          <label htmlFor="busca-cidade" className="sr-only">
            Cidade
          </label>
          <select
            id="busca-cidade"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className={fieldClass}
          >
            <option value="">Todas as cidades</option>
            {cities.map((facet) => (
              <option key={facet.slug} value={facet.slug}>
                {facet.name} ({facet.count})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="busca-tipo" className="sr-only">
            Tipo de imóvel
          </label>
          <select
            id="busca-tipo"
            value={type}
            onChange={(event) => setType(event.target.value)}
            className={fieldClass}
          >
            <option value="">Todos os tipos</option>
            {types.map((facet) => (
              <option key={facet.type} value={facet.type}>
                {TYPE_LABELS_PLURAL[facet.type as PropertyType]} ({facet.count})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="busca-termo" className="sr-only">
            Bairro, código ou palavra-chave
          </label>
          <input
            id="busca-termo"
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Bairro, código ou palavra-chave"
            className={fieldClass}
          />
        </div>

        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-700 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-600 md:h-14"
        >
          <Search className="size-4" aria-hidden />
          Buscar
        </button>
      </div>
    </form>
  );
}
