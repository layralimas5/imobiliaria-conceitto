'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/format';

/**
 * The two chart shapes the panel needs, in the site's own palette and type
 * scale. No charting library: these are bars, and a dependency that ships its
 * own fonts, colours and tooltips would fight the design system on every screen
 * it appears in.
 *
 * Both render a `sr-only` table alongside the drawing, so the numbers are
 * readable by anyone the bars do not reach.
 */

export interface ChartSeries {
  readonly label: string;
  /** Tailwind background utility. One per series, in the order of the values. */
  readonly className: string;
}

export interface ChartPoint {
  readonly label: string;
  readonly values: readonly number[];
}

/**
 * How the numbers read, and what the derived line under them means. Passed as a
 * string rather than a formatter function because this is a client component and
 * a function cannot cross the server boundary.
 */
export type ChartFormat = 'moeda' | 'numero';
export type ChartFooter = 'diferenca' | 'taxa' | 'nenhum';

function format(value: number, as: ChartFormat): string {
  return as === 'moeda' ? formatPrice(value) : String(value);
}

function Legend({ series }: { series: readonly ChartSeries[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {series.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-xs text-ink-soft">
          <span aria-hidden className={`size-2.5 rounded-sm ${item.className}`} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

function DataTable({
  caption,
  series,
  points,
  as,
}: {
  caption: string;
  series: readonly ChartSeries[];
  points: readonly ChartPoint[];
  as: ChartFormat;
}) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Período</th>
          {series.map((item) => (
            <th key={item.label} scope="col">
              {item.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {points.map((point) => (
          <tr key={point.label}>
            <th scope="row">{point.label}</th>
            {point.values.map((value, index) => (
              <td key={series[index].label}>{format(value, as)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Grouped columns, one group per period. Heights are a share of the tallest
 * value in the whole chart, so the two series stay comparable to each other.
 *
 * Pointing at a month lifts that month and dims the rest, and opens a card over
 * the chart with the numbers written out. A bar chart answers "which month was
 * bigger" on sight; it never answers "by how much", and squinting at a column to
 * guess a value is the thing tooltips exist to stop.
 */
export function ColumnChart({
  title,
  series,
  points,
  as = 'numero',
  footer = 'nenhum',
  footerLabel,
  highlightLast = true,
}: {
  title: string;
  series: readonly ChartSeries[];
  points: readonly ChartPoint[];
  as?: ChartFormat;
  /** The line under the values: a − b, or b as a share of a. */
  footer?: ChartFooter;
  footerLabel?: string;
  /** Dims every group but the last, which is the month still in progress. */
  highlightLast?: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...points.flatMap((point) => point.values));
  const shown = active === null ? null : points[active];

  return (
    <figure
      className="relative m-0"
      onMouseLeave={() => setActive(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setActive(null);
      }}
    >
      <Legend series={series} />

      <div className="relative mt-4">
        <div className="flex h-44 items-end gap-1.5 border-b border-line pb-px sm:gap-3">
          {points.map((point, pointIndex) => {
            const isLast = pointIndex === points.length - 1;
            const isActive = active === pointIndex;
            const isDimmed = active !== null && !isActive;

            return (
              <button
                key={point.label}
                type="button"
                onMouseEnter={() => setActive(pointIndex)}
                onFocus={() => setActive(pointIndex)}
                onClick={() => setActive((current) => (current === pointIndex ? null : pointIndex))}
                aria-label={`${point.label}: ${point.values
                  .map((value, index) => `${series[index].label} ${format(value, as)}`)
                  .join(', ')}`}
                aria-pressed={isActive}
                className={`flex h-full min-w-0 flex-1 cursor-default flex-col justify-end rounded-t-md transition-colors ${
                  isActive ? 'bg-surface-muted' : ''
                }`}
              >
                <span className="flex h-full items-end justify-center gap-1 px-0.5">
                  {point.values.map((value, index) => (
                    <span
                      key={series[index].label}
                      style={{ height: `${(value / max) * 100}%`, minHeight: '2px' }}
                      className={`w-full max-w-4 rounded-t-sm transition-opacity duration-200 ${
                        series[index].className
                      } ${
                        isDimmed
                          ? 'opacity-25'
                          : isActive || !highlightLast || isLast
                            ? 'opacity-100'
                            : 'opacity-55'
                      }`}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        {/* The card sits over the middle of the plot rather than following the
            pointer: it never runs off the edge, never covers the column being
            read, and lands in the same place every time. */}
        {shown ? (
          <div
            role="status"
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-52 -translate-x-1/2 -translate-y-1/2 rounded-card border border-line bg-surface/95 p-3.5 shadow-soft backdrop-blur-sm"
          >
            <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-faint">
              {shown.label}
            </p>
            <dl className="mt-2 space-y-1.5">
              {shown.values.map((value, index) => (
                <div key={series[index].label} className="flex items-baseline justify-between gap-3">
                  <dt className="flex items-center gap-1.5 text-xs text-ink-soft">
                    <span aria-hidden className={`size-2 rounded-sm ${series[index].className}`} />
                    {series[index].label}
                  </dt>
                  <dd className="text-sm font-bold tabular-nums">{format(value, as)}</dd>
                </div>
              ))}
            </dl>

            {footer !== 'nenhum' && shown.values.length >= 2 ? (
              <div className="mt-2.5 flex items-baseline justify-between gap-3 border-t border-line pt-2">
                <span className="text-xs text-ink-faint">{footerLabel}</span>
                <span className="text-sm font-bold tabular-nums">
                  {footer === 'diferenca'
                    ? format(shown.values[0] - shown.values[1], as)
                    : `${
                        shown.values[0] > 0
                          ? Math.round((shown.values[1] / shown.values[0]) * 100)
                          : 0
                      }%`}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex gap-1.5 sm:gap-3">
        {points.map((point, index) => (
          <span
            key={point.label}
            className={`min-w-0 flex-1 truncate text-center text-xs transition-colors ${
              active === index
                ? 'font-bold text-brand-700'
                : highlightLast && index === points.length - 1
                  ? 'font-bold text-ink'
                  : 'text-ink-faint'
            }`}
          >
            {point.label}
          </span>
        ))}
      </div>

      <figcaption>
        <DataTable caption={title} series={series} points={points} as={as} />
      </figcaption>
    </figure>
  );
}

/** A labelled proportion bar, for distributions rather than periods. */
export function ShareBar({
  label,
  value,
  total,
  suffix,
}: {
  label: string;
  value: number;
  total: number;
  suffix?: string;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <li className="group/bar">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="truncate">{label}</span>
        <span className="shrink-0 text-ink-faint">
          {value}
          {suffix ? ` ${suffix}` : ''} <span className="text-xs">({percent}%)</span>
        </span>
      </div>
      <div
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-muted"
        role="img"
        aria-label={`${label}: ${value} de ${total}, ${percent}%`}
      >
        <div
          className="h-full rounded-full bg-brand-700 transition-colors group-hover/bar:bg-brand-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </li>
  );
}
