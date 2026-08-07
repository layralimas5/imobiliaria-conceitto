/**
 * Who sees what.
 *
 * Five roles, and the rule behind them is the same one every imobiliária
 * already runs on paper: a corretor works their own carteira, a gerente sees the
 * unit, o financeiro sees the money and nobody else's leads, o atendente
 * receives and routes, e o administrador responde por tudo — inclusive por quem
 * tem acesso.
 *
 * The list is the source of truth for the sidebar. In production the same map
 * gates the server actions too: hiding a link is a courtesy, not a permission.
 */
export const ROLES = [
  'Administrador',
  'Gerente',
  'Corretor',
  'Financeiro',
  'Atendente',
] as const;

export type Role = (typeof ROLES)[number];

/** Every section the panel has. The keys match the sidebar's hrefs. */
export const SECTIONS = [
  'painel',
  'imoveis',
  'busca',
  'leads',
  'crm',
  'clientes',
  'proprietarios',
  'corretores',
  'agenda',
  'propostas',
  'contratos',
  'documentos',
  'financeiro',
  'comissoes',
  'relatorios',
  'usuarios',
  'configuracoes',
] as const;

export type Section = (typeof SECTIONS)[number];

const CORRETOR: readonly Section[] = [
  'painel',
  'imoveis',
  'busca',
  'leads',
  'crm',
  'clientes',
  'agenda',
  'propostas',
  'documentos',
  'comissoes',
];

const ATENDENTE: readonly Section[] = [
  'painel',
  'imoveis',
  'busca',
  'leads',
  'crm',
  'clientes',
  'agenda',
];

const FINANCEIRO: readonly Section[] = [
  'painel',
  'imoveis',
  'proprietarios',
  'contratos',
  'documentos',
  'financeiro',
  'comissoes',
  'relatorios',
];

const GERENTE: readonly Section[] = SECTIONS.filter((section) => section !== 'usuarios');

export const ROLE_SECTIONS: Record<Role, readonly Section[]> = {
  Administrador: SECTIONS,
  Gerente: GERENTE,
  Corretor: CORRETOR,
  Financeiro: FINANCEIRO,
  Atendente: ATENDENTE,
};

export const ROLE_SUMMARIES: Record<Role, string> = {
  Administrador: 'Tudo, inclusive usuários, permissões e financeiro.',
  Gerente: 'A operação inteira da unidade. Não administra usuários.',
  Corretor: 'A própria carteira: imóveis, leads, agenda, propostas e comissões.',
  Financeiro: 'Caixa, comissões, contratos, proprietários e relatórios.',
  Atendente: 'Recebe e distribui leads, agenda visitas e consulta a carteira.',
};

export function canAccess(role: Role, section: Section): boolean {
  return ROLE_SECTIONS[role].includes(section);
}

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}
