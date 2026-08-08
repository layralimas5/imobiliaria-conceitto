'use client';

import { useState } from 'react';
import { createDocument } from '@/app/sistema/actions';
import { DEMO_OPERATOR } from '@/data/demo-system';
import { Field, RecordForm, Row, inputClass } from '@/components/system/record-form';

const KINDS = [
  'matrícula',
  'escritura',
  'contrato',
  'documento pessoal',
  'laudo',
  'outro',
] as const;

type LinkedKind = 'imóvel' | 'contrato' | 'proprietário' | 'cliente' | 'lead';

const LINKED_KINDS: readonly LinkedKind[] = [
  'imóvel',
  'contrato',
  'proprietário',
  'cliente',
  'lead',
];

/**
 * As opções de vínculo, por tipo. Parcial de propósito: uma tela que já trava o
 * tipo não precisa carregar as listas dos outros quatro.
 */
export type DocumentTargets = Partial<Record<LinkedKind, readonly string[]>>;

/** O registro de onde o formulário foi aberto, quando ele já sabe o vínculo. */
export interface FixedTarget {
  readonly kind: LinkedKind;
  readonly label: string;
  readonly id: string;
}

/**
 * Attaching a file.
 *
 * The vínculo is picked in two steps — what kind of thing, then which one —
 * because a flat list mixing imóveis, contratos and people is a list nobody can
 * scan. Choosing the kind first cuts the options to the ones that can be right.
 */
export function DocumentForm({
  targets,
  trigger = 'Anexar documento',
  fixedKind,
  fixedTarget,
  variant = 'primary',
}: {
  targets?: DocumentTargets;
  trigger?: string;
  /** Locks the vínculo, for the button that lives on the Contratos screen. */
  fixedKind?: LinkedKind;
  /**
   * Trava o vínculo inteiro — tipo e registro. É o caso do botão que fica
   * dentro de uma ficha: quem anexa ali já disse a que o arquivo pertence, e
   * perguntar de novo só cria a chance de anexar no lugar errado.
   */
  fixedTarget?: FixedTarget;
  variant?: 'primary' | 'secondary';
}) {
  const [linkedKind, setLinkedKind] = useState<LinkedKind>(
    fixedTarget?.kind ?? fixedKind ?? 'imóvel',
  );
  const options = targets?.[linkedKind] ?? [];

  return (
    <RecordForm
      trigger={trigger}
      title="Anexar documento"
      text="O arquivo fica em pasta privada, fora do site. Só quem tem acesso ao sistema alcança."
      action={createDocument}
      submitLabel="Anexar"
      variant={variant}
    >
      {(errors) => (
        <>
          <Field
            name="file"
            label="Arquivo"
            error={errors.file}
            hint="PDF, imagem ou documento, até 20 MB."
          >
            <input
              id="file"
              name="file"
              type="file"
              required
              className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-surface-muted file:px-3 file:py-1.5 file:text-sm file:font-bold"
            />
          </Field>

          <Field name="kind" label="Tipo do documento" error={errors.kind}>
            <select id="kind" name="kind" defaultValue="matrícula" className={inputClass(errors.kind)}>
              {KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {kind.charAt(0).toUpperCase() + kind.slice(1)}
                </option>
              ))}
            </select>
          </Field>

          {fixedTarget ? (
            <>
              <input type="hidden" name="linkedKind" value={fixedTarget.kind} />
              <input type="hidden" name="linkedTo" value={fixedTarget.label} />
              <input type="hidden" name="linkedId" value={fixedTarget.id} />
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-ink-faint">
                  Vinculado a
                </p>
                <p className="rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm text-ink-soft">
                  {fixedTarget.label}
                  <span className="ml-2 text-xs uppercase tracking-wider text-ink-faint">
                    {fixedTarget.kind}
                  </span>
                </p>
              </div>
            </>
          ) : (
            <Row>
              <Field name="linkedKind" label="Vincular a" error={errors.linkedKind}>
                <select
                  id="linkedKind"
                  name="linkedKind"
                  value={linkedKind}
                  disabled={fixedKind !== undefined}
                  onChange={(event) => setLinkedKind(event.target.value as LinkedKind)}
                  className={`${inputClass(errors.linkedKind)} disabled:bg-surface-muted disabled:text-ink-soft`}
                >
                  {LINKED_KINDS.map((kind) => (
                    <option key={kind} value={kind}>
                      {kind.charAt(0).toUpperCase() + kind.slice(1)}
                    </option>
                  ))}
                </select>
                {fixedKind ? <input type="hidden" name="linkedKind" value={fixedKind} /> : null}
              </Field>

              <Field name="linkedTo" label="Qual" error={errors.linkedTo}>
                <input
                  id="linkedTo"
                  name="linkedTo"
                  required
                  list="vinculos-do-documento"
                  placeholder={options[0] ?? 'Digite para buscar'}
                  className={inputClass(errors.linkedTo)}
                />
                <datalist id="vinculos-do-documento">
                  {options.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </Field>
            </Row>
          )}

          <Field name="uploadedBy" label="Enviado por" error={errors.uploadedBy}>
            <input
              id="uploadedBy"
              name="uploadedBy"
              required
              defaultValue={DEMO_OPERATOR.name}
              className={inputClass(errors.uploadedBy)}
            />
          </Field>
        </>
      )}
    </RecordForm>
  );
}
