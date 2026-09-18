import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * The trap, played out.
 *
 * Ask data.un.org for `child mortality in Bengal` and it answers with charts
 * titled "Total Child Mortality, by Age". They are United States figures. You
 * named a place; the resolver did not recognise it, declined to say so, and
 * substituted one of its own. Screenshot that into a brief and the error is
 * yours, and invisible.
 *
 * Verified against the live resolver on 18 September 2026:
 *
 *   child mortality in Bengal      → place: country/USA
 *   child mortality in Bangladesh  → place: country/BGD
 *
 * Three rules this animation is built under:
 *
 *  1. **It never moves the page.** The stage is a fixed height and holds its
 *     finished frame afterwards, so nothing below it reflows.
 *  2. **It dies on contact.** Any key, click or touch cuts to the last frame,
 *     as does the Skip control and `prefers-reduced-motion`. Scrolling does
 *     not: this sits below the fold and being scrolled to is how it is reached.
 *  3. **It invents nothing.** Query, returned title and both resolved places
 *     are what the endpoint returns, on a site whose argument is about
 *     figures that were not checked.
 */

/** Milliseconds from the moment the film is scrolled into view. */
const BEATS = {
  typeStart: 300,
  perLetter: 62,
  resolveStart: 2100,
  titleStart: 2600,
  titleEnd: 3500,
  spinStart: 3100,
  perName: 80,
  lock: 4300,
  accuse: 4900,
  settle: 5900,
} as const;

const QUERY = 'child mortality in Bengal';
const FIX = 'child mortality in Bangladesh';

/** What the resolver actually titles the charts it returns for that query. */
const RETURNED_TITLE = 'Total Child Mortality, by Age';

/** Real places, cycled while the resolver "decides". */
const SPIN_NAMES = [
  'Bangladesh', 'India', 'Nepal', 'Pakistan', 'Sri Lanka',
  'Myanmar', 'Bhutan', 'Indonesia', 'Viet Nam', 'Thailand',
] as const;

