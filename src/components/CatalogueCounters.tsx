import { useMemo } from 'react';
import { fetchVariableGroupInfo } from '../lib/undc/client';
import { SNAPSHOT_KEYS } from '../lib/undc/snapshots';
import { useSourcedData } from '../lib/undc/useSourcedData';
import type { VariableGroupInfoResponse } from '../lib/undc/types';
import { StatTile } from './charts/StatTile';
import { OriginBadge } from './OriginBadge';

/**
 * Headline catalogue figures, counted from the graph at load time.
 *
 * The indicator total is the sum of the per-collection descendant counts. That is
 * a sum of collection sizes rather than a count of distinct variables: the same
 * series is reachable through more than one branch of the tree (an SDG indicator
 * also sits under its contributing agency), so the figure is labelled as such
 * rather than presented as a distinct count.
 */
export function CatalogueCounters() {
  const state = useSourcedData<VariableGroupInfoResponse>(
    SNAPSHOT_KEYS.catalogue,
    (signal) => fetchVariableGroupInfo('undata/g/Root', { signal }),
  );

  const stats = useMemo(() => {
    const groups = state.data?.childStatVarGroups ?? [];

    // The tree mixes contributing collections with cross-cutting views of the
    // same series (SDG goal pages, the ABAS priorities). Only the collections
    // are counted, so nothing is double-counted in the headline.
    const collections = groups.filter(
      (group) => !group.id.includes('/sdgf/') && !group.id.includes('/abas/') &&
                 !group.id.includes('/theme/'),
    );

    const indicators = collections.reduce(
      (total, group) => total + (group.descendentStatVarCount ?? 0),
      0,
    );

    const largest = [...collections].sort(
      (a, b) => (b.descendentStatVarCount ?? 0) - (a.descendentStatVarCount ?? 0),
    )[0];

    return { collectionCount: collections.length, indicators, largest };
  }, [state.data]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          value={stats.indicators > 0 ? stats.indicators.toLocaleString('en') : '—'}
          label="Indicators across contributing collections"
          detail="Summed from the graph's own per-collection counts. Series reachable through two branches are counted in both."
          accent
        />
        <StatTile
          value={stats.collectionCount > 0 ? String(stats.collectionCount) : '—'}
          label="Contributing data collections"
          detail="Agency databases published into the graph, each with its own provenance."
        />
        <StatTile
          value="26"
          label="UN System entities represented"
          detail="As announced at launch, targeting 80% of UN statistical datasets by 2027."
        />
        <StatTile
          value="0"
          label="API keys required"
          detail={
            <>
              The REST surface answers anonymously and cross-origin. Every chart on this
              site is a browser request, with no server in between.
            </>
          }
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <OriginBadge
          origin={state.origin}
          retrievedAt={state.retrievedAt}
          liveError={state.liveError}
        />
        {stats.largest && (
          <p className="text-[0.75rem] text-ink-muted">
            Deepest collection right now:{' '}
            <span className="text-ink-secondary">{stats.largest.displayName}</span> with{' '}
            <span className="tnum text-ink-secondary">
              {stats.largest.descendentStatVarCount.toLocaleString('en')}
            </span>{' '}
            indicators.
          </p>
        )}
      </div>
    </div>
  );
}
