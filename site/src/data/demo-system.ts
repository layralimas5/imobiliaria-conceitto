/**
 * Fictional data for the internal system demo.
 *
 * Same rule as `demo-client-area.ts`: nothing here is real and nothing here is
 * wired to a backend. The Conceitto runs on MSYS Imob; this screen exists so
 * they can see what an in-house panel would feel like before anyone commits to
 * building one. Kept in a single file so replacing it is a deletion.
 */

import type { AppointmentKind, AppointmentStatus } from '@/domain/appointment';
import type { LeadStage } from '@/domain/lead-pipeline';
import type { Role } from '@/domain/permissions';
import type { BranchId } from '@/lib/site-config';

export { LEAD_STAGE_LABELS } from '@/domain/lead-pipeline';

export const LEAD_SOURCES = ['Site', 'WhatsApp', 'Portal', 'Indicação', 'Meta Ads'] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

/** One entry in a lead's atendimento history. */
export interface DemoLeadEvent {
  readonly at: string;
  readonly kind: 'entrada' | 'contato' | 'visita' | 'proposta' | 'nota';
  readonly detail: string;
  readonly by: string;
}

export interface DemoLead {
  readonly id: string;
  readonly name: string;
  readonly phone: string;
  readonly email: string;
  readonly interest: string;
  readonly source: LeadSource;
  readonly stage: LeadStage;
  readonly agent: string;
  readonly createdAt: string;
  readonly budget: number | null;
  /** Listing codes the lead looked at on the site, newest first. */
  readonly viewed: readonly string[];
  readonly nextAction: string;
  readonly nextActionAt: string;
  readonly history: readonly DemoLeadEvent[];
  /** CPF/CNPJ, quando a ficha já foi preenchida. */
  readonly document?: string;
  readonly branch?: string;
  /** O que não cabe no histórico: prazos, restrições, combinados. */
  readonly notes?: string;
  /**
   * Se o registro está gravado no store e portanto pode ser editado. Os leads
   * semeados aqui são leitura: a ficha mostra os campos, mas não grava.
   */
  readonly isStored?: boolean;
}

