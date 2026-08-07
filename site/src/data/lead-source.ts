import { DEMO_LEADS, type DemoLead } from '@/data/demo-system';
import { isLeadStage, type LeadStage } from '@/domain/lead-pipeline';
import { readStore } from '@/lib/system-store';

/**
 * Every lead the panel knows about, from both places they come from: the ones
 * registered by hand and the ones the site posted. Shaped into one record so no
 * screen has to care which door a contact came through.
 */
export function allLeads(): readonly DemoLead[] {
  const stored = readStore().leads.map<DemoLead>((lead) => ({
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    interest: lead.interest,
    source: (lead.source as DemoLead['source']) ?? 'Site',
    stage: isLeadStage(lead.stage) ? lead.stage : 'novo',
    agent: lead.agent,
    createdAt: lead.createdAt,
    budget: lead.budget,
    viewed: lead.propertyCode ? [lead.propertyCode] : [],
    nextAction: lead.stage === 'novo' ? 'Primeiro contato' : 'Definir próxima ação',
    nextActionAt: 'A definir',
    history: [
      {
        at: lead.createdAt,
        kind: 'entrada',
        detail: lead.propertyCode
          ? `Interesse no imóvel ${lead.propertyCode}`
          : `Cadastrado no painel — ${lead.source}`,
        by: lead.source,
      },
      ...(lead.notes
        ? [{ at: lead.createdAt, kind: 'nota' as const, detail: lead.notes, by: lead.agent }]
        : []),
    ],
  }));

  return [...stored, ...DEMO_LEADS];
}

export function findLead(id: string): DemoLead | null {
  return allLeads().find((lead) => lead.id === id) ?? null;
}

export function countByStage(leads: readonly DemoLead[]): Record<LeadStage, number> {
  return leads.reduce(
    (counts, lead) => {
      counts[lead.stage] = (counts[lead.stage] ?? 0) + 1;
      return counts;
    },
    {} as Record<LeadStage, number>,
  );
}
