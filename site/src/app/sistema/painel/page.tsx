import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { DEMO_MONTHS, DEMO_PIPELINE } from '@/data/demo-system';
import {
  scopedContracts,
  scopedEntries,
  scopedLeads,
  scopedListings,
  scopedProposals,
  scopedSchedule,
} from '@/data/scoped';
import { scopeLabel } from '@/domain/branch';
import { currentScope } from '@/lib/branch-cookie';
import { LEAD_STAGE_LABELS, LEAD_STAGE_TONES, isOpen } from '@/domain/lead-pipeline';
import { LISTING_STATUS_LABELS } from '@/domain/listing-status';
import { formatPrice, formatPriceCompact } from '@/lib/format';
import { ColumnChart, ShareBar, type ChartPoint } from '@/components/system/charts';
import { Badge, Card, DemoNotice, PageHead, Stat, StatRow, Table, Td } from '@/components/system/ui';

// Every number here is derived from what the panel holds right now.
export const dynamic = 'force-dynamic';

export const metadata = { title: 'Dashboard' };

const CURRENT_MONTH = 'Ago';

const MONEY_SERIES = [
  { label: 'Entradas', className: 'bg-brand-700' },
  { label: 'Saídas', className: 'bg-bronze-400' },
] as const;

const LEAD_SERIES = [
  { label: 'Captados', className: 'bg-brand-700' },
  { label: 'Fechados', className: 'bg-bronze-400' },
] as const;

/** Contracts inside this window are close enough to need someone's attention. */
const EXPIRY_WINDOW_DAYS = 120;

