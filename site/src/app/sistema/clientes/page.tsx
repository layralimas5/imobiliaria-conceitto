import { currentScope } from '@/lib/branch-cookie';
import { scopedAgents, scopedClients, scopedListings, scopedOwners } from '@/data/scoped';
import type { DemoClient } from '@/data/demo-system';
import { TYPE_LABELS } from '@/domain/search';
import { formatPrice, formatPriceCompact } from '@/lib/format';
import { ClientForm } from '@/components/system/client-form';
import { Badge, DemoNotice, PageHead, Stat, StatRow, Table, Td } from '@/components/system/ui';

export const metadata = { title: 'Clientes' };

export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<DemoClient['status'], 'neutral' | 'brand' | 'good' | 'warn'> = {
  ativo: 'good',
  'em negociação': 'warn',
  inativo: 'neutral',
};

const KIND_LABELS: Record<DemoClient['kind'], string> = {
  comprador: 'Comprador',
  locatário: 'Locatário',
  investidor: 'Investidor',
  proprietário: 'Proprietário',
};

/**
 * Leads that turned into someone the office actually attends. A lead is a
 * contact that arrived; a cliente is a person with a search, a budget and a
 * corretor responsável — which is why the two live on different screens.
 */
export default async function ClientesPage() {
  const scope = await currentScope();
  const clients = scopedClients(scope);
  const active = clients.filter((client) => client.status !== 'inativo');
  const buyers = clients.filter((client) => client.kind !== 'locatário');
  const averageBudget =
    buyers.reduce((total, client) => total + client.budget, 0) / (buyers.length || 1);

  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Carteira"
        title="Clientes"
        text="Quem está comprando, alugando ou investindo, o que procura, com quanto e com qual corretor."
        action={
          <ClientForm
            agents={scopedAgents(scope).map((agent) => agent.name)}
            owners={scopedOwners(scope).map((owner) => owner.name)}
            listings={scopedListings(scope).map((listing) => ({
              code: listing.code,
              label: `${listing.code} — ${
                listing.title || TYPE_LABELS[listing.type]
              }, ${listing.address.neighborhood}`,
            }))}
          />
        }
      />

      <StatRow columns={3} className="mb-8">
        <Stat
          label="Clientes ativos"
          value={String(active.length)}
          hint={`${clients.length} na base`}
        />
        <Stat
          label="Em negociação"
          value={String(clients.filter((client) => client.status === 'em negociação').length)}
          hint="Com proposta em andamento"
        />
        <Stat
          label="Ticket médio buscado"
          value={formatPriceCompact(Math.round(averageBudget))}
          hint="Compra e investimento"
        />
      </StatRow>

      <Table head={['Cliente', 'Perfil', 'Procura', 'Orçamento', 'Corretor', 'Situação']}>
        {clients.map((client) => (
          <tr key={client.email}>
            <Td>
              <span className="font-bold">{client.name}</span>
              <span className="mt-0.5 block text-xs text-ink-faint">{client.phone}</span>
            </Td>
            <Td muted>{KIND_LABELS[client.kind]}</Td>
            <Td muted>{client.looking}</Td>
            <Td>
              {client.kind === 'locatário'
                ? `${formatPrice(client.budget)}/mês`
                : formatPrice(client.budget)}
            </Td>
            <Td muted>{client.agent}</Td>
            <Td>
              <Badge tone={STATUS_TONE[client.status]}>{client.status}</Badge>
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
