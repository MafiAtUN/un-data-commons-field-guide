import { useState, type ReactNode } from 'react';

export interface TutorialStep {
  /** What the reader does. One action. */
  do: string;
  /** What they should see if it worked. */
  see?: string;
  /** Optional aside: why this step matters, or what to do if it looks wrong. */
  note?: ReactNode;
  /** A link the step asks them to open. */
  link?: { href: string; label: string };
}

export interface TutorialSpec {
  id: string;
  title: string;
  /** Who this is for, in their own words. */
  forWhom: string;
  minutes: number;
  /** What they will have at the end. */
  outcome: string;
  steps: TutorialStep[];
  /** The one thing to remember afterwards. */
  lesson: ReactNode;
}

/**
 * A collapsible walkthrough.
 *
 * Every step states both the action and the expected result, because the most
 * common way a tutorial fails a non-technical reader is that they cannot tell
 * whether step 3 worked before they attempt step 4.
 */
export function Tutorial({ spec, defaultOpen = false }: { spec: TutorialSpec; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <article className="overflow-hidden rounded-lg border border-hairline bg-surface-1">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 p-5 text-left transition-colors hover:bg-surface-2/40"
      >
        <div>
          <h3 className="text-[1rem] font-semibold text-ink-primary">{spec.title}</h3>
          <p className="mt-1.5 text-[0.82rem] leading-relaxed text-ink-secondary">
            <span className="text-ink-muted">For: </span>
            {spec.forWhom}
          </p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.75rem] text-ink-muted">
            <span className="tnum">About {spec.minutes} minutes</span>
            <span>{spec.steps.length} steps</span>
            <span>You end up with: {spec.outcome}</span>
          </p>
        </div>
        <span aria-hidden="true" className="shrink-0 pt-1 text-[0.8rem] text-volt">
          {open ? '−' : '+'}
        </span>
      </button>

      {open && (
        <div className="border-t border-hairline p-5">
          <ol className="space-y-4">
            {spec.steps.map((step, index) => (
              <li key={step.do} className="flex gap-4">
                <span className="tnum grid size-6 shrink-0 place-items-center rounded-full border border-volt/40 bg-volt/10 text-[0.72rem] font-semibold text-volt">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.88rem] leading-relaxed text-ink-primary">{step.do}</p>

                  {step.link && (
                    <a
                      href={step.link.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-1.5 inline-block break-all font-mono text-[0.76rem] text-volt underline decoration-volt/30 underline-offset-2 hover:decoration-volt"
                    >
                      {step.link.label} ↗
                    </a>
                  )}

                  {step.see && (
                    <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-secondary">
                      <span className="font-semibold text-status-good">You should see: </span>
                      {step.see}
                    </p>
                  )}

                  {step.note && (
                    <p className="mt-1.5 text-[0.78rem] leading-relaxed text-ink-muted">{step.note}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-5 rounded border-l-2 border-volt bg-surface-0 p-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-volt">
              The thing to remember
            </p>
            <div className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-secondary">{spec.lesson}</div>
          </div>
        </div>
      )}
    </article>
  );
}
