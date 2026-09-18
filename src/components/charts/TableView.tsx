import type { NamedSeries, RankedValue } from '../../lib/undc/select';
import { formatValue } from './scales';

/**
 * The WCAG-clean twin of every chart on this site.
 *
 * Tooltips enhance; they never gate. Anything a mark encodes is also a row here.
 */
export function SeriesTable({
  series,
  valueHeading = 'Value',
}: {
  series: readonly NamedSeries[];
  valueHeading?: string;
}) {
  const years = [...new Set(series.flatMap((s) => s.points.map((p) => p.date)))].sort();

  return (
    <div className="max-h-80 overflow-auto rounded border border-hairline">
      <table className="w-full border-collapse text-[0.75rem]">
        <caption className="sr-only">{valueHeading} by year and entity</caption>
        <thead className="sticky top-0 bg-surface-2">
          <tr>
            <th scope="col" className="border-b border-hairline p-2 text-left font-semibold text-ink-primary">
              Year
            </th>
            {series.map((entry) => (
              <th
                key={entry.key}
                scope="col"
                className="border-b border-hairline p-2 text-right font-semibold text-ink-primary"
              >
                {entry.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {years.map((year) => (
            <tr key={year} className="even:bg-surface-2/40">
              <th scope="row" className="tnum p-2 text-left font-normal text-ink-secondary">
                {year}
              </th>
              {series.map((entry) => {
                const point = entry.points.find((p) => p.date === year);
                return (
                  <td key={entry.key} className="tnum p-2 text-right text-ink-secondary">
                    {point ? formatValue(point.value, { precise: true }) : '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RankingTable({
  rows,
  valueHeading = 'Value',
}: {
  rows: readonly RankedValue[];
  valueHeading?: string;
}) {
  return (
    <div className="max-h-80 overflow-auto rounded border border-hairline">
      <table className="w-full border-collapse text-[0.75rem]">
        <caption className="sr-only">{valueHeading} by entity, with each entity's reference year</caption>
        <thead className="sticky top-0 bg-surface-2">
          <tr>
            <th scope="col" className="border-b border-hairline p-2 text-left font-semibold text-ink-primary">
              #
            </th>
            <th scope="col" className="border-b border-hairline p-2 text-left font-semibold text-ink-primary">
              Entity
            </th>
            <th scope="col" className="border-b border-hairline p-2 text-right font-semibold text-ink-primary">
              {valueHeading}
            </th>
            <th scope="col" className="border-b border-hairline p-2 text-right font-semibold text-ink-primary">
              Year
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.key} className="even:bg-surface-2/40">
              <td className="tnum p-2 text-ink-muted">{index + 1}</td>
              <th scope="row" className="p-2 text-left font-normal text-ink-secondary">
                {row.label}
                <span className="ml-1.5 font-mono text-[0.68rem] text-ink-muted">{row.key}</span>
              </th>
              <td className="tnum p-2 text-right text-ink-secondary">
                {formatValue(row.value, { precise: true })}
              </td>
              <td className="tnum p-2 text-right text-ink-muted">{row.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
