import { DEMO_AGENTS, DEMO_OPERATOR } from '@/data/demo-system';
import { Badge, Card, DemoNotice, PageHead, Stat, StatRow } from '@/components/system/ui';

export const metadata = { title: 'Minha conta' };

export default function ContaPage() {
  const me = DEMO_AGENTS[0];

  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Perfil"
        title="Minha conta"
        text="Seus dados de acesso e o que está sob sua responsabilidade hoje."
      />

      <StatRow columns={3} className="mb-8">
        <Stat label="Imóveis na carteira" value={String(me.activeListings)} />
        <Stat label="Leads em aberto" value={String(me.openLeads)} />
        <Stat label="Fechados no mês" value={String(me.closedThisMonth)} />
      </StatRow>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-4">
            <span
              aria-hidden
              className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-700 text-lg font-bold text-white"
            >
              {DEMO_OPERATOR.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="text-lg font-bold">{DEMO_OPERATOR.name}</p>
              <p className="mt-0.5 text-sm text-ink-soft">{DEMO_OPERATOR.role}</p>
            </div>
          </div>

          <dl className="mt-6 space-y-3 text-sm">
            <Row term="CRECI" detail={me.creci} />
            <Row term="Unidade" detail={me.branch} />
            <Row term="E-mail de acesso" detail="debora@imobiliariaconceitto.com.br" />
            <Row term="WhatsApp" detail="(54) 99145-2210" />
          </dl>
        </Card>

        <Card>
          <h3 className="text-sm font-bold">Segurança</h3>
          <p className="mt-1 text-xs leading-relaxed text-ink-faint">
            A troca de senha e a verificação em duas etapas entram junto com a
            autenticação de verdade.
          </p>
          <dl className="mt-6 space-y-3 text-sm">
            <Row term="Senha" detail="Alterada há 3 meses" />
            <Row term="Verificação em duas etapas" detail="Não configurada" />
            <Row term="Último acesso" detail="Hoje, 08:04 — Farroupilha" />
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge tone="warn">Sem autenticação nesta demonstração</Badge>
          </div>
        </Card>
      </div>
    </>
  );
}

function Row({ term, detail }: { term: string; detail: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-line pb-3 last:border-b-0 last:pb-0">
      <dt className="text-ink-faint">{term}</dt>
      <dd className="text-right font-bold">{detail}</dd>
    </div>
  );
}