function Trend({ value }: { value: number }) {
  const isUp = value >= 0;
  const Icon = isUp ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold ${
        isUp ? 'text-green-800' : 'text-brand-700'
      }`}
    >
      <Icon className="size-3.5" aria-hidden strokeWidth={2} />
      {isUp ? '+' : '−'}
      {Math.abs(value)}% <span className="font-normal text-ink-faint">vs. mês anterior</span>
    </span>
  );
}

function SectionCard({
  title,
  href,
  linkLabel,
  aside,
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h3 className="text-sm font-bold">{title}</h3>
        {href && linkLabel ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-xs text-brand-700 underline-offset-4 hover:underline"
          >
            {linkLabel}
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        ) : null}
        {aside}
      </div>
      {children}
    </Card>
  );
}

function change(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

/** "28/02/2029" → days from today. Contract dates are the only dates in dd/mm/yyyy. */
function daysUntil(brazilianDate: string, today: Date): number | null {
  const [day, month, year] = brazilianDate.split('/').map(Number);
  if (!day || !month || !year) return null;
  const target = new Date(year, month - 1, day);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/**
 * The opening screen: the whole operation on one page. Imóveis by status, the
 * funnel, the week's agenda, the money, the contracts about to expire and who is
 * carrying the most work — every number computed from the same records the other
 * screens list, so the dashboard can never quietly disagree with them.
 */
export default async function PainelPage() {
  const scope = await currentScope();
  const leads = await scopedLeads(scope);
  const listings = await scopedListings(scope);
  const proposals = scopedProposals(scope);
  const contracts = await scopedContracts(scope);
  const schedule = await scopedSchedule(scope);
  const entries = scopedEntries(scope);
  const today = new Date();

  const byStatus = (status: string) =>
    listings.filter((listing) => listing.status === status).length;

  const openLeads = leads.filter((lead) => isOpen(lead.stage)).length;
  const newLeads = leads.filter((lead) => lead.stage === 'novo').length;
  const closedLeads = leads.filter((lead) => lead.stage === 'fechado').length;
  const conversion = leads.length > 0 ? Math.round((closedLeads / leads.length) * 100) : 0;

  const bySource = Object.entries(
    leads.reduce<Record<string, number>>((counts, lead) => {
      counts[lead.source] = (counts[lead.source] ?? 0) + 1;
      return counts;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  // Who is carrying the most conversations right now.
  const byAgent = Object.entries(
    leads.reduce<Record<string, { open: number; closed: number }>>((counts, lead) => {
      const entry = (counts[lead.agent] ??= { open: 0, closed: 0 });
      if (lead.stage === 'fechado') entry.closed += 1;
      else if (isOpen(lead.stage)) entry.open += 1;
      return counts;
    }, {}),
  ).sort((a, b) => b[1].open + b[1].closed - (a[1].open + a[1].closed));

  const settled = entries.filter((entry) => entry.status !== 'previsto');
  const income = settled
    .filter((entry) => entry.amount > 0)
    .reduce((total, entry) => total + entry.amount, 0);
  const outgoing = Math.abs(
    settled.filter((entry) => entry.amount < 0).reduce((total, entry) => total + entry.amount, 0),
  );
  const forecast = entries.filter((entry) => entry.status === 'previsto').reduce(
    (total, entry) => total + entry.amount,
    0,
  );

  const months = [
    ...DEMO_MONTHS,
    {
      month: CURRENT_MONTH,
      revenue: income,
      expenses: outgoing,
      leads: leads.length,
      closings: closedLeads,
    },
  ];
  const previous = months[months.length - 2];

  const revenuePoints: ChartPoint[] = months.map((month) => ({
    label: month.month,
    values: [month.revenue, month.expenses],
  }));
  const leadPoints: ChartPoint[] = months.map((month) => ({
    label: month.month,
    values: [month.leads, month.closings],
  }));

  const openProposals = proposals.filter(
    (proposal) => proposal.status === 'em análise' || proposal.status === 'contraproposta',
  );
  const proposalValue = openProposals.reduce((total, proposal) => total + proposal.offered, 0);

  const expiring = contracts.map((contract) => ({
    contract,
    days: contract.until === '—' ? null : daysUntil(contract.until, today),
  }))
    .filter(
      (entry): entry is { contract: (typeof contracts)[number]; days: number } =>
        entry.days !== null && entry.days <= EXPIRY_WINDOW_DAYS,
    )
    .sort((a, b) => a.days - b.days);

  const todaySchedule = schedule.filter((item) => item.day === 'Hoje');
  const weekVisits = schedule.filter((item) => item.kind === 'visita').length;

  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Visão geral"
        title="Dashboard"
        text={`A operação em uma página: carteira, captação, agenda, negociações e caixa. ${
          scope === 'todas' ? 'Somando as duas unidades.' : `Somente ${scopeLabel(scope)}.`
        }`}
      />

      <StatRow className="mb-4">
        <Stat
          label="Imóveis ativos"
          value={String(byStatus('disponivel'))}
          hint={`${listings.length} na carteira`}
        />
        <Stat
          label="Vendidos e alugados"
          value={String(byStatus('vendido') + byStatus('alugado'))}
          hint={`${byStatus('reservado') + byStatus('em-negociacao')} reservados ou em negociação`}
        />
        <Stat label="Leads novos" value={String(newLeads)} hint={`${openLeads} em aberto`} />
        <Stat
          label="Visitas agendadas"
          value={String(weekVisits)}
          hint={`${todaySchedule.length} compromissos hoje`}
        />
      </StatRow>

      <StatRow className="mb-6">
        <Stat
          label="Propostas abertas"
          value={String(openProposals.length)}
          hint={`${formatPriceCompact(proposalValue)} em jogo`}
        />
        <Stat
          label="Contratos vencendo"
          value={String(expiring.length)}
          hint={`Nos próximos ${EXPIRY_WINDOW_DAYS} dias`}
        />
        <Stat
          label="Resultado do mês"
          value={formatPrice(income - outgoing)}
          hint={`${formatPriceCompact(forecast)} previstos`}
        />
        <Stat
          label="Conversão"
          value={`${conversion}%`}
          hint={`${closedLeads} fechados de ${leads.length}`}
        />
      </StatRow>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Faturamento"
          href="/sistema/financeiro"
          linkLabel="Ver caixa"
          aside={<Trend value={change(income, previous.revenue)} />}
        >
          <ColumnChart
            title="Faturamento por mês: entradas e saídas"
            series={MONEY_SERIES}
            points={revenuePoints}
            as="moeda"
            footer="diferenca"
            footerLabel="Resultado"
          />
          <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-faint">Entradas</dt>
              <dd className="mt-1.5 font-bold text-green-800">{formatPrice(income)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-faint">Saídas</dt>
              <dd className="mt-1.5 font-bold text-ink-soft">{formatPrice(outgoing)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-faint">Previsto</dt>
              <dd className="mt-1.5 font-bold">{formatPrice(forecast)}</dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard
          title="Leads captados"
          href="/sistema/leads"
          linkLabel="Ver leads"
          aside={<Trend value={change(leads.length, previous.leads)} />}
        >
          <ColumnChart
            title="Leads por mês: captados e fechados"
            series={LEAD_SERIES}
            points={leadPoints}
            footer="taxa"
            footerLabel="Conversão"
          />
          <p className="mt-5 border-t border-line pt-4 text-xs uppercase tracking-wider text-ink-faint">
            Origem dos leads
          </p>
          <ul className="mt-3 space-y-3">
            {bySource.map(([source, count]) => (
              <ShareBar key={source} label={source} value={count} total={leads.length} />
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <SectionCard title="Carteira por status" href="/sistema/imoveis" linkLabel="Ver imóveis">
          <ul className="space-y-3">
            {(['disponivel', 'reservado', 'em-negociacao', 'vendido', 'alugado', 'inativo'] as const).map(
              (status) => (
                <ShareBar
                  key={status}
                  label={LISTING_STATUS_LABELS[status]}
                  value={byStatus(status)}
                  total={listings.length}
                />
              ),
            )}
          </ul>
        </SectionCard>

        <SectionCard title="Funil" href="/sistema/crm" linkLabel="Ver CRM">
          <ul className="space-y-2">
            {DEMO_PIPELINE.map((stage) => (
              <li key={stage.stage} className="flex items-center justify-between gap-3 text-sm">
                <Badge tone={LEAD_STAGE_TONES[stage.stage]}>
                  {LEAD_STAGE_LABELS[stage.stage]}
                </Badge>
                <span className="text-ink-soft">
                  {stage.count} · {formatPriceCompact(stage.value)}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Corretores com mais atendimentos" href="/sistema/corretores" linkLabel="Ver equipe">
          <ul className="space-y-3">
            {byAgent.map(([name, counts]) => (
              <li key={name}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-bold">{name}</span>
                  <span className="shrink-0 text-xs text-ink-faint">
                    {counts.open} abertos · {counts.closed} fechados
                  </span>
                </div>
                <div
                  aria-hidden
                  className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-surface-muted"
                >
                  <div
                    className="h-full bg-brand-700"
                    style={{ width: `${(counts.open / leads.length) * 100}%` }}
                  />
                  <div
                    className="h-full bg-bronze-400"
                    style={{ width: `${(counts.closed / leads.length) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <CalendarDays className="size-4 text-ink-faint" aria-hidden strokeWidth={1.75} />
              Agenda de hoje
            </h3>
            <Link
              href="/sistema/agenda"
              className="inline-flex items-center gap-1 text-xs text-brand-700 underline-offset-4 hover:underline"
            >
              Ver semana
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          <ul className="divide-y divide-line">
            {todaySchedule.map((item) => (
              <li
                key={`${item.time}-${item.title}`}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0"
              >
                <span className="w-12 shrink-0 text-sm font-bold tabular-nums">{item.time}</span>
                <span className="min-w-0 flex-1 text-sm">
                  {item.title}
                  <span className="mt-0.5 block text-xs text-ink-faint">
                    {item.withWhom} · {item.agent}
                  </span>
                </span>
                <Badge tone={item.status === 'concluído' ? 'neutral' : 'warn'}>{item.kind}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <AlertTriangle className="size-4 text-bronze-600" aria-hidden strokeWidth={1.75} />
              Contratos próximos do vencimento
            </h3>
            <Link
              href="/sistema/contratos"
              className="inline-flex items-center gap-1 text-xs text-brand-700 underline-offset-4 hover:underline"
            >
              Ver contratos
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>

          {expiring.length > 0 ? (
            <ul className="divide-y divide-line">
              {expiring.map(({ contract, days }) => (
                <li key={contract.code} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{contract.listing}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {contract.code} · {contract.client} · vence {contract.until}
                    </p>
                  </div>
                  <Badge tone={days <= 30 ? 'brand' : 'warn'}>
                    {days <= 0 ? 'Vencido' : `${days} dias`}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-faint">
              Nenhum contrato vence nos próximos {EXPIRY_WINDOW_DAYS} dias.
            </p>
          )}
        </Card>
      </div>

      <h3 className="mb-3 text-sm font-bold">Leads que precisam de ação</h3>
      <Table hoverable head={['Lead', 'Interesse', 'Origem', 'Corretor', 'Etapa', 'Próxima ação']}>
        {leads
          .filter((lead) => isOpen(lead.stage))
          .slice(0, 6)
          .map((lead) => (
            <tr key={lead.id}>
              <Td>
                <Link
                  href={`/sistema/leads/${lead.id}`}
                  className="font-bold underline-offset-4 hover:underline"
                >
                  {lead.name}
                </Link>
              </Td>
              <Td muted>{lead.interest}</Td>
              <Td muted>{lead.source}</Td>
              <Td muted>{lead.agent}</Td>
              <Td>
                <Badge tone={LEAD_STAGE_TONES[lead.stage]}>{LEAD_STAGE_LABELS[lead.stage]}</Badge>
              </Td>
              <Td>
                <span className="text-sm">{lead.nextAction}</span>
                <span className="mt-0.5 block text-xs text-ink-faint">{lead.nextActionAt}</span>
              </Td>
            </tr>
          ))}
      </Table>
    </>
  );
}
