import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchVariableGroupInfo } from '../../lib/undc/client';
import { SNAPSHOT_KEYS } from '../../lib/undc/snapshots';
import { useSourcedData } from '../../lib/undc/useSourcedData';
import type { VariableGroupInfoResponse } from '../../lib/undc/types';
import { OriginBadge } from '../OriginBadge';
import { useInView } from '../../lib/useInView';

/**
 * Twenty-six entities, one graph.
 *
 * The spokes are decorative; the number in the middle is not. It is summed from
 * the graph's own per-collection counts at the moment the page loads, so this
 * section cannot quietly go stale the way a hard-coded headline figure does —
 * and it carries the same origin badge as every other figure on the site, so a
 * reader can see whether it came over the wire or from the committed recording.
 */

const ENTITIES = 26;
const RADIUS = 118;
const CENTRE = 150;

/** Node positions, fixed at module load: the ring never changes shape. */
const NODES = Array.from({ length: ENTITIES }, (_, index) => {
  // Start at twelve o'clock and go clockwise, which is how a reader counts.
  const angle = (index / ENTITIES) * Math.PI * 2 - Math.PI / 2;
  return {
    x: CENTRE + Math.cos(angle) * RADIUS,
    y: CENTRE + Math.sin(angle) * RADIUS,
  };
});

export function AgencyRing() {
  const { ref, inView } = useInView<HTMLDivElement>();

  const state = useSourcedData<VariableGroupInfoResponse>(
    SNAPSHOT_KEYS.catalogue,
    (signal) => fetchVariableGroupInfo('undata/g/Root', { signal }),
  );

  const indicators = useMemo(() => {
    const groups = state.data?.childStatVarGroups ?? [];
    // Same filter as the catalogue page: cross-cutting views of the same series
    // (SDG goal pages, ABAS priorities, themes) are not contributing collections
    // and would double-count if summed alongside them.
    return groups
      .filter(
        (group) =>
          !group.id.includes('/sdgf/') &&
          !group.id.includes('/abas/') &&
          !group.id.includes('/theme/'),
      )
      .reduce((total, group) => total + (group.descendentStatVarCount ?? 0), 0);
  }, [state.data]);

  const shown = useCountUp(indicators, inView);

  return (
    <div ref={ref} className="grid items-center gap-8 lg:grid-cols-[minmax(0,18rem)_1fr]">
      <div className="relative mx-auto w-full max-w-[18rem]">
        <svg viewBox="0 0 300 300" className="w-full" role="presentation">
          {NODES.map((node, index) => (
            <line
              key={`spoke-${index}`}
              x1={CENTRE}
              y1={CENTRE}
              x2={node.x}
              y2={node.y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-hairline"
              data-draw={inView ? 'shown' : 'hidden'}
              style={
                {
                  '--draw-length': RADIUS,
                  '--reveal-delay': `${index * 32}ms`,
                } as React.CSSProperties
              }
            />
          ))}

          {NODES.map((node, index) => (
            <circle
              key={`node-${index}`}
              cx={node.x}
              cy={node.y}
              r="3"
              className="fill-surface-0 stroke-ink-muted"
              strokeWidth="1.25"
              data-reveal={inView ? 'shown' : 'hidden'}
              style={{ '--reveal-delay': `${400 + index * 32}ms` } as React.CSSProperties}
            />
          ))}

          <circle
            cx={CENTRE}
            cy={CENTRE}
            r="7"
            className="fill-volt"
            data-reveal={inView ? 'shown' : 'hidden'}
            style={{ '--reveal-delay': '260ms' } as React.CSSProperties}
          />
        </svg>
      </div>

      <div>
        <p className="tnum text-4xl font-semibold leading-none text-ink-primary sm:text-5xl">
          {shown > 0 ? shown.toLocaleString('en') : '—'}
        </p>
        <p className="mt-2 max-w-md text-[0.9rem] leading-relaxed text-ink-secondary">
          indicators, reachable across{' '}
          <span className="text-ink-primary">{ENTITIES} UN System entities</span> through one
          graph, one query language and no API key.
        </p>
        <p className="mt-2 max-w-md text-[0.76rem] leading-relaxed text-ink-muted">
          Summed live from the graph's own per-collection counts, so this figure cannot go
          stale while nobody is looking. A series reachable through two branches — an SDG
          indicator that also sits under its contributing agency — is counted in both.
        </p>
        <div className="mt-3">
          <OriginBadge
            origin={state.origin}
            retrievedAt={state.retrievedAt}
            liveError={state.liveError}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Counts to `target` once `run` is true.
 *
 * Eased out, so the number decelerates into its final value instead of stopping
 * dead — and skipped entirely under `prefers-reduced-motion`, where a spinning
 * digit is exactly the kind of thing the preference is asking us not to do.
 */
function useCountUp(target: number, run: boolean, duration = 1100): number {
  const [value, setValue] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    if (!run || target <= 0) return undefined;

    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      setValue(target);
      return undefined;
    }

    const started = performance.now();
    const step = () => {
      const progress = Math.min(1, (performance.now() - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame.current = requestAnimationFrame(step);
    };

    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [target, run, duration]);

  return value;
}
