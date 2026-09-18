/**
 * The hook every data-bearing component uses.
 *
 * It attempts the live UN API first and falls back to the committed snapshot,
 * reporting which one you got. Two deliberate behaviours:
 *
 *  - **No skeleton flash on refetch.** While a new request is in flight the
 *    previous render is held (the consumer dims it), so filtering a chart never
 *    collapses the layout.
 *  - **Fallback is never silent.** A snapshot result carries the live error, and
 *    the UI shows it on request.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Traced } from './http';
import { readSnapshot, type SnapshotKey } from './snapshots';
import type { DataOrigin } from './types';

export interface SourcedState<T> {
  data: T | undefined;
  origin: DataOrigin | undefined;
  /** ISO timestamp of the live response, or of the snapshot recording. */
  retrievedAt: string | undefined;
  /** The request that produced `data`, shown verbatim in the UI. */
  request: { method: string; url: string; body?: unknown } | undefined;
  isLoading: boolean;
  /** Set when the live call failed; `data` is then the snapshot. */
  liveError: string | undefined;
  refresh: () => void;
}

export function useSourcedData<T>(
  snapshotKey: SnapshotKey,
  fetcher: (signal: AbortSignal) => Promise<Traced<T>>,
  /** Extra values that should trigger a refetch, as with any effect dependency. */
  deps: readonly unknown[] = [],
): SourcedState<T> {
  const [state, setState] = useState<Omit<SourcedState<T>, 'refresh'>>({
    data: undefined,
    origin: undefined,
    retrievedAt: undefined,
    request: undefined,
    isLoading: true,
    liveError: undefined,
  });

  const [attempt, setAttempt] = useState(0);
  const refresh = useCallback(() => setAttempt((n) => n + 1), []);

  // `fetcher` is typically an inline closure; pin it so it does not itself
  // retrigger the effect. `deps` is the declared dependency surface.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    const controller = new AbortController();
    let settled = false;

    setState((previous) => ({ ...previous, isLoading: true }));

    fetcherRef
      .current(controller.signal)
      .then(({ data, trace }) => {
        if (controller.signal.aborted) return;
        settled = true;
        setState({
          data,
          origin: 'live',
          retrievedAt: new Date().toISOString(),
          request: trace,
          isLoading: false,
          liveError: undefined,
        });
      })
      .catch(async (error: unknown) => {
        if (controller.signal.aborted) return;
        settled = true;

        const message = error instanceof Error ? error.message : 'live request failed';
        const snapshot = await readSnapshot<T>(snapshotKey);
        if (controller.signal.aborted) return;

        setState({
          data: snapshot?.payload,
          origin: snapshot ? 'snapshot' : undefined,
          retrievedAt: snapshot?.fetchedAt,
          request: snapshot?.request,
          isLoading: false,
          liveError: message,
        });
      })
      .finally(() => {
        if (!settled && !controller.signal.aborted) {
          setState((previous) => ({ ...previous, isLoading: false }));
        }
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotKey, attempt, ...deps]);

  return { ...state, refresh };
}
