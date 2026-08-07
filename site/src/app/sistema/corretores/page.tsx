import { DEMO_AGENTS } from '@/data/demo-system';
import { readStore } from '@/lib/system-store';
import { AgentForm } from '@/components/system/agent-form';
import { Badge, DemoNotice, PageHead, Stat, Table, Td } from '@/components/system/ui';

// Reflects what the panel just created, so it is never cached.
export const dynamic = 'force-dynamic';

export const metadata = { title: 'Corretores' };

export default function CorretoresPage() {
  const store = readStore();

  const agents = [
    ...store.agents.map((agent) => ({
      name: agent.name,
      creci: agent.creci,
      branch: agent.branch,
      email: agent.email,
      role: agent.role,
      activeListings: 0,
      openLeads: 0,
      closedThisMonth: 0,
    })),
    ...DEMO_AGENTS.map((agent) => ({
      ...agent,
      email: `${agent.name.split(' ')[0].toLowerCase()}@imobiliariaconceitto.com.br`,
      role: 'Corretor',
    })),
  ];

  const listings = agents.reduce((total, agent) => total + agent.activeListings, 0);
  const closed = agents.reduce((total, agent) => total + agent.closedThisMonth, 0);

  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Equipe"
        title="Corretores"
        text="Quem está na rua, quantos imóveis cada um carrega e como está o mês. Cada cadastro cria um acesso próprio ao sistema."
        action={<AgentForm />}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Corretores ativos" value={String(agents.length)} hint="Nas duas lojas" />
        <Stat label="Imóveis na carteira" value={String(listings)} />
        <Stat label="Fechados no mês" value={String(closed)} />
      </div>

      <Table head={['Corretor', 'CRECI', 'Unidade', 'Acesso', 'Carteira', 'Fechados no mês']}>
        {agents.map((agent) => (
          <tr key={agent.creci}>
            <Td>
              <span className="font-medium">{agent.name}</span>
              <span className="mt-0.5 block text-xs text-ink-faint">{agent.role}</span>
            </Td>
            <Td muted>{agent.creci}</Td>
            <Td>
              <Badge>{agent.branch}</Badge>
            </Td>
            <Td muted>{agent.email}</Td>
            <Td muted>
              {agent.activeListings} imóveis · {agent.openLeads} leads
            </Td>
            <Td>
              <span className="font-medium">{agent.closedThisMonth}</span>
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
