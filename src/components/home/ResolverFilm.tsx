import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { COUNTRIES } from '../../content/countries';

/**
 * A six-second film of the site's founding finding.
 *
 * Ask the platform's resolver the single word `violence` and it answers with
 * charts titled "Number of Victims of Intentional Homicide". They look global.
 * They are United States figures — the resolver needed a place, found none in
 * the question, and supplied one. Screenshot that into a brief and the error is
 * yours, and invisible.
 *
 * Three rules this animation is built under, because a front page that delays a
 * reporting officer is a worse front page:
 *
 *  1. **It never moves the page.** The stage is a fixed height and holds its
 *     finished frame afterwards, so nothing below it reflows. The Data Finder
 *     underneath is live and interactive from the first millisecond.
 *  2. **It dies on contact.** Any key, click, scroll or touch cuts straight to
 *     the last frame, as does the Skip control and `prefers-reduced-motion`.
 *  3. **It invents nothing.** The query, the returned chart title and the
 *     resolved place are what the endpoint actually returns; the spinning names
 *     are real entries from the country list. There is not a fabricated figure
 *     in it, on a site whose whole argument is about fabricated figures.
 */

/** Milliseconds from mount. Each value is the moment that beat lands. */
const BEATS = {
  typeStart: 420,
  perLetter: 95,
  resolveStart: 1360,
  titleStart: 1900,
  titleEnd: 2760,
  spinStart: 2520,
  perName: 80,
  lock: 3760,
  accuse: 4360,
  settle: 5320,
} as const;

const QUERY = 'violence';

/** What the resolver actually titles the charts it returns for that query. */
const RETURNED_TITLE = 'Number of Victims of Intentional Homicide';

/**
 * Real countries, cycled while the resolver "decides". Codes are taken from the
 * baked country list, so the names on screen are the platform's own.
 */
const SPIN_CODES = [
  'country/BGD', 'country/BRA', 'country/ETH', 'country/IND',
  'country/KEN', 'country/NGA', 'country/PAK', 'country/PHL',
  'country/ZAF', 'country/COL', 'country/IDN', 'country/MEX',
] as const;

const SPIN_NAMES = SPIN_CODES.map((code) => COUNTRIES[code] ?? code);

