import { currentScope } from '@/lib/branch-cookie';
import { scopedOwners } from '@/data/scoped';

import { formatPrice } from '@/lib/format';
import { Badge, DemoNotice, PageHead, Stat, StatRow, Table, Td } from '@/components/system/ui';

export const metadata = { title: 'Proprietários' };

export const dynamic = 'force-dynamic';

/**
 * The other side of every listing. What matters here is not the imóvel but the
 * relationship: quantos imóveis a pessoa confiou à imobiliária, quantos estão
 * rendendo e quanto sai de repasse todo mês.
 */
export default async function ProprietariosPage() {
  const scope = await currentScope();
  const owners = scopedOwners(scope);
  const listings = owners.reduce((total, owner) => total + owner.listings, 0);
  const rented = owners.reduce((total, owner) => total + owner.rented, 0);
  const transfers = owners.reduce((total, owner) => total + owner.monthlyTransfer, 0);

  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Carteira"
        title="Proprietários"
        text="Quem confia imóveis à Conceitto, quantos estão locados e quanto é repassado por mês."
      />

      <StatRow columns={3} className="mb-8">
        <Stat
          label="Proprietários"
          value={String(owners.length)}
          hint={`${listings} imóveis na carteira`}
        />
        <Stat label="Imóveis locados" value={String(rented)} hint="Gerando repasse mensal" />
        <Stat label="Repasse do mês" value={formatPrice(transfers)} hint="Já descontada a taxa" />
      </StatRow>

      <Table
        head={['Proprietário', 'Documento', 'Unidade', 'Imóveis', 'Locados', 'Repasse mensal', 'Cliente desde']}
      >
        {owners.map((owner) => (
          <tr key={owner.document}>
            <Td>
              <span className="font-bold">{owner.name}</span>
              <span className="mt-0.5 block text-xs text-ink-faint">{owner.phone}</span>
            </Td>
            <Td muted>{owner.document}</Td>
            <Td>
              <Badge>{owner.branch}</Badge>
            </Td>
            <Td>{owner.listings}</Td>
            <Td muted>{owner.rented}</Td>
            <Td>
              {owner.monthlyTransfer > 0 ? (
                <span className="font-bold">{formatPrice(owner.monthlyTransfer)}</span>
              ) : (
                <span className="text-ink-faint">—</span>
              )}
            </Td>
            <Td muted>{owner.since}</Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
