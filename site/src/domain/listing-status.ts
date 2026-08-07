/**
 * The commercial state of a listing.
 *
 * This is the field that connects the panel to the site. Everything else in the
 * cadastro describes the imóvel; this one decides whether the public catalog
 * still shows it. Marking a listing as vendido or alugado in the panel takes it
 * off the site on the next request — no second step, no "lembrar de tirar do ar".
 */
export const LISTING_STATUSES = [
  'disponivel',
  'reservado',
  'em-negociacao',
  'vendido',
  'alugado',
  'inativo',
] as const;

export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  'em-negociacao': 'Em negociação',
  vendido: 'Vendido',
  alugado: 'Alugado',
  inativo: 'Inativo',
};

export const LISTING_STATUS_TONES: Record<
  ListingStatus,
  'neutral' | 'brand' | 'good' | 'warn'
> = {
  disponivel: 'good',
  reservado: 'warn',
  'em-negociacao': 'warn',
  vendido: 'brand',
  alugado: 'brand',
  inativo: 'neutral',
};

/**
 * Whether the site should still publish it.
 *
 * Reservado and em negociação stay up on purpose: the deal can fall through, and
 * pulling the anúncio at the first proposta throws away every other interested
 * visitor. Vendido, alugado and inativo come down.
 */
export function isPublished(status: ListingStatus): boolean {
  return status === 'disponivel' || status === 'reservado' || status === 'em-negociacao';
}

/** Whether the deal is done, for the "vendidos/alugados no mês" counters. */
export function isClosed(status: ListingStatus): boolean {
  return status === 'vendido' || status === 'alugado';
}

export function isListingStatus(value: unknown): value is ListingStatus {
  return LISTING_STATUSES.includes(value as ListingStatus);
}
