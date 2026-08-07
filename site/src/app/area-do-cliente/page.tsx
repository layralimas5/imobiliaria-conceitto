import type { Metadata } from 'next';
import { ClientAreaDashboard } from '@/components/client-area/dashboard';

export const metadata: Metadata = {
  title: 'Área do cliente',
  description: 'Acompanhe contratos, repasses e documentos dos seus imóveis.',
  // A demo screen behind a fake sign-in has nothing to offer a search engine.
  robots: { index: false, follow: false },
};

export default function AreaDoClientePage() {
  return <ClientAreaDashboard />;
}
