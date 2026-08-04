const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

export function formatPrice(value: number | null): string {
  return value === null ? 'Sob consulta' : currency.format(value);
}

/** Compact form for map pins and chips: R$ 1,2 mi / R$ 450 mil. */
export function formatPriceCompact(value: number | null): string {
  if (value === null) return 'Consulte';
  if (value >= 1_000_000) {
    return `R$ ${decimal.format(Number((value / 1_000_000).toFixed(1)))} mi`;
  }
  if (value >= 1_000) return `R$ ${Math.round(value / 1_000)} mil`;
  return currency.format(value);
}

export function formatArea(value: number | null): string | null {
  return value === null ? null : `${decimal.format(value)} m²`;
}

/** Monthly carrying cost, the number buyers actually budget against. */
export function formatMonthlyCost(condoFee: number | null, propertyTax: number | null) {
  const monthlyTax = propertyTax === null ? 0 : propertyTax / 12;
  const total = (condoFee ?? 0) + monthlyTax;
  return total > 0 ? currency.format(total) : null;
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
