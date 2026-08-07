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
      text="Cadastro da pessoa na equipe. O acesso ao sistema é criado em Usuários."
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

          <Field
            name="email"
            label="E-mail"
            error={errors.email}
            hint="Contato do corretor. O login do sistema é criado em Usuários."
          >
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="nome@imobiliariaconceitto.com.br"
              className={inputClass(errors.email)}
            />
          </Field>
        </>
      )}
    </RecordForm>
  );
}