export const DEMO_LEADS: readonly DemoLead[] = [
  {
    id: 'l-2026-0061',
    name: 'Camila Reginato',
    phone: '(54) 99145-2210',
    email: 'camila.reginato@email.com',
    interest: 'Apartamento 2 dorm. — Centro, Farroupilha',
    source: 'Site',
    stage: 'novo',
    agent: 'Débora Cassol',
    createdAt: '06/08/2026',
    budget: 480_000,
    viewed: ['33066', '33694'],
    nextAction: 'Primeiro contato por WhatsApp',
    nextActionAt: 'Hoje, 11:00',
    history: [
      { at: '06/08/2026 09:41', kind: 'entrada', detail: 'Formulário “Tenho interesse” no imóvel 33066', by: 'Site' },
    ],
  },
  {
    id: 'l-2026-0060',
    name: 'Anderson Piccoli',
    phone: '(54) 99820-1134',
    email: 'anderson.piccoli@email.com',
    interest: 'Sobrado — São Luiz',
    source: 'WhatsApp',
    stage: 'contato',
    agent: 'Márcio Zatti',
    createdAt: '05/08/2026',
    budget: 720_000,
    viewed: ['33980'],
    nextAction: 'Confirmar avaliação do imóvel atual',
    nextActionAt: 'Hoje, 14:00',
    history: [
      { at: '05/08/2026 16:20', kind: 'entrada', detail: 'Chamou no WhatsApp da matriz', by: 'WhatsApp' },
      { at: '05/08/2026 17:05', kind: 'contato', detail: 'Atendido. Quer vender o apartamento atual antes de comprar.', by: 'Márcio Zatti' },
    ],
  },
  {
    id: 'l-2026-0059',
    name: 'Fernanda Boff',
    phone: '(54) 99671-8890',
    email: 'fernanda.boff@email.com',
    interest: 'Alba — 3 suítes',
    source: 'Site',
    stage: 'visita',
    agent: 'Débora Cassol',
    createdAt: '05/08/2026',
    budget: 1_250_000,
    viewed: ['34112', '33845'],
    nextAction: 'Visita ao Alba',
    nextActionAt: 'Hoje, 10:30',
    history: [
      { at: '05/08/2026 10:12', kind: 'entrada', detail: 'Formulário do lançamento Alba', by: 'Site' },
      { at: '05/08/2026 11:30', kind: 'contato', detail: 'Retornado. Procura 3 suítes, entrega em 2027.', by: 'Débora Cassol' },
      { at: '06/08/2026 09:00', kind: 'visita', detail: 'Visita agendada para 07/08 às 10:30', by: 'Débora Cassol' },
    ],
  },
  {
    id: 'l-2026-0058',
    name: 'Rogério Tonet',
    phone: '(54) 99503-4471',
    email: 'rogerio.tonet@email.com',
    interest: 'Sala comercial — Centro',
    source: 'Portal',
    stage: 'negociacao',
    agent: 'Juliano Bertuol',
    createdAt: '04/08/2026',
    budget: 640_000,
    viewed: ['33694'],
    nextAction: 'Levar contraproposta do proprietário',
    nextActionAt: 'Hoje, 16:30',
    history: [
      { at: '04/08/2026 08:55', kind: 'entrada', detail: 'Lead recebido do portal', by: 'Portal' },
      { at: '04/08/2026 10:40', kind: 'contato', detail: 'Investidor, quer renda de aluguel.', by: 'Juliano Bertuol' },
      { at: '05/08/2026 15:00', kind: 'visita', detail: 'Visitou a sala 33694.', by: 'Juliano Bertuol' },
      { at: '06/08/2026 11:20', kind: 'proposta', detail: 'Proposta P-2026-041: R$ 640.000 sobre R$ 690.000.', by: 'Juliano Bertuol' },
    ],
  },
  {
    id: 'l-2026-0057',
    name: 'Patrícia Sartor',
    phone: '(54) 99388-2065',
    email: 'patricia.sartor@email.com',
    interest: 'Locação — Cinquentenário',
    source: 'Indicação',
    stage: 'qualificado',
    agent: 'Márcio Zatti',
    createdAt: '03/08/2026',
    budget: 1_600,
    viewed: ['33066'],
    nextAction: 'Enviar 3 opções de locação',
    nextActionAt: 'Amanhã, 09:00',
    history: [
      { at: '03/08/2026 14:10', kind: 'entrada', detail: 'Indicada pela Ivone Menegotto', by: 'Indicação' },
      { at: '03/08/2026 15:00', kind: 'contato', detail: 'Atendida. Até R$ 1.600, 2 dorm., aceita pet.', by: 'Márcio Zatti' },
      { at: '04/08/2026 09:30', kind: 'nota', detail: 'Renda comprovada. Fiador disponível.', by: 'Márcio Zatti' },
    ],
  },
  {
    id: 'l-2026-0056',
    name: 'Eduardo Slongo',
    phone: '(54) 99712-6603',
    email: 'eduardo.slongo@email.com',
    interest: 'Terreno — Monte Belo do Sul',
    source: 'Site',
    stage: 'fechado',
    agent: 'Juliano Bertuol',
    createdAt: '01/08/2026',
    budget: 310_000,
    viewed: ['32569'],
    nextAction: 'Assinatura em cartório',
    nextActionAt: 'Seg, 10/08 14:30',
    history: [
      { at: '01/08/2026 19:02', kind: 'entrada', detail: 'Formulário no imóvel 32569', by: 'Site' },
      { at: '02/08/2026 09:15', kind: 'contato', detail: 'Atendido no mesmo dia.', by: 'Juliano Bertuol' },
      { at: '03/08/2026 10:00', kind: 'visita', detail: 'Visitou o terreno.', by: 'Juliano Bertuol' },
      { at: '29/07/2026 16:00', kind: 'proposta', detail: 'Proposta aceita: R$ 305.000.', by: 'Juliano Bertuol' },
    ],
  },
  {
    id: 'l-2026-0055',
    name: 'Vinícius Dametto',
    phone: '(54) 99856-3302',
    email: 'vinicius.dametto@email.com',
    interest: 'Cobertura — Bento Gonçalves',
    source: 'Meta Ads',
    stage: 'perdido',
    agent: 'Simone Fochesatto',
    createdAt: '22/07/2026',
    budget: 1_900_000,
    viewed: [],
    nextAction: 'Retomar em 6 meses',
    nextActionAt: '02/2027',
    history: [
      { at: '22/07/2026 20:40', kind: 'entrada', detail: 'Campanha de coberturas no Instagram', by: 'Meta Ads' },
      { at: '23/07/2026 09:00', kind: 'contato', detail: 'Atendido. Comprou por outra imobiliária.', by: 'Simone Fochesatto' },
    ],
  },
];

