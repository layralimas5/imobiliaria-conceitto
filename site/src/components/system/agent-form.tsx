'use client';

import { createAgent } from '@/app/sistema/actions';
import { BRANCHES } from '@/lib/site-config';
import { Field, RecordForm, Row, inputClass } from '@/components/system/record-form';

const ROLES = ['Corretor', 'Corretor sênior', 'Gerente', 'Administrativo'];

export function AgentForm() {
  return (
    <RecordForm
      trigger="Cadastrar corretor"
      title="Novo corretor"
      text="Cadastro e acesso ao sistema. Cada corretor entra com o próprio e-mail e senha."
      action={createAgent}
      submitLabel="Cadastrar corretor"
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
            <Field name="creci" label="CRECI" error={errors.creci}>
              <input
                id="creci"
                name="creci"
                required
                placeholder="41.882"
                className={inputClass(errors.creci)}
              />
            </Field>

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
          </Row>

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

            <Field name="role" label="Perfil" error={errors.role}>
              <select
                id="role"
                name="role"
                defaultValue="Corretor"
                className={inputClass(errors.role)}
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </Field>
          </Row>

          <fieldset className="rounded-card border border-line bg-surface-muted p-5">
            <legend className="px-1.5 text-xs font-medium uppercase tracking-wider text-ink-faint">
              Acesso ao sistema
            </legend>

            <div className="space-y-4">
              <Field
                name="email"
                label="E-mail de acesso"
                error={errors.email}
                hint="É com ele que o corretor entra no sistema."
              >
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="off"
                  placeholder="nome@imobiliariaconceitto.com.br"
                  className={inputClass(errors.email)}
                />
              </Field>

              <Row>
                <Field
                  name="password"
                  label="Senha"
                  error={errors.password}
                  hint="Ao menos 8 caracteres."
                >
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    className={inputClass(errors.password)}
                  />
                </Field>

                <Field
                  name="passwordConfirm"
                  label="Repetir senha"
                  error={errors.passwordConfirm}
                >
                  <input
                    id="passwordConfirm"
                    name="passwordConfirm"
                    type="password"
                    required
                    autoComplete="new-password"
                    className={inputClass(errors.passwordConfirm)}
                  />
                </Field>
              </Row>
            </div>

            {/*
             * Said plainly, because it is true of this build and not of a real
             * one: the demo store keeps the password as typed. A production
             * panel hashes it and can never show it again.
             */}
            <p className="mt-4 text-xs leading-relaxed text-ink-faint">
              Nesta demonstração a senha fica gravada como digitada. Num sistema em
              produção ela é convertida em hash e nunca mais pode ser lida.
            </p>
          </fieldset>
        </>
      )}
    </RecordForm>
  );
}
