import { Link } from 'react-router-dom';
import { DESTINATIONS, FIRST_TECHNICAL, RAIL_ENDS } from '../../content/navigation';
import { useInView } from '../../lib/useInView';

/**
 * The whole guide, in one screen, in depth order.
 *
 * The rail in the header is the same list compressed to twelve ticks, which is
 * a control rather than a map. This is the map: every destination, what it is
 * for, and how long it takes, on a single line running from someone who has
 * never opened data.un.org to someone pointing an agent at it.
 *
 * It is also the site's honest table of contents. A reader who bounces off the
 * Data Finder should be able to see, without clicking anything, that there are
 * exactly twelve other things here and roughly what order they go in.
 */
export function DepthLadder() {
  const { ref, inView } = useInView<HTMLOListElement>('-5% 0px -5% 0px');

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
        {RAIL_ENDS.start}
      </p>

      <ol ref={ref} className="relative mt-3 border-l border-hairline pl-6">
        {DESTINATIONS.map((destination, index) => (
          <li key={destination.to}>
            {index === FIRST_TECHNICAL && <TrackBreak />}

            <Link
              to={destination.to}
              data-reveal={inView ? 'shown' : 'hidden'}
              style={{ '--reveal-delay': `${Math.min(index, 8) * 45}ms` } as React.CSSProperties}
              className="group relative -ml-6 block rounded-r-lg py-2.5 pl-6 pr-3 transition-colors hover:bg-surface-1"
            >
              {/* The tick, sitting on the rule rather than beside it. */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-[1.15rem] size-[7px] -translate-x-1/2 rounded-full border border-hairline bg-surface-0 transition-colors group-hover:border-volt group-hover:bg-volt"
              />

              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <span className="text-[0.95rem] font-medium text-ink-primary">
                  {destination.label}
                </span>
                <span className="text-[0.72rem] text-ink-muted">{destination.time}</span>
                <span
                  aria-hidden="true"
                  className="text-[0.8rem] text-ink-muted opacity-0 transition-opacity group-hover:text-volt group-hover:opacity-100"
                >
                  →
                </span>
              </div>
              <p className="mt-0.5 text-[0.82rem] leading-relaxed text-ink-secondary">
                {destination.hint}
              </p>
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-3 text-right text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
        {RAIL_ENDS.end}
      </p>
    </div>
  );
}

/** Where the guide stops assuming nothing and starts assuming a terminal. */
function TrackBreak() {
  return (
    <div className="relative -ml-6 flex items-center gap-3 py-4 pl-6">
      <span
        aria-hidden="true"
        className="absolute left-0 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-volt/60 bg-surface-0"
      />
      <span className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-volt/80">
        Below here, a terminal helps
      </span>
      <span aria-hidden="true" className="h-px flex-1 bg-hairline" />
    </div>
  );
}
