import type { Metadata } from 'next';
import { currentScope } from '@/lib/branch-cookie';
import { SystemShell } from '@/components/system/system-shell';

export const metadata: Metadata = {
  title: 'Sistema',
  // A back office behind a demo sign-in has nothing to offer a search engine.
  robots: { index: false, follow: false },
};

export default async function SistemaLayout({ children }: LayoutProps<'/sistema'>) {
  const scope = await currentScope();
  return <SystemShell scope={scope}>{children}</SystemShell>;
}
