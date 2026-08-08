'use client';

import { useId, useRef, useState, type ReactNode } from 'react';

export interface TabDefinition {
  readonly id: string;
  readonly label: string;
  /** Aparece ao lado do rótulo. Um zero informa tanto quanto um número. */
  readonly count?: number;
  readonly panel: ReactNode;
}

/**
 * As abas de uma ficha.
 *
 * Os painéis chegam prontos do servidor e todos ficam no DOM: trocar de aba é
 * instantâneo e o Ctrl+F do navegador continua achando o que está escrito em
 * qualquer uma delas. Esconder com `hidden` custa nada aqui — são listas curtas,
 * não telas inteiras.
 */
export function Tabs({ tabs }: { tabs: readonly TabDefinition[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const base = useId();
  const listRef = useRef<HTMLDivElement>(null);

  function move(direction: 1 | -1, from: number) {
    const next = (from + direction + tabs.length) % tabs.length;
    setActive(tabs[next].id);
    listRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [next]?.focus();
  }

  return (
    <div>
      <div
        ref={listRef}
        role="tablist"
        aria-label="Seções da ficha"
        className="mb-5 flex flex-wrap gap-1 border-b border-line"
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${base}-${tab.id}-tab`}
              aria-selected={isActive}
              aria-controls={`${base}-${tab.id}-painel`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActive(tab.id)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight') {
                  event.preventDefault();
                  move(1, index);
                }
                if (event.key === 'ArrowLeft') {
                  event.preventDefault();
                  move(-1, index);
                }
              }}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'border-brand-700 font-bold text-ink'
                  : 'border-transparent text-ink-soft hover:border-line-strong hover:text-ink'
              }`}
            >
              {tab.label}
              {tab.count === undefined ? null : (
                <span
                  className={`rounded-md px-1.5 py-0.5 text-xs tabular-nums ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'bg-surface-muted text-ink-faint'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${base}-${tab.id}-painel`}
          aria-labelledby={`${base}-${tab.id}-tab`}
          hidden={tab.id !== active}
          tabIndex={0}
        >
          {tab.panel}
        </div>
      ))}
    </div>
  );
}
