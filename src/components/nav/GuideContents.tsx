import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DESTINATIONS, searchDestinations, type Destination } from '../../content/navigation';
import { searchUrl } from '../../lib/undc/config';

/**
 * The navigation: a table of contents, called one.
 *
 * Four versions of this file. Two dropdowns, which said what existed but not
 * where you were. A rail of three-pixel ticks, which was elegant and invisible.
 * Then the same thing full-screen and legible, but labelled "Index" — which on
 * a statistics site is the worst available word, because an index here is the
 * Human Development Index or a price index, not a list of pages.
 *
 * So it is "Contents" now, which is what it is. Twelve numbered chapters
 * grouped by track, the one you are on marked, and a field that filters them —
 * or, failing that, hands your words to data.un.org, which has about 85,000
 * indicators to this guide's twelve pages.
 *
 * Every row is a real link. An earlier version used buttons and a keyboard
 * cursor, which broke middle-click, ⌘-click and "copy link address" for no gain
 * that a link plus arrow keys does not already provide.
 */
export function GuideContents({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pathname } = useLocation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreTo = useRef<Element | null>(null);

  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);

  const trimmed = query.trim();
  const filtered = useMemo(() => (trimmed ? searchDestinations(trimmed) : null), [trimmed]);

  /**
   * Keyboard order, which must match what is on screen exactly. An earlier
   * version kept the front page in this list while the grouped view did not
   * render it, so opening the dialog and pressing Enter navigated somewhere the
   * reader had never been shown.
   */
  const rows = useMemo<readonly (Destination | 'platform')[]>(
    () => (filtered ? [...filtered, 'platform' as const] : DESTINATIONS),
    [filtered],
  );

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    if (!open) return undefined;

    restoreTo.current = document.activeElement;
    setQuery('');
    setCursor(0);
    // The dialog mounts and focuses in the same frame; without the deferral
    // Safari occasionally leaves focus on the trigger button.
    const focus = window.setTimeout(() => inputRef.current?.focus(), 0);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.clearTimeout(focus);
      document.body.style.overflow = previousOverflow;
      if (restoreTo.current instanceof HTMLElement) restoreTo.current.focus();
    };
  }, [open]);

  if (!open) return null;

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    // `aria-modal` hides the page behind this from assistive technology, but it
    // does nothing for a sighted keyboard user, whose Tab would otherwise walk
    // off into a document they cannot see. Cycle it instead.
    if (event.key === 'Tab') {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setCursor((current) => (current + step + rows.length) % Math.max(rows.length, 1));
      return;
    }

    if (event.key === 'Enter') {
      const row = rows[cursor];
      if (!row) return;
      event.preventDefault();
      if (row === 'platform') {
        window.open(searchUrl(trimmed), '_blank', 'noopener,noreferrer');
      } else {
        // Click the row's own link so navigation goes through one path only.
        dialogRef.current?.querySelector<HTMLElement>(`[data-row="${row.to}"]`)?.click();
      }
    }
  }

  const practical = DESTINATIONS.filter((destination) => destination.track === 'practical');
  const technical = DESTINATIONS.filter((destination) => destination.track === 'technical');

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Guide contents"
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-50 overflow-y-auto bg-surface-0/97 backdrop-blur-xl"
    >
      <div className="mx-auto min-h-full max-w-6xl px-4 pb-16 pt-5">
        <div className="flex items-center justify-between gap-4 border-b border-hairline pb-4">
          <span className="wordmark text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Guide contents
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg border border-hairline px-3.5 py-2 text-[0.78rem] font-medium text-ink-secondary transition-colors hover:border-volt/60 hover:text-ink-primary"
          >
            Close
            <kbd className="text-[0.66rem] text-ink-muted">esc</kbd>
          </button>
        </div>

        <div className="flex items-center gap-4 border-b border-hairline">
          <SearchGlyph />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Jump to a chapter, or search all ~85,000 indicators"
            aria-label="Jump to a chapter, or search data.un.org"
            className="w-full bg-transparent py-6 text-[1.15rem] text-ink-primary outline-none placeholder:text-ink-muted/60 sm:text-[1.6rem]"
          />
        </div>

        {filtered ? (
          <ul className="mt-8">
            {filtered.map((destination, index) => (
              <Row
                key={destination.to}
                destination={destination}
                number={DESTINATIONS.indexOf(destination) + 1}
                cursored={index === cursor}
                current={destination.to === pathname}
                onNavigate={onClose}
                onHover={() => setCursor(index)}
              />
            ))}
            <li>
              <a
                href={searchUrl(trimmed)}
                target="_blank"
                rel="noreferrer noopener"
                onClick={onClose}
                onPointerMove={() => setCursor(filtered.length)}
                className={`flex items-baseline justify-between gap-4 border-b border-hairline py-5 ${
                  cursor === filtered.length ? 'bg-surface-1' : ''
                }`}
              >
                <span className="text-[1.05rem] font-medium text-ink-primary sm:text-[1.3rem]">
                  Search data.un.org for “{trimmed}”
                </span>
                <span className="shrink-0 text-[0.74rem] text-volt">↗ the whole platform</span>
              </a>
            </li>
          </ul>
        ) : (
          <div className="mt-10 grid gap-x-12 gap-y-10 lg:grid-cols-2">
            <Group
              heading="Practical"
              note="No technical background assumed"
              items={practical}
              rows={rows}
              cursor={cursor}
              pathname={pathname}
              onNavigate={onClose}
              setCursor={setCursor}
            />
            <Group
              heading="Developer"
              note="The resolver, the REST API and MCP"
              items={technical}
              rows={rows}
              cursor={cursor}
              pathname={pathname}
              onNavigate={onClose}
              setCursor={setCursor}
            />
          </div>
        )}

        <p className="mt-12 border-t border-hairline pt-4 text-[0.7rem] text-ink-muted">
          <kbd className="text-ink-secondary">↑</kbd>{' '}
          <kbd className="text-ink-secondary">↓</kbd> to move ·{' '}
          <kbd className="text-ink-secondary">↵</kbd> to open ·{' '}
          <kbd className="text-ink-secondary">esc</kbd> to close
        </p>
      </div>
    </div>
  );
}

