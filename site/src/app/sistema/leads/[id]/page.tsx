import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  FileText,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react';
import { findLead } from '@/data/lead-source';
import { panelListings } from '@/data/catalog-repository';
import { documentsOf, scheduleOfLead } from '@/data/scoped';
import { DEMO_AGENTS, type DemoLead } from '@/data/demo-system';
import { LEAD_STAGES, LEAD_STAGE_LABELS, stageIndex } from '@/domain/lead-pipeline';
import { LISTING_STATUS_LABELS } from '@/domain/listing-status';
import { TYPE_LABELS } from '@/domain/search';
import { propertyPath } from '@/domain/property';
import { formatPrice } from '@/lib/format';
import { readStore } from '@/lib/system-store';
import { AppointmentForm } from '@/components/system/appointment-form';
import { DocumentForm } from '@/components/system/document-form';
import { LeadEditForm } from '@/components/system/lead-edit-form';
import { LeadEventForm } from '@/components/system/lead-event-form';
import { DetachListingButton, LeadListingForm } from '@/components/system/lead-listings';
import { LeadStageSelect } from '@/components/system/lead-stage-select';
import { Tabs } from '@/components/system/tabs';
import { Badge, Card, DemoNotice, Table, Td } from '@/components/system/ui';

export const dynamic = 'force-dynamic';

const EVENT_LABELS = {
  entrada: 'Entrada',
  contato: 'Contato',
  visita: 'Visita',
  proposta: 'Proposta',
  nota: 'Nota',
} as const;

const APPOINTMENT_TONE = {
  confirmado: 'good',
  'a confirmar': 'warn',
  concluído: 'neutral',
} as const;

/**
 * A ficha do lead: tudo que se sabe sobre uma pessoa e tudo que já se fez por
 * ela, num lugar só — dados, histórico, imóveis, compromissos e documentos.
 *
 * A parte que justifica a tela é a próxima ação. Um CRM cujos leads não têm
 * próxima ação é uma lista de arrependimentos; por isso marcar um compromisso
 * aqui grava as duas coisas de uma vez, o item na agenda e o que falta fazer.
 */
