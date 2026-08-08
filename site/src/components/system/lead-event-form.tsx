'use client';

import { MessageSquarePlus } from 'lucide-react';
import { addLeadEvent } from '@/app/sistema/actions';
import { Field, RecordForm, Row, inputClass } from '@/components/system/record-form';

const KINDS = [
  { value: 'contato', label: 'Contato' },
  { value: 'visita', label: 'Visita' },
  { value: 'proposta', label: 'Proposta' },
  { value: 'nota', label: 'Nota' },
] as const;

/**
 * Registrar o que aconteceu no atendimento.
 *
 * É o campo mais barato de preencher e o mais caro de não ter: sem ele, quem
 * pega o lead de férias de outro corretor liga sem saber o que já foi dito.
 */
export function LeadEventForm({
  leadId,
  agent,
  variant = 'secondary',
}: {
  leadId: string;
  agent: string;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <RecordForm
      trigger="Registrar atendimento"
      title="Registrar atendimento"
      text="A ligação que foi feita, a visita, o que ficou combinado."
      action={addLeadEvent}
      submitLabel="Registrar"
      variant={variant}
      icon={<MessageSquarePlus className="size-4" aria-hidden strokeWidth={1.75} />}
    >
      {(errors) => (
        <>
          <input type="hidden" name="id" value={leadId} />

          <Row>
            <Field name="kind" label="Tipo" error={errors.kind}>
              <select
                id="kind"
                name="kind"
                defaultValue="contato"
                className={inputClass(errors.kind)}
              >
                {KINDS.map((kind) => (
                  <option key={kind.value} value={kind.value}>
                    {kind.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field name="by" label="Registrado por" error={errors.by}>
              <input
                id="by"
                name="by"
                required
                defaultValue={agent}
                className={inputClass(errors.by)}
              />
            </Field>
          </Row>

          <Field
            name="detail"
            label="O que aconteceu"
            error={errors.detail}
            hint="Escreva como contaria para um colega que vai atender no seu lugar."
          >
            <textarea
              id="detail"
              name="detail"
              rows={5}
              required
              placeholder="Atendida por WhatsApp. Procura 2 dormitórios com vaga até 480 mil, quer visitar no sábado."
              className={`${inputClass(errors.detail)} h-auto py-2.5`}
            />
          </Field>
        </>
      )}
    </RecordForm>
  );
}
