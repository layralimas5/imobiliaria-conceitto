'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  Bell,
  Building2,
  ChevronDown,
  CornerDownLeft,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Target,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { DEMO_NOTIFICATIONS, DEMO_OPERATOR } from '@/data/demo-system';
import type { BranchScope } from '@/domain/branch';
import { BranchSwitcher } from '@/components/system/branch-switcher';

const ACCOUNT_MENU = [
  { href: '/sistema/conta', label: 'Minha conta', icon: UserRound },
  { href: '/sistema/configuracoes', label: 'Configurações', icon: Settings },
] as const;

/** The four things anyone starts by creating. */
const QUICK_CREATE = [
  { href: '/sistema/imoveis', label: 'Imóvel', hint: 'Cadastro e publicação', icon: Building2 },
  { href: '/sistema/leads', label: 'Lead', hint: 'Contato recebido', icon: Target },
  { href: '/sistema/corretores', label: 'Corretor', hint: 'Pessoa da equipe', icon: Users },
  { href: '/sistema/usuarios', label: 'Usuário', hint: 'Acesso ao sistema', icon: UserRound },
] as const;

/** Never changes, so the store never notifies. */
const subscribeToNothing = () => () => {};

let cachedStamp: number | null = null;
function clientNow(): number {
  cachedStamp ??= Date.now();
  return cachedStamp;
}

const GREETING_HOURS = [
  { until: 12, label: 'Bom dia' },
  { until: 18, label: 'Boa tarde' },
  { until: 24, label: 'Boa noite' },
] as const;

/**
 * The panel's top bar.
 *
 * It answers, left to right: who is here and when, what are you looking for,
 * which office you are in, and what do you want to create. The page title is not
 * repeated — the screen below already carries it, and a bar that only echoes the
 * heading under it is a bar doing nothing.
 *
 * The unit is the piece that is not generic chrome. The Conceitto is two offices
 * with different phones, teams and carteiras, and this control cuts every list in
 * the panel to one of them.
 */
