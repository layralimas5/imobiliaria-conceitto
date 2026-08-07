import { FileText } from 'lucide-react';
import type { DemoDocument } from '@/data/demo-system';
import { allDocuments, scopedClients, scopedContracts, scopedListings, scopedOwners } from '@/data/scoped';
import { currentScope } from '@/lib/branch-cookie';
import { TYPE_LABELS } from '@/domain/search';
import { DocumentForm } from '@/components/system/document-form';
import { Badge, DemoNotice, PageHead, Stat, StatRow, Table, Td } from '@/components/system/ui';

export const metadata = { title: 'Documentos' };

export const dynamic = 'force-dynamic';

const KIND_TONE: Record<DemoDocument['linkedKind'], 'neutral' | 'brand' | 'good' | 'warn'> = {
  imóvel: 'brand',
  contrato: 'warn',
  proprietário: 'neutral',
  cliente: 'neutral',
};

/**
 * Every file the office keeps, and what it is attached to. The vínculo is the
 * point: a matrícula that lives in a shared drive belongs to nobody, and the
 * hour spent looking for it on the day of the assinatura is the reason a panel
 * like this earns its keep.
 */
export default async function DocumentosPage() {
  const scope = await currentScope();
  const documents = await allDocuments();
  const byKind = (kind: DemoDocument['linkedKind']) =>
    documents.filter((document) => document.linkedKind === kind).length;

  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Arquivos"
        title="Documentos"
        text="Matrículas, escrituras, contratos e documentos de clientes e proprietários, cada um vinculado ao imóvel ou à negociação a que pertence."
        action={
          <DocumentForm
            targets={{
              imóvel: (await scopedListings(scope)).map(
                (listing) =>
                  `${listing.code} — ${listing.title || TYPE_LABELS[listing.type]}, ${
                    listing.address.neighborhood
                  }`,
              ),
              contrato: (await scopedContracts(scope)).map(
                (contract) => `${contract.code} — ${contract.listing}`,
              ),
              proprietário: scopedOwners(scope).map((owner) => owner.name),
              cliente: (await scopedClients(scope)).map((client) => client.name),
            }}
          />
        }
      />

      <StatRow className="mb-8">
        <Stat label="Arquivos" value={String(documents.length)} />
        <Stat label="De imóveis" value={String(byKind('imóvel'))} hint="Matrícula, escritura, laudo" />
        <Stat label="De contratos" value={String(byKind('contrato'))} />
        <Stat
          label="De pessoas"
          value={String(byKind('cliente') + byKind('proprietário'))}
          hint="Clientes e proprietários"
        />
      </StatRow>

      <Table head={['Arquivo', 'Tipo', 'Vinculado a', 'Tamanho', 'Enviado em', 'Por']}>
        {documents.map((document) => (
          <tr key={document.name}>
            <Td>
              <span className="flex items-center gap-2.5">
                <FileText className="size-4 shrink-0 text-ink-faint" aria-hidden strokeWidth={1.75} />
                <span className="font-bold">{document.name}</span>
              </span>
            </Td>
            <Td muted>{document.kind}</Td>
            <Td>
              <span className="block">{document.linkedTo}</span>
              <Badge tone={KIND_TONE[document.linkedKind]}>{document.linkedKind}</Badge>
            </Td>
            <Td muted>{document.size}</Td>
            <Td muted>{document.uploadedAt}</Td>
            <Td muted>{document.uploadedBy}</Td>
          </tr>
        ))}
      </Table>

      <p className="mt-6 rounded-lg border border-line bg-surface px-4 py-3 text-xs leading-relaxed text-ink-soft">
        <strong className="font-bold text-ink">Nesta demonstração</strong> a lista é o cadastro dos
        arquivos, sem upload. Num sistema em produção o arquivo vai para armazenamento privado e o
        acesso segue o perfil de quem está logado — documento de cliente não é visível para toda a
        equipe.
      </p>
    </>
  );
}
