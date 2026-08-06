'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
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
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (type) params.set('tipos', type);
    const trimmed = term.trim();
    if (trimmed) params.set('q', trimmed);
    const base = operation === 'venda' ? '/comprar' : '/alugar';
    const query = params.toString();
    router.push(query ? `${base}?${query}` : base);
  }

  const isHero = variant === 'hero';
  const fieldClass =
    'h-12 w-full rounded-lg border border-line bg-surface px-3.5 text-sm text-ink transition-colors focus:border-brand-500 md:h-14';

  return (
    <form
      onSubmit={handleSubmit}
      className={
        isHero
          ? 'rounded-2xl bg-surface/95 p-3 shadow-panel backdrop-blur-md md:p-4'
          : 'rounded-2xl border border-line bg-surface p-3 shadow-card md:p-4'
      }
      role="search"
      aria-label="Buscar imóveis"
    >
      <div
        role="group"
        aria-label="Tipo de negócio"
        className={`mb-3 inline-flex rounded-lg bg-surface-muted p-1 ${
          isHero ? 'mx-auto flex w-fit' : ''
        }`}
      >
        {(['venda', 'locacao'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setOperation(value)}
            aria-pressed={operation === value}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              operation === value
                ? 'bg-surface text-ink shadow-sm'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            {OPERATION_LABELS[value]}
          </button>
        ))}
      </div>

      <div className="grid gap-2.5 md:grid-cols-[1.2fr_1fr_1.4fr_auto]">
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
