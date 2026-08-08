import { currentScope } from '@/lib/branch-cookie';
import { scopedAgents, scopedSchedule } from '@/data/scoped';
import type { DemoAppointment } from '@/data/demo-system';
import { AppointmentForm } from '@/components/system/appointment-form';
import { Badge, DemoNotice, PageHead, Stat, StatRow } from '@/components/system/ui';

export const metadata = { title: 'Agenda' };

export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<DemoAppointment['status'], 'neutral' | 'brand' | 'good' | 'warn'> = {
  confirmado: 'good',
  'a confirmar': 'warn',
  concluído: 'neutral',
};

/**
 * The week, grouped by day rather than listed flat: nobody looks at an agenda
 * asking "what is the fourteenth item", they ask "what is left today".
 */
export default async function AgendaPage() {
  const scope = await currentScope();
  const schedule = await scopedSchedule(scope);
  const days = schedule.reduce<Record<string, DemoAppointment[]>>((groups, item) => {
    (groups[item.day] ??= []).push(item);
    return groups;
  }, {});

  const today = schedule.filter((item) => item.day === 'Hoje');
  const visits = schedule.filter((item) => item.kind === 'visita').length;
  const pending = schedule.filter((item) => item.status === 'a confirmar').length;

  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Semana"
        title="Agenda"
        text="Visitas, avaliações, reuniões e assinaturas da equipe, com quem é o compromisso e onde."
        action={<AppointmentForm agents={scopedAgents(scope).map((agent) => agent.name)} />}
      />

      <StatRow columns={3} className="mb-8">
        <Stat
          label="Hoje"
          value={String(today.length)}
          hint={`${today.filter((item) => item.status === 'concluído').length} já concluídos`}
        />
        <Stat label="Visitas na semana" value={String(visits)} hint="Agendadas com cliente" />
        <Stat label="A confirmar" value={String(pending)} hint="Aguardando retorno" />
      </StatRow>

      <div className="space-y-6">
        {Object.entries(days).map(([day, items]) => (
          <section key={day}>
            <h3 className="mb-3 flex items-baseline gap-3 text-sm font-bold">
              {day}
              <span className="text-xs font-normal text-ink-faint">
                {items.length} compromisso{items.length === 1 ? '' : 's'} · {items[0].date}
              </span>
            </h3>

            <ul className="pulse-on-hover overflow-hidden rounded-card border border-line bg-surface hover:border-line-strong">
              {items.map((item) => (
                <li
                  key={`${item.date}-${item.time}-${item.title}`}
                  className={`flex flex-wrap items-baseline gap-x-4 gap-y-1.5 border-b border-line px-4 py-3.5 last:border-b-0 ${
                    item.status === 'concluído' ? 'bg-surface-muted/60' : ''
                  }`}
                >
                  <span className="w-14 shrink-0 text-sm font-bold tabular-nums">{item.time}</span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm ${
                        item.status === 'concluído' ? 'text-ink-soft line-through' : ''
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-faint">
                      {item.withWhom} · {item.agent} · {item.where}
                    </span>
                  </span>
                  <Badge>{item.kind}</Badge>
                  <Badge tone={STATUS_TONE[item.status]}>{item.status}</Badge>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
