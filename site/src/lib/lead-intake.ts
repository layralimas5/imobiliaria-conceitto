import { DEMO_AGENTS } from '@/data/demo-system';
import type { Lead } from '@/domain/lead';
import type { Property } from '@/domain/property';
import { readStore, todayLabel, writeStore } from '@/lib/system-store';

/**
 * Puts a lead from the site into the CRM.
 *
 * This is the join between the two halves of the system: someone clicks "tenho
 * interesse" on an imóvel and a corretor finds the contact already in the
 * funnel, already carrying the listing code they were looking at, already
 * assigned to somebody. Nobody copies anything from an e-mail.
 *
 * It runs alongside the e-mail and webhook delivery rather than replacing them:
 * the panel is a demo store on disk, and losing a real lead because a JSON file
 * could not be written would be the worst possible trade.
 */
export async function captureSiteLead(lead: Lead, property: Property | null): Promise<void> {
  const store = await readStore();

  const agent = assignTo(property, store.leads.length);
  const interest = property
    ? `${property.title || property.type} — ${property.address.neighborhood}, ${property.address.city}`
    : (lead.message || 'Contato pelo site');

  await writeStore({
    ...store,
    leads: [
      {
        id: crypto.randomUUID(),
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        interest,
        source: 'Site',
        stage: 'novo',
        agent,
        budget: null,
        notes: lead.message ?? '',
        propertyCode: property?.code ?? lead.propertyCode ?? null,
        createdAt: todayLabel(),
      },
      ...store.leads,
    ],
  });
}

/**
 * Automatic distribution, first rule: the listing's own corretor gets the lead,
 * because they are the one who can answer the next question about it. That only
 * counts when the anúncio names an actual person — much of the MSYS feed is
 * credited to the imobiliária itself, and assigning a lead to "Imobiliária
 * Conceitto" is the same as assigning it to nobody.
 *
 * Otherwise it falls to a round robin over whoever is signed in, so a lead never
 * lands in a queue without an owner. A gerente can reassign from the panel.
 */
function assignTo(property: Property | null, seen: number): string {
  const named = property?.agent?.name;
  if (named && DEMO_AGENTS.some((agent) => agent.name === named)) return named;

  const online = DEMO_AGENTS.filter((candidate) => candidate.isOnline);
  const pool = online.length > 0 ? online : DEMO_AGENTS;
  return pool[seen % pool.length].name;
}