function Group({
  heading,
  note,
  items,
  rows,
  cursor,
  pathname,
  onNavigate,
  setCursor,
}: {
  heading: string;
  note: string;
  items: readonly Destination[];
  rows: readonly (Destination | 'platform')[];
  cursor: number;
  pathname: string;
  onNavigate: () => void;
  setCursor: (index: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 border-b border-hairline pb-2">
        <h2 className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-volt">
          {heading}
        </h2>
        <span className="text-[0.7rem] text-ink-muted">{note}</span>
      </div>
      <ul>
        {items.map((destination) => {
          const index = rows.indexOf(destination);
          return (
            <Row
              key={destination.to}
              destination={destination}
              number={DESTINATIONS.indexOf(destination) + 1}
              cursored={index === cursor}
              current={destination.to === pathname}
              onNavigate={onNavigate}
              onHover={() => setCursor(index)}
            />
          );
        })}
      </ul>
    </div>
  );
}

/** One chapter, set at reading size rather than menu size. */
function Row({
  destination,
  number,
  cursored,
  current,
  onNavigate,
  onHover,
}: {
  destination: Destination;
  number: number;
  /** Where the arrow keys are. Presentational only. */
  cursored: boolean;
  /** The page actually being displayed. This is what `aria-current` is for. */
  current: boolean;
  onNavigate: () => void;
  onHover: () => void;
}) {
  return (
    <li>
      <Link
        to={destination.to}
        data-row={destination.to}
        aria-current={current ? 'page' : undefined}
        onClick={onNavigate}
        onPointerMove={onHover}
        className="relative block border-b border-hairline py-3.5"
      >
        <span className="flex items-baseline gap-3.5 sm:gap-5">
          <span
            aria-hidden="true"
            className={`tnum w-6 shrink-0 text-[0.72rem] transition-colors ${
              cursored || current ? 'text-volt' : 'text-ink-muted/60'
            }`}
          >
            {String(number).padStart(2, '0')}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className={`flex flex-wrap items-baseline gap-x-3 text-balance text-[1.15rem] font-medium leading-tight transition-colors sm:text-[1.45rem] ${
                cursored ? 'text-volt' : 'text-ink-primary'
              }`}
            >
              {destination.label}
              {current && (
                <span className="rounded-full border border-volt/50 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-volt">
                  You are here
                </span>
              )}
            </span>
            <span className="mt-0.5 block text-[0.78rem] leading-snug text-ink-muted">
              {destination.hint}
            </span>
          </span>
          <span className="shrink-0 text-[0.7rem] text-ink-muted">{destination.time}</span>
        </span>

        <span
          aria-hidden="true"
          className={`absolute inset-x-0 bottom-0 h-px origin-left bg-volt transition-transform duration-500 ease-out ${
            cursored ? 'scale-x-100' : 'scale-x-0'
          }`}
        />
      </Link>
    </li>
  );
}

function SearchGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-5 shrink-0 text-ink-muted">
      <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