export interface DemoAgent {
  readonly name: string;
  readonly creci: string;
  readonly branch: 'Farroupilha' | 'Bento Gonçalves';
  readonly activeListings: number;
  readonly openLeads: number;
  readonly closedThisMonth: number;
  /** Session state, for the "quem está no sistema agora" list on the dashboard. */
  readonly isOnline: boolean;
  readonly lastSeen: string;
}

export const DEMO_AGENTS: readonly DemoAgent[] = [
  { name: 'Débora Cassol', creci: '41.882', branch: 'Farroupilha', activeListings: 34, openLeads: 12, closedThisMonth: 3, isOnline: true, lastSeen: 'agora' },
  { name: 'Márcio Zatti', creci: '38.204', branch: 'Farroupilha', activeListings: 28, openLeads: 9, closedThisMonth: 2, isOnline: true, lastSeen: 'há 3 min' },
  { name: 'Juliano Bertuol', creci: '45.117', branch: 'Bento Gonçalves', activeListings: 41, openLeads: 15, closedThisMonth: 4, isOnline: true, lastSeen: 'há 18 min' },
  { name: 'Simone Fochesatto', creci: '39.660', branch: 'Bento Gonçalves', activeListings: 22, openLeads: 7, closedThisMonth: 1, isOnline: false, lastSeen: 'ontem, 17:40' },
];

export interface DemoAppointment {
  /** Rótulo do grupo na agenda. Recalculado na leitura a partir da data. */
  readonly day: string;
  readonly date: string;
  readonly time: string;
  readonly title: string;
  readonly kind: AppointmentKind;
  readonly agent: string;
  readonly where: string;
  readonly withWhom: string;
  readonly status: AppointmentStatus;
  /** Presente só nos compromissos gravados — é o que permite mudar a situação. */
  readonly id?: string;
  /** O lead que originou o compromisso, quando ele foi marcado de uma ficha. */
  readonly leadId?: string | null;
}

export const DEMO_SCHEDULE: readonly DemoAppointment[] = [
  { day: 'Hoje', date: '07/08/2026', time: '08:30', title: 'Retorno — proposta 33694', kind: 'reunião', agent: 'Juliano Bertuol', where: 'Filial Bento Gonçalves', withWhom: 'Rogério Tonet', status: 'concluído' },
  { day: 'Hoje', date: '07/08/2026', time: '10:30', title: 'Visita — Alba, 3 suítes', kind: 'visita', agent: 'Débora Cassol', where: 'Centro, Farroupilha', withWhom: 'Fernanda Boff', status: 'confirmado' },
  { day: 'Hoje', date: '07/08/2026', time: '14:00', title: 'Avaliação — sobrado São Luiz', kind: 'avaliação', agent: 'Márcio Zatti', where: 'São Luiz, Farroupilha', withWhom: 'Anderson Piccoli', status: 'confirmado' },
  { day: 'Hoje', date: '07/08/2026', time: '16:30', title: 'Proposta — sala comercial', kind: 'reunião', agent: 'Juliano Bertuol', where: 'Filial Bento Gonçalves', withWhom: 'Rogério Tonet', status: 'a confirmar' },
  { day: 'Amanhã', date: '08/08/2026', time: '09:00', title: 'Assinatura de locação 33837', kind: 'assinatura', agent: 'Débora Cassol', where: 'Matriz Farroupilha', withWhom: 'Patrícia Sartor', status: 'confirmado' },
  { day: 'Amanhã', date: '08/08/2026', time: '11:00', title: 'Visita — apartamento Cinquentenário', kind: 'visita', agent: 'Márcio Zatti', where: 'Cinquentenário, Farroupilha', withWhom: 'Camila Reginato', status: 'a confirmar' },
  { day: 'Amanhã', date: '08/08/2026', time: '15:00', title: 'Visita — terreno Monte Belo', kind: 'visita', agent: 'Juliano Bertuol', where: 'Monte Belo do Sul', withWhom: 'Eduardo Slongo', status: 'confirmado' },
  { day: 'Seg, 10/08', date: '10/08/2026', time: '09:30', title: 'Captação — casa Bela Vista', kind: 'avaliação', agent: 'Simone Fochesatto', where: 'Bela Vista, Bento Gonçalves', withWhom: 'Nelson Dalla Costa', status: 'confirmado' },
  { day: 'Seg, 10/08', date: '10/08/2026', time: '14:30', title: 'Assinatura de venda 32569', kind: 'assinatura', agent: 'Juliano Bertuol', where: 'Cartório, Bento Gonçalves', withWhom: 'Eduardo Slongo', status: 'confirmado' },
  { day: 'Ter, 11/08', date: '11/08/2026', time: '10:00', title: 'Reunião de equipe — metas de agosto', kind: 'reunião', agent: 'Equipe', where: 'Matriz Farroupilha', withWhom: 'Todos os corretores', status: 'confirmado' },
];

