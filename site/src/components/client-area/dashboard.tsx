'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Download, FileText, LogOut, Wallet } from 'lucide-react';
import {
  currentMonthNet,
  DEMO_CLIENT,
  type DemoManagedProperty,
} from '@/data/demo-client-area';
import {
  demoSessionServerSnapshot,
  demoSessionSnapshot,
  setDemoSession,
  subscribeDemoSession,
} from '@/lib/demo-session';
import { formatPrice } from '@/lib/format';

/**
 * The demo área do cliente.
 *
 * Client-rendered on purpose: the "session" is a browser flag set by the
 * sign-in dialog, so the server has nothing to decide and there is no auth to
 * fake on its side. Nothing here is protected, because nothing here is real —
 * see `demo-client-area.ts`.
 */
export function ClientAreaDashboard() {
  const router = useRouter();
  const signedIn = useSyncExternalStore(
    subscribeDemoSession,
    demoSessionSnapshot,
    demoSessionServerSnapshot,
  );

  function signOut() {
    setDemoSession(false);
    router.push('/');
  }

  // Still on the server snapshot: hold the layout rather than flash the
  // signed-out screen at someone who is signed in.
  if (signedIn === null) {
    return <div className="container-page py-24" aria-busy="true" />;
  }

  if (!signedIn) {
    return (
      <div className="container-page py-24 text-center md:py-32">
        <h1 className="text-display text-3xl">Entre para ver seus imóveis</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
          Use o ícone de usuário no topo da página para acessar a área do cliente.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-brand-700 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-600"
        >
          Voltar ao início
        </Link>
      </div>
    );
  }

  const client = DEMO_CLIENT;
  const net = currentMonthNet(client);
  const currentMonth = client.transfers[0]?.month ?? '';

  return (
    <div className="container-page py-12 md:py-16">
      <p className="rounded-lg border border-bronze-400/50 bg-bronze-100/60 px-4 py-3 text-xs leading-relaxed text-ink-soft">
        <strong className="font-medium text-ink">Demonstração.</strong> Os nomes,
        contratos e valores desta tela são fictícios e servem apenas para mostrar como
        a área do cliente funcionaria.
      </p>

      <header className="mt-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-eyebrow">Área do cliente</p>
          <h1 className="text-display mt-3 text-4xl md:text-5xl">
            Olá, {client.name.split(' ')[0]}
          </h1>
          <p className="mt-3 text-base text-ink-soft">
            Cliente Conceitto desde {client.since} · {client.properties.length} imóveis
            sob administração
          </p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-sm font-medium transition-colors hover:border-line-strong"
        >
          <LogOut className="size-4" aria-hidden />
          Sair
        </button>
      </header>

      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        <SummaryTile
          icon={Wallet}
          label={`Repasse de ${currentMonth.toLowerCase()}`}
          value={formatPrice(net) ?? '—'}
        />
        <SummaryTile
          icon={Building2}
          label="Imóveis administrados"
          value={String(client.properties.length)}
        />
        <SummaryTile
          icon={FileText}
          label="Documentos disponíveis"
          value={String(client.documents.length)}
        />
      </ul>

      <section className="mt-14">
        <h2 className="text-display text-2xl">Seus imóveis</h2>
        <ul className="mt-6 grid gap-4 lg:grid-cols-2">
          {client.properties.map((property) => (
            <li key={property.code}>
              <PropertyRow property={property} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="text-display text-2xl">Extrato de repasses</h2>
        <div className="mt-6 overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[38rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-muted text-left">
                <Th>Mês</Th>
                <Th>Imóvel</Th>
                <Th align="right">Aluguel</Th>
                <Th align="right">Taxa</Th>
                <Th align="right">Repassado</Th>
                <Th align="right">Pago em</Th>
              </tr>
            </thead>
            <tbody>
              {client.transfers.map((transfer, index) => (
                <tr
                  key={`${transfer.month}-${transfer.propertyCode}`}
                  className={index > 0 ? 'border-t border-line' : undefined}
                >
                  <Td>{transfer.month}</Td>
                  <Td>Cód. {transfer.propertyCode}</Td>
                  <Td align="right">{formatPrice(transfer.gross)}</Td>
                  <Td align="right" muted>
                    − {formatPrice(transfer.fee)}
                  </Td>
                  <Td align="right" strong>
                    {formatPrice(transfer.net)}
                  </Td>
                  <Td align="right" muted>
                    {transfer.paidOn}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-display text-2xl">Documentos</h2>
        <ul className="mt-6 divide-y divide-line rounded-card border border-line">
          {client.documents.map((document) => (
            <li
              key={document.name}
              className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{document.name}</p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  {document.kind} · emitido em {document.issuedOn}
                </p>
              </div>
              {/*
               * Disabled, not a dead link: there is no file to serve, and a
               * button that silently does nothing is worse than one that says
               * so. It goes live with the real integration.
               */}
              <button
                type="button"
                disabled
                title="Disponível na versão final"
                className="inline-flex h-10 shrink-0 cursor-not-allowed items-center gap-2 rounded-full border border-line px-4 text-sm text-ink-faint"
              >
                <Download className="size-4" aria-hidden />
                Baixar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  return (
    <li className="rounded-card border border-line bg-surface p-5 shadow-card">
      <Icon className="size-5 text-brand-700" aria-hidden strokeWidth={1.5} />
      <p className="mt-4 text-2xl font-medium tracking-tight">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-ink-faint">{label}</p>
    </li>
  );
}

function PropertyRow({ property }: { property: DemoManagedProperty }) {
  return (
    <article className="h-full rounded-card border border-line bg-surface p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-eyebrow">Cód. {property.code}</p>
          <h3 className="mt-1.5 text-lg font-medium">{property.label}</h3>
          <p className="mt-1 text-sm text-ink-soft">{property.address}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            property.status === 'em-dia'
              ? 'bg-green-50 text-green-800'
              : 'bg-bronze-100 text-bronze-600'
          }`}
        >
          {property.status === 'em-dia' ? 'Aluguel em dia' : 'A vencer'}
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-5 text-sm">
        <Detail term="Inquilino" detail={property.tenant} />
        <Detail term="Aluguel" detail={formatPrice(property.rent) ?? '—'} />
        <Detail term="Vencimento" detail={`Todo dia ${property.dueDay}`} />
        <Detail term="Contrato até" detail={property.contractUntil} />
      </dl>
    </article>
  );
}

function Detail({ term, detail }: { term: string; detail: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-ink-faint">{term}</dt>
      <dd className="mt-0.5 font-medium">{detail}</dd>
    </div>
  );
}

function Th({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-faint ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = 'left',
  muted = false,
  strong = false,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <td
      className={`px-4 py-3 ${align === 'right' ? 'text-right' : 'text-left'} ${
        muted ? 'text-ink-faint' : ''
      } ${strong ? 'font-medium' : ''}`}
    >
      {children}
    </td>
  );
}