export function SystemHeader({
  scope,
  onOpenNav,
}: {
  scope: BranchScope;
  onOpenNav: () => void;
}) {
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [dismissed, setDismissed] = useState<readonly string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const notifications = DEMO_NOTIFICATIONS.filter((item) => !dismissed.includes(item.title));
  const firstName = DEMO_OPERATOR.name.split(' ')[0];

  // The clock is read on the client only: rendering an hour on the server
  // produces a hydration mismatch the moment the two disagree about it. The
  // snapshot is memoised so React sees a stable value instead of re-rendering
  // forever on a fresh Date every call.
  const stamp = useSyncExternalStore(subscribeToNothing, clientNow, () => null);
  const now = stamp === null ? null : new Date(stamp);

  // "/" jumps to the search, the way every tool the team already uses does it.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (event.key === '/' || (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey))) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const greeting = now
    ? (GREETING_HOURS.find((slot) => now.getHours() < slot.until)?.label ?? 'Olá')
    : 'Olá';
  const today = now
    ? new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(now)
    : '';

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur-xl">
      <div className="flex h-[4.5rem] items-center gap-4 px-4 md:px-6">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Abrir menu"
          className="-ml-1 inline-flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-surface-muted lg:hidden"
        >
          <Menu className="size-5" aria-hidden />
        </button>

        <div className="min-w-0 shrink-0">
          <p className="truncate text-[0.9375rem] font-bold leading-tight">
            {greeting}, {firstName}
          </p>
          <p className="mt-0.5 truncate text-xs capitalize leading-tight text-ink-faint">
            {today || ' '}
          </p>
        </div>

        <span aria-hidden className="hidden h-8 w-px shrink-0 bg-line lg:block" />

        {/*
         * The search sits against the divider instead of floating in the middle
         * of the bar: centred, it was a pale shape adrift between two clusters
         * with nothing holding it. It also carries the same 12px radius as every
         * other control in the panel — a pill was the one fully round thing on
         * the screen, and that alone read as decoration rather than as a field.
         */}
        <form
          action="/sistema/busca"
          className="relative mr-auto hidden w-full min-w-0 max-w-sm lg:block"
        >
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
            aria-hidden
          />
          <input
            ref={searchRef}
            name="q"
            type="search"
            placeholder="Buscar imóvel, bairro ou código"
            aria-label="Buscar imóvel"
            className="peer h-10 w-full rounded-lg border border-line bg-surface-muted/60 pl-9 pr-11 text-sm transition-[background-color,border-color,box-shadow] placeholder:text-ink-faint hover:border-line-strong focus:border-brand-500 focus:bg-surface focus:shadow-card focus:outline-none"
          />
          <kbd
            aria-hidden
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-line bg-surface px-1.5 py-px font-mono text-[0.6875rem] leading-5 text-ink-faint peer-focus:hidden"
          >
            /
          </kbd>
          <CornerDownLeft
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 hidden size-3.5 -translate-y-1/2 text-brand-700 peer-focus:block"
          />
        </form>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <BranchSwitcher scope={scope} />

          {/* Primary action */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setIsCreateOpen((open) => !open)}
              aria-expanded={isCreateOpen}
              aria-haspopup="menu"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-700 pl-2.5 pr-3 text-xs font-bold text-white transition-colors hover:bg-brand-600"
            >
              <Plus className="size-4" aria-hidden strokeWidth={2.25} />
              Novo
            </button>

            {isCreateOpen ? (
              <Popover onClose={() => setIsCreateOpen(false)} className="w-60">
                <div role="menu" className="py-1">
                  {QUICK_CREATE.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setIsCreateOpen(false)}
                      className="flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-surface-muted"
                    >
                      <item.icon
                        className="mt-0.5 size-4 shrink-0 text-ink-faint"
                        aria-hidden
                        strokeWidth={1.75}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-bold">{item.label}</span>
                        <span className="block text-xs text-ink-faint">{item.hint}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </Popover>
            ) : null}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsBellOpen((open) => !open)}
              aria-expanded={isBellOpen}
              aria-label={
                notifications.length > 0
                  ? `Notificações, ${notifications.length} novas`
                  : 'Notificações, nenhuma nova'
              }
              className="relative inline-flex size-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <Bell className="size-[1.1rem]" aria-hidden strokeWidth={1.75} />
              {notifications.length > 0 ? (
                <span
                  aria-hidden
                  className="absolute right-1.5 top-1.5 size-2 rounded-full bg-gold ring-2 ring-paper"
                />
              ) : null}
            </button>

            {isBellOpen ? (
              <Popover onClose={() => setIsBellOpen(false)} className="w-80">
                <div className="flex items-center justify-between border-b border-line py-2 pl-4 pr-2">
                  <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-faint">
                    Notificações
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsBellOpen(false)}
                    aria-label="Fechar notificações"
                    className="inline-flex size-7 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </div>

                {notifications.length > 0 ? (
                  <ul className="divide-y divide-line">
                    {notifications.map((item) => (
                      <li key={item.title} className="flex items-start gap-2 py-3 pl-4 pr-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold">{item.title}</p>
                          <p className="mt-0.5 text-xs text-ink-soft">{item.detail}</p>
                          <p className="mt-1 text-xs text-ink-faint">{item.at}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDismissed((previous) => [...previous, item.title])}
                          aria-label={`Dispensar notificação: ${item.title}`}
                          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
                        >
                          <X className="size-3.5" aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-4 py-6 text-center text-sm text-ink-faint">
                    Nenhuma notificação por aqui.
                  </p>
                )}
              </Popover>
            ) : null}
          </div>

          <span aria-hidden className="hidden h-7 w-px bg-line sm:block" />

          {/* Operator */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAccountOpen((open) => !open)}
              aria-expanded={isAccountOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-1.5 transition-colors hover:bg-surface-muted"
            >
              <span
                aria-hidden
                className="flex size-9 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white ring-2 ring-brand-50"
              >
                {initialsOf(DEMO_OPERATOR.name)}
              </span>
              <span className="hidden min-w-0 text-left xl:block">
                <span className="block truncate text-xs font-bold leading-tight">
                  {DEMO_OPERATOR.name}
                </span>
                <span className="block truncate text-[0.6875rem] leading-tight text-ink-faint">
                  {DEMO_OPERATOR.role}
                </span>
              </span>
              <ChevronDown className="size-3.5 shrink-0 text-ink-faint" aria-hidden />
            </button>

            {isAccountOpen ? (
              <Popover onClose={() => setIsAccountOpen(false)} className="w-60">
                <div className="border-b border-line px-4 py-3">
                  <p className="text-sm font-bold">{DEMO_OPERATOR.name}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">{DEMO_OPERATOR.label}</p>
                </div>
                <div role="menu" className="py-1">
                  {ACCOUNT_MENU.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setIsAccountOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-surface-muted"
                    >
                      <item.icon className="size-4 text-ink-faint" aria-hidden strokeWidth={1.75} />
                      {item.label}
                    </Link>
                  ))}

                  {/* Leaving the panel means going back to the site: there is no
                      session to end, and pretending otherwise would be a button
                      that does nothing. */}
                  <Link
                    href="/"
                    role="menuitem"
                    onClick={() => setIsAccountOpen(false)}
                    className="mt-1 flex items-center gap-3 border-t border-line px-4 py-2.5 text-sm text-brand-700 transition-colors hover:bg-brand-50"
                  >
                    <LogOut className="size-4" aria-hidden strokeWidth={1.75} />
                    Sair
                  </Link>
                </div>
              </Popover>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

/** "Débora Cassol" → "DC". One letter looks like a placeholder; two look like a person. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
  return (first + last).toUpperCase();
}

/** Dropdown shell: the panel plus the click-away that closes it. */
function Popover({
  children,
  onClose,
  className = '',
}: {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="fixed inset-0 z-10 cursor-default"
      />
      <div
        className={`absolute right-0 z-20 mt-2 overflow-hidden rounded-card border border-line bg-surface shadow-soft ${className}`}
      >
        {children}
      </div>
    </>
  );
}
