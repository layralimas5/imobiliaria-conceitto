import type { ReactNode } from 'react';

/**
 * The few shapes every panel screen is built from.
 *
 * The canvas is white, so separation comes from hairlines and alignment rather
 * than from grey fills and drop shadows. That is the difference between a back
 * office and a marketing page: a card floating on grey draws attention to
 * itself, and on a screen with forty numbers on it, nothing should.
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
    <header className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-line pb-6">
      <div className="max-w-2xl">
        <p className="text-eyebrow">{eyebrow}</p>
        <h2 className="text-display mt-1.5 text-2xl md:text-[1.75rem]">{title}</h2>
        {text ? (
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}

export function Card({
  children,
  className = '',
  hoverable = true,
}: {
  children: ReactNode;
  className?: string;
  /**
   * Lifts and breathes under the pointer, everywhere in the panel. A screen of
   * static rectangles reads as a picture of a system rather than a system, and
   * the reaction under the cursor is what tells someone the thing is alive.
   *
   * Cards holding form fields keep it: the animation pauses on its own while
   * anything inside has focus (see `globals.css`), so it never moves under
   * someone who is typing.
   */
  hoverable?: boolean;
}) {
  return (
    <div
      className={`rounded-card border border-line bg-surface p-5 ${
        hoverable ? 'pulse-on-hover hover:border-line-strong' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Numbers live in one bordered strip divided by hairlines, not in a row of
 * floating tiles. Four identical cards read as decoration; one strip reads as a
 * readout, which is what it is.
 */
export function StatRow({
  children,
  columns = 4,
  className = '',
}: {
  children: ReactNode;
  columns?: 3 | 4;
  className?: string;
}) {
  const grid =
    columns === 3
      ? 'sm:grid-cols-3 sm:divide-y-0'
      : 'sm:grid-cols-2 xl:grid-cols-4 xl:divide-y-0';
  return (
    /*
     * No `overflow-hidden`: each cell lifts out of the strip under the pointer,
     * and clipping would cut the corner off mid-hover. The cells carry the same
     * radius as the strip instead, so the outer four line up with it.
     */
    <div
      className={`grid divide-y divide-line rounded-card border border-line bg-surface ${grid} ${className}`}
    >
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string;
  hint?: string;
  /** `strong` for the one number on the screen that matters most. */
  tone?: 'default' | 'strong';
}) {
  return (
    <div className="pulse-on-hover relative rounded-card border-line px-5 py-4 hover:z-10 hover:bg-surface sm:border-l sm:first:border-l-0">
      <p className="text-xs uppercase tracking-[0.08em] text-ink-faint">{label}</p>
      <p
        className={`mt-2 tabular-nums tracking-tight ${
          tone === 'strong' ? 'text-2xl font-bold' : 'text-xl font-bold'
        }`}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs leading-relaxed text-ink-faint">{hint}</p> : null}
    </div>
  );
}

export function Table({
  head,
  children,
  hoverable = false,
}: {
  head: readonly string[];
  children: ReactNode;
  /** For a table that is a panel on a dashboard rather than the page itself. */
  hoverable?: boolean;
}) {
  return (
    <div
      className={`overflow-x-auto rounded-card border border-line bg-surface ${
        hoverable ? 'pulse-on-hover hover:border-line-strong' : ''
      }`}
    >
      <table className="w-full min-w-[44rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            {head.map((label) => (
              <th
                key={label}
                scope="col"
                className="whitespace-nowrap px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-ink-faint"
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
  return (
    <td className={`px-4 py-2.5 align-top ${muted ? 'text-ink-soft' : ''}`}>{children}</td>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'brand' | 'good' | 'warn';
}) {
  const tones = {
    neutral: 'border-line bg-surface-muted text-ink-soft',
    brand: 'border-brand-100 bg-brand-50 text-brand-700',
    good: 'border-green-200 bg-green-50 text-green-800',
    warn: 'border-bronze-400/50 bg-bronze-100 text-bronze-600',
  } as const;
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** A section heading inside a page, aligned to the same hairline grid. */
export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h3 className="text-sm font-bold">{children}</h3>
      {action}
    </div>
  );
}

/** Says out loud that the screen is a mock-up, on every screen. */
export function DemoNotice() {
  return (
    <p className="mb-6 flex gap-2 rounded-md border-l-2 border-bronze-400 bg-bronze-100/40 px-3.5 py-2.5 text-xs leading-relaxed text-ink-soft">
      <strong className="font-bold text-ink">Demonstração.</strong> Nomes, números e
      integrações desta tela são fictícios e servem para mostrar como o sistema funcionaria.
    </p>
  );
}
