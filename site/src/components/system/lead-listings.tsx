'use client';

import { useState, useTransition } from 'react';
import { Home, Loader2, X } from 'lucide-react';
import { attachListingToLead, detachListingFromLead } from '@/app/sistema/actions';
import { Field, RecordForm, inputClass } from '@/components/system/record-form';

/**
 * Vincular um imóvel ao lead.
 *
 * O que veio do site já entra vinculado; o que o corretor mostrou depois só
 * existe na cabeça dele até alguém digitar aqui. É essa lista que responde, seis
 * meses depois, por que o cliente escolheu o imóvel que escolheu.
 */
export function LeadListingForm({
  leadId,
  agent,
  options,
}: {
  leadId: string;
  agent: string;
  /** Rótulos "código — título, bairro"; a ação extrai o código. */
  options: readonly string[];
}) {
  return (
    <RecordForm
      trigger="Vincular imóvel"
      title="Vincular imóvel ao lead"
      text="Os imóveis que a pessoa viu, visitou ou que o corretor apresentou."
      action={attachListingToLead}
      submitLabel="Vincular"
      variant="secondary"
      icon={<Home className="size-4" aria-hidden strokeWidth={1.75} />}
    >
      {(errors) => (
        <>
          <input type="hidden" name="id" value={leadId} />
          <input type="hidden" name="by" value={agent} />

          <Field
            name="code"
            label="Imóvel"
            error={errors.code}
            hint="Digite o código ou parte do endereço para buscar."
          >
            <input
              id="code"
              name="code"
              required
              list="imoveis-do-lead"
              placeholder={options[0] ?? '33066'}
              className={inputClass(errors.code)}
            />
            <datalist id="imoveis-do-lead">
              {options.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </Field>
        </>
      )}
    </RecordForm>
  );
}

/** Desfaz o vínculo. Fica na linha do imóvel, que é onde o erro é percebido. */
export function DetachListingButton({ leadId, code }: { leadId: string; code: string }) {
  const [note, setNote] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        disabled={isPending}
        aria-label={`Desvincular imóvel ${code}`}
        onClick={() => {
          setNote(null);
          startTransition(async () => {
            const result = await detachListingFromLead(leadId, code);
            if (!result.ok) setNote(result.message);
          });
        }}
        className="inline-flex size-8 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <X className="size-4" aria-hidden />
        )}
      </button>
      {note ? (
        <span role="status" className="block text-xs text-ink-faint">
          {note}
        </span>
      ) : null}
    </>
  );
}
