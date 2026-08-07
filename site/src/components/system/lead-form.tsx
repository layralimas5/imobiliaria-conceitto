'use client';

import { createLead } from '@/app/sistema/actions';
import { LEAD_STAGE_LABELS } from '@/data/demo-system';
import { Field, RecordForm, Row, inputClass } from '@/components/system/record-form';

const SOURCES = ['Site', 'WhatsApp', 'Portal', 'Indicação', 'Telefone', 'Presencial'];

export function LeadForm({ agents }: { agents: readonly string[] }) {
  return (
    <RecordForm
      trigger="Cadastrar lead"
      title="Novo lead"
      text="A ficha que o corretor recebe: quem é, o que procura e por onde chegou."
      action={createLead}
      submitLabel="Cadastrar lead"
    >
      {(errors) => (
        <>
          <Field name="name" label="Nome completo" error={errors.name}>
            <input
              id="name"
              name="name"
              required
              autoComplete="name"
              className={inputClass(errors.name)}
            />
          </Field>

          <Row>
            <Field name="phone" label="WhatsApp" error={errors.phone}>
              <input
                id="phone"
                name="phone"
                required
                inputMode="tel"
                placeholder="(54) 99999-9999"
                className={inputClass(errors.phone)}
              />
            </Field>

            <Field name="email" label="E-mail" error={errors.email} hint="Opcional.">
              <input
                id="email"
                name="email"
                type="email"
                className={inputClass(errors.email)}
              />
            </Field>
          </Row>

          <Field
            name="interest"
            label="Interesse"
            error={errors.interest}
            hint="O que a pessoa procura, na linguagem dela."
          >
            <input
              id="interest"
              name="interest"
              required
              placeholder="Apartamento 2 dorm. com vaga — Centro, Farroupilha"
              className={inputClass(errors.interest)}
            />
          </Field>

          <Row>
            <Field name="source" label="Origem" error={errors.source}>
              <select
                id="source"
                name="source"
                defaultValue="Site"
                className={inputClass(errors.source)}
              >
                {SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </Field>

            <Field name="stage" label="Etapa" error={errors.stage}>
              <select
                id="stage"
                name="stage"
                defaultValue="novo"
                className={inputClass(errors.stage)}
              >
                {Object.entries(LEAD_STAGE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </Row>

          <Row>
            <Field name="agent" label="Corretor responsável" error={errors.agent}>
              <select
                id="agent"
                name="agent"
                defaultValue={agents[0]}
                className={inputClass(errors.agent)}
              >
                {agents.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              name="budget"
              label="Orçamento (R$)"
              error={errors.budget}
              hint="Opcional."
            >
              <input
                id="budget"
                name="budget"
                inputMode="decimal"
                placeholder="450000"
                className={inputClass(errors.budget)}
              />
            </Field>
          </Row>

          <Field
            name="notes"
            label="Observações"
            error={errors.notes}
            hint="O que foi conversado, prazos, restrições."
          >
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className={`${inputClass(errors.notes)} h-auto py-2.5`}
            />
          </Field>
        </>
      )}
    </RecordForm>
  );
}
