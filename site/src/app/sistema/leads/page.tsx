import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { scopedAgents, scopedLeads } from '@/data/scoped';
import { currentScope } from '@/lib/branch-cookie';
import { LEAD_STAGE_LABELS, LEAD_STAGE_TONES, isOpen } from '@/domain/lead-pipeline';
import { LeadForm } from '@/components/system/lead-form';
import { Badge, DemoNotice, PageHead, Stat, StatRow, Table, Td } from '@/components/system/ui';

// Reflects what the panel just created, so it is never cached.
export const dynamic = 'force-dynamic';

export const metadata = { title: 'Leads' };

export default async function LeadsPage() {
  const scope = await currentScope();
  const leads = await scopedLeads(scope);
  const open = leads.filter((lead) => isOpen(lead.stage)).length;
  const fromSite = leads.filter((lead) => lead.source === 'Site').length;
  const closed = leads.filter((lead) => lead.stage === 'fechado').length;
  const agentNames = scopedAgents(scope).map((agent) => agent.name);

  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Atendimento"
        title="Leads"
        text="Tudo que chega pelo site, pelo WhatsApp e pelos portais. Quem veio do site já entra vinculado ao imóvel que a pessoa estava vendo."
        action={<LeadForm agents={agentNames} />}
      />

      <StatRow className="mb-4">
        <Stat label="Leads em aberto" value={String(open)} hint="Aguardando próxima ação" />
        <Stat label="Vindos do site" value={String(fromSite)} hint="Entrada automática" />
        <Stat
          label="Conversão"
          value={`${leads.length > 0 ? Math.round((closed / leads.length) * 100) : 0}%`}
          hint={`${closed} fechados`}
        />
        <Stat label="Tempo médio" value="1 h 12" hint="Até o primeiro contato" />
      </StatRow>

      <p className="mb-8">
        <Link
          href="/sistema/crm"
          className="inline-flex items-center gap-1 text-sm text-brand-700 underline-offset-4 hover:underline"
        >
          Ver os mesmos leads no funil
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </p>

      <Table head={['Nome', 'Interesse', 'Origem', 'Corretor', 'Etapa', 'Próxima ação', 'Entrada']}>
        {leads.map((lead) => (
          <tr key={lead.id}>
            <Td>
              <Link
                href={`/sistema/leads/${lead.id}`}
                className="font-bold underline-offset-4 hover:underline"
              >
                {lead.name}
              </Link>
              <span className="mt-0.5 block text-xs text-ink-faint">{lead.phone}</span>
            </Td>
            <Td muted>
              {lead.interest}
              {lead.viewed.length > 0 ? (
                <span className="mt-0.5 block text-xs text-ink-faint">
                  Viu {lead.viewed.length} imóvel{lead.viewed.length > 1 ? 'is' : ''}:{' '}
                  {lead.viewed.join(', ')}
                </span>
              ) : null}
            </Td>
            <Td muted>{lead.source}</Td>
            <Td muted>{lead.agent}</Td>
            <Td>
              <Badge tone={LEAD_STAGE_TONES[lead.stage]}>{LEAD_STAGE_LABELS[lead.stage]}</Badge>
            </Td>
            <Td>
              <span className="text-sm">{lead.nextAction}</span>
              <span className="mt-0.5 block text-xs text-ink-faint">{lead.nextActionAt}</span>
            </Td>
            <Td muted>{lead.createdAt}</Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
