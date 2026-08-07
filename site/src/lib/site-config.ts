import type { Development } from '@/domain/development';
import type { CitySlug, Operation } from '@/domain/property';

export type BranchId = 'farroupilha' | 'bento-goncalves';

export interface Branch {
  readonly id: BranchId;
  readonly name: string;
  readonly city: string;
  readonly label: string;
  readonly street: string;
  readonly district: string;
  readonly phone: string;
  /** E.164 without the plus sign, per operation, ready for wa.me links. */
  readonly whatsapp: Record<Operation, string>;
  readonly email: string;
  readonly instagram: string;
  readonly facebook: string;
  readonly mapsQuery: string;
}

export const BRANCHES: readonly Branch[] = [
  {
    id: 'farroupilha',
    name: 'Matriz',
    city: 'Farroupilha',
    label: 'Farroupilha (matriz)',
    street: 'Rua Coronel Pena de Moraes, 202',
    district: 'Centro',
    phone: '(54) 3268-6621',
    whatsapp: { venda: '555432686621', locacao: '5554984220808' },
    email: 'contato@imobiliariaconceitto.com.br',
    instagram: 'https://www.instagram.com/imobiliaria.conceitto',
    facebook: 'https://www.facebook.com/Imobiliariaconceitto',
    mapsQuery: 'Rua Coronel Pena de Moraes, 202, Centro, Farroupilha, RS',
  },
  {
    id: 'bento-goncalves',
    name: 'Filial',
    city: 'Bento Gonçalves',
    label: 'Bento Gonçalves (filial)',
    street: 'Marechal Floriano, 200',
    district: 'Centro',
    phone: '(54) 3454-7528',
    whatsapp: { venda: '5554996550807', locacao: '5554996260105' },
    email: 'contato@imobiliariaconceitto.com.br',
    instagram: 'https://www.instagram.com/imobiliariaconceittobento',
    facebook: 'https://www.facebook.com/Imobiliariaconceittobento',
    mapsQuery: 'Marechal Floriano, 200, Centro, Bento Gonçalves, RS',
  },
];

/**
 * Cities served out of the Bento Gonçalves branch. Everything else routes to
 * the Farroupilha head office.
 *
 * TODO: confirm the split with the client — inferred from geography, not stated.
 */
const BENTO_AREA: ReadonlySet<CitySlug> = new Set([
  'bento-goncalves',
  'garibaldi',
  'monte-belo-do-sul',
  'pinto-bandeira',
  'vale-dos-vinhedos',
  'faria-lemos',
  'santa-tereza',
  'carlos-barbosa',
  'tuiuti',
]);

export function branchFor(city: CitySlug | undefined): Branch {
  if (city && BENTO_AREA.has(city)) return BRANCHES[1];
  return BRANCHES[0];
}

export const SITE = {
  name: 'Imobiliária Conceitto',
  shortName: 'Conceitto',
  creci: 'CRECI 23909-J',
  legalName: 'Cristiano Marcolin Nery Imóveis',
  cnpj: '18.473.014/0001-98',
  foundedYear: 2013,
  region: 'Serra Gaúcha',
  url: 'https://imobiliariaconceitto.com.br',
  description:
    'Imobiliária em Farroupilha e Bento Gonçalves. Casas, apartamentos, terrenos e imóveis comerciais para comprar ou alugar na Serra Gaúcha.',
  /**
   * Área do cliente do MSYS Imob, onde proprietários e inquilinos acompanham
   * contratos e repasses. É o mesmo destino que o site atual já usa.
   */
  clientAreaUrl: 'https://msysimob.com.br/msys-imob-web/areacliente',
} as const;

/**
 * Pre-fills the WhatsApp message with the listing code and routes to the branch
 * and department that actually handles it, so the broker opens the conversation
 * already knowing what the lead is asking about.
 */
export function whatsappLink(options: {
  city?: CitySlug;
  operation?: Operation;
  propertyCode?: string;
  message?: string;
}): string {
  const { city, operation = 'venda', propertyCode } = options;
  const branch = branchFor(city);
  const message =
    options.message ??
    (propertyCode
      ? `Olá! Tenho interesse no imóvel de código ${propertyCode}. Pode me passar mais informações?`
      : 'Olá! Gostaria de falar com um corretor da Conceitto.');
  return `https://wa.me/${branch.whatsapp[operation]}?text=${encodeURIComponent(message)}`;
}

/** Opens the conversation already naming the development the visitor is on. */
export function developmentWhatsapp(development: Development): string {
  return whatsappLink({
    city: development.location.citySlug,
    operation: 'venda',
    message: `Olá! Quero saber mais sobre o ${development.name}, em ${development.location.city}.`,
  });
}

export const NAV_LINKS = [
  { href: '/imoveis', label: 'Nossos Imóveis' },
  { href: '/lancamentos', label: 'Lançamentos' },
  { href: '/anuncie', label: 'Anuncie seu imóvel' },
  { href: '/sobre', label: 'A Conceitto' },
  { href: '/contato', label: 'Contato' },
] as const;
