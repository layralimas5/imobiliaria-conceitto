import type { Metadata } from 'next';
import { SystemShell } from '@/components/system/system-shell';

export const metadata: Metadata = {
  title: 'Sistema',
  // A back office behind a demo sign-in has nothing to offer a search engine.
  robots: { index: false, follow: false },
};

export default function SistemaLayout({ children }: LayoutProps<'/sistema'>) {
  return <SystemShell>{children}</SystemShell>;
}
