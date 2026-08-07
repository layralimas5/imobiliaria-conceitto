import type { ReactNode } from 'react';

/**
 * The few shapes every panel screen is built from. Shared so the six sections
 * read as one system rather than as six pages that happen to sit behind the
 * same sidebar.
 */

export function PageHead({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="text-eyebrow">{eyebrow}</p>
        <h2 className="text-display mt-2 text-3xl md:text-4xl">{title}</h2>
        {text ? <p className="mt-3 text-sm leading-relaxed text-ink-soft">{text}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-card border border-line bg-surface p-5 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="pulse-on-hover">
      <p className="text-xs uppercase tracking-wider text-ink-faint">{label}</p>
      <p className="mt-3 text-2xl font-medium tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-faint">{hint}</p> : null}
    </Card>
  );
}

export function Table({ head, children }: { head: readonly string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-card border border-line bg-surface">
      <table className="w-full min-w-[44rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line bg-surface-muted text-left">
            {head.map((label) => (
              <th
                key={label}
                scope="col"
                className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-faint"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return <td className={`px-4 py-3 ${muted ? 'text-ink-soft' : ''}`}>{children}</td>;
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'brand' | 'good' | 'warn';
}) {
  const tones = {
    neutral: 'bg-surface-muted text-ink-soft',
    brand: 'bg-brand-50 text-brand-700',
    good: 'bg-green-50 text-green-800',
    warn: 'bg-bronze-100 text-bronze-600',
  } as const;
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** Says out loud that the screen is a mock-up, on every screen. */
export function DemoNotice() {
  return (
    <p className="mb-6 rounded-lg border border-bronze-400/50 bg-bronze-100/60 px-4 py-3 text-xs leading-relaxed text-ink-soft">
      <strong className="font-medium text-ink">Demonstração.</strong> Nomes, números e
      integrações desta tela são fictícios e servem para mostrar como o sistema
      funcionaria.
    </p>
  );
}
