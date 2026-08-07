import Link from 'next/link';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { scopedClients, scopedListings } from '@/data/scoped';
import { currentScope } from '@/lib/branch-cookie';

import { matchProperties, type SearchBrief } from '@/domain/matching';
import { isPublished, LISTING_STATUS_LABELS } from '@/domain/listing-status';
import { displayArea, propertyPath, PROPERTY_TYPES, type PropertyType } from '@/domain/property';
import { TYPE_LABELS } from '@/domain/search';
import { formatPrice } from '@/lib/format';
import { Badge, Card, DemoNotice, PageHead } from '@/components/system/ui';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Busca' };

function toNumber(value: string | string[] | undefined): number | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = Number(value.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function toText(value: string | string[] | undefined, fallback: string): string {
  return typeof value === 'string' && value !== '' ? value : fallback;
}

/**
 * The screen a corretor uses with a client on the phone: describe what the
 * person wants, get back what the carteira has — ranked, and each with the
 * reason it is on the list. It ranks instead of filtering, because "nenhum
 * resultado" is the one answer a corretor cannot give while someone is waiting.
 */
export default async function BuscaPage({ searchParams }: PageProps<'/sistema/busca'>) {
  const params = await searchParams;

  const brief: SearchBrief = {
    operation: toText(params.operation, 'venda') === 'locacao' ? 'locacao' : 'venda',
    type: (toText(params.type, 'qualquer') as PropertyType | 'qualquer') ?? 'qualquer',
    city: toText(params.city, 'qualquer'),
    maxPrice: toNumber(params.maxPrice),
    minBedrooms: toNumber(params.minBedrooms),
    minParking: toNumber(params.minParking),
    minArea: toNumber(params.minArea),
  };

  const term = toText(params.q, '').trim().toLowerCase();

  const scope = await currentScope();
  const listings = scopedListings(scope);
  const clients = scopedClients(scope);
  // Only what can still be offered: proposing a vendido to a client is worse
  // than showing nothing.
  const available = listings
    .filter((listing) => isPublished(listing.status))
    // The free-text leg, which is what the bar at the top of the panel posts
    // here: a corretor with a code on a post-it types the code, not a filter.
    .filter((listing) => {
      if (term === '') return true;
      return [
        listing.code,
        listing.title,
        listing.address.neighborhood,
        listing.address.city,
        TYPE_LABELS[listing.type],
      ]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });

  const matches = matchProperties(available, brief);

  const cities = [...new Set(listings.map((listing) => listing.address.city))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  );

  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Atendimento"
        title="Busca e matching"
        text="Descreva o que o cliente procura e o sistema ordena a carteira pelo que mais se aproxima, dizendo em que cada imóvel bate ou não."
      />

      <Card className="mb-6">
        <form method="get" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="block sm:col-span-2 xl:col-span-4">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-faint">
              Código, bairro ou cidade
            </span>
            <input
              name="q"
              type="search"
              defaultValue={term}
              placeholder="33066, Cinquentenário, Bento Gonçalves…"
              className={FIELD}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-faint">
              Finalidade
            </span>
            <select name="operation" defaultValue={brief.operation} className={FIELD}>
              <option value="venda">Venda</option>
              <option value="locacao">Locação</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-faint">
              Tipo
            </span>
            <select name="type" defaultValue={brief.type} className={FIELD}>
              <option value="qualquer">Qualquer</option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-faint">
              Cidade
            </span>
            <select name="city" defaultValue={brief.city} className={FIELD}>
              <option value="qualquer">Qualquer</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-faint">
              Até (R$)
            </span>
            <input
              name="maxPrice"
              inputMode="decimal"
              defaultValue={brief.maxPrice ?? ''}
              placeholder="550000"
              className={FIELD}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-faint">
              Dormitórios (mín.)
            </span>
            <input
              name="minBedrooms"
              type="number"
              min={0}
              defaultValue={brief.minBedrooms ?? ''}
              className={FIELD}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-faint">
              Vagas (mín.)
            </span>
            <input
              name="minParking"
              type="number"
              min={0}
              defaultValue={brief.minParking ?? ''}
              className={FIELD}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-faint">
              Área (mín. m²)
            </span>
            <input
              name="minArea"
              type="number"
              min={0}
              defaultValue={brief.minArea ?? ''}
              className={FIELD}
            />
          </label>

          <div className="flex items-end gap-3">
            <button
              type="submit"
              className="h-11 flex-1 rounded-lg bg-brand-700 text-sm font-bold text-white transition-colors hover:bg-brand-600"
            >
              Buscar
            </button>
            <Link
              href="/sistema/busca"
              className="inline-flex h-11 items-center rounded-lg border border-line px-4 text-sm transition-colors hover:border-line-strong"
            >
              Limpar
            </Link>
          </div>
        </form>
      </Card>

      {/* The same engine, pointed at the briefs already on file. */}
      <Card className="mb-6">
        <h3 className="mb-1 text-sm font-bold">Buscar pelo perfil de um cliente</h3>
        <p className="mb-4 text-xs text-ink-faint">
          Carrega o que já está cadastrado na ficha e roda o matching direto.
        </p>
        <ul className="flex flex-wrap gap-2">
          {clients.filter((client) => client.status !== 'inativo').map((client) => (
            <li key={client.email}>
              <Link
                href={{
                  pathname: '/sistema/busca',
                  query: {
                    operation: client.kind === 'locatário' ? 'locacao' : 'venda',
                    maxPrice: String(client.budget),
                    city: client.looking.includes('Bento') ? 'Bento Gonçalves' : 'Farroupilha',
                  },
                }}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs transition-colors hover:border-line-strong"
              >
                {client.name}
                <span className="text-ink-faint">{formatPrice(client.budget)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <h3 className="mb-3 text-sm font-bold">
        {matches.length} imóve{matches.length === 1 ? 'l' : 'is'} compatíve
        {matches.length === 1 ? 'l' : 'is'}
        <span className="ml-2 font-normal text-ink-faint">
          {term
            ? `de ${available.length} que batem com “${term}”`
            : `de ${available.length} disponíveis na carteira`}
        </span>
      </h3>

      {matches.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.map(({ property, score, reasons }) => (
            <li key={property.code}>
              <Card className="h-full">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={propertyPath(property)}
                      className="text-sm font-bold underline-offset-4 hover:underline"
                    >
                      {property.title || `${TYPE_LABELS[property.type]} em ${property.address.neighborhood}`}
                    </Link>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {property.code} · {property.address.neighborhood}, {property.address.city}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                      score >= 85
                        ? 'bg-green-50 text-green-800'
                        : score >= 65
                          ? 'bg-bronze-100 text-bronze-600'
                          : 'bg-surface-muted text-ink-soft'
                    }`}
                  >
                    {score}%
                  </span>
                </div>

                <p className="text-lg font-bold tracking-tight">
                  {formatPrice(
                    brief.operation === 'venda'
                      ? property.pricing.salePrice
                      : property.pricing.rentPrice,
                  )}
                </p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  {displayArea(property.areas) ? `${displayArea(property.areas)} m² · ` : ''}
                  {property.rooms.bedrooms ?? 0} dorm. · {property.rooms.parkingSpaces ?? 0} vagas
                </p>

                <ul className="mt-4 space-y-1.5 border-t border-line pt-3">
                  {reasons.map((reason) => (
                    <li key={reason.label} className="flex items-start gap-2 text-xs">
                      {reason.met ? (
                        <Check className="mt-0.5 size-3.5 shrink-0 text-green-800" aria-hidden />
                      ) : (
                        <X className="mt-0.5 size-3.5 shrink-0 text-ink-faint" aria-hidden />
                      )}
                      <span className={reason.met ? '' : 'text-ink-faint'}>{reason.label}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
                  <Badge>{LISTING_STATUS_LABELS[property.status]}</Badge>
                  <Link
                    href={propertyPath(property)}
                    className="inline-flex items-center gap-1 text-xs text-brand-700 underline-offset-4 hover:underline"
                  >
                    Ver anúncio
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </Link>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Card>
          <p className="text-sm text-ink-soft">
            Nada na carteira chega perto desse perfil. Vale ampliar a cidade ou o orçamento — ou
            registrar a busca para avisar o cliente quando entrar um imóvel compatível.
          </p>
        </Card>
      )}
    </>
  );
}

const FIELD = 'h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm';
