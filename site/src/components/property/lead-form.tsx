'use client';

import { cloneElement, useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, Loader2 } from 'lucide-react';
import {
  CONTACT_TIMES,
  CONTACT_TIME_LABELS,
  LEAD_INTENTS,
  LEAD_INTENT_LABELS,
  LEAD_OBJECTIVES,
  LEAD_OBJECTIVE_LABELS,
  leadSchema,
} from '@/domain/lead';

interface LeadFormProps {
  propertyCode?: string;
  /** Set on launch pages so the broker knows which development the lead came from. */
  developmentSlug?: string;
  className?: string;
  defaultIntent?: (typeof LEAD_INTENTS)[number];
  /**
   * `launch` is the wider form the lançamentos page runs: fields pair up two
   * per row, and it swaps the free-text message for the two questions a broker
   * actually needs before calling — when to call, and whether this is a home or
   * an investment.
   */
  variant?: 'default' | 'launch';
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function LeadForm({
  propertyCode,
  developmentSlug,
  className = '',
  defaultIntent = 'visita',
  variant = 'default',
}: LeadFormProps) {
  const isLaunch = variant === 'launch';
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);

  // The form is replaced by the confirmation, so keyboard focus would otherwise
  // fall back to the top of the document with no announcement of what happened.
  useEffect(() => {
    if (status === 'success') confirmationRef.current?.focus();
  }, [status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const candidate = {
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      phone: String(form.get('phone') ?? ''),
      intent: String(form.get('intent') ?? defaultIntent),
      contactTime: form.get('contactTime')
        ? String(form.get('contactTime'))
        : undefined,
      objective: form.get('objective') ? String(form.get('objective')) : undefined,
      message: String(form.get('message') ?? ''),
      website: String(form.get('website') ?? ''),
      propertyCode,
      developmentSlug,
    };

    const parsed = leadSchema.safeParse(candidate);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.');
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      setStatus('error');
      // Land the user on the first thing they have to fix, not at the top.
      const firstField = Object.keys(fieldErrors)[0];
      if (firstField) {
        formElement.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus();
      }
      return;
    }

    setErrors({});
    setStatus('submitting');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setStatus('success');
    } catch {
      setStatus('error');
      setFormError('Não conseguimos enviar agora. Tente pelo WhatsApp ou telefone.');
    }
  }

  if (status === 'success') {
    return (
      <div
        ref={confirmationRef}
        role="status"
        tabIndex={-1}
        className={`rounded-lg border border-brand-100 bg-brand-50 p-5 text-center ${className}`}
      >
        <Check className="mx-auto size-6 text-brand-600" aria-hidden />
        <p className="mt-3 text-sm font-medium">Recebemos seu contato</p>
        <p className="mt-1 text-sm text-ink-soft">
          Um corretor responde em horário comercial.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={`space-y-3.5 ${className}`}>
      <Field id="lead-name" label="Nome" error={errors.name}>
        <input
          id="lead-name"
          name="name"
          autoComplete="name"
          required
          className={inputClass(errors.name)}
        />
      </Field>

      <div className={isLaunch ? 'grid gap-3.5 sm:grid-cols-2' : 'space-y-3.5'}>
        <Field id="lead-email" label="E-mail" error={errors.email}>
          <input
            id="lead-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass(errors.email)}
          />
        </Field>

        <Field id="lead-phone" label="WhatsApp" error={errors.phone}>
          <input
            id="lead-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(54) 99999-9999"
            required
            className={inputClass(errors.phone)}
          />
        </Field>
      </div>

      {isLaunch ? (
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field id="lead-time" label="Horário para contato" error={errors.contactTime}>
            <select
              id="lead-time"
              name="contactTime"
              defaultValue="qualquer"
              className={inputClass(errors.contactTime)}
            >
              {CONTACT_TIMES.map((time) => (
                <option key={time} value={time}>
                  {CONTACT_TIME_LABELS[time]}
                </option>
              ))}
            </select>
          </Field>

          <Field id="lead-objective" label="Objetivo" error={errors.objective}>
            <select
              id="lead-objective"
              name="objective"
              defaultValue="moradia"
              className={inputClass(errors.objective)}
            >
              {LEAD_OBJECTIVES.map((objective) => (
                <option key={objective} value={objective}>
                  {LEAD_OBJECTIVE_LABELS[objective]}
                </option>
              ))}
            </select>
          </Field>
        </div>
      ) : (
        <>
          <Field id="lead-intent" label="Assunto" error={errors.intent}>
            <select
              id="lead-intent"
              name="intent"
              defaultValue={defaultIntent}
              className={inputClass(errors.intent)}
            >
              {LEAD_INTENTS.map((intent) => (
                <option key={intent} value={intent}>
                  {LEAD_INTENT_LABELS[intent]}
                </option>
              ))}
            </select>
          </Field>

          <Field id="lead-message" label="Mensagem (opcional)" error={errors.message}>
            <textarea
              id="lead-message"
              name="message"
              rows={3}
              className={`${inputClass(errors.message)} h-auto py-2.5`}
            />
          </Field>
        </>
      )}

      {/* The launch form drops the "Assunto" picker; the page it lives on
          already says what the lead is about. */}
      {isLaunch ? <input type="hidden" name="intent" value={defaultIntent} /> : null}

      {/* Honeypot */}
      <div aria-hidden className="absolute left-[-9999px]">
        <label htmlFor="lead-website">Não preencha</label>
        <input id="lead-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {formError ? (
        <p role="alert" className="text-sm text-red-700">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-700 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Enviando…
          </>
        ) : (
          'Enviar'
        )}
      </button>

      <p className="text-xs leading-relaxed text-ink-faint">
        Ao enviar, você concorda em ser contatado pela Conceitto sobre este imóvel.
      </p>
    </form>
  );
}

function inputClass(error: string | undefined): string {
  return `h-11 w-full rounded-lg border bg-surface px-3 text-sm transition-colors ${
    error ? 'border-red-500' : 'border-line focus:border-brand-500'
  }`;
}

/**
 * Wires the error message to the control it belongs to, so a screen reader
 * announces *what* is wrong on the field it lands on, not just that something is.
 */
function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error: string | undefined;
  children: React.ReactElement<{ 'aria-invalid'?: boolean; 'aria-describedby'?: string }>;
}) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-ink-soft">
        {label}
      </label>
      {cloneElement(children, {
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : undefined,
      })}
      {error ? (
        <p id={errorId} className="mt-1 text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