export interface DemoClient {
  readonly name: string;
  readonly phone: string;
  readonly email: string;
  readonly kind: 'comprador' | 'locatário' | 'investidor' | 'proprietário';
  readonly looking: string;
  readonly budget: number;
  readonly agent: string;
  readonly since: string;
  readonly status: 'ativo' | 'em negociação' | 'inativo';
}

export const DEMO_CLIENTS: readonly DemoClient[] = [
  { name: 'Camila Reginato', phone: '(54) 99145-2210', email: 'camila.reginato@email.com', kind: 'comprador', looking: 'Apartamento 2 dorm. — Centro, Farroupilha', budget: 480_000, agent: 'Débora Cassol', since: '06/08/2026', status: 'ativo' },
  { name: 'Anderson Piccoli', phone: '(54) 99820-1134', email: 'anderson.piccoli@email.com', kind: 'comprador', looking: 'Sobrado — São Luiz', budget: 720_000, agent: 'Márcio Zatti', since: '05/08/2026', status: 'em negociação' },
  { name: 'Fernanda Boff', phone: '(54) 99671-8890', email: 'fernanda.boff@email.com', kind: 'comprador', looking: 'Alba — 3 suítes', budget: 1_250_000, agent: 'Débora Cassol', since: '05/08/2026', status: 'em negociação' },
  { name: 'Rogério Tonet', phone: '(54) 99503-4471', email: 'rogerio.tonet@email.com', kind: 'investidor', looking: 'Sala comercial — Centro', budget: 640_000, agent: 'Juliano Bertuol', since: '04/08/2026', status: 'em negociação' },
  { name: 'Patrícia Sartor', phone: '(54) 99388-2065', email: 'patricia.sartor@email.com', kind: 'locatário', looking: 'Locação 2 dorm. — Cinquentenário', budget: 1_600, agent: 'Márcio Zatti', since: '03/08/2026', status: 'ativo' },
  { name: 'Eduardo Slongo', phone: '(54) 99712-6603', email: 'eduardo.slongo@email.com', kind: 'investidor', looking: 'Terreno — Monte Belo do Sul', budget: 310_000, agent: 'Juliano Bertuol', since: '01/08/2026', status: 'ativo' },
  { name: 'Luciane Bortolini', phone: '(54) 99244-7719', email: 'luciane.bortolini@email.com', kind: 'locatário', looking: 'Casa com pátio — São Francisco', budget: 2_400, agent: 'Simone Fochesatto', since: '28/07/2026', status: 'ativo' },
  { name: 'Vinícius Dametto', phone: '(54) 99856-3302', email: 'vinicius.dametto@email.com', kind: 'comprador', looking: 'Cobertura — Bento Gonçalves', budget: 1_900_000, agent: 'Simone Fochesatto', since: '22/07/2026', status: 'inativo' },
];

export interface DemoOwner {
  readonly name: string;
  readonly phone: string;
  readonly document: string;
  readonly listings: number;
  readonly rented: number;
  readonly monthlyTransfer: number;
  readonly branch: 'Farroupilha' | 'Bento Gonçalves';
  readonly since: string;
}

export const DEMO_OWNERS: readonly DemoOwner[] = [
  { name: 'Marcelo Bertuol', phone: '(54) 99610-8842', document: '***.412.780-**', listings: 6, rented: 4, monthlyTransfer: 7_310.4, branch: 'Farroupilha', since: '03/2019' },
  { name: 'Nelson Dalla Costa', phone: '(54) 99117-2264', document: '***.905.330-**', listings: 3, rented: 1, monthlyTransfer: 1_780, branch: 'Bento Gonçalves', since: '11/2021' },
  { name: 'Ivone Menegotto', phone: '(54) 99425-0091', document: '***.238.100-**', listings: 2, rented: 2, monthlyTransfer: 3_140, branch: 'Farroupilha', since: '07/2020' },
  { name: 'Construtora Alba', phone: '(54) 3268-1400', document: '**.744.902/0001-**', listings: 14, rented: 0, monthlyTransfer: 0, branch: 'Farroupilha', since: '02/2023' },
  { name: 'Sérgio Pilotto', phone: '(54) 99733-5518', document: '***.660.471-**', listings: 1, rented: 1, monthlyTransfer: 1_290, branch: 'Bento Gonçalves', since: '09/2024' },
];

