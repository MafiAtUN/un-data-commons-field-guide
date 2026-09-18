import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DESTINATIONS, FIRST_TECHNICAL, RAIL_ENDS } from '../../content/navigation';

/**
 * The navigation, as a single axis.
 *
 * Twelve stops laid out left to right by how much the reader already knows:
 * "never used UN data" at one end, "wiring an AI agent" at the other. Where a
 * dropdown can only answer "what pages exist", a rail answers the question a
 * newcomer is actually asking — where am I, and what is the next thing.
 *
 * Underneath the effects it is a list of links. The magnetism is a pointermove
 * handler writing one custom property per tick; keyboard users get a single tab
 * stop and arrow keys, which is the roving-tabindex pattern, and the preview
 * card is fed by focus as well as hover so both routes see the same information.
 */

/**
 * How far a tick reacts, as a multiple of the gap between ticks.
 *
 * Measured from the rail rather than fixed in pixels: the rail is narrower at
 * the medium breakpoint than at the large one, and a constant radius that looks
 * magnetic on a wide screen pulls on nine ticks at once on a narrow one, which
 * reads as a blob rather than a bulge.
 */
const MAGNET_PITCHES = 3.2;

export function DepthRail() {
  const { pathname } = useLocation();
  const activeIndex = DESTINATIONS.findIndex((destination) => destination.to === pathname);

  const tickRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const frame = useRef(0);

  // `cursor` is the roving tab stop; `preview` is what the card is showing.
  const [cursor, setCursor] = useState(() => (activeIndex >= 0 ? activeIndex : 0));
  const [preview, setPreview] = useState<number | null>(null);
  const [resting, setResting] = useState(true);

  // pointermove fires on every frame the cursor is over the rail. React would
  // bail out of the re-render for an unchanged value anyway, but not before
  // scheduling one, so the flag is mirrored in a ref and only written on the
  // edge.
  const restingRef = useRef(true);

  useEffect(() => {
    if (activeIndex >= 0) setCursor(activeIndex);
  }, [activeIndex]);

  const relax = useCallback(() => {
    restingRef.current = true;
    setResting(true);
    setPreview(null);
    for (const tick of tickRefs.current) tick?.style.setProperty('--mag', '0');
  }, []);

  const magnetise = useCallback((event: React.PointerEvent<HTMLUListElement>) => {
    // Coarse pointers have no hover, and a touch that lands mid-rail should not
    // leave every tick frozen at whatever size it happened to reach.
    if (event.pointerType !== 'mouse') return;

    const x = event.clientX;
    if (restingRef.current) {
      restingRef.current = false;
      setResting(false);
    }

    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const ticks = tickRefs.current.filter((tick): tick is HTMLAnchorElement => tick !== null);
      if (ticks.length < 2) return;

      const centres = ticks.map((tick) => {
        const box = tick.getBoundingClientRect();
        return box.left + box.width / 2;
      });
      const radius = Math.abs(centres[1]! - centres[0]!) * MAGNET_PITCHES;

      ticks.forEach((tick, index) => {
        const distance = Math.abs(x - centres[index]!);
        const magnitude = Math.max(0, 1 - distance / radius);
        // Squared, so the falloff is a curve rather than a cone.
        tick.style.setProperty('--mag', (magnitude * magnitude).toFixed(3));
      });
    });
  }, []);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function onKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
    const moves: Record<string, number> = {
      ArrowRight: cursor + 1,
      ArrowLeft: cursor - 1,
      Home: 0,
      End: DESTINATIONS.length - 1,
    };
    const next = moves[event.key];
    if (next === undefined) return;

    event.preventDefault();
    const clamped = Math.max(0, Math.min(DESTINATIONS.length - 1, next));
    setCursor(clamped);
    setPreview(clamped);
    tickRefs.current[clamped]?.focus();
  }

  const shown = preview ?? (activeIndex >= 0 ? activeIndex : null);
  const card = shown === null ? null : DESTINATIONS[shown]!;

  return (
    <div className="relative">
      <div className="flex items-end justify-between gap-3 px-0.5 pb-1">
        <RailEnd>{RAIL_ENDS.start}</RailEnd>
        <RailEnd align="right">{RAIL_ENDS.end}</RailEnd>
      </div>

      <nav aria-label="All sections, ordered by depth" className={resting ? 'rail-rest' : undefined}>
        {/*
          One tab stop, then arrow keys — the roving-tabindex pattern, so the
          rail does not cost a keyboard user twelve tabs to get past. That is
          not guessable from a row of ticks, hence the spoken instruction.
        */}
        <p id="rail-help" className="sr-only">
          Twelve sections ordered from introductory to technical. Use the left and right
          arrow keys to move along the rail, and Enter to open a section.
        </p>
        <ul
          aria-describedby="rail-help"
          onPointerMove={magnetise}
          onPointerLeave={relax}
          onKeyDown={onKeyDown}
          className="flex h-7 items-center gap-[7px] rounded border border-hairline bg-surface-1/60 px-2.5 lg:gap-[11px]"
        >
          {DESTINATIONS.map((destination, index) => {
            const isActive = index === activeIndex;
            const isTechnical = index >= FIRST_TECHNICAL;

            return (
              <li
                key={destination.to}
                className={index === FIRST_TECHNICAL ? 'ml-1 border-l border-hairline pl-[8px] lg:ml-1.5 lg:pl-3' : undefined}
              >
                <Link
                  to={destination.to}
                  ref={(node) => { tickRefs.current[index] = node; }}
                  tabIndex={index === cursor ? 0 : -1}
                  aria-current={isActive ? 'page' : undefined}
                  onFocus={() => { setCursor(index); setPreview(index); }}
                  onBlur={() => setPreview(null)}
                  onPointerEnter={() => setPreview(index)}
                  className={`rail-tick block h-3.5 w-[3px] rounded-full ${
                    isActive
                      ? 'bg-volt'
                      : isTechnical
                        ? 'bg-ink-muted/55 hover:bg-volt/70'
                        : 'bg-ink-muted/80 hover:bg-volt/70'
                  }`}
                >
                  <span className="sr-only">
                    {destination.label} — {destination.hint} ({destination.time})
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/*
        The card is anchored, not tethered to the tick. An earlier version slid
        it along under the pointer and had to be clamped at both ends, which made
        it jitter near the edges; holding it still lets the eye stay in one place
        while the content changes, which is what reading wants.
      */}
      <div
        aria-hidden="true"
        className={`absolute left-1/2 top-full z-40 mt-2 w-64 -translate-x-1/2 rounded-lg border border-hairline bg-surface-1 p-3 shadow-xl transition-[opacity,transform] duration-200 ${
          card && preview !== null
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-1 opacity-0'
        }`}
      >
        {card && (
          <>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[0.82rem] font-medium text-ink-primary">{card.label}</span>
              <span className="text-[0.68rem] text-ink-muted">{card.time}</span>
            </div>
            <p className="mt-0.5 text-[0.72rem] leading-snug text-ink-muted">{card.hint}</p>
            <p className="mt-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-volt/70">
              {card.track === 'practical' ? 'Practical track' : 'Developer track'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function RailEnd({ children, align = 'left' }: { children: string; align?: 'left' | 'right' }) {
  return (
    <span
      aria-hidden="true"
      className={`text-[0.58rem] uppercase tracking-[0.11em] text-ink-muted/70 ${
        align === 'right' ? 'text-right' : ''
      }`}
    >
      {children}
    </span>
  );
}
