import { BRANCHES, SITE } from '@/lib/site-config';
import { Badge, Card, DemoNotice, PageHead } from '@/components/system/ui';

export const metadata = { title: 'Configurações' };

export default function ConfiguracoesPage() {
  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Conta"
        title="Configurações"
        text="Dados da imobiliária, unidades e para onde vão os contatos recebidos pelo site."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-medium">Imobiliária</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <Row term="Razão social" detail={SITE.legalName} />
            <Row term="Nome fantasia" detail={SITE.name} />
            <Row term="CNPJ" detail={SITE.cnpj} />
            <Row term="CRECI" detail={SITE.creci} />
            <Row term="Site" detail={SITE.url.replace('https://', '')} />
          </dl>
        </Card>

        <Card>
          <h3 className="text-sm font-medium">Recebimento de contatos</h3>
          <p className="mt-1 text-xs leading-relaxed text-ink-faint">
            Cada formulário do site é encaminhado para a unidade responsável pela cidade
            do imóvel.
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <Row term="E-mail principal" detail={BRANCHES[0].email} />
            <Row term="Cópia para" detail="Corretor responsável pelo imóvel" />
            <Row term="Webhook" detail="Ativo" />
          </dl>
        </Card>

        {BRANCHES.map((branch) => (
          <Card key={branch.id}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-medium">{branch.city}</h3>
              <Badge tone={branch.id === 'farroupilha' ? 'brand' : 'neutral'}>
                {branch.name}
              </Badge>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <Row term="Endereço" detail={`${branch.street} — ${branch.district}`} />
              <Row term="Telefone" detail={branch.phone} />
              <Row term="WhatsApp vendas" detail={formatWhatsapp(branch.whatsapp.venda)} />
              <Row term="WhatsApp locação" detail={formatWhatsapp(branch.whatsapp.locacao)} />
            </dl>
          </Card>
        ))}
      </div>
    </>
  );
}

function Row({ term, detail }: { term: string; detail: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-line pb-3 last:border-b-0 last:pb-0">
      <dt className="text-ink-faint">{term}</dt>
      <dd className="text-right font-medium">{detail}</dd>
    </div>
  );
}

/** "5554984220808" reads as a phone number once it is punctuated. */
function formatWhatsapp(e164: string): string {
  const national = e164.replace(/^55/, '');
  const ddd = national.slice(0, 2);
  const rest = national.slice(2);
  return `(${ddd}) ${rest.slice(0, rest.length - 4)}-${rest.slice(-4)}`;
}