export interface DemoProposal {
  readonly code: string;
  readonly listing: string;
  readonly client: string;
  readonly agent: string;
  readonly asking: number;
  readonly offered: number;
  readonly createdAt: string;
  readonly status: 'em análise' | 'contraproposta' | 'aceita' | 'recusada';
}

export const DEMO_PROPOSALS: readonly DemoProposal[] = [
  { code: 'P-2026-041', listing: '33694 — Sala comercial, Centro', client: 'Rogério Tonet', agent: 'Juliano Bertuol', asking: 690_000, offered: 640_000, createdAt: '04/08/2026', status: 'em análise' },
  { code: 'P-2026-040', listing: '34112 — Alba, 3 suítes', client: 'Fernanda Boff', agent: 'Débora Cassol', asking: 1_290_000, offered: 1_180_000, createdAt: '03/08/2026', status: 'contraproposta' },
  { code: 'P-2026-039', listing: '33980 — Sobrado São Luiz', client: 'Anderson Piccoli', agent: 'Márcio Zatti', asking: 749_000, offered: 700_000, createdAt: '02/08/2026', status: 'em análise' },
  { code: 'P-2026-038', listing: '32569 — Terreno Monte Belo do Sul', client: 'Eduardo Slongo', agent: 'Juliano Bertuol', asking: 320_000, offered: 305_000, createdAt: '29/07/2026', status: 'aceita' },
  { code: 'P-2026-037', listing: '33066 — Apartamento Cinquentenário', client: 'Camila Reginato', agent: 'Débora Cassol', asking: 495_000, offered: 420_000, createdAt: '27/07/2026', status: 'recusada' },
];

export interface DemoContract {
  readonly code: string;
  readonly kind: 'venda' | 'locação';
  readonly listing: string;
  readonly client: string;
  readonly owner: string;
  readonly value: number;
  readonly signedAt: string;
  readonly until: string;
  readonly status: 'vigente' | 'em assinatura' | 'encerrado';
}

export const DEMO_CONTRACTS: readonly DemoContract[] = [
  { code: 'C-2026-118', kind: 'locação', listing: '33837 — São Francisco', client: 'Luciane Bortolini', owner: 'Marcelo Bertuol', value: 1_990, signedAt: '01/03/2026', until: '28/02/2029', status: 'vigente' },
  { code: 'C-2026-117', kind: 'locação', listing: '33066 — Cinquentenário', client: 'Patrícia Sartor', owner: 'Ivone Menegotto', value: 1_450, signedAt: '15/01/2026', until: '14/01/2029', status: 'vigente' },
  { code: 'C-2026-116', kind: 'venda', listing: '32569 — Monte Belo do Sul', client: 'Eduardo Slongo', owner: 'Nelson Dalla Costa', value: 305_000, signedAt: '01/08/2026', until: '—', status: 'em assinatura' },
  { code: 'C-2025-104', kind: 'locação', listing: '31220 — Centro, Bento', client: 'Vinícius Dametto', owner: 'Sérgio Pilotto', value: 1_290, signedAt: '10/06/2023', until: '09/06/2026', status: 'encerrado' },
  { code: 'C-2026-115', kind: 'venda', listing: '33440 — São Luiz', client: 'Anderson Piccoli', owner: 'Ivone Menegotto', value: 700_000, signedAt: '22/07/2026', until: '—', status: 'vigente' },
];

/**
 * Commission on a closed deal.
 *
 * The split is the part worth modelling: the imobiliária charges the client a
 * percentage of the deal, and then divides its own cut between whoever captou o
 * imóvel and whoever vendeu. Storing only "quanto o corretor recebe" would lose
 * the number the office actually argues about.
 */
