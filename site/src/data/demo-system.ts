/**
 * Fictional data for the internal system demo.
 *
 * Same rule as `demo-client-area.ts`: nothing here is real and nothing here is
 * wired to a backend. The Conceitto runs on MSYS Imob; this screen exists so
 * they can see what an in-house panel would feel like before anyone commits to
 * building one. Kept in a single file so replacing it is a deletion.
 */

export interface DemoLead {
  readonly name: string;
  readonly phone: string;
  readonly interest: string;
  readonly source: 'Site' | 'WhatsApp' | 'Portal' | 'Indicação';
  readonly stage: 'novo' | 'contato' | 'visita' | 'proposta' | 'fechado';
  readonly agent: string;
  readonly createdAt: string;
}

export const LEAD_STAGE_LABELS: Record<DemoLead['stage'], string> = {
  novo: 'Novo',
  contato: 'Em contato',
  visita: 'Visita agendada',
  proposta: 'Proposta',
  fechado: 'Fechado',
};

export const DEMO_LEADS: readonly DemoLead[] = [
  { name: 'Camila Reginato', phone: '(54) 99145-2210', interest: 'Apartamento 2 dorm. — Centro, Farroupilha', source: 'Site', stage: 'novo', agent: 'Débora Cassol', createdAt: '06/08/2026' },
  { name: 'Anderson Piccoli', phone: '(54) 99820-1134', interest: 'Sobrado — São Luiz', source: 'WhatsApp', stage: 'contato', agent: 'Márcio Zatti', createdAt: '05/08/2026' },
  { name: 'Fernanda Boff', phone: '(54) 99671-8890', interest: 'Alba — 3 suítes', source: 'Site', stage: 'visita', agent: 'Débora Cassol', createdAt: '05/08/2026' },
  { name: 'Rogério Tonet', phone: '(54) 99503-4471', interest: 'Sala comercial — Centro', source: 'Portal', stage: 'proposta', agent: 'Juliano Bertuol', createdAt: '04/08/2026' },
  { name: 'Patrícia Sartor', phone: '(54) 99388-2065', interest: 'Locação — Cinquentenário', source: 'Indicação', stage: 'contato', agent: 'Márcio Zatti', createdAt: '03/08/2026' },
  { name: 'Eduardo Slongo', phone: '(54) 99712-6603', interest: 'Terreno — Monte Belo do Sul', source: 'Site', stage: 'fechado', agent: 'Juliano Bertuol', createdAt: '01/08/2026' },
];

export interface DemoAgent {
  readonly name: string;
  readonly creci: string;
  readonly branch: 'Farroupilha' | 'Bento Gonçalves';
  readonly activeListings: number;
  readonly openLeads: number;
  readonly closedThisMonth: number;
}

export const DEMO_AGENTS: readonly DemoAgent[] = [
  { name: 'Débora Cassol', creci: '41.882', branch: 'Farroupilha', activeListings: 34, openLeads: 12, closedThisMonth: 3 },
  { name: 'Márcio Zatti', creci: '38.204', branch: 'Farroupilha', activeListings: 28, openLeads: 9, closedThisMonth: 2 },
  { name: 'Juliano Bertuol', creci: '45.117', branch: 'Bento Gonçalves', activeListings: 41, openLeads: 15, closedThisMonth: 4 },
  { name: 'Simone Fochesatto', creci: '39.660', branch: 'Bento Gonçalves', activeListings: 22, openLeads: 7, closedThisMonth: 1 },
];

export interface DemoPipelineStage {
  readonly stage: DemoLead['stage'];
  readonly count: number;
  readonly value: number;
}

export const DEMO_PIPELINE: readonly DemoPipelineStage[] = [
  { stage: 'novo', count: 18, value: 6_240_000 },
  { stage: 'contato', count: 11, value: 4_180_000 },
  { stage: 'visita', count: 7, value: 3_050_000 },
  { stage: 'proposta', count: 4, value: 1_920_000 },
  { stage: 'fechado', count: 2, value: 880_000 },
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
}

export const ENTRY_KIND_LABELS: Record<DemoEntry['kind'], string> = {
  comissao: 'Comissão',
  aluguel: 'Aluguel recebido',
  repasse: 'Repasse ao proprietário',
  despesa: 'Despesa',
};

/** Negative amounts leave the house; positive ones come in. */
export const DEMO_ENTRIES: readonly DemoEntry[] = [
  { date: '06/08/2026', description: 'Comissão — venda 32569, Monte Belo do Sul', kind: 'comissao', amount: 27_500, status: 'recebido' },
  { date: '05/08/2026', description: 'Aluguel 33837 — São Francisco', kind: 'aluguel', amount: 1_990, status: 'recebido' },
  { date: '05/08/2026', description: 'Repasse 33837 — Marcelo Bertuol', kind: 'repasse', amount: -1_810.9, status: 'pago' },
  { date: '04/08/2026', description: 'Aluguel 33066 — Cinquentenário', kind: 'aluguel', amount: 1_450, status: 'recebido' },
  { date: '04/08/2026', description: 'Repasse 33066 — Marcelo Bertuol', kind: 'repasse', amount: -1_319.5, status: 'pago' },
  { date: '03/08/2026', description: 'Fotografia profissional — 4 imóveis', kind: 'despesa', amount: -1_200, status: 'pago' },
  { date: '02/08/2026', description: 'Anúncios nos portais — agosto', kind: 'despesa', amount: -2_400, status: 'pago' },
  { date: '10/08/2026', description: 'Comissão — venda 33694, São Francisco', kind: 'comissao', amount: 19_800, status: 'previsto' },
];

/** The person "signed in" to the panel. */
export const DEMO_OPERATOR = {
  name: 'Débora Cassol',
  role: 'Corretora · Matriz Farroupilha',
} as const;
