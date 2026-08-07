import { currentScope } from '@/lib/branch-cookie';
import { scopedProposals } from '@/data/scoped';
import type { DemoProposal } from '@/data/demo-system';
import { formatPrice, formatPriceCompact } from '@/lib/format';
import { Badge, DemoNotice, PageHead, Stat, StatRow, Table, Td } from '@/components/system/ui';

export const metadata = { title: 'Propostas' };

export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<DemoProposal['status'], 'neutral' | 'brand' | 'good' | 'warn'> = {
  'em análise': 'brand',
  contraproposta: 'warn',
  aceita: 'good',
  recusada: 'neutral',
};

/** The gap between asking and offered, which is what a negotiation actually is. */
function discountOf(proposal: DemoProposal): number {
  return Math.round(((proposal.asking - proposal.offered) / proposal.asking) * 100);
}

export default async function PropostasPage() {
  const scope = await currentScope();
  const proposals = scopedProposals(scope);
  const open = proposals.filter(
    (proposal) => proposal.status === 'em análise' || proposal.status === 'contraproposta',
  );
  const openValue = open.reduce((total, proposal) => total + proposal.offered, 0);
  const accepted = proposals.filter((proposal) => proposal.status === 'aceita');
  const averageDiscount = Math.round(
    proposals.reduce((total, proposal) => total + discountOf(proposal), 0) /
      proposals.length,
  );

  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Negociação"
        title="Propostas"
        text="Toda oferta registrada: o valor pedido, o oferecido, a diferença entre os dois e em que pé está a conversa."
      />

      <StatRow className="mb-8">
        <Stat label="Em aberto" value={String(open.length)} hint="Análise e contraproposta" />
        <Stat label="Valor em jogo" value={formatPriceCompact(openValue)} hint="Somando as ofertas" />
        <Stat label="Aceitas no mês" value={String(accepted.length)} />
        <Stat label="Desconto médio" value={`${averageDiscount}%`} hint="Sobre o valor pedido" />
      </StatRow>

      <Table
        head={['Proposta', 'Imóvel', 'Cliente', 'Pedido', 'Oferecido', 'Diferença', 'Corretor', 'Situação']}
      >
        {proposals.map((proposal) => (
          <tr key={proposal.code}>
            <Td>
              <span className="font-bold">{proposal.code}</span>
              <span className="mt-0.5 block text-xs text-ink-faint">{proposal.createdAt}</span>
            </Td>
            <Td muted>{proposal.listing}</Td>
            <Td muted>{proposal.client}</Td>
            <Td muted>{formatPrice(proposal.asking)}</Td>
            <Td>
              <span className="font-bold">{formatPrice(proposal.offered)}</span>
            </Td>
            <Td>
              <span className={discountOf(proposal) > 10 ? 'text-brand-700' : 'text-ink-soft'}>
                − {discountOf(proposal)}%
              </span>
            </Td>
            <Td muted>{proposal.agent}</Td>
            <Td>
              <Badge tone={STATUS_TONE[proposal.status]}>{proposal.status}</Badge>
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
