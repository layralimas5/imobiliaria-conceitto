import Link from 'next/link';
import { propertyRepository } from '@/data/catalog-repository';
import { propertyPath } from '@/domain/property';
import { TYPE_LABELS } from '@/domain/search';
import { formatPrice } from '@/lib/format';
import { ListingForm } from '@/components/system/listing-form';
import { Badge, DemoNotice, PageHead, Stat, Table, Td } from '@/components/system/ui';

export const metadata = { title: 'Imóveis' };

// The list has to reflect what was just created, so it is never cached.
export const dynamic = 'force-dynamic';

/**
 * The one screen running on real data: it lists what the site actually
 * publishes, which is what makes the panel legible as a companion to the site
 * rather than a separate invention.
 */
export default async function ImoveisPage() {
  const summaries = await propertyRepository.allSummaries();
  const withPhoto = summaries.filter((summary) => summary.coverPhoto).length;
  const forRent = summaries.filter((s) => s.operations.includes('locacao')).length;

  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Catálogo"
        title="Imóveis"
        text="O que o site publica hoje, sincronizado do MSYS Imob. O que for cadastrado aqui entra na mesma lista e aparece no site."
        action={<ListingForm />}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Publicados" value={String(summaries.length)} />
        <Stat label="Com fotografia" value={`${withPhoto} de ${summaries.length}`} />
        <Stat label="Para locação" value={String(forRent)} />
      </div>

      <Table head={['Código', 'Imóvel', 'Tipo', 'Cidade', 'Valor', 'Foto']}>
        {summaries.map((summary) => (
          <tr key={summary.code}>
            <Td muted>{summary.code}</Td>
            <Td>
              <Link
                href={propertyPath(summary)}
                className="font-medium underline-offset-4 hover:underline"
              >
                {summary.title || `${TYPE_LABELS[summary.type]} em ${summary.address.neighborhood}`}
              </Link>
              <span className="mt-0.5 block text-xs text-ink-faint">
                {summary.address.neighborhood}
              </span>
            </Td>
            <Td muted>{TYPE_LABELS[summary.type]}</Td>
            <Td muted>{summary.address.city}</Td>
            <Td muted>
              {formatPrice(summary.pricing.salePrice ?? summary.pricing.rentPrice) ?? '—'}
            </Td>
            <Td>
              {summary.coverPhoto ? (
                <Badge tone="good">{summary.photoCount} foto{summary.photoCount > 1 ? 's' : ''}</Badge>
              ) : (
                <Badge tone="warn">Sem foto</Badge>
              )}
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
