'use client';

import { useActionState, useState, type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import { Check, Loader2, Plus, X } from 'lucide-react';
import type { ActionResult } from '@/app/sistema/actions';
import { useModalFocus } from '@/hooks/use-modal-focus';

interface RecordFormProps {
  /** Label on the button that opens the sheet. */
  readonly trigger: string;
  readonly title: string;
  readonly text: string;
  readonly action: (
    previous: ActionResult | null | FormData,
    formData?: FormData,
  ) => Promise<ActionResult>;
  readonly submitLabel: string;
  /** `secondary` for the second button on a screen: two primaries is no primary. */
  readonly variant?: 'primary' | 'secondary';
  /** Receives the per-field errors the action came back with. */
  readonly children: (errors: Record<string, string>) => ReactNode;
}

/**
 * The panel's create form: a button that opens a side sheet.
 *
 * A sheet rather than a separate page because filling one in is an interruption
 * of the list, not a departure from it — the person wants to be back on the
 * list the moment they are done, with the new row already there.
 */
export function RecordForm({
  trigger,
  title,
  text,
  action,
  submitLabel,
  variant = 'primary',
  children,
}: RecordFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [result, formAction] = useActionState(action, null);
  const sheetRef = useModalFocus<HTMLDivElement>(isOpen);

  function close() {
    setIsOpen(false);
  }

  const errors = result?.ok === false ? (result.errors ?? {}) : {};

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-bold transition-colors ${
          variant === 'primary'
            ? 'bg-brand-700 text-white hover:bg-brand-600'
            : 'border border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-muted'
        }`}
      >
        <Plus className="size-4" aria-hidden />
        {trigger}
      </button>

      {isOpen ? (
        <div
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-50 flex justify-end"
          onKeyDown={(event) => {
            if (event.key === 'Escape') close();
          }}
        >
          <button
            type="button"
            aria-label="Fechar"
            onClick={close}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
          />

          <div className="relative flex h-full w-full max-w-xl flex-col bg-surface shadow-panel">
            <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
              <div>
                <h2 className="text-display text-2xl">{title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{text}</p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Fechar"
                className="-mr-2 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
              >
                <X className="size-4.5" aria-hidden />
              </button>
            </div>

            {/* A plain form action, not an onSubmit handler: it submits the
                same way before the JavaScript has loaded, and React keeps the
                pending state for us. */}
            <form action={formAction} noValidate className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6">
                {children(errors)}
              </div>

              <div className="border-t border-line px-6 py-4">
                {result ? (
                  <p
                    role="status"
                    className={`mb-3 flex items-start gap-2 rounded-lg px-3.5 py-3 text-sm ${
                      result.ok
                        ? 'bg-green-50 text-green-800'
                        : 'bg-brand-50 text-brand-700'
                    }`}
                  >
                    {result.ok ? (
                      <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
                    ) : null}
                    {result.message}
                  </p>
                ) : null}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={close}
                    className="h-11 flex-1 rounded-lg border border-line text-sm font-bold transition-colors hover:border-line-strong"
                  >
                    {result?.ok ? 'Fechar' : 'Cancelar'}
                  </button>
                  <SubmitButton label={submitLabel} />
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Separate component because `useFormStatus` reads the form it sits inside. */
function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 flex-[2] items-center justify-center gap-2 rounded-lg bg-brand-700 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Salvando…
        </>
      ) : (
        label
      )}
    </button>
  );
}

/** Label, control and error, wired together for screen readers. */
export function Field({
  name,
  label,
  error,
  hint,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-faint"
      >
        {label}
      </label>
      {children}
      {hint && !error ? <p className="mt-1.5 text-xs text-ink-faint">{hint}</p> : null}
      {error ? (
        <p id={`${name}-erro`} className="mt-1.5 text-xs text-brand-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function inputClass(error?: string): string {
  return `h-11 w-full rounded-lg border bg-surface px-3 text-sm transition-colors ${
    error ? 'border-brand-500' : 'border-line focus:border-brand-500'
  }`;
}

export function Row({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
