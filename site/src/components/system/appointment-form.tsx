'use client';

import { CalendarPlus } from 'lucide-react';
import { createAppointment } from '@/app/sistema/actions';
import { APPOINTMENT_KINDS, APPOINTMENT_STATUSES, todayIso } from '@/domain/appointment';
import { Field, RecordForm, Row, inputClass } from '@/components/system/record-form';

const PLACES = [
  'Matriz Farroupilha',
  'Filial Bento Gonçalves',
  'No imóvel',
  'Cartório',
  'Videochamada',
];

interface AppointmentFormProps {
  readonly agents: readonly string[];
  /** Amarra o compromisso a um lead: marcar da ficha já define a próxima ação dele. */
  readonly leadId?: string;
  readonly withWhom?: string;
  readonly defaultAgent?: string;
  readonly defaultTitle?: string;
  readonly trigger?: string;
  readonly variant?: 'primary' | 'secondary';
}

/**
 * Marcar visita, reunião, avaliação ou assinatura.
 *
 * Aberto da ficha do lead, o formulário já sabe com quem é e quem atende — o
 * corretor só escolhe dia, hora e onde. Um formulário que pergunta de novo o
 * que a tela já mostra é um formulário que ninguém preenche.
 */
export function AppointmentForm({
  agents,
  leadId,
  withWhom,
  defaultAgent,
  defaultTitle,
  trigger = 'Marcar compromisso',
  variant = 'primary',
}: AppointmentFormProps) {
  return (
    <RecordForm
      trigger={trigger}
      title="Marcar compromisso"
      text={
        leadId
          ? 'Entra na agenda da equipe e vira a próxima ação desse lead.'
          : 'Visitas, reuniões, avaliações e assinaturas da equipe.'
      }
      action={createAppointment}
      submitLabel="Marcar"
      variant={variant}
      icon={<CalendarPlus className="size-4" aria-hidden strokeWidth={1.75} />}
    >
      {(errors) => (
        <>
          {leadId ? <input type="hidden" name="leadId" value={leadId} /> : null}

          <Field
            name="title"
            label="Compromisso"
            error={errors.title}
            hint="O que vai acontecer, em uma linha."
          >
            <input
              id="title"
              name="title"
              required
              defaultValue={defaultTitle}
              placeholder="Visita — apartamento 33066, Centro"
              className={inputClass(errors.title)}
            />
          </Field>

          <Row>
            <Field name="date" label="Data" error={errors.date}>
              <input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={todayIso()}
                className={inputClass(errors.date)}
              />
            </Field>

            <Field name="time" label="Horário" error={errors.time}>
              <input
                id="time"
                name="time"
                type="time"
                required
                defaultValue="10:00"
                className={inputClass(errors.time)}
              />
            </Field>
          </Row>

          <Row>
            <Field name="kind" label="Tipo" error={errors.kind}>
              <select id="kind" name="kind" defaultValue="visita" className={inputClass(errors.kind)}>
                {APPOINTMENT_KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind.charAt(0).toUpperCase() + kind.slice(1)}
                  </option>
                ))}
              </select>
            </Field>

            <Field name="status" label="Situação" error={errors.status}>
              <select
                id="status"
                name="status"
                defaultValue="a confirmar"
                className={inputClass(errors.status)}
              >
                {APPOINTMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
          </Row>

          <Row>
            <Field name="agent" label="Corretor" error={errors.agent}>
              <select
                id="agent"
                name="agent"
                defaultValue={defaultAgent ?? agents[0]}
                className={inputClass(errors.agent)}
              >
                {agents.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent}
                  </option>
                ))}
              </select>
            </Field>

            <Field name="withWhom" label="Com quem" error={errors.withWhom}>
              <input
                id="withWhom"
                name="withWhom"
                required
                defaultValue={withWhom}
                readOnly={withWhom !== undefined}
                className={`${inputClass(errors.withWhom)} read-only:bg-surface-muted read-only:text-ink-soft`}
              />
            </Field>
          </Row>

          <Field name="where" label="Onde" error={errors.where}>
            <input
              id="where"
              name="where"
              required
              list="locais-do-compromisso"
              defaultValue={PLACES[0]}
              className={inputClass(errors.where)}
            />
            <datalist id="locais-do-compromisso">
              {PLACES.map((place) => (
                <option key={place} value={place} />
              ))}
            </datalist>
          </Field>
        </>
      )}
    </RecordForm>
  );
}
