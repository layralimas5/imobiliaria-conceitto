import { currentScope } from '@/lib/branch-cookie';
import { scopedCommissions, scopedAgents } from '@/data/scoped';
import {
  agentCommission,
  officeCommission,
  type DemoCommission,
} from '@/data/demo-system';
import { formatPrice } from '@/lib/format';
import { ShareBar } from '@/components/system/charts';
import { Badge, Card, DemoNotice, PageHead, Stat, StatRow, Table, Td } from '@/components/system/ui';

export const metadata = { title: 'Comissões' };

export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<DemoCommission['status'], 'neutral' | 'brand' | 'good' | 'warn'> = {
  pago: 'good',
  'a pagar': 'warn',
  previsto: 'neutral',
};

/**
 * What each corretor has to receive, calculated instead of typed.
 *
 * A commission is three numbers stacked: the deal, the percentage the office
 * charges, and the share of that which goes to the corretores — split in two
 * when one person captou o imóvel and another vendeu. The screen shows all three
 * so nobody has to trust a single final figure.
 */
export default async function ComissoesPage() {
  const scope = await currentScope();
  const commissions = scopedCommissions(scope);
  const team = scopedAgents(scope);
  const office = commissions.reduce((total, entry) => total + officeCommission(entry), 0);
  const toAgents = commissions.reduce((total, entry) => total + agentCommission(entry), 0);
  const pending = commissions.filter((entry) => entry.status === 'a pagar').reduce(
    (total, entry) => total + agentCommission(entry),
    0,
  );
  const forecast = commissions.filter((entry) => entry.status === 'previsto').reduce(
    (total, entry) => total + officeCommission(entry),
    0,
  );

  // Each corretor takes half of the agents' share for capturing and half for
  // selling; when the same person did both, they take the whole thing.
  const perAgent = team.map((agent) => {
    const earned = commissions.reduce((total, entry) => {
      const share = agentCommission(entry);
      let value = 0;
      if (entry.listingAgent === agent.name) value += share / 2;
      if (entry.sellingAgent === agent.name) value += share / 2;
      return total + value;
    }, 0);
    return { name: agent.name, branch: agent.branch, earned };
  })
    .filter((entry) => entry.earned > 0)
    .sort((a, b) => b.earned - a.earned);

  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Repasse"
        title="Comissões"
        text="O que a imobiliária recebeu por negócio e quanto cabe a cada corretor, separado entre quem captou e quem vendeu."
      />

      <StatRow className="mb-6">
        <Stat label="Comissão da casa" value={formatPrice(office)} hint="Todos os negócios" />
        <Stat label="Repasse aos corretores" value={formatPrice(toAgents)} />
        <Stat label="A pagar" value={formatPrice(pending)} hint="Fechado, aguardando repasse" />
        <Stat label="Previsto" value={formatPrice(forecast)} hint="Negócio em andamento" />
      </StatRow>

      <Card className="mb-6">
        <h3 className="mb-4 text-sm font-bold">Comissão por corretor</h3>
        <ul className="space-y-3">
          {perAgent.map((agent) => (
            <li key={agent.name}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate font-bold">
                  {agent.name}
                  <span className="ml-2 font-normal text-ink-faint">{agent.branch}</span>
                </span>
                <span className="shrink-0">{formatPrice(agent.earned)}</span>
              </div>
              <div aria-hidden className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-brand-700"
                  style={{ width: `${(agent.earned / perAgent[0].earned) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mb-6">
        <h3 className="mb-4 text-sm font-bold">Origem da comissão</h3>
        <ul className="space-y-3">
          <ShareBar
            label="Vendas"
            value={commissions.filter((entry) => entry.kind === 'venda').length}
            total={commissions.length}
            suffix="negócios"
          />
          <ShareBar
            label="Locações"
            value={commissions.filter((entry) => entry.kind === 'locação').length}
            total={commissions.length}
            suffix="negócios"
          />
        </ul>
      </Card>

      <Table
        head={['Negócio', 'Fechado em', 'Valor', 'Taxa', 'Comissão da casa', 'Captação', 'Venda', 'Repasse', 'Situação']}
      >
        {commissions.map((entry) => (
          <tr key={entry.deal}>
            <Td>
              <span className="font-bold">{entry.deal}</span>
              <span className="mt-0.5 block text-xs text-ink-faint">{entry.kind}</span>
            </Td>
            <Td muted>{entry.closedAt}</Td>
            <Td muted>
              {formatPrice(entry.dealValue)}
              {entry.kind === 'locação' ? <span className="text-ink-faint">/mês</span> : null}
            </Td>
            <Td muted>{entry.rate}%</Td>
            <Td>
              <span className="font-bold">{formatPrice(officeCommission(entry))}</span>
            </Td>
            <Td muted>{entry.listingAgent}</Td>
            <Td muted>{entry.sellingAgent}</Td>
            <Td>
              {formatPrice(agentCommission(entry))}
              <span className="mt-0.5 block text-xs text-ink-faint">
                {entry.agentShare}% da comissão
              </span>
            </Td>
            <Td>
              <Badge tone={STATUS_TONE[entry.status]}>{entry.status}</Badge>
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
