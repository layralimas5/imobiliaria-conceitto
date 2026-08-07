'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { updateLeadStage } from '@/app/sistema/actions';
import { LEAD_STAGES, LEAD_STAGE_LABELS, type LeadStage } from '@/domain/lead-pipeline';

/** Moving a lead down the funnel from its own page. */
export function LeadStageSelect({ id, stage: initial }: { id: string; stage: LeadStage }) {
  const [stage, setStage] = useState<LeadStage>(initial);
  const [note, setNote] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="min-w-56">
      <label
        htmlFor={`etapa-${id}`}
        className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-faint"
      >
        Etapa do funil
      </label>
      <div className="flex items-center gap-2">
        <select
          id={`etapa-${id}`}
          value={stage}
          disabled={isPending}
          onChange={(event) => {
            const next = event.target.value as LeadStage;
            setStage(next);
            setNote(null);
            startTransition(async () => {
              const result = await updateLeadStage(id, next);
              setNote(result.message);
            });
          }}
          className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm"
        >
          {LEAD_STAGES.map((option) => (
            <option key={option} value={option}>
              {LEAD_STAGE_LABELS[option]}
            </option>
          ))}
        </select>
        {isPending ? <Loader2 className="size-4 animate-spin text-ink-faint" aria-hidden /> : null}
      </div>
      {note ? (
        <p role="status" className="mt-1.5 text-xs text-ink-faint">
          {note}
        </p>
      ) : null}
    </div>
  );
}
