import { DEMO_MONTHS } from '@/data/demo-system';
import {
  scopedAgents,
  scopedContracts,
  scopedLeads,
  scopedListings,
  scopedProposals,
} from '@/data/scoped';
import { currentScope } from '@/lib/branch-cookie';
import { formatPriceCompact } from '@/lib/format';
import { ColumnChart, ShareBar, type ChartPoint } from '@/components/system/charts';
import { Card, DemoNotice, PageHead, Stat, StatRow, Table, Td } from '@/components/system/ui';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Relatórios' };

const MONEY_SERIES = [
  { label: 'Entradas', className: 'bg-brand-700' },
  { label: 'Saídas', className: 'bg-bronze-400' },
] as const;

const LEAD_SERIES = [
  { label: 'Captados', className: 'bg-brand-700' },
  { label: 'Fechados', className: 'bg-bronze-400' },
] as const;

/**
 * The dashboard answers "como está hoje"; this answers "como foi o semestre".
 * Same data, longer window, and broken down by the two cuts that decide
 * anything: por corretor e por unidade.
 */
export default async function RelatoriosPage() {
  const scope = await currentScope();
  const team = scopedAgents(scope);
  const leads = await scopedLeads(scope);
  const proposals = scopedProposals(scope);
  const contracts = await scopedContracts(scope);
  const summaries = await scopedListings(scope);

  const revenuePoints: ChartPoint[] = DEMO_MONTHS.map((month) => ({
    label: month.month,
    values: [month.revenue, month.expenses],
  }));
  const leadPoints: ChartPoint[] = DEMO_MONTHS.map((month) => ({
    label: month.month,
    values: [month.leads, month.closings],
  }));

  const revenue = DEMO_MONTHS.reduce((total, month) => total + month.revenue, 0);
  const expenses = DEMO_MONTHS.reduce((total, month) => total + month.expenses, 0);
  // The half-year totals come from the closed months, not from the lead list —
  // `leads` above is the carteira as it stands today, which is a different
  // question and would give a different number.
  const halfYearLeads = DEMO_MONTHS.reduce((total, month) => total + month.leads, 0);
  const closings = DEMO_MONTHS.reduce((total, month) => total + month.closings, 0);

  const bySource = Object.entries(
    leads.reduce<Record<string, number>>((counts, lead) => {
      counts[lead.source] = (counts[lead.source] ?? 0) + 1;
      return counts;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const byCity = Object.entries(
    summaries.reduce<Record<string, number>>((counts, summary) => {
      counts[summary.address.city] = (counts[summary.address.city] ?? 0) + 1;
      return counts;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const proposalRate = Math.round(
    (proposals.filter((proposal) => proposal.status === 'aceita').length /
      proposals.length) *
      100,
  );

  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Semestre"
        title="Relatórios"
        text="Os cinco meses fechados: faturamento, captação, desempenho por corretor e de onde vêm os leads."
      />

      <StatRow className="mb-6">
        <Stat
          label="Faturamento"
          value={formatPriceCompact(revenue)}
          hint={`${formatPriceCompact(expenses)} de despesa`}
        />
        <Stat
          label="Resultado"
          value={formatPriceCompact(revenue - expenses)}
          hint={`Margem de ${Math.round(((revenue - expenses) / revenue) * 100)}%`}
        />
        <Stat
          label="Leads captados"
          value={String(halfYearLeads)}
          hint={`${closings} fechados · ${Math.round((closings / halfYearLeads) * 100)}%`}
        />
        <Stat
          label="Propostas aceitas"
          value={`${proposalRate}%`}
          hint={`${proposals.length} registradas`}
        />
      </StatRow>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-bold">Faturamento por mês</h3>
          <ColumnChart
            title="Faturamento por mês: entradas e saídas"
            series={MONEY_SERIES}
            points={revenuePoints}
            as="moeda"
            footer="diferenca"
            footerLabel="Resultado"
            highlightLast={false}
          />
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-bold">Captação por mês</h3>
          <ColumnChart
            title="Leads por mês: captados e fechados"
            series={LEAD_SERIES}
            points={leadPoints}
            footer="taxa"
            footerLabel="Conversão"
            highlightLast={false}
          />
        </Card>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-bold">Origem dos leads</h3>
          <ul className="space-y-3">
            {bySource.map(([source, count]) => (
              <ShareBar key={source} label={source} value={count} total={leads.length} />
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-bold">Imóveis publicados por cidade</h3>
          <ul className="space-y-3">
            {byCity.map(([city, count]) => (
              <ShareBar key={city} label={city} value={count} total={summaries.length} />
            ))}
          </ul>
        </Card>
      </div>

      <h3 className="mb-3 text-sm font-bold">Desempenho por corretor</h3>
      <Table head={['Corretor', 'Unidade', 'Carteira', 'Leads em aberto', 'Fechados no mês', 'Aproveitamento']}>
        {team.map((agent) => {
          const total = agent.openLeads + agent.closedThisMonth;
          return (
            <tr key={agent.creci}>
              <Td>
                <span className="font-bold">{agent.name}</span>
                <span className="mt-0.5 block text-xs text-ink-faint">CRECI {agent.creci}</span>
              </Td>
              <Td muted>{agent.branch}</Td>
              <Td muted>{agent.activeListings} imóveis</Td>
              <Td muted>{agent.openLeads}</Td>
              <Td>
                <span className="font-bold">{agent.closedThisMonth}</span>
              </Td>
              <Td>{total > 0 ? `${Math.round((agent.closedThisMonth / total) * 100)}%` : '—'}</Td>
            </tr>
          );
        })}
      </Table>

      <p className="mt-6 rounded-lg border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-ink-soft">
        <strong className="font-bold text-ink">Contratos no período.</strong>{' '}
        {contracts.filter((contract) => contract.status === 'vigente').length} vigentes,{' '}
        {contracts.filter((contract) => contract.status === 'em assinatura').length} em
        assinatura e{' '}
        {contracts.filter((contract) => contract.status === 'encerrado').length} encerrado.
      </p>
    </>
  );
}
