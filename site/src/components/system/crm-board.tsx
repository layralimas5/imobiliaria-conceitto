'use client';

import { useState, useTransition, type DragEvent } from 'react';
import Link from 'next/link';
import { GripVertical } from 'lucide-react';
import { updateLeadStage } from '@/app/sistema/actions';
import { LEAD_STAGES, LEAD_STAGE_LABELS, type LeadStage } from '@/domain/lead-pipeline';

export interface BoardCard {
  readonly id: string;
  readonly name: string;
  readonly interest: string;
  readonly agent: string;
  readonly stage: LeadStage;
  readonly nextAction: string;
}

/**
 * The funnel as a board you can rearrange.
 *
 * Native HTML drag and drop rather than a library: the board moves one card
 * between eight columns, which the platform already does, and a drag library
 * would be more code shipped than the feature is worth.
 *
 * The move is optimistic and then persisted for leads the panel owns. The seeded
 * examples move on screen and say so — their stage belongs to MSYS.
 */
export function CrmBoard({ cards: initial }: { cards: readonly BoardCard[] }) {
  const [cards, setCards] = useState<readonly BoardCard[]>(initial);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function move(id: string, stage: LeadStage) {
    setCards((current) =>
      current.map((card) => (card.id === id ? { ...card, stage } : card)),
    );
    startTransition(async () => {
      await updateLeadStage(id, stage);
    });
  }

  function onDrop(event: DragEvent<HTMLElement>, stage: LeadStage) {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain') || dragging;
    if (id) move(id, stage);
    setDragging(null);
    setOver(null);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {LEAD_STAGES.map((stage) => {
        const inStage = cards.filter((card) => card.stage === stage);
        return (
          <section
            key={stage}
            onDragOver={(event) => {
              event.preventDefault();
              setOver(stage);
            }}
            onDragLeave={() => setOver((current) => (current === stage ? null : current))}
            onDrop={(event) => onDrop(event, stage)}
            /* The breath is off while a card is in the air: a drop target that
               scales under the pointer moves the very edges the drop is being
               aimed at. */
            className={`rounded-card border p-3 ${dragging === null ? 'pulse-on-hover' : ''} ${
              over === stage
                ? 'border-brand-500 bg-brand-50'
                : 'border-line bg-surface hover:border-line-strong'
            }`}
          >
            <div className="flex items-baseline justify-between gap-3 px-1.5 pb-3">
              <h3 className="text-sm font-bold">{LEAD_STAGE_LABELS[stage]}</h3>
              <span className="text-xs text-ink-faint">{inStage.length}</span>
            </div>

            <ul className="space-y-2.5">
              {inStage.map((card) => (
                <li key={card.id}>
                  <article
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData('text/plain', card.id);
                      event.dataTransfer.effectAllowed = 'move';
                      setDragging(card.id);
                    }}
                    onDragEnd={() => {
                      setDragging(null);
                      setOver(null);
                    }}
                    className={`cursor-grab rounded-lg border border-line bg-surface p-3.5 shadow-sm transition-opacity active:cursor-grabbing ${
                      dragging === card.id ? 'opacity-40' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical
                        className="mt-0.5 size-4 shrink-0 text-ink-faint"
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/sistema/leads/${card.id}`}
                          className="text-sm font-bold underline-offset-4 hover:underline"
                        >
                          {card.name}
                        </Link>
                        <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                          {card.interest}
                        </p>
                        <p className="mt-1.5 text-xs text-ink-faint">{card.agent}</p>
                        <p className="mt-1.5 rounded bg-surface-muted px-2 py-1 text-xs text-ink-soft">
                          {card.nextAction}
                        </p>
                      </div>
                    </div>

                    {/*
                     * Dragging is a mouse gesture. This select is the same move
                     * for a keyboard or a touch screen, not a fallback bolted on
                     * after the fact.
                     */}
                    <label className="mt-3 block">
                      <span className="sr-only">Mover {card.name} para outra etapa</span>
                      <select
                        value={card.stage}
                        onChange={(event) => move(card.id, event.target.value as LeadStage)}
                        className="h-8 w-full rounded-md border border-line bg-surface px-2 text-xs"
                      >
                        {LEAD_STAGES.map((option) => (
                          <option key={option} value={option}>
                            {LEAD_STAGE_LABELS[option]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </article>
                </li>
              ))}

              {inStage.length === 0 ? (
                <li className="rounded-lg border border-dashed border-line px-3.5 py-6 text-center text-xs text-ink-faint">
                  Arraste um card para cá
                </li>
              ) : null}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
