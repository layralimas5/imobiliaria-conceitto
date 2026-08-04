'use client';

import { useState, type FormEvent } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { LEAD_INTENTS, LEAD_INTENT_LABELS, leadSchema } from '@/domain/lead';

interface LeadFormProps {
  propertyCode?: string;
  className?: string;
  defaultIntent?: (typeof LEAD_INTENTS)[number];
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function LeadForm({
  propertyCode,
  className = '',
  defaultIntent = 'visita',
}: LeadFormProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const form = new FormData(event.currentTarget);
    const candidate = {
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      phone: String(form.get('phone') ?? ''),
      intent: String(form.get('intent') ?? defaultIntent),
      message: String(form.get('message') ?? ''),
      website: String(form.get('website') ?? ''),
      propertyCode,
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
        role="status"
        className={`rounded-lg border border-forest-100 bg-forest-50 p-5 text-center ${className}`}
      >
        <Check className="mx-auto size-6 text-forest-600" aria-hidden />
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
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-forest-700 text-sm font-medium text-white transition-colors hover:bg-forest-600 disabled:opacity-60"
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
    error ? 'border-red-500' : 'border-line focus:border-forest-500'
  }`;
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-ink-soft">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
