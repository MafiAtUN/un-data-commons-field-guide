import { useEffect, useState } from 'react';
import { fetchPlaceNames } from './client';

/**
 * Resolve display names for place dcids returned by a containment query.
 *
 * A regional query can return any country in the graph, so a hard-coded label
 * table can never be complete — it would print `LSO` where a reader expects
 * `Lesotho`. The platform has an endpoint for exactly this, so we ask it, and
 * fall back to whatever the caller already had if the request fails.
 */
export function usePlaceNames(dcids: readonly string[]): Record<string, string> {
  const [names, setNames] = useState<Record<string, string>>({});

  // Join rather than pass the array: a new array identity each render would
  // otherwise refire the effect forever.
  const key = dcids.join(',');

  useEffect(() => {
    if (dcids.length === 0) return;

    const controller = new AbortController();

    fetchPlaceNames(dcids, { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setNames(data);
      })
      .catch(() => {
        // Names are cosmetic; the chart is still correct without them.
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return names;
}