export interface DemoCommission {
  readonly deal: string;
  readonly kind: 'venda' | 'locação';
  readonly closedAt: string;
  readonly dealValue: number;
  /** Percentage the imobiliária charges on the deal. */
  readonly rate: number;
  readonly listingAgent: string;
  readonly sellingAgent: string;
  /** Share of the office's commission that goes to the corretores, as a percentage. */
  readonly agentShare: number;
  readonly status: 'pago' | 'a pagar' | 'previsto';
}

export const DEMO_COMMISSIONS: readonly DemoCommission[] = [
  { deal: '32569 — Terreno, Monte Belo do Sul', kind: 'venda', closedAt: '01/08/2026', dealValue: 305_000, rate: 6, listingAgent: 'Juliano Bertuol', sellingAgent: 'Juliano Bertuol', agentShare: 50, status: 'pago' },
  { deal: '33440 — Casa, São Luiz', kind: 'venda', closedAt: '22/07/2026', dealValue: 700_000, rate: 6, listingAgent: 'Débora Cassol', sellingAgent: 'Márcio Zatti', agentShare: 50, status: 'a pagar' },
  { deal: '33837 — Locação, São Francisco', kind: 'locação', closedAt: '01/03/2026', dealValue: 1_990, rate: 100, listingAgent: 'Débora Cassol', sellingAgent: 'Débora Cassol', agentShare: 40, status: 'pago' },
  { deal: '33066 — Locação, Cinquentenário', kind: 'locação', closedAt: '15/01/2026', dealValue: 1_450, rate: 100, listingAgent: 'Ivone Menegotto', sellingAgent: 'Márcio Zatti', agentShare: 40, status: 'pago' },
  { deal: '33694 — Sala comercial, Centro', kind: 'venda', closedAt: '—', dealValue: 640_000, rate: 6, listingAgent: 'Juliano Bertuol', sellingAgent: 'Juliano Bertuol', agentShare: 50, status: 'previsto' },
];

/** What the imobiliária charges, before splitting with the corretores. */
export function officeCommission(commission: DemoCommission): number {
  return (commission.dealValue * commission.rate) / 100;
}

/** What the corretores take home, split between captação and venda. */
export function agentCommission(commission: DemoCommission): number {
  return (officeCommission(commission) * commission.agentShare) / 100;
}

/**
 * A document attached to an imóvel or a negotiation. In a real build these are
 * files in object storage; here they are the metadata, which is what the screen
 * is actually made of.
 */
export interface DemoDocument {
  readonly name: string;
  readonly kind: 'matrícula' | 'escritura' | 'contrato' | 'documento pessoal' | 'laudo' | 'outro';
  readonly linkedTo: string;
  readonly linkedKind: 'imóvel' | 'contrato' | 'proprietário' | 'cliente' | 'lead';
  readonly size: string;
  readonly uploadedAt: string;
  readonly uploadedBy: string;
  /** Id do registro a que o arquivo pertence, quando anexado de dentro dele. */
  readonly linkedId?: string | null;
}

export const DEMO_DOCUMENTS: readonly DemoDocument[] = [
  { name: 'matricula-32569.pdf', kind: 'matrícula', linkedTo: '32569 — Terreno, Monte Belo do Sul', linkedKind: 'imóvel', size: '1,2 MB', uploadedAt: '02/08/2026', uploadedBy: 'Juliano Bertuol' },
  { name: 'contrato-venda-C-2026-116.pdf', kind: 'contrato', linkedTo: 'C-2026-116', linkedKind: 'contrato', size: '840 KB', uploadedAt: '01/08/2026', uploadedBy: 'Tatiane Rossi' },
  { name: 'rg-cpf-eduardo-slongo.pdf', kind: 'documento pessoal', linkedTo: 'Eduardo Slongo', linkedKind: 'cliente', size: '620 KB', uploadedAt: '01/08/2026', uploadedBy: 'Juliano Bertuol' },
  { name: 'escritura-33440.pdf', kind: 'escritura', linkedTo: '33440 — Casa, São Luiz', linkedKind: 'imóvel', size: '2,4 MB', uploadedAt: '23/07/2026', uploadedBy: 'Débora Cassol' },
  { name: 'contrato-locacao-C-2026-118.pdf', kind: 'contrato', linkedTo: 'C-2026-118', linkedKind: 'contrato', size: '910 KB', uploadedAt: '01/03/2026', uploadedBy: 'Tatiane Rossi' },
  { name: 'iptu-33837-2026.pdf', kind: 'outro', linkedTo: '33837 — São Francisco', linkedKind: 'imóvel', size: '180 KB', uploadedAt: '12/02/2026', uploadedBy: 'Tatiane Rossi' },
  { name: 'procuracao-marcelo-bertuol.pdf', kind: 'documento pessoal', linkedTo: 'Marcelo Bertuol', linkedKind: 'proprietário', size: '340 KB', uploadedAt: '18/01/2026', uploadedBy: 'Tatiane Rossi' },
  { name: 'laudo-avaliacao-33980.pdf', kind: 'laudo', linkedTo: '33980 — Sobrado, São Luiz', linkedKind: 'imóvel', size: '1,8 MB', uploadedAt: '30/07/2026', uploadedBy: 'Márcio Zatti' },
];

