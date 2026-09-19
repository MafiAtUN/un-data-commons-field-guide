import { useId, useState, type ReactNode } from 'react';
import type { Facet, DataOrigin } from '../../lib/undc/types';
import { unitLabel } from '../../lib/undc/select';
import { OriginBadge } from '../OriginBadge';

interface ChartFrameProps {
  title: string;
  /** One line on what the chart shows — not a restatement of the title. */
  subtitle?: string;
  /** Provenance of the numbers, rendered as an attribution line. */
  facet?: Facet;
  origin: DataOrigin | undefined;
  retrievedAt: string | undefined;
  request: { method: string; url: string; body?: unknown } | undefined;
  liveError?: string | undefined;
  isLoading: boolean;
  /** A caveat the reader needs in order not to misread the chart. */
  caveat?: ReactNode;
  /** The accessible twin. Every chart has one; this is not optional. */
  table: ReactNode;
  children: ReactNode;
}

/**
 * The shell every chart sits in.
 *
 * It carries the three things a statistic is meaningless without — where it came
 * from, when it was retrieved, and the request that produced it — plus a table
 * view, so no value on this site is reachable only by hovering a coloured mark.
 */
export function ChartFrame({
  title,
  subtitle,
  facet,
  origin,
  retrievedAt,
  request,
  liveError,
  isLoading,
  caveat,
  table,
  children,
}: ChartFrameProps) {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const [showRequest, setShowRequest] = useState(false);
  const panelId = useId();

  const unit = unitLabel(facet);

  return (
    <figure className="rounded-lg border border-hairline bg-surface-1 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[0.95rem] font-semibold leading-snug text-ink-primary">{title}</h3>
          {subtitle && <p className="mt-1 text-[0.8rem] leading-relaxed text-ink-muted">{subtitle}</p>}
        </div>

        {/* Wraps on a narrow phone: badge plus toggle needs ~332px, which is
            wider than a 320px viewport. */}
        <div className="flex flex-wrap items-center gap-2">
          <OriginBadge origin={origin} retrievedAt={retrievedAt} liveError={liveError} />
          <div role="group" aria-label="View as" className="flex overflow-hidden rounded border border-hairline">
            {(['chart', 'table'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setView(option)}
                aria-pressed={view === option}
                aria-controls={panelId}
                className={`px-2.5 py-1 text-[0.7rem] font-medium capitalize transition-colors ${
                  view === option
                    ? 'bg-surface-3 text-ink-primary'
                    : 'text-ink-muted hover:text-ink-secondary'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hold the previous render at reduced opacity rather than flashing a
          skeleton, so re-filtering never collapses the layout. */}
      <div
        id={panelId}
        className={`mt-4 transition-opacity duration-200 ${isLoading ? 'opacity-40' : 'opacity-100'}`}
      >
        {view === 'chart' ? children : table}
      </div>

      {caveat && (
        <p className="mt-4 flex gap-2 rounded border border-status-warning/25 bg-status-warning/5 p-3 text-[0.78rem] leading-relaxed text-ink-secondary">
          {/* Icon plus label: a status colour never carries meaning alone. */}
          <span aria-hidden="true" className="shrink-0 font-semibold text-status-warning">!</span>
          <span><span className="font-semibold text-status-warning">Read with care.</span> {caveat}</span>
        </p>
      )}

      <figcaption className="mt-4 border-t border-hairline pt-3 text-[0.72rem] leading-relaxed text-ink-muted">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {facet?.provenanceUrl ? (
            <a
              href={facet.provenanceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-ink-secondary underline decoration-hairline underline-offset-2 hover:decoration-volt"
            >
              Source: {facet.provenanceId ?? facet.provenanceUrl}
            </a>
          ) : (
            <span>Source: UN System Data Commons</span>
          )}
          {unit && <span>Unit: {unit}</span>}
          {facet?.observationPeriod && <span>Period: {facet.observationPeriod}</span>}
          {request && (
            <button
              type="button"
              onClick={() => setShowRequest((open) => !open)}
              className="text-ink-secondary underline decoration-hairline underline-offset-2 hover:decoration-volt"
              aria-expanded={showRequest}
            >
              {showRequest ? 'Hide request' : 'Show request'}
            </button>
          )}
        </div>

        {showRequest && request && (
          <pre className="mt-3 overflow-x-auto rounded border border-hairline bg-surface-0 p-3 font-mono text-[0.7rem] leading-relaxed text-ink-secondary">
{request.method} {request.url}
{request.body ? `\n\n${JSON.stringify(request.body, null, 2)}` : ''}
{liveError ? `\n\n// live request failed: ${liveError}\n// the values above come from the committed snapshot` : ''}
          </pre>
        )}
      </figcaption>
    </figure>
  );
}
