'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Building2,
  ChevronDown,
  LogOut,
  Menu,
  Plug,
  Settings,
  Target,
  UserRound,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { DEMO_NOTIFICATIONS, DEMO_OPERATOR } from '@/data/demo-system';

const NAV = [
  { href: '/sistema/leads', label: 'Leads', icon: Target },
  { href: '/sistema/corretores', label: 'Corretores', icon: Users },
  { href: '/sistema/imoveis', label: 'Imóveis', icon: Building2 },
  { href: '/sistema/crm', label: 'CRM', icon: UserRound },
  { href: '/sistema/financeiro', label: 'Financeiro', icon: Wallet },
  { href: '/sistema/configuracoes', label: 'Configurações', icon: Settings },
  { href: '/sistema/api', label: 'API', icon: Plug },
] as const;

const ACCOUNT_MENU = [
  { href: '/sistema/conta', label: 'Minha conta', icon: UserRound },
  { href: '/sistema/configuracoes', label: 'Configurações', icon: Settings },
] as const;

/**
 * Chrome for the internal panel: wine sidebar with the mark at the top, and a
 * bar carrying the bell and the operator. It sits outside the public site's
 * header and footer — this is a back office, and dressing it as a page of the
 * website would blur which of the two someone is looking at.
 */
export function SystemShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const current = NAV.find((item) => pathname.startsWith(item.href));

  return (
    <div className="flex min-h-screen bg-surface-muted">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-brand-900 transition-transform lg:static lg:translate-x-0 ${
          isNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <Link href="/" aria-label="Voltar ao site" className="block">
            <Image
              src="/imagens/logo-branco.png"
              alt="Imobiliária Conceitto"
              width={150}
              height={34}
              className="h-7 w-auto object-contain object-left"
            />
          </Link>
        </div>

        <nav aria-label="Seções do sistema" className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {NAV.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsNavOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-white/15 font-medium text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <item.icon className="size-4.5 shrink-0" aria-hidden strokeWidth={1.75} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <p className="border-t border-white/10 px-6 py-4 text-xs leading-relaxed text-white/45">
          Demonstração. Dados fictícios, sem integração.
        </p>
      </aside>

      {/* Scrim, mobile only */}
      {isNavOpen ? (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setIsNavOpen(false)}
          className="fixed inset-0 z-30 bg-ink/50 lg:hidden"
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-line bg-paper px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsNavOpen(true)}
              aria-label="Abrir menu"
              className="inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-surface-muted lg:hidden"
            >
              <Menu className="size-5" aria-hidden />
            </button>
            <h1 className="truncate text-sm font-medium">{current?.label ?? 'Sistema'}</h1>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsBellOpen((open) => !open)}
                aria-expanded={isBellOpen}
                aria-label={`Notificações, ${DEMO_NOTIFICATIONS.length} novas`}
                className="relative inline-flex size-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
              >
                <Bell className="size-[1.15rem]" aria-hidden />
                <span
                  aria-hidden
                  className="absolute right-2 top-2 size-2 rounded-full bg-brand-700 ring-2 ring-paper"
                />
              </button>

              {isBellOpen ? (
                <>
                  <button
                    type="button"
                    aria-label="Fechar notificações"
                    onClick={() => setIsBellOpen(false)}
                    className="fixed inset-0 z-10 cursor-default"
                  />
                  <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-card border border-line bg-surface shadow-panel">
                    <p className="border-b border-line px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-faint">
                      Notificações
                    </p>
                    <ul className="divide-y divide-line">
                      {DEMO_NOTIFICATIONS.map((item) => (
                        <li key={item.title} className="px-4 py-3">
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="mt-0.5 text-xs text-ink-soft">{item.detail}</p>
                          <p className="mt-1 text-xs text-ink-faint">{item.at}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAccountOpen((open) => !open)}
                aria-expanded={isAccountOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-surface-muted"
              >
                <span
                  aria-hidden
                  className="flex size-9 items-center justify-center rounded-full bg-brand-700 text-sm font-medium text-white"
                >
                  {DEMO_OPERATOR.name.charAt(0)}
                </span>
                <span className="hidden min-w-0 text-left sm:block">
                  <span className="block truncate text-sm font-medium leading-tight">
                    {DEMO_OPERATOR.name}
                  </span>
                  <span className="block truncate text-xs text-ink-faint">
                    {DEMO_OPERATOR.role}
                  </span>
                </span>
                <ChevronDown className="size-4 text-ink-faint" aria-hidden />
              </button>

              {isAccountOpen ? (
                <>
                  <button
                    type="button"
                    aria-label="Fechar menu da conta"
                    onClick={() => setIsAccountOpen(false)}
                    className="fixed inset-0 z-10 cursor-default"
                  />
                  <div
                    role="menu"
                    className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-card border border-line bg-surface py-1.5 shadow-panel"
                  >
                    {ACCOUNT_MENU.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-surface-muted"
                      >
                        <item.icon
                          className="size-4 text-ink-faint"
                          aria-hidden
                          strokeWidth={1.75}
                        />
                        {item.label}
                      </Link>
                    ))}

                    {/* Leaving the panel means going back to the site: there is
                        no session to end, and pretending otherwise would be a
                        button that does nothing. */}
                    <Link
                      href="/"
                      role="menuitem"
                      onClick={() => setIsAccountOpen(false)}
                      className="mt-1.5 flex items-center gap-3 border-t border-line px-4 py-2.5 text-sm text-brand-700 transition-colors hover:bg-brand-50"
                    >
                      <LogOut className="size-4" aria-hidden strokeWidth={1.75} />
                      Sair
                    </Link>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>

      {/* The sidebar's close affordance lives here so it can sit above it. */}
      {isNavOpen ? (
        <button
          type="button"
          onClick={() => setIsNavOpen(false)}
          aria-label="Fechar menu"
          className="fixed left-56 top-3 z-50 inline-flex size-9 items-center justify-center rounded-full bg-white/15 text-white lg:hidden"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
