import Link from 'next/link';
import { scopedAgents, scopedListings, scopedOwners } from '@/data/scoped';
import { currentScope } from '@/lib/branch-cookie';
import {
  LISTING_STATUSES,
  LISTING_STATUS_LABELS,
  isPublished,
} from '@/domain/listing-status';
import { displayArea, propertyPath } from '@/domain/property';
import { TYPE_LABELS } from '@/domain/search';
import { formatPrice } from '@/lib/format';
import { ListingForm } from '@/components/system/listing-form';
import { ListingStatusSelect } from '@/components/system/listing-status-select';
import { Badge, DemoNotice, PageHead, Stat, StatRow, Table, Td } from '@/components/system/ui';

export const metadata = { title: 'Imóveis' };

// The list has to reflect what was just created or marked, so it is never cached.
export const dynamic = 'force-dynamic';

/**
 * The one screen running on real data: it lists what the site publishes plus
 * what it no longer publishes, which is the difference between a catálogo and a
 * carteira. Changing the status here is what takes an imóvel off the site.
 */
export default async function ImoveisPage({
  searchParams,
}: PageProps<'/sistema/imoveis'>) {
  const params = await searchParams;
  const filter = typeof params.status === 'string' ? params.status : 'todos';

  const scope = await currentScope();
  const listings = scopedListings(scope);
  const counts = LISTING_STATUSES.map((status) => ({
    status,
    count: listings.filter((listing) => listing.status === status).length,
  }));

  const shown =
    filter === 'todos'
      ? listings
      : listings.filter((listing) => listing.status === filter);

  const published = listings.filter((listing) => isPublished(listing.status)).length;
  const withPhoto = listings.filter((listing) => listing.photos.length > 0).length;
  const forRent = listings.filter((listing) => listing.operations.includes('locacao')).length;

  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Catálogo"
        title="Imóveis"
        text="A carteira inteira, sincronizada do MSYS Imob. Mudar o status aqui publica ou retira o imóvel do site na hora."
        action={
          <ListingForm
            agents={scopedAgents(scope).map((agent) => agent.name)}
            owners={scopedOwners(scope).map((owner) => owner.name)}
          />
        }
      />

      <StatRow className="mb-6">
        <Stat label="Na carteira" value={String(listings.length)} />
        <Stat label="Publicados no site" value={String(published)} hint="Disponível, reservado e em negociação" />
        <Stat label="Com fotografia" value={`${withPhoto} de ${listings.length}`} />
        <Stat label="Para locação" value={String(forRent)} />
      </StatRow>

      <nav aria-label="Filtrar por status" className="mb-6 flex flex-wrap gap-2">
        <FilterChip href="/sistema/imoveis" label="Todos" count={listings.length} isActive={filter === 'todos'} />
        {counts.map(({ status, count }) => (
          <FilterChip
            key={status}
            href={`/sistema/imoveis?status=${status}`}
            label={LISTING_STATUS_LABELS[status]}
            count={count}
            isActive={filter === status}
          />
        ))}
      </nav>

      <Table head={['Código', 'Imóvel', 'Tipo', 'Cidade', 'Valor', 'Área', 'Status', 'Foto']}>
        {shown.map((listing) => (
          <tr key={listing.code}>
            <Td muted>{listing.code}</Td>
            <Td>
              {isPublished(listing.status) ? (
                <Link
                  href={propertyPath(listing)}
                  className="font-bold underline-offset-4 hover:underline"
                >
                  {listing.title || `${TYPE_LABELS[listing.type]} em ${listing.address.neighborhood}`}
                </Link>
              ) : (
                <span className="font-bold text-ink-soft">
                  {listing.title || `${TYPE_LABELS[listing.type]} em ${listing.address.neighborhood}`}
                </span>
              )}
              <span className="mt-0.5 block text-xs text-ink-faint">
                {listing.address.neighborhood}
              </span>
            </Td>
            <Td muted>{TYPE_LABELS[listing.type]}</Td>
            <Td muted>{listing.address.city}</Td>
            <Td muted>
              {formatPrice(listing.pricing.salePrice ?? listing.pricing.rentPrice)}
            </Td>
            <Td muted>
              {displayArea(listing.areas) ? `${displayArea(listing.areas)} m²` : '—'}
            </Td>
            <Td>
              <ListingStatusSelect code={listing.code} status={listing.status} />
            </Td>
            <Td>
              {listing.photos.length > 0 ? (
                <Badge tone="good">
                  {listing.photos.length} foto{listing.photos.length > 1 ? 's' : ''}
                </Badge>
              ) : (
                <Badge tone="warn">Sem foto</Badge>
              )}
            </Td>
          </tr>
        ))}

        {shown.length === 0 ? (
          <tr>
            <td colSpan={8} className="px-4 py-10 text-center text-sm text-ink-faint">
              Nenhum imóvel com esse status.
            </td>
          </tr>
        ) : null}
      </Table>
    </>
  );
}

function FilterChip({
  href,
  label,
  count,
  isActive,
}: {
  href: string;
  label: string;
  count: number;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'true' : undefined}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
        isActive
          ? 'border-brand-700 bg-brand-700 font-bold text-white'
          : 'border-line bg-surface hover:border-line-strong'
      }`}
    >
      {label}
      <span className={isActive ? 'text-white/70' : 'text-ink-faint'}>{count}</span>
    </Link>
  );
}
