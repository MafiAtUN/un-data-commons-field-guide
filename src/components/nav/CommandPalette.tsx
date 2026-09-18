import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchDestinations } from '../../content/navigation';
import { searchUrl } from '../../lib/undc/config';

/**
 * Everywhere on the site, one keystroke away.
 *
 * The rail is for the reader who does not yet know the shape of the site. This
 * is for the one who does, and for anyone who would rather type than aim.
 *
 * It ends on a deliberate escape hatch: whatever you typed, the last row offers
 * to run it against data.un.org itself. This site curates twenty indicators and
 * the platform holds about eighty-five thousand, so a palette that answered
 * "no matches" and stopped would be lying about where the data is.
 */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreTo = useRef<Element | null>(null);

  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);

  const matches = useMemo(() => searchDestinations(query), [query]);
  const trimmed = query.trim();

  /** The rows, with the platform-search escape hatch last when it applies. */
  const rows = useMemo(
    () => [
      ...matches.map((destination) => ({ kind: 'page' as const, destination })),
      ...(trimmed ? [{ kind: 'platform' as const, destination: undefined }] : []),
    ],
    [matches, trimmed],
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

  function run(index: number) {
    const row = rows[index];
    if (!row) return;

    if (row.kind === 'platform') {
      window.open(searchUrl(trimmed), '_blank', 'noopener,noreferrer');
    } else {
      navigate(row.destination.to);
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
      // Wrapping, because a list this short is faster to cycle than to reverse.
      setCursor((current) => (current + step + rows.length) % Math.max(rows.length, 1));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      run(cursor);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]"
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-surface-0/75 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Go to a section"
        className="film-rise relative w-full max-w-xl overflow-hidden rounded-xl border border-hairline bg-surface-1 shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-hairline px-4">
          <span aria-hidden="true" className="text-[0.9rem] text-volt">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Go to a section, or search the platform…"
            aria-label="Go to a section, or search the platform"
            aria-controls="palette-results"
            className="w-full bg-transparent py-3.5 text-[0.92rem] text-ink-primary outline-none placeholder:text-ink-muted"
          />
          <kbd className="hidden shrink-0 rounded border border-hairline px-1.5 py-0.5 text-[0.62rem] text-ink-muted sm:block">
            esc
          </kbd>
        </div>

        <ul id="palette-results" className="max-h-[52vh] overflow-y-auto py-1.5">
          {rows.map((row, index) => {
            const selected = index === cursor;

            return (
              <li key={row.kind === 'platform' ? 'platform' : row.destination.to}>
                <button
                  type="button"
                  onClick={() => run(index)}
                  onPointerMove={() => setCursor(index)}
                  aria-current={selected || undefined}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left ${
                    selected ? 'bg-surface-2' : ''
                  }`}
                >
                  {row.kind === 'platform' ? (
                    <>
                      <span className="min-w-0">
                        <span className="block truncate text-[0.85rem] font-medium text-ink-primary">
                          Search data.un.org for “{trimmed}”
                        </span>
                        <span className="block text-[0.72rem] text-ink-muted">
                          All ~85,000 indicators. Opens in a new tab — name a country in the query.
                        </span>
                      </span>
                      <span aria-hidden="true" className="shrink-0 text-[0.72rem] text-volt">↗</span>
                    </>
                  ) : (
                    <>
                      <span className="min-w-0">
                        <span className="block truncate text-[0.85rem] font-medium text-ink-primary">
                          {row.destination.label}
                        </span>
                        <span className="block truncate text-[0.72rem] text-ink-muted">
                          {row.destination.hint}
                        </span>
                      </span>
                      <span className="shrink-0 text-[0.68rem] text-ink-muted">
                        {row.destination.time}
                      </span>
                    </>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <p className="border-t border-hairline px-4 py-2 text-[0.66rem] text-ink-muted">
          <kbd className="text-ink-secondary">↑</kbd>{' '}
          <kbd className="text-ink-secondary">↓</kbd> to move ·{' '}
          <kbd className="text-ink-secondary">↵</kbd> to open
        </p>
      </div>
    </div>
  );
}
