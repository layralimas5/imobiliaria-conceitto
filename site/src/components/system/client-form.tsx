'use client';

import { useState } from 'react';
import { FileSignature } from 'lucide-react';
import { createClient } from '@/app/sistema/actions';
import { BRANCHES } from '@/lib/site-config';
import { Field, RecordForm, Row, inputClass } from '@/components/system/record-form';

const KINDS = ['comprador', 'locatário', 'investidor', 'proprietário'] as const;

/**
 * Registering a client, with the contract folded in as a second step.
 *
 * The step only opens when the checkbox says a deal closed, because that is the
 * minority case: most clients are cadastrados while they are still looking. When
 * it is checked, the contract is created in the same submit and lands in
 * Contratos already — nobody has to remember to go there and retype the names.
 */
export function ClientForm({
  agents,
  owners,
  listings,
}: {
  agents: readonly string[];
  owners: readonly string[];
  listings: readonly { code: string; label: string }[];
}) {
  const [withContract, setWithContract] = useState(false);

  return (
    <RecordForm
      trigger="Cadastrar cliente"
      title="Novo cliente"
      text="Quem a imobiliária atende, o que procura e com qual corretor. Se o negócio já fechou, o contrato sai junto."
      action={createClient}
      submitLabel={withContract ? 'Cadastrar e gerar contrato' : 'Cadastrar cliente'}
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

            <Field name="email" label="E-mail" error={errors.email}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={inputClass(errors.email)}
              />
            </Field>
          </Row>

          <Row>
            <Field name="document" label="CPF ou CNPJ" error={errors.document}>
              <input
                id="document"
                name="document"
                inputMode="numeric"
                placeholder="000.000.000-00"
                className={inputClass(errors.document)}
              />
            </Field>

            <Field name="kind" label="Perfil" error={errors.kind}>
              <select
                id="kind"
                name="kind"
                defaultValue="comprador"
                className={inputClass(errors.kind)}
              >
                {KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind.charAt(0).toUpperCase() + kind.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
          </Row>

          <Field
            name="looking"
            label="O que procura"
            error={errors.looking}
            hint="Vira o perfil de busca usado no matching."
          >
            <input
              id="looking"
              name="looking"
              placeholder="Apartamento 2 dorm. — Centro, Farroupilha"
              className={inputClass(errors.looking)}
            />
          </Field>

          <Row>
            <Field name="budget" label="Orçamento (R$)" error={errors.budget}>
              <input
                id="budget"
                name="budget"
                inputMode="decimal"
                placeholder="480000"
                className={inputClass(errors.budget)}
              />
            </Field>

            <Field name="agent" label="Corretor responsável" error={errors.agent}>
              <select
                id="agent"
                name="agent"
                defaultValue={agents[0] ?? ''}
                className={inputClass(errors.agent)}
              >
                {agents.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent}
                  </option>
                ))}
              </select>
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

          <label className="flex cursor-pointer items-start gap-2.5 rounded-card border border-line bg-surface-muted/60 p-4 text-sm">
            <input
              type="checkbox"
              name="withContract"
              checked={withContract}
              onChange={(event) => setWithContract(event.target.checked)}
              className="mt-0.5 size-4 rounded border-line-strong text-brand-600 focus:ring-brand-500"
            />
            <span>
              <span className="block font-bold">O negócio já fechou</span>
              <span className="mt-0.5 block text-xs text-ink-soft">
                Abre o contrato junto com o cadastro, já em Contratos, aguardando assinatura.
              </span>
            </span>
          </label>

          {withContract ? (
            <fieldset className="rounded-card border border-brand-100 bg-brand-50/40 p-5">
              <legend className="flex items-center gap-1.5 px-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
                <FileSignature className="size-3.5" aria-hidden strokeWidth={2} />
                Contrato
              </legend>

              <div className="space-y-4">
                <Row>
                  <Field name="contractKind" label="Tipo" error={errors.contractKind}>
                    <select
                      id="contractKind"
                      name="contractKind"
                      defaultValue="venda"
                      className={inputClass(errors.contractKind)}
                    >
                      <option value="venda">Venda</option>
                      <option value="locacao">Locação</option>
                    </select>
                  </Field>

                  <Field name="contractValue" label="Valor (R$)" error={errors.contractValue}>
                    <input
                      id="contractValue"
                      name="contractValue"
                      inputMode="decimal"
                      placeholder="305000"
                      className={inputClass(errors.contractValue)}
                    />
                  </Field>
                </Row>

                <Field name="contractListing" label="Imóvel" error={errors.contractListing}>
                  <input
                    id="contractListing"
                    name="contractListing"
                    list="imoveis-contrato"
                    placeholder="32569 — Terreno, Monte Belo do Sul"
                    className={inputClass(errors.contractListing)}
                  />
                  <datalist id="imoveis-contrato">
                    {listings.map((listing) => (
                      <option key={listing.code} value={listing.label} />
                    ))}
                  </datalist>
                </Field>

                <Row>
                  <Field name="contractOwner" label="Proprietário" error={errors.contractOwner}>
                    <select
                      id="contractOwner"
                      name="contractOwner"
                      defaultValue=""
                      className={inputClass(errors.contractOwner)}
                    >
                      <option value="">Não informado</option>
                      {owners.map((owner) => (
                        <option key={owner} value={owner}>
                          {owner}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    name="contractRate"
                    label="Comissão (%)"
                    error={errors.contractRate}
                    hint="6% em venda, 100% do 1º aluguel."
                  >
                    <input
                      id="contractRate"
                      name="contractRate"
                      inputMode="decimal"
                      placeholder="6"
                      className={inputClass(errors.contractRate)}
                    />
                  </Field>
                </Row>

                <Row>
                  <Field name="contractSignedAt" label="Assinatura" error={errors.contractSignedAt}>
                    <input
                      id="contractSignedAt"
                      name="contractSignedAt"
                      placeholder="dd/mm/aaaa"
                      className={inputClass(errors.contractSignedAt)}
                    />
                  </Field>

                  <Field
                    name="contractUntil"
                    label="Vigência até"
                    error={errors.contractUntil}
                    hint="Vazio em venda."
                  >
                    <input
                      id="contractUntil"
                      name="contractUntil"
                      placeholder="dd/mm/aaaa"
                      className={inputClass(errors.contractUntil)}
                    />
                  </Field>
                </Row>
              </div>
            </fieldset>
          ) : (
            <>
              {/* The contract fields still have to reach the action, because the
                  schema validates the whole shape either way. */}
              <input type="hidden" name="contractKind" value="venda" />
              <input type="hidden" name="contractListing" value="" />
              <input type="hidden" name="contractOwner" value="" />
              <input type="hidden" name="contractValue" value="" />
              <input type="hidden" name="contractRate" value="" />
              <input type="hidden" name="contractSignedAt" value="" />
              <input type="hidden" name="contractUntil" value="" />
            </>
          )}
        </>
      )}
    </RecordForm>
  );
}
