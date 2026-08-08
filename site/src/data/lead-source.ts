import { DEMO_LEADS, type DemoLead, type DemoLeadEvent } from '@/data/demo-system';
import { isLeadStage, type LeadStage } from '@/domain/lead-pipeline';
import { leadHistory, leadListings, readStore, type StoredLead } from '@/lib/system-store';

const EVENT_KINDS: readonly DemoLeadEvent['kind'][] = [
  'entrada',
  'contato',
  'visita',
  'proposta',
  'nota',
];

function eventKind(value: string): DemoLeadEvent['kind'] {
  return EVENT_KINDS.includes(value as DemoLeadEvent['kind'])
    ? (value as DemoLeadEvent['kind'])
    : 'nota';
}

function toDemoLead(lead: StoredLead): DemoLead {
  return {
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
    viewed: leadListings(lead),
    nextAction:
      lead.nextAction || (lead.stage === 'novo' ? 'Primeiro contato' : 'Definir próxima ação'),
    nextActionAt: lead.nextActionAt || 'A definir',
    history: leadHistory(lead).map((event) => ({
      at: event.at,
      kind: eventKind(event.kind),
      detail: event.detail,
      by: event.by,
    })),
    document: lead.document ?? '',
    branch: lead.branch ?? '',
    notes: lead.notes ?? '',
    isStored: true,
  };
}

/**
 * Every lead the panel knows about, from both places they come from: the ones
 * registered by hand and the ones the site posted. Shaped into one record so no
 * screen has to care which door a contact came through.
 */
export async function allLeads(): Promise<readonly DemoLead[]> {
  const stored = (await readStore()).leads.map(toDemoLead);
  return [...stored, ...DEMO_LEADS];
}

export async function findLead(id: string): Promise<DemoLead | null> {
  return (await allLeads()).find((lead) => lead.id === id) ?? null;
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

/** A ficha ordena do mais recente para o mais antigo; o store guarda em ordem. */
export function newestFirst(history: readonly DemoLeadEvent[]): readonly DemoLeadEvent[] {
  return [...history].reverse();
}