/**
 * Who can sign in. Kept apart from `DEMO_AGENTS` on purpose: a corretor is
 * someone who carries listings and closes deals, a user is a login with a
 * permission level. They overlap today, and they stop overlapping the first
 * time the office hires an assistant who never sells anything.
 */
export interface DemoUser {
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly branch: 'Farroupilha' | 'Bento Gonçalves';
  readonly lastAccess: string;
  readonly isActive: boolean;
}

export const DEMO_USERS: readonly DemoUser[] = [
  { name: 'Débora Cassol', email: 'debora@imobiliariaconceitto.com.br', role: 'Administrador', branch: 'Farroupilha', lastAccess: 'Agora', isActive: true },
  { name: 'Márcio Zatti', email: 'marcio@imobiliariaconceitto.com.br', role: 'Corretor', branch: 'Farroupilha', lastAccess: 'Há 3 min', isActive: true },
  { name: 'Juliano Bertuol', email: 'juliano@imobiliariaconceitto.com.br', role: 'Gerente', branch: 'Bento Gonçalves', lastAccess: 'Há 18 min', isActive: true },
  { name: 'Simone Fochesatto', email: 'simone@imobiliariaconceitto.com.br', role: 'Corretor', branch: 'Bento Gonçalves', lastAccess: 'Ontem, 17:40', isActive: true },
  { name: 'Tatiane Rossi', email: 'financeiro@imobiliariaconceitto.com.br', role: 'Financeiro', branch: 'Farroupilha', lastAccess: 'Ontem, 18:05', isActive: true },
  { name: 'Aline Peruzzo', email: 'atendimento@imobiliariaconceitto.com.br', role: 'Atendente', branch: 'Farroupilha', lastAccess: 'Há 40 min', isActive: true },
  { name: 'Paulo Menegat', email: 'paulo@imobiliariaconceitto.com.br', role: 'Corretor', branch: 'Farroupilha', lastAccess: '12/06/2026', isActive: false },
];

export { ROLES as USER_ROLES } from '@/domain/permissions';

export interface DemoPipelineStage {
  readonly stage: LeadStage;
  readonly count: number;
  readonly value: number;
}

export const DEMO_PIPELINE: readonly DemoPipelineStage[] = [
  { stage: 'novo', count: 18, value: 6_240_000 },
  { stage: 'contato', count: 11, value: 4_180_000 },
  { stage: 'qualificado', count: 9, value: 3_610_000 },
  { stage: 'visita', count: 7, value: 3_050_000 },
  { stage: 'proposta', count: 4, value: 1_920_000 },
  { stage: 'negociacao', count: 3, value: 1_540_000 },
  { stage: 'fechado', count: 2, value: 880_000 },
  { stage: 'perdido', count: 5, value: 2_120_000 },
];

/**
 * The closed months behind the dashboard charts. The current month is not here
 * on purpose: the dashboard builds it from `DEMO_ENTRIES` and the lead list, so
 * the last column of every chart agrees with the cards above it.
 */
export interface DemoMonth {
  readonly month: string;
  readonly revenue: number;
  readonly expenses: number;
  readonly leads: number;
  readonly closings: number;
}

export const DEMO_MONTHS: readonly DemoMonth[] = [
  { month: 'Mar', revenue: 38_400, expenses: 9_120, leads: 22, closings: 3 },
  { month: 'Abr', revenue: 31_950, expenses: 8_470, leads: 19, closings: 2 },
  { month: 'Mai', revenue: 46_800, expenses: 10_240, leads: 27, closings: 4 },
  { month: 'Jun', revenue: 42_100, expenses: 9_860, leads: 24, closings: 3 },
  { month: 'Jul', revenue: 55_300, expenses: 11_480, leads: 31, closings: 5 },
];

