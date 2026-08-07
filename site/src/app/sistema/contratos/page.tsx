import { Paperclip } from 'lucide-react';
import { currentScope } from '@/lib/branch-cookie';
import {
  allDocuments,
  scopedClients,
  scopedContracts,
  scopedListings,
  scopedOwners,
} from '@/data/scoped';
import type { DemoContract } from '@/data/demo-system';
import { TYPE_LABELS } from '@/domain/search';
import { formatPrice, formatPriceCompact } from '@/lib/format';
import { ContractForm } from '@/components/system/contract-form';
import { DocumentForm } from '@/components/system/document-form';
import { Badge, DemoNotice, PageHead, Stat, StatRow, Table, Td } from '@/components/system/ui';

export const metadata = { title: 'Contratos' };

export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<DemoContract['status'], 'neutral' | 'brand' | 'good' | 'warn'> = {
  vigente: 'good',
  'em assinatura': 'warn',
  encerrado: 'neutral',
};

export default async function ContratosPage() {
  const scope = await currentScope();
  const contracts = await scopedContracts(scope);
  const active = contracts.filter((contract) => contract.status === 'vigente');
  const rentals = active.filter((contract) => contract.kind === 'locação');
  const monthlyRent = rentals.reduce((total, contract) => total + contract.value, 0);
  const soldValue = contracts.filter((contract) => contract.kind === 'venda').reduce(
    (total, contract) => total + contract.value,
    0,
  );

  const listings = (await scopedListings(scope)).map((listing) => ({
    code: listing.code,
    label: `${listing.code} — ${listing.title || TYPE_LABELS[listing.type]}, ${
      listing.address.neighborhood
    }`,
  }));
  const owners = scopedOwners(scope).map((owner) => owner.name);
  const clients = (await scopedClients(scope)).map((client) => client.name);
  const documents = await allDocuments();
  /** A document is attached to a contract when its vínculo starts with the code. */
  const attachmentsOf = (code: string) =>
    documents.filter(
      (document) => document.linkedKind === 'contrato' && document.linkedTo.startsWith(code),
    ).length;

  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Jurídico"
        title="Contratos"
        text="Vendas e locações assinadas, com as partes, o valor e até quando cada uma vale."
        action={
          <div className="flex flex-wrap gap-3">
            <DocumentForm
              trigger="Anexar documento"
              variant="secondary"
              fixedKind="contrato"
              targets={{
                imóvel: listings.map((listing) => listing.label),
                contrato: contracts.map((contract) => `${contract.code} — ${contract.listing}`),
                proprietário: owners,
                cliente: clients,
              }}
            />
            <ContractForm clients={clients} owners={owners} listings={listings} />
          </div>
        }
      />

      <StatRow className="mb-8">
        <Stat label="Vigentes" value={String(active.length)} hint={`${contracts.length} no total`} />
        <Stat label="Locações ativas" value={String(rentals.length)} />
        <Stat label="Aluguel sob gestão" value={formatPrice(monthlyRent)} hint="Por mês" />
        <Stat label="Vendas registradas" value={formatPriceCompact(soldValue)} hint="Valor somado" />
      </StatRow>

      <Table
        head={['Contrato', 'Tipo', 'Imóvel', 'Cliente', 'Proprietário', 'Valor', 'Vigência', 'Anexos', 'Situação']}
      >
        {contracts.map((contract) => (
          <tr key={contract.code}>
            <Td>
              <span className="font-bold">{contract.code}</span>
              <span className="mt-0.5 block text-xs text-ink-faint">{contract.signedAt}</span>
            </Td>
            <Td>
              <Badge tone={contract.kind === 'venda' ? 'brand' : 'neutral'}>{contract.kind}</Badge>
            </Td>
            <Td muted>{contract.listing}</Td>
            <Td muted>{contract.client}</Td>
            <Td muted>{contract.owner}</Td>
            <Td>
              <span className="font-bold">
                {formatPrice(contract.value)}
                {contract.kind === 'locação' ? (
                  <span className="font-normal text-ink-faint">/mês</span>
                ) : null}
              </span>
            </Td>
            <Td muted>{contract.until === '—' ? 'Definitivo' : `Até ${contract.until}`}</Td>
            <Td>
              {attachmentsOf(contract.code) > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-ink-soft">
                  <Paperclip className="size-3.5 shrink-0" aria-hidden strokeWidth={2} />
                  {attachmentsOf(contract.code)}
                </span>
              ) : (
                <span className="text-ink-faint">—</span>
              )}
            </Td>
            <Td>
              <Badge tone={STATUS_TONE[contract.status]}>{contract.status}</Badge>
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
