import { useState } from 'react';
import type { RankedValue } from '../../lib/undc/select';
import { formatValue } from './scales';

interface RankingChartProps {
  rows: readonly RankedValue[];
  /** Cap the plot and fold the remainder into a counted note. */
  limit?: number;
  /** Entities to call out; everything else recedes to one neutral fill. */
  highlight?: readonly string[];
  /** Shown next to each bar when the result mixes reference years. */
  showDates?: boolean;
  valueLabel?: string;
}

/**
 * Horizontal ranking bars.
 *
 * One measure, one colour — a value ramp here would re-encode bar length as hue
 * and burn the only free channel on information the chart already shows. Where a
 * narrative singles out particular entities, those are highlighted and the rest
 * recede; that is emphasis, not identity, so it does not consume palette slots.
 */
export function RankingChart({
  rows,
  limit = 14,
  highlight = [],
  showDates = false,
  valueLabel,
}: RankingChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const visible = rows.slice(0, limit);
  const hiddenCount = rows.length - visible.length;
  const max = Math.max(...visible.map((row) => row.value), 0) || 1;

  return (
    <div>
      <ul
        className="space-y-1"
        role="list"
        aria-label={`Ranking${valueLabel ? ` by ${valueLabel}` : ''}. The table view lists every value.`}
      >
        {visible.map((row) => {
          const isHighlighted = highlight.length === 0 || highlight.includes(row.key);
          const isHovered = hovered === row.key;

          return (
            <li
              key={row.key}
              // The row is the hit target, comfortably past the 24px minimum,
              // rather than the bar itself.
              className="group relative flex items-center gap-3 rounded py-0.5 transition-colors hover:bg-surface-2/60"
              onPointerEnter={() => setHovered(row.key)}
              onPointerLeave={() => setHovered(null)}
              tabIndex={0}
              onFocus={() => setHovered(row.key)}
              onBlur={() => setHovered(null)}
            >
              <span className="w-32 shrink-0 truncate text-right text-[0.75rem] text-ink-secondary">
                {row.label}
              </span>

              <span className="relative h-5 flex-1">
                {/* 4px rounded data-end, anchored to the baseline at x=0. */}
                <span
                  className="absolute inset-y-0 left-0 rounded-r"
                  style={{
                    width: `${Math.max(0.6, (row.value / max) * 100)}%`,
                    background: isHighlighted ? 'var(--color-series-1)' : 'var(--color-surface-3)',
                    opacity: isHovered ? 1 : isHighlighted ? 0.92 : 1,
                  }}
                />
              </span>

              <span className="tnum w-16 shrink-0 text-right text-[0.75rem] font-medium text-ink-primary">
                {formatValue(row.value)}
              </span>

              {showDates && (
                <span className="tnum w-10 shrink-0 text-right text-[0.7rem] text-ink-muted">
                  {row.date}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {hiddenCount > 0 && (
        <p className="mt-3 text-[0.72rem] text-ink-muted">
          {hiddenCount} further {hiddenCount === 1 ? 'entity' : 'entities'} returned by this query —
          switch to the table view for the full list.
        </p>
      )}
    </div>
  );
}
