import { redirect } from 'next/navigation';

/** The panel opens on Leads: it is what the team looks at first every morning. */
export default function SistemaPage() {
  redirect('/sistema/leads');
}
