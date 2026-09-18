import { useMemo, useRef, useState } from 'react';
import type { NamedSeries } from '../../lib/undc/select';
import { formatValue, linearScale, niceDomain, seriesColor, ticks } from './scales';

interface LineChartProps {
  series: readonly NamedSeries[];
  /** The stable entity universe, so colours never shift when the set is filtered. */
  colorKeys: readonly string[];
  height?: number;
  /** Indices and bounded shares read better on a padded window than from zero. */
  zeroBaseline?: boolean;
  valueLabel?: string;
}

const PADDING = { top: 16, right: 64, bottom: 30, left: 52 } as const;

/**
 * Multi-series time chart: 2px strokes, a hairline grid, a shared crosshair, and
 * a direct label at each series endpoint.
 *
 * Values are readable three ways — the endpoint label, the crosshair tooltip and
 * the table view — so nothing here is gated behind a hover.
 */
export function LineChart({
  series,
  colorKeys,
  height = 260,
  zeroBaseline = true,
  valueLabel,
}: LineChartProps) {
  const [width, setWidth] = useState(720);
  const [hoverYear, setHoverYear] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const geometry = useMemo(() => {
    const years = [...new Set(series.flatMap((s) => s.points.map((p) => p.date)))].sort();
    const values = series.flatMap((s) => s.points.map((p) => p.value));

    const yDomain = niceDomain(values, { zeroBaseline });
    const x = linearScale([0, Math.max(1, years.length - 1)], [PADDING.left, width - PADDING.right]);
    const y = linearScale(yDomain, [height - PADDING.bottom, PADDING.top]);

    return { years, x, y, yTicks: ticks(yDomain, 5) };
  }, [series, width, height, zeroBaseline]);

  const { years, x, y, yTicks } = geometry;

  /**
   * Which series may carry a direct label at its endpoint.
   *
   * A label on every line collides as soon as two series finish at similar
   * values, and two numbers printed on top of each other are worse than one
   * number and a tooltip. Endpoints are taken highest-first and a label is
   * placed only where it clears the last one by a full line height; the rest
   * stay reachable through the crosshair and the table view.
   */
  const labelledKeys = useMemo(() => {
    const MIN_GAP_PX = 12;

    const endpoints = series
      .map((entry) => {
        const last = entry.points[entry.points.length - 1];
        return last ? { key: entry.key, y: y(last.value) } : null;
      })
      .filter((item): item is { key: string; y: number } => item !== null)
      .sort((a, b) => a.y - b.y);

    const allowed = new Set<string>();
    let lastY = Number.NEGATIVE_INFINITY;

    for (const endpoint of endpoints) {
      if (endpoint.y - lastY >= MIN_GAP_PX) {
        allowed.add(endpoint.key);
        lastY = endpoint.y;
      }
    }

    return allowed;
  }, [series, y]);

  // Show at most ~8 year labels so the axis never collides with itself.
  const yearStride = Math.max(1, Math.ceil(years.length / 8));

  const hoverIndex = hoverYear ? years.indexOf(hoverYear) : -1;

  function handlePointer(event: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg || years.length === 0) return;

    const box = svg.getBoundingClientRect();
    const localX = ((event.clientX - box.left) / box.width) * width;
    const ratio = (localX - PADDING.left) / (width - PADDING.left - PADDING.right);
    const index = Math.round(ratio * (years.length - 1));

    setHoverYear(years[Math.min(years.length - 1, Math.max(0, index))] ?? null);
  }

  return (
    <div
      className="relative"
      ref={(node) => {
        if (node) setWidth(Math.max(320, node.clientWidth));
      }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full touch-none"
        style={{ height }}
        role="img"
        aria-label={`Time series${valueLabel ? ` of ${valueLabel}` : ''} for ${series
          .map((s) => s.label)
          .join(', ')}. The table view lists every value.`}
        onPointerMove={handlePointer}
        onPointerLeave={() => setHoverYear(null)}
      >
        {/* Solid hairline grid, one shade off the surface. Never dashed. */}
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={PADDING.left}
              x2={width - PADDING.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="var(--color-hairline)"
              strokeWidth={1}
            />
            <text
              x={PADDING.left - 8}
              y={y(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="tnum fill-ink-muted text-[10px]"
            >
              {formatValue(tick)}
            </text>
          </g>
        ))}

        {years.map((year, index) =>
          index % yearStride === 0 ? (
            <text
              key={year}
              x={x(index)}
              y={height - PADDING.bottom + 16}
              textAnchor="middle"
              className="tnum fill-ink-muted text-[10px]"
            >
              {year}
            </text>
          ) : null,
        )}

        {hoverIndex >= 0 && (
          <line
            x1={x(hoverIndex)}
            x2={x(hoverIndex)}
            y1={PADDING.top}
            y2={height - PADDING.bottom}
            stroke="var(--color-ink-muted)"
            strokeWidth={1}
          />
        )}

        {series.map((entry) => {
          const color = seriesColor(entry.key, colorKeys);
          const path = entry.points
            .map((point, index) => {
              const at = years.indexOf(point.date);
              return `${index === 0 ? 'M' : 'L'} ${x(at)} ${y(point.value)}`;
            })
            .join(' ');

          const last = entry.points[entry.points.length - 1];
          const hovered = hoverYear
            ? entry.points.find((point) => point.date === hoverYear)
            : undefined;

          return (
            <g key={entry.key}>
              <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />

              {/* Endpoint marker: a 2px surface ring keeps overlapping marks legible. */}
              {last && (
                <circle
                  cx={x(years.indexOf(last.date))}
                  cy={y(last.value)}
                  r={4}
                  fill={color}
                  stroke="var(--color-surface-1)"
                  strokeWidth={2}
                />
              )}

              {/* Direct label at the endpoint only, and only where it fits. */}
              {last && labelledKeys.has(entry.key) && (
                <text
                  x={x(years.indexOf(last.date)) + 9}
                  y={y(last.value)}
                  dominantBaseline="middle"
                  className="tnum fill-ink-secondary text-[10px]"
                >
                  {formatValue(last.value)}
                </text>
              )}

              {hovered && (
                <circle
                  cx={x(years.indexOf(hovered.date))}
                  cy={y(hovered.value)}
                  r={5}
                  fill={color}
                  stroke="var(--color-surface-1)"
                  strokeWidth={2}
                />
              )}
            </g>
          );
        })}
      </svg>

      {hoverYear && (
        <Tooltip
          year={hoverYear}
          series={series}
          colorKeys={colorKeys}
          leftRatio={(x(hoverIndex) - PADDING.left) / (width - PADDING.left - PADDING.right)}
        />
      )}

      <Legend series={series} colorKeys={colorKeys} />
    </div>
  );
}