export default async function LeadPage({ params }: PageProps<'/sistema/leads/[id]'>) {
  const { id } = await params;
  const lead = await findLead(id);
  if (!lead) notFound();

  const [listings, appointments, documents, store] = await Promise.all([
    panelListings(),
    scheduleOfLead(lead.id),
    documentsOf('lead', lead.id),
    readStore(),
  ]);

  type PanelListing = (typeof listings)[number];
  const viewed = lead.viewed
    .map((code) => listings.find((entry) => entry.code === code))
    .filter((listing): listing is PanelListing => listing !== undefined);

  const agents = [
    ...new Set([...store.agents.map((agent) => agent.name), ...DEMO_AGENTS.map((a) => a.name)]),
  ];

  const listingOptions = listings
    .slice(0, 400)
    .map(
      (listing) =>
        `${listing.code} — ${listing.title || TYPE_LABELS[listing.type]}, ${listing.address.neighborhood}`,
    );

  const reached = stageIndex(lead.stage);
  const editable = lead.isStored === true;
  const branch = branchOf(lead);
  const responsible = DEMO_AGENTS.find((agent) => agent.name === lead.agent);

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

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-eyebrow">
            {lead.source} · entrou em {lead.createdAt}
          </p>
          <h2 className="text-display mt-2 text-3xl md:text-4xl">{lead.name}</h2>
          <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-ink-soft">
            <a
              href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
            >
              <Phone className="size-3.5 text-ink-faint" aria-hidden strokeWidth={1.75} />
              {lead.phone}
            </a>
            {lead.email ? (
              <a
                href={`mailto:${lead.email}`}
                className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
              >
                <Mail className="size-3.5 text-ink-faint" aria-hidden strokeWidth={1.75} />
                {lead.email}
              </a>
            ) : null}
          </p>
        </div>
        <LeadStageSelect id={lead.id} stage={lead.stage} />
      </header>

      {/* O que se faz com um lead, na ordem em que se faz. */}
      <div className="mb-6 flex flex-wrap gap-2.5">
        <LeadEventForm leadId={lead.id} agent={lead.agent} variant="primary" />
        <LeadEditForm lead={lead} agents={agents} />
        <AppointmentForm
          agents={agents}
          leadId={lead.id}
          withWhom={lead.name}
          defaultAgent={lead.agent}
          variant="secondary"
        />
        <LeadListingForm leadId={lead.id} agent={lead.agent} options={listingOptions} />
        <DocumentForm
          trigger="Anexar documento"
          variant="secondary"
          fixedTarget={{ kind: 'lead', label: lead.name, id: lead.id }}
        />
      </div>

      {!editable ? (
        <p className="mb-6 rounded-lg border border-line bg-surface-muted px-4 py-3 text-xs leading-relaxed text-ink-soft">
          <strong className="font-bold text-ink">Lead de exemplo.</strong> Os botões acima
          funcionam, mas este registro é semeado e não é gravado. Cadastre um lead pelo painel ou
          envie o formulário do site para ver a ficha guardando tudo.
        </p>
      ) : null}

      {/* O funil como barra de progresso: onde este lead está, de fato. */}
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
        <div className="lg:col-span-2">
          <Tabs
            tabs={[
              {
                id: 'atendimento',
                label: 'Atendimento',
                count: lead.history.length,
                panel: (
                  <Card>
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
                          <p className="whitespace-pre-line text-sm">{event.detail}</p>
                          <p className="mt-1 text-xs text-ink-faint">
                            {EVENT_LABELS[event.kind]} · {event.at} · {event.by}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </Card>
                ),
              },
              {
                id: 'imoveis',
                label: 'Imóveis',
                count: viewed.length,
                panel:
                  viewed.length > 0 ? (
                    <Table head={['Código', 'Imóvel', 'Tipo', 'Valor', 'Status', '']}>
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
                          <Td>
                            <DetachListingButton leadId={lead.id} code={listing.code} />
                          </Td>
                        </tr>
                      ))}
                    </Table>
                  ) : (
                    <Empty>
                      Nenhum imóvel vinculado ainda. Quem chega pelo site já entra com o imóvel que
                      estava vendo; o que o corretor apresentar depois entra em “Vincular imóvel”.
                    </Empty>
                  ),
              },
              {
                id: 'agenda',
                label: 'Agenda',
                count: appointments.length,
                panel:
                  appointments.length > 0 ? (
                    <ul className="overflow-hidden rounded-card border border-line bg-surface">
                      {appointments.map((item) => (
                        <li
                          key={item.id ?? `${item.iso}-${item.time}`}
                          className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5 border-b border-line px-4 py-3.5 last:border-b-0"
                        >
                          <span className="w-32 shrink-0 text-sm font-bold tabular-nums">
                            {item.date} · {item.time}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm">{item.title}</span>
                            <span className="mt-0.5 block text-xs text-ink-faint">
                              {item.agent} · {item.where}
                            </span>
                          </span>
                          <Badge>{item.kind}</Badge>
                          <Badge tone={APPOINTMENT_TONE[item.status]}>{item.status}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Empty>
                      Nada marcado com esse lead. Um compromisso criado aqui entra na agenda da
                      equipe e vira a próxima ação da ficha.
                    </Empty>
                  ),
              },
              {
                id: 'documentos',
                label: 'Documentos',
                count: documents.length,
                panel:
                  documents.length > 0 ? (
                    <Table head={['Arquivo', 'Tipo', 'Tamanho', 'Enviado em', 'Por']}>
                      {documents.map((document) => (
                        <tr key={`${document.name}-${document.uploadedAt}`}>
                          <Td>
                            <span className="flex items-center gap-2.5">
                              <FileText
                                className="size-4 shrink-0 text-ink-faint"
                                aria-hidden
                                strokeWidth={1.75}
                              />
                              <span className="font-bold">{document.name}</span>
                            </span>
                          </Td>
                          <Td muted>{document.kind}</Td>
                          <Td muted>{document.size}</Td>
                          <Td muted>{document.uploadedAt}</Td>
                          <Td muted>{document.uploadedBy}</Td>
                        </tr>
                      ))}
                    </Table>
                  ) : (
                    <Empty>
                      Nenhum documento anexado. RG, CPF, comprovante de renda e proposta assinada
                      ficam aqui, em pasta privada fora do site.
                    </Empty>
                  ),
              },
            ]}
          />
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
              <Detail term="CPF / CNPJ" detail={lead.document || 'Não informado'} />
              <Detail term="Origem" detail={lead.source} />
              <Detail term="Unidade" detail={branch} />
              <Detail term="Entrada" detail={lead.createdAt} />
            </dl>
            {lead.notes ? (
              <div className="mt-4 border-t border-line pt-4">
                <p className="text-xs uppercase tracking-wider text-ink-faint">Observações</p>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed">{lead.notes}</p>
              </div>
            ) : null}
          </Card>

          <Card>
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <UserRound className="size-4 text-ink-faint" aria-hidden strokeWidth={1.75} />
              Corretor responsável
            </h3>
            <p className="mt-3 text-sm font-bold">{lead.agent}</p>
            <p className="mt-1 text-xs text-ink-faint">
              {responsible ? `CRECI ${responsible.creci} · ${responsible.branch}` : branch}
            </p>
            <Link
              href="/sistema/corretores"
              className="mt-4 inline-flex items-center gap-1 text-xs text-brand-700 underline-offset-4 hover:underline"
            >
              Ver a equipe
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-ink-faint">
              Trocar o responsável é feito em “Editar ficha” e fica registrado no histórico.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}

/** A unidade gravada na ficha; na falta dela, a do corretor que atende. */
function branchOf(lead: DemoLead): string {
  if (lead.branch) return lead.branch;
  return DEMO_AGENTS.find((agent) => agent.name === lead.agent)?.branch ?? 'Farroupilha';
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-surface px-5 py-8 text-center">
      <p className="mx-auto max-w-md text-sm leading-relaxed text-ink-faint">{children}</p>
    </div>
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
