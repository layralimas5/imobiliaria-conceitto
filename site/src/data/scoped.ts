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
  type DemoAppointment,
  type DemoClient,
  type DemoContract,
  type DemoDocument,
} from '@/data/demo-system';
import { allLeads } from '@/data/lead-source';
import {
  dayLabel,
  isAppointmentKind,
  isAppointmentStatus,
  labelToIso,
  isoToLabel,
} from '@/domain/appointment';
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

export async function scopedListings(scope: BranchScope) {
  return (await panelListings()).filter((listing) =>
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

export async function scopedLeads(scope: BranchScope) {
  return (await allLeads()).filter((lead) => inScope(scope, branchOfAgent(lead.agent)));
}

/** What the panel registered comes first, then the seeded examples. */
export async function scopedClients(scope: BranchScope): Promise<readonly DemoClient[]> {
  const stored = (await readStore()).clients.map<DemoClient>((client) => ({
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

export async function scopedContracts(scope: BranchScope): Promise<readonly DemoContract[]> {
  const store = await readStore();

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
export async function allDocuments(): Promise<readonly DemoDocument[]> {
  const stored = (await readStore()).documents.map<DemoDocument>((document) => ({
    name: document.name,
    kind: (document.kind as DemoDocument['kind']) ?? 'outro',
    linkedTo: document.linkedTo,
    linkedKind: (document.linkedKind as DemoDocument['linkedKind']) ?? 'imóvel',
    linkedId: document.linkedId ?? null,
    size: document.size,
    uploadedAt: document.uploadedAt,
    uploadedBy: document.uploadedBy,
  }));

  return [...stored, ...DEMO_DOCUMENTS];
}

/** Os arquivos de um registro específico, pelo id — não pelo rótulo do vínculo. */
export async function documentsOf(
  linkedKind: DemoDocument['linkedKind'],
  linkedId: string,
): Promise<readonly DemoDocument[]> {
  return (await allDocuments()).filter(
    (document) => document.linkedKind === linkedKind && document.linkedId === linkedId,
  );
}

/**
 * A semana: os compromissos semeados e os que o painel marcou, na mesma linha
 * do tempo.
 *
 * O rótulo do dia é recalculado a partir da data em vez de vir gravado. Um
 * "Hoje" escrito à mão envelhece no dia seguinte, e uma agenda que mente sobre
 * que dia é hoje é pior que uma agenda sem rótulo nenhum.
 */
export async function scopedSchedule(
  scope: BranchScope,
): Promise<readonly (DemoAppointment & { readonly iso: string })[]> {
  const stored = (await readStore()).appointments.map((appointment) => ({
    iso: appointment.date,
    day: dayLabel(appointment.date),
    date: isoToLabel(appointment.date),
    time: appointment.time,
    title: appointment.title,
    kind: isAppointmentKind(appointment.kind) ? appointment.kind : ('reunião' as const),
    agent: appointment.agent,
    where: appointment.where,
    withWhom: appointment.withWhom,
    status: isAppointmentStatus(appointment.status)
      ? appointment.status
      : ('a confirmar' as const),
    id: appointment.id,
    leadId: appointment.leadId,
  }));

  const seeded = DEMO_SCHEDULE.map((item) => {
    const iso = labelToIso(item.date);
    return { ...item, iso, day: dayLabel(iso) };
  });

  // "Equipe" is the whole-company meeting; it shows in every unit's agenda.
  return [...stored, ...seeded]
    .filter((item) => item.agent === 'Equipe' || inScope(scope, branchOfAgent(item.agent)))
    .sort((a, b) => `${a.iso} ${a.time}`.localeCompare(`${b.iso} ${b.time}`));
}

/** Os compromissos de um lead, do mais próximo para o mais distante. */
export async function scheduleOfLead(
  leadId: string,
): Promise<readonly (DemoAppointment & { readonly iso: string })[]> {
  return (await scopedSchedule('todas')).filter((item) => item.leadId === leadId);
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
