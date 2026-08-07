import { redirect } from 'next/navigation';

/** The panel opens on the dashboard: the month in one page, before the lists. */
export default function SistemaPage() {
  redirect('/sistema/painel');
}
