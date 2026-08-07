import { cookies } from 'next/headers';
import { isBranchScope, type BranchScope } from '@/domain/branch';

/**
 * The selected unit lives in a cookie, not in React state.
 *
 * Every screen in the panel is a server component that has to filter by it, so
 * the choice has to be readable on the server before the page renders. A cookie
 * also survives a reload and a new tab, which is the behaviour someone expects
 * from something they picked once at the start of the day.
 */
export const BRANCH_COOKIE = 'conceitto-unidade';

export async function currentScope(): Promise<BranchScope> {
  const store = await cookies();
  const value = store.get(BRANCH_COOKIE)?.value;
  return isBranchScope(value) ? value : 'todas';
}
