import type { DataOrigin } from '../lib/undc/types';

interface OriginBadgeProps {
  origin: DataOrigin | undefined;
  retrievedAt: string | undefined;
  liveError?: string | undefined;
}

/**
 * Says whether the numbers beside it arrived over the wire just now or came from
 * the recording committed in this repository.
 *
 * The site falls back to a snapshot when data.un.org is unreachable; it never
 * does so quietly, because a chart that might be stale and does not say so is
 * worse than no chart.
 */
export function OriginBadge({ origin, retrievedAt, liveError }: OriginBadgeProps) {
  if (!origin) return null;

  const isLive = origin === 'live';
  const when = retrievedAt ? new Date(retrievedAt) : undefined;

  const label = isLive ? 'Live from data.un.org' : 'Cached snapshot';
  const detail = when
    ? isLive
      ? `fetched ${when.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
      : `recorded ${when.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : undefined;

  return (
    <span
      title={liveError ? `Live request failed: ${liveError}` : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.68rem] font-medium ${
        isLive
          ? 'border-status-good/35 bg-status-good/10 text-status-good'
          : 'border-hairline bg-surface-2 text-ink-muted'
      }`}
    >
      <span
        aria-hidden="true"
        className={`size-1.5 rounded-full ${isLive ? 'bg-status-good' : 'bg-ink-muted'}`}
      />
      {label}
      {detail && <span className="font-normal opacity-75">· {detail}</span>}
    </span>
  );
}
