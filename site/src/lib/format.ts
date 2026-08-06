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

/** "84 a 130 m²", collapsing to a single measure when the range is one value. */
export function formatAreaRange(min: number, max: number): string {
  return min === max
    ? `${decimal.format(min)} m²`
    : `${decimal.format(min)} a ${decimal.format(max)} m²`;
}

/** Monthly carrying cost, the number buyers actually budget against. */
export function formatMonthlyCost(condoFee: number | null, propertyTax: number | null) {
  const monthlyTax = propertyTax === null ? 0 : propertyTax / 12;
  const total = (condoFee ?? 0) + monthlyTax;
  return total > 0 ? currency.format(total) : null;
}

/** Words that stay lowercase inside a title, unless they open it. */
const MINOR_WORDS = new Set([
  'a', 'à', 'ao', 'aos', 'as', 'às', 'da', 'das', 'de', 'do', 'dos', 'e', 'em', 'na',
  'nas', 'no', 'nos', 'o', 'os', 'ou', 'para', 'pela', 'pelo', 'por', 'com', 'sem', 'um',
  'uma',
]);

/** Kept as-is because lowering them would read as a typo, not as a fix. */
const ACRONYMS = new Set(['RS', 'SC', 'PR', 'SP', 'CRECI', 'CEP', 'IPTU', 'BR']);

/**
 * MSYS titles are typed in caps lock by the team ("LINDO APARTAMENTO NO BOTAFOGO").
 * Published verbatim across 1498 listings that reads as shouting, so a title that
 * is predominantly uppercase is brought down to title case.
 *
 * A title that is already mixed case is returned untouched — the point is to stop
 * the shouting, not to impose a house style on text somebody wrote carefully.
 */
export function formatListingTitle(title: string): string {
  const letters = title.replace(/[^\p{L}]/gu, '');
  if (letters.length === 0) return title;

  const uppercaseRatio =
    [...letters].filter((char) => char === char.toUpperCase()).length / letters.length;
  if (uppercaseRatio < 0.8) return title;

  return title
    .toLocaleLowerCase('pt-BR')
    .split(/(\s+|-|\/)/)
    .map((token, index) => {
      if (/^(\s+|-|\/)$/.test(token) || token.length === 0) return token;
      const upper = token.toLocaleUpperCase('pt-BR');
      if (ACRONYMS.has(upper)) return upper;
      if (index > 0 && MINOR_WORDS.has(token)) return token;
      return token.charAt(0).toLocaleUpperCase('pt-BR') + token.slice(1);
    })
    .join('');
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
