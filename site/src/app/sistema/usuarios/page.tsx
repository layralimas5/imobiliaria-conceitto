import { currentScope } from '@/lib/branch-cookie';
import { scopedUsers } from '@/data/scoped';
import { Check, Minus } from 'lucide-react';

import {
  ROLES,
  ROLE_SUMMARIES,
  SECTIONS,
  canAccess,
  type Section,
} from '@/domain/permissions';
import { readStore } from '@/lib/system-store';
import { UserForm } from '@/components/system/user-form';
import { Badge, DemoNotice, PageHead, Stat, StatRow, Table, Td } from '@/components/system/ui';

// Reflects what the panel just created, so it is never cached.
export const dynamic = 'force-dynamic';

export const metadata = { title: 'Usuários' };

const ROLE_TONE: Record<string, 'neutral' | 'brand' | 'good' | 'warn'> = {
  Administrador: 'brand',
  Gerente: 'warn',
  Corretor: 'neutral',
  Administrativo: 'neutral',
};

/**
 * The only screen that creates a password. Corretores lists the team; this
 * lists who can open the panel, and the two are deliberately not the same
 * cadastro — an assistant who never sells still needs to sign in, and a corretor
 * who leaves should lose the login without disappearing from the histórico.
 */
export default async function UsuariosPage() {
  const scope = await currentScope();
  const demoUsers = scopedUsers(scope);
  const store = readStore();

  const users = [
    ...store.users.map((user) => ({
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      lastAccess: 'Nunca acessou',
      isActive: true,
    })),
    ...demoUsers.map((user) => ({ ...user })),
  ];

  const active = users.filter((user) => user.isActive).length;
  const admins = users.filter((user) => user.role === 'Administrador').length;

  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Acesso"
        title="Usuários"
        text="Quem entra no sistema, com qual perfil e em que unidade. É aqui que o e-mail e a senha de acesso são criados."
        action={<UserForm />}
      />

      <StatRow columns={3} className="mb-8">
        <Stat label="Usuários ativos" value={String(active)} hint={`${users.length} cadastrados`} />
        <Stat label="Administradores" value={String(admins)} hint="Acesso total ao sistema" />
        <Stat
          label="Perfis"
          value={String(ROLES.length)}
          hint="Cada um enxerga um recorte do sistema"
        />
      </StatRow>

      <Table head={['Usuário', 'E-mail de acesso', 'Perfil', 'Unidade', 'Último acesso', 'Situação']}>
        {users.map((user) => (
          <tr key={user.email}>
            <Td>
              <span className="font-bold">{user.name}</span>
            </Td>
            <Td muted>{user.email}</Td>
            <Td>
              <Badge tone={ROLE_TONE[user.role] ?? 'neutral'}>{user.role}</Badge>
            </Td>
            <Td muted>{user.branch}</Td>
            <Td muted>{user.lastAccess}</Td>
            <Td>
              <Badge tone={user.isActive ? 'good' : 'neutral'}>
                {user.isActive ? 'Ativo' : 'Bloqueado'}
              </Badge>
            </Td>
          </tr>
        ))}
      </Table>

      <h3 className="mb-1 mt-10 text-sm font-bold">Permissões por perfil</h3>
      <p className="mb-4 text-xs text-ink-faint">
        O que cada perfil enxerga no menu. É a mesma tabela que o sistema usa para montar o
        sidebar de quem está logado.
      </p>

      <div className="pulse-on-hover overflow-x-auto rounded-card border border-line bg-surface hover:border-line-strong">
        <table className="w-full min-w-[52rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-muted text-left">
              <th scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink-faint">
                Seção
              </th>
              {ROLES.map((role) => (
                <th
                  key={role}
                  scope="col"
                  className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink-faint"
                >
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {SECTIONS.map((section) => (
              <tr key={section}>
                <th scope="row" className="px-4 py-2.5 text-left font-bold">
                  {SECTION_LABELS[section]}
                </th>
                {ROLES.map((role) => (
                  <td key={role} className="px-4 py-2.5">
                    {canAccess(role, section) ? (
                      <Check className="size-4 text-green-800" aria-label="Tem acesso" />
                    ) : (
                      <Minus className="size-4 text-ink-faint" aria-label="Sem acesso" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ROLES.map((role) => (
          <div key={role} className="rounded-lg border border-line bg-surface px-4 py-3">
            <dt className="text-sm font-bold">{role}</dt>
            <dd className="mt-1 text-xs leading-relaxed text-ink-soft">{ROLE_SUMMARIES[role]}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 rounded-lg border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-ink-soft">
        <strong className="font-bold text-ink">Nesta demonstração</strong> o sistema abre como
        Administrador, para que todas as telas fiquem visíveis. Trocar o perfil do usuário logado
        recorta o menu na hora — esconder o link é a metade visível; num sistema em produção a
        mesma tabela também barra a requisição no servidor.
      </p>
    </>
  );
}

const SECTION_LABELS: Record<Section, string> = {
  painel: 'Dashboard',
  imoveis: 'Imóveis',
  busca: 'Busca e matching',
  leads: 'Leads',
  crm: 'CRM',
  clientes: 'Clientes',
  proprietarios: 'Proprietários',
  corretores: 'Corretores',
  agenda: 'Agenda',
  propostas: 'Propostas',
  contratos: 'Contratos',
  documentos: 'Documentos',
  financeiro: 'Financeiro',
  comissoes: 'Comissões',
  relatorios: 'Relatórios',
  usuarios: 'Usuários',
  configuracoes: 'Configurações',
};
