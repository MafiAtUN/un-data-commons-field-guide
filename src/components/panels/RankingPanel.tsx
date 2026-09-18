import { useMemo, type ReactNode } from 'react';
import { fetchObservationsByCountry } from '../../lib/undc/client';
import { toRanking, vintageSpread } from '../../lib/undc/select';
import type { SnapshotKey } from '../../lib/undc/snapshots';
import { useSourcedData } from '../../lib/undc/useSourcedData';
import { usePlaceNames } from '../../lib/undc/usePlaceNames';
import type { ObservationResponse } from '../../lib/undc/types';
import { placeLabel } from '../../content/places';
import { ChartFrame } from '../charts/ChartFrame';
import { RankingChart } from '../charts/RankingChart';
import { RankingTable } from '../charts/TableView';

interface RankingPanelProps {
  snapshotKey: SnapshotKey;
  title: string;
  subtitle?: string;
  variable: string;
  /** Place whose contained countries are ranked, e.g. `africa`, `SouthernAsia`. */
  parentPlace: string;
  highlight?: readonly string[];
  limit?: number;
  extraCaveat?: ReactNode;
}

/**
 * One value per country inside a region, ranked.
 *
 * `date: 'LATEST'` is resolved per country, so this panel checks the vintage
 * spread of its own result and raises the caveat itself when the years differ.
 * A comparison across mixed reference years is not wrong, but presenting it as a
 * snapshot of one moment would be.
 */
export function RankingPanel({
  snapshotKey,
  title,
  subtitle,
  variable,
  parentPlace,
  highlight = [],
  limit,
  extraCaveat,
}: RankingPanelProps) {
  const state = useSourcedData<ObservationResponse>(
    snapshotKey,
    (signal) => fetchObservationsByCountry({ variable, parentPlace }, { signal }),
    [variable, parentPlace],
  );

  const ranking = useMemo(() => {
    if (!state.data) return { rows: [], facet: undefined };
    return toRanking(state.data, variable);
  }, [state.data, variable]);

  // A containment query can return any country in the graph, so the names are
  // resolved from the platform rather than from a local table that would be
  // permanently incomplete.
  const resolvedNames = usePlaceNames(ranking.rows.map((row) => row.key));

  const rows = useMemo(
    () =>
      ranking.rows.map((row) => ({
        ...row,
        label: resolvedNames[row.key] ?? placeLabel(row.key),
      })),
    [ranking.rows, resolvedNames],
  );

  const facet = ranking.facet;

  const spread = useMemo(() => vintageSpread(rows), [rows]);

  const caveat = spread?.isMixed ? (
    <>
      These values are each country's most recent reading, and those readings are
      not from the same year — they span <strong>{spread.earliest} to {spread.latest}</strong>,
      a {spread.spanYears}-year range. The bars are comparable as "latest available",
      not as a single-year cross-section. Each row's own year is shown beside it.
      {extraCaveat ? <> {extraCaveat}</> : null}
    </>
  ) : (
    extraCaveat ?? undefined
  );

  return (
    <ChartFrame
      title={title}
      subtitle={subtitle}
      facet={facet}
      origin={state.origin}
      retrievedAt={state.retrievedAt}
      request={state.request}
      liveError={state.liveError}
      isLoading={state.isLoading}
      caveat={caveat}
      table={<RankingTable rows={rows} valueHeading={title} />}
    >
      {rows.length > 0 ? (
        <>
          <p className="mb-3 text-[0.75rem] text-ink-muted">
            <span className="tnum font-medium text-ink-secondary">{rows.length}</span> countries
            returned by a single request.
            {spread && !spread.isMixed && (
              <> All values are from <span className="tnum">{spread.latest}</span>.</>
            )}
          </p>
          <RankingChart
            rows={rows}
            highlight={highlight}
            showDates={spread?.isMixed ?? false}
            valueLabel={title}
            {...(limit === undefined ? {} : { limit })}
          />
        </>
      ) : (
        <p className="py-8 text-center text-[0.82rem] text-ink-muted">
          {state.isLoading ? 'Loading…' : 'This query returned no observations.'}
        </p>
      )}
    </ChartFrame>
  );
}
