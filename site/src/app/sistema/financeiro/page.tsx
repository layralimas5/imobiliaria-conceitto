import { ENTRY_KIND_LABELS, type DemoEntry } from '@/data/demo-system';
import { scopedEntries } from '@/data/scoped';
import { currentScope } from '@/lib/branch-cookie';
import { formatPrice } from '@/lib/format';
import { Badge, DemoNotice, PageHead, Stat, StatRow, Table, Td } from '@/components/system/ui';

export const metadata = { title: 'Financeiro' };

// Scoped to the selected unit, which lives in a cookie.
export const dynamic = 'force-dynamic';

const TONE: Record<DemoEntry['status'], 'good' | 'neutral' | 'warn'> = {
  recebido: 'good',
  pago: 'neutral',
  previsto: 'warn',
};

export default async function FinanceiroPage() {
  const scope = await currentScope();
  const entries = scopedEntries(scope);

  const settled = entries.filter((entry) => entry.status !== 'previsto');
  const income = settled
    .filter((entry) => entry.amount > 0)
    .reduce((total, entry) => total + entry.amount, 0);
  const outgoing = settled
    .filter((entry) => entry.amount < 0)
    .reduce((total, entry) => total + entry.amount, 0);
  const forecast = entries.filter((entry) => entry.status === 'previsto').reduce(
    (total, entry) => total + entry.amount,
    0,
  );

  return (
    <>
      <DemoNotice />
      <PageHead
        eyebrow="Caixa"
        title="Financeiro"
        text="Comissões, aluguéis recebidos, repasses a proprietários e as despesas do mês."
      />

      <StatRow className="mb-8">
        <Stat label="Entradas no mês" value={formatPrice(income) ?? '—'} />
        <Stat label="Saídas no mês" value={formatPrice(Math.abs(outgoing)) ?? '—'} />
        <Stat
          label="Resultado"
          value={formatPrice(income + outgoing) ?? '—'}
          hint="Já liquidado"
        />
        <Stat label="Previsto" value={formatPrice(forecast) ?? '—'} hint="A receber" />
      </StatRow>

      <Table head={['Data', 'Lançamento', 'Tipo', 'Situação', 'Valor']}>
        {entries.map((entry) => (
          <tr key={`${entry.date}-${entry.description}`}>
            <Td muted>{entry.date}</Td>
            <Td>{entry.description}</Td>
            <Td muted>{ENTRY_KIND_LABELS[entry.kind]}</Td>
            <Td>
              <Badge tone={TONE[entry.status]}>
                {entry.status === 'recebido'
                  ? 'Recebido'
                  : entry.status === 'pago'
                    ? 'Pago'
                    : 'Previsto'}
              </Badge>
            </Td>
            <Td>
              <span
                className={`font-bold ${entry.amount < 0 ? 'text-ink-soft' : 'text-green-800'}`}
              >
                {entry.amount < 0 ? '− ' : ''}
                {formatPrice(Math.abs(entry.amount))}
              </span>
            </Td>
          </tr>
        ))}
      </Table>
    </>
  );
}
