'use client';

import { Pencil } from 'lucide-react';
import { updateLead } from '@/app/sistema/actions';
import type { DemoLead } from '@/data/demo-system';
import { Field, RecordForm, Row, inputClass } from '@/components/system/record-form';

const SOURCES = ['Site', 'WhatsApp', 'Portal', 'Indicação', 'Telefone', 'Presencial', 'Meta Ads'];
const BRANCHES = ['Farroupilha', 'Bento Gonçalves'];

/**
 * A ficha, editável.
 *
 * O que chega do site é o mínimo: nome, telefone, e-mail e o imóvel que a
 * pessoa estava vendo. Orçamento de verdade, CPF, o que ela realmente procura e
 * quem vai atender só aparecem depois da primeira conversa — e é aqui que isso
 * entra, na mesma tela onde o corretor está olhando o atendimento.
 */
export function LeadEditForm({ lead, agents }: { lead: DemoLead; agents: readonly string[] }) {
  const agentOptions = agents.includes(lead.agent) ? agents : [lead.agent, ...agents];

  return (
    <RecordForm
      trigger="Editar ficha"
      title="Editar ficha do lead"
      text="Os dados que o corretor levanta na primeira conversa. Fica tudo no histórico do atendimento."
      action={updateLead}
      submitLabel="Salvar ficha"
      variant="secondary"
      icon={<Pencil className="size-4" aria-hidden strokeWidth={1.75} />}
    >
      {(errors) => (
        <>
          <input type="hidden" name="id" value={lead.id} />

          <Field name="name" label="Nome completo" error={errors.name}>
            <input
              id="name"
              name="name"
              required
              defaultValue={lead.name}
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
                defaultValue={lead.phone}
                className={inputClass(errors.phone)}
              />
            </Field>

            <Field name="email" label="E-mail" error={errors.email}>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={lead.email}
                className={inputClass(errors.email)}
              />
            </Field>
          </Row>

          <Row>
            <Field
              name="document"
              label="CPF / CNPJ"
              error={errors.document}
              hint="Necessário na proposta e no contrato."
            >
              <input
                id="document"
                name="document"
                inputMode="numeric"
                defaultValue={lead.document ?? ''}
                className={inputClass(errors.document)}
              />
            </Field>

            <Field name="budget" label="Orçamento (R$)" error={errors.budget} hint="Opcional.">
              <input
                id="budget"
                name="budget"
                inputMode="decimal"
                defaultValue={lead.budget ?? ''}
                className={inputClass(errors.budget)}
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
              defaultValue={lead.interest}
              className={inputClass(errors.interest)}
            />
          </Field>

          <Row>
            <Field name="source" label="Origem" error={errors.source}>
              <select
                id="source"
                name="source"
                defaultValue={lead.source}
                className={inputClass(errors.source)}
              >
                {(SOURCES.includes(lead.source) ? SOURCES : [lead.source, ...SOURCES]).map(
                  (source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ),
                )}
              </select>
            </Field>

            <Field name="branch" label="Unidade" error={errors.branch}>
              <select
                id="branch"
                name="branch"
                defaultValue={lead.branch || BRANCHES[0]}
                className={inputClass(errors.branch)}
              >
                {BRANCHES.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </Field>
          </Row>

          <Field
            name="agent"
            label="Corretor responsável"
            error={errors.agent}
            hint="Trocar o responsável fica registrado no histórico."
          >
            <select
              id="agent"
              name="agent"
              defaultValue={lead.agent}
              className={inputClass(errors.agent)}
            >
              {agentOptions.map((agent) => (
                <option key={agent} value={agent}>
                  {agent}
                </option>
              ))}
            </select>
          </Field>

          <Field
            name="notes"
            label="Observações"
            error={errors.notes}
            hint="Prazos, restrições, o que não cabe no histórico."
          >
            <textarea
              id="notes"
              name="notes"
              rows={4}
              defaultValue={lead.notes ?? ''}
              className={`${inputClass(errors.notes)} h-auto py-2.5`}
            />
          </Field>
        </>
      )}
    </RecordForm>
  );
}
