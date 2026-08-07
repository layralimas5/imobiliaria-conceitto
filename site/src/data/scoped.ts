import { panelListings } from '@/data/catalog-repository';
import {
  DEMO_AGENTS,
  DEMO_CLIENTS,
  DEMO_COMMISSIONS,
  DEMO_CONTRACTS,
  DEMO_DOCUMENTS,
  DEMO_ENTRIES,
  DEMO_OWNERS,
  DEMO_PROPOSALS,
  DEMO_SCHEDULE,
  DEMO_USERS,
  type DemoClient,
  type DemoContract,
  type DemoDocument,
} from '@/data/demo-system';
import { allLeads } from '@/data/lead-source';
import { readStore } from '@/lib/system-store';
import {
  branchIdOf,
  branchOfAgent,
  branchOfCity,
  inScope,
  type BranchScope,
} from '@/domain/branch';

/**
 * Every list in the panel, cut to the selected unit.
 *
 * One module instead of a filter repeated on seventeen screens, because the
 * rule that decides which office a record belongs to is not obvious and must
 * not be re-invented per page: an imóvel goes by city, a cliente goes by the
 * corretor who attends them, a contrato goes by the proprietário. Get one of
 * those wrong on one screen and the panel starts contradicting itself.
 */

export function scopedListings(scope: BranchScope) {
  return panelListings().filter((listing) =>
    inScope(scope, branchOfCity(listing.address.city)),
  );
}

export function scopedAgents(scope: BranchScope) {
  return DEMO_AGENTS.filter((agent) => inScope(scope, branchIdOf(agent.branch)));
}

export function scopedUsers(scope: BranchScope) {
  return DEMO_USERS.filter((user) => inScope(scope, branchIdOf(user.branch)));
}

export function scopedOwners(scope: BranchScope) {
  return DEMO_OWNERS.filter((owner) => inScope(scope, branchIdOf(owner.branch)));
}

export function scopedLeads(scope: BranchScope) {
  return allLeads().filter((lead) => inScope(scope, branchOfAgent(lead.agent)));
}

/** What the panel registered comes first, then the seeded examples. */
export function scopedClients(scope: BranchScope): readonly DemoClient[] {
  const stored = readStore().clients.map<DemoClient>((client) => ({
    name: client.name,
    phone: client.phone,
    email: client.email,
    kind: (client.kind as DemoClient['kind']) ?? 'comprador',
    looking: client.looking || 'Não informado',
    budget: client.budget ?? 0,
    agent: client.agent,
    since: client.createdAt,
    status: 'ativo',
  }));

  return [...stored, ...DEMO_CLIENTS].filter((client) =>
    inScope(scope, branchOfAgent(client.agent)),
  );
}

export function scopedProposals(scope: BranchScope) {
  return DEMO_PROPOSALS.filter((proposal) => inScope(scope, branchOfAgent(proposal.agent)));
}

export function scopedContracts(scope: BranchScope): readonly DemoContract[] {
  const store = readStore();

  const stored = store.contracts.map<DemoContract>((contract) => ({
    code: contract.code,
    kind: contract.kind === 'locacao' ? 'locação' : 'venda',
    listing: contract.listing,
    client: contract.client,
    owner: contract.owner || 'Não informado',
    value: contract.value ?? 0,
    signedAt: contract.signedAt,
    until: contract.until,
    status: (contract.status as DemoContract['status']) ?? 'em assinatura',
  }));

  // Contracts created in the panel carry their own unit; the seeded ones take
  // it from the proprietário, which is where a real record would look.
  const branchOfStored = new Map(
    store.contracts.map((contract) => [contract.code, branchIdOf(contract.branch)]),
  );

  return [...stored, ...DEMO_CONTRACTS].filter((contract) => {
    const own = branchOfStored.get(contract.code);
    if (own) return inScope(scope, own);
    const owner = DEMO_OWNERS.find((candidate) => candidate.name === contract.owner);
    return inScope(scope, owner ? branchIdOf(owner.branch) : 'farroupilha');
  });
}

/** Documents are not cut by unit: a matrícula belongs to the imóvel, not a loja. */
export function allDocuments(): readonly DemoDocument[] {
  const stored = readStore().documents.map<DemoDocument>((document) => ({
    name: document.name,
    kind: (document.kind as DemoDocument['kind']) ?? 'outro',
    linkedTo: document.linkedTo,
    linkedKind: (document.linkedKind as DemoDocument['linkedKind']) ?? 'imóvel',
    size: document.size,
    uploadedAt: document.uploadedAt,
    uploadedBy: document.uploadedBy,
  }));

  return [...stored, ...DEMO_DOCUMENTS];
}

export function scopedSchedule(scope: BranchScope) {
  // "Equipe" is the whole-company meeting; it shows in every unit's agenda.
  return DEMO_SCHEDULE.filter(
    (item) => item.agent === 'Equipe' || inScope(scope, branchOfAgent(item.agent)),
  );
}

export function scopedCommissions(scope: BranchScope) {
  return DEMO_COMMISSIONS.filter(
    (commission) =>
      inScope(scope, branchOfAgent(commission.sellingAgent)) ||
      inScope(scope, branchOfAgent(commission.listingAgent)),
  );
}

export function scopedEntries(scope: BranchScope) {
  return DEMO_ENTRIES.filter((entry) => inScope(scope, entry.branch));
}
