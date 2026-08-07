'use client';

import { createUser } from '@/app/sistema/actions';
import { USER_ROLES } from '@/data/demo-system';
import { BRANCHES } from '@/lib/site-config';
import { Field, RecordForm, Row, inputClass } from '@/components/system/record-form';

/** Creating access to the panel: the one place a password is set. */
export function UserForm() {
  return (
    <RecordForm
      trigger="Criar usuário"
      title="Novo usuário"
      text="Acesso ao sistema. A pessoa entra com o e-mail e a senha definidos aqui."
      action={createUser}
      submitLabel="Criar usuário"
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

          <Field
            name="email"
            label="E-mail de acesso"
            error={errors.email}
            hint="É com ele que a pessoa entra no sistema."
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
              name="role"
              label="Perfil"
              error={errors.role}
              hint="Define o que a pessoa enxerga no sistema."
            >
              <select
                id="role"
                name="role"
                defaultValue="Corretor"
                className={inputClass(errors.role)}
              >
                {USER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
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

          <fieldset className="rounded-card border border-line bg-surface-muted p-5">
            <legend className="px-1.5 text-xs font-bold uppercase tracking-wider text-ink-faint">
              Senha
            </legend>

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

              <Field name="passwordConfirm" label="Repetir senha" error={errors.passwordConfirm}>
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