function Tooltip({
  year,
  series,
  colorKeys,
  leftRatio,
}: {
  year: string;
  series: readonly NamedSeries[];
  colorKeys: readonly string[];
  leftRatio: number;
}) {
  const rows = series
    .map((entry) => ({ entry, point: entry.points.find((p) => p.date === year) }))
    .filter((row): row is { entry: NamedSeries; point: { date: string; value: number } } =>
      Boolean(row.point),
    )
    .sort((a, b) => b.point.value - a.point.value);

  if (rows.length === 0) return null;

  // Flip the card to the other side of the crosshair near the right edge.
  const flip = leftRatio > 0.6;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute top-2 z-10 min-w-40 rounded border border-hairline bg-surface-2/95 p-2.5 text-[0.72rem] shadow-lg backdrop-blur-sm"
      style={flip ? { left: '1rem' } : { right: '1rem' }}
    >
      <div className="tnum mb-1.5 font-semibold text-ink-primary">{year}</div>
      <dl className="space-y-1">
        {rows.map(({ entry, point }) => (
          <div key={entry.key} className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-ink-secondary">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-sm"
                style={{ background: seriesColor(entry.key, colorKeys) }}
              />
              {entry.label}
            </dt>
            <dd className="tnum font-medium text-ink-primary">{formatValue(point.value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** A legend is always present for two or more series: identity is never colour alone. */
function Legend({
  series,
  colorKeys,
}: {
  series: readonly NamedSeries[];
  colorKeys: readonly string[];
}) {
  if (series.length < 2) return null;

  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.72rem] text-ink-secondary">
      {series.map((entry) => (
        <li key={entry.key} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-2 rounded-sm"
            style={{ background: seriesColor(entry.key, colorKeys) }}
          />
          {entry.label}
        </li>
      ))}
    </ul>
  );
}
