import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, CalendarClock } from 'lucide-react';
import { findLead } from '@/data/lead-source';
import { panelListings } from '@/data/catalog-repository';
import { DEMO_AGENTS } from '@/data/demo-system';
import { LEAD_STAGES, LEAD_STAGE_LABELS, stageIndex } from '@/domain/lead-pipeline';
import { LISTING_STATUS_LABELS } from '@/domain/listing-status';
import { TYPE_LABELS } from '@/domain/search';
import { propertyPath } from '@/domain/property';
import { formatPrice } from '@/lib/format';
import { LeadStageSelect } from '@/components/system/lead-stage-select';
import { Badge, Card, DemoNotice, Table, Td } from '@/components/system/ui';

export const dynamic = 'force-dynamic';

const EVENT_LABELS = {
  entrada: 'Entrada',
  contato: 'Contato',
  visita: 'Visita',
  proposta: 'Proposta',
  nota: 'Nota',
} as const;

/**
 * A lead's whole story on one page: what they asked for, which imóveis they
 * looked at, everything already said to them, and the one thing that has to
 * happen next. The last part is the reason the page exists — a CRM whose leads
 * have no próxima ação is a list of regrets.
 */
export default async function LeadPage({ params }: PageProps<'/sistema/leads/[id]'>) {
  const { id } = await params;
  const lead = findLead(id);
  if (!lead) notFound();

  const listings = panelListings();
  const viewed = lead.viewed
    .map((code) => listings.find((listing) => listing.code === code))
    .filter((listing): listing is (typeof listings)[number] => listing !== undefined);

  const reached = stageIndex(lead.stage);

  return (
    <>
      <DemoNotice />

      <Link
        href="/sistema/leads"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft underline-offset-4 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Voltar para os leads
      </Link>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-eyebrow">{lead.source} · entrou em {lead.createdAt}</p>
          <h2 className="text-display mt-2 text-3xl md:text-4xl">{lead.name}</h2>
          <p className="mt-3 text-sm text-ink-soft">
            {lead.phone} · {lead.email}
          </p>
        </div>
        <LeadStageSelect id={lead.id} stage={lead.stage} />
      </header>

      {/* The funnel as a progress bar: where this one lead actually is. */}
      <ol className="mb-8 flex flex-wrap gap-1.5">
        {LEAD_STAGES.map((stage, index) => (
          <li
            key={stage}
            className={`flex-1 rounded-md border px-2.5 py-2 text-center text-xs ${
              index === reached
                ? 'border-brand-700 bg-brand-700 font-bold text-white'
                : index < reached && lead.stage !== 'perdido'
                  ? 'border-brand-100 bg-brand-50 text-brand-700'
                  : 'border-line bg-surface text-ink-faint'
            }`}
          >
            {LEAD_STAGE_LABELS[stage]}
          </li>
        ))}
      </ol>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <h3 className="mb-4 text-sm font-bold">Histórico de atendimento</h3>
            <ol className="space-y-0">
              {[...lead.history].reverse().map((event, index) => (
                <li
                  key={`${event.at}-${index}`}
                  className="relative border-l border-line pb-5 pl-5 last:pb-0"
                >
                  <span
                    aria-hidden
                    className="absolute -left-[4.5px] top-1.5 size-2 rounded-full bg-brand-700"
                  />
                  <p className="text-sm">{event.detail}</p>
                  <p className="mt-1 text-xs text-ink-faint">
                    {EVENT_LABELS[event.kind]} · {event.at} · {event.by}
                  </p>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <h3 className="mb-4 text-sm font-bold">Imóveis visualizados</h3>
            {viewed.length > 0 ? (
              <Table head={['Código', 'Imóvel', 'Tipo', 'Valor', 'Status']}>
                {viewed.map((listing) => (
                  <tr key={listing.code}>
                    <Td muted>{listing.code}</Td>
                    <Td>
                      <Link
                        href={propertyPath(listing)}
                        className="font-bold underline-offset-4 hover:underline"
                      >
                        {listing.title || listing.address.neighborhood}
                      </Link>
                    </Td>
                    <Td muted>{TYPE_LABELS[listing.type]}</Td>
                    <Td muted>
                      {formatPrice(listing.pricing.salePrice ?? listing.pricing.rentPrice)}
                    </Td>
                    <Td>
                      <Badge>{LISTING_STATUS_LABELS[listing.status]}</Badge>
                    </Td>
                  </tr>
                ))}
              </Table>
            ) : (
              <p className="text-sm text-ink-faint">
                Nenhum imóvel registrado. Leads vindos do site trazem o imóvel que a pessoa
                estava vendo.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <CalendarClock className="size-4 text-ink-faint" aria-hidden strokeWidth={1.75} />
              Próxima ação
            </h3>
            <p className="mt-3 text-sm">{lead.nextAction}</p>
            <p className="mt-1 text-xs text-ink-faint">{lead.nextActionAt}</p>
            <Link
              href="/sistema/agenda"
              className="mt-4 inline-flex items-center gap-1 text-xs text-brand-700 underline-offset-4 hover:underline"
            >
              Ver na agenda
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </Card>

          <Card>
            <h3 className="mb-4 text-sm font-bold">Ficha</h3>
            <dl className="space-y-3 text-sm">
              <Detail term="Interesse" detail={lead.interest} />
              <Detail
                term="Orçamento"
                detail={lead.budget === null ? 'Não informado' : formatPrice(lead.budget)}
              />
              <Detail term="Origem" detail={lead.source} />
              <Detail term="Responsável" detail={lead.agent} />
              <Detail
                term="Unidade"
                detail={
                  DEMO_AGENTS.find((agent) => agent.name === lead.agent)?.branch ?? 'Farroupilha'
                }
              />
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}

function Detail({ term, detail }: { term: string; detail: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-line pb-3 last:border-b-0 last:pb-0">
      <dt className="text-ink-faint">{term}</dt>
      <dd className="text-right font-bold">{detail}</dd>
    </div>
  );
}
