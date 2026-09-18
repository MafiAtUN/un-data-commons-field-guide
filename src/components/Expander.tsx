import { useId, useState, type ReactNode } from 'react';

interface ExpanderProps {
  /** The question a reader would actually ask, in their words. */
  question: string;
  /** How long the answer takes to read, e.g. "30 seconds". */
  time?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

/**
 * Progressive disclosure.
 *
 * The site's earlier failure was making people read before they could act. The
 * explanations were good and almost nobody would reach them. Putting the "why"
 * behind a question they have already asked themselves means the page stays
 * short for the person in a hurry and complete for the person who is not.
 */
export function Expander({ question, time, children, defaultOpen = false }: ExpanderProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-surface-1">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-surface-2/50"
      >
        <span className="text-[0.88rem] font-medium text-ink-primary">{question}</span>
        <span className="flex shrink-0 items-center gap-2.5">
          {time && <span className="text-[0.7rem] text-ink-muted">{time}</span>}
          <span aria-hidden="true" className="text-[0.9rem] text-volt">
            {open ? '−' : '+'}
          </span>
        </span>
      </button>
      {open && (
        <div id={id} className="border-t border-hairline px-4 py-4 text-[0.85rem] leading-relaxed text-ink-secondary">
          {children}
        </div>
      )}
    </div>
  );
}
