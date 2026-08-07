'use client';

import { createContract } from '@/app/sistema/actions';
import { BRANCHES } from '@/lib/site-config';
import { Field, RecordForm, Row, inputClass } from '@/components/system/record-form';

const STATUSES = ['em assinatura', 'vigente', 'encerrado'] as const;

export function ContractForm({
  clients,
  owners,
  listings,
}: {
  clients: readonly string[];
  owners: readonly string[];
  listings: readonly { code: string; label: string }[];
}) {
  return (
    <RecordForm
      trigger="Novo contrato"
      title="Novo contrato"
      text="Venda ou locação, com as partes, o valor e a vigência. Os documentos são anexados depois, pelo próprio contrato."
      action={createContract}
      submitLabel="Registrar contrato"
    >
      {(errors) => (
        <>
          <Row>
            <Field name="kind" label="Tipo" error={errors.kind}>
              <select
                id="kind"
                name="kind"
                defaultValue="venda"
                className={inputClass(errors.kind)}
              >
                <option value="venda">Venda</option>
                <option value="locacao">Locação</option>
              </select>
            </Field>

            <Field name="status" label="Situação" error={errors.status}>
              <select
                id="status"
                name="status"
                defaultValue="em assinatura"
                className={inputClass(errors.status)}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
          </Row>

          <Field name="listing" label="Imóvel" error={errors.listing}>
            <input
              id="listing"
              name="listing"
              required
              list="imoveis-do-contrato"
              placeholder="33837 — Apartamento, São Francisco"
              className={inputClass(errors.listing)}
            />
            <datalist id="imoveis-do-contrato">
              {listings.map((listing) => (
                <option key={listing.code} value={listing.label} />
              ))}
            </datalist>
          </Field>

          <Row>
            <Field name="client" label="Cliente" error={errors.client}>
              <input
                id="client"
                name="client"
                required
                list="clientes-do-contrato"
                className={inputClass(errors.client)}
              />
              <datalist id="clientes-do-contrato">
                {clients.map((client) => (
                  <option key={client} value={client} />
                ))}
              </datalist>
            </Field>

            <Field name="owner" label="Proprietário" error={errors.owner}>
              <select id="owner" name="owner" defaultValue="" className={inputClass(errors.owner)}>
                <option value="">Não informado</option>
                {owners.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner}
                  </option>
                ))}
              </select>
            </Field>
          </Row>

          <Row>
            <Field
              name="value"
              label="Valor (R$)"
              error={errors.value}
              hint="Em locação, o aluguel mensal."
            >
              <input
                id="value"
                name="value"
                inputMode="decimal"
                placeholder="305000"
                className={inputClass(errors.value)}
              />
            </Field>

            <Field
              name="commissionRate"
              label="Comissão (%)"
              error={errors.commissionRate}
              hint="6% em venda, 100% do 1º aluguel."
            >
              <input
                id="commissionRate"
                name="commissionRate"
                inputMode="decimal"
                placeholder="6"
                className={inputClass(errors.commissionRate)}
              />
            </Field>
          </Row>

          <Row>
            <Field name="signedAt" label="Assinatura" error={errors.signedAt}>
              <input
                id="signedAt"
                name="signedAt"
                placeholder="dd/mm/aaaa"
                className={inputClass(errors.signedAt)}
              />
            </Field>

            <Field
              name="until"
              label="Vigência até"
              error={errors.until}
              hint="Deixe vazio em venda."
            >
              <input
                id="until"
                name="until"
                placeholder="dd/mm/aaaa"
                className={inputClass(errors.until)}
              />
            </Field>
          </Row>

          <Field name="branch" label="Unidade" error={errors.branch}>
            <select
              id="branch"
              name="branch"
              defaultValue={BRANCHES[0].city}
              className={inputClass(errors.branch)}
            >
              {BRANCHES.map((branch) => (
                <option key={branch.id} value={branch.city}>
                  {branch.label}
                </option>
              ))}
            </select>
          </Field>

          <Field name="notes" label="Observações" error={errors.notes}>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className={`${inputClass(errors.notes)} h-auto py-2.5`}
            />
          </Field>
        </>
      )}
    </RecordForm>
  );
}
