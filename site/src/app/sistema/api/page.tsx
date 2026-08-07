import { DEMO_INTEGRATIONS } from '@/data/demo-system';
import { Badge, Card, DemoNotice, PageHead, Table, Td } from '@/components/system/ui';

export const metadata = { title: 'API' };

/** The two endpoints the site really exposes today. */
const ENDPOINTS = [
  {
    method: 'POST',
    path: '/api/leads',
    detail: 'Contato enviado por um formulário do site. Encaminha por e-mail e webhook.',
  },
  {
    method: 'POST',
    path: '/api/anuncie',
    detail: 'Imóvel cadastrado por um proprietário, com as fotos em anexo.',
  },
] as const;

export default function ApiPage() {
  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Integrações"
        title="API"
        text="O que entra e o que sai do site, e o estado de cada conexão."
      />

      <Card className="mb-8">
        <h3 className="text-sm font-medium">Endpoints do site</h3>
        <ul className="mt-4 space-y-3">
          {ENDPOINTS.map((endpoint) => (
            <li
              key={endpoint.path}
              className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-line pb-3 last:border-b-0 last:pb-0"
            >
              <Badge tone="brand">{endpoint.method}</Badge>
              <code className="font-mono text-sm">{endpoint.path}</code>
              <span className="w-full text-xs leading-relaxed text-ink-soft sm:w-auto sm:flex-1">
                {endpoint.detail}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Table head={['Integração', 'O que faz', 'Situação', 'Última sincronização']}>
        {DEMO_INTEGRATIONS.map((integration) => (
          <tr key={integration.name}>
            <Td>
              <span className="font-medium">{integration.name}</span>
            </Td>
            <Td muted>{integration.detail}</Td>
            <Td>
              <Badge tone={integration.status === 'ativo' ? 'good' : 'warn'}>
                {integration.status === 'ativo' ? 'Ativo' : 'Pendente'}
              </Badge>
            </Td>
            <Td muted>{integration.lastSync}</Td>
          </tr>
        ))}
      </Table>

      <p className="mt-6 text-xs leading-relaxed text-ink-faint">
        A chave de API e os segredos dos webhooks ficam em variáveis de ambiente, nunca
        nesta tela.
      </p>
    </>
  );
}
