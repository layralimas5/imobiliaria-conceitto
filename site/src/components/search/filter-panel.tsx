'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import type { PropertyType } from '@/domain/property';
import {
  TYPE_LABELS_PLURAL,
  buildSearchParams,
  countActiveFilters,
  type SearchQuery,
} from '@/domain/search';
import type { CatalogFacets } from '@/data/property-repository';
import { formatPriceCompact } from '@/lib/format';
import { useModalFocus } from '@/hooks/use-modal-focus';

interface FilterPanelProps {
  facets: CatalogFacets;
  query: SearchQuery;
  basePath: string;
  resultCount: number;
}

const ROOM_OPTIONS = [1, 2, 3, 4] as const;

export function FilterPanel({ facets, query, basePath, resultCount }: FilterPanelProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<SearchQuery>(query);
  const [appliedQuery, setAppliedQuery] = useState<SearchQuery>(query);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const sheetRef = useModalFocus<HTMLDivElement>(isSheetOpen);

  // Navigation replaced the query: drop the in-progress draft and start from
  // what the URL now says. Adjusting during render avoids a wasted pass.
  if (query !== appliedQuery) {
    setAppliedQuery(query);
    setDraft(query);
  }

  useEffect(() => {
    document.body.style.overflow = isSheetOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSheetOpen]);

  const activeCount = countActiveFilters(query);

  const neighborhoods = useMemo(() => {
    const pool = draft.city
      ? facets.neighborhoods.filter((facet) => facet.citySlug === draft.city)
      : facets.neighborhoods;
    return pool.slice(0, 24);
  }, [draft.city, facets.neighborhoods]);

  function apply(next: SearchQuery) {
    const params = buildSearchParams({ ...next, page: 1 });
    const queryString = params.toString();
    router.push(queryString ? `${basePath}?${queryString}` : basePath, { scroll: true });
    setIsSheetOpen(false);
  }

  function clearAll() {
    router.push(basePath);
    setIsSheetOpen(false);
  }

  function toggle<T>(list: readonly T[], value: T): T[] {
    return list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];
  }

  const body = (
    <div className="space-y-7">
      <Field label="Cidade">
        <select
          value={draft.city ?? ''}
          onChange={(event) =>
            setDraft({
              ...draft,
              city: event.target.value || undefined,
              neighborhoods: [],
            })
          }
          className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm"
        >
          <option value="">Todas as cidades</option>
          {facets.cities.map((facet) => (
            <option key={facet.slug} value={facet.slug}>
              {facet.name} ({facet.count})
            </option>
          ))}
        </select>
      </Field>

      <Field label="Tipo de imóvel">
        <div className="flex flex-wrap gap-2">
          {facets.types.map((facet) => {
            const isOn = draft.types.includes(facet.type);
            return (
              <Chip
                key={facet.type}
                isOn={isOn}
                onClick={() =>
                  setDraft({
                    ...draft,
                    types: toggle(draft.types, facet.type) as PropertyType[],
                  })
                }
              >
                {TYPE_LABELS_PLURAL[facet.type]}
                <span className="ml-1 text-xs opacity-60">{facet.count}</span>
              </Chip>
            );
          })}
        </div>
      </Field>

      <Field label={`Preço (${formatPriceCompact(facets.priceRange.min)} a ${formatPriceCompact(facets.priceRange.max)})`}>
        <div className="grid grid-cols-2 gap-2.5">
          <NumberInput
            id="preco-min"
            label="Mínimo"
            value={draft.minPrice}
            onChange={(value) => setDraft({ ...draft, minPrice: value })}
          />
          <NumberInput
            id="preco-max"
            label="Máximo"
            value={draft.maxPrice}
            onChange={(value) => setDraft({ ...draft, maxPrice: value })}
          />
        </div>
      </Field>

      <Field label="Área (m²)">
        <div className="grid grid-cols-2 gap-2.5">
          <NumberInput
            id="area-min"
            label="Mínima"
            value={draft.minArea}
            onChange={(value) => setDraft({ ...draft, minArea: value })}
          />
          <NumberInput
            id="area-max"
            label="Máxima"
            value={draft.maxArea}
            onChange={(value) => setDraft({ ...draft, maxArea: value })}
          />
        </div>
      </Field>

      <Field label="Dormitórios">
        <RoomToggle
          value={draft.bedrooms}
          onChange={(value) => setDraft({ ...draft, bedrooms: value })}
          name="dormitorios"
        />
      </Field>

      <Field label="Banheiros">
        <RoomToggle
          value={draft.bathrooms}
          onChange={(value) => setDraft({ ...draft, bathrooms: value })}
          name="banheiros"
        />
      </Field>

      <Field label="Vagas">
        <RoomToggle
          value={draft.parkingSpaces}
          onChange={(value) => setDraft({ ...draft, parkingSpaces: value })}
          name="vagas"
        />
      </Field>

      {neighborhoods.length > 0 ? (
        <Field label="Bairro">
          <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto pr-1">
            {neighborhoods.map((facet) => (
              <Chip
                key={`${facet.citySlug}-${facet.slug}`}
                isOn={draft.neighborhoods.includes(facet.slug)}
                onClick={() =>
                  setDraft({
                    ...draft,
                    neighborhoods: toggle(draft.neighborhoods, facet.slug),
                  })
                }
              >
                {facet.name}
                <span className="ml-1 text-xs opacity-60">{facet.count}</span>
              </Chip>
            ))}
          </div>
        </Field>
      ) : null}

      <Field label="Outros">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={draft.exclusiveOnly}
            onChange={(event) =>
              setDraft({ ...draft, exclusiveOnly: event.target.checked })
            }
            className="size-4 rounded border-line-strong text-brand-600 focus:ring-brand-500"
          />
          Somente imóveis exclusivos
        </label>
      </Field>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setIsSheetOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-medium shadow-sm lg:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        Filtros
        {activeCount > 0 ? (
          <span className="rounded-full bg-brand-700 px-1.5 py-0.5 text-xs text-white">
            {activeCount}
          </span>
        ) : null}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block" aria-label="Filtros de busca">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-card border border-line bg-surface p-6 shadow-card">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-medium">Filtros</h2>
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-ink-faint underline underline-offset-2 hover:text-ink"
              >
                Limpar ({activeCount})
              </button>
            ) : null}
          </div>
          {body}
          <button
            type="button"
            onClick={() => apply(draft)}
            className="mt-7 h-11 w-full rounded-lg bg-brand-700 text-sm font-medium text-white transition-colors hover:bg-brand-600"
          >
            Aplicar filtros
          </button>
        </div>
      </aside>

      {/* Mobile sheet */}
      {isSheetOpen ? (
        <div
          ref={sheetRef}
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filtros"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setIsSheetOpen(false);
          }}
        >
          <button
            type="button"
            aria-label="Fechar filtros"
            onClick={() => setIsSheetOpen(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-2xl bg-surface">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-base font-medium">Filtros</h2>
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                aria-label="Fechar"
                className="inline-flex size-9 items-center justify-center rounded-full hover:bg-surface-muted"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">{body}</div>
            <div className="flex gap-3 border-t border-line px-5 py-4">
              <button
                type="button"
                onClick={clearAll}
                className="h-12 flex-1 rounded-lg border border-line text-sm font-medium"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={() => apply(draft)}
                className="h-12 flex-[2] rounded-lg bg-brand-700 text-sm font-medium text-white"
              >
                Ver {resultCount} imóveis
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-faint">
        {label}
      </legend>
      {children}
    </fieldset>
  );
}

function Chip({
  isOn,
  onClick,
  children,
}: {
  isOn: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isOn}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        isOn
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

function NumberInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        placeholder={label}
        value={value ?? ''}
        onChange={(event) => {
          const raw = event.target.value;
          onChange(raw === '' ? undefined : Math.max(0, Number.parseInt(raw, 10) || 0));
        }}
        className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm"
      />
    </div>
  );
}

function RoomToggle({
  value,
  onChange,
  name,
}: {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  name: string;
}) {
  return (
    <div role="group" aria-label={name} className="flex gap-2">
      {ROOM_OPTIONS.map((option) => (
        <Chip
          key={option}
          isOn={value === option}
          onClick={() => onChange(value === option ? undefined : option)}
        >
          {option}
          {option === 4 ? '+' : ''}
        </Chip>
      ))}
    </div>
  );
}
