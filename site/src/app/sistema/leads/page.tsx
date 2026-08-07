import {
  DEMO_AGENTS,
  DEMO_LEADS,
  LEAD_STAGE_LABELS,
  type DemoLead,
} from '@/data/demo-system';
import { readStore } from '@/lib/system-store';
import { LeadForm } from '@/components/system/lead-form';
import { Badge, DemoNotice, PageHead, Stat, Table, Td } from '@/components/system/ui';

// Reflects what the panel just created, so it is never cached.
export const dynamic = 'force-dynamic';

export const metadata = { title: 'Leads' };

const TONE: Record<string, 'neutral' | 'brand' | 'good' | 'warn'> = {
  novo: 'brand',
  contato: 'neutral',
  visita: 'warn',
  proposta: 'warn',
  fechado: 'good',
};

export default function LeadsPage() {
  const store = readStore();

  // What the panel registered comes first, then the seeded examples.
  const leads = [
    ...store.leads.map((lead) => ({
      name: lead.name,
      phone: lead.phone,
      interest: lead.interest,
      source: lead.source,
      stage: lead.stage,
      agent: lead.agent,
      createdAt: lead.createdAt,
    })),
    ...DEMO_LEADS.map((lead) => ({ ...lead }) as Record<keyof DemoLead, string>),
  ];

  const open = leads.filter((lead) => lead.stage !== 'fechado').length;
  const fromSite = leads.filter((lead) => lead.source === 'Site').length;
  const agentNames = DEMO_AGENTS.map((agent) => agent.name);

  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Atendimento"
        title="Leads"
        text="Tudo que chega pelo site, pelo WhatsApp e pelos portais, com o corretor responsável e em que ponto está a conversa."
        action={<LeadForm agents={agentNames} />}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Leads em aberto" value={String(open)} hint="Aguardando retorno" />
        <Stat label="Vindos do site" value={String(fromSite)} hint="Nos últimos 7 dias" />
        <Stat label="Tempo médio" value="1 h 12" hint="Até o primeiro contato" />
      </div>

      <Table head={['Nome', 'Interesse', 'Origem', 'Corretor', 'Etapa', 'Entrada']}>
        {leads.map((lead) => (
          <tr key={`${lead.name}-${lead.createdAt}`}>
            <Td>
              <span className="font-medium">{lead.name}</span>
              <span className="mt-0.5 block text-xs text-ink-faint">{lead.phone}</span>
            </Td>
            <Td muted>{lead.interest}</Td>
            <Td muted>{lead.source}</Td>
            <Td muted>{lead.agent}</Td>
            <Td>
              <Badge tone={TONE[lead.stage] ?? 'neutral'}>
                {LEAD_STAGE_LABELS[lead.stage as DemoLead['stage']] ?? lead.stage}
              </Badge>
            </Td>
            <Td muted>{lead.createdAt}</Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