export interface DemoIntegration {
  readonly name: string;
  readonly detail: string;
  readonly status: 'ativo' | 'pendente';
  readonly lastSync: string;
}

export const DEMO_INTEGRATIONS: readonly DemoIntegration[] = [
  { name: 'MSYS Imob', detail: 'Sincronização do catálogo de imóveis', status: 'ativo', lastSync: 'Hoje, 07:12' },
  { name: 'Webhook de leads', detail: 'POST em cada formulário enviado pelo site', status: 'ativo', lastSync: 'Hoje, 09:41' },
  { name: 'Meta Ads', detail: 'Importação de leads do Facebook e Instagram', status: 'pendente', lastSync: '—' },
  { name: 'Google Analytics', detail: 'Eventos de conversão do site', status: 'ativo', lastSync: 'Hoje, 09:55' },
];

export interface DemoNotification {
  readonly title: string;
  readonly detail: string;
  readonly at: string;
}

export const DEMO_NOTIFICATIONS: readonly DemoNotification[] = [
  { title: 'Novo lead pelo site', detail: 'Camila Reginato — apartamento no Centro', at: 'há 12 min' },
  { title: 'Proposta registrada', detail: 'Rogério Tonet — sala comercial, Centro', at: 'há 2 h' },
  { title: 'Sincronização concluída', detail: 'MSYS Imob — 11 imóveis atualizados', at: 'hoje, 07:12' },
];

export interface DemoEntry {
  readonly date: string;
  readonly description: string;
  readonly kind: 'comissao' | 'aluguel' | 'repasse' | 'despesa';
  readonly amount: number;
  readonly status: 'recebido' | 'previsto' | 'pago';
  readonly branch: BranchId;
}

export const ENTRY_KIND_LABELS: Record<DemoEntry['kind'], string> = {
  comissao: 'Comissão',
  aluguel: 'Aluguel recebido',
  repasse: 'Repasse ao proprietário',
  despesa: 'Despesa',
};

/** Negative amounts leave the house; positive ones come in. */
export const DEMO_ENTRIES: readonly DemoEntry[] = [
  { date: '06/08/2026', description: 'Comissão — venda 32569, Monte Belo do Sul', kind: 'comissao', amount: 27_500, status: 'recebido', branch: 'bento-goncalves' },
  { date: '05/08/2026', description: 'Aluguel 33837 — São Francisco', kind: 'aluguel', amount: 1_990, status: 'recebido', branch: 'farroupilha' },
  { date: '05/08/2026', description: 'Repasse 33837 — Marcelo Bertuol', kind: 'repasse', amount: -1_810.9, status: 'pago', branch: 'farroupilha' },
  { date: '04/08/2026', description: 'Aluguel 33066 — Cinquentenário', kind: 'aluguel', amount: 1_450, status: 'recebido', branch: 'farroupilha' },
  { date: '04/08/2026', description: 'Repasse 33066 — Ivone Menegotto', kind: 'repasse', amount: -1_319.5, status: 'pago', branch: 'farroupilha' },
  { date: '03/08/2026', description: 'Fotografia profissional — 4 imóveis', kind: 'despesa', amount: -1_200, status: 'pago', branch: 'farroupilha' },
  { date: '02/08/2026', description: 'Anúncios nos portais — agosto', kind: 'despesa', amount: -2_400, status: 'pago', branch: 'farroupilha' },
  { date: '02/08/2026', description: 'Aluguel 31220 — Centro, Bento', kind: 'aluguel', amount: 1_290, status: 'recebido', branch: 'bento-goncalves' },
  { date: '02/08/2026', description: 'Repasse 31220 — Sérgio Pilotto', kind: 'repasse', amount: -1_161, status: 'pago', branch: 'bento-goncalves' },
  { date: '01/08/2026', description: 'Aluguel da filial — agosto', kind: 'despesa', amount: -3_800, status: 'pago', branch: 'bento-goncalves' },
  { date: '10/08/2026', description: 'Comissão — venda 33694, Centro', kind: 'comissao', amount: 19_800, status: 'previsto', branch: 'bento-goncalves' },
];

/** The person "signed in" to the panel, and the perfil that decides what they see. */
export const DEMO_OPERATOR = {
  name: 'Débora Cassol',
  role: 'Administrador',
  label: 'Administradora · Matriz Farroupilha',
} as const;