const TICK_MS = 40;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function ResolverFilm() {
  // Elapsed milliseconds drive every beat, so the film has one clock rather
  // than eight timeouts that can drift apart when a tab is backgrounded.
  const [elapsed, setElapsed] = useState(() => (prefersReducedMotion() ? BEATS.settle : 0));
  const settled = elapsed >= BEATS.settle;

  // Cutting to the end must also stop the clock. Leaving the interval running
  // would have it write the true elapsed time back on the very next tick and
  // resume the film underneath the reader who just asked it to stop.
  const timer = useRef(0);
  const cut = useCallback(() => {
    window.clearInterval(timer.current);
    setElapsed(BEATS.settle);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const started = performance.now();
    timer.current = window.setInterval(() => {
      const next = performance.now() - started;
      if (next >= BEATS.settle) {
        window.clearInterval(timer.current);
        setElapsed(BEATS.settle);
      } else {
        setElapsed(next);
      }
    }, TICK_MS);

    /** Any deliberate input means the reader has better things to do. */
    const options = { passive: true, once: true } as const;
    window.addEventListener('keydown', cut, options);
    window.addEventListener('pointerdown', cut, options);
    window.addEventListener('wheel', cut, options);
    window.addEventListener('touchstart', cut, options);

    return () => {
      window.clearInterval(timer.current);
      window.removeEventListener('keydown', cut);
      window.removeEventListener('pointerdown', cut);
      window.removeEventListener('wheel', cut);
      window.removeEventListener('touchstart', cut);
    };
  }, [cut]);

  const typed = clamp(Math.floor((elapsed - BEATS.typeStart) / BEATS.perLetter), 0, QUERY.length);
  const resolving = elapsed >= BEATS.resolveStart && elapsed < BEATS.lock;
  const titleShown = clamp((elapsed - BEATS.titleStart) / (BEATS.titleEnd - BEATS.titleStart), 0, 1);
  const spinning = elapsed >= BEATS.spinStart && elapsed < BEATS.lock;
  const locked = elapsed >= BEATS.lock;
  const accused = elapsed >= BEATS.accuse;

  const spinName = SPIN_NAMES[Math.floor((elapsed - BEATS.spinStart) / BEATS.perName) % SPIN_NAMES.length];
  const place = locked ? 'United States' : spinning ? spinName : null;

  return (
    <div className="relative">
      {/*
        The stage is hidden from assistive technology and its one link is taken
        out of the tab order: mid-flight text changes are noise to a screen
        reader, and the same finding is stated once, statically, below.
      */}
      <div
        aria-hidden="true"
        className="relative h-[17.5rem] overflow-hidden rounded-lg border border-hairline bg-surface-1 sm:h-[18.5rem]"
      >
        <GridField dimmed={settled} />

        <div className="relative flex h-full flex-col justify-center gap-3.5 p-4 sm:p-5">
          {/* The search box, typed into by nobody. */}
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              data.un.org · search
            </p>
            <div className="mt-1.5 flex items-center gap-2.5 rounded border border-hairline bg-surface-0 px-3 py-2.5">
              <SearchGlyph />
              <span className="font-mono text-[0.95rem] text-ink-primary">
                {QUERY.slice(0, typed)}
                {!settled && <span className="film-caret text-volt">▌</span>}
              </span>
            </div>
            <div className="relative mt-px h-px overflow-hidden">
              {resolving && <span className="film-sweep absolute inset-y-0 w-1/3 bg-volt/70" />}
            </div>
          </div>

          {/* What comes back. */}
          <div
            className="rounded border border-hairline bg-surface-0/80 p-3.5 transition-opacity duration-500"
            style={{ opacity: titleShown > 0 ? 1 : 0 }}
          >
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Chart returned
            </p>

            {/*
              A wipe rather than a second typewriter — the search box above is
              already typing, and the same trick twice in six seconds is a tic.
              The span is inline-block so its box hugs the text: `clip-path`
              percentages resolve against the element's own border box, and
              clipping the paragraph instead would finish the wipe a quarter of
              the way before the last word arrived.
            */}
            <p className="mt-1 overflow-hidden text-[0.82rem] font-semibold text-ink-primary sm:text-[0.95rem]">
              <span
                className="inline-block max-w-full whitespace-nowrap"
                style={{ clipPath: `inset(0 ${((1 - titleShown) * 100).toFixed(2)}% 0 0)` }}
              >
                {RETURNED_TITLE}
              </span>
            </p>

            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[0.78rem]">
              <span className="text-ink-muted">for</span>
              <span
                className={`tnum inline-flex min-w-[8.5rem] items-center justify-center rounded-full border px-3 py-1 font-medium transition-[border-color,background-color,transform] duration-300 ${
                  locked
                    ? 'scale-[1.04] border-volt bg-volt/15 text-ink-primary'
                    : 'border-hairline bg-surface-2 text-ink-secondary'
                }`}
              >
                {place ?? '—'}
              </span>
              {locked && (
                <span className="film-rise text-[0.72rem] text-ink-muted">
                  ← the resolver chose this
                </span>
              )}
            </div>
          </div>

          {/* The point. */}
          <div className="min-h-[3.25rem]">
            {accused && (
              <div className="film-rise">
                <p className="text-[1.05rem] font-semibold leading-snug text-volt sm:text-[1.15rem]">
                  You never said United States.
                </p>
                <p className="mt-1 font-mono text-[0.7rem] leading-relaxed text-ink-muted">
                  → place: country/USA &nbsp;·&nbsp; nothing in the query said so.{' '}
                  <Link
                    to="/lab"
                    tabIndex={-1}
                    className="text-ink-secondary underline decoration-hairline underline-offset-2 hover:decoration-volt"
                  >
                    See it yourself
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {!settled && (
        <button
          type="button"
          onClick={cut}
          className="absolute right-3 top-3 rounded border border-hairline bg-surface-0/80 px-2 py-1 text-[0.68rem] text-ink-muted backdrop-blur transition-colors hover:border-volt/50 hover:text-ink-secondary"
        >
          Skip
        </button>
      )}

      {/* The same finding, stated once and statically, for assistive technology. */}
      <p className="sr-only">
        Ask the UN Data Commons resolver the single word “violence” and it returns charts
        titled “{RETURNED_TITLE}”. They look like global figures. They are United States
        figures: the resolver needed a place, found none in the question, and supplied
        country/USA on your behalf.{' '}
        <Link to="/lab">See the resolver’s hidden decisions in the Prompt Lab</Link>.
      </p>
    </div>
  );
}

function clamp(value: number, low: number, high: number): number {
  return value < low ? low : value > high ? high : value;
}

/** Plotting-grid atmosphere. Deliberately not a chart: it plots nothing. */
function GridField({ dimmed }: { dimmed: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full transition-opacity duration-1000"
      style={{ opacity: dimmed ? 0.35 : 0.85 }}
    >
      <defs>
        <pattern id="film-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0H0V28" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
        <radialGradient id="film-fade" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="film-mask">
          <rect width="100%" height="100%" fill="url(#film-fade)" />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="url(#film-grid)"
        mask="url(#film-mask)"
        className="text-hairline"
      />
    </svg>
  );
}

function SearchGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 shrink-0 text-ink-muted">
      <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