const TICK_MS = 40;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function ResolverFilm() {
  const [elapsed, setElapsed] = useState(() => (prefersReducedMotion() ? BEATS.settle : 0));
  const [started, setStarted] = useState(false);
  const settled = elapsed >= BEATS.settle;

  const stage = useRef<HTMLDivElement>(null);
  const timer = useRef(0);

  // Cutting to the end must also stop the clock. Leaving the interval running
  // would have it write the true elapsed time back on the very next tick and
  // resume the film underneath the reader who just asked it to stop.
  const cut = useCallback(() => {
    window.clearInterval(timer.current);
    setElapsed(BEATS.settle);
  }, []);

  // The film sits below the fold, so it waits to be looked at. Starting it on
  // mount would mean most readers scroll down to a finished frame and never see
  // the substitution happen, which is the only thing it is for.
  useEffect(() => {
    const element = stage.current;
    if (!element || prefersReducedMotion()) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setElapsed(BEATS.settle);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { rootMargin: '-15% 0px -15% 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return undefined;

    const from = performance.now();
    timer.current = window.setInterval(() => {
      const next = performance.now() - from;
      if (next >= BEATS.settle) {
        window.clearInterval(timer.current);
        setElapsed(BEATS.settle);
      } else {
        setElapsed(next);
      }
    }, TICK_MS);

    const options = { passive: true, once: true } as const;
    window.addEventListener('keydown', cut, options);
    window.addEventListener('pointerdown', cut, options);
    window.addEventListener('touchstart', cut, options);

    return () => {
      window.clearInterval(timer.current);
      window.removeEventListener('keydown', cut);
      window.removeEventListener('pointerdown', cut);
      window.removeEventListener('touchstart', cut);
    };
  }, [started, cut]);

  const typed = clamp(Math.floor((elapsed - BEATS.typeStart) / BEATS.perLetter), 0, QUERY.length);
  const resolving = elapsed >= BEATS.resolveStart && elapsed < BEATS.lock;
  const titleShown = clamp((elapsed - BEATS.titleStart) / (BEATS.titleEnd - BEATS.titleStart), 0, 1);
  const spinning = elapsed >= BEATS.spinStart && elapsed < BEATS.lock;
  const locked = elapsed >= BEATS.lock;
  const accused = elapsed >= BEATS.accuse;

  const spun = SPIN_NAMES[Math.floor((elapsed - BEATS.spinStart) / BEATS.perName) % SPIN_NAMES.length];
  const place = locked ? 'United States of America' : spinning ? spun : null;

  return (
    <div ref={stage} className="relative">
      {/* Hidden from assistive technology: mid-flight text changes are noise to
          a screen reader, and the same finding is stated once, below. */}
      <div
        aria-hidden="true"
        className="relative overflow-hidden rounded-xl border border-hairline bg-surface-1"
      >
        <div className="grid gap-px bg-hairline md:grid-cols-2">
          {/* ---- What you asked ---- */}
          <div className="bg-surface-1 p-6 sm:p-8">
            <Caption>You typed</Caption>
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-hairline bg-surface-0 px-4 py-3.5">
              <SearchGlyph />
              <span className="font-mono text-[0.9rem] leading-snug text-ink-primary sm:text-[1rem]">
                {QUERY.slice(0, typed)}
                {!settled && <span className="film-caret text-volt">▌</span>}
              </span>
            </div>
            <div className="relative mt-px h-px overflow-hidden">
              {resolving && <span className="film-sweep absolute inset-y-0 w-1/3 bg-volt/70" />}
            </div>
            <p className="mt-5 text-[0.85rem] leading-relaxed text-ink-muted">
              A real place, spelled the way people actually say it.
            </p>
          </div>

          {/* ---- What came back ---- */}
          <div className="bg-surface-1 p-6 sm:p-8">
            <Caption>data.un.org returned</Caption>

            <div
              className="mt-3 transition-opacity duration-500"
              style={{ opacity: titleShown > 0 ? 1 : 0 }}
            >
              {/* The span is inline-block so its box hugs the text: clip-path
                  percentages resolve against the element's own border box. */}
              <p className="overflow-hidden text-[1.05rem] font-semibold leading-snug text-ink-primary sm:text-[1.25rem]">
                <span
                  className="inline-block max-w-full"
                  style={{ clipPath: `inset(0 ${((1 - titleShown) * 100).toFixed(2)}% 0 0)` }}
                >
                  {RETURNED_TITLE}
                </span>
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <span className="text-[0.8rem] text-ink-muted">for</span>
              <span
                className={`inline-flex min-w-[11rem] items-center justify-center rounded-full border px-4 py-1.5 text-[0.85rem] font-medium transition-[border-color,background-color,transform,color] duration-300 ${
                  locked
                    ? 'scale-[1.03] border-status-critical bg-status-critical/12 text-ink-primary'
                    : 'border-hairline bg-surface-2 text-ink-secondary'
                }`}
              >
                {place ?? '—'}
              </span>
            </div>

            <div className="mt-4 min-h-[2.5rem]">
              {accused && (
                <p className="film-rise font-mono text-[0.72rem] leading-relaxed text-ink-muted">
                  → place: <span className="text-status-critical">country/USA</span>
                  <br />
                  Nothing in the question said so, and nothing on the chart says so either.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ---- The point, and the fix ---- */}
        <div className="border-t border-hairline bg-surface-0/40 p-6 sm:p-8">
          <div className="min-h-[2.75rem]">
            {accused && (
              <p className="film-rise text-balance text-[1.35rem] font-semibold leading-tight text-ink-primary sm:text-[1.7rem]">
                You said Bengal. It heard the{' '}
                <span className="text-status-critical">United States</span>.
              </p>
            )}
          </div>

          <div className="mt-4 min-h-[5.5rem]">
            {settled && (
              <div className="film-rise grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <Caption>The fix is four letters</Caption>
                  <p className="mt-2 font-mono text-[0.85rem] leading-relaxed text-ink-secondary">
                    {FIX}
                    <br />
                    → place: <span className="text-volt">country/BGD</span>{' '}
                    <span className="text-ink-muted">· Bangladesh ✓</span>
                  </p>
                </div>
                <Link
                  to="/lab"
                  tabIndex={-1}
                  className="justify-self-start rounded-lg border border-hairline px-4 py-2.5 text-[0.82rem] font-medium text-ink-secondary transition-colors hover:border-volt/60 hover:text-ink-primary sm:justify-self-end"
                >
                  See both decisions →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {started && !settled && (
        <button
          type="button"
          onClick={cut}
          className="absolute right-4 top-4 rounded border border-hairline bg-surface-0/85 px-2.5 py-1 text-[0.7rem] text-ink-muted backdrop-blur transition-colors hover:border-volt/50 hover:text-ink-secondary"
        >
          Skip
        </button>
      )}

      {/* The same finding, stated once and statically, for assistive technology. */}
      <p className="sr-only">
        Ask data.un.org for “{QUERY}” and it returns charts titled “{RETURNED_TITLE}”. They
        are United States figures: the resolver did not recognise Bengal, declined to say
        so, and substituted country/USA. Asking for “{FIX}” instead resolves correctly to
        country/BGD.{' '}
        <Link to="/lab">See the resolver’s hidden decisions in the Prompt Lab</Link>.
      </p>
    </div>
  );
}

function clamp(value: number, low: number, high: number): number {
  return value < low ? low : value > high ? high : value;
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
      {children}
    </p>
  );
}

function SearchGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0 text-ink-muted">
      <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
