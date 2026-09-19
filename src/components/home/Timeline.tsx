import { useRef, useState } from 'react';
import { MILESTONES, orderedMilestones, type Milestone } from '../../content/timeline';

/**
 * How the platform came to exist, as a scrubbable timeline.
 *
 * Two strands run through it: what the UN did, and what the technology it
 * eventually ran on did. Keeping them visually distinct is the point — the
 * story is that the two lines converge, and a single undifferentiated list of
 * dates hides exactly that.
 *
 * Interaction is a rail of years. Clicking one shows its entry; the arrow keys
 * move along it, which is how a rail like this is expected to behave and costs
 * a few lines to honour.
 *
 * It does not animate itself. An earlier version walked along the rail on its
 * own until it reached the launch, which looked like the page had been taken
 * away from the reader — motion they did not ask for, on the one element that
 * is entirely theirs to drive. It now simply opens on the launch, which is the
 * entry that matters, and then waits.
 */
export function Timeline() {
  const entries = orderedMilestones();
  const launchIndex = Math.max(0, entries.findIndex((entry) => entry.headline));

  // Opens on the launch: the entry the page is about, and a resting state
  // rather than a destination the component travels to by itself.
  const [active, setActive] = useState(launchIndex);
  const railRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);

  function select(index: number) {
    setActive(Math.min(entries.length - 1, Math.max(0, index)));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const map: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowDown: active + 1,
      ArrowLeft: active - 1,
      ArrowUp: active - 1,
      Home: 0,
      End: entries.length - 1,
    };
    const next = map[event.key];
    if (next === undefined) return;

    event.preventDefault();
    const clamped = Math.min(entries.length - 1, Math.max(0, next));
    select(clamped);
    buttonsRef.current[clamped]?.focus();
  }

  const entry = entries[active]!;
  const progress = entries.length > 1 ? (active / (entries.length - 1)) * 100 : 0;

  return (
    <div>
      {/* ---------- The rail ---------- */}
      <div
        ref={railRef}
        role="tablist"
        aria-label="History of the UN System Data Commons"
        onKeyDown={onKeyDown}
        className="relative"
      >
        {/* The connecting rule belongs to the single-row layout only. Below
            `lg` the years wrap onto three rows, where one line across the top
            would join the first row to nothing. */}
        <div className="absolute inset-x-0 top-[0.56rem] hidden h-px bg-hairline lg:block" aria-hidden="true" />
        <div
          className="absolute left-0 top-[0.56rem] hidden h-px bg-volt transition-[width] duration-500 lg:block"
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />

        <ol className="relative grid grid-cols-3 gap-y-5 sm:grid-cols-5 lg:flex lg:justify-between">
          {entries.map((item, index) => {
            const isActive = index === active;
            const isPast = index < active;

            return (
              <li key={item.sort} className="flex flex-col items-center lg:flex-1">
                <button
                  ref={(node) => { buttonsRef.current[index] = node; }}
                  type="button"
                  role="tab"
                  id={`milestone-tab-${index}`}
                  aria-selected={isActive}
                  aria-controls="milestone-panel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => select(index)}
                  className="group flex flex-col items-center gap-2"
                >
                  <span
                    aria-hidden="true"
                    className={`grid size-[1.1rem] place-items-center rounded-full border transition-colors ${
                      isActive
                        ? item.headline
                          ? 'border-volt bg-volt'
                          : item.strand === 'tech'
                            ? 'border-accent-violet bg-accent-violet'
                            : 'border-accent-blue bg-accent-blue'
                        : isPast
                          ? 'border-volt/50 bg-volt/25'
                          : 'border-hairline bg-surface-0 group-hover:border-ink-muted'
                    }`}
                  >
                    {item.headline && !isActive && (
                      <span className="size-1.5 rounded-full bg-volt" />
                    )}
                  </span>
                  <span
                    className={`tnum text-center text-[0.68rem] leading-tight transition-colors ${
                      isActive ? 'font-semibold text-ink-primary' : 'text-ink-muted group-hover:text-ink-secondary'
                    }`}
                  >
                    {item.when}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* ---------- The entry ---------- */}
      <div
        id="milestone-panel"
        role="tabpanel"
        aria-labelledby={`milestone-tab-${active}`}
        // Keyed so the fade re-runs on every change rather than only the first.
        key={entry.sort}
        data-reveal="shown"
        className="mt-8 rounded-lg border border-hairline bg-surface-1 p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {/* The two threads carry a colour each, so which one you are reading
              is legible without the layout having to grow to say it. */}
          <span
            className={`rounded-full px-2.5 py-0.5 text-[0.66rem] font-semibold uppercase tracking-wide ${
              entry.strand === 'tech'
                ? 'bg-accent-violet/15 text-accent-violet-ink'
                : 'bg-accent-blue/15 text-accent-blue-ink'
            }`}
          >
            {entry.strand === 'tech' ? 'The technology' : 'The United Nations'}
          </span>
          <span className="tnum text-[0.8rem] text-ink-muted">{entry.when}</span>
          {entry.headline && (
            <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-volt">
              ← the one this site is about
            </span>
          )}
        </div>

        <h3 className="mt-3 text-balance text-[1.35rem] font-semibold leading-tight tracking-tight text-ink-primary sm:text-[1.6rem]">
          {entry.title}
        </h3>

        <p className="mt-3 max-w-3xl text-[0.93rem] leading-relaxed text-ink-secondary">
          {entry.body}
        </p>

        {entry.note && (
          <p className="mt-3 max-w-3xl border-l-2 border-volt/50 pl-3 text-[0.86rem] leading-relaxed text-ink-secondary">
            {entry.note}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-hairline pt-3.5 text-[0.75rem]">
          <p className="text-ink-muted">{entry.actors}</p>
          <a
            href={entry.source.href}
            target="_blank"
            rel="noreferrer noopener"
            className="text-ink-secondary underline decoration-hairline underline-offset-2 hover:text-volt hover:decoration-volt"
          >
            Source: {entry.source.label} ↗
          </a>
        </div>
      </div>

      {/* ---------- Step controls ---------- */}
      <div className="mt-3 flex items-center justify-between gap-4">
        <Step label="← Earlier" disabled={active === 0} onClick={() => select(active - 1)} />
        <p className="tnum text-[0.72rem] text-ink-muted">
          {active + 1} of {entries.length}
          <span className="ml-2 hidden sm:inline">· arrow keys work</span>
        </p>
        <Step
          label="Later →"
          disabled={active === entries.length - 1}
          onClick={() => select(active + 1)}
        />
      </div>
    </div>
  );
}

function Step({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded border border-hairline px-3 py-1.5 text-[0.76rem] font-medium text-ink-secondary transition-colors enabled:hover:border-volt/60 enabled:hover:text-ink-primary disabled:opacity-35"
    >
      {label}
    </button>
  );
}

/** How many entries the timeline holds, for prose that must not go stale. */
export const MILESTONE_COUNT = MILESTONES.length;

export type { Milestone };
