import { DEMO_PIPELINE } from '@/data/demo-system';
import { scopedLeads } from '@/data/scoped';
import { currentScope } from '@/lib/branch-cookie';
import { LEAD_STAGE_LABELS, isOpen } from '@/domain/lead-pipeline';
import { formatPrice, formatPriceCompact } from '@/lib/format';
import { CrmBoard, type BoardCard } from '@/components/system/crm-board';
import { Card, DemoNotice, PageHead, Stat, StatRow } from '@/components/system/ui';

export const metadata = { title: 'CRM' };

export const dynamic = 'force-dynamic';

export default async function CrmPage() {
  const scope = await currentScope();
  const leads = await scopedLeads(scope);

  const cards: readonly BoardCard[] = leads.map((lead) => ({
    id: lead.id,
    name: lead.name,
    interest: lead.interest,
    agent: lead.agent,
    stage: lead.stage,
    nextAction: lead.nextAction,
  }));

  const negotiating = DEMO_PIPELINE.filter((stage) => isOpen(stage.stage));
  const inPlay = negotiating.reduce((sum, stage) => sum + stage.value, 0);
  const widest = Math.max(...DEMO_PIPELINE.map((stage) => stage.count));
  const won = DEMO_PIPELINE.find((stage) => stage.stage === 'fechado')?.count ?? 0;
  const lost = DEMO_PIPELINE.find((stage) => stage.stage === 'perdido')?.count ?? 0;

  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Funil"
        title="CRM"
        text="Do primeiro contato ao fechamento, da esquerda para a direita. Arraste um card para mudar a etapa; quem usa teclado ou celular troca pelo seletor no próprio card."
      />

      <StatRow className="mb-6">
        <Stat
          label="Em negociação"
          value={formatPriceCompact(inPlay)}
          hint={`${negotiating.reduce((sum, stage) => sum + stage.count, 0)} leads abertos`}
        />
        <Stat label="Fechados" value={String(won)} hint="No mês" />
        <Stat label="Perdidos" value={String(lost)} hint="No mês" />
        <Stat
          label="Aproveitamento"
          value={`${won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0}%`}
          hint="Fechados sobre concluídos"
        />
      </StatRow>

      <Card className="mb-8">
        <p className="text-xs uppercase tracking-wider text-ink-faint">Etapas do funil</p>

        {/* A bar per stage, scaled to the busiest one: the shape of the funnel
            is the information, not the exact pixel width. Em tela larga as oito
            etapas ficam na mesma linha, na ordem do funil, como no quadro. */}
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
          {DEMO_PIPELINE.map((stage) => (
            <li key={stage.stage}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-bold">{LEAD_STAGE_LABELS[stage.stage]}</span>
                <span className="text-xs text-ink-soft">{stage.count}</span>
              </div>
              <div aria-hidden className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className={`h-full rounded-full ${
                    stage.stage === 'perdido' ? 'bg-line-strong' : 'bg-brand-700'
                  }`}
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
