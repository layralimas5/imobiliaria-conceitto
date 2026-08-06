'use client';

import { useId, useState, type ReactNode } from 'react';
import { LayoutGrid, MapPin } from 'lucide-react';
import { PropertyMap } from '@/components/map/property-map';
import type { MapMarker } from '@/components/map/map-marker';

interface ResultsViewProps {
  /** Server-rendered listing grid, handed down so the cards stay off the client bundle. */
  readonly list: ReactNode;
  readonly markers: readonly MapMarker[];
  readonly plottedOf: { readonly plotted: number; readonly total: number };
}

type View = 'lista' | 'mapa';

/**
 * Switches the current page of results between grid and map.
 *
 * Only the page being viewed is plotted, not the whole catalog: 24 pins stay
 * readable without clustering, and the map never has to ship 1500 coordinates
 * to the browser. The grid stays mounted underneath so switching back is free
 * and the cards are always in the HTML for crawlers.
 */
export function ResultsView({ list, markers, plottedOf }: ResultsViewProps) {
  const [view, setView] = useState<View>('lista');
  const panelId = useId();
  const mappable = markers.length > 0;

  return (
    <>
      {mappable ? (
        <div
          role="tablist"
          aria-label="Formato dos resultados"
          className="mb-6 inline-flex rounded-full border border-line bg-surface p-1"
        >
          <ViewTab
            current={view}
            value="lista"
            panelId={panelId}
            onSelect={setView}
            icon={LayoutGrid}
          >
            Lista
          </ViewTab>
          <ViewTab
            current={view}
            value="mapa"
            panelId={panelId}
            onSelect={setView}
            icon={MapPin}
          >
            Mapa
          </ViewTab>
        </div>
      ) : null}

      <div id={panelId} role={mappable ? 'tabpanel' : undefined}>
        <div hidden={view === 'mapa'}>{list}</div>

        {mappable && view === 'mapa' ? (
          <div>
            <PropertyMap
              markers={markers}
              ariaLabel="Mapa dos imóveis desta página de resultados"
              className="h-[32rem] lg:h-[38rem]"
            />
            {plottedOf.plotted < plottedOf.total ? (
              <p className="mt-1 text-xs text-ink-faint">
                {plottedOf.plotted} de {plottedOf.total} imóveis desta página têm
                localização mapeada.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}

function ViewTab({
  current,
  value,
  panelId,
  onSelect,
  icon: Icon,
  children,
}: {
  current: View;
  value: View;
  panelId: string;
  onSelect: (view: View) => void;
  icon: typeof MapPin;
  children: ReactNode;
}) {
  const selected = current === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={panelId}
      onClick={() => onSelect(value)}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        selected ? 'bg-brand-700 text-white' : 'text-ink-soft hover:text-ink'
      }`}
    >
      <Icon className="size-4" aria-hidden />
      {children}
    </button>
  );
}
