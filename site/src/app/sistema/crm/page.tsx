import { DEMO_LEADS, DEMO_PIPELINE, LEAD_STAGE_LABELS } from '@/data/demo-system';
import { readStore } from '@/lib/system-store';
import { formatPrice } from '@/lib/format';
import { CrmBoard, type BoardCard } from '@/components/system/crm-board';
import { Card, DemoNotice, PageHead } from '@/components/system/ui';

export const metadata = { title: 'CRM' };

export const dynamic = 'force-dynamic';

export default function CrmPage() {
  const store = readStore();

  const cards: readonly BoardCard[] = [
    ...store.leads.map((lead) => ({
      id: lead.id,
      name: lead.name,
      interest: lead.interest,
      agent: lead.agent,
      stage: lead.stage,
    })),
    ...DEMO_LEADS.map((lead) => ({
      id: lead.name,
      name: lead.name,
      interest: lead.interest,
      agent: lead.agent,
      stage: lead.stage as string,
    })),
  ];

  const total = DEMO_PIPELINE.reduce((sum, stage) => sum + stage.value, 0);
  const widest = Math.max(...DEMO_PIPELINE.map((stage) => stage.count));

  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Funil"
        title="CRM"
        text="Arraste um card para mudar a etapa da negociação. Quem usa teclado ou celular troca pelo seletor no próprio card."
      />

      <Card className="mb-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <p className="text-xs uppercase tracking-wider text-ink-faint">
            Valor em negociação
          </p>
          <p className="text-2xl font-medium tracking-tight">{formatPrice(total)}</p>
        </div>

        {/* A bar per stage, scaled to the busiest one: the shape of the funnel
            is the information, not the exact pixel width. */}
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {DEMO_PIPELINE.map((stage) => (
            <li key={stage.stage}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium">{LEAD_STAGE_LABELS[stage.stage]}</span>
                <span className="text-xs text-ink-soft">{stage.count}</span>
              </div>
              <div
                aria-hidden
                className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted"
              >
                <div
                  className="h-full rounded-full bg-brand-700"
                  style={{ width: `${Math.round((stage.count / widest) * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-ink-faint">{formatPrice(stage.value)}</p>
            </li>
          ))}
        </ul>
      </Card>

      <CrmBoard cards={cards} />
    </>
  );
}
