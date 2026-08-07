/**
 * Fictional data for the client-area demo.
 *
 * There is no backend behind this and there is not meant to be one yet: the
 * real área do cliente lives in MSYS Imob, and this screen exists so the
 * Conceitto can see what an in-site version would feel like before anyone
 * commits to building it.
 *
 * Everything here is invented. It is kept in one file, apart from the catalog
 * and the repositories, so that swapping it for a real integration is a
 * deletion rather than an excavation — and so nobody mistakes it for data the
 * site actually holds.
 */

export interface DemoCredentials {
  readonly email: string;
  readonly password: string;
}

/** Shown on the sign-in form on purpose: it is a demo, not a secret. */
export const DEMO_CREDENTIALS: DemoCredentials = {
  email: 'proprietario@conceitto.com.br',
  password: 'conceitto2026',
};

export interface DemoManagedProperty {
  readonly code: string;
  readonly label: string;
  readonly address: string;
  readonly tenant: string;
  readonly rent: number;
  readonly dueDay: number;
  readonly contractUntil: string;
  readonly status: 'em-dia' | 'a-vencer';
}

export interface DemoTransfer {
  readonly month: string;
  readonly propertyCode: string;
  readonly gross: number;
  readonly fee: number;
  readonly net: number;
  readonly paidOn: string;
}

export interface DemoDocument {
  readonly name: string;
  readonly kind: string;
  readonly issuedOn: string;
}

export interface DemoClient {
  readonly name: string;
  readonly since: number;
  readonly properties: readonly DemoManagedProperty[];
  readonly transfers: readonly DemoTransfer[];
  readonly documents: readonly DemoDocument[];
}

export const DEMO_CLIENT: DemoClient = {
  name: 'Marcelo Bertuol',
  since: 2019,
  properties: [
    {
      code: '33837',
      label: 'Apartamento 302',
      address: 'Rua Independência, 480 — São Francisco, Farroupilha',
      tenant: 'Juliana Panizzon',
      rent: 1990,
      dueDay: 10,
      contractUntil: '31/03/2028',
      status: 'em-dia',
    },
    {
      code: '33066',
      label: 'Apartamento 104',
      address: 'Rua Buarque de Macedo, 235 — Cinquentenário, Farroupilha',
      tenant: 'Rodrigo Sartori',
      rent: 1450,
      dueDay: 5,
      contractUntil: '30/09/2027',
      status: 'a-vencer',
    },
  ],
  transfers: [
    { month: 'Julho de 2026', propertyCode: '33837', gross: 1990, fee: 179.1, net: 1810.9, paidOn: '12/07/2026' },
    { month: 'Julho de 2026', propertyCode: '33066', gross: 1450, fee: 130.5, net: 1319.5, paidOn: '07/07/2026' },
    { month: 'Junho de 2026', propertyCode: '33837', gross: 1990, fee: 179.1, net: 1810.9, paidOn: '12/06/2026' },
    { month: 'Junho de 2026', propertyCode: '33066', gross: 1450, fee: 130.5, net: 1319.5, paidOn: '05/06/2026' },
    { month: 'Maio de 2026', propertyCode: '33837', gross: 1990, fee: 179.1, net: 1810.9, paidOn: '11/05/2026' },
    { month: 'Maio de 2026', propertyCode: '33066', gross: 1450, fee: 130.5, net: 1319.5, paidOn: '06/05/2026' },
  ],
  documents: [
    { name: 'Contrato de locação — Apartamento 302', kind: 'Contrato', issuedOn: '01/04/2025' },
    { name: 'Vistoria de entrada — Apartamento 302', kind: 'Vistoria', issuedOn: '28/03/2025' },
    { name: 'Contrato de locação — Apartamento 104', kind: 'Contrato', issuedOn: '15/09/2025' },
    { name: 'Informe de rendimentos 2025', kind: 'Fiscal', issuedOn: '20/02/2026' },
  ],
};

/** Sum of the current month's net transfers, for the headline figure. */
export function currentMonthNet(client: DemoClient): number {
  const current = client.transfers[0]?.month;
  return client.transfers
    .filter((transfer) => transfer.month === current)
    .reduce((total, transfer) => total + transfer.net, 0);
}
