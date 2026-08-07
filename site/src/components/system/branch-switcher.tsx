'use client';

import { useState, useTransition } from 'react';
import { Building2, Check, ChevronDown, Loader2, MapPin, Phone } from 'lucide-react';
import { selectBranch } from '@/app/sistema/actions';
import { scopeLabel, type BranchScope } from '@/domain/branch';
import { BRANCHES } from '@/lib/site-config';

/**
 * Which office you are working in.
 *
 * Not a filter chip — every list in the panel is cut by this, so it reads as a
 * context, with the unit's own colour on it. The dot is the fastest way to know
 * without reading: wine is the matriz, bronze is Bento.
 */
const DOT: Record<string, string> = {
  todas: 'bg-ink-faint',
  farroupilha: 'bg-brand-700',
  'bento-goncalves': 'bg-bronze-600',
};

export function BranchSwitcher({ scope }: { scope: BranchScope }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function pick(next: BranchScope) {
    setIsOpen(false);
    startTransition(async () => {
      await selectBranch(next);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Unidade: ${scopeLabel(scope)}`}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface pl-2.5 pr-2 text-xs transition-colors hover:border-line-strong hover:bg-surface-muted"
      >
        {isPending ? (
          <Loader2 className="size-3 animate-spin text-ink-faint" aria-hidden />
        ) : (
          <span aria-hidden className={`size-2 rounded-full ${DOT[scope] ?? DOT.todas}`} />
        )}
        <span className="hidden font-bold sm:inline">{scopeLabel(scope)}</span>
        <Building2 className="size-3.5 text-ink-faint sm:hidden" aria-hidden strokeWidth={1.75} />
        <ChevronDown className="size-3.5 text-ink-faint" aria-hidden />
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 z-20 mt-2 w-[19rem] overflow-hidden rounded-card border border-line bg-surface shadow-soft"
          >
            <p className="border-b border-line px-4 py-2.5 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-faint">
              Trabalhando em
            </p>

            <button
              type="button"
              role="menuitemradio"
              aria-checked={scope === 'todas'}
              onClick={() => pick('todas')}
              className="flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors hover:bg-surface-muted"
            >
              <span aria-hidden className={`size-2 shrink-0 rounded-full ${DOT.todas}`} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">Todas as unidades</span>
                <span className="mt-0.5 block text-xs text-ink-faint">
                  Visão consolidada das duas lojas
                </span>
              </span>
              {scope === 'todas' ? (
                <Check className="size-4 shrink-0 text-brand-700" aria-hidden />
              ) : null}
            </button>

            <ul>
              {BRANCHES.map((branch) => (
                <li key={branch.id}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={scope === branch.id}
                    onClick={() => pick(branch.id)}
                    className="flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface-muted"
                  >
                    <span
                      aria-hidden
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${DOT[branch.id]}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">
                        {branch.city}
                        <span className="ml-1.5 font-normal text-ink-faint">{branch.name}</span>
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-xs text-ink-faint">
                        <MapPin className="size-3 shrink-0" aria-hidden strokeWidth={2} />
                        {branch.street}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-soft">
                        <Phone className="size-3 shrink-0" aria-hidden strokeWidth={2} />
                        {branch.phone}
                      </span>
                    </span>
                    {scope === branch.id ? (
                      <Check className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden />
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>

            <p className="border-t border-line bg-surface-muted/60 px-4 py-2.5 text-xs leading-relaxed text-ink-faint">
              Trocar a unidade refiltra imóveis, leads, clientes, agenda, contratos e caixa.
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
