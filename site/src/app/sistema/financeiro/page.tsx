import {
  DEMO_ENTRIES,
  ENTRY_KIND_LABELS,
  type DemoEntry,
} from '@/data/demo-system';
import { formatPrice } from '@/lib/format';
import { Badge, DemoNotice, PageHead, Stat, Table, Td } from '@/components/system/ui';

export const metadata = { title: 'Financeiro' };

const TONE: Record<DemoEntry['status'], 'good' | 'neutral' | 'warn'> = {
  recebido: 'good',
  pago: 'neutral',
  previsto: 'warn',
};

export default function FinanceiroPage() {
  const settled = DEMO_ENTRIES.filter((entry) => entry.status !== 'previsto');
  const income = settled
    .filter((entry) => entry.amount > 0)
    .reduce((total, entry) => total + entry.amount, 0);
  const outgoing = settled
    .filter((entry) => entry.amount < 0)
    .reduce((total, entry) => total + entry.amount, 0);
  const forecast = DEMO_ENTRIES.filter((entry) => entry.status === 'previsto').reduce(
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

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Entradas no mês" value={formatPrice(income) ?? '—'} />
        <Stat label="Saídas no mês" value={formatPrice(Math.abs(outgoing)) ?? '—'} />
        <Stat
          label="Resultado"
          value={formatPrice(income + outgoing) ?? '—'}
          hint="Já liquidado"
        />
        <Stat label="Previsto" value={formatPrice(forecast) ?? '—'} hint="A receber" />
      </div>

      <Table head={['Data', 'Lançamento', 'Tipo', 'Situação', 'Valor']}>
        {DEMO_ENTRIES.map((entry) => (
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
                className={`font-medium ${entry.amount < 0 ? 'text-ink-soft' : 'text-green-800'}`}
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
