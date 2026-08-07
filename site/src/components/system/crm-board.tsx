'use client';

import { useState, type DragEvent } from 'react';
import { GripVertical } from 'lucide-react';
import { LEAD_STAGE_LABELS } from '@/data/demo-system';

export interface BoardCard {
  readonly id: string;
  readonly name: string;
  readonly interest: string;
  readonly agent: string;
  readonly stage: string;
}

const STAGES = Object.keys(LEAD_STAGE_LABELS);

/**
 * The funnel as a board you can rearrange.
 *
 * Native HTML drag and drop rather than a library: the board moves one card
 * between five columns, which the platform already does, and a drag library
 * would be more code shipped than the feature is worth.
 *
 * The move is local to the session — nothing is written back — because the
 * stage of a real negotiation belongs to MSYS, not to this demo.
 */
export function CrmBoard({ cards: initial }: { cards: readonly BoardCard[] }) {
  const [cards, setCards] = useState<readonly BoardCard[]>(initial);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  function move(id: string, stage: string) {
    setCards((current) =>
      current.map((card) => (card.id === id ? { ...card, stage } : card)),
    );
  }

  function onDrop(event: DragEvent<HTMLElement>, stage: string) {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain') || dragging;
    if (id) move(id, stage);
    setDragging(null);
    setOver(null);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {STAGES.map((stage) => {
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
            className={`rounded-card border p-3 transition-colors ${
              over === stage
                ? 'border-brand-500 bg-brand-50'
                : 'border-line bg-surface'
            }`}
          >
            <div className="flex items-baseline justify-between gap-3 px-1.5 pb-3">
              <h3 className="text-sm font-medium">
                {LEAD_STAGE_LABELS[stage as keyof typeof LEAD_STAGE_LABELS]}
              </h3>
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
                        <p className="text-sm font-medium">{card.name}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">
                          {card.interest}
                        </p>
                        <p className="mt-1.5 text-xs text-ink-faint">{card.agent}</p>
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
                        onChange={(event) => move(card.id, event.target.value)}
                        className="h-8 w-full rounded-md border border-line bg-surface px-2 text-xs"
                      >
                        {STAGES.map((option) => (
                          <option key={option} value={option}>
                            {LEAD_STAGE_LABELS[option as keyof typeof LEAD_STAGE_LABELS]}
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
