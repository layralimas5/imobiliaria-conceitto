'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  CalendarDays,
  ChartNoAxesColumn,
  FileSignature,
  FolderOpen,
  Handshake,
  KanbanSquare,
  KeyRound,
  LayoutDashboard,
  Percent,
  Search,
  Settings,
  Target,
  UserRound,
  Users,
  UsersRound,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import { DEMO_OPERATOR } from '@/data/demo-system';
import { scopeLabel, type BranchScope } from '@/domain/branch';
import { ROLE_SECTIONS, isRole, type Section } from '@/domain/permissions';
import { SystemHeader } from '@/components/system/system-header';

/**
 * The panel's sections, grouped the way the work is grouped.
 *
 * The group labels are not decoration: thirteen-plus links in a flat list is a
 * wall someone has to read every time, and "Carteira / Atendimento / Rotina /
 * Financeiro / Administração" is the vocabulary the office already uses out
 * loud. Each group is a heading, so a screen reader can skip one whole.
 */
interface NavItem {
  readonly section: Section;
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
}

interface NavGroup {
  readonly group: string | null;
  readonly items: readonly NavItem[];
}

const NAV: readonly NavGroup[] = [
  {
    group: null,
    items: [
      { section: 'painel', href: '/sistema/painel', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Carteira',
    items: [
      { section: 'imoveis', href: '/sistema/imoveis', label: 'Imóveis', icon: Building2 },
      { section: 'busca', href: '/sistema/busca', label: 'Busca e matching', icon: Search },
      { section: 'proprietarios', href: '/sistema/proprietarios', label: 'Proprietários', icon: UsersRound },
    ],
  },
  {
    group: 'Atendimento',
    items: [
      { section: 'leads', href: '/sistema/leads', label: 'Leads', icon: Target },
      { section: 'crm', href: '/sistema/crm', label: 'CRM', icon: KanbanSquare },
      { section: 'clientes', href: '/sistema/clientes', label: 'Clientes', icon: UserRound },
      { section: 'agenda', href: '/sistema/agenda', label: 'Agenda', icon: CalendarDays },
    ],
  },
  {
    group: 'Negócios',
    items: [
      { section: 'propostas', href: '/sistema/propostas', label: 'Propostas', icon: Handshake },
      { section: 'contratos', href: '/sistema/contratos', label: 'Contratos', icon: FileSignature },
      { section: 'documentos', href: '/sistema/documentos', label: 'Documentos', icon: FolderOpen },
    ],
  },
  {
    group: 'Financeiro',
    items: [
      { section: 'financeiro', href: '/sistema/financeiro', label: 'Caixa', icon: Wallet },
      { section: 'comissoes', href: '/sistema/comissoes', label: 'Comissões', icon: Percent },
      { section: 'relatorios', href: '/sistema/relatorios', label: 'Relatórios', icon: ChartNoAxesColumn },
    ],
  },
  {
    group: 'Administração',
    items: [
      { section: 'corretores', href: '/sistema/corretores', label: 'Corretores', icon: Users },
      { section: 'usuarios', href: '/sistema/usuarios', label: 'Usuários', icon: KeyRound },
      { section: 'configuracoes', href: '/sistema/configuracoes', label: 'Configurações', icon: Settings },
    ],
  },
];

/**
 * Chrome for the internal panel: wine sidebar, white canvas, and a bar carrying
 * the search, the unit and the operator. It sits outside the public site's
 * header and footer — this is a back office, and dressing it as a page of the
 * website would blur which of the two someone is looking at.
 */
export function SystemShell({
  children,
  scope,
}: {
  children: React.ReactNode;
  scope: BranchScope;
}) {
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const allowed = new Set<Section>(
    ROLE_SECTIONS[isRole(DEMO_OPERATOR.role) ? DEMO_OPERATOR.role : 'Corretor'],
  );

  const groups = NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => allowed.has(item.section)),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="font-panel flex min-h-screen bg-paper">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-brand-900 transition-transform lg:static lg:translate-x-0 ${
          isNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[4.5rem] shrink-0 items-center border-b border-white/10 px-5">
          <Link href="/" aria-label="Voltar ao site" className="block">
            <Image
              src="/imagens/logo-branco.png"
              alt="Imobiliária Conceitto"
              width={220}
              height={38}
              className="h-[1.7rem] w-auto object-contain object-left"
            />
          </Link>
        </div>

        <nav aria-label="Seções do sistema" className="flex-1 overflow-y-auto px-2.5 py-4">
          {groups
            .filter((group) => group.group === null)
            .flatMap((group) => group.items)
            .map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                /* The dashboard sits on its own under the mark, not inside a
                   group: it is where everyone lands, and burying it in a list
                   makes people hunt for the way home. */
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsNavOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`mb-5 flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'border-white/20 bg-white/[0.14] font-bold text-white'
                      : 'border-white/10 text-white/70 hover:border-white/20 hover:bg-white/[0.07] hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`size-4.5 shrink-0 ${isActive ? 'text-gold' : ''}`}
                    aria-hidden
                    strokeWidth={1.75}
                  />
                  {item.label}
                </Link>
              );
            })}

          {groups
            .filter((group) => group.group !== null)
            .map((group) => (
              <section key={group.group} className="mb-5 last:mb-0">
                <h2 className="mb-1.5 px-2.5 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-white/35">
                  {group.group}
                </h2>

                <ul className="space-y-px">
                {group.items.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsNavOpen(false)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`relative flex items-center gap-2.5 rounded-md px-2.5 py-[0.4375rem] text-[0.8125rem] transition-colors ${
                          isActive
                            ? 'bg-white/[0.14] font-bold text-white'
                            : 'text-white/65 hover:bg-white/[0.07] hover:text-white'
                        }`}
                      >
                        {/* A rail rather than a filled block: it marks the row
                            without repainting it, so the eye finds the section
                            before it reads the label. */}
                        {isActive ? (
                          <span
                            aria-hidden
                            className="absolute -left-2.5 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-gold"
                          />
                        ) : null}
                        <item.icon
                          className={`size-4 shrink-0 ${isActive ? 'text-gold' : ''}`}
                          aria-hidden
                          strokeWidth={1.75}
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
                </ul>
              </section>
            ))}
        </nav>

        <div className="shrink-0 border-t border-white/10 px-5 py-3.5">
          <p className="text-[0.6875rem] leading-relaxed text-white/40">
            Demonstração · dados fictícios
          </p>
        </div>
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
        <SystemHeader scope={scope} onOpenNav={() => setIsNavOpen(true)} />

        {/*
         * A global filter that is not visible on the screen it filters is a trap:
         * someone reads "3 leads", concludes the week was dead, and never notices
         * the other unit was hidden. The strip only shows when something IS
         * hidden — with both units on, there is nothing to warn about.
         */}
        {scope !== 'todas' ? (
          <p className="flex items-center gap-2 border-b border-line bg-surface-muted/70 px-4 py-2 text-xs text-ink-soft md:px-6">
            <span
              aria-hidden
              className={`size-2 rounded-full ${
                scope === 'farroupilha' ? 'bg-brand-700' : 'bg-bronze-600'
              }`}
            />
            Mostrando apenas <strong className="font-bold text-ink">{scopeLabel(scope)}</strong>.
            Imóveis, leads, clientes, agenda, contratos e caixa estão filtrados por essa unidade.
          </p>
        ) : null}

        <main className="min-w-0 flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>

      {/* The sidebar's close affordance lives here so it can sit above it. */}
      {isNavOpen ? (
        <button
          type="button"
          onClick={() => setIsNavOpen(false)}
          aria-label="Fechar menu"
          className="fixed left-52 top-3.5 z-50 inline-flex size-9 items-center justify-center rounded-lg bg-white/15 text-white lg:hidden"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
