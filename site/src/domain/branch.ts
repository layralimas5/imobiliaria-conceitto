import { DEMO_AGENTS } from '@/data/demo-system';
import { BRANCHES, type BranchId } from '@/lib/site-config';

/**
 * Which unit a record belongs to.
 *
 * The Conceitto is two offices, not one company with two addresses: separate
 * phones, separate WhatsApps, separate Instagram, separate teams. A corretora em
 * Farroupilha opening the panel wants her carteira, not a merged list she has to
 * mentally filter every morning — and a lead answered from the wrong unit is a
 * real mistake, not a cosmetic one.
 *
 * `todas` exists for whoever actually runs both.
 */
export type BranchScope = BranchId | 'todas';

export const BRANCH_SCOPES: readonly BranchScope[] = ['todas', ...BRANCHES.map((b) => b.id)];

export function isBranchScope(value: unknown): value is BranchScope {
  return typeof value === 'string' && BRANCH_SCOPES.includes(value as BranchScope);
}

export function scopeLabel(scope: BranchScope): string {
  if (scope === 'todas') return 'Todas as unidades';
  return BRANCHES.find((branch) => branch.id === scope)?.city ?? 'Todas as unidades';
}

/**
 * Cities each office answers for.
 *
 * Drawn from where the branches actually are: Bento Gonçalves covers the vale
 * dos vinhedos side, Farroupilha covers the rest. Anything unlisted falls to the
 * matriz, which is the office that has always taken what nobody claimed.
 */
const BENTO_CITIES = new Set(
  [
    'Bento Gonçalves',
    'Monte Belo do Sul',
    'Pinto Bandeira',
    'Santa Tereza',
    'Garibaldi',
    'Cotiporã',
    'Veranópolis',
  ].map((city) => city.toLowerCase()),
);

export function branchOfCity(city: string): BranchId {
  return BENTO_CITIES.has(city.trim().toLowerCase()) ? 'bento-goncalves' : 'farroupilha';
}

/** The unit a corretor works out of. Unknown names fall to the matriz. */
export function branchOfAgent(name: string): BranchId {
  const agent = DEMO_AGENTS.find((candidate) => candidate.name === name);
  if (!agent) return 'farroupilha';
  return agent.branch === 'Bento Gonçalves' ? 'bento-goncalves' : 'farroupilha';
}

/** "Farroupilha" / "Bento Gonçalves" → the id, for records that store the name. */
export function branchIdOf(cityName: string): BranchId {
  return cityName === 'Bento Gonçalves' ? 'bento-goncalves' : 'farroupilha';
}

/** The one predicate every screen filters with. */
export function inScope(scope: BranchScope, branch: BranchId): boolean {
  return scope === 'todas' || scope === branch;
}
