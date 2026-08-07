'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { updateListingStatus } from '@/app/sistema/actions';
import {
  LISTING_STATUSES,
  LISTING_STATUS_LABELS,
  isPublished,
  type ListingStatus,
} from '@/domain/listing-status';

const TONE: Record<ListingStatus, string> = {
  disponivel: 'border-green-200 bg-green-50 text-green-800',
  reservado: 'border-bronze-400/60 bg-bronze-100 text-bronze-600',
  'em-negociacao': 'border-bronze-400/60 bg-bronze-100 text-bronze-600',
  vendido: 'border-brand-100 bg-brand-50 text-brand-700',
  alugado: 'border-brand-100 bg-brand-50 text-brand-700',
  inativo: 'border-line bg-surface-muted text-ink-soft',
};

/**
 * Changing the status from the list, which is where it actually gets changed —
 * a corretor closing a deal is not going to open an edit page for one field.
 *
 * The optimistic value is kept locally so the row settles immediately, and the
 * message underneath says the part that surprises people: the site follows.
 */
export function ListingStatusSelect({
  code,
  status: initial,
}: {
  code: string;
  status: ListingStatus;
}) {
  const [status, setStatus] = useState<ListingStatus>(initial);
  const [note, setNote] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function change(next: ListingStatus) {
    const previous = status;
    setStatus(next);
    setNote(null);

    startTransition(async () => {
      const result = await updateListingStatus(code, next);
      if (!result.ok) {
        setStatus(previous);
        setNote(result.message);
        return;
      }
      setNote(isPublished(next) ? 'No site' : 'Fora do site');
    });
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <span className="inline-flex items-center gap-1.5">
        <label className="sr-only" htmlFor={`status-${code}`}>
          Status do imóvel {code}
        </label>
        <select
          id={`status-${code}`}
          value={status}
          disabled={isPending}
          onChange={(event) => change(event.target.value as ListingStatus)}
          className={`h-8 rounded-full border px-2.5 text-xs font-bold disabled:opacity-60 ${TONE[status]}`}
        >
          {LISTING_STATUSES.map((option) => (
            <option key={option} value={option}>
              {LISTING_STATUS_LABELS[option]}
            </option>
          ))}
        </select>
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin text-ink-faint" aria-hidden />
        ) : null}
      </span>

      {note ? (
        <span role="status" className="text-xs text-ink-faint">
          {note}
        </span>
      ) : null}
    </span>
  );
}
