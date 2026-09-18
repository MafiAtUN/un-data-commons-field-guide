import type { ReactNode } from 'react';

interface StatTileProps {
  /** The figure itself, already formatted. */
  value: string;
  label: string;
  /** Unit, year, or the qualifier that makes the figure meaningful. */
  detail?: ReactNode;
  accent?: boolean;
}

/**
 * A single number, presented as a number.
 *
 * When the story is one figure, a one-bar bar chart is the wrong answer — the
 * number is the chart. Proportional figures here, not tabular: equal-width digits
 * read loose at display sizes.
 */
export function StatTile({ value, label, detail, accent = false }: StatTileProps) {
  return (
    <div className="rounded-lg border border-hairline bg-surface-1 p-4">
      <div
        className={`font-sans text-3xl font-semibold leading-none tracking-tight ${
          accent ? 'text-volt' : 'text-ink-primary'
        }`}
      >
        {value}
      </div>
      <div className="mt-2 text-[0.78rem] font-medium leading-snug text-ink-secondary">{label}</div>
      {detail && <div className="mt-1 text-[0.72rem] leading-relaxed text-ink-muted">{detail}</div>}
    </div>
  );
}
