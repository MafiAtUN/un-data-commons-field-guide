import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DESTINATIONS, HOME, searchDestinations, type Destination } from '../../content/navigation';
import { searchUrl } from '../../lib/undc/config';

/**
 * The navigation, at a size you cannot miss.
 *
 * Three versions of this file now. The first put thirteen links in front of a
 * reader who did not know which was theirs. The second hid twelve behind
 * dropdowns. The third laid them on a rail of three-pixel ticks, which was
 * elegant, information-dense, and — the verdict that matters — invisible. A
 * primary navigation has no business being subtle.
 *
 * So the whole thing is one full-screen index set in display type: numbered,
 * grouped by track, every entry carrying what it is for and how long it takes.
 * It opens from a button that is impossible to overlook and from ⌘K, and typing
 * filters it. The last row always offers the query to data.un.org itself,
 * because this guide has twelve pages and the platform has about 85,000
 * indicators — the answer is very often "not here, out there".
 */
export function IndexOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreTo = useRef<Element | null>(null);

  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);

  const trimmed = query.trim();
  const filtered = useMemo(() => (trimmed ? searchDestinations(trimmed) : null), [trimmed]);

  /** Flat keyboard order: whatever is on screen, top to bottom. */
  const rows = useMemo<readonly (Destination | 'platform')[]>(
    () => (filtered ? [...filtered, 'platform' as const] : [HOME, ...DESTINATIONS]),
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

  function go(row: Destination | 'platform' | undefined) {
    if (!row) return;
    if (row === 'platform') {
      window.open(searchUrl(trimmed), '_blank', 'noopener,noreferrer');
    } else {
      navigate(row.to);
    }
    onClose();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setCursor((current) => (current + step + rows.length) % Math.max(rows.length, 1));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      go(rows[cursor]);
    }
  }

  const practical = DESTINATIONS.filter((destination) => destination.track === 'practical');
  const technical = DESTINATIONS.filter((destination) => destination.track === 'technical');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Index"
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-50 overflow-y-auto bg-surface-0/97 backdrop-blur-xl"
    >
      <div className="mx-auto min-h-full max-w-6xl px-4 pb-16 pt-5">
        <div className="flex items-center justify-between gap-4 border-b border-hairline pb-4">
          <span className="wordmark text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            Index
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

        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter, or search the whole platform…"
          aria-label="Filter the index, or search data.un.org"
          className="w-full border-b border-hairline bg-transparent py-6 text-[1.4rem] text-ink-primary outline-none placeholder:text-ink-muted/60 focus-visible:border-volt sm:text-[1.9rem]"
        />

        {filtered ? (
          <ul className="mt-8">
            {filtered.map((destination, index) => (
              <IndexRow
                key={destination.to}
                destination={destination}
                number={index + 1}
                selected={index === cursor}
                onSelect={() => go(destination)}
                onHover={() => setCursor(index)}
              />
            ))}
            <li>
              <button
                type="button"
                onClick={() => go('platform')}
                onPointerMove={() => setCursor(filtered.length)}
                className={`flex w-full items-baseline justify-between gap-4 border-b border-hairline py-5 text-left ${
                  cursor === filtered.length ? 'bg-surface-1' : ''
                }`}
              >
                <span className="text-[1.05rem] font-medium text-ink-primary sm:text-[1.3rem]">
                  Search data.un.org for “{trimmed}”
                </span>
                <span className="shrink-0 text-[0.74rem] text-volt">↗ all ~85,000</span>
              </button>
            </li>
          </ul>
        ) : (
          <div className="mt-10 grid gap-x-12 gap-y-10 lg:grid-cols-2">
            <IndexGroup
              heading="Practical"
              note="No technical background assumed"
              items={practical}
              cursor={cursor}
              rows={rows}
              onSelect={go}
              setCursor={setCursor}
            />
            <IndexGroup
              heading="Developer"
              note="The resolver, the REST API and MCP"
              items={technical}
              cursor={cursor}
              rows={rows}
              onSelect={go}
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

function IndexGroup({
  heading,
  note,
  items,
  cursor,
  rows,
  onSelect,
  setCursor,
}: {
  heading: string;
  note: string;
  items: readonly Destination[];
  cursor: number;
  rows: readonly (Destination | 'platform')[];
  onSelect: (row: Destination) => void;
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
          // The number is the destination's place in the whole index, not in
          // its column: the two columns are one list, read down then across.
          const index = rows.indexOf(destination);
          return (
            <IndexRow
              key={destination.to}
              destination={destination}
              number={index}
              selected={index === cursor}
              onSelect={() => onSelect(destination)}
              onHover={() => setCursor(index)}
            />
          );
        })}
      </ul>
    </div>
  );
}

/** One line of the index, set at reading-poster size rather than menu size. */
function IndexRow({
  destination,
  number,
  selected,
  onSelect,
  onHover,
}: {
  destination: Destination;
  number: number;
  selected: boolean;
  onSelect: () => void;
  onHover: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        onPointerMove={onHover}
        aria-current={selected || undefined}
        className="relative block w-full border-b border-hairline py-3.5 text-left"
      >
        <span className="flex items-baseline gap-3.5 sm:gap-5">
          <span
            aria-hidden="true"
            className={`tnum w-6 shrink-0 text-[0.72rem] transition-colors ${
              selected ? 'text-volt' : 'text-ink-muted/60'
            }`}
          >
            {String(number).padStart(2, '0')}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className={`block text-balance text-[1.15rem] font-medium leading-tight transition-colors sm:text-[1.45rem] ${
                selected ? 'text-volt' : 'text-ink-primary'
              }`}
            >
              {destination.label}
            </span>
            <span className="mt-0.5 block text-[0.78rem] leading-snug text-ink-muted">
              {destination.hint}
            </span>
          </span>
          <span className="shrink-0 text-[0.7rem] text-ink-muted">{destination.time}</span>
        </span>

        {/* A rule that draws itself across the row, rather than a hover tint. */}
        <span
          aria-hidden="true"
          className={`absolute inset-x-0 bottom-0 h-px origin-left bg-volt transition-transform duration-500 ease-out ${
            selected ? 'scale-x-100' : 'scale-x-0'
          }`}
        />
      </button>
    </li>
  );
}
