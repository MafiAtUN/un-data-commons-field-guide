import { useMemo, type ReactNode } from 'react';
import { fetchSeries } from '../../lib/undc/client';
import { toNamedSeries, type NamedSeries } from '../../lib/undc/select';
import type { SnapshotKey } from '../../lib/undc/snapshots';
import { useSourcedData } from '../../lib/undc/useSourcedData';
import type { SeriesResponse } from '../../lib/undc/types';
import { labelsFor, placeLabel } from '../../content/places';
import { ChartFrame } from '../charts/ChartFrame';
import { LineChart } from '../charts/LineChart';
import { SeriesTable } from '../charts/TableView';

interface SeriesPanelProps {
  snapshotKey: SnapshotKey;
  title: string;
  subtitle?: string;
  /** One or more variable dcids. Several variables become several series. */
  variables: readonly string[];
  entities: readonly string[];
  /** Overrides for series labels, keyed by `${variable}|${entity}`. */
  seriesLabels?: Readonly<Record<string, string>>;
  caveat?: ReactNode;
  zeroBaseline?: boolean;
  height?: number;
}

/**
 * A time-series chart wired to one request.
 *
 * When several variables are requested the series key becomes `variable|entity`,
 * so a colour still belongs to one identifiable line rather than to a row index.
 */
export function SeriesPanel({
  snapshotKey,
  title,
  subtitle,
  variables,
  entities,
  seriesLabels = {},
  caveat,
  zeroBaseline = true,
  height,
}: SeriesPanelProps) {
  const state = useSourcedData<SeriesResponse>(
    snapshotKey,
    (signal) => fetchSeries({ variables, entities }, { signal }),
    [variables.join(','), entities.join(',')],
  );

  const series = useMemo<NamedSeries[]>(() => {
    if (!state.data) return [];
    const labels = labelsFor(entities);

    if (variables.length === 1) {
      return toNamedSeries(state.data, variables[0]!, labels);
    }

    // Multi-variable: flatten to one series per (variable, entity) pair.
    return variables.flatMap((variable) =>
      toNamedSeries(state.data!, variable, labels).map((entry) => {
        const key = `${variable}|${entry.key}`;
        return {
          ...entry,
          key,
          label:
            seriesLabels[key] ??
            `${placeLabel(entry.key)} · ${variable.split('/').pop() ?? variable}`,
        };
      }),
    );
  }, [state.data, variables, entities, seriesLabels]);

  const colorKeys = useMemo(() => series.map((entry) => entry.key).sort(), [series]);
  const facet = series.find((entry) => entry.facet)?.facet;

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
      table={<SeriesTable series={series} valueHeading={title} />}
    >
      {series.length > 0 ? (
        <LineChart
          series={series}
          colorKeys={colorKeys}
          zeroBaseline={zeroBaseline}
          valueLabel={title}
          {...(height === undefined ? {} : { height })}
        />
      ) : (
        <p className="py-8 text-center text-[0.82rem] text-ink-muted">
          {state.isLoading ? 'Loading…' : 'This query returned no observations.'}
        </p>
      )}
    </ChartFrame>
  );
}
